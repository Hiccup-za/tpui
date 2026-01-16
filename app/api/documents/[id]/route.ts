import { NextRequest, NextResponse } from "next/server";
import { DocumentService } from "@/lib/db/document-service";
import { deletePDF } from "@/lib/pdf-storage";

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

  return NextResponse.json({ document });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const documentId = params.id;
  const deleted = DocumentService.deleteDocument(documentId);

  if (!deleted) {
    return NextResponse.json(
      { error: "Document not found" },
      { status: 404 }
    );
  }

  // Also delete the PDF file
  deletePDF(documentId);

  return NextResponse.json({ message: "Document deleted successfully" });
}
