# Motion guidance

## Default motion budget

Ship 2 to 3 intentional motions for visually led marketing work:

1. **Presence:** hero content enters once with shared easing
2. **Scroll continuity:** sections reveal or parallax lightly while scrolling
3. **Feedback:** buttons, menus, and expanded panels respond immediately

More than that needs a product reason.

## Workspace and mobileTool motion

Prefer feedback over theater:

1. **Feedback:** save, submit, selection, drag, approve
2. **Region change:** panel open/close, sheet present/dismiss, route content swap
3. **Progress:** upload, deploy, query loading on the region that is busy

Avoid scroll jacking, long entrance delays, confetti on every complete, and continuous glow pulses in admin tools.

## Good motion

- Shared duration and easing tokens
- Stagger used sparingly on sibling groups
- Scroll effects that clarify depth or progress on marketing pages
- Interruptible transitions
- Reduced motion fallback to simple opacity or no animation

## Bad motion

- Every card independently sliding in
- Long decorative delays before content is usable
- Scroll jacking that blocks native control without strong purpose
- Continuous glow pulses as fake premium
- Motion that fights reading (type constantly shifting under the eye)
- Cinematic marketing motion copied into settings or triage views

## Implementation notes

- Prefer transform and opacity for UI motion
- Keep entrance distances small
- Tie scroll motion to content blocks, not random ornaments
- If a motion library is already in the project, use it; do not add a second one for vanity
