import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from 'firebase/auth';

// DesiCart Firebase Project Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDddyeOQBBr5fEP0YCSpwrV5lzmuAl5aHA",
  authDomain: "desicart-a15cd.firebaseapp.com",
  databaseURL: "https://desicart-a15cd-default-rtdb.firebaseio.com",
  projectId: "desicart-a15cd",
  storageBucket: "desicart-a15cd.firebasestorage.app",
  messagingSenderId: "827426078926",
  appId: "1:827426078926:web:dd851c4d739a166701d09f",
  measurementId: "G-S425LJWRX3"
};

// Initialize Firebase (guard against double-init in HMR)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth instance
const auth = getAuth(app);
auth.languageCode = 'en';

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const isFirebaseEnabled = true;

export {
  app,
  auth,
  googleProvider,
  isFirebaseEnabled,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut
};
