# GitHub Pages 部署（NT$0）

本專案可完全靜態輸出，不需要Node伺服器或付費hosting。

1. 公開repository：`taiwan-airlines-intelligence-hub`。GitHub免費公開repository使用Pages。
2. `pnpm install --frozen-lockfile && pnpm test && pnpm build`。
3. 輸出為 `dist/`；相對base與hash導覽支援子路徑。
4. 確認允許公開網站並啟用Pages後，可將dist部署至gh-pages分支，Pages來源選gh-pages根目錄。
5. 官方來源由外部網路提供；沒有後端或API金鑰。

GitHub Pages設定及公開發布未經確認前不擅自變更。免費標準網域即可，無需購買網域或信用卡。

## CI

GitHub Actions僅執行資料測試與build；不自動修改Pages設定，不建立付費資源。手動或main推送皆可執行。

## 本機檢視

`pnpm dev`提供即時更新；`pnpm preview`用正式dist。不可直接雙擊index.html，因模組資源需要HTTP來源。

## 離線與備份

dist可由任意免費靜態伺服器提供，程式依賴已打包；外部底圖與來源連結仍需網路。資料JSON與原始碼留在repository，無供應商鎖定。
