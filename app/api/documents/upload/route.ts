import { NextRequest, NextResponse } from "next/server";
import { storePDF } from "@/lib/pdf-storage";
import { DocumentService } from "@/lib/db/document-service";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "File must be a PDF" },
        { status: 400 }
      );
    }

    // Generate document ID
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Convert file to buffer and store
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    storePDF(documentId, buffer);

    // Create document in database
    DocumentService.createDocument({
      id: documentId,
      fileName: file.name,
      uploadedAt: new Date(),
      status: "uploaded",
    });

    return NextResponse.json({
      documentId,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const documents = DocumentService.getAllDocuments();
  return NextResponse.json({ documents });
}
