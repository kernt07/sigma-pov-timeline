import { startOfWeek, eachWeekStart } from './dates.js';

const overlaps = (aStart, aEnd, bStart, bEnd) => aStart <= bEnd && bStart <= aEnd;

/**
 * Greedy interval packing — the same approach calendar apps use. Items that
 * overlap in time get stacked into separate sub-lanes instead of sharing pixels.
 */
export function packLanes(items) {
  const sorted = [...items].sort((a, b) =>
    a.startDay - b.startDay || a.endDay - b.endDay || a.label.localeCompare(b.label));
  const laneEnds = [];

  for (const item of sorted) {
    let lane = laneEnds.findIndex((end) => end < item.startDay);
    if (lane === -1) {
      lane = laneEnds.length;
      laneEnds.push(item.endDay);
    } else {
      laneEnds[lane] = item.endDay;
    }
    item.lane = lane;
  }

  return { items: sorted, laneCount: Math.max(1, laneEnds.length) };
}

/** One swimlane per SE. A PoV with a secondary SE appears in both people's rows. */
export function buildRowsBySE(records) {
  const groups = new Map();

  const add = (se, record, role) => {
    const key = se || 'Unknown';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({
      key: `${record.id}-${role}`,
      record,
      role,
      label: record.name,
      startDay: record.startDay,
      endDay: record.endDay,
    });
  };

  for (const record of records) {
    add(record.primarySE, record, 'primary');
    if (record.secondarySE) add(record.secondarySE, record, 'secondary');
  }

  // Busiest SEs first — the point of this view is spotting who is overloaded.
  return [...groups.entries()]
    .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0]))
    .map(([se, items]) => {
      const packed = packLanes(items);
      const avatar = items.find((i) => i.role === 'primary')?.record.primarySEAvatar
        || items.find((i) => i.role === 'secondary')?.record.secondarySEAvatar
        || '';
      return {
        id: `se-${se}`,
        label: se,
        sublabel: `${items.length} PoV${items.length === 1 ? '' : 's'}`,
        avatar,
        items: packed.items,
        laneCount: packed.laneCount,
      };
    });
}

/** One row per PoV — nothing ever overlaps horizontally. */
export function buildRowsByPov(records) {
  return [...records]
    .sort((a, b) => a.startDay - b.startDay || a.name.localeCompare(b.name))
    .map((record) => ({
      id: `pov-row-${record.id}`,
      label: record.name,
      sublabel: record.secondarySE
        ? `${record.primarySE} + ${record.secondarySE}`
        : record.primarySE,
      avatar: record.primarySEAvatar,
      laneCount: 1,
      items: [{
        key: `${record.id}-only`,
        record,
        role: 'primary',
        label: record.name,
        startDay: record.startDay,
        endDay: record.endDay,
        lane: 0,
      }],
    }));
}

export function domainOf(records) {
  if (!records.length) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const r of records) {
    if (r.startDay < min) min = r.startDay;
    if (r.endDay > max) max = r.endDay;
  }
  const t0 = startOfWeek(min);
  const t1 = startOfWeek(max) + 6; // whole weeks, so concurrency cells align with bars
  return { t0, t1, totalDays: t1 - t0 + 1 };
}

/** Weekly count of distinct POVs in flight — the team-wide overlap signal. */
export function concurrencyByWeek(records, domain) {
  if (!domain) return [];
  return eachWeekStart(domain.t0, domain.t1).map((weekStart) => {
    const weekEnd = weekStart + 6;
    const active = records.filter((r) => overlaps(r.startDay, r.endDay, weekStart, weekEnd));
    return {
      weekStart,
      weekEnd,
      count: active.length,
      records: active,
    };
  });
}

export function maxCount(buckets) {
  return buckets.reduce((m, b) => Math.max(m, b.count), 0);
}
