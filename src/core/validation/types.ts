/**
 * A single human-readable validation issue, identified by object path.
 *
 * Example: `physical.mass.value: Mass is required before release.`
 */
export interface ValidationIssue {
  path: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
}

export function ok(): ValidationResult {
  return { valid: true, issues: [] }
}

export function fail(issues: ValidationIssue[]): ValidationResult {
  return { valid: issues.length === 0, issues }
}

export function combine(...results: ValidationIssue[][]): ValidationResult {
  const issues = results.flat()
  return { valid: issues.length === 0, issues }
}

/** Formats an issue the way the work order requires: `path: message`. */
export function formatIssue(issue: ValidationIssue): string {
  return `${issue.path}: ${issue.message}`
}
