import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { generateCss } from './token-build.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const require = createRequire(import.meta.url);
await rm(new URL('../dist/', import.meta.url), { recursive: true, force: true });
const compiler = path.join(path.dirname(require.resolve('typescript/package.json')), 'bin/tsc');
execFileSync(process.execPath, [compiler, '-p', 'tsconfig.json'], { cwd: root, stdio: 'inherit' });
const data = await import('../dist/tokens/index.js');
const naming = await import('../dist/utils.js');
const css = generateCss(data, naming), target = new URL('../styles/tokens.css', import.meta.url);
if (process.argv.includes('--check')) {
  if (await readFile(target, 'utf8').catch(() => null) !== css) throw new Error('styles/tokens.css is stale. Run npm run build.');
} else {
  await mkdir(new URL('../styles/', import.meta.url), { recursive: true });
  await writeFile(target, css);
}
const paints = Object.values(data.styles).filter(s => s.type === 'paint' && s.status === 'unavailable').length;
const missingLineHeights = Object.values(data.styles).filter(s => s.type === 'text' && !('lineHeight' in s)).length;
console.log(`Built ${Object.keys(data.tokens).length} tokens across ${data.collections.length} collections. ${paints} paints unavailable; ${missingLineHeights} text styles have no line height (see README).`);
