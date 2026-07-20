# Close gate

Advance `last-reviewed-sha` **only** when the human explicitly closes the review
batch. Abandoned or partial review leaves the pin unchanged; a draft brief may
remain under `reviews/`.

## What counts as close

Human says the batch is done, e.g.:

- “close this harvest”
- “pin it / advance the SHA”
- “batch done, record marks and close”

Not close: silence, “looks interesting”, partial marks without a close phrase,
starting unrelated work.

## On close

1. Ensure the brief’s human marks reflect what the human said (including
   explicit ignores).
2. Set brief `Status: closed` and `Closed at: <ISO date or local timestamp>`.
3. Update `.rope/upstream/mattpocock-skills/source.md`:
   - `Last reviewed SHA: <full tip that was reviewed>`
   - `Last reviewed at: <timestamp>`
4. Confirm out loud: new SHA, brief path, and that **no** `skills/rope-*` files
   were edited by this skill.

## On abandon / partial

1. Leave `last-reviewed-sha` as it was (empty on first baseline).
2. Leave brief `Status: open` (or note abandoned).
3. Do not delete the draft brief unless the human asks.

## Idempotency

- Re-close of an already-closed batch for the same tip: no SHA churn; no
  duplicate brief.
- Delta re-run when tip still equals `last-reviewed-sha`: report clean no-op;
  do not open a noisy empty adopt list.

## After close (A1)

Absorbing an accepted item is a **separate** ordinary edit (same or later
session): e.g. “apply brief item 2 to rope-grill”. This skill does not perform
that edit. Full `rope-grill` / `rope-shape` only for large semantic workflow
shifts, not routine small upstream tweaks.

## Forbidden

- Writing SHA “so we don’t forget” without human close
- Closing automatically because the brief was written
- Closing because fetch succeeded or baseline tip was resolved
- Editing product skills as part of close
