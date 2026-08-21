import assert from 'node:assert/strict';
import { isAbsolute } from 'node:path';
import { gunzipSync } from 'node:zlib';

export interface TarEntry {
  readonly path: string;
  readonly content: Buffer;
}

export function readTarEntries(archive: Buffer): readonly TarEntry[] {
  assert.ok(archive.byteLength <= 16 * 1024 * 1024, 'Compressed package archive exceeds the 16 MiB parser limit.');
  const tar = gunzipSync(archive, { maxOutputLength: 64 * 1024 * 1024 });
  const entries: TarEntry[] = [];
  const seenPaths = new Set<string>();
  let offset = 0;
  let pendingPath: string | null = null;
  let pendingPax: Readonly<Record<string, string>> = {};

  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;

    const name = readTarString(header, 0, 100);
    const prefix = readTarString(header, 345, 500);
    const headerPath = prefix ? `${prefix}/${name}` : name;
    const size = readTarSize(header, headerPath);
    const type = readTarString(header, 156, 157);
    const contentStart = offset + 512;
    const contentEnd = contentStart + size;
    assert.ok(contentEnd <= tar.length, `Truncated tar entry: ${headerPath}`);
    const content = tar.subarray(contentStart, contentEnd);

    if (type === 'x') {
      pendingPax = parsePaxHeaders(content);
    } else if (type === 'L') {
      const longName = content.toString('utf8');
      const terminator = longName.indexOf('\0');
      pendingPath = (terminator >= 0 ? longName.slice(0, terminator) : longName).trimEnd();
    } else {
      const entryPath: string = pendingPax.path ?? pendingPath ?? headerPath;
      if (type === '' || type === '0') {
        assertSafeTarPath(entryPath);
        assert.ok(!seenPaths.has(entryPath), `Duplicate tar entry path: ${entryPath}`);
        seenPaths.add(entryPath);
        entries.push({ path: entryPath, content: Buffer.from(content) });
      }
      pendingPath = null;
      pendingPax = {};
    }

    offset = contentStart + Math.ceil(size / 512) * 512;
  }

  return entries;
}

export function stripPackagePrefix(path: string): string {
  return path.startsWith('package/') ? path.slice('package/'.length) : path;
}

function readTarString(header: Buffer, start: number, end: number): string {
  const value = header.subarray(start, end).toString('utf8');
  const terminator = value.indexOf('\0');
  return (terminator >= 0 ? value.slice(0, terminator) : value).trimEnd();
}

function readTarSize(header: Buffer, path: string): number {
  const field = header.subarray(124, 136);
  assert.ok((field[0] ?? 0) < 0x80, `Base-256 tar sizes are not supported: ${path}`);
  const text = readTarString(header, 124, 136).trim();
  const size = text.length === 0 ? 0 : Number.parseInt(text, 8);
  assert.ok(Number.isSafeInteger(size) && size >= 0, `Invalid tar entry size: ${path}`);
  return size;
}

function parsePaxHeaders(content: Buffer): Readonly<Record<string, string>> {
  const headers: Record<string, string> = {};
  let offset = 0;

  while (offset < content.length) {
    const space = content.indexOf(0x20, offset);
    assert.ok(space > offset, 'Invalid PAX header length.');
    const recordLength = Number.parseInt(content.subarray(offset, space).toString('ascii'), 10);
    assert.ok(Number.isSafeInteger(recordLength) && recordLength > 0, 'Invalid PAX record length.');
    const end = offset + recordLength;
    assert.ok(end <= content.length, 'Truncated PAX record.');
    assert.equal(content[end - 1], 0x0a, 'PAX records must end with a newline.');
    const record = content.subarray(space + 1, end - 1).toString('utf8');
    const equals = record.indexOf('=');
    if (equals > 0) headers[record.slice(0, equals)] = record.slice(equals + 1);
    offset = end;
  }

  return headers;
}

function assertSafeTarPath(path: string): void {
  const normalized = path.replaceAll('\\', '/');
  const segments = normalized.split('/');
  assert.ok(path.length > 0, 'Tar entry path must not be empty.');
  assert.ok(!isAbsolute(path), `Tar entry must be relative: ${path}`);
  assert.ok(
    !normalized.startsWith('/') && !/^[A-Za-z]:\//.test(normalized),
    `Tar entry must be relative: ${path}`
  );
  assert.ok(!segments.includes('..'), `Tar entry escapes the package: ${path}`);
}
