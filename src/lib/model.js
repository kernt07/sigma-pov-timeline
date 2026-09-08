import { parseDay } from './dates.js';

function asBool(value) {
  if (value === true || value === false) return value;
  if (typeof value === 'string') return value.trim().toLowerCase() === 'true';
  if (typeof value === 'number') return value !== 0;
  return false;
}

function asText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

// Sigma delivers column-oriented arrays; everything downstream wants rows.
function rowCountOf(data) {
  let max = 0;
  for (const key of Object.keys(data || {})) {
    const len = data[key]?.length || 0;
    if (len > max) max = len;
  }
  return max;
}

export const UNKNOWN = 'Unknown';

/**
 * @param assumedWeeks duration applied when a PoV has no end date
 */
export function buildRecords(data, config, assumedWeeks) {
  if (!data || !config?.startDate || !config?.povName) return [];

  const col = (name) => (config[name] ? data[config[name]] : null);
  const at = (arr, i) => (arr ? arr[i] : null);

  const names = col('povName');
  const starts = col('startDate');
  const ends = col('endDate');
  const primary = col('primarySE');
  const secondary = col('secondarySE');
  const hidden = col('hidden');

  const weeks = Number.isFinite(assumedWeeks) && assumedWeeks > 0 ? assumedWeeks : 2;
  const rows = rowCountOf(data);
  const out = [];

  for (let i = 0; i < rows; i++) {
    if (hidden && asBool(at(hidden, i))) continue;

    const startDay = parseDay(at(starts, i));
    if (startDay === null) continue;

    const realEnd = parseDay(at(ends, i));
    const assumedEnd = realEnd === null;
    // The team's own convention: a "2 week" PoV runs start + 14 days.
    const endDay = assumedEnd ? startDay + weeks * 7 : Math.max(realEnd, startDay);

    const name = asText(at(names, i)) || '(unnamed PoV)';

    out.push({
      id: `pov-${i}`,
      name,
      paused: /^\s*paused\b/i.test(name),
      startDay,
      endDay,
      assumedEnd,
      primarySE: asText(at(primary, i)) || UNKNOWN,
      secondarySE: asText(at(secondary, i)),
      primarySEAvatar: asText(at(col('primarySEAvatar'), i)),
      secondarySEAvatar: asText(at(col('secondarySEAvatar'), i)),
      primarySEEmail: asText(at(col('primarySEEmail'), i)),
      status: asText(at(col('status'), i)),
      heatCheck: asText(at(col('heatCheck'), i)),
      stage: asText(at(col('stage'), i)),
      geo: asText(at(col('geo'), i)),
      segment: asText(at(col('segment'), i)),
      description: asText(at(col('description'), i)),
      techRisk: asBool(at(col('techRisk'), i)),
      acv: typeof at(col('acv'), i) === 'number' ? at(col('acv'), i) : null,
      rowIndex: i,
    });
  }

  return out;
}

/** Raw value of an arbitrary curated column, for the color-by dropdown. */
export function valueForColumn(data, columnId, rowIndex) {
  const arr = data?.[columnId];
  if (!arr) return null;
  return arr[rowIndex];
}

export function colorKeyFor(data, columnId, record) {
  if (!columnId) return UNKNOWN;
  const raw = valueForColumn(data, columnId, record.rowIndex);
  if (raw === null || raw === undefined || String(raw).trim() === '') return UNKNOWN;
  if (raw === true) return 'True';
  if (raw === false) return 'False';
  return String(raw).trim();
}
