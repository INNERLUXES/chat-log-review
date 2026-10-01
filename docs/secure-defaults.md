# Secure defaults

The tool is built so that the default run is the safe run. Nothing below needs a flag.

- **Masked by default.** Email addresses and runs of six or more digits (phone numbers, card numbers, order and account numbers) are replaced with `[email]` and `[number]` before a question enters the report. There is no option to turn masking off.
- **Grouped, not quoted.** The report shows grouped questions and counts, never a full conversation, so an agent's reply or a customer's later message cannot leak through it.
- **No network.** The tool only reads the file it is given. It never sends conversations anywhere, so it can run next to the export inside the network where the logs live.
- **No dependencies.** Node 22 or newer and nothing else, so there is no third-party code that could read the conversations.
- **Fails closed.** A bad line stops the run with exit code 2 and the line number, instead of being skipped quietly and giving misleading numbers.
- **Writes only what it is told to.** Output goes to the screen unless `--output` names a file.

## Sharing a report safely

1. Run the tool where the export already is; do not copy raw logs to another machine for the review.
2. Share the Markdown or text report, not the export. The JSON report holds the same masked data and is safe to keep as a record.
3. Check the top questions before sharing outside the support team: names and street addresses are not masked (see docs/limits.md).
4. Delete the raw export when the review is done, as your data retention rules require.
