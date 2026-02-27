const MODES = ['normal', 'rainy', 'snow', 'cloudy']
export const WEATHER_MODE = MODES[Math.floor(Math.random() * MODES.length)]
// export const WEATHER_MODE = 'rainy'
console.log('Weather mode:', WEATHER_MODE)
