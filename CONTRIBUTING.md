# Contributing

Every change goes through a pull request and is reviewed before it is merged. The pipeline runs the tests on Linux, Windows and macOS, the repository checks, CodeQL, and a secure development check of the repository itself.

## Adding or changing a number

1. Describe it in docs/metrics.md first: when a conversation counts.
2. Add a test with small, made-up conversations where the result can be worked out by hand.
3. Anything that could show personal data goes through `mask` first.

## Rules for the code

- No runtime dependencies. Node 22 or newer and nothing else.
- The tool reads the file it is given and writes only when `--output` is given. It opens no network connection.
- Never commit real conversations, even as fixtures.

## Before you open the pull request

```
npm test
npm run check
npm run example
```
