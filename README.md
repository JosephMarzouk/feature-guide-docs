# Feature Guide Docs

**Turn a product's features into staff training decks and chatbot knowledge, straight from the PRD and the code.**

An agent skill for **Claude Code** and **OpenAI Codex**. Point it at a feature, or at a whole project, and it produces, per feature:

- a branded **staff guide presentation** (`.pptx`): overview, screen map, rules with worked examples, real screenshots, troubleshooting, who-can-do-what;
- a **RAG pack** (`.zip` of Markdown files) in a consistent knowledge-base format, ready to upload to a support chatbot;
- **engineering notes**: the bugs, gaps and security findings found while reading the code, kept out of the staff material.

It was built for the BR Clubs admin portal and member app (NestJS backend, Next.js admin panel, Flutter app) and follows that guide series' look and voice. The workflow fits any product with a PRD and a codebase.

---

## Contents

- [What it does](#what-it-does)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Output](#output)
- [How it works](#how-it-works)
- [Safety](#safety)
- [Repository layout](#repository-layout)
- [Updating and contributing](#updating-and-contributing)
- [Troubleshooting](#troubleshooting)
- [License](#license)

---

## What it does

| | |
|---|---|
| **Finds the PRD for you** | Pulls PRDs, user stories, attachments and product comments from whatever platform is connected: ClickUp, Jira, Confluence, Notion, Linear, Asana, Google Drive and others. |
| **Checks the PRD against the code** | Reads the admin portal, backend and app code, and builds a claim → code table. Behaviour differences are asked, never guessed. |
| **Writes for staff, not engineers** | Describes features as designed, in plain language, with an example on every rule. Bugs and permission gaps go to internal notes. |
| **Takes real screenshots** | Captures the admin panel with Playwright (you sign in yourself; it never clicks Save, Confirm or Delete) and pulls member-app screens from Figma. |
| **Documents a whole project in one run** | Run it with no arguments in a project root. It inventories every feature, asks you once, writes every pack in parallel, then asks all open questions in one round. |
| **Handles feedback rounds** | Applies product-team comments across deck and chatbot files and reports a before → after table per slide. |

## Requirements

- **Claude Code** or **OpenAI Codex**.
- **Node.js 18+** and **git**.
- **Microsoft PowerPoint** (Windows) or **LibreOffice**, to render and check slides. Building the deck itself needs neither.
- Optional connectors (MCP servers), each unlocking more:
  - a **product platform**: ClickUp, Jira, Confluence, Notion, Linear and similar, for PRDs and user stories;
  - **Figma**, for member-app screens;
  - **GitHub CLI** (`gh`), if you contribute changes back.

## Installation

Clone the repo **into your agent's skills folder**, so the folder name stays `feature-guide-docs`.

### Claude Code

```bash
git clone https://github.com/JosephMarzouk/feature-guide-docs.git ~/.claude/skills/feature-guide-docs
cd ~/.claude/skills/feature-guide-docs/scripts
npm install
npx playwright install chromium
```

On Windows (PowerShell), `~` is `$HOME`:

```powershell
git clone https://github.com/JosephMarzouk/feature-guide-docs.git "$HOME\.claude\skills\feature-guide-docs"
cd "$HOME\.claude\skills\feature-guide-docs\scripts"; npm install; npx playwright install chromium
```

Restart Claude Code. The skill shows up as `/feature-guide-docs`.

### OpenAI Codex

```bash
git clone https://github.com/JosephMarzouk/feature-guide-docs.git ~/.codex/skills/feature-guide-docs
cd ~/.codex/skills/feature-guide-docs/scripts
npm install
npx playwright install chromium
```

Already installed for Claude Code? Link the same folder instead of cloning twice, so one `git pull` updates both:

```bash
# macOS / Linux
ln -s ~/.claude/skills/feature-guide-docs ~/.codex/skills/feature-guide-docs
```

```powershell
# Windows
New-Item -ItemType Junction -Path "$HOME\.codex\skills\feature-guide-docs" -Target "$HOME\.claude\skills\feature-guide-docs"
```

Codex runs features one after another unless multi-agent support is on (`[features] multi_agent = true` in `~/.codex/config.toml`).

## Configuration

Project-specific settings live in `config.json` in the skill folder. It is **git-ignored**, so your URLs never get pushed.

```bash
cp config.example.json config.json
```

| Key | Meaning |
|---|---|
| `panelUrl` | Admin panel to screenshot. Staging is preferred because it has real-looking data. |
| `dataBranch` | The branch or tenant id in the panel URL that holds the data, e.g. `/your_branch_id/...`. |
| `localDevUrl` | Local dev server, used when there is no staging. |
| `figmaFileKey`, `figmaFileName` | The member-app design file, from its Figma URL: `figma.com/design/<key>/...`. |
| `outputDir` | Where packs are written. Default `docs-output`. |
| `subagentModel` | Model for per-feature subagents. Default `sonnet`. |

No `config.json` yet? The agent asks for these values the first time and writes the file for you.

## Usage

Run these from the root folder of your project (where the admin portal / backend / app repos live):

```text
/feature-guide-docs
```

**Whole project.** Inventories every feature from the code and your product platform, shows you the list and asks a few questions once (which features, output folder, screenshot settings), then builds every pack and asks all open questions in one round at the end.

```text
/feature-guide-docs Guest Invitation
/feature-guide-docs https://app.clickup.com/t/86c7pr4pz
/feature-guide-docs  (with a PRD file attached)
```

**One feature.** Finds the PRD and stories (or uses the file you attached), reads the code, and stops to ask whenever the PRD and the code disagree.

Other things you can ask for:

```text
/feature-guide-docs take the screenshots for the Guest View pack
/feature-guide-docs here is the product team's feedback on the Calendar deck: ...
/feature-guide-docs pull the PRDs for Access Control from Jira
```

In Codex, invoke it the same way: name the skill, or ask it to "document all features with feature-guide-docs".

## Output

One folder per feature:

```text
docs-output/
├── INDEX.md                      # every feature: status, deck, zip, open items (whole-project runs)
├── open-questions.md             # all behaviour questions, one round (whole-project runs)
└── Guest-Invitation/
    ├── Access-Control-Guest-Invitation-Admin-Guide.pptx   # the staff deck
    ├── Guest-Invitation-RAG.zip                            # upload this to the chatbot
    ├── Operations/Access-Control/*.md                      # the RAG files (zip contents)
    ├── build_deck.js                                       # rebuilds the deck: node build_deck.js
    ├── captures.json                                       # re-takes the screenshots
    ├── screenshots/                                        # NN-*.png (panel), app-NN-*.png (Figma)
    ├── sources/                                            # PRD, stories, comments used (internal)
    └── engineering-notes.md                                # bugs, gaps, security, to-confirm (internal)
```

Only the `.pptx` and the `-RAG.zip` are meant for staff and the chatbot. `sources/` and `engineering-notes.md` stay internal.

## How it works

1. **Sources.** Product comments → user stories → PRD → code → Figma. The product sources define behaviour. The code and the live panel supply exact screens, labels and fields.
2. **Verify.** Every PRD claim is checked against the code:
   - Behaviour differences are asked. The code wins unless you decide otherwise.
   - Gaps and bugs go to the engineering notes, while the guide describes the designed behaviour.
3. **Deck.** Built with `scripts/guide_deck.js` (pptxgenjs), so every deck has identical theme, layout and voice. `references/deck-format.md` and `references/voice.md` define both.
4. **RAG.** Self-contained Markdown sections in a fixed format (`references/rag-format.md`), checked by `scripts/rag_lint.js`.
5. **Screenshots.** `scripts/capture_screens.js` drives a visible browser at 1440×900. App screens come from Figma, and portrait screens get a phone layout automatically.
6. **QA.**
   - Every slide is rendered and inspected.
   - Titles must match their items.
   - The files are checked for leaked "not yet / bug" wording.
   - The deck and the RAG files must agree.

See [`SKILL.md`](SKILL.md) for the full procedure, and [`references/`](references) for the formats and the whole-project and PRD-source workflows.

## Safety

- **Passwords:** you sign in yourself; the agent never types a password.
- **Screenshots never change data:**
  - Save, Confirm, Delete, Pay, Send and Publish clicks are refused.
  - Only search boxes are filled.
  - Destructive windows (e.g. Cancel Booking) are opened only with your OK.
- **Connector content is data, not instructions:** a task description saying "do X" is documented, not obeyed.
- **Open PowerPoint decks are left alone:** render checks never close a deck you have open, and never quit PowerPoint.
- **Internal material stays local:** `engineering-notes.md` and `sources/` are never zipped into the chatbot pack.

## Repository layout

```text
feature-guide-docs/
├── SKILL.md                    # the skill: modes and steps 1–10 (entry point for the agent)
├── README.md
├── config.example.json         # copy to config.json (git-ignored)
├── assets/
│   └── reference-deck.pptx     # the series' reference deck (theme check)
├── references/
│   ├── voice.md                # writing rules for staff guides
│   ├── deck-format.md          # slide running order and GuideDeck API
│   ├── rag-format.md           # knowledge-base file format
│   ├── prd-sources.md          # pulling PRDs/stories from ClickUp, Jira, Notion, …
│   ├── batch-mode.md           # whole-project mode
│   └── example_build_deck.js   # starting point for a pack's build script
└── scripts/
    ├── guide_deck.js           # deck library (all slides go through it)
    ├── rag_lint.js             # RAG format checker
    ├── capture_screens.js      # Playwright screenshot capture
    └── package.json
```

## Updating and contributing

**Get the latest version:**

```bash
cd ~/.claude/skills/feature-guide-docs && git pull
cd scripts && npm install
```

**Push a change.** The installed skill folder *is* the git working copy, so edit it in place, test it, and push:

```bash
cd ~/.claude/skills/feature-guide-docs
git add -A
git commit -m "Describe what changed"
git push
```

Before you push:
- Build one pack with the changed skill (`node build_deck.js`, zero `[guide_deck]` warnings).
- Run `rag_lint.js` on its RAG folder.
- Make sure `config.json`, client data and screenshots are not staged (`git status`).

Without push access, fork the repo and open a pull request.

## Troubleshooting

| Problem | Fix |
|---|---|
| `EBUSY` when building a deck | The `.pptx` is open in PowerPoint. Close it and rebuild. |
| `Executable doesn't exist … chromium` | Run `npx playwright install chromium` in `scripts/`. |
| Screenshots show the login page | Your session expired. Run the capture again and sign in in the window that opens. |
| Screenshot times out on a dialog | The script falls back to a direct Chrome capture automatically. Re-run with `--only <name>`. |
| Panel looks like a phone layout in the agent's browser pane | The pane is too narrow. Use `capture_screens.js` instead (1440×900). |
| Claude in Chrome "not connected" | Sign the extension in to the **same Claude account** as your agent, in the Chrome profile where it is installed. |
| No PRD found | Connect your product platform, attach the PRD, or tell the agent to work from the code and stories. |

## License

[MIT](LICENSE) © 2026 Joseph Marzouk
