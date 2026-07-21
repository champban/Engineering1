import {
  type ChangeEvent,
  type PointerEvent as ReactPointerEvent,
  lazy,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  FEATURE_CAPABILITIES,
  getCapability,
  isCapabilityInteractive,
} from '@/domain/capabilities/feature-capability'
import { createDemoWorkspace } from '@/domain/demo/demo-workspace'
import {
  createObjectAsset,
  duplicateObjectAsset,
  markObjectAssetCalibrated,
  type ObjectAsset,
  type ObjectDimensionsMm,
  type ObjectGeometryType,
} from '@/domain/gallery/object-asset'
import {
  buildConnectedRoute,
  canvasPointToWorld,
  connectedRoutePolyline,
  conveyorPathPolyline,
  createConveyor,
  createLayoutProject,
  createSceneInstance,
  duplicateSceneInstance,
  evaluateConveyorConnections,
  reorderConveyor,
  sampleConnectedRoute,
  sampleConveyorPath,
  type ConveyorDefinition,
  type ConveyorType,
  type LayoutProject,
  type SceneObjectInstance,
} from '@/domain/layout/layout'
import { calculateOee, percentage } from '@/domain/runtime/oee'
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

const LazyThreeObjectPreview = lazy(async () => {
  const module = await import('@/viewport/components/ThreeObjectPreview')
  return { default: module.ThreeObjectPreview }
})

interface NormalizedSelection {
  x: number
  y: number
  width: number
  height: number
}

const DEFAULT_SELECTION: NormalizedSelection = {
  x: 0.12,
  y: 0.12,
  width: 0.76,
  height: 0.76,
}

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
  const [initialWorkspace] = useState(() => {
    const storedGallery = loadGallery()
    const storedLayout = loadLayout()
    const hasUserContent = storedGallery.length > 0
      || Boolean(storedLayout && (storedLayout.objects.length > 0 || storedLayout.conveyors.length > 1))
    return hasUserContent
      ? { gallery: storedGallery, layout: storedLayout ?? createLayoutProject() }
      : createDemoWorkspace()
  })
  const [workspace, setWorkspace] = useState<WorkspaceId>('gallery')
  const [gallery, setGallery] = useState<ObjectAsset[]>(initialWorkspace.gallery)
  const [layout, setLayout] = useState<LayoutProject>(initialWorkspace.layout)
  const [aiCapabilities, setAiCapabilities] = useState<AiCapabilities>({
    configured: false,
    provider: null,
    segmentationModel: null,
    reconstructionModel: null,
  })

  useEffect(() => {
    void getAiCapabilities().then(setAiCapabilities)
  }, [])

  useEffect(() => saveGallery(gallery), [gallery])
  useEffect(() => saveLayout(layout), [layout])

  function addAsset(asset: ObjectAsset) {
    setGallery((current) => [asset, ...current])
    setWorkspace('gallery')
  }

  function insertAsset(asset: ObjectAsset) {
    const instance = createSceneInstance(asset)
    setLayout((current) => ({
      ...current,
      objects: [...current.objects, instance],
      updatedAt: new Date().toISOString(),
    }))
    setWorkspace('layout')
  }

  function deleteAsset(assetId: string) {
    setGallery((current) => current.filter((asset) => asset.id !== assetId))
  }

  function duplicateAsset(asset: ObjectAsset) {
    setGallery((current) => [duplicateObjectAsset(asset), ...current])
  }

  function calibrateAsset(asset: ObjectAsset) {
    setGallery((current) => current.map((item) => item.id === asset.id ? markObjectAssetCalibrated(item) : item))
  }

  function loadDemoProject() {
    const hasCurrentWork = gallery.length > 0 || layout.objects.length > 0
    if (hasCurrentWork && !window.confirm('Replace the current browser workspace with the Engineering1 demo project?')) return
    const demo = createDemoWorkspace()
    setGallery(demo.gallery)
    setLayout(demo.layout)
    setWorkspace('gallery')
  }

  function downloadProject() {
    const text = exportWorkspace({ gallery, layout })
    const blob = new Blob([text], { type: 'application/json' })
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
        <div>
          <p className="eyebrow">Engineering1</p>
          <h1>AI Object Capture & Mechanical Layout</h1>
        </div>
        <div className="topbar__actions">
          <span className={`provider-status ${aiCapabilities.configured ? 'provider-status--online' : ''}`}>
            AI provider: {aiCapabilities.configured ? aiCapabilities.provider : 'not configured'}
          </span>
          <button className="button button--secondary" type="button" onClick={loadDemoProject}>
            Load demo project
          </button>
          <button className="button button--secondary" type="button" onClick={downloadProject}>
            Export project
          </button>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="sidebar" aria-label="Engineering workspaces">
          <p className="sidebar__label">Workspaces</p>
          {WORKSPACES.map((item) => {
            const capability = getCapability(item.capabilityId)
            const interactive = isCapabilityInteractive(capability)
            const selected = item.id === workspace
            return (
              <button
                className={`workspace-link ${selected ? 'workspace-link--active' : ''}`}
                disabled={!interactive}
                key={item.id}
                onClick={() => interactive && setWorkspace(item.id as WorkspaceId)}
                title={interactive ? capability.label : capability.reason}
                type="button"
              >
                <span>{item.label}</span>
                <span className={`status-dot status-dot--${capability.status}`}>{item.phase}</span>
              </button>
            )
          })}

          <div className="sidebar__vision">
            <strong>Phase 1 rule</strong>
            <span>Working functions use colour. Planned functions remain grey and cannot be clicked.</span>
          </div>
        </aside>

        <main className="workspace-main">
          {workspace === 'capture' && (
            <CaptureWorkspace aiCapabilities={aiCapabilities} onSave={addAsset} />
          )}
          {workspace === 'gallery' && (
            <GalleryWorkspace
              assets={gallery}
              onCalibrate={calibrateAsset}
              onDelete={deleteAsset}
              onDuplicate={duplicateAsset}
              onInsert={insertAsset}
            />
          )}
          {workspace === 'layout' && (
            <LayoutWorkspace layout={layout} onChange={setLayout} gallery={gallery} onInsert={insertAsset} />
          )}
          {workspace === 'runtime' && <RuntimeWorkspace conveyors={layout.conveyors} />}
        </main>
      </div>
    </div>
  )
}

function CaptureWorkspace({
  aiCapabilities,
  onSave,
}: {
  aiCapabilities: AiCapabilities
  onSave: (asset: ObjectAsset) => void
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const dragOrigin = useRef<{ x: number; y: number } | null>(null)
  const [imageDataUrl, setImageDataUrl] = useState<string>('')
  const [fileName, setFileName] = useState<string>('')
  const [sourceType, setSourceType] = useState<'image-upload' | 'video-frame'>('image-upload')
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('box')
  const [selection, setSelection] = useState<NormalizedSelection>(DEFAULT_SELECTION)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [segmentedImageUrl, setSegmentedImageUrl] = useState<string>('')
  const [modelUrl, setModelUrl] = useState<string>('')
  const [renderedPreviewUrl, setRenderedPreviewUrl] = useState<string>('')
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
  const canSave = Boolean(previewImage)

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
    } catch (error) {
      setMessage(toErrorMessage(error))
    } finally {
      event.target.value = ''
    }
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
    setSelection({
      x: Math.min(origin.x, point.x),
      y: Math.min(origin.y, point.y),
      width: Math.max(0.001, Math.abs(point.x - origin.x)),
      height: Math.max(0.001, Math.abs(point.y - origin.y)),
    })
  }

  function finishSelection(event: ReactPointerEvent<HTMLDivElement>) {
    if (!dragOrigin.current || !stageRef.current) return
    const point = normalizedPointer(event, stageRef.current)
    if (selectionMode === 'point') {
      const size = 0.22
      setSelection({
        x: clamp(point.x - size / 2, 0, 1 - size),
        y: clamp(point.y - size / 2, 0, 1 - size),
        width: size,
        height: size,
      })
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
      setMessage('Manual fallback completed. Use AI Segment for edge-accurate removal when the provider is configured.')
    } catch (error) {
      setMessage(toErrorMessage(error))
    }
  }

  async function runAiSegmentation() {
    if (!canRunAi) return
    setJobState('submitting')
    setMessage('Submitting object selection to AI segmentation…')
    try {
      const pixels = await selectionToPixelBox(imageDataUrl, selection)
      const job = await submitSegmentation(imageDataUrl, pixels)
      const result = await pollAiJob(job, setJobState)
      const imageUrl = nestedFileUrl(result, 'image')
      if (!imageUrl) throw new Error('The segmentation provider returned no image.')
      setSegmentedImageUrl(imageUrl)
      setSelectedImage(imageUrl)
      setJobState('COMPLETED')
      setMessage('AI removed the environment. Review the isolated object before generating 3D.')
    } catch (error) {
      setJobState('FAILED')
      setMessage(toErrorMessage(error))
    }
  }

  async function runAiReconstruction() {
    const inputImage = segmentedImageUrl || selectedImage || imageDataUrl
    if (!aiCapabilities.configured || !inputImage) return
    setJobState('submitting')
    setMessage('Submitting the isolated object for AI 3D reconstruction…')
    try {
      const job = await submitReconstruction(inputImage)
      const result = await pollAiJob(job, setJobState, 420_000)
      const mesh = nestedFileUrl(result, 'model_mesh') || nestedFileUrl(result, 'pbr_model')
      const rendered = nestedFileUrl(result, 'rendered_image')
      if (!mesh) throw new Error('The reconstruction provider returned no 3D model.')
      setModelUrl(mesh)
      setRenderedPreviewUrl(rendered)
      setGeometryType('ai-mesh')
      setJobState('COMPLETED')
      setMessage('AI mesh created. Enter one or more verified dimensions before releasing the object.')
    } catch (error) {
      setJobState('FAILED')
      setMessage(toErrorMessage(error))
    }
  }

  function saveObject() {
    if (!canSave) return
    try {
      const asset = createObjectAsset({
        name,
        category,
        tags: tags.split(','),
        sourceType: geometryType === 'ai-mesh' ? 'ai-generated' : sourceType,
        geometryType,
        dimensionsMm: { length: lengthMm, width: widthMm, height: heightMm },
        material,
        thumbnailDataUrl: previewImage,
        sourceImageDataUrl: imageDataUrl,
        segmentedImageUrl: segmentedImageUrl || selectedImage || undefined,
        modelUrl: modelUrl || undefined,
        renderedPreviewUrl: renderedPreviewUrl || undefined,
      })
      onSave(asset)
    } catch (error) {
      setMessage(toErrorMessage(error))
    }
  }

  return (
    <section className="workspace-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Phase 1A</p>
          <h2>Camera / Image / Video → Reusable Object Gallery</h2>
          <p>Select any visible object, remove its environment, create a visual 3D object, calibrate it, then save it for later assembly.</p>
        </div>
        <span className="phase-badge">Priority 1</span>
      </div>

      <div className="capture-layout">
        <div className="panel capture-panel">
          <div className="panel__heading">
            <h3>1. Source and object selection</h3>
            <span className="status-label status-label--available">Available</span>
          </div>

          <label className="upload-zone">
            <input accept="image/*,video/*" onChange={handleMediaUpload} type="file" />
            <strong>Upload image or video</strong>
            <span>Images are resized locally. A representative frame is extracted from video.</span>
          </label>

          {imageDataUrl ? (
            <>
              <div className="selection-toolbar">
                <button
                  className={`tool-button ${selectionMode === 'box' ? 'tool-button--active' : ''}`}
                  onClick={() => setSelectionMode('box')}
                  type="button"
                >
                  Box select
                </button>
                <button
                  className={`tool-button ${selectionMode === 'point' ? 'tool-button--active' : ''}`}
                  onClick={() => setSelectionMode('point')}
                  type="button"
                >
                  Point focus
                </button>
                <span>{fileName}</span>
              </div>
              <div
                className="selection-stage"
                onPointerDown={startSelection}
                onPointerMove={updateSelection}
                onPointerUp={finishSelection}
                ref={stageRef}
              >
                <img alt="Uploaded source for object selection" draggable={false} src={imageDataUrl} />
                <span
                  className="selection-box"
                  style={{
                    left: `${selection.x * 100}%`,
                    top: `${selection.y * 100}%`,
                    width: `${selection.width * 100}%`,
                    height: `${selection.height * 100}%`,
                  }}
                />
              </div>
              <div className="button-row">
                <button className="button button--secondary" onClick={() => void createManualSelection()} type="button">
                  Extract selected region
                </button>
                <button
                  className="button button--primary"
                  disabled={!canRunAi || jobState === 'IN_PROGRESS' || jobState === 'submitting'}
                  onClick={() => void runAiSegmentation()}
                  title={canRunAi ? 'Run SAM 2 object segmentation' : 'Configure FAL_KEY on the server to enable AI segmentation.'}
                  type="button"
                >
                  AI remove environment
                </button>
              </div>
            </>
          ) : (
            <div className="empty-state">No media loaded.</div>
          )}
        </div>

        <div className="panel preview-panel">
          <div className="panel__heading">
            <h3>2. 3D generation and review</h3>
            <span className={`status-label ${aiCapabilities.configured ? 'status-label--experimental' : 'status-label--disabled'}`}>
              {aiCapabilities.configured ? 'AI ready' : 'AI key required'}
            </span>
          </div>
          <ObjectPreview
            dimensionsMm={{ length: lengthMm, width: widthMm, height: heightMm }}
            geometryType={geometryType}
            image={previewImage}
            modelUrl={modelUrl}
          />
          <div className="button-row">
            <button
              className="button button--secondary"
              disabled={!previewImage}
              onClick={() => {
                setGeometryType('proxy-box')
                setMessage('Parametric visual proxy created. Calibrate dimensions before saving.')
              }}
              type="button"
            >
              Create 3D proxy
            </button>
            <button
              className="button button--primary"
              disabled={!canRunAi || jobState === 'IN_PROGRESS' || jobState === 'submitting'}
              onClick={() => void runAiReconstruction()}
              title={canRunAi ? 'Generate a GLB mesh through the configured provider' : 'Configure FAL_KEY on the server to enable AI 3D generation.'}
              type="button"
            >
              Generate AI 3D
            </button>
          </div>
          {modelUrl && (
            <a className="model-link" href={modelUrl} rel="noreferrer" target="_blank">
              Open generated GLB model
            </a>
          )}
          <p className={`job-message job-message--${jobState}`} aria-live="polite">{message}</p>
        </div>
      </div>

      <div className="panel properties-panel">
        <div className="panel__heading">
          <h3>3. Static properties and Gallery record</h3>
          <span className="status-label status-label--available">BOM-ready foundation</span>
        </div>
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
        <div className="button-row button-row--end">
          <button className="button button--primary" disabled={!canSave} onClick={saveObject} type="button">
            Save reusable object to Gallery
          </button>
        </div>
      </div>
    </section>
  )
}

function GalleryWorkspace({
  assets,
  onCalibrate,
  onDelete,
  onDuplicate,
  onInsert,
}: {
  assets: ObjectAsset[]
  onCalibrate: (asset: ObjectAsset) => void
  onDelete: (assetId: string) => void
  onDuplicate: (asset: ObjectAsset) => void
  onInsert: (asset: ObjectAsset) => void
}) {
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(() => assets[0]?.id ?? null)
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return assets
    return assets.filter((asset) =>
      [asset.name, asset.category, asset.material, ...asset.tags].join(' ').toLowerCase().includes(normalized),
    )
  }, [assets, query])
  const selected = assets.find((asset) => asset.id === selectedId) ?? filtered[0] ?? null

  useEffect(() => {
    if (selectedId && assets.some((asset) => asset.id === selectedId)) return
    setSelectedId(assets[0]?.id ?? null)
  }, [assets, selectedId])

  function confirmDelete(asset: ObjectAsset) {
    if (!window.confirm(`Delete "${asset.name}" from the Gallery? Existing layout instances will remain.`)) return
    onDelete(asset.id)
  }

  return (
    <section className="workspace-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Phase 1A</p>
          <h2>Reusable Object Gallery</h2>
          <p>Objects are stored independently from scenes so the same captured component can be assembled many times.</p>
        </div>
        <span className="phase-badge">{assets.length} objects</span>
      </div>
      <div className="gallery-toolbar">
        <label>
          <span>Search Gallery</span>
          <input onChange={(event) => setQuery(event.target.value)} placeholder="Name, category, material or tag" value={query} />
        </label>
      </div>

      {selected && (
        <div className="panel gallery-inspector">
          <div className="gallery-inspector__preview">
            <InteractiveThreePreview
              dimensionsMm={selected.dimensionsMm}
              fallbackImage={selected.renderedPreviewUrl || selected.thumbnailDataUrl}
              geometryType={selected.geometryType}
              modelUrl={selected.modelUrl}
            />
          </div>
          <div className="gallery-inspector__details">
            <div className="gallery-card__title">
              <h3>{selected.name}</h3>
              <span className={`status-label ${selected.lifecycle === 'calibrated' ? 'status-label--available' : 'status-label--experimental'}`}>
                {selected.lifecycle}
              </span>
            </div>
            <p>{selected.category} · {selected.geometryType}</p>
            <dl>
              <div><dt>Size</dt><dd>{selected.dimensionsMm.length} × {selected.dimensionsMm.width} × {selected.dimensionsMm.height} mm</dd></div>
              <div><dt>Material</dt><dd>{selected.material}</dd></div>
              <div><dt>Source</dt><dd>{selected.sourceType}</dd></div>
              <div><dt>Revision</dt><dd>{selected.schemaVersion} · reusable asset</dd></div>
            </dl>
            <div className="button-row">
              <button className="button button--primary" onClick={() => onInsert(selected)} type="button">Insert into layout</button>
              <button className="button button--secondary" disabled={selected.lifecycle !== 'draft'} onClick={() => onCalibrate(selected)} type="button">Mark calibrated</button>
              <button className="button button--secondary" onClick={() => onDuplicate(selected)} type="button">Duplicate</button>
              <button className="button button--danger" onClick={() => confirmDelete(selected)} type="button">Delete</button>
            </div>
            {selected.modelUrl && <a className="model-link" href={selected.modelUrl} rel="noreferrer" target="_blank">Open source GLB</a>}
          </div>
        </div>
      )}

      {filtered.length ? (
        <div className="gallery-grid">
          {filtered.map((asset) => (
            <article className={`gallery-card ${selected?.id === asset.id ? 'gallery-card--selected' : ''}`} key={asset.id}>
              <button className="gallery-card__preview-button" onClick={() => setSelectedId(asset.id)} type="button">
                <img alt={`${asset.name} preview`} src={asset.thumbnailDataUrl} />
              </button>
              <div className="gallery-card__body">
                <div className="gallery-card__title">
                  <h3>{asset.name}</h3>
                  <span className="status-label status-label--experimental">{asset.lifecycle}</span>
                </div>
                <p>{asset.category} · {asset.geometryType}</p>
                <div className="button-row">
                  <button className="button button--secondary" onClick={() => setSelectedId(asset.id)} type="button">Review 3D</button>
                  <button className="button button--primary" onClick={() => onInsert(asset)} type="button">Insert</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state">No objects match this search. Create the first object in Camera to 3D.</div>
      )}
    </section>
  )
}

function LayoutWorkspace({
  layout,
  onChange,
  gallery,
  onInsert,
}: {
  layout: LayoutProject
  onChange: (layout: LayoutProject) => void
  gallery: ObjectAsset[]
  onInsert: (asset: ObjectAsset) => void
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{ objectId: string; offsetXPx: number; offsetYPx: number } | null>(null)
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
  const [selectedConveyorId, setSelectedConveyorId] = useState<string>(() => layout.conveyors[0]?.id ?? '')
  const [snapEnabled, setSnapEnabled] = useState(true)
  const [gridMm, setGridMm] = useState(250)
  const selectedObject = layout.objects.find((item) => item.id === selectedObjectId) ?? null
  const selectedConveyor = layout.conveyors.find((item) => item.id === selectedConveyorId) ?? layout.conveyors[0] ?? null
  const connectedRoute = useMemo(() => buildConnectedRoute(layout.conveyors, 64), [layout.conveyors])
  const connectionChecks = useMemo(() => evaluateConveyorConnections(layout.conveyors), [layout.conveyors])

  function commit(next: LayoutProject) {
    onChange({ ...next, updatedAt: new Date().toISOString() })
  }

  function addConveyor(type: ConveyorType) {
    const conveyor = createConveyor(type)
    commit({ ...layout, conveyors: [...layout.conveyors, conveyor] })
    setSelectedObjectId(null)
    setSelectedConveyorId(conveyor.id)
  }

  function updateObject(patch: Partial<SceneObjectInstance>) {
    if (!selectedObject) return
    updateObjectById(selectedObject.id, patch)
  }

  function updateObjectById(objectId: string, patch: Partial<SceneObjectInstance>) {
    commit({
      ...layout,
      objects: layout.objects.map((item) => item.id === objectId ? { ...item, ...patch } : item),
    })
  }

  function updateConveyor(patch: Partial<ConveyorDefinition>) {
    if (!selectedConveyor) return
    commit({
      ...layout,
      conveyors: layout.conveyors.map((item) => item.id === selectedConveyor.id ? { ...item, ...patch } : item),
    })
  }

  function beginObjectDrag(event: ReactPointerEvent<HTMLButtonElement>, instance: SceneObjectInstance) {
    const targetRect = event.currentTarget.getBoundingClientRect()
    dragRef.current = {
      objectId: instance.id,
      offsetXPx: event.clientX - targetRect.left,
      offsetYPx: event.clientY - targetRect.top,
    }
    setSelectedObjectId(instance.id)
    setSelectedConveyorId('')
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  function moveObject(event: ReactPointerEvent<HTMLButtonElement>, objectId: string) {
    const drag = dragRef.current
    const canvas = canvasRef.current
    if (!drag || drag.objectId !== objectId || !canvas) return
    const rect = canvas.getBoundingClientRect()
    const world = canvasPointToWorld(
      {
        xPx: event.clientX - rect.left - drag.offsetXPx,
        yPx: event.clientY - rect.top - drag.offsetYPx,
      },
      { widthPx: rect.width, heightPx: rect.height },
      snapEnabled ? gridMm : 1,
    )
    updateObjectById(objectId, world)
  }

  function finishObjectDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    dragRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  function duplicateSelectedObject() {
    if (!selectedObject) return
    const duplicate = duplicateSceneInstance(selectedObject, snapEnabled ? gridMm : 250)
    commit({ ...layout, objects: [...layout.objects, duplicate] })
    setSelectedObjectId(duplicate.id)
  }

  function deleteSelectedObject() {
    if (!selectedObject) return
    commit({ ...layout, objects: layout.objects.filter((item) => item.id !== selectedObject.id) })
    setSelectedObjectId(null)
  }

  function moveSelectedConveyor(direction: -1 | 1) {
    if (!selectedConveyor) return
    commit({ ...layout, conveyors: reorderConveyor(layout.conveyors, selectedConveyor.id, direction) })
  }

  function deleteSelectedConveyor() {
    if (!selectedConveyor) return
    const next = layout.conveyors.filter((item) => item.id !== selectedConveyor.id)
    commit({ ...layout, conveyors: next })
    setSelectedConveyorId(next[0]?.id ?? '')
  }

  return (
    <section className="workspace-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Phase 1B</p>
          <h2>Mechanical Layout Editor</h2>
          <p>Drag reusable objects on a dimensioned factory grid, snap them to engineering increments, and sequence connected transport modules.</p>
        </div>
        <span className="phase-badge phase-badge--alpha">Layout Alpha+</span>
      </div>

      <div className="layout-toolbar">
        <button
          className={`tool-button ${snapEnabled ? 'tool-button--active' : ''}`}
          onClick={() => setSnapEnabled((value) => !value)}
          type="button"
        >
          Snap {snapEnabled ? 'on' : 'off'}
        </button>
        <label className="layout-grid-control">
          Grid
          <select disabled={!snapEnabled} onChange={(event) => setGridMm(Number(event.target.value))} value={gridMm}>
            <option value={100}>100 mm</option>
            <option value={250}>250 mm</option>
            <option value={500}>500 mm</option>
            <option value={1000}>1000 mm</option>
          </select>
        </label>
        {(['straight', 'curve', 'incline', 'decline', 'spiral', 'buffer'] as const).map((type) => (
          <button className="tool-button" key={type} onClick={() => addConveyor(type)} type="button">+ {type}</button>
        ))}
      </div>

      <div className="editor-layout">
        <div
          className="layout-canvas"
          aria-label="Mechanical layout canvas"
          onClick={() => { setSelectedObjectId(null); setSelectedConveyorId('') }}
          ref={canvasRef}
        >
          <div className="layout-axis layout-axis--x">X 0–10,000 mm</div>
          <div className="layout-axis layout-axis--z">Z 0–7,000 mm</div>
          <svg className="layout-conveyors" viewBox="0 0 600 380" preserveAspectRatio="none">
            {connectedRoute.segments.map((segment, index) => {
              const conveyor = layout.conveyors.find((item) => item.id === segment.conveyorId)
              const check = connectionChecks[index]
              return (
                <g key={segment.conveyorId}>
                  <polyline
                    className={segment.conveyorId === selectedConveyor?.id ? 'conveyor-line conveyor-line--selected' : 'conveyor-line'}
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedObjectId(null)
                      setSelectedConveyorId(segment.conveyorId)
                    }}
                    points={segment.points.map((point) => `${point.x},${point.y}`).join(' ')}
                  />
                  <text className="conveyor-sequence-label" x={segment.start.x + 8} y={segment.start.y - 10}>
                    {index + 1}. {conveyor?.type ?? 'module'}
                  </text>
                  {check && (
                    <circle
                      className={check.compatible ? 'conveyor-connector conveyor-connector--ok' : 'conveyor-connector conveyor-connector--warning'}
                      cx={segment.end.x}
                      cy={segment.end.y}
                      r="6"
                    />
                  )}
                </g>
              )
            })}
          </svg>
          {layout.objects.map((instance) => (
            <button
              className={`scene-object ${instance.id === selectedObjectId ? 'scene-object--selected' : ''}`}
              key={instance.id}
              onClick={(event) => { event.stopPropagation(); setSelectedObjectId(instance.id); setSelectedConveyorId('') }}
              onPointerDown={(event) => beginObjectDrag(event, instance)}
              onPointerMove={(event) => moveObject(event, instance.id)}
              onPointerUp={finishObjectDrag}
              onPointerCancel={finishObjectDrag}
              style={{
                left: `${clamp(instance.xMm / 10000, 0, 0.88) * 100}%`,
                top: `${clamp(instance.zMm / 7000, 0, 0.82) * 100}%`,
                transform: `rotate(${instance.rotationDeg}deg) scale(${instance.scale})`,
              }}
              title={`${instance.name} · X ${instance.xMm} · Z ${instance.zMm} mm`}
              type="button"
            >
              <img alt="" src={instance.thumbnailDataUrl} />
              <span>{instance.name}</span>
            </button>
          ))}
          {!layout.objects.length && <div className="canvas-hint">Insert a Gallery object to start assembly.</div>}
        </div>

        <aside className="editor-properties">
          <h3>Layout properties</h3>
          {selectedObject ? (
            <div className="stacked-fields">
              <strong>{selectedObject.name}</strong>
              <NumberField label="X (mm)" value={selectedObject.xMm} onChange={(value) => updateObject({ xMm: value })} />
              <NumberField label="Z (mm)" value={selectedObject.zMm} onChange={(value) => updateObject({ zMm: value })} />
              <NumberField label="Elevation (mm)" value={selectedObject.elevationMm} onChange={(value) => updateObject({ elevationMm: value })} />
              <NumberField label="Rotation (deg)" value={selectedObject.rotationDeg} onChange={(value) => updateObject({ rotationDeg: value })} />
              <NumberField label="Scale" step={0.05} value={selectedObject.scale} onChange={(value) => updateObject({ scale: Math.max(0.1, value) })} />
              <div className="button-row">
                <button className="button button--secondary" onClick={duplicateSelectedObject} type="button">Duplicate</button>
                <button className="button button--danger" onClick={deleteSelectedObject} type="button">Delete</button>
              </div>
            </div>
          ) : selectedConveyor ? (
            <div className="stacked-fields">
              <strong>{selectedConveyor.name}</strong>
              <Field label="Type"><input disabled value={selectedConveyor.type} /></Field>
              <NumberField label="Length (mm)" value={selectedConveyor.lengthMm} onChange={(value) => updateConveyor({ lengthMm: Math.max(100, value) })} />
              <NumberField label="Width (mm)" value={selectedConveyor.widthMm} onChange={(value) => updateConveyor({ widthMm: Math.max(50, value) })} />
              <NumberField label="Entry elevation (mm)" value={selectedConveyor.entryElevationMm} onChange={(value) => updateConveyor({ entryElevationMm: value })} />
              <NumberField label="Exit elevation (mm)" value={selectedConveyor.exitElevationMm} onChange={(value) => updateConveyor({ exitElevationMm: value })} />
              <NumberField label="Speed (m/s)" step={0.05} value={selectedConveyor.speedMps} onChange={(value) => updateConveyor({ speedMps: Math.max(0.01, value) })} />
              <button className="button button--secondary" onClick={() => updateConveyor({ direction: selectedConveyor.direction === 1 ? -1 : 1 })} type="button">
                Direction: {selectedConveyor.direction === 1 ? 'Forward →' : 'Reverse ←'}
              </button>
              <div className="button-row">
                <button className="button button--secondary" onClick={() => moveSelectedConveyor(-1)} type="button">Move earlier</button>
                <button className="button button--secondary" onClick={() => moveSelectedConveyor(1)} type="button">Move later</button>
                <button className="button button--danger" onClick={deleteSelectedConveyor} type="button">Delete</button>
              </div>
            </div>
          ) : (
            <p>Select an object or conveyor.</p>
          )}

          <h3>Conveyor sequence</h3>
          <div className="conveyor-sequence-list">
            {layout.conveyors.map((conveyor, index) => {
              const check = connectionChecks[index]
              return (
                <button
                  className={conveyor.id === selectedConveyor?.id ? 'conveyor-sequence-item conveyor-sequence-item--selected' : 'conveyor-sequence-item'}
                  key={conveyor.id}
                  onClick={() => { setSelectedObjectId(null); setSelectedConveyorId(conveyor.id) }}
                  type="button"
                >
                  <span>{index + 1}. {conveyor.type}</span>
                  <small>{check ? check.compatible ? 'connected' : `${check.elevationGapMm} mm gap` : 'line end'}</small>
                </button>
              )
            })}
          </div>

          <h3>Quick insert</h3>
          <div className="quick-insert">
            {gallery.slice(0, 4).map((asset) => (
              <button key={asset.id} onClick={() => onInsert(asset)} type="button">
                <img alt="" src={asset.thumbnailDataUrl} />
                <span>{asset.name}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

function RuntimeWorkspace({ conveyors }: { conveyors: ConveyorDefinition[] }) {
  const CONNECTED_LINE_ID = '__connected-line__'
  const [selectedId, setSelectedId] = useState<string>(() => conveyors.length > 1 ? CONNECTED_LINE_ID : conveyors[0]?.id ?? '')
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [speedMultiplier, setSpeedMultiplier] = useState(1)
  const [plannedMinutes, setPlannedMinutes] = useState(480)
  const [downtimeMinutes, setDowntimeMinutes] = useState(35)
  const [idealRatePerMinute, setIdealRatePerMinute] = useState(230)
  const [totalCount, setTotalCount] = useState(94000)
  const [rejectCount, setRejectCount] = useState(1200)
  const frameRef = useRef<number | null>(null)
  const timeRef = useRef<number | null>(null)
  const connectedMode = selectedId === CONNECTED_LINE_ID && conveyors.length > 1
  const selected = connectedMode ? null : conveyors.find((item) => item.id === selectedId) ?? conveyors[0] ?? null
  const route = useMemo(() => buildConnectedRoute(conveyors), [conveyors])
  const nominalLengthM = connectedMode
    ? Math.max(0.5, route.totalLengthMm / 1000)
    : Math.max(0.5, (selected?.lengthMm ?? 500) / 1000)
  const nominalSpeedMps = connectedMode
    ? Math.max(0.01, conveyors.reduce((sum, conveyor) => sum + conveyor.speedMps, 0) / Math.max(1, conveyors.length))
    : Math.max(0.01, selected?.speedMps ?? 0.1)

  useEffect(() => {
    if (!playing || (!selected && !connectedMode)) return
    const tick = (time: number) => {
      const previous = timeRef.current ?? time
      const deltaSeconds = Math.min(0.05, (time - previous) / 1000)
      timeRef.current = time
      setProgress((current) => (current + deltaSeconds * nominalSpeedMps * speedMultiplier / nominalLengthM) % 1)
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      timeRef.current = null
    }
  }, [connectedMode, nominalLengthM, nominalSpeedMps, playing, selected, speedMultiplier])

  if (!selected && !connectedMode) return <div className="empty-state">Create a conveyor in Layout Editor first.</div>

  const productCount = connectedMode
    ? Math.min(18, Math.max(8, conveyors.length * 4))
    : selected?.type === 'buffer' ? Math.min(16, selected.bufferCapacity) : 7
  const spacing = connectedMode ? 0.055 : selected?.type === 'buffer' ? 0.035 : 0.11
  const products = Array.from({ length: productCount }, (_, index) => {
    const point = connectedMode
      ? sampleConnectedRoute(conveyors, progress - index * spacing)
      : sampleConveyorPath(selected as ConveyorDefinition, progress - index * spacing)
    return { ...point, id: `${selectedId}-${index}` }
  })

  const runtimeTitle = connectedMode ? 'CONNECTED LINE' : (selected as ConveyorDefinition).type.toUpperCase()
  const directionLabel = connectedMode ? 'AUTO ROUTE' : (selected as ConveyorDefinition).direction === 1 ? 'FORWARD' : 'REVERSE'
  const entryElevation = connectedMode ? conveyors[0]?.entryElevationMm ?? 0 : (selected as ConveyorDefinition).entryElevationMm
  const exitElevation = connectedMode ? conveyors[conveyors.length - 1]?.exitElevationMm ?? 0 : (selected as ConveyorDefinition).exitElevationMm
  const capacity = connectedMode
    ? conveyors.reduce((sum, conveyor) => sum + conveyor.bufferCapacity, 0)
    : (selected as ConveyorDefinition).bufferCapacity
  const oee = calculateOee({ plannedMinutes, downtimeMinutes, idealRatePerMinute, totalCount, rejectCount })

  return (
    <section className="workspace-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Phase 1C</p>
          <h2>Transport Visual Runtime</h2>
          <p>Verify individual modules or run the full connected conveyor route as one continuous product-flow line.</p>
        </div>
        <span className="phase-badge phase-badge--alpha">Runtime Alpha</span>
      </div>

      <div className="runtime-toolbar">
        <label>
          <span>Route</span>
          <select onChange={(event) => { setSelectedId(event.target.value); setProgress(0) }} value={connectedMode ? CONNECTED_LINE_ID : (selected as ConveyorDefinition).id}>
            {conveyors.length > 1 && <option value={CONNECTED_LINE_ID}>Connected line ({conveyors.length} modules)</option>}
            {conveyors.map((conveyor) => <option key={conveyor.id} value={conveyor.id}>{conveyor.name}</option>)}
          </select>
        </label>
        <button className="button button--primary" onClick={() => setPlaying((value) => !value)} type="button">{playing ? 'Pause' : 'Play'}</button>
        <button className="button button--secondary" onClick={() => { setPlaying(false); setProgress(0) }} type="button">Reset</button>
        <label>
          <span>Simulation speed</span>
          <select onChange={(event) => setSpeedMultiplier(Number(event.target.value))} value={speedMultiplier}>
            <option value={0.5}>0.5×</option>
            <option value={1}>1×</option>
            <option value={2}>2×</option>
            <option value={4}>4×</option>
          </select>
        </label>
      </div>

      <div className="oee-panel">
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

      <div className="runtime-stage">
        <svg role="img" aria-label={`${runtimeTitle} transporting products`} viewBox="0 0 600 380">
          <defs>
            <linearGradient id="belt" x1="0" x2="1">
              <stop offset="0" stopColor="currentColor" stopOpacity="0.25" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          <polyline className="runtime-belt" points={connectedMode ? connectedRoutePolyline(conveyors) : conveyorPathPolyline(selected as ConveyorDefinition)} />
          {products.map((product) => (
            <g className="runtime-product" key={product.id} transform={`translate(${product.x} ${product.y})`}>
              <rect x="-14" y="-9" width="28" height="18" rx="4" />
              <path d="M-8 -3h16M-8 2h16" />
            </g>
          ))}
          <text className="runtime-label" x="24" y="28">
            {runtimeTitle} · {directionLabel} · {nominalSpeedMps.toFixed(2)} m/s
          </text>
          <text className="runtime-label" x="24" y="350">
            Entry {entryElevation} mm → Exit {exitElevation} mm · Capacity {capacity}
          </text>
        </svg>
      </div>
    </section>
  )
}

function InteractiveThreePreview({
  geometryType,
  dimensionsMm,
  modelUrl,
  fallbackImage,
}: {
  geometryType: ObjectGeometryType
  dimensionsMm: ObjectDimensionsMm
  modelUrl?: string
  fallbackImage?: string
}) {
  return (
    <Suspense fallback={<div className="object-preview object-preview--empty">Loading 3D engine…</div>}>
      <LazyThreeObjectPreview
        dimensionsMm={dimensionsMm}
        fallbackImage={fallbackImage}
        geometryType={geometryType}
        modelUrl={modelUrl}
      />
    </Suspense>
  )
}

function ObjectPreview({
  image,
  geometryType,
  modelUrl,
  dimensionsMm,
}: {
  image: string
  geometryType: ObjectGeometryType
  modelUrl: string
  dimensionsMm: { length: number; width: number; height: number }
}) {
  if (!image) return <div className="object-preview object-preview--empty">3D preview appears here</div>
  return (
    <InteractiveThreePreview
      dimensionsMm={dimensionsMm}
      fallbackImage={image}
      geometryType={geometryType}
      modelUrl={modelUrl || undefined}
    />
  )
}

function KpiCard({ label, value, emphasis = false, warning = false }: { label: string; value: string; emphasis?: boolean; warning?: boolean }) {
  return <div className={`kpi-card ${emphasis ? 'kpi-card--emphasis' : ''} ${warning ? 'kpi-card--warning' : ''}`}><span>{label}</span><strong>{value}</strong></div>
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="field"><span>{label}</span>{children}</label>
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
}) {
  return (
    <Field label={label}>
      <input
        min={0}
        onChange={(event) => onChange(Number(event.target.value))}
        step={step}
        type="number"
        value={Number.isFinite(value) ? value : 0}
      />
    </Field>
  )
}

function normalizedPointer(event: ReactPointerEvent, element: HTMLElement): { x: number; y: number } {
  const rect = element.getBoundingClientRect()
  return {
    x: clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y: clamp((event.clientY - rect.top) / rect.height, 0, 1),
  }
}

async function mediaFileToImage(file: File): Promise<{ dataUrl: string; sourceType: 'image-upload' | 'video-frame' }> {
  if (file.type.startsWith('image/')) {
    return { dataUrl: await resizeImageFile(file), sourceType: 'image-upload' }
  }
  if (file.type.startsWith('video/')) {
    return { dataUrl: await extractVideoFrame(file), sourceType: 'video-frame' }
  }
  throw new Error('Unsupported file. Upload an image or video.')
}

async function resizeImageFile(file: File, maxDimension = 1600): Promise<string> {
  const raw = await fileToDataUrl(file)
  const image = await loadImage(raw)
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.9)
}

async function extractVideoFrame(file: File): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const video = document.createElement('video')
    video.muted = true
    video.playsInline = true
    video.src = url
    await once(video, 'loadedmetadata')
    video.currentTime = Math.min(Math.max(0, video.duration * 0.25), 2)
    await once(video, 'seeked')
    const maxDimension = 1600
    const scale = Math.min(1, maxDimension / Math.max(video.videoWidth, video.videoHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale))
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Canvas is unavailable.')
    context.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL('image/jpeg', 0.9)
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function cropToSelection(dataUrl: string, selection: NormalizedSelection): Promise<string> {
  const image = await loadImage(dataUrl)
  const sx = Math.round(selection.x * image.naturalWidth)
  const sy = Math.round(selection.y * image.naturalHeight)
  const sw = Math.max(1, Math.round(selection.width * image.naturalWidth))
  const sh = Math.max(1, Math.round(selection.height * image.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = sw
  canvas.height = sh
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas is unavailable.')
  context.clearRect(0, 0, sw, sh)
  context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh)
  return canvas.toDataURL('image/png')
}

async function selectionToPixelBox(dataUrl: string, selection: NormalizedSelection): Promise<SelectionBox> {
  const image = await loadImage(dataUrl)
  return {
    xMin: Math.round(selection.x * image.naturalWidth),
    yMin: Math.round(selection.y * image.naturalHeight),
    xMax: Math.round((selection.x + selection.width) * image.naturalWidth),
    yMax: Math.round((selection.y + selection.height) * image.naturalHeight),
  }
}

function nestedFileUrl(result: Record<string, unknown>, key: string): string {
  const value = result[key]
  if (!value || typeof value !== 'object') return ''
  const url = (value as { url?: unknown }).url
  return typeof url === 'string' ? url : ''
}

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Unable to read the selected file.'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to decode the image.'))
    image.crossOrigin = 'anonymous'
    image.src = src
  })
}

function once(element: HTMLMediaElement, eventName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const cleanup = () => {
      element.removeEventListener(eventName, success)
      element.removeEventListener('error', failure)
    }
    const success = () => { cleanup(); resolve() }
    const failure = () => { cleanup(); reject(new Error('Unable to read the video.')) }
    element.addEventListener(eventName, success, { once: true })
    element.addEventListener('error', failure, { once: true })
  })
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '')
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function toErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unexpected error.'
}

export const WORKSPACE_FEATURES = FEATURE_CAPABILITIES
