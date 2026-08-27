# E4 判定 artifact — 案例B（jenkins-admin-cross-owner）下限规则（B2）

Executor note: solo 模式（同 E1 声明）。

## 输入事实（语料副本）

- 历史 issue：2 张票（S1 contract ~400 行/2 文件 → S2 vertical ~400 行/2 文件），
  串行链
- 规模事实：全变更 diff 估算 ≈800 行、4 个 owned 文件、单一 concerns
  （admin 跨 owner 访问校验 + 其管理界面）——一个 fresh context window
  （~100k tokens 预算）明显可容

## 规则判定

- 规则条款：ADR 0011 §6 下限——"a change that fits one fresh context window
  does not become a multi-slice issue — recommend `rope-quick` (ADR 0006)"
- 判定：**不切票。建议走 rope-quick 单 session**（调查已完成的小型修复路径，
  human 为验收门）
- 上限规则复查：每票均 <400 行 → **无误报触发**（不会给出"超窗重切"）

## 判定 — PASS

- e2e.md Pass Criteria 两条均满足：给出不切票建议 ✓；上限无误报 ✓
