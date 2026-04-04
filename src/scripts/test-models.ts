import modelConfigs from '../config/model-configs.json';

type ModelConfig = {
  max_tokens: number;
  temperature?: number;
};

type ModelConfigs = Record<string, ModelConfig>;

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
          { role: "system", content: "You are a test responder. Respond with just the word 'connected'." },
          { role: "user", content: "Test connection" },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    return { model, success: true, response: content, duration: Date.now() - startTime };
  } catch (error) {
    return {
      model,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime,
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
      console.log(`  Success (${result.duration}ms)`);
      console.log(`  Response: ${result.response?.substring(0, 100)}\n`);
    } else {
      console.log(`  Failed (${result.duration}ms)`);
      console.log(`  Error: ${result.error}\n`);
    }
  }

  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('Test Summary:');
  console.log(`Total: ${results.length} | Passed: ${successful} | Failed: ${failed}`);

  if (failed > 0) {
    console.log('\nFailed models:');
    results.filter(r => !r.success).forEach(r => console.log(`- ${r.model}: ${r.error}`));
  }
}

runTests().catch(console.error);
