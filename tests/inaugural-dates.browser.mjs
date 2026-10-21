import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:4175/';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}}); const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const cases=[['starlux','TPE → SDJ','2023年4月1日'],['starlux','RMQ → UKB','包機首航'],['china-airlines','KHH → KMJ','2015年10月25日'],['china-airlines','RMQ → OKA','2026年7月21日'],['eva-air','TPE → YYZ','2010年3月29日'],['eva-air','TPE → UKB','包機首航']];
 for (const [airline,route,date] of cases) {
  await page.goto(base+'#'+airline+'/routes',{waitUntil:'domcontentloaded'});
  const row=page.locator('.route-table tbody tr').filter({hasText:route}).first();await row.waitFor();
  assert.ok((await row.innerText()).includes(date),route+' should display '+date);console.log('PASS',airline,route,date);
 }
 assert.deepEqual(errors,[]);
} finally {await browser.close();}
