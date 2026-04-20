# russian-copy-check

Use this workflow when fixing Russian text, product copy, or encoding issues in the UI.

## Procedure

1. Restate which screens, components, or copy groups contain Russian text issues.
2. Identify the problem type:
   - mojibake or broken encoding
   - inconsistent wording for the same concept
   - awkward line breaks or labels that are too long for the layout
3. Check copy quality:
   - the same concept should use the same Russian label across the app
   - UI labels should be concise enough for buttons, chips, tabs, and stats
   - destructive or important actions should use clear and unambiguous wording
4. Check rendering safety:
   - confirm currency symbols and Russian text render correctly in the touched files
   - watch for layout breakage caused by longer Russian strings
   - call out any remaining area that may still contain broken text outside the current patch
5. If copy changes affect visual hierarchy or spacing, also run `ui-consistency-check`.
6. Run `spec-check` before handoff.
7. End with exactly three lines:
   - `Changed: ...`
   - `Checked: ...`
   - `Risk: ...`

## Failure Rule

If the Russian text was repaired from source inspection without live browser verification, state that explicitly in `Checked:` or `Risk:`.
