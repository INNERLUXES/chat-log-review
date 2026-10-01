// Runs the README example and checks that it reports exactly what the README shows.

import { main } from '../src/index.js';

let out = '';
const code = await main(['examples/conversations.jsonl'], { out: (t) => { out += t; }, err: (t) => process.stderr.write(t) });
process.stdout.write(out);
const expected = ['resolved without a person: 6 (60.0%)', '3  Can I return a gift without the receipt?', 'returns: 3 of 4 (75.0%)'];
const missing = expected.filter((e) => !out.includes(e));
if (code !== 0 || missing.length || /4111|anna@example\.com/.test(out)) {
  console.error(`example: unexpected report (exit code ${code}; missing: ${missing.join(' / ') || 'none'})`);
  process.exit(1);
}
