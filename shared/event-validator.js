(async function () {
  if (typeof window === 'undefined' || !window.location.search.includes('env=test')) {
    return;
  }

  console.log('[VIA-EVENT-VALIDATOR] Active. Fetching schemas...');
  
  try {
    const rawData = await fetch('/shared/event-schema.json');
    if (!rawData.ok) throw new Error("Could not find event-schema.json");
    
    const schemas = await rawData.json();
    const originalDispatch = window.dispatchEvent;
    
    window.dispatchEvent = function (event) {
      if (event instanceof CustomEvent && schemas[event.type]) {
        const schema = schemas[event.type];
        const payload = event.detail || {};

        if (Array.isArray(schema.required)) {
          schema.required.forEach(key => {
            if (payload[key] === undefined) {
              const err = `[VIA-EVENT-VALIDATOR] 🔥 Invalid CustomEvent: '${event.type}' missing required property: '${key}' !`;
              console.error(err, payload);
              throw new TypeError(err);
            }
          });
        }
        
        if (schema.properties) {
          for (const [key, rules] of Object.entries(schema.properties)) {
            if (payload[key] !== undefined && typeof payload[key] !== rules.type && rules.type !== 'object') { // loose object check
              const err = `[VIA-EVENT-VALIDATOR] 🔥 Invalid property type: '${key}' expected '${rules.type}', got '${typeof payload[key]}'`;
              console.error(err, payload);
              throw new TypeError(err);
            }
          }
        }
      }
      
      return originalDispatch.call(this, event);
    };
    
    console.log('[VIA-EVENT-VALIDATOR] Overriden window.dispatchEvent successfully.');
  } catch (err) {
    console.error('[VIA-EVENT-VALIDATOR] Failed to bind', err);
  }
})();
