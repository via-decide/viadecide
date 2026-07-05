/**
 * vd-auth.js
 * Centralized Firebase Auth for decide.engine-tools
 * Orchade Pattern: Unified session across all tools.
 */

window._VD_AUTH = (() => {
  let currentUser = null;
  let isReady = false;
  const readyCallbacks = [];

  // SDKs are expected to be loaded in index.html (root)
  // window.firebase is the compat SDK (v9+)
  
  function init() {
    if (!window.firebase) {
      console.warn("VD Auth: Firebase SDK not found. Waiting...");
      setTimeout(init, 500);
      return;
    }

    if (firebase.apps.length === 0) {
      console.warn("VD Auth: Firebase app not initialized. Auth disabled.");
      isReady = true;
      updateLoginWall();
      while (readyCallbacks.length > 0) readyCallbacks.shift()(null);
      return;
    }

    const auth = firebase.auth();
    
    auth.onAuthStateChanged((user) => {
      currentUser = user;
      isReady = true;
      console.log("VD Auth: State changed", user ? user.uid : "Signed out");
      
      // Update UI (Login Wall)
      updateLoginWall();
      
      // Trigger callbacks
      while (readyCallbacks.length > 0) {
        const cb = readyCallbacks.shift();
        cb(user);
      }
    });
  }

  function updateLoginWall() {
    const wall = document.getElementById('vd-login-wall');
    if (!wall) return;
    
    if (currentUser) {
      wall.style.display = 'none';
      document.body.classList.remove('auth-locked');
    } else {
      wall.style.display = 'flex';
      document.body.classList.add('auth-locked');
    }
    
    // Update HUD Badge if exists
    const badge = document.getElementById('vd-auth-badge');
    if (badge) {
      badge.innerHTML = currentUser 
        ? `<img src="${currentUser.photoURL}" class="user-avatar" title="${currentUser.displayName}">`
        : `<button onclick="_VD_AUTH.login()" class="login-btn">Login</button>`;
    }
  }

  return {
    init,
    login: async () => {
      if (!window.firebase || firebase.apps.length === 0) {
        return alert("Auth is disabled (Firebase not configured).");
      }
      const provider = new firebase.auth.GoogleAuthProvider();
      try {
        await firebase.auth().signInWithPopup(provider);
      } catch (err) {
        console.error("VD Auth: Login failed", err);
        alert("Login failed: " + err.message);
      }
    },
    logout: () => {
      if (window.firebase && firebase.apps.length > 0) firebase.auth().signOut();
    },
    getUser: () => currentUser,
    getUID: () => currentUser ? currentUser.uid : 'anonymous',
    onReady: (cb) => {
      if (isReady) cb(currentUser);
      else readyCallbacks.push(cb);
    }
  };
})();

// Auto-init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => _VD_AUTH.init());
} else {
  _VD_AUTH.init();
}
