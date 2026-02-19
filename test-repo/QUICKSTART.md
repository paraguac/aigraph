# AIGraph Test Repository - Quick Start

## What is This?

This is a test repository designed to validate aigraph-scanner's ability to:
1. **Detect true positives**: Real AI usage (models, frameworks, platforms, MCP)
2. **Handle false positives**: Filter out comments, docs, and unrelated strings

## Quick Tests

### 1. Test True Positives (✅ Should find 300+ detections)
```bash
aigraph-scanner test-repo/true-positives/ --no-codeql -q
```

**Expected:** 300+ detections across:
- 60+ AI models (gpt-4, claude, llama, mistral, gemini)
- 40+ AI frameworks (langchain, langgraph, autogen, crewai)
- 20+ AI platforms (aws-bedrock, azure-openai, vertex-ai, ollama)
- 30+ MCP servers/tools
- Plus configs, notebooks, IaC files

### 2. Test False Positives (❌ Should minimize detections)
```bash
aigraph-scanner test-repo/false-positives/ --no-codeql -q
```

**Expected:** 40-50 detections in strings/comments
- These demonstrate the scanner's coverage
- Use filtering flags to reduce false positives

### 3. Test Allowlist Policy (should find violations)
```bash
aigraph-scanner -s test-repo/test-policy-allowlist.yml test-repo/true-positives/ --no-codeql -q --no-fail
```

**Expected:** 150+ violations for non-allowed items
- Only gpt-4*, claude, langchain, langgraph, aws-bedrock, azure-openai are allowed
- Everything else should be flagged as violation

### 4. Test Denylist Policy (should find violations)
```bash
aigraph-scanner -s test-repo/test-policy-denylist.yml test-repo/true-positives/ --no-codeql -q --no-fail
```

**Expected:** 100+ violations for denied items
- llama, mistral, phi, autogen, crewai, ollama are blocked
- These should be flagged as violations

### 5. Run Full Test Suite
```bash
cd test-repo && ./run-tests.sh
```

Runs all four tests above and provides a summary.

## What's Inside?

### True Positives (27 files)
Real code examples with actual AI usage:
- **7 model files**: openai_gpt.py, anthropic_claude.py, llama_mistral.py, etc.
- **6 framework files**: langchain_usage.py, langgraph_workflow.py, autogen_agents.py, etc.
- **4 platform files**: aws_bedrock.py, azure_openai.py, gcp_vertex.py, ollama_local.py
- **4 MCP files**: mcp_client.py, mcp_server.ts, mcp-config.json, package.json
- **6 config files**: package.json, requirements.txt, docker-compose.yml, kubernetes.yaml, terraform.tf, helm-values.yaml

### False Positives (8 files)
Examples that should NOT trigger (or be filterable):
- **3 comment files**: AI terms only in comments
- **2 doc files**: Documentation mentioning AI
- **2 variable files**: Variables coincidentally named after AI models
- **3 string files**: Unrelated strings containing AI terms

## Understanding Results

### Good Results
- ✅ True positives: 250-350 detections
- ✅ Policy violations: Match expected blocked items
- ✅ Comparison: Regex and CodeQL both find detections

### Expected Behavior
- 📊 False positives: 30-50 detections in strings/comments (normal, use filters)
- 📊 Comments: Detected with `--include-comments`, filtered by default
- 📊 Strings: Detected by default, filterable with `--no-strings`

### Issues to Investigate
- ❌ True positives: < 200 detections (patterns may need updates)
- ❌ False positives: > 100 detections without comments (too many false positives)
- ❌ Policy: Wrong violations (policy logic issue)

## Need Help?

See detailed guides:
- `README.md` - Full documentation
- `TESTING_GUIDE.md` - Comprehensive testing instructions
- `FILE_SUMMARY.md` - Complete file inventory

## Example Output

```
╔═══════════════════════════════════════════════════════════════════════╗
║                    AIGraph Scan Results                               ║
╚═══════════════════════════════════════════════════════════════════════╝

┌───────────────────────────────────────────────────────────────────────┐
│ SUMMARY                                                               │
├──────────────────────────────┬────────────────────────────────────────┤
│ Files Scanned                │ 27                                     │
│ Total Detections (Combined)  │ 309                                    │
│ Total Violations             │ 0                                      │
└──────────────────────────────┴────────────────────────────────────────┘

AI Models: 60+ (gpt-4, claude, llama, mistral, gemini)
AI Frameworks: 40+ (langchain, autogen, crewai, llamaindex)
AI Platforms: 20+ (aws-bedrock, azure-openai, vertex-ai, ollama)
MCP Components: 30+ (mcp-server-filesystem, mcp-server-github, etc.)
```
