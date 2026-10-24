import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Printers navigation opens the P2S and X2D fleet catalog', () => {
  assert.match(html, /<a href="#printers"[^>]*>[\s\S]*?Printers/);
  assert.match(html, /<section class="fleet-section" id="printers"/);
  assert.match(html, /<h3>P2S<\/h3>[\s\S]*?2 PRINTERS/);
  assert.match(html, /<h3>X2D<\/h3>[\s\S]*?1 PRINTER/);
  assert.match(html, /256 × 256 × 256 mm/);
  assert.match(html, /235\.5 × 256 × 256 mm/);
  assert.ok(existsSync(new URL('../assets/bambu-p2s.jpg', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/bambu-x2d.jpg', import.meta.url)));
});

test('Schedule navigation targets the 24-hour calendar', () => {
  assert.match(html, /<a href="#schedule"[^>]*>[\s\S]*?Schedule/);
  assert.match(html, /class="panel printer-schedule" id="schedule"/);
  assert.match(html, /for\(let hour=0;hour<=24;hour\+=4\)/);
});

test('booking form accepts a minute-level start and separate duration hours/minutes', () => {
  assert.match(html, /id="slotValue" type="time" step="60" required/);
  assert.match(html, /id="durationHours" type="number"/);
  assert.match(html, /id="durationMinutes" type="number"/);
  assert.doesNotMatch(html, /id="optionDurations"|id="optionTimes"/);
});
