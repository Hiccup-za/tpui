import { BaseAgent, ValidationResult, RalphLoopOptions } from "./base-agent";
import { Validators } from "./validators";
import { Requirement, TestCase } from "@/types";
import { DocumentService } from "@/lib/db/document-service";

export interface ProcessingContext {
  pdfContent: string;
  requirements?: Requirement[];
  testCases?: TestCase[];
  labeledNegative?: TestCase[];
  classified?: TestCase[];
  final?: {
    requirements: Requirement[];
    testCases: TestCase[];
  };
}

export class ProcessingAgent extends BaseAgent {
  private validators = new Validators();

  /**
   * Main processing orchestration
   * Executes all 6 stages sequentially using Ralph loops
   */
  async processDocument(documentId: string): Promise<void> {
    const document = DocumentService.getDocument(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }

    // Extract PDF content
    let pdfContent = "";
    try {
      // Retrieve PDF buffer from storage
      const { getPDFBuffer } = await import("@/lib/pdf-storage");
      const pdfBuffer = getPDFBuffer(documentId);
      
      if (pdfBuffer) {
        // Parse PDF to extract text
        const { parsePDF } = await import("@/lib/pdf-parser");
        const parsed = await parsePDF(pdfBuffer);
        pdfContent = parsed.text;
      } else {
        // Fallback for simulated documents
        pdfContent = `[Simulated PDF Content for ${document.fileName}]`;
      }
    } catch (error) {
      console.error("Error extracting PDF content:", error);
      // Use fallback content
      pdfContent = `[PDF Content for ${document.fileName} - Error: ${error}]`;
    }

    const context: ProcessingContext = {
      pdfContent,
    };

    try {
      // Stage 1: Requirement Extraction
      await this.updateStage(documentId, 0, "processing");
      context.requirements = await this.extractRequirements(
        documentId,
        context.pdfContent
      );
      await this.updateStage(documentId, 0, "completed");

      // Stage 2: Test Case Generation
      await this.updateStage(documentId, 1, "processing");
      context.testCases = await this.generateTestCases(
        documentId,
        context.requirements
      );
      await this.updateStage(documentId, 1, "completed");

      // Stage 3: Negative Test Labeling
      await this.updateStage(documentId, 2, "processing");
      context.labeledNegative = await this.labelNegativeTests(
        documentId,
        context.testCases
      );
      await this.updateStage(documentId, 2, "completed");

      // Stage 4: Test Type Classification
      await this.updateStage(documentId, 3, "processing");
      context.classified = await this.classifyTestTypes(
        documentId,
        context.labeledNegative
      );
      await this.updateStage(documentId, 3, "completed");

      // Stage 5: Final Review
      await this.updateStage(documentId, 4, "processing");
      context.final = await this.finalReview(
        documentId,
        context.requirements,
        context.classified
      );
      await this.updateStage(documentId, 4, "completed");

      // Stage 6: Document Finalization
      await this.updateStage(documentId, 5, "processing");
      await this.finalizeDocument(documentId, context.final);
      await this.updateStage(documentId, 5, "completed");

      // Mark processing as complete
      // Document status is already updated via DocumentService.updateDocumentStatus above
    } catch (error) {
      // Mark document status as error
      DocumentService.updateDocumentStatus(documentId, "error");
      throw error;
    }
  }

  /**
   * Stage 1: Extract Requirements
   */
  private async extractRequirements(
    documentId: string,
    pdfContent: string
  ): Promise<Requirement[]> {
    const task = "Extract all functional and non-functional requirements from the PRD document";
    
    const options: RalphLoopOptions = {
      completionPromise: "All requirements extracted and validated",
      validator: (output) => this.validators.validateRequirements(output),
      maxIterations: 15,
      onIteration: (iteration, output, errors) => {
        this.logIteration(documentId, 0, iteration, errors);
      },
    };

    return await this.ralphLoop(task, { pdfContent }, options);
  }

  /**
   * Stage 2: Generate Test Cases
   */
  private async generateTestCases(
    documentId: string,
    requirements: Requirement[]
  ): Promise<TestCase[]> {
    const task = "Generate positive and negative test cases for each requirement using the 7 testing principles";
    
    const options: RalphLoopOptions = {
      completionPromise: "All test cases generated and conform to 7 testing principles",
      validator: (output) => this.validators.validateTestCases(output),
      maxIterations: 20,
      onIteration: (iteration, output, errors) => {
        this.logIteration(documentId, 1, iteration, errors);
      },
    };

    // Only pass requirements, not full PDF
    return await this.ralphLoop(task, { requirements }, options);
  }

  /**
   * Stage 3: Label Negative Tests
   */
  private async labelNegativeTests(
    documentId: string,
    testCases: TestCase[]
  ): Promise<TestCase[]> {
    const task = "Review all test cases and correctly label negative test cases";
    
    const options: RalphLoopOptions = {
      completionPromise: "All negative test cases properly labeled",
      validator: (output) => this.validators.validateNegativeLabels(output),
      maxIterations: 10,
      onIteration: (iteration, output, errors) => {
        this.logIteration(documentId, 2, iteration, errors);
      },
    };

    return await this.ralphLoop(task, { testCases }, options);
  }

  /**
   * Stage 4: Classify Test Types
   */
  private async classifyTestTypes(
    documentId: string,
    testCases: TestCase[]
  ): Promise<TestCase[]> {
    const task = "Classify all test cases by their testing types (unit, integration, system, etc.)";
    
    const options: RalphLoopOptions = {
      completionPromise: "All test cases classified by type",
      validator: (output) => this.validators.validateTestTypes(output),
      maxIterations: 10,
      onIteration: (iteration, output, errors) => {
        this.logIteration(documentId, 3, iteration, errors);
      },
    };

    return await this.ralphLoop(task, { testCases }, options);
  }

  /**
   * Stage 5: Final Review
   */
  private async finalReview(
    documentId: string,
    requirements: Requirement[],
    testCases: TestCase[]
  ): Promise<{ requirements: Requirement[]; testCases: TestCase[] }> {
    const task = "Review all requirements and test cases to ensure they conform to the 7 testing principles";
    
    // Create lightweight summary for context
    const summary = {
      requirementCount: requirements.length,
      testCaseCount: testCases.length,
      functionalRequirements: requirements.filter((r) => r.type === "functional").length,
      nonFunctionalRequirements: requirements.filter((r) => r.type === "non-functional").length,
      requirements,
      testCases,
    };
    
    const options: RalphLoopOptions = {
      completionPromise: "Final review complete - all requirements and test cases validated",
      validator: (output) => this.validators.validateFinalReview(output),
      maxIterations: 15,
      onIteration: (iteration, output, errors) => {
        this.logIteration(documentId, 4, iteration, errors);
      },
    };

    return await this.ralphLoop(task, summary, options);
  }

  /**
   * Stage 6: Finalize Document
   */
  private async finalizeDocument(
    documentId: string,
    final: { requirements: Requirement[]; testCases: TestCase[] }
  ): Promise<void> {
    // Update test cases in requirements
    final.requirements.forEach((req) => {
      req.testCases = final.testCases.filter((tc) => tc.requirementId === req.id);
    });

    // Save requirements and test cases to database
    DocumentService.saveRequirements(documentId, final.requirements);

    // Update document status to completed
    DocumentService.updateDocumentStatus(documentId, "completed", new Date());
  }

  /**
   * Update stage status in database
   */
  private async updateStage(
    documentId: string,
    stageIndex: number,
    status: "processing" | "completed" | "error"
  ): Promise<void> {
    // Stage IDs are 1-indexed in the database
    const stageId = stageIndex + 1;
    
    const startedAt = status === "processing" ? new Date() : undefined;
    const completedAt = status === "completed" ? new Date() : undefined;
    
    DocumentService.updateStage(documentId, stageId, status, startedAt, completedAt);
  }

  /**
   * Log iteration progress
   */
  private logIteration(
    documentId: string,
    stageIndex: number,
    iteration: number,
    errors: string[]
  ): void {
    console.log(
      `[Document ${documentId}] Stage ${stageIndex + 1}, Iteration ${iteration}${errors.length > 0 ? ` - Errors: ${errors.join(", ")}` : ""}`
    );
  }

  // BaseAgent abstract method implementations

  protected getSystemPrompt(task: string, completionPromise: string): string {
    return `You are a specialized AI agent working on: ${task}

Process:
1. Analyze the input carefully
2. Generate the required output following best practices
3. Self-validate your work
4. If validation fails, identify issues and fix them
5. Repeat until perfect

When complete, output: <promise>${completionPromise}</promise>

If stuck after multiple iterations:
- Document what you've accomplished
- List remaining issues
- Suggest next steps`;
  }

  protected parseResponse(response: any): any {
    // Parse LLM response content
    const content = typeof response === "string" 
      ? response 
      : response?.content || JSON.stringify(response);
    
    // Remove promise tag before parsing JSON to avoid regex matching issues
    const contentWithoutPromise = content.replace(/<promise>[\s\S]*?<\/promise>/g, '').trim();
    
    // Try to extract JSON array or object from response
    // Handle both [{}] and {} formats
    // Use non-greedy matching to stop at first valid JSON boundary
    // For arrays: match from [ to the first balanced ]
    // For objects: match from { to the first balanced }
    let jsonArrayMatch = null;
    let jsonObjectMatch = null;
    
    // Try to find JSON array - match balanced brackets
    let bracketCount = 0;
    let arrayStart = -1;
    for (let i = 0; i < contentWithoutPromise.length; i++) {
      if (contentWithoutPromise[i] === '[') {
        if (bracketCount === 0) arrayStart = i;
        bracketCount++;
      } else if (contentWithoutPromise[i] === ']') {
        bracketCount--;
        if (bracketCount === 0 && arrayStart !== -1) {
          jsonArrayMatch = contentWithoutPromise.substring(arrayStart, i + 1);
          break;
        }
      }
    }
    
    // Try to find JSON object - match balanced braces
    let braceCount = 0;
    let objectStart = -1;
    for (let i = 0; i < contentWithoutPromise.length; i++) {
      if (contentWithoutPromise[i] === '{') {
        if (braceCount === 0) objectStart = i;
        braceCount++;
      } else if (contentWithoutPromise[i] === '}') {
        braceCount--;
        if (braceCount === 0 && objectStart !== -1) {
          jsonObjectMatch = contentWithoutPromise.substring(objectStart, i + 1);
          break;
        }
      }
    }
    
    // Determine if object is a fragment within the array
    let objectIsFragment = false;
    if (jsonArrayMatch && jsonObjectMatch) {
      // Check if object match is contained within array match
      const arrayStart = contentWithoutPromise.indexOf(jsonArrayMatch);
      const arrayEnd = arrayStart + jsonArrayMatch.length;
      const objectStart = contentWithoutPromise.indexOf(jsonObjectMatch);
      const objectEnd = objectStart + jsonObjectMatch.length;
      objectIsFragment = objectStart >= arrayStart && objectEnd <= arrayEnd;
    }
    
    // Prefer object match ONLY if:
    // 1. It's the final review format (has requirements and testCases), OR
    // 2. It's not a fragment within an array
    if (jsonObjectMatch && !objectIsFragment) {
      try {
        const parsed = JSON.parse(jsonObjectMatch);
        // If it has both 'requirements' and 'testCases' properties, it's the final review format - return as-is
        if (parsed && !Array.isArray(parsed) && parsed.requirements && parsed.testCases) {
          return parsed; // Return object directly for final review
        }
        // For other single objects, wrap in array
        if (parsed && !Array.isArray(parsed)) {
          return [parsed];
        }
        return parsed;
      } catch (e) {
        console.error("Failed to parse JSON object:", e);
      }
    }
    
    if (jsonArrayMatch) {
      try {
        const parsed = JSON.parse(jsonArrayMatch);
        return parsed;
      } catch (e) {
        console.error("Failed to parse JSON array:", e);
      }
    }
    
    // If no JSON found, return empty array as fallback
    console.warn("No valid JSON found in LLM response");
    return [];
  }

  protected getTools(): any[] {
    // In production, define tools for function calling
    // Example tools for structured output:
    /*
    return [
      {
        type: "function",
        function: {
          name: "extract_requirement",
          description: "Extract a single requirement from the document",
          parameters: {
            type: "object",
            properties: {
              id: { type: "string" },
              type: { type: "string", enum: ["functional", "non-functional"] },
              description: { type: "string" },
            },
            required: ["id", "type", "description"],
          },
        },
      },
    ];
    */
    return [];
  }
}
