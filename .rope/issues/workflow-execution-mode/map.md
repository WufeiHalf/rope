# Workflow Execution Mode Evidence Map

- 2026-09-08 三方证据定案（会话内）：
  - 钉钉 v1.6.2 定论：`architecture-deepening-round2` S2 owned files 不含两个断裂消费者文件（`dingtalk_stream_assembly.py` 仅 status 注记、`workbench_intake_facade.py` 零提及）；E1 Pass Criteria 只验 bootstrap 生命周期 + grep 不变量选错（`import scripts` 而非迁移符号）；修复 commit `293187a9`（build_reply_delivery_marker seam + 回归测试）。→ 证 Matrix 行 4/5/8。
  - workflow 复跑实验：`.rope/research/dynamic-workflow-replay-legal-finance.md`（gate 单断言放行部分集成 → 行 6 双断言；map.md 冲突 → 行 7 evidence 行返回；resume 不能带 gate、gate 脚本落仓库文件）。
  - legal E4：组合层人工发现降级为终审抽检的依据（原 run e2e 记录 + 复跑对照 §2）。
- 待补（执行时）：
  - S1 done：ADR 0014 + spec 契约指针 → 行 1/2/3
  - S2 done：shape 规则文本 + 钉钉反推演示 → 行 4/5/7/8
  - S3 done：rope-go workflow 段 + gate 菜单 → 行 3/6/9；E2 冒烟输出
  - E3 用户确认记录
- 2026-09-08 执行完毕（parent self-run，用户指令）：
  - S1 done `3be8fcd`：ADR 0014（含 config 示例/解析伪码/双案例）+ spec 重写 + index 登记 + ADR 0003 状态指针 `c35bb01` → 证矩阵行 1/2/3
  - S2 done `3c3ebf3`：shape 三规则（清扫/账本/组合根）+ 模板块 + bundled 同步 → 证行 4/5/7/8
  - S3 done `f676c21`：go workflow 执行段（L1/L2/L3 菜单、禁 resume+gate、跑后补记、软降级）→ 证行 3/6/9
  - E1 agent_passed：13 项跨文件一致性断言（2 项初判 FAIL 为换行断词伪象，人工核正）
  - E2 agent_passed：add --target 安装副本 diff 空 + --help OK
  - E3 user-run pending：钉钉 1.6.2 反推 + pi/codex 双路径口推，待用户确认
