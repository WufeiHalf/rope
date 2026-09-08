# harness-presets 发现在化重构 E2E

## E1 codex 真机实跑（发现式主路径）

Architecture evidence: D1/D4；矩阵行 1、2——codex 宿主上发现流程产出原生预设与 manifest，且能派生正确配置的 subagent
Executor: agent-with-gate
Risk: local-write（写 `~/.codex/**`、`~/.config/rope/**`、`/tmp` 最小仓库）
Gate Decision: approved（用户批准 2026-09-08：tmux 隔离、最小仓库、只写 `~/.codex/**`、`~/.config/rope/**`、`/tmp/**`，不碰 `~/.pi/**` 与同事环境）
Approved Action: 在 tmux 隔离会话 + 最小仓库（无 rope 的 AGENTS.md/confounder）中调用 rope-harness-presets；写入用户级配置目录；（可选）升级本机 codex 0.153.4
Scope: `~/.codex/**`、`~/.config/rope/**`、`/tmp/**`；不碰 `~/.pi/**` 与同事环境
Command or Steps:
- tmux new -s codex-e2e（隔离观察）
- 建最小仓库：`mkdir /tmp/rope-codex-e2e && cd /tmp/rope-codex-e2e && git init`（不放 AGENTS.md）
- 在 codex 会话中调用 rope-harness-presets skill（按 S1 research 记录的 codex 调用方式）
- 观察：拒绝与否、产出文件、manifest 内容、subagent 派生
Pass Criteria:
- 不再出现"pi 专属/不适用"拒绝
- 产出 codex 原生格式角色模板 + `~/.config/rope/harness/codex.json`（schema 合法、含 confidence/sources）
- codex 能按产出配置派生 subagent；不能则产出显式能力缺口记录（也算过，但记录进 research）
Failure Report:
- 记录 codex 原始回复、产物路径清单、manifest 内容、tmux 会话日志
Forbidden Out-of-Scope Actions:
- 修改 `~/.pi/**`；联系/操作同事环境；任何远程/生产资源；升级 codex 之外的环境变更
Result:
- pending

## E2 agy 泛化探针（无预置知识宿主）

Architecture evidence: D1/D4；矩阵行 1、4——发现流程对"skill 无预置知识"的宿主仍能自适配或显式报告缺口
Executor: agent-with-gate
Risk: local-write（写 agy 用户级配置、`~/.config/rope/**`、`/tmp`）；网络经 `http://127.0.0.1:8118` 代理
Gate Decision: approved（用户批准 2026-09-08，范围同 E1，另加 8118 代理联网）
Approved Action: 与 E1 同构，宿主换 agy 1.1.23（tmux + 最小仓库 + 代理）
Scope: agy 用户级配置目录、`~/.config/rope/**`、`/tmp/**`
Command or Steps:
- 同 E1，宿主换 agy；若 agy 需要联网检索其文档，走 127.0.0.1:8118
Pass Criteria:
- 得到 agy 生态的原生方案（或显式能力缺口报告 + 软降级记录），全程无 `~/.pi/` 路径写入
Failure Report:
- 同 E1
Forbidden Out-of-Scope Actions:
- 同 E1
Result:
- pending
