export const WEATHER_MODES = ['normal', 'rainy', 'snow', 'cloudy']

// Default mode used on first load (still randomized here, but only once,
// and now it's just an initial value — not a fixed constant used everywhere)
export function getRandomWeatherMode() {
  return WEATHER_MODES[Math.floor(Math.random() * WEATHER_MODES.length)]
}