/**
 * Error Handler for After Effects MCP
 *
 * Maps After Effects errors to user-friendly messages and provides
 * error classification for better debugging.
 */

export enum AEErrorCode {
  // Connection errors
  NOT_RUNNING = 'AE_NOT_RUNNING',
  EXTENSION_NOT_LOADED = 'AE_EXTENSION_NOT_LOADED',
  TIMEOUT = 'AE_TIMEOUT',

  // Project errors
  NO_PROJECT = 'AE_NO_PROJECT',
  PROJECT_BUSY = 'AE_PROJECT_BUSY',
  SAVE_FAILED = 'AE_SAVE_FAILED',

  // Composition errors
  COMP_NOT_FOUND = 'AE_COMP_NOT_FOUND',
  INVALID_COMP_SETTINGS = 'AE_INVALID_COMP_SETTINGS',

  // Layer errors
  LAYER_NOT_FOUND = 'AE_LAYER_NOT_FOUND',
  LAYER_LOCKED = 'AE_LAYER_LOCKED',
  INVALID_LAYER_TYPE = 'AE_INVALID_LAYER_TYPE',

  // Property errors
  PROPERTY_NOT_FOUND = 'AE_PROPERTY_NOT_FOUND',
  PROPERTY_NOT_KEYFRAMABLE = 'AE_PROPERTY_NOT_KEYFRAMABLE',
  INVALID_PROPERTY_VALUE = 'AE_INVALID_PROPERTY_VALUE',

  // Expression errors
  EXPRESSION_ERROR = 'AE_EXPRESSION_ERROR',
  EXPRESSION_DISABLED = 'AE_EXPRESSION_DISABLED',

  // Effect errors
  EFFECT_NOT_FOUND = 'AE_EFFECT_NOT_FOUND',
  EFFECT_NOT_INSTALLED = 'AE_EFFECT_NOT_INSTALLED',

  // Render errors
  RENDER_FAILED = 'AE_RENDER_FAILED',
  OUTPUT_PATH_INVALID = 'AE_OUTPUT_PATH_INVALID',

  // Asset errors
  FILE_NOT_FOUND = 'AE_FILE_NOT_FOUND',
  FOOTAGE_MISSING = 'AE_FOOTAGE_MISSING',
  IMPORT_FAILED = 'AE_IMPORT_FAILED',

  // Script errors
  SCRIPT_ERROR = 'AE_SCRIPT_ERROR',
  PERMISSION_DENIED = 'AE_PERMISSION_DENIED',

  // Unknown
  UNKNOWN = 'AE_UNKNOWN_ERROR'
}

export interface AEError {
  code: AEErrorCode;
  message: string;
  details?: string;
  suggestion?: string;
}

// Error message patterns to code mapping
const ERROR_PATTERNS: Array<{ pattern: RegExp; code: AEErrorCode }> = [
  // Connection
  { pattern: /timeout/i, code: AEErrorCode.TIMEOUT },
  { pattern: /not running/i, code: AEErrorCode.NOT_RUNNING },
  { pattern: /extension.*not.*loaded/i, code: AEErrorCode.EXTENSION_NOT_LOADED },

  // Project
  { pattern: /no.*project/i, code: AEErrorCode.NO_PROJECT },
  { pattern: /project.*busy/i, code: AEErrorCode.PROJECT_BUSY },
  { pattern: /save.*fail/i, code: AEErrorCode.SAVE_FAILED },

  // Composition
  { pattern: /comp.*not.*found/i, code: AEErrorCode.COMP_NOT_FOUND },
  { pattern: /composition.*not.*found/i, code: AEErrorCode.COMP_NOT_FOUND },
  { pattern: /invalid.*comp/i, code: AEErrorCode.INVALID_COMP_SETTINGS },

  // Layer
  { pattern: /layer.*not.*found/i, code: AEErrorCode.LAYER_NOT_FOUND },
  { pattern: /layer.*locked/i, code: AEErrorCode.LAYER_LOCKED },
  { pattern: /invalid.*layer.*type/i, code: AEErrorCode.INVALID_LAYER_TYPE },

  // Property
  { pattern: /property.*not.*found/i, code: AEErrorCode.PROPERTY_NOT_FOUND },
  { pattern: /cannot.*keyframe/i, code: AEErrorCode.PROPERTY_NOT_KEYFRAMABLE },
  { pattern: /invalid.*value/i, code: AEErrorCode.INVALID_PROPERTY_VALUE },

  // Expression
  { pattern: /expression.*error/i, code: AEErrorCode.EXPRESSION_ERROR },
  { pattern: /expression.*disabled/i, code: AEErrorCode.EXPRESSION_DISABLED },

  // Effect
  { pattern: /effect.*not.*found/i, code: AEErrorCode.EFFECT_NOT_FOUND },
  { pattern: /effect.*not.*installed/i, code: AEErrorCode.EFFECT_NOT_INSTALLED },
  { pattern: /plugin.*not.*found/i, code: AEErrorCode.EFFECT_NOT_INSTALLED },

  // Render
  { pattern: /render.*fail/i, code: AEErrorCode.RENDER_FAILED },
  { pattern: /output.*path/i, code: AEErrorCode.OUTPUT_PATH_INVALID },

  // Asset
  { pattern: /file.*not.*found/i, code: AEErrorCode.FILE_NOT_FOUND },
  { pattern: /footage.*missing/i, code: AEErrorCode.FOOTAGE_MISSING },
  { pattern: /import.*fail/i, code: AEErrorCode.IMPORT_FAILED },

  // Script
  { pattern: /permission.*denied/i, code: AEErrorCode.PERMISSION_DENIED },
  { pattern: /script.*error/i, code: AEErrorCode.SCRIPT_ERROR }
];

// User-friendly messages for each error code
const ERROR_MESSAGES: Record<AEErrorCode, { message: string; suggestion: string }> = {
  [AEErrorCode.NOT_RUNNING]: {
    message: 'After Effects does not appear to be running',
    suggestion: 'Please start After Effects and ensure the AE-MCP extension panel is visible.'
  },
  [AEErrorCode.EXTENSION_NOT_LOADED]: {
    message: 'The AE-MCP CEP extension is not loaded',
    suggestion: 'Open After Effects and go to Window > Extensions > AE-MCP to load the panel.'
  },
  [AEErrorCode.TIMEOUT]: {
    message: 'Command timed out waiting for After Effects response',
    suggestion: 'Check if After Effects is responding. Try restarting the application or the extension panel.'
  },
  [AEErrorCode.NO_PROJECT]: {
    message: 'No project is currently open in After Effects',
    suggestion: 'Create a new project or open an existing one before running this command.'
  },
  [AEErrorCode.PROJECT_BUSY]: {
    message: 'After Effects is busy with another operation',
    suggestion: 'Wait for the current operation to complete and try again.'
  },
  [AEErrorCode.SAVE_FAILED]: {
    message: 'Failed to save the project',
    suggestion: 'Check if the output path is valid and you have write permissions.'
  },
  [AEErrorCode.COMP_NOT_FOUND]: {
    message: 'The specified composition was not found',
    suggestion: 'Verify the composition ID or name. Use list_compositions to see available compositions.'
  },
  [AEErrorCode.INVALID_COMP_SETTINGS]: {
    message: 'Invalid composition settings provided',
    suggestion: 'Check that width, height, frameRate, and duration are positive numbers.'
  },
  [AEErrorCode.LAYER_NOT_FOUND]: {
    message: 'The specified layer was not found',
    suggestion: 'Verify the layer index or name. Use list_layers to see available layers in the composition.'
  },
  [AEErrorCode.LAYER_LOCKED]: {
    message: 'The layer is locked and cannot be modified',
    suggestion: 'Unlock the layer in After Effects before making changes.'
  },
  [AEErrorCode.INVALID_LAYER_TYPE]: {
    message: 'This operation is not valid for the specified layer type',
    suggestion: 'Check the layer type. Some operations only work on specific layer types.'
  },
  [AEErrorCode.PROPERTY_NOT_FOUND]: {
    message: 'The specified property was not found on the layer',
    suggestion: 'Verify the property name. Common properties: position, scale, rotation, opacity.'
  },
  [AEErrorCode.PROPERTY_NOT_KEYFRAMABLE]: {
    message: 'This property cannot have keyframes',
    suggestion: 'Only animatable properties can have keyframes set.'
  },
  [AEErrorCode.INVALID_PROPERTY_VALUE]: {
    message: 'The provided value is not valid for this property',
    suggestion: 'Check the expected value type. Position needs [x,y], scale needs [x,y] or [x,y,z], etc.'
  },
  [AEErrorCode.EXPRESSION_ERROR]: {
    message: 'The expression contains an error',
    suggestion: 'Review the expression syntax. After Effects uses JavaScript-based expressions.'
  },
  [AEErrorCode.EXPRESSION_DISABLED]: {
    message: 'Expressions are disabled for this property',
    suggestion: 'Enable expressions in the property settings or check if the layer supports expressions.'
  },
  [AEErrorCode.EFFECT_NOT_FOUND]: {
    message: 'The specified effect was not found on the layer',
    suggestion: 'Verify the effect name or index. Use the effect\'s match name for best results.'
  },
  [AEErrorCode.EFFECT_NOT_INSTALLED]: {
    message: 'The requested effect plugin is not installed',
    suggestion: 'This effect requires a plugin that is not installed in After Effects.'
  },
  [AEErrorCode.RENDER_FAILED]: {
    message: 'Render operation failed',
    suggestion: 'Check the render queue for specific error messages. Ensure all footage is available.'
  },
  [AEErrorCode.OUTPUT_PATH_INVALID]: {
    message: 'The output path is invalid or not writable',
    suggestion: 'Verify the output directory exists and you have write permissions.'
  },
  [AEErrorCode.FILE_NOT_FOUND]: {
    message: 'The specified file was not found',
    suggestion: 'Verify the file path is correct and the file exists.'
  },
  [AEErrorCode.FOOTAGE_MISSING]: {
    message: 'Some footage items are missing or offline',
    suggestion: 'Relink the missing footage in After Effects or use find_missing_footage to locate them.'
  },
  [AEErrorCode.IMPORT_FAILED]: {
    message: 'Failed to import the file',
    suggestion: 'Verify the file format is supported and the file is not corrupted.'
  },
  [AEErrorCode.SCRIPT_ERROR]: {
    message: 'An error occurred while executing the script',
    suggestion: 'Check the script for syntax errors. Ensure it uses ES3-compatible JavaScript.'
  },
  [AEErrorCode.PERMISSION_DENIED]: {
    message: 'Permission denied to execute this operation',
    suggestion: 'Enable "Allow Scripts to Write Files" in After Effects Preferences > Scripting & Expressions.'
  },
  [AEErrorCode.UNKNOWN]: {
    message: 'An unknown error occurred',
    suggestion: 'Check the After Effects console for more details.'
  }
};

/**
 * Parse an error message and return a structured AEError
 */
export function parseError(error: string | Error): AEError {
  const errorMessage = error instanceof Error ? error.message : error;

  // Try to match against known patterns
  for (const { pattern, code } of ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      const info = ERROR_MESSAGES[code];
      return {
        code,
        message: info.message,
        details: errorMessage,
        suggestion: info.suggestion
      };
    }
  }

  // Unknown error
  return {
    code: AEErrorCode.UNKNOWN,
    message: ERROR_MESSAGES[AEErrorCode.UNKNOWN].message,
    details: errorMessage,
    suggestion: ERROR_MESSAGES[AEErrorCode.UNKNOWN].suggestion
  };
}

/**
 * Format an AEError for display
 */
export function formatError(error: AEError): string {
  let formatted = `[${error.code}] ${error.message}`;
  if (error.details) {
    formatted += `\nDetails: ${error.details}`;
  }
  if (error.suggestion) {
    formatted += `\nSuggestion: ${error.suggestion}`;
  }
  return formatted;
}

/**
 * Check if an error is recoverable (can retry)
 */
export function isRecoverable(code: AEErrorCode): boolean {
  const recoverableCodes = [
    AEErrorCode.TIMEOUT,
    AEErrorCode.PROJECT_BUSY
  ];
  return recoverableCodes.includes(code);
}

/**
 * Create a standard error response for MCP
 */
export function createErrorResponse(error: string | Error): {
  success: false;
  error: string;
  errorCode?: AEErrorCode;
  suggestion?: string;
} {
  const parsed = parseError(error);
  return {
    success: false,
    error: parsed.message + (parsed.details ? ` (${parsed.details})` : ''),
    errorCode: parsed.code,
    suggestion: parsed.suggestion
  };
}
