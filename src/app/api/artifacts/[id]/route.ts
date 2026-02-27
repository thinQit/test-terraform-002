import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const updateArtifactSchema = z.object({
  type: z.enum(['plan', 'state', 'log']).optional(),
  location: z.string().min(3).optional()
});

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const artifact = await db.artifact.findUnique({ where: { id: context.params.id } });

    if (!artifact) {
      return NextResponse.json({ success: false, error: 'Artifact not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: artifact.id,
        run_id: artifact.runId,
        type: artifact.type,
        location: artifact.location,
        signed_url: artifact.location
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch artifact' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const body = await request.json();
    const parsed = updateArtifactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const artifact = await db.artifact.update({
      where: { id: context.params.id },
      data: {
        type: parsed.data.type,
        location: parsed.data.location
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: artifact.id,
        run_id: artifact.runId,
        type: artifact.type,
        location: artifact.location,
        created_at: artifact.createdAt.toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update artifact' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    await db.artifact.delete({ where: { id: context.params.id } });
    return NextResponse.json({ success: true, data: { success: true } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete artifact' }, { status: 500 });
  }
}
