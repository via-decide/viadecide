/**
 * ViaDecide Entitlements SDK
 * Fetches user auth_depth and ecosystem entitlements from Aporaksha.
 */

window.ViaEntitlements = {
  _cache: null,
  
  async getEntitlements(forceRefresh = false) {
    if (this._cache && !forceRefresh) {
      return this._cache;
    }
    
    try {
      const res = await fetch('https://aporaksha.com/api/entitlements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        // credentials: 'include' // If using cookies
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch entitlements');
      }
      
      const data = await res.json();
      this._cache = data;
      return data;
    } catch (err) {
      console.warn('[ViaEntitlements] Error fetching entitlements, defaulting to locked state.', err);
      return {
        base_auth_depth: 0,
        effective_auth_depth: 0,
        apps: {
          StudyOS: true, // Free tier always accessible
          PrepOS: false,
          SkillHex: false,
          Alchemist: false,
          LoreLabs: false
        }
      };
    }
  },

  async requireTier(tier, appName) {
    const data = await this.getEntitlements();
    if (data.effective_auth_depth < tier) {
      this._renderPaywall(tier, appName);
      return false;
    }
    return true;
  },

  _renderPaywall(requiredTier, appName) {
    const paywall = document.createElement('div');
    paywall.id = 'via-entitlement-paywall';
    paywall.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(10, 10, 10, 0.6);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;
    
    paywall.innerHTML = `
      <div style="background: #151515; border: 1px solid #333; border-radius: 16px; padding: 2rem; max-width: 400px; width: 90%; text-align: center; color: white; box-shadow: 0 20px 40px rgba(0,0,0,0.5); animation: fadeInUp 0.4s ease-out;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🔒</div>
        <h2 style="font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem;">Access Restricted</h2>
        <p style="color: #aaa; margin-bottom: 1.5rem; line-height: 1.5;">${appName || 'This app'} requires an Explorer Pass Tier ${requiredTier} or an active subscription.</p>
        <button onclick="window.location.href='https://viadecide.com/printbydd-store/smarttag-lite.html'" style="background: #ff2a2a; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; width: 100%; transition: background 0.2s;">Upgrade Explorer Pass</button>
        <button onclick="window.location.href='https://viadecide.com/launcher.html'" style="background: transparent; color: #888; border: 1px solid #333; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; width: 100%; margin-top: 10px; transition: background 0.2s;">Return to Launcher</button>
      </div>
      <style>
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      </style>
    `;
    document.body.appendChild(paywall);
  }
};
