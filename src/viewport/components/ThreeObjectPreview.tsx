import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import type { ObjectDimensionsMm, ObjectGeometryType } from '@/domain/gallery/object-asset'
import { normalizedPreviewDimensions } from '@/viewport/components/preview-geometry'

export interface ThreeObjectPreviewProps {
  geometryType: ObjectGeometryType
  dimensionsMm: ObjectDimensionsMm
  modelUrl?: string
  fallbackImage?: string
  compact?: boolean
}

export function ThreeObjectPreview({
  geometryType,
  dimensionsMm,
  modelUrl,
  fallbackImage,
  compact = false,
}: ThreeObjectPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const { length, width, height } = dimensionsMm
  const [status, setStatus] = useState('Preparing 3D preview…')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let disposed = false
    let frame = 0
    let activeObject: THREE.Object3D | null = null

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0b131d)

    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 1000)
    camera.position.set(2.6, 2, 3.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.1
    renderer.domElement.setAttribute('aria-label', 'Interactive three-dimensional object preview')
    host.replaceChildren(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.minDistance = 0.5
    controls.maxDistance = 20

    scene.add(new THREE.HemisphereLight(0xffffff, 0x263443, 2.4))
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2)
    keyLight.position.set(4, 6, 5)
    scene.add(keyLight)
    const fillLight = new THREE.DirectionalLight(0x9dc8ff, 1.8)
    fillLight.position.set(-4, 2, -3)
    scene.add(fillLight)

    const grid = new THREE.GridHelper(8, 16, 0x3d5a73, 0x24394d)
    grid.position.y = -0.55
    scene.add(grid)

    const resize = () => {
      const width = Math.max(1, host.clientWidth)
      const height = Math.max(1, host.clientHeight)
      renderer.setSize(width, height, false)
      camera.aspect = width / height
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

    const showProxy = (reason?: string) => {
      if (disposed) return
      activeObject = createProxyObject(geometryType, { length, width, height })
      scene.add(activeObject)
      fitCameraToObject(camera, controls, activeObject)
      setFailed(Boolean(reason))
      setStatus(reason ? `${reason} Showing calibrated proxy instead.` : 'Interactive calibrated 3D proxy')
    }

    if (geometryType === 'ai-mesh' && modelUrl) {
      setStatus('Loading generated GLB…')
      const loader = new GLTFLoader()
      loader.setCrossOrigin('anonymous')
      loader.load(
        modelUrl,
        (gltf) => {
          if (disposed) {
            disposeObject(gltf.scene)
            return
          }
          activeObject = gltf.scene
          normalizeObjectScale(activeObject)
          scene.add(activeObject)
          fitCameraToObject(camera, controls, activeObject)
          setFailed(false)
          setStatus('Generated GLB loaded — drag to orbit, scroll to zoom')
        },
        undefined,
        () => showProxy('GLB could not be loaded in this browser or was blocked by CORS.'),
      )
    } else {
      showProxy()
    }

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      observer.disconnect()
      controls.dispose()
      if (activeObject) disposeObject(activeObject)
      renderer.dispose()
      renderer.forceContextLoss()
      host.replaceChildren()
    }
  }, [geometryType, height, length, modelUrl, width])

  return (
    <div className={`three-preview ${compact ? 'three-preview--compact' : ''}`}>
      <div className="three-preview__canvas" ref={hostRef} />
      <div className={`three-preview__status ${failed ? 'three-preview__status--warning' : ''}`} aria-live="polite">
        {status}
      </div>
      {failed && fallbackImage && (
        <img className="three-preview__fallback" alt="Fallback object preview" src={fallbackImage} />
      )}
    </div>
  )
}

function createProxyObject(
  geometryType: ObjectGeometryType,
  dimensionsMm: ObjectDimensionsMm,
): THREE.Object3D {
  const [x, y, z] = normalizedPreviewDimensions(dimensionsMm)
  const geometry = geometryType === 'proxy-cylinder'
    ? new THREE.CylinderGeometry(Math.max(x, z) * 0.42, Math.max(x, z) * 0.42, y, 48)
    : new THREE.BoxGeometry(x, y, z)
  const material = new THREE.MeshStandardMaterial({
    color: 0x56a9f8,
    metalness: 0.08,
    roughness: 0.52,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.position.y = y / 2 - 0.5

  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry),
    new THREE.LineBasicMaterial({ color: 0xd9edff, transparent: true, opacity: 0.55 }),
  )
  edges.position.copy(mesh.position)

  const group = new THREE.Group()
  group.add(mesh, edges)
  return group
}

function normalizeObjectScale(object: THREE.Object3D): void {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const longest = Math.max(size.x, size.y, size.z, 0.001)
  object.scale.multiplyScalar(1.8 / longest)
  const normalizedBox = new THREE.Box3().setFromObject(object)
  const center = normalizedBox.getCenter(new THREE.Vector3())
  object.position.sub(center)
  const bottom = normalizedBox.min.y - center.y
  object.position.y -= bottom + 0.5
}

function fitCameraToObject(
  camera: THREE.PerspectiveCamera,
  controls: OrbitControls,
  object: THREE.Object3D,
): void {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  const maxSize = Math.max(size.x, size.y, size.z, 0.5)
  const distance = maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) * 1.65
  camera.position.set(center.x + distance, center.y + distance * 0.7, center.z + distance)
  camera.near = Math.max(distance / 100, 0.01)
  camera.far = distance * 100
  camera.updateProjectionMatrix()
  controls.target.copy(center)
  controls.update()
}

function disposeObject(object: THREE.Object3D): void {
  object.traverse((child) => {
    if (!(child instanceof THREE.Mesh || child instanceof THREE.LineSegments)) return
    child.geometry?.dispose()
    const materials = Array.isArray(child.material) ? child.material : [child.material]
    for (const material of materials) {
      if (!material) continue
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose()
      }
      material.dispose()
    }
  })
}
