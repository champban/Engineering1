import { supabase } from './supabase';

export type HealthState = 'operational' | 'degraded' | 'unavailable' | 'unknown';

export interface AppHealth {
  status: HealthState;
  serverTime: string | null;
  migrationMarker: string | null;
  checkedAt: string;
  message?: string;
}

const HEALTH_TIMEOUT_MS = 5000;

export async function getAppHealth(): Promise<AppHealth> {
  const checkedAt = new Date().toISOString();

  try {
    const query = supabase
      .from('app_health')
      .select('status, server_time, migration_marker')
      .eq('id', true)
      .maybeSingle();

    const timeout = new Promise<never>((_, reject) => {
      window.setTimeout(() => reject(new Error('Health check timed out')), HEALTH_TIMEOUT_MS);
    });

    const { data, error } = await Promise.race([query, timeout]);

    if (error) {
      return {
        status: 'degraded',
        serverTime: null,
        migrationMarker: null,
        checkedAt,
        message: 'Dependency check failed.',
      };
    }

    if (!data) {
      return {
        status: 'unknown',
        serverTime: null,
        migrationMarker: null,
        checkedAt,
        message: 'Health marker is unavailable.',
      };
    }

    return {
      status: data.status === 'operational' ? 'operational' : 'degraded',
      serverTime: data.server_time ?? null,
      migrationMarker: data.migration_marker ?? null,
      checkedAt,
    };
  } catch {
    return {
      status: 'unavailable',
      serverTime: null,
      migrationMarker: null,
      checkedAt,
      message: 'Dependency check is unavailable.',
    };
  }
}
