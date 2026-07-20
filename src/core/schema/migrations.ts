/**
 * Versioned schema-migration boundary required from the first release.
 * Concrete migrations are registered only when a later schema version exists.
 */
export interface SchemaMigration<TInput = unknown, TOutput = unknown> {
  fromVersion: string
  toVersion: string
  migrate(input: TInput): TOutput
}

export interface SchemaMigrationRegistry {
  register(migration: SchemaMigration): void
  canMigrate(fromVersion: string, toVersion: string): boolean
  migrate(input: unknown, fromVersion: string, toVersion: string): unknown
}

/** Version 1.0.0 is the first schema, so no concrete migrations exist yet. */
export const INITIAL_SCHEMA_MIGRATIONS: readonly SchemaMigration[] = []
