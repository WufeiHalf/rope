# Rope Specs

Stable implementation contracts and project coding rules.

## Areas

- `guides/` - general thinking and verification guides, including `architecture-continuity.md` for issue decision handoff and evidence.
- `<area>/` - area-specific implementation contracts.
- `review-cost-optimization.md` - end-of-issue review cost contract (ADR 0010): two parallel read-only leaves, scanner/reviewer brief budgets, diff hygiene, blocking-only fix protocol with delta re-review.
- `plan-artifact-reader-layering.md` - reader layering contract (ADR 0005): Contract Note, Minimal Leaf Brief allowlist + line cap, unresolved-question policy.

## Usage

Before changing code, read the specs relevant to the target area. After fixing a
bug or discovering a reusable contract, update the smallest relevant spec.
