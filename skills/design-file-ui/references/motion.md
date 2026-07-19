# Motion guidance

## Default motion budget

Ship 2 to 3 intentional motions for visually led work:

1. **Presence:** hero content enters once with shared easing
2. **Scroll continuity:** sections reveal or parallax lightly while scrolling
3. **Feedback:** buttons, menus, and expanded panels respond immediately

More than that needs a product reason.

## Good motion

- Shared duration and easing tokens
- Stagger used sparingly on sibling groups
- Scroll effects that clarify depth or progress
- Interruptible transitions
- Reduced-motion fallback to simple opacity or no animation

## Bad motion

- Every card independently sliding in
- Long decorative delays before content is usable
- Scroll-jacking that blocks native control without strong purpose
- Continuous glow pulses as fake premium
- Motion that fights reading (type constantly shifting under the eye)

## Implementation notes

- Prefer transform and opacity for UI motion
- Keep entrance distances small
- Tie scroll motion to content blocks, not random ornaments
- If a motion library is already in the project, use it; do not add a second one for vanity
