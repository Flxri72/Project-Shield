import React, { useRef, useEffect, useState, useCallback } from 'react';
import { createInitialState, createAsteroid, type GameState } from '@/game/entities';
import { updateProjectiles, updateAsteroids, updateParticles, checkAllCollisions } from '@/game/physics';
import { renderBackground, renderShip, renderProjectiles, renderAsteroids, renderParticles, renderSlowMoOverlay, updateStars } from '@/game/renderer';
import { getRandomQuestion, type Question } from '@/game/questions';
import { playShoot, playExplosion, playSpecialExplosion, playPowerUp, playDamage, playGameOver, initAudio } from '@/game/audio';
import UIOverlay from './UIOverlay';
import Controls from './Controls';
import QuestionModal from './QuestionModal';
import StartScreen from './StartScreen';
import GameOver from './GameOver';

import naveImg from '@/assets/nave.png';
import asteroideFuegoImg from '@/assets/asteroide-fuego.png';
import asteroideAzulImg from '@/assets/asteroide-azul.png';

const VICTORY_TIME = 180; // 3 minutes

const GameCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState | null>(null);
  const animFrameRef = useRef<number>(0);
  const inputRef = useRef({ left: false, right: false, shoot: false });
  const imagesRef = useRef<{ ship: HTMLImageElement | null; normal: HTMLImageElement | null; special: HTMLImageElement | null }>({ ship: null, normal: null, special: null });
  const glowPhaseRef = useRef(0);
  const lastTimestampRef = useRef(0);
  const hudIntervalRef = useRef<number>(0);

  const [screen, setScreen] = useState<'start' | 'playing' | 'question' | 'gameover'>('start');
  const [hudBars, setHudBars] = useState({ tiempo: 100, costo: 100, calidad: 100 });
  const [hudScore, setHudScore] = useState(0);
  const [hudMultiplier, setHudMultiplier] = useState(1);
  const [hudPower, setHudPower] = useState<{ type: string | null; endTime: number }>({ type: null, endTime: 0 });
  const [hudElapsed, setHudElapsed] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [gameResult, setGameResult] = useState<{ victory: boolean; score: number; bars: any; correct: number; total: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 480, h: 800 });

  // Calculate canvas size
  useEffect(() => {
    const updateSize = () => {
      const isMobile = window.innerWidth < 768;
      if (isMobile) {
        // Reserve 140px for mobile controls at bottom
        const h = Math.max(window.innerHeight - 140, 400);
        setCanvasSize({ w: window.innerWidth, h });
      } else {
        setCanvasSize({ w: 480, h: 800 });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Preload images
  useEffect(() => {
    const ship = new Image(); ship.src = naveImg;
    const normal = new Image(); normal.src = asteroideFuegoImg;
    const special = new Image(); special.src = asteroideAzulImg;
    imagesRef.current = { ship, normal, special };
  }, []);

  // Keyboard input
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') inputRef.current.left = true;
      if (e.key === 'ArrowRight') inputRef.current.right = true;
      if (e.key === ' ') { e.preventDefault(); inputRef.current.shoot = true; }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') inputRef.current.left = false;
      if (e.key === 'ArrowRight') inputRef.current.right = false;
      if (e.key === ' ') inputRef.current.shoot = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp); };
  }, []);

  // HUD sync
  useEffect(() => {
    if (screen === 'playing') {
      hudIntervalRef.current = window.setInterval(() => {
        const s = stateRef.current;
        if (!s) return;
        setHudBars({ ...s.bars });
        setHudScore(s.score);
        setHudMultiplier(s.multiplier);
        setHudPower({ type: s.power.type, endTime: s.power.endTime });
        setHudElapsed(s.elapsedTime);
      }, 100);
    }
    return () => clearInterval(hudIntervalRef.current);
  }, [screen]);

  const shoot = useCallback(() => {
    const s = stateRef.current;
    if (!s || s.paused || s.gameOver) return;
    const now = Date.now();
    if (now - s.lastShotTime < 300) return;
    s.lastShotTime = now;
    const isDouble = s.power.type === 'doubleshoot' && now < s.power.endTime;
    if (isDouble) {
      s.projectiles.push({ x: s.ship.x - 8, y: s.ship.y - 30, speed: 10, radius: 4, isDouble: true });
      s.projectiles.push({ x: s.ship.x + 8, y: s.ship.y - 30, speed: 10, radius: 4, isDouble: true });
    } else {
      s.projectiles.push({ x: s.ship.x, y: s.ship.y - 30, speed: 10, radius: 4, isDouble: false });
    }
    playShoot();
  }, []);

  const startGame = useCallback(() => {
    initAudio();
    const s = createInitialState(canvasSize.w, canvasSize.h);
    s.started = true;
    s.startTime = Date.now();
    stateRef.current = s;
    lastTimestampRef.current = 0;
    setScreen('playing');
    setGameResult(null);

    const gameLoop = (timestamp: number) => {
      const state = stateRef.current;
      if (!state || state.paused || state.gameOver || state.victory) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const d = window.devicePixelRatio || 1;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      const cw = canvasSize.w;
      const ch = canvasSize.h;
      const now = Date.now();

      state.elapsedTime = (now - state.startTime) / 1000;

      // Victory check
      if (state.elapsedTime >= VICTORY_TIME) {
        state.victory = true;
        setGameResult({ victory: true, score: state.score, bars: { ...state.bars }, correct: state.correctAnswers, total: state.totalAnswered });
        setScreen('gameover');
        return;
      }

      // Multiplier
      if (now - state.lastMultiplierTime > 30000) {
        state.multiplier += 0.1;
        state.lastMultiplierTime = now;
      }

      // Power expiration
      if (state.power.type && now > state.power.endTime) {
        state.power = { type: null, endTime: 0 };
      }

      const slowFactor = state.power.type === 'slowmo' && now < state.power.endTime ? 0.3 : 1;

      // Input
      const ship = state.ship;
      if (inputRef.current.left) {
        ship.x = Math.max(ship.width / 2, ship.x - 5);
        ship.targetTilt = -0.17;
      } else if (inputRef.current.right) {
        ship.x = Math.min(cw - ship.width / 2, ship.x + 5);
        ship.targetTilt = 0.17;
      } else {
        ship.targetTilt = 0;
      }
      ship.tilt += (ship.targetTilt - ship.tilt) * 0.15;
      // Ensure ship doesn't go below safe zone (40px from bottom)
      ship.y = Math.min(ch - 40, ship.y);

      // Auto-shoot for mobile continuous fire
      if (inputRef.current.shoot) {
        shoot();
      }

      // Spawn asteroids
      const difficulty = state.elapsedTime / 60;
      const spawnInterval = Math.max(800, 2000 - difficulty * 600);
      if (now - state.lastAsteroidSpawn > spawnInterval) {
        state.asteroids.push(createAsteroid(cw, 'normal', difficulty));
        state.lastAsteroidSpawn = now;
      }

      // Spawn special
      const specialInterval = 15000 + Math.random() * 5000;
      if (!state.specialActive && now - state.lastSpecialSpawn > specialInterval) {
        state.asteroids.push(createAsteroid(cw, 'special', 0));
        state.specialActive = true;
        state.lastSpecialSpawn = now;
      }

      // Update
      state.projectiles = updateProjectiles(state.projectiles, ch);
      const asteroidResult = updateAsteroids(state.asteroids, ch, cw, slowFactor, 1);
      state.asteroids = asteroidResult.asteroids;

      // Escaped asteroids damage bars
      for (const escaped of asteroidResult.escaped) {
        const barKeys: ('tiempo' | 'costo' | 'calidad')[] = ['tiempo', 'costo', 'calidad'];
        const key = barKeys[Math.floor(Math.random() * 3)];
        state.bars[key] = Math.max(0, state.bars[key] - 10);
        playDamage();
      }

      state.particles = updateParticles(state.particles);
      updateStars(state.stars, ch, cw);

      // Collisions
      const hasShield = state.power.type === 'shield' && now < state.power.endTime;
      const collision = checkAllCollisions(state, hasShield);
      state.projectiles = collision.projectiles;
      state.asteroids = collision.asteroids;
      state.particles.push(...collision.newParticles);
      state.score += collision.scoreGain * state.multiplier;

      if (collision.hitSpecial) {
        state.specialActive = false;
        playSpecialExplosion();
        // Trigger question
        const q = getRandomQuestion(state.questionsUsed);
        if (q) {
          state.paused = true;
          setCurrentQuestion(q);
          setScreen('question');
          return;
        }
      } else if (collision.scoreGain > 0) {
        playExplosion();
      }

      if (collision.shipHit) {
        for (const key of collision.barDamage) {
          state.bars[key] = Math.max(0, state.bars[key] - 15);
        }
        playDamage();
      }

      // Game over check
      if (state.bars.tiempo <= 0 || state.bars.costo <= 0 || state.bars.calidad <= 0) {
        state.gameOver = true;
        playGameOver();
        setGameResult({ victory: false, score: state.score, bars: { ...state.bars }, correct: state.correctAnswers, total: state.totalAnswered });
        setScreen('gameover');
        return;
      }

      // Render
      glowPhaseRef.current += 0.05;
      renderBackground(ctx, state.stars, cw, ch);
      renderProjectiles(ctx, state.projectiles);
      renderAsteroids(ctx, state.asteroids, imagesRef.current.normal, imagesRef.current.special);
      renderShip(ctx, ship, imagesRef.current.ship, hasShield, glowPhaseRef.current);
      renderParticles(ctx, state.particles);

      if (state.power.type === 'slowmo' && now < state.power.endTime) {
        renderSlowMoOverlay(ctx, cw, ch);
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [canvasSize, shoot]);

  const resumeGame = useCallback(() => {
    const state = stateRef.current;
    if (!state) return;
    state.paused = false;
    setScreen('playing');
    setCurrentQuestion(null);

    const gameLoop = (timestamp: number) => {
      const st = stateRef.current;
      if (!st || st.paused || st.gameOver || st.victory) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const d = window.devicePixelRatio || 1;
      ctx.setTransform(d, 0, 0, d, 0, 0);
      const cw = canvasSize.w;
      const ch = canvasSize.h;
      const now = Date.now();

      st.elapsedTime = (now - st.startTime) / 1000;

      if (st.elapsedTime >= VICTORY_TIME) {
        st.victory = true;
        setGameResult({ victory: true, score: st.score, bars: { ...st.bars }, correct: st.correctAnswers, total: st.totalAnswered });
        setScreen('gameover');
        return;
      }

      if (now - st.lastMultiplierTime > 30000) {
        st.multiplier += 0.1;
        st.lastMultiplierTime = now;
      }

      if (st.power.type && now > st.power.endTime) {
        st.power = { type: null, endTime: 0 };
      }

      const slowFactor = st.power.type === 'slowmo' && now < st.power.endTime ? 0.3 : 1;

      const ship = st.ship;
      if (inputRef.current.left) {
        ship.x = Math.max(ship.width / 2, ship.x - 5);
        ship.targetTilt = -0.17;
      } else if (inputRef.current.right) {
        ship.x = Math.min(cw - ship.width / 2, ship.x + 5);
        ship.targetTilt = 0.17;
      } else {
        ship.targetTilt = 0;
      }
      ship.tilt += (ship.targetTilt - ship.tilt) * 0.15;
      // Ensure ship doesn't go below safe zone (40px from bottom)
      ship.y = Math.min(ch - 40, ship.y);

      if (inputRef.current.shoot) shoot();

      const difficulty = st.elapsedTime / 60;
      const spawnInterval = Math.max(800, 2000 - difficulty * 600);
      if (now - st.lastAsteroidSpawn > spawnInterval) {
        st.asteroids.push(createAsteroid(cw, 'normal', difficulty));
        st.lastAsteroidSpawn = now;
      }

      const specialInterval = 15000 + Math.random() * 5000;
      if (!st.specialActive && now - st.lastSpecialSpawn > specialInterval) {
        st.asteroids.push(createAsteroid(cw, 'special', 0));
        st.specialActive = true;
        st.lastSpecialSpawn = now;
      }

      st.projectiles = updateProjectiles(st.projectiles, ch);
      const asteroidResult = updateAsteroids(st.asteroids, ch, cw, slowFactor, 1);
      st.asteroids = asteroidResult.asteroids;

      for (const escaped of asteroidResult.escaped) {
        const barKeys: ('tiempo' | 'costo' | 'calidad')[] = ['tiempo', 'costo', 'calidad'];
        const key = barKeys[Math.floor(Math.random() * 3)];
        st.bars[key] = Math.max(0, st.bars[key] - 10);
        playDamage();
      }

      st.particles = updateParticles(st.particles);
      updateStars(st.stars, ch, cw);

      const hasShield = st.power.type === 'shield' && now < st.power.endTime;
      const collision = checkAllCollisions(st, hasShield);
      st.projectiles = collision.projectiles;
      st.asteroids = collision.asteroids;
      st.particles.push(...collision.newParticles);
      st.score += collision.scoreGain * st.multiplier;

      if (collision.hitSpecial) {
        st.specialActive = false;
        playSpecialExplosion();
        const q = getRandomQuestion(st.questionsUsed);
        if (q) {
          st.paused = true;
          setCurrentQuestion(q);
          setScreen('question');
          return;
        }
      } else if (collision.scoreGain > 0) {
        playExplosion();
      }

      if (collision.shipHit) {
        for (const key of collision.barDamage) {
          st.bars[key] = Math.max(0, st.bars[key] - 15);
        }
        playDamage();
      }

      if (st.bars.tiempo <= 0 || st.bars.costo <= 0 || st.bars.calidad <= 0) {
        st.gameOver = true;
        playGameOver();
        setGameResult({ victory: false, score: st.score, bars: { ...st.bars }, correct: st.correctAnswers, total: st.totalAnswered });
        setScreen('gameover');
        return;
      }

      glowPhaseRef.current += 0.05;
      renderBackground(ctx, st.stars, cw, ch);
      renderProjectiles(ctx, st.projectiles);
      renderAsteroids(ctx, st.asteroids, imagesRef.current.normal, imagesRef.current.special);
      renderShip(ctx, ship, imagesRef.current.ship, hasShield, glowPhaseRef.current);
      renderParticles(ctx, st.particles);

      if (st.power.type === 'slowmo' && now < st.power.endTime) {
        renderSlowMoOverlay(ctx, cw, ch);
      }

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [shoot]);

  const handleAnswer = useCallback((correct: boolean) => {
    const state = stateRef.current;
    if (!state || !currentQuestion) return;

    state.questionsUsed.add(currentQuestion.id);
    state.totalAnswered++;

    if (correct) {
      state.correctAnswers++;
      state.score += 100 * state.multiplier;
      const reward = currentQuestion.reward;
      if (reward.bars.tiempo) state.bars.tiempo = Math.min(100, state.bars.tiempo + reward.bars.tiempo);
      if (reward.bars.costo) state.bars.costo = Math.min(100, state.bars.costo + reward.bars.costo);
      if (reward.bars.calidad) state.bars.calidad = Math.min(100, state.bars.calidad + reward.bars.calidad);
      state.power = { type: reward.power, endTime: Date.now() + reward.powerDuration };
      playPowerUp();
    }

    resumeGame();
  }, [currentQuestion, resumeGame]);

  const handleRestart = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    startGame();
  }, [startGame]);

  const handleMenu = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    setScreen('start');
  }, []);

  // Render background stars on start screen
  useEffect(() => {
    if (screen !== 'start') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.5 + 0.2,
      brightness: Math.random() * 0.5 + 0.3,
    }));

    let anim: number;
    const draw = () => {
      ctx.fillStyle = '#000010';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.y += s.speed;
        if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
        ctx.globalAlpha = s.brightness;
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      anim = requestAnimationFrame(draw);
    };
    anim = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(anim);
  }, [screen, canvasSize]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      clearInterval(hudIntervalRef.current);
    };
  }, []);

  const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

  return (
    <>
      <div className="game-container relative flex items-center justify-center w-full bg-[#000010] overflow-hidden" style={{ height: window.innerWidth < 768 ? `calc(100vh - 140px)` : '100vh' }}>
        <div className="relative" style={{ width: canvasSize.w, height: canvasSize.h }}>
          <canvas
            ref={canvasRef}
            width={canvasSize.w * dpr}
            height={canvasSize.h * dpr}
            style={{ width: canvasSize.w, height: canvasSize.h, touchAction: 'none' }}
            className="block"
          />

          {screen === 'start' && <StartScreen onStart={startGame} />}

          {screen === 'playing' && (
            <>
              <UIOverlay bars={hudBars} score={hudScore} multiplier={hudMultiplier} power={hudPower} elapsedTime={hudElapsed} />
            </>
          )}

          {screen === 'question' && currentQuestion && (
            <QuestionModal question={currentQuestion} onAnswer={handleAnswer} />
          )}

          {screen === 'gameover' && gameResult && (
            <GameOver
              victory={gameResult.victory}
              score={gameResult.score}
              bars={gameResult.bars}
              correctAnswers={gameResult.correct}
              totalAnswered={gameResult.total}
              onRestart={handleRestart}
              onMenu={handleMenu}
            />
          )}
        </div>
      </div>
      {screen === 'playing' && (
        <Controls
          onLeftStart={() => { inputRef.current.left = true; }}
          onLeftEnd={() => { inputRef.current.left = false; }}
          onRightStart={() => { inputRef.current.right = true; }}
          onRightEnd={() => { inputRef.current.right = false; }}
          onShoot={shoot}
        />
      )}
    </>
  );
};

export default GameCanvas;
