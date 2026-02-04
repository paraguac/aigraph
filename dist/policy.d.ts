/**
 * AIGraph Scanner - Policy Enforcement Module
 *
 * This module handles loading spec files and enforcing allow/deny policies.
 */
import { AIGraphSpec, Detection, ScanResults } from './types';
/**
 * Policy Enforcer class
 */
export declare class PolicyEnforcer {
    private spec;
    constructor(spec?: AIGraphSpec);
    /**
     * Load spec from a file. If specPath is undefined, returns default spec.
     */
    static loadSpec(specPath: string | undefined): Promise<AIGraphSpec>;
    /**
     * Validate and normalize spec structure
     */
    private static validateSpec;
    /**
     * Validate policies structure
     */
    private static validatePolicies;
    /**
     * Validate a single policy rule
     */
    private static validatePolicyRule;
    /**
     * Get the policy rule for a detection category
     */
    private getPolicyForCategory;
    /**
     * Check if a detection matches a pattern
     */
    private matchesPattern;
    /**
     * Check if a detection is allowed
     */
    isAllowed(detection: Detection): {
        allowed: boolean;
        rule?: 'denied' | 'not-allowed';
    };
    /**
     * Enforce policies on scan results
     */
    enforce(results: ScanResults): ScanResults;
    /**
     * Create a human-readable violation message
     */
    private createViolationMessage;
}
