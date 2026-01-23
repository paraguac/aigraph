/**
 * AIGraph Scanner - Detection Patterns
 *
 * This file contains all the patterns used to detect AI models, frameworks,
 * platforms, and MCP servers/tools in codebases.
 */
import { DetectionPattern } from './types';
/**
 * Open Source AI Models - Direct usage patterns
 */
export declare const MODEL_PATTERNS: DetectionPattern[];
/**
 * Agentic AI Frameworks
 */
export declare const FRAMEWORK_PATTERNS: DetectionPattern[];
/**
 * AI Platforms as a Service
 */
export declare const PLATFORM_PATTERNS: DetectionPattern[];
/**
 * MCP (Model Context Protocol) Servers
 */
export declare const MCP_SERVER_PATTERNS: DetectionPattern[];
/**
 * MCP Tools patterns
 */
export declare const MCP_TOOL_PATTERNS: DetectionPattern[];
/**
 * All patterns combined
 */
export declare const ALL_PATTERNS: DetectionPattern[];
