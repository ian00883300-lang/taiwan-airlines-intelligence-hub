# GitHub Pages 部署（NT$0）

正式網址：https://ian00883300-lang.github.io/taiwan-airlines-intelligence-hub/

使用者已於2026-10-11確認公開發布。Repository為免費公開專案，Pages使用GitHub Actions，不購買網域、不需要信用卡。

## 發布流程

`.github/workflows/deploy.yml` 在main推送或手動執行時：

1. 安裝鎖定的開源依賴。
2. 執行10項資料測試。
3. Vite產生靜態dist。
4. 上傳Pages artifact並發布。

相對base及hash路由支援repository子路徑。無Node runtime、後端或API金鑰。`check.yml`另執行獨立資料/建置驗證。

## 更新

修改data JSON與來源紀錄，先在本機執行`pnpm test`、`pnpm build`；UI有改動時以`pnpm preview`和`pnpm test:browser`檢查。commit/push main後自動部署。每週資料仍須人工查核，不會自動產生新聞。

## 本機與備份

`pnpm dev`即時預覽；`pnpm preview`提供正式dist。不可直接雙擊index.html，模組資源需要HTTP來源。dist可以由其他免費靜態伺服器提供；外部底圖與官方來源仍需網路。無需任何額外訂閱。
