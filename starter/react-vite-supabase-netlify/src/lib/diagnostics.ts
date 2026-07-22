import { appMeta } from './app-meta';
import { env } from './env';
import { getAppHealth } from './health';
import { supabase } from './supabase';

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

export async function collectSafeDiagnostics() {
  const [{ data: sessionData }, health] = await Promise.all([
    supabase.auth.getSession(),
    getAppHealth(),
  ]);

  return redactSensitive({
    release: {
      ...appMeta,
      gitCommitSha: env.gitCommitSha,
    },
    configuration: {
      appName: 'present',
      appEnvironment: 'present',
      appVersion: 'present',
      gitCommitSha: 'present',
      buildTimestamp: 'present',
      supabaseUrl: 'present',
      supabaseAnonKey: 'present',
    },
    supabase: {
      host: new URL(env.supabaseUrl).host,
      signedIn: Boolean(sessionData.session),
      health,
    },
    generatedAt: new Date().toISOString(),
  });
}
