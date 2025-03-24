import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  const session = await getServerSession();
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { hypothesisId, plausibility, novelty, testability, comments } = await request.json();

    // First, verify that the hypothesis exists
    const hypothesis = await prisma.hypothesis.findUnique({
      where: { id: hypothesisId },
    });

    if (!hypothesis) {
      return NextResponse.json(
        { error: 'Hypothesis not found' },
        { status: 404 }
      );
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email! },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const evaluation = await prisma.evaluation.create({
      data: {
        plausibility,
        novelty,
        testability,
        comments,
        hypothesis: {
          connect: { id: hypothesisId }
        },
        user: {
          connect: { id: user.id }
        }
      },
    });

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Failed to submit evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to submit evaluation' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hypothesisId = searchParams.get('hypothesisId');
  const userId = searchParams.get('userId');

  try {
    const evaluations = await prisma.evaluation.findMany({
      where: {
        ...(hypothesisId && { hypothesisId }),
        ...(userId && { userId }),
      },
      include: {
        hypothesis: true,
        user: {
          select: {
            id: true,
            name: true,
            expertise: true,
          },
        },
      },
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Failed to fetch evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
} 