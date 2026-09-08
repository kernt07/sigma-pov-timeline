import { useLayoutEffect, useRef, useState } from 'react';
import { formatDay } from '../lib/dates.js';
import { formatNumber } from '../lib/format.js';

function Avatar({ url, name }) {
  if (!url) return null;
  return <img className="tt-avatar" src={url} alt="" title={name} />;
}

export default function Tooltip({ record, x, y, acvColumnInfo }) {
  const ref = useRef(null);
  const [pos, setPos] = useState({ left: x, top: y });

  // Keep the card inside the iframe viewport rather than letting it clip.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 8;
    let left = x + 14;
    let top = y + 14;
    if (left + rect.width + pad > window.innerWidth) left = x - rect.width - 14;
    if (top + rect.height + pad > window.innerHeight) top = y - rect.height - 14;
    setPos({ left: Math.max(pad, left), top: Math.max(pad, top) });
  }, [x, y, record]);

  if (!record) return null;

  const duration = record.endDay - record.startDay;
  const weeks = (duration / 7).toFixed(duration % 7 === 0 ? 0 : 1);

  return (
    <div className="tooltip" ref={ref} style={{ left: pos.left, top: pos.top }} role="tooltip">
      <div className="tt-title">{record.name}</div>

      {(record.assumedEnd || record.paused || record.techRisk) && (
        <div className="tt-flags">
          {record.assumedEnd && <span className="tt-flag is-assumed">Assumed end</span>}
          {record.paused && <span className="tt-flag is-paused">Paused</span>}
          {record.techRisk && <span className="tt-flag is-risk">Tech risk</span>}
        </div>
      )}

      <div className="tt-people">
        <Avatar url={record.primarySEAvatar} name={record.primarySE} />
        <span>{record.primarySE}</span>
        {record.secondarySE && (
          <>
            <span style={{ color: 'var(--text-muted)' }}>+</span>
            <Avatar url={record.secondarySEAvatar} name={record.secondarySE} />
            <span>{record.secondarySE}</span>
          </>
        )}
      </div>

      <div className="tt-grid">
        <span className="tt-key">Dates</span>
        <span className="tt-val">
          {formatDay(record.startDay)} → {formatDay(record.endDay)}
          {record.assumedEnd && <em style={{ color: 'var(--text-muted)' }}> (assumed)</em>}
        </span>

        <span className="tt-key">Duration</span>
        <span className="tt-val">{weeks} weeks</span>

        {record.heatCheck && <><span className="tt-key">Heat check</span><span className="tt-val">{record.heatCheck}</span></>}
        {record.status && <><span className="tt-key">Status</span><span className="tt-val">{record.status}</span></>}
        {record.stage && <><span className="tt-key">Stage</span><span className="tt-val">{record.stage}</span></>}
        {record.acv !== null && <><span className="tt-key">ACV</span><span className="tt-val">{formatNumber(record.acv, acvColumnInfo)}</span></>}
        {record.segment && <><span className="tt-key">Segment</span><span className="tt-val">{record.segment}</span></>}
        {record.geo && <><span className="tt-key">Geo</span><span className="tt-val">{record.geo}</span></>}
      </div>

      {record.description && <div className="tt-desc">{record.description}</div>}
    </div>
  );
}
