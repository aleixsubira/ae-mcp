/**
 * Motion Graphics Presets
 *
 * Pre-built configurations for lower thirds, titles, and other motion graphics.
 */

export interface LowerThirdStyle {
  name: string;
  description: string;
  barHeight: number;
  barOffset: number;
  titleSize: number;
  subtitleSize: number;
  animationDuration: number;
  fontFamily: string;
  subtitleFontFamily: string;
}

export interface TitleStyle {
  name: string;
  description: string;
  fontSize: number;
  fontFamily: string;
  animationType: string;
  animationDuration: number;
}

export interface TransitionStyle {
  name: string;
  description: string;
  defaultDuration: number;
  defaultEasing: string;
}

export const LOWER_THIRD_STYLES: Record<string, LowerThirdStyle> = {
  modern: {
    name: 'Modern',
    description: 'Clean, minimalist lower third with accent bar',
    barHeight: 60,
    barOffset: 10,
    titleSize: 32,
    subtitleSize: 18,
    animationDuration: 0.5,
    fontFamily: 'Helvetica Neue',
    subtitleFontFamily: 'Helvetica Neue Light'
  },

  corporate: {
    name: 'Corporate',
    description: 'Professional lower third for business presentations',
    barHeight: 80,
    barOffset: 0,
    titleSize: 36,
    subtitleSize: 20,
    animationDuration: 0.6,
    fontFamily: 'Arial Bold',
    subtitleFontFamily: 'Arial'
  },

  news: {
    name: 'News',
    description: 'News broadcast style lower third',
    barHeight: 70,
    barOffset: 0,
    titleSize: 28,
    subtitleSize: 16,
    animationDuration: 0.4,
    fontFamily: 'Helvetica Bold',
    subtitleFontFamily: 'Helvetica'
  },

  minimal: {
    name: 'Minimal',
    description: 'Text-only minimal lower third',
    barHeight: 0,
    barOffset: 20,
    titleSize: 28,
    subtitleSize: 16,
    animationDuration: 0.3,
    fontFamily: 'Futura Medium',
    subtitleFontFamily: 'Futura Light'
  },

  social: {
    name: 'Social',
    description: 'Social media friendly lower third',
    barHeight: 50,
    barOffset: 15,
    titleSize: 24,
    subtitleSize: 14,
    animationDuration: 0.4,
    fontFamily: 'Proxima Nova Bold',
    subtitleFontFamily: 'Proxima Nova'
  }
};

export const TITLE_STYLES: Record<string, TitleStyle> = {
  cinematic: {
    name: 'Cinematic',
    description: 'Film-style title with fade and scale',
    fontSize: 72,
    fontFamily: 'Trajan Pro',
    animationType: 'fadeScale',
    animationDuration: 1.5
  },

  documentary: {
    name: 'Documentary',
    description: 'Clean documentary-style title',
    fontSize: 56,
    fontFamily: 'Helvetica Neue Light',
    animationType: 'fadeSlide',
    animationDuration: 1.0
  },

  social: {
    name: 'Social',
    description: 'Bold, attention-grabbing title',
    fontSize: 80,
    fontFamily: 'Impact',
    animationType: 'scaleBounce',
    animationDuration: 0.6
  },

  minimal: {
    name: 'Minimal',
    description: 'Simple, elegant title',
    fontSize: 48,
    fontFamily: 'Futura',
    animationType: 'fade',
    animationDuration: 0.8
  }
};

export const TRANSITION_STYLES: Record<string, TransitionStyle> = {
  wipe_left: {
    name: 'Wipe Left',
    description: 'Wipe from right to left',
    defaultDuration: 1.0,
    defaultEasing: 'easeInOut'
  },

  wipe_right: {
    name: 'Wipe Right',
    description: 'Wipe from left to right',
    defaultDuration: 1.0,
    defaultEasing: 'easeInOut'
  },

  wipe_up: {
    name: 'Wipe Up',
    description: 'Wipe from bottom to top',
    defaultDuration: 1.0,
    defaultEasing: 'easeInOut'
  },

  wipe_down: {
    name: 'Wipe Down',
    description: 'Wipe from top to bottom',
    defaultDuration: 1.0,
    defaultEasing: 'easeInOut'
  },

  dissolve: {
    name: 'Dissolve',
    description: 'Cross-dissolve transition',
    defaultDuration: 1.0,
    defaultEasing: 'linear'
  },

  push: {
    name: 'Push',
    description: 'Push transition',
    defaultDuration: 0.8,
    defaultEasing: 'easeOut'
  },

  slide: {
    name: 'Slide',
    description: 'Slide over transition',
    defaultDuration: 0.8,
    defaultEasing: 'easeInOut'
  },

  zoom: {
    name: 'Zoom',
    description: 'Zoom through transition',
    defaultDuration: 1.2,
    defaultEasing: 'easeIn'
  }
};

export const LOGO_REVEAL_STYLES: Record<string, {
  name: string;
  description: string;
  defaultDuration: number;
}> = {
  fade: {
    name: 'Fade',
    description: 'Simple fade in reveal',
    defaultDuration: 2
  },

  scale: {
    name: 'Scale',
    description: 'Scale up with overshoot',
    defaultDuration: 2
  },

  slide: {
    name: 'Slide',
    description: 'Slide in from side',
    defaultDuration: 2
  },

  spin: {
    name: 'Spin',
    description: 'Rotate in while scaling',
    defaultDuration: 2.5
  },

  glitch: {
    name: 'Glitch',
    description: 'Digital glitch reveal',
    defaultDuration: 1.5
  },

  particle: {
    name: 'Particle',
    description: 'Particle formation reveal',
    defaultDuration: 3
  }
};

export const TEXT_ANIMATOR_TYPES: Record<string, {
  name: string;
  description: string;
  defaultDuration: number;
  defaultDelay: number;
}> = {
  typewriter: {
    name: 'Typewriter',
    description: 'Characters appear one by one',
    defaultDuration: 2,
    defaultDelay: 0.05
  },

  fadeInChars: {
    name: 'Fade In Characters',
    description: 'Each character fades in',
    defaultDuration: 1.5,
    defaultDelay: 0.03
  },

  scaleInChars: {
    name: 'Scale In Characters',
    description: 'Each character scales in',
    defaultDuration: 1.5,
    defaultDelay: 0.03
  },

  slideInChars: {
    name: 'Slide In Characters',
    description: 'Characters slide in from below',
    defaultDuration: 1.5,
    defaultDelay: 0.02
  },

  randomize: {
    name: 'Randomize',
    description: 'Characters appear in random order',
    defaultDuration: 1.5,
    defaultDelay: 0.05
  },

  wave: {
    name: 'Wave',
    description: 'Characters animate in a wave pattern',
    defaultDuration: 2,
    defaultDelay: 0
  }
};

/**
 * Get lower third style by name
 */
export function getLowerThirdStyle(name: string): LowerThirdStyle | undefined {
  return LOWER_THIRD_STYLES[name];
}

/**
 * Get title style by name
 */
export function getTitleStyle(name: string): TitleStyle | undefined {
  return TITLE_STYLES[name];
}

/**
 * Get transition style by name
 */
export function getTransitionStyle(name: string): TransitionStyle | undefined {
  return TRANSITION_STYLES[name];
}

/**
 * List all lower third styles
 */
export function listLowerThirdStyles(): Array<{ name: string; description: string }> {
  return Object.entries(LOWER_THIRD_STYLES).map(([key, style]) => ({
    name: key,
    description: style.description
  }));
}

/**
 * List all title styles
 */
export function listTitleStyles(): Array<{ name: string; description: string }> {
  return Object.entries(TITLE_STYLES).map(([key, style]) => ({
    name: key,
    description: style.description
  }));
}

/**
 * List all transition styles
 */
export function listTransitionStyles(): Array<{ name: string; description: string }> {
  return Object.entries(TRANSITION_STYLES).map(([key, style]) => ({
    name: key,
    description: style.description
  }));
}
