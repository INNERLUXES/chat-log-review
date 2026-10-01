# 1. Mask before anything is counted

## Context

Chat logs hold what customers type: emails, phone numbers, card numbers, order numbers. A review report is shared with product, support and engineering, who should not all see that data.

## Decision

Questions are masked before they are grouped or shown, and the report never contains whole conversations. Masking cannot be switched off.

## Consequences

The report can be pasted into a ticket or a review document. Questions that differ only in a number are grouped together, which also makes the counts more useful.
