// Colors resolve to CSS custom properties (defined in styles.css for both modes),
// so light/dark swaps happen in CSS rather than being recomputed in JS.
// Palette values come from the dataviz reference palette — do not re-step them.

import { UNKNOWN } from './model.js';

const CATEGORICAL_SLOTS = [
  'series-1', 'series-2', 'series-3', 'series-4',
  'series-5', 'series-6', 'series-7', 'series-8',
];

export const OTHER_LABEL = 'Other';

// Heat Check is a state, not a series — it gets the reserved status palette,
// and always ships with its emoji + a legend label so hue never carries it alone.
const STATUS_PATTERNS = [
  [/^good/i, 'status-good'],
  [/^neutral/i, 'status-warning'],
  [/^bad/i, 'status-critical'],
  [/^at ?risk/i, 'status-serious'],
];

function statusSlotFor(value) {
  for (const [pattern, slot] of STATUS_PATTERNS) {
    if (pattern.test(value)) return slot;
  }
  return null;
}

/** True when every real value in the column maps to a reserved status color. */
export function looksLikeStatusColumn(values) {
  const real = values.filter((v) => v && v !== UNKNOWN);
  if (!real.length) return false;
  return real.every((v) => statusSlotFor(v) !== null);
}

/**
 * Slot assignments persist for the session so that filtering the data never
 * repaints the survivors — color follows the entity, not its rank.
 */
export function createColorAssigner() {
  const byColumn = new Map();

  function tableFor(columnId, values) {
    if (!byColumn.has(columnId)) {
      byColumn.set(columnId, { map: new Map(), used: 0, status: false });
    }
    const table = byColumn.get(columnId);
    const distinct = [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b)));

    if (table.map.size === 0) table.status = looksLikeStatusColumn(distinct);

    for (const value of distinct) {
      if (table.map.has(value)) continue;
      if (value === UNKNOWN) {
        table.map.set(value, 'unknown');
      } else if (table.status) {
        table.map.set(value, statusSlotFor(value) || 'unknown');
      } else if (table.used < CATEGORICAL_SLOTS.length) {
        table.map.set(value, CATEGORICAL_SLOTS[table.used++]);
      } else {
        table.map.set(value, 'series-other');
      }
    }

    return table;
  }

  return {
    /** Registers the column's values and returns value -> slot for the legend. */
    prime(columnId, values) {
      const table = tableFor(columnId, values);
      return table;
    },
    slotFor(columnId, value) {
      const table = byColumn.get(columnId);
      return table?.map.get(value) || 'unknown';
    },
  };
}

export function cssColor(slot) {
  return `var(--${slot})`;
}

/** Label color for text sitting on top of that slot's fill. */
export function cssInk(slot) {
  return `var(--${slot}-ink)`;
}
