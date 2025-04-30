// components/Header.js
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, fontSizes, spacing } from '../theme';
import { signOut } from 'firebase/auth';
import { auth }      from '../firebase';

export default function Header({ title }) {
  return (
    <View style={{
      flexDirection: 'row',
      justifyContent:  'space-between',
      alignItems:     'center',
      padding:        spacing.m,
      backgroundColor: colors.primary
    }}>
      <Text style={{
        color:      '#fff',
        fontSize:   fontSizes.h2,
        fontWeight: '600',
      }}>
        {title}
      </Text>
      <TouchableOpacity onPress={() => signOut(auth)}>
        <Text style={{
          color:    '#fff',
          fontSize: fontSizes.body
        }}>
          Sign Out
        </Text>
      </TouchableOpacity>
    </View>
  );
}
