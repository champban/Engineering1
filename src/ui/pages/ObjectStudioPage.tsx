import { useCallback, useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import { createDemoWorkspace } from '@/domain/demo/demo-workspace'
import type { ObjectAsset, ObjectDimensionsMm } from '@/domain/gallery/object-asset'
import {
  MATERIAL_PRESETS,
  applyMaterialPreset,
  calculateNodeVolumeMm3,
  createPrimitiveNode,
  createStudioDocument,
  distance3dMm,
  duplicateStudioNode,
  snapMillimetres,
  touchStudioDocument,
  type ObjectStudioDocument,
  type StudioMaterial,
  type StudioNode,
  type StudioTool,
  type StudioTransform,
  type StudioVector3,
} from '@/domain/studio/object-studio'
import { exportStudioDocument, loadStudioDocument, saveStudioDocument } from '@/storage/studio-store'
import { loadGallery, saveGallery } from '@/storage/workspace-store'
import { ObjectStudioViewport } from '@/viewport/components/ObjectStudioViewport'
import './object-studio.css'

export interface ObjectStudioPageProps {
  onBack: () => void
}

type InspectorTab = 'entity' | 'materials' | 'scene'
type CameraView = 'iso' | 'front' | 'right' | 'top'

const WORKING_TOOLS: readonly { id: StudioTool; label: string; icon: string; shortcut: string }[] = [
  { id: 'select', label: 'Select', icon: '↖', shortcut: 'Space' },
  { id: 'move', label: 'Move', icon: '✥', shortcut: 'M' },
  { id: 'rotate', label: 'Rotate', icon: '⟳', shortcut: 'R' },
  { id: 'scale', label: 'Scale', icon: '⤢', shortcut: 'S' },
  { id: 'paint', label: 'Paint surface', icon: '◩', shortcut: 'B' },
  { id: 'measure', label: 'Tape measure', icon: '⌁', shortcut: 'T' },
  { id: 'orbit', label: 'Orbit', icon: '◉', shortcut: 'O' },
  { id: 'pan', label: 'Pan', icon: '✋', shortcut: 'H' },
]

const EXPERIMENTAL_TOOLS: readonly { id: StudioTool; label: string; icon: string }[] = [
  { id: 'line', label: 'Line', icon: '╱' },
  { id: 'rectangle', label: 'Rectangle', icon: '□' },
  { id: 'circle', label: 'Circle', icon: '○' },
  { id: 'push-pull', label: 'Push / Pull', icon: '⇅' },
  { id: 'offset', label: 'Offset', icon: '▣' },
  { id: 'section', label: 'Section plane', icon: '◫' },
  { id: 'boolean', label: 'Boolean', icon: '◒' },
]

export function ObjectStudioPage({ onBack }: ObjectStudioPageProps) {
  const [assets, setAssets] = useState<ObjectAsset[]>(() => {
    const stored = loadGallery()
    return stored.length ? stored : createDemoWorkspace().gallery
  })
  const [document, setDocument] = useState<ObjectStudioDocument>(() => loadStudioDocument() ?? createStudioDocument(assets))
  const [activeTool, setActiveTool] = useState<StudioTool>('select')
  const [inspectorTab, setInspectorTab] = useState<InspectorTab>('entity')
  const [cameraView, setCameraView] = useState<CameraView>('iso')
  const [viewVersion, setViewVersion] = useState(0)
  const [notice, setNotice] = useState('Object Studio alpha ready')
  const undoRef = useRef<ObjectStudioDocument[]>([])
  const redoRef = useRef<ObjectStudioDocument[]>([])

  useEffect(() => saveStudioDocument(document), [document])

  const selectedNode = document.nodes.find((node) => node.id === document.selectedNodeId) ?? null
  const selectedVolume = selectedNode ? calculateNodeVolumeMm3(selectedNode) : 0

  const commit = useCallback((next: ObjectStudioDocument, message?: string) => {
    setDocument((current) => {
      undoRef.current.push(current)
      if (undoRef.current.length > 80) undoRef.current.shift()
      redoRef.current = []
      return touchStudioDocument(next)
    })
    if (message) setNotice(message)
  }, [])

  const selectNode = useCallback((nodeId: string | null) => {
    setDocument((current) => ({ ...current, selectedNodeId: nodeId }))
  }, [])

  const patchNode = useCallback((nodeId: string, values: Partial<StudioNode>, message?: string) => {
    setDocument((current) => {
      undoRef.current.push(current)
      redoRef.current = []
      return touchStudioDocument({
        ...current,
        nodes: current.nodes.map((node) => node.id === nodeId ? { ...node, ...values } : node),
        selectedNodeId: nodeId,
      })
    })
    if (message) setNotice(message)
  }, [])

  const transformNode = useCallback((nodeId: string, transform: StudioTransform) => {
    setDocument((current) => touchStudioDocument({
      ...current,
      nodes: current.nodes.map((node) => node.id === nodeId ? { ...node, transform } : node),
      selectedNodeId: nodeId,
    }))
    setNotice('Transform updated')
  }, [])

  const addMeasurement = useCallback((startMm: StudioVector3, endMm: StudioVector3) => {
    const distanceMm = distance3dMm(startMm, endMm)
    setDocument((current) => touchStudioDocument({
      ...current,
      measurements: [
        ...current.measurements,
        {
          id: globalThis.crypto?.randomUUID?.() ?? `measurement-${Date.now()}`,
          label: `${distanceMm.toFixed(1)} mm`,
          startMm,
          endMm,
          distanceMm,
        },
      ],
    }))
    setNotice(`Measured ${distanceMm.toFixed(1)} mm`)
  }, [])

  function undo() {
    const previous = undoRef.current.pop()
    if (!previous) return
    redoRef.current.push(document)
    setDocument(previous)
    setNotice('Undo')
  }

  function redo() {
    const next = redoRef.current.pop()
    if (!next) return
    undoRef.current.push(document)
    setDocument(next)
    setNotice('Redo')
  }

  function patchSelected(values: Partial<StudioNode>, message?: string) {
    if (!selectedNode) return
    patchNode(selectedNode.id, values, message)
  }

  function patchTransform(group: keyof StudioTransform, axis: keyof StudioVector3, value: number) {
    if (!selectedNode) return
    const transform = {
      ...selectedNode.transform,
      [group]: { ...selectedNode.transform[group], [axis]: value },
    }
    patchSelected({ transform })
  }

  function patchDimensions(axis: keyof ObjectDimensionsMm, value: number) {
    if (!selectedNode) return
    patchSelected({ dimensionsMm: { ...selectedNode.dimensionsMm, [axis]: Math.max(0.1, value) } }, 'Dimensions updated')
  }

  function patchMaterial(values: Partial<StudioMaterial>, message?: string) {
    if (!selectedNode) return
    patchSelected({ material: { ...selectedNode.material, ...values } }, message)
  }

  function addPrimitive(primitive: 'box' | 'cylinder' | 'sphere' | 'plane') {
    const node = createPrimitiveNode(primitive)
    commit({ ...document, nodes: [...document.nodes, node], selectedNodeId: node.id }, `${node.name} added`)
  }

  function duplicateSelected() {
    if (!selectedNode) return
    const duplicate = duplicateStudioNode(selectedNode)
    commit({ ...document, nodes: [...document.nodes, duplicate], selectedNodeId: duplicate.id }, 'Object duplicated')
  }

  function deleteSelected() {
    if (!selectedNode) return
    const nextNodes = document.nodes.filter((node) => node.id !== selectedNode.id)
    commit({ ...document, nodes: nextNodes, selectedNodeId: nextNodes[0]?.id ?? null }, 'Object deleted')
  }

  function resetStudio() {
    if (!window.confirm('Replace the current Object Studio document with the three demo objects?')) return
    const next = createStudioDocument(assets)
    commit(next, 'Demo studio restored')
  }

  function exportDocument() {
    downloadText('engineering1-object-studio.json', exportStudioDocument(document))
    setNotice('Object Studio JSON exported')
  }

  function handleTextureUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !selectedNode) return
    if (!file.type.startsWith('image/')) {
      setNotice('Texture must be an image file')
      return
    }
    const reader = new FileReader()
    reader.onload = () => patchMaterial({ textureDataUrl: String(reader.result), name: file.name }, 'Surface texture applied')
    reader.onerror = () => setNotice('Texture could not be read')
    reader.readAsDataURL(file)
  }

  function applyToGallery() {
    if (!selectedNode?.sourceAssetId) {
      setNotice('This primitive is not linked to a Gallery asset yet')
      return
    }
    const nextAssets = assets.map((asset) => asset.id === selectedNode.sourceAssetId ? {
      ...asset,
      dimensionsMm: { ...selectedNode.dimensionsMm },
      material: selectedNode.material.name,
      updatedAt: new Date().toISOString(),
    } : asset)
    setAssets(nextAssets)
    saveGallery(nextAssets)
    setNotice('Dimensions and material name applied to Gallery asset')
  }

  function setTool(tool: StudioTool) {
    setActiveTool(tool)
    if (tool === 'paint') setInspectorTab('materials')
  }

  return (
    <div className="object-studio-shell">
      <header className="object-studio-topbar">
        <div className="object-studio-brand">
          <button className="studio-back" onClick={onBack} type="button">←</button>
          <div><span>ENGINEERING1</span><strong>Object Studio</strong></div>
        </div>
        <div className="studio-document-name">
          <input value={document.name} onChange={(event) => setDocument((current) => ({ ...current, name: event.target.value }))} aria-label="Studio document name" />
          <small>Draft visual engineering model</small>
        </div>
        <div className="studio-top-actions">
          <button onClick={undo} disabled={!undoRef.current.length} type="button">↶ Undo</button>
          <button onClick={redo} disabled={!redoRef.current.length} type="button">↷ Redo</button>
          <button onClick={resetStudio} type="button">Load demo</button>
          <button onClick={exportDocument} type="button">Export</button>
          <button className="studio-primary" onClick={applyToGallery} type="button">Apply to Gallery</button>
        </div>
      </header>

      <div className="object-studio-commandbar">
        <div className="studio-create-group">
          <span>Create</span>
          <button onClick={() => addPrimitive('box')} type="button">▰ Box</button>
          <button onClick={() => addPrimitive('cylinder')} type="button">⬭ Cylinder</button>
          <button onClick={() => addPrimitive('sphere')} type="button">● Sphere</button>
          <button onClick={() => addPrimitive('plane')} type="button">▱ Plane</button>
        </div>
        <div className="studio-view-group">
          <span>View</span>
          {(['iso', 'front', 'right', 'top'] as const).map((view) => (
            <button className={cameraView === view ? 'active' : ''} key={view} onClick={() => { setCameraView(view); setViewVersion((value) => value + 1) }} type="button">{view}</button>
          ))}
          <button onClick={() => setDocument((current) => ({ ...current, projection: current.projection === 'perspective' ? 'orthographic' : 'perspective' }))} type="button">
            {document.projection === 'perspective' ? 'Perspective' : 'Orthographic'}
          </button>
        </div>
        <div className="studio-snap-group">
          <label><input checked={document.snapEnabled} onChange={(event) => setDocument((current) => ({ ...current, snapEnabled: event.target.checked }))} type="checkbox" /> Snap</label>
          <select value={document.gridMm} onChange={(event) => setDocument((current) => ({ ...current, gridMm: Number(event.target.value) }))}>
            {[10, 25, 50, 100, 250, 500, 1000].map((value) => <option key={value} value={value}>{value} mm</option>)}
          </select>
        </div>
      </div>

      <main className="object-studio-main">
        <aside className="studio-left-panel">
          <div className="studio-tool-rail" aria-label="3D editing tools">
            {WORKING_TOOLS.map((tool) => (
              <button className={activeTool === tool.id ? 'active' : ''} key={tool.id} onClick={() => setTool(tool.id)} title={`${tool.label} (${tool.shortcut})`} type="button">
                <b>{tool.icon}</b><span>{tool.label}</span>
              </button>
            ))}
            <div className="studio-tool-separator" />
            {EXPERIMENTAL_TOOLS.map((tool) => (
              <button className="experimental" disabled key={tool.id} title={`${tool.label} — topology engine planned`} type="button">
                <b>{tool.icon}</b><span>{tool.label}</span>
              </button>
            ))}
          </div>

          <section className="studio-outliner">
            <header><strong>Outliner</strong><span>{document.nodes.length}</span></header>
            <div className="studio-node-list">
              {document.nodes.map((node) => (
                <button className={node.id === document.selectedNodeId ? 'selected' : ''} key={node.id} onClick={() => selectNode(node.id)} type="button">
                  <span className="node-visibility" onClick={(event) => { event.stopPropagation(); patchNode(node.id, { visible: !node.visible }) }}>{node.visible ? '◉' : '○'}</span>
                  <span className="node-type">{primitiveIcon(node.primitive)}</span>
                  <span className="node-name">{node.name}</span>
                  <span className="node-lock" onClick={(event) => { event.stopPropagation(); patchNode(node.id, { locked: !node.locked }) }}>{node.locked ? '🔒' : '·'}</span>
                </button>
              ))}
            </div>
            <div className="studio-outliner-actions">
              <button onClick={duplicateSelected} disabled={!selectedNode} type="button">Duplicate</button>
              <button onClick={deleteSelected} disabled={!selectedNode} type="button">Delete</button>
            </div>
          </section>
        </aside>

        <section className="studio-canvas-area">
          <ObjectStudioViewport
            activeTool={activeTool}
            cameraView={cameraView}
            document={document}
            onMeasure={addMeasurement}
            onSelectNode={selectNode}
            onTransformNode={transformNode}
            viewVersion={viewVersion}
          />
          <div className="studio-view-cube" aria-label="Camera view cube">
            <button onClick={() => { setCameraView('top'); setViewVersion((value) => value + 1) }} type="button">TOP</button>
            <div><button onClick={() => { setCameraView('front'); setViewVersion((value) => value + 1) }} type="button">FRONT</button><button onClick={() => { setCameraView('right'); setViewVersion((value) => value + 1) }} type="button">RIGHT</button></div>
            <button onClick={() => { setCameraView('iso'); setViewVersion((value) => value + 1) }} type="button">ISO</button>
          </div>
        </section>

        <aside className="studio-right-panel">
          <nav className="studio-inspector-tabs">
            {(['entity', 'materials', 'scene'] as const).map((tab) => <button className={inspectorTab === tab ? 'active' : ''} key={tab} onClick={() => setInspectorTab(tab)} type="button">{tab}</button>)}
          </nav>

          {inspectorTab === 'entity' && (
            <InspectorSection title="Entity information">
              {selectedNode ? (
                <>
                  <StudioField label="Name"><input value={selectedNode.name} onChange={(event) => patchSelected({ name: event.target.value })} /></StudioField>
                  <div className="studio-info-row"><span>Type</span><b>{selectedNode.primitive}</b></div>
                  <div className="studio-info-row"><span>Source</span><b>{selectedNode.sourceAssetId ? 'Gallery asset' : 'Studio primitive'}</b></div>
                  <h4>Dimensions</h4>
                  <NumberGrid values={selectedNode.dimensionsMm} labels={{ length: 'Length X', width: 'Width Z', height: 'Height Y' }} onChange={patchDimensions} />
                  <div className="studio-info-row"><span>Volume</span><b>{formatVolume(selectedVolume)}</b></div>
                  <h4>Position (mm)</h4>
                  <VectorEditor value={selectedNode.transform.positionMm} onChange={(axis, value) => patchTransform('positionMm', axis, snapMillimetres(value, document.gridMm, document.snapEnabled))} />
                  <h4>Rotation (deg)</h4>
                  <VectorEditor value={selectedNode.transform.rotationDeg} onChange={(axis, value) => patchTransform('rotationDeg', axis, value)} />
                  <h4>Scale</h4>
                  <VectorEditor step={0.05} value={selectedNode.transform.scale} onChange={(axis, value) => patchTransform('scale', axis, Math.max(0.01, value))} />
                  <label className="studio-check"><input checked={selectedNode.visible} onChange={(event) => patchSelected({ visible: event.target.checked })} type="checkbox" /> Visible</label>
                  <label className="studio-check"><input checked={selectedNode.locked} onChange={(event) => patchSelected({ locked: event.target.checked })} type="checkbox" /> Lock editing</label>
                </>
              ) : <EmptyInspector>Select an object in the viewport or Outliner.</EmptyInspector>}
            </InspectorSection>
          )}

          {inspectorTab === 'materials' && (
            <InspectorSection title="Surface & material">
              {selectedNode ? (
                <>
                  <StudioField label="Material preset"><select value={MATERIAL_PRESETS.some((preset) => preset.name === selectedNode.material.name) ? selectedNode.material.name : ''} onChange={(event) => patchSelected(applyMaterialPreset(selectedNode, event.target.value), 'Material preset applied')}><option value="">Custom</option>{MATERIAL_PRESETS.map((preset) => <option key={preset.name}>{preset.name}</option>)}</select></StudioField>
                  <div className="studio-material-swatches">{MATERIAL_PRESETS.map((preset) => <button key={preset.name} onClick={() => patchSelected(applyMaterialPreset(selectedNode, preset.name), `${preset.name} applied`)} style={{ background: preset.baseColor }} title={preset.name} type="button" />)}</div>
                  <StudioField label="Surface name"><input value={selectedNode.material.name} onChange={(event) => patchMaterial({ name: event.target.value })} /></StudioField>
                  <StudioField label="Base colour"><div className="studio-color-field"><input type="color" value={selectedNode.material.baseColor} onChange={(event) => patchMaterial({ baseColor: event.target.value })} /><input value={selectedNode.material.baseColor} onChange={(event) => patchMaterial({ baseColor: event.target.value })} /></div></StudioField>
                  <RangeField label="Metalness" value={selectedNode.material.metalness} onChange={(value) => patchMaterial({ metalness: value })} />
                  <RangeField label="Roughness" value={selectedNode.material.roughness} onChange={(value) => patchMaterial({ roughness: value })} />
                  <RangeField label="Opacity" value={selectedNode.material.opacity} onChange={(value) => patchMaterial({ opacity: value })} />
                  <h4>Texture / skin</h4>
                  <label className="studio-upload"><input accept="image/*" onChange={handleTextureUpload} type="file" /><span>{selectedNode.material.textureDataUrl ? 'Replace texture image' : 'Upload texture image'}</span></label>
                  {selectedNode.material.textureDataUrl && <img className="studio-texture-preview" alt="Selected surface texture" src={selectedNode.material.textureDataUrl} />}
                  <div className="studio-two-columns"><SmallNumber label="Repeat U" value={selectedNode.material.repeatU} onChange={(value) => patchMaterial({ repeatU: Math.max(0.01, value) })} /><SmallNumber label="Repeat V" value={selectedNode.material.repeatV} onChange={(value) => patchMaterial({ repeatV: Math.max(0.01, value) })} /></div>
                  <SmallNumber label="Rotation (deg)" value={selectedNode.material.rotationDeg} onChange={(value) => patchMaterial({ rotationDeg: value })} />
                  <StudioField label="Wrap mode"><select value={selectedNode.material.wrapMode} onChange={(event) => patchMaterial({ wrapMode: event.target.value as StudioMaterial['wrapMode'] })}><option value="repeat">Repeat</option><option value="clamp">Clamp</option><option value="mirror">Mirror</option></select></StudioField>
                  <button className="studio-remove-texture" disabled={!selectedNode.material.textureDataUrl} onClick={() => patchMaterial({ textureDataUrl: undefined }, 'Texture removed')} type="button">Remove texture</button>
                  <p className="studio-scope-note">Current alpha applies the skin to the selected object. Face-level UV painting and seam editing are scheduled for the topology milestone.</p>
                </>
              ) : <EmptyInspector>Select an object before editing its surface.</EmptyInspector>}
            </InspectorSection>
          )}

          {inspectorTab === 'scene' && (
            <InspectorSection title="Scene & display">
              <StudioField label="Projection"><select value={document.projection} onChange={(event) => setDocument((current) => ({ ...current, projection: event.target.value as ObjectStudioDocument['projection'] }))}><option value="perspective">Perspective</option><option value="orthographic">Orthographic</option></select></StudioField>
              <StudioField label="Lighting preset"><select value={document.lightingPreset} onChange={(event) => setDocument((current) => ({ ...current, lightingPreset: event.target.value as ObjectStudioDocument['lightingPreset'] }))}><option value="studio">Studio</option><option value="sunlight">Sunlight</option><option value="warehouse">Warehouse</option><option value="inspection">Inspection</option></select></StudioField>
              <RangeField label="Light intensity" max={2} value={document.lightIntensity} onChange={(value) => setDocument((current) => ({ ...current, lightIntensity: value }))} />
              <StudioField label="Background"><input type="color" value={document.background} onChange={(event) => setDocument((current) => ({ ...current, background: event.target.value }))} /></StudioField>
              <h4>Measurements</h4>
              <div className="studio-measurement-list">{document.measurements.length ? document.measurements.map((measurement) => <div key={measurement.id}><span>{measurement.label}</span><button onClick={() => setDocument((current) => ({ ...current, measurements: current.measurements.filter((item) => item.id !== measurement.id) }))} type="button">×</button></div>) : <small>No measurements yet. Activate Tape Measure and select two points.</small>}</div>
              <button onClick={() => setDocument((current) => ({ ...current, measurements: [] }))} disabled={!document.measurements.length} type="button">Clear measurements</button>
              <h4>Capability roadmap</h4>
              <Capability label="Object transforms & gizmos" state="available" />
              <Capability label="Texture upload and UV repeat" state="available" />
              <Capability label="2-point measuring" state="available" />
              <Capability label="Face-level editing" state="experimental" />
              <Capability label="Push/Pull topology" state="planned" />
              <Capability label="Boolean solids" state="planned" />
            </InspectorSection>
          )}
        </aside>
      </main>

      <footer className="object-studio-statusbar">
        <span><b>Tool:</b> {activeTool}</span>
        <span><b>Selection:</b> {selectedNode?.name ?? 'None'}</span>
        <span><b>Units:</b> millimetres</span>
        <span><b>Grid:</b> {document.snapEnabled ? `${document.gridMm} mm snap` : 'free'}</span>
        <span className="studio-notice">{notice}</span>
      </footer>
    </div>
  )
}

function InspectorSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="studio-inspector-section"><header><h3>{title}</h3></header>{children}</section>
}

function StudioField({ label, children }: { label: string; children: ReactNode }) {
  return <label className="studio-field"><span>{label}</span>{children}</label>
}

function VectorEditor({ value, onChange, step = 1 }: { value: StudioVector3; onChange: (axis: keyof StudioVector3, value: number) => void; step?: number }) {
  return <div className="studio-vector-editor">{(['x', 'y', 'z'] as const).map((axis) => <label key={axis}><span className={`vector-${axis}`}>{axis.toUpperCase()}</span><input step={step} type="number" value={round(value[axis])} onChange={(event) => onChange(axis, numeric(event.target.value))} /></label>)}</div>
}

function NumberGrid({ values, labels, onChange }: { values: ObjectDimensionsMm; labels: Record<keyof ObjectDimensionsMm, string>; onChange: (axis: keyof ObjectDimensionsMm, value: number) => void }) {
  return <div className="studio-dimension-grid">{(['length', 'width', 'height'] as const).map((axis) => <label key={axis}><span>{labels[axis]}</span><div><input min="0.1" type="number" value={round(values[axis])} onChange={(event) => onChange(axis, numeric(event.target.value))} /><em>mm</em></div></label>)}</div>
}

function RangeField({ label, value, onChange, max = 1 }: { label: string; value: number; onChange: (value: number) => void; max?: number }) {
  return <label className="studio-range"><span>{label}<b>{value.toFixed(2)}</b></span><input max={max} min="0" step="0.01" type="range" value={value} onChange={(event) => onChange(Number(event.target.value))} /></label>
}

function SmallNumber({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <StudioField label={label}><input step="0.1" type="number" value={round(value)} onChange={(event) => onChange(numeric(event.target.value))} /></StudioField>
}

function EmptyInspector({ children }: { children: ReactNode }) {
  return <div className="studio-empty-inspector">{children}</div>
}

function Capability({ label, state }: { label: string; state: 'available' | 'experimental' | 'planned' }) {
  return <div className="studio-capability"><span>{label}</span><b className={state}>{state}</b></div>
}

function primitiveIcon(primitive: StudioNode['primitive']): string {
  const icons: Record<StudioNode['primitive'], string> = { asset: '◇', box: '▰', cylinder: '⬭', sphere: '●', plane: '▱' }
  return icons[primitive]
}

function formatVolume(volumeMm3: number): string {
  if (volumeMm3 >= 1_000_000_000) return `${(volumeMm3 / 1_000_000_000).toFixed(3)} m³`
  if (volumeMm3 >= 1_000_000) return `${(volumeMm3 / 1_000_000).toFixed(1)} L`
  return `${Math.round(volumeMm3).toLocaleString()} mm³`
}

function numeric(value: string): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function round(value: number): number {
  return Math.round(value * 1000) / 1000
}

function downloadText(fileName: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = fileName
  anchor.click()
  URL.revokeObjectURL(url)
}
