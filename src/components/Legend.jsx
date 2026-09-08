import { cssColor } from '../lib/colors.js';

/**
 * Identity is never carried by color alone: every value is labelled here, and
 * bars additionally show the PoV name (the relief the palette's light-mode
 * contrast warning requires).
 */
export default function Legend({ entries, isolated, onToggle, onClear }) {
  if (entries.length < 2) return null;
  const hasIsolation = isolated.size > 0;

  return (
    <div className="legend">
      {entries.map(({ value, slot }) => {
        const active = isolated.has(value);
        return (
          <button
            key={value}
            type="button"
            className={`legend-item${hasIsolation && !active ? ' is-dimmed' : ''}`}
            aria-pressed={active}
            onClick={() => onToggle(value)}
          >
            <span className="legend-swatch" style={{ background: cssColor(slot) }} />
            {value}
          </button>
        );
      })}
      {hasIsolation
        ? <button type="button" className="legend-item" onClick={onClear}>Clear</button>
        : <span className="legend-hint">click to isolate</span>}
    </div>
  );
}
