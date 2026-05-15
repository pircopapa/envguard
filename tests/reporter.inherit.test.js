const { formatInheritSummary, formatInheritConflicts } = require('../src/reporter.inherit');

const baseSummary = {
  baseKeys: 3,
  childKeys: 2,
  inherited: ['HOST', 'DB'],
  overridden: ['PORT'],
  conflicts: ['PORT'],
  isClean: false,
};

describe('formatInheritSummary', () => {
  test('includes base and child key counts', () => {
    const out = formatInheritSummary(baseSummary);
    expect(out).toContain('Base keys');
    expect(out).toContain('3');
    expect(out).toContain('Child keys');
    expect(out).toContain('2');
  });

  test('lists inherited keys', () => {
    const out = formatInheritSummary(baseSummary);
    expect(out).toContain('+ HOST');
    expect(out).toContain('+ DB');
  });

  test('lists overridden keys', () => {
    const out = formatInheritSummary(baseSummary);
    expect(out).toContain('~ PORT');
  });

  test('shows conflicts', () => {
    const out = formatInheritSummary(baseSummary);
    expect(out).toContain('! PORT');
  });

  test('shows conflicts detected status when not clean', () => {
    const out = formatInheritSummary(baseSummary);
    expect(out).toContain('conflicts detected');
  });

  test('shows clean status when no conflicts', () => {
    const clean = { ...baseSummary, conflicts: [], isClean: true };
    const out = formatInheritSummary(clean);
    expect(out).toContain('clean');
  });

  test('uses custom labels', () => {
    const out = formatInheritSummary(baseSummary, { baseLabel: 'production', childLabel: 'staging' });
    expect(out).toContain('production');
    expect(out).toContain('staging');
  });

  test('shows none when no inherited keys', () => {
    const noInherit = { ...baseSummary, inherited: [] };
    const out = formatInheritSummary(noInherit);
    expect(out).toContain('none');
  });
});

describe('formatInheritConflicts', () => {
  test('lists conflicts', () => {
    const out = formatInheritConflicts(['PORT', 'HOST']);
    expect(out).toContain('! PORT');
    expect(out).toContain('! HOST');
    expect(out).toContain('2 inherit conflict');
  });

  test('returns clean message when no conflicts', () => {
    const out = formatInheritConflicts([]);
    expect(out).toContain('No inherit conflicts');
  });
});
