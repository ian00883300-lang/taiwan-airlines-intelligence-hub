import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base = process.env.TEST_URL || 'http://127.0.0.1:4176/';
const browser = await chromium.launch({channel:'chrome',headless:true});
try {
 const page = await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[]; page.on('pageerror', e=>errors.push(e.message));
 await page.goto(base + '#starlux/fleet');
 await page.locator('.donut b').waitFor();
 assert.equal(await page.locator('.donut b').innerText(),'38');
 const row=page.locator('.fleet-summary-table tbody tr').filter({hasText:'A350-1000'});
 assert.equal(await row.locator('td').nth(1).innerText(),'5');
 assert.equal(await page.locator('.chart-legend li').filter({hasText:'A350-1000'}).locator('b').innerText(),'5');
 const section=page.locator('.aircraft-registrations').filter({hasText:'B-58555'});
 await section.locator(':scope > details > summary').click();
 await section.getByRole('textbox').fill('B-58555');
 assert.match(await section.innerText(),/出廠 待查核/);
 assert.match(await section.innerText(),/機齡 待查核/);
 assert.equal(await page.getByText('新增待核實機型',{exact:true}).count(),0);
 await page.setViewportSize({width:390,height:844});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1),false);
 assert.deepEqual(errors,[]);
 console.log('PASS 38 fleet, A350-1000 5 in chart/table, new tail unknown age, mobile width and runtime');
} finally { await browser.close(); }
