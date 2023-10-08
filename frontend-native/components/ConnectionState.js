import React from 'react';
import { Text } from 'react-native';

export function ConnectionState({ isConnected }) {
  return <Text>State: { '' + isConnected }</Text>;
}