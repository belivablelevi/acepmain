/**
 * ACEP — Real-time leaderboard (top 20) + current user rank
 */
(function () {
  let unsub = null;

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function renderTable(rows) {
    const tbody = document.getElementById('rankingsBody');
    if (!tbody) return;

    if (!rows.length) {
      tbody.innerHTML =
        '<tr><td colspan="4" class="table-empty">No players yet. Be the first to earn points!</td></tr>';
      return;
    }

    tbody.innerHTML = rows
      .map((r, i) => {
        const rank = i + 1;
        const badge = r.currentBadge || 'Beginner';
        return `
      <tr>
        <td><span class="rank-pill rank-pill--${rank <= 3 ? 'top' : 'rest'}">#${rank}</span></td>
        <td>${escapeHtml(r.username || 'Explorer')}</td>
        <td>${Number(r.totalPoints || 0).toLocaleString()}</td>
        <td>${escapeHtml(badge)}</td>
      </tr>`;
      })
      .join('');
  }

  function renderPodium(rows) {
    const slots = [
      document.getElementById('podiumSecond'),
      document.getElementById('podiumFirst'),
      document.getElementById('podiumThird'),
    ];
    const order = [1, 0, 2];
    const labels = ['#2', '🏆 #1', '#3'];
    order.forEach((dataIdx, slotIdx) => {
      const el = slots[slotIdx];
      if (!el) return;
      const row = rows[dataIdx];
      if (!row) {
        el.innerHTML = `<span class="podium-rank">${labels[slotIdx]}</span><span class="podium-name">—</span><span class="podium-pts">—</span>`;
        return;
      }
      el.innerHTML = `
        <span class="podium-rank">${slotIdx === 1 ? '🏆 #1' : labels[slotIdx]}</span>
        <span class="podium-name">${escapeHtml(row.username || 'Explorer')}</span>
        <span class="podium-pts">${Number(row.totalPoints || 0).toLocaleString()} pts</span>
      `;
    });
  }

  async function computeRank(uid, userPoints) {
    const { db } = window.acep;
    const higher = await db
      .collection('users')
      .where('totalPoints', '>', userPoints)
      .get();
    return higher.size + 1;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('rankingsBody');
    if (!tbody || !window.acep) return;

    window.acepAuth.init({});

    const { db, auth } = window.acep;
    const q = db.collection('users').orderBy('totalPoints', 'desc').limit(20);

    unsub = q.onSnapshot(
      async (snap) => {
        const rows = [];
        snap.forEach((doc) => rows.push({ id: doc.id, ...doc.data() }));
        renderTable(rows);
        renderPodium(rows);

        const rankEl = document.getElementById('yourRankDisplay');
        const ptsEl = document.getElementById('yourPointsDisplay');
        const user = auth.currentUser;

        if (!user) {
          if (rankEl) rankEl.textContent = '—';
          if (ptsEl) ptsEl.textContent = '—';
          return;
        }

        const profile = await window.acepAuth.getProfile(user.uid);
        const pts = profile?.totalPoints ?? 0;
        if (ptsEl) ptsEl.textContent = Number(pts).toLocaleString();

        const mine = rows.find((r) => r.id === user.uid);
        if (rankEl) {
          if (mine) {
            const idx = rows.findIndex((r) => r.id === user.uid);
            rankEl.textContent =
              idx >= 0 ? `#${idx + 1}` : `#${await computeRank(user.uid, pts)}`;
          } else {
            rankEl.textContent = `#${await computeRank(user.uid, pts)}`;
          }
        }
      },
      (err) => {
        console.error('Leaderboard listener error:', err);
        tbody.innerHTML =
          '<tr><td colspan="4" class="table-empty">Could not load leaderboard. Check the console.</td></tr>';
      }
    );

    window.addEventListener(
      'beforeunload',
      () => {
        if (typeof unsub === 'function') unsub();
      },
      { once: true }
    );
  });
})();
