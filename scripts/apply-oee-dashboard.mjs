import fs from 'node:fs'

const pagePath = 'src/ui/pages/WorkspacePage.tsx'
const cssPath = 'src/ui/pages/workspace.css'
let page = fs.readFileSync(pagePath, 'utf8')

page = page.replace(
  "} from '@/domain/layout/layout'\n",
  "} from '@/domain/layout/layout'\nimport { calculateOee, percentage } from '@/domain/runtime/oee'\n",
)

page = page.replace(
  "  const [speedMultiplier, setSpeedMultiplier] = useState(1)\n",
  "  const [speedMultiplier, setSpeedMultiplier] = useState(1)\n  const [plannedMinutes, setPlannedMinutes] = useState(480)\n  const [downtimeMinutes, setDowntimeMinutes] = useState(35)\n  const [idealRatePerMinute, setIdealRatePerMinute] = useState(230)\n  const [totalCount, setTotalCount] = useState(94000)\n  const [rejectCount, setRejectCount] = useState(1200)\n",
)

page = page.replace(
  "  const capacity = connectedMode\n    ? conveyors.reduce((sum, conveyor) => sum + conveyor.bufferCapacity, 0)\n    : (selected as ConveyorDefinition).bufferCapacity\n",
  "  const capacity = connectedMode\n    ? conveyors.reduce((sum, conveyor) => sum + conveyor.bufferCapacity, 0)\n    : (selected as ConveyorDefinition).bufferCapacity\n  const oee = calculateOee({ plannedMinutes, downtimeMinutes, idealRatePerMinute, totalCount, rejectCount })\n",
)

const marker = "      <div className=\"runtime-stage\">"
const panel = `      <div className="oee-panel">
        <div className="oee-inputs">
          <NumberField label="Planned time (min)" value={plannedMinutes} onChange={(value) => setPlannedMinutes(Math.max(0, value))} />
          <NumberField label="Downtime (min)" value={downtimeMinutes} onChange={(value) => setDowntimeMinutes(Math.max(0, value))} />
          <NumberField label="Ideal rate (pcs/min)" value={idealRatePerMinute} onChange={(value) => setIdealRatePerMinute(Math.max(0, value))} />
          <NumberField label="Total count" value={totalCount} onChange={(value) => setTotalCount(Math.max(0, value))} />
          <NumberField label="Reject count" value={rejectCount} onChange={(value) => setRejectCount(Math.max(0, value))} />
        </div>
        <div className="oee-kpis" aria-label="OEE performance dashboard">
          <KpiCard label="Availability" value={percentage(oee.availability)} />
          <KpiCard label="Performance" value={percentage(oee.performance)} />
          <KpiCard label="Quality" value={percentage(oee.quality)} />
          <KpiCard label="OEE" value={percentage(oee.oee)} emphasis />
          <KpiCard label="Waste" value={percentage(oee.wasteRate)} warning={oee.wasteRate > 0.02} />
          <KpiCard label="Good count" value={Math.round(oee.goodCount).toLocaleString()} />
        </div>
      </div>

`
page = page.replace(marker, panel + marker)

page = page.replace(
  "function Field({ label, children }: { label: string; children: React.ReactNode }) {",
  `function KpiCard({ label, value, emphasis = false, warning = false }: { label: string; value: string; emphasis?: boolean; warning?: boolean }) {
  return <div className={\`kpi-card \${emphasis ? 'kpi-card--emphasis' : ''} \${warning ? 'kpi-card--warning' : ''}\`}><span>{label}</span><strong>{value}</strong></div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {`,
)

fs.writeFileSync(pagePath, page)

let css = fs.readFileSync(cssPath, 'utf8')
if (!css.includes('.oee-panel{')) {
  css += '.oee-panel{display:grid;grid-template-columns:minmax(0,1fr) minmax(420px,1.2fr);gap:14px;margin-bottom:14px}.oee-inputs{display:grid;grid-template-columns:repeat(2,minmax(140px,1fr));gap:10px;padding:14px;border:1px solid var(--border);border-radius:10px;background:var(--panel)}.oee-kpis{display:grid;grid-template-columns:repeat(3,minmax(120px,1fr));gap:10px}.kpi-card{display:grid;gap:6px;align-content:center;min-height:82px;padding:12px;border:1px solid var(--border);border-radius:10px;background:var(--panel)}.kpi-card span{color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.06em}.kpi-card strong{font-size:22px}.kpi-card--emphasis{border-color:rgba(73,201,129,.65);background:rgba(73,201,129,.08)}.kpi-card--warning{border-color:rgba(240,106,103,.7);background:rgba(240,106,103,.08)}@media(max-width:1050px){.oee-panel{grid-template-columns:1fr}}@media(max-width:760px){.oee-inputs,.oee-kpis{grid-template-columns:1fr 1fr}}'
}
fs.writeFileSync(cssPath, css)
