import { appMeta } from './app-meta';
import { env } from './env';
import { getAppHealth } from './health';
import { redactSensitive } from './redact';
import { supabase } from './supabase';

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
