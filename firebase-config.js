/* ============================================
   FinanceFlow — Firebase Configuration
   ============================================ */

const firebaseConfig = {
  apiKey: "AIzaSyCfuIMFHqk--zVlj8Cf4m7E57FE5Dgbf3c",
  authDomain: "financeflow-b747e.firebaseapp.com",
  projectId: "financeflow-b747e",
  storageBucket: "financeflow-b747e.firebasestorage.app",
  messagingSenderId: "701013882588",
  appId: "1:701013882588:web:a5f78f9b793c5770b0e619",
  measurementId: "G-1E2RW32SLR"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Global references
const auth = firebase.auth();
const db = firebase.firestore();

// Google Auth Provider
const googleProvider = new firebase.auth.GoogleAuthProvider();

// GitHub Auth Provider
const githubProvider = new firebase.auth.GithubAuthProvider();

console.log('🔥 Firebase initialized for FinanceFlow');
