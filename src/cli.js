// Command line: chat-log-review <conversations.jsonl> [options]

import { readFile, writeFile } from 'node:fs/promises';
import { loadConversations } from './load.js';
import { analyze, pct } from './analyze.js';
import { toText, toMarkdown, toJson } from './report.js';

const FORMATS = { text: toText, markdown: toMarkdown, json: toJson };

export const USAGE = `Usage: chat-log-review <conversations.jsonl> [options]

Reviews exported chatbot conversations: how many were resolved without a person, where people asked for one,
where the bot gave a fallback answer, and the questions behind them. Personal data is masked in the report.

Options:
  --top <n>                 how many questions to list (default: 10)
  --fallback <a|b|c>        phrases that mark a fallback answer (replaces the built-in list)
  --ask-human <a|b|c>       phrases that mark a request for a person (replaces the built-in list)
  --min-containment <0..1>  exit with 1 when fewer conversations than this were resolved without a person
  --format <name>           text, markdown or json (default: text)
  --output <file>           write the report to a file instead of the screen
  --help                    show this text
`;

export function parseArgs(argv) {
  const o = { file: null, top: 10, fallback: null, askHuman: null, minContainment: null, format: 'text', output: null, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    const next = () => {
      const v = argv[i + 1];
      if (v === undefined || v.startsWith('--')) throw new Error(`${a} needs a value`);
      i += 1;
      return v;
    };
    const phrases = (v) => v.split('|').map((p) => p.trim().toLowerCase()).filter(Boolean);
    if (a === '--help' || a === '-h') o.help = true;
    else if (a === '--top') {
      o.top = Number(next());
      if (!Number.isInteger(o.top) || o.top < 1) throw new Error('--top takes a positive whole number');
    } else if (a === '--fallback') o.fallback = phrases(next());
    else if (a === '--ask-human') o.askHuman = phrases(next());
    else if (a === '--min-containment') {
      o.minContainment = Number(next());
      if (!Number.isFinite(o.minContainment) || o.minContainment < 0 || o.minContainment > 1) throw new Error('--min-containment takes a number from 0 to 1');
    } else if (a === '--format') o.format = next();
    else if (a === '--output') o.output = next();
    else if (a.startsWith('-')) throw new Error(`unknown option ${a}`);
    else if (o.file === null) o.file = a;
    else throw new Error(`unexpected argument ${a}`);
  }
  if (!o.help) {
    if (!o.file) throw new Error('give the conversations file');
    if (!FORMATS[o.format]) throw new Error(`unknown format ${o.format}`);
  }
  return o;
}

// Exit code: 0 done (and gate passed), 1 containment below --min-containment, 2 usage or input error.
export async function main(argv, io = { out: (t) => process.stdout.write(t), err: (t) => process.stderr.write(t) }) {
  let o;
  try {
    o = parseArgs(argv);
  } catch (error) {
    io.err(`chat-log-review: ${error.message}\n\n${USAGE}`);
    return 2;
  }
  if (o.help) {
    io.out(USAGE);
    return 0;
  }
  let report;
  try {
    const conversations = loadConversations(await readFile(o.file, 'utf8'));
    report = analyze(conversations, { top: o.top, fallback: o.fallback || undefined, askHuman: o.askHuman || undefined });
  } catch (error) {
    io.err(`chat-log-review: ${o.file}: ${error.message}\n`);
    return 2;
  }
  if (o.minContainment !== null) {
    const pass = report.containmentRate >= o.minContainment;
    report.gate = { pass, reason: pass ? '' : `resolved without a person ${pct(report.containmentRate)}, below ${pct(o.minContainment)}` };
  }
  const out = FORMATS[o.format](report);
  if (o.output) await writeFile(o.output, out, 'utf8');
  else io.out(out);
  return report.gate && !report.gate.pass ? 1 : 0;
}
