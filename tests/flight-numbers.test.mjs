import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
test('Every listed airline route has flight numbers with traceable evidence',()=>{
for(const a of ['china-airlines','eva-air','starlux'])for(const r of JSON.parse(fs.readFileSync(`data/${a}/routes.json`)).items){
 const e=r.flight_number_evidence||r.schedule_evidence;
 assert.ok(e,`${a} ${r.origin}-${r.destination}`);
 assert.ok(e.source_url?.startsWith('https://'));
 if(r.flight_number_evidence){assert.match(e.outbound,/^(CI|BR|JX)\d/);assert.match(e.inbound,/^(CI|BR|JX)\d/);assert.ok(e.period_label||e.valid_to||e.verified_date);}
 else assert.ok(e.flight_numbers);
 if(e.valid_from&&e.valid_to)assert.ok(e.valid_from<=e.valid_to);
}
});
