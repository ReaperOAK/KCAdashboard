// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAeZAqhDh6IY9ABEsCHr-8KlicCnnvRp1w",
  authDomain: "kolkatachessacademy.in",
  projectId: "kolkatachessacademy-303cc",
  storageBucket: "kolkatachessacademy-303cc.firebasestorage.app",
  messagingSenderId: "592470233142",
  appId: "1:592470233142:web:b77e9a95b620d8a9450897",
  measurementId: "G-8M9X5L2HTD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    // Handle user information here
    console.log('User Info:', user);
  } catch (error) {
    console.error('Error signing in with Google:', error);
  }
};

const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log('User signed out');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export { auth, signInWithGoogle, signOutUser };