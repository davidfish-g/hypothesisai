export type Hypothesis = {
  id: string;
  content: string;
  modelName: string;
  domain: string;
  createdAt: string;
  metadata: any;
  evaluations: Evaluation[];
  averageScores?: {
    plausibility: number;
    novelty: number;
    testability: number;
    totalEvaluations: number;
  };
};

export type Evaluation = {
  id: string;
  hypothesisId: string;
  userId: string;
  plausibility: number;
  novelty: number;
  testability: number;
  comments?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    name?: string;
    expertise: string[];
  };
  hypothesis: {
    id: string;
    content: string;
    modelName: string;
    domain: string;
    createdAt: string;
  };
};

export type ApiError = {
  error: string;
}; 