// Column entries are deliberately left unconstrained (no allowedTypes) except ACV:
// Sigma hides columns that don't match, and this source has booleans stored as
// text and dates that may arrive as either date or datetime.
export const EDITOR_PANEL = [
  { name: 'source', type: 'element' },

  { name: 'povName', type: 'column', source: 'source', allowMultiple: false, label: 'PoV Name' },
  { name: 'primarySE', type: 'column', source: 'source', allowMultiple: false, label: 'Primary SE' },
  { name: 'startDate', type: 'column', source: 'source', allowMultiple: false, label: 'Start Date' },
  {
    name: 'endDate', type: 'column', source: 'source', allowMultiple: false,
    label: 'End Date (blank = assumed)',
    description: 'Rows with no end date use the assumed-duration control below.',
  },

  { name: 'secondarySE', type: 'column', source: 'source', allowMultiple: false, label: 'Secondary SE' },
  { name: 'heatCheck', type: 'column', source: 'source', allowMultiple: false, label: 'Heat Check' },
  { name: 'status', type: 'column', source: 'source', allowMultiple: false, label: 'PoV Status' },
  { name: 'stage', type: 'column', source: 'source', allowMultiple: false, label: 'Opportunity Stage' },
  { name: 'geo', type: 'column', source: 'source', allowMultiple: false, label: 'Sales Geo' },
  { name: 'segment', type: 'column', source: 'source', allowMultiple: false, label: 'Sales Segment' },
  {
    name: 'acv', type: 'column', source: 'source', allowMultiple: false,
    allowedTypes: ['number', 'integer'], label: 'ACV Amount',
  },
  { name: 'techRisk', type: 'column', source: 'source', allowMultiple: false, label: 'Tech Risk' },
  {
    name: 'hidden', type: 'column', source: 'source', allowMultiple: false,
    label: 'Hidden Flag',
    description: 'Rows where this is true are excluded from the view.',
  },
  { name: 'description', type: 'column', source: 'source', allowMultiple: false, label: 'Description' },
  { name: 'primarySEAvatar', type: 'column', source: 'source', allowMultiple: false, label: 'Primary SE Avatar URL' },
  { name: 'secondarySEAvatar', type: 'column', source: 'source', allowMultiple: false, label: 'Secondary SE Avatar URL' },
  { name: 'primarySEEmail', type: 'column', source: 'source', allowMultiple: false, label: 'Primary SE Email' },

  {
    name: 'colorByColumns', type: 'column', source: 'source', allowMultiple: true,
    label: 'Color-by options',
    description: 'Fields offered in the plugin\'s Color by dropdown, e.g. Heat Check, PoV Status, Stage, Geo, Segment.',
  },

  {
    name: 'assumedWeeks', type: 'variable', allowedTypes: ['number'],
    label: 'Assumed Duration (weeks)',
    description: 'Bind to a number control. Defaults to 2 weeks when unset.',
  },

  {
    name: 'selectedPov', type: 'variable', allowedTypes: ['text'],
    label: 'Selected PoV (output)',
    description: 'Optional. Receives the PoV name when a bar is clicked.',
  },
  { name: 'onPovSelect', type: 'action-trigger', label: 'On PoV Select' },
];
