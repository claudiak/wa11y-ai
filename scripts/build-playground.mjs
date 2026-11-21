import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));

export async function buildPlayground() {
  await mkdir(new URL('../playground/.generated/', import.meta.url), { recursive: true });
  const result = await build({
    absWorkingDir: root,
    entryPoints: { playground: 'playground/playground.js', icons: 'node_modules/material-symbols/outlined.css', ...(existsSync(path.join(root, 'playground/showcase/node_modules/recharts')) ? { showcase: 'playground/showcase/main.tsx' } : {}) }, outdir: 'playground/.generated',
    loader: { '.woff2': 'file' },
    alias: { react: path.join(root, 'node_modules/react'), 'react-dom': path.join(root, 'node_modules/react-dom') },
    bundle: true, format: 'esm', platform: 'browser', target: 'es2022', jsx: 'automatic',
    define: { 'process.env.NODE_ENV': '"development"' }, metafile: true,
  });
  await copyFile(new URL('../node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2', import.meta.url), new URL('../playground/.generated/poppins-600.woff2', import.meta.url));
  for (const weight of [400, 500, 700]) await copyFile(new URL(`../node_modules/@fontsource/poppins/files/poppins-latin-${weight}-normal.woff2`, import.meta.url), new URL(`../playground/.generated/poppins-${weight}.woff2`, import.meta.url));
  await rm(new URL('../playground/.generated/components.js', import.meta.url), { force: true });
  return result;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildPlayground();
  console.log('Built the complete browser playground and Poppins font (excluded from npm/Git).');
}
