# Working on wa11y-ai

## Scope and discovery

- For interface work, read `docs/ai.md`, then only relevant exports/declarations and README sections. Do not read the whole README by default.
- Components live in `src/components/` and are exported through `src/index.ts`. Reuse existing APIs; keep application-specific UI in the application unless a library addition is requested.
- Canonical token data lives in `src/tokens/`; Figma exports and `.archive/` are historical evidence, never build inputs.

## Preserve the foundation

- Preserve token paths, CSS names, numeric precision, `$ref` aliases, independent modes, and default-mode behavior. Do not flatten aliases or infer missing references from matching colours.
- Change canonical values only for an explicitly requested design change. Keep unavailable paints unavailable and absent line heights absent until supplied. Preserve confirmed component variants and interaction behavior.
- `tests/fidelity.json` locks the verified migration. Update fingerprints only for an authorized change after proving unrelated values remain unchanged; never merely to silence a failure.
- Reuse shared tokens and Material Symbols Outlined through `Icon`; do not export individual Material SVGs. Preserve bespoke checkbox/radio/switch/tooltip artwork. Keep the font stylesheet separate from the React Icon component.
- Do not claim automatic WCAG compliance. Preserve built-in semantics, keyboard access, and visible focus; consult README accessibility limitations when relevant.

## Validation and distribution

- Run `npm run build` for token changes and `npm run validate` before delivery. The package check runs `npm pack --dry-run` against the runtime/CSS/documentation allowlist.
- For relevant interface changes, run the existing `npm run accessibility:check` against the running playground; follow `docs/ai.md` for targeted application checks, manual verification, and reporting. Disclose failures or unavailable checks.
- Keep `scripts/` and `tests/` in GitHub; exclude them, playground, and source definitions from npm using `package.json`'s `files` allowlist. Keep `.archive/`, `dist/`, `node_modules/`, and `*.tgz` out of Git; only intentional runtime build output belongs in the package.
- The playground is local development tooling. Do not publish, deploy, commit, or push unless requested.
