/**
 * AIGraph Scanner - Infrastructure as Code Scanner
 *
 * This module handles scanning IaC files (Terraform, Helm, CloudFormation, etc.)
 * for AI model deployments and configurations.
 */
import { Detection } from '../types';
/**
 * Supported IaC file types
 */
type IaCFileType = 'terraform' | 'helm' | 'cloudformation' | 'kubernetes' | 'docker-compose' | 'unknown';
/**
 * IaC Scanner class
 */
export declare class IaCScanner {
    /**
     * Detect the type of IaC file
     */
    static detectFileType(filePath: string): IaCFileType;
    /**
     * Scan an IaC file for AI-related resources
     */
    scanFile(filePath: string, basePath: string): Promise<Detection[]>;
    /**
     * Scan Terraform files
     */
    private scanTerraform;
    /**
     * Scan YAML-based IaC files (Helm, K8s, CloudFormation, Docker Compose)
     */
    private scanYaml;
    /**
     * Recursively scan a YAML object for AI patterns
     */
    private scanYamlObject;
    /**
     * Generic line-by-line IaC scanning
     */
    private scanGenericIaC;
    /**
     * Create an IaC detection
     */
    private createIaCDetection;
    /**
     * Find line number for a key-value pair
     */
    private findLineNumber;
    /**
     * Get snippet around a line
     */
    private getSnippet;
    /**
     * Infer provider from value
     */
    private inferProvider;
    /**
     * Infer provider from pattern category
     */
    private inferProviderFromCategory;
}
/**
 * Check if a file is an IaC file
 */
export declare function isIaCFile(filePath: string): boolean;
/**
 * Convenience function to scan an IaC file
 */
export declare function scanIaCFile(filePath: string, basePath: string): Promise<Detection[]>;
export {};
//# sourceMappingURL=iac-scanner.d.ts.map