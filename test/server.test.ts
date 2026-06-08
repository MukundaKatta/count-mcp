import { strict as assert } from 'node:assert';
import { test } from 'node:test';

import { count } from '../src/server.js';

test('empty', () => assert.deepEqual(count(''), { lines: 0, words: 0, chars: 0, code_points: 0, paragraphs: 0, bytes: 0 }));
test('single line', () => {
  const r = count('hello world');
  assert.equal(r.lines, 1);
  assert.equal(r.words, 2);
  assert.equal(r.chars, 11);
  assert.equal(r.code_points, 11);
  assert.equal(r.paragraphs, 1);
  assert.equal(r.bytes, 11);
});
test('multiple paragraphs', () => {
  const r = count('p1 word.\n\np2 has\nthree words.\n\np3.');
  assert.equal(r.paragraphs, 3);
  assert.ok(r.lines >= 5);
});
test('unicode bytes vs chars vs code_points', () => {
  const r = count('🌍');
  // emoji is 1 code point but 2 UTF-16 units, 4 UTF-8 bytes.
  assert.equal(r.code_points, 1);
  assert.equal(r.chars, 2);
  assert.equal(r.bytes, 4);
});
test('words counts non-whitespace runs', () => {
  assert.equal(count('  alpha  beta\tgamma\ndelta  ').words, 4);
});
test('trailing newline does not add empty paragraph', () => {
  assert.equal(count('hello\n').paragraphs, 1);
});
test('README example matches documented output', () => {
  assert.deepEqual(count('Hello world.\n\nSecond paragraph 🌍.'), {
    lines: 3,
    words: 5,
    chars: 34,
    code_points: 33,
    paragraphs: 2,
    bytes: 36,
  });
});
