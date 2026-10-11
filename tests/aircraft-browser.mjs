import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL || 'http://127.0.0.1:4173/';
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
try {
 for(const [id,count] of [['china-airlines',7],['eva-air',6],['starlux',4]]) {
  await page.goto(base+'#'+id+'/fleet');await page.locator('.aircraft-photo').first().waitFor();
  assert.equal(await page.locator('.aircraft-photo').count(),count);
  for(const figure of await page.locator('.aircraft-photo').all()) {
   await figure.scrollIntoViewIfNeeded();await figure.evaluate(e=>e.querySelector('img')?.decode().catch(()=>{}));
   assert.ok(await figure.evaluate(e=>!!e.querySelector('img')?.naturalWidth));
   assert.ok((await figure.locator('a').getAttribute('href')).startsWith('https://'));
  }
  await page.locator('.aircraft-photo').first().scrollIntoViewIfNeeded();
  await page.screenshot({path:'tests/'+id+'-photos.png'});
  for(const width of [320,390,768,1440]) {
   await page.setViewportSize({width,height:900});
   await page.evaluate(()=>document.documentElement.style.setProperty('--reading-scale','1.5'));
   await page.locator('.aircraft-detail').first().evaluate(e=>e.open=true);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),id+' '+width);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.evaluate(()=>document.documentElement.style.setProperty('--reading-scale','1'));
 }
 await page.route('**/aircraft/**',route=>route.abort());
 await page.goto(base+'#china-airlines/fleet');await page.locator('.aircraft-photo').first().scrollIntoViewIfNeeded();
 await page.locator('.aircraft-photo-fallback').first().waitFor();
 assert.ok(await page.locator('.aircraft-photo figcaption a').first().isVisible());
 assert.deepEqual(errors,[]);
 console.log('PASS all 17 sourced aircraft images, 150% at 4 widths, image failure fallback, no runtime errors');
} finally {await browser.close();}
