/**
 * ACEP — Dashboard: stats, badge, submissions, suggested challenges
 */
(function () {
  let unsubSubs = null;

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function badgeDisplay(profile) {
    const b = window.acepAuth.badgeFromPoints(profile?.totalPoints || 0);
    return `${b.emoji} ${b.name}`;
  }

  async function computeRank(uid, userPoints) {
    const { db } = window.acep;
    const higher = await db
      .collection('users')
      .where('totalPoints', '>', userPoints)
      .get();
    return higher.size + 1;
  }

  function renderSubmissions(subs, challengesMap) {
    const el = document.getElementById('submissionList');
    if (!el) return;

    if (!subs.length) {
      el.innerHTML =
        '<p class="empty-state">No submissions yet. <a href="challenges.html">Try a challenge</a>!</p>';
      return;
    }

    el.innerHTML = subs
      .map((s) => {
        const ch = challengesMap[s.challengeId];
        const title = ch ? ch.title : s.challengeId;
        const when = s.submittedAt?.toDate
          ? s.submittedAt.toDate().toLocaleString()
          : '';
        return `
      <article class="submission-card">
        <div class="submission-card__img-wrap">
          <img src="${escapeHtml(s.photoURL)}" alt="" loading="lazy" />
        </div>
        <div class="submission-card__body">
          <h3>${escapeHtml(title)}</h3>
          <p class="submission-card__meta">+${s.pointsEarned} pts · ${escapeHtml(when)}</p>
        </div>
      </article>`;
      })
      .join('');
  }

  function renderSuggestions(completedIds) {
    const el = document.getElementById('suggestedChallenges');
    if (!el || !window.acepChallenges) return;

    const done = new Set(completedIds || []);
    const next = window.acepChallenges.CHALLENGES.filter((c) => !done.has(c.id)).slice(0, 3);

    if (!next.length) {
      el.innerHTML =
        '<p class="empty-state">You’ve finished every challenge! Check back for new ones later.</p>';
      return;
    }

    el.innerHTML = next
      .map(
        (c) => `
      <a class="suggestion-card" href="challenges.html">
        <span class="suggestion-card__title">${escapeHtml(c.title)}</span>
        <span class="suggestion-card__pts">${c.points} pts</span>
      </a>`
      )
      .join('');
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('dashboardRoot');
    if (!root) return;

    window.acepAuth
      .init({
        requireAuth: true,
        redirectTo: 'index.html',
        async onReady(user, profile) {
          if (!user) return;

          const totalEl = document.getElementById('totalPoints');
          const countEl = document.getElementById('challengesCount');
          const rankEl = document.getElementById('globalRank');
          const badgeEl = document.getElementById('currentBadge');
          const welcomeEl = document.getElementById('userName');

          const uname = profile?.username || user.displayName || user.email || 'Explorer';
          if (welcomeEl) welcomeEl.textContent = uname;

          const pts = profile?.totalPoints ?? 0;
          const completed = profile?.challengesCompleted || [];

          if (totalEl) totalEl.textContent = Number(pts).toLocaleString();
          if (countEl) countEl.textContent = String(completed.length);
          if (badgeEl) badgeEl.textContent = badgeDisplay(profile);
          if (rankEl) rankEl.textContent = String(await computeRank(user.uid, pts));

          renderSuggestions(completed);

          const { db } = window.acep;
          const map = {};
          (window.acepChallenges?.CHALLENGES || []).forEach((c) => {
            map[c.id] = c;
          });

          const q = db
            .collection('submissions')
            .where('userId', '==', user.uid)
            .orderBy('submittedAt', 'desc')
            .limit(12);

          unsubSubs = q.onSnapshot(
            (snap) => {
              const list = [];
              snap.forEach((d) => list.push(d.data()));
              renderSubmissions(list, map);
            },
            (err) => {
              console.error('Submissions query:', err);
              const el = document.getElementById('submissionList');
              if (el) {
                el.innerHTML =
                  '<p class="empty-state">Could not load submissions. If this is new, create a Firestore composite index for submissions (userId + submittedAt).</p>';
              }
            }
          );
        },
      })
      .catch((e) => console.error(e));

    document.getElementById('btnLogout')?.addEventListener('click', async () => {
      await window.acepAuth.logout();
      window.location.href = 'index.html';
    });

    window.addEventListener(
      'beforeunload',
      () => {
        if (typeof unsubSubs === 'function') unsubSubs();
      },
      { once: true }
    );
  });
})();
