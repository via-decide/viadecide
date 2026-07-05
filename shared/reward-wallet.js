(() => {
  const DEFAULT_BALANCES = { drops: 120, coins: 0, gems: 0, lumina: 0 };
  const state = { ...DEFAULT_BALANCES };

  function getInitData() {
    return window.Telegram?.WebApp?.initData || '';
  }

  async function postTransaction(payload) {
    const initData = getInitData();
    const response = await fetch('/api/wallet/transaction', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: initData ? `Bearer ${initData}` : ''
      },
      body: JSON.stringify({ ...payload, initData })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || 'Wallet transaction failed');
    }

    return data;
  }

  function applyDelta(currency, amount) {
    const key = currency || 'drops';
    state[key] = (state[key] || 0) + amount;
    return key;
  }

  function rollback(currency, amount) {
    state[currency] = (state[currency] || 0) - amount;
  }

  async function earn(currency, amount = 0, reason = 'unknown') {
    const safeAmount = Math.max(0, Number(amount) || 0);
    const key = applyDelta(currency, safeAmount);

    window.dispatchEvent(new CustomEvent('wallet:earned', { detail: { currency: key, amount: safeAmount, reason, total: state[key], optimistic: true } }));

    try {
      const result = await postTransaction({ currency: key, amount: safeAmount, action: 'earn', reason, signature: `earn:${key}:${safeAmount}:${reason}` });
      const confirmedTotal = Number(result?.balances?.[key]);
      if (Number.isFinite(confirmedTotal)) state[key] = confirmedTotal;
      window.dispatchEvent(new CustomEvent('wallet:synced', { detail: { currency: key, total: state[key], action: 'earn' } }));
      return state[key];
    } catch (error) {
      rollback(key, safeAmount);
      window.dispatchEvent(new CustomEvent('wallet:sync_error', { detail: { currency: key, action: 'earn', amount: safeAmount, reason, error: String(error?.message || error) } }));
      return state[key];
    }
  }

  async function spend(currency, amount = 0, reason = 'unknown') {
    const key = currency || 'drops';
    const need = Math.max(0, Number(amount) || 0);
    const have = state[key] || 0;
    if (have < need) {
      window.dispatchEvent(new CustomEvent('wallet:insufficient', { detail: { currency: key, needed: need, have } }));
      return false;
    }

    applyDelta(key, -need);
    window.dispatchEvent(new CustomEvent('wallet:spent', { detail: { currency: key, amount: need, reason, total: state[key], optimistic: true } }));

    try {
      const result = await postTransaction({ currency: key, amount: need, action: 'spend', reason, signature: `spend:${key}:${need}:${reason}` });
      const confirmedTotal = Number(result?.balances?.[key]);
      if (Number.isFinite(confirmedTotal)) state[key] = confirmedTotal;
      window.dispatchEvent(new CustomEvent('wallet:synced', { detail: { currency: key, total: state[key], action: 'spend' } }));
      return true;
    } catch (error) {
      rollback(key, -need);
      window.dispatchEvent(new CustomEvent('wallet:sync_error', { detail: { currency: key, action: 'spend', amount: need, reason, error: String(error?.message || error) } }));
      return false;
    }
  }

  function syncBalances(balances = {}) {
    Object.keys(DEFAULT_BALANCES).forEach((key) => {
      if (Number.isFinite(Number(balances[key]))) state[key] = Number(balances[key]);
    });
    window.dispatchEvent(new CustomEvent('wallet:synced', { detail: { balances: { ...state } } }));
    return { ...state };
  }

  function getBalances() { return { ...state }; }

  window.RewardWallet = { earn, spend, getBalances, syncBalances };
})();
