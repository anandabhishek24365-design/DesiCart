import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  set,
  onValue,
  off,
  update
} from 'firebase/database';

// DesiCart Firebase Project Configuration (Database & Realtime Services)
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

// Firestore database instance
const db = getFirestore(app);

// Realtime Database instance
const rtdb = getDatabase(app);

const isFirebaseEnabled = false;

export {
  app,
  db,
  rtdb,
  isFirebaseEnabled,
  // Firestore helpers
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  // Realtime Database helpers
  ref,
  set as rtdbSet,
  onValue as rtdbOnValue,
  off as rtdbOff,
  update as rtdbUpdate
};
