import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reviewClaim, validateDecisionCard } from '../src/decision-api.js';

const card = {
  claim_reviewed: 'What foods provide magnesium?',
  master_claim_id: 'CLM-001',
  evidence_level: 'Not Addressed',
  ods_traceability_snippet: 'Source passage',
  safety_note: 'Educational only',
  practical_guidance: 'No personal recommendation',
  is_abstention: false,
  claim_mapping_reviewed: false,
  food_first_alternative: null,
  confidence_check_prompt: { question: 'How confident?', options: ['Not sure'] },
};

test('validates the Decision Card contract and rejects malformed success responses', () => {
  assert.equal(validateDecisionCard(card), card);
  for (const change of [
    { evidence_level: 'Proven' }, { safety_note: undefined },
    { is_abstention: undefined }, { confidence_check_prompt: { question: 'Test', options: [] } },
    { sources: [{ title: 'Untrusted', text: 'Test', master_claim_id: 'CLM-001',
      url: 'https://example.com/source', language: 'English' }] },
  ]) {
    assert.throws(() => validateDecisionCard({ ...card, ...change }), /invalid-response/);
  }
});

test('posts query and selected language to the same-origin API', async context => {
  let request;
  context.mock.method(globalThis, 'fetch', async (url, options) => {
    request = { url, options };
    return { ok: true, json: async () => card };
  });
  const controller = new AbortController();
  assert.equal(await reviewClaim('Question', 'Español', controller.signal), card);
  assert.equal(request.url, '/api/decision');
  assert.deepEqual(JSON.parse(request.options.body), { query: 'Question', language: 'Español' });
  assert.equal(request.options.signal, controller.signal);
});

test('does not return an evidence result for service failures', async context => {
  context.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 503 }));
  await assert.rejects(reviewClaim('Question', 'English'), /request-failed-503/);
});
