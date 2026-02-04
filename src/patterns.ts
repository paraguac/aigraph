/**
 * AIGraph Scanner - Detection Patterns
 * 
 * This file contains all the patterns used to detect AI models, frameworks,
 * platforms, and MCP servers/tools in codebases.
 */

import { DetectionPattern } from './types';

/**
 * Open Source AI Models - Direct usage patterns
 */
export const MODEL_PATTERNS: DetectionPattern[] = [
  // OpenAI Models
  {
    category: 'model',
    name: 'gpt-4',
    patterns: [
      /['"`]gpt-4['"`]/gi,
      /model\s*[=:]\s*['"`]gpt-4/gi,
      /gpt-4-turbo/gi,
      /gpt-4-vision/gi,
      /gpt-4o/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'openai', type: 'proprietary' }
  },
  {
    category: 'model',
    name: 'gpt-3.5',
    patterns: [
      /['"`]gpt-3\.5['"`]/gi,
      /gpt-3\.5-turbo/gi,
      /model\s*[=:]\s*['"`]gpt-3\.5/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'openai', type: 'proprietary' }
  },
  {
    category: 'model',
    name: 'o1',
    patterns: [
      /['"`]o1['"`]/gi,
      /['"`]o1-preview['"`]/gi,
      /['"`]o1-mini['"`]/gi,
      /model\s*[=:]\s*['"`]o1/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'openai', type: 'proprietary' }
  },
  // Anthropic Models
  {
    category: 'model',
    name: 'claude',
    patterns: [
      /['"`]claude-3/gi,
      /['"`]claude-2/gi,
      /claude-3-opus/gi,
      /claude-3-sonnet/gi,
      /claude-3-haiku/gi,
      /claude-3\.5-sonnet/gi,
      /model\s*[=:]\s*['"`]claude/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'anthropic', type: 'proprietary' }
  },
  // Meta/Facebook LLaMA Models
  {
    category: 'model',
    name: 'llama',
    patterns: [
      /llama[-_]?2/gi,
      /llama[-_]?3/gi,
      /['"`]llama['"`]/gi,
      /meta-llama/gi,
      /codellama/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'meta', type: 'open-source' }
  },
  // Mistral Models
  {
    category: 'model',
    name: 'mistral',
    patterns: [
      /['"`]mistral['"`]/gi,
      /mistral-7b/gi,
      /mistral-8x7b/gi,
      /mixtral/gi,
      /mistral-large/gi,
      /mistral-medium/gi,
      /mistral-small/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'mistral', type: 'open-source' }
  },
  // Google Models
  {
    category: 'model',
    name: 'gemini',
    patterns: [
      /['"`]gemini['"`]/gi,
      /gemini-pro/gi,
      /gemini-ultra/gi,
      /gemini-nano/gi,
      /gemini-1\.5/gi,
      /model\s*[=:]\s*['"`]gemini/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'google', type: 'proprietary' }
  },
  {
    category: 'model',
    name: 'palm',
    patterns: [
      /['"`]palm['"`]/gi,
      /palm-2/gi,
      /text-bison/gi,
      /chat-bison/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'google', type: 'proprietary' }
  },
  // Cohere Models
  {
    category: 'model',
    name: 'cohere',
    patterns: [
      /cohere[\.\/]command/gi,
      /['"']command-r['"']/gi,
      /['"']command-r-plus['"']/gi,
      /['"']command-light['"']/gi,
      /['"']command-nightly['"']/gi,
      /cohere\.generate/gi,
      /cohere\.chat/gi,
      /cohere\.Client/gi,
      /from\s+cohere\s+import/gi,
      /import\s+cohere/gi,
      /require\s*\(\s*['"]cohere['"]/gi,
    ],
    confidence: 'medium',
    metadata: { provider: 'cohere', type: 'proprietary' }
  },
  // Hugging Face Models
  {
    category: 'model',
    name: 'falcon',
    patterns: [
      /falcon-7b/gi,
      /falcon-40b/gi,
      /falcon-180b/gi,
      /tiiuae\/falcon/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'tii', type: 'open-source' }
  },
  {
    category: 'model',
    name: 'phi',
    patterns: [
      /microsoft\/phi/gi,
      /phi-2/gi,
      /phi-3/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'microsoft', type: 'open-source' }
  },
  // Stability AI Models
  {
    category: 'model',
    name: 'stable-diffusion',
    patterns: [
      /stable-diffusion/gi,
      /stabilityai/gi,
      /sdxl/gi,
      /sd-turbo/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'stability-ai', type: 'open-source' }
  },
  // Embedding Models
  {
    category: 'model',
    name: 'text-embedding',
    patterns: [
      /text-embedding-ada/gi,
      /text-embedding-3/gi,
      /ada-002/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'openai', type: 'proprietary' }
  },
];

/**
 * Agentic AI Frameworks
 */
export const FRAMEWORK_PATTERNS: DetectionPattern[] = [
  // OpenAI SDK - matches CodeQL ai-sdk-import detection
  {
    category: 'framework',
    name: 'openai-sdk',
    patterns: [
      /from\s+openai\s+import/gi,
      /import\s+.*\s+from\s+['"`]openai['"`]/gi,
      /import\s+OpenAI\s+from/gi,
      /require\s*\(\s*['"`]openai['"`]\s*\)/gi,
      /new\s+OpenAI\s*\(/gi,
    ],
    filePatterns: ['*.py', '*.js', '*.ts', '*.jsx', '*.tsx'],
    confidence: 'high',
    metadata: { type: 'sdk', provider: 'openai' }
  },
  // Anthropic SDK - matches CodeQL ai-sdk-import detection
  {
    category: 'framework',
    name: 'anthropic-sdk',
    patterns: [
      /from\s+anthropic\s+import/gi,
      /import\s+.*\s+from\s+['"`]@anthropic-ai\/sdk['"`]/gi,
      /import\s+Anthropic\s+from/gi,
      /require\s*\(\s*['"`]@anthropic-ai/gi,
      /new\s+Anthropic\s*\(/gi,
    ],
    filePatterns: ['*.py', '*.js', '*.ts', '*.jsx', '*.tsx'],
    confidence: 'high',
    metadata: { type: 'sdk', provider: 'anthropic' }
  },
  // Anthropic Claude Agent SDK (for building AI agents)
  {
    category: 'framework',
    name: 'claude-agent-sdk',
    patterns: [
      /import\s+.*\s+from\s+['"`]@anthropic-ai\/claude-agent-sdk['"`]/gi,
      /require\s*\(\s*['"`]@anthropic-ai\/claude-agent-sdk['"`]\s*\)/gi,
      /['"`]@anthropic-ai\/claude-agent-sdk['"`]/gi,
      /unstable_v2_createSession/gi,
      /unstable_v2_resumeSession/gi,
      /unstable_v2_prompt/gi,
    ],
    filePatterns: ['*.js', '*.ts', '*.jsx', '*.tsx', 'package.json'],
    confidence: 'high',
    metadata: { type: 'agent-sdk', provider: 'anthropic' }
  },
  // Vercel AI SDK
  {
    category: 'framework',
    name: 'vercel-ai-sdk',
    patterns: [
      /from\s+['"`]ai['"`]\s+import/gi,
      /import\s+.*\s+from\s+['"`]ai['"`]/gi,
      /import\s+.*\s+from\s+['"`]@ai-sdk\//gi,
      /require\s*\(\s*['"`]ai['"`]\s*\)/gi,
    ],
    filePatterns: ['*.js', '*.ts', '*.jsx', '*.tsx'],
    confidence: 'high',
    metadata: { type: 'sdk', provider: 'vercel' }
  },
  // LangChain
  {
    category: 'framework',
    name: 'langchain',
    patterns: [
      /from\s+langchain/gi,
      /import\s+.*langchain/gi,
      /require\s*\(\s*['"`]langchain/gi,
      /['"`]langchain['"`]/gi,
      /@langchain\//gi,
    ],
    filePatterns: ['*.py', '*.js', '*.ts', '*.jsx', '*.tsx'],
    confidence: 'high',
    metadata: { type: 'orchestration' }
  },
  // LangGraph
  {
    category: 'framework',
    name: 'langgraph',
    patterns: [
      /from\s+langgraph/gi,
      /import\s+.*langgraph/gi,
      /require\s*\(\s*['"`]langgraph/gi,
      /['"`]langgraph['"`]/gi,
      /@langchain\/langgraph/gi,
    ],
    filePatterns: ['*.py', '*.js', '*.ts', '*.jsx', '*.tsx'],
    confidence: 'high',
    metadata: { type: 'orchestration' }
  },
  // LangSmith
  {
    category: 'framework',
    name: 'langsmith',
    patterns: [
      /from\s+langsmith/gi,
      /import\s+.*langsmith/gi,
      /langsmith/gi,
      /LANGSMITH_API_KEY/gi,
    ],
    confidence: 'high',
    metadata: { type: 'observability' }
  },
  // AI GitHub Actions (for CI/CD AI integrations)
  {
    category: 'framework',
    name: 'ai-github-action',
    patterns: [
      /anthropics\/claude-code-action/gi,
      /openai\/openai-github-action/gi,
      /github\/copilot-/gi,
      /uses:\s*['"\`]?anthropics\//gi,
      /uses:\s*['"\`]?openai\//gi,
    ],
    filePatterns: ['.github/workflows/*.yml', '.github/workflows/*.yaml'],
    confidence: 'high',
    metadata: { type: 'github-action', provider: 'various' }
  },
  // Google Vertex AI Agent Builder / Generative AI
  {
    category: 'framework',
    name: 'google-vertex-ai',
    patterns: [
      /from\s+google\.cloud\s+import\s+aiplatform/gi,
      /vertexai/gi,
      /google-cloud-aiplatform/gi,
      /@google-cloud\/vertexai/gi,
      /GenerativeModel/gi,
    ],
    confidence: 'high',
    metadata: { type: 'platform-framework', provider: 'google' }
  },
  // Google Generative AI
  {
    category: 'framework',
    name: 'google-generativeai',
    patterns: [
      /import\s+google\.generativeai/gi,
      /from\s+google\.generativeai/gi,
      /google-generativeai/gi,
      /@google\/generative-ai/gi,
    ],
    confidence: 'high',
    metadata: { type: 'sdk', provider: 'google' }
  },
  // AutoGen (Microsoft)
  {
    category: 'framework',
    name: 'autogen',
    patterns: [
      /from\s+autogen/gi,
      /import\s+autogen/gi,
      /pyautogen/gi,
      /AssistantAgent/gi,
      /UserProxyAgent/gi,
    ],
    confidence: 'high',
    metadata: { type: 'multi-agent', provider: 'microsoft' }
  },
  // CrewAI
  {
    category: 'framework',
    name: 'crewai',
    patterns: [
      /from\s+crewai/gi,
      /import\s+crewai/gi,
      /['"`]crewai['"`]/gi,
    ],
    confidence: 'high',
    metadata: { type: 'multi-agent' }
  },
  // Semantic Kernel (Microsoft)
  {
    category: 'framework',
    name: 'semantic-kernel',
    patterns: [
      /semantic[-_]kernel/gi,
      /from\s+semantic_kernel/gi,
      /Microsoft\.SemanticKernel/gi,
    ],
    confidence: 'high',
    metadata: { type: 'orchestration', provider: 'microsoft' }
  },
  // Haystack
  {
    category: 'framework',
    name: 'haystack',
    patterns: [
      /from\s+haystack/gi,
      /import\s+haystack/gi,
      /farm-haystack/gi,
      /haystack-ai/gi,
    ],
    confidence: 'high',
    metadata: { type: 'rag' }
  },
  // LlamaIndex
  {
    category: 'framework',
    name: 'llamaindex',
    patterns: [
      /from\s+llama_index/gi,
      /import\s+llama_index/gi,
      /llama-index/gi,
      /llamaindex/gi,
    ],
    confidence: 'high',
    metadata: { type: 'rag' }
  },
  // Guidance (Microsoft)
  {
    category: 'framework',
    name: 'guidance',
    patterns: [
      /from\s+guidance/gi,
      /import\s+guidance/gi,
      /guidance\.models/gi,
    ],
    confidence: 'medium',
    metadata: { type: 'prompting', provider: 'microsoft' }
  },
  // DSPy
  {
    category: 'framework',
    name: 'dspy',
    patterns: [
      /from\s+dspy/gi,
      /import\s+dspy/gi,
      /dspy\./gi,
    ],
    confidence: 'high',
    metadata: { type: 'prompting' }
  },
  // Instructor
  {
    category: 'framework',
    name: 'instructor',
    patterns: [
      /from\s+instructor/gi,
      /import\s+instructor/gi,
      /instructor\.patch/gi,
    ],
    confidence: 'high',
    metadata: { type: 'structured-output' }
  },
  // Pydantic AI
  {
    category: 'framework',
    name: 'pydantic-ai',
    patterns: [
      /from\s+pydantic_ai/gi,
      /import\s+pydantic_ai/gi,
      /pydantic-ai/gi,
    ],
    confidence: 'high',
    metadata: { type: 'structured-output' }
  },
  // OpenAI Assistants/Agents
  {
    category: 'framework',
    name: 'openai-agents',
    patterns: [
      /client\.beta\.assistants/gi,
      /AssistantAgent/gi,
      /openai\.beta\.threads/gi,
      /from\s+agents/gi,
    ],
    confidence: 'medium',
    metadata: { type: 'assistants', provider: 'openai' }
  },
];

/**
 * AI Platforms as a Service
 */
export const PLATFORM_PATTERNS: DetectionPattern[] = [
  // AWS Bedrock
  {
    category: 'platform',
    name: 'aws-bedrock',
    patterns: [
      /bedrock-runtime/gi,
      /bedrock-agent/gi,
      /boto3.*bedrock/gi,
      /aws\.bedrock/gi,
      /BedrockRuntime/gi,
      /InvokeModel/gi,
      /amazon\.titan/gi,
      /anthropic\.claude.*bedrock/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'aws' }
  },
  // AWS SageMaker
  {
    category: 'platform',
    name: 'aws-sagemaker',
    patterns: [
      /sagemaker/gi,
      /SageMakerRuntime/gi,
      /invoke_endpoint/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'aws' }
  },
  // Azure OpenAI
  {
    category: 'platform',
    name: 'azure-openai',
    patterns: [
      /azure\.openai/gi,
      /AzureOpenAI/gi,
      /openai\.azure\.com/gi,
      /AZURE_OPENAI/gi,
      /azure-openai/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'microsoft' }
  },
  // Azure AI Foundry (formerly Azure AI Studio)
  {
    category: 'platform',
    name: 'azure-ai-foundry',
    patterns: [
      /azure-ai-inference/gi,
      /azure\.ai\.inference/gi,
      /ai\.azure\.com/gi,
      /azure-ai-ml/gi,
      /azure\.ai\.ml/gi,
      /AzureAIInference/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'microsoft' }
  },
  // Azure Machine Learning
  {
    category: 'platform',
    name: 'azure-ml',
    patterns: [
      /azureml/gi,
      /azure-ai-ml/gi,
      /MLClient/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'microsoft' }
  },
  // Google Cloud Vertex AI
  {
    category: 'platform',
    name: 'gcp-vertex-ai',
    patterns: [
      /aiplatform\.gapic/gi,
      /aiplatform_v1/gi,
      /google-cloud-aiplatform/gi,
      /vertexai\.generative_models/gi,
      /us-central1-aiplatform/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'google' }
  },
  // Google AI Studio
  {
    category: 'platform',
    name: 'google-ai-studio',
    patterns: [
      /makersuite\.google/gi,
      /aistudio\.google/gi,
      /generativelanguage\.googleapis/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'google' }
  },
  // Hugging Face Inference
  {
    category: 'platform',
    name: 'huggingface-inference',
    patterns: [
      /huggingface_hub/gi,
      /InferenceClient/gi,
      /api-inference\.huggingface/gi,
      /@huggingface\/inference/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'huggingface' }
  },
  // Replicate
  {
    category: 'platform',
    name: 'replicate',
    patterns: [
      /replicate\.run/gi,
      /replicate\.predictions/gi,
      /import\s+replicate/gi,
      /api\.replicate\.com/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'replicate' }
  },
  // Together AI
  {
    category: 'platform',
    name: 'together-ai',
    patterns: [
      /together\.ai/gi,
      /togetherai/gi,
      /api\.together\.xyz/gi,
      /together\.complete/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'together' }
  },
  // Anyscale
  {
    category: 'platform',
    name: 'anyscale',
    patterns: [
      /anyscale/gi,
      /ray\.serve/gi,
    ],
    confidence: 'medium',
    metadata: { provider: 'anyscale' }
  },
  // Groq
  {
    category: 'platform',
    name: 'groq',
    patterns: [
      /groq\.com/gi,
      /from\s+groq/gi,
      /import\s+Groq/gi,
      /GroqClient/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'groq' }
  },
  // Fireworks AI
  {
    category: 'platform',
    name: 'fireworks-ai',
    patterns: [
      /fireworks\.ai/gi,
      /fireworksai/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'fireworks' }
  },
  // Perplexity
  {
    category: 'platform',
    name: 'perplexity',
    patterns: [
      /perplexity\.ai/gi,
      /pplx-api/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'perplexity' }
  },
  // OpenRouter
  {
    category: 'platform',
    name: 'openrouter',
    patterns: [
      /openrouter\.ai\/api/gi,
      /OPENROUTER_API_KEY/gi,
      /['"`]openrouter['"`]/gi,
      /baseURL.*openrouter/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'openrouter' }
  },
  // Ollama (local)
  {
    category: 'platform',
    name: 'ollama',
    patterns: [
      /['"`]ollama['"`]/gi,
      /from\s+ollama/gi,
      /import\s+.*ollama/gi,
      /require\s*\(\s*['"`]ollama/gi,
      /localhost:11434/gi,
      /OLLAMA_HOST/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'ollama', type: 'local' }
  },
  // LM Studio (local)
  {
    category: 'platform',
    name: 'lmstudio',
    patterns: [
      /lmstudio/gi,
      /localhost:1234/gi,
    ],
    confidence: 'medium',
    metadata: { provider: 'lmstudio', type: 'local' }
  },
];

/**
 * MCP (Model Context Protocol) Servers
 */
export const MCP_SERVER_PATTERNS: DetectionPattern[] = [
  // Generic MCP Server patterns - more specific to reduce false positives
  {
    category: 'mcp-server',
    name: 'mcp-server-generic',
    patterns: [
      /['"`]mcp[-_]server/gi,
      /new\s+McpServer/gi,
      /class\s+\w*McpServer/gi,
      /@modelcontextprotocol\/server/gi,
      /mcpServers\s*[=:]/gi,
      /['"`]mcpServers['"`]/gi,
    ],
    confidence: 'high',
    metadata: { type: 'server' }
  },
  // Specific MCP Servers
  {
    category: 'mcp-server',
    name: 'mcp-server-filesystem',
    patterns: [
      /mcp[-_]server[-_]filesystem/gi,
      /@modelcontextprotocol\/server-filesystem/gi,
    ],
    confidence: 'high',
    metadata: { type: 'filesystem' }
  },
  {
    category: 'mcp-server',
    name: 'mcp-server-github',
    patterns: [
      /mcp[-_]server[-_]github/gi,
      /@modelcontextprotocol\/server-github/gi,
    ],
    confidence: 'high',
    metadata: { type: 'github' }
  },
  {
    category: 'mcp-server',
    name: 'mcp-server-postgres',
    patterns: [
      /mcp[-_]server[-_]postgres/gi,
      /@modelcontextprotocol\/server-postgres/gi,
    ],
    confidence: 'high',
    metadata: { type: 'database' }
  },
  {
    category: 'mcp-server',
    name: 'mcp-server-sqlite',
    patterns: [
      /mcp[-_]server[-_]sqlite/gi,
      /@modelcontextprotocol\/server-sqlite/gi,
    ],
    confidence: 'high',
    metadata: { type: 'database' }
  },
  {
    category: 'mcp-server',
    name: 'mcp-server-brave-search',
    patterns: [
      /mcp[-_]server[-_]brave[-_]search/gi,
      /@modelcontextprotocol\/server-brave-search/gi,
    ],
    confidence: 'high',
    metadata: { type: 'search' }
  },
  {
    category: 'mcp-server',
    name: 'mcp-server-puppeteer',
    patterns: [
      /mcp[-_]server[-_]puppeteer/gi,
      /@modelcontextprotocol\/server-puppeteer/gi,
    ],
    confidence: 'high',
    metadata: { type: 'browser' }
  },
  {
    category: 'mcp-server',
    name: 'mcp-server-memory',
    patterns: [
      /mcp[-_]server[-_]memory/gi,
      /@modelcontextprotocol\/server-memory/gi,
    ],
    confidence: 'high',
    metadata: { type: 'memory' }
  },
  {
    category: 'mcp-server',
    name: 'mcp-server-fetch',
    patterns: [
      /mcp[-_]server[-_]fetch/gi,
      /@modelcontextprotocol\/server-fetch/gi,
    ],
    confidence: 'high',
    metadata: { type: 'http' }
  },
  {
    category: 'mcp-server',
    name: 'mcp-server-slack',
    patterns: [
      /mcp[-_]server[-_]slack/gi,
      /@modelcontextprotocol\/server-slack/gi,
    ],
    confidence: 'high',
    metadata: { type: 'messaging' }
  },
  {
    category: 'mcp-server',
    name: 'mcp-server-google-drive',
    patterns: [
      /mcp[-_]server[-_]google[-_]drive/gi,
      /@modelcontextprotocol\/server-google-drive/gi,
    ],
    confidence: 'high',
    metadata: { type: 'storage' }
  },
  {
    category: 'mcp-server',
    name: 'mcp-server-everything',
    patterns: [
      /mcp[-_]server[-_]everything/gi,
      /@modelcontextprotocol\/server-everything/gi,
    ],
    confidence: 'high',
    metadata: { type: 'utility' }
  },
];

/**
 * MCP Tools patterns
 */
export const MCP_TOOL_PATTERNS: DetectionPattern[] = [
  // Generic MCP Tool patterns
  {
    category: 'mcp-tool',
    name: 'mcp-tool-generic',
    patterns: [
      /mcp[-_]tool/gi,
      /McpTool/gi,
      /@modelcontextprotocol\/tool/gi,
      /Tool\s*\(\s*name\s*=/gi,
    ],
    confidence: 'medium',
    metadata: { type: 'tool' }
  },
  // MCP SDK patterns
  {
    category: 'mcp-tool',
    name: 'mcp-sdk',
    patterns: [
      /@modelcontextprotocol\/sdk/gi,
      /mcp-python-sdk/gi,
      /mcp[-_]sdk/gi,
    ],
    confidence: 'high',
    metadata: { type: 'sdk' }
  },
  // MCP Client patterns
  {
    category: 'mcp-tool',
    name: 'mcp-client',
    patterns: [
      /McpClient/gi,
      /mcp[-_]client/gi,
      /@modelcontextprotocol\/client/gi,
    ],
    confidence: 'high',
    metadata: { type: 'client' }
  },
];

/**
 * AI API Endpoint patterns - detects direct HTTP calls to AI providers
 */
export const API_ENDPOINT_PATTERNS: DetectionPattern[] = [
  // OpenAI API
  {
    category: 'api-endpoint',
    name: 'openai-api',
    patterns: [
      /api\.openai\.com/gi,
      /['"`]https?:\/\/api\.openai\.com/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'openai' }
  },
  // Anthropic API
  {
    category: 'api-endpoint',
    name: 'anthropic-api',
    patterns: [
      /api\.anthropic\.com/gi,
      /['"`]https?:\/\/api\.anthropic\.com/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'anthropic' }
  },
  // Google AI APIs
  {
    category: 'api-endpoint',
    name: 'google-ai-api',
    patterns: [
      /generativelanguage\.googleapis\.com/gi,
      /aiplatform\.googleapis\.com/gi,
      /us-central1-aiplatform\.googleapis\.com/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'google' }
  },
  // Azure OpenAI
  {
    category: 'api-endpoint',
    name: 'azure-openai-api',
    patterns: [
      /\.openai\.azure\.com/gi,
      /\.cognitiveservices\.azure\.com/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'azure' }
  },
  // Hugging Face API
  {
    category: 'api-endpoint',
    name: 'huggingface-api',
    patterns: [
      /api-inference\.huggingface\.co/gi,
      /huggingface\.co\/api/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'huggingface' }
  },
  // Cohere API
  {
    category: 'api-endpoint',
    name: 'cohere-api',
    patterns: [
      /api\.cohere\.ai/gi,
      /api\.cohere\.com/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'cohere' }
  },
  // Replicate API
  {
    category: 'api-endpoint',
    name: 'replicate-api',
    patterns: [
      /api\.replicate\.com/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'replicate' }
  },
  // Together AI API
  {
    category: 'api-endpoint',
    name: 'together-api',
    patterns: [
      /api\.together\.xyz/gi,
      /api\.together\.ai/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'together' }
  },
  // Groq API
  {
    category: 'api-endpoint',
    name: 'groq-api',
    patterns: [
      /api\.groq\.com/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'groq' }
  },
  // Fireworks AI API
  {
    category: 'api-endpoint',
    name: 'fireworks-api',
    patterns: [
      /api\.fireworks\.ai/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'fireworks' }
  },
  // Perplexity API
  {
    category: 'api-endpoint',
    name: 'perplexity-api',
    patterns: [
      /api\.perplexity\.ai/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'perplexity' }
  },
  // OpenRouter API
  {
    category: 'api-endpoint',
    name: 'openrouter-api',
    patterns: [
      /openrouter\.ai\/api/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'openrouter' }
  },
  // Mistral API
  {
    category: 'api-endpoint',
    name: 'mistral-api',
    patterns: [
      /api\.mistral\.ai/gi,
    ],
    confidence: 'high',
    metadata: { provider: 'mistral' }
  },
  // Local AI endpoints
  {
    category: 'api-endpoint',
    name: 'ollama-local',
    patterns: [
      /localhost:11434/gi,
      /127\.0\.0\.1:11434/gi,
    ],
    confidence: 'medium',
    metadata: { provider: 'ollama', type: 'local' }
  },
  {
    category: 'api-endpoint',
    name: 'lmstudio-local',
    patterns: [
      /localhost:1234/gi,
      /127\.0\.0\.1:1234/gi,
    ],
    confidence: 'medium',
    metadata: { provider: 'lmstudio', type: 'local' }
  },
];

/**
 * All patterns combined
 */
export const ALL_PATTERNS: DetectionPattern[] = [
  ...MODEL_PATTERNS,
  ...FRAMEWORK_PATTERNS,
  ...PLATFORM_PATTERNS,
  ...MCP_SERVER_PATTERNS,
  ...MCP_TOOL_PATTERNS,
  ...API_ENDPOINT_PATTERNS,
];
