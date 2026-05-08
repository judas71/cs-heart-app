import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

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
export { doc, getDoc, setDoc };