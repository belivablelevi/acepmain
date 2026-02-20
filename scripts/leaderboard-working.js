// Leaderboard with real Firebase data
let leaderboardData = [];
let currentTimeframe = 'all';

async function loadLeaderboard() {
  try {
    const usersSnapshot = await db.collection('users')
      .orderBy('points', 'desc')
      .limit(100)
      .get();
    
    leaderboardData = usersSnapshot.docs.map((doc, index) => ({
      rank: index + 1,
      ...doc.data()
    }));
    
    renderLeaderboard();
  } catch (error) {
    console.error('Error loading leaderboard:', error);
    document.getElementById('leaderboardTable').innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #ef4444;">
        Error loading leaderboard. Make sure users exist in Firebase!
      </div>
    `;
  }
}

function renderLeaderboard() {
  const container = document.getElementById('leaderboardTable');
  
  if (leaderboardData.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: #6b7280;">
        <p>No users yet! Be the first to complete a challenge!</p>
      </div>
    `;
    return;
  }
  
  // Top 3 podium
  const top3 = leaderboardData.slice(0, 3);
  const rest = leaderboardData.slice(3);
  
  let html = '<div class="podium-container" style="display: flex; gap: 1rem; justify-content: center; align-items: flex-end; margin-bottom: 3rem;">';
  
  if (top3[1]) {
    html += `
      <div class="podium-item" style="text-align: center; flex: 1; max-width: 200px;">
        <div style="font-size: 3rem;">${top3[1].badge || '🌿'}</div>
        <h3 style="margin: 0.5rem 0; font-size: 1.25rem;">${top3[1].username}</h3>
        <p style="color: #6b7280; margin: 0;">${top3[1].points || 0} points</p>
        <div style="background: linear-gradient(135deg, #d1d5db, #9ca3af); height: 120px; margin-top: 1rem; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; color: white;">2nd</div>
      </div>
    `;
  }
  
  if (top3[0]) {
    html += `
      <div class="podium-item" style="text-align: center; flex: 1; max-width: 200px;">
        <div style="font-size: 4rem;">${top3[0].badge || '🏆'}</div>
        <h3 style="margin: 0.5rem 0; font-size: 1.5rem; font-weight: 800;">${top3[0].username}</h3>
        <p style="color: #059669; font-weight: 700; margin: 0; font-size: 1.125rem;">${top3[0].points || 0} points</p>
        <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); height: 160px; margin-top: 1rem; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; color: white; box-shadow: 0 10px 40px rgba(251, 191, 36, 0.3);">1st</div>
      </div>
    `;
  }
  
  if (top3[2]) {
    html += `
      <div class="podium-item" style="text-align: center; flex: 1; max-width: 200px;">
        <div style="font-size: 3rem;">${top3[2].badge || '🌿'}</div>
        <h3 style="margin: 0.5rem 0; font-size: 1.25rem;">${top3[2].username}</h3>
        <p style="color: #6b7280; margin: 0;">${top3[2].points || 0} points</p>
        <div style="background: linear-gradient(135deg, #fcd34d, #fbbf24); height: 100px; margin-top: 1rem; border-radius: 12px 12px 0 0; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; color: white;">3rd</div>
      </div>
    `;
  }
  
  html += '</div>';
  
  // Rest of leaderboard
  if (rest.length > 0) {
    html += `
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08);">
        <table style="width: 100%; border-collapse: collapse;">
          <thead style="background: #f9fafb; border-bottom: 2px solid #e5e7eb;">
            <tr>
              <th style="padding: 1rem; text-align: left; font-weight: 700; color: #374151;">Rank</th>
              <th style="padding: 1rem; text-align: left; font-weight: 700; color: #374151;">User</th>
              <th style="padding: 1rem; text-align: center; font-weight: 700; color: #374151;">Badge</th>
              <th style="padding: 1rem; text-align: right; font-weight: 700; color: #374151;">Points</th>
              <th style="padding: 1rem; text-align: right; font-weight: 700; color: #374151;">Challenges</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    rest.forEach(user => {
      html += `
        <tr style="border-bottom: 1px solid #f3f4f6; transition: background 0.2s;" onmouseover="this.style.background='#f9fafb'" onmouseout="this.style.background='white'">
          <td style="padding: 1rem; font-weight: 600; color: #6b7280;">#${user.rank}</td>
          <td style="padding: 1rem; font-weight: 600; color: #111827;">${user.username}</td>
          <td style="padding: 1rem; text-align: center; font-size: 1.5rem;">${user.badge || '🌱'}</td>
          <td style="padding: 1rem; text-align: right; font-weight: 700; color: #059669;">${user.points || 0}</td>
          <td style="padding: 1rem; text-align: right; color: #6b7280;">${user.challengesCompleted?.length || 0}</td>
        </tr>
      `;
    });
    
    html += `
          </tbody>
        </table>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// Initialize
document.addEventListener('DOMContentLoaded', loadLeaderboard);
