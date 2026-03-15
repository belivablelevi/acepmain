// Earth Rangers-style Missions
let currentMissions = [];
let currentFilter = 'all';
let selectedMission = null;

// Mission images - high quality, engaging photos
const missionImages = {
  industrial: [
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=900&q=80'
  ],
  wastewater: [
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1584799235813-aaf50331d081?auto=format&fit=crop&w=900&q=80'
  ],
  harmful: [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?auto=format&fit=crop&w=900&q=80'
  ],
  eutrophication: [
    'https://images.unsplash.com/photo-1583425423320-2386622cd2e4?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?auto=format&fit=crop&w=900&q=80'
  ],
  pollution: [
    'https://images.unsplash.com/photo-1621451537084-482c73073a0f?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=900&q=80'
  ]
};

async function loadMissions() {
  try {
    const missionsSnapshot = await db.collection('challenges')
      .where('active', '==', true)
      .get();
    
    currentMissions = missionsSnapshot.docs.map((doc, index) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        // Use custom imageUrl if provided, otherwise use category image
        image: data.imageUrl || getMissionImage(data.category, index)
      };
    });
    
    renderMissions();
  } catch (error) {
    console.error('Error loading missions:', error);
    document.getElementById('missionsGrid').innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="color: #ef4444; font-weight: 600;">Error loading missions. Please refresh!</p>
      </div>
    `;
  }
}

function getMissionImage(category, index) {
  const images = missionImages[category] || missionImages.pollution;
  return images[index % images.length];
}

function renderMissions() {
  const grid = document.getElementById('missionsGrid');
  const filtered = currentFilter === 'all' 
    ? currentMissions 
    : currentMissions.filter(m => m.category === currentFilter);
  
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
        <p style="color: #6b7280;">No missions found in this category.</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = filtered.map(mission => {
    const categoryColors = {
      industrial: { bg: '#fee2e2', text: '#991b1b', emoji: '🏭' },
      wastewater: { bg: '#dbeafe', text: '#1e40af', emoji: '💧' },
      harmful: { bg: '#fef3c7', text: '#92400e', emoji: '☠️' },
      eutrophication: { bg: '#d1fae5', text: '#065f46', emoji: '🌊' },
      pollution: { bg: '#e0e7ff', text: '#3730a3', emoji: '🗑️' }
    };
    
    const difficultyColors = {
      easy: { bg: '#d1fae5', text: '#065f46' },
      medium: { bg: '#fef3c7', text: '#92400e' },
      hard: { bg: '#fee2e2', text: '#991b1b' }
    };
    
    const catStyle = categoryColors[mission.category] || categoryColors.pollution;
    const diffStyle = difficultyColors[mission.difficulty] || difficultyColors.medium;
    
    return `
      <div class="mission-card-large" onclick="showMissionDetail('${mission.id}')">
        <div style="position: relative;">
          <img src="${mission.image}" alt="${mission.title}" class="mission-hero">
          <div class="mission-badge" style="color: #059669;">
            <i data-lucide="award" width="16" height="16"></i>
            <span>${mission.points} pts</span>
          </div>
        </div>
        <div class="mission-body">
          <div class="mission-category" style="background: ${catStyle.bg}; color: ${catStyle.text};">
            ${catStyle.emoji} ${formatCategory(mission.category)}
          </div>
          <h3 class="mission-title">${mission.title}</h3>
          <p class="mission-description">${mission.description}</p>
          <div class="mission-footer">
            <div class="mission-difficulty" style="background: ${diffStyle.bg}; color: ${diffStyle.text};">
              ${mission.difficulty.toUpperCase()}
            </div>
            <button onclick="event.stopPropagation(); showSubmissionForm('${mission.id}')" class="btn btn-primary" style="border-radius: 999px; padding: 0.625rem 1.5rem;">
              Start Mission →
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
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

function filterMissions(category) {
  currentFilter = category;
  document.querySelectorAll('.filter-btn-new').forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
  renderMissions();
}

function showMissionDetail(missionId) {
  const mission = currentMissions.find(m => m.id === missionId);
  if (!mission) return;
  
  selectedMission = mission;
  const modal = document.getElementById('missionModal');
  const detail = document.getElementById('missionDetail');
  
  const categoryEmojis = {
    industrial: '🏭',
    wastewater: '💧',
    harmful: '☠️',
    eutrophication: '🌊',
    pollution: '🗑️'
  };
  
  detail.innerHTML = `
    <img src="${mission.image}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 12px; margin-bottom: 2rem;">
    
    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
      <span style="font-size: 3rem;">${categoryEmojis[mission.category] || '🌍'}</span>
      <div>
        <span style="display: inline-block; padding: 0.4rem 1rem; background: #f0fdf4; color: #059669; border-radius: 999px; font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">
          ${formatCategory(mission.category)}
        </span>
        <h2 style="margin: 0; font-size: 2rem; font-weight: 800;">${mission.title}</h2>
      </div>
    </div>
    
    <div style="display: flex; gap: 2rem; margin-bottom: 2rem; flex-wrap: wrap;">
      <div style="display: flex; align-items: center; gap: 0.5rem; color: #059669; font-weight: 700; font-size: 1.125rem;">
        <i data-lucide="award" width="24" height="24"></i>
        <span>${mission.points} points</span>
      </div>
      <div style="padding: 0.5rem 1rem; background: ${mission.difficulty === 'easy' ? '#d1fae5' : mission.difficulty === 'hard' ? '#fee2e2' : '#fef3c7'}; color: ${mission.difficulty === 'easy' ? '#065f46' : mission.difficulty === 'hard' ? '#991b1b' : '#92400e'}; border-radius: 8px; font-weight: 700; text-transform: uppercase; font-size: 0.875rem;">
        ${mission.difficulty}
      </div>
    </div>
    
    <h3 style="font-weight: 700; margin-bottom: 1rem; font-size: 1.25rem;">Mission Description</h3>
    <p style="color: #374151; line-height: 1.8; margin-bottom: 2rem; font-size: 1.0625rem;">${mission.fullDescription || mission.description}</p>
    
    <h3 style="font-weight: 700; margin-bottom: 1rem; font-size: 1.25rem;">What You'll Do</h3>
    <ul style="list-style: none; padding: 0; margin-bottom: 2rem;">
      ${mission.requirements.photos ? `<li style="padding: 0.75rem 0; display: flex; align-items: start; gap: 0.75rem; border-bottom: 1px solid #f3f4f6;"><i data-lucide="camera" width="20" height="20" style="color: #059669; margin-top: 0.25rem; flex-shrink: 0;"></i> <span>Take ${mission.requirements.photos} clear photos showing the pollution or your action</span></li>` : ''}
      ${mission.requirements.description ? `<li style="padding: 0.75rem 0; display: flex; align-items: start; gap: 0.75rem; border-bottom: 1px solid #f3f4f6;"><i data-lucide="file-text" width="20" height="20" style="color: #059669; margin-top: 0.25rem; flex-shrink: 0;"></i> <span>Write a detailed description of what you observed and did</span></li>` : ''}
      ${mission.requirements.location ? `<li style="padding: 0.75rem 0; display: flex; align-items: start; gap: 0.75rem;"><i data-lucide="map-pin" width="20" height="20" style="color: #059669; margin-top: 0.25rem; flex-shrink: 0;"></i> <span>Record the location where you found the issue</span></li>` : ''}
    </ul>
    
    <button onclick="showSubmissionForm('${mission.id}')" class="btn btn-primary btn-large" style="width: 100%; font-size: 1.125rem;">
      <i data-lucide="check-circle" width="24" height="24"></i>
      Accept & Start Mission
    </button>
  `;
  
  modal.style.display = 'flex';
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function closeMissionModal() {
  document.getElementById('missionModal').style.display = 'none';
}

function showSubmissionForm(missionId) {
  const user = auth.currentUser;
  if (!user) {
    toggleAuthModal();
    showNotification('Please sign in to start missions', 'info');
    return;
  }
  
  const mission = currentMissions.find(m => m.id === missionId);
  if (!mission) return;
  
  selectedMission = mission;
  document.getElementById('submissionMissionName').textContent = mission.title;
  document.getElementById('missionModal').style.display = 'none';
  document.getElementById('submissionModal').style.display = 'flex';
  document.getElementById('submissionForm').reset();
  document.getElementById('photoPreview').innerHTML = '';
}

function closeSubmissionModal() {
  document.getElementById('submissionModal').style.display = 'none';
}

// Photo preview
document.addEventListener('DOMContentLoaded', () => {
  const photoInput = document.getElementById('submissionPhotos');
  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const preview = document.getElementById('photoPreview');
      preview.innerHTML = '';
      
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const div = document.createElement('div');
          div.style.cssText = 'position: relative;';
          div.innerHTML = `
            <img src="${e.target.result}" style="width: 100%; height: 140px; object-fit: cover; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
          `;
          preview.appendChild(div);
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

// Handle submission (same as challenges-imgur.js)
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
  progressText.textContent = 'Processing photos...';
  
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
    progressText.textContent = 'Submitting mission...';
    
    // Create submission with PENDING status
    const submissionData = {
      userId: user.uid,
      userEmail: user.email,
      userName: user.displayName || user.email.split('@')[0],
      challengeId: selectedMission.id,
      challengeTitle: selectedMission.title,
      status: 'pending', // Needs approval!
      photos: photoData,
      description: document.getElementById('submissionDescription').value,
      location: document.getElementById('submissionLocation').value,
      submittedDate: firebase.firestore.FieldValue.serverTimestamp(),
      points: selectedMission.points, // Stored but not awarded yet
      reviewed: false
    };
    
    await db.collection('submissions').add(submissionData);
    
    progressBar.style.width = '100%';
    progressText.textContent = 'Submitted!';
    
    showNotification(`✅ Mission submitted! Waiting for approval. You'll get ${selectedMission.points} points once approved!`, 'success');
    
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

// Auth functions (same as before)
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
loadMissions();

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
