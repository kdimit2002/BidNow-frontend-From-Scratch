// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// 👉 Βάλε εδώ το δικό σου config από το Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDCx7Aza5uuSOkJgPWZmKYK3GCoslqMlqg",
  authDomain: "local-f4b46.firebaseapp.com",
  projectId: "local-f4b46",
  storageBucket: "local-f4b46.firebasestorage.app",
  messagingSenderId: "665766735849",
  appId: "1:665766735849:web:ae04e46fe480429a736578",
  measurementId: "G-1X53K36RMP"
};

const app = initializeApp(firebaseConfig);

// Εδώ παίρνουμε το Auth instance που θα χρησιμοποιούμε παντού
export const auth = getAuth(app);