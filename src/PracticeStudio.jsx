import React, { createContext, useContext, useState } from "react";
import { validatePack, STORAGE_KEY } from "./practice-pack.mjs";
import sourceCatalog from "../data/sources.json";

const PersonalContext = createContext();
export function PersonalProvider({ children, ids }) {
  const [pack, setPack] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? validatePack(JSON.parse(raw), ids) : null;
    } catch {
      return null;
    }
  });
  const [message, setMessage] = useState("");
  function save(next) {
    try {
      if (next) localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      else localStorage.removeItem(STORAGE_KEY);
      setPack(next);
      return true;
    } catch {
      setMessage("瀏覽器無法保存，請檢查儲存空間或隱私設定。原資料未更動。");
      return false;
    }
  }
  return (
    <PersonalContext.Provider value={{ pack, save, message, setMessage, ids }}>
      {children}
    </PersonalContext.Provider>
  );
}

export function PrivateImport() {
  const { pack, save, message, setMessage, ids } = useContext(PersonalContext);
  const [confirmClear, setConfirmClear] = useState(false);
  async function importFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 250000)
        throw new Error("檔案過大，請使用 250 KB 以下的答案檔。");
      const next = validatePack(JSON.parse(await file.text()), ids);
      if (save(next))
        setMessage(
          `已載入 ${Object.keys(next.answers).length} 題個人答案，僅保存在此瀏覽器。`,
        );
    } catch (err) {
      setMessage(
        err instanceof SyntaxError
          ? "無法讀取 JSON，原資料未更動。"
          : err.message,
      );
    }
    e.target.value = "";
  }
  return (
    <details className="private-library">
      <summary>
        <span>我的個人答案</span>
        <span className="library-status">
          {pack
            ? `${Object.keys(pack.answers).length} 題已載入`
            : "本機保存 · 選用"}
        </span>
      </summary>
      <p>
        匯入專屬答案檔後，可在題目內切換「我的版本」。檔案不會上傳；手機與電腦需各自匯入，清除瀏覽器資料也會移除答案。共用裝置請在使用後移除。
      </p>
      <p className="fineprint">
        重新匯入會取代現有個人答案。請保留原始檔作為備份。
      </p>
      <label className="import-label">
        匯入個人答案 JSON
        <input
          type="file"
          accept=".json,application/json"
          onChange={importFile}
        />
      </label>
      {pack &&
        (!confirmClear ? (
          <button onClick={() => setConfirmClear(true)}>
            移除此瀏覽器的個人答案
          </button>
        ) : (
          <div className="inline-actions">
            <button
              onClick={() => {
                if (save(null)) {
                  setMessage("已移除個人答案；筆記與練習紀錄保留。");
                  setConfirmClear(false);
                }
              }}
            >
              確認移除個人答案
            </button>
            <button onClick={() => setConfirmClear(false)}>取消</button>
          </div>
        ))}
      <p role="status">{message}</p>
    </details>
  );
}

export function AnswerView({ q, length, Source }) {
  const { pack } = useContext(PersonalContext);
  const personal = pack?.answers[q.id];
  const currentPersonal =
    personal &&
    (personal.question_revision ?? 1) === (q.question_revision ?? 1);
  const [language, setLanguage] = useState("zh");
  const [version, setVersion] = useState(
    currentPersonal ? "personal" : "general",
  );
  const [hidden, setHidden] = useState(false);
  const mine = version === "personal" && personal;
  const zh = mine ? personal["zh_" + length] : q["answer_zh_" + length];
  const en = mine ? personal["en_" + length] : q["answer_" + length];
  return (
    <section className="answer-studio" aria-label="示範回答">
      <div className="answer-toolbar">
        <div
          className="segmented language-switch"
          role="group"
          aria-label="回答語言"
        >
          {[
            ["zh", "中文"],
            ["en", "English"],
            ["both", "中英對照"],
          ].map(([key, label]) => (
            <button
              key={key}
              aria-pressed={language === key}
              className={language === key ? "active" : ""}
              onClick={() => setLanguage(key)}
            >
              {label}
            </button>
          ))}
        </div>
        {personal && (
          <label>
            答案版本
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            >
              <option value="personal">
                {currentPersonal ? "我的版本" : "我的舊版答案（待確認）"}
              </option>
              <option value="general">通用示範</option>
            </select>
          </label>
        )}
      </div>
      <div className="answer-caption">
        <span>
          {length} 秒練習 · {mine ? "我的建議稿" : "通用示範"}
          {q.practice_group && ` · ${q.practice_group}`}
        </span>
        <button aria-pressed={hidden} onClick={() => setHidden(!hidden)}>
          {hidden ? "顯示答案" : "隱藏答案，先試說"}
        </button>
      </div>
      <p className="fineprint">
        秒數是口說目標，請依自己的語速精簡；先理解，再用自己的話說。
      </p>
      {personal && !currentPersonal && (
        <p className="personal-note" role="status">
          題目已重新整理，舊版個人答案仍保留，請確認是否適用。
          {q.previous_question && `原題目：${q.previous_question.zh}`}
          可在「答案版本」查看舊稿。
        </p>
      )}
      {mine && (
        <p className="personal-note">
          根據你的準備文件整理，尚未逐項由你確認。請確認經歷細節與措辭符合事實後再使用。
        </p>
      )}
      {hidden ? (
        <div className="answer-recall">
          先用一句話回答重點，再補一個例子，最後說明學到什麼。
        </div>
      ) : (
        <div
          className={
            "answer-columns " + (language === "both" ? "bilingual" : "")
          }
        >
          {language !== "en" && (
            <div className="answer-block">
              <h3>中文建議回答</h3>
              <div className="answer" lang="zh-Hant">
                {zh}
              </div>
            </div>
          )}
          {language !== "zh" && (
            <div className="answer-block">
              <h3>English · {length}-second answer</h3>
              <div className="answer" lang="en">
                {en}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="keywords" aria-label="回答重點">
        {(q.answer_outline || q.keywords).map((k) => (
          <mark key={k}>{k}</mark>
        ))}
      </div>
      <details className="answer-coach">
        <summary>回答思路與延伸追問</summary>
        <p>{mine ? personal.coaching : q.chinese_answer}</p>
        <p>{q.why_it_matters}</p>
        <p>延伸追問：{mine ? personal.follow_up : q.follow_up}</p>
        {mine && <p className="fineprint">整理依據：{personal.basis}</p>}
      </details>
      {q.deep_dive && (
        <details className="deep-research">
          <summary>深入分析、易錯點與事實來源</summary>
          <p className="fineprint">
            以下為原創研究解讀，非公司官方標準答案；來源支持的是公司事實與數字。
          </p>
          {language !== "en" && <p lang="zh-Hant">{q.deep_dive.analysis_zh}</p>}
          {language !== "zh" && <p lang="en">{q.deep_dive.analysis_en}</p>}
          <h4>容易混淆</h4>
          <ul>
            {q.deep_dive.pitfalls.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h4>延伸追問</h4>
          <ul>
            {q.deep_dive.follow_ups.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <h4>事實查核來源</h4>
          {q.deep_dive.evidence_ids.map((id) => {
            const source = sourceCatalog.find((item) => item.id === id);
            return (
              source && (
                <div key={id}>
                  {Source ? (
                    <Source item={source} />
                  ) : (
                    <a
                      href={source.source_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {source.source}
                    </a>
                  )}
                </div>
              )
            );
          })}
        </details>
      )}
    </section>
  );
}
