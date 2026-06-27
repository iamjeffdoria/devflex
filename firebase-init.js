import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBp1olaM5a2zzoEc1Z9kpDAOD7_tOtlTC4",
  authDomain: "devflex-f0c18.firebaseapp.com",
  projectId: "devflex-f0c18",
  storageBucket: "devflex-f0c18.firebasestorage.app",
  messagingSenderId: "1030709999696",
  appId: "1:1030709999696:web:211c00026c28302faa3955"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);