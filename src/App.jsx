import { useMemo, useRef, useState } from 'react';
import {
  client, useConfig, useElementData, useElementColumns, useVariable, useActionTrigger,
} from '@sigmacomputing/plugin';

import { EDITOR_PANEL } from './editorPanel.js';
// Resolves to an empty stub in production builds — see vite.config.js.
import { HAS_FIXTURE, MOCK_CONFIG, MOCK_DATA, MOCK_COLUMNS } from 'dev-fixture';
import { buildRecords, colorKeyFor, UNKNOWN } from './lib/model.js';
import { buildRowsBySE, buildRowsByPov, domainOf } from './lib/layout.js';
import { createColorAssigner } from './lib/colors.js';
import Toolbar from './components/Toolbar.jsx';
import Legend from './components/Legend.jsx';
import TimelineView from './components/TimelineView.jsx';
import CalendarView from './components/CalendarView.jsx';
import Tooltip from './components/Tooltip.jsx';
import './styles.css';

try {
  client.config.configureEditorPanel(EDITOR_PANEL);
} catch {
  // Outside a Sigma iframe there is no host to configure.
}

const DEFAULT_WEEKS = 2;

const IN_SIGMA = typeof window !== 'undefined' && window.parent !== window;
// Sample data only stands in when running standalone AND the fixture was built in.
const USE_FIXTURE = !IN_SIGMA && HAS_FIXTURE;

/** Variable values arrive as bare primitives or wrapped a couple of levels deep. */
function unwrapVariable(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') {
    if (value.value !== undefined) return unwrapVariable(value.value);
    if (value.defaultValue !== undefined) return unwrapVariable(value.defaultValue);
    return null;
  }
  return value;
}

function toList(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
}

export default function App() {
  const sigmaConfig = useConfig();
  const config = USE_FIXTURE ? MOCK_CONFIG : sigmaConfig;

  const sigmaData = useElementData(config?.source || '');
  const sigmaColumns = useElementColumns(config?.source || '');
  const data = USE_FIXTURE ? MOCK_DATA : sigmaData;
  const columns = USE_FIXTURE ? MOCK_COLUMNS : sigmaColumns;

  const [rawWeeks] = useVariable(config?.assumedWeeks || '');
  const [, setSelectedPov] = useVariable(config?.selectedPov || '');
  const triggerSelect = useActionTrigger(config?.onPovSelect || '');

  const weeksValue = Number(unwrapVariable(rawWeeks));
  const weeksAreBound = Number.isFinite(weeksValue) && weeksValue > 0;
  const assumedWeeks = weeksAreBound ? weeksValue : DEFAULT_WEEKS;

  const [view, setView] = useState('timeline');
  const [rowMode, setRowMode] = useState('se');
  const [colorByState, setColorByState] = useState(null);
  const [isolated, setIsolated] = useState(() => new Set());
  const [hover, setHover] = useState(null);

  const assignerRef = useRef(null);
  if (!assignerRef.current) assignerRef.current = createColorAssigner();

  const records = useMemo(
    () => buildRecords(data, config, assumedWeeks),
    [data, config, assumedWeeks],
  );

  const colorOptions = useMemo(() => toList(config?.colorByColumns).map((id) => ({
    id,
    name: columns?.[id]?.name || id,
  })), [config?.colorByColumns, columns]);

  // Heat Check is the intended default; fall back to whatever was curated first.
  const colorBy = useMemo(() => {
    if (colorByState && colorOptions.some((o) => o.id === colorByState)) return colorByState;
    const heat = colorOptions.find((o) => /heat/i.test(o.name));
    return heat?.id || colorOptions[0]?.id || null;
  }, [colorByState, colorOptions]);

  const keyOf = useMemo(
    () => (record) => colorKeyFor(data, colorBy, record),
    [data, colorBy],
  );

  const legendEntries = useMemo(() => {
    if (!colorBy || !records.length) return [];
    const values = records.map(keyOf);
    assignerRef.current.prime(colorBy, values);
    const distinct = [...new Set(values)].sort((a, b) => {
      if (a === UNKNOWN) return 1;
      if (b === UNKNOWN) return -1;
      return String(a).localeCompare(String(b));
    });
    return distinct.map((value) => ({
      value,
      slot: assignerRef.current.slotFor(colorBy, value),
    }));
  }, [colorBy, records, keyOf]);

  const assigner = useMemo(() => ({
    keyOf,
    slotFor: (columnId, value) => assignerRef.current.slotFor(columnId, value),
  }), [keyOf]);

  const domain = useMemo(() => domainOf(records), [records]);

  const rows = useMemo(() => (
    rowMode === 'se' ? buildRowsBySE(records) : buildRowsByPov(records)
  ), [records, rowMode]);

  const onHover = (record, x, y) => setHover(record ? { record, x, y } : null);

  // Switching view/grouping/coloring unmounts the hovered bar, so drop the
  // tooltip with it rather than leaving it stranded.
  const changeView = (next) => { setHover(null); setView(next); };
  const changeRowMode = (next) => { setHover(null); setRowMode(next); };
  const changeColorBy = (next) => { setHover(null); setColorByState(next); };

  const onSelect = async (record) => {
    if (!config?.selectedPov) return;
    try {
      await setSelectedPov(String(record.name));
      if (triggerSelect) await triggerSelect();
    } catch {
      // A misconfigured binding should not break the view.
    }
  };

  const toggleIsolate = (value) => setIsolated((current) => {
    const next = new Set(current);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  });

  const missing = [];
  if (config?.source) {
    if (!config.povName) missing.push('PoV Name');
    if (!config.primarySE) missing.push('Primary SE');
    if (!config.startDate) missing.push('Start Date');
  }

  let body;
  if (!config?.source) {
    body = (
      <div className="state"><div className="state-inner">
        <h2>Pick a data source</h2>
        <p>Select the element holding your PoV rows in the panel on the right.</p>
      </div></div>
    );
  } else if (missing.length) {
    body = (
      <div className="state"><div className="state-inner">
        <h2>A few more fields</h2>
        <p>Map these columns to finish setup:</p>
        <ul>{missing.map((field) => <li key={field}>{field}</li>)}</ul>
      </div></div>
    );
  } else if (!records.length || !domain) {
    body = (
      <div className="state"><div className="state-inner">
        <h2>No PoVs to show</h2>
        <p>Every row is filtered out, hidden, or missing a start date.</p>
      </div></div>
    );
  } else if (view === 'timeline') {
    body = (
      <TimelineView
        rows={rows}
        records={records}
        domain={domain}
        rowMode={rowMode}
        colorBy={colorBy}
        assigner={assigner}
        isolated={isolated}
        onHover={onHover}
        onSelect={onSelect}
      />
    );
  } else {
    body = (
      <CalendarView
        records={records}
        domain={domain}
        colorBy={colorBy}
        assigner={assigner}
        isolated={isolated}
        onHover={onHover}
        onSelect={onSelect}
      />
    );
  }

  const configured = config?.source && !missing.length && records.length > 0;

  return (
    <div className="pov-root">
      {USE_FIXTURE && <div className="dev-banner">DEV PREVIEW — sample data, not connected to Sigma</div>}

      {config?.source && (
        <Toolbar
          view={view}
          onView={changeView}
          rowMode={rowMode}
          onRowMode={changeRowMode}
          colorOptions={colorOptions}
          colorBy={colorBy}
          onColorBy={changeColorBy}
          assumedWeeks={assumedWeeks}
          weeksAreBound={weeksAreBound}
          povCount={records.length}
        />
      )}

      {configured && (
        <Legend
          entries={legendEntries}
          isolated={isolated}
          onToggle={toggleIsolate}
          onClear={() => setIsolated(new Set())}
        />
      )}

      {body}

      {hover && (
        <Tooltip
          record={hover.record}
          x={hover.x}
          y={hover.y}
          acvColumnInfo={columns?.[config?.acv]}
        />
      )}
    </div>
  );
}
