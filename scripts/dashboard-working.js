// Dashboard - Show user's stats and submissions with real-time updates
let userData = null;
let userSubmissions = [];

async function loadDashboard() {
  const user = auth.currentUser;
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  try {
    // Load user data with real-time listener
    const userRef = db.collection('users').doc(user.uid);
    
    // Set up real-time listener for user data
    userRef.onSnapshot((doc) => {
      if (doc.exists) {
        userData = doc.data();
        updateUserStats();
      }
    });
    
    // Load user's submissions with real-time listener
    db.collection('submissions')
      .where('userId', '==', user.uid)
      .orderBy('submittedDate', 'desc')
      .onSnapshot((snapshot) => {
        userSubmissions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        renderSubmissions();
      });
    
  } catch (error) {
    console.error('Error loading dashboard:', error);
    // If error, try to create user document
    await createUserIfNotExists(user);
  }
}

async function createUserIfNotExists(user) {
  const userRef = db.collection('users').doc(user.uid);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    await userRef.set({
      uid: user.uid,
      email: user.email,
      username: user.email.split('@')[0],
      points: 0,
      badge: '🌱',
      level: 1,
      challengesCompleted: [],
      joinedDate: firebase.firestore.FieldValue.serverTimestamp()
    });
    // Reload dashboard
    loadDashboard();
  }
}

function updateUserStats() {
  if (!userData) return;
  
  // Update user info
  document.getElementById('userName').textContent = userData.username || 'User';
  document.getElementById('userBadge').textContent = userData.badge || '🌱';
  document.getElementById('userPoints').textContent = userData.points || 0;
  document.getElementById('userChallenges').textContent = userData.challengesCompleted?.length || 0;
  
  // Calculate level based on points
  const points = userData.points || 0;
  let level = 1;
  if (points >= 5000) level = 7;
  else if (points >= 3000) level = 6;
  else if (points >= 2000) level = 5;
  else if (points >= 1000) level = 4;
  else if (points >= 500) level = 3;
  else if (points >= 200) level = 2;
  
  const levelElement = document.getElementById('userLevel');
  if (levelElement) {
    levelElement.textContent = level;
  }
}

function renderSubmissions() {
  const container = document.getElementById('submissionsContainer');
  
  if (userSubmissions.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; background: white; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
        <p style="color: #6b7280; margin-bottom: 1rem; font-size: 1.125rem;">You haven't completed any missions yet!</p>
        <p style="color: #9ca3af; margin-bottom: 2rem;">Start your environmental journey today</p>
        <a href="challenges.html" class="btn btn-primary btn-large">
          <i data-lucide="rocket" width="20" height="20"></i>
          Browse Missions
        </a>
      </div>
    `;
    if (typeof lucide !== 'undefined') lucide.createIcons();
    return;
  }
  
  container.innerHTML = userSubmissions.map(sub => {
    const statusColor = sub.status === 'approved' ? '#10b981' : sub.status === 'rejected' ? '#ef4444' : '#f59e0b';
    const statusText = sub.status === 'approved' ? 'Approved ✓' : sub.status === 'rejected' ? 'Rejected' : 'Pending';
    
    const dateStr = sub.submittedDate?.toDate ? new Date(sub.submittedDate.toDate()).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Recently';
    
    return `
      <div style="background: white; padding: 1.5rem; border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); margin-bottom: 1rem;">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h3 style="margin: 0 0 0.5rem 0; color: #111827; font-size: 1.25rem;">${sub.challengeTitle}</h3>
            <p style="color: #6b7280; margin: 0; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem;">
              <i data-lucide="calendar" width="14" height="14"></i>
              ${dateStr}
            </p>
          </div>
          <span style="background: ${statusColor}; color: white; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 700; font-size: 0.875rem; white-space: nowrap;">${statusText}</span>
        </div>
        
        <p style="color: #374151; margin-bottom: 1rem; line-height: 1.6;">${sub.description}</p>
        
        ${sub.location ? `
          <p style="color: #6b7280; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            <i data-lucide="map-pin" width="16" height="16"></i> 
            ${sub.location}
          </p>
        ` : ''}
        
        ${sub.photos && sub.photos.length > 0 ? `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem; margin-bottom: 1rem;">
            ${sub.photos.slice(0, 4).map(photo => `
              <img src="${photo}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; cursor: pointer;" alt="Submission photo" onclick="window.open('${photo}', '_blank')">
            `).join('')}
            ${sub.photos.length > 4 ? `<div style="width: 100%; height: 120px; background: #f3f4f6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6b7280; font-weight: 700;">+${sub.photos.length - 4} more</div>` : ''}
          </div>
        ` : ''}
        
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #f3f4f6; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #059669; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; font-size: 1.125rem;">
            <i data-lucide="award" width="22" height="22"></i>
            ${sub.points} points
          </span>
          ${sub.status === 'approved' ? `
            <span style="color: #10b981; font-weight: 600; font-size: 0.875rem;">Mission Complete!</span>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
  
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  auth.onAuthStateChanged((user) => {
    if (user) {
      loadDashboard();
    } else {
      window.location.href = 'index.html';
    }
  });
});
