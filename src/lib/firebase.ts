
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDGx28BG_3f7aL01s4S9gZQh-dkqFHu-Rk",
  authDomain: "custodioscrm.firebaseapp.com",
  projectId: "custodioscrm",
  storageBucket: "custodioscrm.appspot.com",
  messagingSenderId: "211634379724",
  appId: "1:211634379724:web:fda7c65ab7cb4fbc4cd7ca"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
