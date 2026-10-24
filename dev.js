import { spawn } from 'node:child_process';

const rawArgs = process.argv.slice(2);
const filteredArgs = [];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === '--host') {
    // Skip '--host' and skip its argument if it follows (e.g. '0.0.0.0')
    if (rawArgs[i + 1] && !rawArgs[i + 1].startsWith('-')) {
      i++;
    }
    continue;
  }
  if (arg.startsWith('--host=')) {
    continue;
  }
  if (arg === '0.0.0.0') {
    continue;
  }
  filteredArgs.push(arg);
}

const child = spawn(
  process.execPath,
  ['./node_modules/next/dist/bin/next', 'dev', '-H', '0.0.0.0', '-p', '3000', ...filteredArgs],
  { stdio: 'inherit' }
);

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
  } else {
    process.exit(code ?? 0);
  }
});
