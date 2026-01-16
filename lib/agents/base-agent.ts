import { Requirement, TestCase } from "@/types";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface RalphLoopOptions {
  maxIterations?: number;
  completionPromise: string;
  validator: (output: any) => ValidationResult;
  onIteration?: (iteration: number, output: any, errors: string[]) => void;
}

export abstract class BaseAgent {
  protected abstract getSystemPrompt(task: string, completionPromise: string): string;
  protected abstract parseResponse(response: any): any;
  protected abstract getTools(): any[];

  /**
   * Core Ralph Wiggum loop implementation
   * Iteratively refines output until validation passes
   */
  async ralphLoop(
    task: string,
    input: any,
    options: RalphLoopOptions
  ): Promise<any> {
    const {
      maxIterations = 20,
      completionPromise,
      validator,
      onIteration,
    } = options;

    let iteration = 0;
    let output: any = null;
    let errors: string[] = [];
    let previousAttempts: string[] = [];

    const systemPrompt = this.getSystemPrompt(task, completionPromise);

    while (iteration < maxIterations) {
      iteration++;

      // Build prompt with current state and previous errors
      const userPrompt = this.buildPrompt(task, input, output, errors, previousAttempts);

      try {
        // Call LLM (in production, this would be your actual LLM API call)
        const response = await this.callLLM(systemPrompt, userPrompt);

        // Parse the response
        output = this.parseResponse(response);

        // Check for completion promise
        const hasCompletionPromise = this.checkCompletionPromise(response, completionPromise);

        if (hasCompletionPromise) {
          // Validate output
          const validation = validator(output);
          
          if (validation.valid) {
            // Success!
            if (onIteration) {
              onIteration(iteration, output, []);
            }
            return output;
          } else {
            // Validation failed, continue loop
            errors = validation.errors;
            previousAttempts.push(
              `Iteration ${iteration}: ${errors.join("; ")}`
            );
            
            if (onIteration) {
              onIteration(iteration, output, errors);
            }
          }
        } else {
          // No completion promise yet
          errors = ["Completion promise not found in response"];
          previousAttempts.push(
            `Iteration ${iteration}: Missing completion promise`
          );
          
          if (onIteration) {
            onIteration(iteration, output, errors);
          }
        }
      } catch (error) {
        errors = [`Error in iteration ${iteration}: ${error}`];
        previousAttempts.push(errors[0]);
        
        if (onIteration) {
          onIteration(iteration, null, errors);
        }
      }

      // Small delay to prevent rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Max iterations reached
    throw new Error(
      `Ralph loop exceeded ${maxIterations} iterations. Last errors: ${errors.join(", ")}`
    );
  }

  protected buildPrompt(
    task: string,
    input: any,
    currentOutput: any,
    errors: string[],
    previousAttempts: string[]
  ): string {
    let prompt = `Task: ${task}\n\n`;

    // Add input context
    prompt += `Input:\n${JSON.stringify(input, null, 2)}\n\n`;

    // Add current output if exists
    if (currentOutput) {
      prompt += `Current Output:\n${JSON.stringify(currentOutput, null, 2)}\n\n`;
    }

    // Add errors if any
    if (errors.length > 0) {
      prompt += `Validation Errors (fix these):\n${errors.map((e, i) => `${i + 1}. ${e}`).join("\n")}\n\n`;
    }

    // Add previous attempts summary
    if (previousAttempts.length > 0) {
      prompt += `Previous Attempts:\n${previousAttempts.slice(-3).join("\n")}\n\n`;
    }

    prompt += `Please fix any issues and ensure the output passes validation.`;

    return prompt;
  }

  protected checkCompletionPromise(response: any, promise: string): boolean {
    const content = typeof response === "string" 
      ? response 
      : response?.content || JSON.stringify(response);
    
    // Check for promise tag first
    if (content.includes(`<promise>${promise}</promise>`)) {
      return true;
    }
    
    // Also check if promise text is in content (more lenient)
    if (content.includes(promise)) {
      return true;
    }
    
    // For mock responses, also check if it's a valid completion
    // This helps with mock LLM responses
    if (content.includes("<promise>") && content.includes("</promise>")) {
      // Extract promise from tag
      const promiseMatch = content.match(/<promise>(.*?)<\/promise>/);
      if (promiseMatch && promiseMatch[1].trim().length > 0) {
        return true; // Any promise tag indicates completion
      }
    }
    
    return false;
  }

  /**
   * Placeholder for LLM API call
   * In production, replace with actual LLM service (OpenAI, Anthropic, etc.)
   */
  protected async callLLM(systemPrompt: string, userPrompt: string): Promise<any> {
    // Import LLM client
    const { LLMClient } = await import("./llm-client");
    const llm = new LLMClient();
    
    // Call LLM with system and user prompts
    const response = await llm.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ], {
      temperature: 0.7,
      maxTokens: 2000,
      tools: this.getTools(),
    });
    
    return response;
  }
}
