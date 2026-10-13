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
字體及招募更新：`node tests/reading-browser.mjs`，涵蓋實際縮放、保存、重設、對話框同步及最大字體排版。

## 2026年10月12日：星宇題庫與事件日期

- 資料／匯入：19/19通過，含12題文化練習覆蓋、事件／公告日期分離、完整日期與無效日期檢查。
- 正式建置：通過。
- 既有瀏覽器流程：15/15通過。
- 新增星宇瀏覽器流程：12題文化練習在390／768／1440px全部通過，每題測30／60秒及中文／英文／中英對照；交機、抵台、機型首次載客與三家公司航線日期分離檢查通過。
- 個人答案流程與字體調整測試：通過；未出現瀏覽器執行錯誤。
- Browser結果檔為本次實際執行；既有截圖基準還原，未提交測試產生的圖片。
- 官方來源事實驗證另見 `sources.md`；自動測試檢查資料一致性與UI，不替代人工讀取原頁。鳳凰城實際首航已由2025年12月3日事後官方稿確認；星宇大阪及長榮成田首航日仍待取得充分官方證據。

## 公司研究擴充與遠端整合驗證

- 整合main原有飛機圖片、座位、引擎與ICAO代碼，保留兩邊修改；機隊320px／150%字體溢位已修正。
- 17款飛機圖片、來源連結、圖片失效備援與4種寬度：通過。
- 第二批資料／匯入：21/21通過，包含員工職類加總、歷史快照與機隊計畫及訂單口徑。
- 正式建置與既有15項瀏覽器流程：通過。
- `BROWSER_PATH=/usr/bin/chromium node tests/profile-browser.mjs`：9個新資料頁，在320／390／768／1440px、150%字體全數通過，無執行錯誤。
- 既有研究頁測試：通過。測試產生的截圖已還原，未以新圖片覆蓋基準。
