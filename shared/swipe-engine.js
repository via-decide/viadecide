(() => {
  const POOL = [
    { type: 'water', prompt: 'Absorb the rain', xp: 12 },
    { type: 'pest', prompt: 'Clear the aphids', xp: 14 },
    { type: 'logic', prompt: 'Plan tomorrow\'s task', xp: 10 },
    { type: 'rest', prompt: 'Recovery day', xp: 8 }
  ];

  let session = null;

  function getInitData() {
    return window.Telegram?.WebApp?.initData || '';
  }

  async function validateSession(results) {
    const initData = getInitData();
    const response = await fetch('/api/swipe/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: initData ? `Bearer ${initData}` : ''
      },
      body: JSON.stringify({ initData, results })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || 'Swipe validation failed');
    }

    return payload;
  }

  function pickCards() {
    const size = 6;
    const cards = [];
    for (let i = 0; i < size; i += 1) {
      const card = POOL[Math.floor(Math.random() * POOL.length)];
      cards.push({ ...card, id: `${card.type}-${Date.now()}-${i}` });
    }
    return cards;
  }

  function startSession() {
    session = { cards: pickCards(), cursor: 0, streak: 1, completed: false, results: [] };
    return session;
  }

  async function completeSession() {
    if (!session) return null;

    const payload = await validateSession(session.results);
    session.completed = true;
    session.xpEarned = Number(payload.xpEarned || 0);
    window.dispatchEvent(new CustomEvent('swipe:session_completed', { detail: { xpEarned: session.xpEarned, streak: session.streak, validated: true } }));
    return { ...session };
  }

  async function swipeCard(direction) {
    if (!session || session.completed) return null;
    const card = session.cards[session.cursor];
    if (!card) return null;

    const accepted = direction === 'right';
    session.results.push({ cardId: card.id, accepted });
    session.cursor += 1;

    if (session.cursor >= session.cards.length) {
      try {
        await completeSession();
      } catch (error) {
        window.dispatchEvent(new CustomEvent('swipe:session_error', { detail: { error: String(error?.message || error) } }));
      }
    }

    return { ...session };
  }

  window.SwipeEngine = { startSession, swipeCard };
})();
