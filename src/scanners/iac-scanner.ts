/**
 * AIGraph Scanner - Infrastructure as Code Scanner
 * 
 * This module handles scanning IaC files (Terraform, Helm, CloudFormation, etc.)
 * for AI model deployments and configurations.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import { Detection, DetectionCategory, IaCResource } from '../types';

/**
 * Supported IaC file types
 */
type IaCFileType = 'terraform' | 'helm' | 'cloudformation' | 'kubernetes' | 'docker-compose' | 'unknown';

/**
 * AI-related resource patterns in IaC
 */
const IAC_AI_PATTERNS = {
  // AWS resources
  awsBedrock: [
    /aws_bedrockagent/i,
    /aws_bedrock/i,
    /bedrock-agent/i,
    /bedrock-runtime/i,
  ],
  awsSagemaker: [
    /aws_sagemaker/i,
    /sagemaker/i,
  ],
  // Azure resources
  azureOpenai: [
    /azurerm_cognitive_account.*openai/i,
    /azure-openai/i,
    /cognitive-services.*openai/i,
    /Microsoft\.CognitiveServices.*OpenAI/i,
  ],
  azureMl: [
    /azurerm_machine_learning/i,
    /azure-ml/i,
    /Microsoft\.MachineLearningServices/i,
  ],
  // GCP resources
  gcpVertexAi: [
    /google_vertex_ai/i,
    /vertex-ai/i,
    /aiplatform/i,
  ],
  gcpAi: [
    /google_ml_engine/i,
    /google_ai_platform/i,
  ],
  // Container images
  aiImages: [
    /openai/i,
    /anthropic/i,
    /huggingface/i,
    /ollama/i,
    /vllm/i,
    /text-generation-inference/i,
    /triton/i,
    /tensorflow\/serving/i,
    /pytorch\/serve/i,
    /nvidia\/cuda/i,
  ],
  // Environment variables in containers
  aiEnvVars: [
    /OPENAI_API_KEY/i,
    /ANTHROPIC_API_KEY/i,
    /HUGGINGFACE_TOKEN/i,
    /HF_TOKEN/i,
    /AZURE_OPENAI/i,
    /GOOGLE_API_KEY/i,
    /COHERE_API_KEY/i,
    /REPLICATE_API/i,
    /GROQ_API_KEY/i,
    /TOGETHER_API_KEY/i,
  ],
  // Model references in configs
  modelRefs: [
    /gpt-4/i,
    /gpt-3\.5/i,
    /claude-3/i,
    /claude-2/i,
    /gemini/i,
    /llama-?[23]/i,
    /mistral/i,
    /mixtral/i,
  ],
};

/**
 * IaC Scanner class
 */
export class IaCScanner {
  /**
   * Detect the type of IaC file
   */
  static detectFileType(filePath: string): IaCFileType {
    const basename = path.basename(filePath).toLowerCase();
    const ext = path.extname(filePath).toLowerCase();

    if (ext === '.tf' || ext === '.tfvars') {
      return 'terraform';
    }
    if (basename === 'chart.yaml' || basename === 'values.yaml' || filePath.includes('/templates/')) {
      return 'helm';
    }
    if (basename === 'docker-compose.yml' || basename === 'docker-compose.yaml' || basename === 'compose.yml') {
      return 'docker-compose';
    }
    if (ext === '.yaml' || ext === '.yml') {
      // Check content for CloudFormation or Kubernetes
      return 'unknown'; // Will be determined by content
    }

    return 'unknown';
  }

  /**
   * Scan an IaC file for AI-related resources
   */
  async scanFile(filePath: string, basePath: string): Promise<Detection[]> {
    const fileType = IaCScanner.detectFileType(filePath);
    const relativePath = path.relative(basePath, filePath);

    try {
      const content = await fs.promises.readFile(filePath, 'utf-8');

      switch (fileType) {
        case 'terraform':
          return this.scanTerraform(content, relativePath);
        case 'helm':
        case 'docker-compose':
          return this.scanYaml(content, relativePath, fileType);
        case 'kubernetes':
        case 'cloudformation':
          return this.scanYaml(content, relativePath, fileType);
        default:
          // Try to detect from content
          if (content.includes('AWSTemplateFormatVersion') || content.includes('Resources:')) {
            return this.scanYaml(content, relativePath, 'cloudformation');
          }
          if (content.includes('apiVersion:') && content.includes('kind:')) {
            return this.scanYaml(content, relativePath, 'kubernetes');
          }
          return this.scanGenericIaC(content, relativePath);
      }
    } catch (error) {
      console.warn(`Failed to scan IaC file ${filePath}: ${(error as Error).message}`);
      return [];
    }
  }

  /**
   * Scan Terraform files
   */
  private scanTerraform(content: string, filePath: string): Detection[] {
    const detections: Detection[] = [];
    const lines = content.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      // Check for AI-related resources
      for (const [category, patterns] of Object.entries(IAC_AI_PATTERNS)) {
        for (const pattern of patterns) {
          if (pattern.test(line)) {
            const detection = this.createIaCDetection(
              category,
              line,
              filePath,
              lineNum + 1,
              lines,
              'terraform'
            );
            if (detection) {
              detections.push(detection);
            }
          }
        }
      }
    }

    return detections;
  }

  /**
   * Scan YAML-based IaC files (Helm, K8s, CloudFormation, Docker Compose)
   */
  private scanYaml(content: string, filePath: string, fileType: IaCFileType): Detection[] {
    const detections: Detection[] = [];
    const lines = content.split('\n');

    // Parse YAML to understand structure
    let parsed: unknown;
    try {
      parsed = yaml.load(content);
    } catch {
      // If YAML parsing fails, fall back to line-by-line scanning
      return this.scanGenericIaC(content, filePath);
    }

    // Scan line by line for patterns
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      for (const [category, patterns] of Object.entries(IAC_AI_PATTERNS)) {
        for (const pattern of patterns) {
          if (pattern.test(line)) {
            const detection = this.createIaCDetection(
              category,
              line,
              filePath,
              lineNum + 1,
              lines,
              fileType
            );
            if (detection) {
              detections.push(detection);
            }
          }
        }
      }
    }

    // Deep scan parsed YAML for AI configurations
    if (parsed && typeof parsed === 'object') {
      this.scanYamlObject(parsed, filePath, lines, detections);
    }

    return detections;
  }

  /**
   * Recursively scan a YAML object for AI patterns
   */
  private scanYamlObject(
    obj: unknown,
    filePath: string,
    lines: string[],
    detections: Detection[],
    path: string[] = []
  ): void {
    if (!obj || typeof obj !== 'object') return;

    const record = obj as Record<string, unknown>;

    for (const [key, value] of Object.entries(record)) {
      const currentPath = [...path, key];

      // Check for AI-related keys
      const aiKeys = ['model', 'model_name', 'modelName', 'engine', 'deployment', 'image'];
      if (aiKeys.includes(key.toLowerCase()) && typeof value === 'string') {
        // Check if value matches AI model patterns
        for (const pattern of IAC_AI_PATTERNS.modelRefs) {
          if (pattern.test(value)) {
            // Find line number in original content
            const lineNum = this.findLineNumber(lines, key, value);
            detections.push({
              category: 'infrastructure',
              name: value,
              file: filePath,
              line: lineNum,
              snippet: this.getSnippet(lines, lineNum - 1),
              confidence: 'high',
              context: 'config',
              metadata: {
                provider: this.inferProvider(value),
                path: currentPath.join('.'),
                type: 'model-reference',
              },
            });
            break;
          }
        }
      }

      // Check for AI images
      if ((key === 'image' || key === 'repository') && typeof value === 'string') {
        for (const pattern of IAC_AI_PATTERNS.aiImages) {
          if (pattern.test(value)) {
            const lineNum = this.findLineNumber(lines, key, value);
            detections.push({
              category: 'infrastructure',
              name: value,
              file: filePath,
              line: lineNum,
              snippet: this.getSnippet(lines, lineNum - 1),
              confidence: 'high',
              context: 'config',
              metadata: {
                provider: this.inferProvider(value),
                path: currentPath.join('.'),
                type: 'container-image',
              },
            });
            break;
          }
        }
      }

      // Recurse into nested objects
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, idx) => {
            this.scanYamlObject(item, filePath, lines, detections, [...currentPath, String(idx)]);
          });
        } else {
          this.scanYamlObject(value, filePath, lines, detections, currentPath);
        }
      }
    }
  }

  /**
   * Generic line-by-line IaC scanning
   */
  private scanGenericIaC(content: string, filePath: string): Detection[] {
    const detections: Detection[] = [];
    const lines = content.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];

      for (const [category, patterns] of Object.entries(IAC_AI_PATTERNS)) {
        for (const pattern of patterns) {
          if (pattern.test(line)) {
            const detection = this.createIaCDetection(
              category,
              line,
              filePath,
              lineNum + 1,
              lines,
              'unknown'
            );
            if (detection) {
              detections.push(detection);
            }
          }
        }
      }
    }

    return detections;
  }

  /**
   * Create an IaC detection
   */
  private createIaCDetection(
    patternCategory: string,
    line: string,
    filePath: string,
    lineNum: number,
    lines: string[],
    fileType: IaCFileType
  ): Detection | null {
    // Extract the matched value from the line
    const match = line.match(/["']([^"']+)["']/) || line.match(/=\s*(\S+)/) || [null, line.trim()];
    const value = match[1] || line.trim();

    // Map pattern category to detection category
    const categoryMap: Record<string, DetectionCategory> = {
      awsBedrock: 'infrastructure',
      awsSagemaker: 'infrastructure',
      azureOpenai: 'infrastructure',
      azureMl: 'infrastructure',
      gcpVertexAi: 'infrastructure',
      gcpAi: 'infrastructure',
      aiImages: 'infrastructure',
      aiEnvVars: 'platform',
      modelRefs: 'model',
    };

    const category = categoryMap[patternCategory] || 'infrastructure';
    const provider = this.inferProviderFromCategory(patternCategory);

    return {
      category,
      name: value.substring(0, 100), // Truncate long values
      file: filePath,
      line: lineNum,
      snippet: this.getSnippet(lines, lineNum - 1),
      confidence: 'high',
      context: 'config',
      metadata: {
        provider,
        iacType: fileType,
        patternType: patternCategory,
      },
    };
  }

  /**
   * Find line number for a key-value pair
   */
  private findLineNumber(lines: string[], key: string, value: string): number {
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes(key) && lines[i].includes(value)) {
        return i + 1;
      }
    }
    return 1;
  }

  /**
   * Get snippet around a line
   */
  private getSnippet(lines: string[], lineNum: number, context: number = 1): string {
    const start = Math.max(0, lineNum - context);
    const end = Math.min(lines.length - 1, lineNum + context);

    return lines.slice(start, end + 1)
      .map((line, idx) => {
        const actualLine = start + idx + 1;
        const prefix = actualLine === lineNum + 1 ? '>' : ' ';
        return `${prefix} ${actualLine}: ${line}`;
      })
      .join('\n');
  }

  /**
   * Infer provider from value
   */
  private inferProvider(value: string): string {
    const v = value.toLowerCase();
    if (v.includes('openai') || v.includes('gpt')) return 'openai';
    if (v.includes('anthropic') || v.includes('claude')) return 'anthropic';
    if (v.includes('google') || v.includes('gemini') || v.includes('palm')) return 'google';
    if (v.includes('huggingface') || v.includes('hf')) return 'huggingface';
    if (v.includes('llama') || v.includes('meta')) return 'meta';
    if (v.includes('mistral') || v.includes('mixtral')) return 'mistral';
    if (v.includes('azure')) return 'azure';
    if (v.includes('bedrock') || v.includes('aws')) return 'aws';
    if (v.includes('vertex') || v.includes('gcp')) return 'gcp';
    if (v.includes('ollama')) return 'ollama';
    if (v.includes('nvidia') || v.includes('triton')) return 'nvidia';
    return 'unknown';
  }

  /**
   * Infer provider from pattern category
   */
  private inferProviderFromCategory(category: string): string {
    if (category.startsWith('aws')) return 'aws';
    if (category.startsWith('azure')) return 'azure';
    if (category.startsWith('gcp')) return 'gcp';
    return 'unknown';
  }
}

/**
 * Check if a file is an IaC file
 */
export function isIaCFile(filePath: string): boolean {
  const basename = path.basename(filePath).toLowerCase();
  const ext = path.extname(filePath).toLowerCase();

  // Terraform
  if (ext === '.tf' || ext === '.tfvars') return true;

  // Helm
  if (basename === 'chart.yaml' || basename === 'values.yaml') return true;

  // Docker Compose
  if (basename.startsWith('docker-compose') || basename === 'compose.yml' || basename === 'compose.yaml') return true;

  // Dockerfile
  if (basename === 'dockerfile' || basename.startsWith('dockerfile.')) return true;

  // Check for common IaC directories
  if (filePath.includes('/terraform/') || filePath.includes('/helm/') || filePath.includes('/k8s/')) {
    return ext === '.yaml' || ext === '.yml' || ext === '.tf';
  }

  return false;
}

/**
 * Convenience function to scan an IaC file
 */
export async function scanIaCFile(filePath: string, basePath: string): Promise<Detection[]> {
  const scanner = new IaCScanner();
  return scanner.scanFile(filePath, basePath);
}
