import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome'}),p=await b.newPage();
const errors=[];p.on('pageerror',e=>errors.push(e.message));
try {
 await p.goto((process.env.TEST_URL||'http://127.0.0.1:5173/')+'#china-airlines/overview');
 await p.locator('.membership-section').scrollIntoViewIfNeeded();
 await p.waitForTimeout(3500);
 assert.equal(await p.locator('.membership-section tbody tr').count(),4);
 assert.equal(await p.locator('.member-card-image').count(),4);
 assert.ok(await p.locator('.member-card-image').evaluateAll(xs=>xs.every(x=>x.complete&&x.naturalWidth>0)));
 assert.equal(await p.locator('main .source:visible').count(),0);
 await p.locator('.page-evidence>summary').click();
 assert.ok(await p.locator('.page-evidence article').count()>0);
 await p.locator('.page-evidence .source>summary').first().click();
 assert.ok(await p.locator('.page-evidence .source[open] a').first().isVisible());
 await p.setViewportSize({width:390,height:844});
 await p.locator('.membership-section').scrollIntoViewIfNeeded();
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 assert.deepEqual(errors,[]);
 console.log('PASS hidden sources, on-demand evidence, four loaded CI card illustrations and mobile overflow');
} finally {await b.close()}
