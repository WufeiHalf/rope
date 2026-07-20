# 审查 brief 模板

brief 写入 `.rope/upstream/mattpocock-skills/reviews/`。

**语言：中文**（标题、摘要、逐 skill 对照、建议标记说明均用中文；路径、SHA、skill 名可保留原文标识）。

## 命名

- Baseline：`YYYY-MM-DD-<shortsha>-baseline.md`（shortsha = 已审 tip 前 7 位）
- Delta：`YYYY-MM-DD-<shortsha>.md`
- 同一 tip 同一批次不要重复刷文件

## 对照基准（所有分支都要写清）

| 情况 | 对照什么 |
| --- | --- |
| **有**上次已审 SHA / 上次 closed brief | 上游 `上次 SHA → 本次 tip` 的 allowlist 差异；并简述相对**本地 Rope 落点**是否仍相关 |
| **无**上次记录（Baseline 首次） | 无法做上游区间 diff；对每个 C1 high skill，对照 **本地 Rope 目标 skill**（`correspondence` 的 target，如 `skills/rope-grill`）做思路/流程差异摘要 |

「本地」默认指本仓库产品 skill（`skills/rope-*` 等 correspondence 落点），不是 `~/.agents/skills` 全局安装副本，除非人明确要求。

## 公共页眉

```markdown
# 上游收获审查 — <baseline|delta>

- 上游：https://github.com/mattpocock/skills
- 已审 tip：`<full sha>`
- 区间：`<上次 SHA 或「无（baseline）」>` → `<tip>`
- 对照基准：<上次已审记录 | 本地 Rope 落点（首次 baseline）>
- 克隆路径：<source.md 中的路径>
- 扫描策略：C1 仅 high
- 状态：open | closed
- 关闭时间：_（关闭前留空）_
```

## Baseline 正文

```markdown
## 基线说明

首次钉住该上游（B1）。本 brief **必须**对 C1 high 做「上游 skill ↔ 本地 Rope 落点」对照，
便于你判断以后要不要吸收；**不是**要求你立刻全部 adopt 的推销清单。
真正按上游 commit 区间扫变更，从**下一次** Delta 开始。

## 摘要

- 已审 tip / shortsha
- C1 high 数量；重命名/缺失（如有）
- 相对本地：整体像「已大量分叉 / 部分可借 / 仅同名」一句话

## 逐 skill 对照（C1 high，必填）

### `<matt-skill>` → `<本地 Rope 路径>`

- 上游路径：`skills/<bucket>/<name>/…`
- 上游在做什么：（3～8 句中文，抓流程/门禁/产物，勿贴全文）
- 本地现状：（对应 Rope skill 当前职责，3～8 句中文）
- **差异要点：**（条目列表：本地已覆盖 / 上游多出来的 / 语义冲突 / 命名变更）
- 可选建议标记：adopt | adapt | ignore | watch | _（仅建议，可留空）_
- 人工标记：_（待填）_

## 上游结构观察

- 例如：skill 嵌套在 `skills/<bucket>/`；重命名（to-prd→to-spec）等

## 人工标记汇总

| 项 | 建议 | 人工 | 后续 |
| --- | --- | --- | --- |
| … | adapt | 待填 | 关闭后普通小改；**本 skill 不改** `skills/rope-*` |

## 关闭

- [ ] 人工关闭本批
- 关闭后 last-reviewed-sha：`<tip 或放弃则不变>`
```

### Baseline 结构规则

| 规则 | 要求 |
| --- | --- |
| 文件名 `*-baseline.md` | 是 |
| **中文**正文 | 是 |
| 区间起点为「无（baseline）」 | 是 |
| **逐 skill 对照**一节，覆盖每个 C1 high | **是** |
| 首次 baseline 对照**本地 Rope 落点** | **是** |
| 禁止空 brief（只有 SHA + 名字列表） | **是** |
| 可选建议标记；禁止假装已应用 | 是 |
| 关闭前不推进 SHA | 是 |
| 写 brief 时不改 `skills/rope-*` | 是 |

## Delta 正文

```markdown
## 摘要

- 区间 commits（触及 allowlist）：<n 或 无>
- 是否有实质 allowlist 变更：是 | 否
- 相对上次：一句话
- 相对本地（若相关）：一句话

## 逐 skill 变更（C1 high）

### `<matt-skill>` → `<本地 Rope 路径>`

- 上游变更摘要：（相对上次 SHA；unchanged 可合并到「未变更」一行）
- 相对本地：（该变更对 Rope 落点是否仍值得看）
- 建议标记：adopt | adapt | ignore | watch
- 理由：（1～3 句中文）
- 人工标记：_（待填）_

## 上游缺失路径

- `<matt-skill>`：tip 上不存在（须列出，禁止静默全跳过）
- 或写「无」

## Watch（仅当人点名）

…

## 人工标记汇总

| 项 | 建议 | 人工 | 后续 |
| --- | --- | --- | --- |
| … | … | … | 关闭后普通编辑 / 大改另开 issue |

## 关闭

- [ ] 人工关闭本批
- 关闭后 last-reviewed-sha：…
```

### Delta 结构规则

| 规则 | 要求 |
| --- | --- |
| **中文**正文 | 是 |
| 相对**上次已审 SHA** 的上游 diff 为主 | 是 |
| 建议标记仅是提案 | 是 |
| 缺失路径列出或写「无」 | 是 |
| tip == last 时 clean no-op，不发明 adopt | 是 |
| 不改 `skills/rope-*`；关闭前不推进 SHA | 是 |

### Clean no-op（tip == last）

可用中文短报，不必硬写空 delta 文件：

```text
Delta 无变更：origin/<branch> tip 与 last-reviewed-sha 相同（<full sha>）。
C1 allowlist 无实质变更。pin 未改（无需 close）。未改动 skills/rope-*。
```

## 标记词

| 标记 | 含义 |
| --- | --- |
| `adopt` | 可直接吸收为小改 |
| `adapt` | 有用，需改写成 Rope 语义 |
| `ignore` | 不收 |
| `watch` | 先记着，本批不动 |

Harvest **从不**通过改 `skills/rope-*` 来「完成」标记（A1）。
