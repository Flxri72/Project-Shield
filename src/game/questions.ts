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
    situation: "Tu proyecto lleva 2 semanas de retraso.",
    optionA: { text: "Agregar más personas al equipo", correct: false, feedback: "Añadir personal tarde aumenta el retraso por curva de aprendizaje (Ley de Brooks)" },
    optionB: { text: "Reducir el alcance y priorizar", correct: true, feedback: "+15 Tiempo + Slow Motion" },
    reward: { bars: { tiempo: 15 }, power: 'slowmo', powerDuration: 8000 },
  },
  {
    id: 2,
    situation: "El presupuesto se excedió un 20%.",
    optionA: { text: "Eliminar pruebas de calidad para ahorrar", correct: false, feedback: "Sin pruebas, los errores cuestan más después" },
    optionB: { text: "Revisar y renegociar con proveedores", correct: true, feedback: "+15 Costo + Escudo" },
    reward: { bars: { costo: 15 }, power: 'shield', powerDuration: 8000 },
  },
  {
    id: 3,
    situation: "El cliente pide nuevas funciones a mitad del proyecto.",
    optionA: { text: "Aceptar todo para no perder al cliente", correct: false, feedback: "El scope creep descontrolado destruye cronogramas y presupuestos" },
    optionB: { text: "Evaluar impacto y negociar el cambio", correct: true, feedback: "+10 Tiempo +10 Costo + Disparo Doble" },
    reward: { bars: { tiempo: 10, costo: 10 }, power: 'doubleshoot', powerDuration: 8000 },
  },
  {
    id: 4,
    situation: "Un miembro clave del equipo renuncia.",
    optionA: { text: "Distribuir su trabajo entre los demás sin avisar", correct: false, feedback: "La sobrecarga sin comunicación baja la calidad y la moral" },
    optionB: { text: "Comunicarlo al cliente y reorganizar prioridades", correct: true, feedback: "+15 Calidad + Escudo" },
    reward: { bars: { calidad: 15 }, power: 'shield', powerDuration: 10000 },
  },
  {
    id: 5,
    situation: "Las pruebas revelan bugs críticos 2 días antes de la entrega.",
    optionA: { text: "Entregar igual y parchear después", correct: false, feedback: "Entregar con bugs críticos daña la confianza del cliente permanentemente" },
    optionB: { text: "Negociar una extensión breve para corregir", correct: true, feedback: "+20 Calidad + Slow Motion" },
    reward: { bars: { calidad: 20 }, power: 'slowmo', powerDuration: 10000 },
  },
  {
    id: 6,
    situation: "Los stakeholders dan feedback contradictorio.",
    optionA: { text: "Implementar todos los cambios para contentar a todos", correct: false, feedback: "Sin priorización, el producto pierde coherencia y el equipo se agota" },
    optionB: { text: "Organizar una reunión para alinear prioridades", correct: true, feedback: "+10 a las 3 barras + Disparo Doble" },
    reward: { bars: { tiempo: 10, costo: 10, calidad: 10 }, power: 'doubleshoot', powerDuration: 12000 },
  },
  {
    id: 7,
    situation: "El equipo reporta que el proceso de revisión es muy lento.",
    optionA: { text: "Eliminar las revisiones para ir más rápido", correct: false, feedback: "Sin revisiones aumentan los errores que cuestan más corregir después" },
    optionB: { text: "Automatizar parte del proceso de revisión", correct: true, feedback: "+15 Tiempo + Disparo Doble" },
    reward: { bars: { tiempo: 15 }, power: 'doubleshoot', powerDuration: 8000 },
  },
  {
    id: 8,
    situation: "El servidor de producción falla justo en el lanzamiento.",
    optionA: { text: "Entrar en pánico y hacer cambios en producción", correct: false, feedback: "Los cambios sin plan en producción pueden empeorar la crisis" },
    optionB: { text: "Activar el plan de contingencia y comunicar estado", correct: true, feedback: "+15 Costo + Escudo" },
    reward: { bars: { costo: 15 }, power: 'shield', powerDuration: 12000 },
  },
];

export function getRandomQuestion(usedIds: Set<number>): Question | null {
  const available = questions.filter(q => !usedIds.has(q.id));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
