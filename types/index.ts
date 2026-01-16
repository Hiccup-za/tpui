export interface Product {
  id: string;
  name: string;
  repoUrl?: string;
  description?: string;
  createdAt: Date;
}

export interface TestPlan {
  id: string;
  productId: string;
  featureName: string;
  createdAt: Date;
}

export type ProcessingStage = 
  | "uploaded"
  | "extracting_requirements"
  | "creating_test_cases"
  | "labeling_negative"
  | "labeling_test_types"
  | "final_review"
  | "completed"
  | "error";

export interface AgentStage {
  id: number;
  name: string;
  description: string;
  status: "pending" | "processing" | "completed" | "error";
  startedAt?: Date;
  completedAt?: Date;
}

export interface Requirement {
  id: string;
  number?: string; // FR-001, NFR-001, etc.
  type: "functional" | "non-functional";
  description: string;
  testCases: TestCase[];
}

export interface TestCase {
  id: string;
  requirementId: string;
  description: string;
  isPositive: boolean;
  isNegative: boolean;
  testTypes: string[];
}

export interface Document {
  id: string;
  fileName: string;
  uploadedAt: Date;
  status: ProcessingStage;
  stages: AgentStage[];
  requirements?: Requirement[];
  completedAt?: Date;
}
