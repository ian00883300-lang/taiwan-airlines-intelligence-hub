import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {change} from '../src/change.mjs';
assert.equal(change(100,125),'成長 25.00%');
assert.equal(change(100,75),'衰退 25.00%');
assert.match(change(0,10),/不適用/);
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage();
const base=process.env.TEST_URL||'http://127.0.0.1:5173/';
try {
 for(const width of [390,768,1440]){
  await page.setViewportSize({width,height:1000});
  await page.goto(base+'#china-airlines/routes');
  await page.locator('.network-totals').waitFor();
  assert.match(await page.locator('.network-totals').innerText(),/66 條航線/);
  assert.equal(await page.locator('optgroup[label="台灣出發"] option[value="BNE"]').count(),0);
  assert.equal(await page.locator('optgroup[label="海外延伸航段"] option[value="BNE"]').count(),1);
  assert.ok((await page.locator('.route-map').boundingBox()).height>=360);
  const cts=page.locator('abbr').filter({hasText:/^CTS$/}).first();
  await cts.focus();
  assert.match(await cts.getAttribute('title'),/新千歲/);
  assert.match(await cts.evaluate(e=>getComputedStyle(e,'::after').content),/新千歲/);
  assert.ok(await page.locator('.site-updated time').getAttribute('datetime'));
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  for(const airline of ['china-airlines','starlux']){
   await page.goto(base+'#'+airline+'/finance');
   await page.locator('.annual-performance').waitFor();
   assert.match(await page.locator('.annual-performance').innerText(),/成長|衰退/);
   assert.match(await page.locator('.annual-performance .trend-summary').innerText(),/報表怎麼看/);
  }
 }
 console.log('PASS map size, grouped origins, airport explanation, update timestamp, counts and finance trends at three widths');
} finally {await browser.close();}
