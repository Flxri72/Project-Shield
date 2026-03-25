import React from 'react';

interface UIOverlayProps {
  bars: { tiempo: number; costo: number; calidad: number };
  score: number;
  multiplier: number;
  power: { type: string | null; endTime: number };
  elapsedTime: number;
}

const BarDisplay: React.FC<{ label: string; icon: string; value: number; color: string }> = ({ label, icon, value, color }) => {
  const critical = value <= 30;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-game-body whitespace-nowrap">{icon}</span>
      <div className="flex-1 h-3.5 rounded-full overflow-hidden bg-[#111]/80 border" style={{ borderColor: color + '66' }}>
        <div
          className={`h-full rounded-full transition-all duration-300 ${critical ? 'animate-bar-pulse' : ''}`}
          style={{
            width: `${Math.max(0, value)}%`,
            background: `linear-gradient(90deg, ${color}, ${color}88)`,
          }}
        />
      </div>
      <span className="text-xs font-game-title w-7 text-right" style={{ color }}>{Math.floor(value)}</span>
    </div>
  );
};

const UIOverlay: React.FC<UIOverlayProps> = ({ bars, score, multiplier, power, elapsedTime }) => {
  const timeRemaining = Math.max(0, 180 - elapsedTime);
  const mins = Math.floor(timeRemaining / 60);
  const secs = Math.floor(timeRemaining % 60);

  const powerIcons: Record<string, string> = {
    doubleshoot: '⚡',
    shield: '🛡️',
    slowmo: '⏱️',
  };

  const now = Date.now();
  const powerTimeLeft = power.type ? Math.max(0, Math.ceil((power.endTime - now) / 1000)) : 0;

  return (
    <div className="absolute top-0 left-0 right-0 z-10 pointer-events-none p-2 md:p-3">
      <div className="flex justify-between items-start gap-2">
        {/* Left: bars */}
        <div className="flex-1 max-w-[200px] md:max-w-[240px] space-y-1">
          <BarDisplay label="Alcance" icon="🕐" value={bars.tiempo} color="#FF6B35" />
          <BarDisplay label="Cronograma" icon="💰" value={bars.costo} color="#FFD700" />
          <BarDisplay label="Calidad" icon="⭐" value={bars.calidad} color="#00FF88" />
          {power.type && powerTimeLeft > 0 && (
            <div className="text-xs font-game-title text-[var(--game-cyan)] mt-1">
              {powerIcons[power.type] || '?'} {powerTimeLeft}s
            </div>
          )}
        </div>

        {/* Right: score & timer */}
        <div className="text-right">
          <p className="font-game-title text-xs md:text-sm text-[var(--game-cyan)]">
            {Math.floor(score)}
          </p>
          <p className="font-game-title text-[10px] text-[var(--game-text-dim)]">
            x{multiplier.toFixed(1)}
          </p>
          <p className="font-game-title text-xs text-[var(--game-orange)] mt-1">
            {mins}:{secs.toString().padStart(2, '0')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
