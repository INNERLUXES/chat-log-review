# Limits

- **Silent failures.** A customer who leaves without saying anything looks like a resolved conversation. Combine containment with a short rating question or with repeat contacts from the same customer.
- **Phrase lists.** Fallbacks and requests for a person are found by phrases. A bot that says "I couldn't find that" is only caught if that phrase is in the list; pass your bot's own wording with `--fallback`.
- **Masking.** Email addresses and runs of six or more digits are masked. Names, street addresses and identifiers written with letters are not; do not share reports outside the team that may see the conversations.
- **Grouping.** Questions are grouped when they differ only in case, punctuation, spacing or masked values. Questions that mean the same in different words are counted apart.
- **One file.** The tool reads one export at a time. Compare periods by running it on each period's file.
