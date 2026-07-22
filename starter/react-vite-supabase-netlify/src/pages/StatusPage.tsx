import { useCallback, useEffect, useState } from 'react';
import { appMeta } from '../lib/app-meta';
import { getAppHealth, type AppHealth } from '../lib/health';

const initialHealth: AppHealth = {
  status: 'unknown',
  serverTime: null,
  migrationMarker: null,
  checkedAt: new Date().toISOString(),
};

export function StatusPage() {
  const [health, setHealth] = useState<AppHealth>(initialHealth);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    setHealth(await getAppHealth());
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>{appMeta.name} status</h1>
      <p>
        Overall status: <strong>{loading ? 'checking' : health.status}</strong>
      </p>

      <dl>
        <dt>Environment</dt>
        <dd>{appMeta.environment}</dd>

        <dt>Version</dt>
        <dd>{appMeta.version}</dd>

        <dt>Commit</dt>
        <dd><code>{appMeta.shortCommitSha}</code></dd>

        <dt>Build timestamp</dt>
        <dd>{appMeta.buildTimestamp}</dd>

        <dt>Supabase</dt>
        <dd>{health.status}</dd>

        <dt>Migration marker</dt>
        <dd>{health.migrationMarker ?? 'unknown'}</dd>

        <dt>Server time</dt>
        <dd>{health.serverTime ?? 'unknown'}</dd>

        <dt>Last checked</dt>
        <dd>{health.checkedAt}</dd>
      </dl>

      {health.message ? <p role="status">{health.message}</p> : null}
      <button type="button" onClick={() => void refresh()} disabled={loading}>
        {loading ? 'Checking…' : 'Refresh status'}
      </button>
    </main>
  );
}
