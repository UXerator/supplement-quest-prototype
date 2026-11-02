const evidenceLevels = new Set(['Supported', 'Limited Evidence', 'Not Addressed']);

export function validateDecisionCard(value) {
  const stringFields = [
    'claim_reviewed', 'master_claim_id', 'ods_traceability_snippet',
    'safety_note', 'practical_guidance',
  ];
  const sourcesValid = value?.sources === undefined || (
    Array.isArray(value.sources) && value.sources.every(source =>
      source && typeof source.title === 'string' && typeof source.text === 'string'
      && /^CLM-\d{3,}$/.test(source.master_claim_id)
      && (source.url === null || (typeof source.url === 'string'
        && /^https:\/\/ods\.od\.nih\.gov\//.test(source.url)))
      && (source.language === null || ['English', 'Español'].includes(source.language)))
  );
  if (!value || !stringFields.every(field => typeof value[field] === 'string')
      || !sourcesValid
      || !/^CLM-\d{3,}$/.test(value.master_claim_id)
      || !evidenceLevels.has(value.evidence_level)
      || typeof value.is_abstention !== 'boolean'
      || typeof value.claim_mapping_reviewed !== 'boolean'
      || !(value.food_first_alternative === null || typeof value.food_first_alternative === 'string')
      || !value.confidence_check_prompt
      || typeof value.confidence_check_prompt.question !== 'string'
      || !Array.isArray(value.confidence_check_prompt.options)
      || value.confidence_check_prompt.options.length === 0
      || !value.confidence_check_prompt.options.every(option => typeof option === 'string')) {
    throw new Error('invalid-response');
  }
  return value;
}

export async function reviewClaim(query, language, signal) {
  const response = await fetch('/api/decision', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, language }),
    signal,
  });
  if (!response.ok) throw new Error(`request-failed-${response.status}`);
  return validateDecisionCard(await response.json());
}
