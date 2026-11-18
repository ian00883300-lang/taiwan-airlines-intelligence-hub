import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base=process.env.TEST_URL||'http://127.0.0.1:4173/';
 for(const width of [1440,390]) {
  await page.setViewportSize({width,height:900});
  // Start at the home page: a crash here previously prevented every later route.
  await page.goto(base);await page.locator('main').waitFor();
  assert.ok((await page.locator('body').innerText()).includes('中華航空'));
  for(const route of ['china-airlines/overview','china-airlines/safety','starlux/fleet','interview','knowledge']) {
   await page.evaluate(hash=>location.hash=hash,route);
   await page.waitForTimeout(200);
   assert.ok((await page.locator('body').innerText()).length>200,route);
  }
 }
 assert.deepEqual(errors,[]);console.log('PASS home entry and route navigation at desktop/mobile widths');
}finally{await browser.close();}
