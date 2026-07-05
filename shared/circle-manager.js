(() => {
  const state = { circles: [] };
  const projectUrl = window.ECO_SUPABASE_URL || 'https://bfocxgtlemhxfwfuhlxn.supabase.co';
  const anonKey = window.ECO_SUPABASE_ANON_KEY || '';

  let supabaseClient = null;
  let siegeChannel = null;

  function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    if (!window.supabase?.createClient || !anonKey) return null;
    supabaseClient = window.supabase.createClient(projectUrl, anonKey);
    return supabaseClient;
  }

  async function listCircles() {
    const client = getSupabaseClient();
    if (!client) return [...state.circles];

    const { data, error } = await client.from('circles').select('*').order('created_at', { ascending: false });
    if (error) {
      window.dispatchEvent(new CustomEvent('circle:error', { detail: { message: error.message, context: 'list' } }));
      return [...state.circles];
    }

    state.circles = Array.isArray(data) ? data : [];
    return [...state.circles];
  }

  async function createCircle(name) {
    const client = getSupabaseClient();
    if (!client) {
      const circle = { id: `circle-${Date.now()}`, name, members: [] };
      state.circles.push(circle);
      return circle;
    }

    const { data, error } = await client.from('circles').insert({ name }).select('*').single();
    if (error) {
      window.dispatchEvent(new CustomEvent('circle:error', { detail: { message: error.message, context: 'create' } }));
      return null;
    }

    await listCircles();
    return data;
  }

  async function attackSiege(memberId, damage, circleId) {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client.rpc('attack_pest_siege', {
      p_circle_id: circleId,
      p_member_id: memberId,
      p_damage: Number(damage) || 0
    });

    if (error) {
      window.dispatchEvent(new CustomEvent('circle:error', { detail: { message: error.message, context: 'attack' } }));
      return null;
    }

    return data;
  }

  function subscribeSiegeUpdates() {
    const client = getSupabaseClient();
    if (!client || siegeChannel) return siegeChannel;

    siegeChannel = client
      .channel('public:circles')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pest_sieges' }, (payload) => {
        window.dispatchEvent(new CustomEvent('circle:siege_hit', { detail: payload }));
      })
      .subscribe();

    return siegeChannel;
  }

  window.CircleManager = { listCircles, createCircle, attackSiege, subscribeSiegeUpdates };
})();
