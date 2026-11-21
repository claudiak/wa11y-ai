# wa11y-ai

Accessible design tokens and reusable React components, with typed access for developers and AI coding assistants. The token definitions and CSS also work independently of React.

**Reusable React components · Semantic design tokens · Typed APIs · Profile modes**

## Installation

After this package is published to npm:

```sh
npm install wa11y-ai
```

For a local checkout, run `npm ci` and `npm run build`, then install the checkout into your application with `npm install /path/to/wa11y-ai`. Publishing is a separate release step.

Import the stylesheets once in your application entry point:

```ts
import 'material-symbols/outlined.css';
import 'wa11y-ai/tokens.css';
import 'wa11y-ai/components.css';
```

## Components

Named exports from `wa11y-ai`:

| Area | Components |
| --- | --- |
| Actions and forms | `Button`, `Input`, `Dropdown`, `Checkbox`, `RadioButton`, `Switch` |
| Feedback | `Alert`, `Badge`, `ProgressBar`, `Tooltip` |
| People and content | `Avatar`, `AvatarGroup`, `AvatarListing`, `Card`, `CardHorizontal` |
| Tables | `DataHeader`, `DataGridCell` |
| Navigation | `MainMenuItem`, `MenuFloatMobile`, `SidebarMenuDesktop`, `SidebarMenuTitle`, `SidebarMenuItem`, `SidebarSubmenuItem`, `SidebarMenuItemDropdown`, `SubmenuCollapsible`, `Breadcrumbs`, `BreadcrumbsGroup`, `SkipContent`, `SkipContentGroup` |
| Icons | `Icon` |

See the usage sections below and the exported TypeScript declarations for supported props and variants. The playground demonstrates the actual components; application data and callbacks supply their content and actions.

## Tokens

Use CSS variables to preserve semantic relationships and modes:

```css
.content {
  color: var(--wa11y-primitives-text-primary);
  background: var(--wa11y-primitives-surface-default);
  padding: var(--wa11y-spacing-spacing-16);
  border-radius: var(--wa11y-radius-radius-8);
  box-shadow: var(--wa11y-style-effect-elevation-1);
}
```

Typed references work with React styles and other CSS-in-JS tools:

```ts
import { cssVars, styleVars, tokenVar, getTokenValue } from 'wa11y-ai';

const gap = tokenVar('Spacing/Spacing/16'); // var(--wa11y-spacing-spacing-16)
const colour = cssVars['Primitives/Text/Primary'];
const shadow = styleVars['effect/Elevation 1'];
const tracking = styleVars['text/Body/letterSpacing'];
const pixels = getTokenValue('Spacing/Spacing/16'); // number: 16
```

`getTokenValue` resolves references for programmatic consumers. Dimensions return original numbers; rich colours return precise RGBA channels; untouched colour strings, configuration strings, and booleans retain their original types. Prefer the CSS reference helpers for styling.

Inspect `tokens`, `styles`, and `collections` to discover names, values, references, and modes. Definitions are immutable. Alias values use `{ $ref: 'Primitives/Neutral/Dark' }` with stable token paths. The token-only subpath `wa11y-ai/tokens` exports these definitions and their types. Internal Figma IDs, export caches, and audit reports are not part of the public API.

## Icons

```tsx
import 'material-symbols/outlined.css'; // Only this font style; never the all-styles entry.
import 'wa11y-ai/icons.css'; // Also included by wa11y-ai/components.css.
import { Icon } from 'wa11y-ai';
<Icon name="search" size={20} />
<Icon name="favorite" fill colour="var(--wa11y-feedback-destructive-default)" label="Favorite" />
```

The shared `Icon` React component inherits parent text colour, is decorative by default, and supports label/aria-label/aria-labelledby, size, colour (or color), fill, refs, and span accessibility attributes. Reuse it across components; checkbox, radio, switch, and tooltip artwork is supplied separately. The [material-symbols package](https://github.com/marella/material-symbols/tree/main/material-symbols) is a runtime dependency, with only outlined.css imported for the playground. The `Icon` component and the font stylesheet are separate: importing `Icon`, `wa11y-ai/icons.css`, or `wa11y-ai/components.css` does not load the font. Import `material-symbols/outlined.css` once in the application entry point.

## Button

```tsx
import 'wa11y-ai/tokens.css';
import 'wa11y-ai/components.css';
import { Button } from 'wa11y-ai';

<Button onClick={() => save()}>Save</Button>
<Button variant="secondary" status="success">Confirm</Button>
<Button variant="icon-only" aria-label="Add item" />
<Button variant="link" onClick={() => showDetails()}>Details</Button>
<Button disabled>Unavailable</Button>
```

Button is a native `button`, defaults to `type="button"`, forwards its ref/native attributes, and uses native Enter/Space, pointer, form, and disabled behavior. Icon-only controls require `aria-label` or `aria-labelledby`. The `link` appearance remains a button for actions; navigation should use a real anchor.

| Prop | Supported values |
| --- | --- |
| `variant` | `primary` (default), `secondary`, `icon-only`, `link` |
| `status` | `user-profile` (default), `success`, `warning`, `destructive`, `action`, `neutral`; all statuses supported |
| `leadingIcon` | `true` (default) for the shared Material Symbol, `false`, or an application React node |
| `trailingIcon` | `false` (default), `true` for the shared Material Symbol, or an application React node |
| `disabled`, `type`, `ref`, native attributes | Forwarded to the actual button |

Default Button icons use Material Symbols at 24px (20px for Small) and inherit button colour, including interaction states. Primary Success labels and icons use Text/Primary. Fonts are application-provided.

Use `pill` for 999px corners. Icon-only buttons use equal padding and remain perfect circles (40px Default, 36px Small); they render one icon. Other buttons use 8px vertical/16px horizontal padding.

**Sizes and states:** Default remains 40px tall with 14px semibold text. Small is 36px tall, 8px radius, 16px horizontal/8px vertical padding, with 12px regular text and 20px icons. Both sizes support all statuses and native focus/pressed/disabled behavior. Secondary and Icon Only share Primary's hover colours.

Link appearance is transparent and borderless, with status Dark colours for both icons and labels; User Profile follows Primary/Dark and Neutral uses Neutral/Dark. Use `variant="link"` for a labelled link appearance or `variant="icon-only" appearance="link"` for icon-only. Link appearance has a status background on hover; it remains a native button for actions. Every enabled variant has visible keyboard focus.

**Contrast:** User Profile Primary follows the supplied white-on-brand design. In Neutral profile mode, its light-grey background makes that foreground insufficient for normal text; do not use that combination without an approved design adjustment. Use the `neutral` status (black background) when appropriate, or the Secondary variant with dark text. Focus uses a black 3px ring with no gap and remains visible in forced colours.

## Input

```tsx
import { Input } from 'wa11y-ai';
// Load wa11y-ai/tokens.css and wa11y-ai/components.css once.
<Input label="Email" name="email" type="email" required helper helperText="Use your work email." />
<Input label="Email" status="error" helper helperText="Enter a valid email." />
```

Statuses: `default`, `filled`, `selected`, `focus`, `error`, `disabled`. Focus also follows native keyboard/pointer focus; Filled uses your actual `value`/`defaultValue`. Native attributes, refs, and controlled input behavior are supported. `showLabel={false}` keeps the label available to assistive technology. Icons accept booleans or React nodes; `hasTip`/`tipText` add a described hint. Helper text is connected with `aria-describedby`; Error sets `aria-invalid`. Input uses shared Material Symbols: help (16px), search (20px), and calendar_today (20px). Standard Input and Dropdown borders use Border/Focus; error and disabled states use their respective borders.

## Dropdown

```tsx
import { Dropdown } from 'wa11y-ai';
<Dropdown label="Country" defaultValue="canada">
  <option value="canada">Canada</option>
  <option value="brazil">Brazil</option>
</Dropdown>
```

Uses the shared Input layout: 16px label, 8px corners, 0px vertical and 12px horizontal padding, no leading icon, and a trailing chevron. Shares Input statuses/helper text and native select keyboard, disabled, required, and form behavior. Load the same token and component stylesheets.

## Checkbox

Success indicators use `#41BA4D` from the shared Success/Default palette.

```tsx
import { Checkbox } from 'wa11y-ai';
<Checkbox label="Accept terms" checked={accepted} onChange={e => setAccepted(e.target.checked)} />
```

Statuses: `unselected`, `selected`, `success`, `success-selected`, `disabled`, `disabled-selected`. Native checked/defaultChecked, required, disabled, form attributes and refs are supported. Space toggles the checkbox; keyboard focus has a visible ring. `hasLabel={false}` keeps the label accessible. Original 22px/18px assets are retained; SSR hosts may set `assetBaseUrl` to the public `assets/checkbox/` directory. Success labels use Text/Primary.

## Radio button

```tsx
import { RadioButton } from 'wa11y-ai';
<RadioButton name="choice" value="first" label="First option" />
<RadioButton name="choice" value="second" label="Second option" />
```

Supports unselected/selected, success/success-selected, error/error-selected, and disabled/disabled-selected statuses. Shared `name` values provide native single selection and arrow-key navigation; checked/defaultChecked, refs, required, disabled, and hidden accessible labels are supported. Original SVGs retain their 22.5×22 dimensions. SSR hosts may set `assetBaseUrl` to their public `assets/radio/` directory. Success labels use Text/Primary.

## Switch

```tsx
import { Switch } from 'wa11y-ai';
<Switch aria-label="Notifications" on={enabled} onChange={e => setEnabled(e.target.checked)} />
<Switch size="small" aria-label="Compact notifications" defaultOn={false} />
```

Both sizes share the same on/off Default, Hovered, Focused, and Disabled artwork: Small is 36×20px, Large scales it proportionally to 54×30px. The legacy Large Pressed state uses Hovered artwork; hasFocusIndicator is retained for compatibility; a shared 3px CSS focus ring with no gap is used at both sizes. Native keyboard, disabled, controlled on/checked, and uncontrolled defaultOn/defaultChecked behavior is unchanged. Supply an accessible name through aria-label/aria-labelledby or an associated label. Original SVG dimensions and colours remain unchanged; Large scales the wrapper, including the focus state. SSR hosts may supply assetBaseUrl for assets/switch/.

## Badge

```tsx
import { Badge } from 'wa11y-ai';
<Badge label="Success" status="success" />
<Badge label="Filter" size="small" leadingIcon onDismiss={() => removeFilter()} />
```

Eight statuses: user-profile, info, success, warning, destructive, dark, neutral, disabled. Supports default/small sizes and default/focus appearance (32 variants), shared alarm/close icons, application-provided avatar URL/content, and native keyboard-accessible dismissal. Disabled badges prevent dismissal; static badges do not add tab stops. Success uses the supplied Success/Dark background. User Profile in Neutral mode still needs review for white-on-light-grey text contrast.

## Alert

```tsx
import { Alert } from 'wa11y-ai';
<Alert type="success" title="Saved" hasDescription description="Your changes were saved." onDismiss={() => hideMessage()} />
```

Types: info, success, warning, destructive, neutral, disabled; default/focus appearance. Optional title, description, and shared icon follow the Figma properties. A close button appears when `hasClose` and `onDismiss` are supplied; the application controls removal and focus restoration. Messages use `role="status"` by default; set `role="alert"` for urgent updates. Disabled prevents dismissal. Load the shared font, tokens, and component stylesheets. 

## Avatar and Avatar Group

```tsx
import { Avatar, AvatarGroup } from 'wa11y-ai';
<Avatar src={user.photo} alt={user.name} size={40} />
<Avatar variant="initials" initials="CK" alt="Claudia" size={32} />
<AvatarGroup avatars={people.map(person => ({ src: person.photo, alt: person.name }))} size={32} additionalCount={22} />
```

Avatar supports image/icon sizes 16, 20, 24, 32, 40 and initials sizes 16, 20, 24, 32 (Figma supplies no 40px initials variant). Images remain application-provided; failed images fall back to initials or the supplied icon artwork. Use empty `alt` beside an existing name, or a meaningful name when standalone. These displays do not add tab stops. Group supports 16/24/32/40px, supplied overlaps, and `hasNumber={false}`. Initials members remain at most 32px. For SSR hosts, `assetBaseUrl` points to the public `assets/avatar/` directory.

The reference initials use application-provided Inter Medium; override `--wa-avatar-initials-font-family` if needed. The component uses the gradient explicitly supplied by these nodes; the canonical Gradient Scarlate paint is separately available with its confirmed brand aliases. Reference portrait examples stay in the development playground and are excluded from npm.

## Avatar Listing

```tsx
import { AvatarListing } from 'wa11y-ai';
<AvatarListing title={user.name} description={user.position} avatar={{ src: user.photo }} size={32} onClick={() => openProfile(user.id)} />
```

Sizes 40/32/24/16 support default, hover, and focus states plus native keyboard activation, disabled behavior, and refs. `hasDetails`, `hasTitle`, `hasDescription`, and `hasDragDrop` mirror Figma; 16px omits the description. The grip is decorative; application reordering needs its own keyboard-accessible implementation. Hidden titles retain an accessible button name. The 40px reference uses application-provided Roboto Flex (override `--wa-avatar-listing-large-font-family`); smaller sizes use the existing Poppins typography. Component-specific 16/14px typography preserves this node without changing canonical H3/Body tokens.

## Card

```tsx
import { Card } from 'wa11y-ai';
<Card type="image" heading="Memory techniques" image={{ src: lesson.image, alt: lesson.imageDescription }} onSkip={skip} onStart={start} />
<Card type="slot">{customContent}</Card>
```

Full/Image/Simple/Slot support default/hover/focus appearances. Optional tag, recommendation, metadata, badge, participant avatars/count, title, progress, actions, and author follow the supplied properties. Pass `participants` as Avatar props and `author` as application content; imagery stays application-supplied. Actions reuse native Buttons; the card itself adds no tab stop. `progress` controls both the accessible indicator and percentage. Slot content is supplied by the application; the placeholder is playground-only. The explicit angled node gradients remain component CSS. The canonical Bg Card paint is separately available as a left-to-right gradient.

## Progress Bar

```tsx
import { ProgressBar } from 'wa11y-ai';
<ProgressBar value={50} label="Course completion" />
```

The 25/50/100% Figma variants also accept `percentual="25"`; numeric `value` takes precedence and is clamped to 0–100. The native progress element exposes its name and value to assistive technology without adding a tab stop. The 333px layout shrinks to fit, with a 5px track and 8px application-provided Roboto Flex percentage text. Reuses Action/Default and existing surface/text tokens; Card reuses it with its supplied warning fill and inverse label. Optional CSS properties: `--wa-progress-fill`, `--wa-progress-track`, `--wa-progress-label`, `--wa-progress-font-family`.

## Card Horizontal

```tsx
import { CardHorizontal } from 'wa11y-ai';
<CardHorizontal type="avatar" title={user.name} description="238 Followers" avatar={{ src: user.photo }} onAction={follow} onDismiss={dismiss} />
<CardHorizontal type="slot">{customContent}</CardHorizontal>
```

Image/avatar/icon/slot types support default/hover/focus appearances. Optional `hasButton` and `hasClose` control actions; dismissal also requires `onDismiss`. Images and avatars are application data; `icon` accepts a custom node and defaults to the shared flashlight symbol. Action labels default to Join/Follow. Native sibling action/dismiss buttons support keyboard focus without nested buttons; `disabled` disables both. The 403px layout shrinks to fit and wraps long titles. Slot content is caller-provided; the add placeholder is playground-only.

## Data Header and DataGrid Cell

```tsx
import { DataHeader, DataGridCell } from 'wa11y-ai';
<table>
  <thead><tr><DataHeader headerContent="Name" weight="semibold" sorting sortDirection={direction} onSort={sort} /></tr></thead>
  <tbody><tr><DataGridCell name={user.name} avatar={{ src: user.photo }} onAvatarClick={openProfile} /></tr></tbody>
</table>
```

Native `th`/`td` preserve table semantics. Header supports regular/semibold (`weight` maps the Figma Style property), content/selection layouts, controlled sorting with `aria-sort`, and a select-all checkbox with `selection.indeterminate`. Cell types: avatar-name, text, multi-select, single-select, slot, buttons, badge. Reuse `selection`, `singleSelection`, `avatar`, and `badgeProps` for existing component props; pass children for custom cell contents. Text supports `href` and `textSize="small"`; optional text adornments mirror Figma. Buttons expose `onAction`, `onEdit`, and `onDownload` callbacks with accessible labels. The playground demonstrates the supplied three-row table, sorting, selection, editing, deletion, and download. The shared tokens follow the selected root profile mode; the green Figma example uses Admin mode.

## Main menu item

```tsx
<MainMenuItem href="/home" label="Home" state="active" trailingIcon />
```

Native navigation link with default/active/hover/focus states, optional `leadingIcon` (default Home) and `trailingIcon` (chevron), and shared Material Symbols. Active exposes `aria-current="page"`; native hover and 3px keyboard focus work automatically. The supplied label is 16px bold with a 20px line height. Applications supply Roboto Flex through `--wa-main-menu-font-family`; the conflicting Figma H3 binding does not change canonical typography values.

## Mobile navigation

```tsx
import { MenuFloatMobile } from 'wa11y-ai';
<MenuFloatMobile state={route} onNavigate={navigate} />
```

Five default states: `home`, `records`, `reports`, `dashboard`, `more`. Optional `items` accepts `{ value, label, icon }` entries using those state keys to configure application destinations; `icon` is a Material Symbol name. Omit `state` for internal selection with `defaultState`. Each destination is a named native button; Tab and Enter/Space work without custom keyboard handling. The current destination exposes `aria-current="page"`. Applications handle view changes and destination focus in `onNavigate`. Shared Material Symbols replace the reference glyphs. The unavailable Surface/Elevated alias is not inferred: the selected pill uses the supplied Figma colour `#f1c6d5`, overridable through `--wa-menu-float-selected-background`.

## Sidebar navigation

```tsx
import { SidebarMenuDesktop, SidebarMenuItemDropdown } from 'wa11y-ai';
<SidebarMenuDesktop image={{ src: workspace.image, alt: '' }} selectedValue={route} onNavigate={navigate} />
<SidebarMenuItemDropdown label="Record" defaultOpen onSelectItem={recordInto} />
```

Pass `SidebarMenuItem` children to `SidebarMenuDesktop` to supply application navigation instead of the reference items; use `collapseIcon={false}` for a fixed expanded layout.

Six exports compose the supplied designs: `SidebarMenuDesktop`, `SidebarMenuTitle`, `SidebarMenuItem` (Figma Sidebar Menu Item 2), `SidebarSubmenuItem`, `SidebarMenuItemDropdown`, and `SubmenuCollapsible`. Desktop supports default/collapsed/collapsed-submenu through controlled `state`/`onStateChange` or `defaultState`; `collapseIcon`, `showTitle`, and `text` configure the optional controls/caption. Item/subitem states are default/selected/hover/focus; `collapsed` maps Figma's M_ variants. Floating submenu items accept `items`, `selectedValue`, and `onSelectItem`.

Native buttons support Tab/Enter/Space. Disclosure triggers expose `aria-expanded`/`aria-controls`; Escape closes and restores trigger focus. Floating submenus also close on outside pointer interaction or selection. Collapsed controls retain names; navigation callbacks select application views. No menu roles or trapped focus are added. The application provides Roboto Flex through `--wa-sidebar-font-family` and the workspace image.

The canonical Surface/Elevated and Text/Tertiary tokens remain missing. Only this component's explicitly supplied header/caption values are used through `--wa-sidebar-header-background` (#F1C6D5) and `--wa-sidebar-caption-colour` (#999); no aliases are inferred or canonical values changed. Floating submenus reuse the existing Elevation 3 token.

## Breadcrumbs

```tsx
import { BreadcrumbsGroup } from 'wa11y-ai';
<BreadcrumbsGroup items={[{ label: 'Home', href: '/' }, { label: 'Projects', href: '/projects' }, { label: 'Current project' }]} />
```

`Breadcrumbs` supports link/current types and default/hover/focus states; links require `href`. `BreadcrumbsGroup` renders a named navigation landmark and ordered list, with only the final item marked `aria-current="page"`. Ancestors are native links with decorative shared chevrons. Optional `hasLevel1`, `hasLevel2`, and `hasLevel3` mirror Figma visibility properties; the current item remains visible. The group preserves its supplied 16px bold current label; standalone current labels use the supplied 14px semibold style. Native hover/keyboard focus applies the reference states. The playground shows the assembled group with optional levels.

## Skip Content

```tsx
import { SkipContentGroup } from 'wa11y-ai';
<SkipContentGroup targets={{ content: '#main', menu: '#menu', search: '#search', footer: '#footer' }} />
```

Place the group early in the page's focus order and provide existing destination IDs. `SkipContent` also supports individual content/menu/search/footer links with default/hover/focus/active states. Activation preserves native fragment navigation and moves keyboard focus to the destination; a temporary tabindex on non-focusable landmarks is removed on blur. Caller-prevented or modified clicks retain normal behavior. Number badges are decorative, without global keyboard shortcuts. The application supplies Roboto Flex (`--wa-skip-font-family`). The playground shows the assembled group linked to its actual landmarks and search field.

## Tooltip

```tsx
import { Button, Tooltip } from 'wa11y-ai';
<Tooltip title="Save changes" body="Your changes will be stored." position="bottom">
  <Button>Save</Button>
</Tooltip>
```

Four arrow-edge positions follow Figma: bottom places the bubble above the trigger, top below, left to its right, and right to its left. `hasBody={false}` hides the optional description; `hasTitle={false}` supports body-only tooltips. Supply one focusable React element that forwards `aria-describedby`; existing descriptions are retained. Hover or focus reveals the tooltip, hovering the tooltip keeps it open, and Escape dismisses it without moving focus. Body content should be noninteractive. Original 8px arrow layers and paints remain unchanged; SSR hosts can supply `assetBaseUrl` for `assets/tooltip/`. Surrounding layouts must allow the popup to overflow; no automatic collision flipping is added.

## React composition example

Application components can compose the shared tokens:

```tsx
import type { ReactNode } from 'react';
import { cssVars, styleVars } from 'wa11y-ai';

export function ExamplePanel({ children }: { children: ReactNode }) {
  return (
    <section style={{
      color: cssVars['Primitives/Text/Primary'],
      backgroundColor: cssVars['Primitives/Surface/Default'],
      padding: cssVars['Spacing/Spacing/24'],
      borderRadius: cssVars['Radius/Radius/8'],
      fontFamily: styleVars['text/Body/fontFamily'],
      fontSize: styleVars['text/Body/fontSize'],
      boxShadow: styleVars['effect/Elevation 1'],
    }}>
      {children}
    </section>
  );
}
```

Bg Card is available as `styleVars['paint/Bg Card']` or `var(--wa11y-style-paint-bg-card)`. It runs left to right from User Profiles/Primary/Dark at 0% to Primitives/Neutral/Black at 100%, preserving both `$ref` aliases and profile modes.

Gradient Scarlate is available as `styleVars['paint/Gradient Scarlate']` or `var(--wa11y-style-paint-gradient-scarlate)`. It runs left to right from Brand/Red Scarlet at 0% to Brand/Public (Old Rose)/Dark at 100%, both opaque and preserved as `$ref` aliases. The original style name is retained.

Gradient Leaf is available as `styleVars['paint/Gradient Leaf']` or `var(--wa11y-style-paint-gradient-leaf)`. It runs left to right from the existing Brand/Golden lime token at 0% to #66730B at 100%, both opaque. The first stop retains its `$ref` alias and CSS variable.

Gradient Rose is available as `styleVars['paint/Gradient Rose']` or `var(--wa11y-style-paint-gradient-rose)` for CSS `background-image`. It is a left-to-right linear gradient: #FFEBEB at 0%, #D7BAC0 at 100%, both fully opaque.

## Modes

Set the profile mode on the document root:

```html
<html data-wa11y-user-profiles-mode="public">
```

Supported CSS values are `public`, `logged-in`, `admin`, and `neutral`. Typed access uses their original names:

```ts
getTokenValue('User Profiles/Primary/Default', { 'User Profiles': 'Logged In' });
```

Primary/Default and Border/Default share the confirmed palette references in all four modes: Public `#9E4E5E`, Logged In `#104C91`, Admin `#556752`, Neutral `#E4E4E4`. 

Collections have independent modes. The original first mode remains the default; User Profiles defaults to Public. **Light/Dark themes are not supplied.** Palette names containing Light or Dark describe shades. Root-level mode selection is supported; nested theme scopes are not, because inherited CSS aliases resolve where they are declared.

## Accessibility checks

Run `npm run accessibility:check` against the running playground using Chrome (`CHROME_PATH` overrides the executable; `PLAYGROUND_URL` overrides its URL). The development-only axe/Playwright check audits every category, all four profiles, mobile reflow and tooltip placement. It exits unsuccessfully while violations remain; do not treat automated checks as WCAG certification. Use VoiceOver/NVDA, zoom/text-spacing and forced-colour testing before a release.

Known contrast gaps: Neutral-profile primary buttons/badges are 1.27:1; Neutral selected sidebar text is 2.81:1. Neutral placeholder text also needs an approved colour pairing. Input and Dropdown standard borders use Border/Focus, for the enabled default state. Native inputs/selects, button names, switch state, labels, error descriptions, sorting, mixed selection, disclosure state, breadcrumbs, tooltip relationships and skip destinations are covered by behavior checks. Application code must supply meaningful labels, validation messages and navigation destinations; after removing a focused component, move focus to an appropriate surviving control.

## Known limitations

- All existing token mode values resolve. Four profile variables seen in the original reference were never supplied: On Dark, On Light, Border/Inverse, and Surface/Elevated. They are not exported.
- Two paint records remain unavailable: Gradient Croissant has no supplied values; Button Gradient needs the collection for Surface/Subtle. They are marked `unavailable` in `styles` and have no CSS references.
- Sixteen text styles omit line height; Body XL retains its supplied ratio. Font files are not bundled. Applications choose font loading and fallbacks.
- Label LG is 20px as a text style and 18 as a font-size variable. Both remain unchanged. The original 8px and 10px text styles need legibility review.
- Colour availability is not a contrast guarantee. Validate actual foreground/background pairs, focus states, zoom, reflow, and forced colours in your components. [W3C text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) describe the applicable checks. Never use colour alone to communicate state.

## Development

Node.js 22+ and npm are required for development. React 18.2+ is a peer dependency for the components and package-root API; React DOM and preview/testing tools are development dependencies. CSS and the `wa11y-ai/tokens` definition entry point remain framework-independent.

```sh
npm ci
npm run build       # Compile ESM + declarations; generate production CSS
npm run validate    # Fidelity, runtime, generator, types, package allowlist
npm run playground  # http://127.0.0.1:4173/playground/
```

The playground previews tokens, styles, and the exported React components, with interactive controls for variants, forms, navigation, tables, tooltips, and actions. It supports search, collection filtering, profile switching, and copying CSS references. It is development-only and excluded from npm.

The dashboard showcase is a separate page at `/playground/showcase/index.html`, linked from the playground. Install its isolated dependencies with `npm ci --prefix playground/showcase --legacy-peer-deps`, then run `node scripts/build-playground.mjs`. Recharts is declared only in the private showcase package; the core library has no charting dependency. The showcase has its own TypeScript check: `npm run typecheck --prefix playground/showcase`.

```text
src/tokens/    Canonical values, semantic references, modes, and styles
src/components/ Reusable React components and original asset bindings
src/index.ts  Public typed API
styles/       Generated token CSS and component stylesheets
playground/   Local token and component inspector
scripts/      Build, local preview, and package checks
tests/        Regression fingerprints, automated checks, type checks
docs/ai.md    Published integration guidance for coding assistants
```

Keep `scripts/` and `tests/` in the GitHub repository; the `package.json` files allowlist excludes them only from the published npm package. Components live in `src/components/` and are exported through `src/index.ts`.

To update tokens, edit the canonical files in `src/tokens/`, preserving names and references unless a design change is intentional. New Figma exports must first be translated into that schema; builds never require Figma access or original exports. Run `npm run build`, inspect the diff, and validate. Never invent absent values. The fidelity fingerprints lock the verified migration: update them only for a reviewed design change, not to silence an unexpected test failure.

Before a release, run `npm run validate` and `npm pack --dry-run`. The package allowlist includes only compiled runtime JavaScript, declarations, production CSS, component artwork, this README, the MIT license, and AI guidance. Source exports, scripts, tests, playground files, local archives, package tarballs, and `node_modules` are excluded. Only intentional package build outputs from `dist/` are distributed.

## AI integration

Use the [AI quick start](docs/ai.md) (`wa11y-ai/ai.md` in the package) for component selection, critical API distinctions, tokens, composition, responsiveness, and accessibility. [llms.txt](llms.txt) is the short documentation index; repository contributors also follow [AGENTS.md](AGENTS.md), which is not bundled in npm.

For efficient feature work, inspect `dist/index.d.ts` and only the relevant `dist/components/*.d.ts` declarations (or corresponding source files in a checkout). Read individual component sections above as needed; assistants do not need to read this entire README. Use [Modes](#modes), [Accessibility checks](#accessibility-checks), and [Known limitations](#known-limitations) when their details affect the task.

Suggested prompt: **“Read wa11y-ai/ai.md, inspect only the relevant exported declarations, and map the visible UI to existing components before implementing. Preserve built-in behavior and keep unsupported custom UI local to my application.”**

## License

[MIT](LICENSE). Production font assets are not included; the development playground uses the separately licensed Poppins package.
