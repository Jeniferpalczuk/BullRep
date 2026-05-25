import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ message: 'Use /api/sessions ou sessionService.ts.' }, { status: 410 });
}
