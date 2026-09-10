---
name: rope-clear
description: Cleans stale or contradictory project documentation through an approved edit batch. Use when the user requests document cleanup or obsolete-rule triage.
---

# Rope Clear

Prune stale documentation into current truth, not another summary of the mess.
This skill changes documents, not product behavior or architecture decisions.

## Workflow

1. **Bound the cleanup.** Read repo instructions, `.rope/CONTEXT.md`, routes,
   and the requested paths. Inspect git status and identify tracked, modified,
   untracked, and external/installed files. Default scope is this repo's
   `.rope/` knowledge layer; expand only by user agreement. Record the scope
   in the existing work record. Done when every candidate's ownership and
   preservation needs are known; user edits remain intact.
2. **Establish current truth.** Read
   [current documents](references/current-docs.md) before classifying hits.
   Check each candidate against its status, scope, explicit replacements,
   relevant source/tests, and Git history. Classify: keep, revise, deduplicate,
   retire reference, or unresolved. Age, repetition, and filenames are clues,
   not proof. Done when each proposed change cites evidence or an open question.
3. **Approve a batch.** Present a compact table: path/section, problem,
   evidence, proposed edit, preservation method, and reference checks.
   Ask for one approval of the listed edits; resolve semantic conflicts with
   concrete choices. A general cleanup request is not approval of unseen
   deletions. Untracked content and dirty sections need an explicit retention
   choice because Git may not preserve their current bytes. Done when the
   approved rows and held rows are unambiguous.
4. **Apply only approved rows.** Recheck the candidate content against the
   approved version; intervening edits return that row for confirmation.
   Revise current text in place, consolidate duplicate rules at their owner,
   and repair affected inbound references. Keep formal ADR history with
   accurate replacement/scope markers. Preserve unrelated edits and installed
   copies; updating installations is a separate authorized operation.
   An unresolved row holds only dependent edits. Done when every approved
   row is applied or explicitly blocked, with no unapproved changes.
5. **Verify the reading path.** Check modified links, statuses and surviving
   references. Repeat the searches that exposed each obsolete rule; inspect
   hits rather than demand zero historical matches. From current navigation,
   read the replacement and verify its scope; for ADR history hits, confirm
   the status/replacement identifies why the old rule is not current.
   Read the diff for lost still-valid constraints. Done when every approved
   row has evidence of the intended result or a reported blocker.
6. **Close once.** Update the existing work record with changed paths,
   verification, and unresolved rows. If no record exists, use one
   `.rope/issues/<slug>/quick.md`; keep the inventory there, not a separate
   report per finding. Report a concise diff summary. Commit only when
   authorized by the user's task/workflow, including only approved changes.

## Examples

- A spec contains both “old sessions retain snapshots” and “each turn reads
  current settings.” Trace the accepted change; propose replacing the obsolete
  paragraph and fixing its references. Without a decision, ask which behavior
  must hold — current code alone cannot authorize a contract change.
- Two guides repeat a live rule. Keep the rule at its owner and replace the
  duplicate with a pointer. Git retains the committed previous text.
- A superseded ADR matches grep. Retain its decision history, label its
  superseded scope and replacement, and make current navigation lead to the
  replacement. A raw grep hit is not an active instruction.

## Safety boundary

No product-code changes, new architecture choices, blanket formatting,
Git reset/clean, or automatic installation updates. Without Git history,
preserve content until the user approves a retention method or deletion.
If an approved change reveals a new conflict, return that row for a decision.
