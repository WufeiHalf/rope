# Workflow Execution Mode E2E

## E1 结构校验（skills/spec 一致性）

- Architecture evidence: D3/D4 落地完整性
- Executor: agent
- Risk: read-only
- Gate Decision: not-required
- Command or Steps: 校验 `.agents/skills/rope-shape/SKILL.md`、`rope-go/SKILL.md`、`.rope/specs/dynamic-workflow-mode.md`、ADR 0014 相互引用锚点可解析；`~/.rope/config.toml` 契约在 spec/ADR/rope-go 三处文本一致（同一路径、同一解析顺序）；bundled `skills/` 副本与 `.agents/` diff 为空
- Pass Criteria: 零死链；三处 config 契约一致；双断言 gate 与 mock 边界规则在 shape/go 两侧表述一致
- Forbidden Out-of-Scope Actions: 不实际改 `~/.rope/config.toml`（用户自己的决定）
- Result: agent_passed（2026-09-08）：13 项一致性断言通过（2 项初判 FAIL 为换行断词伪影，人工核正）；bundled 双技能 diff 空

## E2 安装与入口冒烟

- Architecture evidence: 安装链路不受影响
- Executor: agent
- Risk: local-write（写临时 target 目录）
- Gate Decision: not-required
- Command or Steps: `node bin/rope.js add --target /tmp/rope-wem-e2e && diff -r skills .agents`；`node bin/rope.js --help`
- Pass Criteria: 安装成功、副本一致、help 正常
- Forbidden Out-of-Scope Actions: 不碰用户级 `~/.rope/`、`~/.config/rope/`
- Result: agent_passed（2026-09-08）：add --target /tmp/rope-wem-e2e 安装 OK，安装副本 rope-go 与源 diff 空；--help OK

## E3 双案例反推演练（read-through，人工确认）

- Architecture evidence: Evidence Cases 表的可执行性
- Executor: user-run（终审）
- Risk: read-only
- Gate Decision: required（用户确认规则文本真能拦住钉钉级缺陷）
- Command or Steps: 按 tasks.md S2 Demo path 用钉钉 1.6.2 场景反推 shape 产出；按 S3 Demo path 口推 pi/codex 双路径
- Pass Criteria: 用户确认反推产出必含组合根清单/清扫行/L3 行，且双路径 gate 不变量一致
- Forbidden Out-of-Scope Actions: 不实际执行 workflow
- Result: pending
