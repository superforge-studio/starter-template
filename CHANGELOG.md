# Changelog

Every release of this template, newest first. Each one is a git tag on the
template's `main`, `v` and its version (`v0.1.0`), and the tags are the
list of versions. `.superforge/superforge.json` says which release a copy
is on.

These notes are written for the agent that updates a copy
(`workbench/updating.md`), which reads every release between the copy's
version and the latest before it applies any of them. A copy keeps this
file as its updates leave it, so don't edit it in a copy: the copy's own
history is its git log.

In the template, a change merged since the last release has its notes
under `## Unreleased` at the top, until the release that ships it gives
that heading its version and day (`## 0.2.0 (2026-12-01)`).

## How a release is written

Each release says:

- **What changed, and why**, a part at a time, naming the files.
- **Machinery or a starting point**, for each part. Machinery is the
  setup every copy runs on (CI, the checks, the local Postgres, workflows,
  the Railway project's shape), so a copy takes it as the template has it.
  A starting point is something the owner is expected to make their own
  (the home page, the theme, an example feature), so an update offers the
  change and keeps the owner's version where they've changed it.
- **Flags**, when they apply:
  - **Schema**: `schema.ts` changed. The update applies the change and
    generates the copy's own migration (`pnpm database:generate`), since
    the template's migration files can't be copied (the update skips
    them). Any SQL written by hand is given here, to go in that migration.
  - **Variable** or **Secret**: a new variable on the app's Railway
    service. A secret's value is the owner's to set in Railway's
    dashboard before the update merges.
  - **Railway**: a change to `.railway/railway.ts` that costs money, or
    that needs a destructive apply.
  - **Owner**: a step only the owner can take, like a token or a DNS
    record.
- **How to tell a copy already has it**: a file, a line or a command's
  output that shows the change is there, for a copy that took some of it
  by hand.

A patch release (`0.1.1`) fixes something; a minor release (`0.2.0`) adds
or changes something. Until `1.0.0`, a minor release may also change how
something already there works, which its notes flag.

## Unreleased

The toolbar: whoever's signed in spots something that should change,
clicks it and says what, and the comment goes to Superforge Infra, for
the AI that builds the app to work through later.

- **The toolbar**, machinery: `source/frontend/components/toolbar/`,
  which the root route draws on every page (`routes/__root.tsx`) for
  the business's own people (below), on a computer with a mouse: never
  for a visitor or a customer who signs in, on a phone or a tablet, or in
  the prerender. Comment picks an element as a browser's inspector does,
  outlined in a new theme token, `--highlight` (`styles.css`), which a
  copy whose theme START-HERE.md set adds as it is; a click on the page
  picks rather than does what it would, and Escape steps back. The
  comment box beside the element posts to the app's own `/api/comments`.
  The toolbar drags to the middle of the bottom or a corner, which each
  browser keeps in localStorage, and its ⓘ says what it's for. A comment
  carries the page's path and title, the window's size, and the element:
  a CSS selector that finds it again, its tag, its text (none from a field
  or inside `data-private`, and no email address), its `class` and its
  box. The folder's README has the rest. How to tell a copy already has
  it: `source/frontend/components/toolbar/` exists.
- **Comments, through the app's server**, machinery: `POST /api/comments`
  (`source/backend/comments/routes.ts`), behind `internalOnly`, adds the
  user's ID and their `User-Agent` and calls `fileComment`, new on the
  Infra wrapper (`source/backend/infra/`: `comments.ts`, `answers.ts`,
  `client.ts`, `stand-in.ts`, `choose.ts`), which sends Infra's
  `POST /v1/comments` with the key. Infra keeps a test key's comments
  too, marked as a test's; the stand-in checks one and keeps none. The
  tests' own Infras (`auth/tests/`, `visits/tests/`) gain `fileComment`,
  which a copy's own test Infras need too. Until Infra answers
  `/v1/comments`, a comment answers 503 and the box says it couldn't be
  saved. How to tell a copy already has it:
  `source/backend/comments/routes.ts` exists.
- **`data-untracked`**, machinery: the visitors' script
  (`frontend/visitors/browser.ts`) doesn't count a click inside it, as it
  doesn't the toolbar's. How to tell a copy already has it: `browser.ts`
  checks `data-untracked`.

Queries, on Superforge Infra: the app's own SQL over its project's
events, for dashboards of its own, like a copy's web analytics. Infra
runs each call in a DuckDB database of the call's own, holding only that
project's events, as two tables, `events` and `visits`, so the app writes
whatever read it likes and never touches Infra's database.

- **`query`, on the Infra wrapper**, machinery: `Infra`
  (`source/backend/infra/index.ts`) gains `query`, which sends Infra's
  `POST /v1/query` with the key: named queries that share one read of
  the events, with their `$1` or `$name` parameters, how many `days` back
  to read (90 at most) and the IANA `time_zone` days count in
  (`query.ts`'s `QueryRequest`). It answers the `window` it read and each
  query's rows (`columns`, `rows`, `truncated` past 10,000), or why that
  one has none (`one-select`, `sql` with DuckDB's message, or
  `too-slow`), so one broken query doesn't cost the others; a refused
  call answers `invalid` or `too-many-events` and is logged (`queried`
  and `query_refused` in `answers.ts`, the types `Queried` and
  `QueryRefused` in `index.ts`). `client.ts` gives it 60 seconds rather
  than 15, since Infra gives each query up to ten. A test key reads the
  project's real events; the stand-in (`stand-in.ts`) answers every query
  with no rows, and in a dev server logs that `INFRA_TEST_KEY` reads
  them; and the Infra a build gets with no key (`choose.ts`) answers it
  unavailable. The tests' own Infras (`auth/tests/events.test.ts`,
  `auth/tests/routes.test.ts`, `visits/tests/routes.test.ts`) gain
  `query`, and `infra/tests/` tries the client and the stand-in on it.
  The README's "Query: `query`" has the call, and its warning: wrap
  DuckDB's `->>` in parentheses, `(properties ->> 'target') = 'book'`,
  since DuckDB binds it looser than `and`. No screen uses it yet. How to
  tell a copy already has it: `source/backend/infra/query.ts` exists, and
  `Infra` in `source/backend/infra/index.ts` has `query`.

Workflow runs, kept for good: a finished run and its steps stay, rather
than being deleted a week after it ends, so a workflow's history reaches
back as far as the app does, for workflows that follow a customer for
months.

- **Keeping finished runs**, machinery: `KEEP_FINISHED_FOR` in
  `source/backend/workflows/engine.ts` is `"forever"`, and the engine
  schedules no pruning then (`pruneOnSchedule`). A copy whose runs grow
  too many for its database sets it to a duration, like `90 * DAY`, and
  `pruneFinishedRuns` deletes the runs that finished longer ago than that
  about once an hour, as it did a week's. The workflows README says so,
  and the run screen's not-found note no longer says runs are pruned a
  week after they finish (`frontend/components/dashboard/runs.tsx`). How
  to tell a copy already has it: `engine.ts` has `pruneOnSchedule`.

Runners, beside the workflows: something short that's just due at a time,
like a reminder, is a timestamp in Postgres rather than a workflow
(`backend/workflows/README.md`, "When not to use one"), and a runner is
what checks it, every few seconds, while the workflows run.

- **Runners**, machinery: a `Runner`
  (`source/backend/workflows/runners.ts`) is a `name`, how often its turn
  comes (`every`, in milliseconds), and the turn itself, `run`, handed the
  process's database, bucket and workflows (`RunnerContext`). `RUNNERS`,
  beside `WORKFLOWS` in `backend/workflows/index.ts`, lists every one
  there is, and starts empty: a feature's goes there the moment it's
  defined. `engine.ts` starts them (`startRunners`) once DBOS has
  launched, behind the gate, so one process at a time runs them, and
  `stopWorkflows()` stops them before DBOS shuts down. A turn never
  overlaps the one before it, and one that throws is logged ("A runner's
  turn failed") and the runner goes on. `WorkflowDependencies`
  (`process.ts`) gains `runners`, which the tests leave out, so none run
  there, and the process holds `stop_runners`. The workflows README's
  "Runners" says how one is written, and `workflows/tests/runners.test.ts`
  tries them on fake timers. The template has no runner of its own yet. A
  copy that checks for something due on a timer of its own, like a
  `setInterval` in its server, can move it to `RUNNERS`, so only the
  process running the workflows runs it. How to tell a copy already has
  it: `source/backend/workflows/runners.ts` exists, and `index.ts`
  exports `RUNNERS`.

Storage a screen can browse: the bucket lists what's in a folder,
describes and streams a file, and signs links and forms a browser uses
straight against the bucket, and each kind of file says how it shows. So
a screen of the bucket's folders, like Skyline's Files, can show what's in
each and hand files over without the server holding them.

- **Listing, describing and streaming**, machinery: `ObjectStore`
  (`source/database/storage/index.ts`) gains `open(key, range?)`, a file
  as it streams, all of it or a range, without holding it in memory, as
  Skyline has had it; `list(prefix, { folders, cursor, limit })`, a page
  of up to 1,000 files with their sizes and times, and with `folders` the
  folders right under the prefix in place of what's in them; and
  `head(key)`, a file's size, content type and time. The bucket
  (`bucket.ts`) lists with S3's ListObjectsV2, reading its XML with zod,
  and describes with HEAD. A dev server's folder (`folder.ts`) walks
  `.storage/` and pages it the same way (`listing.ts`), guessing a content
  type from a file's name, and the tests' memory store
  (`tests/support/storage.ts`) does it all too. How to tell a copy
  already has it: `source/database/storage/listing.ts` exists.
- **Presigned links and forms**, machinery: `presignGet(key, { seconds,
  download? })`, a link that reads a file without credentials, saving it
  as `download` when given (`response-content-disposition`), and
  `presignPost(key, { seconds, content_type, max_bytes })`, a form a
  browser posts a file to, straight to the bucket, which refuses any
  other key, content type or a larger file, signed as AWS's own SDK signs
  one (`createPresignedPost`). Either works up to 90 days, Railway's
  longest, and `bucketStore` takes the clock they're signed by, for the
  tests. A dev server's folder has nothing to sign for, so both answer
  `not-presignable` there, and the route serves or takes the file itself.
  The memory store answers links that say what they were for, or
  `not-presignable` with `memoryStore({ presigns: false })`. A browser
  posting to the bucket needs the bucket's CORS to allow the app, which is
  set through the S3 API (`PutBucketCors`), not `.railway/railway.ts`, and
  nothing here sets it yet. How to tell a copy already has it: `bucket.ts`
  has `presignPost`.
- **How a kind shows**, machinery: every kind (`kind.ts`'s `Kind`) has
  `shown`: its `name`, a sentence `about` what it holds, and `access`,
  `open`, or `locked` with `why`, for files the code writes and depends
  on, which a screen lets people look at and download but never change.
  `Storage.kinds` (`files.ts`) lists every kind, and
  `storage/tests/kinds.test.ts` fails a getter left out of it. `Files`
  gains `folder`, `shown`, `head`, `presignGet`, `presignPost` (of the
  kind's content type unless it says otherwise), `list` (in its folder,
  or `under` a folder a listing gave), `holds(path)`, and `at(path)`, a
  file by the path a listing gave, which can be read and presigned, never
  changed. How to tell a copy already has it: `kind.ts` has `Shown`.

Internal users, listed in code: the business's own people are named in
`ACCESS`, and no screen, route or sign-in makes anyone else internal.

- **Internal users listed in code**, machinery, with the list a starting
  point: `internal_users` in `ACCESS` (`source/backend/auth/access.ts`),
  each with a first name, a last name and the email they sign in with,
  in place of `internal_emails`. They're the only people who are ever
  internal: the sign-in middleware gives everyone the role the list
  says, whatever the database does (`auth/signed-in.ts`), so someone
  taken off it is external from their next request; each sign-in and
  the server's start (`backend/users/sync.ts`, `syncAppInternalUsers`,
  which `source/node.ts` calls beside `startWorkflows`) write the list
  into `users`, with each one's name; and the People screen and
  `/api/users` add, change and remove only external people, refusing the
  listed as `listed`. An internal person's name on their account page is
  the listed one, and signing in for the first time isn't a sign-up for
  them (no notice, no `signed-up` event). The roles split into
  `INTERNAL_ROLES` and `EXTERNAL_ROLES` (`utilities/schemas/users.ts`),
  with `ROLES` both, so the column's check doesn't change. The toolbar
  and `/api/comments` are for internal people only. The template lists
  two placeholders, Ada Lovelace and Grace Hopper at example.com, which
  the seed's internal users are made from. How to tell a copy already
  has it: `internal_users` in `source/backend/auth/access.ts`.

The upgrade test's sample rows, for more of a copy's own checks. A table
whose check the rows can't meet passes its own PR, then fails `check` on
every PR after it merges, once the upgrade test's base has it, as
Skyline's appointments and notes did.

- **The upgrade test fills more kinds of check**, machinery: `fill()`
  (`source/database/tests/support/fill.ts`) reads the values a text
  column's check lists from the database's own check (`= ANY
  (ARRAY[…])`), not only from `schema.ts`'s `text({ enum })`, so a table
  `schema.ts` has since renamed gets them too, and never takes a
  pattern's quoted text, like a slug's `~ '^[a-z0-9]+…'`, for a value.
  Where a check wants exactly one of several columns set
  (`num_nonnulls(user_id, contact_id) = 1`), or at least one (`>= 1`),
  each row sets one of them, in turn, and leaves the others null. Where
  a check wants one column after another (`ends_at > starts_at`), the
  later one's sample is past every other column's. The template's own
  tables have none of these checks; a copy's, like an appointment that
  ends after it starts, or a note about a contact or an appointment, now
  fill. `source/database/tests/fill.test.ts` tries both on tables of its
  own. How to tell a copy already has it: `later` in `fill.ts`.

The build's prerender, steady on a busy machine: `pnpm build` no longer
fails now and then with `fetch failed`, which held up a deploy until a
rerun passed.

- **The prerender's server on 127.0.0.1**, machinery:
  `preview: { host: "127.0.0.1" }` in `vite.config.ts`. TanStack Start's
  prerender fetches every page from a Vite preview server it starts with
  the app's config, in the build's own process. On `localhost` that
  server listened on `::1` alone, while `fetch` gave `::1` 250 ms before
  it tried `127.0.0.1`, where nothing listened. So when rendering other
  pages held the event loop longer, the build failed with
  `TypeError: fetch failed` (`connect ETIMEDOUT ::1`, then
  `connect ECONNREFUSED 127.0.0.1`), the more often the more pages a copy
  prerenders and the busier the machine. On one address there's nothing
  to race. Nothing else uses Vite's preview (`pnpm preview` runs
  `source/node.ts`), and the dev server still answers on `localhost`. How
  to tell a copy already has it: `vite.config.ts` sets `preview`'s
  `host`.

Flags:

- **Owner**: the business's people go in `internal_users`, the owner
  first, with their names, from `internal_emails`; anyone the database
  has as internal who isn't listed is external from the update's deploy.
- **A change in how something works**: every kind needs a `shown`, and
  a place in `Storage.kinds`, or `pnpm typecheck` and the kinds test
  fail. Every object that is an `ObjectStore`, like a copy's own fake of
  one, needs `open`, `list`, `head`, `presignGet` and `presignPost`, as
  `tests/support/storage.ts`'s does. A copy that added an `open` of its
  own takes the template's.
- **A change in how something works**: workflow runs are no longer
  deleted a week after they finish, so DBOS's tables (in the `dbos`
  schema) grow by a row for every step from the update on. A copy that
  wants the week back sets `KEEP_FINISHED_FOR` to `WEEK`. The runs
  deleted before the update are gone.
- **A change in how something works**: every object that is an `Infra`,
  like a test's fake of it, needs a `query`, as
  `backend/auth/tests/routes.test.ts`'s do, beside the `fileComment`
  above. A copy that already added its own `query` for `/v1/query` takes
  the template's in its place, since `backend/infra/` is machinery an
  update replaces, and keeps its own dashboards that call it.

## 0.4.0 (2026-11-18)

What visitors do on the site, kept by Superforge Infra as events for the
owner's dashboard, all of it through the app's own server. Whom the site
remembers, by a first-party cookie, is the owner's choice. And two pieces
of machinery: CI tags each release, and the upgrade test fills `inet`
columns.

- **CI tags the template's releases**, machinery: a `release-tag` job in
  `.github/workflows/ci.yml`, after `check` on a push to `main`. In the
  template, it tags a version in `.superforge/superforge.json` that has no
  tag yet, on the commit that set it, and fails on a version with no
  heading here. A copy isn't a GitHub template repository, so the job
  skips there (`github.event.repository.is_template`) and changes nothing.
  How to tell a copy already has it: its `.github/workflows/ci.yml` has a
  `release-tag` job.
- **The upgrade test fills `inet` columns**, machinery: `fill()`
  (`source/database/tests/support/fill.ts`) gives one an address set aside
  for documentation, `203.0.113.x`. Without it, a table with an `inet`
  column, like an IP address, passes its own PR and then fails `check` on
  every PR after it merges, once the upgrade test's base has it. How to
  tell a copy already has it: `fill.ts` has a `case "inet"`.

Visitors, on Superforge Infra: what visitors view, click and run into on
the site's pages, and what only the server knows, kept by Infra as events,
which superforge.studio's dashboard sums up in its Infra tab and Claude
reads in full through the Superforge MCP. Every event reaches Infra from
the app's own server: the pages send theirs to the app's `/api/visits`,
never to Infra, and keep nothing on the device. A visitor is remembered
by a first-party cookie the server sets, and asked first where the owner
chooses.

- **The pages' events**, machinery: `source/frontend/visitors/`, a script
  of the app's own, started by the root route from an effect, so never in
  the prerender (`routes/__root.tsx`'s `startVisitors`). It records
  `view` on each page the router resolves, with the page's `title`, and
  on the first the referring site, every `utm_` parameter (the first
  ten), an ad's click ID (`gclid`, `gbraid`, `wbraid`, `fbclid`,
  `msclkid`, `ttclid`, `li_fat_id`), `screen` and `language`; `leave`
  (how far down, how long visible); `click` on links, buttons and
  anything with `data-track`; and `error`, ten a page. It never keeps a
  query string, a fragment, a field's value or an email address. It
  posts JSON to the app's own `/api/visits`, same-origin with its
  cookies, every five seconds and with `keepalive` as the page hides,
  through the API's typed client, and keeps nothing on the device: no
  ID, no visit, no answer and no queue, which lives in the page's memory.
  `track()` sends the app's own events. The dashboard is `data-private`,
  so its clicks send no text. Its README has the rest.
- **`/api/visits`**, machinery: `source/backend/visits/`. `POST
  /api/visits` takes a page's batch (`utilities/schemas/visits.ts`, at
  most 64 KB), adds the visitor (the ID in their `visitor` cookie or a
  new UUID, none in `never`; their answer from `visitor_consent`, or
  `unasked`; the signed-in user's ID from the session; `X-Real-IP`; and
  `User-Agent`) and the mode, and sends it to Infra. As Infra answers, it
  sets or renews `visitor` for a remembered visitor, clears it for one
  who isn't, and answers the page `{ ask }`; when Infra is down or
  refuses, it answers `{ ask: false }`, logs it, and changes no cookie.
  `POST /api/visits/consent` keeps `{ consent: "given" | "declined" }`
  in `visitor_consent`, clears `visitor` on `declined`, and answers 204.
  Both cookies are `HttpOnly`, `SameSite=Lax`, `Path=/`, for 400 days,
  and `Secure` but on plain http on this computer (`cookies.ts`).
- **Whom the site remembers**, machinery with the owner's setting:
  `VISITOR_MODE` in `source/utilities/visitors.ts`, on
  `context.var.visitor_mode`. `"remember"`, as it ships: everyone who
  hasn't declined, with no banner. `"ask-in-eu"`: asks visitors where
  GDPR applies, or whom Infra can't place, and remembers everyone else.
  `"ask"`: asks everyone, and remembers whoever accepts. `"never"`: no
  one, and no cookie. Infra applies it by the visitor's answer and
  country. It keeps a remembered visitor's IP address with their events;
  whoever isn't remembered is counted a day at a time, and their address
  isn't kept.
- **The consent banner**, a starting point:
  `source/frontend/components/site/consent-banner.tsx`, drawn by the root
  route on every page, the dashboard's too, only in a browser, and only
  while the server's latest answer said `ask`. Accept and Decline post
  to `/api/visits/consent`. A copy may restyle it and reword it in its
  own voice.
- **Infra's calls for events**, machinery: on `Infra`
  (`backend/infra/index.ts`), `sendVisit`, `POST /v1/visits` with the
  key, for the pages' batches (`visits.ts`, and `sent_visit` in
  `answers.ts`), and `sendEvents`, `POST /v1/events`, for the server's
  own, with the event's shape in `events.ts`. Each is checked as Infra
  checks it in the stand-in (`stand-in.ts`), which keeps nothing and
  answers a page's batch by the mode as Infra answers a visitor it can't
  place, so `ask-in-eu` asks as `ask` does, and logs each in a dev
  server. Neither throws or retries, and a failure is logged. An
  event's field rules and limits, which both sides share, are in
  `source/utilities/schemas/events.ts`.
- **The sample event**, a starting point: `signed-up`, with the new user's
  ID, which `backend/auth/routes.ts` sends without waiting on it when a
  sign-in makes someone new (`tellInfraOfSignUp`), so a slow or failing
  Infra never holds signing in up.
- **Docs**: `source/frontend/visitors/README.md`,
  `source/backend/infra/README.md` ("Events"), `START-HERE.md` (step 1's
  question 13, and step 3 sets `VISITOR_MODE`), `CLAUDE.md` and
  `README.md`.

Flags:

- **Owner**: whom the site remembers (`START-HERE.md`'s question 13):
  `"remember"`, as it ships, sets a lasting cookie on every visitor with
  no banner, which the EU and the UK generally require consent for; a
  business based in the EU chooses `"ask"`, and one elsewhere that cares
  `"ask-in-eu"`. Events are kept only once the copy's server has
  `INFRA_SECRET_KEY`.
- **A change in how something works**: every object that is an `Infra`,
  like a test's fake of it, needs a `sendEvents` and a `sendVisit`, as
  `backend/auth/tests/routes.test.ts`'s do; `standInInfra` takes
  `{ waiting, logs }`; and every `ApiEnvironment` has a `visitor_mode`,
  which `testApi()` gives `"remember"` unless a test says otherwise.

How to tell a copy already has it: `source/backend/visits/routes.ts`
exists, and `Infra` in `source/backend/infra/index.ts` has `sendVisit`.

## 0.3.0 (2026-11-16)

The dashboard, behind sign-in. Everyone who signs in has a role: the
business's own people (`internal`) see everyone who can sign in and the
workflows' runs as they run, and everyone else (`external`) sees their own
account. Who can sign in at all, anyone or only people the team has added,
is the owner's choice, in code.

- **Roles**, machinery: `users.role`, `internal` or `external`, from
  `ROLES` in `source/utilities/schemas/users.ts`, with `INTERNAL_ROLES`,
  the ones that see the business's side of the dashboard. It's text with a
  check made from `ROLES`, not a Postgres enum, so a copy adds a role in
  one list and the migration `pnpm database:generate` writes. The API
  enforces it: `internalOnly` (`backend/auth/signed-in.ts`) answers 403
  `not-internal` to anyone else, whatever a page shows. The session's user
  (`GET /api/auth/session`) now carries `name` and `role`.
- **Who can sign in**, machinery with the owner's settings:
  `source/backend/auth/access.ts`'s `ACCESS`, on `context.var.access`.
  `sign_in: "anyone"` makes someone new `external` at their first sign-in,
  as before; `"listed"` refuses anyone not already added, before Infra is
  asked, 403 `not-listed`. `internal_emails` are `internal` from their
  first sign-in. It ships as anyone, with no internal emails, so a copy
  behaves as 0.2.0 did until its owner sets it (`START-HERE.md`, step 3).
- **The account**, machinery: `/api/account`, a person's name (the new
  `users.name`) and the browsers they're signed in on (the new
  `auth.sessions.user_agent`, kept as each session starts), with signing
  out of one or every other (`backend/account/`).
- **The people**, machinery: `/api/users`, for internal people only:
  everyone who can sign in, adding someone before they sign in, changing a
  role, removing someone, never yourself (`backend/users/`).
- **The workflows' runs**, machinery: `/api/workflows/runs`, a run with
  its steps, and trying a failed or canceled run again from where it
  stopped, read through DBOS's own `listWorkflows`, `listWorkflowSteps`
  and `rewindWorkflow`, never its tables (`backend/workflows/routes.ts`,
  `runs.ts`, `engine.ts`). `context.var.workflows` gains `runs()`,
  `run(id)` and `retry(id)`, which a test's recorded workflows answer too,
  and `defineWorkflow` takes a `title`, what a run is called on screen.
- **The sample workflow**, a starting point: `tell-team-of-sign-up`
  (`backend/users/workflows.ts`), which a sign-in that makes someone new
  starts, and which tells the internal people, in the logs until Infra can
  email. `pnpm database:seed` queues real runs of it for a dev server to
  run (`enqueueFromScript` in `engine.ts`).
- **The dashboard**, a starting point: `source/frontend/routes/dashboard/`,
  drawn in the browser and left out of the prerender (`filter` in
  `vite.config.ts`), in a frame of a bar and a list beside what's chosen
  (`components/dashboard/`): Workflows, with each run's steps drawn as the
  home page's line, live; People; and the account, which is all an
  external person sees. Its queries are `queries/account.ts`, `users.ts`
  and `workflows.ts`. Opening it signed out shows the sign-in form there.
- **The business's mark**, a starting point:
  `components/site/business-mark.tsx`, the logo and name the sign-in page
  and the dashboard share, in place of the sign-in page's own header. The
  sign-in page, once someone's signed in, links to the dashboard.
- **The home page's line**, a starting point: the dashboard is a built
  stop on it, linking to `/dashboard`, and the line now ends at the
  database (`components/welcome/`). A copy that deleted the folder leaves
  this out.
- **Seeds**: the sample users have names and roles (two internal, among
  them `ada@example.com`), and their sessions browsers.
- **Docs**: `CLAUDE.md`, `README.md`, `START-HERE.md` (who signs in, the
  team's emails), `workbench/writing-code.md` ("Roles and who can sign
  in", screens behind sign-in, `internalOnly`), and
  `backend/workflows/README.md` ("Reading runs", "The sample").

Flags:

- **Schema**: three new columns, all safe for the version still serving:
  `users.name` (text, null), `users.role` (text, not null, default
  `'external'`, with a check that it's one of `ROLES`) and
  `auth.sessions.user_agent` (text, null). The copy's own migration, from
  `pnpm database:generate --name=roles-names-and-browsers`, makes them;
  squawk asks why the check needn't be `NOT VALID`, so above its
  `ADD CONSTRAINT` line write:

  ```sql
  -- users holds the people who can sign in, a few thousand rows at most, and
  -- every one fits, since role was just added with its default
  -- squawk-ignore constraint-missing-not-valid
  ```

  Every user the copy has becomes `external`, so in the same migration,
  make its own people internal, by the addresses the owner gives
  (below):

  ```sql
  UPDATE "users" SET "role" = 'internal' WHERE "email" IN ('owner@example.com');
  ```
- **Owner**: who can sign in, and the business's own people's addresses,
  for `ACCESS` in `source/backend/auth/access.ts`, and for the update
  above. Until someone is internal, no one sees the people or the
  workflows.

How to tell a copy already has it: `source/frontend/routes/dashboard/route.tsx`
exists, and `schema.ts`'s `users` has a `role`.

## 0.2.0 (2026-11-15)

Sign-in, through Superforge Infra. A customer or someone on the staff
enters their email at `/sign-in`, Infra emails them a six-digit code and a
link, and the app keeps the user and their session in its own Postgres: no
passwords, and no email provider of the owner's own. It's the first thing
the app calls Infra for.

- **Signing in, in the API**, machinery: `source/backend/auth/`. Its
  routes are `POST /api/auth/start`, `/verify` and `/sign-out`, and
  `GET /api/auth/session`, who's signed in. `signedIn` and `maybeSignedIn`
  (`signed-in.ts`) put the user on `context.var.user`, and nothing else
  reads the `session` cookie or the sessions. Sessions last 30 days from
  their last use, renewed at most once a day.
- **Infra**, machinery: `source/backend/infra/`, the one wrapper the app
  calls it through, on `context.var.infra`. A build calls Infra with
  `INFRA_SECRET_KEY` and nothing else; a dev server with a test key from
  the checkout's `.env` (`.env.example`), or, without one, an in-memory
  stand-in that emails nothing and shows the code on the page, which the
  tests always use. Its README has the calls and the keys.
- **The users and their sessions**, machinery: `users` in `public` and
  `sessions` in `auth` (`schema.ts`), with sample rows in
  `seed/users.ts`. `writing-code.md`'s rule for the Postgres schemas
  changes to match: the users are the business's own data, which its
  tables point at, and `auth` holds what lets someone in, the sessions and
  API tokens later. The sign-in codes are Infra's.
- **The sign-in page**, a starting point: `routes/sign-in.tsx`, with its
  form in `components/site/sign-in-form.tsx` and its queries in
  `queries/auth.ts`. It's prerendered whatever links to it (`pages` in
  `vite.config.ts`), since the email's link lands there. The link signs in
  only once the visitor presses "Finish signing in", so a mail scanner that
  opens it, even one that runs the page's script, spends nothing. Its header says
  "Your business" beside the favicon, as the template's home page did: a
  copy puts its name and logo there (`START-HERE.md`, steps 2 and 3).
- **Failures**, machinery: the failure shape gains an optional
  `retry_after` (`utilities/schemas/failures.ts`), `failure()` takes
  details beside the reason, like a 429's, and `queries/failures.ts` has
  `FailedRequest`, which a mutation throws, and `failureOf`. A body that
  isn't JSON is answered 400 `invalid` rather than 500 `unexpected`
  (`answerUnexpected` in `backend/failures.ts`).
- **Another site's forms**, machinery: the API refuses a form posted from
  another site, 403 `forbidden` (`csrf()` in `backend/index.ts`), so a
  page elsewhere can't sign anyone out. JSON, and a request with no
  `Content-Type`, are left alone.
- **The home page's line**, a starting point: Sign-in is a stop on it,
  linking to `/sign-in` (`components/welcome/`). A copy that deleted the
  folder leaves this out.
- **The smoke test**, machinery: it checks that a build without a secret
  key refuses sign-in (503) rather than using the stand-in, which would
  show anyone's code on the page.
- **Docs**: `CLAUDE.md`, `README.md`, `START-HERE.md`,
  `workbench/writing-code.md` (signing in during development, `signedIn`,
  the schemas' rule), `workbench/commit-and-deploy.md` ("Setting up
  Railway", step 6: the project on Infra, its domains and its keys), and
  `workbench/updating.md`, which leaves `routeTree.gen.ts` out of an
  update and builds it again.

Applying it: this is the first release that adds a page, and a copy's
`updating.md` is still 0.1.0's, so leave
`source/frontend/routeTree.gen.ts` out of the diff too
(`':(exclude)source/frontend/routeTree.gen.ts'`), and run `pnpm build`
after `pnpm install`, which writes it again with `/sign-in` and the copy's
own pages.

Flags:

- **Schema**: two new tables, `users` (in `public`) and `sessions` (in
  `auth`), with a foreign key from `sessions.user_id` to `users.id` and an
  index on it. The copy's own migration, from `pnpm database:generate
  --name=users-and-sessions`, makes them; nothing is written by hand. A
  copy that already has a table named `users` needs the owner's call on
  how the two become one before this applies.
- **Secret**: `INFRA_SECRET_KEY` on the app's service, declared with
  `preserve()` in `.railway/railway.ts`. Until the owner sets it, the site
  works and sign-in answers that it's down (the logs say `Sign-in is
  down`).
- **Owner**: on superforge.studio's dashboard, the Infra tab, a project
  for the app, its domains (its Railway address and its custom domain),
  and a secret key, which the owner sets in Railway
  (`workbench/commit-and-deploy.md`, "Setting up Railway", step 6). A test
  key in `.env` is optional.

How to tell a copy already has it: `source/backend/auth/routes.ts`
exists, and `.railway/railway.ts` declares `INFRA_SECRET_KEY`.

## 0.1.0 (2026-11-15)

The first release. A copy made from it starts here, so there's nothing to
update from.

- **Releases begin**: `.superforge/superforge.json` (which template a copy
  came from, and its version), this changelog, and
  `workbench/updating.md`, how a copy takes a later release.
- **The license**: MIT (`LICENSE`).
- **Design guidance without a plugin**: the template no longer enables
  the impeccable plugin in `.claude/settings.json`, which every owner had
  to trust and which asked START-HERE's questions again.
  `workbench/designing.md` carries the design rules instead, for any
  agent, and says how to install impeccable for a full redesign.
- **CI in a new copy**: `railway-apply` skips with a notice until the
  repository has its `RAILWAY_TOKEN` secret, so a copy's first commits
  don't fail before Railway is set up.
- **The home page**, a starting point: the app as a line, a stop for each
  part (the website, the API, Storage and the workflows, the database),
  drawn in the theme's main color, with the health check running down it
  and what to tell Claude where it fails, the parts still to come as
  dashed stops, and the next steps as sentences to say to Claude
  (`routes/index.tsx`, `components/welcome/`). `queries/health.ts`'s
  `healthQuery` answers the round trip's time beside the status. START-HERE
  replaces the page and deletes `components/welcome/`.
