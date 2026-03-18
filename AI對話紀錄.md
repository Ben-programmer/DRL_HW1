# 🤖 AI 協作開發紀錄：Grid Map Generator

此文件記錄了在此次對話中，與 AI 助理合作開發 **「深度強化學習作業一：網格地圖產生器 (Grid Map Generator)」** 的完整過程與決策細節。

---

## 📅 開發時間
- **開始時間**: 2026-03-04
- **結束時間**: 2026-03-18 (紀錄生成時間)

## 📌 專案目標
開發一個基於網格大小 $n \times n$ (允許用戶設定 $n \in [5, 9]$) 的互動式網格地圖，具備以下需求：
1. **風格要求**：已從原本的 Pixel Art 像素風格全面升級為現代簡約深色主題 (Modern Minimal Dark Theme)。
2. **核心功能**：
   - 點擊設定「起點（Start, 綠色）」
   - 點擊設定「終點（End, 紅色）」
   - 點擊設定「障礙物（Obstacle, 灰色）」，上限為 $n-2$ 個。
3. **進階需求 (價值迭代 Value Iteration)**：
   - 使用 Value Iteration 評估每個狀態的最佳價值 $V^*(s)$ 與最佳策略 $\pi^*(s)$。
   - 根據價值推導並於網格上高亮顯示從起點到終點的最佳路徑（Optimal Path）。

---

## 🛠️ 開發階段與歷程

### Phase 1: 基礎網格環境建置 (Flask + Vanilla HTML/CSS/JS)
- **初始設計**: 
  - 建立 Flask 後端 `app.py` 提供基礎路由與 API。
  - 設計 `index.html` 網頁結構，包含設定區塊（n 值設定）、狀態列、模式切換按鈕（設定起點/終點/障礙物/重置）與網格顯示區。
- **視覺風格**: 
  - 撰寫 `style.css` 引入 Google Fonts (`Press Start 2P`, `VT323`)。
  - 實作 CRT 掃描線特效、文字 Glitch 動畫以及動態發光（Pulse）效果。
- **前端邏輯**: 
  - 實作 `grid.js`，包含：動態生成 HTML DOM 的網格、處理滑鼠點擊事件、維護目前模式狀態（Start/End/Obstacle）、以及推播 Toast 訊息通知使用者錯誤或成功操作。
- **測試驗證**: 成功驗證 $n=5$ 網格的生成、起點/終點的單一性以及 $n-2$ 障礙物數量的限制，UI 完全符合像素風。

### Phase 2: 實作策略評估與雙矩陣顯示 (Policy Evaluation)
- **功能擴充**: 
  - 後端 `app.py` 新增 `/api/evaluate` API，實作 `policy_evaluation` 演算法。
  - **環境設定 (Reward)**: 抵達終點 $+1.0$，撞到障礙物 $-1.0$，其餘移動懲罰 $-0.04$。折扣因子 $\gamma=0.9$、收斂閾值 $\theta=10^{-6}$。
  - 演算法先評估 $V(s)$，待收斂後萃取出最佳動作組合（Greedy Policy）。
- **前端呈現**: 
  - `index.html` 與 `style.css` 加入新的顯示區域，將結果分為左右並列的 **Value Matrix $V(s)$** 與 **Policy Matrix $\pi(s)$** 兩個網格區塊。
  - `grid.js` 增加 `runEvaluate` 函式透過 Fetch API 呼叫後端，並將回傳結果渲染於畫面上（自適應長寬），數值依正負顯示不同顏色（正綠/負紅）。
- **測試驗證**: 驗證 V(s) 矩陣能正確顯示出不同狀態的值，而 $\pi(s)$ 矩陣能正確顯示各格走向終點避開障礙物的方向。

### Phase 3: 自動化部署 (GitHub Pages & Actions)
- **需求轉換**: 
  - 使用者希望將專案託管於 GitHub Pages。由於 GitHub Pages 僅支援靜態檔案，無法運行 Flask，AI 決定直接實作一版 **「純靜態 HTML+JS 版本」**。
- **實作細節**: 
  - 建立 `docs/index.html`，將 Python 後端的 Iterative Policy Evaluation 邏輯 1:1 移植為 JavaScript。
  - 撰寫 GitHub Action Workflow (`.github/workflows/deploy.yml`)，將 `docs/` 目錄部署到 GitHub Pages 環境。
  - 撰寫詳細的 `README.md` 及 `log.md` 說明開發筆記與操作步驟。
- **部署踩坑紀錄**: 
  1. 遇到 `Get Pages site failed` 錯誤 &rarr; 修改 YAML 加入 `enablement: true`。
  2. 遇到 API 權限不足 `Resource not accessible by integration` 無法主動開啟 Pages &rarr; 將 GitHub Workflow 改回基底的 checkout/upload/deploy，並引導使用者進入 Settings 手動開啟 "Source: GitHub Actions"。
  3. GitHub Pages 出現 `README.md` 而非主要頁面 &rarr; 發現使用者設定錯誤，誤選 "Deploy from a branch"，引導其必須切換為 "GitHub Actions" 來源。
- **最終結果**: 
  最終靜態頁面成功部署，可在線上完整體驗設定環境並即時計算強化學習的最佳策略與狀態價值。

### Phase 4: UI 現代化重設計 (Modern UI Upgrade)
- **需求目的**: 將原本的復古像素風格改為更現代、更具質感的簡約暗色風格 (Modern Minimal Dark Theme)。
- **開發細節**:
  - 更換字型為 Google Fonts 的 `Inter`。
  - 移除原有的掃描線 (scanlines) 與文字 Glitch 效果。
  - 替換顏色與邊框：改用 1px 實線邊框、圓角 (border-radius) 與現代感的色彩漸層。
  - 更新 `style.css`、`index.html`，以及靜態打包版的 `docs/index.html`。

### Phase 5: 演算法升級至 Value Iteration
- **需求目的**: 從原本使用隨機策略 (Uniform Random Policy) 進行的 Policy Evaluation，改為直接推導最佳策略的 **Value Iteration** 算法。
- **開發細節**:
  - 更新後端 `app.py` 邏輯，將 `policy_evaluation` 修改為 `value_iteration`，以 $\max_a$ 取代平均動作價值計算。
  - 將迭代上限提高至 10000。
  - 更新前端 `grid.js` 以渲染新的資料。
  - 將畫面上所有提及「Policy Evaluation」與「EVALUATE」按鈕的文字全面更新為「Value Iteration」。

### Phase 6: 最佳路徑高亮 (Optimal Path Highlighting) 與快取修復
- **需求目的**: 使用者反映測試後主網格沒有出現如預期的最佳路徑呈現。
- **開發細節**:
  - **診斷問題**: 判斷原因為「瀏覽器快取 (Cache) 住舊的 JS/CSS 檔案」導致前端樣式與邏輯未更新。
  - **破解快取**: 於 `index.html` 內的 CSS/JS 引用路徑後綴加上 `?v=2` 強制重啟載入。
  - **路徑回溯**: 於 `grid.js` 實作自動回溯最佳路徑的邏輯，從起點 (S) 根據最佳動作一步步推導至終點 (G) 或在遇到迴圈時安全中斷。
  - **樣式高亮**: 透過新增 `.optimal-path` 相關的 CSS，讓找出的一條最佳路徑在主網格中亮起藍色的發光背景與顯眼箭頭。
  - **自動化模擬驗證**: 利用瀏覽器自動化測試成功走訪 `127.0.0.1:5000` 並跑完 Value Iteration 以確保路徑高亮效果如實運作，並輸出報告。

### Phase 7: GitHub Pages 靜態版同步更新與遠端推送
- **需求目的**: 將以上所有改動（UI 現代化、Value Iteration、快取修復、最佳路徑高亮）全部佈署到 GitHub Pages。
- **開發細節**:
  - 將 Python 最新寫的 `value_iteration` 邏輯手動轉譯為純 JavaScript，更新至 `docs/index.html` 內。
  - 把最新的發光 CSS 樣式複製進該靜態檔的 `<style>` 區塊。
  - 透過 `git add .` 與 `git commit` 打包更新，並 `git push` 推送至遠端 GitHub，觸發 CI 部署流程。

---

## 📂 專案最終結構

```text
HW1/
├── app.py                        # (開發用) Flask 後端 Server
├── templates/
│   └── index.html                # (開發用) Flask 視圖
├── static/
│   ├── css/style.css             # (開發用) 獨立 CSS 樣式
│   └── js/grid.js                # (開發用) 獨立 JS 邏輯
├── docs/
│   └── index.html                # 🏆 (正式部署環境) 單檔靜態打包版 (內含樣式與評估邏輯)
├── .github/
│   └── workflows/
│       └── deploy.yml            # GitHub Actions 部署腳本
├── README.md                     # 專案說明書
├── log.md                        # 開發歷史記錄
└── AI對話紀錄.md                  # 本檔案
```

> **紀錄生成時間**: 2026-03-18
