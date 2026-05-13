const { formatSortSummary, formatSortPreview, formatUnsortedWarning } = require('../src/reporter.sort');
const { sortAlpha } = require('../src/sort');

const original = { ZEBRA: 'z', ALPHA: 'a', MIDDLE: 'm' };
const sorted = sortAlpha(original);

describe('formatSortSummary', () => {
  it('reports reordered keys when changes exist', () => {
    const out = formatSortSummary(original, sorted);
    expect(out).toContain('Sorted');
    expect(out).toContain('reordered');
  });

  it('reports clean when already sorted', () => {
    const out = formatSortSummary(sorted, sorted);
    expect(out).toContain('Already sorted');
  });

  it('includes old and new positions', () => {
    const out = formatSortSummary(original, sorted);
    expect(out).toMatch(/#\d+/);
  });
});

describe('formatSortPreview', () => {
  it('contains before and after arrows', () => {
    const out = formatSortPreview(original, sorted);
    expect(out).toContain('→');
    expect(out).toContain('preview');
  });

  it('marks unchanged positions with space', () => {
    const out = formatSortPreview(sorted, sorted);
    expect(out).not.toContain('↕');
  });

  it('marks moved keys with arrow symbol', () => {
    const out = formatSortPreview(original, sorted);
    expect(out).toContain('↕');
  });
});

describe('formatUnsortedWarning', () => {
  it('returns clean message when no unsorted keys', () => {
    const out = formatUnsortedWarning([]);
    expect(out).toContain('No unsorted');
  });

  it('lists unsorted keys', () => {
    const out = formatUnsortedWarning(['ZEBRA', 'MIDDLE']);
    expect(out).toContain('ZEBRA');
    expect(out).toContain('MIDDLE');
    expect(out).toContain('2 key(s)');
  });
});
