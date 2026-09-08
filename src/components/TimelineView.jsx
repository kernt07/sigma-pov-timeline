import { useEffect, useRef, useState } from 'react';
import {
  eachMonthStart, eachWeekStart, monthShort, dayOfMonth, todayDay, formatDay, startOfWeek,
} from '../lib/dates.js';
import { cssColor, cssInk } from '../lib/colors.js';
import { concurrencyByWeek, maxCount } from '../lib/layout.js';
import { formatAcvShort } from '../lib/format.js';

const LANE_STEP = 26;
const LANE_PAD = 4;
const CONC_HEIGHT = 58;
const CONC_LABEL_SPACE = 16;

function Avatar({ url, name }) {
  if (url) return <img className="tl-avatar" src={url} alt="" />;
  const initials = (name || '?')
    .split(/\s+/).slice(0, 2).map((part) => part[0] || '').join('').toUpperCase();
  return <span className="tl-avatar-fallback" aria-hidden="true">{initials}</span>;
}

export default function TimelineView({
  rows, records, domain, rowMode, colorBy, assigner,
  isolated, onHover, onSelect,
}) {
  const scrollRef = useRef(null);
  const [plotWidth, setPlotWidth] = useState(0);
  const gutter = rowMode === 'pov' ? 260 : 190;

  // Sigma sizes the iframe after first paint, so measure on resize rather than
  // once on mount — the tick density below depends on it.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const measure = () => setPlotWidth(Math.max(0, el.clientWidth - gutter - 1));
    measure();
    if (!window.ResizeObserver) {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [gutter]);

  const { t0, t1, totalDays } = domain;
  const pct = (day) => ((day - t0) / totalDays) * 100;
  const spanPct = (from, to) => ((to - from + 1) / totalDays) * 100;

  const weeks = eachWeekStart(t0, t1);
  const dayPx = plotWidth > 0 ? plotWidth / totalDays : 0;

  // The domain starts mid-week, so the first month boundary usually sits before
  // it — pin that label to the left edge instead of letting it render off-plot,
  // and drop it when the partial month is too narrow to hold a label.
  const monthStarts = eachMonthStart(t0, t1);
  const months = monthStarts.map((month, index) => {
    const leading = month < t0;
    const nextBoundary = monthStarts[index + 1] ?? t1 + 1;
    const roomPx = dayPx > 0 ? (nextBoundary - Math.max(month, t0)) * dayPx : Infinity;
    return {
      month,
      pos: Math.max(month, t0),
      leading,
      showLabel: !leading || roomPx >= 30,
    };
  });
  const buckets = concurrencyByWeek(records, domain);
  const peak = maxCount(buckets);
  const today = todayDay();
  const showToday = today >= t0 && today <= t1;
  const weekPx = weeks.length > 0 && plotWidth > 0 ? plotWidth / weeks.length : 0;
  const showWeekLabels = weekPx >= 30;

  const gridlines = (
    <div className="tl-grid" aria-hidden="true">
      {weeks.map((week) => (
        <div key={`w${week}`} className="tl-grid-week" style={{ left: `${pct(week)}%` }} />
      ))}
      {months.filter((m) => !m.leading).map(({ month }) => (
        <div key={`m${month}`} className="tl-grid-month" style={{ left: `${pct(month)}%` }} />
      ))}
    </div>
  );

  const todayLine = showToday
    ? <div className="tl-today" style={{ left: `${pct(today)}%` }} aria-hidden="true" />
    : null;

  const barLabel = (item) => {
    const { record, role } = item;
    if (rowMode === 'pov') {
      const key = assigner.keyOf(record);
      const acv = formatAcvShort(record.acv);
      return [key === 'Unknown' ? null : key, acv].filter(Boolean).join(' · ');
    }
    return role === 'secondary' ? `2nd · ${record.name}` : record.name;
  };

  return (
    <div className="view-body" ref={scrollRef} style={{ '--gutter': `${gutter}px` }}>
      <div className="tl-head">
        <div className="tl-row">
          <div className="tl-gutter">
            <div className="tl-gutter-title">Concurrent PoVs</div>
            <div className="tl-gutter-sub tl-conc-axis">peak {peak} · by week</div>
          </div>
          <div className="tl-plot tl-concurrency" style={{ height: CONC_HEIGHT }}>
            {gridlines}
            {buckets.map((bucket) => {
              if (bucket.count === 0) return null;
              const height = (bucket.count / peak) * (CONC_HEIGHT - CONC_LABEL_SPACE);
              return (
                <div
                  key={bucket.weekStart}
                  className={`tl-conc-bar${bucket.count === peak ? ' is-peak' : ''}`}
                  style={{
                    left: `calc(${pct(bucket.weekStart)}% + 1px)`,
                    width: `calc(${spanPct(bucket.weekStart, bucket.weekEnd)}% - 2px)`,
                    height,
                  }}
                  title={`Week of ${formatDay(bucket.weekStart)}: ${bucket.count} PoVs in flight`}
                />
              );
            })}
            {buckets.filter((bucket) => bucket.count === peak && peak > 0).map((bucket) => (
              <div
                key={`label${bucket.weekStart}`}
                className="tl-conc-label"
                style={{
                  left: `${pct(bucket.weekStart) + spanPct(bucket.weekStart, bucket.weekEnd) / 2}%`,
                  bottom: (bucket.count / peak) * (CONC_HEIGHT - CONC_LABEL_SPACE),
                }}
              >
                {bucket.count}
              </div>
            ))}
            {todayLine}
          </div>
        </div>

        <div className="tl-row">
          <div className="tl-gutter" />
          <div className="tl-plot tl-axis">
            {months.filter((m) => m.showLabel).map(({ month, pos, leading }) => (
              <div
                key={month}
                className={`tl-month${leading ? ' is-leading' : ''}`}
                style={{ left: `${pct(pos)}%` }}
              >
                {monthShort(month)}
              </div>
            ))}
            {weeks.map((week) => {
              // The Today pill takes this week's slot, so skip its number.
              const pillWeek = showToday && week === startOfWeek(today);
              return (
                <div key={`t${week}`}>
                  <div className="tl-week-tick" style={{ left: `${pct(week)}%` }} />
                  {showWeekLabels && !pillWeek && (
                    <span className="tl-week-label" style={{ left: `${pct(week)}%` }}>
                      {dayOfMonth(week)}
                    </span>
                  )}
                </div>
              );
            })}
            {showToday && (
              <div className="tl-today-pill" style={{ left: `${pct(today)}%` }}>Today</div>
            )}
          </div>
        </div>
      </div>

      {rows.map((row) => (
        <div key={row.id} className="tl-row tl-lane-row">
          <div className="tl-gutter">
            <div className="tl-gutter-person">
              <Avatar url={row.avatar} name={row.label} />
              <span className="tl-person-text">
                <span className="tl-person-name" title={row.label}>{row.label}</span>
                <span className="tl-person-sub" title={row.sublabel}>{row.sublabel}</span>
              </span>
            </div>
          </div>
          <div
            className="tl-plot"
            style={{ height: row.laneCount * LANE_STEP + LANE_PAD * 2 }}
          >
            {gridlines}
            {todayLine}
            {row.items.map((item) => {
              const key = assigner.keyOf(item.record);
              const dimmed = isolated.size > 0 && !isolated.has(key);
              return (
                <button
                  type="button"
                  key={item.key}
                  className={[
                    'tl-bar',
                    item.record.assumedEnd ? 'is-assumed' : '',
                    item.record.paused ? 'is-paused' : '',
                    dimmed ? 'is-dimmed' : '',
                  ].filter(Boolean).join(' ')}
                  style={{
                    left: `${pct(item.startDay)}%`,
                    width: `${spanPct(item.startDay, item.endDay)}%`,
                    top: item.lane * LANE_STEP + LANE_PAD,
                    background: cssColor(assigner.slotFor(colorBy, key)),
                    color: cssInk(assigner.slotFor(colorBy, key)),
                  }}
                  onMouseEnter={(e) => onHover(item.record, e.clientX, e.clientY)}
                  onMouseMove={(e) => onHover(item.record, e.clientX, e.clientY)}
                  onMouseLeave={() => onHover(null)}
                  onFocus={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    onHover(item.record, rect.left, rect.bottom);
                  }}
                  onBlur={() => onHover(null)}
                  onClick={() => onSelect(item.record)}
                >
                  <span className="tl-bar-label">{barLabel(item)}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
