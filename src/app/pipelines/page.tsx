'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Spinner from '@/components/ui/Spinner';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import { api } from '@/lib/api';

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
  status?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString() : 'N/A';

export default function PipelinesPage() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [triggerPipelineId, setTriggerPipelineId] = useState<string | null>(null);
  const [triggerType, setTriggerType] = useState<'plan' | 'apply' | 'destroy' | 'validate'>('plan');
  const [triggering, setTriggering] = useState(false);

  const fetchPipelines = async () => {
    setLoading(true);
    setError(null);
    const response = await api.get<PaginatedResponse<Pipeline>>('/api/pipelines?page=1&pageSize=20');
    if (response.error) {
      setError(response.error);
    } else {
      setPipelines(response.data?.items ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPipelines();
  }, []);

  const triggerRun = async () => {
    if (!triggerPipelineId) return;
    setTriggering(true);
    const response = await api.post<Run>(`/api/pipelines/${triggerPipelineId}/trigger`, {
      type: triggerType
    });
    if (response.error) {
      setError(response.error);
    } else {
      setTriggerPipelineId(null);
    }
    setTriggering(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pipelines</h1>
          <p className="text-sm text-muted-foreground">Manage Terraform pipeline definitions.</p>
        </div>
        <Link href="/pipelines/new">
          <Button>Create pipeline</Button>
        </Link>
      </div>

      {error && <p className="text-error">{error}</p>}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Pipeline List</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          {pipelines.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground">
              No pipelines yet. Create one to get started.
            </div>
          ) : (
            pipelines.map(pipeline => (
              <div key={pipeline.id} className="flex flex-col justify-between gap-3 rounded-md border border-border p-4 md:flex-row md:items-center">
                <div>
                  <p className="text-base font-medium">{pipeline.name || 'Untitled Pipeline'}</p>
                  <p className="text-sm text-muted-foreground">
                    Repo: {pipeline.repo_url || pipeline.repoUrl || 'N/A'} | Branch: {pipeline.repo_branch || pipeline.repoBranch || 'N/A'}
                  </p>
                  <p className="text-xs text-muted-foreground">Created {formatDate(pipeline.created_at || pipeline.createdAt)}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={pipeline.status === 'active' ? 'success' : 'warning'}>
                    {pipeline.status ?? 'unknown'}
                  </Badge>
                  <Link href={`/pipelines/${pipeline.id}`} className="text-sm text-primary hover:underline">
                    Details
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setTriggerPipelineId(pipeline.id)}
                  >
                    Trigger run
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Modal
        open={!!triggerPipelineId}
        title="Trigger Run"
        onClose={() => setTriggerPipelineId(null)}
      >
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Run Type</label>
            <select
              className="w-full rounded-md border border-border px-3 py-2 text-sm"
              value={triggerType}
              onChange={event => setTriggerType(event.target.value as typeof triggerType)}
            >
              <option value="plan">Plan</option>
              <option value="apply">Apply</option>
              <option value="validate">Validate</option>
              <option value="destroy">Destroy</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setTriggerPipelineId(null)}>
              Cancel
            </Button>
            <Button onClick={triggerRun} loading={triggering}>
              Trigger
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
