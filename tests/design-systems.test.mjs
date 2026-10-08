import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
async function loadTypeScript(file) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
}
const { nextTab, toggleFilter, validateDestination, contrastRatio } = await loadTypeScript('../src/app/design-systems/_components/behavior.ts');
const { systems } = await loadTypeScript('../src/app/design-systems/_components/systems.ts');

test('tab keyboard navigation wraps and supports Home and End', () => {
  assert.equal(nextTab(0, 'ArrowLeft', 3), 2);
  assert.equal(nextTab(2, 'ArrowRight', 3), 0);
  assert.equal(nextTab(1, 'Home', 3), 0);
  assert.equal(nextTab(0, 'End', 3), 2);
  assert.equal(nextTab(1, 'Enter', 3), 1);
});
test('filters add and remove items without changing previous selections', () => {
  const original = ['Nature'];
  assert.deepEqual(toggleFilter(original, 'Culture'), ['Nature', 'Culture']);
  assert.deepEqual(toggleFilter(original, 'Nature'), []);
  assert.deepEqual(original, ['Nature']);
});
test('destination validation rejects empty and short input, accepts meaningful text', () => {
  assert.equal(validateDestination('   '), 'Enter a destination to continue.');
  assert.equal(validateDestination('A'), 'Use at least two characters.');
  assert.equal(validateDestination(' Kyoto '), null);
});
test('all system semantic swatches meet normal-text contrast against their documented foreground', () => {
  for (const system of Object.values(systems)) {
    assert.equal(system.colors.length, 9);
    for (const color of system.colors) assert.ok(contrastRatio(color.value, color.foreground) >= 4.5, `${system.name} ${color.role}`);
    const role = key => system.colors.find(c => c.key === key).value;
    assert.ok(contrastRatio(role('text'), role('background')) >= 4.5);
    assert.ok(contrastRatio(role('muted'), role('background')) >= 4.5);
    assert.ok(contrastRatio(role('muted'), role('surface')) >= 4.5);
    assert.ok(contrastRatio(role('border'), role('surface')) >= 3);
  }
  assert.equal(contrastRatio('#000000', '#ffffff'), 21);
});
