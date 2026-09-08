import { useMemo, useState } from 'react';
import {
  startOfMonth, startOfWeek, addMonths, daysInMonth, monthLabel,
  dayOfMonth, todayDay, formatDay,
} from '../lib/dates.js';
import { cssColor, cssInk } from '../lib/colors.js';
import { packLanes } from '../lib/layout.js';
import { pluralize } from '../lib/format.js';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const BANNER_STEP = 21;
const DAYNUM_SPACE = 20;
const MAX_LANES = 3;
const OVERFLOW_SPACE = 15;

const activeOn = (record, day) => record.startDay <= day && record.endDay >= day;

export default function CalendarView({
  records, domain, colorBy, assigner, isolated, onHover, onSelect,
}) {
  const today = todayDay();
  const [month, setMonth] = useState(() => {
    if (domain && (today < domain.t0 || today > domain.t1)) return startOfMonth(domain.t0);
    return startOfMonth(today);
  });
  const [dayPop, setDayPop] = useState(null);

  const monthStart = month;
  const monthEnd = monthStart + daysInMonth(monthStart) - 1;

  const weeks = useMemo(() => {
    const first = startOfWeek(monthStart);
    const out = [];
    for (let weekStart = first; weekStart <= monthEnd; weekStart += 7) {
      const weekEnd = weekStart + 6;
      const inWeek = records.filter((r) => r.startDay <= weekEnd && r.endDay >= weekStart);

      const packed = packLanes(inWeek.map((record) => ({
        key: record.id,
        record,
        label: record.name,
        startDay: Math.max(record.startDay, weekStart),
        endDay: Math.min(record.endDay, weekEnd),
      })));

      const visible = packed.items.filter((item) => item.lane < MAX_LANES);
      const hiddenItems = packed.items.filter((item) => item.lane >= MAX_LANES);

      const overflow = [];
      for (let col = 0; col < 7; col++) {
        const day = weekStart + col;
        const count = hiddenItems.filter((item) => activeOn(item.record, day)).length;
        if (count > 0) overflow.push({ col, day, count });
      }

      const laneCount = Math.min(packed.laneCount, MAX_LANES);
      const bannerHeight = laneCount * BANNER_STEP + (overflow.length ? OVERFLOW_SPACE : 0);

      out.push({ weekStart, weekEnd, visible, overflow, bannerHeight });
    }
    return out;
  }, [records, monthStart, monthEnd]);

  const openDay = (day, event) => {
    const active = records.filter((r) => activeOn(r, day));
    const rect = event.currentTarget.getBoundingClientRect();
    setDayPop({ day, records: active, x: rect.left, y: rect.bottom + 4 });
  };

  return (
    <>
      <div className="cal-head">
        <button type="button" className="cal-nav" onClick={() => setMonth(addMonths(month, -1))} aria-label="Previous month">‹</button>
        <button type="button" className="cal-nav" onClick={() => setMonth(addMonths(month, 1))} aria-label="Next month">›</button>
        <span className="cal-title">{monthLabel(month, true)}</span>
        <button type="button" className="cal-today-btn" onClick={() => setMonth(startOfMonth(today))}>Today</button>
      </div>

      <div className="cal-weekdays" aria-hidden="true">
        {WEEKDAYS.map((day) => <div key={day} className="cal-weekday">{day}</div>)}
      </div>

      <div className="view-body">
        <div className="cal-grid">
          {weeks.map((week) => (
            <div key={week.weekStart} className="cal-week">
              <div className="cal-daycells">
                {Array.from({ length: 7 }, (_, col) => {
                  const day = week.weekStart + col;
                  const outside = day < monthStart || day > monthEnd;
                  return (
                    <div
                      key={day}
                      className={[
                        'cal-daycell',
                        outside ? 'is-outside' : '',
                        day === today ? 'is-today' : '',
                      ].filter(Boolean).join(' ')}
                      style={{ minHeight: DAYNUM_SPACE + week.bannerHeight + 4 }}
                    >
                      <span className="cal-daynum">{dayOfMonth(day)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="cal-banners" style={{ position: 'absolute', top: DAYNUM_SPACE, left: 0, right: 0 }}>
                {week.visible.map((item) => {
                  const startCol = item.startDay - week.weekStart;
                  const span = item.endDay - item.startDay + 1;
                  const key = assigner.keyOf(item.record);
                  const dimmed = isolated.size > 0 && !isolated.has(key);
                  return (
                    <button
                      type="button"
                      key={`${item.key}-${week.weekStart}`}
                      className={[
                        'cal-banner',
                        item.record.assumedEnd ? 'is-assumed' : '',
                        item.record.paused ? 'is-paused' : '',
                        dimmed ? 'is-dimmed' : '',
                        item.record.startDay < item.startDay ? 'clip-start' : '',
                        item.record.endDay > item.endDay ? 'clip-end' : '',
                      ].filter(Boolean).join(' ')}
                      style={{
                        left: `calc(${(startCol / 7) * 100}% + 2px)`,
                        width: `calc(${(span / 7) * 100}% - 4px)`,
                        top: item.lane * BANNER_STEP,
                        background: cssColor(assigner.slotFor(colorBy, key)),
                        color: cssInk(assigner.slotFor(colorBy, key)),
                      }}
                      onMouseEnter={(e) => onHover(item.record, e.clientX, e.clientY)}
                      onMouseMove={(e) => onHover(item.record, e.clientX, e.clientY)}
                      onMouseLeave={() => onHover(null)}
                      onClick={() => onSelect(item.record)}
                    >
                      <span className="cal-banner-label">{item.record.name}</span>
                    </button>
                  );
                })}

                {week.overflow.map(({ col, day, count }) => (
                  <button
                    type="button"
                    key={`more-${day}`}
                    className="cal-more"
                    style={{
                      left: `calc(${(col / 7) * 100}% + 4px)`,
                      top: MAX_LANES * BANNER_STEP,
                    }}
                    onClick={(e) => openDay(day, e)}
                  >
                    +{count} more
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {dayPop && (
        <div className="day-pop" style={{ left: Math.min(dayPop.x, window.innerWidth - 280), top: dayPop.y }}>
          <button type="button" className="day-pop-close" onClick={() => setDayPop(null)} aria-label="Close">×</button>
          <div className="day-pop-title">
            {formatDay(dayPop.day)}
            <div style={{ fontWeight: 400, color: 'var(--text-muted)', fontSize: 11 }}>
              {pluralize(dayPop.records.length, 'PoV')} in flight
            </div>
          </div>
          {dayPop.records.map((record) => {
            const key = assigner.keyOf(record);
            return (
              <button
                type="button"
                key={record.id}
                className="day-pop-item"
                onClick={() => { onSelect(record); setDayPop(null); }}
              >
                <span
                  className="legend-swatch"
                  style={{ background: cssColor(assigner.slotFor(colorBy, key)) }}
                />
                <span>{record.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </>
  );
}
