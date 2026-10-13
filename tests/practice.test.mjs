import test from "node:test";
import assert from "node:assert/strict";
import { validatePack } from "../src/practice-pack.mjs";
const entry = Object.fromEntries(
  ["zh_30", "zh_60", "en_30", "en_60", "coaching", "follow_up", "basis"].map(
    (k) => [k, "Example content"],
  ),
);
test("Personal import accepts known questions and strips unknown fields", () => {
  const result = validatePack(
    {
      version: 1,
      secret: "unused",
      answers: { learning: { ...entry, extra: "unused" } },
    },
    ["learning"],
  );
  assert.deepEqual(result, {
    version: 1,
    answers: { learning: { ...entry, question_revision: 1 } },
  });
});
test("Personal answers preserve question revisions and reject malformed revisions", () => {
  const result = validatePack(
    { version: 1, answers: { learning: { ...entry, question_revision: 2 } } },
    ["learning"],
  );
  assert.equal(result.answers.learning.question_revision, 2);
  for (const question_revision of [0, -1, 1.5, "2"])
    assert.throws(() =>
      validatePack(
        { version: 1, answers: { learning: { ...entry, question_revision } } },
        ["learning"],
      ),
    );
});
test("Personal import rejects invalid structure, unknown ids, missing answers and oversized text", () => {
  for (const input of [
    null,
    {},
    { version: 2, answers: { learning: entry } },
    { version: 1, answers: [] },
    { version: 1, answers: {} },
    { version: 1, answers: { unknown: entry } },
    { version: 1, answers: { learning: { ...entry, zh_30: "" } } },
    {
      version: 1,
      answers: { learning: { ...entry, en_60: "x".repeat(6001) } },
    },
    JSON.parse('{"version":1,"answers":{"__proto__":{}}}'),
  ])
    assert.throws(() => validatePack(input, ["learning"]));
});
