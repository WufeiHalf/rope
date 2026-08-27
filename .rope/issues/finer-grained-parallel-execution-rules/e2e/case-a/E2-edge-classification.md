# E2 判定 artifact — 案例A 软边独立性检查（B5）

Executor note: solo 模式（同 E1 声明）。仅依据 owned-files 与接缝事实判定，
不引用研究笔记中的预存结论。

输入事实（来自历史 tasks.md / git）：
- S1 owned: agent_cache_telemetry.py, agent_turn_runner.py
- S2 owned: sqlite_runtime.py, session_summary_store.py, session_summary_types.py
- S3 owned: summary runtime（消费 S2 的 store API）
- S4 owned: webui summary 路由/UI（消费 S3 管线）
- S5 owned: 代码变更门禁 UI+路由（消费 S3 管线快照）
- S6 owned: tool_result_artifact_store.py（新）, agent_tool_catalog.py；迁移
  触碰 sqlite_runtime.py（冲突史）
- S7/S8 owned: 投影/原生工具模块（消费 S6 写入与引用读）
- S9 owned: benchmark 脚本（消费 S3/S4/S5/S7/S8 产物）

| 边 | 判定 | 理由（规则→事实→判定） |
| --- | --- | --- |
| S1→S2 | **methodology-order** | file-overlap 测试：两票 owned 无交集；seam 测试：S2 的 store 读写不调用 S1 的 telemetry API → 两项均不成立，仅"先有计量再动实现"的顺序偏好 |
| S1→S6 | **methodology-order** | 同上：S6 新模块 + catalog 与 S1 owned 无交集；artifact 写入不消费 telemetry 接口 |
| S2→S3 | **seam-required** | S3 的 runtime 调用 store 的 get-or-create/mark API（S2 创建的公共面） |
| S6→S7 | **seam-required** | S7 投影读取 S6 的 artifact 引用接口 |
| S6→S8 | **seam-required** | S8 原生工具的 artifact projection 调用 S6 写入原语 |
| S3→S4 | **seam-required** | S4 的 /summary 命令执行 S3 的单次管线 |
| S3→S5 | **seam-required** | S5 门禁取 S3 的快照生成能力 |
| S4/S5/S7/S8→S9 | **seam-required** | S9 benchmark 采集各票公开产物指标 |

结论：按 ADR 0011 §1，仅 methodology-order 两条降级；派发就绪集在 t0 为
{S1, S2a, S6a}（结合 E1 两段式重切）。判定依据均为 owned-files 事实，
与预存结论一致但独立得出。
