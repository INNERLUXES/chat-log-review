# chat-log-review

Shows where a chatbot lets people down, from its own conversation logs.

A chatbot improves only when someone reads what went wrong: the questions it could not answer, the moments people asked for a human, the topics that end with an agent anyway. Reading thousands of transcripts by hand does not happen. This tool reads exported conversations and answers:

- How many conversations ended without a person (containment)?
- How many were handed over, and in how many did the customer ask for a person?
- How often did the bot give a fallback answer such as "I'm not sure" or "could you rephrase"?
- Which questions sit behind the handovers and fallbacks, grouped and counted?
- Which topics end with a person most often?

Email addresses and long numbers (phones, cards, order numbers) are masked before anything reaches the report, so it can be shared with the team. Plain JavaScript, no dependencies; it reads the file you give it and opens no network connection.

```
npm test
```

```
ℹ tests 10
ℹ pass 10
ℹ fail 0
```

## Quick start

Requires Node 22 or newer. There is nothing to install.

```
git clone https://github.com/INNERLUXES/chat-log-review.git
cd chat-log-review
node bin/chat-log-review.js examples/conversations.jsonl
```

```
chat-log-review: 10 conversation(s)

  resolved without a person: 6 (60.0%)
  handed over to a person:   4
  asked for a person:        2
  with a fallback answer:    4
  user turns on average:     1.2

Questions behind handovers and fallbacks:
    3  Can I return a gift without the receipt?
    1  I was charged twice, my card is [number]

Handovers by topic:
  returns: 3 of 4 (75.0%)
  billing: 1 of 2 (50.0%)
  account: 0 of 1 (0.0%)
  orders: 0 of 3 (0.0%)
```

The made-up shop in `examples/` has one clear gap: three customers asked about returning a gift without a receipt and the bot had no answer. One help article fixes most of the returns handovers.

## The input file

JSON Lines, one conversation per line; blank lines and lines starting with `#` are skipped.

```json
{"id": "c04", "topic": "returns", "handover": false, "messages": [{"role": "user", "text": "Can I return a gift without the receipt?"}, {"role": "bot", "text": "I'm not sure about gifts without a receipt."}, {"role": "agent", "text": "Hi, I can help with that."}]}
```

Roles are `user` (or `customer`), `bot` (or `assistant`) and `agent` (or `human`). A conversation counts as handed over when it has an agent message or `"handover": true`. `topic` is optional. Most chat platforms can export to this shape with a short script.

## Options

```
--top <n>                 how many questions to list (default: 10)
--fallback <a|b|c>        phrases that mark a fallback answer (replaces the built-in list)
--ask-human <a|b|c>       phrases that mark a request for a person (replaces the built-in list)
--min-containment <0..1>  exit with 1 when containment is below this
--format <name>           text, markdown or json
--output <file>           write the report to a file
```

The built-in phrase lists are English; pass your own for other languages or for your bot's exact wording. Exit codes: `0` done, `1` containment below `--min-containment`, `2` a usage or input error.

## Limits

[docs/limits.md](docs/limits.md) lists what a log review cannot see, such as a customer who gave up without saying so.

## Background

- How chatbots are built, tested and improved from real conversations: [AI chatbot development services](https://innerluxes.dev/artificial-intelligence/chatbot-development).
- [OWASP Top 10 for LLM Applications](https://genai.owasp.org/llm-top-10/): sensitive information disclosure is one reason logs are masked before review.

## License

MIT
