import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildShareContent, shareContentText, renderShareImage } from '../src/share-card.js';
import { familyChecklistItems, checklistCount, toggleChecklistItem } from '../src/family-checklist.js';
import { claimTopics } from '../src/claim-topics.js';

const card = {
  claim_reviewed: 'PRIVATE SUBMITTED QUESTION',
  evidence_level: 'Not Addressed', claim_mapping_reviewed: false, is_abstention: false,
  sources: [{
    text: 'Literal local ODS excerpt.',
    master_claim_id: 'CLM-001', url: 'https://ods.od.nih.gov/factsheets/Magnesium-Consumer/',
  }],
  reflection: 'PRIVATE REFLECTION', checklist: 'PRIVATE CHECKLIST',
};

test('share content preserves attribution and excludes participant fields', () => {
  const data = buildShareContent(card);
  const text = shareContentText(data);
  assert.equal(data.quote, card.sources[0].text);
  assert.equal(data.url, card.sources[0].url);
  assert.equal(data.reference, 'CLM-001');
  assert.match(text, /not medical advice/);
  assert.doesNotMatch(text, /PRIVATE/);
  assert.match(data.context, /does not mean/);
  assert.equal(buildShareContent(card, 'Español').label, 'No abordado');
});

test('unreviewed content cannot be promoted to a positive share verdict', () => {
  assert.equal(buildShareContent({ ...card, evidence_level: 'Supported' }).level, 'Not Addressed');
  assert.equal(buildShareContent({ ...card, evidence_level: 'Supported', claim_mapping_reviewed: true }).level, 'Supported');
  assert.throws(() => buildShareContent({ ...card, is_abstention: true }), /Safety notices/);
  const noSource = buildShareContent({ ...card, sources: [] });
  assert.equal(noSource.reference, 'CLM-000');
  assert.match(noSource.quote, /No local ODS/);
});

test('checklist state is immutable, reversible, and has no health verdict', () => {
  const original = {};
  const selected = toggleChecklistItem(original, 'foods');
  assert.deepEqual(original, {});
  assert.equal(checklistCount(selected), 1);
  assert.equal(checklistCount(toggleChecklistItem(selected, 'foods')), 0);
  assert.throws(() => toggleChecklistItem(selected, 'fake'), /Unknown/);
  assert.equal(familyChecklistItems.length, 5);
});

test('audience topics and checklist copy exist in both languages', () => {
  for (const pair of [
    ...familyChecklistItems.map(item => item.label),
    ...claimTopics.map(item => item.label),
    ...claimTopics.flatMap(item => item.prompts),
  ]) {
    assert.equal(pair.length, 2);
    assert.ok(pair.every(text => typeof text === 'string' && text.trim()));
  }
  assert.deepEqual(claimTopics.filter(topic => !topic.available).map(topic => topic.id), ['fitness', 'weight', 'immunity']);
});

test('graphic renderer produces the requested social image dimensions and MIME', async context => {
  let mime;
  const drawn = [];
  const canvas = {
    getContext: () => ({
      fillRect() {}, fillText: (text, x, y) => drawn.push({ text, x, y }),
      beginPath() {}, moveTo() {}, lineTo() {}, stroke() {},
      measureText: text => ({ width: text.length * 16 }),
    }),
    toBlob: (callback, type) => { mime = type; callback(new Blob(['test'], { type })); },
  };
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, 'document');
  Object.defineProperty(globalThis, 'document', {
    value: { createElement: tag => { assert.equal(tag, 'canvas'); return canvas; } },
    configurable: true,
  });
  context.after(() => {
    if (descriptor) Object.defineProperty(globalThis, 'document', descriptor);
    else delete globalThis.document;
  });
  const blob = await renderShareImage(buildShareContent(card));
  assert.equal(canvas.width, 1080);
  assert.equal(canvas.height, 1350);
  assert.equal(mime, 'image/png');
  assert.equal(blob.type, 'image/png');
  const lengthy = buildShareContent({
    ...card, sources: [{ ...card.sources[0], text: 'A literal excerpt.\n\n'.repeat(40) }],
  }, 'Español');
  await renderShareImage(lengthy);
  assert.ok(drawn.every(item => item.y < 1350));
  assert.ok(drawn.some(item => item.text.endsWith('…')));
  assert.ok(drawn.some(item => item.text.includes('fuente completa')));
  canvas.toBlob = callback => callback(null);
  await assert.rejects(renderShareImage(buildShareContent(card)), /PNG export failed/);
});
