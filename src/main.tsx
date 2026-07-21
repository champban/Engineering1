import { StrictMode, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  calculateEngineeringCompleteness,
  createBomLine,
  createDemoEquipmentRecords,
  createEquipmentDocument,
  createEquipmentRecord,
  createUtilityRequirement,
  summarizeBom,
  touchEquipmentRecord,
  type BomLine,
  type CurrencyCode,
  type EquipmentDocument,
  type EquipmentRecord,
  type UtilityRequirement,
} from '@/domain/equipment/equipment-record'
import { createDemoWorkspace } from '@/domain/demo/demo-workspace'
import type { ObjectAsset } from '@/domain/gallery/object-asset'
import { exportEquipmentRecords, loadEquipmentRecords, saveEquipmentRecords } from '@/storage/equipment-store'
import { loadGallery } from '@/storage/workspace-store'
import { WorkspacePage } from '@/ui/pages/WorkspacePage'
import { ObjectStudioPage } from '@/ui/pages/ObjectStudioPage'

type AppMode = 'phase1' | 'phase2' | 'studio' | 'studio'
type DataSection = 'overview' | 'utilities' | 'bom' | 'documents'

const CURRENCIES: readonly CurrencyCode[] = ['EUR', 'USD', 'THB']

export function EngineeringApp() {
  const [mode, setMode] = useState<AppMode>('phase1')
  if (mode === 'phase1') {
    return (
      <>
        <button className="phase-switch" onClick={() => setMode('phase2')} type="button">Phase 2A · Equipment Data</button>
        <button className="studio-switch" onClick={() => setMode('studio')} type="button">Object Studio</button>
        <WorkspacePage />
        <style>{APP_CSS}</style>
      </>
    )
  }
  if (mode === 'studio') return <ObjectStudioPage onBack={() => setMode('phase1')} />
  return <EquipmentDataPage onBack={() => setMode('phase1')} />
}

function EquipmentDataPage({ onBack }: { onBack: () => void }) {
  const [assets] = useState<ObjectAsset[]>(() => {
    const stored = loadGallery()
    return stored.length ? stored : createDemoWorkspace().gallery
  })
  const [records, setRecords] = useState<EquipmentRecord[]>(() => {
    const stored = loadEquipmentRecords()
    return stored.length ? stored : createDemoEquipmentRecords(assets)
  })
  const [selectedAssetId, setSelectedAssetId] = useState(() => records[0]?.assetId ?? assets[0]?.id ?? '')
  const [section, setSection] = useState<DataSection>('overview')

  useEffect(() => saveEquipmentRecords(records), [records])

  const asset = assets.find((item) => item.id === selectedAssetId) ?? assets[0]
  const record = records.find((item) => item.assetId === asset?.id)
  const completeness = record ? calculateEngineeringCompleteness(record) : null
  const bomSummary = useMemo(() => summarizeBom(record?.bom ?? []), [record?.bom])

  function selectAsset(assetId: string) {
    setSelectedAssetId(assetId)
    setSection('overview')
    if (!records.some((item) => item.assetId === assetId)) {
      const selected = assets.find((item) => item.id === assetId)
      setRecords((current) => [...current, createEquipmentRecord({
        assetId,
        equipmentTag: `OBJ-${String(current.length + 1).padStart(3, '0')}`,
        manufacturer: selected?.manufacturer ?? '',
        model: selected?.model ?? selected?.name ?? '',
      })])
    }
  }

  function replace(next: EquipmentRecord) {
    setRecords((current) => current.map((item) => item.id === next.id ? touchEquipmentRecord(next) : item))
  }

  function patch(values: Partial<EquipmentRecord>) {
    if (record) replace({ ...record, ...values })
  }

  function loadDemo() {
    if (!window.confirm('Replace current Phase 2A records with demo engineering data?')) return
    const demo = createDemoEquipmentRecords(assets)
    setRecords(demo)
    setSelectedAssetId(demo[0]?.assetId ?? assets[0]?.id ?? '')
    setSection('overview')
  }

  function exportData() {
    const blob = new Blob([exportEquipmentRecords(records)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'engineering1-equipment-records.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p2-shell">
      <style>{APP_CSS}</style>
      <header className="p2-header">
        <div><span>ENGINEERING1 · PHASE 2A</span><h1>Equipment Engineering Data</h1><p>Specification, utilities, BOM, procurement, cost, and document control linked to reusable objects.</p></div>
        <div className="p2-actions"><button onClick={onBack}>← Phase 1</button><button onClick={loadDemo}>Load demo</button><button onClick={exportData}>Export JSON</button></div>
      </header>

      <main className="p2-main">
        <section className="p2-toolbar">
          <label><span>Engineering object</span><select value={asset?.id ?? ''} onChange={(event) => selectAsset(event.target.value)}>{assets.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <div className="p2-status">Local-first alpha · data stays in this browser</div>
        </section>

        {asset && record ? (
          <>
            <section className="p2-kpis">
              <article className="p2-object"><img alt="" src={asset.thumbnailDataUrl} /><div><b>{asset.name}</b><small>{asset.category}</small><small>{asset.dimensionsMm.length} × {asset.dimensionsMm.width} × {asset.dimensionsMm.height} mm</small></div></article>
              <Kpi label="Completeness" value={`${Math.round((completeness?.ratio ?? 0) * 100)}%`} note={`${completeness?.completed}/${completeness?.total} checks`} strong />
              <Kpi label="BOM" value={String(bomSummary.totalLines)} note={`${bomSummary.criticalALines} critical A`} />
              <Kpi label="Utilities" value={String(record.utilities.length)} note={`${record.installedPowerKw.toFixed(2)} kW`} />
              <Kpi label="Documents" value={String(record.documents.length)} note={`${record.documents.filter((item) => item.status === 'approved').length} approved`} />
            </section>

            <nav className="p2-tabs">{(['overview', 'utilities', 'bom', 'documents'] as const).map((item) => <button className={section === item ? 'active' : ''} key={item} onClick={() => setSection(item)}>{item === 'bom' ? 'BOM & Cost' : item}</button>)}</nav>

            {section === 'overview' && <Overview record={record} missing={completeness?.missing ?? []} patch={patch} />}
            {section === 'utilities' && <Utilities record={record} replace={replace} />}
            {section === 'bom' && <Bom record={record} replace={replace} />}
            {section === 'documents' && <Documents record={record} replace={replace} />}
          </>
        ) : <div className="p2-empty">No reusable object is available.</div>}
      </main>
    </div>
  )
}

function Overview({ record, missing, patch }: { record: EquipmentRecord; missing: readonly string[]; patch: (value: Partial<EquipmentRecord>) => void }) {
  return (
    <section className="p2-grid">
      <div className="p2-panel"><h2>Identification & procurement</h2><div className="p2-fields">
        <Field label="Tag"><input value={record.equipmentTag} onChange={(e) => patch({ equipmentTag: e.target.value })} /></Field>
        <Field label="Manufacturer"><input value={record.manufacturer} onChange={(e) => patch({ manufacturer: e.target.value })} /></Field>
        <Field label="Model"><input value={record.model} onChange={(e) => patch({ model: e.target.value })} /></Field>
        <Field label="Serial number"><input value={record.serialNumber} onChange={(e) => patch({ serialNumber: e.target.value })} /></Field>
        <Field label="Supplier"><input value={record.supplier} onChange={(e) => patch({ supplier: e.target.value })} /></Field>
        <Field label="Procurement"><select value={record.procurementStatus} onChange={(e) => patch({ procurementStatus: e.target.value as EquipmentRecord['procurementStatus'] })}>{['concept','rfq','ordered','received','installed','commissioned'].map((value) => <option key={value}>{value}</option>)}</select></Field>
        <NumberField label="Lead time (weeks)" value={record.leadTimeWeeks} set={(value) => patch({ leadTimeWeeks: value })} />
        <NumberField label="Purchase cost" value={record.purchaseCost} set={(value) => patch({ purchaseCost: value })} />
        <Field label="Currency"><select value={record.currency} onChange={(e) => patch({ currency: e.target.value as CurrencyCode })}>{CURRENCIES.map((value) => <option key={value}>{value}</option>)}</select></Field>
      </div></div>
      <div className="p2-panel"><h2>Capacity & utility summary</h2><div className="p2-fields">
        <NumberField label="Design rate (/min)" value={record.designRatePerMinute} set={(value) => patch({ designRatePerMinute: value })} />
        <NumberField label="Installed power (kW)" value={record.installedPowerKw} set={(value) => patch({ installedPowerKw: value })} step={0.01} />
        <NumberField label="Voltage (V)" value={record.voltageV} set={(value) => patch({ voltageV: value })} />
        <NumberField label="Phases" value={record.phaseCount} set={(value) => patch({ phaseCount: Math.round(value) })} />
        <NumberField label="Frequency (Hz)" value={record.frequencyHz} set={(value) => patch({ frequencyHz: value })} />
        <NumberField label="Air (Nl/min)" value={record.compressedAirNlMin} set={(value) => patch({ compressedAirNlMin: value })} />
      </div><Field label="Engineering notes"><textarea value={record.notes} onChange={(e) => patch({ notes: e.target.value })} /></Field></div>
      <div className="p2-panel p2-wide"><h2>Readiness gate</h2>{missing.length ? <div className="p2-tags">{missing.map((item) => <span key={item}>{item}</span>)}</div> : <p className="p2-ok">Current completeness checks passed. Formal engineering review is still required before release.</p>}</div>
    </section>
  )
}

function Utilities({ record, replace }: { record: EquipmentRecord; replace: (value: EquipmentRecord) => void }) {
  const update = (id: string, values: Partial<UtilityRequirement>) => replace({ ...record, utilities: record.utilities.map((item) => item.id === id ? { ...item, ...values } : item) })
  return <DataPanel title="Utility hook-up requirements" add={() => replace({ ...record, utilities: [...record.utilities, createUtilityRequirement()] })} addLabel="Add utility"><table><thead><tr><th>Type</th><th>Value</th><th>Unit</th><th>Note</th><th /></tr></thead><tbody>{record.utilities.map((item) => <tr key={item.id}><td><select value={item.type} onChange={(e) => update(item.id, { type: e.target.value as UtilityRequirement['type'] })}>{['electrical','compressed-air','gas','water','steam','vacuum','network','other'].map((value) => <option key={value}>{value}</option>)}</select></td><td><input type="number" value={item.value} onChange={(e) => update(item.id, { value: positive(e.target.value) })} /></td><td><input value={item.unit} onChange={(e) => update(item.id, { unit: e.target.value })} /></td><td><input value={item.note} onChange={(e) => update(item.id, { note: e.target.value })} /></td><td><button onClick={() => replace({ ...record, utilities: record.utilities.filter((row) => row.id !== item.id) })}>Remove</button></td></tr>)}</tbody></table></DataPanel>
}

function Bom({ record, replace }: { record: EquipmentRecord; replace: (value: EquipmentRecord) => void }) {
  const update = (id: string, values: Partial<BomLine>) => replace({ ...record, bom: record.bom.map((item) => item.id === id ? { ...item, ...values } : item) })
  return <DataPanel title="Bill of materials and cost" add={() => replace({ ...record, bom: [...record.bom, createBomLine(record.bom.length + 1)] })} addLabel="Add BOM line"><table className="wide"><thead><tr><th>Item</th><th>Part number</th><th>Description</th><th>Qty</th><th>Maker</th><th>Supplier</th><th>Crit.</th><th>Spare</th><th>Cost</th><th>Curr.</th><th /></tr></thead><tbody>{record.bom.map((item) => <tr key={item.id}><td><input value={item.itemNo} onChange={(e) => update(item.id, { itemNo: e.target.value })} /></td><td><input value={item.partNumber} onChange={(e) => update(item.id, { partNumber: e.target.value })} /></td><td><input value={item.description} onChange={(e) => update(item.id, { description: e.target.value })} /></td><td><input type="number" value={item.quantity} onChange={(e) => update(item.id, { quantity: positive(e.target.value) })} /></td><td><input value={item.manufacturer} onChange={(e) => update(item.id, { manufacturer: e.target.value })} /></td><td><input value={item.supplier} onChange={(e) => update(item.id, { supplier: e.target.value })} /></td><td><select value={item.criticality} onChange={(e) => update(item.id, { criticality: e.target.value as BomLine['criticality'] })}>{['A','B','C'].map((value) => <option key={value}>{value}</option>)}</select></td><td><input type="checkbox" checked={item.sparePart} onChange={(e) => update(item.id, { sparePart: e.target.checked })} /></td><td><input type="number" value={item.unitCost} onChange={(e) => update(item.id, { unitCost: positive(e.target.value) })} /></td><td><select value={item.currency} onChange={(e) => update(item.id, { currency: e.target.value as CurrencyCode })}>{CURRENCIES.map((value) => <option key={value}>{value}</option>)}</select></td><td><button onClick={() => replace({ ...record, bom: record.bom.filter((row) => row.id !== item.id) })}>Remove</button></td></tr>)}</tbody></table></DataPanel>
}

function Documents({ record, replace }: { record: EquipmentRecord; replace: (value: EquipmentRecord) => void }) {
  const update = (id: string, values: Partial<EquipmentDocument>) => replace({ ...record, documents: record.documents.map((item) => item.id === id ? { ...item, ...values } : item) })
  return <DataPanel title="Controlled document register" add={() => replace({ ...record, documents: [...record.documents, createEquipmentDocument()] })} addLabel="Add document"><table><thead><tr><th>Title</th><th>Type</th><th>Rev.</th><th>Status</th><th>Reference URL</th><th /></tr></thead><tbody>{record.documents.map((item) => <tr key={item.id}><td><input value={item.title} onChange={(e) => update(item.id, { title: e.target.value })} /></td><td><select value={item.type} onChange={(e) => update(item.id, { type: e.target.value as EquipmentDocument['type'] })}>{['datasheet','drawing','manual','certificate','spare-parts','other'].map((value) => <option key={value}>{value}</option>)}</select></td><td><input value={item.revision} onChange={(e) => update(item.id, { revision: e.target.value })} /></td><td><select value={item.status} onChange={(e) => update(item.id, { status: e.target.value as EquipmentDocument['status'] })}>{['draft','review','approved','obsolete'].map((value) => <option key={value}>{value}</option>)}</select></td><td><input value={item.url} onChange={(e) => update(item.id, { url: e.target.value })} /></td><td><button onClick={() => replace({ ...record, documents: record.documents.filter((row) => row.id !== item.id) })}>Remove</button></td></tr>)}</tbody></table></DataPanel>
}

function DataPanel({ title, add, addLabel, children }: { title: string; add: () => void; addLabel: string; children: React.ReactNode }) { return <section className="p2-panel"><header className="p2-table-head"><h2>{title}</h2><button onClick={add}>{addLabel}</button></header><div className="p2-table">{children}</div></section> }
function Kpi({ label, value, note, strong = false }: { label: string; value: string; note: string; strong?: boolean }) { return <article className={strong ? 'p2-kpi strong' : 'p2-kpi'}><span>{label}</span><b>{value}</b><small>{note}</small></article> }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="p2-field"><span>{label}</span>{children}</label> }
function NumberField({ label, value, set, step = 1 }: { label: string; value: number; set: (value: number) => void; step?: number }) { return <Field label={label}><input min="0" step={step} type="number" value={value} onChange={(e) => set(positive(e.target.value))} /></Field> }
function positive(value: string): number { const number = Number(value); return Number.isFinite(number) ? Math.max(0, number) : 0 }

const APP_CSS = `
.studio-switch{position:fixed;z-index:30;right:18px;bottom:68px;padding:11px 15px;border:1px solid #54d08a;border-radius:999px;background:#123025;color:#eef5fb;box-shadow:0 8px 30px #0008;cursor:pointer;font-weight:700}.phase-switch{position:fixed;z-index:30;right:18px;bottom:18px;padding:11px 15px;border:1px solid #44a6ff;border-radius:999px;background:#12263a;color:#eef5fb;box-shadow:0 8px 30px #0008;cursor:pointer;font-weight:700}.p2-shell{min-height:100vh;background:#091018;color:#eef5fb;font-family:Inter,system-ui,sans-serif}.p2-header{display:flex;justify-content:space-between;gap:24px;padding:20px 24px;border-bottom:1px solid #2a3c51;background:#0d1620}.p2-header span{color:#44a6ff;font-size:11px;font-weight:800;letter-spacing:.12em}.p2-header h1{margin:4px 0;font-size:22px}.p2-header p{margin:0;color:#9eb0c2}.p2-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.p2-actions button,.p2-table-head button,.p2-table button{padding:8px 10px;border:1px solid #2a3c51;border-radius:7px;background:#172435;color:#eef5fb;cursor:pointer}.p2-main{max-width:1540px;margin:auto;padding:20px}.p2-toolbar,.p2-panel,.p2-kpi,.p2-object{border:1px solid #2a3c51;border-radius:11px;background:#111b27}.p2-toolbar{display:flex;justify-content:space-between;align-items:end;gap:14px;padding:14px;margin-bottom:14px}.p2-toolbar label{display:grid;gap:5px;min-width:min(520px,100%);color:#9eb0c2;font-size:12px}.p2-toolbar select,.p2-field input,.p2-field select,.p2-field textarea,.p2-table input,.p2-table select{border:1px solid #2a3c51;border-radius:6px;padding:8px;background:#0d1722;color:#eef5fb}.p2-status{color:#49c981;font-size:12px}.p2-kpis{display:grid;grid-template-columns:minmax(300px,1.8fr) repeat(4,minmax(130px,.75fr));gap:10px;margin-bottom:14px}.p2-object{display:grid;grid-template-columns:100px 1fr;gap:12px;align-items:center;padding:12px}.p2-object img{width:100px;height:76px;object-fit:contain;background:#08111a;border-radius:7px}.p2-object div,.p2-kpi{display:grid;gap:5px}.p2-object small,.p2-kpi span,.p2-kpi small{color:#9eb0c2}.p2-kpi{align-content:center;padding:12px}.p2-kpi b{font-size:22px}.p2-kpi.strong{border-color:#49c981;background:#123025}.p2-tabs{display:flex;gap:7px;margin-bottom:14px}.p2-tabs button{padding:9px 13px;border:1px solid #2a3c51;border-radius:7px;background:#111b27;color:#9eb0c2;cursor:pointer;text-transform:capitalize}.p2-tabs button.active{border-color:#44a6ff;background:#16324d;color:#eef5fb}.p2-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.p2-wide{grid-column:1/-1}.p2-panel{padding:14px;overflow:hidden}.p2-panel h2{margin:0 0 12px;font-size:15px}.p2-fields{display:grid;grid-template-columns:repeat(3,minmax(140px,1fr));gap:9px}.p2-field{display:grid;gap:5px;color:#9eb0c2;font-size:11px}.p2-field textarea{min-height:100px;resize:vertical}.p2-tags{display:flex;gap:6px;flex-wrap:wrap}.p2-tags span{padding:5px 8px;border:1px solid #e3ab4f;border-radius:999px;color:#e3ab4f;font-size:11px}.p2-ok{color:#49c981}.p2-table-head{display:flex;justify-content:space-between;align-items:center}.p2-table{overflow:auto;border:1px solid #2a3c51;border-radius:8px}.p2-table table{width:100%;min-width:820px;border-collapse:collapse}.p2-table table.wide{min-width:1350px}.p2-table th,.p2-table td{padding:7px;border-bottom:1px solid #2a3c51;text-align:left}.p2-table th{color:#9eb0c2;font-size:10px;text-transform:uppercase}.p2-table input,.p2-table select{width:100%;min-width:70px}.p2-table input[type=checkbox]{width:16px}.p2-empty{padding:50px;text-align:center;color:#9eb0c2}@media(max-width:1100px){.p2-kpis{grid-template-columns:repeat(2,1fr)}.p2-object{grid-column:1/-1}.p2-fields{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.p2-header,.p2-toolbar{flex-direction:column;align-items:stretch}.p2-grid,.p2-kpis,.p2-fields{grid-template-columns:1fr}.p2-tabs{overflow:auto}.phase-switch{right:10px;bottom:10px}.studio-switch{right:10px;bottom:60px}}
`

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element #root not found')
createRoot(rootElement).render(<StrictMode><EngineeringApp /></StrictMode>)
