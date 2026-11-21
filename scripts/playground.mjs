import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = fileURLToPath(new URL('../', import.meta.url));
const checking = process.argv.includes('--check');
const port = checking ? 0 : Number(process.env.PORT ?? 4173);
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
const server = http.createServer(async (request, response) => {
  try {
    const requested = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    if (requested === '/') { response.writeHead(302, { Location: '/playground/' }); response.end(); return; }
    const route = requested === '/playground/' ? '/playground/index.html' : requested;
    const file = path.resolve(root, '.' + route);
    if (!file.startsWith(root) || !['playground', 'styles', 'dist', 'assets/button', 'assets/input', 'assets/checkbox', 'assets/radio', 'assets/switch', 'assets/avatar', 'assets/tooltip'].some(folder => file.startsWith(path.join(root, folder) + path.sep))) {
      response.writeHead(404); response.end('Not found'); return;
    }
    const type = mime[path.extname(file)];
    if (!type) { response.writeHead(404); response.end('Not found'); return; }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }); response.end(body);
  } catch { response.writeHead(404); response.end('Not found'); }
});
server.on('error', error => { console.error(`Cannot start playground: ${error.message}`); process.exitCode = 1; });
server.listen(port, '127.0.0.1', async () => {
  const local = `http://127.0.0.1:${server.address().port}`;
  if (!checking) { console.log(`Local playground: ${local}/playground/`); return; }
  try {
    for (const route of ['/', '/playground/', '/playground/playground.css', '/playground/.generated/playground.js', '/playground/.generated/poppins-600.woff2', '/styles/tokens.css', '/styles/button.css', '/assets/button/4ab7d.svg', '/dist/index.js', '/dist/tokens/index.js']) {
      const response = await fetch(local + route);
      assert.equal(response.status, 200, route); assert((await response.text()).length > 0, route);
    }
    for (const route of ['/package.json', '/.archive/figma-foundation-2026-11-20/tokens/figma/Primitives.json', '/src/index.ts', '/playground/../../package.json']) {
      assert.equal((await fetch(local + route)).status, 404, route);
    }
    console.log('Playground HTTP checks passed: HTML, CSS, and module routes work; archives and source files are not served.');
  } catch (error) { console.error(error); process.exitCode = 1; }
  finally { server.close(); server.closeAllConnections(); }
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
