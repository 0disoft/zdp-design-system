import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export function planDraftAssets(draft, { id, tag, notes, assets }) {
  if (String(draft?.id) !== id || draft.draft !== true || draft.tag_name !== tag ||
    draft.author?.login !== 'github-actions[bot]' || draft.name !== tag ||
    draft.body !== notes || !Array.isArray(draft.assets)) {
    throw new Error(`Draft for ${tag} does not match the automated release. Review it before publishing.`);
  }

  const expectedByName = new Map(assets.map(asset => [asset.name, asset]));
  const existingByName = new Map();
  for (const asset of draft.assets) {
    if (!expectedByName.has(asset.name) || existingByName.has(asset.name)) {
      throw new Error(`Unexpected or duplicate asset in the draft for ${tag}: ${asset.name}`);
    }
    existingByName.set(asset.name, asset);
  }

  return assets.flatMap(({ name, size, digest }) => {
    const asset = existingByName.get(name);
    if (!asset) return [{ name, starterId: null }];
    if (asset.state === 'starter' && asset.size === 0 && Number.isSafeInteger(asset.id) && asset.id > 0) {
      return [{ name, starterId: asset.id }];
    }
    if (asset.state !== 'uploaded' || asset.size !== size || asset.digest !== digest) {
      throw new Error(`Draft asset ${name} for ${tag} does not match the verified release input.`);
    }
    return [];
  });
}

async function main([id, tag, notesPath, ...names]) {
  if (!/^[1-9][0-9]*$/.test(id) || !tag || !notesPath || names.length !== 2 ||
    names.some(name => !/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(name)) ||
    new Set(names).size !== names.length) {
    throw new Error('Expected a draft ID, tag, notes path, and two release asset names.');
  }
  const [input, notes, assets] = await Promise.all([
    Array.fromAsync(process.stdin).then(chunks => Buffer.concat(chunks).toString('utf8')),
    readFile(notesPath, 'utf8'),
    Promise.all(names.map(async name => {
      const data = await readFile(name);
      return { name, size: data.length, digest: `sha256:${createHash('sha256').update(data).digest('hex')}` };
    }))
  ]);
  for (const { name, starterId } of planDraftAssets(JSON.parse(input), { id, tag, notes, assets })) {
    process.stdout.write(`${name}\t${starterId ?? '-'}\n`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main(process.argv.slice(2));
}
