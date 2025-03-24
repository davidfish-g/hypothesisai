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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                expertise: true,
              },
            },
          },
        },
      },
    });

    // Calculate average scores for each hypothesis
    const hypothesesWithScores = hypotheses.map(hypothesis => {
      const evaluations = hypothesis.evaluations;
      const averageScores = {
        plausibility: evaluations.reduce((acc, evaluation) => acc + evaluation.plausibility, 0) / evaluations.length || 0,
        novelty: evaluations.reduce((acc, evaluation) => acc + evaluation.novelty, 0) / evaluations.length || 0,
        testability: evaluations.reduce((acc, evaluation) => acc + evaluation.testability, 0) / evaluations.length || 0,
      };

      return {
        ...hypothesis,
        averageScores,
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
    const { content, modelName, domain } = await request.json();

    const hypothesis = await prisma.hypothesis.create({
      data: {
        content,
        modelName,
        domain,
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