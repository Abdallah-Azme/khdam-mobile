import type { NativeUpload } from '@/features/auth/types';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

export async function pickImage(): Promise<NativeUpload | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    name: asset.fileName ?? fileNameFromUri(asset.uri, 'image.jpg'),
    type: asset.mimeType ?? 'image/jpeg',
  };
}

export async function pickDocument(): Promise<NativeUpload | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['image/*', 'application/pdf'],
    copyToCacheDirectory: true,
  });
  if (result.canceled) return null;
  const asset = result.assets[0];
  if (!asset) return null;
  return {
    uri: asset.uri,
    name: asset.name,
    type: asset.mimeType ?? 'application/octet-stream',
  };
}

function fileNameFromUri(uri: string, fallback: string) {
  const clean = uri.split('?')[0] ?? '';
  return clean.split('/').pop() || fallback;
}
