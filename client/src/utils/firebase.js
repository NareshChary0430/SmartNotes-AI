
import { initializeApp } from "firebase/app";

import { getAuth,GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "examnotes-eddd8.firebaseapp.com",
  projectId: "examnotes-eddd8",
  storageBucket: "examnotes-eddd8.firebasestorage.app",
  messagingSenderId: "579226596867",
  appId: "1:579226596867:web:1e40931231a9284d47c036"
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };