# E3 判定 artifact — 案例A evidence 投影缺口检测

Executor note: solo 模式（同 E1 声明）。按 ADR 0011 §3 对历史 S1 票执行
逐行投影覆盖率检查。

## 输入

- 矩阵/PRD 行（历史 PRD 归因要求摘录）：
  - R1 per-request token 归因（provider request 层）
  - R2 turn 级别归因
  - R3 phase 级别归因
  - **R4 model-facing 归因：历史消息尺寸 + 最近 tool name 维度**
- 历史 S1 票 Required evidence 实录：仅覆盖 R1–R3 的测试证据
  （feat 7cbbad59 落地 360 行；R4 缺失）

## 覆盖率对照表

| 矩阵行 | 票内 evidence 条目 | 判定 |
| --- | --- | --- |
| R1 request 归因 | E1: focused pytest 断言 request payload 字段 | ok |
| R2 turn 归因 | E2: turn runner 单测 | ok |
| R3 phase 归因 | E3: phase 归因单测 | ok |
| R4 model-facing（history/tool size + 最近 tool name） | （无） | **GAP** |

## 判定 — PASS

- 规则检出已知缺口：R4 在矩阵有、票上无。历史后果实证：S1-fix（7512a9b7）
  补 563 行（"add history/tool size attribution"），即该缺口的返工成本。
- 输出格式为覆盖率对照表 ✓（e2e.md Pass Criteria 两条均满足）
