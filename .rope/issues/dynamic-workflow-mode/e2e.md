# Dynamic Workflow Mode E2E

## E1 Shape a dynamic-mode issue

Architecture evidence: I3, I4, I6, F5 — dynamic mode produces a contract-first,
disjoint file-ownership slice set; serial unchanged.
Executor: agent
Risk: local-readonly
Gate Decision: approved
Approved Action: run a dry-run of rope-shape on a sample feature in dynamic mode
Scope: `.rope/issues/dynamic-workflow-mode/` dry-run fixture only; no shipped
skill edits
Command or Steps:
- Run rope-shape on a sample feature, answering "yes" to dynamic mode
- Inspect the resulting issue package
Pass Criteria:
- `mode: dynamic` present in prd.md
- exactly one contract slice (kind: contract) listed first
- implementation slices declare disjoint `Scope`/`owned_files`
- a per-slice size cap is present
- a trailing integration slice is present
Failure Report:
- report which slice kinds are missing or which ownership overlaps
Forbidden Out-of-Scope Actions:
- no edits to shipped skills during this dry-run
Result:
- pending

## E2 Go fans out disjoint slices

Architecture evidence: I1, I2, I3, F1, F2, F3, F4 — go parallelizes only disjoint
frontier slices; overlapping serialize; review gates and verify intact; no
nested spawn.
Executor: agent
Risk: local-readonly
Gate Decision: approved
Approved Action: run a go planning / dry-run on the dynamic-mode sample from E1
Scope: `.rope/issues/dynamic-workflow-mode/` dry-run fixture; no code changes
Command or Steps:
- Plan go for the dynamic-mode sample package
- Inspect the frontier and parallel batches
Pass Criteria:
- disjoint frontier slices are grouped into a parallel batch
- overlapping slices are serialized (not parallelized)
- per-slice review gate is scheduled for each slice
- issue-level verify remains parent-owned and read-only
- no slice is instructed to spawn another slice
Failure Report:
- report any overlapping slice placed in a parallel batch, or any skipped
  review gate
Forbidden Out-of-Scope Actions:
- no edits to shipped skills; no actual parallel spawn in this dry-run
Result:
- pending

## E3 Serial mode unchanged (existing behavior compatibility)

Architecture evidence: I6 — serial behavior unchanged when mode absent/off.
Executor: agent
Risk: local-readonly
Gate Decision: approved
Approved Action: go-plan a `mode: serial` (or absent) package
Scope: `.rope/issues/dynamic-workflow-mode/` dry-run fixture
Command or Steps:
- Plan go for a sample package with `mode` absent or `serial`
Pass Criteria:
- go plan is identical to current serial behavior (no parallel fan-out)
Failure Report:
- report any unintended parallelization
Forbidden Out-of-Scope Actions:
- no edits to shipped skills
Result:
- pending

## E4 Architecture continuity check

Architecture evidence: D1–D5 dispositions hold in the assembled flow; ADR 0003
consistent with CONTEXT term and README.
Executor: agent
Risk: local-readonly
Gate Decision: approved
Approved Action: read-through consistency check
Scope: `.rope/` and README
Command or Steps:
- Compare ADR 0003, `.rope/CONTEXT.md` Dynamic Workflow Mode term, README, and
  the assembled issue package
Pass Criteria:
- ADR 0003 records the decision (opt-in, shape-time toggle, gates preserved,
  reuse presets)
- CONTEXT term and README mention match ADR 0003
- no disposition silently changed to exception/extend without documentation
Failure Report:
- report any doc/ADR mismatch
Forbidden Out-of-Scope Actions:
- no edits during this check beyond any agreed doc fix tracked in Slice E
Result:
- pending