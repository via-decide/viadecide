(function (global) {
  'use strict';

  var key = global.ECO_SUPABASE_ANON_KEY;
  if (typeof key === 'string' && key.trim()) return;

  var fromMeta = '';
  var meta = global.document && global.document.querySelector('meta[name="eco-supabase-anon-key"]');
  if (meta && typeof meta.content === 'string') {
    fromMeta = meta.content.trim();
  }

  var fromStorage = '';
  try {
    if (global.localStorage) {
      fromStorage = (global.localStorage.getItem('eco_supabase_anon_key') || '').trim();
    }
  } catch (_) {
    fromStorage = '';
  }

  var resolved = fromMeta || fromStorage || '';
  if (resolved) {
    global.ECO_SUPABASE_ANON_KEY = resolved;
  }
})(window);
