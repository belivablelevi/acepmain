/**
 * ACEP — Firebase initialization (compat API for static hosting)
 */
(function () {
  const firebaseConfig = {
    apiKey: 'AIzaSyDeq9Cpi8Jr4hGQOh2YOPQR-GYvlhRr8nQ',
    authDomain: 'acep-11d20.firebaseapp.com',
    projectId: 'acep-11d20',
    storageBucket: 'acep-11d20.firebasestorage.app',
    messagingSenderId: '648606466091',
    appId: '1:648606466091:web:5fa808c5b474239d512a6e',
  };

  if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Check script order on the page.');
    return;
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  window.acep = {
    app: firebase.app(),
    auth: firebase.auth(),
    db: firebase.firestore(),
    storage: firebase.storage(),
    FieldValue: firebase.firestore.FieldValue,
    Timestamp: firebase.firestore.Timestamp,
  };
})();
