import React from 'react';

interface StartScreenProps {
  onStart: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-[#000010]/90">
      <div className="text-center px-4 max-w-lg">
        <h1 className="font-game-title text-4xl md:text-6xl font-black text-[var(--game-cyan)] animate-glitch mb-2 tracking-wider">
          PROJECT SHIELD
        </h1>
        <p className="font-game-title text-lg md:text-xl text-[var(--game-orange)] mb-8 tracking-widest">
          Crisis del Proyecto
        </p>

        <div className="neon-border rounded-lg p-4 mb-8 bg-[#000020]/80 text-left font-game-body text-sm md:text-base text-[var(--game-text)]">
          <p className="mb-2 font-semibold text-[var(--game-cyan)]">🎮 Controles:</p>
          <p className="mb-1 hidden md:block">← → Mover nave &nbsp;|&nbsp; ESPACIO Disparar</p>
          <p className="mb-1 md:hidden">Usa los botones en pantalla para moverte y disparar</p>
          <hr className="border-[var(--game-cyan)]/20 my-2" />
          <p className="mb-1">☄️ Destruye asteroides para proteger tu proyecto</p>
          <p className="mb-1">🔵 Los asteroides azules activan preguntas especiales</p>
          <p>🏆 ¡Sobrevive 3 minutos para completar la misión!</p>
        </div>

        <button
          onClick={onStart}
          className="game-button px-8 py-4 rounded-lg text-lg md:text-xl font-game-title tracking-wider"
        >
          INICIAR MISIÓN
        </button>
      </div>
    </div>
  );
};

export default StartScreen;
