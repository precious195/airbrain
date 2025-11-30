// src/lib/firebase/client.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDveIk1NX_SzAq0VbMpb72cG0mrqaJn2mw",
    authDomain: "airbrain-d787e.firebaseapp.com",
    databaseURL: "https://airbrain-d787e-default-rtdb.firebaseio.com",
    projectId: "airbrain-d787e",
    storageBucket: "airbrain-d787e.firebasestorage.app",
    messagingSenderId: "701075259002",
    appId: "1:701075259002:web:21b4a44ab8935b0d3745c3"
};

// Initialize Firebase (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);
export const storage = getStorage(app);

export default app;
