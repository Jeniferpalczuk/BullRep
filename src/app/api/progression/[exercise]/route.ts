import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ exercise: string }> }
) {
  const { exercise } = await params;

  const progression = await prisma.trainingSessionExercise.findMany({
    where: { name: exercise },
    include: {
      session: {
        select: { date: true },
      },
    },
    orderBy: { session: { date: 'asc' } },
  });

  return NextResponse.json(
    progression.map((item) => ({
      weight: item.weight,
      date: item.session.date.toISOString().slice(0, 10),
    }))
  );
}
