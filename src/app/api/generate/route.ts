import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { sql } from '@/lib/db';
import modelConfigs from '@/config/model-configs.json';

type ModelConfig = {
  max_tokens: number;
  temperature?: number;
};

type ModelConfigs = Record<string, ModelConfig>;

const AVAILABLE_MODELS = Object.keys(modelConfigs as ModelConfigs);

function getRandomModel() {
  return AVAILABLE_MODELS[Math.floor(Math.random() * AVAILABLE_MODELS.length)];
}

async function generateWithOpenRouter(model: string, prompt: string): Promise<string | null> {
  const config = (modelConfigs as ModelConfigs)[model];
  if (!config) throw new Error(`No configuration found for model: ${model}`);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: config.max_tokens,
      temperature: config.temperature,
      messages: [
        {
          role: "system",
          content: "You are a scientific hypothesis generator. Generate hypotheses that are specific, testable, and based on current scientific understanding.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter error (${response.status}): ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? null;
}

async function generateHypothesis(domain: string): Promise<{ hypothesisContent: string; model: string } | null> {
  const prompt = `Generate a novel scientific hypothesis in the field of ${domain}.
  The hypothesis should be:
  1. Specific and testable
  2. Based on current scientific understanding
  3. Novel but plausible
  4. Written in clear, concise language

  Format: Just the hypothesis statement, no additional text. Don't put it in quotes, and don't start with "Hypothesis: " or anything like that.`;

  const model = getRandomModel();
  try {
    const hypothesisContent = await generateWithOpenRouter(model, prompt);
    return hypothesisContent ? { hypothesisContent, model } : null;
  } catch (error) {
    console.error(`Failed to generate with model ${model}:`, error);
    return null;
  }
}

export async function POST(request: Request) {
  const session = await getServerSession();

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { domain } = await request.json();

    if (!domain) {
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      );
    }

    const result = await generateHypothesis(domain);
    if (!result) {
      return NextResponse.json(
        { error: 'Failed to generate hypothesis' },
        { status: 500 }
      );
    }
    const { hypothesisContent, model } = result;

    const rows = await sql`
      INSERT INTO hypotheses (id, content, "modelName", domain, "createdAt")
      VALUES (gen_random_uuid(), ${hypothesisContent}, ${model}, ${domain}, NOW())
      RETURNING id, content, domain, "createdAt"
    `;

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Failed to generate hypothesis:', error);
    return NextResponse.json(
      { error: 'Failed to generate hypothesis' },
      { status: 500 }
    );
  }
}
