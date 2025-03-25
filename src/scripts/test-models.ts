import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import modelConfigs from '@/config/model-configs.json';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

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

type TestResult = {
  model: string;
  success: boolean;
  error?: string;
  response?: string;
  duration: number;
};

async function testModel(model: string, config: ModelConfig): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    if (config.provider === 'openai') {
      const messages: ChatCompletionMessageParam[] = [
        {
          role: model.startsWith('o') ? "developer" : "system",
          content: "You are a test responder. Respond with just the word 'connected'."
        },
        {
          role: "user",
          content: "Test connection"
        }
      ];

      const completion = await openai.chat.completions.create({
        model,
        messages,
        ...(model.startsWith('o3-mini') ? { reasoning_effort: 'high' } : {}),
        ...config.params
      });

      const response = completion.choices[0].message.content ?? undefined;

      return {
        model,
        success: true,
        response,
        duration: Date.now() - startTime
      };
    } else {
      const message = await anthropic.messages.create({
        model,
        system: "You are a test responder. Respond with just the word 'connected'.",
        messages: [
          {
            role: "user",
            content: "Test connection"
          }
        ],
        max_tokens: config.params.max_tokens ?? 200,
        temperature: config.params.temperature ?? 1
      });

      const response = message.content[0].type === 'text' ? message.content[0].text : undefined;

      return {
        model,
        success: true,
        response,
        duration: Date.now() - startTime
      };
    }
  } catch (error) {
    return {
      model,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}

async function runTests() {
  console.log('Starting model tests...\n');
  
  const results: TestResult[] = [];
  const models = Object.entries(modelConfigs as ModelConfigs);

  for (const [model, config] of models) {
    console.log(`Testing model: ${model}`);
    const result = await testModel(model, config);
    results.push(result);

    if (result.success) {
      console.log(`✅ Success (${result.duration}ms)`);
      console.log(`Response: ${result.response?.substring(0, 100)}...\n`);
    } else {
      console.log(`❌ Failed (${result.duration}ms)`);
      console.log(`Error: ${result.error}\n`);
    }
  }

  // Print summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('Test Summary:');
  console.log(`Total models tested: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log(`Success rate: ${((successful / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\nFailed models:');
    results
      .filter(r => !r.success)
      .forEach(r => console.log(`- ${r.model}: ${r.error}`));
  }
}

// Run the tests
runTests().catch(console.error); 