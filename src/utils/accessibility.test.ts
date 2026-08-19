import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTextScale, ROOT_FONT_SIZE_PX } from './accessibility.ts';

test('every accessibility level has a distinct measurable root font size', () => {
  assert.deepEqual(Object.values(ROOT_FONT_SIZE_PX), [16, 17.5, 19]);
  assert.ok(ROOT_FONT_SIZE_PX.normal < ROOT_FONT_SIZE_PX.large);
  assert.ok(ROOT_FONT_SIZE_PX.large < ROOT_FONT_SIZE_PX.xlarge);
  assert.ok(ROOT_FONT_SIZE_PX.xlarge <= 19);
});

test('largest text setting updates the shared document root used by English and Hindi', () => {
  const root = { style: { fontSize: '' }, dataset: {} as Record<string, string> };
  applyTextScale(root as unknown as HTMLElement, 'xlarge');
  assert.equal(root.style.fontSize, '19px');
  assert.equal(root.dataset.textScale, 'xlarge');
});
