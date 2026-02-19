// Firebase Configuration
// INSTRUCTIONS: Replace these values with your own from Firebase Console
// Go to: Firebase Console > Project Settings > Your Apps > Web App

const firebaseConfig = {
  apiKey: "AIzaSyDeq9Cpi8Jr4hGQOh2YOPQR-GYvlhRr8nQ",
  authDomain: "acep-11d20.firebaseapp.com",
  projectId: "acep-11d20",
  storageBucket: "acep-11d20.firebasestorage.app",
  messagingSenderId: "648606466091",
  appId: "1:648606466091:web:5fa808c5b474239d512a6e"
};

// Initialize Firebase
let app, auth, db, storage;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Auth state observer
auth.onAuthStateChanged((user) => {
  if (user) {
    console.log('✅ User logged in:', user.email);
    updateUIForLoggedInUser(user);
  } else {
    console.log('ℹ️ No user logged in');
    updateUIForLoggedOutUser();
  }
});

// Update UI based on auth state
function updateUIForLoggedInUser(user) {
  const navLinks = document.querySelectorAll('.nav-links');
  navLinks.forEach(nav => {
    const dashboardLink = nav.querySelector('a[href="dashboard.html"]');
    if (dashboardLink) {
      dashboardLink.style.display = 'inline-flex';
    }
  });
  
  // Store user info in localStorage for quick access
  localStorage.setItem('currentUser', JSON.stringify({
    uid: user.uid,
    email: user.email
  }));
}

function updateUIForLoggedOutUser() {
  localStorage.removeItem('currentUser');
  
  // Redirect to index if on protected page
  const protectedPages = ['dashboard.html', 'submit-challenge.html'];
  const currentPage = window.location.pathname.split('/').pop();
  
  if (protectedPages.includes(currentPage)) {
    window.location.href = 'index.html';
  }
}

// Helper Functions
async function getCurrentUserData() {
  const user = auth.currentUser;
  if (!user) return null;
  
  const userDoc = await db.collection('users').doc(user.uid).get();
  return userDoc.exists ? userDoc.data() : null;
}

async function updateUserPoints(userId, pointsToAdd) {
  const userRef = db.collection('users').doc(userId);
  
  await userRef.update({
    points: firebase.firestore.FieldValue.increment(pointsToAdd),
    lastActivity: firebase.firestore.FieldValue.serverTimestamp()
  });
}

async function updateUserBadge(userId) {
  const userData = await db.collection('users').doc(userId).get();
  const points = userData.data().points || 0;
  
  let badge = '🌱';
  if (points >= 5000) badge = '🏆';
  else if (points >= 3000) badge = '🦸';
  else if (points >= 2000) badge = '🏅';
  else if (points >= 1000) badge = '⭐';
  else if (points >= 500) badge = '🌳';
  else if (points >= 200) badge = '🌿';
  
  await db.collection('users').doc(userId).update({ badge });
}

// Export for use in other files
window.firebaseApp = {
  app,
  auth,
  db,
  storage,
  getCurrentUserData,
  updateUserPoints,
  updateUserBadge
};
