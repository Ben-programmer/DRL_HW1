# 🎮 Grid Map Generator — Deep RL HW1

> 深度強化學習作業一：互動式 n×n 網格地圖生成器，支援價值迭代（Value Iteration）與最佳策略（Optimal Policy）視覺化。

[![Deploy to GitHub Pages](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/deploy.yml)

🌐 **Live Demo**: [https://YOUR_USERNAME.github.io/YOUR_REPO](https://YOUR_USERNAME.github.io/YOUR_REPO)

---

## 📋 專案說明

本專案為一個**現代簡約暗色**互動式網格地圖，核心功能：

- **網格生成**：支援 n×n（5 ≤ n ≤ 9）網格
- **環境設定**：透過滑鼠點擊設定起點（S）、終點（G）與障礙物
- **Value Iteration**：以價值迭代計算最佳狀態價值 V*(s) 與最佳策略 &pi;*(s)
- **雙矩陣視覺化**：同步顯示 **Value Matrix V(s)** 與 **Policy Matrix π(s)**

---

## 🏗️ 專案架構

```
HW1/
├── app.py                        # Flask 後端（本地開發用）
├── templates/
│   └── index.html                # Flask 模板（本地開發）
├── static/
│   ├── css/style.css             # 現代簡約暗色樣式
│   └── js/grid.js                # 前端互動邏輯
├── docs/
│   └── index.html                # 純靜態版本（GitHub Pages 部署用）
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions 自動部署
└── README.md
```

---

## 🚀 本地開發（Flask）

### 1. 安裝依賴

```bash
pip install flask
```

### 2. 啟動伺服器

```bash
python app.py
```

### 3. 開啟瀏覽器

前往 [http://127.0.0.1:5000](http://127.0.0.1:5000)

---

## 🌐 GitHub Pages 部署

### 方法一：自動部署（推薦）

每次 push 到 `main` / `master` 分支，GitHub Actions 會自動將 `docs/` 資料夾部署到 GitHub Pages。

**啟用步驟：**

1. 前往 GitHub Repo → **Settings** → **Pages**
2. Source 選擇 **GitHub Actions**
3. Push 任意 commit 到 `main` 觸發部署

### 方法二：手動觸發

前往 **Actions** → `Deploy to GitHub Pages` → **Run workflow**

---

## 🎮 操作流程

| 步驟 | 操作 | 說明 |
|------|------|------|
| 1 | 設定格數 | 輸入 n（5~9），按 **GENERATE** |
| 2 | 設定起點 | 模式選 `SET START`，點擊格子（綠色） |
| 3 | 設定終點 | 模式選 `SET END`，點擊格子（紅色） |
| 4 | 設定障礙物 | 模式選 `SET OBSTACLE`，點擊格子（灰色，最多 n-2 個） |
| 5 | 執行計算 | 按 **▶ Value Iteration** |
| 6 | 查看結果 | 頁面主網格會顯示各狀態 V*(s) 與箭頭，**最佳路徑**將以藍色高亮顯示。下方則會顯示完整的 Value Matrix 與 Policy Matrix 數值表 |

> 再次點擊障礙物格子可移除；按 **RESET** 清除所有設定。

---

## 🧮 演算法說明

### Value Iteration（價值迭代）

使用 **Value Iteration** 算法計算最佳價值函數 $V^*(s)$：

$$V^*(s) \leftarrow \max_{a} \sum_{s'} P(s'|s,a) \left[ R(s,a,s') + \gamma V^*(s') \right]$$

| 參數 | 值 | 說明 |
|------|----|------|
| γ（折扣因子） | 0.9 | 未來獎勵折扣率 |
| θ（收斂閾值） | 1e-6 | 迭代停止條件 |
| Max iterations | 10000 | 最大迭代次數 |

### Reward 設計

| 事件 | Reward |
|------|--------|
| 到達終點 G | +1.0 |
| 碰到障礙物 | -1.0 |
| 其他移動 | -0.04 |

### Optimal Policy（最佳策略）

根據收斂的 $V^*(s)$ 提取最佳策略：
$$\pi^*(s) = \arg\max_a \sum_{s'} P(s'|s,a) \left[ R(s,a,s') + \gamma V^*(s') \right]$$

---

## 🛠️ 技術棧

| 層級 | 技術 |
|------|------|
| 後端（本地） | Python · Flask |
| 前端 | Vanilla HTML/CSS/JS |
| 字型 | Google Fonts（Inter） |
| 部署 | GitHub Pages + GitHub Actions |
| 風格 | Modern Minimal Dark Mode |

---

## 📝 課程資訊

- **課程**：深度強化學習（Deep Reinforcement Learning）
- **學校**：國立中興大學 資訊工程學系
- **學年**：114-2
