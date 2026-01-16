# Agent Architecture - Ralph Wiggum Loop Implementation

This directory contains the AI agent implementation using the Ralph Wiggum loop technique for iterative, self-correcting processing.

## Architecture Overview

The system uses a **single agent with stage-based Ralph loops** pattern:

1. **BaseAgent** (`base-agent.ts`) - Core Ralph Wiggum loop implementation
2. **ProcessingAgent** (`processing-agent.ts`) - Orchestrates the 6 processing stages
3. **Validators** (`validators.ts`) - Validation functions for each stage
4. **LLMClient** (`llm-client.ts`) - LLM integration layer (replace with your LLM service)
5. **Prompts** (`prompts.ts`) - Stage-specific prompts following Ralph best practices

## How It Works

### Ralph Wiggum Loop Pattern

Each stage follows this iterative pattern:

```
1. Agent receives task and input
2. Agent generates output using LLM
3. Validator checks output quality
4. If validation fails → feed errors back to agent
5. Agent fixes issues and regenerates
6. Repeat until validation passes or max iterations reached
```

### Processing Stages

1. **Requirement Extraction** - Extracts functional and non-functional requirements from PDF
2. **Test Case Generation** - Creates positive and negative test cases per requirement
3. **Negative Test Labeling** - Correctly labels negative test cases
4. **Test Type Classification** - Classifies test cases by type (unit, integration, etc.)
5. **Final Review** - Validates everything conforms to 7 testing principles
6. **Document Finalization** - Saves the final document

## Integration with LLM Services

### Current Implementation

The system uses a mock LLM client for development. To integrate with a real LLM:

1. **Update `llm-client.ts`**:
   - Replace `mockChat()` with actual API calls
   - Add your API key to environment variables
   - Configure model parameters

### Example: OpenAI Integration

```typescript
// In llm-client.ts
async chat(messages: LLMMessage[], options: LLMOptions = {}): Promise<LLMResponse> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: this.model, // e.g., "gpt-4" or "gpt-3.5-turbo"
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
}
```

### Example: Anthropic Claude Integration

```typescript
async chat(messages: LLMMessage[], options: LLMOptions = {}): Promise<LLMResponse> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: this.model, // e.g., "claude-3-opus-20240229"
      max_tokens: options.maxTokens || 2000,
      messages: messages,
      temperature: options.temperature || 0.7,
    }),
  });
  
  const data = await response.json();
  return {
    content: data.content[0].text,
    usage: data.usage,
  };
}
```

## Context Window Management

The architecture keeps context windows low by:

1. **Stage Isolation**: Each stage only receives what it needs
   - Stage 1: PDF content only
   - Stage 2: Requirements only (not PDF)
   - Stage 3-4: Test cases only
   - Stage 5: Summary + validation rules

2. **Incremental Processing**: Data flows sequentially, not all at once

3. **Validation Feedback**: Only errors are passed back, not full context

## Configuration

### Environment Variables

Add to your `.env.local`:

```bash
# For OpenAI
OPENAI_API_KEY=your_key_here

# For Anthropic
ANTHROPIC_API_KEY=your_key_here

# Model selection
LLM_MODEL=gpt-4  # or claude-3-opus-20240229
```

### Max Iterations

Adjust max iterations per stage in `processing-agent.ts`:

```typescript
const options: RalphLoopOptions = {
  maxIterations: 20, // Adjust based on complexity
  // ...
};
```

## PDF Parsing

### Current Implementation

Uses a basic fallback parser. For production:

1. Install `pdf-parse`:
   ```bash
   npm install pdf-parse
   ```

2. The parser will automatically use it if available

### Alternative: PDF.js

```bash
npm install pdfjs-dist
```

Then update `pdf-parser.ts` to use PDF.js instead.

## Testing

The mock implementation allows testing the flow without LLM costs:

1. Upload a document (or use Simulate button)
2. Watch stages process with mock data
3. Verify the flow works correctly
4. Replace with real LLM when ready

## Best Practices

1. **Clear Completion Criteria**: Each stage has explicit completion promises
2. **Self-Correction**: Agents fix their own mistakes through validation loops
3. **Incremental Goals**: Stages build on previous work
4. **Error Handling**: Max iterations prevent infinite loops
5. **Context Management**: Only pass necessary data between stages

## Next Steps

1. ✅ Implement Ralph Wiggum loop architecture
2. ✅ Create validation functions
3. ✅ Add PDF parsing capability
4. ⏳ Integrate with real LLM service (OpenAI/Anthropic)
5. ⏳ Add function calling tools for structured output
6. ⏳ Implement proper PDF storage (S3/filesystem)
7. ⏳ Add error recovery and retry logic
8. ⏳ Add monitoring and logging
