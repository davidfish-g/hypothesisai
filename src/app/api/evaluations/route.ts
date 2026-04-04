import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@/lib/db';
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

    const users = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
    if (!users[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = users[0].id as string;

    // Upsert: update if exists, create if not
    const rows = await sql`
      INSERT INTO evaluations (id, "hypothesisId", "userId", plausibility, novelty, testability, comments, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), ${hypothesisId}, ${userId}, ${plausibility}, ${novelty}, ${testability}, ${comments ?? null}, NOW(), NOW())
      ON CONFLICT ("hypothesisId", "userId")
      DO UPDATE SET plausibility = ${plausibility}, novelty = ${novelty}, testability = ${testability}, comments = ${comments ?? null}, "updatedAt" = NOW()
      RETURNING *
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Error creating evaluation:', error);
    return NextResponse.json(
      { error: 'Failed to create evaluation' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const users = await sql`SELECT id FROM users WHERE email = ${session.user.email}`;
    if (!users[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const userId = users[0].id as string;

    const evaluations = await sql`
      SELECT e.*,
        json_build_object('id', h.id, 'content', h.content, 'modelName', h."modelName", 'domain', h.domain, 'createdAt', h."createdAt") as hypothesis,
        json_build_object('id', u.id, 'name', u.name, 'expertise', u.expertise) as user
      FROM evaluations e
      JOIN hypotheses h ON e."hypothesisId" = h.id
      JOIN users u ON e."userId" = u.id
      WHERE e."userId" = ${userId}
      ORDER BY e."createdAt" DESC
    `;

    return NextResponse.json(evaluations);
  } catch (error) {
    console.error('Failed to fetch evaluations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evaluations' },
      { status: 500 }
    );
  }
}
