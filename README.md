# AIGraph Scanner

A powerful CLI tool that scans codebases for AI components and enforces security policies. Uses both regex pattern matching and CodeQL AST analysis for comprehensive detection.

## Features

- 🔍 **AI Model Detection**: Detects usage of AI models (GPT-4, Claude, LLaMA, Mistral, Gemini, etc.)
- 🤖 **Framework Detection**: Identifies Agentic AI frameworks (LangChain, LangGraph, AutoGen, CrewAI, etc.)
- ☁️ **Platform Detection**: Detects AI platforms as a service (AWS Bedrock, Azure AI, Google Vertex AI, etc.)
- 🔌 **MCP Detection**: Finds MCP (Model Context Protocol) servers and tools
- 📓 **Jupyter Support**: Scans Jupyter notebooks for AI usage
- 🏗️ **Infrastructure Detection**: Scans Terraform, Helm, and Kubernetes files
- 🛡️ **Policy Enforcement**: Allow/deny lists to enforce organizational policies
- 🧬 **Dual Analysis**: Combines regex pattern matching with CodeQL AST analysis

## Installation

```bash
# Install globally via npm
npm install -g aigraph-scanner

# Or use directly with npx
npx aigraph-scanner
```

## Quick Start

```bash
# Scan current directory
aigraph-scanner

# Scan a specific directory
aigraph-scanner ./src

# Scan a public GitHub repository
aigraph-scanner langchain-ai/langchain

# Output as JSON
aigraph-scanner -f json .
```

## CLI Options

```
Usage: aigraph-scanner [options] [path-or-repo]

Arguments:
  path-or-repo   Local path to scan OR a public GitHub repository
                 Formats: owner/repo, owner/repo@branch, https://github.com/owner/repo
                 Default: . (current directory)

Options:
  -s, --spec <file>        Path to the policy spec file
                           Default locations checked:
                             ~/.aigraph-spec.yml
                             /etc/aigraph/spec.yml
                             ./.aigraph-spec.yml (in target directory)
  -f, --format <format>    Output format: json, markdown, text (default: text)
  -q, --quiet              Suppress progress messages, only output results
  --no-fail                Don't exit with error code on violations
  
  Scanning Options:
  --no-codeql              Disable CodeQL analysis (only use regex)
  --no-notebooks           Skip scanning Jupyter notebooks (.ipynb files)
  --no-iac                 Skip scanning Infrastructure as Code files
  --include-comments       Include detections found in comments
  --no-strings             Exclude detections found in string literals
  
  Ignore Options:
  --ignore-dir <dir>       Additional directory to ignore (can be used multiple times)
  --ignore-file <pattern>  Additional file pattern to ignore (can be used multiple times)
  
  -h, --help               Show this help message
  -v, --version            Show version number
```

## Policy Spec File

Create a `.aigraph-spec.yml` file to define your policies. The scanner checks these locations in order:
1. `~/.aigraph-spec.yml` (user home)
2. `/etc/aigraph/spec.yml` (system-wide)
3. `./.aigraph-spec.yml` (current/target directory)

### Example Spec File

```yaml
version: "1.0"

policies:
  # Only allow specific AI models
  models:
    mode: allowlist
    items:
      - gpt-4
      - gpt-4o
      - claude-3-sonnet
    patterns:
      - gpt-4*

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
      - lmstudio

  # MCP server policies
  mcpServers:
    mode: allowlist
    items:
      - mcp-server-github
      - mcp-server-filesystem

# Optionally ignore certain paths
ignore:
  directories:
    - test
    - __tests__
    - node_modules
  files:
    - "*.test.ts"
    - "*.spec.js"
```

### Policy Modes

- **allowlist**: Only items in the list are allowed (everything else is blocked)
- **denylist**: Items in the list are blocked (everything else is allowed)

## CodeQL Integration

The scanner automatically uses CodeQL for deeper AST-based analysis when available. This provides more accurate detection than regex alone.

### Installing CodeQL CLI

```bash
# Download CodeQL CLI (Linux)
wget https://github.com/github/codeql-cli-binaries/releases/latest/download/codeql-linux64.zip
unzip codeql-linux64.zip
sudo mv codeql /opt/codeql
echo 'export PATH="/opt/codeql:$PATH"' >> ~/.bashrc
source ~/.bashrc

# macOS (via Homebrew)
brew install codeql

# Verify installation
codeql --version

# Install query pack dependencies (from aigraph directory)
codeql pack install queries/
```

### What CodeQL Detects

| Detection Type | Description |
|----------------|-------------|
| **AI SDK Imports** | Import statements for AI libraries |
| **Client Instantiation** | AI client object creation (OpenAI(), Anthropic()) |
| **API Endpoints** | Direct HTTP calls to AI API endpoints |
| **Model References** | Model name strings in code |
| **Environment Variables** | AI-related env var access |
| **Dynamic Imports** | Runtime/dynamic imports of AI modules |
| **MCP Detection** | MCP server and tool usage |

### Comparison Output

The scanner always runs both methods and shows a comparison:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SCANNING METHOD COMPARISON                                                  │
├──────────────────────────┬───────────────┬───────────────┬─────────────────┤
│ Method                   │ Status        │ Detections    │ Duration        │
├──────────────────────────┼───────────────┼───────────────┼─────────────────┤
│ Regex Pattern Matching   │ ✅ Available  │ 42            │ 156ms           │
│ CodeQL AST Analysis      │ ✅ Available  │ 38            │ 12340ms         │
└──────────────────────────┴───────────────┴───────────────┴─────────────────┘
│ ℹ️  CodeQL found 3 additional detection(s) not found by regex
```

## Detected Components

### AI Models
- **OpenAI**: GPT-4, GPT-4o, GPT-3.5, O1, text-embedding
- **Anthropic**: Claude 3 (Opus, Sonnet, Haiku)
- **Meta**: LLaMA 2/3, CodeLLaMA
- **Mistral**: Mistral, Mixtral
- **Google**: Gemini, PaLM
- **Others**: Falcon, Phi, Stable Diffusion, Cohere

### AI Frameworks
- LangChain / LangGraph / LangSmith
- AutoGen (Microsoft)
- CrewAI
- Semantic Kernel (Microsoft)
- LlamaIndex
- Haystack
- DSPy
- Pydantic AI

### AI Platforms
- AWS Bedrock / SageMaker
- Azure OpenAI / AI Foundry / ML
- Google Cloud Vertex AI
- Hugging Face Inference
- Replicate / Together AI / Groq
- OpenRouter
- Ollama / LM Studio (local)

### MCP Components
- MCP Servers: filesystem, GitHub, Postgres, SQLite, Brave Search, Puppeteer, etc.
- MCP SDK and Client

## Examples

### Scan with Custom Spec

```bash
aigraph-scanner -s ~/company-policy.yml ./my-project
```

### CI/CD Integration

```bash
# In your CI pipeline
aigraph-scanner -q -f json . > results.json
if [ $? -ne 0 ]; then
  echo "Policy violations found!"
  exit 1
fi
```

### Scan Multiple Repos

```bash
for repo in org/repo1 org/repo2 org/repo3; do
  echo "Scanning $repo..."
  aigraph-scanner "$repo" --no-fail
done
```

### Quiet Mode for Scripting

```bash
# Only output JSON results, no progress messages
aigraph-scanner -q -f json . | jq '.violations'
```

## Programmatic Usage

```typescript
import { scan } from 'aigraph-scanner';

const result = await scan({
  target: './my-project',
  specFile: '~/.aigraph-spec.yml',
  outputFormat: 'json',
});

console.log('Violations:', result.violationCount);
console.log('Results:', result.results);
```

## Development

```bash
# Clone the repository
git clone https://github.com/pararohan/aigraph.git
cd aigraph

# Install dependencies
npm install

# Build
npm run build:all

# Test
npm test

# Run locally
node dist/cli.js .
```

## License

MIT
