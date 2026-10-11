// BR Clubs admin guide deck — the series theme, locked.
// Geometry, colours and fonts are measured from the existing series decks (Wallet, Gym).
// Content goes in; layout never changes per deck. See references/deck-format.md.
const fs = require("fs");
const path = require("path");
const PptxGenJS = require("pptxgenjs");

const C = {
  dark: "3D2320", accent: "B85042", text: "2B2321", muted: "7A6A64", border: "E8DFD6",
  card: "FBF6F2", sage: "A7BEAE", cream: "E7E8D1", calloutBg: "F0F4F0", white: "FFFFFF",
  grey: "8A8F94", green: "2F8F5B", amber: "C9A227", red: "C0392B",
};
const HEAD = "Cambria", BODY = "Calibri";
const X = 0.7, W = 11.9, BOTTOM = 6.95;

// Rounded corners as in the series: a fixed fraction of the shape's short side.
const rr = (w, h, adj = 2222) => (adj / 100000) * Math.min(w, h);

// ponytail: length check is a char-count heuristic, not a real text measure; render the deck to confirm.
function warnLong(where, text, max) {
  if (text && text.length > max) console.warn(`[guide_deck] ${where}: ${text.length} chars (max ~${max}) — "${text.slice(0, 50)}…"`);
}

class GuideDeck {
  constructor({ module }) {
    this.module = module;
    this.p = new PptxGenJS();
    this.p.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
    this.n = 0;
  }

  _slide(bg, notes) {
    const s = this.p.addSlide();
    s.background = { color: bg };
    if (notes) s.addNotes(notes);
    this.n++;
    return s;
  }

  _text(s, text, x, y, w, h, o = {}) {
    s.addText(text, {
      x, y, w, h, margin: 0, valign: o.valign || "middle", fit: "none",
      fontFace: o.face || BODY, fontSize: o.size || 13, color: o.color || C.text,
      bold: !!o.bold, italic: !!o.italic, align: o.align || "left", charSpacing: o.spacing,
    });
  }

  _box(s, x, y, w, h, fill, line, shadow) {
    s.addShape(this.p.ShapeType.roundRect, {
      x, y, w, h, fill: { color: fill }, line: { color: line || fill, width: 1 }, rectRadius: rr(w, h),
      shadow: shadow ? { type: "outer", blur: 10, offset: 0.04, angle: 90, color: "000000", opacity: 0.1 } : undefined,
    });
  }

  _header(s, title, subtitle) {
    warnLong(`slide ${this.n} title`, title, 48);
    warnLong(`slide ${this.n} subtitle`, subtitle, 120);
    this._text(s, title, X, 0.42, W, 0.72, { face: HEAD, size: 34, bold: true });
    if (subtitle) this._text(s, subtitle, X, 1.16, W, 0.42, { size: 14, color: C.muted });
  }

  // Green callout(s) stacked from `y`. Returns the y after the last one.
  _callouts(s, callouts = [], y) {
    for (const c of callouts) {
      warnLong(`slide ${this.n} callout body`, c.body, 230);
      const h = c.body ? 1.0 : 0.6;
      this._box(s, X, y, W, h, C.calloutBg, C.sage);
      this._text(s, c.head, 1.05, y + 0.12, 11.2, 0.32, { size: 14.5, bold: true, color: C.dark });
      if (c.body) this._text(s, c.body, 1.05, y + 0.46, 11.2, 0.5, { size: 13 });
      y += h + 0.2;
    }
    return y;
  }

  _calloutsHeight(callouts = []) {
    return callouts.reduce((t, c) => t + (c.body ? 1.0 : 0.6) + 0.2, 0);
  }

  cover({ tagline, chips = [], footer, notes }) {
    const s = this._slide(C.dark, notes);
    s.addShape(this.p.ShapeType.ellipse, { x: 9.9, y: -1.5, w: 5.6, h: 5.6, fill: { color: C.accent, transparency: 55 }, line: { type: "none" } });
    s.addShape(this.p.ShapeType.ellipse, { x: 11.4, y: 4.4, w: 3.4, h: 3.4, fill: { color: C.sage, transparency: 70 }, line: { type: "none" } });
    this._text(s, "BR CLUBS  ·  ADMIN PANEL", X, 1.55, 8.6, 0.35, { size: 13, bold: true, color: C.sage, spacing: 3 });
    this._text(s, this.module, X, 2.0, 8.6, 1.15, { face: HEAD, size: 66, bold: true, color: C.white });
    this._text(s, tagline, X, 3.25, 8.2, 0.9, { size: 18, color: C.cream });
    this._text(s, "No technical knowledge needed.", X, 4.15, 8.2, 0.4, { size: 15, italic: true, color: C.sage });
    chips.slice(0, 5).forEach((c, i) => {
      const x = X + i * 2.05;
      s.addShape(this.p.ShapeType.roundRect, { x, y: 5.15, w: 1.85, h: 0.5, fill: { color: C.white, transparency: 88 }, line: { color: C.sage, width: 1 }, rectRadius: rr(1.85, 0.5, 12000) });
      this._text(s, c, x, 5.15, 1.85, 0.5, { size: 12, bold: true, color: C.white, align: "center" });
    });
    this._text(s, footer || "", X, 6.92, W, 0.3, { size: 9.5, color: C.sage });
  }

  // Numbered rows. Used for: In one minute, The screens, Setting X up, Step-by-step forms,
  // "When a member cannot … work down this list". item.muted = grey number (dead/empty entries).
  numbered({ title, subtitle, items, callouts = [], notes }) {
    const s = this._slide(C.white, notes);
    this._header(s, title, subtitle);
    const top = items.length >= 6 ? 1.75 : 1.85, gap = 0.1;
    const avail = BOTTOM - top - this._calloutsHeight(callouts) + (callouts.length ? 0.1 : 0);
    const h = Math.min(1.0, (avail - gap * (items.length - 1)) / items.length);
    let y = top;
    items.forEach((it, i) => {
      warnLong(`slide ${this.n} item ${i + 1} head`, it.head, 90);
      warnLong(`slide ${this.n} item ${i + 1} body`, it.body, 140);
      this._box(s, X, y, W, h, C.card, C.border);
      const cy = y + h / 2;
      s.addShape(this.p.ShapeType.ellipse, { x: 0.98, y: cy - 0.23, w: 0.46, h: 0.46, fill: { color: it.muted ? C.grey : C.accent }, line: { type: "none" } });
      this._text(s, String(i + 1), 0.98, cy - 0.23, 0.46, 0.46, { size: 14, bold: true, color: C.white, align: "center" });
      if (it.body) {
        this._text(s, it.head, 1.65, cy - 0.34, 10.6, 0.34, { size: 15, bold: true });
        this._text(s, it.body, 1.65, cy, 10.6, 0.34, { size: 12.5, color: C.muted });
      } else {
        this._text(s, it.head, 1.65, cy - 0.17, 10.6, 0.34, { size: 15, bold: true });
      }
      y += h + gap;
    });
    this._callouts(s, callouts, y + 0.1);
  }

  // Table with dark header row. Used for: field tables, "What you set → what the member sees",
  // "A worked example" (with caption), "Who can do what", Troubleshooting.
  table({ title, subtitle, columns, rows, widths, callouts = [], caption, notes }) {
    const s = this._slide(C.white, notes);
    this._header(s, title, subtitle);
    const top = rows.length > 8 ? 1.7 : 1.85;
    const reserved = this._calloutsHeight(callouts) + (caption ? 0.55 : 0);
    const rowH = Math.min(0.48, Math.max(0.3, (BOTTOM - top - reserved - 0.15) / (rows.length + 1)));
    if (rowH === 0.3 && (rows.length + 1) * 0.3 > BOTTOM - top - reserved) console.warn(`[guide_deck] slide ${this.n}: ${rows.length} rows is too many — split the table`);
    const cw = widths || (columns.length === 2 ? [3.5, 8.4] : columns.map(() => W / columns.length));
    const cell = (t, o) => ({ text: t, options: { fontFace: BODY, valign: "middle", margin: [0, 0.12, 0, 0.12], ...o } });
    const border = { type: "solid", pt: 1, color: C.border };
    const data = [
      columns.map((t) => cell(t, { bold: true, fontSize: 11.5, color: C.white, fill: { color: C.dark } })),
      ...rows.map((r) => r.map((t, j) => cell(t, { bold: j === 0, fontSize: 11, color: C.text, fill: { color: C.card } }))),
    ];
    s.addTable(data, { x: X, y: top, w: W, colW: cw, rowH, border });
    let y = top + rowH * (rows.length + 1) + 0.25;
    if (caption) {
      this._text(s, caption, X, y, W, 0.4, { size: 13, italic: true, color: C.muted });
      y += 0.55;
    }
    this._callouts(s, callouts, y);
  }

  // 2 or 3 side-by-side cards; the first is dark. Used for: can/cannot, two actions,
  // "X vs Y", "What you cannot do here", permission splits.
  cards({ title, subtitle, cards, callouts = [], notes }) {
    const s = this._slide(C.white, notes);
    this._header(s, title, subtitle);
    const three = cards.length === 3;
    const w = three ? 3.8 : 5.7, h = three ? 2.6 : 2.8, step = three ? 4.05 : 6.2, pad = three ? 0.3 : 0.35;
    const tw = w - 2 * pad, y = 1.85;
    cards.forEach((c, i) => {
      const x = X + i * step, dark = i === 0;
      warnLong(`slide ${this.n} card ${i + 1} body`, c.body, three ? 120 : 170);
      this._box(s, x, y, w, h, dark ? C.dark : C.card, dark ? C.dark : C.border, true);
      this._text(s, c.label, x + pad, y + 0.2, tw, 0.5, { face: HEAD, size: three ? 20 : 26, bold: true, color: dark ? C.sage : C.accent });
      this._text(s, c.head, x + pad, y + (three ? 0.75 : 0.77), tw, three ? 0.7 : 0.6, { size: three ? 13.5 : 14.5, bold: true, color: dark ? C.white : C.text });
      this._text(s, c.body, x + pad, y + (three ? 1.55 : 1.45), tw, three ? 0.8 : 0.6, { size: three ? 12.5 : 13, color: dark ? C.cream : C.muted });
      if (c.tag) this._text(s, c.tag, x + pad, y + h - 0.65, tw, 0.4, { size: 13, italic: true, color: dark ? C.sage : C.accent });
    });
    this._callouts(s, callouts, y + h + 0.25);
  }

  // A scale of settings, tightest to loosest (e.g. pinless limit 0 / small / large).
  levels({ title, subtitle, levels, callouts = [], notes }) {
    const s = this._slide(C.white, notes);
    this._header(s, title, subtitle);
    const pill = { green: C.green, amber: C.amber, red: C.red, grey: C.grey, accent: C.accent };
    let y = 1.9;
    for (const l of levels) {
      this._box(s, X, y, W, 0.6, C.card, C.border);
      s.addShape(this.p.ShapeType.roundRect, { x: 0.9, y: y + 0.12, w: 2.4, h: 0.36, fill: { color: pill[l.color] || C.accent }, line: { type: "none" }, rectRadius: rr(2.4, 0.36, 12000) });
      this._text(s, l.label, 0.9, y + 0.12, 2.4, 0.36, { size: 12, bold: true, color: C.white, align: "center" });
      this._text(s, l.tag || "", 3.5, y + 0.05, 1.2, 0.5, { size: 12, italic: true, color: C.muted });
      this._text(s, l.text, 4.8, y + 0.05, 7.5, 0.5, { size: 13 });
      y += 0.75;
    }
    this._callouts(s, callouts, y + 0.35);
  }

  section({ part, title, subtitle, notes }) {
    const s = this._slide(C.accent, notes);
    s.addShape(this.p.ShapeType.ellipse, { x: 10.2, y: 1.1, w: 4.6, h: 4.6, fill: { color: C.white, transparency: 88 }, line: { type: "none" } });
    this._text(s, part, X, 2.5, 8.0, 0.42, { size: 14, bold: true, color: C.cream, spacing: 3 });
    this._text(s, title, X, 2.95, 9.0, 1.0, { face: HEAD, size: 48, bold: true, color: C.white });
    if (subtitle) this._text(s, subtitle, X, 4.0, 8.6, 0.7, { size: 17, color: C.cream });
  }

  // Screenshot slide. If `image` exists (relative to the build script's folder) it is placed;
  // otherwise a dashed placeholder tells the reader exactly what to capture and where to save it.
  screenshot({ title, subtitle, image, capture, pointAt, baseDir = process.cwd(), notes }) {
    const s = this._slide(C.white, notes);
    this._header(s, title, subtitle);
    const bx = X, by = 1.85, bw = 8.3, bh = BOTTOM - by;
    const file = image && path.resolve(baseDir, image);
    let px = bx + bw + 0.35, pw = X + W - px;
    if (file && fs.existsSync(file)) {
      const { w: iw, h: ih } = imageSize(file);
      const k = Math.min(bw / iw, bh / ih), w = iw * k, h = ih * k;
      // Phone (portrait) shots: phone centred at 3.23", note box at 6.67" x 4.62" (layout approved on Guest View slide 26).
      const portrait = ih > iw, ix = portrait ? 3.23 - w / 2 : bx;
      if (portrait) { px = 6.67; pw = 4.62; }
      s.addImage({ path: file, x: ix, y: by + (bh - h) / 2, w, h });
      s.addShape(this.p.ShapeType.rect, { x: ix, y: by + (bh - h) / 2, w, h, fill: { type: "none" }, line: { color: C.border, width: 1 } });
    } else {
      s.addShape(this.p.ShapeType.roundRect, { x: bx, y: by, w: bw, h: bh, fill: { color: C.card }, line: { color: C.muted, width: 1.5, dashType: "dash" }, rectRadius: rr(bw, bh) });
      this._text(s, "Screenshot to add", bx, by + bh / 2 - 0.6, bw, 0.4, { face: HEAD, size: 20, bold: true, color: C.accent, align: "center" });
      this._text(s, image || "", bx, by + bh / 2 - 0.1, bw, 0.35, { size: 13, color: C.muted, align: "center" });
    }
    this._box(s, px, by, pw, bh, C.card, C.border);
    this._text(s, "What it shows", px + 0.25, by + 0.25, pw - 0.5, 0.4, { face: HEAD, size: 16, bold: true, color: C.accent });
    this._text(s, capture || "", px + 0.25, by + 0.7, pw - 0.5, 1.9, { size: 13, color: C.text, valign: "top" });
    if (pointAt) {
      this._text(s, "Look at", px + 0.25, by + 2.8, pw - 0.5, 0.4, { face: HEAD, size: 16, bold: true, color: C.accent });
      this._text(s, pointAt, px + 0.25, by + 3.25, pw - 0.5, 1.6, { size: 13, color: C.text, valign: "top" });
    }
  }

  closing({ items, footer, notes }) {
    const s = this._slide(C.dark, notes);
    s.addShape(this.p.ShapeType.ellipse, { x: -1.6, y: 4.3, w: 4.4, h: 4.4, fill: { color: C.accent, transparency: 65 }, line: { type: "none" } });
    this._text(s, `Remember these ${WORDS[items.length] || items.length}`, X, 0.6, W, 0.8, { face: HEAD, size: 36, bold: true, color: C.white });
    const rows = Math.ceil(items.length / 2), gapY = 0.28;
    const h = Math.min(1.4, (6.55 - 1.65 - gapY * (rows - 1)) / rows);
    items.forEach((it, i) => {
      const x = i % 2 ? 6.85 : X, y = 1.65 + Math.floor(i / 2) * (h + gapY);
      s.addShape(this.p.ShapeType.roundRect, { x, y, w: 5.75, h, fill: { color: C.white, transparency: 92 }, line: { color: C.sage, width: 1 }, rectRadius: rr(5.75, h) });
      s.addShape(this.p.ShapeType.ellipse, { x: x + 0.28, y: y + 0.24, w: 0.46, h: 0.46, fill: { color: C.sage }, line: { type: "none" } });
      this._text(s, String(i + 1), x + 0.28, y + 0.24, 0.46, 0.46, { size: 14, bold: true, color: C.dark, align: "center" });
      this._text(s, it.head, x + 0.92, y + 0.2, 4.55, 0.52, { size: 15, bold: true, color: C.white });
      this._text(s, it.body, x + 0.3, y + 0.78, 5.15, 0.5, { size: 12.5, color: C.cream });
    });
    this._text(s, footer || `Unfamiliar word? The ${this.module} glossary page has every term, one line each.`, X, 6.8, W, 0.35, { size: 11, italic: true, color: C.sage });
  }

  save(file) {
    return this.p.writeFile({ fileName: file }).then(() => console.log(`wrote ${file} (${this.n} slides)`));
  }
}

const WORDS = { 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven" };

// PNG/JPEG pixel size without extra dependencies.
function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) === 0x89504e47) return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  for (let i = 2; i < b.length; ) {
    const marker = b[i + 1], len = b.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  throw new Error(`Unsupported image (use PNG or JPEG): ${file}`);
}

module.exports = { GuideDeck };
