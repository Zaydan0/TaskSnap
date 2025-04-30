// App.js
import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Keyboard,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  addDoc,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';

import Header from './components/Header';
import AddTodoFooter from './components/AddTodoFooter';
import { colors, spacing } from './theme';

export default function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [todos, setTodos] = useState([]);
  const [newText, setNewText] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      if (u) {
        const q = query(collection(db, 'todos'), where('uid', '==', u.uid));
        const unsubSnap = onSnapshot(q, snap => {
          const fetchedTodos = snap.docs.map(d => ({ id: d.id, ...d.data() }));
          const sortedTodos = fetchedTodos.sort((a, b) => b.createdAt - a.createdAt);
          setTodos(sortedTodos);
        });
        return () => unsubSnap();
      } else {
        setTodos([]);
      }
    });
    return () => unsub();
  }, []);

  const handleSignUp = () =>
    createUserWithEmailAndPassword(auth, email, password)
      .catch(e => Alert.alert('Sign Up Error', e.message));

  const handleSignIn = () =>
    signInWithEmailAndPassword(auth, email, password)
      .catch(e => Alert.alert('Sign In Error', e.message));

  const pickImage = async () => {
    Keyboard.dismiss();
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Enable photo access in settings.');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.6,
      });
      if (!result.canceled && result.assets?.length) {
        setNewImage(result.assets[0].uri);
      }
    } catch (e) {
      Alert.alert('Picker Error', e.message || 'Unknown error');
    }
  };

  const compressImage = async (uri) => {
    const compressed = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 800 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return compressed.uri;
  };

  const uploadImageAsync = async uri => {
    try {
      if (!storage) throw new Error('Firebase storage instance is undefined');
      const compressedUri = await compressImage(uri);
      const response = await fetch(compressedUri);
      const blob = await response.blob();
      const imageRef = ref(storage, `todos/${user.uid}/${Date.now()}`);
      await uploadBytes(imageRef, blob);
      return getDownloadURL(imageRef);
    } catch (e) {
      console.error('Upload error:', e);
      throw e;
    }
  };

  const addTodo = async () => {
    if (newText.trim() === '') {
      Alert.alert('Validation Error', 'Todo text cannot be empty.');
      return;
    }
    setUploading(true);
    let imageUrl = null;
    if (newImage) {
      try {
        imageUrl = await uploadImageAsync(newImage);
      } catch (e) {
        Alert.alert('Upload Error', e.message || 'Storage upload failed');
      }
    }

    try {
      if (editingId) {
        await updateDoc(doc(db, 'todos', editingId), {
          text: newText.trim(),
          ...(imageUrl ? { imageUrl } : {})
        });
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'todos'), {
          text: newText.trim(),
          done: false,
          uid: user.uid,
          createdAt: Date.now(),
          ...(imageUrl ? { imageUrl } : {})
        });
      }
    } catch (e) {
      Alert.alert('Database Error', e.message);
    }
    setUploading(false);
    setNewText('');
    setNewImage(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setNewText('');
    setNewImage(null);
  };

  const toggleDone = (id, done) => updateDoc(doc(db, 'todos', id), { done: !done });

  const deleteTodo = id => deleteDoc(doc(db, 'todos', id));

  const startEdit = (id, text) => {
    setEditingId(id);
    setNewText(text);
  };

  const openImage = (uri) => {
    setSelectedImage(uri);
    setModalVisible(true);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const timeAgo = (timestamp) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (!user) {
    return (
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.m }}>
            <Text>Email:</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: spacing.m, padding: spacing.s, borderRadius: 4 }}
            />
            <Text>Password:</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={{ borderWidth: 1, borderColor: '#ccc', marginBottom: spacing.m, padding: spacing.s, borderRadius: 4 }}
            />
            <Button title="Sign Up" onPress={handleSignUp} />
            <View style={{ height: spacing.m }} />
            <Button title="Sign In" onPress={handleSignIn} />
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <SafeAreaView style={{ flex: 1 }}>
        <Header title="My Todos" />
        {uploading && <ActivityIndicator size="large" color={colors.primary} style={{ margin: spacing.m }} />}
        <FlatList
          data={todos}
          keyExtractor={i => i.id}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ padding: spacing.m }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: 'white', borderRadius: 8, padding: spacing.m, marginBottom: spacing.m, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 }}>
              <TouchableOpacity onPress={() => toggleDone(item.id, item.done)}>
                <Text style={{ textDecorationLine: item.done ? 'line-through' : 'none', fontSize: 18 }}>{item.text}</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{timeAgo(item.createdAt)}</Text>
              {item.imageUrl && (
                <TouchableOpacity onPress={() => openImage(item.imageUrl)} style={{ alignItems: 'center', marginVertical: spacing.s }}>
                  <Image source={{ uri: item.imageUrl }} style={{ width: 200, height: 200, borderRadius: 8 }} resizeMode="cover" />
                </TouchableOpacity>
              )}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.s }}>
                <Button title="Edit" onPress={() => startEdit(item.id, item.text)} />
                <Button title="Delete" color="red" onPress={() => deleteTodo(item.id)} />
              </View>
            </View>
          )}
        />
        <AddTodoFooter
          text={newText}
          setText={setNewText}
          onAdd={addTodo}
          onPickImage={pickImage}
          image={newImage}
          onRemoveImage={() => setNewImage(null)}
          editingId={editingId}
          onCancelEdit={cancelEdit}
        />

        <Modal visible={modalVisible} transparent={true} animationType="fade">
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' }} onPress={() => setModalVisible(false)}>
            {selectedImage && (
              <Image source={{ uri: selectedImage }} style={{ width: '90%', height: '70%', borderRadius: 8 }} resizeMode="contain" />
            )}
          </Pressable>
        </Modal>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
