// All date math runs on integer "day serials" (days since 1970-01-01, UTC-anchored).
// Sigma hands dates over as ISO strings, epoch numbers, or Date objects, and the
// PoV data spans an October DST boundary — integer serials keep both from mattering.

const MS_PER_DAY = 86400000;

export function partsToDay(y, m, d) {
  return Math.floor(Date.UTC(y, m, d) / MS_PER_DAY);
}

export function parseDay(value) {
  if (value === null || value === undefined || value === '') return null;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return partsToDay(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  }

  if (typeof value === 'number') {
    if (!isFinite(value)) return null;
    const ms = Math.abs(value) < 1e11 ? value * 1000 : value;
    const dt = new Date(ms);
    if (isNaN(dt.getTime())) return null;
    return partsToDay(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
  }

  if (typeof value === 'string') {
    const iso = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (iso) return partsToDay(+iso[1], +iso[2] - 1, +iso[3]);
    const dt = new Date(value);
    if (isNaN(dt.getTime())) return null;
    return partsToDay(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate());
  }

  return null;
}

export function dayToDate(day) {
  return new Date(day * MS_PER_DAY);
}

export function todayDay() {
  const now = new Date();
  return partsToDay(now.getFullYear(), now.getMonth(), now.getDate());
}

// 0 = Monday (EMEA team, weeks read Mon–Sun)
export function weekdayIndex(day) {
  return (dayToDate(day).getUTCDay() + 6) % 7;
}

export function startOfWeek(day) {
  return day - weekdayIndex(day);
}

export function startOfMonth(day) {
  const d = dayToDate(day);
  return partsToDay(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

export function addMonths(day, n) {
  const d = dayToDate(day);
  return partsToDay(d.getUTCFullYear(), d.getUTCMonth() + n, 1);
}

export function daysInMonth(day) {
  const d = dayToDate(day);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

export function formatDay(day) {
  if (day === null || day === undefined) return '—';
  const d = dayToDate(day);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function monthLabel(day, long = false) {
  const d = dayToDate(day);
  const names = long ? MONTHS_LONG : MONTHS;
  return `${names[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function monthShort(day) {
  return MONTHS[dayToDate(day).getUTCMonth()];
}

export function dayOfMonth(day) {
  return dayToDate(day).getUTCDate();
}

export function eachWeekStart(fromDay, toDay) {
  const out = [];
  for (let w = startOfWeek(fromDay); w <= toDay; w += 7) out.push(w);
  return out;
}

export function eachMonthStart(fromDay, toDay) {
  const out = [];
  for (let m = startOfMonth(fromDay); m <= toDay; m = addMonths(m, 1)) out.push(m);
  return out;
}
