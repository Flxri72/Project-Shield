export interface Question {
  id: number;
  situation: string;
  optionA: { text: string; correct: boolean; feedback: string };
  optionB: { text: string; correct: boolean; feedback: string };
  reward: {
    bars: { tiempo?: number; costo?: number; calidad?: number };
    power: 'doubleshoot' | 'shield' | 'slowmo';
    powerDuration: number;
  };
}

export const questions: Question[] = [
  {
    id: 1,
    situation: "Tu equipo debe desarrollar un software con requisitos muy claros y que NO van a cambiar.",
    optionA: { text: "Usar metodología Ágil", correct: false, feedback: "Ágil es ideal cuando los requisitos cambian. Si ya están definidos, es innecesariamente complejo." },
    optionB: { text: "Usar metodología Tradicional (Cascada)", correct: true, feedback: "+15 Alcance + poder DISPARO DOBLE 8s" },
    reward: { bars: { tiempo: 15 }, power: 'doubleshoot', powerDuration: 8000 },
  },
  {
    id: 2,
    situation: "El cliente no sabe exactamente qué quiere y los requisitos cambiarán durante el desarrollo.",
    optionA: { text: "Usar Cascada y documentar todo al inicio", correct: false, feedback: "Cascada no se adapta bien a cambios. Rediseñar en etapas tardías es muy costoso." },
    optionB: { text: "Usar Scrum o Kanban (Metodología Ágil)", correct: true, feedback: "+15 Cronograma + poder ESCUDO 8s" },
    reward: { bars: { costo: 15 }, power: 'shield', powerDuration: 8000 },
  },
  {
    id: 3,
    situation: "Debes comparar metodologías para presentarlas a tu empresa. ¿Qué herramienta usas?",
    optionA: { text: "Una lista simple de nombres", correct: false, feedback: "Una lista no permite comparar ventajas, desventajas ni contexto de uso. Se pierde información clave." },
    optionB: { text: "Un cuadro comparativo con criterios claros", correct: true, feedback: "+10 Alcance +10 Calidad + poder SLOW MOTION 10s" },
    reward: { bars: { tiempo: 10, calidad: 10 }, power: 'slowmo', powerDuration: 10000 },
  },
  {
    id: 4,
    situation: "Un proyecto de TI tiene entregas parciales cada 2 semanas para mostrar al cliente.",
    optionA: { text: "Esto corresponde a metodología Tradicional", correct: false, feedback: "Las entregas cortas y frecuentes son una característica clave de las metodologías Ágiles como Scrum." },
    optionB: { text: "Esto corresponde a metodología Ágil (Sprints)", correct: true, feedback: "+15 Cronograma + poder ESCUDO 10s" },
    reward: { bars: { costo: 15 }, power: 'shield', powerDuration: 10000 },
  },
  {
    id: 5,
    situation: "¿Cuál es la principal ventaja de la metodología Ágil sobre la Tradicional?",
    optionA: { text: "Tiene más documentación y control", correct: false, feedback: "La documentación extensa es característica de la metodología Tradicional, no de Ágil." },
    optionB: { text: "Se adapta rápido a los cambios del proyecto", correct: true, feedback: "+20 Calidad + poder SLOW MOTION 10s" },
    reward: { bars: { calidad: 20 }, power: 'slowmo', powerDuration: 10000 },
  },
  {
    id: 6,
    situation: "Un proyecto gubernamental exige documentación exhaustiva, auditorías y fases definidas por ley.",
    optionA: { text: "Aplicar metodología Ágil con sprints", correct: false, feedback: "Ágil prioriza flexibilidad sobre documentación. Para entornos regulados por ley, no es lo más adecuado." },
    optionB: { text: "Aplicar metodología Tradicional con fases formales", correct: true, feedback: "+10 a las 3 barras + poder DISPARO DOBLE 12s" },
    reward: { bars: { tiempo: 10, costo: 10, calidad: 10 }, power: 'doubleshoot', powerDuration: 12000 },
  },
  {
    id: 7,
    situation: "Tu equipo usa tableros visuales con columnas: Por hacer / En progreso / Terminado.",
    optionA: { text: "Están usando metodología Scrum", correct: false, feedback: "Scrum usa sprints y roles específicos. El tablero visual descrito corresponde a Kanban." },
    optionB: { text: "Están usando metodología Kanban", correct: true, feedback: "+15 Alcance + poder DISPARO DOBLE 8s" },
    reward: { bars: { tiempo: 15 }, power: 'doubleshoot', powerDuration: 8000 },
  },
  {
    id: 8,
    situation: "¿Cuál metodología usarías para un startup de tecnología que lanza un MVP rápido?",
    optionA: { text: "Cascada, para tener todo documentado desde el inicio", correct: false, feedback: "Un MVP necesita iterar rápido con feedback del usuario. Cascada es demasiado rígida para ese contexto." },
    optionB: { text: "Ágil, para iterar y adaptarse al feedback", correct: true, feedback: "+15 Cronograma + poder ESCUDO 12s" },
    reward: { bars: { costo: 15 }, power: 'shield', powerDuration: 12000 },
  },
];

export function getRandomQuestion(usedIds: Set<number>): Question | null {
  const available = questions.filter(q => !usedIds.has(q.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
