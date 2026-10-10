import fs from "node:fs";
const r = JSON.parse(fs.readFileSync("tests/browser-results.json"));
fs.writeFileSync(
  "docs/TESTING.md",
  "# v0.1 測試報告\n\n日期：2026-10-11（Asia/Taipei）。\n\n- 資料測試：10/10 通過。\n- 正式建置：通過，React、Chart.js、Leaflet分包。\n- 瀏覽器：" +
    r.results.filter((x) => x.pass).length +
    "/" +
    r.results.length +
    "通過。\n- JavaScript runtime errors：" +
    r.errors.length +
    "。\n\n" +
    r.results
      .map(
        (x) =>
          "- " +
          (x.pass ? "PASS" : "FAIL") +
          " — " +
          x.name +
          (x.error ? "：" + x.error : ""),
      )
      .join("\n") +
    "\n\n## 限制\n僅本機Chrome正式建置測試，未實測實體iPhone/iPad Safari；官方連結未做全站自動可用性檢查，部分官方網站有地區限制或反爬蟲。未查核欄位仍待補資料。\n\n## 重現\n執行 pnpm test / pnpm build / pnpm preview，另開終端 pnpm test:browser。瀏覽器結果在tests/browser-results.json。\n",
);
