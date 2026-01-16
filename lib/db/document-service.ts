import { getDatabase } from "./database";
import { Document, Requirement, TestCase, AgentStage } from "@/types";
import { AGENT_STAGES } from "@/lib/storage";

/**
 * Document Service
 * Handles all database operations for documents
 */

export class DocumentService {
  /**
   * Create a new document
   */
  static createDocument(document: Omit<Document, "requirements">): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO documents (id, file_name, uploaded_at, status, completed_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    stmt.run(
      document.id,
      document.fileName,
      document.uploadedAt.getTime(),
      document.status,
      document.completedAt?.getTime() || null
    );
    
    // Initialize agent stages
    this.initializeStages(document.id);
  }
  
  /**
   * Initialize agent stages for a document
   */
  static initializeStages(documentId: string): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      INSERT INTO agent_stages (document_id, stage_id, name, description, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    AGENT_STAGES.forEach((stage) => {
      stmt.run(
        documentId,
        stage.id,
        stage.name,
        stage.description,
        "pending"
      );
    });
  }
  
  /**
   * Get document by ID
   */
  static getDocument(documentId: string): Document | null {
    const db = getDatabase();
    const doc = db.prepare(`
      SELECT * FROM documents WHERE id = ?
    `).get(documentId) as any;
    
    if (!doc) return null;
    
    const stages = this.getStages(documentId);
    const requirements = this.getRequirements(documentId);
    
    return {
      id: doc.id,
      fileName: doc.file_name,
      uploadedAt: new Date(doc.uploaded_at),
      status: doc.status as Document["status"],
      stages,
      requirements,
      completedAt: doc.completed_at ? new Date(doc.completed_at) : undefined,
    };
  }
  
  /**
   * Get all documents
   */
  static getAllDocuments(): Document[] {
    const db = getDatabase();
    const docs = db.prepare(`
      SELECT * FROM documents ORDER BY uploaded_at DESC
    `).all() as any[];
    
    return docs.map((doc) => {
      const stages = this.getStages(doc.id);
      
      return {
        id: doc.id,
        fileName: doc.file_name,
        uploadedAt: new Date(doc.uploaded_at),
        status: doc.status as Document["status"],
        stages,
        completedAt: doc.completed_at ? new Date(doc.completed_at) : undefined,
      };
    });
  }
  
  /**
   * Update document status
   */
  static updateDocumentStatus(
    documentId: string,
    status: Document["status"],
    completedAt?: Date
  ): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE documents 
      SET status = ?, completed_at = ?
      WHERE id = ?
    `);
    
    stmt.run(status, completedAt?.getTime() || null, documentId);
  }
  
  /**
   * Delete document and all related data
   */
  static deleteDocument(documentId: string): boolean {
    const db = getDatabase();
    const stmt = db.prepare(`DELETE FROM documents WHERE id = ?`);
    const result = stmt.run(documentId);
    return result.changes > 0;
  }
  
  /**
   * Get agent stages for a document
   */
  static getStages(documentId: string): AgentStage[] {
    const db = getDatabase();
    const stages = db.prepare(`
      SELECT * FROM agent_stages 
      WHERE document_id = ? 
      ORDER BY stage_id ASC
    `).all(documentId) as any[];
    
    return stages.map((stage) => ({
      id: stage.stage_id,
      name: stage.name,
      description: stage.description,
      status: stage.status as AgentStage["status"],
      startedAt: stage.started_at ? new Date(stage.started_at) : undefined,
      completedAt: stage.completed_at ? new Date(stage.completed_at) : undefined,
    }));
  }
  
  /**
   * Update agent stage status
   */
  static updateStage(
    documentId: string,
    stageId: number,
    status: AgentStage["status"],
    startedAt?: Date,
    completedAt?: Date
  ): void {
    const db = getDatabase();
    const stmt = db.prepare(`
      UPDATE agent_stages 
      SET status = ?, started_at = ?, completed_at = ?
      WHERE document_id = ? AND stage_id = ?
    `);
    
    stmt.run(
      status,
      startedAt?.getTime() || null,
      completedAt?.getTime() || null,
      documentId,
      stageId
    );
  }
  
  /**
   * Get requirements for a document
   */
  static getRequirements(documentId: string): Requirement[] {
    const db = getDatabase();
    const requirements = db.prepare(`
      SELECT * FROM requirements WHERE document_id = ?
    `).all(documentId) as any[];
    
    return requirements.map((req) => {
      const testCases = this.getTestCases(req.id);
      return {
        id: req.id,
        number: req.number || undefined,
        type: req.type as Requirement["type"],
        description: req.description,
        testCases,
      };
    });
  }
  
  /**
   * Save requirements for a document
   */
  static saveRequirements(documentId: string, requirements: Requirement[]): void {
    const db = getDatabase();
    const reqStmt = db.prepare(`
      INSERT OR REPLACE INTO requirements (id, document_id, number, type, description)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const tcStmt = db.prepare(`
      INSERT OR REPLACE INTO test_cases 
      (id, requirement_id, document_id, description, is_positive, is_negative, test_types)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const transaction = db.transaction(() => {
      requirements.forEach((req) => {
        reqStmt.run(req.id, documentId, req.number || null, req.type, req.description);
        
        req.testCases.forEach((tc) => {
          tcStmt.run(
            tc.id,
            tc.requirementId,
            documentId,
            tc.description,
            tc.isPositive ? 1 : 0,
            tc.isNegative ? 1 : 0,
            JSON.stringify(tc.testTypes)
          );
        });
      });
    });
    
    transaction();
  }
  
  /**
   * Get test cases for a requirement
   */
  static getTestCases(requirementId: string): TestCase[] {
    const db = getDatabase();
    const testCases = db.prepare(`
      SELECT * FROM test_cases WHERE requirement_id = ?
    `).all(requirementId) as any[];
    
    return testCases.map((tc) => ({
      id: tc.id,
      requirementId: tc.requirement_id,
      description: tc.description,
      isPositive: tc.is_positive === 1,
      isNegative: tc.is_negative === 1,
      testTypes: tc.test_types ? JSON.parse(tc.test_types) : [],
    }));
  }
}
