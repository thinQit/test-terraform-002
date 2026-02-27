import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const updateRunSchema = z.object({
  status: z.enum(['queued', 'running', 'succeeded', 'failed', 'cancelled']).optional(),
  start_time: z.string().datetime().optional(),
  end_time: z.string().datetime().optional(),
  exit_code: z.number().optional(),
  logs_url: z.string().optional(),
  plan_output: z.string().optional(),
  apply_output: z.string().optional()
});

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const run = await db.run.findUnique({ where: { id: context.params.id } });

    if (!run) {
      return NextResponse.json({ success: false, error: 'Run not found' }, { status: 404 });
    }

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
    return NextResponse.json({ success: false, error: 'Failed to fetch run' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = updateRunSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const run = await db.run.update({
      where: { id: context.params.id },
      data: {
        status: parsed.data.status,
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
    return NextResponse.json({ success: false, error: 'Failed to update run' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    await db.run.delete({ where: { id: context.params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete run' }, { status: 500 });
  }
}
