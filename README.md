# AIGraph Scanner

A GitHub Action that scans repositories for AI components and enforces security policies.

## Features

- 🔍 **AI Model Detection**: Detects usage of AI models (GPT-4, Claude, LLaMA, Mistral, Gemini, etc.)
- 🤖 **Framework Detection**: Identifies Agentic AI frameworks (LangChain, LangGraph, AutoGen, CrewAI, etc.)
- ☁️ **Platform Detection**: Detects AI platforms as a service (AWS Bedrock, Azure AI Foundry, Google Vertex AI, etc.)
- 🔌 **MCP Detection**: Finds MCP (Model Context Protocol) servers and tools
- 🛡️ **Policy Enforcement**: Allow/deny lists to enforce organizational policies

## Quick Start

### Basic Usage

Add this to your `.github/workflows/aigraph.yml`:

```yaml
name: AIGraph Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Run AIGraph Scanner
        uses: pararohan/aigraph@v1
        with:
          spec-file: '.aigraph-spec.yml'
          fail-on-violation: 'true'
```

### Create a Spec File

Create `.aigraph-spec.yml` in your repository root:

```yaml
version: "1.0"

policies:
  # Only allow specific AI models
  models:
    mode: allowlist
    items:
      - gpt-4
      - gpt-4o
      - claude
    patterns:
      - gpt-*

  # Allow specific frameworks
  frameworks:
    mode: allowlist
    items:
      - langchain
      - langgraph

  # Block specific platforms
  platforms:
    mode: denylist
    items:
      - ollama  # Block local model servers

  # MCP server policies
  mcpServers:
    mode: allowlist
    items:
      - mcp-server-github
      - mcp-server-filesystem

  # MCP tool policies
  mcpTools:
    mode: allowlist
    items:
      - mcp-sdk
      - mcp-client
```

## Inputs

| Input | Description | Default |
|-------|-------------|---------|
| `spec-file` | Path to the spec file | `.aigraph-spec.yml` |
| `scan-path` | Path to scan | `.` |
| `fail-on-violation` | Fail if violations found | `true` |
| `output-format` | Output format (json, markdown, text) | `markdown` |

## Outputs

| Output | Description |
|--------|-------------|
| `violations-found` | Whether violations were found (`true`/`false`) |
| `violations-count` | Number of violations found |
| `scan-results` | Full scan results in JSON |

## Spec File Schema

### Version

```yaml
version: "1.0"
```

### Policies

Each policy category supports two modes:

- **allowlist**: Only items in the list are allowed
- **denylist**: Items in the list are blocked

```yaml
policies:
  models:
    mode: allowlist  # or 'denylist'
    items:
      - gpt-4
      - claude
    patterns:
      - gpt-*  # Wildcards supported
```

### Categories

| Category | Description |
|----------|-------------|
| `models` | AI models (GPT, Claude, LLaMA, etc.) |
| `frameworks` | AI frameworks (LangChain, AutoGen, etc.) |
| `platforms` | AI platforms (AWS Bedrock, Azure, etc.) |
| `mcpServers` | MCP servers |
| `mcpTools` | MCP tools and SDKs |

## Detected Components

### AI Models
- OpenAI: GPT-4, GPT-3.5, O1, text-embedding
- Anthropic: Claude
- Meta: LLaMA, CodeLLaMA
- Mistral: Mistral, Mixtral
- Google: Gemini, PaLM
- Others: Falcon, Phi, Stable Diffusion, Cohere

### AI Frameworks
- LangChain / LangGraph / LangSmith
- AutoGen (Microsoft)
- CrewAI
- Semantic Kernel (Microsoft)
- LlamaIndex
- Haystack
- DSPy
- Instructor
- Pydantic AI
- Google Vertex AI / Generative AI

### AI Platforms
- AWS Bedrock
- AWS SageMaker
- Azure OpenAI
- Azure AI Foundry
- Azure ML
- Google Cloud Vertex AI
- Google AI Studio
- Hugging Face Inference
- Replicate
- Together AI
- Groq
- Fireworks AI
- OpenRouter
- Ollama (local)
- LM Studio (local)

### MCP Components
- MCP Server: filesystem, GitHub, Postgres, SQLite, Brave Search, Puppeteer, Memory, Fetch, Slack, Google Drive
- MCP SDK and Client

## Example Scenarios

### Enterprise Policy: Approved Models Only

```yaml
version: "1.0"
policies:
  models:
    mode: allowlist
    items:
      - gpt-4
      - gpt-4o
      - claude
  platforms:
    mode: allowlist
    items:
      - azure-openai
      - aws-bedrock
```

### Block Local Model Runners

```yaml
version: "1.0"
policies:
  platforms:
    mode: denylist
    items:
      - ollama
      - lmstudio
```

### Allow All But Block Specific

```yaml
version: "1.0"
policies:
  frameworks:
    mode: denylist
    items:
      - autogen  # Block multi-agent frameworks
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Test
npm test

# Lint
npm run lint
```

## License

MIT