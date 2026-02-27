import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const triggerSchema = z.object({
  type: z.enum(['plan', 'apply', 'validate', 'destroy']).optional(),
  variables: z.record(z.unknown()).optional(),
  initiated_by: z.string().optional()
});

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = triggerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const pipeline = await db.pipeline.findFirst({
      where: { id: context.params.id, deletedAt: null }
    });

    if (!pipeline) {
      return NextResponse.json({ success: false, error: 'Pipeline not found' }, { status: 404 });
    }

    const initiatedBy = parsed.data.initiated_by ?? request.headers.get('x-user-id') ?? 'system';

    const run = await db.run.create({
      data: {
        pipelineId: pipeline.id,
        type: parsed.data.type ?? 'plan',
        status: 'queued',
        initiatedBy,
        planOutput: parsed.data.variables ? JSON.stringify(parsed.data.variables) : undefined
      }
    });

    await db.auditLog.create({
      data: {
        action: 'run.trigger',
        entity: 'Run',
        entityId: run.id,
        userId: initiatedBy === 'system' ? null : initiatedBy,
        metadata: JSON.stringify({ pipelineId: pipeline.id, type: run.type })
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
    return NextResponse.json({ success: false, error: 'Failed to trigger run' }, { status: 500 });
  }
}
