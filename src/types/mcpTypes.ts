/**
 * MCP Protocol and Server Type Definitions
 */

export interface MCPCommand {
  id: string;
  tool: string;
  params: Record<string, any>;
  timestamp: number;
  clientPrefix: string;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  executionTime?: number;
}

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
  handler: (params: Record<string, any>) => Promise<MCPResponse>;
}

export interface MCPResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}

export interface MCPPrompt {
  name: string;
  description: string;
  arguments?: MCPPromptArgument[];
}

export interface MCPPromptArgument {
  name: string;
  description: string;
  required?: boolean;
}

// File-based communication types
export interface CommandFile {
  id: string;
  script: string;
  timestamp: number;
}

export interface ResponseFile {
  success: boolean;
  data?: any;
  error?: string;
  commandId: string;
  timestamp: number;
}

export interface PendingCommand {
  resolve: (value: MCPResponse) => void;
  reject: (reason: Error) => void;
  timeout: NodeJS.Timeout;
  createdAt: number;
}

// Tool category types
export type ToolCategory =
  | 'project'
  | 'composition'
  | 'layer'
  | 'keyframe'
  | 'expression'
  | 'effect'
  | 'template'
  | 'asset'
  | 'marker'
  | 'render'
  | 'batch';

export interface ToolDefinition {
  name: string;
  category: ToolCategory;
  description: string;
  inputSchema: Record<string, any>;
  generator: (params: Record<string, any>) => string;
}

// Batch operation types
export interface BatchOperation {
  tool: string;
  params: Record<string, any>;
}

export interface BatchResult {
  index: number;
  tool: string;
  success: boolean;
  data?: any;
  error?: string;
}

// Animation preset application params
export interface AnimationPresetParams {
  layerIndex: number;
  compId?: number;
  preset: string;
  property: string;
  startTime?: number;
  duration?: number;
  customParams?: Record<string, any>;
}

// Expression application params
export interface ExpressionParams {
  layerIndex: number;
  compId?: number;
  property: string;
  expression?: string;
  template?: string;
  templateParams?: Record<string, any>;
}

// Effect application params
export interface EffectParams {
  layerIndex: number;
  compId?: number;
  effect: string;
  properties?: Record<string, any>;
  template?: string;
}

// Logger interface
export interface Logger {
  debug: (message: string, meta?: any) => void;
  info: (message: string, meta?: any) => void;
  warn: (message: string, meta?: any) => void;
  error: (message: string, meta?: any) => void;
}
