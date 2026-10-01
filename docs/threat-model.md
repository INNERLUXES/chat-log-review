# Threat model

## What the tool touches

- It reads one conversations file.
- It writes only when `--output` is given, and only that file.
- It opens no network connection and runs nothing from the file it reads.

## What could go wrong, and what stops it

| Risk | Control |
| --- | --- |
| Personal data from conversations lands in a shared report | Email addresses and long numbers are masked before questions enter the report; only grouped questions are shown, never whole conversations |
| A Markdown report breaks its table | Pipes and line breaks in questions and topics are escaped |
| A malformed export is read wrongly and gives misleading numbers | Every line is checked; a bad line stops the run with exit code 2 and its line number |
| Very large exports | The file is read once and processed line by line in memory; split very large exports by period |

## Out of scope

Where the conversations are stored and who may read them; the chatbot itself.
