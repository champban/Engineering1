import { describe, expect, it } from 'vitest';
import { redactSensitive } from './diagnostics';

describe('redactSensitive', () => {
  it('redacts sensitive object keys recursively', () => {
    const result = redactSensitive({
      user: { name: 'Example', accessToken: 'secret-token' },
      service_role_key: 'secret-key',
      status: 'operational',
    });

    expect(result).toEqual({
      user: { name: 'Example', accessToken: '[REDACTED]' },
      service_role_key: '[REDACTED]',
      status: 'operational',
    });
  });

  it('redacts bearer tokens and secret query parameters in strings', () => {
    const result = redactSensitive(
      'Authorization: Bearer abc.def.ghi https://example.test?token=secret&mode=safe',
    );

    expect(result).toBe(
      'Authorization: Bearer [REDACTED] https://example.test?token=[REDACTED]&mode=safe',
    );
  });
});
