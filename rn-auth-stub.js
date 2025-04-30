// rn-auth-stub.js
// This stub will stand in for `firebase/auth/react-native`
import { getAuth } from 'firebase/auth';

export function initializeAuth(app, options) {
  console.warn('[stub] initializeAuth → falling back to getAuth');
  return getAuth(app);
}

export function getReactNativePersistence(storage) {
  console.warn('[stub] getReactNativePersistence → no-op');
  return null;
}
