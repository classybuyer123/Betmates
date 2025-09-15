// Firebase configuration and initialization

import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);
export const functions = getFunctions(app);

// Connect to emulators in development (optional)
if (__DEV__) {
  try {
    // Only connect to emulators if not already connected and if running locally
    const authUrl = Constants.expoConfig?.extra?.firebaseAuthEmulatorUrl || 'http://localhost:9099';
    const firestoreHost = Constants.expoConfig?.extra?.firestoreEmulatorHost || 'localhost';
    const firestorePort = Constants.expoConfig?.extra?.firestoreEmulatorPort || 8080;
    const functionsHost = Constants.expoConfig?.extra?.functionsEmulatorHost || 'localhost';
    const functionsPort = Constants.expoConfig?.extra?.functionsEmulatorPort || 5001;
    
    // Check if we can connect to emulators
    if (authUrl.includes('localhost') || authUrl.includes('127.0.0.1')) {
      connectAuthEmulator(auth, authUrl);
      connectFirestoreEmulator(db, firestoreHost, firestorePort);
      connectFunctionsEmulator(functions, functionsHost, functionsPort);
      console.log('Connected to Firebase emulators');
    }
  } catch (error) {
    // Emulators might not be running or already connected
    console.log('Firebase emulators not available, using production:', error);
  }
}

export default app;
