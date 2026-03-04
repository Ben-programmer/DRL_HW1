# 📝 Project Development Log

> 記錄 Deep RL HW1 — Grid Map Generator 專案建立的所有步驟

---

## 2026-03-04

### Phase 1 — Flask 網格地圖基礎建置

**目標**：建立 n×n（5~9）互動式網格地圖，支援起點、終點、障礙物設定。

| 步驟 | 檔案 | 說明 |
|------|------|------|
| 1 | `app.py` | 初始化 Flask 應用，建立 `/` 與 `/api/grid` 路由 |
| 2 | `templates/index.html` | 主頁面 HTML，含 Grid 控制面板、模式選擇器、Legend |
| 3 | `static/css/style.css` | 現代簡約暗色 CSS，Inter 字體、圓角元件、漸層標題 |
| 4 | `static/js/grid.js` | 前端互動邏輯：格子生成、點擊處理（起點/終點/障礙物）、Toast 通知 |

**功能規格：**
- Grid 大小：n×n，n ∈ [5, 9]
- 障礙物上限：n - 2 個
- 模式：SET START（綠）/ SET END（紅）/ SET OBSTACLE（灰）/ RESET

---

### Phase 2 — Policy Evaluation（策略評估）功能

**目標**：加入迭代策略評估，顯示 Value Matrix V(s) 與 Policy Matrix π(s)。

| 步驟 | 檔案 | 說明 |
|------|------|------|
| 1 | `app.py` | 新增 `/api/evaluate` API 端點，實作 `policy_evaluation()` 函式 |
| 2 | `templates/index.html` | 新增 `▶ EVALUATE` 按鈕、雙矩陣顯示區塊（`#evalSection`） |
| 3 | `static/css/style.css` | 新增 `.eval-section`、`.matrix-grid`、`.m-cell` 等矩陣相關樣式 |
| 4 | `static/js/grid.js` | 新增 `runEvaluate()`（呼叫後端 API）與 `renderMatrices()`（渲染雙矩陣） |

**演算法規格：**
- 演算法：Iterative Policy Evaluation（Uniform Random Policy）
- γ（折扣因子）：0.9
- θ（收斂閾值）：1e-6
- 最大迭代次數：2000

**Reward 設計：**

| 事件 | Reward |
|------|--------|
| 到達終點 G | +1.0 |
| 碰到障礙物 | -1.0 |
| 其他移動 | -0.04 |

---

### Phase 3 — GitHub Actions 自動部署

**目標**：自動部署到 GitHub Pages，建立說明文件。

| 步驟 | 檔案 | 說明 |
|------|------|------|
| 1 | `docs/index.html` | 純靜態版本（Policy Evaluation 移植至 JS），無需 Flask 後端 |
| 2 | `.github/workflows/deploy.yml` | GitHub Actions workflow，push 到 main/master 觸發部署 |
| 3 | `README.md` | 專案說明、操作流程、演算法說明、部署步驟 |

**部署問題排查：**

| 錯誤訊息 | 原因 | 解法 |
|----------|------|------|
| `Get Pages site failed. Not Found` | Pages 尚未啟用，且 `configure-pages` 無法自動創建 | 加上 `enablement: true` 參數 |
| `Resource not accessible by integration` | `GITHUB_TOKEN` 無 admin 權限，無法透過 API 創建 Pages | 移除 `configure-pages` step，改由 Settings 手動啟用一次 |
| 打開頁面顯示 README.md | Pages Source 設定為 "Deploy from a branch"（root），Jekyll 渲染 README | Settings → Pages → Source 改為 "GitHub Actions" |

**最終 workflow 結構（移除 `configure-pages`）：**
```yaml
steps:
  - uses: actions/checkout@v4
  - uses: actions/upload-pages-artifact@v3   # 打包 docs/
  - uses: actions/deploy-pages@v4            # 部署
```

---

## 最終檔案結構

```
HW1/
├── app.py                        # Flask 後端（本地開發）
├── templates/
│   └── index.html                # Flask 模板
├── static/
│   ├── css/style.css             # 現代簡約暗色樣式
│   └── js/grid.js                # 前端互動邏輯
├── docs/
│   └── index.html                # 純靜態版（GitHub Pages 用）
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD 自動部署
├── README.md                     # 專案說明
└── log.md                        # 本檔案

---

### Phase 4 — UI 現代化重設計（2026-03-04）

**目標**：將像素風格改為現代簡約暗色風格，提升可讀性。

| 步驟 | 檔案 | 說明 |
|------|------|------|
| 1 | `static/css/style.css` | 完整重寫：Inter 字體、CSS 變數系統、圓角元件、移除 scanlines/glitch |
| 2 | `templates/index.html` | 更新字體載入（Inter）、移除 scanlines div、現代化文字內容 |
| 3 | `docs/index.html` | 同步更新內嵌 CSS 與 HTML（GitHub Pages 版） |

**風格變更重點：**
- 字型：`Press Start 2P` / `VT323` → `Inter`
- 標題：漸層文字（白→綠），移除 glitch 動畫
- 邊框：像素厚邊框 → 1px 細實線 + border-radius
- 移除：CRT scanlines、text-shadow 發光、inset pixel shadow
```
