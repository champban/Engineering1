import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const errors = [];

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function listFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
  });
}

if (!exists('dist/index.html')) errors.push('dist/index.html is missing; run the production build first');
if (!exists('netlify.toml')) errors.push('netlify.toml is missing');
if (!exists('public/_redirects')) errors.push('public/_redirects is missing');
if (!exists('src/pages/StatusPage.tsx')) errors.push('src/pages/StatusPage.tsx is missing');
if (!exists('src/pages/AdminDiagnosticsPage.tsx')) errors.push('src/pages/AdminDiagnosticsPage.tsx is missing');
if (!exists('src/lib/env.ts')) errors.push('src/lib/env.ts is missing');
if (!exists('src/lib/app-meta.ts')) errors.push('src/lib/app-meta.ts is missing');

if (exists('public/_redirects')) {
  const redirects = fs.readFileSync(path.join(root, 'public/_redirects'), 'utf8');
  if (!redirects.includes('/* /index.html 200')) errors.push('SPA fallback is missing from public/_redirects');
}

for (const file of listFiles(path.join(root, 'dist'))) {
  const base = path.basename(file).toLowerCase();
  if (base === '.env' || base.startsWith('.env.')) {
    errors.push(`secret-like environment file found in build output: ${path.relative(root, file)}`);
  }
}

const metadataNames = [
  'VITE_APP_NAME',
  'VITE_APP_ENV',
  'VITE_APP_VERSION',
  'VITE_GIT_COMMIT_SHA',
  'VITE_BUILD_TIMESTAMP',
];

for (const name of metadataNames) {
  if (!process.env[name]?.trim()) {
    console.warn(`Release metadata warning: ${name} is not present in the current shell.`);
  }
}

if (process.env.VITE_APP_ENV === 'production') {
  for (const name of metadataNames) {
    if (!process.env[name]?.trim()) errors.push(`${name} is required for a Production release`);
  }

  if (['local', 'unknown'].includes(process.env.VITE_GIT_COMMIT_SHA ?? '')) {
    errors.push('VITE_GIT_COMMIT_SHA must identify the Production commit');
  }
}

if (errors.length > 0) {
  console.error('Release verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Release verification passed.');
