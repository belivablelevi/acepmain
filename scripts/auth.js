// Authentication Functions
const authFunctions = {
  async signUp(email, password, username) {
    try {
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Create user document in Firestore
      await db.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: email,
        username: username,
        points: 0,
        badge: '🌱',
        missionsCompleted: 0,
        challengesCompleted: [],
        joinedDate: firebase.firestore.FieldValue.serverTimestamp()
      });
      
      showNotification(`Welcome ${username}! Account created successfully!`, 'success');
      return user;
    } catch (error) {
      showNotification(error.message, 'error');
      throw error;
    }
  },

  async signIn(email, password) {
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      showNotification('Signed in successfully!', 'success');
      return userCredential.user;
    } catch (error) {
      showNotification(error.message, 'error');
      throw error;
    }
  },

  async signOut() {
    try {
      await auth.signOut();
      showNotification('Signed out successfully!', 'success');
      window.location.href = 'index.html';
    } catch (error) {
      showNotification(error.message, 'error');
      throw error;
    }
  }
};

// Notification system
function showNotification(message, type = 'info') {
  // Remove existing notifications
  const existing = document.querySelector('.notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    max-width: 400px;
  `;
  
  if (type === 'success') {
    notification.style.background = '#d1fae5';
    notification.style.color = '#065f46';
    notification.style.border = '2px solid #059669';
  } else if (type === 'error') {
    notification.style.background = '#fee2e2';
    notification.style.color = '#991b1b';
    notification.style.border = '2px solid #ef4444';
  } else {
    notification.style.background = '#dbeafe';
    notification.style.color = '#1e40af';
    notification.style.border = '2px solid #3b82f6';
  }
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-out';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

console.log('✅ Auth functions loaded');
