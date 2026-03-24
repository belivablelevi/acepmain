/**
 * ACEP — Challenges list, filters, detail modal, Firebase submission
 * Depends on: challenges-data.js (window.acepChallenges)
 */
(function () {
  const getChallenges = () =>
    (window.acepChallenges && window.acepChallenges.CHALLENGES) || [];
  const getCategoryLabels = () =>
    (window.acepChallenges && window.acepChallenges.categoryLabels) || {};

  const difficultyClass = (d) => {
    if (d === 'easy') return 'easy';
    if (d === 'medium') return 'medium';
    return 'hard';
  };

  let currentUser = null;
  let userProfile = null;
  let filter = 'all';

  function toast(message, isError) {
    const el = document.createElement('div');
    el.className = `toast${isError ? ' toast--error' : ''}`;
    el.textContent = message;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add('toast--show'));
    setTimeout(() => {
      el.classList.remove('toast--show');
      setTimeout(() => el.remove(), 300);
    }, 3200);
  }

  function completedSet() {
    return new Set(userProfile?.challengesCompleted || []);
  }

  function renderGrid() {
    const grid = document.getElementById('challengesGrid');
    if (!grid) return;

    const CHALLENGES = getChallenges();
    const list =
      filter === 'all' ? CHALLENGES : CHALLENGES.filter((c) => c.category === filter);

    if (list.length === 0) {
      grid.innerHTML =
        '<p class="empty-state">No challenges in this category yet. Try “All”.</p>';
      return;
    }

    const done = completedSet();
    grid.innerHTML = list
      .map((c) => {
        const isDone = done.has(c.id);
        return `
      <article class="challenge-card" data-challenge-id="${c.id}">
        <div class="challenge-card__top">
          <span class="difficulty-badge ${difficultyClass(c.difficulty)}">${c.difficulty}</span>
          ${c.requiresParent ? '<span class="parent-badge">Grown-up help</span>' : ''}
        </div>
        <h3 class="challenge-card__title">${escapeHtml(c.title)}</h3>
        <p class="challenge-card__desc">${escapeHtml(c.description)}</p>
        <div class="challenge-card__footer">
          <span class="challenge-card__points">${c.points} pts</span>
          <button type="button" class="btn btn--primary btn--small" data-open="${c.id}">
            ${isDone ? 'View' : 'Open'}
          </button>
        </div>
      </article>`;
      })
      .join('');

    grid.querySelectorAll('[data-open]').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.getAttribute('data-open')));
    });
  }

  function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function openModal(challengeId) {
    const categoryLabels = getCategoryLabels();
    const c = getChallenges().find((x) => x.id === challengeId);
    if (!c) return;

    const modal = document.getElementById('challengeModal');
    const body = document.getElementById('challengeModalBody');
    const done = completedSet().has(c.id);

    body.innerHTML = `
      <header class="modal-challenge__head">
        <p class="modal-challenge__meta">${categoryLabels[c.category] || c.category} · ${c.difficulty}</p>
        <h2 id="modalTitle">${escapeHtml(c.title)}</h2>
        <p class="modal-challenge__points">${c.points} points</p>
      </header>
      <p class="modal-challenge__text">${escapeHtml(c.description)}</p>
      <section class="modal-challenge__instructions">
        <h3>How to complete</h3>
        <p>${escapeHtml(c.instructions)}</p>
      </section>
      ${
        done
          ? '<p class="modal-challenge__done">You already completed this challenge. Great work!</p>'
          : ''
      }
      <div class="modal-challenge__submit" id="submitSection" ${done || !currentUser ? 'hidden' : ''}>
        <label class="file-label">
          <span>Photo evidence</span>
          <input type="file" id="challengePhoto" accept="image/*" />
        </label>
        <button type="button" class="btn btn--primary" id="submitChallengeBtn" data-cid="${c.id}">
          <span class="btn__text">Submit challenge</span>
          <span class="btn__loading" hidden>Uploading…</span>
        </button>
      </div>
      ${
        !currentUser && !done
          ? '<p class="modal-challenge__hint"><a href="index.html#sign-in">Sign in</a> to submit your photo and earn points.</p>'
          : ''
      }
    `;

    modal.hidden = false;
    modal.setAttribute('aria-hidden', 'false');

    const submitBtn = document.getElementById('submitChallengeBtn');
    const fileInput = document.getElementById('challengePhoto');

    if (submitBtn && !done && currentUser) {
      submitBtn.addEventListener('click', () => handleSubmit(c, submitBtn, fileInput));
    }
  }

  function closeModal() {
    const modal = document.getElementById('challengeModal');
    if (!modal) return;
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
  }

  async function handleSubmit(challenge, btn, fileInput) {
    const { db, FieldValue } = window.acep;
    const file = fileInput?.files?.[0];
    const v = window.acepUpload.validateFile(file);
    if (!v.ok) {
      toast(v.message, true);
      return;
    }

    const loading = (on) => {
      btn.disabled = on;
      btn.querySelector('.btn__text').hidden = on;
      btn.querySelector('.btn__loading').hidden = !on;
    };

    loading(true);
    try {
      const photoURL = await window.acepUpload.uploadSubmissionPhoto(
        currentUser.uid,
        file
      );

      await db.runTransaction(async (t) => {
        const userRef = db.collection('users').doc(currentUser.uid);
        const snap = await t.get(userRef);
        if (!snap.exists) throw new Error('Profile not found. Please refresh and try again.');
        const data = snap.data();
        const completed = data.challengesCompleted || [];
        if (completed.includes(challenge.id)) {
          throw new Error('You already completed this challenge.');
        }

        const newTotal = (data.totalPoints || 0) + challenge.points;
        const badge = window.acepAuth.badgeFromPoints(newTotal);

        t.update(userRef, {
          totalPoints: FieldValue.increment(challenge.points),
          challengesCompleted: FieldValue.arrayUnion(challenge.id),
          currentBadge: badge.name,
          lastActive: FieldValue.serverTimestamp(),
        });

        const subRef = db.collection('submissions').doc();
        t.set(subRef, {
          submissionId: subRef.id,
          userId: currentUser.uid,
          challengeId: challenge.id,
          photoURL,
          pointsEarned: challenge.points,
          submittedAt: FieldValue.serverTimestamp(),
          status: 'approved',
        });
      });

      toast(`Nice! You earned ${challenge.points} points!`);
      const prof = await window.acepAuth.getProfile(currentUser.uid);
      userProfile = prof;
      closeModal();
      renderGrid();
    } catch (e) {
      console.error(e);
      toast(e.message || 'Something went wrong. Please try again.', true);
    } finally {
      loading(false);
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('challengesGrid');
    if (!grid) return;

    document.querySelectorAll('.filter-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        filter = btn.dataset.filter || 'all';
        renderGrid();
      });
    });

    document.getElementById('closeChallengeModal')?.addEventListener('click', closeModal);
    document.getElementById('challengeModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'challengeModal') closeModal();
    });

    window.acepAuth
      .init({
        onReady(user, profile) {
          currentUser = user;
          userProfile = profile;
          renderGrid();
        },
      })
      .catch((e) => console.error(e));
  });
})();
