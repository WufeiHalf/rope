# quick: dynamic 执行普适调优（源自 session 01a0840a 现场报告）

status: done（六单元 + 安装副本同步，2026-09-10）

## 问题 / 根因

dynamic 模式（ADR 0014）首次全流程实战暴露 7 项问题，6 项根因在 rope
规范/技能层（详见 `.rope/research/session-01a0840a-dynamic-field-report.md`）：
研究叶子降级 twin、grill/shape 不感知 dynamic、workflow 丢 setup step-0、
全量测试×11+波次 barrier（4200s）、终审 fail 回主模型自修、E2E 静态分类
不看本机工具面。MR 术语撞车经定位为仓库侧简报措辞，用户决定不处理。

## Grill 记录（两轮决策）

1. explore preset 工具面**不限制**，mode 纪律进正文（用户定）
2. DW 规范四项修订全采纳：setup 第0步注入 / 图调度 frontier / 门禁分层 / 防假绿
3. 终审=双叶子+**冻结点**修复环（并发污染顾虑由冻结协议解除）
4. E2E=机制相对分类+harness 能力探测
5. 阶段感知=grill 第0步机械解析（不问用户/不进 issue 包），贯穿 shape/go
6. 执行方式：用户改判 rope-quick 六单元串行 + write-a-skill/
   writing-great-skills 写作标准

## 变更与红→绿证据（每单元 grep 红→绿 + quick_validate）

- U1 b9b0865 spec 四项+rope-go dynamic 段+ADR0014 附录（红：frontier/
  step0/防假绿/全量禁令全 0 命中→绿：全在）
- U2 72596b6 spec 终审冻结点协议段+execution-rules/rope-go 镜像
- U3 c322c8d E2E 机制标签七类+探测规则（gates-and-vocab/execution-rules/
  shape/verify 四处）
- U4 4d2aa41 grill 第0步解析+research fan；shape 宽度优先
- U5 ef3a0b5 explore unrestricted（role-schema/mode 契约/harness-presets）
  + pi 本机 preset 再生成 + **真联网冒烟通过**（GitHub compare，研究文件
  四节合规，见 smoke-explore-research-mode.md）
- U6 871091a CONTEXT 三术语 + specs 索引
- sync 8429b12 .agents/skills 安装副本同步（本仓会话加载副本）

## Doc 同步

specs ✓（dynamic-workflow-mode）、adr ✓（0014 附录）、research ✓（现场
报告+冒烟）、CONTEXT ✓。routes 无需变。quick_validate 全绿
（harness-presets 的 disable-model-invocation 警告为既有 pi 约定错配，
HEAD 前已存在）。

## 人类遗留

- agent-workbench 侧（wayfinder 简报"切片"措辞、该仓 .agents/skills 副本）
  不在本次范围
- 下一个真实代码仓 issue 即新规则首验场（图调度+setup 注入+脚本内终审）
