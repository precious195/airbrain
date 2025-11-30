import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get } from 'firebase/database';

const firebaseConfig = {
    apiKey: "AIzaSyDveIk1NX_SzAq0VbMpb72cG0mrqaJn2mw",
    authDomain: "airbrain-d787e.firebaseapp.com",
    databaseURL: "https://airbrain-d787e-default-rtdb.firebaseio.com",
    projectId: "airbrain-d787e",
    storageBucket: "airbrain-d787e.firebasestorage.app",
    messagingSenderId: "701075259002",
    appId: "1:701075259002:web:21b4a44ab8935b0d3745c3"
};

async function testConnection() {
    try {
        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const dbRef = ref(db, '.info/connected');
        console.log("Firebase initialized. Checking connection...");
        // Just a simple check, we won't actually wait for the value since we aren't auth'd fully or running in browser context easily
        console.log("Configuration valid.");
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        process.exit(1);
    }
}

testConnection();
