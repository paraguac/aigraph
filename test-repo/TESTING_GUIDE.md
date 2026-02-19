# AIGraph Test Repository - Testing Guide

This guide explains how to use this test repository to validate aigraph-scanner functionality.

## Quick Start

```bash
# From the aigraph repository root:

# Test true positives (should detect AI usage)
aigraph-scanner test-repo/true-positives

# Test false positives (should have minimal detections)
aigraph-scanner test-repo/false-positives --no-codeql
```

## Test Categories

### 1. True Positives (Should Detect ✅)

#### Models (`true-positives/models/`)
Test that the scanner detects various AI model usage:

```bash
aigraph-scanner test-repo/true-positives/models/
```

**Expected detections:**
- `openai_gpt.py`: gpt-4, gpt-4-turbo, gpt-3.5-turbo, o1-preview, text-embedding-ada-002
- `anthropic_claude.py`: claude-3-opus, claude-3-sonnet, claude-3-haiku
- `llama_mistral.py`: llama-2, llama-3, codellama, mistral-7b, mixtral-8x7b
- `google_gemini.py`: gemini-pro, gemini-1.5-pro, gemini-1.5-flash
- `openai_client.ts`: gpt-4, gpt-4o, gpt-3.5-turbo, o1-preview

**Validation:** Should detect 15+ unique models across 5 files.

#### Frameworks (`true-positives/frameworks/`)
Test that the scanner detects AI framework usage:

```bash
aigraph-scanner test-repo/true-positives/frameworks/
```

**Expected detections:**
- `langchain_usage.py`: langchain
- `langgraph_workflow.py`: langgraph
- `autogen_agents.py`: autogen
- `crewai_agents.py`: crewai
- `llamaindex_store.py`: llamaindex
- `langchain_typescript.ts`: langchain, @langchain/openai, @langchain/anthropic

**Validation:** Should detect 5+ unique frameworks across 6 files.

#### Platforms (`true-positives/platforms/`)
Test that the scanner detects AI platform usage:

```bash
aigraph-scanner test-repo/true-positives/platforms/
```

**Expected detections:**
- `aws_bedrock.py`: aws-bedrock, bedrock-runtime
- `azure_openai.py`: azure-openai, azure-ai-openai
- `gcp_vertex.py`: vertex-ai, google-cloud-aiplatform
- `ollama_local.py`: ollama

**Validation:** Should detect 4+ unique platforms across 4 files.

#### MCP (`true-positives/mcp/`)
Test that the scanner detects MCP servers and tools:

```bash
aigraph-scanner test-repo/true-positives/mcp/
```

**Expected detections:**
- `package.json`: mcp-sdk, mcp-server-filesystem, mcp-server-github, mcp-server-postgres
- `mcp_client.py`: Multiple MCP server references
- `mcp_server.ts`: @modelcontextprotocol/sdk
- `mcp-config.json`: Multiple MCP server configurations

**Validation:** Should detect 7+ unique MCP components across 4 files.

#### Configs (`true-positives/configs/`)
Test that the scanner detects AI usage in configuration files:

```bash
aigraph-scanner test-repo/true-positives/configs/
```

**Expected detections:**
- `package.json`: Multiple AI dependencies (openai, anthropic, langchain, etc.)
- `requirements.txt`: Python AI packages
- `docker-compose.yml`: AI service configurations with model names
- `kubernetes.yaml`: K8s deployments with AI models

**Validation:** Should detect 20+ components across config files.

### 2. False Positives (Should NOT Detect ❌)

#### Comments (`false-positives/comments/`)
Test that AI terms in comments are filtered:

```bash
# Without comment filtering (will detect in comments)
aigraph-scanner test-repo/false-positives/comments/

# With comment filtering (should detect nothing)
aigraph-scanner test-repo/false-positives/comments/ --include-comments
```

**Expected behavior:**
- Default: Should NOT detect AI usage (comments are excluded by default)
- With `--include-comments`: Will detect references in comments
- Files: `comments_only.py`, `comments_only.js`, `commented_out_code.py`

**Validation:** 
- Without `--include-comments`: 0 detections expected
- With `--include-comments`: Multiple detections (but they're false positives)

#### Documentation (`false-positives/docs/`)
Test that documentation files are handled appropriately:

```bash
aigraph-scanner test-repo/false-positives/docs/
```

**Expected behavior:**
- May detect AI terms in markdown files
- These should be low-confidence or filterable
- Files: `AI_GUIDE.md`, `ARCHITECTURE.md`

**Validation:** Detections in docs are expected but should be distinguishable from code.

#### Variables (`false-positives/variables/`)
Test that variable names don't cause false positives:

```bash
aigraph-scanner test-repo/false-positives/variables/ --no-codeql
```

**Expected behavior:**
- Should NOT detect variable names as AI usage
- Names like `claude`, `gemini`, `llama` are just variables
- Files: `variable_names.py`, `variable_names.js`

**Validation:** Should have 0-2 detections (strings might match, but no imports).

#### Unrelated Strings (`false-positives/unrelated/`)
Test that unrelated string literals don't cause false positives:

```bash
aigraph-scanner test-repo/false-positives/unrelated/ --no-codeql --no-strings
```

**Expected behavior:**
- Without `--no-strings`: May detect model names in strings
- With `--no-strings`: Should have minimal detections
- Files: `string_literals.py`, `string_literals.js`

**Validation:** With proper filtering, should have 0 detections.

## Testing Policy Enforcement

### Allowlist Policy Test

```bash
aigraph-scanner -s test-repo/test-policy-allowlist.yml test-repo/true-positives/
```

**Expected violations:**
Models not in allowlist:
- ❌ llama, mistral (not allowed)
- ❌ gemini (not allowed)
- ✅ gpt-4, gpt-4-turbo (allowed by pattern gpt-4*)
- ✅ claude (allowed)

Frameworks not in allowlist:
- ❌ autogen (not allowed)
- ❌ crewai (not allowed)
- ❌ llamaindex (not allowed)
- ✅ langchain (allowed)
- ✅ langgraph (allowed)

Platforms not in allowlist:
- ❌ ollama (not allowed)
- ❌ gcp-vertex-ai (not allowed)
- ✅ aws-bedrock (allowed)
- ✅ azure-openai (allowed)

**Validation:** Should have 8+ violations for items not in allowlist.

### Denylist Policy Test

```bash
aigraph-scanner -s test-repo/test-policy-denylist.yml test-repo/true-positives/
```

**Expected violations:**
Models in denylist:
- ❌ llama (denied)
- ❌ mistral (denied)
- ❌ phi (denied)
- ✅ gpt-4 (allowed)
- ✅ claude (allowed)
- ✅ gemini (allowed)

Frameworks in denylist:
- ❌ autogen (denied)
- ❌ crewai (denied)
- ✅ langchain (allowed)
- ✅ langgraph (allowed)
- ✅ llamaindex (allowed)

Platforms in denylist:
- ❌ ollama (denied)
- ✅ aws-bedrock (allowed)
- ✅ azure-openai (allowed)
- ✅ gcp-vertex-ai (allowed)

MCP servers in denylist:
- ❌ mcp-server-puppeteer (denied)
- ❌ mcp-server-postgres (denied)
- ✅ mcp-server-filesystem (allowed)
- ✅ mcp-server-github (allowed)

**Validation:** Should have 7+ violations for denied items.

## Comparison Testing: Regex vs CodeQL

### Test Regex Only
```bash
aigraph-scanner --no-codeql test-repo/true-positives/
```

**Expected behavior:**
- Fast (< 5 seconds)
- Detects AI terms in all file types (code, config, JSON, YAML)
- May have slightly more false positives
- Good at finding model names in strings

### Test CodeQL Only
```bash
# Note: Can't disable regex, but CodeQL adds additional detections
aigraph-scanner test-repo/true-positives/
```

**Expected behavior:**
- Slower (30-90 seconds first run, ~10s subsequent)
- Better at detecting actual code usage (imports, client instantiation)
- Lower false positives for code files
- Cannot parse JSON/YAML files

### Compare Both Methods
```bash
aigraph-scanner test-repo/true-positives/ -f json > results.json
```

Look at the comparison table in output:
- **Regex detections**: Should find model names in configs, strings, code
- **CodeQL detections**: Should find imports, client creation, function calls
- **Overlap**: Some detections should be found by both methods

## Expected Test Results Summary

### True Positives Directory
```
Total files: 18+
Expected detections: 50-80 components
- Models: 15+ (gpt-4, claude, llama, mistral, gemini, etc.)
- Frameworks: 6+ (langchain, langgraph, autogen, crewai, llamaindex)
- Platforms: 4+ (aws-bedrock, azure-openai, vertex-ai, ollama)
- MCP: 10+ (servers and tools)
- Config detections: 20+ (from package.json, requirements.txt, docker-compose, k8s)

All detections should be HIGH confidence.
```

### False Positives Directory
```
Total files: 8
Expected detections (without filtering): 10-30
Expected detections (with filtering): 0-5

With proper flags:
- --no-comments: Should exclude comment-only detections
- --no-strings: Should exclude unrelated string literals
- Ignore docs: Should exclude documentation files

Remaining detections (if any) should be LOW to MEDIUM confidence.
```

## Automated Testing Script

Create a test script to validate scanner behavior:

```bash
#!/bin/bash
# test-aigraph.sh

echo "=== Testing AIGraph Scanner ==="

echo ""
echo "1. Scanning true positives..."
aigraph-scanner test-repo/true-positives/ -q -f json > /tmp/true-pos.json
TRUE_DETECTIONS=$(jq '.summary.totalDetections' /tmp/true-pos.json)
echo "   Found $TRUE_DETECTIONS detections (expected: 50+)"

echo ""
echo "2. Scanning false positives (filtered)..."
aigraph-scanner test-repo/false-positives/ -q -f json > /tmp/false-pos.json
FALSE_DETECTIONS=$(jq '.summary.totalDetections' /tmp/false-pos.json)
echo "   Found $FALSE_DETECTIONS detections (expected: 0-5)"

echo ""
echo "3. Testing allowlist policy..."
aigraph-scanner -s test-repo/test-policy-allowlist.yml test-repo/true-positives/ -q -f json > /tmp/allowlist.json
ALLOW_VIOLATIONS=$(jq '.summary.totalViolations' /tmp/allowlist.json)
echo "   Found $ALLOW_VIOLATIONS violations (expected: 8+)"

echo ""
echo "4. Testing denylist policy..."
aigraph-scanner -s test-repo/test-policy-denylist.yml test-repo/true-positives/ -q -f json > /tmp/denylist.json
DENY_VIOLATIONS=$(jq '.summary.totalViolations' /tmp/denylist.json)
echo "   Found $DENY_VIOLATIONS violations (expected: 7+)"

echo ""
echo "=== Test Summary ==="
echo "True Positives: $TRUE_DETECTIONS detections"
echo "False Positives: $FALSE_DETECTIONS detections"  
echo "Allowlist Violations: $ALLOW_VIOLATIONS"
echo "Denylist Violations: $DENY_VIOLATIONS"
```

Make it executable and run:
```bash
chmod +x test-aigraph.sh
./test-aigraph.sh
```

## Manual Validation Checklist

After running the scanner, manually verify:

- [ ] True positives: All AI imports are detected
- [ ] True positives: All model names in code are found
- [ ] True positives: Config files (JSON, YAML) are scanned
- [ ] True positives: MCP servers in configs are detected
- [ ] False positives: Comments are filtered by default
- [ ] False positives: Variable names don't trigger false detections
- [ ] False positives: Unrelated strings can be filtered
- [ ] Policy: Allowlist blocks non-allowed items
- [ ] Policy: Denylist blocks denied items
- [ ] Comparison: Both regex and CodeQL find detections
- [ ] Comparison: Methods show unique and overlapping results

## Troubleshooting

### No detections in true-positives
- Check that aigraph-scanner is installed correctly
- Verify patterns are up to date
- Try with `-v` flag for verbose output

### Too many detections in false-positives
- Use `--no-strings` to filter string literals
- Comments should be excluded by default
- Check if docs directory is in ignore list

### Policy violations not working
- Verify YAML syntax in policy files
- Check that policy mode is correct (allowlist vs denylist)
- Ensure item names match detection names exactly

## Contributing

If you find:
- **True positive not detected**: Add it to the appropriate true-positives directory
- **False positive detected**: Add it to the appropriate false-positives directory
- **Edge case**: Document it in this guide

This helps improve aigraph-scanner accuracy over time.
