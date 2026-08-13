import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzlzk6AnpEhlL2Ff7pgX_A4RVBomYilyU",
  authDomain: "qwick-ads.firebaseapp.com",
  projectId: "qwick-ads",
  storageBucket: "qwick-ads.firebasestorage.app",
  messagingSenderId: "80639314705",
  appId: "1:80639314705:web:e0b048a770d7e2869d5ab0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

export default app;
