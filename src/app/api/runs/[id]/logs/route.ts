import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const run = await db.run.findUnique({ where: { id: context.params.id } });

    if (!run) {
      return NextResponse.json({ success: false, error: 'Run not found' }, { status: 404 });
    }

    const logs = [run.planOutput, run.applyOutput].filter(Boolean).join('\n') || 'No logs available.';
    const { searchParams } = request.nextUrl;
    const offset = Number(searchParams.get('offset') ?? '0');
    const limit = Number(searchParams.get('limit') ?? '2000');
    const sliced = logs.slice(offset, offset + limit);
    const more = offset + limit < logs.length;

    return NextResponse.json({
      success: true,
      data: {
        logs: sliced,
        more
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch logs' }, { status: 500 });
  }
}
