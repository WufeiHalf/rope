# 并行度与验收纪律规则修订 E2E

真实环境行为：本仓库产品即规则文本，其"真实环境"是用真实历史 issue 语料
喂新规则并检查判定 artifact。全部本地只读。

## E1 案例A回放——optimize-turn-tool-token-usage 的 shape 判定

Architecture evidence: ADR 0011（边分类/两段式/粒度规则）；B1、B3、B6
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Scope: 本仓 `.rope/issues/finer-grained-parallel-execution-rules/e2e/case-a/`
内的语料副本与产出 artifact；不写被测历史 issue
Command or Steps:
- 将 `.rope/research/session-01a03d5d-dispatch-metrics.md` 中的案例A事实
  （9 票图、S2/S6 的耐久化深度、S1→S2/S6 无文件重叠）作为输入，按修订后
  rope-shape 规则产出判定 artifact
Pass Criteria:
- S2、S6 被判为应两段式：产出"薄接口票 + 加固票"切分且加固票不被 S3/S7/S8
  Blocked
- S1→S2、S1→S6 被标注 methodology-order（非阻塞派发，仅合并序提示）
- 案例A 原图（宽度3、链长5）触发 B3：存在重切尝试记录
- 判定 artifact 逐条给出"规则条款 → 输入事实 → 判定"链路
Failure Report:
- 记录哪条断言失败、实际判定文本、涉及规则条款原文
Forbidden Out-of-Scope Actions:
- 不修改历史 issue 包原件；不运行任何 agent-workbench 代码
Result:
- pass (2026-08-27) — artifact: e2e/case-a/E1-recut-verdict.md（两段式/重切/demo-path 全过）

## E2 案例A回放——软边判定独立性检查

Architecture evidence: ADR 0011 边分类语义；B5
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Scope: 同 E1 语料
Command or Steps:
- 仅输入依赖边与 owned-files 事实（不给结论提示），按边分类规则独立判定
  S1→S2、S1→S6、S2→S3、S6→S7、S3→S4 的类别
Pass Criteria:
- S1→S2、S1→S6 = methodology-order；S2→S3、S6→S7、S3→S4 = seam-required
- 判定理由引用 owned-files 重叠事实而非记忆中的结论
Failure Report:
- 记录误分类的边与理由
Forbidden Out-of-Scope Actions:
- 同 E1
Result:
- pass (2026-08-27) — artifact: e2e/case-a/E2-edge-classification.md（软边独立判定一致）

## E3 案例A回放——evidence 投影缺口检测

Architecture evidence: ADR 0011 evidence 投影规则
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Scope: 同 E1 语料 + 历史 S1 票的 Required evidence 清单副本
Command or Steps:
- 对照案例A 的 Behavior Matrix 行与历史 S1 票 evidence 清单，执行逐行投影检查
Pass Criteria:
- 检出已知缺口："model-facing size 与最近 tool name 归因"在矩阵有、票上无
  （历史 S1-fix 才补，563 行）
- 输出格式为覆盖率对照表
Failure Report:
- 若未检出缺口，记录投影规则的实际匹配行为
Forbidden Out-of-Scope Actions:
- 同 E1
Result:
- pass (2026-08-27) — artifact: e2e/case-a/E3-projection-check.md（检出 R4 缺口）

## E4 案例B回放——下限规则触发"不切票"

Architecture evidence: ADR 0011 粒度上下限；B2
Executor: agent
Risk: local-readonly
Gate Decision: not-required
Scope: `.rope/issues/finer-grained-parallel-execution-rules/e2e/case-b/`
语料（jenkins-admin-cross-owner 的规模与结构事实副本）
Command or Steps:
- 将案例B（2 票、整变更一窗可容）输入新 shape 规则
Pass Criteria:
- 规则给出"不切票/走 rope-quick（ADR 0006）"建议，而非生成多票包
- 同时验证上限规则未被误触发（无误报"超窗重切"）
Failure Report:
- 记录实际建议与触发/未触发的条款
Forbidden Out-of-Scope Actions:
- 不修改 jenkins-admin-cross-owner 原件
Result:
- pass (2026-08-27) — artifact: e2e/case-b/E4-lower-bound.md（不切票建议，上限无误报）
