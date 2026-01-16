import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/db/document-service";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const documentId = params.id;
  const document = DocumentService.getDocument(documentId);

  if (!document) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  // Find current stage index
  const currentStageIndex = document.stages.findIndex(
    (s) => s.status === "processing"
  );
  const lastCompletedIndex = document.stages
    .map((s, i) => (s.status === "completed" ? i : -1))
    .filter((i) => i !== -1)
    .pop();
  const activeIndex = currentStageIndex !== -1 ? currentStageIndex : (lastCompletedIndex !== undefined ? lastCompletedIndex + 1 : 0);

  return NextResponse.json({
    status: document.status,
    currentStageIndex: activeIndex,
    stages: document.stages,
  });
}
