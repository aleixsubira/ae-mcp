/**
 * Main Script Generator
 *
 * Central registry for all script generators.
 */

// Project generators
export {
  generateCreateProject,
  generateOpenProject,
  generateSaveProject,
  generateIncrementAndSave,
  generateCloseProject,
  generateGetProjectInfo,
  generateImportFootage,
  generateListProjectItems
} from './generators/projectGenerators.js';

// Composition generators
export {
  generateCreateComposition,
  generateModifyComposition,
  generateDuplicateComposition,
  generateDeleteComposition,
  generateListCompositions,
  generateGetCompositionInfo,
  generateSetActiveComposition,
  generateRenderFrame,
  generateGetCompReport,
  generateDumpCompReport
} from './generators/compositionGenerators.js';

// Layer generators
export {
  generateAddSolidLayer,
  generateAddTextLayer,
  generateAddTextLayerAdvanced,
  generateAddShapeLayer,
  generateAddNullLayer,
  generateAddAdjustmentLayer,
  generateAddCameraLayer,
  generateAddLightLayer,
  generateAddAVLayer,
  generatePrecomposeLayers,
  generateReorderLayer,
  generateModifyLayer,
  generateReplaceLayerSource,
  generateDeleteLayer,
  generateListLayers,
  generateGetLayerInfo
} from './generators/layerGenerators.js';

// Keyframe generators
export {
  generateSetKeyframe,
  generateSetKeyframeAdvanced,
  generateApplyEasyEase,
  generateSetTemporalEase,
  generateOffsetKeyframes,
  generateSnapKeyframesToGrid,
  generateScaleKeyframeTiming,
  generateReverseKeyframes,
  generateGetTextKeyframes,
  generateRemoveKeyframes,
  generateCopyKeyframes,
  generateGetKeyframes
} from './generators/keyframeGenerators.js';

// Expression generators
export {
  generateSetExpression,
  generateGetExpression,
  generateRemoveExpression,
  generateEnableExpression,
  generateAddExpressionControl,
  generateApplyExpressionTemplate,
  generateLinkProperties,
  generateBatchSetExpressions,
  getExpressionTemplates,
  generateSetDropdownItems,
  generateGetDropdownItems
} from './generators/expressionGenerators.js';

// Effect generators
export {
  generateApplyEffect,
  generateApplyEffectTemplate,
  generateModifyEffectProperties,
  generateRemoveEffect,
  generateRenameEffect,
  generateReorderEffects,
  generateCopyEffects,
  generateListEffects,
  getEffectTemplates
} from './generators/effectsGenerators.js';

// Template generators
export {
  generateCreateLowerThird,
  generateCreateTitleCard,
  generateCreateTransition,
  generateCreateLogoReveal,
  generateCreateTextAnimator
} from './generators/templateGenerators.js';

// Asset generators
export {
  generateImportFolder,
  generateReplaceFootage,
  generateOrganizeProjectItems,
  generateListProjectFolders,
  generateAuditProject,
  generateMoveProjectItem,
  generateFindMissingFootage,
  generateCollectFiles,
  generateReduceProject,
  generateSetProxy,
  generateRemoveProxy
} from './generators/assetGenerators.js';

// Marker generators
export {
  generateAddCompositionMarker,
  generateAddLayerMarker,
  generateGetMarkers,
  generateDeleteMarker,
  generateSetWorkArea,
  generateSnapToMarker,
  generateGetCurrentTime,
  generateSetCurrentTime,
  generateGetNearestMarker,
  generateNavigateMarkers
} from './generators/markerGenerators.js';

// Essential Graphics generators
export {
  generateAddToEssentialGraphics,
  generateAddLayerToEssentialGraphics,
  generateListEssentialGraphics,
  generateRenameEssentialGraphicsProperty,
  generateGetMasterProperties,
  generateSetMasterProperty,
  generateInspectApi
} from './generators/essentialGraphicsGenerators.js';

// Helpers (for direct use if needed)
export {
  escapeString,
  arrayToES3,
  objectToES3,
  colorToES3,
  positionToES3,
  wrapInUndoGroup
} from './generators/helpers.js';
