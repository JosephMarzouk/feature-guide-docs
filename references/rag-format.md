# RAG pack format

The chatbot's knowledge base is one zip per module. Every existing module (Academies, Access Control,
Assets Rental, CRM, Dining, Gym, Marketing, Performance Plus, Wallet) follows this format exactly, and
`scripts/rag_lint.js` passes on all 60 of their files. New files must too.

## Folder and files

```
<Module>-RAG.zip
└── Operations/<Module>/        # Module name hyphenated: Assets-Rental, Performance-Plus
    ├── overview.md             # "# <Module> Admin Panel" — start-here page for the module
    ├── <topic>.md              # one per screen or major topic: wallets.md, transactions.md, bookings.md, plans.md
    ├── faq.md                  # "# <Module> FAQ"
    └── glossary.md             # "# <Module> Glossary"
```

Topic file names are one or two short lowercase words (`main-info.md`, `waiting-list.md`), named after what
staff call the screen, not the route.

A feature that belongs to an existing module is added to that module's files: extend the relevant topic file
(or add one), and always add its questions to `faq.md` and its terms to `glossary.md`. Update the
"Last reviewed" date on every file you touch.

Mobile-app features go in the same place and format. They are still written for club staff: what the member
sees in the app, what they can and cannot do there, and how staff help them from the panel.

The RAG files describe the feature as the product designed it, exactly like the deck: no bugs, gaps,
"not yet", or permission-gap caveats. Those live in `engineering-notes.md`, which sits beside `Operations/`
in the pack folder — never inside `Operations/`, never in the zip. FAQ answers give the designed behaviour,
with an example wherever a rule involves dates, amounts or quotas.

## Shape of overview.md and topic files

```markdown
# Wallets Management

One row per member's wallet. This is where you look up a balance, check whether someone has set a PIN,
reset it when they forget, and change how much they can spend without entering it. Part of the **Wallet Admin Panel** guide.

## Wallets Management at a glance

- One row per member. Search by name, member ID or wallet ID.
- PIN Set tells you whether they have one — never what it is.
- Reset PIN clears it so the member can set a new one. You never see or choose it.
- Pinless Limit is how much they can spend without entering the PIN.
- You cannot type a new balance. Money moves by transfer or top-up.

## What the wallets table shows

Wallet → Wallets Management.

- **Wallet ID** — the reference. Quote it when asking for help.
- **Member** — whose wallet it is.
- **Balance** — what they have to spend right now.

PIN Set is a yes or no, and that is deliberate. Nobody in the panel can see a member's PIN — not you, not a
superadmin. If a member has forgotten theirs, the only route is a reset.

## Reset PIN

A member who has forgotten their PIN cannot be told it. You reset it, and they set a new one themselves.

1. You open Reset PIN on their row.
2. You confirm.
3. Their PIN is cleared.
4. The member sets a new one in the app.

## Common problems with wallets

- **The screen says "not authorised".** You lack read on Wallets Management.
- **A member forgot their PIN.** Reset it. They set the new one themselves.

## About this document

Written against the live BR Clubs admin panel. Last reviewed 2026-08-02.
```

Rules, in order:

1. `# Title` — overview: `<Module> Admin Panel`; topic: the screen name as it appears in the panel.
2. One intro paragraph: what the screen is for, in plain words. Topic files end it with
   `Part of the **<Module> Admin Panel** guide.` Overview says it is the start-here page of the series.
3. `## <Screen> at a glance` — exactly five short bullets, each a complete fact.
4. Body sections (`##`, with `###` inside when a section is long). Each heading names its subject in full
   ("Who can do what in Wallet", "Common questions about Wallet", "The pinless limit") so a chunk makes sense
   when retrieved on its own. The first section that describes a screen starts with the menu path on its own
   line: `Wallet → Wallets Management.`
5. `## Common problems with <thing>` — bullets: `- **Symptom as the admin would say it.** Cause and fix.`
6. `## About this document` then `Written against the live BR Clubs admin panel. Last reviewed YYYY-MM-DD.`

The overview also carries: the screens list (`- **Screen** — what it is for. See **Topic page title**.`),
the core concept of the module, `## What you can and cannot do` as two paragraphs ("You can …" / "You cannot …"),
`## Who can do what in <Module>`, and `## Common questions about <Module>` (bullets with bold question and
one-line answer), ending with `Unfamiliar word? Check the **<Module> Glossary**.`

## faq.md

```markdown
# Wallet FAQ

## Can I see a member's PIN?

No, never — not even as a superadmin. Nobody in the panel can view a member's PIN. If they've forgotten it,
the only option is to reset it so they can set a new one themselves in the app.

## About this document

Written against the live BR Clubs admin panel. Last reviewed 2026-08-02.
```

- Every question is an `##` phrased the way a staff member would type it into the chatbot.
- Answer: 1–4 conversational sentences that stand alone (repeat the screen name; never "see above").
- 12–20 questions per module. Cover: every "can I…?", every limitation, every dangerous action, every
  permission surprise, every "why does X show Y", every place money or refunds actually happen.

## glossary.md

```markdown
# Wallet Glossary

Every word the Wallet screens use, one line each, in plain language. Part of the **Wallet Admin Panel** guide.

## The basics

- **Wallet** — a member's balance inside the club. Everything they buy is paid from it.
- **Balance** — what the member has to spend right now.

## <Module> screen names and general terms

- **Wallets Management** — the list of every member's wallet.
- **Not authorised** — you lack read on that screen.

## About this document

Written against the live BR Clubs admin panel. Last reviewed 2026-08-02.
```

Group terms under 3–5 `##` headings. Every UI label, status, and field name that appears in the deck is here,
spelled exactly as on screen.

## Never in a RAG file

- Frontmatter, `---` rules, tables (use `- **Term** — meaning` bullets), blockquotes / callouts (make them
  plain paragraphs), images or screenshot notes, emojis, checklists.
- `[[wikilinks]]` — refer to another page by its bold title: `see **Transactions History**`.
- `[Source: …]` tags, file paths, API names, "the PRD says" — the reader never sees code or documents.

Run `node <skill>/scripts/rag_lint.js Operations/<Module>` and fix everything it flags.
