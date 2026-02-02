/**
 * Effect Templates Library
 *
 * Pre-configured effect chains for common looks.
 */

export interface EffectProperty {
  name: string;
  value: number | number[] | string | boolean;
}

export interface EffectConfig {
  matchName: string;
  displayName: string;
  properties: EffectProperty[];
}

export interface EffectTemplate {
  name: string;
  description: string;
  category: string;
  effects: EffectConfig[];
}

export const EFFECT_TEMPLATES: Record<string, EffectTemplate> = {
  // ============================================
  // BLUR EFFECTS
  // ============================================
  gaussianBlur: {
    name: 'Gaussian Blur',
    description: 'Soft, even blur effect',
    category: 'blur',
    effects: [{
      matchName: 'ADBE Gaussian Blur 2',
      displayName: 'Gaussian Blur',
      properties: [
        { name: 'Blurriness', value: 15 },
        { name: 'Repeat Edge Pixels', value: true }
      ]
    }]
  },

  directionalBlur: {
    name: 'Directional Blur',
    description: 'Motion blur in a specific direction',
    category: 'blur',
    effects: [{
      matchName: 'ADBE Motion Blur',
      displayName: 'Directional Blur',
      properties: [
        { name: 'Direction', value: 0 },
        { name: 'Blur Length', value: 25 }
      ]
    }]
  },

  glassBlur: {
    name: 'Frosted Glass',
    description: 'Frosted glass effect',
    category: 'blur',
    effects: [
      {
        matchName: 'ADBE Gaussian Blur 2',
        displayName: 'Gaussian Blur',
        properties: [
          { name: 'Blurriness', value: 50 }
        ]
      },
      {
        matchName: 'ADBE Noise',
        displayName: 'Noise',
        properties: [
          { name: 'Amount of Noise', value: 3 }
        ]
      }
    ]
  },

  // ============================================
  // COLOR CORRECTION
  // ============================================
  curves: {
    name: 'Curves',
    description: 'Color curves adjustment',
    category: 'color',
    effects: [{
      matchName: 'ADBE CurvesCustom',
      displayName: 'Curves',
      properties: []
    }]
  },

  colorBalance: {
    name: 'Color Balance',
    description: 'Adjust color balance',
    category: 'color',
    effects: [{
      matchName: 'ADBE Color Balance 2',
      displayName: 'Color Balance (HLS)',
      properties: [
        { name: 'Hue', value: 0 },
        { name: 'Lightness', value: 0 },
        { name: 'Saturation', value: 0 }
      ]
    }]
  },

  brightnessContrast: {
    name: 'Brightness & Contrast',
    description: 'Adjust brightness and contrast',
    category: 'color',
    effects: [{
      matchName: 'ADBE Brightness & Contrast 2',
      displayName: 'Brightness & Contrast',
      properties: [
        { name: 'Brightness', value: 0 },
        { name: 'Contrast', value: 0 },
        { name: 'Use Legacy', value: false }
      ]
    }]
  },

  vibrance: {
    name: 'Vibrance',
    description: 'Boost colors naturally',
    category: 'color',
    effects: [{
      matchName: 'ADBE Vibrance',
      displayName: 'Vibrance',
      properties: [
        { name: 'Vibrance', value: 40 },
        { name: 'Saturation', value: 0 }
      ]
    }]
  },

  // ============================================
  // STYLISTIC EFFECTS
  // ============================================
  glow: {
    name: 'Glow',
    description: 'Add glow effect',
    category: 'stylistic',
    effects: [{
      matchName: 'ADBE Glo2',
      displayName: 'Glow',
      properties: [
        { name: 'Glow Threshold', value: 60 },
        { name: 'Glow Radius', value: 30 },
        { name: 'Glow Intensity', value: 1 },
        { name: 'Glow Colors', value: 1 }, // A & B Colors
        { name: 'Color Looping', value: 1 } // Sawtooth A>B
      ]
    }]
  },

  dropShadow: {
    name: 'Drop Shadow',
    description: 'Classic drop shadow',
    category: 'stylistic',
    effects: [{
      matchName: 'ADBE Drop Shadow',
      displayName: 'Drop Shadow',
      properties: [
        { name: 'Shadow Color', value: [0, 0, 0, 1] },
        { name: 'Opacity', value: 75 },
        { name: 'Direction', value: 135 },
        { name: 'Distance', value: 10 },
        { name: 'Softness', value: 15 }
      ]
    }]
  },

  vignette: {
    name: 'Vignette',
    description: 'Dark edges vignette',
    category: 'stylistic',
    effects: [{
      matchName: 'ADBE Ramp',
      displayName: 'Gradient Ramp',
      properties: [
        { name: 'Start of Ramp', value: [960, 540] },
        { name: 'End of Ramp', value: [960, 0] },
        { name: 'Start Color', value: [0, 0, 0, 0] },
        { name: 'End Color', value: [0, 0, 0, 1] },
        { name: 'Ramp Shape', value: 2 }, // Radial
        { name: 'Ramp Scatter', value: 0 },
        { name: 'Blend With Original', value: 50 }
      ]
    }]
  },

  // ============================================
  // CREATIVE LOOKS
  // ============================================
  cinematicLook: {
    name: 'Cinematic Look',
    description: 'Film-like color grading',
    category: 'creative',
    effects: [
      {
        matchName: 'ADBE Brightness & Contrast 2',
        displayName: 'Brightness & Contrast',
        properties: [
          { name: 'Brightness', value: -5 },
          { name: 'Contrast', value: 15 }
        ]
      },
      {
        matchName: 'ADBE Vibrance',
        displayName: 'Vibrance',
        properties: [
          { name: 'Vibrance', value: -15 },
          { name: 'Saturation', value: -10 }
        ]
      },
      {
        matchName: 'ADBE Ramp',
        displayName: 'Vignette',
        properties: [
          { name: 'Ramp Shape', value: 2 },
          { name: 'Blend With Original', value: 30 }
        ]
      }
    ]
  },

  vhsRetro: {
    name: 'VHS Retro',
    description: 'Retro VHS tape look',
    category: 'creative',
    effects: [
      {
        matchName: 'ADBE Noise',
        displayName: 'Noise',
        properties: [
          { name: 'Amount of Noise', value: 10 }
        ]
      },
      {
        matchName: 'ADBE HUE SATURATION',
        displayName: 'Hue/Saturation',
        properties: [
          { name: 'Saturation', value: -30 }
        ]
      },
      {
        matchName: 'ADBE Brightness & Contrast 2',
        displayName: 'Brightness & Contrast',
        properties: [
          { name: 'Contrast', value: -15 }
        ]
      }
    ]
  },

  neonGlow: {
    name: 'Neon Glow',
    description: 'Bright neon glow effect',
    category: 'creative',
    effects: [
      {
        matchName: 'ADBE Glo2',
        displayName: 'Glow',
        properties: [
          { name: 'Glow Threshold', value: 40 },
          { name: 'Glow Radius', value: 60 },
          { name: 'Glow Intensity', value: 2 }
        ]
      },
      {
        matchName: 'ADBE Vibrance',
        displayName: 'Vibrance',
        properties: [
          { name: 'Vibrance', value: 60 }
        ]
      }
    ]
  },

  filmGrain: {
    name: 'Film Grain',
    description: 'Subtle film grain texture',
    category: 'creative',
    effects: [{
      matchName: 'ADBE Add Grain',
      displayName: 'Add Grain',
      properties: [
        { name: 'Viewing Mode', value: 1 }, // Final Output
        { name: 'Intensity', value: 0.5 },
        { name: 'Size', value: 1.5 },
        { name: 'Softness', value: 0 }
      ]
    }]
  },

  chromaticAberration: {
    name: 'Chromatic Aberration',
    description: 'RGB channel separation',
    category: 'creative',
    effects: [
      // Note: True chromatic aberration requires channel shifting
      // This is a simplified version using hue shift
      {
        matchName: 'ADBE HUE SATURATION',
        displayName: 'Hue/Saturation',
        properties: [
          { name: 'Channel Control', value: 1 } // Master
        ]
      }
    ]
  },

  duotone: {
    name: 'Duotone',
    description: 'Two-color toning effect',
    category: 'creative',
    effects: [{
      matchName: 'ADBE Tritone',
      displayName: 'Tritone',
      properties: [
        { name: 'Highlights', value: [1, 0.9, 0.8] },
        { name: 'Midtones', value: [0.5, 0.3, 0.2] },
        { name: 'Shadows', value: [0.1, 0.05, 0.1] }
      ]
    }]
  }
};

/**
 * Get effect template by name
 */
export function getEffectTemplate(name: string): EffectTemplate | undefined {
  return EFFECT_TEMPLATES[name];
}

/**
 * List all effect templates
 */
export function listEffectTemplates(): Array<{
  name: string;
  category: string;
  description: string;
}> {
  return Object.entries(EFFECT_TEMPLATES).map(([key, template]) => ({
    name: key,
    category: template.category,
    description: template.description
  }));
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): Record<string, EffectTemplate> {
  const filtered: Record<string, EffectTemplate> = {};
  for (const [key, template] of Object.entries(EFFECT_TEMPLATES)) {
    if (template.category === category) {
      filtered[key] = template;
    }
  }
  return filtered;
}
