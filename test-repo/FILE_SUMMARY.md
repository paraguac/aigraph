# Test Repository File Summary

This document provides a complete inventory of test files and their purpose.

## True Positives (Should Be Detected)

### Models Directory (`true-positives/models/`)
| File | Purpose | Expected Detections |
|------|---------|-------------------|
| `openai_gpt.py` | OpenAI Python SDK usage | gpt-4, gpt-4-turbo, gpt-3.5-turbo, o1-preview, text-embedding |
| `anthropic_claude.py` | Anthropic Python SDK usage | claude-3-opus, claude-3-sonnet, claude-3-haiku |
| `llama_mistral.py` | Open source models via Hugging Face | llama-2, llama-3, codellama, mistral-7b, mixtral |
| `google_gemini.py` | Google Gemini API usage | gemini-pro, gemini-1.5-pro, gemini-1.5-flash |
| `openai_client.ts` | OpenAI TypeScript SDK usage | gpt-4, gpt-4o, gpt-3.5-turbo, o1-preview, text-embedding |
| `edge_cases.py` | Dynamic model selection & ensemble | Multiple models with dynamic config |
| `notebook_example.ipynb` | Jupyter notebook with AI code | gpt-4, claude-3-sonnet, langchain |

**Total Expected:** 25+ model detections

### Frameworks Directory (`true-positives/frameworks/`)
| File | Purpose | Expected Detections |
|------|---------|-------------------|
| `langchain_usage.py` | LangChain Python usage | langchain, gpt-4 |
| `langgraph_workflow.py` | LangGraph state machine | langgraph, gpt-4 |
| `autogen_agents.py` | AutoGen multi-agent system | autogen, gpt-4 |
| `crewai_agents.py` | CrewAI agent framework | crewai, gpt-4, claude |
| `llamaindex_store.py` | LlamaIndex vector store | llamaindex, gpt-4, text-embedding |
| `langchain_typescript.ts` | LangChain TypeScript | langchain, @langchain/openai, @langchain/anthropic, gpt-4, claude |

**Total Expected:** 6+ framework detections, plus associated models

### Platforms Directory (`true-positives/platforms/`)
| File | Purpose | Expected Detections |
|------|---------|-------------------|
| `aws_bedrock.py` | AWS Bedrock API usage | aws-bedrock, bedrock-runtime, amazon-titan, claude, llama |
| `azure_openai.py` | Azure OpenAI service | azure-openai, azure-ai-openai, gpt-4, gpt-35-turbo |
| `gcp_vertex.py` | Google Cloud Vertex AI | vertex-ai, gemini-pro, palm-2 |
| `ollama_local.py` | Ollama local platform | ollama, llama2, mistral |

**Total Expected:** 4+ platform detections, plus associated models

### MCP Directory (`true-positives/mcp/`)
| File | Purpose | Expected Detections |
|------|---------|-------------------|
| `package.json` | NPM package with MCP dependencies | mcp-sdk, mcp-server-filesystem, mcp-server-github, mcp-server-postgres |
| `mcp_client.py` | MCP Python client | mcp, multiple server references |
| `mcp_server.ts` | MCP server implementation | @modelcontextprotocol/sdk |
| `mcp-config.json` | MCP configuration file | 7+ MCP servers (filesystem, github, postgres, brave-search, puppeteer, sqlite, slack) |

**Total Expected:** 10+ MCP component detections

### Configs Directory (`true-positives/configs/`)
| File | Purpose | Expected Detections |
|------|---------|-------------------|
| `package.json` | Node.js dependencies | openai, anthropic, langchain, many others |
| `requirements.txt` | Python dependencies | openai, anthropic, langchain, autogen, crewai, etc. |
| `docker-compose.yml` | Docker services | gpt-4, claude, llama2, mistral, bedrock, azure-openai, ollama, mcp-server |
| `kubernetes.yaml` | K8s deployments | gpt-4, gpt-3.5-turbo, claude-3-sonnet, ollama, llama2, mistral |
| `terraform.tf` | Terraform IaC | bedrock models (claude, titan), azure gpt-4, vertex gemini |
| `helm-values.yaml` | Helm chart values | gpt-4, claude, llama2, mistral, gemini-pro, mcp servers |

**Total Expected:** 30+ detections across configuration files

## False Positives (Should NOT Be Detected)

### Comments Directory (`false-positives/comments/`)
| File | Purpose | Expected Behavior |
|------|---------|------------------|
| `comments_only.py` | AI terms only in Python comments | 0 detections (default), many if --include-comments |
| `comments_only.js` | AI terms only in JS comments | 0 detections (default), many if --include-comments |
| `commented_out_code.py` | Commented-out AI code | 0 detections (should not parse comments) |

**Expected:** 0 detections without `--include-comments` flag

### Docs Directory (`false-positives/docs/`)
| File | Purpose | Expected Behavior |
|------|---------|------------------|
| `AI_GUIDE.md` | Documentation about AI models | May detect strings, but no actual usage |
| `ARCHITECTURE.md` | Architecture docs with AI terms | May detect strings, but no actual usage |

**Expected:** Some detections in strings, but distinguishable from code

### Variables Directory (`false-positives/variables/`)
| File | Purpose | Expected Behavior |
|------|---------|------------------|
| `variable_names.py` | Variables named after AI terms | Should NOT detect as AI usage (no imports) |
| `variable_names.js` | JS variables named after AI terms | Should NOT detect as AI usage (no imports) |

**Expected:** 0-2 detections (only if strings match patterns)

### Unrelated Directory (`false-positives/unrelated/`)
| File | Purpose | Expected Behavior |
|------|---------|------------------|
| `string_literals.py` | Unrelated strings with AI terms | May detect in strings, filterable with --no-strings |
| `string_literals.js` | Unrelated JS strings with AI terms | May detect in strings, filterable with --no-strings |
| `edge_cases.py` | Edge case scenarios | Should NOT detect (no actual AI usage) |

**Expected:** 5-15 detections (strings), 0 with `--no-strings`

## Policy Test Files

### `test-policy-allowlist.yml`
- **Mode:** Allowlist
- **Allowed:** gpt-4*, claude, langchain, langgraph, aws-bedrock, azure-openai
- **Expected violations:** llama, mistral, gemini, autogen, crewai, ollama, gcp-vertex-ai

### `test-policy-denylist.yml`
- **Mode:** Denylist
- **Blocked:** llama, mistral, phi, autogen, crewai, ollama, mcp-server-puppeteer, mcp-server-postgres
- **Expected violations:** All blocked items found in true-positives

## Complete File List

### True Positives (17 files)
```
true-positives/
├── models/ (7 files)
│   ├── openai_gpt.py
│   ├── anthropic_claude.py
│   ├── llama_mistral.py
│   ├── google_gemini.py
│   ├── openai_client.ts
│   ├── edge_cases.py
│   └── notebook_example.ipynb
├── frameworks/ (6 files)
│   ├── langchain_usage.py
│   ├── langgraph_workflow.py
│   ├── autogen_agents.py
│   ├── crewai_agents.py
│   ├── llamaindex_store.py
│   └── langchain_typescript.ts
├── platforms/ (4 files)
│   ├── aws_bedrock.py
│   ├── azure_openai.py
│   ├── gcp_vertex.py
│   └── ollama_local.py
├── mcp/ (4 files)
│   ├── package.json
│   ├── mcp_client.py
│   ├── mcp_server.ts
│   └── mcp-config.json
└── configs/ (6 files)
    ├── package.json
    ├── requirements.txt
    ├── docker-compose.yml
    ├── kubernetes.yaml
    ├── terraform.tf
    └── helm-values.yaml
```

### False Positives (8 files)
```
false-positives/
├── comments/ (3 files)
│   ├── comments_only.py
│   ├── comments_only.js
│   └── commented_out_code.py
├── docs/ (2 files)
│   ├── AI_GUIDE.md
│   └── ARCHITECTURE.md
├── variables/ (2 files)
│   ├── variable_names.py
│   └── variable_names.js
└── unrelated/ (3 files)
    ├── string_literals.py
    ├── string_literals.js
    └── edge_cases.py
```

### Root Files (3 files)
```
├── README.md
├── TESTING_GUIDE.md
├── FILE_SUMMARY.md (this file)
├── run-tests.sh
├── test-policy-allowlist.yml
└── test-policy-denylist.yml
```

**Grand Total:** 28 test files + 5 documentation/config files = 33 files

## Coverage Matrix

| Category | True Positive Files | False Positive Files | Total Coverage |
|----------|-------------------|---------------------|----------------|
| Models | 7 files | 0 files | ✅ Complete |
| Frameworks | 6 files | 0 files | ✅ Complete |
| Platforms | 4 files | 0 files | ✅ Complete |
| MCP | 4 files | 0 files | ✅ Complete |
| Configs | 6 files | 0 files | ✅ Complete |
| Comments | 0 files | 3 files | ✅ Complete |
| Documentation | 0 files | 2 files | ✅ Complete |
| Variables | 0 files | 2 files | ✅ Complete |
| Strings | 0 files | 3 files | ✅ Complete |

## Usage Recommendations

### For Development
- Use individual directories to test specific features
- Run `aigraph-scanner test-repo/true-positives/models/` to test model detection
- Run `aigraph-scanner test-repo/true-positives/frameworks/` to test framework detection

### For CI/CD
- Run the full test script: `./test-repo/run-tests.sh`
- Check exit codes and output for regressions
- Compare detection counts against expected baselines

### For Regression Testing
- Before releasing new versions, run against this test repo
- Verify detection counts haven't decreased unexpectedly
- Ensure false positive rate remains low

### For Feature Development
- Add new test cases when adding new patterns
- Update expected counts in this document
- Keep true/false positive balance
