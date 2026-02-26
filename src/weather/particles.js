export function createRainDrops(count = 220) {
  const drops = []
  for (let i = 0; i < count; i++) {
    drops.push({
      x: Math.random(),
      y: Math.random(),
      length: 18 + Math.random() * 22,
      speed: 0.004 + Math.random() * 0.006,
      opacity: 0.35 + Math.random() * 0.45,
      width: 0.5 + Math.random() * 0.5,
    })
  }
  return drops
}

export function createSnowFlakes(count = 180) {
  const flakes = []
  for (let i = 0; i < count; i++) {
    flakes.push({
      x: Math.random(),
      y: Math.random(),
      radius: 1.5 + Math.random() * 3,
      speedY: 0.0008 + Math.random() * 0.002,
      speedX: (Math.random() - 0.5) * 0.001,
      opacity: 0.5 + Math.random() * 0.5,
      wobble: Math.random() * Math.PI * 2,
    })
  }
  return flakes
}