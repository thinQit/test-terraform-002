import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const createArtifactSchema = z.object({
  run_id: z.string(),
  type: z.enum(['plan', 'state', 'log']).optional(),
  location: z.string().min(3)
});

export async function GET(request: NextRequest) {
  try {
    const artifacts = await db.artifact.findMany({ orderBy: { createdAt: 'desc' } });

    const items = artifacts.map((artifact) => ({
      id: artifact.id,
      run_id: artifact.runId,
      type: artifact.type,
      location: artifact.location,
      created_at: artifact.createdAt.toISOString()
    }));

    return NextResponse.json({ success: true, data: { items } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch artifacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createArtifactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.message }, { status: 400 });
    }

    const artifact = await db.artifact.create({
      data: {
        runId: parsed.data.run_id,
        type: parsed.data.type ?? 'plan',
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
    return NextResponse.json({ success: false, error: 'Failed to create artifact' }, { status: 500 });
  }
}
