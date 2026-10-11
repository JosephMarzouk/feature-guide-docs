// Example build script: the Wallet guide, recreated with guide_deck.js.
// Copy this to docs-output/<Module>/build_deck.js, change the require path to the skill's
// scripts/guide_deck.js, replace the content, then: node build_deck.js
const path = require("path");
const { GuideDeck } = require(path.join(__dirname, "..", "scripts", "guide_deck.js"));

const d = new GuideDeck({ module: "Wallet" });
const here = __dirname; // screenshots/ resolves relative to this script

d.cover({
  tagline: "Where every member’s money lives — how to look it up, reset a PIN, and read the history.",
  chips: ["Wallets", "Transactions", "Settings"],
  footer: "Written against the live admin panel · last updated 2026-08-02",
  notes: "Set expectations early: this is a lookup tool, not a control panel.",
});

d.numbered({
  title: "In one minute",
  subtitle: "Five things that explain nearly everything about Wallet.",
  items: [
    { head: "Every member has one wallet.", body: "Everything they buy anywhere in the club is paid from it." },
    { head: "Three screens.", body: "Wallets Management · Transcations History · Wallet Settings." },
    { head: "The module is read-mostly.", body: "Look up balances, reset a PIN, transfer. Not much else." },
    { head: "One setting in the whole module.", body: "The pinless limit new wallets start with." },
    { head: "Nothing here can be edited or deleted.", body: "The history is a record, not a workspace." },
  ],
  notes: "If the audience remembers one slide, it is this one.",
});

d.cards({
  title: "What you can and cannot do",
  subtitle: "The boundary is deliberate, and worth stating plainly.",
  cards: [
    { label: "You can", head: "Look up, reset, transfer, read.", body: "Any member’s wallet and balance · whether they have set a PIN · reset it · transfer between wallets.", tag: "Mostly reading" },
    { label: "You cannot", head: "Edit money, or see a PIN.", body: "Type a new balance · see or choose a PIN · change or delete a transaction · refund from here.", tag: "By design" },
  ],
  callouts: [{ head: "Refunds do not happen in this module.", body: "A gym subscription is refunded from the Gym screens, a court booking from Assets Rental. The refund then appears here as a transaction." }],
});

d.section({ part: "Part 1", title: "Wallets Management", subtitle: "One row per member: balance, PIN, pinless limit." });

d.table({
  title: "The wallets table",
  subtitle: "One row per member’s wallet.",
  columns: ["Column", "What it tells you"],
  rows: [
    ["Wallet ID", "The reference. Quote it when asking for help"],
    ["Member", "Whose wallet it is"],
    ["Balance", "What they have to spend right now"],
    ["PIN Set", "Whether they have set a PIN at all"],
    ["Pinless Limit", "How much they can spend without entering it"],
  ],
  callouts: [{ head: "PIN Set is a yes or no, and that is deliberate.", body: "Nobody in the panel can see a member’s PIN — not you, not a superadmin. If a member has forgotten theirs, the only route is a reset." }],
});

d.screenshot({
  title: "Reset PIN",
  subtitle: "Clears the PIN. The member sets a new one in the app.",
  image: "screenshots/04-reset-pin.png",
  baseDir: here,
  capture: "The Reset PIN window opened from a member’s row in Wallets Management.",
  pointAt: "There is no field to type a PIN — the window resets, it does not set.",
});

d.levels({
  title: "The pinless limit",
  subtitle: "How much a member can spend without entering their PIN.",
  levels: [
    { label: "0", tag: "Tightest", text: "Every payment needs the PIN", color: "green" },
    { label: "A small amount", tag: "Usual", text: "Coffee and snacks go through; larger spends need the PIN", color: "amber" },
    { label: "A large amount", tag: "Loosest", text: "Almost nothing needs the PIN", color: "red" },
  ],
  callouts: [{ head: "This is the security dial for the whole wallet.", body: "If their phone is lost, the pinless limit is exactly how much a stranger can spend before anything stops them." }],
});

d.table({
  title: "Who can do what",
  subtitle: "Two permission areas, and one screen that asks for a third.",
  columns: ["Area", "Actions", "Covers"],
  widths: [3.8, 3.5, 4.6],
  rows: [
    ["Wallets Management", "read, update", "The table, balances, PIN reset, pinless limit"],
    ["Wallet Settings", "read, update", "The one setting"],
  ],
  callouts: [
    { head: "Transcations History asks for a permission that does not exist.", body: "For anyone who is not a superadmin the screen refuses — and no permission can be granted to fix it." },
    { head: "Worth knowing before you promise someone access to the history.", body: "Confirm the behaviour with the technical team before repeating it — the panel may have been updated since this guide was written." },
  ],
});

d.closing({
  items: [
    { head: "Read-mostly by design", body: "Look up, reset, transfer. The spending happens in other modules." },
    { head: "Nobody can see a PIN", body: "You reset it; the member sets the new one." },
    { head: "The pinless limit is a security dial", body: "It is how much a lost phone can spend before anything stops it." },
    { head: "Follow the Module column", body: "It tells you which module took the money — and can refund it." },
    { head: "Transfers do not reverse", body: "Search by wallet ID, and read it back before confirming." },
  ],
});

d.save(path.join(here, "Wallet-Admin-Guide-example.pptx"));
