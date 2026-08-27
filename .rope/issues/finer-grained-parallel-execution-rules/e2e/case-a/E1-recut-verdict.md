# E1 判定 artifact — 案例A（optimize-turn-tool-token-usage）回放

Executor note: e2e.md 指定 executor=agent；本次 run 为用户指令的 solo 模式
（declared deviation：用户免除叶子派发），由父会话按规则文本逐步执行。

## 断言1：S2 判为两段式契约票（B6）— PASS

- 规则条款：ADR 0011 §2；gates-and-vocab「Two-stage contract slices」
- 输入事实：S2 基础实现 550 行（store schema + 版本化生成记录 + 基本读写），
  fix 轮追加 919 行（durable watermark、stale/ordering guards、sanitized
  errors）——深度耐久化语义存在，且消费者 S3 只需要 store 公共 API
- 判定：**thin-interface + hardening 两段式**
  - S2a（thin-interface）：SQLite schema/migration（唯一归属）+ get-or-create /
    mark 状态机最小可用版 + 公共 API 面 → S3 可 Blocked by S2a
  - S2b（hardening）：durable watermark truth、并发窗口、错误脱敏 → S3 不被
    S2b 阻塞；S2b 与 S3 并行
- 反事实核对：历史 run 中 919 行耐久化返工（1b9ab3ab）全部落在 S3 之前的
  关键路径上 —— 新规则下该返工移出关键路径

## 断言2：S6 判为两段式契约票（B6）— PASS

- 规则条款：同上
- 输入事实：S6 基础 768 行（artifact 写入/引用读取/会话隔离），fix 累计
  1640 行（staging/ready publication、crash-recoverable、并发安全）；消费者
  S7/S8 只需写入+引用读路径；sqlite_runtime.py 迁移归属曾与 S2 相撞
  （14:07 merge-conflict leaf）
- 判定：**thin-interface（写入/读路径+会话隔离）+ hardening（staging/ready
  发布协议）**；sqlite_runtime.py 迁移唯一归属 S2a，S6a 复用其 adapter，
  不再各自触碰迁移

## 断言3：重切尝试记录（B3）— PASS

- 规则条款：ADR 0011 §6；rope-shape step 9（链长 ≥4 触发）
- 输入事实：原图 宽度3 / 链长5（S1→S2→S3→S4/S5→S9）
- 重切尝试（应用 §1 软边降级 + §2 两段式后）：
  - Wave 1: S1 | S2a | S6a（S1→S2/S6 为 methodology-order，不阻塞）
  - Wave 2: S2b | S3 | S7 | S8（宽度 4）
  - Wave 3: S4 | S5
  - Wave 4: S9
  - 新链长 4、启动宽度 3（原图启动宽度 1）
- 记录：重切成功，无需"为何不可"理由

## 断言4：Demo path 逐票可答（B1）— PASS

- 规则条款：ADR 0011 §6；tasks.md 模板 Demo path 字段
- 抽样判定（原图 9 票均无该字段 → 规则要求补齐）：
  - S2a："给定一个 turn id，store 能存取一条版本化 summary 记录（CLI 脚本演示）"
  - S2b："kill -9 后重启，store 恢复到一致水位且并发写不产生双版本"
  - S3："对话中途触发 /summary，返回单次管线汇总而非逐工具重复"
  - 非"层名"式答案 ✓

## 断言5：判定链路可核对 — PASS

每条判定均为「规则条款 → 输入事实 → 判定」三段式（见上），无凭记忆结论。
