import type { EquipmentRecord } from '@/domain/equipment/equipment-record'

const EQUIPMENT_RECORDS_KEY = 'engineering1.equipment-records.v1'

export function loadEquipmentRecords(): EquipmentRecord[] {
  try {
    const value = globalThis.localStorage?.getItem(EQUIPMENT_RECORDS_KEY)
    return value ? (JSON.parse(value) as EquipmentRecord[]) : []
  } catch {
    return []
  }
}

export function saveEquipmentRecords(records: readonly EquipmentRecord[]): void {
  try {
    globalThis.localStorage?.setItem(EQUIPMENT_RECORDS_KEY, JSON.stringify(records))
  } catch {
    // Storage can be unavailable in private browsing or locked-down environments.
  }
}

export function exportEquipmentRecords(records: readonly EquipmentRecord[]): string {
  return JSON.stringify({ schemaVersion: '1.0.0', records }, null, 2)
}
