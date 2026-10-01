# Security

## Reporting a problem

Write to info@innerluxes.dev with the subject line "chat-log-review security", or use private vulnerability reporting on this repository. Please do not open a public issue for a vulnerability.

Include a small made-up conversations file that shows the problem, what you expected and what happened.

## Scope

In scope:

- personal data that reaches a report unmasked
- an input that makes the tool hang or use unbounded memory
- a Markdown report that breaks its table
- anything that makes the tool open a network connection, or read or write a file it was not given

Out of scope: where conversations are stored and who may read them; docs/limits.md lists what a log review cannot see.

Read [docs/threat-model.md](docs/threat-model.md) for the rest.
