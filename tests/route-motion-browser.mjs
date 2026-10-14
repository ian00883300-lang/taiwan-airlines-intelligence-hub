import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:390,height:844}});
try {
 await page.goto((process.env.TEST_URL||'http://127.0.0.1:5173/')+'#china-airlines/routes');
 await page.locator('path.route-flow').first().waitFor();
 const count=await page.locator('path.route-flow').count();
 assert.equal(count,66);
 assert.ok(await page.locator('path.route-flow').evaluateAll(es=>es.some(e=>(e.getAttribute('d').match(/L/g)||[]).length>5)));
 assert.equal(await page.locator('path.route-flow').first().evaluate(e=>getComputedStyle(e).animationName),'route-flow');
 await page.getByLabel('證據範圍',{exact:true}).selectOption('operating');
 await page.waitForFunction(()=>document.querySelectorAll('path.route-flow').length<66);
 assert.equal(await page.locator('path.route-flow').count(),Number((await page.locator('.filter-count').innerText()).match(/\d+/)[0]));
 await page.emulateMedia({reducedMotion:'reduce'});
 assert.equal(await page.locator('path.route-flow').first().evaluate(e=>getComputedStyle(e).animationName),'none');
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 console.log('PASS great-circle SVG geometry, animation, reduced motion, evidence-filter redraw and mobile width');
} finally {await browser.close();}
