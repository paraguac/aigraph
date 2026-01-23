/**
 * AIGraph Scanner - GitHub Repository Module
 *
 * This module handles cloning and managing public GitHub repositories for scanning.
 */
/**
 * Parsed GitHub repository reference
 */
export interface GitHubRepoRef {
    owner: string;
    repo: string;
    ref?: string;
}
/**
 * Result of cloning a GitHub repository
 */
export interface CloneResult {
    path: string;
    cleanup: () => Promise<void>;
}
/**
 * Parse a GitHub repository reference string
 * Supports formats:
 * - owner/repo
 * - owner/repo@ref (branch, tag, or commit)
 * - https://github.com/owner/repo
 * - https://github.com/owner/repo/tree/branch
 */
export declare function parseGitHubRepo(repoString: string): GitHubRepoRef;
/**
 * Clone a public GitHub repository to a temporary directory
 */
export declare function cloneGitHubRepo(repoRef: GitHubRepoRef): Promise<CloneResult>;
/**
 * Check if a string looks like a GitHub repository reference
 */
export declare function isGitHubRepoRef(str: string): boolean;
