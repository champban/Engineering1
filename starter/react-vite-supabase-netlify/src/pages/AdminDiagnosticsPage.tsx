import { useCallback, useEffect, useState } from 'react';
import { collectSafeDiagnostics } from '../lib/diagnostics';

interface AdminDiagnosticsPageProps {
  isAdmin: boolean;
  repositoryName: string;
  productionBranch?: string;
}

export function AdminDiagnosticsPage({
  isAdmin,
  repositoryName,
  productionBranch = 'main',
}: AdminDiagnosticsPageProps) {
  const [report, setReport] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  const refresh = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    setReport({
      repository: repositoryName,
      productionBranch,
      ...(await collectSafeDiagnostics() as Record<string, unknown>),
    });
    setLoading(false);
  }, [isAdmin, productionBranch, repositoryName]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!isAdmin) {
    return (
      <main style={{ maxWidth: 760, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
        <h1>Diagnostics unavailable</h1>
        <p>You do not have permission to view this page.</p>
      </main>
    );
  }

  const copyReport = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
    setCopyStatus('Safe diagnostic report copied.');
  };

  return (
    <main style={{ maxWidth: 960, margin: '0 auto', padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Admin diagnostics</h1>
      <p>
        This page must also be protected by the application route guard and database/API authorization.
        The <code>isAdmin</code> prop alone is not a security boundary.
      </p>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <button type="button" onClick={() => void refresh()} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh diagnostics'}
        </button>
        <button type="button" onClick={() => void copyReport()} disabled={!report}>
          Copy safe report
        </button>
        <a href="/status">Open status page</a>
      </div>

      {copyStatus ? <p role="status">{copyStatus}</p> : null}

      <pre style={{ overflow: 'auto', padding: 16, background: '#f4f4f4', borderRadius: 8 }}>
        {report ? JSON.stringify(report, null, 2) : 'No diagnostic report available.'}
      </pre>
    </main>
  );
}
