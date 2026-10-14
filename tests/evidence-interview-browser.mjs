import { chromium } from 'playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const questions=JSON.parse(fs.readFileSync('data/interview-bank.json','utf8')).filter(q=>['jx-safety-reports-evidence','jx-saf-target-evidence','ci-tail-maintenance-evidence','jx-own-error','jx-workload-help','jx-challenge-assumption'].includes(q.id));
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const base=process.env.TEST_URL||'http://127.0.0.1:5173/';
try {
 for(const width of [390,768]){
  await page.setViewportSize({width,height:1000});
  await page.goto(base+'#interview');
  for(const q of questions){
   await page.locator('.bank-filters input').fill(q.question);
   await page.locator('.question-card').filter({has:page.getByRole('heading',{name:q.question,exact:true})}).click();
   const dialog=page.locator('dialog[open]');
   for(const seconds of [30,60]){
    await dialog.getByRole('button',{name:`${seconds} 秒`,exact:true}).click();
    await dialog.getByRole('button',{name:'中英對照',exact:true}).click();
    const answers=await dialog.locator('.answer').allTextContents();
    assert.ok(answers.includes(q[`answer_zh_${seconds}`]));
    assert.ok(answers.includes(q[`answer_${seconds}`]));
   }
   assert.ok(await dialog.locator(`a[href="${q.source_url}"]`).count());
   assert.ok(await dialog.evaluate(e=>e.scrollWidth<=e.clientWidth+1));
   await dialog.getByRole('button',{name:'關閉練習',exact:true}).click();
  }
 }
 await page.goto(base+'#china-airlines/esg');
 assert.match(await page.locator('.company-priorities').innerText(),/2027 年 0.5%/);
 assert.match(await page.locator('main').innerText(),/地面排放數字待釐清/);
 console.log('PASS six bilingual exercises, answer lengths, citations, mobile/tablet dialogs and ESG priorities');
} finally {await browser.close();}
