import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage();
const base=process.env.TEST_URL||'http://127.0.0.1:5173/';
try{
 for(const width of [390,1024,1440]){
  await p.setViewportSize({width,height:1000});
  await p.goto(base+'#starlux/overview');
  const table=p.locator('.company-identity table').first();await table.waitFor();
  if(width>760){
   const widths=await table.locator('tbody tr').first().locator('th,td').evaluateAll(es=>es.map(e=>e.getBoundingClientRect().width));
   assert.ok(widths[0]>100 && widths[0]<widths[1]*0.4);
   assert.equal(await table.evaluate(e=>getComputedStyle(e).tableLayout),'auto');
  }
  for(const air of ['starlux','china-airlines']){
   await p.goto(base+'#'+air+'/fleet');
   assert.match(await p.locator('.ownership-summary').innerText(),/2025-12-31/);
   assert.ok(await p.locator('.aircraft-ownership').count()>=4);
   await p.locator('.aircraft-ownership details').first().locator('summary').first().click();
   assert.ok(await p.locator('.aircraft-ownership').first().locator('a[href^="https:"]').count());
   assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  }
 }
 console.log('PASS readable desktop label/content widths, mobile preservation and dated leasing evidence');
}finally{await b.close();}
