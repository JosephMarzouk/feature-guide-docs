# Whole-project mode

Triggered when the skill is run with **no arguments** (`/feature-guide-docs`) from a project root, or when
the user asks to document "everything", "all features" or "the whole project". Result: one folder per
feature under `docs-output/`, each with its deck and RAG pack, plus an index.

```
docs-output/
  INDEX.md                         # every feature: status, deck, RAG zip, open questions
  open-questions.md                # every behaviour difference from every pack, for one round of answers
  <Feature>/
    <Module>-<Feature>-Admin-Guide.pptx
    <Feature>-RAG.zip              # Operations/<Module>/*.md zipped
    Operations/<Module>/*.md
    build_deck.js  captures.json  screenshots/  sources/  engineering-notes.md
```

## 1. Inventory the features

Build the list from every source, then merge duplicates:

- **Admin portal code**: the sidebar data file (e.g. `src/components/sidebar/data.tsx`) → one entry per
  module and per sub-screen; `src/app/[branch_id]/<module>/…` routes; backend modules and their
  `permissions.ts` entries.
- **Backend member endpoints** (`members/:memberId/...`, app controllers) → member-app features with no
  admin screen (e.g. the app Calendar).
- **Mobile app code**, if present (`lib/features/<feature>/`).
- **Product platform** (see `prd-sources.md`): Epics, PRD docs and their folders/lists.
- **Existing packs** in `docs-output/` and any older RAG zips the user has → *update* when code under the
  feature's paths changed after the pack's "Last reviewed" date (`git log --since=<date> -- <paths>`, or
  file modified times without git), or its PRD/stories were updated since; otherwise *up to date*.

A "feature" is what product presents as one thing (one Epic / PRD / sidebar entry), not one route. Small
sub-screens fold into their module's pack. Its **module** is the sidebar section it sits under (Guest
Invitations → Access Control); a member-app-only feature takes the module whose bookings or data it shows,
or its own name when it spans several (Calendar).

Read every repo in the root together: the admin portal for screens and labels, the backend for rules,
permissions and member endpoints, the mobile app (if present) for app states.

Write `docs-output/INDEX.md` as a table: Feature · Module · Code paths · PRD/stories found (links) · Status
(new / update / up to date / skip).

## 2. One check-in before the work

Show the inventory and ask everything the whole run needs, in one message:

1. Which features to include or skip (default: all new and update).
2. The output folder (default `docs-output/` in the folder the skill was run from; reuse it if it exists).
3. For screenshots: the panel URL (staging preferred), the branch with data, and that they will sign in
   themselves once; the Figma file for app screens (default `figmaFileKey` from `config.json`). This answers SKILL.md
   step 7's branch question for the whole run.
4. Missing PRDs: work from code + stories, or wait for files.
5. For *update* features on an existing module: that module's current RAG zip or folder, if it is not
   already in `docs-output/` (SKILL.md step 4).

If a connector the run needs is missing (no product platform, no Figma), say which parts it affects
(no PRD text; no app slides) and carry on without them — list them in `INDEX.md`.

After this, run to the end without stopping per feature.

## 3. Write the packs in parallel

Give each feature its own subagent (the user's preferred model; Sonnet by default), several at a time.
Without a subagent tool (e.g. some Codex setups), run the features one after another — same steps.

Each subagent prompt contains: the feature row from `INDEX.md`, its pack folder, the paths to this skill's
`SKILL.md` and references, and these rules:

- Follow SKILL.md steps 1–6 and 7b (Figma) for this one feature; the source steps use
  `references/prd-sources.md`.
- **Behaviour differences do not stop the run.** Write the guide to the code (the code wins), and add each
  difference to `<pack>/open-questions.md`: claim, what the code does, file, which slides/RAG files it
  touches.
- Gaps, bugs, security findings → `engineering-notes.md`, as usual.
- Do **not** run `capture_screens.js` (one browser profile; captures run once, centrally) — instead write
  `<pack>/captures.json` from the code's routes.
- Build the deck with zero warnings and lint the RAG files; render-check only decks nobody has open.
- Report: slides, RAG files, open questions, notes, anything blocked.

## 4. Capture admin screenshots — once, centrally

After the packs are written: one recon pass over all packs' screens (`"dump": true`), fix selectors and
labels, then run `capture_screens.js` pack by pack with the same `--base` / `--branch`. The user signs in
once; the profile keeps the login for every pack. Rebuild each deck after its screenshots land.

## 5. Review, then one round of questions

1. QA every pack (SKILL.md step 8) — read each deck's slide text and spot-check renders.
2. Merge every pack's `open-questions.md` into `docs-output/open-questions.md`, grouped by feature,
   numbered, each with the recommended answer. Ask the user once.
3. Apply the answers to the affected decks and RAG files, rebuild, re-lint, re-zip.
4. Update `INDEX.md` (status → done, links to each deck and zip, count of open items) and deliver
   (SKILL.md step 9) with one line per feature.
