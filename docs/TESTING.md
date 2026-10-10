# v0.1 測試報告

日期：2026-10-11（Asia/Taipei）。

- 資料測試：10/10 通過。
- 正式建置：通過，React、Chart.js、Leaflet分包。
- 瀏覽器：15/15通過。
- JavaScript runtime errors：0。

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
