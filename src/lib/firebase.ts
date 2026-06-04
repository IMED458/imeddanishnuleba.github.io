import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCJuCFco8g_Z68OPU2A4qX6XKXcJkIK3ZE',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'anishnuleba.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'anishnuleba',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'anishnuleba.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '677283944679',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:677283944679:web:2b487382774c59a468ea42',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-8FP0NL080H',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

if (typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) {
        getAnalytics(firebaseApp);
      }
    })
    .catch(() => {
      // Analytics is optional and should never block the clinical app.
    });
}
