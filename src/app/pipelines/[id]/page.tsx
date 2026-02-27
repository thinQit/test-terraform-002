'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Spinner from '@/components/ui/Spinner';
import { api } from '@/lib/api';

interface Pipeline {
  id: string;
  name?: string;
  repo_url?: string;
  repoUrl?: string;
  repo_branch?: string;
  repoBranch?: string;
  path?: string;
  terraform_version?: string;
  terraformVersion?: string;
  variables?: Record<string, string>;
  status?: 'active' | 'disabled';
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
}

interface Run {
  id: string;
  status?: string;
  type?: string;
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

const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleString() : 'N/A';

export default function PipelineDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pipelineId = params?.id as string;

  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDelete, setShowDelete] = useState(false);
  const [triggerType, setTriggerType] = useState<'plan' | 'apply' | 'destroy' | 'validate'>('plan');
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      const [pipelineRes, runsRes] = await Promise.all([
        api.get<Pipeline>(`/api/pipelines/${pipelineId}`),
        api.get<PaginatedResponse<Run>>(`/api/runs?pipeline_id=${pipelineId}&page=1&pageSize=10`)
      ]);

      if (pipelineRes.error || runsRes.error) {
        setError(pipelineRes.error || runsRes.error || 'Failed to load pipeline');
      } else {
        setPipeline(pipelineRes.data);
        setRuns(runsRes.data?.items ?? []);
      }
      setLoading(false);
    };

    if (pipelineId) {
      load();
    }
  }, [pipelineId]);

  const updatePipeline = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!pipeline) return;
    setSaving(true);
    setError(null);
    const response = await api.put<Pipeline>(`/api/pipelines/${pipeline.id}`, {
      name: pipeline.name,
      repo_url: pipeline.repo_url ?? pipeline.repoUrl,
      repo_branch: pipeline.repo_branch ?? pipeline.repoBranch,
      path: pipeline.path,
      terraform_version: pipeline.terraform_version ?? pipeline.terraformVersion,
      status: pipeline.status
    });
    if (response.error) {
      setError(response.error);
    } else {
      setPipeline(response.data);
    }
    setSaving(false);
  };

  const triggerRun = async () => {
    if (!pipeline) return;
    setTriggering(true);
    const response = await api.post<Run>(`/api/pipelines/${pipeline.id}/trigger`, {
      type: triggerType
    });
    if (response.error) {
      setError(response.error);
    } else {
      const updatedRuns = await api.get<PaginatedResponse<Run>>(`/api/runs?pipeline_id=${pipeline.id}&page=1&pageSize=10`);
      setRuns(updatedRuns.data?.items ?? runs);
    }
    setTriggering(false);
  };

  const deletePipeline = async () => {
    if (!pipeline) return;
    const response = await api.delete<{ success: boolean }>(`/api/pipelines/${pipeline.id}`);
    if (response.error) {
      setError(response.error);
    } else {
      router.push('/pipelines');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!pipeline) {
    return (
      <Card>
        <CardHeader>
          <h1 className="text-xl font-semibold">Pipeline</h1>
        </CardHeader>
        <CardContent>
          <p className="text-error">{error ?? 'Pipeline not found.'}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{pipeline.name || 'Pipeline Detail'}</h1>
          <p className="text-sm text-muted-foreground">Manage pipeline settings and runs.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={pipeline.status === 'active' ? 'success' : 'warning'}>
            {pipeline.status ?? 'unknown'}
          </Badge>
          <Button variant="secondary" onClick={triggerRun} loading={triggering}>
            Trigger run
          </Button>
          <Button variant="destructive" onClick={() => setShowDelete(true)}>
            Delete
          </Button>
        </div>
      </div>

      {error && <p className="text-error">{error}</p>}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Pipeline Settings</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={updatePipeline}>
            <Input
              label="Pipeline Name"
              value={pipeline.name ?? ''}
              onChange={event => setPipeline(prev => prev ? { ...prev, name: event.target.value } : prev)}
              required
            />
            <Input
              label="Repository URL"
              value={pipeline.repo_url ?? pipeline.repoUrl ?? ''}
              onChange={event => setPipeline(prev => prev ? { ...prev, repo_url: event.target.value } : prev)}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Branch"
                value={pipeline.repo_branch ?? pipeline.repoBranch ?? ''}
                onChange={event => setPipeline(prev => prev ? { ...prev, repo_branch: event.target.value } : prev)}
              />
              <Input
                label="Terraform Version"
                value={pipeline.terraform_version ?? pipeline.terraformVersion ?? ''}
                onChange={event => setPipeline(prev => prev ? { ...prev, terraform_version: event.target.value } : prev)}
              />
            </div>
            <Input
              label="Path"
              value={pipeline.path ?? ''}
              onChange={event => setPipeline(prev => prev ? { ...prev, path: event.target.value } : prev)}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <select
                  className="w-full rounded-md border border-border px-3 py-2 text-sm"
                  value={pipeline.status ?? 'active'}
                  onChange={event => setPipeline(prev => prev ? { ...prev, status: event.target.value as Pipeline['status'] } : prev)}
                >
                  <option value="active">Active</option>
                  <option value="disabled">Disabled</option>
                </select>
              </div>
              <div className="text-sm text-muted-foreground">
                <p>Created: {formatDate(pipeline.created_at || pipeline.createdAt)}</p>
                <p>Updated: {formatDate(pipeline.updated_at || pipeline.updatedAt)}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Recent Runs</h2>
        </CardHeader>
        <CardContent className="space-y-3">
          {runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No runs yet for this pipeline.</p>
          ) : (
            runs.map(run => (
              <div key={run.id} className="flex items-center justify-between rounded-md border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{run.type ?? 'plan'} run</p>
                  <p className="text-xs text-muted-foreground">Started {formatDate(run.start_time || run.startTime)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={run.status === 'succeeded' ? 'success' : run.status === 'failed' ? 'error' : 'warning'}>
                    {run.status ?? 'unknown'}
                  </Badge>
                  <Link href={`/runs/${run.id}`} className="text-sm text-primary hover:underline">
                    View
                  </Link>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Modal open={showDelete} title="Delete Pipeline" onClose={() => setShowDelete(false)}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this pipeline? This action can be reversed if soft delete is enabled.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deletePipeline}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
