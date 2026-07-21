import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  getCapability,
  isCapabilityInteractive,
} from '@/domain/capabilities/feature-capability'
import {
  createObjectAsset,
  type ObjectAsset,
  type ObjectGeometryType,
} from '@/domain/gallery/object-asset'
import {
  conveyorPathPolyline,
  createConveyor,
  createLayoutProject,
  createSceneInstance,
  sampleConveyorPath,
  type ConveyorDefinition,
  type ConveyorType,
  type LayoutProject,
  type SceneObjectInstance,
} from '@/domain/layout/layout'
import {
  getAiCapabilities,
  pollAiJob,
  submitReconstruction,
  submitSegmentation,
  type AiCapabilities,
  type SelectionBox,
} from '@/services/ai/ai-client'
import {
  exportWorkspace,
  loadGallery,
  loadLayout,
  saveGallery,
  saveLayout,
} from '@/storage/workspace-store'
import './workspace.css'

type WorkspaceId = 'capture' | 'gallery' | 'layout' | 'runtime'
type SelectionMode = 'box' | 'point'
type JobState = 'idle' | 'submitting' | 'IN_QUEUE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'

interface NormalizedSelection { x: number; y: number; width: number; height: number }
const DEFAULT_SELECTION: NormalizedSelection = { x: 0.12, y: 0.12, width: 0.76, height: 0.76 }

const WORKSPACES: readonly {
  id: WorkspaceId | 'hmi' | 'plc'
  label: string
  phase: string
  capabilityId: string
}[] = [
  { id: 'capture', label: 'Camera to 3D', phase: '1A', capabilityId: 'camera.upload' },
  { id: 'gallery', label: 'Object Gallery', phase: '1A', capabilityId: 'gallery.object-library' },
  { id: 'layout', label: 'Layout Editor', phase: '1B', capabilityId: 'layout.assembly' },
  { id: 'runtime', label: 'Visual Runtime', phase: '1C', capabilityId: 'runtime.transport' },
  { id: 'hmi', label: 'HMI / SCADA', phase: 'Future', capabilityId: 'hmi.editor' },
  { id: 'plc', label: 'PLC Simulation', phase: 'Future', capabilityId: 'automation.plc' },
]

export function WorkspacePage() {
  const [workspace, setWorkspace] = useState<WorkspaceId>('capture')
  const [gallery, setGallery] = useState<ObjectAsset[]>(() => loadGallery())
  const [layout, setLayout] = useState<LayoutProject>(() => loadLayout() ?? createLayoutProject())
  const [aiCapabilities, setAiCapabilities] = useState<AiCapabilities>({ configured: false, provider: null, segmentationModel: null, reconstructionModel: null })

  useEffect(() => { void getAiCapabilities().then(setAiCapabilities) }, [])
  useEffect(() => saveGallery(gallery), [gallery])
  useEffect(() => saveLayout(layout), [layout])

  function addAsset(asset: ObjectAsset) {
    setGallery((current) => [asset, ...current])
    setWorkspace('gallery')
  }

  function insertAsset(asset: ObjectAsset) {
    setLayout((current) => ({ ...current, objects: [...current.objects, createSceneInstance(asset)], updatedAt: new Date().toISOString() }))
    setWorkspace('layout')
  }

  function downloadProject() {
    const blob = new Blob([exportWorkspace({ gallery, layout })], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'engineering1-workspace.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="workspace-shell">
      <header className="topbar">
        <div><p className="eyebrow">Engineering1</p><h1>AI Object Capture & Mechanical Layout</h1></div>
        <div className="topbar__actions">
          <span className={`provider-status ${aiCapabilities.configured ? 'provider-status--online' : ''}`}>
            AI provider: {aiCapabilities.configured ? aiCapabilities.provider : 'not configured'}
          </span>
          <button className="button button--secondary" type="button" onClick={downloadProject}>Export project</button>
        </div>
      </header>
      <div className="workspace-grid">
        <aside className="sidebar" aria-label="Engineering workspaces">
          <p className="sidebar__label">Workspaces</p>
          {WORKSPACES.map((item) => {
            const capability = getCapability(item.capabilityId)
            const interactive = isCapabilityInteractive(capability)
            return (
              <button
                className={`workspace-link ${item.id === workspace ? 'workspace-link--active' : ''}`}
                disabled={!interactive}
                key={item.id}
                onClick={() => interactive && setWorkspace(item.id as WorkspaceId)}
                title={interactive ? capability.label : capability.reason}
                type="button"
              >
                <span>{item.label}</span><span className={`status-dot status-dot--${capability.status}`}>{item.phase}</span>
              </button>
            )
          })}
          <div className="sidebar__vision"><strong>Phase 1 rule</strong><span>Working functions use colour. Planned functions remain grey and cannot be clicked.</span></div>
        </aside>
        <main className="workspace-main">
          {workspace === 'capture' && <CaptureWorkspace aiCapabilities={aiCapabilities} onSave={addAsset} />}
          {workspace === 'gallery' && <GalleryWorkspace assets={gallery} onInsert={insertAsset} />}
          {workspace === 'layout' && <LayoutWorkspace layout={layout} onChange={setLayout} gallery={gallery} onInsert={insertAsset} />}
          {workspace === 'runtime' && <RuntimeWorkspace conveyors={layout.conveyors} />}
        </main>
      </div>
    </div>
  )
}

function CaptureWorkspace({ aiCapabilities, onSave }: { aiCapabilities: AiCapabilities; onSave: (asset: ObjectAsset) => void }) {
  const stageRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [fileName, setFileName] = useState('')
  const [sourceType, setSourceType] = useState<'image-upload' | 'video-frame'>('image-upload')
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('box')
  const [selection, setSelection] = useState<NormalizedSelection>(DEFAULT_SELECTION)
  const [selectedImage, setSelectedImage] = useState('')
  const [segmentedImageUrl, setSegmentedImageUrl] = useState('')
  const [modelUrl, setModelUrl] = useState('')
  const [renderedPreviewUrl, setRenderedPreviewUrl] = useState('')
  const [geometryType, setGeometryType] = useState<ObjectGeometryType>('proxy-box')
  const [jobState, setJobState] = useState<JobState>('idle')
  const [message, setMessage] = useState('Upload an image or video and select one target object.')
  const [name, setName] = useState('Captured object')
  const [category, setCategory] = useState('User captured')
  const [tags, setTags] = useState('captured, reusable')
  const [material, setMaterial] = useState('Unknown')
  const [lengthMm, setLengthMm] = useState(300)
  const [widthMm, setWidthMm] = useState(200)
  const [heightMm, setHeightMm] = useState(200)

  const previewImage = renderedPreviewUrl || segmentedImageUrl || selectedImage || imageDataUrl
  const canRunAi = aiCapabilities.configured && Boolean(imageDataUrl)
  const busy = jobState === 'IN_PROGRESS' || jobState === 'submitting' || jobState === 'IN_QUEUE'

  async function handleMediaUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setMessage('Preparing media…')
    try {
      const result = await mediaFileToImage(file)
      setImageDataUrl(result.dataUrl)
      setSourceType(result.sourceType)
      setFileName(file.name)
      setName(stripExtension(file.name) || 'Captured object')
      setSelection(DEFAULT_SELECTION)
      setSelectedImage('')
      setSegmentedImageUrl('')
      setModelUrl('')
      setRenderedPreviewUrl('')
      setJobState('idle')
      setMessage('Drag a box around the object. The surrounding environment will be removed.')
    } catch (error) { setMessage(toErrorMessage(error)) }
    finally { event.target.value = '' }
  }

  function startSelection(event: ReactPointerEvent<HTMLDivElement>) {
    if (!imageDataUrl || !stageRef.current) return
    const point = normalizedPointer(event, stageRef.current)
    dragOrigin.current = point
    setSelection({ x: point.x, y: point.y, width: 0.001, height: 0.001 })
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function updateSelection(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current || !stageRef.current) return
    const point = normalizedPointer(event, stageRef.current)
    const origin = dragOrigin.current
    setSelection({ x: Math.min(origin.x, point.x), y: Math.min(origin.y, point.y), width: Math.max(0.001, Math.abs(point.x - origin.x)), height: Math.max(0.001, Math.abs(point.y - origin.y)) })
  }

  function finishSelection(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current || !stageRef.current) return
    const point = normalizedPointer(event, stageRef.current)
    if (selectionMode === 'point') {
      const size = 0.22
      setSelection({ x: clamp(point.x - size / 2, 0, 1 - size), y: clamp(point.y - size / 2, 0, 1 - size), width: size, height: size })
    }
    dragOrigin.current = null
    event.currentTarget.releasePointerCapture(event.pointerId)
  }

  async function createManualSelection() {
    if (!imageDataUrl) return
    setMessage('Removing the environment outside the selected region…')
    try {
      const cropped = await cropToSelection(imageDataUrl, selection)
      setSelectedImage(cropped)
      setSegmentedImageUrl('')
      setGeometryType('proxy-box')
      setMessage('Manual fallback completed. AI Segment provides edge-accurate removal when the provider is configured.')
    } catch (error) { setMessage(toErrorMessage(error)) }
  }

  async function runAiSegmentation() {
    if (!canRunAi) return
    setJobState('submitting')
    setMessage('Submitting object selection to AI segmentation…')
    try {
      const job = await submitSegmentation(imageDataUrl, await selectionToPixelBox(imageDataUrl, selection))
      const result = await pollAiJob(job, setJobState)
      const imageUrl = nestedFileUrl(result, 'image')
      if (!imageUrl) throw new Error('The segmentation provider returned no image.')
      setSegmentedImageUrl(imageUrl)
      setSelectedImage(imageUrl)
      setJobState('COMPLETED')
      setMessage('AI removed the environment. Review the isolated object before generating 3D.')
    } catch (error) { setJobState('FAILED'); setMessage(toErrorMessage(error)) }
  }

  async function runAiReconstruction() {
    const inputImage = segmentedImageUrl || selectedImage || imageDataUrl
    if (!aiCapabilities.configured || !inputImage) return
    setJobState('submitting')
    setMessage('Submitting the isolated object for AI 3D reconstruction…')
    try {
      const result = await pollAiJob(await submitReconstruction(inputImage), setJobState, 420_000)
      const mesh = nestedFileUrl(result, 'model_mesh') || nestedFileUrl(result, 'pbr_model')
      const rendered = nestedFileUrl(result, 'rendered_image')
      if (!mesh) throw new Error('The reconstruction provider returned no 3D model.')
      setModelUrl(mesh)
      setRenderedPreviewUrl(rendered)
      setGeometryType('ai-mesh')
      setJobState('COMPLETED')
      setMessage('AI mesh created. Enter verified dimensions before releasing the object.')
    } catch (error) { setJobState('FAILED'); setMessage(toErrorMessage(error)) }
  }

  function saveObject() {
    if (!previewImage) return
    try {
      onSave(createObjectAsset({
        name, category, tags: tags.split(','), sourceType: geometryType === 'ai-mesh' ? 'ai-generated' : sourceType,
        geometryType, dimensionsMm: { length: lengthMm, width: widthMm, height: heightMm }, material,
        thumbnailDataUrl: previewImage, sourceImageDataUrl: imageDataUrl,
        segmentedImageUrl: segmentedImageUrl || selectedImage || undefined,
        modelUrl: modelUrl || undefined, renderedPreviewUrl: renderedPreviewUrl || undefined,
      }))
    } catch (error) { setMessage(toErrorMessage(error)) }
  }

  return (
    <section className="workspace-section">
      <SectionHeading phase="Phase 1A" title="Camera / Image / Video → Reusable Object Gallery" text="Select any visible object, remove its environment, create a visual 3D object, calibrate it, then save it for later assembly." badge="Priority 1" />
      <div className="capture-layout">
        <div className="panel capture-panel">
          <PanelHeading title="1. Source and object selection" state="Available" stateClass="available" />
          <label className="upload-zone"><input accept="image/*,video/*" onChange={handleMediaUpload} type="file" /><strong>Upload image or video</strong><span>Images are resized locally. A representative frame is extracted from video.</span></label>
          {imageDataUrl ? <>
            <div className="selection-toolbar">
              <button className={`tool-button ${selectionMode === 'box' ? 'tool-button--active' : ''}`} onClick={() => setSelectionMode('box')} type="button">Box select</button>
              <button className={`tool-button ${selectionMode === 'point' ? 'tool-button--active' : ''}`} onClick={() => setSelectionMode('point')} type="button">Point focus</button><span>{fileName}</span>
            </div>
            <div className="selection-stage" onPointerDown={startSelection} onPointerMove={updateSelection} onPointerUp={finishSelection} ref={stageRef}>
              <img alt="Uploaded source for object selection" draggable={false} src={imageDataUrl} />
              <span className="selection-box" style={{ left: `${selection.x * 100}%`, top: `${selection.y * 100}%`, width: `${selection.width * 100}%`, height: `${selection.height * 100}%` }} />
            </div>
            <div className="button-row">
              <button className="button button--secondary" onClick={() => void createManualSelection()} type="button">Extract selected region</button>
              <button className="button button--primary" disabled={!canRunAi || busy} onClick={() => void runAiSegmentation()} title={canRunAi ? 'Run SAM 2 segmentation' : 'Configure FAL_KEY on the server.'} type="button">AI remove environment</button>
            </div>
          </> : <div className="empty-state">No media loaded.</div>}
        </div>
        <div className="panel preview-panel">
          <PanelHeading title="2. 3D generation and review" state={aiCapabilities.configured ? 'AI ready' : 'AI key required'} stateClass={aiCapabilities.configured ? 'experimental' : 'disabled'} />
          <ObjectPreview image={previewImage} geometryType={geometryType} />
          <div className="button-row">
            <button className="button button--secondary" disabled={!previewImage} onClick={() => { setGeometryType('proxy-box'); setMessage('Parametric visual proxy created. Calibrate dimensions before saving.') }} type="button">Create 3D proxy</button>
            <button className="button button--primary" disabled={!canRunAi || busy} onClick={() => void runAiReconstruction()} title={canRunAi ? 'Generate a GLB mesh' : 'Configure FAL_KEY on the server.'} type="button">Generate AI 3D</button>
          </div>
          {modelUrl && <a className="model-link" href={modelUrl} rel="noreferrer" target="_blank">Open generated GLB model</a>}
          <p className={`job-message job-message--${jobState}`} aria-live="polite">{message}</p>
        </div>
      </div>
      <div className="panel properties-panel">
        <PanelHeading title="3. Static properties and Gallery record" state="BOM-ready foundation" stateClass="available" />
        <div className="property-grid">
          <Field label="Object name"><input onChange={(event) => setName(event.target.value)} value={name} /></Field>
          <Field label="Category"><input onChange={(event) => setCategory(event.target.value)} value={category} /></Field>
          <Field label="Tags"><input onChange={(event) => setTags(event.target.value)} value={tags} /></Field>
          <Field label="Material"><input onChange={(event) => setMaterial(event.target.value)} value={material} /></Field>
          <NumberField label="Length (mm)" value={lengthMm} onChange={setLengthMm} />
          <NumberField label="Width (mm)" value={widthMm} onChange={setWidthMm} />
          <NumberField label="Height (mm)" value={heightMm} onChange={setHeightMm} />
          <Field label="Lifecycle"><input disabled value="Draft — dimensions not independently verified" /></Field>
        </div>
        <div className="button-row button-row--end"><button className="button button--primary" disabled={!previewImage} onClick={saveObject} type="button">Save reusable object to Gallery</button></div>
      </div>
    </section>
  )
}

function GalleryWorkspace({ assets, onInsert }: { assets: ObjectAsset[]; onInsert: (asset: ObjectAsset) => void }) {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return assets
    return assets.filter((asset) => [asset.name, asset.category, asset.material, ...asset.tags].join(' ').toLowerCase().includes(normalized))
  }, [assets, query])
  return (
    <section className="workspace-section">
      <SectionHeading phase="Phase 1A" title="Reusable Object Gallery" text="Objects are stored independently from scenes so the same captured component can be assembled many times." badge={`${assets.length} objects`} />
      <div className="gallery-toolbar"><label><span>Search Gallery</span><input onChange={(event) => setQuery(event.target.value)} placeholder="Name, category, material or tag" value={query} /></label></div>
      {filtered.length ? <div className="gallery-grid">{filtered.map((asset) => (
        <article className="gallery-card" key={asset.id}>
          <img alt={`${asset.name} preview`} src={asset.thumbnailDataUrl} />
          <div className="gallery-card__body">
            <div className="gallery-card__title"><h3>{asset.name}</h3><span className="status-label status-label--experimental">{asset.lifecycle}</span></div>
            <p>{asset.category} · {asset.geometryType}</p>
            <dl>
              <div><dt>Size</dt><dd>{asset.dimensionsMm.length} × {asset.dimensionsMm.width} × {asset.dimensionsMm.height} mm</dd></div>
              <div><dt>Material</dt><dd>{asset.material}</dd></div><div><dt>Source</dt><dd>{asset.sourceType}</dd></div>
            </dl>
            <div className="button-row"><button className="button button--primary" onClick={() => onInsert(asset)} type="button">Insert into layout</button>{asset.modelUrl && <a className="button button--secondary" href={asset.modelUrl} rel="noreferrer" target="_blank">GLB</a>}</div>
          </div>
        </article>
      ))}</div> : <div className="empty-state">No objects match this search. Create the first object in Camera to 3D.</div>}
    </section>
  )
}

function LayoutWorkspace({ layout, onChange, gallery, onInsert }: { layout: LayoutProject; onChange: (layout: LayoutProject) => void; gallery: ObjectAsset[]; onInsert: (asset: ObjectAsset) => void }) {
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
  const [selectedConveyorId, setSelectedConveyorId] = useState(() => layout.conveyors[0]?.id ?? '')
  const selectedObject = layout.objects.find((item) => item.id === selectedObjectId) ?? null
  const selectedConveyor = layout.conveyors.find((item) => item.id === selectedConveyorId) ?? layout.conveyors[0] ?? null

  function addConveyor(type: ConveyorType) {
    const conveyor = createConveyor(type)
    onChange({ ...layout, conveyors: [...layout.conveyors, conveyor], updatedAt: new Date().toISOString() })
    setSelectedConveyorId(conveyor.id)
  }
  function updateObject(patch: Partial<SceneObjectInstance>) {
    if (!selectedObject) return
    onChange({ ...layout, objects: layout.objects.map((item) => item.id === selectedObject.id ? { ...item, ...patch } : item), updatedAt: new Date().toISOString() })
  }
  function updateConveyor(patch: Partial<ConveyorDefinition>) {
    if (!selectedConveyor) return
    onChange({ ...layout, conveyors: layout.conveyors.map((item) => item.id === selectedConveyor.id ? { ...item, ...patch } : item), updatedAt: new Date().toISOString() })
  }

  return (
    <section className="workspace-section">
      <SectionHeading phase="Phase 1B" title="Mechanical Layout Editor" text="Insert reusable Gallery objects, position them on a factory grid, and add transport modules." badge="Alpha" alpha />
      <div className="layout-toolbar">{(['straight', 'curve', 'incline', 'decline', 'spiral', 'buffer'] as const).map((type) => <button className="tool-button" key={type} onClick={() => addConveyor(type)} type="button">+ {type}</button>)}</div>
      <div className="editor-layout">
        <div className="layout-canvas" aria-label="Mechanical layout canvas">
          <svg className="layout-conveyors" viewBox="0 0 600 380" preserveAspectRatio="none">
            {layout.conveyors.map((conveyor, index) => <g key={conveyor.id} transform={`translate(${(index % 2) * 10}, ${(index % 3) * 12})`}><polyline className={conveyor.id === selectedConveyor?.id ? 'conveyor-line conveyor-line--selected' : 'conveyor-line'} onClick={() => setSelectedConveyorId(conveyor.id)} points={conveyorPathPolyline(conveyor)} /></g>)}
          </svg>
          {layout.objects.map((instance) => <button className={`scene-object ${instance.id === selectedObjectId ? 'scene-object--selected' : ''}`} key={instance.id} onClick={() => setSelectedObjectId(instance.id)} style={{ left: `${clamp(instance.xMm / 10000, 0, 0.88) * 100}%`, top: `${clamp(instance.zMm / 7000, 0, 0.82) * 100}%`, transform: `rotate(${instance.rotationDeg}deg) scale(${instance.scale})` }} type="button"><img alt="" src={instance.thumbnailDataUrl} /><span>{instance.name}</span></button>)}
          {!layout.objects.length && <div className="canvas-hint">Insert a Gallery object to start assembly.</div>}
        </div>
        <aside className="editor-properties">
          <h3>Layout properties</h3>
          {selectedObject ? <div className="stacked-fields"><strong>{selectedObject.name}</strong><NumberField label="X (mm)" value={selectedObject.xMm} onChange={(value) => updateObject({ xMm: value })} /><NumberField label="Z (mm)" value={selectedObject.zMm} onChange={(value) => updateObject({ zMm: value })} /><NumberField label="Elevation (mm)" value={selectedObject.elevationMm} onChange={(value) => updateObject({ elevationMm: value })} /><NumberField label="Rotation (deg)" value={selectedObject.rotationDeg} onChange={(value) => updateObject({ rotationDeg: value })} /></div> : selectedConveyor ? <div className="stacked-fields"><strong>{selectedConveyor.name}</strong><Field label="Type"><input disabled value={selectedConveyor.type} /></Field><NumberField label="Length (mm)" value={selectedConveyor.lengthMm} onChange={(value) => updateConveyor({ lengthMm: Math.max(100, value) })} /><NumberField label="Width (mm)" value={selectedConveyor.widthMm} onChange={(value) => updateConveyor({ widthMm: Math.max(50, value) })} /><NumberField label="Entry elevation (mm)" value={selectedConveyor.entryElevationMm} onChange={(value) => updateConveyor({ entryElevationMm: value })} /><NumberField label="Exit elevation (mm)" value={selectedConveyor.exitElevationMm} onChange={(value) => updateConveyor({ exitElevationMm: value })} /><NumberField label="Speed (m/s)" step={0.05} value={selectedConveyor.speedMps} onChange={(value) => updateConveyor({ speedMps: Math.max(0.01, value) })} /><button className="button button--secondary" onClick={() => updateConveyor({ direction: selectedConveyor.direction === 1 ? -1 : 1 })} type="button">Direction: {selectedConveyor.direction === 1 ? 'Forward →' : 'Reverse ←'}</button></div> : <p>Select an object or conveyor.</p>}
          <h3>Quick insert</h3><div className="quick-insert">{gallery.slice(0, 4).map((asset) => <button key={asset.id} onClick={() => onInsert(asset)} type="button"><img alt="" src={asset.thumbnailDataUrl} /><span>{asset.name}</span></button>)}</div>
        </aside>
      </div>
    </section>
  )
}

function RuntimeWorkspace({ conveyors }: { conveyors: ConveyorDefinition[] }) {
  const [selectedId, setSelectedId] = useState(() => conveyors[0]?.id ?? '')
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const frameRef = useRef<number | null>(null)
  const timeRef = useRef<number | null>(null)
  const selected = conveyors.find((item) => item.id === selectedId) ?? conveyors[0] ?? null

  useEffect(() => {
    if (!playing || !selected) return
    const tick = (time: number) => {
      const previous = timeRef.current ?? time
      const deltaSeconds = Math.min(0.05, (time - previous) / 1000)
      timeRef.current = time
      setProgress((current) => (current + deltaSeconds * selected.speedMps * speedMultiplier / Math.max(0.5, selected.lengthMm / 1000)) % 1)
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); frameRef.current = null; timeRef.current = null }
  }, [playing, selected, speedMultiplier])

  if (!selected) return <div className="empty-state">Create a conveyor in Layout Editor first.</div>
  const count = selected.type === 'buffer' ? Math.min(16, selected.bufferCapacity) : 7
  const products = Array.from({ length: count }, (_, index) => ({ ...sampleConveyorPath(selected, progress - index * (selected.type === 'buffer' ? 0.035 : 0.11)), id: `${selected.id}-${index}` }))

  return (
    <section className="workspace-section">
      <SectionHeading phase="Phase 1C" title="Transport Visual Runtime" text="Verify direction and movement of cookie packs, cartons or cases through straight, curved, elevated, spiral and buffer paths." badge="Runtime Alpha" alpha />
      <div className="runtime-toolbar">
        <label><span>Conveyor</span><select onChange={(event) => { setSelectedId(event.target.value); setProgress(0) }} value={selected.id}>{conveyors.map((conveyor) => <option key={conveyor.id} value={conveyor.id}>{conveyor.name}</option>)}</select></label>
        <button className="button button--primary" onClick={() => setPlaying((value) => !value)} type="button">{playing ? 'Pause' : 'Play'}</button>
        <button className="button button--secondary" onClick={() => { setPlaying(false); setProgress(0) }} type="button">Reset</button>
        <label><span>Simulation speed</span><select onChange={(event) => setSpeedMultiplier(Number(event.target.value))} value={speedMultiplier}><option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option><option value={4}>4×</option></select></label>
      </div>
      <div className="runtime-stage"><svg role="img" aria-label={`${selected.type} conveyor transporting ${selected.productType}`} viewBox="0 0 600 380"><defs><linearGradient id="belt" x1="0" x2="1"><stop offset="0" stopColor="currentColor" stopOpacity="0.25" /><stop offset="1" stopColor="currentColor" stopOpacity="0.7" /></linearGradient></defs><polyline className="runtime-belt" points={conveyorPathPolyline(selected)} />{products.map((product) => <g className="runtime-product" key={product.id} transform={`translate(${product.x} ${product.y})`}><rect x="-14" y="-9" width="28" height="18" rx="4" /><path d="M-8 -3h16M-8 2h16" /></g>)}<text className="runtime-label" x="24" y="28">{selected.type.toUpperCase()} · {selected.direction === 1 ? 'FORWARD' : 'REVERSE'} · {selected.speedMps.toFixed(2)} m/s</text><text className="runtime-label" x="24" y="350">Entry {selected.entryElevationMm} mm → Exit {selected.exitElevationMm} mm · Capacity {selected.bufferCapacity}</text></svg></div>
    </section>
  )
}

function SectionHeading({ phase, title, text, badge, alpha = false }: { phase: string; title: string; text: string; badge: string; alpha?: boolean }) {
  return <div className="section-heading"><div><p className="eyebrow">{phase}</p><h2>{title}</h2><p>{text}</p></div><span className={`phase-badge ${alpha ? 'phase-badge--alpha' : ''}`}>{badge}</span></div>
}
function PanelHeading({ title, state, stateClass }: { title: string; state: string; stateClass: 'available' | 'experimental' | 'disabled' }) {
  return <div className="panel__heading"><h3>{title}</h3><span className={`status-label status-label--${stateClass}`}>{state}</span></div>
}
function ObjectPreview({ image, geometryType }: { image: string; geometryType: ObjectGeometryType }) {
  if (!image) return <div className="object-preview object-preview--empty">3D preview appears here</div>
  return <div className={`object-preview object-preview--${geometryType}`}><div className="proxy-cube" style={{ '--preview-image': `url("${image}")` } as React.CSSProperties}><span className="proxy-face proxy-face--front" /><span className="proxy-face proxy-face--back" /><span className="proxy-face proxy-face--left" /><span className="proxy-face proxy-face--right" /><span className="proxy-face proxy-face--top" /><span className="proxy-face proxy-face--bottom" /></div><span className="preview-caption">{geometryType === 'ai-mesh' ? 'AI mesh generated · rendered preview' : 'Calibratable 3D proxy'}</span></div>
}
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="field"><span>{label}</span>{children}</label> }
function NumberField({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (value: number) => void; step?: number }) { return <Field label={label}><input min={0} onChange={(event) => onChange(Number(event.target.value))} step={step} type="number" value={Number.isFinite(value) ? value : 0} /></Field> }

function normalizedPointer(event: ReactPointerEvent, element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect()
  return { x: clamp((event.clientX - rect.left) / rect.width, 0, 1), y: clamp((event.clientY - rect.top) / rect.height, 0, 1) }
}
async function mediaFileToImage(file: File): Promise<{ dataUrl: string; sourceType: 'image-upload' | 'video-frame' }> {
  if (file.type.startsWith('image/')) return { dataUrl: await resizeImageFile(file), sourceType: 'image-upload' }
  if (file.type.startsWith('video/')) return { dataUrl: await extractVideoFrame(file), sourceType: 'video-frame' }
  throw new Error('Unsupported file. Upload an image or video.')
}
async function resizeImageFile(file: File, maxDimension = 1600): Promise<string> {
  const raw = await fileToDataUrl(file)
  const image = await loadImage(raw)
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale)); canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas is unavailable.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.9)
}
async function extractVideoFrame(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const video = document.createElement('video'); video.muted = true; video.playsInline = true; video.src = url
    await once(video, 'loadedmetadata'); video.currentTime = Math.min(Math.max(0, video.duration * 0.25), 2); await once(video, 'seeked')
    const scale = Math.min(1, 1600 / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas'); canvas.width = Math.max(1, Math.round(video.videoWidth * scale)); canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
    const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas is unavailable.')
    context.drawImage(video, 0, 0, canvas.width, canvas.height); return canvas.toDataURL('image/jpeg', 0.9)
  } finally { URL.revokeObjectURL(url) }
}
async function cropToSelection(dataUrl: string, selection: NormalizedSelection): Promise<string> {
  const image = await loadImage(dataUrl)
  const sx = Math.round(selection.x * image.naturalWidth), sy = Math.round(selection.y * image.naturalHeight)
  const sw = Math.max(1, Math.round(selection.width * image.naturalWidth)), sh = Math.max(1, Math.round(selection.height * image.naturalHeight))
  const canvas = document.createElement('canvas'); canvas.width = sw; canvas.height = sh
  const context = canvas.getContext('2d'); if (!context) throw new Error('Canvas is unavailable.')
  context.clearRect(0, 0, sw, sh); context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh); return canvas.toDataURL('image/png')
}
async function selectionToPixelBox(dataUrl: string, selection: NormalizedSelection): Promise<SelectionBox> {
  const image = await loadImage(dataUrl)
  return { xMin: Math.round(selection.x * image.naturalWidth), yMin: Math.round(selection.y * image.naturalHeight), xMax: Math.round((selection.x + selection.width) * image.naturalWidth), yMax: Math.round((selection.y + selection.height) * image.naturalHeight) }
}
function nestedFileUrl(result: Record<string, unknown>, key: string): string {
  const value = result[key]; if (!value || typeof value !== 'object') return ''
  const url = (value as { url?: unknown }).url; return typeof url === 'string' ? url : ''
}
function fileToDataUrl(file: File): Promise<string> { return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onerror = () => reject(new Error('Unable to read the selected file.')); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(file) }) }
function loadImage(src: string): Promise<HTMLImageElement> { return new Promise((resolve, reject) => { const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error('Unable to decode the image.')); image.crossOrigin = 'anonymous'; image.src = src }) }
function once(element: HTMLMediaElement, eventName: string): Promise<void> { return new Promise((resolve, reject) => { const cleanup = () => { element.removeEventListener(eventName, success); element.removeEventListener('error', failure) }; const success = () => { cleanup(); resolve() }; const failure = () => { cleanup(); reject(new Error('Unable to read the video.')) }; element.addEventListener(eventName, success, { once: true }); element.addEventListener('error', failure, { once: true }) }) }
function stripExtension(fileName: string): string { return fileName.replace(/\.[^.]+$/, '') }
function clamp(value: number, minimum: number, maximum: number): number { return Math.min(maximum, Math.max(minimum, value)) }
function toErrorMessage(error: unknown): string { return error instanceof Error ? error.message : 'Unexpected error.' }
