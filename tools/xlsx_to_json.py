#!/usr/bin/env python3
"""Convert Weekly_Project_Plan.xlsx into the JSON shape the dashboard consumes,
and bake it (plus the workbook itself, as a base64 export template) into index.html.

The dashboard can read .xlsx directly in the browser, so this script is only needed
to refresh the *embedded snapshot* that ships inside index.html, or as a fallback for
browsers without DecompressionStream support.

Usage:
    python3 tools/xlsx_to_json.py [workbook.xlsx] [index.html]

Defaults to source/Weekly_Project_Plan.xlsx and index.html next to the repo root.
"""

from __future__ import annotations

import base64
import datetime as dt
import json
import re
import sys
from pathlib import Path

try:
    import openpyxl
except ImportError:  # pragma: no cover - guidance only
    sys.exit("openpyxl is required:  pip install openpyxl")

REPO = Path(__file__).resolve().parent.parent
DEFAULT_XLSX = REPO / "source" / "Weekly_Project_Plan.xlsx"
DEFAULT_HTML = REPO / "index.html"

DATA_START, DATA_END = "<!-- DATA:START -->", "<!-- DATA:END -->"
TPL_START, TPL_END = "<!-- TEMPLATE:START -->", "<!-- TEMPLATE:END -->"


def col_letter(idx: int) -> str:
    """1 -> A, 27 -> AA."""
    out = ""
    while idx > 0:
        idx, rem = divmod(idx - 1, 26)
        out = chr(65 + rem) + out
    return out


def encode_value(value):
    """Return (serialised value, type tag) matching the browser reader's output.

    Types: "s" string, "n" number, "d" ISO date, "b" boolean.
    """
    if isinstance(value, bool):
        return value, "b"
    if isinstance(value, dt.datetime):
        # Times-of-day are not used in this workbook; dates carry a midnight component.
        return value.date().isoformat(), "d"
    if isinstance(value, dt.date):
        return value.isoformat(), "d"
    if isinstance(value, (int, float)):
        return value, "n"
    text = str(value)
    # Excel stores non-breaking spaces in a few hand-typed cells; normalise so the
    # dashboard's text matching does not have to special-case them.
    text = text.replace("\xa0", " ")
    return text, "s"


def read_workbook(path: Path) -> dict:
    wb = openpyxl.load_workbook(path, data_only=True)
    sheets = {}
    for ws in wb.worksheets:
        cells = {}
        max_row = max_col = 0
        for row in ws.iter_rows():
            for cell in row:
                if cell.value is None:
                    continue
                value, tag = encode_value(cell.value)
                if tag == "s" and not value.strip():
                    continue
                cells[f"{col_letter(cell.column)}{cell.row}"] = {"v": value, "t": tag}
                max_row = max(max_row, cell.row)
                max_col = max(max_col, cell.column)
        # Bounds come from populated cells, not the sheet dimension, so the browser
        # reader and this script agree cell-for-cell.
        sheets[ws.title] = {
            "name": ws.title,
            "maxRow": max_row,
            "maxCol": max_col,
            "cells": cells,
            "merges": sorted(str(r) for r in ws.merged_cells.ranges),
        }
    return {"order": [ws.title for ws in wb.worksheets], "sheets": sheets}


def replace_block(html: str, start: str, end: str, payload: str, label: str) -> str:
    pattern = re.compile(
        re.escape(start) + r".*?" + re.escape(end), re.DOTALL
    )
    if not pattern.search(html):
        sys.exit(f"Could not find the {label} markers ({start} … {end}) in index.html")
    return pattern.sub(lambda _: f"{start}\n{payload}\n{end}", html, count=1)


def main() -> None:
    xlsx = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_XLSX
    html_path = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else DEFAULT_HTML

    if not xlsx.exists():
        sys.exit(f"Workbook not found: {xlsx}")

    book = read_workbook(xlsx)
    book["generated"] = dt.date.today().isoformat()
    book["sourceName"] = xlsx.name

    raw = xlsx.read_bytes()
    template_b64 = base64.b64encode(raw).decode("ascii")

    data_json = json.dumps(book, ensure_ascii=False, separators=(",", ":"))

    if not html_path.exists():
        # Allow the script to be used standalone to emit JSON for inspection.
        out = html_path.with_suffix(".json")
        out.write_text(data_json, encoding="utf-8")
        print(f"index.html not found; wrote {out} instead")
        return

    html = html_path.read_text(encoding="utf-8")
    html = replace_block(
        html,
        DATA_START,
        DATA_END,
        f'<script id="embedded-data" type="application/json">{data_json}</script>',
        "data",
    )
    html = replace_block(
        html,
        TPL_START,
        TPL_END,
        f'<script id="embedded-template" type="text/plain">{template_b64}</script>',
        "template",
    )
    html_path.write_text(html, encoding="utf-8")

    total_cells = sum(len(s["cells"]) for s in book["sheets"].values())
    print(f"Embedded {len(book['sheets'])} sheets / {total_cells} cells from {xlsx.name}")
    print(f"Embedded export template: {len(raw)} bytes -> {len(template_b64)} base64 chars")
    print(f"Updated {html_path}")


if __name__ == "__main__":
    main()
