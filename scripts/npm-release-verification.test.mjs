import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { test } from 'node:test';
import { verifyPublishedArtifact } from './npm-release-verification.mjs';

const expected = Object.freeze({ package: '@example/package', version: '1.2.3', gitHead: 'abc123', integrity: 'sha512-verified' });
const tarball = 'https://registry.npmjs.org/@example/package/-/package-1.2.3.tgz';
const metadata = { name: expected.package, version: expected.version, gitHead: expected.gitHead,
  dist: { integrity: expected.integrity, tarball } };
const response = (status = 200, value = metadata) => ({ status, text: async () => JSON.stringify(value) });

test('verifies all fields from one GET and returns its tarball without mutating the manifest', async () => {
  let calls = 0;
  assert.equal(await verifyPublishedArtifact(expected, { request: async (url, options) => {
    calls++;
    assert.equal(url, 'https://registry.npmjs.org/%40example%2Fpackage/1.2.3');
    assert.equal(options.method, 'GET');
    assert.ok(options.signal instanceof AbortSignal);
    return response();
  } }), tarball);
  assert.equal(calls, 1);
});

test('404 visibility lag backs off exponentially and succeeds on the final allowed check', async () => {
  let calls = 0;
  const waits = [];
  assert.equal(await verifyPublishedArtifact(expected, {
    request: async () => response(++calls === 12 ? 200 : 404),
    sleep: async ms => { waits.push(ms); }
  }), tarball);
  assert.equal(calls, 12);
  assert.deepEqual(waits, [1000, 2000, 4000, 8000, 16000, 30000, 30000, 30000, 30000, 30000, 30000]);
});

test('persistent 404 stops at twelve checks with no trailing delay', async () => {
  let calls = 0;
  let waits = 0;
  await assert.rejects(verifyPublishedArtifact(expected, {
    request: async () => { calls++; return response(404); },
    sleep: async () => { waits++; }
  }), error => /HTTP 404 after 12/.test(error.cause?.message));
  assert.equal(calls, 12);
  assert.equal(waits, 11);
});

test('temporary service failures use only the shared GET retry policy', async () => {
  let calls = 0;
  const waits = [];
  assert.equal(await verifyPublishedArtifact(expected, {
    request: async () => response(++calls < 3 ? 503 : 200),
    sleep: async ms => { waits.push(ms); }
  }), tarball);
  assert.equal(calls, 3);
  assert.deepEqual(waits, [250, 500]);
});

test('persistent network failure stops after three reads and preserves the entire cause chain', async () => {
  const socketError = new Error('ECONNRESET');
  const failure = new TypeError('fetch failed', { cause: socketError });
  let calls = 0;
  await assert.rejects(verifyPublishedArtifact(expected, {
    request: async () => { calls++; throw failure; }, sleep: async () => {}
  }), error => error.cause?.cause === failure && error.cause.cause.cause === socketError);
  assert.equal(calls, 3);
});

for (const status of [401, 403, 501]) {
  test(`HTTP ${status} fails immediately with its cause instead of polling for visibility`, async () => {
    let calls = 0;
    await assert.rejects(verifyPublishedArtifact(expected, { request: async () => {
      calls++;
      return response(status);
    }, sleep: async () => assert.fail('must not retry') }), error => error.cause?.cause?.status === status);
    assert.equal(calls, 1);
  });
}

for (const [field, value] of [
  ['name', { ...metadata, name: 'another-package' }],
  ['version', { ...metadata, version: '9.9.9' }],
  ['gitHead', { ...metadata, gitHead: 'wrong-commit' }],
  ['integrity', { ...metadata, dist: { ...metadata.dist, integrity: 'sha512-other' } }],
  ['missing dist', { ...metadata, dist: undefined }]
]) {
  test(`mismatched ${field} never retries or accepts a different artifact`, async () => {
    let calls = 0;
    await assert.rejects(verifyPublishedArtifact(expected, { request: async () => {
      calls++;
      return response(200, value);
    }, sleep: async () => assert.fail('must not retry') }), /verification failed/);
    assert.equal(calls, 1);
  });
}

test('malformed JSON retains the parse error and is not retried', async () => {
  await assert.rejects(verifyPublishedArtifact(expected, {
    request: async () => ({ status: 200, text: async () => 'invalid json' }),
    sleep: async () => assert.fail('must not retry')
  }), error => error.cause?.cause instanceof SyntaxError);
});

test('missing or invalid tarball URL cannot produce a successful verification', async () => {
  for (const value of [undefined, '', 'https://', 'http://registry.npmjs.org/package.tgz', 'javascript:alert(1)']) {
    await assert.rejects(verifyPublishedArtifact(expected, {
      request: async () => response(200, { ...metadata, dist: { ...metadata.dist, tarball: value } }),
      sleep: async () => assert.fail('must not retry')
    }), error => /invalid tarball URL/.test(error.cause?.message));
  }
});

test('invalid manifest fails before any external call', async () => {
  for (const field of ['package', 'version', 'gitHead', 'integrity']) {
    await assert.rejects(verifyPublishedArtifact({ ...expected, [field]: '' }, {
      request: async () => assert.fail('must not fetch')
    }), new RegExp(`${field} is required`));
  }
});

test('pre-cancellation propagates its exact reason without a read', async () => {
  const reason = new Error('cancel before read');
  await assert.rejects(verifyPublishedArtifact(expected, {
    signal: AbortSignal.abort(reason), request: async () => assert.fail('must not fetch')
  }), error => error === reason);
});

test('in-flight cancellation aborts the request with no retry', async () => {
  const controller = new AbortController();
  const reason = new Error('cancel during read');
  let calls = 0;
  let requestSignal;
  const pending = verifyPublishedArtifact(expected, {
    signal: controller.signal,
    request: async (_url, options) => {
      calls++;
      requestSignal = options.signal;
      return new Promise(() => {});
    }
  });
  controller.abort(reason);
  await assert.rejects(pending, error => error === reason);
  assert.equal(requestSignal.reason, reason);
  assert.equal(calls, 1);
});

test('cancellation during the real visibility delay stops before the next GET', async () => {
  const controller = new AbortController();
  const reason = new Error('cancel visibility delay');
  let calls = 0;
  const pending = verifyPublishedArtifact(expected, {
    signal: controller.signal,
    request: async () => { calls++; return response(404); }
  });
  const timer = setTimeout(() => controller.abort(reason), 20);
  try {
    await assert.rejects(pending, error => error === reason);
    assert.equal(calls, 1);
  } finally {
    clearTimeout(timer);
  }
});

test('a failing visibility delay preserves its original cause', async () => {
  const failure = new Error('scheduler failed');
  await assert.rejects(verifyPublishedArtifact(expected, {
    request: async () => response(404), sleep: async () => { throw failure; }
  }), error => error.cause === failure);
});

test('a stalled real HTTP body times out with no outer visibility retry', async () => {
  let calls = 0;
  const server = createServer((_request, reply) => {
    reply.writeHead(200);
    reply.flushHeaders();
    reply.write('{"name":');
  });
  try {
    await new Promise((yes, no) => { server.once('error', no); server.listen(0, '127.0.0.1', yes); });
    const url = `http://127.0.0.1:${server.address().port}`;
    await assert.rejects(verifyPublishedArtifact(expected, {
      timeoutMs: 50, request: (_url, options) => { calls++; return fetch(url, options); },
      sleep: async () => {}
    }), error => error.cause?.cause?.name === 'TimeoutError');
    assert.equal(calls, 3);
  } finally {
    server.closeAllConnections();
    await new Promise((yes, no) => server.close(error => error ? no(error) : yes()));
  }
});
