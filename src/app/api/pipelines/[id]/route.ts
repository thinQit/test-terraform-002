import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const updatePipelineSchema = z.object({
  name: z.string().min(2).optional(),
  repo_url: z.string().url().optional(),
  repo_branch: z.string().optional(),
  path: z.string().optional(),
  terraform_version: z.string().optional(),
  variables: z.record(z.unknown()).optional(),
  status: z.enum(['active', 'disabled']).optional()
});

function parseVariables(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const pipeline = await db.pipeline.findFirst({
      where: { id: context.params.id, deletedAt: null }
    });

    if (!pipeline) {
      return NextResponse.json({ success: false, error: 'Pipeline not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: pipeline.id,
        name: pipeline.name,
        repo_url: pipeline.repoUrl,
        repo_branch: pipeline.repoBranch,
        path: pipeline.path,
        terraform_version: pipeline.terraformVersion,
        variables: parseVariables(pipeline.variables),
        status: pipeline.status,
        created_at: pipeline.createdAt.toISOString(),
        updated_at: pipeline.updatedAt.toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch pipeline' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = updatePipelineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const pipeline = await db.pipeline.update({
      where: { id: context.params.id },
      data: {
        name: parsed.data.name,
        repoUrl: parsed.data.repo_url,
        repoBranch: parsed.data.repo_branch,
        path: parsed.data.path,
        terraformVersion: parsed.data.terraform_version,
        variables: parsed.data.variables ? JSON.stringify(parsed.data.variables) : undefined,
        status: parsed.data.status
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: pipeline.id,
        name: pipeline.name,
        repo_url: pipeline.repoUrl,
        repo_branch: pipeline.repoBranch,
        path: pipeline.path,
        terraform_version: pipeline.terraformVersion,
        variables: parseVariables(pipeline.variables),
        status: pipeline.status,
        created_at: pipeline.createdAt.toISOString(),
        updated_at: pipeline.updatedAt.toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update pipeline' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    await db.pipeline.update({
      where: { id: context.params.id },
      data: {
        deletedAt: new Date(),
        status: 'disabled'
      }
    });

    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete pipeline' }, { status: 500 });
  }
}
