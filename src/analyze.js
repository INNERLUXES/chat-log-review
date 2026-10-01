// Turns conversations into the numbers a chatbot team reviews: containment, handovers, requests for a person,
// fallback answers, and the questions behind them, with personal data masked.

export const DEFAULT_FALLBACK = [
  "i don't know", 'i do not know', "i'm not sure", 'i am not sure', "i can't help", 'i cannot help',
  "i didn't understand", 'i did not understand', 'could you rephrase', 'please rephrase', 'no information about'
];
export const DEFAULT_ASK_HUMAN = [
  'human', 'real person', 'a person', 'agent', 'representative', 'speak to someone', 'talk to someone', 'operator'
];

// Masks what should never be copied into a report: email addresses, long digit runs (phones, cards, order numbers).
export function mask(text) {
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '[email]')
    .replace(/(?:\+?\d[\d ()-]{4,}\d)/g, '[number]');
}

// Groups questions that differ only in case, punctuation, spacing or masked values.
export function normalizeQuestion(text) {
  return mask(text).toLowerCase().replace(/\[(email|number)\]/g, '#').replace(/[^a-z0-9# ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function hasAny(text, phrases) {
  const t = text.toLowerCase();
  return phrases.some((p) => t.includes(p));
}

export function classify(conversation, options = {}) {
  const fallback = options.fallback || DEFAULT_FALLBACK;
  const askHuman = options.askHuman || DEFAULT_ASK_HUMAN;
  const users = conversation.messages.filter((m) => m.role === 'user');
  const bots = conversation.messages.filter((m) => m.role === 'bot');
  const handover = conversation.handoverFlag || conversation.messages.some((m) => m.role === 'agent');
  const askedForHuman = users.some((m) => hasAny(m.text, askHuman));
  const fallbackCount = bots.filter((m) => hasAny(m.text, fallback)).length;
  // the question that went wrong: the user message right before the first fallback, else the first user message
  let failedQuestion = null;
  if (handover || fallbackCount > 0) {
    const i = conversation.messages.findIndex((m) => m.role === 'bot' && hasAny(m.text, fallback));
    const before = i > 0 ? conversation.messages.slice(0, i).reverse().find((m) => m.role === 'user') : null;
    failedQuestion = (before || users[0] || { text: '' }).text;
  }
  return {
    id: conversation.id,
    topic: conversation.topic,
    turns: users.length,
    contained: !handover,
    handover,
    askedForHuman,
    fallbackCount,
    failedQuestion
  };
}

export function analyze(conversations, options = {}) {
  const top = options.top || 10;
  const rows = conversations.map((c) => classify(c, options));
  const n = rows.length;
  const count = (f) => rows.filter(f).length;
  const groups = new Map();
  for (const r of rows) {
    if (!r.failedQuestion) continue;
    const key = normalizeQuestion(r.failedQuestion);
    if (!key) continue;
    if (!groups.has(key)) groups.set(key, { question: mask(r.failedQuestion).trim(), count: 0 });
    groups.get(key).count += 1;
  }
  const topics = new Map();
  for (const r of rows) {
    const t = r.topic || '(no topic)';
    if (!topics.has(t)) topics.set(t, { topic: t, conversations: 0, handovers: 0 });
    const x = topics.get(t);
    x.conversations += 1;
    if (r.handover) x.handovers += 1;
  }
  return {
    conversations: n,
    contained: count((r) => r.contained),
    containmentRate: n ? count((r) => r.contained) / n : 0,
    handovers: count((r) => r.handover),
    askedForHuman: count((r) => r.askedForHuman),
    withFallback: count((r) => r.fallbackCount > 0),
    averageTurns: n ? rows.reduce((s, r) => s + r.turns, 0) / n : 0,
    failedQuestions: [...groups.values()].sort((a, b) => b.count - a.count || a.question.localeCompare(b.question)).slice(0, top),
    topics: [...topics.values()].map((t) => ({ ...t, handoverRate: t.handovers / t.conversations }))
      .sort((a, b) => b.handovers - a.handovers || a.topic.localeCompare(b.topic))
  };
}

export function pct(x) {
  return `${(Math.round(x * 1000) / 10).toFixed(1)}%`;
}
