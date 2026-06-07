import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const webPrefix = 'secure:';

export const secureStorage = {
  get: (key: string) =>
    Platform.OS === 'web'
      ? AsyncStorage.getItem(`${webPrefix}${key}`)
      : SecureStore.getItemAsync(key),
  set: (key: string, value: string) =>
    Platform.OS === 'web'
      ? AsyncStorage.setItem(`${webPrefix}${key}`, value)
      : SecureStore.setItemAsync(key, value),
  remove: (key: string) =>
    Platform.OS === 'web'
      ? AsyncStorage.removeItem(`${webPrefix}${key}`)
      : SecureStore.deleteItemAsync(key),
};
