import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

/** Read the stable contract entry and its focused chapters for contract checks. */
export async function readConsumerContract(root: string): Promise<string> {
  const directory = join(root, 'docs', 'consumer-contract');
  const chapters = (await readdir(directory, { withFileTypes: true }))
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => entry.name)
    .sort();
  const files = [join(root, 'docs', 'CONSUMER_CONTRACT.md'), ...chapters.map(name => join(directory, name))];
  return (await Promise.all(files.map(path => readFile(path, 'utf8')))).join('\n');
}
