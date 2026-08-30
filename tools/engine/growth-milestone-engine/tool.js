/* growth-milestone-engine/tool.js */
(() => {
  const MASTER_STATE_KEY = 'orchard_engine_player_state';

  const MILESTONES = [
    { threshold: 0, name: 'Dormant Seed', color: '#5D4037', stageId: 0, maxWater: 30 },
    { threshold: 25, name: 'Sprout', color: '#388E3C', stageId: 1, maxWater: 50 },
    { threshold: 80, name: 'Sapling', color: '#43A047', stageId: 2, maxWater: 80 },
    { threshold: 180, name: 'Young Tree', color: '#2E7D32', stageId: 3, maxWater: 120 }
  ];

  const FERT_TYPES = {
    basic: { cost: 15, nut: 40, stress: 0, name: 'Compost' },
    synthetic: { cost: 25, nut: 80, stress: 15, name: 'Synthetic' },
    premium: { cost: 50, nut: 100, stress: -20, name: 'Organic Premium' }
  };

  const PEST_TYPES = {
    organic: { cost: 15, kills: 1, stress: 0, nutDrain: 0, immunity: 0, name: 'Neem Oil' },
    chemical: { cost: 25, kills: 99, stress: 15, nutDrain: 20, immunity: 0, name: 'Chemical Spray' },
    systemic: { cost: 60, kills: 99, stress: 10, nutDrain: 5, immunity: 3, name: 'Systemic Guard' }
  };

  function getDefaultState() {
    return {
      day: 1,
      credits: 60,
      rootStrength: 0,
      currentStageIndex: 0,
      environment: { soil: 'Backend Systems', sunlightMultiplier: 1.0, weather: 'rain' },
      water: 30,
      maxWater: 30,
      nutrients: 100,
      stress: 0,
      actionFatigue: 0,
      pests: 0,
      pestImmunity: 0
    };
  }

  function hydrateState() {
    const defaults = getDefaultState();
    try {
      const raw = localStorage.getItem(MASTER_STATE_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      return {
        ...defaults,
        ...parsed,
        environment: {
          ...defaults.environment,
          ...(parsed.environment || {})
        }
      };
    } catch (_err) {
      return defaults;
    }
  }

  let state = hydrateState();

  const els = {
    visualizer: document.getElementById('visualizer'),
    canvasContainer: document.getElementById('canvas-container'),
    status: document.getElementById('player-status'),
    terminal: document.getElementById('terminal-log'),
    txtDay: document.getElementById('txt-day'),
    txtCredits: document.getElementById('txt-credits'),
    badgeImmunity: document.getElementById('badge-immunity'),
    rootVal: document.getElementById('root-val'),
    rootBar: document.getElementById('root-bar'),
    nextLabel: document.getElementById('next-milestone-label'),
    txtWater: document.getElementById('txt-water'),
    barWater: document.getElementById('water-bar'),
    txtNutrients: document.getElementById('txt-nutrients'),
    barNutrients: document.getElementById('nutrient-bar'),
    txtStress: document.getElementById('txt-stress'),
    barStress: document.getElementById('stress-bar'),
    txtPests: document.getElementById('txt-pests'),
    btnSimulate: document.getElementById('btn-simulate'),
    btnRest: document.getElementById('btn-rest'),
    btnFertilize: document.getElementById('btn-fertilize'),
    btnPesticide: document.getElementById('btn-pesticide'),
    selSoil: document.getElementById('select-soil'),
    selFert: document.getElementById('select-fert'),
    selPest: document.getElementById('select-pest'),
    selSun: document.getElementById('select-sun'),
    selWeather: document.getElementById('select-weather')
  };

  let scene, camera, renderer, currentPlant, dirLight;
  let targetScale = 1;
  let isBurning = false;
  let animPaused = false;

  document.addEventListener('visibilitychange', () => {
    animPaused = document.hidden;
  });

  function syncState() {
    localStorage.setItem(MASTER_STATE_KEY, JSON.stringify(state));
  }

  function emitEvent(name, data) {
    window.dispatchEvent(new CustomEvent(name, { detail: data }));
  }

  function canPerformAction() {
    if (state.water === 0 || state.credits < 1) {
      log('⛔ Action blocked. Requires water > 0 and credits >= 1.', 'warn');
      return false;
    }
    return true;
  }

  function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0.5, 0);

    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(200, 200);
    els.canvasContainer.innerHTML = '';
    els.canvasContainer.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));
    dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const soilMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(1.5, 1.2, 0.2, 16),
      new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 1 })
    );
    soilMesh.position.y = -0.1;
    scene.add(soilMesh);

    update3DModel(MILESTONES[state.currentStageIndex].stageId);
    animate3D();
  }

  function createPlant(type) {
    const g = new THREE.Group();
    if (type === 0) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 16), new THREE.MeshStandardMaterial({ color: 0x5D4037 }));
      m.scale.y = 0.8;
      m.position.y = 0.2;
      g.add(m);
    }
    if (type === 1) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8), new THREE.MeshStandardMaterial({ color: 0x689F38 }));
      s.position.y = 0.3;
      g.add(s);
      const lM = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
      const l1 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), lM);
      l1.scale.set(1, 0.2, 1);
      l1.position.set(0.15, 0.5, 0);
      l1.rotation.z = -0.4;
      const l2 = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), lM);
      l2.scale.set(1, 0.2, 1);
      l2.position.set(-0.15, 0.4, 0);
      l2.rotation.z = 0.4;
      g.add(l1, l2);
    }
    if (type === 2) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x795548 }));
      t.position.y = 0.6;
      g.add(t);
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), new THREE.MeshStandardMaterial({ color: 0x43A047 }));
      c.position.y = 1.3;
      g.add(c);
    }
    if (type === 3) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.25, 1.8, 12), new THREE.MeshStandardMaterial({ color: 0x5D4037 }));
      t.position.y = 0.9;
      g.add(t);
      const cM = new THREE.MeshStandardMaterial({ color: 0x2E7D32 });
      const c1 = new THREE.Mesh(new THREE.SphereGeometry(0.7, 12, 12), cM);
      c1.position.set(0, 1.8, 0);
      const c2 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), cM);
      c2.position.set(0.4, 1.5, 0.3);
      const c3 = new THREE.Mesh(new THREE.SphereGeometry(0.5, 12, 12), cM);
      c3.position.set(-0.4, 1.5, -0.3);
      g.add(c1, c2, c3);
    }
    return g;
  }

  function update3DModel(stageId) {
    if (currentPlant) scene.remove(currentPlant);
    currentPlant = createPlant(stageId);
    currentPlant.scale.set(0, 0, 0);
    targetScale = 1;
    scene.add(currentPlant);
  }

  function animate3D() {
    requestAnimationFrame(animate3D);
    if (animPaused) return;

    if (currentPlant) {
      currentPlant.rotation.y += 0.01;
      if (isBurning) {
        currentPlant.position.x = (Math.random() - 0.5) * 0.1;
        dirLight.color.setHex(0xff0000);
      } else if (state.pests > 0) {
        currentPlant.position.x = 0;
        dirLight.color.setHex(0xccff90);
      } else {
        currentPlant.position.x = 0;
        dirLight.color.setHex(state.environment.weather === 'sun' ? 0xfff9c4 : 0xffffff);
      }
      currentPlant.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);
    }
    renderer.render(scene, camera);
  }

  function log(msg, type = 'info') {
    const line = document.createElement('div');
    line.className = `log-${type}`;
    line.innerHTML = `[Day ${state.day}] ${msg}`;
    els.terminal.appendChild(line);
    els.terminal.scrollTop = els.terminal.scrollHeight;
  }

  function updateUI() {
    state.water = Math.max(0, Math.min(state.water, state.maxWater));
    state.nutrients = Math.max(0, Math.min(state.nutrients, 100));
    state.stress = Math.max(0, Math.min(state.stress, 100));

    els.txtDay.innerText = `Day ${state.day}`;
    els.txtCredits.innerText = state.credits;
    els.txtWater.innerText = `${Math.round(state.water)}/${state.maxWater}`;

    const wPct = state.maxWater > 0 ? (state.water / state.maxWater) * 100 : 0;
    els.barWater.style.width = `${wPct}%`;
    els.barWater.style.backgroundColor = wPct <= 20 ? 'var(--color-burn-red)' : 'var(--color-water-blue)';

    els.txtNutrients.innerText = `${Math.round(state.nutrients)}%`;
    els.barNutrients.style.width = `${state.nutrients}%`;
    els.barNutrients.style.backgroundColor = state.nutrients <= 30 ? 'var(--color-burn-red)' : 'var(--color-mineral-gold)';

    els.txtStress.innerText = `${Math.round(state.stress)}%`;
    els.barStress.style.width = `${state.stress}%`;

    if (state.pests > 0) {
      els.txtPests.innerText = '🐛'.repeat(state.pests);
      els.visualizer.classList.add('infested');
    } else {
      els.txtPests.innerText = 'Clean Environment';
      els.visualizer.classList.remove('infested');
    }

    els.badgeImmunity.style.display = state.pestImmunity > 0 ? 'flex' : 'none';
    if (state.pestImmunity > 0) {
      els.badgeImmunity.innerText = `🛡️ Immune (${state.pestImmunity}d)`;
    }

    els.selSoil.value = state.environment.soil;
    els.selSun.value = String(state.environment.sunlightMultiplier);
    els.selWeather.value = state.environment.weather;
    els.visualizer.classList.toggle('weather-rain', state.environment.weather === 'rain');
    els.visualizer.classList.toggle('weather-sun', state.environment.weather === 'sun');

    els.btnRest.disabled = state.credits < 15;
    els.btnSimulate.disabled = state.water < 5;
  }

  function checkEvolution() {
    let nextStage = 0;
    for (let i = 0; i < MILESTONES.length; i += 1) {
      if (state.rootStrength >= MILESTONES[i].threshold) nextStage = i;
    }

    if (nextStage < state.currentStageIndex) {
      state.currentStageIndex = nextStage;
      state.maxWater = MILESTONES[nextStage].maxWater;
      update3DModel(MILESTONES[nextStage].stageId);
      els.status.innerText = MILESTONES[nextStage].name;
      els.status.style.backgroundColor = MILESTONES[nextStage].color;
    } else if (nextStage > state.currentStageIndex) {
      const nS = MILESTONES[nextStage];
      state.currentStageIndex = nextStage;
      state.maxWater = nS.maxWater;
      update3DModel(nS.stageId);
      els.canvasContainer.style.transform = 'scale(1.1)';
      setTimeout(() => {
        els.status.innerText = nS.name;
        els.status.style.backgroundColor = nS.color;
        els.canvasContainer.style.transform = 'scale(1.0)';
      }, 300);
      log(`Evolution! You are now a [${nS.name}]. Max Water increased to ${state.maxWater}.`, 'success');
      emitEvent('engine:evolution', { newStageName: nS.name, newMaxWater: state.maxWater });
      window.dispatchEvent(new CustomEvent('engine:evolution', {
        detail: { newStageName: nS.name, newMaxWater: state.maxWater }
      }));
    }

    els.rootVal.innerText = state.rootStrength;
    const nxtM = MILESTONES[state.currentStageIndex + 1];
    if (nxtM) {
      els.nextLabel.innerText = `Next: ${nxtM.name} (${nxtM.threshold})`;
      const rng = nxtM.threshold - MILESTONES[state.currentStageIndex].threshold;
      const prg = state.rootStrength - MILESTONES[state.currentStageIndex].threshold;
      els.rootBar.style.width = `${Math.min(100, Math.max(0, (prg / rng) * 100))}%`;
    } else {
      els.nextLabel.innerText = 'Max Root Level!';
      els.rootBar.style.width = '100%';
    }
  }

  function triggerCropBurn() {
    const rootDamage = Math.floor(state.rootStrength * 0.4) + 10;
    isBurning = true;
    els.visualizer.classList.add('burning');
    log('🔥 CROP BURN! Pushed to 100% stress. Massive root damage!', 'danger');
    state.rootStrength = Math.max(0, state.rootStrength - rootDamage);
    state.stress = 0;
    state.actionFatigue = 0;
    targetScale = 0.5;
    syncState();

    emitEvent('engine:crop_burn', { rootDamage, stressReset: true });

    setTimeout(() => {
      isBurning = false;
      els.visualizer.classList.remove('burning');
      targetScale = 1.0;
      checkEvolution();
      updateUI();
    }, 2000);
  }

  function wireActions() {
    els.btnRest.addEventListener('click', () => {
      if (!canPerformAction()) return;
      if (state.credits < 15) return;
      state.credits -= 15;
      state.day += 1;
      state.water = Math.min(state.maxWater, state.water + state.maxWater);
      state.actionFatigue = 0;

      if (state.pests > 0) {
        const nutDrain = state.pests * 10;
        state.nutrients -= nutDrain;
        state.stress += state.pests * 5;
        log(`🐛 Pests drained ${nutDrain}% nutrients overnight and caused stress!`, 'toxic');
      } else {
        state.stress = Math.max(0, state.stress - 40);
      }

      if (state.pestImmunity > 0) state.pestImmunity -= 1;

      updateUI();
      syncState();
      if (state.stress >= 100) triggerCropBurn();
      log('🌙 Rested. Paid 15🪙.', 'system');
      emitEvent('engine:day_advanced', { currentDay: state.day, cost: 15 });
      els.canvasContainer.style.transform = 'scale(0.95)';
      setTimeout(() => { els.canvasContainer.style.transform = 'scale(1.0)'; }, 150);
    });

    els.btnFertilize.addEventListener('click', () => {
      if (!canPerformAction()) return;
      const f = FERT_TYPES[els.selFert.value];
      if (state.credits < f.cost) return log(`❌ Need ${f.cost}🪙 for ${f.name}.`, 'warn');
      state.credits -= f.cost;
      state.nutrients += f.nut;
      state.stress += f.stress;
      log(`🛒 Applied ${f.name}. Nutrients +${f.nut}%. Stress altered by ${f.stress}.`, 'success');
      if (state.stress >= 100) triggerCropBurn();
      updateUI();
      syncState();
    });

    els.btnPesticide.addEventListener('click', () => {
      if (!canPerformAction()) return;
      const p = PEST_TYPES[els.selPest.value];
      if (state.credits < p.cost) return log(`❌ Need ${p.cost}🪙 for ${p.name}.`, 'warn');
      state.credits -= p.cost;
      state.pests = Math.max(0, state.pests - p.kills);
      state.stress += p.stress;
      state.nutrients -= p.nutDrain;
      if (p.immunity > 0) state.pestImmunity = p.immunity;

      log(`🧪 Applied ${p.name}. Pests eliminated. Nutrients -${p.nutDrain}%, Stress +${p.stress}.`, 'toxic');
      if (state.stress >= 100) triggerCropBurn();
      updateUI();
      syncState();
    });

    els.btnSimulate.addEventListener('click', () => {
      if (!canPerformAction()) return;
      let stressG = 0;
      if (state.water < 10) stressG += 20;
      if (state.actionFatigue >= 2) stressG += 15 * state.actionFatigue;
      state.stress += stressG;
      if (stressG > 0) log(`⚠️ Plant stressed (+${stressG}%) from fatigue/low water.`, 'warn');
      if (state.stress >= 100) return triggerCropBurn();

      els.btnSimulate.disabled = true;
      els.btnSimulate.innerText = '⏳ Processing...';
      setTimeout(() => {
        const baseG = Math.floor(Math.random() * 8) + 5;
        const weather = state.environment.weather;
        const weatherMod = weather === 'rain' ? 1.2 : (weather === 'cloudy' ? 0.8 : 1.0);
        const nutMod = state.nutrients < 30 ? 0.4 : 1.0;
        const fatMod = Math.max(0.3, 1.0 - (state.actionFatigue * 0.2));
        const pestMod = Math.max(0.2, 1.0 - (state.pests * 0.15));
        const finalG = Math.round(baseG * state.environment.sunlightMultiplier * weatherMod * nutMod * fatMod * pestMod);

        state.credits += 12;
        state.rootStrength += finalG;
        state.water -= 5;
        state.nutrients -= 15;
        state.actionFatigue += 1;

        log(`📚 Research +${finalG} Roots, +12🪙.`, 'success');
        if (pestMod < 1.0) log(`🐛 Pests reduced yield by ${Math.round((1 - pestMod) * 100)}%!`, 'toxic');

        if (state.pestImmunity === 0 && Math.random() < 0.25) {
          state.pests = Math.min(5, state.pests + 1);
          log('🐛 A Bug (Pest) infested your work! It will drain nutrients until treated.', 'danger');
          emitEvent('engine:pest_outbreak', { pestCount: state.pests });
        }

        emitEvent('engine:research_completed', { rootsGained: finalG, waterSpent: 5, creditsEarned: 12 });

        checkEvolution();
        updateUI();
        syncState();
        els.btnSimulate.disabled = state.water < 5;
        els.btnSimulate.innerHTML = '📚 Research (-5💧)';
      }, 500);
    });

    els.selSoil.addEventListener('change', () => {
      state.environment.soil = els.selSoil.value;
      syncState();
    });

    els.selSun.addEventListener('change', () => {
      state.environment.sunlightMultiplier = parseFloat(els.selSun.value);
      syncState();
    });

    els.selWeather.addEventListener('change', () => {
      state.environment.weather = els.selWeather.value;
      updateUI();
      syncState();
    });
  }

  function wireIncomingEvents() {
    if (wireIncomingEvents._wired) return;
    wireIncomingEvents._wired = true;
    window.addEventListener('engine:weather_changed', (e) => {
      state.environment.weather = e.detail.newWeather;
      updateUI();
      syncState();
      log(`🌦️ Weather synced from external tool: ${e.detail.newWeather}.`, 'system');
    });

    window.addEventListener('engine:market_reward', (e) => {
      state.credits += Number(e.detail.credits) || 0;
      updateUI();
      syncState();
      log(`💹 Market reward received: +${Number(e.detail.credits) || 0} credits.`, 'success');
    });
  }

  function init() {
    wireActions();
    wireIncomingEvents();
    init3D();
    checkEvolution();
    updateUI();
    syncState();
  }

  window.addEventListener('load', init);
})();
