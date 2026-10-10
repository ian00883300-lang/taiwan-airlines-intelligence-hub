# v0.1 驗收與24項需求對照

狀態定義：完成＝功能可操作；部分＝功能存在但研究資料尚待補齊。待查核資料不以假數據替代。

|項次|要求|結果|
|---|---|---|
|1|額外費用NT$0|完成；無付費API、後端、帳號服務或信用卡|
|2|培訓機師研究用途|完成；公司資料＋比較＋面試＋週報|
|3|可信度與metadata|完成；schema與資料測試，來源目錄；資料覆蓋仍部分|
|4|首頁與導覽|完成；7主要頁面加來源頁及手機航空公司入口|
|5|Dashboard|完成；三卡、比較、機隊、地圖、週報、招募、練習；不硬比航點數|
|6|三家公司32分類|架構完成；組織、共掛等分類保留待查核|
|7|Fleet|圖表、分型、訂單、技術欄位、歷史與規劃時間軸完成；完整逐年數據待補|
|8|Route Network|完成；Leaflet/OSM、公司/9區域篩選，5條代表航線；非完整航網|
|9|三雄比較|完成22面向；未知值標記；財務邊界分列|
|10|Interview View|完成；Why、Question、30/60秒、中英、Keywords、計時與筆記|
|11|Question Bank|完成；20題、15類、三家+General、難度及搜尋|
|12|Weekly Intelligence|完成結構與2則本週消息；1則較早背景分開；星宇本週待查核|
|13|更新機制|完成static-first /data；人工更新指南；未啟用自動爬取|
|14|GitHub|本機完成；repository及發布狀態見交付回報|
|15|免費技術|React/Vite/Chart.js/Leaflet/Lucide/JSON，無server runtime|
|16|Responsive UI|桌面側欄；iPad重排；手機五項底部導覽|
|17|語言|繁中UI、航空英文名詞、中英文題目；英文全站UI待未來版本|
|18|日期|Dashboard查核日及逐項Published/Verified/As of|
|19|資料品質|機隊、訂單、機齡、營收、EPS口徑分離；10項資料測試|
|20|Phase 1–15|依序完成来源→schema→三公司研究→比較/題庫→UI/圖表/地圖→測試→部署準備|
|21|可點選操作|三家公司同結構，含Overview/History/Fleet/Routes/Cargo/Finance/Safety/ESG/Recruitment/Interview|
|22|不是Mockup|實際React網站、互動、localStorage；待查核區塊不冒充已完成研究|
|23|回報格式|交付回報包含DONE/VERIFIED DATA/WEBSITE/TESTING/GITHUB/COST/PENDING/NEXT|
|24|可開啟v0.1|本機HTTP預覽及可部署dist；公開部署需確認Pages設定|

## 未完成研究（不影響開啟與操作）

星宇當前精確分型數、星宇即時招募梯次、完整組織與治理名單、完整共掛及自營航網、完整機型技術/座位/機齡、全部新機訂單、逐年交機與逐機退役、長榮/華航年度EPS、同口徑財務比較、公司面試文化。沒有將部分查核宣稱為全資料庫完成。

## 瀏覽器驗證範圍

獨立Chrome環境、375/390/768/1024/1440px，涵蓋96個分類、篩選、時間、收藏、筆記/匯出、来源、手機導覽、底圖失效。未在實體iPhone/Safari操作；桌面Chromium裝置尺寸模擬不等於原生Safari認證。
