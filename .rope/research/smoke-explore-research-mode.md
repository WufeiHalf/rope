# Question

截至 2026-09-04，`mattpocock/skills` 的默认分支是什么？相对上次复核 pin `6654f6b`，上游是否有新提交、多少、主题是什么？

# Verified Facts with Sources

- GitHub 仓库当前默认分支为 `main`；仓库页将仓库标识为公开的 `mattpocock/skills`，提交历史的分支选择器为 `main`。Source: https://github.com/mattpocock/skills
- 当前 `main` tip 为 `3cca18b368ae95cdbdebbff572ccafa662551015`（短 SHA `3cca18b`），提交日期为 2026-09-04。Source: https://github.com/mattpocock/skills/commit/3cca18b368ae95cdbdebbff572ccafa662551015
- 相对基线 `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76`，GitHub compare 显示 `main` ahead by 2 commits、behind by 0。Source: https://github.com/mattpocock/skills/compare/6654f6b...main
- 新提交 1：`8666e05`（2026-09-03），修改 `scripts/link-skills.sh`，使本地安装链接跳过 `misc/`，同时保留 `in-progress/`。Source: https://github.com/mattpocock/skills/commit/8666e05d641f6922993616e92c0cf54a85080bd7
- 新提交 2：`3cca18b`（2026-09-04，合并 PR #1025），合并上述 `link-skills` 行为，并同步更新 `CLAUDE.md` 对链接范围的说明。Source: https://github.com/mattpocock/skills/commit/3cca18b368ae95cdbdebbff572ccafa662551015

# Assumptions

- “上一次复核 pin 是 2026-09-01 tip `6654f6b`”按问题给定值处理；GitHub 当前 compare 将该短 SHA解析为完整提交 `6654f6b60cd9d5be8b54c6fafe44346dabeb3b76`。
- “新提交多少”按 GitHub compare 的提交计数（2）计算，包含一个主题提交和其合并提交。

# Implications

Upstream Harvest 应将 pin 从 `6654f6b` 推进到 `3cca18b`，重点复核安装链接范围收紧（排除 `misc/`）这一维护性变更。 
