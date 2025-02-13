// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth"; // Importa getAuth

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyANLqDVVvArSUoGNO66H9o0IbtkG84IXcE",
  authDomain: "mangari-2ec9d.firebaseapp.com",
  projectId: "mangari-2ec9d",
  storageBucket: "mangari-2ec9d.appspot.com",
  messagingSenderId: "160418382510",
  appId: "1:160418382510:web:cc28c593a1f135a78be33f",
  measurementId: "G-QJEJNPZLL4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app); // Inicializa la autenticación

export { auth }; // Exporta auth para usarlo en otros componentes