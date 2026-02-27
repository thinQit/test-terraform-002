'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface Run {
  id: string;
  pipeline_id?: string;
  pipelineId?: string;
  type?: string;
  status?: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  initiated_by?: string;
  start_time?: string;
  startTime?: string;
  end_time?: string;
  endTime?: string;
  exit_code?: number;
  logs_url?: string;
  plan_output?: string;
  apply_output?: string;
}

interface LogsResponse {
  logs: string;
  more?: boolean;
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString() : 'N/A';

export default function RunDetailPage() {
  const params = useParams();
  const runId = params?.id as string;
  const [run, setRun] = useState<Run | null>(null);
  const [logs, setLogs] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [logsLoading, setLogsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      const response = await api.get<Run>(`/api/runs/${runId}`);
      if (response.error) {
        setError(response.error);
        setRun(null);
      } else {
        setRun(response.data);
      }
      setLoading(false);
    };

    if (runId) {
      load();
    }
  }, [runId]);

  const fetchLogs = async () => {
    setLogsLoading(true);
    const response = await api.get<LogsResponse>(`/api/runs/${runId}/logs`);
    if (response.error) {
      setError(response.error);
    } else {
      setLogs(response.data?.logs ?? '');
    }
    setLogsLoading(false);
  };

  useEffect(() => {
    if (runId) {
      fetchLogs();
    }
  }, [runId]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!run) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Run Detail</h1>
        </CardHeader>
        <CardContent>
          <p className="text-error">{error ?? 'Run not found.'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Run {run.id.slice(0, 8)}</h1>
          <p className="text-sm text-muted-foreground">View run logs, output, and metadata.</p>
        </div>
        <Badge variant={run.status === 'succeeded' ? 'success' : run.status === 'failed' ? 'error' : 'warning'}>
          {run.status ?? 'unknown'}
        </Badge>
      </div>

      {error && <p className="text-error">{error}</p>}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Run Metadata</h2>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Type</p>
            <p className="text-base font-medium">{run.type ?? 'plan'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Initiated by</p>
            <p className="text-base font-medium">{run.initiated_by ?? 'system'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Start time</p>
            <p className="text-base font-medium">{formatDate(run.start_time || run.startTime)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End time</p>
            <p className="text-base font-medium">{formatDate(run.end_time || run.endTime)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Exit code</p>
            <p className="text-base font-medium">{run.exit_code ?? 'N/A'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Logs</h2>
            <Button variant="secondary" size="sm" onClick={fetchLogs} loading={logsLoading}>
              Refresh logs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {logs ? (
            <pre className="max-h-[400px] overflow-auto rounded-md bg-muted p-4 text-xs text-foreground">
              {logs}
            </pre>
          ) : (
            <p className="text-sm text-muted-foreground">No logs available yet.</p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Plan Output</h2>
          </CardHeader>
          <CardContent>
            {run.plan_output ? (
              <pre className="max-h-[300px] overflow-auto rounded-md bg-muted p-4 text-xs text-foreground">
                {run.plan_output}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">No plan output recorded.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Apply Output</h2>
          </CardHeader>
          <CardContent>
            {run.apply_output ? (
              <pre className="max-h-[300px] overflow-auto rounded-md bg-muted p-4 text-xs text-foreground">
                {run.apply_output}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">No apply output recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
