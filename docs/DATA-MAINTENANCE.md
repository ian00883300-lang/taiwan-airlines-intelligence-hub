# 資料更新流程

1. 查官方原頁，記錄資料基準日與發布日；未標示時用 null。
2. 優先官方航空公司／IR／年報／招募，其次政府、製造商與聯盟；媒體只能補充。
3. 每筆資料保留 source、source_url、published_date、verified_date、status、as_of，必要時加 scope、note 與交叉查證連結。
4. confirmed 代表來源支持所述事實；announced 只代表已公告；planned 為計畫；estimated 必須解釋估計方法；unverified 的數值用 null。
5. Fleet：current_fleet 僅現役；quantity_basis=program_total 為整批訂單，remaining_backlog 才是待交數。option/MoU/plan 不得列入 firm_order。客機、貨機分開。
6. Routes：只加入有來源的自營客運航線，區域以目的地為主；Taiwan 可包含台灣端點。座標僅地圖示意，不得用於導航。
7. Finance：明確列期間、貨幣、單位、公司／合併範圍。季度不可當年度，總淨利不可直接代替歸屬母公司淨利。
8. Weekly：保留事件日期和發布日期，不能更改舊聞日期冒充本週；目前週次在 UI 中固定為 2026-10-05–11，新增週報時須同步調整週次。
9. Interview：標記 original_practice，連結事實來源；中文說明及英語回答為教學寫作，不代表公司立場。使用者的個人事例由本人補入。
10. 執行 `pnpm test`、`pnpm build`，必要時執行 `pnpm test:browser`；通過後 commit。

## 擴充 schema

Airline overview 有固定32分類；fleet.items 每個機型有現役數、客貨分類、引擎、座位、航程、用途、主航線、首交、機齡、替換與訂單欄位。未知欄位為具 metadata 的 null fact。

未來可增加 routes 的班號／頻率，但需同時加生效期間與自營／共掛口徑。可增加語系 JSON，不必接翻譯 API。

## 已知資料差異

- 華航搜尋索引84架 vs 官方原頁85架：採原頁及2026-09-30。
- 華航A350-1000原10+5選擇權 vs 2025-12總15確定：採更新事件，禁止15+5。
- 星宇2025年底29架、2026年新交機、2026年底計畫不能混成今日實際總數。
- 星宇布拉格不同官方頁面班次不一致：只保留已由機場首航稿确认的航線存在。

## 每週維護（人工，NT$0）

檢查各公司官方新聞、招募、機隊、IR。新增事件時寫 WHAT/WHY/INTERVIEW/REMEMBER，保留原始日期。沒有查到時標記「尚無已查核消息」，不寫「沒有消息」。本版不自動排程，不需要後端。
