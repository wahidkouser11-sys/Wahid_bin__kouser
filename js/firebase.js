/* =========================================================
   firebase.js — Firebase Initialization
   ========================================================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyCbVGGR4pm9FaumxTWN3oOEUY9HtSLUb1U",
  authDomain: "wahid-portfolio-b6df6.firebaseapp.com",
  projectId: "wahid-portfolio-b6df6",
  storageBucket: "wahid-portfolio-b6df6.firebasestorage.app",
  messagingSenderId: "362089607999",
  appId: "1:362089607999:web:ffdc559c20c43f53f7198a",
  measurementId: "G-KG7HGB59SK"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };