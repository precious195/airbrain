// src/lib/firebase/admin.ts
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';

let adminApp: App;

// Initialize Firebase Admin SDK
if (!getApps().length) {
    adminApp = initializeApp({
        credential: cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        databaseURL: "https://airbrain-d787e-default-rtdb.firebaseio.com",
    });
} else {
    adminApp = getApps()[0];
}

export const adminAuth = getAuth(adminApp);
export const adminDb = getDatabase(adminApp);

export default adminApp;
