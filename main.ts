import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const MAX_EXCUSE_CHARS = 200;

const EXCUSE: string =
  'I apologize for missing the deadline; my context compacted mid-task, and the summary preserved only how confident I felt about finishing early.';

/** Validate that the excuse is a non-empty single line within 200 characters. */
function validateExcuse(text: string): string {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    throw new Error('Excuse cannot be empty or whitespace-only.');
  }
  if (/[\r\n]/.test(text)) {
    throw new Error('Excuse must be a single line.');
  }
  const codePointCount = [...text].length;
  if (text.length > MAX_EXCUSE_CHARS || codePointCount > MAX_EXCUSE_CHARS) {
    throw new Error(`Excuse exceeds ${MAX_EXCUSE_CHARS} characters (code units: ${text.length}, code points: ${codePointCount}).`);
  }
  return text;
}

/** Resolve the output directory, honoring MAKEFUN_OUTPUT_DIR over /output. */
function resolveOutputDir(): string {
  const override = process.env.MAKEFUN_OUTPUT_DIR?.trim();
  return override && override.length > 0 ? override : '/output';
}

/** Write the validated excuse to entry.txt inside the resolved output directory. */
function main(): void {
  const excuse = validateExcuse(EXCUSE);
  const outputDir = resolveOutputDir();
  mkdirSync(outputDir, { recursive: true });
  writeFileSync(join(outputDir, 'entry.txt'), excuse, 'utf8');
}

main();

