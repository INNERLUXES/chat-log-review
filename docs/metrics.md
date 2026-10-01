# What each number means

| Number | Counted when |
| --- | --- |
| Resolved without a person (containment) | the conversation has no agent message and no `"handover": true` |
| Handed over to a person | the conversation has an agent message or `"handover": true` |
| Asked for a person | a user message contains a phrase from the ask-human list (`human`, `real person`, `agent`, `representative`...) |
| With a fallback answer | a bot message contains a phrase from the fallback list (`I'm not sure`, `could you rephrase`...) |
| User turns on average | user messages per conversation |
| Question behind a handover or fallback | the user message just before the first fallback answer, else the first user message, masked |
| Handovers by topic | handed-over conversations per `topic`, highest first |

`--min-containment` turns containment into a gate for a pipeline or a weekly job: exit code 1 when it falls below the line.
