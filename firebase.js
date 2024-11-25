// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
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
