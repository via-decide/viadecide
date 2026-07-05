(function(global) {
  'use strict';
  
  const _sparksKey = () => {
    const uid = (global._VD_AUTH && global._VD_AUTH.getUID()) || 'anon';
    return `vd_wallet_${uid}`;
  };

  const VDWallet = {
    get() {
      const KEY = _sparksKey();
      try { 
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : this._def(); 
      }
      catch { return this._def(); }
    },
    _def() {
      return { focusDrops:0, lumina:0, hexTokens:0, missionXP:0,
               snakeCoins:0, quizStars:0, totalEarned:0, lastUpdated:'' };
    },
    save(w) {
      const KEY = _sparksKey();
      w.lastUpdated = new Date().toISOString();
      localStorage.setItem(KEY, JSON.stringify(w));
      global.dispatchEvent(new CustomEvent('vdwallet:updated', { detail: w }));
    },
    earn(field, amount, source) {
      // Allow negative amount for deductions
      const w = this.get();
      w[field] = (w[field] || 0) + amount;
      if (amount > 0) w.totalEarned = (w.totalEarned || 0) + amount;
      this.save(w);
      return w;
    },
    balance(field) {
      const w = this.get();
      return field ? (w[field] || 0) : w;
    }
  };
  global.VDWallet = VDWallet;
})(window);
