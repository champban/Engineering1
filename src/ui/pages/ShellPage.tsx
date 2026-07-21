import { useMemo } from 'react'
import { SCHEMA_VERSION } from '@/core/schema/core-object'
import { computeFixtureSummary } from '@/app/fixture-summary'
import './shell.css'

const APP_NAME = '3D Engineering Object & Simulation Platform'

export function ShellPage() {
  const summary = useMemo(() => computeFixtureSummary(), [])

  return (
    <div className="shell">
      <header className="shell__header">
        <h1 className="shell__title">{APP_NAME}</h1>
        <p className="shell__subtitle">Phase 0 — Foundation scaffold</p>
      </header>

      <section className="shell__cards">
        <div className="card">
          <span className="card__label">Phase status</span>
          <span className="card__value">Phase 0 Foundation</span>
        </div>
        <div className="card">
          <span className="card__label">Core schema version</span>
          <span className="card__value">{SCHEMA_VERSION}</span>
        </div>
        <div className="card">
          <span className="card__label">Valid fixtures passing</span>
          <span className="card__value">
            {summary.validPassCount} / {summary.valid.length}
          </span>
        </div>
        <div className="card">
          <span className="card__label">Invalid fixtures rejected</span>
          <span className="card__value">
            {summary.invalidRejectCount} / {summary.invalid.length}
          </span>
        </div>
      </section>

      <section className="shell__section">
        <h2>Valid fixtures</h2>
        <table className="grid">
          <thead>
            <tr>
              <th>Fixture</th>
              <th>Name</th>
              <th>Shape</th>
              <th>Lifecycle</th>
              <th>Parses</th>
              <th>Draft</th>
              <th>Verified</th>
              <th>Released</th>
            </tr>
          </thead>
          <tbody>
            {summary.valid.map((row) => (
              <tr key={row.key}>
                <td>{row.label}</td>
                <td>{row.name}</td>
                <td>{row.shape}</td>
                <td>{row.status}</td>
                <td>{mark(row.parses)}</td>
                <td>{mark(row.draftOk)}</td>
                <td>{mark(row.verifiedOk)}</td>
                <td>
                  {row.status === 'released' ? mark(row.releasedApplicableOk) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="shell__section">
        <h2>Invalid fixtures</h2>
        <table className="grid">
          <thead>
            <tr>
              <th>Case</th>
              <th>Violation</th>
              <th>Level</th>
              <th>Rejected</th>
            </tr>
          </thead>
          <tbody>
            {summary.invalid.map((row) => (
              <tr key={row.key}>
                <td>{row.key}</td>
                <td>{row.description}</td>
                <td>{row.level}</td>
                <td>{mark(row.rejected)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <footer className="shell__footer">
        <span>Production deployed: No</span>
        <span>Repository: champban/Engineering1</span>
      </footer>
    </div>
  )
}

function mark(ok: boolean) {
  return (
    <span className={ok ? 'mark mark--ok' : 'mark mark--fail'}>
      {ok ? 'PASS' : 'FAIL'}
    </span>
  )
}
