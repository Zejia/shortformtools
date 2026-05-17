# Design Notes

Use a restrained product UI: warm tinted neutrals, one teal primary accent, coral only for emphasis or warnings, and charcoal text. Keep the tool surface dense enough for repeated use.

Typography: system UI stack, fixed sizes, tight but readable hierarchy. Body copy should stay below 75ch.

Layout: top navigation, immediate tool workspace, then focused supporting content. Cards are allowed for repeated related tools and result panels only. Do not nest cards.

Components: inputs, segmented controls, copy buttons, status badges, tabs, and result meters should share a consistent 8px radius. All controls need visible focus states and mobile-safe sizing.

Visual asset: use `assets/creator-analytics-workspace.png` as the editorial image on the homepage, but do not let it push the primary tool below the first viewport.
