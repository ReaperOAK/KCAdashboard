// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC32CVCYnOmpxq-SMpLrTHEDxn6lzTiNk",
  authDomain: "kolkatachessacademy-a6578.firebaseapp.com",
  projectId: "kolkatachessacademy-a6578",
  storageBucket: "kolkatachessacademy-a6578.appspot.com",
  messagingSenderId: "1007867533415",
  appId: "1:1007867533415:web:88dff66dd6b695b0e71cc2",
  measurementId: "G-SYR99JRV93"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth services
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Additional services
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export { 
    auth, 
    googleProvider,
    db,  // For storing user data, assignments, and attendance
    storage,  // For PGN files and study materials
    analytics,  // For platform analytics
    messaging  // For real-time notifications
};