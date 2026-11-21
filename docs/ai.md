# Build interfaces with wa11y-ai

## Read only what you need

1. Read this guide, then inspect `dist/index.d.ts` and only relevant `dist/components/*.d.ts`; in a checkout, use `src/index.ts` and corresponding component sources.
2. Select components below; consult only their [README sections](../README.md#components) for examples or edge cases. Never guess props, variants, exports, or token keys.
3. For repository changes, follow [AGENTS.md](../AGENTS.md) (repository-only). Application integration does not require reading maintenance instructions or the entire README.

> **Component coverage:** Before implementing an interface, map its visible UI elements to existing wa11y-ai components. Use an exported component whenever its semantics and capabilities fit. Create custom UI only for layout structures, data visualizations, or functionality not supported by the library. Do not replace existing components merely because custom HTML or CSS is faster to generate.

> When no suitable wa11y-ai component exists, use semantic HTML and existing design tokens. Keep the implementation local to the application. Do not silently add new components to the design-system library.

## Select by intent

| User need | Preferred component / distinction |
| --- | --- |
| Submit/save or perform an action | `Button`; forms use `type="submit"`. |
| Navigate | `MainMenuItem` for header destinations; native links inline; use real `href`s. |
| Enter text / select one option | `Input`; `RadioButton` for a few visible choices, `Dropdown` for longer lists. |
| Multiple choices / enable a setting | `Checkbox` / `Switch`; clarify when changes are saved. |
| Tabular records | `DataHeader` + `DataGridCell` inside native table structure. |
| Notification / status / progress | `Alert` / `Badge` / `ProgressBar`. |
| Identity | `Avatar`; actionable name/details: `AvatarListing`; participants: `AvatarGroup`. |
| Group content | `Card` or `CardHorizontal`, according to layout. |
| Application navigation | `SidebarMenuDesktop`; where mobile floating navigation fits, `MenuFloatMobile`. |
| Hierarchy / bypass navigation | `BreadcrumbsGroup` / `SkipContent` or `SkipContentGroup`. |
| Supplementary help / glyph | `Tooltip` / shared `Icon`. |

## Load and use the foundation

- React components and package-root imports require React 18.2+. Import components/helpers from `wa11y-ai`; framework-independent definitions are at `wa11y-ai/tokens`.
- Load `wa11y-ai/tokens.css` and `wa11y-ai/components.css` once. `Icon` does not load its font: separately import only `material-symbols/outlined.css`. Keep decorative icons hidden; label meaningful standalone icons.
- Use `cssVars`/`tokenVar` for token CSS references and `styleVars` for typography/elevation/available paints; discover exact keys through `tokens`/`styles`. `getTokenValue` is for raw programmatic data, not hardcoded styling replacements.
- Preserve aliases, precision, modes, and defaults. Set profiles on the document root: `data-wa11y-user-profiles-mode="public"`; other values are `logged-in`, `admin`, `neutral`. Public is default; programmatic names retain spelling, e.g. `Logged In`. Light/Dark themes and nested profile scopes are unsupported.
- Fonts must be loaded by the application. Use Roca hero styles and Poppins for other interface text where appropriate; use component font overrides without changing canonical values or the Icon font. Unavailable paints and missing line heights must not be invented.

## Critical API distinctions

- Button: `variant` controls appearance, `status` controls palette, `type` is native button behavior. Link appearance is still an action button; navigation needs an anchor. Card/CardHorizontal use `type` for layout; DataHeader uses `weight`, not `variant`.
- SidebarMenuDesktop is collapsible by default: preserve this unless requested otherwise. Controlled `state` requires `onStateChange`; resize the surrounding layout with it. Custom SidebarMenuItem children need matching `collapsed` props. MenuFloatMobile takes `items`, `state`, and `onNavigate`; callbacks must change the application view.
- RadioButton groups share `name`. Input/Dropdown labels, helper/error descriptions, sorting, and disclosure ARIA are built in; supply real values/callbacks rather than duplicating behavior.
- Tooltip needs one focusable child forwarding `aria-describedby`; `position` names the arrow edge. Body-only tooltips use `hasTitle={false}`. Keep content noninteractive; breadcrumbs/skip links require valid destinations.

## Compose and check

- Create polished hierarchy, consistent alignment, purposeful whitespace, and coherent surfaces. Use token gaps consistently for equivalent rows/columns; 8/16/24/40px suit related items/repeated items/panels/sections when appropriate. Section background changes must not overwrite component surfaces.
- Adapt navigation, forms, cards, and data for mobile/tablet/desktop. If using a floating mobile menu, hide duplicate navigation and reserve bottom safe-area clearance. Constrain dense-table scrolling to its container; avoid page-level overflow.
- For tables/data lists, use profile `Primary/Selected` across the whole row on hover and `focus-within`, suppressing AvatarListing's independent hover background there. Shared table CSS handles DataGridCell rows; list/mobile rows need equivalent application styling. Keep actual selection state distinct; do not make static rows focusable.
- Match semantic status to intent; use Action for primary task actions where appropriate. Preserve 3px focus with no gap, including Input/Dropdown's single inset focus border. Avoid unnecessary dependencies, animation, and abstractions.
- Target WCAG 2.2 AA: semantic landmarks/headings, labels/instructions/errors, keyboard access, usable targets, visible focus, and meaning beyond colour. Restore focus after navigation/removal and reuse built-in accessibility behavior.
- Check real contrast in each used profile; Neutral primary buttons/badges and selected sidebar text have known failures. Small text and missing font/style values also need review: see [Accessibility checks](../README.md#accessibility-checks) and [Known limitations](../README.md#known-limitations) when relevant. Neither tokens nor components guarantee compliance.
- Finish with targeted TypeScript/build and essential keyboard/focus, responsive overflow, and composed-behavior checks. Inspect only the affected feature; explicit user requirements override composition defaults.
