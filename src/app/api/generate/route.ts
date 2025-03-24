import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const prompt = `Generate a novel scientific hypothesis in the field of ${domain}. 
    The hypothesis should be:
    1. Specific and testable
    2. Based on current scientific understanding
    3. Novel but plausible
    4. Written in clear, concise language
    
    Format: Just the hypothesis statement, no additional text. Don't put it in quotes, and don't start with "Hypothesis: " or anything like that.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a scientific hypothesis generator. Generate hypotheses that are specific, testable, and based on current scientific understanding."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    const hypothesisContent = completion.choices[0].message.content;

    // Save the generated hypothesis to the database
    const hypothesis = await prisma.hypothesis.create({
      data: {
        content: hypothesisContent!,
        modelName: "GPT-4",
        domain,
      },
    });

    return NextResponse.json(hypothesis);
  } catch (error) {
    console.error('Failed to generate hypothesis:', error);
    return NextResponse.json(
      { error: 'Failed to generate hypothesis' },
      { status: 500 }
    );
  }
} 