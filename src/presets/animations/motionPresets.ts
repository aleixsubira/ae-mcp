/**
 * Motion Animation Presets
 *
 * Pre-built animation presets for common motion graphics tasks.
 */

export interface AnimationPreset {
  name: string;
  description: string;
  properties: string[];
  keyframes: Array<{
    time: number; // Relative time (0-1)
    property: string;
    value: number | number[];
    easeIn?: { speed: number; influence: number };
    easeOut?: { speed: number; influence: number };
  }>;
}

// Fade presets
export const FADE_PRESETS: Record<string, AnimationPreset> = {
  fadeIn: {
    name: 'Fade In',
    description: 'Simple fade in from transparent to opaque',
    properties: ['opacity'],
    keyframes: [
      { time: 0, property: 'opacity', value: 0, easeOut: { speed: 0, influence: 80 } },
      { time: 1, property: 'opacity', value: 100, easeIn: { speed: 0, influence: 80 } }
    ]
  },
  fadeOut: {
    name: 'Fade Out',
    description: 'Simple fade out from opaque to transparent',
    properties: ['opacity'],
    keyframes: [
      { time: 0, property: 'opacity', value: 100, easeOut: { speed: 0, influence: 80 } },
      { time: 1, property: 'opacity', value: 0, easeIn: { speed: 0, influence: 80 } }
    ]
  }
};

// Slide presets
export const SLIDE_PRESETS: Record<string, AnimationPreset> = {
  slideInLeft: {
    name: 'Slide In Left',
    description: 'Slide in from the left side',
    properties: ['position', 'opacity'],
    keyframes: [
      { time: 0, property: 'position', value: [-200, 0], easeOut: { speed: 0, influence: 70 } },
      { time: 0, property: 'opacity', value: 0 },
      { time: 1, property: 'position', value: [0, 0], easeIn: { speed: 0, influence: 70 } },
      { time: 0.3, property: 'opacity', value: 100 }
    ]
  },
  slideInRight: {
    name: 'Slide In Right',
    description: 'Slide in from the right side',
    properties: ['position', 'opacity'],
    keyframes: [
      { time: 0, property: 'position', value: [200, 0], easeOut: { speed: 0, influence: 70 } },
      { time: 0, property: 'opacity', value: 0 },
      { time: 1, property: 'position', value: [0, 0], easeIn: { speed: 0, influence: 70 } },
      { time: 0.3, property: 'opacity', value: 100 }
    ]
  },
  slideInUp: {
    name: 'Slide In Up',
    description: 'Slide in from below',
    properties: ['position', 'opacity'],
    keyframes: [
      { time: 0, property: 'position', value: [0, 100], easeOut: { speed: 0, influence: 70 } },
      { time: 0, property: 'opacity', value: 0 },
      { time: 1, property: 'position', value: [0, 0], easeIn: { speed: 0, influence: 70 } },
      { time: 0.3, property: 'opacity', value: 100 }
    ]
  },
  slideInDown: {
    name: 'Slide In Down',
    description: 'Slide in from above',
    properties: ['position', 'opacity'],
    keyframes: [
      { time: 0, property: 'position', value: [0, -100], easeOut: { speed: 0, influence: 70 } },
      { time: 0, property: 'opacity', value: 0 },
      { time: 1, property: 'position', value: [0, 0], easeIn: { speed: 0, influence: 70 } },
      { time: 0.3, property: 'opacity', value: 100 }
    ]
  },
  slideOutLeft: {
    name: 'Slide Out Left',
    description: 'Slide out to the left side',
    properties: ['position', 'opacity'],
    keyframes: [
      { time: 0, property: 'position', value: [0, 0], easeOut: { speed: 0, influence: 70 } },
      { time: 0, property: 'opacity', value: 100 },
      { time: 1, property: 'position', value: [-200, 0], easeIn: { speed: 0, influence: 70 } },
      { time: 0.7, property: 'opacity', value: 0 }
    ]
  },
  slideOutRight: {
    name: 'Slide Out Right',
    description: 'Slide out to the right side',
    properties: ['position', 'opacity'],
    keyframes: [
      { time: 0, property: 'position', value: [0, 0], easeOut: { speed: 0, influence: 70 } },
      { time: 0, property: 'opacity', value: 100 },
      { time: 1, property: 'position', value: [200, 0], easeIn: { speed: 0, influence: 70 } },
      { time: 0.7, property: 'opacity', value: 0 }
    ]
  },
  slideOutUp: {
    name: 'Slide Out Up',
    description: 'Slide out upward',
    properties: ['position', 'opacity'],
    keyframes: [
      { time: 0, property: 'position', value: [0, 0], easeOut: { speed: 0, influence: 70 } },
      { time: 0, property: 'opacity', value: 100 },
      { time: 1, property: 'position', value: [0, -100], easeIn: { speed: 0, influence: 70 } },
      { time: 0.7, property: 'opacity', value: 0 }
    ]
  },
  slideOutDown: {
    name: 'Slide Out Down',
    description: 'Slide out downward',
    properties: ['position', 'opacity'],
    keyframes: [
      { time: 0, property: 'position', value: [0, 0], easeOut: { speed: 0, influence: 70 } },
      { time: 0, property: 'opacity', value: 100 },
      { time: 1, property: 'position', value: [0, 100], easeIn: { speed: 0, influence: 70 } },
      { time: 0.7, property: 'opacity', value: 0 }
    ]
  }
};

// Scale presets
export const SCALE_PRESETS: Record<string, AnimationPreset> = {
  scaleIn: {
    name: 'Scale In',
    description: 'Scale in from small to normal size',
    properties: ['scale', 'opacity'],
    keyframes: [
      { time: 0, property: 'scale', value: [0, 0], easeOut: { speed: 0, influence: 80 } },
      { time: 0, property: 'opacity', value: 0 },
      { time: 1, property: 'scale', value: [100, 100], easeIn: { speed: 0, influence: 80 } },
      { time: 0.2, property: 'opacity', value: 100 }
    ]
  },
  scaleOut: {
    name: 'Scale Out',
    description: 'Scale out from normal to small size',
    properties: ['scale', 'opacity'],
    keyframes: [
      { time: 0, property: 'scale', value: [100, 100], easeOut: { speed: 0, influence: 80 } },
      { time: 0, property: 'opacity', value: 100 },
      { time: 1, property: 'scale', value: [0, 0], easeIn: { speed: 0, influence: 80 } },
      { time: 0.8, property: 'opacity', value: 0 }
    ]
  },
  scaleInBounce: {
    name: 'Scale In Bounce',
    description: 'Scale in with overshoot bounce',
    properties: ['scale', 'opacity'],
    keyframes: [
      { time: 0, property: 'scale', value: [0, 0] },
      { time: 0, property: 'opacity', value: 0 },
      { time: 0.5, property: 'scale', value: [120, 120], easeIn: { speed: 0, influence: 60 } },
      { time: 0.2, property: 'opacity', value: 100 },
      { time: 0.75, property: 'scale', value: [95, 95] },
      { time: 1, property: 'scale', value: [100, 100], easeIn: { speed: 0, influence: 50 } }
    ]
  }
};

// Physics-based presets
export const PHYSICS_PRESETS: Record<string, AnimationPreset> = {
  bounce: {
    name: 'Bounce',
    description: 'Bouncy animation with decay',
    properties: ['position'],
    keyframes: [
      { time: 0, property: 'position', value: [0, -100] },
      { time: 0.3, property: 'position', value: [0, 0] },
      { time: 0.5, property: 'position', value: [0, -30] },
      { time: 0.7, property: 'position', value: [0, 0] },
      { time: 0.85, property: 'position', value: [0, -10] },
      { time: 1, property: 'position', value: [0, 0] }
    ]
  },
  elastic: {
    name: 'Elastic',
    description: 'Elastic stretch animation',
    properties: ['scale'],
    keyframes: [
      { time: 0, property: 'scale', value: [0, 0] },
      { time: 0.4, property: 'scale', value: [110, 90] },
      { time: 0.6, property: 'scale', value: [95, 105] },
      { time: 0.8, property: 'scale', value: [102, 98] },
      { time: 1, property: 'scale', value: [100, 100] }
    ]
  },
  overshoot: {
    name: 'Overshoot',
    description: 'Move with overshoot and settle',
    properties: ['position'],
    keyframes: [
      { time: 0, property: 'position', value: [-200, 0] },
      { time: 0.5, property: 'position', value: [20, 0] },
      { time: 0.7, property: 'position', value: [-5, 0] },
      { time: 1, property: 'position', value: [0, 0] }
    ]
  }
};

// Rotation presets
export const ROTATION_PRESETS: Record<string, AnimationPreset> = {
  spinIn: {
    name: 'Spin In',
    description: 'Rotate in while scaling',
    properties: ['rotation', 'scale', 'opacity'],
    keyframes: [
      { time: 0, property: 'rotation', value: -180 },
      { time: 0, property: 'scale', value: [0, 0] },
      { time: 0, property: 'opacity', value: 0 },
      { time: 1, property: 'rotation', value: 0, easeIn: { speed: 0, influence: 70 } },
      { time: 1, property: 'scale', value: [100, 100] },
      { time: 0.3, property: 'opacity', value: 100 }
    ]
  },
  spinOut: {
    name: 'Spin Out',
    description: 'Rotate out while scaling down',
    properties: ['rotation', 'scale', 'opacity'],
    keyframes: [
      { time: 0, property: 'rotation', value: 0 },
      { time: 0, property: 'scale', value: [100, 100] },
      { time: 0, property: 'opacity', value: 100 },
      { time: 1, property: 'rotation', value: 180, easeOut: { speed: 0, influence: 70 } },
      { time: 1, property: 'scale', value: [0, 0] },
      { time: 0.7, property: 'opacity', value: 0 }
    ]
  }
};

// Combine all presets
export const ALL_PRESETS: Record<string, AnimationPreset> = {
  ...FADE_PRESETS,
  ...SLIDE_PRESETS,
  ...SCALE_PRESETS,
  ...PHYSICS_PRESETS,
  ...ROTATION_PRESETS
};

/**
 * Get preset by name
 */
export function getPreset(name: string): AnimationPreset | undefined {
  return ALL_PRESETS[name];
}

/**
 * List all available presets
 */
export function listPresets(): Array<{ name: string; description: string }> {
  return Object.entries(ALL_PRESETS).map(([key, preset]) => ({
    name: key,
    description: preset.description
  }));
}
