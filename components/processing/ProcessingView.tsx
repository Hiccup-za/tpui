"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Circle, AlertCircle, X } from "lucide-react";
import { AgentStage, ProcessingStage } from "@/types";
import { cn } from "@/lib/utils";

interface ProcessingViewProps {
  documentId: string;
}

const AGENT_STAGES: Omit<AgentStage, "status" | "startedAt" | "completedAt">[] = [
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

export function ProcessingView({ documentId }: ProcessingViewProps) {
  const [stages, setStages] = useState<AgentStage[]>(
    AGENT_STAGES.map((stage) => ({
      ...stage,
      status: "pending" as const,
    }))
  );
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}/status`);
        if (!response.ok) {
          // Processing not started yet, keep initial state
          return;
        }

        const data = await response.json();
        if (data.stages && data.stages.length > 0) {
          setStages(data.stages);
        }
        setCurrentStageIndex(data.currentStageIndex || 0);
        setIsComplete(data.status === "completed");

        if (data.status === "completed") {
          // Redirect to home page after a short delay
          setTimeout(() => {
            router.push(`/`);
          }, 2000);
        } else if (data.status === "error") {
          // Handle error state
          console.error("Processing error:", data.error);
        }
      } catch (error) {
        console.error("Error polling status:", error);
      }
    };

    // Start processing if not already started
    const startProcessing = async () => {
      try {
        await fetch(`/api/documents/${documentId}/process`, {
          method: "POST",
        });
      } catch (error) {
        console.error("Error starting processing:", error);
      }
    };

    startProcessing();

    // Poll every 2 seconds
    const interval = setInterval(pollStatus, 2000);
    pollStatus(); // Initial poll

    return () => clearInterval(interval);
  }, [documentId, router]);

  const getStageIcon = (status: AgentStage["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Loader2 className="h-5 w-5 text-primary animate-spin" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel processing? This will delete the document and return to home.")) {
      return;
    }

    setIsCancelling(true);
    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
      } else {
        alert("Failed to cancel processing. Please try again.");
        setIsCancelling(false);
      }
    } catch (error) {
      console.error("Error cancelling processing:", error);
      alert("Failed to cancel processing. Please try again.");
      setIsCancelling(false);
    }
  };

  const completedStages = stages.filter((s) => s.status === "completed").length;
  const progress = (completedStages / stages.length) * 100;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Processing Document</h1>
          <p className="text-muted-foreground mt-1">
            AI agents are analyzing your PRD and generating test cases
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isCancelling || isComplete}
        >
          <X className="h-4 w-4 mr-2" />
          {isCancelling ? "Cancelling..." : "Cancel"}
        </Button>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle>Overall Progress</CardTitle>
            <span className="text-sm text-muted-foreground">
              {completedStages} of {stages.length} stages completed
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Agent Stages */}
      <div className="space-y-4">
        {stages.map((stage, index) => {
          const isActive = stage.status === "processing";
          const isCompleted = stage.status === "completed";
          const isError = stage.status === "error";

          return (
            <Card
              key={stage.id}
              className={cn(
                "transition-all",
                isActive && "ring-2 ring-primary",
                isCompleted && "bg-primary/5",
                isError && "border-destructive"
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStageIcon(stage.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{stage.name}</h3>
                      {stage.status === "processing" && (
                        <span className="text-xs text-primary font-medium">
                          Processing...
                        </span>
                      )}
                      {stage.status === "completed" && stage.completedAt && (
                        <span className="text-xs text-muted-foreground">
                          Completed
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {stage.description}
                    </p>
                    {isActive && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>Agent is working on this stage...</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {isComplete && (
        <Card className="border-green-500 bg-green-500/10">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
              <div>
                <p className="font-semibold">Processing Complete!</p>
                <p className="text-sm text-muted-foreground">
                  Redirecting to home...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
