import React from 'react';

interface ControlsProps {
  onLeftStart: () => void;
  onLeftEnd: () => void;
  onRightStart: () => void;
  onRightEnd: () => void;
  onShoot: () => void;
}

const Controls: React.FC<ControlsProps> = ({ onLeftStart, onLeftEnd, onRightStart, onRightEnd, onShoot }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-between items-end p-3 md:hidden pointer-events-auto" style={{ height: '140px', backgroundColor: 'rgba(0, 0, 20, 0.85)' }}>
      <button
        onTouchStart={(e) => { e.preventDefault(); onLeftStart(); }}
        onTouchEnd={(e) => { e.preventDefault(); onLeftEnd(); }}
        onMouseDown={onLeftStart}
        onMouseUp={onLeftEnd}
        className="game-button w-[70px] h-[70px] rounded-xl text-2xl font-bold active:scale-110 transition-transform select-none"
      >
        ◀
      </button>

      <button
        onTouchStart={(e) => { e.preventDefault(); onShoot(); }}
        onMouseDown={onShoot}
        className="game-button-orange game-button w-[80px] h-[80px] rounded-full text-2xl font-bold active:scale-110 transition-transform select-none mb-2"
      >
        🔥
      </button>

      <button
        onTouchStart={(e) => { e.preventDefault(); onRightStart(); }}
        onTouchEnd={(e) => { e.preventDefault(); onRightEnd(); }}
        onMouseDown={onRightStart}
        onMouseUp={onRightEnd}
        className="game-button w-[70px] h-[70px] rounded-xl text-2xl font-bold active:scale-110 transition-transform select-none"
      >
        ▶
      </button>
    </div>
  );
};

export default Controls;
