import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ exercise: string }> }
) {
  const { exercise } = await params;

  const record = await prisma.trainingSessionExercise.findFirst({
    where: { name: exercise },
    include: {
      session: {
        select: { date: true },
      },
    },
    orderBy: [{ weight: 'desc' }, { session: { date: 'desc' } }],
  });

  if (!record) {
    return NextResponse.json({ error: 'Nenhum registro encontrado.' }, { status: 404 });
  }

  return NextResponse.json({
    maxWeight: record.weight,
    date: record.session.date.toISOString().slice(0, 10),
  });
}
