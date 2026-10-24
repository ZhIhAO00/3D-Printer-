import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('Printers navigation opens the P2S and X2D fleet catalog', () => {
  assert.match(html, /<a href="#printers"[^>]*>[\s\S]*?Printers/);
  assert.match(html, /<section class="fleet-section workspace-view" id="printers"[^>]*hidden/);
  assert.match(html, /<h3>P2S<\/h3>[\s\S]*?2 PRINTERS/);
  assert.match(html, /<h3>X2D<\/h3>[\s\S]*?1 PRINTER/);
  assert.match(html, /256 × 256 × 256 mm/);
  assert.match(html, /235\.5 × 256 × 256 mm/);
  assert.ok(existsSync(new URL('../assets/bambu-p2s.jpg', import.meta.url)));
  assert.ok(existsSync(new URL('../assets/bambu-x2d.jpg', import.meta.url)));
});

test('Print queue includes the 24-hour availability calendar', () => {
  assert.match(html, /<a href="#queue"[^>]*>[\s\S]*?Print queue/);
  assert.match(html, /class="panel printer-schedule workspace-view" id="queueSchedule"[^>]*hidden/);
  assert.doesNotMatch(html, /<a href="#schedule"/);
  assert.match(html, /for\(let hour=0;hour<=24;hour\+=4\)/);
});

test('workspace has only Print queue and Printers views', () => {
  assert.match(html, /<div class="content-grid workspace-view" id="queue">/);
  assert.match(html, /section\.id==='queueSchedule'\?view!=='queue'/);
  assert.match(html, /view=requested==='printers'\?'printers':'queue'/);
  assert.doesNotMatch(html, /requested==='schedule'|schedule:'Schedule'/);
  assert.match(html, /function showWorkspaceView\(\)/);
  assert.match(html, /addEventListener\('hashchange',showWorkspaceView\)/);
});

test('booking form receives more room than the upcoming queue', () => {
  assert.match(html, /\.content-grid\{display:grid;grid-template-columns:minmax\(0,\.8fr\) minmax\(460px,1\.2fr\)/);
  assert.match(html, /class="two-col booking-fields"/);
  assert.match(html, /\.duration-inputs\{grid-template-columns:minmax\(75px,\.8fr\) minmax\(92px,1\.2fr\)\}/);
});

test('booking form accepts a minute-level start and separate duration hours/minutes', () => {
  assert.match(html, /id="slotValue" type="time" step="60" required/);
  assert.match(html, /id="durationHours" type="number"/);
  assert.match(html, /id="durationMinutes" type="number"/);
  assert.doesNotMatch(html, /id="optionDurations"|id="optionTimes"/);
});

