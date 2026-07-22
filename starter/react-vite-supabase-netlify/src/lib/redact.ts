const sensitiveKeyPattern = /(token|secret|password|authorization|cookie|service.?role|private.?key|anon.?key)/i;

export function redactSensitive(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactSensitive);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, child]) => [
        key,
        sensitiveKeyPattern.test(key) ? '[REDACTED]' : redactSensitive(child),
      ]),
    );
  }

  if (typeof value === 'string') {
    return value
      .replace(/Bearer\s+[A-Za-z0-9._~-]+/gi, 'Bearer [REDACTED]')
      .replace(/([?&](?:token|key|secret|password)=)[^&#\s]+/gi, '$1[REDACTED]');
  }

  return value;
}
