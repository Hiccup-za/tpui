/**
 * LLM Client Interface
 * 
 * This is a placeholder for actual LLM integration.
 * Replace the implementation with your preferred LLM service:
 * - OpenAI (GPT-4, GPT-3.5)
 * - Anthropic (Claude)
 * - Local models (Ollama, etc.)
 */

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface LLMOptions {
  temperature?: number;
  maxTokens?: number;
  tools?: any[];
}

export class LLMClient {
  private apiKey?: string;
  private model: string;

  constructor(model: string = "gpt-4", apiKey?: string) {
    this.model = model;
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY;
  }

  /**
   * Main chat completion method
   * Replace this with your actual LLM API call
   */
  async chat(
    messages: LLMMessage[],
    options: LLMOptions = {}
  ): Promise<LLMResponse> {
    // TODO: Replace with actual LLM API call
    // Example for OpenAI:
    /*
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.maxTokens || 2000,
        tools: options.tools,
      }),
    });
    
    const data = await response.json();
    return {
      content: data.choices[0].message.content,
      usage: data.usage,
    };
    */

    // Example for Anthropic:
    /*
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: options.maxTokens || 2000,
        messages: messages,
        temperature: options.temperature || 0.7,
        tools: options.tools,
      }),
    });
    
    const data = await response.json();
    return {
      content: data.content[0].text,
      usage: data.usage,
    };
    */

    // Mock implementation for development
    return this.mockChat(messages, options);
  }

  /**
   * Mock implementation for development
   * Remove this when implementing real LLM calls
   */
  private async mockChat(
    messages: LLMMessage[],
    options: LLMOptions
  ): Promise<LLMResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content.toLowerCase();

    // Extract completion promise and determine stage from system prompt
    const systemMessage = messages.find(m => m.role === "system");
    let completionPromise = "COMPLETE"; // Default fallback
    let stage = "unknown";
    
    if (systemMessage) {
      // Extract promise from system prompt: <promise>${completionPromise}</promise>
      const promiseMatch = systemMessage.content.match(/<promise>(.*?)<\/promise>/);
      if (promiseMatch) {
        completionPromise = promiseMatch[1];
      }
      
      // Determine stage from completion promise (most reliable) or system prompt task description
      // Use completion promise first as it's unique per stage
      if (completionPromise.includes("requirements extracted")) {
        stage = "extract";
      } else if (completionPromise.includes("test cases generated")) {
        stage = "generate";
      } else if (completionPromise.includes("negative test cases properly labeled")) {
        stage = "label";
      } else if (completionPromise.includes("test cases classified by type")) {
        stage = "classify";
      } else if (completionPromise.includes("Final review complete")) {
        stage = "review";
      } else {
        // Fallback to system prompt task description
        const systemContent = systemMessage.content.toLowerCase();
        if (systemContent.includes("extract") && systemContent.includes("requirement")) {
          stage = "extract";
        } else if (systemContent.includes("test case") && systemContent.includes("generate") && !systemContent.includes("label") && !systemContent.includes("classify")) {
          stage = "generate";
        } else if (systemContent.includes("label") && systemContent.includes("negative")) {
          stage = "label";
        } else if (systemContent.includes("classify") && systemContent.includes("type")) {
          stage = "classify";
        } else if (systemContent.includes("review") && systemContent.includes("final")) {
          stage = "review";
        }
      }
    }

    // Generate mock responses based on stage (preferred) or content (fallback)
    // IMPORTANT: Check stage first, as content may contain keywords from previous iterations
    let mockResponse = "";

    if (stage === "extract") {
      // Stage 1: Requirements extraction - must have functional and non-functional
      mockResponse = JSON.stringify([
        {
          id: "req-1",
          type: "functional",
          description: "The system shall allow users to authenticate using email and password",
          testCases: [],
        },
        {
          id: "req-2",
          type: "non-functional",
          description: "The system shall respond to authentication requests within 2 seconds under normal load",
          testCases: [],
        },
      ]);
    } else if (stage === "generate") {
      // Stage 2: Test case generation - must have both positive and negative
      mockResponse = JSON.stringify([
        {
          id: "tc-1",
          requirementId: "req-1",
          description: "Verify user can login with valid email and password",
          isPositive: true,
          isNegative: false,
          testTypes: [],
        },
        {
          id: "tc-2",
          requirementId: "req-1",
          description: "Verify system rejects login with invalid password",
          isPositive: false,
          isNegative: true,
          testTypes: [],
        },
        {
          id: "tc-3",
          requirementId: "req-2",
          description: "Verify authentication response time is under 2 seconds",
          isPositive: true,
          isNegative: false,
          testTypes: [],
        },
        {
          id: "tc-4",
          requirementId: "req-2",
          description: "Verify system fails when authentication takes more than 2 seconds",
          isPositive: false,
          isNegative: true,
          testTypes: [],
        },
      ]);
    } else if (stage === "label") {
      // Stage 3: Negative test labeling - must have negative tests properly labeled
      mockResponse = JSON.stringify([
        {
          id: "tc-1",
          requirementId: "req-1",
          description: "Verify user can login with valid email and password",
          isPositive: true,
          isNegative: false,
          testTypes: [],
        },
        {
          id: "tc-2",
          requirementId: "req-1",
          description: "Verify system rejects login with invalid password",
          isPositive: false,
          isNegative: true,
          testTypes: [],
        },
        {
          id: "tc-3",
          requirementId: "req-2",
          description: "Verify authentication response time is under 2 seconds",
          isPositive: true,
          isNegative: false,
          testTypes: [],
        },
        {
          id: "tc-4",
          requirementId: "req-2",
          description: "Verify system fails when authentication takes more than 2 seconds",
          isPositive: false,
          isNegative: true,
          testTypes: [],
        },
      ]);
    } else if (stage === "classify") {
      // Stage 4: Test type classification - all test cases must have testTypes
      mockResponse = JSON.stringify([
        {
          id: "tc-1",
          requirementId: "req-1",
          description: "Verify user can login with valid email and password",
          isPositive: true,
          isNegative: false,
          testTypes: ["unit", "integration"],
        },
        {
          id: "tc-2",
          requirementId: "req-1",
          description: "Verify system rejects login with invalid password",
          isPositive: false,
          isNegative: true,
          testTypes: ["unit", "security"],
        },
        {
          id: "tc-3",
          requirementId: "req-2",
          description: "Verify authentication response time is under 2 seconds",
          isPositive: true,
          isNegative: false,
          testTypes: ["performance", "integration"],
        },
        {
          id: "tc-4",
          requirementId: "req-2",
          description: "Verify system fails when authentication takes more than 2 seconds",
          isPositive: false,
          isNegative: true,
          testTypes: ["performance", "system"],
        },
      ]);
    } else if (stage === "review" || content.includes("review") || content.includes("final")) {
      // Stage 5: Final review - must have requirements and testCases, each requirement needs test cases
      mockResponse = JSON.stringify({
        requirements: [
          {
            id: "req-1",
            type: "functional",
            description: "The system shall allow users to authenticate using email and password",
            testCases: [],
          },
          {
            id: "req-2",
            type: "non-functional",
            description: "The system shall respond to authentication requests within 2 seconds under normal load",
            testCases: [],
          },
        ],
        testCases: [
          {
            id: "tc-1",
            requirementId: "req-1",
            description: "Verify user can login with valid email and password",
            isPositive: true,
            isNegative: false,
            testTypes: ["unit", "integration"],
          },
          {
            id: "tc-2",
            requirementId: "req-1",
            description: "Verify system rejects login with invalid password",
            isPositive: false,
            isNegative: true,
            testTypes: ["unit", "security"],
          },
          {
            id: "tc-3",
            requirementId: "req-2",
            description: "Verify authentication response time is under 2 seconds",
            isPositive: true,
            isNegative: false,
            testTypes: ["performance", "integration"],
          },
          {
            id: "tc-4",
            requirementId: "req-2",
            description: "Verify system fails when authentication takes more than 2 seconds",
            isPositive: false,
            isNegative: true,
            testTypes: ["performance", "system"],
          },
        ],
      });
    } else {
      // Fallback: try to detect from content if stage detection failed
      if (content.includes("requirement") && content.includes("extract") && !content.includes("test case")) {
        // Stage 1 fallback
        mockResponse = JSON.stringify([
          {
            id: "req-1",
            type: "functional",
            description: "The system shall allow users to authenticate using email and password",
            testCases: [],
          },
          {
            id: "req-2",
            type: "non-functional",
            description: "The system shall respond to authentication requests within 2 seconds under normal load",
            testCases: [],
          },
        ]);
      } else if (content.includes("test case") || content.includes("generate")) {
        // Stage 2 fallback
        mockResponse = JSON.stringify([
          {
            id: "tc-1",
            requirementId: "req-1",
            description: "Verify user can login with valid email and password",
            isPositive: true,
            isNegative: false,
            testTypes: [],
          },
          {
            id: "tc-2",
            requirementId: "req-1",
            description: "Verify system rejects login with invalid password",
            isPositive: false,
            isNegative: true,
            testTypes: [],
          },
          {
            id: "tc-3",
            requirementId: "req-2",
            description: "Verify authentication response time is under 2 seconds",
            isPositive: true,
            isNegative: false,
            testTypes: [],
          },
          {
            id: "tc-4",
            requirementId: "req-2",
            description: "Verify system fails when authentication takes more than 2 seconds",
            isPositive: false,
            isNegative: true,
            testTypes: [],
          },
        ]);
      } else {
        mockResponse = JSON.stringify({ status: "complete" });
      }
    }

    // Always add completion promise (even if there were previous errors)
    mockResponse += `\n\n<promise>${completionPromise}</promise>`;

    return {
      content: mockResponse,
      usage: {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      },
    };
  }
}
