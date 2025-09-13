import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAo99meqTPtst-pPKSRb7RJFTG4C6lExCc",
  authDomain: "tata-dashboard-2b5e4.firebaseapp.com",
  projectId: "tata-dashboard-2b5e4",
  storageBucket: "tata-dashboard-2b5e4.appspot.com",
  messagingSenderId: "987371775693",
  appId: "1:987371775693:web:d780083a9e05e0681bab84"
};
// Initialise Firebase
const app = initializeApp(firebaseConfig);

// Exporte auth et firestore pour les utiliser dans l'app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
