import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "cs-heart.firebaseapp.com",
  projectId: "cs-heart",
  storageBucket: "cs-heart.firebasestorage.app",
  messagingSenderId: "400727957414",
  appId: "1:400727957414:web:2be1eb03da0926965fb967"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);