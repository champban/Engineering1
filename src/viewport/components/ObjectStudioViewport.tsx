import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type {
  ObjectStudioDocument,
  StudioNode,
  StudioTool,
  StudioTransform,
  StudioVector3,
} from '@/domain/studio/object-studio'

export interface ObjectStudioViewportProps {
  document: ObjectStudioDocument
  activeTool: StudioTool
  cameraView: 'iso' | 'front' | 'right' | 'top'
  viewVersion: number
  onSelectNode: (nodeId: string | null) => void
  onTransformNode: (nodeId: string, transform: StudioTransform) => void
  onMeasure: (startMm: StudioVector3, endMm: StudioVector3) => void
}

export function ObjectStudioViewport({
  document,
  activeTool,
  cameraView,
  viewVersion,
  onSelectNode,
  onTransformNode,
  onMeasure,
}: ObjectStudioViewportProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('Ready')

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let frame = 0
    let transformControl: TransformControls | null = null
    const measurementPoints: THREE.Vector3[] = []
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(document.background)

    const aspect = Math.max(1, host.clientWidth) / Math.max(1, host.clientHeight)
    const camera: THREE.PerspectiveCamera | THREE.OrthographicCamera = document.projection === 'orthographic'
      ? new THREE.OrthographicCamera(-4 * aspect, 4 * aspect, 4, -4, 0.01, 200)
      : new THREE.PerspectiveCamera(42, aspect, 0.01, 200)

    const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true })
    renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.05
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.domElement.tabIndex = 0
    renderer.domElement.setAttribute('aria-label', 'Engineering1 full three-dimensional object editor')
    host.replaceChildren(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.screenSpacePanning = true
    controls.minDistance = 0.15
    controls.maxDistance = 80
    controls.enableRotate = activeTool !== 'pan' && activeTool !== 'measure'
    controls.enablePan = activeTool === 'pan' || activeTool === 'orbit' || activeTool === 'select'
    controls.mouseButtons.LEFT = activeTool === 'pan' ? THREE.MOUSE.PAN : THREE.MOUSE.ROTATE

    addLighting(scene, document.lightingPreset, document.lightIntensity)

    const gridSizeM = Math.max(10, document.gridMm * 40 / 1000)
    const gridDivisions = Math.max(10, Math.round(gridSizeM * 1000 / Math.max(1, document.gridMm)))
    const grid = new THREE.GridHelper(gridSizeM, Math.min(gridDivisions, 100), 0x4c6d8c, 0x263b50)
    grid.position.y = 0
    scene.add(grid)

    const axes = new THREE.AxesHelper(Math.max(1, gridSizeM * 0.12))
    scene.add(axes)

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSizeM, gridSizeM),
      new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide }),
    )
    ground.rotation.x = -Math.PI / 2
    ground.name = '__measurement_ground__'
    scene.add(ground)

    const nodeObjects = new Map<string, THREE.Object3D>()
    const selectable: THREE.Object3D[] = []
    const textureLoader = new THREE.TextureLoader()
    const gltfLoader = new GLTFLoader()

    for (const node of document.nodes) {
      if (!node.visible) continue
      const object = createNodeObject(node, textureLoader)
      object.userData.nodeId = node.id
      applyTransform(object, node.transform)
      scene.add(object)
      nodeObjects.set(node.id, object)
      selectable.push(object)

      if (node.modelUrl && node.primitive === 'asset') {
        gltfLoader.load(node.modelUrl, (gltf) => {
          if (disposed) {
            disposeObject(gltf.scene)
            return
          }
          const placeholder = nodeObjects.get(node.id)
          if (!placeholder) return
          scene.remove(placeholder)
          disposeObject(placeholder)
          const loaded = gltf.scene
          loaded.userData.nodeId = node.id
          normalizeLoadedObject(loaded, node)
          applyMaterialToObject(loaded, createThreeMaterial(node, textureLoader))
          applyTransform(loaded, node.transform)
          scene.add(loaded)
          nodeObjects.set(node.id, loaded)
          selectable.push(loaded)
          if (document.selectedNodeId === node.id) attachTransform(loaded, node)
          setStatus('Generated model loaded')
        }, undefined, () => setStatus('Model URL unavailable; calibrated proxy remains active'))
      }
    }

    for (const measurement of document.measurements) {
      const start = vectorMmToWorld(measurement.startMm)
      const end = vectorMmToWorld(measurement.endMm)
      const geometry = new THREE.BufferGeometry().setFromPoints([start, end])
      const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xffc857 }))
      scene.add(line)
      const midpoint = start.clone().lerp(end, 0.5)
      const marker = new THREE.Mesh(
        new THREE.SphereGeometry(0.025, 16, 12),
        new THREE.MeshBasicMaterial({ color: 0xffc857 }),
      )
      marker.position.copy(midpoint)
      scene.add(marker)
    }

    const selectedObject = document.selectedNodeId ? nodeObjects.get(document.selectedNodeId) : undefined
    if (selectedObject) attachTransform(selectedObject, document.nodes.find((node) => node.id === document.selectedNodeId))

    function attachTransform(object: THREE.Object3D, node: StudioNode | undefined) {
      if (!node || node.locked || !['move', 'rotate', 'scale'].includes(activeTool)) return
      transformControl?.dispose()
      transformControl = new TransformControls(camera, renderer.domElement)
      transformControl.setMode(activeTool as 'translate' | 'rotate' | 'scale')
      if (activeTool === 'move') transformControl.setMode('translate')
      transformControl.setTranslationSnap(document.snapEnabled ? document.gridMm / 1000 : null)
      transformControl.setRotationSnap(document.snapEnabled ? THREE.MathUtils.degToRad(5) : null)
      transformControl.setScaleSnap(document.snapEnabled ? 0.05 : null)
      transformControl.attach(object)
      transformControl.addEventListener('dragging-changed', (event) => {
        controls.enabled = !event.value
      })
      transformControl.addEventListener('mouseUp', () => {
        onTransformNode(node.id, readTransform(object))
      })
      scene.add(transformControl.getHelper())
    }

    setCameraView(camera, controls, cameraView, document.nodes)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()

    const handlePointerDown = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 + 1
      raycaster.setFromCamera(pointer, camera)

      if (activeTool === 'measure') {
        const hits = raycaster.intersectObjects([...selectable, ground], true)
        const hit = hits[0]
        if (!hit) return
        measurementPoints.push(hit.point.clone())
        setStatus(measurementPoints.length === 1 ? 'Select the second measurement point' : 'Measurement captured')
        if (measurementPoints.length === 2) {
          onMeasure(vectorWorldToMm(measurementPoints[0]), vectorWorldToMm(measurementPoints[1]))
          measurementPoints.length = 0
        }
        return
      }

      if (['select', 'paint', 'move', 'rotate', 'scale'].includes(activeTool)) {
        const hits = raycaster.intersectObjects(selectable, true)
        const hit = hits[0]
        if (!hit) {
          onSelectNode(null)
          return
        }
        let current: THREE.Object3D | null = hit.object
        while (current && !current.userData.nodeId) current = current.parent
        const nodeId = current?.userData.nodeId as string | undefined
        if (nodeId) onSelectNode(nodeId)
      }
    }

    renderer.domElement.addEventListener('pointerdown', handlePointerDown)

    const resize = () => {
      const width = Math.max(1, host.clientWidth)
      const height = Math.max(1, host.clientHeight)
      renderer.setSize(width, height, false)
      if (camera instanceof THREE.PerspectiveCamera) {
        camera.aspect = width / height
      } else {
        const nextAspect = width / height
        camera.left = -4 * nextAspect
        camera.right = 4 * nextAspect
      }
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(host)
    resize()

    const renderLoop = () => {
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(renderLoop)
    }
    frame = requestAnimationFrame(renderLoop)
    setStatus(statusForTool(activeTool))

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown)
      transformControl?.dispose()
      controls.dispose()
      scene.traverse((object) => disposeObject(object))
      renderer.dispose()
      renderer.forceContextLoss()
      host.replaceChildren()
    }
  }, [activeTool, cameraView, document, onMeasure, onSelectNode, onTransformNode, viewVersion])

  return (
    <div className={`object-studio-viewport object-studio-viewport--${activeTool}`}>
      <div className="object-studio-viewport__host" ref={hostRef} />
      <div className="object-studio-viewport__status">{status}</div>
      <div className="object-studio-viewport__axis"><span className="axis-x">X</span><span className="axis-y">Y</span><span className="axis-z">Z</span></div>
    </div>
  )
}

function createNodeObject(node: StudioNode, textureLoader: THREE.TextureLoader): THREE.Object3D {
  const dimensions = {
    x: Math.max(0.001, node.dimensionsMm.length / 1000),
    y: Math.max(0.001, node.dimensionsMm.height / 1000),
    z: Math.max(0.001, node.dimensionsMm.width / 1000),
  }
  let geometry: THREE.BufferGeometry
  switch (node.primitive) {
    case 'cylinder':
      geometry = new THREE.CylinderGeometry(Math.max(dimensions.x, dimensions.z) / 2, Math.max(dimensions.x, dimensions.z) / 2, dimensions.y, 48)
      break
    case 'sphere':
      geometry = new THREE.SphereGeometry(0.5, 48, 32)
      break
    case 'plane':
      geometry = new THREE.BoxGeometry(dimensions.x, Math.max(0.005, dimensions.y), dimensions.z)
      break
    default:
      geometry = new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z)
  }
  const material = createThreeMaterial(node, textureLoader)
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = node.name
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.position.y = dimensions.y / 2
  if (node.primitive === 'sphere') {
    mesh.scale.set(dimensions.x, dimensions.y, dimensions.z)
    mesh.position.y = dimensions.y / 2
  }
  const group = new THREE.Group()
  group.add(mesh)
  group.userData.nodeId = node.id
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xdcefff, transparent: true, opacity: 0.34 }),
  )
  edges.position.copy(mesh.position)
  if (node.primitive === 'sphere') edges.scale.copy(mesh.scale)
  group.add(edges)
  return group
}

function createThreeMaterial(node: StudioNode, textureLoader: THREE.TextureLoader): THREE.MeshStandardMaterial {
  const material = new THREE.MeshStandardMaterial({
    color: new THREE.Color(node.material.baseColor),
    metalness: node.material.metalness,
    roughness: node.material.roughness,
    opacity: node.material.opacity,
    transparent: node.material.opacity < 1,
    side: THREE.DoubleSide,
  })
  if (node.material.textureDataUrl) {
    const texture = textureLoader.load(node.material.textureDataUrl)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.repeat.set(Math.max(0.01, node.material.repeatU), Math.max(0.01, node.material.repeatV))
    texture.rotation = THREE.MathUtils.degToRad(node.material.rotationDeg)
    texture.center.set(0.5, 0.5)
    texture.wrapS = wrapMode(node.material.wrapMode)
    texture.wrapT = wrapMode(node.material.wrapMode)
    material.map = texture
  }
  return material
}

function wrapMode(mode: StudioNode['material']['wrapMode']): THREE.Wrapping {
  if (mode === 'clamp') return THREE.ClampToEdgeWrapping
  if (mode === 'mirror') return THREE.MirroredRepeatWrapping
  return THREE.RepeatWrapping
}

function addLighting(scene: THREE.Scene, preset: ObjectStudioDocument['lightingPreset'], intensity: number): void {
  const scale = Math.max(0, intensity)
  scene.add(new THREE.HemisphereLight(0xffffff, 0x263443, (preset === 'warehouse' ? 1.4 : 2.1) * scale))
  const key = new THREE.DirectionalLight(preset === 'sunlight' ? 0xfff2cf : 0xffffff, (preset === 'inspection' ? 4.2 : 3.1) * scale)
  key.position.set(preset === 'sunlight' ? 8 : 5, 9, preset === 'sunlight' ? 4 : 6)
  key.castShadow = true
  scene.add(key)
  const fill = new THREE.DirectionalLight(0x9dc8ff, (preset === 'inspection' ? 2.4 : 1.4) * scale)
  fill.position.set(-5, 4, -4)
  scene.add(fill)
  if (preset === 'warehouse') {
    for (let x = -4; x <= 4; x += 4) {
      const light = new THREE.PointLight(0xe8f3ff, 5 * scale, 12)
      light.position.set(x, 5, 0)
      scene.add(light)
    }
  }
}

function applyTransform(object: THREE.Object3D, transform: StudioTransform): void {
  object.position.set(transform.positionMm.x / 1000, transform.positionMm.y / 1000, transform.positionMm.z / 1000)
  object.rotation.set(
    THREE.MathUtils.degToRad(transform.rotationDeg.x),
    THREE.MathUtils.degToRad(transform.rotationDeg.y),
    THREE.MathUtils.degToRad(transform.rotationDeg.z),
  )
  object.scale.set(transform.scale.x, transform.scale.y, transform.scale.z)
}

function readTransform(object: THREE.Object3D): StudioTransform {
  return {
    positionMm: { x: object.position.x * 1000, y: object.position.y * 1000, z: object.position.z * 1000 },
    rotationDeg: {
      x: THREE.MathUtils.radToDeg(object.rotation.x),
      y: THREE.MathUtils.radToDeg(object.rotation.y),
      z: THREE.MathUtils.radToDeg(object.rotation.z),
    },
    scale: { x: object.scale.x, y: object.scale.y, z: object.scale.z },
  }
}

function normalizeLoadedObject(object: THREE.Object3D, node: StudioNode): void {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const target = new THREE.Vector3(node.dimensionsMm.length / 1000, node.dimensionsMm.height / 1000, node.dimensionsMm.width / 1000)
  object.scale.set(target.x / Math.max(size.x, 0.001), target.y / Math.max(size.y, 0.001), target.z / Math.max(size.z, 0.001))
  const normalized = new THREE.Box3().setFromObject(object)
  const center = normalized.getCenter(new THREE.Vector3())
  object.position.sub(center)
  object.position.y -= normalized.min.y - center.y
}

function applyMaterialToObject(object: THREE.Object3D, material: THREE.Material): void {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) child.material = material
  })
}

function setCameraView(
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera,
  controls: OrbitControls,
  view: 'iso' | 'front' | 'right' | 'top',
  nodes: readonly StudioNode[],
): void {
  const visible = nodes.filter((node) => node.visible)
  const maxDimensionM = Math.max(2, ...visible.flatMap((node) => [node.dimensionsMm.length, node.dimensionsMm.width, node.dimensionsMm.height]).map((value) => value / 1000))
  const distance = maxDimensionM * 4.5
  const target = new THREE.Vector3(0, maxDimensionM * 0.4, 0)
  const positions = {
    iso: new THREE.Vector3(distance, distance * 0.75, distance),
    front: new THREE.Vector3(0, maxDimensionM * 0.6, distance),
    right: new THREE.Vector3(distance, maxDimensionM * 0.6, 0),
    top: new THREE.Vector3(0.001, distance, 0.001),
  }
  camera.position.copy(positions[view])
  camera.lookAt(target)
  controls.target.copy(target)
  controls.update()
}

function vectorMmToWorld(value: StudioVector3): THREE.Vector3 {
  return new THREE.Vector3(value.x / 1000, value.y / 1000, value.z / 1000)
}

function vectorWorldToMm(value: THREE.Vector3): StudioVector3 {
  return { x: value.x * 1000, y: value.y * 1000, z: value.z * 1000 }
}

function statusForTool(tool: StudioTool): string {
  const messages: Record<StudioTool, string> = {
    select: 'Select objects; drag background to orbit',
    move: 'Move tool active — use the XYZ gizmo',
    rotate: 'Rotate tool active — use the rotation rings',
    scale: 'Scale tool active — use the scale handles',
    paint: 'Paint tool active — select an object, then edit its surface on the right',
    measure: 'Measure tool active — select two points',
    orbit: 'Orbit tool active',
    pan: 'Pan tool active',
    line: '2D line tool is visible as an experimental capability',
    rectangle: '2D rectangle tool is visible as an experimental capability',
    circle: '2D circle tool is visible as an experimental capability',
    'push-pull': 'Push/Pull is planned for editable topology',
    offset: 'Offset is planned for editable topology',
    section: 'Section plane is planned',
    boolean: 'Boolean operations are planned',
  }
  return messages[tool]
}

function disposeObject(object: THREE.Object3D): void {
  if (!(object instanceof THREE.Mesh || object instanceof THREE.Line || object instanceof THREE.LineSegments)) return
  object.geometry?.dispose()
  const materialValue = object.material
  const materials = Array.isArray(materialValue) ? materialValue : materialValue ? [materialValue] : []
  for (const material of materials) {
    for (const value of Object.values(material)) {
      if (value instanceof THREE.Texture) value.dispose()
    }
    material.dispose()
  }
}
