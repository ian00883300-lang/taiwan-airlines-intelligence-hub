import {chromium} from 'playwright';import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome'}),p=await b.newPage();
try{for(const [air,type,count]of[['china-airlines','A330-300',5],['eva-air','A321-200',5],['starlux','A350-1000',4]]){
await p.goto('http://127.0.0.1:5173/#'+air+'/fleet');await p.locator('.cabin-filter select').waitFor();
assert.equal(await p.locator('.cabin-design-table tbody tr').count(),count);
await p.locator('.cabin-filter select').selectOption(type);
assert.equal(await p.locator('.cabin-design-table tbody tr').count(),1);
assert.match(await p.locator('.cabin-design-table').innerText(),/Data pending verification/);
assert.equal(await p.locator('.cabin-photo-grid img').count(),0);
await p.setViewportSize({width:390,height:844});
assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
}console.log('PASS cabin model filtering, all passenger types and explicit missing evidence');}finally{await b.close()}
