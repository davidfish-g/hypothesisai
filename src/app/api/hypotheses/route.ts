import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

type HypothesisWithEvaluations = {
  id: string;
  content: string;
  modelName: string;
  domain: string;
  createdAt: Date;
  metadata: any;
  evaluations: Array<{
    plausibility: number;
    novelty: number;
    testability: number;
    user: {
      expertise: string[];
    };
  }>;
};

type Scores = {
  plausibility: number;
  novelty: number;
  testability: number;
  count: number;
};

type Evaluation = {
  plausibility: number;
  novelty: number;
  testability: number;
  user: {
    expertise: string[];
  };
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const modelName = searchParams.get('modelName');

  try {
    const hypotheses = await prisma.hypothesis.findMany({
      where: {
        ...(domain && { domain }),
        ...(modelName && { modelName }),
      },
      include: {
        evaluations: {
          select: {
            plausibility: true,
            novelty: true,
            testability: true,
            user: {
              select: {
                expertise: true,
              },
            },
          },
        },
      },
    });

    // Calculate average scores for each hypothesis
    const hypothesesWithScores = hypotheses.map((hypothesis: HypothesisWithEvaluations) => {
      const scores = hypothesis.evaluations.reduce(
        (acc: Scores, evaluation: Evaluation) => ({
          plausibility: acc.plausibility + evaluation.plausibility,
          novelty: acc.novelty + evaluation.novelty,
          testability: acc.testability + evaluation.testability,
          count: acc.count + 1,
        }),
        { plausibility: 0, novelty: 0, testability: 0, count: 0 }
      );

      return {
        ...hypothesis,
        averageScores: {
          plausibility: scores.count ? scores.plausibility / scores.count : 0,
          novelty: scores.count ? scores.novelty / scores.count : 0,
          testability: scores.count ? scores.testability / scores.count : 0,
          totalEvaluations: scores.count,
        },
      };
    });

    return NextResponse.json(hypothesesWithScores);
  } catch (error) {
    console.error('Failed to fetch hypotheses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hypotheses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content, modelName, domain, metadata } = await request.json();

    const hypothesis = await prisma.hypothesis.create({
      data: {
        content,
        modelName,
        domain,
        metadata,
      },
    });

    return NextResponse.json(hypothesis);
  } catch (error) {
    console.error('Failed to create hypothesis:', error);
    return NextResponse.json(
      { error: 'Failed to create hypothesis' },
      { status: 500 }
    );
  }
} 