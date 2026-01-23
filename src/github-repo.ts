/**
 * AIGraph Scanner - GitHub Repository Module
 * 
 * This module handles cloning and managing public GitHub repositories for scanning.
 */

import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { spawnSync } from 'child_process';

/**
 * Parsed GitHub repository reference
 */
export interface GitHubRepoRef {
  owner: string;
  repo: string;
  ref?: string; // Optional branch, tag, or commit
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
export function parseGitHubRepo(repoString: string): GitHubRepoRef {
  let normalized = repoString.trim();
  let ref: string | undefined;

  // Handle full GitHub URLs
  if (normalized.startsWith('https://github.com/') || normalized.startsWith('http://github.com/')) {
    normalized = normalized.replace(/^https?:\/\/github\.com\//, '');
    // Remove .git suffix if present
    normalized = normalized.replace(/\.git$/, '');
    
    // Handle /tree/branch or /tree/tag patterns
    const treeMatch = normalized.match(/^([^/]+)\/([^/]+)\/tree\/(.+)$/);
    if (treeMatch) {
      return {
        owner: treeMatch[1],
        repo: treeMatch[2],
        ref: treeMatch[3],
      };
    }
  }

  // Handle owner/repo@ref format
  const atMatch = normalized.match(/^([^/@]+)\/([^/@]+)@(.+)$/);
  if (atMatch) {
    return {
      owner: atMatch[1],
      repo: atMatch[2],
      ref: atMatch[3],
    };
  }

  // Handle simple owner/repo format
  const simpleMatch = normalized.match(/^([^/]+)\/([^/]+)$/);
  if (simpleMatch) {
    return {
      owner: simpleMatch[1],
      repo: simpleMatch[2],
      ref,
    };
  }

  throw new Error(
    `Invalid GitHub repository format: "${repoString}". ` +
    'Expected formats: owner/repo, owner/repo@ref, or https://github.com/owner/repo'
  );
}

/**
 * Clone a public GitHub repository to a temporary directory
 */
export async function cloneGitHubRepo(repoRef: GitHubRepoRef): Promise<CloneResult> {
  const tempDir = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), `aigraph-scan-${repoRef.owner}-${repoRef.repo}-`)
  );

  const repoUrl = `https://github.com/${repoRef.owner}/${repoRef.repo}.git`;

  try {
    // Clone with shallow depth for efficiency
    const cloneArgs = ['clone', '--depth', '1'];
    
    if (repoRef.ref) {
      cloneArgs.push('--branch', repoRef.ref);
    }
    
    cloneArgs.push(repoUrl, tempDir);

    // Use spawnSync with argument array to prevent command injection
    const result = spawnSync('git', cloneArgs, {
      stdio: 'pipe',
      timeout: 120000, // 2 minute timeout
    });

    if (result.error) {
      throw result.error;
    }

    if (result.status !== 0) {
      const error = new Error('Git clone failed') as Error & { stderr?: Buffer };
      error.stderr = result.stderr;
      throw error;
    }

    return {
      path: tempDir,
      cleanup: async () => {
        try {
          await fs.promises.rm(tempDir, { recursive: true, force: true });
        } catch {
          // Ignore cleanup errors
        }
      },
    };
  } catch (error) {
    // Clean up on failure
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }

    const err = error as Error & { stderr?: Buffer };
    const stderr = err.stderr?.toString() || '';
    
    if (stderr.includes('not found') || stderr.includes('Repository not found')) {
      throw new Error(
        `GitHub repository not found: ${repoRef.owner}/${repoRef.repo}. ` +
        'Make sure the repository exists and is public.'
      );
    }
    
    if (stderr.includes('could not find remote branch') || stderr.includes('Remote branch')) {
      throw new Error(
        `Branch or ref "${repoRef.ref}" not found in ${repoRef.owner}/${repoRef.repo}.`
      );
    }

    throw new Error(
      `Failed to clone repository ${repoRef.owner}/${repoRef.repo}: ${err.message}`
    );
  }
}

/**
 * Check if a string looks like a GitHub repository reference
 */
export function isGitHubRepoRef(str: string): boolean {
  if (!str) return false;
  
  // Check for GitHub URL
  if (str.startsWith('https://github.com/') || str.startsWith('http://github.com/')) {
    return true;
  }
  
  // Exclude local paths (starting with ., /, or ~)
  if (str.startsWith('.') || str.startsWith('/') || str.startsWith('~')) {
    return false;
  }
  
  // Check for owner/repo format (with optional @ref)
  // GitHub names must start with alphanumeric, can contain hyphens/underscores, 
  // and cannot start or end with dots
  return /^[a-zA-Z0-9][a-zA-Z0-9_-]*\/[a-zA-Z0-9][a-zA-Z0-9_.-]*(@[a-zA-Z0-9_./-]+)?$/.test(str);
}
