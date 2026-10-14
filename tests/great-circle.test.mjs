import {test} from 'node:test';
import assert from 'node:assert/strict';
import {greatCircle} from '../src/great-circle.mjs';
test('Transpacific arc reaches both airports and crosses the date line continuously',()=>{
 const a=[25.08,121.23],b=[33.94,-118.41],p=greatCircle(a,b);
 assert.ok(Math.abs(p[0][0]-a[0])<1e-8);
 assert.ok(Math.abs(p[0][1]-a[1])<1e-8);
 assert.ok(Math.abs(p.at(-1)[0]-b[0])<1e-8);
 assert.ok(Math.abs(p.at(-1)[1]-360-b[1])<1e-8);
 assert.ok(Math.max(...p.map(x=>x[0]))>45);
 for(let i=1;i<p.length;i++)assert.ok(Math.abs(p[i][1]-p[i-1][1])<180);
});
test('Coincident and antipodal airports produce finite coordinates',()=>{
 for(const [a,b] of [[[0,0],[0,0]],[[0,0],[0,180]],[[90,0],[-90,0]]])
  assert.ok(greatCircle(a,b).flat().every(Number.isFinite));
});
