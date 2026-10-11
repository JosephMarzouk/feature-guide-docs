# Writing voice

One voice across every deck and every RAG file in the series. The reader is club staff using the admin panel —
reception, operations, managers. No technical knowledge assumed. Write so they can act correctly and explain it
to a member.

## The rules

1. **Talk to the reader.** "You", present tense, plain English. "You reset it, and they set a new one themselves."
2. **Every subtitle makes a claim.** It tells the reader what to believe about the slide, not what the slide is.
3. **Short declarative sentences.** One idea each. Fragments are fine in bullets and cards.
4. **Use the exact on-screen label**, in bold in RAG files, spelled as the panel spells it — typos included
   (and say so once: "The sidebar really does read "Transcations History"").
5. **Give menu paths as `Module → Screen.`**
6. **Count things.** "Nine fields, and every one of them is required." "Three steps. The last one is the one that matters."
7. **Say what you cannot do, and why.** Limits are stated plainly and framed as design when they are:
   "That is a feature, not a gap."
8. **Name the danger.** Point out irreversible actions, money, and security: "the most damaging click in the
   admin panel", "Two things that cost real money", "A transfer is not reversible from here."
9. **Say where things really happen.** If a refund, a setting or a fix lives in another module, name it.
10. **Describe the feature as designed — label quirks only.** Keep on-screen label quirks, because staff see
    them: typos, two names for one screen ("The sidebar really does read "Transcations History""). Never write
    about bugs, unfinished work, permission gaps, fields that "do nothing", or anything "not implemented yet" /
    "no setting yet" — those go in `engineering-notes.md`, not in the guide. No "confirm with the technical
    team" caveats on designed behaviour.
11. **Connect admin settings to the member.** "Every field has one visible effect on the phone."
12. **Never mention** code, files, APIs, databases, the PRD, tickets, or developers' names. Say "the panel",
    "the app", "the system", "the technical team".
13. **Titles say what the items say.** A slide's title and subtitle match its items, and each item's head
    and body make the same point. "It lives in one module" must not sit over a body describing three screens.
14. **Give an example for every rule.** A window, a fee, a quota or a price is explained with numbers:
    "An invitation for 14/03/2026 works until 14/03/2026 23:59:59." Use the user stories' own examples first.

## Before → after

| Before | After |
|---|---|
| Subtitle: "Plan settings" | "The four fields that lock forever. Reopen a saved plan and these are greyed out." |
| Subtitle: "Overview of statuses" | "They sound alike and do completely different jobs. This is the pair people mix up." |
| "The system allows administrators to perform PIN resets." | "You reset it. The member sets a new one in the app." |
| "Refund functionality is not available in this module." | "Refunds do not happen here. A gym subscription is refunded from the Gym screens." |
| "The `isActive` flag toggles visibility." | "**Is Active** decides whether members can see the product at all." |
| "Per the PRD, capacity is enforced." | "When a group is full, the member lands on the waiting list instead." |
| "Note: be careful when deleting." | "Delete is the most damaging click in the panel. The member loses access at the gate immediately." |
| "The panel has no audience setting yet." | "Each banner is aimed at Guest, Member or Both. Guests only see banners meant for them." |
| "Two settings fields do nothing today." | "Set the yearly balance once. Every family gets it back on the reset date, e.g. 5 invitations every January 1." |
| "Nobody checks a permission here yet." | (nothing — the gap goes to engineering notes; the guide lists the permissions as designed) |

## Recurring phrases in the series (reuse them)

- Cover: "No technical knowledge needed."
- "In one minute" — "Five things that explain nearly everything about <Module>."
- "Setting <X> up" — "Out of order causes avoidable problems. Follow this sequence."
- "What you set → what the member sees" — "The heart of the guide. Every field has one visible effect on the phone."
- "The bookings table" — "A record, not a workflow."
- "Saving, and Arabic" — "Nothing on Main Info saves as you type."
- "When a member cannot <X>" — "Work down this list in order."
- Closing footer: "Unfamiliar word? The <Module> glossary page has every term, one line each."
- RAG footer: "Written against the live BR Clubs admin panel. Last reviewed YYYY-MM-DD."
