export type FeatureStatus =
  | 'available'
  | 'experimental'
  | 'planned'
  | 'disabled'

export interface FeatureCapability {
  id: string
  label: string
  status: FeatureStatus
  targetPhase?: string
  reason?: string
}

export const FEATURE_CAPABILITIES: readonly FeatureCapability[] = [
  { id: 'camera.upload', label: 'Upload image or video', status: 'available' },
  { id: 'camera.object-selection', label: 'Select target object', status: 'available' },
  { id: 'camera.ai-segmentation', label: 'AI environment removal', status: 'experimental', targetPhase: '1A' },
  { id: 'camera.ai-reconstruction', label: 'AI image-to-3D', status: 'experimental', targetPhase: '1A' },
  { id: 'gallery.object-library', label: 'Reusable object gallery', status: 'available' },
  { id: 'layout.assembly', label: 'Mechanical layout assembly', status: 'experimental', targetPhase: '1B' },
  { id: 'runtime.transport', label: 'Transport visual runtime', status: 'experimental', targetPhase: '1C' },
  {
    id: 'engineering.equipment-data',
    label: 'Equipment engineering data, BOM, and documents',
    status: 'experimental',
    targetPhase: '2A',
  },
  {
    id: 'hmi.editor',
    label: 'HMI/SCADA editor',
    status: 'planned',
    targetPhase: 'Automation',
    reason: 'The control-screen editor is intentionally locked until its runtime and tag model are verified.',
  },
  {
    id: 'automation.plc',
    label: 'PLC simulation',
    status: 'planned',
    targetPhase: 'Virtual commissioning',
    reason: 'PLC execution and live connection are outside Phase 1.',
  },
  {
    id: 'camera.mesh-to-cad',
    label: 'Mesh-to-parametric CAD',
    status: 'planned',
    targetPhase: 'AI CAD',
    reason: 'Generated visual meshes require a later verified CAD-conversion workflow.',
  },
]

export function getCapability(id: string): FeatureCapability {
  const capability = FEATURE_CAPABILITIES.find((item) => item.id === id)
  if (!capability) {
    return { id, label: id, status: 'disabled', reason: 'Capability is not registered.' }
  }
  return capability
}

export function isCapabilityInteractive(capability: FeatureCapability): boolean {
  return capability.status === 'available' || capability.status === 'experimental'
}
