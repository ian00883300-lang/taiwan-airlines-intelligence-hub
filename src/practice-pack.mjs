export const STORAGE_KEY = "taih-personal-answers-v1";
export function validatePack(input, ids) {
  const fail = () => {
    throw new Error(
      "答案檔格式不符：需使用版本 1，題目代碼及中英文 30／60 秒答案須完整。原資料未更動。",
    );
  };
  if (
    !input ||
    input.version !== 1 ||
    !input.answers ||
    Array.isArray(input.answers) ||
    typeof input.answers !== "object"
  )
    fail();
  const entries = Object.entries(input.answers);
  if (!entries.length || entries.length > ids.length) fail();
  const answers = {};
  for (const [id, entry] of entries) {
    if (!ids.includes(id) || !entry || typeof entry !== "object") fail();
    const clean = {};
    for (const field of [
      "zh_30",
      "zh_60",
      "en_30",
      "en_60",
      "coaching",
      "follow_up",
      "basis",
    ]) {
      if (
        typeof entry[field] !== "string" ||
        !entry[field].trim() ||
        entry[field].length > 6000
      )
        fail();
      clean[field] = entry[field].trim();
    }
    const revision = entry.question_revision ?? 1;
    if (!Number.isSafeInteger(revision) || revision < 1) fail();
    clean.question_revision = revision;
    answers[id] = clean;
  }
  return { version: 1, answers };
}
