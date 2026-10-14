import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});
const p=await b.newPage();
const base=process.env.TEST_URL||'http://127.0.0.1:5173/';
const errors=[];p.on('pageerror',e=>errors.push(e.message));
try {
 for(const width of [390,768,1440]){
  await p.setViewportSize({width,height:1000});
  await p.goto(base+'#china-airlines/routes');
  await p.locator('.route-distribution canvas').waitFor();
  const sum=async()=> (await p.locator('.distribution-copy li b').allTextContents()).reduce((n,s)=>n+parseInt(s),0);
  assert.equal(await sum(),66);
  await p.getByLabel('圓餅圖統計口徑').selectOption('destinations');
  assert.equal(await sum(),53);
  await p.getByLabel('洲別',{exact:true}).selectOption('Europe');
  assert.equal(await sum(),6);
  assert.equal(await p.locator('.route-table thead th').count(),4);
  const detail=p.locator('.route-table .inline-evidence').first();
  assert.equal(await detail.getAttribute('open'),null);
  await detail.locator(':scope > summary').click();
  assert.ok(await detail.locator('a[href^="https:"]').count());
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===390)await p.locator('.route-distribution').screenshot({path:'tmp-audit/distribution-mobile.png'});
  for(const [id,code] of [['china-airlines','2610'],['eva-air','2618'],['starlux','2646']]){
   await p.goto(base+'#'+id+'/overview');
   assert.equal(await p.locator('.security-summary strong').innerText(),code);
   assert.equal(await p.locator('.company-identity table').first().locator('thead th').count(),2);
  }
 }
 assert.deepEqual(errors,[]);
 console.log('PASS pie totals, destination deduplication, filter synchronization, collapsed sources, stock codes and responsive compact tables');
}finally{await b.close();}
