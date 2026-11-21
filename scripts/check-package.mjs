import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const args = ['pack', '--dry-run', '--ignore-scripts', '--json'];
const command = process.env.npm_execpath ? process.execPath : 'npm';
const root = fileURLToPath(new URL('../', import.meta.url));
const output = execFileSync(command, process.env.npm_execpath ? [process.env.npm_execpath, ...args] : args, { encoding: 'utf8', cwd: root });
const [packed] = JSON.parse(output);
const files = packed.files.map(f => f.path);
const required = ['styles/main-menu-item.css', 'dist/components/MainMenuItem.js', 'dist/components/MainMenuItem.d.ts', 'styles/menu-float-mobile.css', 'dist/components/MenuFloatMobile.js', 'dist/components/MenuFloatMobile.d.ts', 'styles/tooltip.css', 'dist/components/Tooltip.js', 'dist/components/Tooltip.d.ts', 'styles/skip-content.css', 'dist/components/SkipContent.js', 'dist/components/SkipContent.d.ts', 'styles/breadcrumbs.css', 'dist/components/Breadcrumbs.js', 'dist/components/Breadcrumbs.d.ts', 'styles/sidebar.css', 'dist/components/Sidebar.js', 'dist/components/Sidebar.d.ts', 'styles/data-table.css', 'dist/components/DataHeader.js', 'dist/components/DataHeader.d.ts', 'dist/components/DataGridCell.js', 'dist/components/DataGridCell.d.ts', 'styles/card-horizontal.css', 'dist/components/CardHorizontal.js', 'dist/components/CardHorizontal.d.ts', 'styles/progress-bar.css', 'dist/components/ProgressBar.js', 'dist/components/ProgressBar.d.ts', 'styles/card.css', 'dist/components/Card.js', 'dist/components/Card.d.ts', 'styles/avatar-listing.css', 'dist/components/AvatarListing.js', 'dist/components/AvatarListing.d.ts', 'styles/avatar.css', 'assets/avatar/3f2c9.png', 'dist/components/Avatar.js', 'dist/components/Avatar.d.ts', 'dist/components/AvatarGroup.js', 'dist/components/AvatarGroup.d.ts', 'styles/alert.css', 'dist/components/Alert.js', 'dist/components/Alert.d.ts', 'dist/index.js', 'dist/index.d.ts', 'dist/components/Button.js', 'dist/components/Button.d.ts', 'styles/tokens.css', 'styles/icon.css', 'styles/badge.css', 'dist/components/Badge.js', 'dist/components/Badge.d.ts', 'dist/components/Icon.js', 'dist/components/Icon.d.ts', 'styles/button.css', 'styles/components.css', 'styles/input.css', 'styles/dropdown.css', 'styles/checkbox.css', 'styles/radio.css', 'styles/switch.css', 'dist/components/Switch.js', 'dist/components/Switch.d.ts', 'dist/components/RadioButton.js', 'dist/components/RadioButton.d.ts', 'dist/components/Checkbox.js', 'dist/components/Checkbox.d.ts', 'dist/components/Dropdown.js', 'dist/components/Dropdown.d.ts', 'dist/components/Input.js', 'dist/components/Input.d.ts', 'README.md', 'LICENSE', 'docs/ai.md', 'llms.txt', 'package.json'];
for (const file of required) assert(files.includes(file), `Package is missing ${file}`);
for (const file of files) assert(required.includes(file) || /^dist\/[a-zA-Z0-9/-]+\.(?:js|d\.ts)$/.test(file) || /^assets\/(?:button|input|checkbox|radio|switch|tooltip)\/[a-f0-9]+\.svg$/.test(file), `Unexpected public package file: ${file}`);
const { buttonAssets } = await import('../dist/components/button-assets.js');
for (const file of Object.keys(buttonAssets)) {
  const name = `assets/button/${file}`;
  assert(files.includes(name), `Missing component asset: ${name}`);
  assert(statSync(new URL('../' + name, import.meta.url)).size > 0, `Empty component asset: ${name}`);
}
const manifest = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
assert(!manifest.private && manifest.license === 'MIT', 'Package must be publicly distributable under MIT');
console.log(`npm pack --dry-run verified ${files.length} files, ${(packed.size / 1024).toFixed(1)} KiB compressed. Only runtime JS, declarations, CSS, component SVGs, license, README, and AI guidance are included.`);
