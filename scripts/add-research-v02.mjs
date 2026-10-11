import fs from "node:fs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const sources = read("data/sources.json");
function source(id, name, url, level = 1, published = null, asOf = null) {
  const s = {
    id,
    source: name,
    source_url: url,
    level,
    published_date: published,
    as_of: asOf,
    verified_date: "2026-10-11",
    status: "confirmed",
  };
  if (!sources.some((x) => x.id === id)) sources.push(s);
  return s;
}
function evidence(s, extra = {}) {
  const { id, level, ...fields } = s;
  return { ...fields, source_id: id, ...extra };
}
const faa = source(
  "faaSchools",
  "FAA｜Pilot Schools Information",
  "https://www.faa.gov/training_testing/training/pilot_schools",
  2,
);
const ir = source(
  "faaIR",
  "eCFR｜14 CFR 61.65",
  "https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-B/section-61.65",
  2,
);
const cpl = source(
  "faaCPL",
  "eCFR｜14 CFR 61.129",
  "https://www.ecfr.gov/current/title-14/chapter-I/subchapter-D/part-61/subpart-F/section-61.129",
  2,
);
const casaP = source(
  "casaPPL",
  "CASA｜Private pilot licence",
  "https://www.casa.gov.au/licences-and-certificates/pilots/pilot-licences/getting-private-pilot-licence-ppl",
  2,
);
const casaC = source(
  "casaCPL",
  "CASA｜Commercial pilot licence",
  "https://www.casa.gov.au/licences-and-certificates/pilots/pilot-licences/commercial-pilot-licences/getting-commercial-pilot-licence-cpl",
  2,
);
const tw = source(
  "twLicences",
  "全國法規資料庫｜航空人員檢定給證管理規則",
  "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0090008",
  2,
  "2025-11-03",
);
const ci = source(
  "ciTraining",
  "華航｜海外培訓與 UND 合作說明",
  "https://www.china-airlines.com/cn/zh/about-china-airlines/media/news/20251207",
  1,
  "2025-12-07",
  "2025-12-07",
);
const eva = sources.find((x) => x.id === "evaRecruit");
const training = {
  note: "學習路線為概念導覽，非三家公司統一課表；實際途徑、順序及檢定依公司與核准課程。另有 MPL 等途徑。",
  stages: [
    {
      id: "selection",
      name: "甄選與準備",
      tag: "PREPARE",
      focus: "了解條件，建立學習紀律",
      body: "先讀各公司招募公告，確認報名資格與甄選流程。不要把單次考生經驗當成固定關卡。",
      practice: "用 30 秒說明：你如何確認自己理解這份工作的責任？",
    },
    {
      id: "basic",
      name: "基礎飛行",
      tag: "FOUNDATION",
      focus: "原理、操控與程序",
      body: "以一般執照路徑理解 PPL 與基礎操控，再建立儀器飛航及商用飛航相關能力。不同核准課程可能整合安排。",
      practice: "學習重點：能說清楚程序與限制，比背一個結訓時數更重要。",
    },
    {
      id: "instrument",
      name: "儀器與商用能力",
      tag: "IR / CPL",
      focus: "依儀表判讀，維持紀律",
      body: "IR 涉及儀器程序與判讀，仍須遵守天氣最低標準、機體限制及資格；不能解讀成任何天氣都能飛。CPL 與多發能力依所修課程及檢定要求建立。",
      practice:
        "面試提醒：實機、儀器與模擬機時數可能重疊或有限額，不能直接相加。",
    },
    {
      id: "type",
      name: "進階與機型訓練",
      tag: "TYPE TRAINING",
      focus: "系統、標準程序與組員合作",
      body: "進入公司機型與作業訓練，建立符合該機型及公司標準的操作能力。時程與模擬機採計依適用制度。",
      practice: "思考：過去的成功經驗，如何轉成接受教官回饋的學員態度？",
    },
    {
      id: "line",
      name: "航路訓練與任用",
      tag: "LINE TRAINING",
      focus: "在訓練要求下累積營運經驗",
      body: "依公司安排完成航路訓練與考核，達標後進入相應任用階段。沒有所有公司通用的固定完成月數。",
      practice: "用語提醒：完成海外基礎訓練，不等於立刻完成全部航空公司訓練。",
    },
    {
      id: "career",
      name: "持續訓練與升等",
      tag: "CONTINUOUS LEARNING",
      focus: "從資格到責任，持續接受檢核",
      body: "ATPL 資格、公司升等條件與實際任命是不同層次。時數達標不代表自動升機長，實際安排仍需確認公司制度。",
      practice:
        "Data pending verification：三航通用的升機長時數、年限及教官升任門檻。",
    },
  ],
  programs: {
    "china-airlines": evidence(ci, {
      title: "海外基礎訓練約 10–12 個月",
      body: "2025 年 12 月官方說明與 UND Aerospace 鳳凰城飛行學校合作，海外受訓平均約 10–12 個月，返台再安排民航相關訓練。",
      scope: "歷史官方說明；不是每梯固定派訓學校，也不是全部養成時程。",
    }),
    "eva-air": evidence(eva, {
      title: "三階段，依機種安排",
      body: "地面學科約 4 個月 → 赴美基礎飛行約 4–5 個月 → 返台進階／機型轉換約 12–14 個月（含航路訓練），完訓後以副機長任用。",
      scope: "官方約略時程，依分發機種而異；不保證個別學員完成日期。",
    }),
    starlux: {
      title: "課程時程待查核",
      body: "Data pending verification。尚未取得可用於本頁的完整官方分階段時程，不套用其他公司的課表。",
      source: null,
      source_url: null,
      published_date: null,
      verified_date: null,
      as_of: null,
      status: "unverified",
    },
  },
  requirements: [
    evidence(faa, {
      id: "faa-ppl",
      jurisdiction: "FAA",
      title: "PPL · 私人駕駛員",
      headline: "40 / 35 小時",
      body: "Part 61 飛機私人駕駛員最低通常 40 小時；FAA 核准學校課程可為 35 小時。",
      scope: "法定最低要求；不是學員實際結訓時數。",
    }),
    evidence(ir, {
      id: "faa-ir",
      jurisdiction: "FAA",
      title: "IR · 儀器檢定",
      headline: "50 小時 PIC 越野 + 40 小時儀器條件",
      body: "Part 61 一般飛機路徑要求 50 小時機長越野（其中 10 小時為飛機），以及 40 小時實際或模擬儀器（含 15 小時具資格教官訓練）。",
      scope:
        "不同種類時間可能重疊；不是 90 小時額外實機，也不是 IR 總飛時。聯合課程等例外須讀原文。",
    }),
    evidence(cpl, {
      id: "faa-cpl",
      jurisdiction: "FAA",
      title: "CPL · 商用駕駛員",
      headline: "Part 61：250 小時",
      body: "飛機商用駕駛員一般要求至少 250 小時，另需符合各細項與核可訓練抵用規定。",
      scope: "不可直接將其他核准課程的常见時數當成所有 Part 141 的統一門檻。",
    }),
    evidence(casaP, {
      id: "casa-ppl",
      jurisdiction: "CASA",
      title: "PPL · 私人駕駛員",
      headline: "整合 35 / 非整合 40 小時",
      body: "最低航空經驗依課程區分；其中實際飛行員飛行時間至少 30／35 小時，最多 5 小時可為模擬機。",
      scope: "航空經驗不等於全部實機飛行時間。",
    }),
    evidence(casaC, {
      id: "casa-cpl",
      jurisdiction: "CASA",
      title: "CPL · 商用駕駛員",
      headline: "整合 150 / 非整合 200 小時",
      body: "最低航空經驗依課程區分；對應飛行員飛行時間至少 140／190 小時，最多 10 小時可為核可模擬設備。",
      scope: "澳洲飛機類別；不要與 FAA 或台灣門檻混用。",
    }),
    evidence(tw, {
      id: "tw-cpl",
      jurisdiction: "臺灣",
      title: "商用駕駛員 · 第 30 條",
      headline: "250 小時；核可訓練得減至 190",
      body: "飛航及模擬機／訓練器總時間須符合條件；模擬設備替代飛航訓練最多採計 50 小時，並須滿足各細項。",
      scope: "飛機類別；縮減與採計均有條件，不只看單一總數。",
    }),
    evidence(tw, {
      id: "tw-atpl",
      jurisdiction: "臺灣",
      title: "民航運輸駕駛員 · 第 38 條",
      headline: "1,500 小時 + 細項條件",
      body: "除前置資格及學術科外，須滿足可採認機長、民航、越野、夜航與儀器等細項；儀器項目中模擬設備最多採計 30 小時。",
      scope: "飛機 ATPL 資格；不是達到 1,500 小時就自動升機長。",
    }),
  ],
};
write("data/training-path.json", training);
const financial = source(
  "ciFinancial2025",
  "華航｜2025／2024 合併財務報表",
  "https://cms-externalcontent-prod.s3.ap-northeast-1.amazonaws.com/ci/Investor-relations/Consolidated-Financial-Statements/EN/2025Q4.pdf",
  1,
  null,
  "2025-12-31",
);
const social = source(
  "ciSocial",
  "華航｜2025 社會參與",
  "https://calec.china-airlines.com/csr/social_development.html",
  1,
  null,
  "2025-12-31",
);
const f = read("data/china-airlines/financials.json");
f.eps = evidence(financial, {
  label: "基本 EPS",
  value: 2.42,
  unit: "新臺幣／股",
  period: "2025-01-01/2025-12-31",
  scope: "合併報表基本每股盈餘；不是稀釋 EPS。報表第 8、61 頁。",
});
f.history = [
  { year: 2024, revenue: 203879338, profit: 14383345, eps: 2.38 },
  { year: 2025, revenue: 209138766, profit: 14700319, eps: 2.42 },
].map((x) =>
  evidence(financial, {
    ...x,
    as_of: x.year + "-12-31",
    scope:
      "全年合併；營收與歸屬母公司淨利為新臺幣仟元，EPS 為元／股。第 7–8 頁及附註 29。",
  }),
);
f.breakdown = evidence(financial, {
  year: 2025,
  items: [
    { label: "客運", amount: 124908428 },
    { label: "貨運", amount: 66830701 },
    { label: "其他", amount: 17399637 },
  ],
  unit: "新臺幣仟元",
  scope: "合併營收，財報附註 27，第 54 頁；與永續網站的四捨五入營收交叉比對。",
});
write("data/china-airlines/financials.json", f);
write("data/china-airlines/social.json", {
  history: [
    {
      year: 2023,
      commercial: 36594093,
      charity: 3822991,
      community: 6049436,
      total: 46466520,
    },
    {
      year: 2024,
      commercial: 54932735,
      charity: 3602190,
      community: 3849735,
      total: 62384660,
    },
    {
      year: 2025,
      commercial: 53566169,
      charity: 14052696,
      community: 4075484,
      total: 71694349,
    },
  ].map((x) =>
    evidence(social, {
      ...x,
      as_of: x.year + "-12-31",
      scope:
        "社會參與種類；新臺幣元。含商業活動、慈善活動與社區投資，不等於現金捐款。",
    }),
  ),
  sroi: evidence(social, {
    title: "SROI 8.05",
    body: "2025 年公益體育營專案評估，每投入 1 元對應 8.05 元社會效益；不能解讀為全公司所有公益活動或財務投資報酬。",
    scope: "單一公益專案、評估模型結果。",
  }),
});
write("data/sources.json", sources);
