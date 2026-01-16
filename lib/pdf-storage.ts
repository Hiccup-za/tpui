/**
 * PDF Storage Utility
 * 
 * Handles storage and retrieval of PDF files on local filesystem.
 */

import fs from "fs";
import path from "path";

const STORAGE_DIR = path.join(process.cwd(), "storage", "documents");

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

/**
 * Get PDF file path for a document
 */
function getPDFPath(documentId: string): string {
  return path.join(STORAGE_DIR, `${documentId}.pdf`);
}

/**
 * Store PDF buffer by document ID
 */
export function storePDF(documentId: string, buffer: Buffer): void {
  const filePath = getPDFPath(documentId);
  fs.writeFileSync(filePath, buffer);
}

/**
 * Get PDF buffer by document ID
 * Returns null if not found
 */
export function getPDFBuffer(documentId: string): Buffer | null {
  const filePath = getPDFPath(documentId);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }
  
  try {
    return fs.readFileSync(filePath);
  } catch (error) {
    console.error(`Error reading PDF for document ${documentId}:`, error);
    return null;
  }
}

/**
 * Delete PDF file by document ID
 */
export function deletePDF(documentId: string): boolean {
  const filePath = getPDFPath(documentId);
  
  if (!fs.existsSync(filePath)) {
    return false;
  }
  
  try {
    fs.unlinkSync(filePath);
    return true;
  } catch (error) {
    console.error(`Error deleting PDF for document ${documentId}:`, error);
    return false;
  }
}

/**
 * Check if PDF exists for document ID
 */
export function hasPDF(documentId: string): boolean {
  const filePath = getPDFPath(documentId);
  return fs.existsSync(filePath);
}
