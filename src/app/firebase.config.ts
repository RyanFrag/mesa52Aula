import { initializeApp } from "firebase/app";
import {getAuth } from "firebase/auth"
import {getFirestore} from "firebase/firestore"
export const firebaseConfig = {
  apiKey: "AIzaSyDnjs5JYFoeMhVjHA7uabBUBHaltrvAZXA",
  authDomain: "ryan-pdmii.firebaseapp.com",
  projectId: "ryan-pdmii",
  storageBucket: "ryan-pdmii.firebasestorage.app",
  messagingSenderId: "398572991393",
  appId: "1:398572991393:web:3c535e6dc87d5f4051d1e0"
};
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);