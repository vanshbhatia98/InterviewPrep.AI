import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-4fe17.firebaseapp.com",
  projectId: "interviewiq-4fe17",
  storageBucket: "interviewiq-4fe17.firebasestorage.app",
  messagingSenderId: "449633073362",
  appId: "1:449633073362:web:54ee7185cdf178771a550b"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app)

const provider = new GoogleAuthProvider()

export {auth , provider}