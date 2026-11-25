import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const ENTRY_DIR = dirname(fileURLToPath(import.meta.url));
const MAIN_TS = join(ENTRY_DIR, 'main.ts');

test('main.ts writes a valid deterministic single-line excuse under 200 chars', () => {
  const outA = mkdtempSync(join(tmpdir(), 'excuse-test-a-'));
  const outB = mkdtempSync(join(tmpdir(), 'excuse-test-b-'));
  const nestedOut = join(outB, 'nested', 'output');
  try {
    execFileSync(process.execPath, [MAIN_TS], {
      env: { ...process.env, MAKEFUN_OUTPUT_DIR: outA },
      stdio: 'pipe',
    });
    execFileSync(process.execPath, [MAIN_TS], {
      env: { ...process.env, MAKEFUN_OUTPUT_DIR: nestedOut },
      stdio: 'pipe',
    });

    const bytesA = readFileSync(join(outA, 'entry.txt'));
    const bytesB = readFileSync(join(nestedOut, 'entry.txt'));
    assert.deepEqual(bytesA, bytesB, 'Output must be byte-for-byte deterministic');

    const text = new TextDecoder('utf-8', { fatal: true }).decode(bytesA);
    assert.ok(text.trim().length > 0, 'Excuse must not be blank or whitespace-only');
    assert.ok(!/[\r\n]/.test(text), 'Excuse must be a single line');
    assert.ok(text.length >= 1 && text.length <= 200, `Length must be 1..200 UTF-16 units (got ${text.length})`);
    assert.ok([...text].length >= 1 && [...text].length <= 200, 'Length must be 1..200 code points');
    assert.ok(bytesA.length <= 200, 'Byte length is within 200 bytes');
  } finally {
    rmSync(outA, { recursive: true, force: true });
    rmSync(outB, { recursive: true, force: true });
  }
});
