import type { ObjectAsset } from '@/domain/gallery/object-asset'
import { createId } from '@/domain/gallery/object-asset'

export const EQUIPMENT_RECORD_SCHEMA_VERSION = '1.0.0'

export type EngineeringRecordKind = 'equipment' | 'product-format' | 'infrastructure' | 'generic'
export type ProcurementStatus = 'concept' | 'rfq' | 'ordered' | 'received' | 'installed' | 'commissioned'
export type Criticality = 'A' | 'B' | 'C'
export type CurrencyCode = 'THB' | 'EUR' | 'USD'
export type UtilityType = 'electrical' | 'compressed-air' | 'gas' | 'water' | 'steam' | 'vacuum' | 'network' | 'other'
export type DocumentType = 'datasheet' | 'drawing' | 'manual' | 'certificate' | 'spare-parts' | 'other'
export type DocumentStatus = 'draft' | 'review' | 'approved' | 'obsolete'

export interface UtilityRequirement {
  id: string
  type: UtilityType
  value: number
  unit: string
  note: string
}

export interface BomLine {
  id: string
  itemNo: string
  partNumber: string
  description: string
  quantity: number
  unit: string
  manufacturer: string
  supplier: string
  criticality: Criticality
  sparePart: boolean
  unitCost: number
  currency: CurrencyCode
}

export interface EquipmentDocument {
  id: string
  title: string
  type: DocumentType
  revision: string
  status: DocumentStatus
  url: string
  note: string
}

export interface EquipmentRecord {
  schemaVersion: string
  id: string
  assetId: string
  recordKind: EngineeringRecordKind
  equipmentTag: string
  manufacturer: string
  model: string
  serialNumber: string
  supplier: string
  procurementStatus: ProcurementStatus
  designRatePerMinute: number
  installedPowerKw: number
  voltageV: number
  phaseCount: number
  frequencyHz: number
  compressedAirNlMin: number
  purchaseCost: number
  currency: CurrencyCode
  leadTimeWeeks: number
  utilities: UtilityRequirement[]
  bom: BomLine[]
  documents: EquipmentDocument[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface EquipmentRecordInput {
  assetId: string
  recordKind?: EngineeringRecordKind
  equipmentTag?: string
  manufacturer?: string
  model?: string
}

export interface BomSummary {
  totalLines: number
  totalQuantity: number
  criticalALines: number
  sparePartLines: number
  valueByCurrency: Record<CurrencyCode, number>
}

export interface CompletenessResult {
  ratio: number
  completed: number
  total: number
  missing: string[]
}

export function createEquipmentRecord(input: EquipmentRecordInput): EquipmentRecord {
  const now = new Date().toISOString()
  return {
    schemaVersion: EQUIPMENT_RECORD_SCHEMA_VERSION,
    id: createId('eng'),
    assetId: input.assetId,
    recordKind: input.recordKind ?? 'equipment',
    equipmentTag: input.equipmentTag?.trim() ?? '',
    manufacturer: input.manufacturer?.trim() ?? '',
    model: input.model?.trim() ?? '',
    serialNumber: '',
    supplier: '',
    procurementStatus: 'concept',
    designRatePerMinute: 0,
    installedPowerKw: 0,
    voltageV: 400,
    phaseCount: 3,
    frequencyHz: 50,
    compressedAirNlMin: 0,
    purchaseCost: 0,
    currency: 'EUR',
    leadTimeWeeks: 0,
    utilities: [],
    bom: [],
    documents: [],
    notes: '',
    createdAt: now,
    updatedAt: now,
  }
}

export function touchEquipmentRecord(record: EquipmentRecord): EquipmentRecord {
  return { ...record, updatedAt: new Date().toISOString() }
}

export function createBomLine(index = 1): BomLine {
  return {
    id: createId('bom'),
    itemNo: String(index).padStart(3, '0'),
    partNumber: '',
    description: 'New component',
    quantity: 1,
    unit: 'pc',
    manufacturer: '',
    supplier: '',
    criticality: 'C',
    sparePart: false,
    unitCost: 0,
    currency: 'EUR',
  }
}

export function createEquipmentDocument(): EquipmentDocument {
  return {
    id: createId('doc'),
    title: 'New document',
    type: 'datasheet',
    revision: 'A',
    status: 'draft',
    url: '',
    note: '',
  }
}

export function createUtilityRequirement(type: UtilityType = 'electrical'): UtilityRequirement {
  const defaults: Record<UtilityType, { unit: string; note: string }> = {
    electrical: { unit: 'kW', note: 'Connected load' },
    'compressed-air': { unit: 'Nl/min', note: 'ISO 8573-1 quality to be defined' },
    gas: { unit: 'kW', note: 'Thermal input' },
    water: { unit: 'L/min', note: 'Water demand' },
    steam: { unit: 'kg/h', note: 'Steam demand' },
    vacuum: { unit: 'm³/h', note: 'Vacuum demand' },
    network: { unit: 'port', note: 'Industrial Ethernet connection' },
    other: { unit: '-', note: '' },
  }
  return {
    id: createId('utility'),
    type,
    value: 0,
    unit: defaults[type].unit,
    note: defaults[type].note,
  }
}

export function summarizeBom(lines: readonly BomLine[]): BomSummary {
  const valueByCurrency: Record<CurrencyCode, number> = { THB: 0, EUR: 0, USD: 0 }
  let totalQuantity = 0
  let criticalALines = 0
  let sparePartLines = 0

  for (const line of lines) {
    const quantity = sanitizeNonNegative(line.quantity)
    const unitCost = sanitizeNonNegative(line.unitCost)
    totalQuantity += quantity
    valueByCurrency[line.currency] += quantity * unitCost
    if (line.criticality === 'A') criticalALines += 1
    if (line.sparePart) sparePartLines += 1
  }

  return {
    totalLines: lines.length,
    totalQuantity,
    criticalALines,
    sparePartLines,
    valueByCurrency,
  }
}

export function calculateEngineeringCompleteness(record: EquipmentRecord): CompletenessResult {
  const checks: readonly [string, boolean][] = [
    ['equipment tag', Boolean(record.equipmentTag.trim())],
    ['manufacturer', Boolean(record.manufacturer.trim())],
    ['model', Boolean(record.model.trim())],
    ['supplier', Boolean(record.supplier.trim())],
    ['design rate', record.recordKind !== 'equipment' || record.designRatePerMinute > 0],
    ['installed power', record.recordKind !== 'equipment' || record.installedPowerKw > 0],
    ['lead time', record.leadTimeWeeks > 0],
    ['utilities', record.utilities.length > 0],
    ['BOM', record.bom.length > 0],
    ['approved document', record.documents.some((document) => document.status === 'approved')],
  ]
  const missing = checks.filter(([, complete]) => !complete).map(([label]) => label)
  const completed = checks.length - missing.length
  return {
    ratio: checks.length ? completed / checks.length : 0,
    completed,
    total: checks.length,
    missing,
  }
}

export function createDemoEquipmentRecords(assets: readonly ObjectAsset[]): EquipmentRecord[] {
  return assets.slice(0, 3).map((asset, index) => {
    const lowerName = asset.name.toLowerCase()
    if (lowerName.includes('gearmotor')) return createGearmotorDemo(asset)
    if (lowerName.includes('cookie')) return createCookieFormatDemo(asset)
    if (lowerName.includes('tree')) return createInfrastructureDemo(asset)
    return createGenericDemo(asset, index)
  })
}

function createGearmotorDemo(asset: ObjectAsset): EquipmentRecord {
  const record = createEquipmentRecord({
    assetId: asset.id,
    recordKind: 'equipment',
    equipmentTag: 'DRV-001',
    manufacturer: 'SEW-EURODRIVE',
    model: 'R37 DRN80M4',
  })
  return {
    ...record,
    supplier: 'Example drive supplier',
    procurementStatus: 'commissioned',
    installedPowerKw: 0.75,
    voltageV: 400,
    phaseCount: 3,
    frequencyHz: 50,
    purchaseCost: 1450,
    currency: 'EUR',
    leadTimeWeeks: 10,
    utilities: [
      { ...createUtilityRequirement('electrical'), value: 0.75, note: '400 VAC, 3 phase, 50 Hz' },
      { ...createUtilityRequirement('network'), value: 1, note: 'Motor starter or VFD network point' },
    ],
    bom: [
      {
        ...createBomLine(1),
        partNumber: 'R37-DRN80M4',
        description: 'Helical gearmotor 0.75 kW',
        manufacturer: 'SEW-EURODRIVE',
        supplier: 'Example drive supplier',
        criticality: 'A',
        sparePart: true,
        unitCost: 1450,
      },
      {
        ...createBomLine(2),
        partNumber: 'MNT-R37',
        description: 'Mounting hardware set',
        manufacturer: 'Local fabrication',
        supplier: 'Example fabricator',
        criticality: 'C',
        unitCost: 85,
      },
    ],
    documents: [
      {
        ...createEquipmentDocument(),
        title: 'Gearmotor technical datasheet',
        type: 'datasheet',
        revision: '1',
        status: 'approved',
      },
      {
        ...createEquipmentDocument(),
        title: 'Installation and maintenance manual',
        type: 'manual',
        revision: '1',
        status: 'review',
      },
    ],
    notes: 'Demo engineering record. Verify selected ratio, torque, mounting position, and food-zone suitability before release.',
  }
}

function createCookieFormatDemo(asset: ObjectAsset): EquipmentRecord {
  const record = createEquipmentRecord({
    assetId: asset.id,
    recordKind: 'product-format',
    equipmentTag: 'FMT-COOKIE-095',
    manufacturer: 'Internal product specification',
    model: 'Single pack 95 mm',
  })
  return {
    ...record,
    supplier: 'Packaging development',
    procurementStatus: 'commissioned',
    designRatePerMinute: 230,
    purchaseCost: 0,
    currency: 'EUR',
    leadTimeWeeks: 4,
    utilities: [],
    bom: [
      {
        ...createBomLine(1),
        partNumber: 'FILM-095-DEMO',
        description: 'Printed flow-wrap film specification',
        quantity: 1,
        unit: 'spec',
        manufacturer: 'Approved film converter',
        supplier: 'Packaging supplier',
        criticality: 'A',
      },
    ],
    documents: [
      {
        ...createEquipmentDocument(),
        title: 'Product and pack format drawing',
        type: 'drawing',
        revision: 'A',
        status: 'approved',
      },
    ],
    notes: 'Demo format record for product transformation and line-speed validation.',
  }
}

function createInfrastructureDemo(asset: ObjectAsset): EquipmentRecord {
  const record = createEquipmentRecord({
    assetId: asset.id,
    recordKind: 'infrastructure',
    equipmentTag: 'LAND-TREE-001',
    manufacturer: 'Landscape placeholder',
    model: 'Tree envelope 3.5 m',
  })
  return {
    ...record,
    supplier: 'Landscape contractor',
    procurementStatus: 'concept',
    purchaseCost: 22000,
    currency: 'THB',
    leadTimeWeeks: 6,
    utilities: [
      { ...createUtilityRequirement('water'), value: 2, note: 'Indicative irrigation demand' },
    ],
    bom: [
      {
        ...createBomLine(1),
        partNumber: 'TREE-35-DEMO',
        description: 'Landscape tree placeholder',
        manufacturer: 'Local nursery',
        supplier: 'Landscape contractor',
        criticality: 'C',
        unitCost: 22000,
        currency: 'THB',
      },
    ],
    documents: [
      {
        ...createEquipmentDocument(),
        title: 'Planting zone concept',
        type: 'drawing',
        revision: 'A',
        status: 'draft',
      },
    ],
    notes: 'Placeholder only. Root zone, underground services, drainage, and maintenance clearance require civil review.',
  }
}

function createGenericDemo(asset: ObjectAsset, index: number): EquipmentRecord {
  const record = createEquipmentRecord({
    assetId: asset.id,
    recordKind: 'generic',
    equipmentTag: `OBJ-${String(index + 1).padStart(3, '0')}`,
    manufacturer: asset.manufacturer ?? 'Unknown',
    model: asset.model ?? asset.name,
  })
  return {
    ...record,
    leadTimeWeeks: 1,
    notes: 'Generic demo record created from the reusable Gallery asset.',
  }
}

function sanitizeNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0
}
