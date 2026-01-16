import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/db/document-service";
import { ProcessingAgent } from "@/lib/agents/processing-agent";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const documentId = params.id;

  // Check if document exists
  const document = DocumentService.getDocument(documentId);
  if (!document) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  // Check if already processing or completed
  if (document.status === "processing") {
    return NextResponse.json({ message: "Processing already started" });
  }

  if (document.status === "completed") {
    return NextResponse.json({ message: "Document already processed" });
  }

  // Update document status to processing
  DocumentService.updateDocumentStatus(documentId, "processing");

  // Start agent processing (non-blocking)
  // The agent will update the processing state as it progresses
  const agent = new ProcessingAgent();
  
  // Run processing in background
  agent.processDocument(documentId).catch((error) => {
    console.error(`Error processing document ${documentId}:`, error);
    DocumentService.updateDocumentStatus(documentId, "error");
  });

  return NextResponse.json({ message: "Processing started" });
}
