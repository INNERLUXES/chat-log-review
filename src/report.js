// Report formats: text for a terminal, Markdown for a review document or pull request, JSON for other tools.

import { pct } from './analyze.js';

function cell(t) {
  return String(t).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

export function toText(r) {
  const lines = [
    `chat-log-review: ${r.conversations} conversation(s)`,
    '',
    `  resolved without a person: ${r.contained} (${pct(r.containmentRate)})`,
    `  handed over to a person:   ${r.handovers}`,
    `  asked for a person:        ${r.askedForHuman}`,
    `  with a fallback answer:    ${r.withFallback}`,
    `  user turns on average:     ${r.averageTurns.toFixed(1)}`
  ];
  if (r.failedQuestions.length) {
    lines.push('', 'Questions behind handovers and fallbacks:');
    for (const q of r.failedQuestions) lines.push(`  ${String(q.count).padStart(3)}  ${q.question}`);
  }
  if (r.topics.some((t) => t.topic !== '(no topic)')) {
    lines.push('', 'Handovers by topic:');
    for (const t of r.topics) lines.push(`  ${t.topic}: ${t.handovers} of ${t.conversations} (${pct(t.handoverRate)})`);
  }
  if (r.gate) lines.push('', r.gate.pass ? 'GATE: PASS' : `GATE: FAIL - ${r.gate.reason}`);
  return lines.join('\n') + '\n';
}

export function toMarkdown(r) {
  const lines = [`## chat-log-review: ${r.conversations} conversations`, '',
    '| Measure | Value |', '| --- | --- |',
    `| Resolved without a person | ${r.contained} (${pct(r.containmentRate)}) |`,
    `| Handed over to a person | ${r.handovers} |`,
    `| Asked for a person | ${r.askedForHuman} |`,
    `| With a fallback answer | ${r.withFallback} |`,
    `| User turns on average | ${r.averageTurns.toFixed(1)} |`];
  if (r.failedQuestions.length) {
    lines.push('', '| Count | Question behind a handover or fallback |', '| --- | --- |');
    for (const q of r.failedQuestions) lines.push(`| ${q.count} | ${cell(q.question)} |`);
  }
  if (r.topics.some((t) => t.topic !== '(no topic)')) {
    lines.push('', '| Topic | Handovers | Rate |', '| --- | --- | --- |');
    for (const t of r.topics) lines.push(`| ${cell(t.topic)} | ${t.handovers} of ${t.conversations} | ${pct(t.handoverRate)} |`);
  }
  if (r.gate && !r.gate.pass) lines.push('', `**Gate failed:** ${cell(r.gate.reason)}`);
  return lines.join('\n') + '\n';
}

export function toJson(r) {
  return JSON.stringify(r, null, 2) + '\n';
}
