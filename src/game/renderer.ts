import type { Star, Ship, Projectile, Asteroid, Particle, PowerUp } from './entities';

export function renderBackground(
  ctx: CanvasRenderingContext2D,
  stars: Star[],
  canvasW: number,
  canvasH: number
) {
  ctx.fillStyle = '#000010';
  ctx.fillRect(0, 0, canvasW, canvasH);

  for (const s of stars) {
    ctx.globalAlpha = s.brightness;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function renderShip(
  ctx: CanvasRenderingContext2D,
  ship: Ship,
  shipImg: HTMLImageElement | null,
  hasShield: boolean,
  glowPhase: number
) {
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.tilt);

  // Glow
  const glowSize = 15 + Math.sin(glowPhase) * 5;
  ctx.shadowBlur = glowSize;
  ctx.shadowColor = '#88CCFF';

  if (shipImg && shipImg.complete && shipImg.naturalWidth > 0) {
    ctx.drawImage(shipImg, -ship.width / 2, -ship.height / 2, ship.width, ship.height);
  } else {
    // Fallback
    ctx.fillStyle = '#CCCCCC';
    ctx.beginPath();
    ctx.moveTo(0, -ship.height / 2);
    ctx.lineTo(-ship.width / 2, ship.height / 2);
    ctx.lineTo(ship.width / 2, ship.height / 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.shadowBlur = 0;

  // Shield ring
  if (hasShield) {
    const shieldGlow = 15 + Math.sin(glowPhase * 2) * 10;
    ctx.strokeStyle = '#4488FF';
    ctx.lineWidth = 3;
    ctx.shadowBlur = shieldGlow;
    ctx.shadowColor = '#4488FF';
    ctx.beginPath();
    ctx.arc(0, 0, ship.radius + 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  ctx.restore();
}

export function renderProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]) {
  for (const p of projectiles) {
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00FFFF';
    ctx.strokeStyle = '#00FFFF';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y + 12);
    ctx.stroke();

    ctx.shadowBlur = 6;
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y + 2);
    ctx.lineTo(p.x, p.y + 10);
    ctx.stroke();
    ctx.restore();
  }
}

export function renderAsteroids(
  ctx: CanvasRenderingContext2D,
  asteroids: Asteroid[],
  normalImg: HTMLImageElement | null,
  specialImg: HTMLImageElement | null
) {
  for (const a of asteroids) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.rotation);

    if (a.type === 'special') {
      const glow = 10 + Math.sin(a.glowPhase) * 15;
      ctx.shadowBlur = glow;
      ctx.shadowColor = '#00FFFF';
    }

    const img = a.type === 'special' ? specialImg : normalImg;
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, -a.size / 2, -a.size / 2, a.size, a.size);
    } else {
      ctx.fillStyle = a.type === 'special' ? '#4488FF' : '#AA6633';
      ctx.beginPath();
      ctx.arc(0, 0, a.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}

export function renderParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.shadowBlur = 8;
    ctx.shadowColor = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
}

export function renderSlowMoOverlay(ctx: CanvasRenderingContext2D, canvasW: number, canvasH: number) {
  const gradient = ctx.createRadialGradient(canvasW / 2, canvasH / 2, canvasW * 0.3, canvasW / 2, canvasH / 2, canvasW * 0.7);
  gradient.addColorStop(0, 'rgba(189, 0, 255, 0)');
  gradient.addColorStop(1, 'rgba(189, 0, 255, 0.15)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasW, canvasH);
}

export function updateStars(stars: Star[], canvasH: number, canvasW: number) {
  for (const s of stars) {
    s.y += s.speed;
    if (s.y > canvasH) {
      s.y = 0;
      s.x = Math.random() * canvasW;
    }
  }
}
