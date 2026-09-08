import { existsSync } from 'node:fs';
import { delimiter, isAbsolute, join } from 'node:path';

export function npmCommand(args: readonly string[]): {
  readonly executable: string;
  readonly args: readonly string[];
} {
  if (process.platform !== 'win32') return { executable: 'npm', args };

  // Invoke npm's JavaScript entry point so paths remain argv data, not cmd.exe syntax.
  const searchPath = Object.entries(process.env).find(([key]) => key.toLowerCase() === 'path')?.[1] ?? '';
  for (const entry of searchPath.split(delimiter)) {
    const directory = entry.replace(/^"|"$/g, '');
    if (!isAbsolute(directory) || !existsSync(join(directory, 'npm.cmd'))) continue;
    const cli = join(directory, 'node_modules', 'npm', 'bin', 'npm-cli.js');
    if (!existsSync(cli)) continue;
    const node = join(directory, 'node.exe');
    return { executable: existsSync(node) ? node : 'node', args: [cli, ...args] };
  }

  throw new Error('Cannot locate npm-cli.js beside npm.cmd on PATH. Install npm with Node.js.');
}
