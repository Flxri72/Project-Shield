import React, { useEffect, useState, useCallback } from 'react';
import type { Question } from '@/game/questions';

interface QuestionModalProps {
  question: Question;
  onAnswer: (correct: boolean) => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ question, onAnswer }) => {
  const [timeLeft, setTimeLeft] = useState(15);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; correct: boolean } | null>(null);

  useEffect(() => {
    if (answered) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAnswer(false, "¡Tiempo agotado!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [answered]);

  const handleAnswer = useCallback((correct: boolean, feedbackText: string) => {
    if (answered) return;
    setAnswered(true);
    setFeedback({ text: feedbackText, correct });
    setTimeout(() => onAnswer(correct), 2000);
  }, [answered, onAnswer]);

  const handleOptionA = () => {
    handleAnswer(question.optionA.correct, question.optionA.feedback);
  };

  const handleOptionB = () => {
    handleAnswer(question.optionB.correct, question.optionB.feedback);
  };

  const timerPercent = (timeLeft / 15) * 100;
  const timerColor = timeLeft > 10 ? '#00FF88' : timeLeft > 5 ? '#FFD700' : '#FF4444';

  return (
    <div className="absolute inset-0 flex items-center justify-center z-40 bg-[#000014]/85">
      <div className="neon-border rounded-xl p-5 md:p-6 bg-[#0a0a2a]/95 max-w-md w-[90%] mx-4">
        <p className="font-game-title text-[var(--game-cyan)] text-sm md:text-base mb-1 tracking-wider">
          ⚠️ CRISIS DETECTADA
        </p>

        {/* Timer bar */}
        <div className="w-full h-2 bg-[#111] rounded-full mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 linear"
            style={{ width: `${timerPercent}%`, backgroundColor: timerColor }}
          />
        </div>

        <p className="font-game-body text-[var(--game-text)] text-base md:text-lg mb-5 leading-relaxed">
          {question.situation}
        </p>

        {feedback ? (
          <div className={`rounded-lg p-4 text-center font-game-body ${feedback.correct ? 'bg-[#002200]/80 border border-[var(--game-green)]' : 'bg-[#220000]/80 border border-red-500'}`}>
            <p className={`text-lg font-bold mb-1 ${feedback.correct ? 'text-[var(--game-green)]' : 'text-red-400'}`}>
              {feedback.correct ? '✅ ¡Correcto!' : '❌ Incorrecto'}
            </p>
            <p className="text-sm text-[var(--game-text)]">{feedback.text}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={handleOptionA}
              className="w-full game-button-orange game-button rounded-lg px-4 py-3 font-game-body text-sm md:text-base text-left"
            >
              A: {question.optionA.text}
            </button>
            <button
              onClick={handleOptionB}
              className="w-full game-button rounded-lg px-4 py-3 font-game-body text-sm md:text-base text-left"
            >
              B: {question.optionB.text}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionModal;
