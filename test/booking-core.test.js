import test from 'node:test';
import assert from 'node:assert/strict';
import '../lib/booking-core.js';

const api = globalThis.PrintBooking;
const options = { purposes: ['Testing'], filaments: ['PLA-Basic'], colors: ['Black'] };
const base = { project: 'Bracket', person: 'Zhi Hao', printer: 'P1', start: '14:14', duration: 2 + 14 / 60, purpose: 'Testing', filament: 'PLA-Basic', filamentColor: 'Black', date: '2026-10-12' };

test('accepts an arbitrary minute-level start and hour/minute duration', () => {
  assert.equal(api.validateBooking(base, options), true);
  assert.equal(api.validTime('14:14'), true);
});

test('rejects invalid times, dates, and duration boundaries', () => {
  assert.equal(api.validTime('24:00'), false);
  assert.equal(api.validateBooking({ ...base, start: '14:60' }, options), false);
  assert.equal(api.validateBooking({ ...base, date: '2026-02-30' }, options), false);
  assert.equal(api.validateBooking({ ...base, duration: 0 }, options), false);
  assert.equal(api.validateBooking({ ...base, duration: 0.00001 }, options), false);
  assert.equal(api.validateBooking({ ...base, duration: 48.01 }, options), false);
});

test('does not require preset duration or start-time options', () => {
  assert.equal(api.validateBooking(base, { ...options, durations: [2], times: ['08:00'] }), true);
});

test('detects a booking that crosses midnight and rejects a next-morning overlap', () => {
  const overnight = { date: '2026-10-12', start: '17:30', duration: 15.5 };
  assert.equal(api.intervalsOverlap(overnight.date, overnight.start, overnight.duration, '2026-10-13', '08:59', 1), true);
  assert.equal(api.intervalsOverlap(overnight.date, overnight.start, overnight.duration, '2026-10-13', '09:00', 1), false);
});

test('allows a booking to start exactly when the previous job ends', () => {
  assert.equal(api.intervalsOverlap('2026-10-12', '17:30', 15.5, '2026-10-13', '09:00', 2), false);
});
