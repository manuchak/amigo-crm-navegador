
import { initializeApp, getApps } from 'firebase/app';
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

// Initialize Firebase only if it hasn't been initialized yet
let app;
if (!getApps().length) {
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    throw new Error("Firebase initialization failed");
  }
} else {
  app = getApps()[0];
}

// Get Auth and Firestore instances
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
