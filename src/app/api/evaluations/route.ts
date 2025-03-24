import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hypothesisId, plausibility, novelty, testability, comments } = await request.json();

    if (!hypothesisId || !plausibility || !novelty || !testability) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has already evaluated this hypothesis
    const existingEvaluation = await prisma.evaluation.findUnique({
      where: {
        hypothesisId_userId: {
          hypothesisId,
          userId: user.id,
        },
      },
    });

    let evaluation;
    if (existingEvaluation) {
      // Update existing evaluation
      evaluation = await prisma.evaluation.update({
        where: {
          hypothesisId_userId: {
            hypothesisId,
            userId: user.id,
          },
        },
        data: {
          plausibility,
          novelty,
          testability,
          comments,
        },
      });
    } else {
      // Create new evaluation
      evaluation = await prisma.evaluation.create({
        data: {
          plausibility,
          novelty,
          testability,
          comments,
          hypothesis: {
            connect: { id: hypothesisId },
          },
          user: {
            connect: { id: user.id },
          },
        },
      });
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error('Error creating evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get the user from the database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const evaluations = await prisma.evaluation.findMany({
      where: {
        userId: user.id,
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
      orderBy: {
        createdAt: 'desc',
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