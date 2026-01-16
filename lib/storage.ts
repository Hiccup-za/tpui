import { Document, AgentStage } from "@/types";

// Shared in-memory storage for demo purposes
// In production, use a database
export const documents = new Map<string, Document>();
export const processingStates = new Map<string, {
  currentStageIndex: number;
  stages: AgentStage[];
  status: string;
}>();

export const AGENT_STAGES: Omit<AgentStage, "status" | "startedAt" | "completedAt">[] = [
  {
    id: 1,
    name: "Requirement Extraction",
    description: "Reviewing document and extracting functional and non-functional requirements",
  },
  {
    id: 2,
    name: "Test Case Generation",
    description: "Creating positive and negative test cases per requirement using the 7 testing principles",
  },
  {
    id: 3,
    name: "Negative Test Labeling",
    description: "Reviewing requirements and test cases, then labeling negative test cases",
  },
  {
    id: 4,
    name: "Test Type Classification",
    description: "Reviewing requirements and test cases, then labeling them according to their testing types",
  },
  {
    id: 5,
    name: "Final Review",
    description: "Reviewing everything to ensure requirements and test cases make sense and conform to the 7 testing principles",
  },
  {
    id: 6,
    name: "Document Finalization",
    description: "Saving the final document and preparing it for review",
  },
];
