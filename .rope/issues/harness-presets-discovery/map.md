# harness-presets-discovery Investigation Map

- `.agents/skills/rope-harness-presets/SKILL.md` Host support 表：pi implemented / other `writer_not_implemented` 硬停（2026-09-08）
- `.agents/skills/rope-harness-presets/SKILL.md` Soft-degrade contract：manifest/agents 缺失 → go/verify 用 generic worker + `preset_missing` 继续，不硬阻塞（2026-09-08）
- `references/pi-adapter.md` 硬编码 `~/.pi/agent/settings.json` 的 enabledModels 发现路径（2026-09-08）
- `references/manifest-schema.md` manifest 目标 `~/.config/rope/harness/pi.json`，字段含 host/roles/sources/confidence/generated_at（2026-09-08）
- `skills/rope-harness-presets/` bundled 副本与 `.agents/` 当前完全同步（diff -rq 无差异，2026-09-08）
- 本机 CLI：codex-cli 0.153.4（`~/.nvm/.../bin/codex`）、agy 1.1.23（`~/.local/bin/agy`）、gemini 亦在（2026-09-08）
- 同事案例：codex 中调用本 skill，模型回复"pi 的维护规则不适用当前环境"（用户口述 2026-09-08，未本机复现）
- `.rope/CONTEXT.md` 术语 Harness Profile / Role Preset：宿主原生模板 + 用户级 manifest + manual-only 刷新（2026-09-08）
- 用户决策（grill 2026-09-08）：不做写死 adapter；skill 改发现式，LLM 在对应 harness 自找方案；验证 = 本机 agy + codex 实跑，tmux 隔离，最小仓库排 confounder
- 【E2 实跑证伪/新知 2026-09-08】agy 注册点为机器级 `~/.gemini/config/agents/*.md`，项目级 `.agents/agents/` 不被 CLI 发现；frontmatter `model` 仅收 tier 别名（pro/flash/flash_lite/inherit）；模型目录可用 `agy models` 命令；三个 rope-* agent 注册成功、agy.json 合法
- 【E1 实跑 pass 2026-09-08】codex 写出原生 TOML 三件（model+model_reasoning_effort+developer_instructions，含禁嵌套）+ codex.json（confidence high，官方文档引用）；额外发现原生目录源 ~/.codex/models_cache.json；升级 0.153.4+ 后需复验
