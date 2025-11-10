// firebase-config.js - ACTUAL CONFIGURATION
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js';
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut,
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-auth.js';
import { 
    getFirestore,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore.js';

// 🔥 YAHAN APNA ACTUAL CONFIGURATION DALEN 🔥
const firebaseConfig = {
  apiKey: "AIzaSyBCyRrvdQJBpPjZG3aGaTZfMXXoISzNsTg",
  authDomain: "edumind-ai-assistant-6e071.firebaseapp.com",
  projectId: "edumind-ai-assistant-6e071",
  storageBucket: "edumind-ai-assistant-6e071.firebasestorage.app",
  messagingSenderId: "307173146203",
  appId: "1:307173146203:web:1456f23755bc5d2a11497e",
  measurementId: "G-T16NPJFS4P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

// Google Auth Provider
const googleProvider = new GoogleAuthProvider();

export { 
    auth, 
    googleProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged,
    db,
    collection,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    serverTimestamp
};