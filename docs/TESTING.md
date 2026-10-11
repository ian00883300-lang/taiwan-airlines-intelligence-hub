# v0.1 測試報告

日期：2026-10-11（Asia/Taipei）。

- 資料與匯入格式測試：15/15 通過。
- 正式建置：通過，React、Chart.js、Leaflet分包。
- 瀏覽器：15/15通過。
- JavaScript runtime errors：0。
- 題庫新增互動測試：中文／英文／雙語、30／60 秒、隱藏答案、320–1440px 對話框無橫向溢出，全部通過。
- 個人答案：合成資料測試匯入、重新整理保存、版本切換、不合法檔案保留原資料、移除及取消，全部通過；未發出上傳請求。
- 實際個人答案檔置於 repository 外，不隨網站發布。測試與截圖只使用通用或合成內容。

- PASS — Production dashboard loads three airlines and two real charts
- PASS — All 96 airline categories render without empty main content
- PASS — Fleet filter separates freight from passenger aircraft
- PASS — Map filters show one verified STARLUX Europe route and honest empty state
- PASS — Comparison has 22 dimensions and dated financial units
- PASS — Weekly filter excludes older STARLUX news until background is selected
- PASS — Question search, difficulty and topic filters work together
- PASS — Interview dialog timer, 60-second answer, note, bookmark and completion persist
- PASS — Notes export downloads a valid local JSON file
- PASS — Global search reaches the selected question
- PASS — Evidence panel exposes source, publication, verification and as-of fields
- PASS — Desktop, iPad and iPhone pages have no document horizontal overflow
- PASS — Mobile bottom navigation opens all five main destinations
- PASS — External map outage retains usable route list and shows fallback
- PASS — No browser runtime errors in tested flows

## 限制
僅本機Chrome正式建置測試，未實測實體iPhone/iPad Safari；官方連結未做全站自動可用性檢查，部分官方網站有地區限制或反爬蟲。未查核欄位仍待補資料。

## 重現
執行 pnpm test / pnpm build / pnpm preview，另開終端 pnpm test:browser。瀏覽器結果在tests/browser-results.json。
新增互動測試：`node tests/practice-browser.mjs`。正式站測試可設定 `TEST_URL`。
研究頁與主畫面設定：`node tests/research-browser.mjs`，涵蓋六個裝置寬度、訓練階段、法規切換、財務指標、分類導覽與 icon 載入。
