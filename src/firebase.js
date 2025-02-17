// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; // Importa Firestore

const firebaseConfig = {
  apiKey: "AIzaSyANLqDVVvArSUoGNO66H9o0IbtkG84IXcE",
  authDomain: "mangari-2ec9d.firebaseapp.com",
  projectId: "mangari-2ec9d",
  storageBucket: "mangari-2ec9d.appspot.com",
  messagingSenderId: "160418382510",
  appId: "1:160418382510:web:cc28c593a1f135a78be33f",
  measurementId: "G-QJEJNPZLL4"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // Inicializa Firestore

export { auth, db }; // Exporta auth y db