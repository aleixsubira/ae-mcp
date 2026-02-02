/**
 * Expression Templates Library
 *
 * Pre-built expressions for common animation needs.
 */

export interface ExpressionTemplate {
  name: string;
  category: string;
  expression: string;
  parameters: Record<string, {
    type: 'number' | 'string' | 'boolean' | 'array';
    default: any;
    description: string;
  }>;
  description: string;
}

export const EXPRESSION_LIBRARY: Record<string, ExpressionTemplate> = {
  // ============================================
  // WIGGLE EXPRESSIONS
  // ============================================
  wiggle: {
    name: 'Basic Wiggle',
    category: 'wiggle',
    expression: 'wiggle({{frequency}}, {{amplitude}})',
    parameters: {
      frequency: { type: 'number', default: 2, description: 'Oscillations per second' },
      amplitude: { type: 'number', default: 50, description: 'Maximum deviation' }
    },
    description: 'Adds random motion to a property'
  },

  wiggleSmooth: {
    name: 'Smooth Wiggle',
    category: 'wiggle',
    expression: `var freq = {{frequency}};
var amp = {{amplitude}};
var octaves = {{octaves}};
var mult = {{multiplier}};
wiggle(freq, amp, octaves, mult)`,
    parameters: {
      frequency: { type: 'number', default: 2, description: 'Base frequency' },
      amplitude: { type: 'number', default: 50, description: 'Maximum amplitude' },
      octaves: { type: 'number', default: 2, description: 'Noise octaves' },
      multiplier: { type: 'number', default: 0.5, description: 'Amplitude multiplier per octave' }
    },
    description: 'Smooth, organic wiggle with multiple noise layers'
  },

  wiggleFadeIn: {
    name: 'Wiggle Fade In',
    category: 'wiggle',
    expression: `var freq = {{frequency}};
var amp = {{amplitude}};
var fadeTime = {{fadeTime}};
var t = Math.min(time / fadeTime, 1);
wiggle(freq, amp * t)`,
    parameters: {
      frequency: { type: 'number', default: 3, description: 'Wiggle frequency' },
      amplitude: { type: 'number', default: 30, description: 'Max amplitude' },
      fadeTime: { type: 'number', default: 1, description: 'Fade in duration' }
    },
    description: 'Wiggle that gradually increases in intensity'
  },

  wiggleFadeOut: {
    name: 'Wiggle Fade Out',
    category: 'wiggle',
    expression: `var freq = {{frequency}};
var amp = {{amplitude}};
var fadeStart = {{fadeStart}};
var fadeDuration = {{fadeDuration}};
var t = Math.max(0, 1 - (time - fadeStart) / fadeDuration);
wiggle(freq, amp * t)`,
    parameters: {
      frequency: { type: 'number', default: 3, description: 'Wiggle frequency' },
      amplitude: { type: 'number', default: 30, description: 'Max amplitude' },
      fadeStart: { type: 'number', default: 2, description: 'When fade begins' },
      fadeDuration: { type: 'number', default: 1, description: 'Fade duration' }
    },
    description: 'Wiggle that gradually decreases'
  },

  // ============================================
  // LOOP EXPRESSIONS
  // ============================================
  loopCycle: {
    name: 'Loop Cycle',
    category: 'loop',
    expression: 'loopOut("cycle")',
    parameters: {},
    description: 'Loop keyframes in a continuous cycle'
  },

  loopPingpong: {
    name: 'Loop Pingpong',
    category: 'loop',
    expression: 'loopOut("pingpong")',
    parameters: {},
    description: 'Loop keyframes back and forth'
  },

  loopOffset: {
    name: 'Loop Offset',
    category: 'loop',
    expression: 'loopOut("offset")',
    parameters: {},
    description: 'Loop with continuous progression'
  },

  loopContinue: {
    name: 'Loop Continue',
    category: 'loop',
    expression: 'loopOut("continue")',
    parameters: {},
    description: 'Continue velocity after last keyframe'
  },

  loopWithDelay: {
    name: 'Loop With Delay',
    category: 'loop',
    expression: `var delay = {{delay}};
var loopDuration = key(numKeys).time - key(1).time;
var t = time % (loopDuration + delay);
if (t > loopDuration) {
  key(numKeys).value;
} else {
  valueAtTime(t + key(1).time);
}`,
    parameters: {
      delay: { type: 'number', default: 0.5, description: 'Pause between loops' }
    },
    description: 'Loop animation with a pause between cycles'
  },

  // ============================================
  // TIME EXPRESSIONS
  // ============================================
  clock: {
    name: 'Clock',
    category: 'time',
    expression: `var d = new Date();
var h = d.getHours();
var m = d.getMinutes();
var s = d.getSeconds();
(h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s`,
    parameters: {},
    description: 'Display current system time'
  },

  countdown: {
    name: 'Countdown Timer',
    category: 'time',
    expression: `var total = {{totalSeconds}};
var remaining = Math.max(0, total - time);
var m = Math.floor(remaining / 60);
var s = Math.floor(remaining % 60);
(m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s`,
    parameters: {
      totalSeconds: { type: 'number', default: 60, description: 'Total countdown time' }
    },
    description: 'Countdown timer display'
  },

  countup: {
    name: 'Count Up',
    category: 'time',
    expression: `var startValue = {{start}};
var endValue = {{end}};
var duration = {{duration}};
var t = Math.min(time / duration, 1);
Math.round(startValue + (endValue - startValue) * t)`,
    parameters: {
      start: { type: 'number', default: 0, description: 'Starting number' },
      end: { type: 'number', default: 100, description: 'Ending number' },
      duration: { type: 'number', default: 2, description: 'Animation duration' }
    },
    description: 'Animated number counter'
  },

  frameNumber: {
    name: 'Frame Number',
    category: 'time',
    expression: `Math.floor(time * {{frameRate}}) + {{offset}}`,
    parameters: {
      frameRate: { type: 'number', default: 30, description: 'Frames per second' },
      offset: { type: 'number', default: 1, description: 'Starting frame number' }
    },
    description: 'Display current frame number'
  },

  // ============================================
  // PHYSICS EXPRESSIONS
  // ============================================
  bounce: {
    name: 'Bounce',
    category: 'physics',
    expression: `var amp = {{amplitude}};
var freq = {{frequency}};
var decay = {{decay}};
var n = 0;
if (numKeys > 0) {
  n = nearestKey(time).index;
  if (key(n).time > time) n--;
}
if (n > 0) {
  var t = time - key(n).time;
  var v = velocityAtTime(key(n).time - 0.001);
  value + v * amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);
} else {
  value;
}`,
    parameters: {
      amplitude: { type: 'number', default: 0.1, description: 'Bounce amplitude' },
      frequency: { type: 'number', default: 3, description: 'Bounce frequency' },
      decay: { type: 'number', default: 5, description: 'Decay rate' }
    },
    description: 'Bouncy overshoot after keyframes'
  },

  inertia: {
    name: 'Inertia',
    category: 'physics',
    expression: `var friction = {{friction}};
var n = 0;
if (numKeys > 0) {
  n = nearestKey(time).index;
  if (key(n).time > time) n--;
}
if (n > 0) {
  var t = time - key(n).time;
  var v = velocityAtTime(key(n).time - 0.001);
  value + v * (1 - Math.exp(-friction * t)) / friction;
} else {
  value;
}`,
    parameters: {
      friction: { type: 'number', default: 5, description: 'Friction coefficient' }
    },
    description: 'Momentum/inertia after keyframes'
  },

  springy: {
    name: 'Spring',
    category: 'physics',
    expression: `var mass = {{mass}};
var stiffness = {{stiffness}};
var damping = {{damping}};
var n = 0;
if (numKeys > 0) {
  n = nearestKey(time).index;
  if (key(n).time > time) n--;
}
if (n > 0) {
  var t = time - key(n).time;
  var omega = Math.sqrt(stiffness / mass);
  var zeta = damping / (2 * Math.sqrt(mass * stiffness));
  var v = velocityAtTime(key(n).time - 0.001);
  if (zeta < 1) {
    var omegaD = omega * Math.sqrt(1 - zeta * zeta);
    value + v / omegaD * Math.exp(-zeta * omega * t) * Math.sin(omegaD * t);
  } else {
    value;
  }
} else {
  value;
}`,
    parameters: {
      mass: { type: 'number', default: 1, description: 'Mass' },
      stiffness: { type: 'number', default: 100, description: 'Spring stiffness' },
      damping: { type: 'number', default: 10, description: 'Damping' }
    },
    description: 'Spring physics animation'
  },

  // ============================================
  // LINKING EXPRESSIONS
  // ============================================
  matchPosition: {
    name: 'Match Position',
    category: 'linking',
    expression: `var target = thisComp.layer("{{targetLayer}}");
target.transform.position`,
    parameters: {
      targetLayer: { type: 'string', default: 'Target', description: 'Target layer name' }
    },
    description: 'Match position of another layer'
  },

  offsetPosition: {
    name: 'Offset Position',
    category: 'linking',
    expression: `var target = thisComp.layer("{{targetLayer}}");
var offset = [{{offsetX}}, {{offsetY}}];
target.transform.position + offset`,
    parameters: {
      targetLayer: { type: 'string', default: 'Target', description: 'Target layer name' },
      offsetX: { type: 'number', default: 100, description: 'X offset' },
      offsetY: { type: 'number', default: 0, description: 'Y offset' }
    },
    description: 'Position offset from another layer'
  },

  followWithDelay: {
    name: 'Follow With Delay',
    category: 'linking',
    expression: `var target = thisComp.layer("{{targetLayer}}");
var delay = {{delay}};
target.transform.position.valueAtTime(time - delay)`,
    parameters: {
      targetLayer: { type: 'string', default: 'Target', description: 'Target layer name' },
      delay: { type: 'number', default: 0.1, description: 'Follow delay in seconds' }
    },
    description: 'Follow another layer with time delay'
  },

  inverseRotation: {
    name: 'Inverse Rotation',
    category: 'linking',
    expression: `var target = thisComp.layer("{{targetLayer}}");
-target.transform.rotation`,
    parameters: {
      targetLayer: { type: 'string', default: 'Target', description: 'Target layer name' }
    },
    description: 'Inverse rotation of another layer'
  },

  // ============================================
  // RANDOM EXPRESSIONS
  // ============================================
  randomPosition: {
    name: 'Random Position',
    category: 'random',
    expression: `seedRandom(index, true);
var minX = {{minX}};
var maxX = {{maxX}};
var minY = {{minY}};
var maxY = {{maxY}};
[random(minX, maxX), random(minY, maxY)]`,
    parameters: {
      minX: { type: 'number', default: 0, description: 'Minimum X' },
      maxX: { type: 'number', default: 1920, description: 'Maximum X' },
      minY: { type: 'number', default: 0, description: 'Minimum Y' },
      maxY: { type: 'number', default: 1080, description: 'Maximum Y' }
    },
    description: 'Random position within bounds'
  },

  randomRotation: {
    name: 'Random Rotation',
    category: 'random',
    expression: `seedRandom(index, true);
random({{min}}, {{max}})`,
    parameters: {
      min: { type: 'number', default: -180, description: 'Minimum rotation' },
      max: { type: 'number', default: 180, description: 'Maximum rotation' }
    },
    description: 'Random rotation value'
  }
};

/**
 * Get expression template by name
 */
export function getExpressionTemplate(name: string): ExpressionTemplate | undefined {
  return EXPRESSION_LIBRARY[name];
}

/**
 * Process template with parameters
 */
export function processTemplate(name: string, params: Record<string, any> = {}): string {
  const template = EXPRESSION_LIBRARY[name];
  if (!template) {
    throw new Error(`Expression template not found: ${name}`);
  }

  let expression = template.expression;

  // Replace parameters with provided values or defaults
  for (const [paramName, paramDef] of Object.entries(template.parameters)) {
    const value = params[paramName] !== undefined ? params[paramName] : paramDef.default;
    const placeholder = `{{${paramName}}}`;
    expression = expression.split(placeholder).join(String(value));
  }

  return expression;
}

/**
 * List all expression templates
 */
export function listExpressionTemplates(): Array<{
  name: string;
  category: string;
  description: string;
}> {
  return Object.entries(EXPRESSION_LIBRARY).map(([key, template]) => ({
    name: key,
    category: template.category,
    description: template.description
  }));
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: string): Record<string, ExpressionTemplate> {
  const filtered: Record<string, ExpressionTemplate> = {};
  for (const [key, template] of Object.entries(EXPRESSION_LIBRARY)) {
    if (template.category === category) {
      filtered[key] = template;
    }
  }
  return filtered;
}
