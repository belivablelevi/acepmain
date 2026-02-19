// Authentication Functions

// Sign Up
async function signUp(email, password, username) {
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
      level: 1,
      challengesCompleted: [],
      joinedDate: firebase.firestore.FieldValue.serverTimestamp()
    });
    
    showNotification('Account created successfully!', 'success');
    return user;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// Sign In
async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    showNotification('Welcome back!', 'success');
    return userCredential.user;
  } catch (error) {
    showNotification(error.message, 'error');
    throw error;
  }
}

// Sign Out
async function signOut() {
  try {
    await auth.signOut();
    showNotification('Signed out successfully', 'success');
    window.location.href = 'index.html';
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Password Reset
async function resetPassword(email) {
  try {
    await auth.sendPasswordResetEmail(email);
    showNotification('Password reset email sent!', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Notification Helper
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(400px); opacity: 0; }
  }
`;
document.head.appendChild(style);

// Export functions
window.authFunctions = {
  signUp,
  signIn,
  signOut,
  resetPassword,
  showNotification
};
