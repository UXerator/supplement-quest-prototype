export const familyChecklistItems = [
  { id: 'source', label: ['I checked the source and its uncertainty.', 'Revisé la fuente y su incertidumbre.'] },
  { id: 'foods', label: ['I explored the foods listed in the ODS source.', 'Exploré los alimentos de la fuente ODS.'] },
  { id: 'access', label: ['I considered food access, preferences, and our budget.', 'Consideré el acceso a alimentos, las preferencias y el presupuesto.'] },
  { id: 'needs', label: ['I understand this app cannot determine our nutrient needs.', 'Entiendo que la app no puede determinar nuestras necesidades de nutrientes.'] },
  { id: 'professional', label: ['I noted questions to discuss with a clinician or pharmacist.', 'Identifiqué preguntas para un profesional de salud o farmacéutico.'] },
];

export function toggleChecklistItem(items, id) {
  if (!familyChecklistItems.some(item => item.id === id)) throw new Error('Unknown checklist item');
  return { ...items, [id]: !items[id] };
}

export function checklistCount(items) {
  return familyChecklistItems.filter(item => items[item.id] === true).length;
}
