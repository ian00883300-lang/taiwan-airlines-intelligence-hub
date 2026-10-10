# Taiwan Airlines Intelligence Hub v0.1

台灣三大航空情報中心｜培訓機師準備系統

**額外費用 NT$0**。React + Vite 靜態網站，無後端、無付費 API、無登入服務。只使用公開來源與免費開源函式庫。

## 使用

- 首頁：三家公司、日期分列的機隊快照、圖表、代表航線、週報、招募入口。
- 公司研究：華航／長榮／星宇各 32 個分類，未完成資料顯示 `Data pending verification`。
- 比較：22 面向；不混用年度／季度、客機／貨機／訂單、公司／集團營收。
- 面試：20 道原創中英文練習，涵蓋 15 類；30／60 秒示範、計時、收藏、練習標记、筆記、JSON 匯出。
- 航網：Leaflet + OpenStreetMap；5 條已收錄代表性自營客運航線。底圖失效時保留清單。
- 週報：本週與近期背景分開；手動查核更新，無自動爬取或付費流程。

## 開發與測試

需求：Node.js 22+、pnpm 11.25.0。

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

瀏覽器測試使用已安裝的 Chrome。正式版本預設在 `http://127.0.0.1:4173/`，另開一個終端執行：

```sh
pnpm test:browser
```

可用 `BROWSER_PATH` 指向其他 Chromium 執行檔，`TEST_URL` 指向測試網站。測試會在獨立瀏覽器環境運行，包含 96 個公司分類及 375/390/768/1024/1440px 頁面。

## 檔案

- `data/{china-airlines,eva-air,starlux}/`：overview、fleet、routes、financials、recruitment、interview。
- `data/`：sources、comparison、weekly-updates、interview-bank、airports、sections。
- `schema/evidence.schema.json`：來源與狀態規格。
- `sources.md`：來源目錄與資料衝突處理。
- `docs/`：資料更新、驗收、部署及测试紀錄。
- `src/`：繁體中文優先 UI。題庫保留英文欄位，未來可抽離字典支援英文介面；目前無完整英文 UI。

`data/` 是唯一資料維護來源，更新 JSON 後重新 build 即可。不要由程式推算未知值。

## 資料品質與限制

查核日 2026-10-11（Asia/Taipei），不表示所有數據都截至同一天。來源每項均保留 published_date、verified_date、as_of、status。無可證實日期使用 null。

華航機隊 85（2026-09-30），長榮 89（2026-10-01）。星宇 29 僅為 2025 年底歷史快照，不用作當前總數。金融數字保留各自年報／合併邊界，未以不同定義淨利作排行。

待補：星宇當前同日分型機隊、完整招募梯次、各公司组织／共掛清單、完整機型座位及技術資料、完整航網、逐年交付與退役排程，以及華航／長榮當年 EPS。詳見 `docs/ACCEPTANCE.md`。

本站內容為獨立研究及原創練習，非航空公司官方聲明、考題或操作手冊。練習回答不編造使用者的個人經驗。

## 成本與隱私

- 無付費服務、金流、信用卡、追蹤分析、OpenAI 或其他模型 API。
- 收藏／筆記只存在瀏覽器 localStorage；清除瀏覽資料會遺失，請先匯出。不同裝置不會自動同步。
- OpenStreetMap 底圖需要網路，保留授權標示，不預抓或批次下載圖磚。
- GitHub 免費公開 repository 與 GitHub Pages；不購買網域，不啟用付費方案。

程式碼可依 MIT License 使用；來源網站內容及第三方函式庫仍依原授權。
