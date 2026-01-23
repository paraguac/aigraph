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

### Scan a Public GitHub Repository

You can scan any public GitHub repository without checking it out first:

```yaml
name: AIGraph Scan External Repo

on:
  workflow_dispatch:
    inputs:
      repository:
        description: 'GitHub repository to scan (e.g., owner/repo)'
        required: true

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Run AIGraph Scanner
        uses: pararohan/aigraph@v1
        with:
          github-repo: ${{ github.event.inputs.repository }}
          spec-file: '.aigraph-spec.yml'
          fail-on-violation: 'false'
```

You can also specify a branch or tag:

```yaml
- name: Scan specific branch
  uses: pararohan/aigraph@v1
  with:
    github-repo: 'langchain-ai/langchain@v0.1.0'
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
| `github-repo` | Public GitHub repo to scan (e.g., `owner/repo`) | `''` |

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

# Build the action and CLI
npm run build:all

# Or build individually:
npm run build      # Build only the GitHub Action
npm run build:cli  # Build only the CLI

# Test
npm test

# Lint
npm run lint
```

## CLI Usage

The AIGraph Scanner can be used as a standalone CLI tool, not just as a GitHub Action.

### Installation

```bash
# Install globally from npm
npm install -g aigraph-scanner

# Or run directly from this repo
node dist/cli.js
```

### CLI Options

```
Usage: aigraph-scanner [options] [path-or-repo]

Arguments:
  path-or-repo   Local path to scan OR a public GitHub repository
                 Formats: owner/repo, owner/repo@branch, https://github.com/owner/repo
                 Default: . (current directory)

Options:
  -s, --spec <file>      Path to the spec file (default: .aigraph-spec.yml)
  -f, --format <format>  Output format: json, markdown, text (default: text)
  -q, --quiet            Suppress progress messages, only output results
  --no-fail              Don't exit with error code on violations
  -h, --help             Show this help message
  -v, --version          Show version number
```

### CLI Examples

```bash
# Scan current directory
aigraph-scanner

# Scan a specific directory
aigraph-scanner ./src

# Scan a public GitHub repository
aigraph-scanner langchain-ai/langchain

# Scan a specific branch
aigraph-scanner openai/openai-python@main

# Use a custom spec file
aigraph-scanner -s custom-spec.yml ./src

# Output as JSON (useful for piping)
aigraph-scanner -f json .

# Quiet mode with JSON output
aigraph-scanner -q -f json .

# Don't fail on violations (useful in CI where you just want a report)
aigraph-scanner --no-fail ./src
```

## Programmatic Usage

The scanner can also be used as a library in your Node.js/TypeScript code:

```typescript
import { scan, FileScanner, PolicyEnforcer } from 'aigraph-scanner';

// Simple usage with the scan function
const result = await scan({
  target: './my-project',
  specFile: '.aigraph-spec.yml',
  outputFormat: 'json',
  log: console.log, // Optional logging function
});

console.log(result.formattedOutput);
console.log(`Violations: ${result.violationCount}`);

// Or use the lower-level APIs directly
const scanner = new FileScanner('./my-project');
const scanResults = await scanner.scan();

const spec = await PolicyEnforcer.loadSpec('.aigraph-spec.yml');
const enforcer = new PolicyEnforcer(spec);
const results = enforcer.enforce(scanResults);

console.log(results.violations);
```

## License

MIT