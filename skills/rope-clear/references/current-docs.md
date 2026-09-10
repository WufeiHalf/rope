# Current documents

Read when maintaining or consuming project knowledge. Current instructions
and historical evidence serve different readers; keep their boundaries explicit.

## Read current truth

1. Start from repo instructions and routes, then the relevant current source.
   Treat search snippets as leads: open the enclosing section and its status,
   scope, and replacement links before using it as a requirement.
2. Check evidence appropriate to the claim. Source/tests establish implemented
   behavior; an accepted decision establishes intended behavior. A mismatch
   is a conflict to resolve, not automatic permission to rewrite either side.
3. For superseded/deprecated material, follow the explicit replacement.
   For a partially superseded ADR, identify which clauses survive. Unknown
   status or competing active sources that change the task's contract require
   a decision; carry uncertainty instead of silently choosing by recency.

## Maintain one owner

- Edit the smallest existing current document in place. Replace obsolete
  clauses and remove redundant explanations within the authorized scope;
  adding a later contradictory paragraph is not an update.
- Give a rule one authoritative home; other documents link to it. Current
  facts belong in current specs/research/glossary, task history in task records.
  Retire task-local evidence that has stopped being true rather than append
  an opposing map line. Keep reusable findings distinct from hypotheses.
- Ordinary committed prose uses Git for history, not another Markdown archive.
  Before removing uncommitted/untracked content, get an explicit preservation
  choice. A timestamp alone proves neither truth nor recoverability.
- Retain formal ADR decision history. For an approved replacement, update
  status and the replacement link/scope; keep partial supersession precise.
  Amend an existing ADR for a confirmed clarification; record a genuinely new
  decision through the repo's architecture gate. Current navigation points
  to the applicable rule, with history clearly identified as history.
- Resolve skill runtime references relative to the loaded skill directory.
  Installed copies are deployment outputs, not extra canonical sources; report
  discrepancies and leave installation changes to an authorized update.

## Completion check

For every changed rule, inspect its current owner, duplicates, inbound links,
and the search hits that originally exposed it. Current readers must reach one
applicable rule; historical hits must expose status/scope and replacement.
Global grep and external retrieval indexes may still return history — this
contract does not filter arbitrary tools or promise to purge existing sessions.
If an index needs refreshing, report its owner and remaining action explicitly.
