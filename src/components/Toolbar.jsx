export default function Toolbar({
  view, onView, rowMode, onRowMode,
  colorOptions, colorBy, onColorBy,
  assumedWeeks, weeksAreBound, povCount,
}) {
  return (
    <div className="toolbar">
      <div className="segmented" role="group" aria-label="View">
        <button type="button" aria-pressed={view === 'timeline'} onClick={() => onView('timeline')}>
          Timeline
        </button>
        <button type="button" aria-pressed={view === 'calendar'} onClick={() => onView('calendar')}>
          Calendar
        </button>
      </div>

      {view === 'timeline' && (
        <div className="field">
          <span className="toolbar-label">Rows</span>
          <div className="segmented" role="group" aria-label="Row grouping">
            <button type="button" aria-pressed={rowMode === 'se'} onClick={() => onRowMode('se')}>
              One per SE
            </button>
            <button type="button" aria-pressed={rowMode === 'pov'} onClick={() => onRowMode('pov')}>
              One per PoV
            </button>
          </div>
        </div>
      )}

      {colorOptions.length > 0 && (
        <label className="field">
          <span className="toolbar-label">Color by</span>
          <select value={colorBy || ''} onChange={(e) => onColorBy(e.target.value)}>
            {colorOptions.map((option) => (
              <option key={option.id} value={option.id}>{option.name}</option>
            ))}
          </select>
        </label>
      )}

      <div className="toolbar-spacer" />

      <span className="duration-note">
        {povCount} PoVs · assumed duration {assumedWeeks} {assumedWeeks === 1 ? 'week' : 'weeks'}
        {!weeksAreBound && ' (default)'}
      </span>
    </div>
  );
}
