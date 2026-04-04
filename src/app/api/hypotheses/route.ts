import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get('domain');
  const modelName = searchParams.get('modelName');

  try {
    let hypotheses;
    if (domain && modelName) {
      hypotheses = await sql`
        SELECT h.*,
          COALESCE(AVG(e.plausibility), 0) as avg_plausibility,
          COALESCE(AVG(e.novelty), 0) as avg_novelty,
          COALESCE(AVG(e.testability), 0) as avg_testability,
          COUNT(e.id) as evaluation_count
        FROM hypotheses h
        LEFT JOIN evaluations e ON h.id = e."hypothesisId"
        WHERE h.domain = ${domain} AND h."modelName" = ${modelName}
        GROUP BY h.id
      `;
    } else if (domain) {
      hypotheses = await sql`
        SELECT h.*,
          COALESCE(AVG(e.plausibility), 0) as avg_plausibility,
          COALESCE(AVG(e.novelty), 0) as avg_novelty,
          COALESCE(AVG(e.testability), 0) as avg_testability,
          COUNT(e.id) as evaluation_count
        FROM hypotheses h
        LEFT JOIN evaluations e ON h.id = e."hypothesisId"
        WHERE h.domain = ${domain}
        GROUP BY h.id
      `;
    } else if (modelName) {
      hypotheses = await sql`
        SELECT h.*,
          COALESCE(AVG(e.plausibility), 0) as avg_plausibility,
          COALESCE(AVG(e.novelty), 0) as avg_novelty,
          COALESCE(AVG(e.testability), 0) as avg_testability,
          COUNT(e.id) as evaluation_count
        FROM hypotheses h
        LEFT JOIN evaluations e ON h.id = e."hypothesisId"
        WHERE h."modelName" = ${modelName}
        GROUP BY h.id
      `;
    } else {
      hypotheses = await sql`
        SELECT h.*,
          COALESCE(AVG(e.plausibility), 0) as avg_plausibility,
          COALESCE(AVG(e.novelty), 0) as avg_novelty,
          COALESCE(AVG(e.testability), 0) as avg_testability,
          COUNT(e.id) as evaluation_count
        FROM hypotheses h
        LEFT JOIN evaluations e ON h.id = e."hypothesisId"
        GROUP BY h.id
      `;
    }

    const result = hypotheses.map((h: Record<string, unknown>) => ({
      id: h.id,
      content: h.content,
      modelName: h.modelName,
      domain: h.domain,
      createdAt: h.createdAt,
      metadata: h.metadata,
      averageScores: {
        plausibility: Number(h.avg_plausibility) || 0,
        novelty: Number(h.avg_novelty) || 0,
        testability: Number(h.avg_testability) || 0,
      },
      evaluationCount: Number(h.evaluation_count),
    }));

    return NextResponse.json(result);
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

    const rows = await sql`
      INSERT INTO hypotheses (id, content, "modelName", domain, "createdAt")
      VALUES (gen_random_uuid(), ${content}, ${modelName}, ${domain}, NOW())
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Failed to create hypothesis:', error);
    return NextResponse.json(
      { error: 'Failed to create hypothesis' },
      { status: 500 }
    );
  }
}
