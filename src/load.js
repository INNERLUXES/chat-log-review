// Reads exported conversations: JSON Lines, one conversation per line.
//   { "id": "c1", "topic": "billing", "handover": false,
//     "messages": [ { "role": "user", "text": "..." }, { "role": "bot", "text": "..." }, { "role": "agent", "text": "..." } ] }
// "topic" and "handover" are optional. Roles: user, bot (also assistant), agent (also human). Blank and # lines are skipped.

const ROLES = { user: 'user', customer: 'user', bot: 'bot', assistant: 'bot', agent: 'agent', human: 'agent' };

export function loadConversations(text) {
  const conversations = [];
  const seen = new Set();
  text.split(/\r?\n/).forEach((line, i) => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    let c;
    try {
      c = JSON.parse(t);
    } catch (error) {
      throw new Error(`line ${i + 1}: not valid JSON (${error.message})`);
    }
    if (c === null || typeof c !== 'object' || Array.isArray(c)) throw new Error(`line ${i + 1}: each line must be a JSON object`);
    const id = typeof c.id === 'string' && c.id ? c.id : `line-${i + 1}`;
    if (seen.has(id)) throw new Error(`line ${i + 1}: id "${id}" appears twice`);
    seen.add(id);
    if (!Array.isArray(c.messages) || c.messages.length === 0) throw new Error(`line ${i + 1}: "messages" must be a non-empty array`);
    const messages = c.messages.map((m, j) => {
      const role = m && typeof m.role === 'string' ? ROLES[m.role.toLowerCase()] : undefined;
      if (!role) throw new Error(`line ${i + 1}, message ${j + 1}: role must be user, bot or agent`);
      if (typeof m.text !== 'string') throw new Error(`line ${i + 1}, message ${j + 1}: "text" must be a string`);
      return { role, text: m.text };
    });
    conversations.push({
      id,
      topic: typeof c.topic === 'string' && c.topic ? c.topic : null,
      handoverFlag: c.handover === true,
      messages
    });
  });
  if (conversations.length === 0) throw new Error('no conversations in the file');
  return conversations;
}
