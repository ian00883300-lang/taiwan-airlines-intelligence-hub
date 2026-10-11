# 研究分類整合與圖示調整（2026-10-11）

- 將 32 個研究入口整合為 10 個主題：公司與品牌、機隊與訂單、航網與聯盟、客貨運與修護、飛安與管理、永續與社會、財務與營收、人才與機師培訓、策略與動態、面試準備。
- 保留原始資料分類；舊網址開啟對應整合頁，避免既有書籤失效。財務／營收／EPS 共用一頁，不重複呈現相同圖表。
- 首頁移除加入主畫面介紹及右上大圖示，保留左側品牌標誌與主畫面安裝 metadata。
- icon 使用內建 imagegen 編輯，保留金屬 T、藍色地球與無跑道設計，向下修正原本偏上的位置。輸出 public/icons/metal-t-centered-master.png 及 32/180/192/512 尺寸，採新檔名避免舊 URL 快取。生成為近似视觉置中，非像素對齊保證。
- 最終提示：Only fix vertical composition; move globe/ring and metallic T down; preserve size, silver bevel, navy/cyan materials; no runway/text/outer rounded corners.
- 官方財報補充：長榮 2025 基本 EPS 4.84，新臺幣／股，合併財報第 2 頁；星宇 0.09，個別財報第 8 頁。來源與口徑已存入 financials.json 及 sources.json，出版日未明示維持 null。
- 手機既有主畫面圖示可能由系統保留快取，不保證網站更新後立即換圖；網站不顯示安裝教學。
