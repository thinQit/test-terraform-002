'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import { api } from '@/lib/api';

interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  uptime_seconds: number;
}

interface Pipeline {
  id: string;
  name?: string;
  repo_url?: string;
  repoUrl?: string;
  repo_branch?: string;
  repoBranch?: string;
  terraform_version?: string;
  terraformVersion?: string;
  status?: 'active' | 'disabled';
  created_at?: string;
  createdAt?: string;
}

interface Run {
  id: string;
  pipeline_id?: string;
  pipelineId?: string;
  status?: 'queued' | 'running' | 'succeeded' | 'failed' | 'cancelled';
  type?: 'plan' | 'apply' | 'destroy' | 'validate';
  start_time?: string;
  startTime?: string;
  end_time?: string;
  endTime?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

const statusVariant = (status?: string) => {
  switch (status) {
    case 'succeeded':
      return 'success';
    case 'failed':
    case 'down':
      return 'error';
    case 'running':
    case 'queued':
      return 'warning';
    case 'degraded':
      return 'warning';
    default:
      return 'secondary';
  }
};

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString() : 'N/A';

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const [healthRes, pipelineRes, runRes] = await Promise.all([
        api.get<HealthResponse>('/api/health'),
        api.get<PaginatedResponse<Pipeline>>('/api/pipelines?page=1&pageSize=5'),
        api.get<PaginatedResponse<Run>>('/api/runs?page=1&pageSize=8')
      ]);

      if (healthRes.error || pipelineRes.error || runRes.error) {
        setError(healthRes.error || pipelineRes.error || runRes.error || 'Failed to load dashboard');
      } else {
        setHealth(healthRes.data);
        setPipelines(pipelineRes.data?.items ?? []);
        setRuns(runRes.data?.items ?? []);
      }
      setLoading(false);
    };

    load();
  }, []);

  const summary = useMemo(() => {
    if (!runs.length) {
      return { total: 0, successRate: 0, failed: 0 };
    }
    const total = runs.length;
    const succeeded = runs.filter(run => run.status === 'succeeded').length;
    const failed = runs.filter(run => run.status === 'failed').length;
    return { total, successRate: Math.round((succeeded / total) * 100), failed };
  }, [runs]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </CardHeader>
        <CardContent>
          <p className="text-error">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Monitor pipeline health and recent activity.</p>
        </div>
        <Link href="/pipelines/new">
          <Button>Create pipeline</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-muted-foreground">Service Health</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            <Badge variant={statusVariant(health?.status)}>
              {health?.status ?? 'unknown'}
            </Badge>
            <p className="text-sm">Version: {health?.version ?? 'N/A'}</p>
            <p className="text-sm">Uptime: {health ? `${Math.round(health.uptime_seconds / 60)} min` : 'N/A'}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-muted-foreground">Run Success Rate</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{summary.successRate}%</p>
            <p className="text-sm text-muted-foreground">{summary.failed} failed runs in recent activity</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <h2 className="text-sm font-medium text-muted-foreground">Active Pipelines</h2>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{pipelines.length}</p>
            <p className="text-sm text-muted-foreground">tracked in your workspace</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Runs</h2>
              <Link className="text-sm text-primary hover:underline" href="/pipelines">
                View pipelines
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {runs.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent runs yet.</p>
            ) : (
              runs.map(run => (
                <div key={run.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">Run {run.id.slice(0, 8)}</p>
                    <p className="text-xs text-muted-foreground">
                      Started {formatDate(run.start_time || run.startTime)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusVariant(run.status)}>{run.status ?? 'unknown'}</Badge>
                    <Link href={`/runs/${run.id}`} className="text-sm text-primary hover:underline">
                      Details
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Pipelines Requiring Attention</h2>
              <Link className="text-sm text-primary hover:underline" href="/pipelines">
                Manage
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipelines.length === 0 ? (
              <p className="text-sm text-muted-foreground">No pipelines configured.</p>
            ) : (
              pipelines.map(pipeline => (
                <div key={pipeline.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{pipeline.name || 'Untitled Pipeline'}</p>
                    <p className="text-xs text-muted-foreground">
                      Repo: {pipeline.repo_url || pipeline.repoUrl || 'N/A'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={pipeline.status === 'active' ? 'success' : 'warning'}>
                      {pipeline.status ?? 'unknown'}
                    </Badge>
                    <Link href={`/pipelines/${pipeline.id}`} className="text-sm text-primary hover:underline">
                      View
                    </Link>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
