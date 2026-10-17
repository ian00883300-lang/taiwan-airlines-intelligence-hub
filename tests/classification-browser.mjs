import {chromium} from 'playwright';import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome'}),p=await b.newPage();let errors=[];p.on('pageerror',e=>errors.push(e.message));
try{for(const air of ['china-airlines','eva-air','starlux']){
await p.goto((process.env.TEST_URL||'http://127.0.0.1:5173/')+'#'+air+'/overview');
await p.locator('.company-identity').waitFor();
assert.equal(await p.locator('.company-identity').getByText('基準與來源',{exact:true}).count(),0);
assert.deepEqual(await p.locator('.company-identity table').first().locator('thead th').allTextContents(),['項目','公開資料']);
await p.goto((process.env.TEST_URL||'http://127.0.0.1:5173/')+'#'+air+'/fleet');
await p.locator('#fleet-role').waitFor();assert.equal(await p.locator('#fleet-role canvas').count(),1);
assert.ok(await p.locator('.future-orders-table tbody tr').count()>0);
await p.locator('#fleet-future').scrollIntoViewIfNeeded();
await p.screenshot({path:'tmp-audit/future-'+air+'.png'});
console.log(air+' PASS classification, chart, future table');}
assert.deepEqual(errors,[]);}finally{await b.close()}
