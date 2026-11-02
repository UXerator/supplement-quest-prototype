export function evidenceSummary(card, language = 'English') {
  const es = language === 'Español';
  const hasSources = Boolean(card.sources?.length || card.master_claim_id !== 'CLM-000');
  const reviewed = card.claim_mapping_reviewed === true && hasSources;
  const level = reviewed ? card.evidence_level : 'Not Addressed';
  if (level === 'Supported') return {
    level,
    takeaway: es ? 'La fuente revisada respalda esta afirmación en su contexto.' : 'The reviewed source supports this claim in its stated context.',
    uncertainty: es ? 'No garantiza un beneficio personal.' : 'This does not guarantee a personal benefit.',
    source: es ? 'Hay evidencia revisada para esta afirmación.' : 'Reviewed evidence is available for this claim.',
    unknown: es ? 'No sabemos si es adecuado para ti.' : 'Whether it is right for you is not established.',
    next: es ? 'Revisa el contexto antes de elegir tu próximo paso.' : 'Check the context before choosing your next step.',
  };
  if (level === 'Limited Evidence') return {
    level,
    takeaway: es ? 'La fuente revisada describe evidencia limitada o incierta.' : 'The reviewed source describes limited or uncertain evidence.',
    uncertainty: es ? 'No permite una conclusión firme.' : 'A confident conclusion is not established.',
    source: es ? 'Hay una revisión, pero la evidencia es limitada.' : 'A review is available, but the evidence is limited.',
    unknown: es ? 'El beneficio de esta afirmación sigue siendo incierto.' : 'The benefit described in this claim remains uncertain.',
    next: es ? 'Considera qué información falta antes de decidir.' : 'Consider what is missing before deciding.',
  };
  return {
    level: 'Not Addressed',
    takeaway: hasSources
      ? (es ? 'Encontramos información relacionada, pero esta afirmación no tiene una clasificación revisada.' : 'We found related information, but this claim has no reviewed classification.')
      : (es ? 'Nuestra biblioteca ODS actual no cubre esta pregunta.' : 'Our current ODS library does not cover this question.'),
    uncertainty: es ? 'Esto no demuestra que sea falso.' : 'This does not mean the claim is false.',
    source: hasSources ? (es ? 'Hay pasajes ODS relacionados para leer.' : 'Related ODS passages are available to read.') : null,
    unknown: es ? 'No podemos establecer un beneficio con esta revisión.' : 'This review cannot establish a benefit.',
    next: hasSources
      ? (es ? 'Lee la fuente o identifica qué necesitas consultar.' : 'Read the source or identify what you need to ask.')
      : (es ? 'Prueba otra pregunta o consulta con un profesional.' : 'Try another question or ask a qualified professional.'),
  };
}

export function decisionHighlights(card, language = 'English') {
  const es = language === 'Español';
  const summary = evidenceSummary(card, language);
  const reviewed = card.claim_mapping_reviewed === true && Boolean(summary.source);
  const food = reviewed ? card.food_first_alternative?.trim() : null;
  return {
    food: food && food.split(/\s+/).length <= 35 ? food
      : food ? (es ? 'Consulta las opciones alimentarias revisadas en los detalles de la fuente.'
        : 'See reviewed food options in the source details.')
        : (es ? 'No hay una lista de alimentos revisada para esta pregunta. Puedes explorar Alimentos.'
          : 'No reviewed food list for this question. You can explore Food first.'),
    practical: summary.next,
    safety: es ? 'Esta revisión no establece seguridad personal. Consulta con un profesional sobre suplementos.'
      : 'This review does not establish personal safety. Ask a qualified professional about supplements.',
  };
}
