import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConversations, analyze, classify, mask, normalizeQuestion } from '../src/index.js';

const conv = (id, messages, extra = {}) => JSON.stringify({ id, messages, ...extra });

test('loadConversations reads roles in several spellings and refuses bad lines', () => {
  const cs = loadConversations([
    '# comment',
    conv('a', [{ role: 'Customer', text: 'hi' }, { role: 'assistant', text: 'hello' }, { role: 'human', text: 'agent here' }])
  ].join('\n'));
  assert.deepEqual(cs[0].messages.map((m) => m.role), ['user', 'bot', 'agent']);
  assert.throws(() => loadConversations('{"id": "a", "messages": []}'), /non-empty array/);
  assert.throws(() => loadConversations('{"id": "a", "messages": [{"role": "robot", "text": "x"}]}'), /role must be/);
  assert.throws(() => loadConversations('{oops'), /line 1: not valid JSON/);
  assert.throws(() => loadConversations([conv('a', [{ role: 'user', text: 'x' }]), conv('a', [{ role: 'user', text: 'y' }])].join('\n')), /appears twice/);
  assert.throws(() => loadConversations('# only a comment'), /no conversations/);
});

test('mask hides email addresses and long numbers', () => {
  assert.equal(mask('mail anna@example.com or call +1 (307) 443-5690'), 'mail [email] or call [number]');
  assert.equal(mask('card 4111 1111 1111 1111'), 'card [number]');
  assert.equal(mask('room 42'), 'room 42');
});

test('normalizeQuestion groups questions that differ only in case and punctuation', () => {
  assert.equal(normalizeQuestion('Can I return a gift??'), normalizeQuestion('can i return a gift'));
  assert.equal(normalizeQuestion('order 123456 late'), 'order # late');
});

test('classify: handover by agent message or flag, request for a person, fallback and the question behind it', () => {
  const [c] = loadConversations(conv('x', [
    { role: 'user', text: 'Hello' }, { role: 'bot', text: 'Hi!' },
    { role: 'user', text: 'Can I pay later?' }, { role: 'bot', text: "I'm not sure about that." },
    { role: 'user', text: 'Let me talk to a real person' }, { role: 'agent', text: 'Sure.' }
  ]));
  const r = classify(c);
  assert.equal(r.handover, true);
  assert.equal(r.contained, false);
  assert.equal(r.askedForHuman, true);
  assert.equal(r.fallbackCount, 1);
  assert.equal(r.failedQuestion, 'Can I pay later?');
  const [flagged] = loadConversations(conv('y', [{ role: 'user', text: 'Q' }, { role: 'bot', text: 'A' }], { handover: true }));
  assert.equal(classify(flagged).handover, true);
  assert.equal(classify(flagged).failedQuestion, 'Q');
});

test('custom phrase lists replace the built-in ones', () => {
  const [c] = loadConversations(conv('z', [{ role: 'user', text: 'Q' }, { role: 'bot', text: 'Keine Ahnung' }]));
  assert.equal(classify(c).fallbackCount, 0);
  assert.equal(classify(c, { fallback: ['keine ahnung'] }).fallbackCount, 1);
});

test('analyze counts, groups the failed questions and ranks topics', () => {
  const cs = loadConversations([
    conv('1', [{ role: 'user', text: 'Return a gift?' }, { role: 'bot', text: "I don't know" }], { topic: 'returns' }),
    conv('2', [{ role: 'user', text: 'return a gift' }, { role: 'bot', text: 'I cannot help' }, { role: 'agent', text: 'ok' }], { topic: 'returns' }),
    conv('3', [{ role: 'user', text: 'Where is my order' }, { role: 'bot', text: 'On its way' }], { topic: 'orders' })
  ].join('\n'));
  const r = analyze(cs);
  assert.equal(r.conversations, 3);
  assert.equal(r.contained, 2);
  assert.equal(r.withFallback, 2);
  assert.deepEqual(r.failedQuestions, [{ question: 'Return a gift?', count: 2 }]);
  assert.deepEqual(r.topics.map((t) => [t.topic, t.handovers]), [['returns', 1], ['orders', 0]]);
});
