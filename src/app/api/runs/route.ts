import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const createRunSchema = z.object({
  pipeline_id: z.string(),
  type: z.enum(['plan', 'apply', 'destroy', 'validate']).optional(),
  status: z.enum(['queued', 'running', 'succeeded', 'failed', 'cancelled']).optional(),
  initiated_by: z.string().optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  exit_code: z.number().optional(),
  logs_url: z.string().optional(),
  plan_output: z.string().optional(),
  apply_output: z.string().optional()
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = Number(searchParams.get('page') ?? '1');
    const pageSize = Number(searchParams.get('pageSize') ?? '10');
    const pipelineId = searchParams.get('pipeline_id');
    const status = searchParams.get('status');

    const where = {
      ...(pipelineId ? { pipelineId } : {}),
      ...(status ? { status } : {})
    };

    const total = await db.run.count({ where });
    const runs = await db.run.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize
    });

    const items = runs.map((run) => ({
      id: run.id,
      pipeline_id: run.pipelineId,
      type: run.type,
      status: run.status,
      initiated_by: run.initiatedBy,
      start_time: run.startTime ? run.startTime.toISOString() : null,
      end_time: run.endTime ? run.endTime.toISOString() : null,
      exit_code: run.exitCode,
      logs_url: run.logsUrl,
      plan_output: run.planOutput,
      apply_output: run.applyOutput
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
    return NextResponse.json({ success: false, error: 'Failed to fetch runs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createRunSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const run = await db.run.create({
      data: {
        pipelineId: parsed.data.pipeline_id,
        type: parsed.data.type ?? 'plan',
        status: parsed.data.status ?? 'queued',
        initiatedBy: parsed.data.initiated_by ?? request.headers.get('x-user-id') ?? 'system',
        startTime: parsed.data.start_time ? new Date(parsed.data.start_time) : undefined,
        endTime: parsed.data.end_time ? new Date(parsed.data.end_time) : undefined,
        exitCode: parsed.data.exit_code,
        logsUrl: parsed.data.logs_url,
        planOutput: parsed.data.plan_output,
        applyOutput: parsed.data.apply_output
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: run.id,
        pipeline_id: run.pipelineId,
        type: run.type,
        status: run.status,
        initiated_by: run.initiatedBy,
        start_time: run.startTime ? run.startTime.toISOString() : null,
        end_time: run.endTime ? run.endTime.toISOString() : null,
        exit_code: run.exitCode,
        logs_url: run.logsUrl,
        plan_output: run.planOutput,
        apply_output: run.applyOutput
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create run' }, { status: 500 });
  }
}
