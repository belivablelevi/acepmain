// Updated Challenges with AUTO-APPROVE and immediate points
let currentChallenges = [];
let currentFilter = 'all';
let selectedChallenge = null;

async function loadChallenges() {
  try {
    const challengesSnapshot = await db.collection('challenges')
      .where('active', '==', true)
      .get();
    
    currentChallenges = challengesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    renderChallenges();
  } catch (error) {
    console.error('Error loading challenges:', error);
  }
}

function renderChallenges() {
  const grid = document.getElementById('challengesGrid');
  const filtered = currentFilter === 'all' 
    ? currentChallenges 
    : currentChallenges.filter(c => c.category === currentFilter);
  
  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
      <p style="color: #6b7280;">No challenges found.</p></div>`;
    return;
  }
  
  grid.innerHTML = filtered.map(challenge => `
    <div class="challenge-card" onclick="showChallengeDetail('${challenge.id}')">
      <img class="challenge-image" src="${getChallengeImage(challenge.category)}" alt="${challenge.title}">
      <div class="body">
        <div class="challenge-tag ${challenge.category}">${formatCategory(challenge.category)}</div>
        <h3>${challenge.title}</h3>
        <p>${challenge.description}</p>
        <div class="challenge-footer">
          <div class="challenge-points">
            <i data-lucide="award" width="18" height="18"></i>
            <span>${challenge.points} pts</span>
          </div>
          <div class="challenge-difficulty ${challenge.difficulty}">${challenge.difficulty}</div>
        </div>
        <a href="#" class="challenge-link" onclick="event.stopPropagation(); showSubmissionForm('${challenge.id}')">
          Start Challenge <i data-lucide="arrow-right" width="16" height="16"></i>
        </a>
      </div>
    </div>
  `).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function getChallengeImage(category) {
  const images = {
    industrial: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=900&q=60',
    wastewater: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=60',
    harmful: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=60',
    eutrophication: 'https://images.unsplash.com/photo-1583425423320-2386622cd2e4?auto=format&fit=crop&w=900&q=60',
    pollution: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=60'
  };
  return images[category] || images.pollution;
}

function formatCategory(category) {
  const labels = {
    industrial: 'Industrial',
    wastewater: 'Wastewater',
    harmful: 'Harmful Substances',
    eutrophication: 'Eutrophication',
    pollution: 'General Pollution'
  };
  return labels[category] || category;
}

function filterChallenges(category) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderChallenges();
}

function showChallengeDetail(challengeId) {
  const challenge = currentChallenges.find(c => c.id === challengeId);
  if (!challenge) return;
  
  selectedChallenge = challenge;
  const modal = document.getElementById('challengeModal');
  const detail = document.getElementById('challengeDetail');
  
  detail.innerHTML = `
    <div class="challenge-tag ${challenge.category}">${formatCategory(challenge.category)}</div>
    <h2>${challenge.title}</h2>
    <div class="challenge-meta" style="display: flex; gap: 1rem; margin: 1rem 0;">
      <span style="display: flex; align-items: center; gap: 0.5rem; color: #059669; font-weight: 700;">
        <i data-lucide="award" width="20" height="20"></i>
        ${challenge.points} points
      </span>
      <span class="challenge-difficulty ${challenge.difficulty}">${challenge.difficulty}</span>
    </div>
    <h3>Description</h3>
    <p>${challenge.fullDescription || challenge.description}</p>
    <h3 style="margin-top: 1.5rem;">Requirements</h3>
    <ul style="list-style: none; padding: 0;">
      ${challenge.requirements.photos ? `<li style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="camera" width="18" height="18" style="color: #059669;"></i> Submit ${challenge.requirements.photos} photo(s)</li>` : ''}
      ${challenge.requirements.description ? `<li style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="file-text" width="18" height="18" style="color: #059669;"></i> Written description</li>` : ''}
      ${challenge.requirements.location ? `<li style="padding: 0.5rem 0; display: flex; align-items: center; gap: 0.5rem;"><i data-lucide="map-pin" width="18" height="18" style="color: #059669;"></i> Location information</li>` : ''}
    </ul>
    <button onclick="showSubmissionForm('${challenge.id}')" class="btn btn-primary btn-large" style="width: 100%; margin-top: 2rem;">
      <i data-lucide="upload" width="20" height="20"></i>
      Start This Challenge
    </button>
  `;
  
  modal.style.display = 'flex';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeChallengeModal() {
  document.getElementById('challengeModal').style.display = 'none';
}

function showSubmissionForm(challengeId) {
  const user = auth.currentUser;
  if (!user) {
    toggleAuthModal();
    showNotification('Please sign in to submit challenges', 'info');
    return;
  }
  
  const challenge = currentChallenges.find(c => c.id === challengeId);
  if (!challenge) return;
  
  selectedChallenge = challenge;
  document.getElementById('submissionChallengeName').textContent = challenge.title;
  document.getElementById('challengeModal').style.display = 'none';
  document.getElementById('submissionModal').style.display = 'flex';
  document.getElementById('submissionForm').reset();
  document.getElementById('photoPreview').innerHTML = '';
}

function closeSubmissionModal() {
  document.getElementById('submissionModal').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  const photoInput = document.getElementById('submissionPhotos');
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const preview = document.getElementById('photoPreview');
      preview.innerHTML = '';
      
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = document.createElement('img');
          img.src = e.target.result;
          img.style.cssText = 'width: 100%; height: 100px; object-fit: cover; border-radius: 6px;';
          preview.appendChild(img);
        };
        reader.readAsDataURL(file);
      });
    });
  }
});

function getCurrentLocation() {
  if (!navigator.geolocation) {
    showNotification('Geolocation not supported', 'error');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      document.getElementById('submissionLocation').value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      showNotification('Location captured!', 'success');
    },
    (error) => {
      showNotification('Could not get location', 'error');
    }
  );
}

// UPDATED: Auto-approve and award points immediately
async function handleSubmission(e) {
  e.preventDefault();
  
  const user = auth.currentUser;
  if (!user) {
    showNotification('Please sign in first', 'error');
    return;
  }
  
  const submitBtn = document.getElementById('submitBtn');
  const progressDiv = document.getElementById('uploadProgress');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  
  submitBtn.disabled = true;
  progressDiv.style.display = 'block';
  progressText.textContent = 'Compressing and uploading photos...';
  
  try {
    const photoFiles = document.getElementById('submissionPhotos').files;
    const photoData = [];
    
    for (let i = 0; i < photoFiles.length; i++) {
      const file = photoFiles[i];
      progressText.textContent = `Processing image ${i + 1}/${photoFiles.length}...`;
      const compressed = await window.imageUpload.compressImage(file);
      const base64 = await window.imageUpload.convertImageToBase64(compressed);
      photoData.push(base64);
      progressBar.style.width = `${((i + 1) / photoFiles.length) * 60}%`;
    }
    
    progressBar.style.width = '70%';
    progressText.textContent = 'Creating submission...';
    
    // Create submission with AUTO-APPROVE
    const submissionData = {
      userId: user.uid,
      challengeId: selectedChallenge.id,
      challengeTitle: selectedChallenge.title,
      status: 'approved', // AUTO-APPROVE!
      photos: photoData,
      description: document.getElementById('submissionDescription').value,
      location: document.getElementById('submissionLocation').value,
      submittedDate: firebase.firestore.FieldValue.serverTimestamp(),
      approvedDate: firebase.firestore.FieldValue.serverTimestamp(),
      points: selectedChallenge.points
    };
    
    await db.collection('submissions').add(submissionData);
    
    progressBar.style.width = '85%';
    progressText.textContent = 'Awarding points...';
    
    // Award points immediately to user
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      // User document exists, update it
      await userRef.update({
        points: firebase.firestore.FieldValue.increment(selectedChallenge.points),
        challengesCompleted: firebase.firestore.FieldValue.arrayUnion(selectedChallenge.id),
        lastActivity: firebase.firestore.FieldValue.serverTimestamp()
      });
    } else {
      // User document doesn't exist, create it
      await userRef.set({
        uid: user.uid,
        email: user.email,
        username: user.email.split('@')[0],
        points: selectedChallenge.points,
        badge: '🌱',
        level: 1,
        challengesCompleted: [selectedChallenge.id],
        joinedDate: firebase.firestore.FieldValue.serverTimestamp(),
        lastActivity: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
    
    // Update badge if needed
    const updatedDoc = await userRef.get();
    const userData = updatedDoc.data();
    const totalPoints = userData.points || 0;
    let badge = '🌱';
    if (totalPoints >= 5000) badge = '🏆';
    else if (totalPoints >= 3000) badge = '🦸';
    else if (totalPoints >= 2000) badge = '🏅';
    else if (totalPoints >= 1000) badge = '⭐';
    else if (totalPoints >= 500) badge = '🌳';
    else if (totalPoints >= 200) badge = '🌿';
    
    await userRef.update({ badge });
    
    progressBar.style.width = '100%';
    progressText.textContent = 'Complete!';
    
    showNotification(`Success! You earned ${selectedChallenge.points} points! 🎉`, 'success');
    
    setTimeout(() => {
      closeSubmissionModal();
      submitBtn.disabled = false;
      progressDiv.style.display = 'none';
      progressBar.style.width = '0%';
    }, 2000);
    
  } catch (error) {
    console.error('Submission error:', error);
    showNotification('Error: ' + error.message, 'error');
    submitBtn.disabled = false;
    progressDiv.style.display = 'none';
  }
}

// Auth functions
function toggleAuthModal() {
  const modal = document.getElementById('authModal');
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function showSignIn() {
  document.getElementById('signInForm').style.display = 'block';
  document.getElementById('signUpForm').style.display = 'none';
}

function showSignUp() {
  document.getElementById('signInForm').style.display = 'none';
  document.getElementById('signUpForm').style.display = 'block';
}

async function handleSignIn(e) {
  e.preventDefault();
  const email = document.getElementById('signInEmail').value;
  const password = document.getElementById('signInPassword').value;
  
  try {
    await authFunctions.signIn(email, password);
    toggleAuthModal();
  } catch (error) {
    console.error(error);
  }
}

async function handleSignUp(e) {
  e.preventDefault();
  const username = document.getElementById('signUpUsername').value;
  const email = document.getElementById('signUpEmail').value;
  const password = document.getElementById('signUpPassword').value;
  
  try {
    await authFunctions.signUp(email, password, username);
    toggleAuthModal();
  } catch (error) {
    console.error(error);
  }
}

// Initialize
loadChallenges();

// Update auth button
auth.onAuthStateChanged((user) => {
  const authBtn = document.getElementById('authBtn');
  const dashboardLink = document.getElementById('dashboardLink');
  
  if (user) {
    authBtn.textContent = 'Sign Out';
    authBtn.onclick = () => authFunctions.signOut();
    dashboardLink.style.display = 'inline-flex';
  } else {
    authBtn.textContent = 'Sign In';
    authBtn.onclick = toggleAuthModal;
    dashboardLink.style.display = 'none';
  }
});
