import axe, { type Result } from 'axe-core';
import { expect } from 'vitest';

function describeViolations(violations: Result[]): string {
  return violations
    .map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.html).join('\n  ')}`)
    .join('\n');
}

/** Fails the test if axe-core reports any WCAG 2.1 A/AA violation inside the container. */
export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
  });
  expect(results.violations, describeViolations(results.violations)).toEqual([]);
}
