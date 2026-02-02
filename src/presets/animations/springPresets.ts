/**
 * Spring Animation Presets
 *
 * Remotion-inspired spring animation system for After Effects.
 */

export interface SpringConfig {
  mass: number;
  stiffness: number;
  damping: number;
  overshoot: boolean;
}

export interface SpringPreset {
  name: string;
  config: SpringConfig;
  description: string;
}

// Pre-defined spring configurations
export const SPRING_PRESETS: Record<string, SpringConfig> = {
  // Gentle, subtle animations
  gentle: {
    mass: 1,
    stiffness: 80,
    damping: 20,
    overshoot: false
  },

  // Default balanced spring
  default: {
    mass: 1,
    stiffness: 100,
    damping: 10,
    overshoot: true
  },

  // Wobbly, playful animations
  wobbly: {
    mass: 1,
    stiffness: 150,
    damping: 8,
    overshoot: true
  },

  // Stiff, quick animations
  stiff: {
    mass: 1,
    stiffness: 200,
    damping: 20,
    overshoot: false
  },

  // Slow, heavy animations
  slow: {
    mass: 3,
    stiffness: 100,
    damping: 15,
    overshoot: true
  },

  // Bouncy animations
  bouncy: {
    mass: 1,
    stiffness: 200,
    damping: 5,
    overshoot: true
  },

  // Snappy, responsive animations
  snappy: {
    mass: 0.5,
    stiffness: 300,
    damping: 20,
    overshoot: false
  }
};

/**
 * Generate spring expression for After Effects
 */
export function generateSpringExpression(
  config: SpringConfig,
  fromValue: number | number[],
  toValue: number | number[],
  startTime: number = 0
): string {
  const { mass, stiffness, damping } = config;

  // Calculate derived values
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(mass * stiffness));

  let expr = '';
  expr += 'var m = ' + mass + ';\n';
  expr += 'var k = ' + stiffness + ';\n';
  expr += 'var c = ' + damping + ';\n';
  expr += 'var omega = Math.sqrt(k / m);\n';
  expr += 'var zeta = c / (2 * Math.sqrt(m * k));\n';
  expr += 'var startTime = ' + startTime + ';\n';

  if (Array.isArray(fromValue) && Array.isArray(toValue)) {
    expr += 'var fromVal = [' + fromValue.join(', ') + '];\n';
    expr += 'var toVal = [' + toValue.join(', ') + '];\n';
    expr += 'var t = Math.max(0, time - startTime);\n';
    expr += 'var result = [];\n';
    expr += 'for (var i = 0; i < fromVal.length; i++) {\n';
    expr += '  var delta = toVal[i] - fromVal[i];\n';
    expr += '  if (zeta < 1) {\n';
    expr += '    var omegaD = omega * Math.sqrt(1 - zeta * zeta);\n';
    expr += '    var envelope = Math.exp(-zeta * omega * t);\n';
    expr += '    var oscillation = Math.cos(omegaD * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * t);\n';
    expr += '    result.push(toVal[i] - delta * envelope * oscillation);\n';
    expr += '  } else {\n';
    expr += '    result.push(toVal[i] - delta * Math.exp(-omega * t) * (1 + omega * t));\n';
    expr += '  }\n';
    expr += '}\n';
    expr += 'result';
  } else {
    expr += 'var fromVal = ' + fromValue + ';\n';
    expr += 'var toVal = ' + toValue + ';\n';
    expr += 'var t = Math.max(0, time - startTime);\n';
    expr += 'var delta = toVal - fromVal;\n';
    expr += 'if (zeta < 1) {\n';
    expr += '  var omegaD = omega * Math.sqrt(1 - zeta * zeta);\n';
    expr += '  var envelope = Math.exp(-zeta * omega * t);\n';
    expr += '  var oscillation = Math.cos(omegaD * t) + (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * t);\n';
    expr += '  toVal - delta * envelope * oscillation;\n';
    expr += '} else {\n';
    expr += '  toVal - delta * Math.exp(-omega * t) * (1 + omega * t);\n';
    expr += '}';
  }

  return expr;
}

/**
 * Calculate spring animation duration (time to settle within threshold)
 */
export function calculateSpringDuration(
  config: SpringConfig,
  threshold: number = 0.01
): number {
  const { mass, stiffness, damping } = config;
  const omega = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(mass * stiffness));

  // Approximate settling time
  if (zeta < 1) {
    // Underdamped - use decay envelope
    return -Math.log(threshold) / (zeta * omega);
  } else {
    // Critically damped or overdamped
    return -Math.log(threshold) / omega;
  }
}

export const springPresets = SPRING_PRESETS;
