import test from 'node:test';
import assert from 'node:assert/strict';
import {taipeiDay,taipeiWeek,latestVerified} from '../src/report-dates.mjs';
test('Weekly reports use Taipei Monday boundaries, including year rollover',()=>{
 assert.equal(taipeiDay(new Date('2026-10-25T16:00:00Z')),'2026-10-26');
 assert.deepEqual(taipeiWeek(new Date('2026-10-25T15:59:00Z')),{start:'2026-10-19',end:'2026-10-25'});
 assert.deepEqual(taipeiWeek(new Date('2026-10-25T16:00:00Z')),{start:'2026-10-26',end:'2026-11-01'});
 assert.deepEqual(taipeiWeek(new Date('2027-01-01T00:00:00Z')),{start:'2026-12-28',end:'2027-01-03'});
 assert.equal(latestVerified([{verified_date:'2026-10-24'},{published_date:'2026-10-28'},{verified_date:'2026-10-27'}]),'2026-10-27');
});
