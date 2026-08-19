# quick — add-rope-quick-skill

- **status**: done
- **date**: 2026-03-19
- **problem**: 完整管线（grill→shape→go→verify）对"排查已完成的小修复"过重；
  需要一个单模型从头到尾的第二入口（动机案例：agent-workbench LDAP DN-mismatch briefing）。
- **root cause / motivation**: 小修复的成本错在仪式（issue 包、leaf 派发、verify）而非判断；
  GSD `/gsd-quick` 验证了无门 + 默认无 review + 持久小任务记录是上游模式。
- **chosen direction + user decision**: solo 会话；入口无门 + 四条停止线；人当第二双眼
  （收尾报告风险焦点节，默认无 reviewer leaf）；bug 先红后绿；一页 quick.md；内嵌四归宿
  文档同步。GSD 对比见 `.rope/research/gsd-quick-comparison.md`，决策见 ADR 0006。
- **red/green evidence**: TDD waived (docs/skill-only, no code seam)。替代验证：
  `quick_validate.py skills/rope-quick` 与兄弟技能同等通过（`disable-model-invocation`
  为 pi harness 键，Claude 版验证器对 rope-init/rope-summary 同样报 unknown key）；
  `node bin/rope.js add --target ./.agents/skills` 安装成功，rope-quick 出现在技能列表。
- **doc updates**:
  - `.rope/adr/0006-quick-fix-path.md`（新增决策）
  - `.rope/CONTEXT.md`（词条 Quick Fix Path）
  - `.rope/research/gsd-quick-comparison.md`（外部事实）
  - `README.md`（What It Provides / Typical Workflow / .rope layout 三处）
  - specs：skip（无稳定实现契约变化；skill 即产物）
- **human leftovers**: 无（`rope add` 发布属常规 npm 流程，未触生产）。
