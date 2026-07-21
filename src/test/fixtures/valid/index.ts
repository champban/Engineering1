import type { CoreObject } from '@/core/schema/core-object'
import { cookieFixture } from './cookie'
import { motorFixture } from './motor'
import { beltFixture } from './belt'
import { platformFixture } from './platform'

export interface NamedFixture {
  key: string
  label: string
  object: CoreObject
}

export const validFixtures: NamedFixture[] = [
  { key: 'cookie', label: 'Cookie product', object: cookieFixture },
  { key: 'motor', label: 'Electric motor', object: motorFixture },
  { key: 'belt', label: 'Conveyor belt', object: beltFixture },
  { key: 'platform', label: 'Support platform', object: platformFixture },
]

export { cookieFixture, motorFixture, beltFixture, platformFixture }
