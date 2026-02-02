/**
 * Zod Schemas for Input Validation
 */

import { z } from 'zod';

// Basic type schemas
export const ColorSchema = z.object({
  r: z.number().min(0).max(1),
  g: z.number().min(0).max(1),
  b: z.number().min(0).max(1),
  a: z.number().min(0).max(1).optional()
});

export const PositionSchema = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number().optional()
});

export const SizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive()
});

// Layer reference schema - either index or name
export const LayerReferenceSchema = z.union([
  z.number().int().positive(),
  z.string().min(1)
]);

// ============================================
// PROJECT TOOLS SCHEMAS
// ============================================

export const CreateProjectSchema = z.object({
  name: z.string().optional()
});

export const OpenProjectSchema = z.object({
  path: z.string()
});

export const SaveProjectSchema = z.object({
  path: z.string().optional()
});

export const ImportFootageSchema = z.object({
  path: z.string(),
  name: z.string().optional(),
  sequence: z.boolean().optional(),
  forceAlphabetical: z.boolean().optional()
});

// ============================================
// COMPOSITION TOOLS SCHEMAS
// ============================================

export const CreateCompositionSchema = z.object({
  name: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  frameRate: z.number().positive(),
  duration: z.number().positive(),
  backgroundColor: ColorSchema.optional()
});

export const ModifyCompositionSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  name: z.string().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  frameRate: z.number().positive().optional(),
  duration: z.number().positive().optional(),
  backgroundColor: ColorSchema.optional()
});

export const DuplicateCompositionSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  newName: z.string().optional()
});

export const DeleteCompositionSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional()
});

export const GetCompositionInfoSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional()
});

// ============================================
// LAYER TOOLS SCHEMAS
// ============================================

export const AddSolidLayerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  name: z.string(),
  color: ColorSchema,
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  duration: z.number().positive().optional(),
  startTime: z.number().optional()
});

export const AddTextLayerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  text: z.string(),
  name: z.string().optional(),
  position: PositionSchema.optional(),
  fontSize: z.number().positive().optional(),
  fontFamily: z.string().optional(),
  color: ColorSchema.optional(),
  justification: z.enum(['LEFT', 'CENTER', 'RIGHT']).optional()
});

export const AddTextLayerAdvancedSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  text: z.string(),
  name: z.string().optional(),
  position: PositionSchema.optional(),
  fontSize: z.number().positive().optional(),
  fontFamily: z.string().optional(),
  color: ColorSchema.optional(),
  justification: z.enum(['LEFT', 'CENTER', 'RIGHT', 'FULL_JUSTIFY_LASTLINE_LEFT', 'FULL_JUSTIFY_LASTLINE_CENTER', 'FULL_JUSTIFY_LASTLINE_RIGHT', 'FULL_JUSTIFY_LASTLINE_FULL']).optional(),
  tracking: z.number().optional(),
  leading: z.number().optional(),
  baselineShift: z.number().optional(),
  strokeColor: ColorSchema.optional(),
  strokeWidth: z.number().optional(),
  strokeOverFill: z.boolean().optional()
});

export const AddShapeLayerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  name: z.string().optional(),
  shape: z.enum(['rectangle', 'ellipse', 'polygon', 'star']).optional(),
  size: SizeSchema.optional(),
  position: PositionSchema.optional(),
  fillColor: ColorSchema.optional(),
  strokeColor: ColorSchema.optional(),
  strokeWidth: z.number().optional(),
  points: z.number().int().min(3).optional(),
  innerRadius: z.number().optional(),
  outerRadius: z.number().optional()
});

export const AddNullLayerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  name: z.string().optional()
});

export const AddAdjustmentLayerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  name: z.string().optional()
});

export const AddCameraLayerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  name: z.string().optional(),
  type: z.enum(['ONE_NODE', 'TWO_NODE']).optional(),
  zoom: z.number().positive().optional()
});

export const AddLightLayerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  name: z.string().optional(),
  type: z.enum(['PARALLEL', 'SPOT', 'POINT', 'AMBIENT']).optional(),
  color: ColorSchema.optional(),
  intensity: z.number().optional()
});

export const AddAVLayerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  itemId: z.number().int().optional(),
  itemName: z.string().optional(),
  startTime: z.number().optional()
});

export const PrecomposeLayersSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndices: z.array(z.number().int().positive()),
  name: z.string(),
  moveAttributes: z.boolean().optional()
});

export const ModifyLayerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  name: z.string().optional(),
  enabled: z.boolean().optional(),
  solo: z.boolean().optional(),
  shy: z.boolean().optional(),
  locked: z.boolean().optional(),
  inPoint: z.number().optional(),
  outPoint: z.number().optional(),
  startTime: z.number().optional(),
  stretch: z.number().optional(),
  blendMode: z.string().optional(),
  parent: z.number().int().optional(),
  is3D: z.boolean().optional(),
  position: PositionSchema.optional(),
  scale: z.array(z.number()).optional(),
  rotation: z.number().optional(),
  opacity: z.number().min(0).max(100).optional()
});

export const DeleteLayerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional()
});

// ============================================
// KEYFRAME TOOLS SCHEMAS
// ============================================

export const SetKeyframeSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string(),
  time: z.number(),
  value: z.union([z.number(), z.array(z.number()), z.string()])
});

export const SetKeyframeAdvancedSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string(),
  time: z.number(),
  value: z.union([z.number(), z.array(z.number()), z.string()]),
  inType: z.enum(['LINEAR', 'BEZIER', 'HOLD']).optional(),
  outType: z.enum(['LINEAR', 'BEZIER', 'HOLD']).optional(),
  inEase: z.object({
    speed: z.number(),
    influence: z.number().min(0.1).max(100)
  }).optional(),
  outEase: z.object({
    speed: z.number(),
    influence: z.number().min(0.1).max(100)
  }).optional()
});

export const ApplyEasyEaseSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string(),
  keyframeIndex: z.number().int().positive().optional(),
  type: z.enum(['IN', 'OUT', 'BOTH']).optional()
});

export const SetTemporalEaseSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string(),
  keyframeIndex: z.number().int().positive(),
  inSpeed: z.number().optional(),
  inInfluence: z.number().min(0.1).max(100).optional(),
  outSpeed: z.number().optional(),
  outInfluence: z.number().min(0.1).max(100).optional()
});

export const OffsetKeyframesSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string(),
  offset: z.number()
});

export const ScaleKeyframeTimingSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string(),
  scale: z.number().positive(),
  anchorTime: z.number().optional()
});

export const ReverseKeyframesSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string()
});

export const ApplyAnimationPresetSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  preset: z.enum([
    'fadeIn', 'fadeOut',
    'slideInLeft', 'slideInRight', 'slideInUp', 'slideInDown',
    'slideOutLeft', 'slideOutRight', 'slideOutUp', 'slideOutDown',
    'scaleIn', 'scaleOut',
    'bounce', 'elastic', 'overshoot',
    'spring', 'springIn', 'springOut'
  ]),
  property: z.string().optional(),
  startTime: z.number().optional(),
  duration: z.number().positive().optional(),
  config: z.object({
    mass: z.number().positive().optional(),
    stiffness: z.number().positive().optional(),
    damping: z.number().positive().optional(),
    overshoot: z.boolean().optional(),
    distance: z.number().optional(),
    fromValue: z.union([z.number(), z.array(z.number())]).optional(),
    toValue: z.union([z.number(), z.array(z.number())]).optional()
  }).optional()
});

// ============================================
// EXPRESSION TOOLS SCHEMAS
// ============================================

export const SetExpressionSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string(),
  expression: z.string()
});

export const GetExpressionSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string()
});

export const RemoveExpressionSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string()
});

export const EnableExpressionSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string(),
  enabled: z.boolean()
});

export const AddExpressionControlSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  controlType: z.enum(['slider', 'color', 'point', 'checkbox', 'dropdown', 'angle', 'layer']),
  controlName: z.string(),
  defaultValue: z.union([z.number(), z.array(z.number()), z.boolean(), z.string()]).optional()
});

export const ApplyExpressionTemplateSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  property: z.string(),
  template: z.enum([
    // Wiggle
    'wiggle', 'wiggleSmooth', 'wiggleFadeIn', 'wiggleFadeOut',
    // Loop
    'loopCycle', 'loopPingpong', 'loopOffset', 'loopContinue',
    // Time
    'time', 'clock', 'countdown', 'frameNumber',
    // Linking
    'matchPosition', 'offsetPosition', 'inverseRotation', 'followPath',
    // Physics
    'bounce', 'inertia', 'overshoot', 'springy'
  ]),
  params: z.record(z.any()).optional()
});

// ============================================
// EFFECT TOOLS SCHEMAS
// ============================================

export const ApplyEffectSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  effect: z.string(),
  properties: z.record(z.any()).optional()
});

export const ApplyEffectTemplateSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  template: z.enum([
    // Blur
    'gaussianBlur', 'directionalBlur', 'glassBlur',
    // Color
    'curves', 'colorBalance', 'brightnessContrast', 'vibrance',
    // Stylistic
    'glow', 'dropShadow', 'vignette',
    // Creative looks
    'cinematicLook', 'vhsRetro', 'neonGlow', 'filmGrain',
    'chromaticAberration', 'duotone'
  ]),
  intensity: z.number().min(0).max(100).optional(),
  customParams: z.record(z.any()).optional()
});

export const ModifyEffectPropertiesSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  effectIndex: z.number().int().positive().optional(),
  effectName: z.string().optional(),
  properties: z.record(z.any())
});

export const RemoveEffectSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  effectIndex: z.number().int().positive().optional(),
  effectName: z.string().optional()
});

export const ReorderEffectsSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  effectIndex: z.number().int().positive(),
  newIndex: z.number().int().positive()
});

export const CopyEffectsSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  sourceLayerIndex: z.number().int().positive().optional(),
  sourceLayerName: z.string().optional(),
  targetLayerIndex: z.number().int().positive().optional(),
  targetLayerName: z.string().optional(),
  effectIndices: z.array(z.number().int().positive()).optional()
});

// ============================================
// TEMPLATE TOOLS SCHEMAS
// ============================================

export const CreateLowerThirdSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  style: z.enum(['modern', 'corporate', 'news', 'minimal', 'social']),
  name: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  duration: z.number().positive().optional(),
  animateIn: z.boolean().optional(),
  animateOut: z.boolean().optional(),
  primaryColor: ColorSchema.optional(),
  secondaryColor: ColorSchema.optional(),
  textColor: ColorSchema.optional(),
  position: z.enum(['bottomLeft', 'bottomRight', 'bottomCenter']).optional()
});

export const CreateTitleCardSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  style: z.enum(['cinematic', 'documentary', 'social', 'minimal']),
  title: z.string(),
  subtitle: z.string().optional(),
  duration: z.number().positive().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.number().positive().optional(),
  color: ColorSchema.optional(),
  backgroundColor: ColorSchema.optional()
});

export const CreateTransitionSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  type: z.enum(['wipe_left', 'wipe_right', 'wipe_up', 'wipe_down', 'dissolve', 'push', 'slide', 'zoom']),
  duration: z.number().positive().optional(),
  easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).optional(),
  color: ColorSchema.optional()
});

export const CreateLogoRevealSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  logoItemId: z.number().int().optional(),
  logoItemName: z.string().optional(),
  style: z.enum(['fade', 'scale', 'slide', 'spin', 'glitch', 'particle']).optional(),
  duration: z.number().positive().optional(),
  backgroundColor: ColorSchema.optional()
});

export const CreateTextAnimatorSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  animatorType: z.enum([
    'typewriter', 'fadeInChars', 'scaleInChars',
    'slideInChars', 'randomize', 'wave'
  ]),
  duration: z.number().positive().optional(),
  delay: z.number().optional()
});

// ============================================
// ASSET TOOLS SCHEMAS
// ============================================

export const ImportFolderSchema = z.object({
  path: z.string(),
  recursive: z.boolean().optional()
});

export const ReplaceFootageSchema = z.object({
  itemId: z.number().int().optional(),
  itemName: z.string().optional(),
  newPath: z.string()
});

export const OrganizeProjectItemsSchema = z.object({
  structure: z.enum(['type', 'usage', 'custom']).optional(),
  customFolders: z.array(z.string()).optional()
});

export const FindMissingFootageSchema = z.object({});

export const CollectFilesSchema = z.object({
  outputPath: z.string(),
  includeFootage: z.boolean().optional(),
  includeFonts: z.boolean().optional()
});

export const ReduceProjectSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional()
});

// ============================================
// MARKER TOOLS SCHEMAS
// ============================================

export const AddCompositionMarkerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  time: z.number(),
  comment: z.string().optional(),
  duration: z.number().optional(),
  chapter: z.string().optional(),
  url: z.string().optional(),
  frameTarget: z.string().optional(),
  cuePointName: z.string().optional()
});

export const AddLayerMarkerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  time: z.number(),
  comment: z.string().optional(),
  duration: z.number().optional()
});

export const GetMarkersSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional()
});

export const DeleteMarkerSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  markerIndex: z.number().int().positive()
});

export const SetWorkAreaSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  start: z.number(),
  duration: z.number().positive()
});

// ============================================
// RENDER TOOLS SCHEMAS
// ============================================

export const AddToRenderQueueSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  outputPath: z.string().optional(),
  template: z.string().optional()
});

export const StartRenderSchema = z.object({});

export const GetRenderQueueSchema = z.object({});

export const ClearRenderQueueSchema = z.object({});

export const ExportFrameSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  time: z.number().optional(),
  outputPath: z.string(),
  format: z.enum(['PNG', 'JPEG', 'PSD', 'TIFF']).optional()
});

// ============================================
// BATCH TOOLS SCHEMAS
// ============================================

export const BatchExecuteSchema = z.object({
  operations: z.array(z.object({
    tool: z.string(),
    params: z.record(z.any())
  })),
  mode: z.enum(['sequential', 'parallel']).optional(),
  stopOnError: z.boolean().optional()
});

export const BatchKeyframesSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  keyframes: z.array(z.object({
    property: z.string(),
    time: z.number(),
    value: z.union([z.number(), z.array(z.number()), z.string()]),
    easing: z.enum(['linear', 'easeIn', 'easeOut', 'easeInOut']).optional()
  }))
});

export const BatchCreateLayersSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layers: z.array(z.object({
    type: z.enum(['solid', 'text', 'shape', 'null', 'adjustment']),
    params: z.record(z.any())
  }))
});

export const BatchModifyLayerPropertiesSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional(),
  properties: z.array(z.object({
    property: z.string(),
    value: z.union([z.number(), z.array(z.number()), z.string(), z.boolean()])
  }))
});

// ============================================
// UTILITY SCHEMAS
// ============================================

export const ExecuteScriptSchema = z.object({
  script: z.string()
});

export const GetLayerInfoSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional(),
  layerIndex: z.number().int().positive().optional(),
  layerName: z.string().optional()
});

export const ListLayersSchema = z.object({
  compId: z.number().int().optional(),
  compName: z.string().optional()
});
