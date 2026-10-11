import fs from "node:fs";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const write = (p, v) => fs.writeFileSync(p, JSON.stringify(v, null, 2) + "\n");
const sources = read("data/sources.json");
const records = [
  [
    "ciCadetCurrent",
    "華航｜培訓機師報名資格",
    "https://calcfec.china-airlines.com/PilotResume/chDefault.aspx",
  ],
  [
    "jxCadetCurrent",
    "星宇｜Cadet Pilot Program 與 FAQ",
    "https://careers.jx-starlux.com/Pilot/Cadet",
  ],
];
for (const [id, source, source_url] of records)
  if (!sources.some((s) => s.id === id))
    sources.push({
      id,
      source,
      source_url,
      level: 1,
      published_date: null,
      verified_date: "2026-10-11",
      as_of: null,
      status: "confirmed",
    });
const evidence = (id, extra) => {
  const { id: source_id, level, ...s } = sources.find((x) => x.id === id);
  return { ...s, source_id, ...extra };
};
const ci = read("data/china-airlines/recruitment.json");
ci.qualifications = [
  evidence("ciCadetCurrent", {
    title: "英文：口說與寫作必備，再擇一英檢",
    body: "TOEIC 口說 ≥140、寫作 ≥140，另擇一：TOEIC ≥750（聽力 ≥400）、IELTS ≥6.0、TOEFL ITP ≥527 或 Linguaskill ≥160。",
    scope: "培訓機師；不是 CPL／民航機師門檻。應試須具兩年內有效證明。",
  }),
  evidence("ciCadetCurrent", {
    title: "成績效期與測驗形式",
    body: "筆試當日英檢須至少仍有兩個月效期。TOEIC 不接受 Bridge／團體考；IELTS 不接受 Online；Linguaskill 不接受遠端考。",
    scope: "正式報名前重新核對官方頁。",
  }),
  evidence("ciCadetCurrent", {
    title: "學歷與身分摘要",
    body: "中華民國國籍及身分證；學士以上，接受應屆畢業生。男性須役畢／免役，屆退役亦可報考。",
    scope: "完整文件、體檢、報考次數及約定另見官方簡章。",
  }),
  evidence("ciCadetCurrent", {
    title: "甄選項目",
    body: "航醫中心心理衡鑑、紙筆測驗、中英文面試及綜合評量。",
    scope: "這是官方列出的項目，不是保證的通知日期。",
  }),
];
write("data/china-airlines/recruitment.json", ci);
const eva = read("data/eva-air/recruitment.json");
eva.qualifications = [
  evidence("evaRecruit", {
    title: "英文門檻與學歷",
    body: "培訓飛航學員：大專以上同等學歷、不限科系；兩年內 TOEIC ≥650，口說與寫作各 ≥140。其他英檢若同時具備為佳，不逕自當成 TOEIC 替代方案。",
    scope: "須持中華民國身分證，役畢或免役；其他條件見官方。",
  }),
  evidence("evaRecruit", {
    title: "甄選五階段",
    body: "筆試（適職、心算、高中數學物理）→ 飛航員潛質測驗 → 主管面試 → 飛行能力傾向評估 → 航醫體檢。",
    scope: "培訓類別；與一般／民航飛行員流程分開。",
  }),
  evidence("evaRecruit", {
    title: "報考履歷、自傳須留意撰寫規定",
    body: "官方提醒：提交的履歷或自傳若經查由 AI 撰寫，將取消參試或錄取資格。本站口說示範供理解與練習，不能直接當成報考履歷、自傳提交。",
    scope: "準備文件時請自行撰寫，並重新閱讀官方注意事項。",
  }),
];
write("data/eva-air/recruitment.json", eva);
const program = evidence("jxCadetCurrent", {
  title: "海外約一年，後續機型訓練約半年",
  body: "官網說明赴美國或澳洲受訓約一年取得 CPL，再接受約半年機型訓練；FAQ 估計整體約 1.5–2 年。",
  scope: "官方概估；依公司政策與個人學習狀況而異，不保證完成日期。",
  status: "estimated",
});
const jx = {
  items: [
    evidence("jxCadetCurrent", {
      title: "長期接受申請",
      body: "FAQ 表示可隨時申請；審核及通知視流程與職缺而定。",
      scope: "不代表保證邀考、錄取或立即開訓。",
    }),
  ],
  program: [program],
  qualifications: [
    evidence("jxCadetCurrent", {
      title: "英文門檻（三擇一）",
      body: "TOEIC ≥800（聽力 ≥400），加口說 ≥160、寫作 ≥150；或 TOEFL iBT ≥80（聽力 ≥21）；或 IELTS ≥6.0（各科 ≥5.0）。",
      scope: "TOEIC 須公開測驗；口說與寫作須同一次。申請時成績須有效。",
    }),
    evidence("jxCadetCurrent", {
      title: "學歷與推薦人",
      body: "中華民國身分證；副學士以上，外國學歷需認證；一名師長或前主管推薦人。",
      scope: "應屆畢業／將退役者可參與甄選，但開訓前須取得相應證明。",
    }),
    evidence("jxCadetCurrent", {
      title: "官方甄選流程",
      body: "筆試 → Panel Interview → 團體評估 → 體檢 → 潛質測驗 → 個人專業面試。",
      scope:
        "筆試範圍包含公司／航空知識、九至十年級數理及邏輯推理；時間依官方通知。",
    }),
  ],
};
write("data/starlux/recruitment.json", jx);
const path = read("data/training-path.json");
path.programs.starlux = program;
write("data/training-path.json", path);
for (const id of ["china-airlines", "eva-air", "starlux"]) {
  const p = `data/${id}/overview.json`;
  const o = read(p),
    r = read(`data/${id}/recruitment.json`);
  o.sections.recruitment = r.items;
  if (id === "starlux") o.sections.cadet = [program];
  write(p, o);
}
write("data/sources.json", sources);
