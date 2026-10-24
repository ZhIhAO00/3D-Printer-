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

test('workspace navigation separates queue, printers, print history, and utilization', () => {
  assert.match(html, /<div class="content-grid workspace-view" id="queue">/);
  assert.match(html, /\.workspace-view\[hidden\]\{display:none!important\}/);
  assert.match(html, /section\.id==='queueSchedule'\?view!=='queue'/);
  assert.match(html, /view=\['printers','history','utilization'\]\.includes\(requested\)\?requested:'queue'/);
  assert.doesNotMatch(html, /requested==='schedule'|schedule:'Schedule'/);
  assert.match(html, /function showWorkspaceView\(\)/);
  assert.match(html, /addEventListener\('hashchange',showWorkspaceView\)/);
  for (const view of ['printers', 'history', 'utilization']) assert.match(html, new RegExp(`href="#${view}"`));
});

test('print history is a searchable table with all requested booking details', () => {
  assert.match(html, /id="history"[^>]*hidden/);
  for (const heading of ['Date', 'Start time', 'Duration', 'Project \/ part', 'Who booked', 'Purpose', 'Printer', 'Filament', 'Color']) {
    assert.ok(html.includes(`<th>${heading}</th>`), `Missing history column: ${heading}`);
  }
  assert.match(html, /function renderHistory\(\)/);
  assert.match(html, /historySearch'\)\.addEventListener\('input',renderHistory\)/);
  assert.match(html, /const all=jobs\.slice\(\)\.sort\(\(a,b\)=>\(b\.date/);
});

test('utilization reports per-printer booked time over a selected date range', () => {
  assert.match(html, /id="utilization"[^>]*hidden/);
  assert.match(html, /id="utilFrom" type="date"/);
  assert.match(html, /id="utilTo" type="date"/);
  assert.match(html, /id="utilRows"/);
  assert.match(html, /capacity=days\*24/);
  assert.match(html, /Math\.max\(0,Math\.min\(end,rangeEnd\)-Math\.max\(start,rangeStart\)\)/);
  assert.match(html, /not live machine telemetry/);
});

test('workspace markup contains no visible escaped newline text', () => {
  const markup = html.split('<script>')[0];
  assert.doesNotMatch(markup, /\\\\n/);
});

test('expired and completed jobs are filtered from queue and printer schedule views', () => {
  assert.match(html, /visibleJobs=jobs\.filter\(job=>PrintBooking\.isCurrentOrFuture/);
  assert.match(html, /printerJobs=jobs\.filter\(job=>job\.printer===printer\.id&&PrintBooking\.isCurrentOrFuture/);
  assert.match(html, /queueBadge'\)\.textContent=`\$\{String\(visibleJobs\.length\)/);
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

test('booking name uses a purpose-style dropdown with an add-new-name option', () => {
  assert.match(html, /<label for="name">3\. Who is booking\?<\/label><select id="name" name="name" required>/);
  assert.match(html, /addNew\.value='__new_user__';addNew\.textContent='Enter a new name…'/);
  assert.match(html, /function getBookingName\(\)/);
  assert.match(html, /newName'\)\.addEventListener\('input'.*layerline\.userName/s);
  assert.doesNotMatch(html, /<datalist id="userSuggestions"/);
});

test('successful booking clears all form choices and the workspace printer badge is removed', () => {
  assert.match(html, /function resetBookingForm\(\)\{[\s\S]*?\['date','slotValue','durationHours','durationMinutes','name','newName','purpose','filament','filamentColor'\]/);
  assert.match(html, /resetBookingForm\(\)\}catch\(error\)/);
  assert.doesNotMatch(html, /id="navPrinterCount"/);
  assert.doesNotMatch(html, /getElementById\('navPrinterCount'\)/);
});

test('printer choices keep the availability order and show the requested machine names', () => {
  assert.match(html, /printerSelectionNames=\{P1:'Bambu Lab P2S - 079',P2:'Bambu Lab P2S - 857',P3:'Bambu Lab X2D - 765'\}/);
  assert.match(html, /ordered=\[\.\.\.printers\]\.sort\(\(a,b\)=>a\.id\.localeCompare\(b\.id\)\)/);
  assert.match(html, /textContent=printerSelectionNames\[p\.id\]\|\|p\.name/);
  assert.doesNotMatch(html, /LIGHTEST QUEUE|sort\(\(a,b\)=>loadFor\(a\)-loadFor\(b\)\)/);
});

test('printer rendering does not reference queue-local variables', () => {
  const renderQueue = html.match(/function renderQueue\(\)\{[\s\S]*?\n  function filterQueueRows/)[0];
  assert.match(renderQueue, /if\(!sorted\.length\)/);
  assert.doesNotMatch(renderQueue, /ordered/);
});

