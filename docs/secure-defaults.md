# Secure defaults

- **Masked by default.** There is no option to turn masking off.
- **Grouped, not quoted.** The report shows grouped questions and counts, never a full conversation.
- **No network.** The tool only reads the file it is given.
- **No dependencies.** Node 22 or newer and nothing else.
- **Fails closed.** A bad line stops the run with exit code 2 instead of being skipped quietly.
