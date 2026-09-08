// Local-dev fixture — safe to commit. Every company, person, and figure here is
// invented. It deliberately mirrors the SHAPE of the real "PoV SignUp" export so
// each code path gets exercised:
//   - rows with no end date        -> assumed-duration path
//   - a "PAUSED - " name prefix    -> paused styling (kept separate from the
//                                     hidden row, so both are actually visible)
//   - one Hidden = true row        -> exclusion filter (18 rows -> 17 shown)
//   - two rows with a Secondary SE -> the same PoV appearing in two swimlanes
//   - blank Heat Check on some     -> the "Unknown" legend bucket
//   - one long multi-month PoV     -> wide-bar and multi-week banner rendering
//
// Production builds swap this module for devMock.stub.js via the `dev-fixture`
// alias in vite.config.js. Import it as `dev-fixture`, never by relative path.

// Marker used by the build's leak check — see vite.config.js.
export const FIXTURE_MARKER = 'POV_TIMELINE_DEV_FIXTURE';

// Inline avatar so one row exercises the <img> branch without a network call;
// the rest are blank and fall back to rendered initials.
const AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='16' fill='%232a78d6'/%3E%3Ccircle cx='16' cy='12' r='5' fill='%23ffffff'/%3E%3Cpath d='M4 32a12 12 0 0 1 24 0z' fill='%23ffffff'/%3E%3C/svg%3E";

const S2 = '2 - Discovery';
const S3 = '3 - Establish Success Criteria';
const S4 = '4 - Solution Evaluation';

const PAUSED_NOTE = [
  '‼️ this POV is paused while we wait on scope re-alignment and exec sponsor sign-off ‼️',
  'The POV represented here sits outside the self-hosting requirement.',
  'The account will connect a standard SaaS deployment to an isolated warehouse project to test embedding features (user attributes, teams, integrations).',
].join('\n');

// name, SE, avatar, description, end, start, heat, status, risk, secSE, secAvatar, hidden, acv, stage, geo, segment
const ROWS = [
  ['Northwind Retail New Business POV', 'Ada Whitfield', '', '', '2026-10-15', '2026-10-01', 'Neutral 😐', 'Not Started', false, '', '', false, 75000, S3, 'EMEA', 'CAE'],
  ['Contoso Health New Business POV', 'Bruno Castellanos', '', '', null, '2026-10-05', 'Neutral 😐', 'Not Started', true, '', '', false, 300000, S3, 'EMEA', 'RSM'],
  ['Meridian Energy New Business POV', 'Chen Lian', AVATAR, '', null, '2026-08-17', 'Neutral 😐', 'Not Started', false, '', '', false, 250000, S2, 'EMEA', 'RSM'],
  ['PAUSED - Ravenna Software New Business POV', "Dara O'Connell", '', PAUSED_NOTE, '2026-10-09', '2026-04-12', 'Neutral 😐', 'In Progress', true, '', '', false, 250000, S3, 'EMEA', 'CAE'],
  ['Halcyon Insurance New Business POV', "Dara O'Connell", '', '', '2026-10-11', '2026-09-20', '', 'Not Started', false, '', '', false, 150000, S3, 'EMEA', 'CAE'],
  ['Ardent Financial New Business POV', 'Chen Lian', AVATAR, '', null, '2026-07-27', 'Bad 🧊', 'Not Started', false, '', '', false, 150000, S2, 'EMEA', 'RSM'],
  ['Blue Harbor Travel New Business POV', 'Gus Lindqvist', '', '', null, '2026-11-01', 'Bad 🧊', 'Not Started', false, '', '', false, 100000, S3, 'EMEA', 'RSM'],
  ['Aurora Publishing New Business POV', 'Ada Whitfield', '', '', '2026-12-15', '2026-12-01', 'Neutral 😐', 'Not Started', false, '', '', false, 200000, S3, 'EMEA', 'CAE'],
  ['Cobalt Logistics New Business POV', 'Bruno Castellanos', '', '', null, '2026-10-01', '', 'Not Started', false, '', '', true, 125000, S3, 'EMEA', 'RSM'],
  ['Lumen Telecom New Business POV', 'Chen Lian', AVATAR, '', null, '2026-08-10', 'Neutral 😐', 'Not Started', false, 'Gus Lindqvist', '', false, 170000, S3, 'EMEA', 'RSM'],
  ['Vertex Biotech New Business POV', 'Farida Haddad', '', '', '2026-09-29', '2026-09-15', 'Good 🔥', 'Not Started', false, '', '', false, 90000, S4, 'EMEA', 'CAE'],
  ['Solstice Media Embed POV', 'Chen Lian', AVATAR, '', null, '2026-07-27', 'Bad 🧊', 'Not Started', false, '', '', false, 150000, S3, 'EMEA', 'RSM'],
  ['Kestrel Networks New Business POV', 'Emil Novák', '', '', null, '2026-07-06', '', 'Not Started', false, '', '', false, 60000, S2, 'EMEA', 'CAE'],
  ['Sable Automotive New Business POV', 'Ada Whitfield', '', '', '2026-09-29', '2026-09-15', 'Neutral 😐', 'Not Started', false, 'Farida Haddad', '', false, 200000, S3, 'EMEA', 'CAE'],
  ['Tidewater Utilities New Business POV', 'Chen Lian', AVATAR, 'Standard POV: dashboards plus one potential app. The app is still under discussion (possibly churn modelling).', null, '2026-07-01', 'Bad 🧊', 'In Progress', false, '', '', false, 100000, S4, 'EMEA', 'RSM'],
  ['Pinegrove Events New Business POV', 'Ada Whitfield', '', '', '2026-09-07', '2026-08-24', 'Neutral 😐', 'Not Started', false, '', '', false, 20000, S3, 'EMEA', 'CAE'],
  ['Granite Infrastructure New Business POV', 'Emil Novák', '', '', null, '2026-07-06', '', 'Not Started', false, '', '', false, 60000, S2, 'EMEA', 'CAE'],
  ['Ironwood Manufacturing New Business POV', "Dara O'Connell", '', 'Long POV due to holidays in the team', '2026-09-11', '2026-07-21', 'Neutral 😐', 'In Progress', false, '', '', false, 45000, S4, 'EMEA', 'CAE'],
];

const FIELDS = [
  'c-name', 'c-se', 'c-avatar', 'c-desc', 'c-end', 'c-start', 'c-heat', 'c-status',
  'c-risk', 'c-sec-se', 'c-sec-avatar', 'c-hidden', 'c-acv', 'c-stage', 'c-geo', 'c-segment',
];

export const MOCK_DATA = FIELDS.reduce((acc, field, col) => {
  acc[field] = ROWS.map((row) => row[col]);
  return acc;
}, {});

export const MOCK_COLUMNS = {
  'c-name': { id: 'c-name', name: 'Pov Name', columnType: 'text' },
  'c-se': { id: 'c-se', name: 'Sales Engineer', columnType: 'text' },
  'c-avatar': { id: 'c-avatar', name: 'Owner Image URL', columnType: 'text' },
  'c-desc': { id: 'c-desc', name: 'Pov Description', columnType: 'text' },
  'c-end': { id: 'c-end', name: 'Active Pov End Date', columnType: 'datetime' },
  'c-start': { id: 'c-start', name: 'Active Pov Start Date', columnType: 'datetime' },
  'c-heat': { id: 'c-heat', name: 'Heat Check', columnType: 'text' },
  'c-status': { id: 'c-status', name: 'Pov Status', columnType: 'text' },
  'c-risk': { id: 'c-risk', name: 'Pov Tech Risk', columnType: 'boolean' },
  'c-sec-se': { id: 'c-sec-se', name: 'Secondary SE', columnType: 'text' },
  'c-sec-avatar': { id: 'c-sec-avatar', name: 'Secondary User Image URL', columnType: 'text' },
  'c-hidden': { id: 'c-hidden', name: 'Hidden', columnType: 'boolean' },
  'c-acv': { id: 'c-acv', name: 'Opportunity Acv Amount', columnType: 'number', format: { type: 'currency', format: '$,.0f' } },
  'c-stage': { id: 'c-stage', name: 'Opp History Stage Name', columnType: 'text' },
  'c-geo': { id: 'c-geo', name: 'Opportunity Sales Geo', columnType: 'text' },
  'c-segment': { id: 'c-segment', name: 'Opportunity Sales Segment', columnType: 'text' },
};

export const MOCK_CONFIG = {
  source: 'mock-element',
  povName: 'c-name',
  primarySE: 'c-se',
  startDate: 'c-start',
  endDate: 'c-end',
  secondarySE: 'c-sec-se',
  heatCheck: 'c-heat',
  status: 'c-status',
  stage: 'c-stage',
  geo: 'c-geo',
  segment: 'c-segment',
  acv: 'c-acv',
  techRisk: 'c-risk',
  hidden: 'c-hidden',
  description: 'c-desc',
  primarySEAvatar: 'c-avatar',
  secondarySEAvatar: 'c-sec-avatar',
  colorByColumns: ['c-heat', 'c-status', 'c-stage', 'c-segment', 'c-se'],
};

export const HAS_FIXTURE = true;
