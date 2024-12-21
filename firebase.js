import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAMnkZ7Hh_troT83I7WsfNcVMQWW4jKheg",
  authDomain: "waukeshalodgersvp.firebaseapp.com",
  projectId: "waukeshalodgersvp",
  storageBucket: "waukeshalodgersvp.firebasestorage.app",
  messagingSenderId: "592545222807",
  appId: "1:592545222807:web:0730f1f2779bcb574f19d2",
  measurementId: "G-5EM9WN8KKL",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// const analytics = getAnalytics(app);
export default db;
