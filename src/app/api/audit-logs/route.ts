import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';

const createAuditSchema = z.object({
  action: z.string().min(2),
  entity: z.string().min(2),
  entity_id: z.string().min(2),
  user_id: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
});

export async function GET(request: NextRequest) {
  try {
    const audits = await db.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
    const items = audits.map((audit) => ({
      id: audit.id,
      action: audit.action,
      entity: audit.entity,
      entity_id: audit.entityId,
      user_id: audit.userId,
      metadata: audit.metadata ? JSON.parse(audit.metadata) : null,
      created_at: audit.createdAt.toISOString()
    }));

    return NextResponse.json({ success: true, data: { items } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createAuditSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const audit = await db.auditLog.create({
      data: {
        action: parsed.data.action,
        entity: parsed.data.entity,
        entityId: parsed.data.entity_id,
        userId: parsed.data.user_id,
        metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : null
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: audit.id,
        action: audit.action,
        entity: audit.entity,
        entity_id: audit.entityId,
        user_id: audit.userId,
        metadata: audit.metadata ? JSON.parse(audit.metadata) : null,
        created_at: audit.createdAt.toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create audit log' }, { status: 500 });
  }
}
