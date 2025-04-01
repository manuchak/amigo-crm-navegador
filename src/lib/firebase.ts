
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiCKh7Lr_S2vDL41aZ0Qj4XWbZXQ0Rkww",
  authDomain: "custodioscrm.firebaseapp.com",
  projectId: "custodioscrm",
  storageBucket: "custodioscrm.appspot.com",
  messagingSenderId: "211634379724",
  appId: "1:211634379724:web:fda7c65ab7cb4fbc4cd7ca"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
