/**
 * ACEP — Authentication, session handling, user profile in Firestore
 * Uses one auth listener; init() registers callbacks.
 */
(function () {
  const badgeFromPoints = (points) => {
    const p = Number(points) || 0;
    if (p <= 100) return { name: 'Beginner', emoji: '🌱' };
    if (p <= 500) return { name: 'Explorer', emoji: '🌿' };
    if (p <= 1000) return { name: 'Champion', emoji: '🌳' };
    return { name: 'Legend', emoji: '🏆' };
  };

  let authListenerStarted = false;
  let authResolved = false;
  let lastUser = null;
  let lastProfile = null;
  const callbacks = [];

  async function ensureUserProfile(firebaseUser) {
    if (!window.acep || !firebaseUser) return null;
    const { db, FieldValue } = window.acep;
    const ref = db.collection('users').doc(firebaseUser.uid);
    const snap = await ref.get();

    if (!snap.exists) {
      const b = badgeFromPoints(0);
      await ref.set({
        username: firebaseUser.displayName || 'Eco Explorer',
        email: firebaseUser.email || '',
        totalPoints: 0,
        challengesCompleted: [],
        currentBadge: b.name,
        createdAt: FieldValue.serverTimestamp(),
        lastActive: FieldValue.serverTimestamp(),
      });
      const again = await ref.get();
      return { id: firebaseUser.uid, ...again.data() };
    }

    await ref.update({ lastActive: FieldValue.serverTimestamp() });
    return { id: firebaseUser.uid, ...snap.data() };
  }

  function setNavAuthState(user) {
    document.querySelectorAll('[data-auth="guest"]').forEach((el) => {
      el.hidden = !!user;
    });
    document.querySelectorAll('[data-auth="user"]').forEach((el) => {
      el.hidden = !user;
    });
    const nameEl = document.querySelector('[data-nav-username]');
    if (nameEl && user) {
      nameEl.textContent = user.displayName || user.email || 'Explorer';
    }
  }

  function runCallbacks() {
    callbacks.forEach((fn) => {
      try {
        fn(lastUser, lastProfile);
      } catch (e) {
        console.error(e);
      }
    });
  }

  function startAuthListener() {
    if (authListenerStarted) return;
    authListenerStarted = true;
    const { auth } = window.acep;

    auth.onAuthStateChanged(async (user) => {
      lastUser = user;
      setNavAuthState(user);

      if (!user) {
        lastProfile = null;
        authResolved = true;
        runCallbacks();
        return;
      }

      try {
        lastProfile = await ensureUserProfile(user);
      } catch (e) {
        console.error('Profile sync failed:', e);
        lastProfile = null;
      }
      authResolved = true;
      runCallbacks();
    });
  }

  window.acepAuth = {
    badgeFromPoints,

    async register(email, password, username) {
      const { auth } = window.acep;
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      if (username && cred.user) {
        await cred.user.updateProfile({ displayName: username.trim() });
      }
      await ensureUserProfile(cred.user);
      return cred.user;
    },

    async login(email, password) {
      const { auth } = window.acep;
      const cred = await auth.signInWithEmailAndPassword(email, password);
      await ensureUserProfile(cred.user);
      return cred.user;
    },

    async logout() {
      const { auth } = window.acep;
      await auth.signOut();
    },

    async getProfile(uid) {
      const { db } = window.acep;
      const snap = await db.collection('users').doc(uid).get();
      if (!snap.exists) return null;
      return { id: snap.id, ...snap.data() };
    },

    /**
     * @param {{ requireAuth?: boolean, redirectTo?: string, onReady?: Function }} options
     */
    init(options = {}) {
      if (!window.acep) {
        console.error('acep not ready');
        return Promise.resolve({ user: null, profile: null });
      }

      const redirectTo = options.redirectTo || 'index.html';
      const requireAuth = !!options.requireAuth;

      const handler = (user, profile) => {
        if (requireAuth && !user) {
          const next = encodeURIComponent(window.location.pathname.split('/').pop() || '');
          window.location.href = `${redirectTo}${redirectTo.includes('?') ? '&' : '?'}next=${next}`;
          return;
        }
        if (typeof options.onReady === 'function') {
          options.onReady(user, profile);
        }
      };

      callbacks.push(handler);
      startAuthListener();

      if (authResolved) {
        handler(lastUser, lastProfile);
      }

      return Promise.resolve({ user: lastUser, profile: lastProfile });
    },
  };
})();
