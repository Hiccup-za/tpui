/**
 * PDF Parser Utility
 * 
 * Extracts text content from PDF files.
 * 
 * For production, install a PDF parsing library:
 * npm install pdf-parse
 * or
 * npm install pdfjs-dist
 */

export interface PDFParseResult {
  text: string;
  pageCount: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

/**
 * Parse PDF file and extract text content
 * 
 * @param file - PDF file (File object or Buffer)
 * @returns Extracted text and metadata
 */
export async function parsePDF(file: File | Buffer): Promise<PDFParseResult> {
  try {
    // Convert File to Buffer if needed
    const buffer = file instanceof File 
      ? Buffer.from(await file.arrayBuffer())
      : file;

    // Try to use pdf-parse if available
    try {
      // Use dynamic import for better compatibility with Next.js/Bun
      const pdfParseModule = await import("pdf-parse");
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const data = await pdfParse(buffer);
      
      return {
        text: data.text,
        pageCount: data.numpages,
        metadata: {
          title: data.info?.Title,
          author: data.info?.Author,
          subject: data.info?.Subject,
        },
      };
    } catch (e) {
      // pdf-parse not available or failed, use fallback
      // Only warn if it's not a module not found error (expected in some setups)
      if (!(e instanceof Error && e.message.includes("Cannot find module"))) {
        console.warn("pdf-parse not available, using fallback parser:", e.message);
      }
      return parsePDFFallback(buffer);
    }
  } catch (error) {
    console.error("Error parsing PDF:", error);
    throw new Error(`Failed to parse PDF: ${error}`);
  }
}

/**
 * Fallback PDF parser (basic text extraction)
 * This is a minimal implementation - install pdf-parse for better results
 */
async function parsePDFFallback(buffer: Buffer): Promise<PDFParseResult> {
  // Basic text extraction from PDF
  // This is very limited - install pdf-parse for production use
  const text = buffer.toString("utf-8");
  
  // Try to extract readable text (very basic)
  const textMatch = text.match(/\/Text\s*\(([^)]+)\)/g);
  const extractedText = textMatch 
    ? textMatch.map(m => m.replace(/\/Text\s*\(|\)/g, "")).join(" ")
    : "PDF content extracted (install pdf-parse for better results)";
  
  // Estimate page count (rough approximation)
  const pageCount = (text.match(/\/Type\s*\/Page[^s]/g) || []).length || 1;
  
  return {
    text: extractedText || "Unable to extract text. Please install pdf-parse: npm install pdf-parse",
    pageCount,
  };
}

/**
 * Extract text from PDF file stored in filesystem
 */
export async function parsePDFFromPath(filePath: string): Promise<PDFParseResult> {
  const fs = await import("fs/promises");
  const buffer = await fs.readFile(filePath);
  return parsePDF(buffer);
}
