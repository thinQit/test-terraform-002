import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const audit = await db.auditLog.findUnique({ where: { id: context.params.id } });

    if (!audit) {
      return NextResponse.json({ success: false, error: 'Audit log not found' }, { status: 404 });
    }

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
    return NextResponse.json({ success: false, error: 'Failed to fetch audit log' }, { status: 500 });
  }
}
