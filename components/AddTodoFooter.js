import React from 'react';
import { View, TextInput, Button, Image } from 'react-native';
import { colors, spacing } from '../theme';

const AddTodoFooter = ({ text, setText, onAdd, onPickImage, image, onRemoveImage, editingId, onCancelEdit }) => {
  return (
    <View style={{ padding: spacing.m, backgroundColor: 'white', borderTopWidth: 1, borderColor: '#ccc' }}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder={editingId ? "Edit your todo..." : "Add a new todo..."}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 6,
          padding: spacing.s,
          marginBottom: spacing.s,
          backgroundColor: '#f9f9f9'
        }}
      />

      {image && (
        <View style={{ alignItems: 'center', marginBottom: spacing.s }}>
          <Image
            source={{ uri: image }}
            style={{ width: 150, height: 150, borderRadius: 8, marginBottom: spacing.s }}
            resizeMode="cover"
          />
          <Button title="Remove Image" color="red" onPress={onRemoveImage} />
        </View>
      )}

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Button title="Pick Image" onPress={onPickImage} />
        {editingId ? (
          <>
            <Button title="Save Changes" onPress={onAdd} />
            <Button title="Cancel Edit" color="red" onPress={onCancelEdit} />
          </>
        ) : (
          <Button title="Add Todo" onPress={onAdd} />
        )}
      </View>
    </View>
  );
};

export default AddTodoFooter;
