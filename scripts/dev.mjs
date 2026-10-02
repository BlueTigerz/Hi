// Starts the local dev environment. The frontend always starts; the API and
// storage emulator start only if Azure Functions Core Tools (`func`) is
// installed. Without them the game still runs, just without the leaderboard.
import { spawnSync } from 'node:child_process';
import { copyFileSync, existsSync } from 'node:fs';
import { concurrently } from 'concurrently';

const hasFunc = spawnSync('func --version', { shell: true, stdio: 'ignore' }).status === 0;
const hasApiDeps = existsSync('api/node_modules');

const commands = [{ name: 'web', command: 'vite', prefixColor: 'green' }];

if (hasFunc && hasApiDeps) {
  if (!existsSync('api/local.settings.json')) {
    copyFileSync('api/local.settings.example.json', 'api/local.settings.json');
    console.log('Created api/local.settings.json from the example.');
  }
  commands.push(
    { name: 'api', command: 'npm --prefix api start', prefixColor: 'cyan' },
    { name: 'db', command: 'npm run dev:storage', prefixColor: 'magenta' },
  );
} else {
  const reason = hasFunc
    ? 'API dependencies are not installed (run `npm run setup`).'
    : 'Azure Functions Core Tools (`func`) was not found on your PATH.';
  console.warn(
    `\n⚠  ${reason}\n` +
      '   Starting the frontend only. The game works; the leaderboard stays hidden.\n' +
      '   To install Core Tools on Windows: winget install Microsoft.Azure.FunctionsCoreTools\n' +
      '   (other platforms: https://learn.microsoft.com/azure/azure-functions/functions-run-local)\n',
  );
}

// No kill-others: if the API or storage crashes, the frontend keeps running.
const { result } = concurrently(commands);
result.catch(() => process.exit(1));
