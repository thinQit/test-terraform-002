import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        status: 'ok',
        version: '1.0.0',
        uptime_seconds: Math.floor(process.uptime())
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Service unavailable' }, { status: 503 });
  }
}
