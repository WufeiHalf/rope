# Rope Specs

Stable implementation contracts and project coding rules.

## Areas

- `guides/` - general thinking and verification guides, including `architecture-continuity.md` for issue decision handoff and evidence.
- `<area>/` - area-specific implementation contracts.
- `review-cost-optimization.md` - review-mode contract (ADR 0004): `review: per-slice | batch` field, three-valued slice marking, batch review execution, briefs by reference, lean parent load.

## Usage

Before changing code, read the specs relevant to the target area. After fixing a
bug or discovering a reusable contract, update the smallest relevant spec.
