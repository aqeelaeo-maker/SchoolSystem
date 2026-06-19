import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9oUeUqGDzUy_TC_AmU7y71bgtgo2iI7E",
  authDomain: "schooldatabase-2f197.firebaseapp.com",
  databaseURL: "https://schooldatabase-2f197-default-rtdb.firebaseio.com",
  projectId: "schooldatabase-2f197",
  storageBucket: "schooldatabase-2f197.firebasestorage.app",
  messagingSenderId: "260611106305",
  appId: "1:260611106305:web:48da0edc511eb6d59d4200",
  measurementId: "G-481ZFNBLPM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const auth = getAuth(app);
export const db = getFirestore(app); // Cloud Firestore
export const rtdb = getDatabase(app); // Realtime Database
export const storage = getStorage(app); // Cloud Storage

export default app;
