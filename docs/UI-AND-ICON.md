# 手機研究介面與主畫面圖示

2026-10-11 更新。延續 NT$0、GitHub Pages、公開資料及本機個人答案架構。

## 介面

- 首頁與公司頁增加深藍主視覺，常用研究主題改為橫向膠囊導覽；其餘 32 分類保留在可展開選單。
- 三家公司「機師之路」提供六階段概念導覽，法規依臺灣／FAA／CASA 切換，與公司時程分開。
- 華航財務頁增加 2024／2025 全年指標切換與 2025 營收組成。不同單位不共用座標；沒有將 2026 半年度混入全年趨勢。
- 華航永續頁增加 2023–2025 社會參與堆疊圖與原始金額表。SROI 明確限定於公益體育營專案。
- 圖表另有文字表格，手機可水平捲動資料表；不靠圖像才能讀取數字。

## Icon

使用內建 Imagegen，未呼叫付費 API。使用者提供的兩個手機 icon 為外觀與占比參考；截圖解析度有限，非原始向量尺寸比對。最終金屬 T 維持第二版的位置和大小，依使用者要求移除跑道。

最終圖像指令：

> Edit this app icon. REMOVE the entire runway from the lower half: no road, runway pavement, centerline markings, perspective converging stripes or beams extending downward. Replace the runway area with clean uninterrupted dark navy background and continue the subtle globe latitude/longitude arcs naturally where needed. Preserve EXACTLY the existing metallic silver T silhouette, position, width and height, bevels and reflections; do not resize or redesign the T. Preserve the globe circle, cyan route arcs and nodes, full square opaque background. No text, no extra symbols, no external rounded corners. A refined aviation intelligence globe behind a silver T, WITHOUT any runway.

交付資產：`public/icons/metal-t-master.png` 與 32／180／192／512 px PNG。小尺寸僅從最終生成圖縮放，沒有另外繪製 T，維持比例一致。

## 加入主畫面

Safari：分享 → 加入主畫面。Android：瀏覽器選單中的安裝／加到主畫面。網站提供 Apple touch icon、manifest、standalone 與安全區域間距。實際按鈕名稱依系統版本而異。

目前仍需連網，沒有宣稱離線支援。既有捷徑可能保留旧 icon，需重新加入；移除已安裝的 Web App 前保留個人答案檔及筆記備份。

## 驗證

15 項資料／格式測試、15 項原有瀏覽器回歸測試、個人練習互動套件及新增研究互動套件通過。新增頁面於 320、375、390、768、1024、1440 px 沒有文件橫向溢出；manifest 圖示與 Apple touch icon 可載入、尺寸相符、GitHub Pages 子路徑正確。未實测實體 iOS／iPadOS 主畫面安裝。
