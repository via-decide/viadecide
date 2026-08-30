(() => {
  class SeedQualityScorerEngine {
    constructor(storageKey = 'engine.layer0.seed-quality-scorer.state') {
      this.storageKey = storageKey;
      this.maxEvents = 40;
      this.intervalId = null;
      this.dom = null;
      this.state = this.defaultState();
      this.demoSeeds = this.buildDemoSeeds();
    }

    defaultState() {
      return {
        tick: 0,
        status: 'idle',
        growthFocus: 'balanced',
        tickMs: 1200,
        weights: { clarity: 35, viability: 35, growth: 30 },
        seeds: [],
        scores: [],
        events: []
      };
    }

    buildDemoSeeds() {
      return [
        { id: 'seed-root-map', title: 'Root Mapping Protocol', clarity: 82, viability: 76, growthPotential: 85 },
        { id: 'seed-branch-kit', title: 'Branch Specialization Kit', clarity: 75, viability: 84, growthPotential: 72 },
        { id: 'seed-fruit-spec', title: 'Fruit Delivery Spec', clarity: 70, viability: 92, growthPotential: 69 }
      ];
    }

    init() {
      this.bindDom();
      this.bindEvents();
      this.loadState();
      if (!this.state.seeds.length) {
        this.resetToDemo();
      } else {
        this.syncFormFromState();
        this.render();
      }
    }

    bindDom() {
      this.dom = {
        growthFocus: document.getElementById('growthFocus'),
        tickMs: document.getElementById('tickMs'),
        weightClarity: document.getElementById('weightClarity'),
        weightViability: document.getElementById('weightViability'),
        weightGrowth: document.getElementById('weightGrowth'),
        seedInput: document.getElementById('seedInput'),
        scoreBtn: document.getElementById('scoreBtn'),
        startBtn: document.getElementById('startBtn'),
        stopBtn: document.getElementById('stopBtn'),
        resetBtn: document.getElementById('resetBtn'),
        exportBtn: document.getElementById('exportBtn'),
        tickCount: document.getElementById('tickCount'),
        engineStatus: document.getElementById('engineStatus'),
        seedCount: document.getElementById('seedCount'),
        avgScore: document.getElementById('avgScore'),
        topTier: document.getElementById('topTier'),
        snapshotOutput: document.getElementById('snapshotOutput'),
        eventLogOutput: document.getElementById('eventLogOutput')
      };
    }

    bindEvents() {
      this.dom.scoreBtn.addEventListener('click', () => this.runScoreCycle());
      this.dom.startBtn.addEventListener('click', () => this.startSimulation());
      this.dom.stopBtn.addEventListener('click', () => this.stopSimulation());
      this.dom.resetBtn.addEventListener('click', () => this.resetToDemo());
      this.dom.exportBtn.addEventListener('click', () => this.downloadSnapshot());
    }

    /** Public API: accepts full payload and computes scores once. */
    run(payload) {
      this.applyPayload(payload);
      this.computeScores();
      this.persistState();
      return this.getSnapshot();
    }

    /** Public API: current immutable state snapshot for other tools. */
    getSnapshot() {
      return {
        tick: this.state.tick,
        status: this.state.status,
        growthFocus: this.state.growthFocus,
        tickMs: this.state.tickMs,
        weights: { ...this.state.weights },
        scores: [...this.state.scores],
        events: [...this.state.events]
      };
    }

    /** Public API: clear runtime and persisted state. */
    clear() {
      this.stopSimulation();
      this.state = this.defaultState();
      this.persistState();
      this.render();
    }

    applyPayload(payload) {
      if (!payload || typeof payload !== 'object') return;

      if (payload.growthFocus) {
        this.state.growthFocus = payload.growthFocus;
      }

      if (payload.tickMs) {
        this.state.tickMs = this.clamp(Number(payload.tickMs), 250, 5000);
      }

      if (payload.weights && typeof payload.weights === 'object') {
        this.state.weights = {
          clarity: this.clamp(Number(payload.weights.clarity || this.state.weights.clarity), 1, 100),
          viability: this.clamp(Number(payload.weights.viability || this.state.weights.viability), 1, 100),
          growth: this.clamp(Number(payload.weights.growth || this.state.weights.growth), 1, 100)
        };
      }

      if (Array.isArray(payload.seeds)) {
        this.state.seeds = payload.seeds;
      }
    }

    readPayloadFromForm() {
      const seeds = this.parseSeeds(this.dom.seedInput.value);
      const weights = {
        clarity: this.clamp(Number(this.dom.weightClarity.value), 1, 100),
        viability: this.clamp(Number(this.dom.weightViability.value), 1, 100),
        growth: this.clamp(Number(this.dom.weightGrowth.value), 1, 100)
      };

      return {
        growthFocus: this.dom.growthFocus.value,
        tickMs: this.clamp(Number(this.dom.tickMs.value), 250, 5000),
        weights,
        seeds
      };
    }

    runScoreCycle() {
      try {
        this.run(this.readPayloadFromForm());
        this.logEvent('score_cycle_completed', { count: this.state.scores.length });
      } catch (error) {
        this.logEvent('score_cycle_failed', { message: error.message });
      }
      this.render();
    }

    startSimulation() {
      this.stopSimulation();
      this.state.status = 'running';
      this.logEvent('simulation_started', { tickMs: this.state.tickMs });
      this.intervalId = window.setInterval(() => {
        this.state.tick += 1;
        this.applySimulationDrift();
        this.computeScores();
        this.persistState();
        this.render();
      }, this.state.tickMs);
      this.render();
    }

    stopSimulation() {
      if (this.intervalId !== null) {
        window.clearInterval(this.intervalId);
        this.intervalId = null;
      }
      if (this.state.status !== 'idle') {
        this.state.status = 'idle';
        this.logEvent('simulation_stopped');
      }
      this.persistState();
      this.render();
    }

    applySimulationDrift() {
      const drift = this.state.growthFocus === 'root-heavy'
        ? { clarity: 1.4, viability: 0.5, growthPotential: 0.8 }
        : this.state.growthFocus === 'fruit-heavy'
          ? { clarity: 0.4, viability: 1.4, growthPotential: 0.6 }
          : { clarity: 0.8, viability: 0.8, growthPotential: 0.8 };

      this.state.seeds = this.state.seeds.map((seed) => ({
        ...seed,
        clarity: this.clamp(seed.clarity + drift.clarity, 0, 100),
        viability: this.clamp(seed.viability + drift.viability, 0, 100),
        growthPotential: this.clamp(seed.growthPotential + drift.growthPotential, 0, 100)
      }));

      this.dom.seedInput.value = JSON.stringify(this.state.seeds, null, 2);
      this.logEvent('tick_applied', { tick: this.state.tick });
    }

    computeScores() {
      const modifiers = this.focusModifiers(this.state.growthFocus);
      const normalizedWeights = this.normalizeWeights(this.state.weights);

      this.state.scores = this.state.seeds
        .map((seed) => this.scoreSeed(seed, modifiers, normalizedWeights))
        .sort((a, b) => b.totalScore - a.totalScore);
    }

    scoreSeed(seed, modifiers, normalizedWeights) {
      const clarity = this.clamp(seed.clarity * modifiers.clarity, 0, 100);
      const viability = this.clamp(seed.viability * modifiers.viability, 0, 100);
      const growthPotential = this.clamp(seed.growthPotential * modifiers.growthPotential, 0, 100);

      const totalScore = (
        clarity * normalizedWeights.clarity +
        viability * normalizedWeights.viability +
        growthPotential * normalizedWeights.growth
      );

      return {
        id: seed.id || 'unknown-seed',
        title: seed.title || 'Untitled Seed',
        metrics: {
          clarity: Number(clarity.toFixed(1)),
          viability: Number(viability.toFixed(1)),
          growthPotential: Number(growthPotential.toFixed(1))
        },
        totalScore: Number(totalScore.toFixed(2)),
        qualityTier: this.qualityTier(totalScore)
      };
    }

    focusModifiers(focus) {
      if (focus === 'root-heavy') return { clarity: 1.1, viability: 0.95, growthPotential: 1.04 };
      if (focus === 'fruit-heavy') return { clarity: 0.95, viability: 1.1, growthPotential: 1.0 };
      return { clarity: 1.0, viability: 1.0, growthPotential: 1.0 };
    }

    normalizeWeights(weights) {
      const total = weights.clarity + weights.viability + weights.growth;
      return {
        clarity: weights.clarity / total,
        viability: weights.viability / total,
        growth: weights.growth / total
      };
    }

    qualityTier(score) {
      if (score >= 85) return 'Prime Fruit';
      if (score >= 70) return 'Healthy Branch';
      if (score >= 55) return 'Developing Trunk';
      return 'Needs Root Work';
    }

    parseSeeds(raw) {
      let parsed;
      try {
        parsed = JSON.parse(raw);
      } catch (error) {
        throw new Error(`Invalid JSON: ${error.message}`);
      }
      if (!Array.isArray(parsed)) throw new Error('Seed input must be an array.');
      return parsed.map((seed) => ({
        id: seed.id || 'seed-unknown',
        title: seed.title || 'Untitled Seed',
        clarity: this.clamp(Number(seed.clarity || 0), 0, 100),
        viability: this.clamp(Number(seed.viability || 0), 0, 100),
        growthPotential: this.clamp(Number(seed.growthPotential || 0), 0, 100)
      }));
    }

    logEvent(type, payload = {}) {
      this.state.events.unshift({
        time: new Date().toISOString(),
        type,
        payload
      });
      this.state.events = this.state.events.slice(0, this.maxEvents);
      this.persistState();
    }

    loadState() {
      try {
        const raw = window.localStorage.getItem(this.storageKey);
        if (!raw) return;
        const parsed = JSON.parse(raw);
        if (!parsed || typeof parsed !== 'object') return;
        this.state = {
          ...this.defaultState(),
          ...parsed,
          weights: { ...this.defaultState().weights, ...(parsed.weights || {}) },
          seeds: Array.isArray(parsed.seeds) ? parsed.seeds : [],
          scores: Array.isArray(parsed.scores) ? parsed.scores : [],
          events: Array.isArray(parsed.events) ? parsed.events : []
        };
      } catch (error) {
        this.state = this.defaultState();
        this.logEvent('storage_load_failed', { message: error.message });
      }
    }

    persistState() {
      try {
        window.localStorage.setItem(this.storageKey, JSON.stringify(this.state));
      } catch (error) {
        // Storage may be blocked by browser settings; keep runtime state alive.
      }
    }

    syncFormFromState() {
      this.dom.growthFocus.value = this.state.growthFocus;
      this.dom.tickMs.value = String(this.state.tickMs);
      this.dom.weightClarity.value = String(this.state.weights.clarity);
      this.dom.weightViability.value = String(this.state.weights.viability);
      this.dom.weightGrowth.value = String(this.state.weights.growth);
      this.dom.seedInput.value = JSON.stringify(this.state.seeds, null, 2);
    }

    resetToDemo() {
      this.stopSimulation();
      this.state = this.defaultState();
      this.state.seeds = [...this.demoSeeds];
      this.syncFormFromState();
      this.computeScores();
      this.logEvent('demo_reset', { count: this.state.seeds.length });
      this.persistState();
      this.render();
    }

    downloadSnapshot() {
      const snapshot = this.getSnapshot();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'seed-quality-scorer-snapshot.json';
      link.click();
      URL.revokeObjectURL(link.href);
      this.logEvent('snapshot_exported');
      this.render();
    }

    render() {
      const avg = this.state.scores.length
        ? this.state.scores.reduce((sum, item) => sum + item.totalScore, 0) / this.state.scores.length
        : 0;

      this.dom.tickCount.textContent = String(this.state.tick);
      this.dom.engineStatus.textContent = this.state.status;
      this.dom.seedCount.textContent = String(this.state.seeds.length);
      this.dom.avgScore.textContent = avg.toFixed(1);
      this.dom.topTier.textContent = this.state.scores[0]?.qualityTier || '-';
      this.dom.snapshotOutput.textContent = JSON.stringify(this.getSnapshot(), null, 2);
      this.dom.eventLogOutput.textContent = JSON.stringify(this.state.events, null, 2);
    }

    clamp(value, min, max) {
      if (Number.isNaN(value)) return min;
      return Math.min(max, Math.max(min, value));
    }
  }

  const app = new SeedQualityScorerEngine();
  app.init();
})();
