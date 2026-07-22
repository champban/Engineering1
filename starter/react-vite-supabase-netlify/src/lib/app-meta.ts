import { env } from './env';

export const appMeta = Object.freeze({
  name: env.appName,
  environment: env.appEnvironment,
  version: env.appVersion,
  gitCommitSha: env.gitCommitSha,
  shortCommitSha: env.gitCommitSha === 'local' ? 'local' : env.gitCommitSha.slice(0, 8),
  buildTimestamp: env.buildTimestamp,
  netlifyContext: env.netlifyContext,
  netlifyDeployId: env.netlifyDeployId,
});
