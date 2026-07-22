export type AppEnvironment = 'local' | 'test' | 'preview' | 'production';

type PublicEnv = Record<string, string | boolean | undefined>;

const source = import.meta.env as PublicEnv;

const forbiddenPublicPatterns = [
  /SERVICE_ROLE/i,
  /DATABASE_PASSWORD/i,
  /PRIVATE_KEY/i,
  /CLIENT_SECRET/i,
  /ACCESS_TOKEN/i,
  /REFRESH_TOKEN/i,
];

function required(name: string): string {
  const value = source[name];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`Application configuration error: ${name} is missing.`);
  }
  return value.trim();
}

function requiredUrl(name: string): string {
  const value = required(name);
  try {
    const parsed = new URL(value);
    if (!['https:', 'http:'].includes(parsed.protocol)) throw new Error('Unsupported protocol');
    return value;
  } catch {
    throw new Error(`Application configuration error: ${name} is not a valid URL.`);
  }
}

for (const name of Object.keys(source).filter((key) => key.startsWith('VITE_'))) {
  if (forbiddenPublicPatterns.some((pattern) => pattern.test(name))) {
    throw new Error(`Application security error: forbidden secret-like public variable ${name}.`);
  }
}

const appEnvironment = required('VITE_APP_ENV');
if (!['local', 'test', 'preview', 'production'].includes(appEnvironment)) {
  throw new Error('Application configuration error: VITE_APP_ENV must be local, test, preview or production.');
}

export const env = Object.freeze({
  appName: required('VITE_APP_NAME'),
  appEnvironment: appEnvironment as AppEnvironment,
  appVersion: required('VITE_APP_VERSION'),
  gitCommitSha: required('VITE_GIT_COMMIT_SHA'),
  buildTimestamp: required('VITE_BUILD_TIMESTAMP'),
  netlifyContext: typeof source.VITE_NETLIFY_CONTEXT === 'string' ? source.VITE_NETLIFY_CONTEXT : 'unknown',
  netlifyDeployId: typeof source.VITE_NETLIFY_DEPLOY_ID === 'string' ? source.VITE_NETLIFY_DEPLOY_ID : 'unknown',
  supabaseUrl: requiredUrl('VITE_SUPABASE_URL'),
  supabaseAnonKey: required('VITE_SUPABASE_ANON_KEY'),
});
