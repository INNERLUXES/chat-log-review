import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { parseArgs, main, toMarkdown } from '../src/index.js';

const root = join(fileURLToPath(import.meta.url), '..', '..');
const example = join(root, 'examples', 'conversations.jsonl');
const quiet = { out: () => {}, err: () => {} };

test('parseArgs reads options and refuses bad input', () => {
  const o = parseArgs(['c.jsonl', '--top', '3', '--fallback', "No idea | Not sure", '--min-containment', '0.7']);
  assert.equal(o.top, 3);
  assert.deepEqual(o.fallback, ['no idea', 'not sure']);
  assert.equal(o.minContainment, 0.7);
  assert.throws(() => parseArgs([]), /conversations file/);
  assert.throws(() => parseArgs(['c.jsonl', '--top', '0']), /positive whole/);
  assert.throws(() => parseArgs(['c.jsonl', '--min-containment', '80']), /from 0 to 1/);
});

test('the example: containment, the top question, and no personal data in the report', async () => {
  let out = '';
  assert.equal(await main([example, '--format', 'json'], { out: (t) => { out += t; }, err: () => {} }), 0);
  const r = JSON.parse(out);
  assert.equal(r.conversations, 10);
  assert.equal(r.contained, 6);
  assert.equal(r.askedForHuman, 2);
  assert.deepEqual(r.failedQuestions[0], { question: 'Can I return a gift without the receipt?', count: 3 });
  assert.doesNotMatch(out, /4111|anna@example\.com/);
});

test('the gate fails below --min-containment; input errors give exit code 2', async () => {
  assert.equal(await main([example, '--min-containment', '0.8'], quiet), 1);
  assert.equal(await main([example, '--min-containment', '0.6'], quiet), 0);
  assert.equal(await main(['missing.jsonl'], quiet), 2);
  assert.equal(await main(['--help'], quiet), 0);
});

test('Markdown escapes pipes in questions and topics', () => {
  const md = toMarkdown({ conversations: 1, contained: 0, containmentRate: 0, handovers: 1, askedForHuman: 0, withFallback: 1, averageTurns: 1,
    failedQuestions: [{ question: 'a|b', count: 1 }], topics: [{ topic: 'x|y', conversations: 1, handovers: 1, handoverRate: 1 }] });
  assert.match(md, /a\\\|b/);
  assert.match(md, /x\\\|y/);
});
