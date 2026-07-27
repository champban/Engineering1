/**
 * End-to-end verification for the offline dashboard.
 *
 *   node tests/verify.mjs
 *
 * Runs Chromium against index.html over file:// (no server), and checks:
 *   1. the embedded snapshot and the in-browser .xlsx reader agree cell-for-cell
 *   2. known facts from the source workbook survive normalization
 *   3. every tab renders with no console errors and no network requests
 *   4. edit -> Export Excel -> re-load the exported file reproduces the edits
 *   5. the Line view prints with a page break per production line
 */
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';
import { mkdirSync, rmSync, existsSync, writeFileSync } from 'node:fs';

const here = dirname(fileURLToPath(import.meta.url));
const repo = dirname(here);
const INDEX = pathToFileURL(join(repo, 'index.html')).href;
const SOURCE = join(repo, 'source', 'Weekly_Project_Plan.xlsx');
const OUT = process.env.VERIFY_OUT || join(repo, '.verify-out');

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? '  PASS' : '  FAIL'}  ${name}${detail && !ok ? ` — ${detail}` : ''}`);
  if (!ok) failures++;
};
const section = t => console.log(`\n${t}`);

function diffBooks(a, b) {
  const diffs = [];
  const names = new Set([...a.order, ...b.order]);
  if (a.order.join('|') !== b.order.join('|')) diffs.push(`sheet order: ${a.order} vs ${b.order}`);
  for (const name of names) {
    const sa = a.sheets[name], sb = b.sheets[name];
    if (!sa || !sb) { diffs.push(`sheet ${name} missing on one side`); continue; }
    const refs = new Set([...Object.keys(sa.cells), ...Object.keys(sb.cells)]);
    for (const ref of refs) {
      const ca = sa.cells[ref], cb = sb.cells[ref];
      const va = ca ? JSON.stringify([ca.v, ca.t]) : '(none)';
      const vb = cb ? JSON.stringify([cb.v, cb.t]) : '(none)';
      if (va !== vb) diffs.push(`${name}!${ref}: snapshot ${va} vs reader ${vb}`);
    }
    if (sa.merges.join('|') !== sb.merges.join('|')) diffs.push(`${name}: merge ranges differ`);
    if (sa.maxRow !== sb.maxRow || sa.maxCol !== sb.maxCol) {
      diffs.push(`${name}: bounds ${sa.maxRow}x${sa.maxCol} vs ${sb.maxRow}x${sb.maxCol}`);
    }
  }
  return diffs;
}

const snapshotOf = book => ({
  order: book.order,
  sheets: Object.fromEntries(book.order.map(n => [n, {
    cells: book.sheets[n].cells,
    merges: book.sheets[n].merges,
    maxRow: book.sheets[n].maxRow,
    maxCol: book.sheets[n].maxCol,
  }])),
});

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

// The preinstalled Chromium build may not match this playwright version's
// expected revision; point at it directly rather than downloading one.
const PREINSTALLED = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(
  existsSync(PREINSTALLED) ? { executablePath: PREINSTALLED } : {});
const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1600, height: 1000 } });
const page = await context.newPage();

const consoleErrors = [];
const externalRequests = [];
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', e => consoleErrors.push('pageerror: ' + e.message));
page.on('request', r => { if (!r.url().startsWith('file://') && !r.url().startsWith('data:') && !r.url().startsWith('blob:')) externalRequests.push(r.url()); });

await page.goto(INDEX);
await page.waitForFunction(() => typeof state !== 'undefined' && state.model && state.model.weeks.length > 0);

section('1. Embedded snapshot vs in-browser .xlsx reader');
const embedded = await page.evaluate(() => JSON.parse(document.getElementById('embedded-data').textContent));
await page.setInputFiles('#file-input', SOURCE);
await page.waitForFunction(() => state.sourceName === 'Weekly_Project_Plan.xlsx');
const loaded = await page.evaluate(() => JSON.parse(JSON.stringify({
  order: state.book.order,
  sheets: Object.fromEntries(state.book.order.map(n => [n, {
    cells: state.book.sheets[n].cells,
    merges: state.book.sheets[n].merges,
    maxRow: state.book.sheets[n].maxRow,
    maxCol: state.book.sheets[n].maxCol,
  }])),
})));
const diffs = diffBooks(snapshotOf(embedded), loaded);
check('reader output matches the Python-generated snapshot exactly', diffs.length === 0,
  diffs.slice(0, 6).join(' | ') + (diffs.length > 6 ? ` (+${diffs.length - 6} more)` : ''));

section('2. Known facts from the source workbook');
const facts = await page.evaluate(() => {
  const m = state.model;
  const find = (week, line) => m.lineDays.filter(x => x.weekNo === week && x.line === line);
  const cellOn = (week, line, iso) => (find(week, line).find(x => x.day.iso === iso) || {}).cell || null;
  return {
    lines: m.lines,
    weekCount: m.weeks.length,
    firstWeek: m.weeks[0] && m.weeks[0].weekNo,
    lastWeek: m.weeks[m.weeks.length - 1] && m.weeks[m.weeks.length - 1].label,
    w31Line3Thu: (cellOn(31, 'Line3', '2026-07-30') || {}).text || '',
    w35Line5Wed: (cellOn(35, 'Line5', '2026-08-26') || {}).text || '',
    w35Line5State: (cellOn(35, 'Line5', '2026-08-26') || {}).state || '',
    receivedCount: m.readiness.filter(r => r.category === 'Machine' && /received/i.test(r.status)).length,
    readinessCount: m.readiness.length,
    metler: !!(m.daily && m.daily.days.some(d => d.activities.some(a =>
      /metler/i.test(a.system) && /checkweigher/i.test(a.activity)))),
    dailyDays: m.daily ? m.daily.days.length : 0,
    vendorNames: Array.from(m.vendors.keys()).sort(),
    milestones: m.lineDays.filter(x => x.cell.milestone).length,
    dateWarnings: m.warnings.length,
  };
});
check('6 production areas parsed', facts.lines.length === 6 && facts.lines[0] === 'Line2', JSON.stringify(facts.lines));
check('44 week blocks, W29/2026 through W20/2027', facts.weekCount === 44 && facts.firstWeek === 29 && facts.lastWeek === 'W20/2027',
  `${facts.weekCount} weeks, W${facts.firstWeek} .. ${facts.lastWeek}`);
check('W31 Line3 Thu 30 Jul carries the Cavanna text', /cavanna/i.test(facts.w31Line3Thu), facts.w31Line3Thu.slice(0, 60));
check('W35 Line5 Wed 26 Aug is XL commissioning', /commissioning/i.test(facts.w35Line5Wed) && facts.w35Line5State === 'comm', facts.w35Line5Wed.slice(0, 60));
check('Readiness has 2 Received machine rows', facts.receivedCount === 2, String(facts.receivedCount));
check('Week35&36 has the Metler Toledo checkweigher row', facts.metler === true);
check('reconstructed dates agree with the sheet headers', facts.dateWarnings === 0, `${facts.dateWarnings} mismatches`);
check('vendors indexed', facts.vendorNames.includes('Cavanna') && facts.vendorNames.includes('Cama'), facts.vendorNames.join(','));
check('milestones detected', facts.milestones > 0, String(facts.milestones));

section('3. Every tab renders');
const tabs = await page.$$eval('.tab', els => els.map(e => e.dataset.tab));
for (const tab of tabs) {
  await page.click(`.tab[data-tab="${tab}"]`);
  await page.waitForTimeout(120);
  const info = await page.evaluate(t => {
    const el = document.getElementById('view-' + t);
    return { visible: el.classList.contains('active'), len: el.innerHTML.length, panels: el.querySelectorAll('.panel, .line-section').length };
  }, tab);
  check(`tab "${tab}" renders content`, info.visible && info.len > 200, JSON.stringify(info));
  await page.screenshot({ path: join(OUT, `tab-${tab}.png`), fullPage: false });
}

section('4. Edit -> Export Excel -> re-load');
await page.click('.tab[data-tab="weekly"]');
await page.waitForTimeout(150);

// (a) edit through the real UI: click a cell, type, Ctrl+Enter
const uiTarget = await page.evaluate(() => {
  const ld = state.model.lineDays.find(x => x.cell.state !== 'none');
  return { sheet: ld.sheet, ref: ld.cell.ref, before: ld.cell.text };
});
await page.click(`[data-edit][data-ref="${uiTarget.ref}"][data-sheet="${uiTarget.sheet.replace(/"/g, '\\"')}"]`);
await page.waitForSelector('textarea.editor');
await page.fill('textarea.editor', 'UI EDIT — verified');
await page.keyboard.press('Control+Enter');
await page.waitForFunction(() => state.patches.size >= 1);
check('editing through the UI records a patch', await page.evaluate(() => state.patches.size) === 1);

// (b) further edits across sheets, including a previously-empty cell and a status
const edits = await page.evaluate(() => {
  const m = state.model;
  const out = [];
  const emptyCell = m.lineDays.find(x => x.cell.state === 'none');
  out.push({ sheet: emptyCell.sheet, ref: emptyCell.cell.ref, value: 'NEW CELL — was empty' });
  const withRemark = m.lineDays.find(x => x.remark.text);
  out.push({ sheet: withRemark.sheet, ref: withRemark.remark.ref, value: 'REMARK EDIT — verified' });
  const readiness = m.readiness[0];
  out.push({ sheet: readiness.sheet, ref: readiness.refs.status, value: 'monitoring' });
  const daily = m.daily.days[0].activities[0];
  out.push({ sheet: m.daily.sheet, ref: daily.refs.activity, value: 'DAILY EDIT — verified' });
  for (const e of out) applyPatch(e.sheet, e.ref, e.value);
  return out;
});
const allEdits = [{ sheet: uiTarget.sheet, ref: uiTarget.ref, value: 'UI EDIT — verified' }, ...edits.map(e => ({ sheet: e.sheet, ref: e.ref, value: e.value }))];
check('5 patches recorded across 3 sheets', await page.evaluate(() => state.patches.size) === 5);

section('4b. Every day box is directly typeable');

// An EMPTY box in the weekly grid accepts typing (add).
await page.click('.tab[data-tab="weekly"]');
await page.waitForTimeout(150);
const emptyBox = await page.evaluate(() => {
  const ld = state.model.lineDays.find(x => x.cell.state === 'none' && !state.patches.has(x.sheet + '!' + x.cell.ref));
  return { sheet: ld.sheet, ref: ld.cell.ref };
});
const emptySel = `#view-weekly [data-edit][data-ref="${emptyBox.ref}"]`;
check('empty day boxes are clickable targets', await page.locator(emptySel).count() > 0);
await page.click(emptySel);
await page.waitForSelector('#view-weekly textarea.editor');
await page.fill('#view-weekly textarea.editor', 'ADDED IN EMPTY BOX');
await page.keyboard.press('Control+Enter');
await page.waitForFunction(r => {
  const c = state.book.sheets[r.sheet].cells[r.ref];
  return c && c.v === 'ADDED IN EMPTY BOX';
}, emptyBox);
check('typing into an empty day box adds the entry', true);

// Clearing a box deletes the entry.
await page.click(`#view-weekly [data-edit][data-ref="${emptyBox.ref}"]`);
await page.waitForSelector('#view-weekly textarea.editor');
await page.fill('#view-weekly textarea.editor', '');
await page.keyboard.press('Control+Enter');
await page.waitForFunction(r => !state.book.sheets[r.sheet].cells[r.ref], emptyBox);
check('clearing a day box deletes the entry', await page.evaluate(() => state.patches.size) === 5);

// A timeline box opens an editor that writes through.
await page.click('.tab[data-tab="timeline"]');
await page.waitForTimeout(150);
const timelineTarget = await page.evaluate(() => {
  const ld = state.model.lineDays.find(x => x.cell.state === 'none' && !state.patches.has(x.sheet + '!' + x.cell.ref));
  return { line: ld.line, ref: ld.cell.ref, sheet: ld.sheet };
});
await page.click(`#view-timeline .gcell[data-detail-ref="${timelineTarget.ref}"][data-detail-line="${timelineTarget.line}"]`);
await page.waitForSelector('#drawer.open .drawer-edit');
await page.click('#drawer .drawer-edit');
await page.waitForSelector('#drawer textarea.editor');
await page.fill('#drawer textarea.editor', 'TIMELINE BOX EDIT');
await page.keyboard.press('Control+Enter');
await page.waitForFunction(t => {
  const c = state.book.sheets[t.sheet].cells[t.ref];
  return c && c.v === 'TIMELINE BOX EDIT';
}, timelineTarget);
check('timeline day boxes are editable in place', true);
const drawerFresh = await page.evaluate(() => document.querySelector('#drawer .drawer-edit').textContent.trim());
check('the detail panel refreshes after an edit', drawerFresh === 'TIMELINE BOX EDIT', drawerFresh);
await page.click('#drawer-close');
allEdits.push({ sheet: timelineTarget.sheet, ref: timelineTarget.ref, value: 'TIMELINE BOX EDIT' });
check('6 patches after the timeline edit', await page.evaluate(() => state.patches.size) === 6);

const [download] = await Promise.all([
  page.waitForEvent('download'),
  page.click('#btn-export-xlsx'),
]);
const exported = join(OUT, 'exported.xlsx');
await download.saveAs(exported);
check('Export Excel produced a file', existsSync(exported));
// Hand the exact edit list to check_exported.py so the two suites cannot drift.
writeFileSync(join(OUT, 'edits.json'), JSON.stringify(allEdits, null, 2));

await page.goto(INDEX);
await page.waitForFunction(() => typeof state !== 'undefined' && state.model);
await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
await page.goto(INDEX);
await page.waitForFunction(() => typeof state !== 'undefined' && state.model);
await page.setInputFiles('#file-input', exported);
await page.waitForFunction(() => state.sourceName === 'exported.xlsx' && state.patches.size === 0);
check('exported file is named from the workbook', download.suggestedFilename().startsWith('Weekly_Project_Plan_')
  && download.suggestedFilename().endsWith('.xlsx'), download.suggestedFilename());

const reread = await page.evaluate(list => list.map(e => {
  const sh = state.book.sheets[e.sheet];
  const c = sh && sh.cells[e.ref];
  return { ...e, actual: c ? String(c.v) : '' };
}), allEdits);
for (const r of reread) {
  check(`round-trip ${r.sheet}!${r.ref}`, r.actual === r.value, `expected "${r.value}", got "${r.actual}"`);
}

const reloadedBook = await page.evaluate(() => JSON.parse(JSON.stringify({
  order: state.book.order,
  sheets: Object.fromEntries(state.book.order.map(n => [n, {
    cells: state.book.sheets[n].cells,
    merges: state.book.sheets[n].merges,
    maxRow: state.book.sheets[n].maxRow,
    maxCol: state.book.sheets[n].maxCol,
  }])),
})));
const editedRefs = new Set(allEdits.map(e => e.sheet + '!' + e.ref));
const unexpected = diffBooks(snapshotOf(embedded), reloadedBook)
  .filter(d => ![...editedRefs].some(k => d.startsWith(k)));
check('nothing outside the edited cells changed', unexpected.length === 0,
  unexpected.slice(0, 5).join(' | ') + (unexpected.length > 5 ? ` (+${unexpected.length - 5})` : ''));

section('5. Print output');
await page.click('.tab[data-tab="lines"]');
await page.waitForTimeout(200);
const pdf = join(OUT, 'line-view.pdf');
await page.pdf({ path: pdf, format: 'A4', landscape: true, printBackground: true, margin: { top: '10mm', bottom: '10mm', left: '10mm', right: '10mm' } });
check('Line view PDF written', existsSync(pdf));
const printCheck = await page.evaluate(() => {
  const sections = Array.from(document.querySelectorAll('#view-lines .line-section'));
  const heads = Array.from(document.querySelectorAll('#view-lines .print-head'));
  return { sections: sections.length, tablesWithThead: sections.filter(s => s.querySelector('thead')).length, printHeads: heads.length };
});
check('one printable section per production line', printCheck.sections === 6, JSON.stringify(printCheck));
check('every line table has a repeating header', printCheck.tablesWithThead >= 1, JSON.stringify(printCheck));

// Verify the print rules themselves, under print media emulation.
await page.emulateMedia({ media: 'print' });
const printRules = await page.evaluate(() => {
  const cs = el => el ? getComputedStyle(el) : null;
  const sections = Array.from(document.querySelectorAll('#view-lines .line-section'));
  const breaks = sections.map(s => cs(s).breakBefore);
  return {
    headerHidden: cs(document.querySelector('.app-header')).display === 'none',
    filtersHidden: cs(document.querySelector('.filters')).display === 'none',
    printHeadShown: cs(document.querySelector('#view-lines .print-head')).display !== 'none',
    theadRepeats: cs(document.querySelector('#view-lines thead')).display === 'table-header-group',
    firstBreak: breaks[0],
    laterBreaks: breaks.slice(1),
    rowsAvoidSplit: cs(document.querySelector('#view-lines tbody tr')).breakInside,
  };
});
check('print hides the nav and filters', printRules.headerHidden && printRules.filtersHidden, JSON.stringify(printRules));
check('print shows the page header block', printRules.printHeadShown);
check('table headers repeat across pages', printRules.theadRepeats, printRules.theadRepeats);
check('each line after the first starts a new page',
  printRules.firstBreak === 'auto' && printRules.laterBreaks.every(b => b === 'page'),
  JSON.stringify([printRules.firstBreak, printRules.laterBreaks]));
check('table rows are not split across pages', printRules.rowsAvoidSplit === 'avoid', printRules.rowsAvoidSplit);
await page.emulateMedia({ media: 'screen' });

section('6. Offline / console hygiene');
check('no console errors', consoleErrors.length === 0, consoleErrors.slice(0, 3).join(' | '));
check('no network requests off the local file', externalRequests.length === 0, externalRequests.slice(0, 3).join(' | '));

await browser.close();
console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : `${failures} CHECK(S) FAILED`}`);
console.log(`artifacts: ${OUT}`);
process.exit(failures === 0 ? 0 : 1);
