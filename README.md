# Sigma PoV Timeline

A Sigma custom plugin for seeing where a team's proofs of value overlap in time —
who is double-booked, and which weeks are the crunch weeks.

Built for the EMEA SE team's "PoV SignUp" data, but it's driven entirely by column
mappings, so it works with any table that has a name, an owner, and a start date.

- **Live plugin URL:** https://sigma-pov-timeline.netlify.app
- **Netlify project:** `sigma-pov-timeline`

## Views

**Timeline** — a Gantt across a shared date axis, with two row modes:

- *One per SE* — one swimlane per person. PoVs that genuinely overlap for the same
  person pack into stacked sub-lanes rather than sharing pixels. A PoV with a
  secondary SE appears in **both** people's rows, so both commitments show up.
- *One per PoV* — one row per PoV, sorted by start date. Nothing ever overlaps
  horizontally; useful for reading individual timelines.

Above the swimlanes, a **concurrency chart** counts distinct PoVs in flight each
week — this is the "where's the crunch" signal, and it's independent of row mode.

**Calendar** — a month grid with PoVs drawn as banners spanning their date range,
wrapping across week rows. Squared-off edges mean "continues past here". Days with
more than three PoVs show `+N more`, which opens a list for that day.

Both views share the colour-by selection and legend state, so switching doesn't
reset your view.

## Behaviour worth knowing

| Case | What happens |
|---|---|
| **No end date** | Gets an assumed duration (default **2 weeks**), drawn hatched with a dashed edge, and labelled "assumed" in the tooltip. Never confused with a confirmed date. |
| **`Hidden` = true** | Row is excluded. |
| **Name starts `PAUSED`** | Bar is dimmed. The source data encodes paused as a name prefix, not in `Pov Status`, which has no Paused value. |
| **Blank Heat Check** | Buckets into an explicit "Unknown" legend entry rather than disappearing. |

The assumed duration follows the team's own convention that a "2 week" PoV runs
**start + 14 days**, inferred from rows that do have both dates.

## Local development

```bash
npm install
npm run dev          # http://localhost:5273
```

Opened directly in a browser (no Sigma parent), it renders a built-in sample
fixture behind a "DEV PREVIEW" banner, so the views can be worked on without a
workbook.

### The fixture is not real data

`src/devMock.js` is entirely invented — made-up companies, people, and figures. It
deliberately mirrors the *shape* of the real export (missing end dates, a paused
row, a hidden row, secondary SEs, blank heat checks, one long multi-month PoV) so
every code path is exercised.

Production builds resolve the `dev-fixture` specifier to an empty stub
(`src/devMock.stub.js`) via an alias in `vite.config.js`, so **no fixture data ships
in the deployed bundle** — the deployed page just shows the setup prompt when opened
outside Sigma. If you ever point the fixture at real data, that alias is what keeps
it off the public host. Verify with:

```bash
npm run build && grep -c POV_TIMELINE_DEV_FIXTURE dist/assets/*.js   # expect 0
```

Import the fixture as `dev-fixture`, never by relative path, or it lands in the
production bundle.

## Setting it up in Sigma

1. **Administration → Plugins → Add Plugin**, using the Netlify URL above (or
   `http://localhost:5273` while iterating).
2. Add the plugin element to a workbook and pick the element holding your PoV rows.
3. Map the columns:

   | Plugin field | PoV SignUp column | Required |
   |---|---|:--:|
   | PoV Name | `Pov Name` | ● |
   | Primary SE | `Opportunity Sales Engineer Name` | ● |
   | Start Date | `Active Pov Start Date` | ● |
   | End Date | `Active Pov End Date` | |
   | Secondary SE | `Secondary SE` | |
   | Heat Check | `Heat Check` | |
   | PoV Status | `Pov Status` | |
   | Opportunity Stage | `Opp History Stage Name` | |
   | Sales Geo / Segment | `Opportunity Sales Geo` / `... Sales Segment` | |
   | ACV Amount | `Opportunity Acv Amount` | |
   | Tech Risk | `Pov Tech Risk` | |
   | Hidden Flag | `Hidden` | |
   | Description | `Pov Description` | |
   | Avatar URLs | `Owner Image URL` / `Secondary User Image URL` | |

4. Set **Colour-by options** to the fields worth offering in the dropdown — Heat
   Check, PoV Status, Stage, Segment, SE Name. Viewers pick from these live; Heat
   Check is the default when present.
5. For an adjustable assumed duration, add a Sigma **number control** and bind it to
   the **Assumed Duration (weeks)** variable. Unbound, it defaults to 2.
6. Optionally bind **Selected PoV** and **On PoV Select** to have clicking a bar
   drive another element on the page.

Filtering is deliberately *not* built into the plugin — put ordinary Sigma controls
(SE, Geo, Segment, Status) on the page against the underlying table and the plugin
re-renders on whatever filtered data it receives. The legend also supports
click-to-isolate locally.

## Deploying

```bash
npm run build
netlify deploy --prod --dir dist
```

## Colour

Categorical and status palettes come from a validated reference palette and should
not be re-stepped by hand. Label ink is chosen per slot by measured contrast against
that slot's fill — white on the amber slot is 1.8:1, so most slots take dark ink.
Heat Check uses the reserved *status* palette (a state, not a series) and always
ships with its emoji plus a legend label, so hue never carries meaning alone.
