import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from '@/lib/prisma';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { ReasoningEffort } from 'openai/resources/shared';
import modelConfigs from '@/config/model-configs.json';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type ModelProvider = 'openai' | 'anthropic';

type ModelConfig = {
  provider: ModelProvider;
  params: {
    max_tokens?: number;
    max_completion_tokens?: number;
    temperature?: number;
    reasoning_effort?: 'high';
  };
};

type ModelConfigs = {
  [key: string]: ModelConfig;
};

// Available models for hypothesis generation
const AVAILABLE_MODELS = Object.keys(modelConfigs as ModelConfigs);

// Helper function to randomly select a model
function getRandomModel() {
  const randomIndex = Math.floor(Math.random() * AVAILABLE_MODELS.length);
  return AVAILABLE_MODELS[randomIndex];
}

// New helper function to generate a hypothesis
async function generateHypothesis(domain: string): Promise<{ hypothesisContent: string, model: string } | null> {
  const prompt = `Generate a novel scientific hypothesis in the field of ${domain}. 
  The hypothesis should be:
  1. Specific and testable
  2. Based on current scientific understanding
  3. Novel but plausible
  4. Written in clear, concise language
  
  Format: Just the hypothesis statement, no additional text. Don't put it in quotes, and don't start with "Hypothesis: " or anything like that.`;
  
  const model = getRandomModel();
  const hypothesisContent = await tryGenerateWithModel(model, prompt);
  return hypothesisContent ? { hypothesisContent, model } : null;
}

// Helper function to try generating with a model
async function tryGenerateWithModel(model: string, prompt: string) {
  try {
    const config = (modelConfigs as ModelConfigs)[model];
    if (!config) {
      throw new Error(`No configuration found for model: ${model}`);
    }
    
    if (config.provider === 'openai') {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: model.startsWith('o') ? "developer" : "system",
          content: "You are a scientific hypothesis generator. Generate hypotheses that are specific, testable, and based on current scientific understanding."
        },
        {
          role: "user",
          content: prompt
        }
      ];

      const completionParams = {
        model,
        messages,
        ...(model.startsWith('o3-mini') ? { reasoning_effort: config.params.reasoning_effort } : {}),
        ...config.params
      };

      const completion = await openai.chat.completions.create(completionParams);
      return completion.choices[0].message.content;
    } 
    
    else {
      const message = await anthropic.messages.create({
        model,
        system: "You are a scientific hypothesis generator. Generate hypotheses that are specific, testable, and based on current scientific understanding.",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: config.params.max_tokens ?? 200,
        temperature: config.params.temperature ?? 1
      });

      return message.content[0].type === 'text' ? message.content[0].text : null;
    }
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

    // Save the generated hypothesis to the database with the selected model
    const hypothesis = await prisma.hypothesis.create({
      data: {
        content: hypothesisContent,
        modelName: model,
        domain,
      },
    });

    // Return the hypothesis without revealing which model generated it
    return NextResponse.json({
      id: hypothesis.id,
      content: hypothesis.content,
      domain: hypothesis.domain,
      createdAt: hypothesis.createdAt
    });
  } catch (error) {
    console.error('Failed to generate hypothesis:', error);
    return NextResponse.json(
      { error: 'Failed to generate hypothesis' },
      { status: 500 }
    );
  }
} 