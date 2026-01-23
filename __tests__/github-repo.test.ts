/**
 * AIGraph Scanner - Tests for GitHub Repository Module
 */

import { parseGitHubRepo, isGitHubRepoRef } from '../src/github-repo';

describe('GitHub Repository Module', () => {
  describe('parseGitHubRepo', () => {
    test('parses simple owner/repo format', () => {
      const result = parseGitHubRepo('owner/repo');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
      expect(result.ref).toBeUndefined();
    });

    test('parses owner/repo@branch format', () => {
      const result = parseGitHubRepo('owner/repo@main');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
      expect(result.ref).toBe('main');
    });

    test('parses owner/repo@tag format', () => {
      const result = parseGitHubRepo('langchain-ai/langchain@v0.1.0');
      expect(result.owner).toBe('langchain-ai');
      expect(result.repo).toBe('langchain');
      expect(result.ref).toBe('v0.1.0');
    });

    test('parses full GitHub URL', () => {
      const result = parseGitHubRepo('https://github.com/owner/repo');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
      expect(result.ref).toBeUndefined();
    });

    test('parses GitHub URL with .git suffix', () => {
      const result = parseGitHubRepo('https://github.com/owner/repo.git');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });

    test('parses GitHub URL with tree/branch', () => {
      const result = parseGitHubRepo('https://github.com/owner/repo/tree/feature-branch');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
      expect(result.ref).toBe('feature-branch');
    });

    test('handles repo names with dots and underscores', () => {
      const result = parseGitHubRepo('org-name/repo_name.js');
      expect(result.owner).toBe('org-name');
      expect(result.repo).toBe('repo_name.js');
    });

    test('throws error for invalid format', () => {
      expect(() => parseGitHubRepo('invalid')).toThrow('Invalid GitHub repository format');
    });

    test('throws error for empty string', () => {
      expect(() => parseGitHubRepo('')).toThrow('Invalid GitHub repository format');
    });

    test('trims whitespace', () => {
      const result = parseGitHubRepo('  owner/repo  ');
      expect(result.owner).toBe('owner');
      expect(result.repo).toBe('repo');
    });
  });

  describe('isGitHubRepoRef', () => {
    test('returns true for owner/repo format', () => {
      expect(isGitHubRepoRef('owner/repo')).toBe(true);
    });

    test('returns true for owner/repo@ref format', () => {
      expect(isGitHubRepoRef('owner/repo@main')).toBe(true);
    });

    test('returns true for GitHub URL', () => {
      expect(isGitHubRepoRef('https://github.com/owner/repo')).toBe(true);
    });

    test('returns false for local paths', () => {
      expect(isGitHubRepoRef('.')).toBe(false);
      expect(isGitHubRepoRef('./src')).toBe(false);
      expect(isGitHubRepoRef('/home/user/project')).toBe(false);
    });

    test('returns false for empty string', () => {
      expect(isGitHubRepoRef('')).toBe(false);
    });

    test('returns false for null/undefined', () => {
      expect(isGitHubRepoRef(null as unknown as string)).toBe(false);
      expect(isGitHubRepoRef(undefined as unknown as string)).toBe(false);
    });

    test('returns true for repos with dashes and underscores', () => {
      expect(isGitHubRepoRef('my-org/my_repo')).toBe(true);
      expect(isGitHubRepoRef('langchain-ai/langchain')).toBe(true);
    });
  });
});
