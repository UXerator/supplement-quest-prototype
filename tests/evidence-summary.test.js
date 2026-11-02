import { test } from 'node:test';
import assert from 'node:assert/strict';
import { decisionHighlights, evidenceSummary } from '../src/evidence-summary.js';

const card = { evidence_level: 'Not Addressed', claim_mapping_reviewed: false,
  master_claim_id: 'CLM-001', sources: [{ text: 'Source' }] };

test('separates missing source coverage from pending claim classification', () => {
  const related = evidenceSummary(card);
  assert.match(related.takeaway, /related information/);
  assert.ok(related.source);
  const missing = evidenceSummary({ ...card, master_claim_id: 'CLM-000', sources: [] });
  assert.match(missing.takeaway, /library does not cover/);
  assert.equal(missing.source, null);
  assert.match(missing.uncertainty, /does not mean.*false/);
});

test('highlights show only reviewed food metadata and never invent a safety verdict', () => {
  for (const language of ['English', 'Español']) {
    const unreviewed = decisionHighlights({ ...card, food_first_alternative: 'Invented food list' }, language);
    assert.ok(!unreviewed.food.includes('Invented'));
    assert.ok(unreviewed.food && unreviewed.practical && unreviewed.safety);
    const reviewed = decisionHighlights({ ...card, claim_mapping_reviewed: true,
      food_first_alternative: 'Reviewed food options' }, language);
    assert.equal(reviewed.food, 'Reviewed food options');
    assert.equal(reviewed.practical, evidenceSummary(card, language).next);
    for (const level of ['Supported', 'Limited Evidence', 'Not Addressed']) {
      const { safety } = decisionHighlights({ ...card, evidence_level: level, claim_mapping_reviewed: true }, language);
      assert.match(safety, language === 'English' ? /does not establish personal safety/ : /no establece seguridad personal/);
    }
    const missing = decisionHighlights({ ...card, sources: [], master_claim_id: 'CLM-000',
      claim_mapping_reviewed: true, food_first_alternative: 'Uncited food' }, language);
    assert.ok(!missing.food.includes('Uncited'));
    const longFood = 'Food '.repeat(36).trim();
    assert.ok(!decisionHighlights({ ...card, claim_mapping_reviewed: true,
      food_first_alternative: longFood }, language).food.includes(longFood));
  }
});

test('positive summaries require reviewed mappings and source references', () => {
  for (const level of ['Supported', 'Limited Evidence']) {
    assert.equal(evidenceSummary({ ...card, evidence_level: level }).level, 'Not Addressed');
    assert.equal(evidenceSummary({ ...card, evidence_level: level, claim_mapping_reviewed: true }).level, level);
    assert.equal(evidenceSummary({ ...card, evidence_level: level, claim_mapping_reviewed: true,
      sources: [], master_claim_id: 'CLM-000' }).level, 'Not Addressed');
  }
});

test('all snapshot states have concise bilingual copy and no invented medical summary', () => {
  for (const language of ['English', 'Español']) {
    for (const state of [
      card, { ...card, master_claim_id: 'CLM-000', sources: [] },
      { ...card, evidence_level: 'Supported', claim_mapping_reviewed: true },
      { ...card, evidence_level: 'Limited Evidence', claim_mapping_reviewed: true },
    ]) {
      const summary = evidenceSummary(state, language);
      assert.ok(summary.takeaway.split(/\s+/).length <= 25);
      assert.ok(summary.uncertainty && summary.unknown && summary.next);
      assert.ok(!JSON.stringify(summary).includes('Source'));
    }
  }
});
