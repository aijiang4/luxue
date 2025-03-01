import path from 'node:path';
import moduleAlias from 'module-alias';

function getPreloadModules(): string[] {
  const preloadModules: string[] = [];
  for (let i = 0; i < process.execArgv.length; i++) {
    if (process.execArgv[i] === '-r' || process.execArgv[i] === '--require') {
      if (i + 1 < process.execArgv.length) {
        preloadModules.push(process.execArgv[i + 1]);
      }
    } else if (process.execArgv[i].startsWith('--require=')) {
      preloadModules.push(process.execArgv[i].split('=')[1]);
    }
  }
  return preloadModules;
}

if (!getPreloadModules().includes('tsconfig-paths/register')) {
  moduleAlias.addAliases({
    '@refly-packages/openapi-schema': path.resolve(
      __dirname,
      '../../../packages/openapi-schema/dist',
    ),
    '@refly-packages/errors': path.resolve(__dirname, '../../../packages/errors/dist'),
    '@refly-packages/common-types': path.resolve(__dirname, '../../../packages/common-types/dist'),
    '@refly-packages/utils': path.resolve(__dirname, '../../../packages/utils/dist'),
    '@refly-packages/skill-template': path.resolve(
      __dirname,
      '../../../packages/skill-template/dist',
    ),
    '@': __dirname,
  });
}
