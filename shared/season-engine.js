(() => {
  const STORAGE_KEY = 'orchard.season.v1';
  const WEATHER = [
    { name: 'Sunny', emoji: '☀️' },
    { name: 'Cloudy', emoji: '☁️' },
    { name: 'Rain', emoji: '🌧️' },
    { name: 'Windy', emoji: '🌬️' }
  ];

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { day: 1 };
      return { day: 1, ...JSON.parse(raw) };
    } catch (_error) {
      return { day: 1 };
    }
  }

  const state = load();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getTodayWeather() {
    const weather = WEATHER[(state.day - 1) % WEATHER.length];
    return { day: state.day, weather };
  }

  function advanceDay() {
    state.day += 1;
    save();
    const today = getTodayWeather();
    window.dispatchEvent(new CustomEvent('season:day_advanced', { detail: { day: today.day, weather: today.weather } }));
    return today;
  }

  window.SeasonEngine = { getTodayWeather, advanceDay };
})();
