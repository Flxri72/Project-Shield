export interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  brightness: number;
}

export interface Ship {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  tilt: number;
  targetTilt: number;
}

export interface Projectile {
  x: number;
  y: number;
  speed: number;
  radius: number;
  isDouble: boolean;
}

export interface Asteroid {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  size: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  type: 'normal' | 'special';
  glowPhase: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

export interface PowerUp {
  type: 'doubleshoot' | 'shield' | 'slowmo' | null;
  endTime: number;
}

export interface GameState {
  ship: Ship;
  projectiles: Projectile[];
  asteroids: Asteroid[];
  particles: Particle[];
  stars: Star[];
  bars: { tiempo: number; costo: number; calidad: number };
  score: number;
  multiplier: number;
  lastMultiplierTime: number;
  power: PowerUp;
  paused: boolean;
  gameOver: boolean;
  victory: boolean;
  started: boolean;
  elapsedTime: number;
  startTime: number;
  lastAsteroidSpawn: number;
  lastSpecialSpawn: number;
  specialActive: boolean;
  lastShotTime: number;
  questionsUsed: Set<number>;
  correctAnswers: number;
  totalAnswered: number;
}

export function createInitialState(canvasW: number, canvasH: number): GameState {
  const stars: Star[] = [];
  for (let i = 0; i < 100; i++) {
    stars.push({
      x: Math.random() * canvasW,
      y: Math.random() * canvasH,
      size: Math.random() * 1.5 + 0.5,
      speed: 0.3,
      brightness: Math.random() * 0.5 + 0.3,
    });
  }
  for (let i = 0; i < 60; i++) {
    stars.push({
      x: Math.random() * canvasW,
      y: Math.random() * canvasH,
      size: Math.random() * 2 + 1,
      speed: 0.8,
      brightness: Math.random() * 0.5 + 0.5,
    });
  }

  return {
    ship: {
      x: canvasW / 2,
      y: canvasH - 80,
      width: 64,
      height: 64,
      radius: 24,
      tilt: 0,
      targetTilt: 0,
    },
    projectiles: [],
    asteroids: [],
    particles: [],
    stars,
    bars: { tiempo: 100, costo: 100, calidad: 100 },
    score: 0,
    multiplier: 1,
    lastMultiplierTime: 0,
    power: { type: null, endTime: 0 },
    paused: false,
    gameOver: false,
    victory: false,
    started: false,
    elapsedTime: 0,
    startTime: 0,
    lastAsteroidSpawn: 0,
    lastSpecialSpawn: 0,
    specialActive: false,
    lastShotTime: 0,
    questionsUsed: new Set(),
    correctAnswers: 0,
    totalAnswered: 0,
  };
}

export function createAsteroid(canvasW: number, type: 'normal' | 'special', difficulty: number): Asteroid {
  const size = type === 'special' ? 56 : 48 + Math.random() * 24;
  const baseSpeed = type === 'special' ? 1 : 1.5 + Math.random() * 2 * (1 + difficulty * 0.3);
  return {
    x: Math.random() * (canvasW - size) + size / 2,
    y: -80,
    speedY: baseSpeed,
    speedX: type === 'special' ? 0 : (Math.random() - 0.5) * 1,
    size,
    radius: size / 2,
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.04,
    type,
    glowPhase: 0,
  };
}

export function createExplosion(x: number, y: number, color: string): Particle[] {
  const particles: Particle[] = [];
  const count = 20 + Math.floor(Math.random() * 10);
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 3 + 1;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 40,
      maxLife: 40,
      color,
      size: Math.random() * 4 + 1,
    });
  }
  return particles;
}
