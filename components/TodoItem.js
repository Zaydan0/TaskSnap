import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fontSizes, spacing } from '../theme';

export default function TodoItem({ item, onToggle, onDelete }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <View style={styles.card}>
        {item.imageUrl && (
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.thumbnail}
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={() => onToggle(item.id, item.done)}>
          <Icon
            name={item.done ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={item.done ? colors.accent : colors.text}
          />
        </TouchableOpacity>

        <Text style={[styles.text, item.done && styles.doneText]}>
          {item.text}
        </Text>

        <TouchableOpacity onPress={() => onDelete(item.id)}>
          <Icon name="trash-can-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {item.imageUrl && (
        <Modal
          visible={modalVisible}
          transparent
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalBackground}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.fullImage}
              />
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: spacing.m,
    marginVertical: spacing.s,
    marginHorizontal: spacing.m,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 6,
    marginRight: spacing.m,
  },
  text: {
    flex: 1,
    marginLeft: spacing.m,
    fontSize: fontSizes.body,
    color: colors.text,
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '90%',
    height: '90%',
    resizeMode: 'contain',
  },
});
