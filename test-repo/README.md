# AIGraph Test Repository

This repository is designed to test aigraph-scanner functionality for both **true positives** (legitimate AI usage that should be detected) and **false positives** (text that looks like AI usage but isn't).

## Directory Structure

```
test-repo/
├── true-positives/          # Code that SHOULD be detected
│   ├── models/              # AI model usage examples
│   ├── frameworks/          # AI framework usage examples
│   ├── platforms/           # AI platform usage examples
│   ├── mcp/                 # MCP server/tool usage examples
│   └── configs/             # Configuration files with AI usage
├── false-positives/         # Code that should NOT be detected (or marked low confidence)
│   ├── comments/            # AI terms in comments
│   ├── docs/                # Documentation with AI terms
│   ├── variables/           # Variable names that look like AI models
│   └── unrelated/           # String literals in unrelated contexts
└── README.md               # This file
```

## Running Tests

### Test True Positives (should find detections)
```bash
# Scan the true-positives directory
aigraph-scanner test-repo/true-positives

# Should detect:
# - Multiple AI models (GPT-4, Claude, LLaMA, Mistral, Gemini)
# - AI frameworks (LangChain, AutoGen, CrewAI, etc.)
# - AI platforms (AWS Bedrock, Azure OpenAI, etc.)
# - MCP servers and tools
```

### Test False Positives (should have minimal/no detections)
```bash
# Scan the false-positives directory
aigraph-scanner test-repo/false-positives --no-codeql

# With comment filtering:
aigraph-scanner test-repo/false-positives --no-codeql

# Expected: Minimal or no detections when comments are excluded
# (Some detections may occur in docs/strings, which is expected)
```

### Test with Policy Enforcement
```bash
# Test allowlist - only allow specific models
aigraph-scanner -s test-repo/test-policy-allowlist.yml test-repo/true-positives

# Test denylist - block specific models
aigraph-scanner -s test-repo/test-policy-denylist.yml test-repo/true-positives
```

## Test Scenarios

### True Positives (✅ Should Detect)

1. **AI Model Usage**
   - Import and use OpenAI GPT-4
   - Import and use Anthropic Claude
   - Use LLaMA models
   - Use Mistral models
   - Use Google Gemini

2. **AI Frameworks**
   - LangChain imports and usage
   - LangGraph workflow definitions
   - AutoGen agent setup
   - CrewAI agent definitions
   - LlamaIndex vector stores

3. **AI Platforms**
   - AWS Bedrock client setup
   - Azure OpenAI configuration
   - Google Vertex AI usage
   - Hugging Face Inference API

4. **MCP Components**
   - MCP server definitions in configs
   - MCP SDK imports and usage
   - MCP tool definitions

5. **Configuration Files**
   - package.json with AI dependencies
   - requirements.txt with AI packages
   - docker-compose with AI services

### False Positives (❌ Should NOT Detect or Mark Low Confidence)

1. **Comments**
   - Code comments mentioning "GPT-4" or "Claude"
   - TODO comments about AI integration
   - Commented-out AI code

2. **Documentation**
   - README files describing AI features
   - Markdown docs comparing models
   - Architecture diagrams mentioning AI

3. **Variable Names**
   - Variables named `claude` or `gemini` (not related to AI)
   - Class names that coincidentally match
   - Function names with AI terms

4. **Unrelated Strings**
   - Error messages mentioning models
   - Log messages
   - Test data/mock data
   - URL paths containing AI terms

## Expected Results

### True Positives Directory
- **Expected Detections**: 50+ AI components across all categories
- **Confidence**: High (most detections should be high confidence)
- **Violations**: Depends on policy spec used

### False Positives Directory
- **Expected Detections**: 0-5 detections (when excluding comments)
- **Confidence**: Low to medium (if any are detected)
- **Violations**: Should be 0 with proper filtering

## Testing Both Scanning Methods

### Regex-Only Scan
```bash
aigraph-scanner --no-codeql test-repo/true-positives
```
- Fast (< 1 second)
- Good for config files, JSON, YAML
- May have more false positives

### CodeQL Scan
```bash
aigraph-scanner test-repo/true-positives
```
- Slower (10-30 seconds)
- Better accuracy for actual code
- Lower false positives
- Can't scan JSON/YAML files

### Expected Comparison
Both methods should find similar core detections, with:
- Regex finding more in config files
- CodeQL finding more in actual code usage
- Some overlap for validation
