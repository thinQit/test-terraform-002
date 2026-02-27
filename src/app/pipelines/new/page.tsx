'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { api } from '@/lib/api';

interface PipelinePayload {
  name: string;
  repo_url: string;
  repo_branch?: string;
  path?: string;
  terraform_version?: string;
  variables?: Record<string, string>;
}

interface Pipeline {
  id: string;
}

export default function NewPipelinePage() {
  const router = useRouter();
  const [form, setForm] = useState<PipelinePayload>({
    name: '',
    repo_url: '',
    repo_branch: 'main',
    path: '',
    terraform_version: '',
    variables: {}
  });
  const [variablesText, setVariablesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = (field: keyof PipelinePayload, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    let variables: Record<string, string> | undefined = undefined;
    if (variablesText.trim()) {
      try {
        variables = JSON.parse(variablesText);
      } catch {
        setError('Variables must be valid JSON.');
        setLoading(false);
        return;
      }
    }

    const response = await api.post<Pipeline>('/api/pipelines', {
      ...form,
      variables
    });

    if (response.error) {
      setError(response.error);
    } else if (response.data?.id) {
      router.push(`/pipelines/${response.data.id}`);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Create Pipeline</h1>
        <p className="text-sm text-muted-foreground">Define a Terraform pipeline configuration.</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Pipeline Details</h2>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Pipeline Name"
              value={form.name}
              onChange={event => updateField('name', event.target.value)}
              required
            />
            <Input
              label="Repository URL"
              value={form.repo_url}
              onChange={event => updateField('repo_url', event.target.value)}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Branch"
                value={form.repo_branch}
                onChange={event => updateField('repo_branch', event.target.value)}
              />
              <Input
                label="Terraform Version"
                value={form.terraform_version}
                onChange={event => updateField('terraform_version', event.target.value)}
              />
            </div>
            <Input
              label="Path"
              value={form.path}
              onChange={event => updateField('path', event.target.value)}
              helperText="Optional subdirectory for Terraform files"
            />
            <div className="space-y-1">
              <label className="text-sm font-medium">Variables (JSON)</label>
              <textarea
                className="min-h-[120px] w-full rounded-md border border-border px-3 py-2 text-sm"
                value={variablesText}
                onChange={event => setVariablesText(event.target.value)}
                placeholder='{"environment": "staging"}'
              />
            </div>
            {error && <p className="text-error">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => router.push('/pipelines')}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>
                Create pipeline
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
