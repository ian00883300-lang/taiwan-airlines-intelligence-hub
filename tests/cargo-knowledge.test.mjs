import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>JSON.parse(fs.readFileSync(p));
test('Cargo observations retain aircraft, registration, directed sector and dated evidence',()=>{
 const cargo=read('data/cargo-routes.json').items,airports=read('data/airports.json').items;
 assert.equal(new Set(cargo.map(x=>x.id)).size,cargo.length);
 for(const r of cargo){
  const fleet=read(`data/${r.airline}/fleet.json`).items;
  assert.ok(fleet.some(x=>x.kind==='cargo'&&x.aircraft_type===r.aircraft));
  assert.ok(airports[r.origin]&&airports[r.destination]);
  assert.equal(r.route_type,'self_operated_cargo');
  assert.equal(r.evidence_kind,'observed_cargo_flight');
  assert.match(r.registration,/^B-\d{5}$/);
  assert.match(r.observed_flight,/^(CI|BR)\d+$/);
  assert.match(r.as_of,/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(r.as_of<=r.verified_date);
  assert.ok(r.source_url.endsWith(r.registration.toLowerCase()));
  assert.equal(r.event_date,undefined,'Observation must not be asserted as first-flight date');
 }
 assert.ok(cargo.some(r=>r.origin==='ANC'),'Preserve onward sectors rather than invent nonstop flights');
});
test('Knowledge topics have unique IDs, bilingual answers and traceable sources',()=>{
 const items=[...read('data/aviation-knowledge.json').items,...read('data/aircraft-knowledge.json').items];
 assert.equal(new Set(items.map(x=>x.id)).size,items.length);
 for(const x of items){assert.ok(x.answer&&x.answer_en&&x.caution&&x.follow_up,x.id);assert.ok(x.source_url.startsWith('https://'),x.id);}
});
