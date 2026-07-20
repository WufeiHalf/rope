# Integration Boundary Guide

Use this guide when work crosses package, process, network, filesystem, or
human-operator boundaries.

## Purpose

- Keep unit seams and real integration paths distinct.
- Decide what can be simulated versus what must be exercised live.
- Make gate risk explicit before agents run write or remote actions.

## Boundary Checklist

- Who owns the behavior under test, and who is only a collaborator?
- Is the check hitting a real entrypoint or a convenient internal seam?
- What side effects cross the boundary (files, network, credentials, UI state)?
- What is safe to run as `agent`, what needs `agent-with-gate`, and what is `user` only?
- What failure signal proves the boundary broke (exit code, log, artifact, UI)?

## Rules

- Prefer the shallowest real boundary that still validates the contract.
- Do not treat mocked collaborator success as proof of the real integration path.
- For gated actions, record approved action, scope, pass criteria, and forbidden out-of-scope actions.
- If a boundary cannot be exercised now, mark it `not-run` or blocked with an explicit reason — do not silently skip.
