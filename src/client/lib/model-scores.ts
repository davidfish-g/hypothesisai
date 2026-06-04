export type HypothesisScore = {
  modelName: string;
  averageScores: {
    plausibility: number;
    novelty: number;
    testability: number;
  };
};

export type ModelScore = {
  name: string;
  novelty: number;
  plausibility: number;
  testability: number;
  overall: number;
  totalEvaluations: number;
};

export type SortField =
  | "name"
  | "plausibility"
  | "novelty"
  | "testability"
  | "overall"
  | "totalEvaluations";

export type SortDirection = "asc" | "desc";

export function aggregateModelScores(hypotheses: HypothesisScore[]): ModelScore[] {
  const scores = new Map<string, ModelScore>();

  for (const hypothesis of hypotheses) {
    const existing = scores.get(hypothesis.modelName) ?? {
      name: hypothesis.modelName,
      novelty: 0,
      plausibility: 0,
      testability: 0,
      overall: 0,
      totalEvaluations: 0,
    };

    const totalEvaluations = existing.totalEvaluations + 1;
    const novelty = average(existing.novelty, existing.totalEvaluations, hypothesis.averageScores.novelty);
    const plausibility = average(
      existing.plausibility,
      existing.totalEvaluations,
      hypothesis.averageScores.plausibility
    );
    const testability = average(
      existing.testability,
      existing.totalEvaluations,
      hypothesis.averageScores.testability
    );

    scores.set(hypothesis.modelName, {
      ...existing,
      totalEvaluations,
      novelty,
      plausibility,
      testability,
      overall: (novelty + plausibility + testability) / 3,
    });
  }

  return Array.from(scores.values());
}

export function sortModelScores(
  models: ModelScore[],
  field: SortField,
  direction: SortDirection
) {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...models].sort((a, b) => {
    const aValue = a[field];
    const bValue = b[field];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * multiplier;
    }

    return (Number(aValue) - Number(bValue)) * multiplier;
  });
}

function average(currentAverage: number, currentCount: number, nextValue: number) {
  if (currentCount === 0) return nextValue;
  return (currentAverage * currentCount + nextValue) / (currentCount + 1);
}
