---
name: feature-guide-docs
description: Use when documenting BR Clubs features as staff guide decks (.pptx) plus chatbot knowledge-base (RAG) Markdown packs — one feature from a PRD, spec, ClickUp/Jira/Notion/Confluence/Linear item or feature name, or every feature in the project when run with no arguments from a project root. Also use when pulling PRDs and user stories from a connected product platform for documentation, extending the admin guide series (Academies, Access Control, Assets Rental, CRM, Dining, Gym, Marketing, Performance Plus, Wallet), adding or refreshing a pack's screenshots (staging admin panel, Figma app screens), documenting a member-app-only feature for staff, or revising finished packs after product-team feedback.
---

# Feature Guide Docs

## Which mode

| The user… | Mode |
|---|---|
| runs `/feature-guide-docs` with **no arguments**, or asks for "all features" / "the whole project" | **Whole project** — follow `references/batch-mode.md`, which runs the steps below once per feature; questions are asked once up front and once at the end, never per feature |
| names a feature, gives a PRD/spec, or links a ClickUp/Jira/Notion/… item | **One feature** — steps 1–9 below |
| asks for screenshots, or comments on a finished pack | steps 7 / 7b, or step 10 |

Input: the **PRD** (a file, a paste, or pulled from a connected platform — `references/prd-sources.md`;
optional when none exists), the feature's **user stories** and **product-team comments** (same platforms),
the **Figma app design** (the file in `config.json`, via the Figma connector) and the **codebase in the current
directory** — the admin portal (frontend + backend), the backend, or the mobile app. Output: **one folder
per feature**, `docs-output/<Feature>/` (or the folder the user names), containing:

1. `<Module>-<Feature>-Admin-Guide.pptx` (`<Module>-Admin-Guide.pptx` for a whole-module deck) — the guide
   presentation, identical in theme, structure and voice to the existing series. Built by `build_deck.js`
   (kept, so screenshots can be added and the deck rebuilt).
2. `<Feature>-RAG.zip` → `Operations/<Module>/*.md` — chatbot knowledge files in the existing KB format,
   ready to upload to the chatbot's knowledge base.
3. `screenshots/` — admin captures from the running panel (`NN-name.png`, step 7) and member-app screens
   from Figma (`app-NN-name.png`, step 7b), named as the deck lists them.
4. `captures.json` — the capture list, kept so screenshots can be re-taken.
5. `engineering-notes.md` — internal only, beside `Operations/`, never zipped or in the deck: every bug,
   unfinished item, permission gap and security finding from the code, plus a **"To confirm with product"**
   list for design items the code does not back (e.g. an icon whose action is unknown).
6. `sources/` — the PRD, story and comment text pulled from the platform, with links (internal, never
   zipped).

Accuracy first. A polished guide that describes the screen wrongly is worse than no guide. Sources, in
order: product-team comments → ClickUp user stories → PRD → code → Figma. The product sources say how the
feature behaves; the code (and the live panel) supplies the screens, exact labels, menu paths and fields;
Figma supplies what the member sees in the app. The guide describes the feature **as the product designed
it** — staff guides never mention bugs, gaps or "not yet".

Several features at once: give each pack its own subagent (the user's preferred model, Sonnet by default),
running in parallel, then review each pack yourself (step 8) before reporting. Subagents report
design-vs-guide differences back; they never rewrite existing guide text to match a design on their own.

Read before starting: `references/voice.md` (always), `references/deck-format.md` (deck),
`references/rag-format.md` (RAG files), `references/prd-sources.md` (finding the PRD),
`references/batch-mode.md` (whole-project mode).

## Setup (once per machine)

The scripts need Node 18+, pptxgenjs and Playwright. If `<this skill's folder>/scripts/node_modules` is
missing, run `npm install` inside `<this skill's folder>/scripts`, then `npx playwright install chromium`
there (screenshots). Works the same under Claude Code (`~/.claude/skills/`) and Codex
(`~/.agents/skills/` or `~/.codex/skills/`); where a step names a Claude-only tool, use the agent's
equivalent (subagents → run features sequentially; `preview_start` → start the dev server from a shell).

Project settings live in `config.json` in this skill's folder (copy `config.example.json`): `panelUrl`
(staging admin panel), `dataBranch` (branch with real-looking data), `localDevUrl`, `figmaFileKey` /
`figmaFileName` (member-app design), `outputDir`, `subagentModel`. `capture_screens.js` reads `panelUrl` and
`dataBranch` as its defaults. If `config.json` is missing or still has the example values, ask the user for
them once and write the file — never commit it (it is git-ignored).

## 1. Get the PRD and the user stories

Use the PRD the user gave. Otherwise pull it — and always the user stories and comments — from whatever
product platform is connected (ClickUp, Jira, Confluence, Notion, Linear, Asana, Drive…), following
`references/prd-sources.md`; save what you used in `<pack>/sources/`. No platform and no file → ask once,
or agree to work from code and stories only.

Extract: module (existing or new — the sidebar section the feature sits under), feature name, screens, fields, rules, statuses, permissions, what the
member sees, money/refund behaviour, edge cases. Stories hold the exact business rules, field labels,
acceptance criteria and **examples** (dates, amounts, quotas) — collect every example; the deck reuses them.
When a story and the PRD disagree, the story is newer and more detailed.

## 2. Find the feature in the code

Work out which codebase you are in:

- **Admin portal**: frontend screens under `src/app/[branch_id]/<module>/…`, sidebar entries in
  `src/components/sidebar/data.tsx`, forms/modals/tables in `src/components/…`; backend permissions in
  `src/constants/permissions.ts`, validation in DTOs/services. Both folders may sit side by side.
- **Mobile app** (`pubspec.yaml`, `lib/features/<feature>/…`): screens, widgets, strings/translations, the
  states a member can hit (empty, error, locked, full, paid).

For every screen collect, from the code: the exact labels (buttons, columns, tabs, menu entries — check the
translation files), fields with required/optional/validation, statuses and what changes them, what saves when,
what is irreversible, what the permission checks actually test, and — for admin fields — where the value
shows up for the member. Use subagents to search in parallel when the feature spans many files.

## 3. Verify the product sources against the code

Make a short table: PRD / story claim → what the code does → file. Then sort every mismatch:

- **Behaviour difference** (the system deliberately works another way: different timing, different
  pricing, renamed label, different flow): **stop and ask the user every time.** The code wins unless the
  user says otherwise. Never write docs around an unanswered difference.
  In whole-project mode, write to the code and record the difference in `<pack>/open-questions.md`
  instead; all of them are asked in one round at the end (`references/batch-mode.md` step 5).
- **Gap or bug** (in the PRD/stories but missing, unfinished, broken, or a permission the system does not
  check): the guide describes the **designed** behaviour; log the gap in `engineering-notes.md`. Never write
  "not built yet", "no setting yet", "does nothing today", "bug", or any permission-gap caveat in the deck
  or RAG files.
- **Built but not in the PRD**: document it — staff will see it.
- **On-screen label quirks** (typos, two labels for one screen): keep them, per voice rule 10 — staff see them.

Unsure whether something is a difference or a gap? Ask.

### Screen model

Describe screens the way the product presents them, not by code routes. One module the product calls
"Calendar" is one screen in the guide, even if the code renders it from several routes. When a feature spans
several routes and the PRD does not say how it is presented, ask the user before planning slides.

Check where the feature actually lives: look at the live panel's sidebar (not only the code's sidebar file —
they can differ). If the feature exists **only in the member app** (no admin screen — e.g. the Calendar),
confirm with the user, then write an **app guide for staff**: what the member sees, field by field with
examples, then a "When a member asks…" table that sends staff to the admin screen where they look or act
(each module's Bookings screen, etc.). For app-only features the **backend member endpoints are the truth**
for what the app shows (which sources are merged, order, filters, what drops off); Figma frames that show
more than the endpoint returns are left out and listed under "To confirm with product".

## 4. New module or existing?

If the feature belongs to an existing module, ask for that module's current `<Module>-RAG.zip` (or folder)
if you don't have it, and update its files rather than making a parallel set: extend or add topic files, add
to `faq.md` and `glossary.md`, keep the overview's screen list and "at a glance" accurate, bump
"Last reviewed". A brand-new module gets the full set (overview, topics, faq, glossary).

## 5. Build the deck

1. Plan the slide list following the running order in `references/deck-format.md`. Write every title and
   subtitle following `references/voice.md` — subtitles make a claim.
2. Copy `references/example_build_deck.js` to `docs-output/<Feature>/build_deck.js`; set the `require` to the
   absolute path of `<this skill's folder>/scripts/guide_deck.js`; replace the content.
3. Add at least one `screenshot` slide per screen, filenames `screenshots/NN-short-name.png`.
4. Every rule-heavy slide (dates and windows, fees and refunds, balances, quotas, pricing) gets a concrete
   example — a "Worked example" table slide or a caption. Use the user stories' / PRD's own examples first
   (e.g. "until 14/03/2026 23:59:59", "Yearly balance 5, reset January 1"); otherwise invent round numbers
   and say they are an example.
5. `node build_deck.js` from `docs-output/<Feature>/`. Fix every `[guide_deck]` warning (shorten or split),
   rebuild until there are none.

Never change colours, fonts, sizes or positions, and never hand-build slides with pptxgenjs directly — every
slide goes through a `GuideDeck` function so all decks stay identical in style.

## 6. Write the RAG pack

Follow `references/rag-format.md` exactly. Content = the deck's content in prose, plus more: every FAQ a staff
member might type, every term in the glossary. Headings self-contained, no tables/images/links/code references.

```
node "<this skill's folder>/scripts/rag_lint.js" docs-output/<Feature>/Operations/<Module>
```

Fix everything flagged, then zip the `Operations` folder from inside `docs-output/<Feature>/`:
Windows `Compress-Archive -Path Operations -DestinationPath <Feature>-RAG.zip -Force`, else
`zip -r <Feature>-RAG.zip Operations`.

## 7. Screenshots — admin panel

Capture real screens; never leave placeholders when a panel can be reached. Prefer the **staging** panel
(`panelUrl` in `config.json`) — it has real-looking data; the branch that holds the data is `dataBranch`; ask
the user which account has the permissions. Use the local dev server only when there is no
staging (start it via `.claude/launch.json` + `preview_start`; broken deps → `CI=true pnpm install
--frozen-lockfile`).

Use `scripts/capture_screens.js` — it saves sharp 1440×900 PNGs straight into the pack. The desktop app's
browser pane is usually too narrow (the panel switches to its phone layout and forced desktop sizes come out
tiny), and Claude in Chrome only connects when its extension is signed in to the same Claude account as this
app, in the Chrome profile where it is installed.

1. **Recon pass first.** Write a scratch `captures.json` with `"dump": true` on every screen: each capture
   then also writes a `.txt` with the page text and its buttons/tabs/links. Read them to learn the live
   labels and to pick selectors (prefer `data-testid` attributes, e.g.
   `[data-testid='crm.members.table.view']`).
2. Write `<pack>/captures.json`: `[{ "out": "screenshots/NN-name.png", "path": "/access-control/settings",
   "settle": 3000, "steps": [{ "click": "button:has-text('Create')" }, { "wait": 1500 }] }]` — `path` is
   after `/<branch_id>`. Steps: `click`, `fill` + `text` (search/filter boxes only), `hover`, `press`,
   `scroll`, `wait`.
3. Run `node "<this skill's folder>/scripts/capture_screens.js" <pack>/captures.json --base <panel URL>
   --branch <branch_id>`. It opens a visible browser; **the user signs in themselves** — never type a
   password. Login is kept in a profile folder, so later runs skip it. Floating helper buttons (debug,
   assistant) are hidden automatically; dialogs that never settle fall back to a direct Chrome capture.
4. Only open screens, tabs, filters and windows. **Never click Submit, Confirm, Save, Delete or Pay**, and
   never fill a form beyond a search box. Opening a window whose own button is destructive (e.g. Cancel
   Booking on a real booking) needs the user's explicit OK first — then open it, capture, close.
   Steps that need real form input (e.g. a wizard's last step) are not captured: capture the first step and
   say so in the slide's caption.
5. Compare the live screens with the guide before capturing. Big differences (screens, flow, behaviour) →
   tell the user first. On-screen **label** differences → fix the guide and RAG to the live label
   (e.g. "Yearly Family Balance"), then re-lint and re-zip.
6. View every PNG; rewrite each screenshot slide's `capture` / `pointAt` to describe what the shot actually
   shows (real values on screen make good examples). Tell the user if shots show personal data (names,
   phones, emails) and offer to blur it before the deck leaves the team. Rebuild.

## 7b. Screenshots — member app (Figma)

For anything the member sees, use the **Figma connector** on the app design file
(`figmaFileKey` in `config.json`): `get_metadata` without a node lists the pages (Guest View, Access Control,
Calendar, Home Screen, …). Big pages can fail to load — inspect top-level sections, then drill down.

1. Pick the newest, final frames — skip "Old Design" sections, drafts, variants, and frames with placeholder
   data (lorem ipsum, "Text 1", inconsistent prices). Only use frames whose content the code confirms.
2. `get_screenshot` (maxDimension 1600) returns a short-lived URL; download it with `curl` to
   `screenshots/app-NN-name.png` and view it. Frames come at 1x (375 px wide) — fine on slides.
3. Very tall scrolling frames: crop to the relevant part (PowerShell `System.Drawing`, keep the full one in
   the scratchpad) so the phone stays readable, and make the caption say which part is shown.
4. App slides: `d.screenshot` with a subtitle starting "In the app —", placed right after the slide they
   illustrate. Portrait images get the phone layout automatically (`references/deck-format.md`).
5. List every design-vs-guide difference for the user (flow, labels, messages, payment methods, statuses)
   and wait for their decision — never quietly rewrite the guide to the design.

## 8. QA

- Render the deck and look at every slide: on Windows with PowerPoint,
  `$app = New-Object -ComObject PowerPoint.Application; if (@($app.Presentations | % { $_.FullName }) -contains "<abs path>.pptx") { "open by user - skip" } else { $p = $app.Presentations.Open("<abs path>.pptx", $true, $false, $false); foreach ($s in $p.Slides) { $s.Export("<dir>\s$($s.SlideIndex).png", "PNG", 1280, 720) }; $p.Close() }`
  — never `Close()` a deck the user has open (it discards their unsaved edits) and never `Quit()`
  PowerPoint. If `node build_deck.js` fails with EBUSY, the deck is open: ask the user to close it.
  Without PowerPoint: LibreOffice (`soffice --headless --convert-to pdf`) then view the pages. Check no text
  overflows its box and nothing overlaps. Compare one slide against `assets/reference-deck.pptx` if anything
  looks off.
- Before rebuilding a deck the user may have hand-edited, build a copy to a temp name and diff shape
  positions/text against theirs; carry any deliberate layout change into the library or `build_deck.js`
  instead of overwriting it.
- `rag_lint.js` clean.
- Every deck Part has a matching RAG topic section; every on-screen label in the deck is in the glossary;
  deck and RAG files never disagree.
- Each slide's title and subtitle match its items, and each item's head and body say the same thing.
- No gap wording leaked: search the deck script and RAG files for `not yet`, `yet\b`, `does nothing`,
  `bug`, `not checked`, `technical team`, `superadmin` — every hit must be a deliberate, designed fact.
- Rules have examples (step 5.4).

## 9. Deliver

Give the paths to the .pptx, the RAG zip and `engineering-notes.md`, then in 2–4 lines: slides built, RAG
files written/updated, screenshots captured (or still to capture), and any behaviour differences the user
decided on. Raise security findings (e.g. a member endpoint without its self-member guard) separately, as
their own task — never only inside the notes.

## 10. Revising after feedback

When the user or product team comments on a finished pack:

1. Map every comment to its deck(s) — a comment can belong to a different deck than the user remembers;
   say so.
2. Apply it to the deck **and** the RAG files, and re-check the whole deck for the same wording elsewhere
   (overview, closing, FAQ, glossary).
3. Report a text-only **before → after table per slide** for each changed deck, so the user can verify each
   point; mark anything saved in `build_deck.js` but not yet rebuilt.

## Naming

- Names are hyphenated title case: modules `Assets-Rental`, `Performance-Plus`; features
  `Guest-Invitation`, `Academies-Auto-Renewal`.
- One folder per feature: `docs-output/<Feature>/` (a whole-module pack uses the module name).
- Deck: `<Module>-<Feature>-Admin-Guide.pptx`; a whole-module deck `<Module>-Admin-Guide.pptx`.
- RAG zip: `<Feature>-RAG.zip`, containing `Operations/<Module>/*.md` — the module folder inside stays the
  module name, so packs for one module merge cleanly in the knowledge base.
- Whole-project runs add `docs-output/INDEX.md` and `docs-output/open-questions.md`.
