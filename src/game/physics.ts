import type { Ship, Projectile, Asteroid, Particle, GameState } from './entities';
import { createExplosion } from './entities';

export function checkCircleCollision(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number
): boolean {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const dist = Math.sqrt(dx * dx + dy * dy);
  return dist < r1 + r2;
}

export function updateProjectiles(projectiles: Projectile[], canvasH: number): Projectile[] {
  return projectiles
    .map(p => ({ ...p, y: p.y - p.speed }))
    .filter(p => p.y > -20);
}

export function updateAsteroids(
  asteroids: Asteroid[],
  canvasH: number,
  canvasW: number,
  slowFactor: number,
  dt: number
): { asteroids: Asteroid[]; escaped: Asteroid[] } {
  const remaining: Asteroid[] = [];
  const escaped: Asteroid[] = [];

  for (const a of asteroids) {
    const na = {
      ...a,
      x: a.x + a.speedX * slowFactor,
      y: a.y + a.speedY * slowFactor,
      rotation: a.rotation + a.rotationSpeed * slowFactor,
      glowPhase: a.glowPhase + 0.05,
    };
    if (na.y > canvasH + 40) {
      if (na.type === 'normal') escaped.push(na);
    } else {
      if (na.x < -40 || na.x > canvasW + 40) continue;
      remaining.push(na);
    }
  }

  return { asteroids: remaining, escaped };
}

export function updateParticles(particles: Particle[]): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx,
      y: p.y + p.vy,
      life: p.life - 1,
      vx: p.vx * 0.98,
      vy: p.vy * 0.98,
    }))
    .filter(p => p.life > 0);
}

export interface CollisionResult {
  projectiles: Projectile[];
  asteroids: Asteroid[];
  newParticles: Particle[];
  scoreGain: number;
  hitSpecial: boolean;
  shipHit: boolean;
  barDamage: ('tiempo' | 'costo' | 'calidad')[];
}

export function checkAllCollisions(
  state: GameState,
  hasShield: boolean
): CollisionResult {
  const result: CollisionResult = {
    projectiles: [...state.projectiles],
    asteroids: [...state.asteroids],
    newParticles: [],
    scoreGain: 0,
    hitSpecial: false,
    shipHit: false,
    barDamage: [],
  };

  // Projectile vs asteroid
  const projToRemove = new Set<number>();
  const astToRemove = new Set<number>();

  for (let pi = 0; pi < result.projectiles.length; pi++) {
    const p = result.projectiles[pi];
    for (let ai = 0; ai < result.asteroids.length; ai++) {
      if (astToRemove.has(ai)) continue;
      const a = result.asteroids[ai];
      if (checkCircleCollision(p.x, p.y, p.radius, a.x, a.y, a.radius)) {
        projToRemove.add(pi);
        astToRemove.add(ai);
        const color = a.type === 'special' ? '#00FFFF' : '#FF6B35';
        result.newParticles.push(...createExplosion(a.x, a.y, color));
        result.scoreGain += a.type === 'special' ? 50 : 10;
        if (a.type === 'special') result.hitSpecial = true;
      }
    }
  }

  result.projectiles = result.projectiles.filter((_, i) => !projToRemove.has(i));
  result.asteroids = result.asteroids.filter((_, i) => !astToRemove.has(i));

  // Ship vs asteroid
  const ship = state.ship;
  const astToRemove2 = new Set<number>();
  for (let ai = 0; ai < result.asteroids.length; ai++) {
    const a = result.asteroids[ai];
    if (checkCircleCollision(ship.x, ship.y, ship.radius, a.x, a.y, a.radius)) {
      astToRemove2.add(ai);
      if (hasShield) {
        result.newParticles.push(...createExplosion(a.x, a.y, '#4444FF'));
      } else {
        result.shipHit = true;
        const bars: ('tiempo' | 'costo' | 'calidad')[] = ['tiempo', 'costo', 'calidad'];
        result.barDamage.push(bars[Math.floor(Math.random() * 3)]);
        result.newParticles.push(...createExplosion(a.x, a.y, '#FF0000'));
      }
    }
  }
  result.asteroids = result.asteroids.filter((_, i) => !astToRemove2.has(i));

  return result;
}
