import React from 'react';

interface GameOverProps {
  victory: boolean;
  score: number;
  bars: { tiempo: number; costo: number; calidad: number };
  correctAnswers: number;
  totalAnswered: number;
  onRestart: () => void;
  onMenu: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ victory, score, bars, correctAnswers, totalAnswered, onRestart, onMenu }) => {
  return (
    <div className={`absolute inset-0 flex items-center justify-center z-30 ${victory ? 'bg-[#002200]/85' : 'bg-[#220000]/85'}`}>
      <div className="text-center px-4 max-w-md w-full">
        <h2 className={`font-game-title text-3xl md:text-5xl font-black mb-4 tracking-wider ${victory ? 'text-[var(--game-green)] animate-glow-pulse' : 'text-red-500 animate-glitch'}`}>
          {victory ? 'MISIÓN CUMPLIDA 🏆' : 'MISIÓN FALLIDA'}
        </h2>

        <div className="neon-border rounded-lg p-4 mb-6 bg-[#000020]/80 font-game-body">
          <p className="text-2xl font-game-title text-[var(--game-cyan)] mb-4">
            Score: {Math.floor(score)}
          </p>
          <div className="space-y-2 text-sm text-[var(--game-text)]">
            <div className="flex justify-between">
              <span>🕐 Tiempo:</span>
              <span className={bars.tiempo <= 0 ? 'text-red-500 font-bold' : ''}>{Math.floor(bars.tiempo)}</span>
            </div>
            <div className="flex justify-between">
              <span>💰 Costo:</span>
              <span className={bars.costo <= 0 ? 'text-red-500 font-bold' : ''}>{Math.floor(bars.costo)}</span>
            </div>
            <div className="flex justify-between">
              <span>⭐ Calidad:</span>
              <span className={bars.calidad <= 0 ? 'text-red-500 font-bold' : ''}>{Math.floor(bars.calidad)}</span>
            </div>
            <hr className="border-[var(--game-cyan)]/20 my-2" />
            <div className="flex justify-between">
              <span>Respuestas correctas:</span>
              <span>{correctAnswers}/{totalAnswered}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button onClick={onRestart} className="game-button px-6 py-3 rounded-lg font-game-title text-sm tracking-wider">
            REINTENTAR
          </button>
          <button onClick={onMenu} className="game-button-orange game-button px-6 py-3 rounded-lg font-game-title text-sm tracking-wider">
            MENÚ
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOver;
