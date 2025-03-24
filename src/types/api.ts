export interface Hypothesis {
  id: string;
  content: string;
  domain: string;
  modelName: string;
  novelty: number;
  plausibility: number;
  testability: number;
  averageScores: {
    novelty: number;
    plausibility: number;
    testability: number;
  };
  totalEvaluations: number;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  hypothesisId: string;
  userId: string;
  novelty: number;
  plausibility: number;
  testability: number;
  comments?: string;
  createdAt: string;
  hypothesis: Hypothesis;
}

export type ApiError = {
  error: string;
}; 