import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage();
const base=process.env.TEST_URL||'http://127.0.0.1:5173/';const errors=[];p.on('pageerror',e=>errors.push(e.message));
try{
 for(const width of [390,768,1440]){
  await p.setViewportSize({width,height:1000});await p.goto(base+'#starlux/overview');
  const brand=p.getByRole('region',{name:'星宇企業識別與五感服務'});await brand.waitFor();
  for(const colour of ['大地金','玫瑰金','曜石灰'])assert.ok((await brand.innerText()).includes(colour));
  const senses=brand.locator('.brand-senses');assert.equal(await senses.getAttribute('open'),null);await senses.locator('summary').first().click();
  assert.equal(await senses.locator('dt').count(),5);assert.match(await senses.innerText(),/2020/);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
  if(width===1440)await brand.screenshot({path:'tmp-audit/brand-desktop.png'});
  if(width===390)await brand.screenshot({path:'tmp-audit/brand-mobile.png'});
  await p.goto(base+'#china-airlines/routes');await p.getByLabel('證據範圍',{exact:true}).selectOption('dated');
  const rows=p.locator('tr[data-route]');assert.ok(await rows.count()>10);
  for(const row of await rows.all())assert.doesNotMatch(await row.locator('.route-event-date').innerText(),/pending|待查核/);
  const sea=rows.filter({hasText:'TPE → SEA'});assert.match(await sea.locator('.route-event-date').innerText(),/復航/);assert.match(await sea.innerText(),/2024年7月14日/);
  await p.getByLabel('航空公司',{exact:true}).selectOption('starlux');
  assert.match(await rows.filter({hasText:'RMQ → TAK'}).locator('.route-event-date').innerText(),/包機首航/);
  assert.match(await rows.filter({hasText:'TPE → NRT'}).locator('.route-event-date').innerText(),/2020年12月16日/);
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 }
 assert.deepEqual(errors,[]);console.log('PASS brand sources and five senses; dated filter; Seattle resumption, Takamatsu charter and Narita route versus aircraft inaugural; three viewports');
}finally{await b.close();}

