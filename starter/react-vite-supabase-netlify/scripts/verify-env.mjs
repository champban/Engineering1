import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const env = { ...process.env };

function loadEnvFile(filename) {
  const fullPath = path.join(root, filename);
  if (!fs.existsSync(fullPath)) return;

  for (const rawLine of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const separator = line.indexOf('=');
    if (separator < 1) continue;

    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    if (!(key in env)) env[key] = value;
  }
}

loadEnvFile('.env');
loadEnvFile('.env.local');

const required = [
  'VITE_APP_NAME',
  'VITE_APP_ENV',
  'VITE_APP_VERSION',
  'VITE_GIT_COMMIT_SHA',
  'VITE_BUILD_TIMESTAMP',
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
];

const forbiddenPublicPatterns = [
  /SERVICE_ROLE/i,
  /DATABASE_PASSWORD/i,
  /PRIVATE_KEY/i,
  /CLIENT_SECRET/i,
  /ACCESS_TOKEN/i,
  /REFRESH_TOKEN/i,
];

const errors = [];

for (const key of required) {
  if (!env[key]?.trim()) errors.push(`${key}: missing`);
}

for (const key of Object.keys(env).filter((name) => name.startsWith('VITE_'))) {
  if (forbiddenPublicPatterns.some((pattern) => pattern.test(key))) {
    errors.push(`${key}: forbidden secret-like public variable name`);
  }
}

for (const key of ['VITE_SUPABASE_URL']) {
  const value = env[key];
  if (!value) continue;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('invalid protocol');
  } catch {
    errors.push(`${key}: invalid URL format`);
  }
}

const allowedEnvironments = new Set(['local', 'test', 'preview', 'production']);
if (env.VITE_APP_ENV && !allowedEnvironments.has(env.VITE_APP_ENV)) {
  errors.push('VITE_APP_ENV: must be local, test, preview or production');
}

if (errors.length > 0) {
  console.error('Environment verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('Environment verification passed.');
for (const key of required) console.log(`- ${key}: present`);
