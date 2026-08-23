import { Camera } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { PermissionStatus } from './state/appEntry';

/** Normalizes each Expo module's own permission-response shape to our 4-state model. */
function normalize(response: { status: string; granted: boolean }): PermissionStatus {
  if (response.granted) return response.status === 'limited' ? 'limited' : 'granted';
  if (response.status === 'denied') return 'denied';
  return 'not_determined';
}

export async function getCameraPermission(): Promise<PermissionStatus> {
  const res = await Camera.getCameraPermissionsAsync();
  return normalize(res);
}
export async function requestCameraPermission(): Promise<PermissionStatus> {
  const res = await Camera.requestCameraPermissionsAsync();
  return normalize(res);
}

export async function getPhotosPermission(): Promise<PermissionStatus> {
  const res = await ImagePicker.getMediaLibraryPermissionsAsync();
  return normalize(res);
}
export async function requestPhotosPermission(): Promise<PermissionStatus> {
  const res = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return normalize(res);
}

export async function getNotificationsPermission(): Promise<PermissionStatus> {
  const res = await Notifications.getPermissionsAsync();
  return normalize(res);
}
export async function requestNotificationsPermission(): Promise<PermissionStatus> {
  const res = await Notifications.requestPermissionsAsync();
  return normalize(res);
}
