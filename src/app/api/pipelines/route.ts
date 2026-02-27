import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const createPipelineSchema = z.object({
  name: z.string().min(2),
  repo_url: z.string().url(),
  repo_branch: z.string().optional(),
  path: z.string().optional(),
  terraform_version: z.string().optional(),
  variables: z.record(z.unknown()).optional()
});

function parseVariables(value: string | null): Record<string, unknown> | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '10');
    const status = searchParams.get('status');

    const where = {
      deletedAt: null as Date | null,
      ...(status ? { status } : {})
    };

    const total = await db.pipeline.count({ where });
    const pipelines = await db.pipeline.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const items = pipelines.map((pipeline) => ({
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
    }));

    return NextResponse.json({
      success: true,
      data: {
        items,
        total,
        page,
        pageSize
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch pipelines' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createPipelineSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const pipeline = await db.pipeline.create({
      data: {
        name: parsed.data.name,
        repoUrl: parsed.data.repo_url,
        repoBranch: parsed.data.repo_branch ?? 'main',
        path: parsed.data.path,
        terraformVersion: parsed.data.terraform_version,
        variables: parsed.data.variables ? JSON.stringify(parsed.data.variables) : null
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
    return NextResponse.json({ success: false, error: 'Failed to create pipeline' }, { status: 500 });
  }
}
