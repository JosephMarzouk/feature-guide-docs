# Guide deck format

All nine series decks (Academies, Access Control, Assets Rental, CRM, Dining, Gym, Marketing,
Performance Plus, Wallet) share one theme, one set of slide types and one running order. `scripts/guide_deck.js`
reproduces them exactly (verified by rendering side by side with the Wallet deck). **Never** set colours,
fonts, positions or sizes yourself, and never add slide types — only pass content.
`references/example_build_deck.js` shows every function with real content; `assets/reference-deck.pptx`
(the Gym deck) is the visual reference.

## Running order

| # | Slide | Function | When |
|---|---|---|---|
| 1 | Cover | `cover` | always |
| 2 | In one minute — "Five things that explain nearly everything about X." | `numbered` | always, 4–6 items |
| 3 | The screens — where it lives and what each entry is | `numbered` | always |
| 4 | The core concept / "The chain" / "What a X is" | `table` or `cards` | when the module has one idea everything hangs off |
| 5 | Setting X up — "Out of order causes avoidable problems. Follow this sequence." | `numbered` | when there is setup |
| 6 | What you set → what the member sees — "The heart of the guide." | `table` (You set / The member sees) | when admin fields show up in the app |
| 7 | What you can and cannot do | `cards` (2) | when the boundary matters |
| — | **Per screen:** Part N divider | `section` | one per screen / area |
| — | its table ("The X table", "Add X — Step 1") | `table` | fields and columns |
| — | its actions, pairs that get confused ("X vs Y", "Two things that cost real money") | `cards` (2–3) | |
| — | a form or flow ("Booking on a member's behalf — Three steps…") | `numbered` | |
| — | settings on a scale | `levels` | |
| — | screenshot of the screen | `screenshot` | one per screen minimum |
| — | A worked example | `table` (Field / Value / Why, or Case / What happens) + `caption` | complex forms, and after **every** rule slide (windows, fees, refunds, balances, pricing) — numbers from the user stories first |
| n-2 | When a member cannot … — "Work down this list in order." / Troubleshooting | `numbered` or `table` | when there are failure modes |
| n-1 | Who can do what | `table` (Area / Actions / Covers) + callouts, or `cards` | always |
| n | Remember these N | `closing` | always, 4–6 items |

Deck size follows the module: 13–16 slides for a small module, 20–30 medium, up to ~45 large.
A single new feature added to an existing module gets its own short deck in the same order
(cover → in one minute → its Part(s) → who can do what → remember these).

## Functions

```js
const { GuideDeck } = require("<skill>/scripts/guide_deck.js");
const d = new GuideDeck({ module: "Wallet" });
d.cover({ tagline, chips: ["Wallets", "Transactions"], footer: "Written against the live admin panel · last updated YYYY-MM-DD", notes });
d.numbered({ title, subtitle, items: [{ head, body, muted? }], callouts: [{ head, body }], notes });
d.table({ title, subtitle, columns, rows, widths?, caption?, callouts, notes });
d.cards({ title, subtitle, cards: [{ label, head, body, tag }], callouts, notes });  // first card is dark
d.levels({ title, subtitle, levels: [{ label, tag, text, color: "green"|"amber"|"red" }], callouts, notes });
d.section({ part: "Part 1", title, subtitle });
d.screenshot({ title, subtitle, image: "screenshots/03-name.png", baseDir: __dirname, capture, pointAt, notes });
d.closing({ items: [{ head, body }], footer? });
await d.save("<Module>-Admin-Guide.pptx");
```

- `muted: true` greys the number — for an entry that is on screen but intentionally empty. Never use it to
  flag something unfinished: unfinished items stay out of the deck (they go to `engineering-notes.md`).
- **Card layout limits:** with 3 cards, a body that wraps overlaps the tag — keep 3-card bodies under ~45
  characters or use 2 cards. A card `label` over ~22 characters wraps into the head — keep labels short.
- `callouts` are the green boxes at the bottom: a bold claim + one line of why. 0–2 per slide.
- `notes` = one presenter sentence: what to stress when presenting this slide.
- `table` widths must add up to 11.9. Two columns default to 3.5 / 8.4.
- The library prints `[guide_deck] …` warnings when text is too long for its box. Fix every warning by
  shortening the text or splitting the slide — never ignore them.

## Content limits (what fits)

| Element | Max |
|---|---|
| Title | ~45 characters |
| Subtitle | one line, ~110 characters |
| `numbered` items | 6 (head ~80, body ~130 characters) |
| `table` rows | 8 comfortable, 16 max (then split into two slides) |
| `cards` body | ~170 characters (2 cards), ~120 (3 cards) |
| Callout body | ~220 characters |

## Screenshots

Each `screenshot` slide names a file `screenshots/NN-short-name.png` (NN = order in the deck). Until that file
exists, the slide shows a dashed "Screenshot to add" placeholder with the filename; the side panel says what
to capture ("What it shows") and what to notice ("Look at"). Capture the files yourself from the running
admin portal with `scripts/capture_screens.js` (SKILL.md step 7), then re-run `node build_deck.js` — they drop
in automatically. Placeholders are only acceptable when the portal cannot run. PNG or JPEG only.

Mobile-app screens (from Figma, `screenshots/app-NN-name.png`, subtitle starting "In the app —") are portrait;
the library lays them out automatically: phone centred in the left half, a narrower note box (6.67" x 4.62")
beside it. Crop very tall scrolling frames to the relevant part so the phone stays readable.

When checking renders through PowerPoint COM, never `Close()` or `Quit()` a presentation you did not open
yourself: `Presentations.Open` returns the user's already-open copy, and `Close()` discards their unsaved edits.
List `$pp.Presentations` first and skip any deck that is already open.
