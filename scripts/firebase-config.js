// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeq9Cpi8Jr4hGQOh2YOPQR-GYvlhRr8nQ",
  authDomain: "acep-11d20.firebaseapp.com",
  projectId: "acep-11d20",
  storageBucket: "acep-11d20.firebasestorage.app",
  messagingSenderId: "648606466091",
  appId: "1:648606466091:web:5fa808c5b474239d512a6e"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize services
const auth = firebase.auth();
const db = firebase.firestore();

console.log('✅ Firebase initialized successfully!');
