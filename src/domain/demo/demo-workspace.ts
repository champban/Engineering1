import type { ObjectAsset } from '@/domain/gallery/object-asset'
import type {
  ConveyorDefinition,
  LayoutProject,
  SceneObjectInstance,
} from '@/domain/layout/layout'
import type { WorkspaceSnapshot } from '@/storage/workspace-store'

const DEMO_TIMESTAMP = '2026-07-21T00:00:00.000Z'

export function createDemoWorkspace(): WorkspaceSnapshot & { layout: LayoutProject } {
  const gallery = createDemoGallery()
  return {
    gallery,
    layout: createDemoLayout(gallery),
  }
}

export function createDemoGallery(): ObjectAsset[] {
  return [
    {
      schemaVersion: '1.0.0',
      id: 'demo_cookie_single_pack',
      name: 'Cookie Single Pack',
      category: 'Product / Package',
      tags: ['demo', 'cookie', 'packaging', 'product'],
      lifecycle: 'calibrated',
      sourceType: 'manual',
      geometryType: 'proxy-box',
      dimensionsMm: { length: 95, width: 55, height: 15 },
      material: 'Printed flexible film',
      massKg: 0.009,
      thumbnailDataUrl: createThumbnail({
        label: 'COOKIE PACK',
        subtitle: '95 × 55 × 15 mm',
        shape: 'pack',
      }),
      manufacturer: 'Demo object',
      model: 'Single pack',
      partNumber: 'DEMO-PACK-001',
      createdAt: DEMO_TIMESTAMP,
      updatedAt: DEMO_TIMESTAMP,
    },
    {
      schemaVersion: '1.0.0',
      id: 'demo_gearmotor_075kw',
      name: 'Gearmotor 0.75 kW',
      category: 'Mechanical Component',
      tags: ['demo', 'motor', 'gearbox', 'drive'],
      lifecycle: 'calibrated',
      sourceType: 'manual',
      geometryType: 'proxy-cylinder',
      dimensionsMm: { length: 420, width: 260, height: 280 },
      material: 'Painted steel and aluminium',
      massKg: 24,
      thumbnailDataUrl: createThumbnail({
        label: 'GEARMOTOR',
        subtitle: '0.75 kW demo component',
        shape: 'motor',
      }),
      manufacturer: 'Demo manufacturer',
      model: 'GM-075',
      partNumber: 'DEMO-GM-075',
      createdAt: DEMO_TIMESTAMP,
      updatedAt: DEMO_TIMESTAMP,
    },
    {
      schemaVersion: '1.0.0',
      id: 'demo_landscape_tree',
      name: 'Landscape Tree Placeholder',
      category: 'Landscape',
      tags: ['demo', 'tree', 'landscape', 'outdoor'],
      lifecycle: 'calibrated',
      sourceType: 'manual',
      geometryType: 'proxy-cylinder',
      dimensionsMm: { length: 1800, width: 1800, height: 3500 },
      material: 'Living plant',
      massKg: null,
      thumbnailDataUrl: createThumbnail({
        label: 'TREE',
        subtitle: 'Outdoor layout object',
        shape: 'tree',
      }),
      manufacturer: 'Local nursery',
      model: 'Generic shade tree',
      partNumber: 'DEMO-TREE-001',
      createdAt: DEMO_TIMESTAMP,
      updatedAt: DEMO_TIMESTAMP,
    },
  ]
}

export function createDemoLayout(gallery = createDemoGallery()): LayoutProject {
  const assetById = new Map(gallery.map((asset) => [asset.id, asset]))
  const objects: SceneObjectInstance[] = [
    createDemoInstance(assetById.get('demo_cookie_single_pack'), {
      id: 'demo_inst_cookie',
      xMm: 1500,
      zMm: 1100,
      elevationMm: 900,
      rotationDeg: 0,
      scale: 1,
    }),
    createDemoInstance(assetById.get('demo_gearmotor_075kw'), {
      id: 'demo_inst_gearmotor',
      xMm: 4300,
      zMm: 1700,
      elevationMm: 250,
      rotationDeg: 15,
      scale: 1,
    }),
    createDemoInstance(assetById.get('demo_landscape_tree'), {
      id: 'demo_inst_tree',
      xMm: 7800,
      zMm: 5000,
      elevationMm: 0,
      rotationDeg: 0,
      scale: 0.75,
    }),
  ]

  return {
    id: 'demo_layout_getting_started',
    name: 'Getting Started Demo Layout',
    objects,
    conveyors: createDemoConveyors(),
    updatedAt: DEMO_TIMESTAMP,
  }
}

function createDemoInstance(
  asset: ObjectAsset | undefined,
  transform: Omit<SceneObjectInstance, 'assetId' | 'name' | 'thumbnailDataUrl'>,
): SceneObjectInstance {
  if (!asset) throw new Error('Demo asset is missing.')
  return {
    ...transform,
    assetId: asset.id,
    name: asset.name,
    thumbnailDataUrl: asset.thumbnailDataUrl,
  }
}

function createDemoConveyors(): ConveyorDefinition[] {
  return [
    {
      id: 'demo_cv_straight',
      name: 'Demo Straight Conveyor',
      type: 'straight',
      direction: 1,
      lengthMm: 5000,
      widthMm: 450,
      entryElevationMm: 900,
      exitElevationMm: 900,
      radiusMm: 1000,
      turns: 1,
      speedMps: 0.35,
      bufferCapacity: 12,
      productType: 'cookie-pack',
    },
    {
      id: 'demo_cv_curve',
      name: 'Demo 90° Curve Conveyor',
      type: 'curve',
      direction: 1,
      lengthMm: 2400,
      widthMm: 450,
      entryElevationMm: 900,
      exitElevationMm: 900,
      radiusMm: 1200,
      turns: 1,
      speedMps: 0.3,
      bufferCapacity: 10,
      productType: 'cookie-pack',
    },
    {
      id: 'demo_cv_spiral',
      name: 'Demo Spiral Conveyor',
      type: 'spiral',
      direction: 1,
      lengthMm: 12000,
      widthMm: 500,
      entryElevationMm: 900,
      exitElevationMm: 3500,
      radiusMm: 1800,
      turns: 2.5,
      speedMps: 0.28,
      bufferCapacity: 28,
      productType: 'carton',
    },
    {
      id: 'demo_cv_buffer',
      name: 'Demo Buffer Conveyor',
      type: 'buffer',
      direction: 1,
      lengthMm: 8000,
      widthMm: 600,
      entryElevationMm: 900,
      exitElevationMm: 900,
      radiusMm: 1000,
      turns: 1,
      speedMps: 0.22,
      bufferCapacity: 40,
      productType: 'cookie-pack',
    },
  ]
}

function createThumbnail({
  label,
  subtitle,
  shape,
}: {
  label: string
  subtitle: string
  shape: 'pack' | 'motor' | 'tree'
}): string {
  const shapeMarkup = {
    pack: '<rect x="78" y="62" width="164" height="88" rx="14" fill="#d7a44c"/><path d="M88 76h144M88 136h144" stroke="#4f3c1f" stroke-width="6"/><circle cx="160" cy="106" r="23" fill="#8a5a28"/>',
    motor: '<rect x="92" y="74" width="124" height="72" rx="18" fill="#6e8aa3"/><circle cx="102" cy="110" r="42" fill="#47657f"/><circle cx="102" cy="110" r="22" fill="#b8c7d4"/><rect x="214" y="94" width="48" height="32" rx="6" fill="#a6b4bf"/><rect x="142" y="54" width="52" height="22" rx="5" fill="#526b80"/>',
    tree: '<rect x="151" y="116" width="18" height="52" rx="6" fill="#7b5737"/><circle cx="160" cy="82" r="58" fill="#4d8d63"/><circle cx="122" cy="104" r="34" fill="#5ca271"/><circle cx="198" cy="105" r="36" fill="#3f7854"/>',
  }[shape]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220"><rect width="320" height="220" rx="18" fill="#111b27"/><path d="M20 180h280" stroke="#2a3c51" stroke-width="2"/>${shapeMarkup}<text x="20" y="196" fill="#eef5fb" font-family="Arial,sans-serif" font-size="17" font-weight="700">${label}</text><text x="300" y="196" text-anchor="end" fill="#9eb0c2" font-family="Arial,sans-serif" font-size="11">${subtitle}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}
