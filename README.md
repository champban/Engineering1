# Weekly Project Plan — offline dashboard

An interactive dashboard for `Weekly_Project_Plan.xlsx`, delivered as **one self-contained
HTML file**. Double-click `index.html` and it opens in your browser. There is nothing to
install, no server to start and no internet connection required — all the CSS, JavaScript and
data live inside that single file, so it also works from a USB stick or a shared drive.

Edits made in the dashboard can be **written back into the Excel file**, keeping the original
formatting intact.

---

## Opening it

1. Double-click `index.html` (or drag it onto Chrome, Edge, Firefox or Safari).
2. That's it.

The workbook data as of the last update is already embedded, so the dashboard has content the
moment it opens.

**Browser requirement:** a current Chrome, Edge, Firefox or Safari (Chrome/Edge 103+,
Firefox 113+, Safari 16.4+). The app reads `.xlsx` files using the browser's built-in
decompression, which older browsers do not have. If yours is too old the *Load Excel file*
button is disabled and you can fall back to `tools/xlsx_to_json.py` (see below).

---

## What is in it

| Tab | What it shows |
|---|---|
| **Overview** | KPI tiles (production / commissioning / downtime / no-production line-days, milestones), activity mix per week, and a milestone list |
| **Timeline** | Every production line across every week as a day-by-day grid; click a cell for full detail |
| **Weekly grid** | The familiar Excel layout — production areas × 7 days, plus the REMARK column |
| **Line view** | One section per production line, every scheduled day in order. **This is the printable one.** |
| **Daily schedule** | The detailed Week 35 & 36 plan: time, system, activity, owner, output |
| **Readiness & vendors** | Material and machine readiness, plus which vendor is on site when |
| **Notes** | The free-text weekly notes and the follow-up list |
| **Changes** | Every edit you have made, with undo |

Filters at the top (week range, production line, status, free-text search) apply to all views.

### How status is decided

A line-day is classified from the **text of the cell**, not from its fill colour (the colours in
the source workbook are used inconsistently, so they are not reliable):

| Status | Icon | Matched on |
|---|---|---|
| Production | ▶ | `production`, `run`, `multipack` |
| Commissioning | ⚙ | `commissioning`, `acceptance test`, `PAT`/`FAT` |
| Planned downtime | ⟳ | `change over` / `C/O`, `PM`, `ProdX` |
| No production | ■ | `no production` |
| Other activity | ● | anything else with content |

Acceptance tests and line releases are additionally flagged as **milestones (◆)**.

Every status is shown as an icon *and* a written label, so the meaning never depends on colour
alone — it stays readable in dark mode, in greyscale, and when printed.

---

## Printing

Press **Print** (or `Ctrl`/`Cmd`+`P`). The current tab is what prints.

The **Line view** is built for this: A4 landscape, black on white, one production line per page,
with the table header repeated at the top of every page and no row split across a page break.
The nav bar, filters and buttons are all hidden in print.

---

## Editing and exporting back to Excel

1. **Click any day box and type straight into it.** This works everywhere:
   - **Weekly grid** — every day box, including empty ones (hover shows a `+ add` hint)
   - **Timeline** — clicking a box, filled or empty, opens a side panel with the activity and
     the week's remark, both editable in place
   - **Line view**, **Daily schedule**, **Readiness** — activity, time, system, owner, output
     and status are all editable

   The box turns into a text area: `Ctrl`+`Enter` saves, `Esc` cancels.
   **Clearing a box and saving deletes that entry** from the workbook.
2. Edited cells are highlighted, and the **Changes** tab lists every edit as
   `sheet · cell · before → after`, with per-row undo and a discard-all button.
3. Press **Export Excel**. You get `Weekly_Project_Plan_<date>.xlsx` in your Downloads folder.

Your edits are kept in the browser's local storage, so closing the tab by accident does not lose
them. They are cleared once you load a different workbook.

### What the export preserves

The export **patches the original workbook** rather than generating a new one: the file is
unzipped in memory, only the cells you changed are rewritten, and every other byte is copied
through untouched. Fill colours, column widths, merged ranges, and the sheets you never opened
all come out exactly as they went in. This is verified by the test suite against `openpyxl`.

### What the export cannot do

Editing covers **every cell that already exists in the workbook**, including empty ones. It does
**not** add new rows, new week blocks or new sheets — those change the workbook's structure,
which the surgical export deliberately avoids. To add a new week, add it in Excel and then use
*Load Excel file*.

---

## Loading a newer Excel file

Press **Load Excel file** and pick your `.xlsx`. It is read locally in your browser — nothing is
uploaded anywhere. The dashboard re-reads every sheet and redraws.

This is a per-session load. To bake a new file in permanently so it is what everyone sees on
opening `index.html`:

```bash
python3 tools/xlsx_to_json.py path/to/Weekly_Project_Plan.xlsx
```

That rewrites the embedded data block *and* the embedded export template inside `index.html`.
It needs Python with `openpyxl` (`pip install openpyxl`); the dashboard itself needs neither.

---

## Repository layout

```
index.html                       the whole app — this is the deliverable
tools/xlsx_to_json.py            re-bakes the embedded snapshot + export template
source/Weekly_Project_Plan.xlsx  the source workbook
tests/verify.mjs                 browser end-to-end checks (Playwright)
tests/check_exported.py          re-opens the exported file with openpyxl
```

### Running the tests

```bash
npm install          # Playwright, for the tests only
npm run verify
```

`tests/verify.mjs` drives Chromium against `index.html` **over `file://`** — the same way you
open it — and checks that:

- the embedded snapshot and the in-browser `.xlsx` reader agree **cell for cell**
- known facts from the workbook survive parsing (44 week blocks W29/2026 → W20/2027,
  6 production areas, the Cavanna and Metler Toledo entries, the readiness statuses)
- all eight tabs render with **zero console errors and zero network requests**
- every day box is typeable — adding into an empty box, clearing a box to delete, and editing a
  timeline box through the detail panel all write through
- an edit → *Export Excel* → re-load round-trip reproduces every edit and changes nothing else
- the print rules hold: nav hidden, headers repeat, one page per production line

`tests/check_exported.py` then opens the exported workbook with `openpyxl` — a completely
independent parser — and confirms the sheets, merged ranges, fill colours and column widths are
unchanged and the edits are present.

---

## Notes

- Weeks 39 onward have weekday text instead of real dates in the source. The dashboard
  reconstructs the ISO dates from the `Week NN/YYYY` heading and flags any disagreement on the
  Overview tab. There are currently none.
- The plan crosses a year boundary (W29/2026 → W20/2027), so weeks are ordered chronologically
  rather than by week number.
- Merged cells keep their value at the top-left cell, exactly as Excel stores it.
