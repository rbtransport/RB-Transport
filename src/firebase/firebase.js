import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCi9Dhc_FUVvRXWCRxA-d0U2DVd0zNWXxM",
  authDomain: "rb-transport.firebaseapp.com",
  projectId: "rb-transport",
  storageBucket: "rb-transport.firebasestorage.app",
  messagingSenderId: "708740899875",
  appId: "1:708740899875:web:a35528ebfc8b22d0c73d96",
  measurementId: "G-44SQDDMLQM"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;