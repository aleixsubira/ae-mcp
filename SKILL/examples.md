# Animation Examples

This reference provides detailed examples of common After Effects animation patterns using the MCP tools.

## Example 1: Bouncing Ball Animation

Complete workflow for creating a bouncing ball with realistic physics:

```
1. create_composition("Ball Animation", 1920, 1080, 5, 30)

2. add_shape_layer(
   compName="Ball Animation",
   name="Ball",
   shape="ellipse",
   size={"width": 100, "height": 100},
   fillColor={"r": 1.0, "g": 0.3, "b": 0.2},
   position={"x": 960, "y": 200}
)

3. Set position keyframes:
   - time 0: position [960, 200]
   - time 1: position [960, 900]
   - time 1.5: position [960, 700]
   - time 2: position [960, 900]
   - time 2.3: position [960, 800]
   - time 2.5: position [960, 900]

4. apply_easy_ease on position keyframes with type="IN" on downward motion

5. Add squash/stretch on Scale:
   - At impact frames: [120, 80]
   - At peak frames: [90, 110]

Alternative: Use bounce expression template:
apply_expression_template("bounce", "Position", params={amplitude: 200, frequency: 2, decay: 0.8})
```

## Example 2: Kinetic Typography

Animated text with multiple layers and timing:

```
1. create_composition("Kinetic Text", 1920, 1080, 8, 30)

2. Add three text layers:
   add_text_layer("MOTION", fontSize=120, position={x: 960, y: 400})
   add_text_layer("DESIGN", fontSize=120, position={x: 960, y: 600})
   add_text_layer("STUDIO", fontSize=120, position={x: 960, y: 800})

3. Stagger animations:
   - Word 1: Animate at 0-1s
   - Word 2: Animate at 0.5-1.5s
   - Word 3: Animate at 1-2s

4. Use text animator for each:
   create_text_animator("slideInChars", duration=1, delay=0.05)

5. Add background sweep:
   add_solid_layer(width=1920, height=200, color={r: 0.2, g: 0.6, b: 1.0})
   Animate position from top to bottom behind text
```

## Example 3: Logo Animation with Mask Reveal

```
1. import_footage("logo.png")

2. add_av_layer(itemName="logo.png", startTime=0)

3. Create mask:
   - Add rectangle mask covering logo
   - Animate Mask Path to reveal from left to right
   
4. Add glow effect:
   apply_effect_template("glow", intensity=50)

5. Fade in logo:
   set_keyframe(property="Opacity", time=0, value=0)
   set_keyframe(property="Opacity", time=1, value=100)
   apply_easy_ease(property="Opacity", type="OUT")

6. Add subtle rotation:
   set_keyframe(property="Rotation", time=0, value=-5)
   set_keyframe(property="Rotation", time=2, value=0)
```

## Example 4: Social Media Call-to-Action

```
1. create_composition("CTA", 1080, 1920, 6, 30)  # Vertical for Stories

2. Background gradient:
   add_solid_layer(color={r: 0.1, g: 0.1, b: 0.3})
   apply_effect("Gradient Ramp")

3. Main text:
   add_text_layer("FOLLOW US", fontSize=80, position={x: 540, y: 800})
   create_text_animator("scaleInChars", duration=0.8)

4. Animated button:
   add_shape_layer(shape="rectangle", size={width: 400, height: 100})
   Set position keyframes with bounce
   
5. Pulsing effect:
   apply_expression_template("springy", "Scale", params={frequency: 2})

6. Add arrow icon:
   add_shape_layer(shape="polygon", points=3)
   Rotate and position as arrow
   Animate position with wiggle
```

## Example 5: Data Visualization Counter

```
1. create_composition("Counter", 1920, 1080, 5, 30)

2. add_text_layer("0", fontSize=200, position={x: 960, y: 540})

3. Apply expression to Source Text:
   expression = `
   startValue = 0;
   endValue = 1000;
   duration = 3;
   
   if (time < duration) {
     currentValue = Math.round(linear(time, 0, duration, startValue, endValue));
   } else {
     currentValue = endValue;
   }
   
   currentValue.toString();
   `
   set_expression(property="Source Text", expression=expression)

4. Add prefix/suffix for units ($, %, etc.)

5. Add subtle scale pulse:
   apply_expression_template("springy", "Scale")
```

## Example 6: Parallax Scrolling Scene

```
1. create_composition("Parallax", 1920, 1080, 10, 30)

2. Import multiple layers (background, midground, foreground)

3. Set up null object as camera controller:
   add_null_layer(name="Camera Control")

4. Link all layers to null:
   For each layer, link_properties(
      sourceProperty="Position",
      targetProperty="Position",
      offset=[layer_specific_multiplier, 0]
   )

5. Animate null object position:
   set_keyframe on Camera Control position
   Different layers move at different speeds based on offset

6. Add motion blur for smoothness:
   modify_layer(layerName=each_layer, motionBlur=true)
```

## Example 7: Glitch Effect Title

```
1. create_composition("Glitch Title", 1920, 1080, 4, 30)

2. add_text_layer("GLITCH", fontSize=150)

3. Duplicate layer 3 times

4. Apply chromatic aberration:
   - Layer 1 (Red): Shift position left, blend mode "Screen"
   - Layer 2 (Green): Keep center
   - Layer 3 (Blue): Shift position right, blend mode "Screen"

5. Add displacement:
   apply_effect("Turbulent Displace")
   Animate Evolution for movement

6. Flicker opacity:
   apply_expression_template("randomize", "Opacity", params={min: 50, max: 100})
```

## Example 8: Progress Bar Animation

```
1. create_composition("Progress", 1920, 1080, 3, 30)

2. Create background bar:
   add_shape_layer(shape="rectangle", size={width: 1200, height: 80})
   fillColor = gray

3. Create progress bar:
   add_shape_layer(shape="rectangle", size={width: 1200, height: 80})
   fillColor = blue
   
4. Mask progress bar:
   Add mask to progress bar layer
   Animate Mask Path from 0% to 100% width

5. Add percentage text:
   add_text_layer("0%")
   Apply counter expression synced with mask animation
```

## Timing and Easing Patterns

**Sharp transitions** (UI elements):
- Duration: 0.3s
- Easing: Easy Ease In/Out
- Use for: Buttons, menus, toggles

**Smooth reveals** (content):
- Duration: 0.8-1.2s
- Easing: Easy Ease Out
- Use for: Text, images, cards

**Energetic motion** (attention-grabbing):
- Duration: 0.4-0.6s
- Easing: Overshoot/bounce
- Use for: Logos, highlights, CTAs

**Continuous animation** (ambient):
- Duration: Loop (2-4s)
- Easing: Linear or sine wave
- Use for: Backgrounds, subtle movement