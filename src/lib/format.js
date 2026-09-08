// Minimal formatter driven by Sigma's column format metadata. Deliberately not
// pulling in d3-format — only the handful of shapes this plugin actually shows.

function decimalsFrom(formatString, fallback) {
  const match = /\.(\d+)/.exec(formatString || '');
  return match ? Number(match[1]) : fallback;
}

export function formatNumber(value, columnInfo) {
  if (value === null || value === undefined || typeof value !== 'number') return '—';

  const spec = columnInfo?.format;
  const type = spec?.type;
  const formatString = spec?.format || '';

  if (type === 'currency' || /^\$/.test(formatString)) {
    const decimals = decimalsFrom(formatString, 0);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value);
  }

  if (type === 'percent' || /%$/.test(formatString)) {
    const decimals = decimalsFrom(formatString, 1);
    return `${(value * 100).toFixed(decimals)}%`;
  }

  if (type === 'compact') {
    return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 })
      .format(value);
  }

  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: decimalsFrom(formatString, 0),
  }).format(value);
}

/** Compact ACV for inline display, e.g. $250k. */
export function formatAcvShort(value) {
  if (typeof value !== 'number') return null;
  if (Math.abs(value) >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`;
  if (Math.abs(value) >= 1_000) return `$${Math.round(value / 1_000)}k`;
  return `$${value}`;
}

export function pluralize(count, word) {
  return `${count} ${word}${count === 1 ? '' : 's'}`;
}
