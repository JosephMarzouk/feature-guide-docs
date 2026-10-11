// Check a RAG module folder (Operations/<Module>) against references/rag-format.md.
// Usage: node rag_lint.js <folder-or-file> [...]   Exit code 1 if anything is flagged.
const fs = require("fs");
const path = require("path");

const LINE_RULES = [
  [/^\s*\|.*\|\s*$/, "table row — rewrite as `- **Term** — meaning` bullets"],
  [/!\[[^\]]*\]\([^)]*\)/, "image — RAG files carry no images"],
  [/^\s*>/, "blockquote/callout — make it a plain paragraph"],
  [/\[\[[^\]]+\]\]/, "wikilink — use the bold page title instead, e.g. **Wallets Management**"],
  [/\[Source:/i, "[Source: …] tag — remove"],
  [/^\s*[-*] \[[ x]\]/i, "checklist — remove"],
  [/^---\s*$/, "horizontal rule / frontmatter — remove"],
  [/\p{Extended_Pictographic}/u, "emoji — remove"],
  [/\bPRD\b|\bAPI\b|endpoint|\.(tsx?|dart|py)\b|\b(src|lib)\//, "technical reference (PRD, API, file path) — the reader never sees code"],
];

function lintFile(file) {
  const out = [];
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  const name = path.basename(file);
  let inCode = false;
  lines.forEach((l, i) => {
    if (/^```/.test(l)) return (inCode = !inCode);
    if (inCode) return;
    for (const [re, msg] of LINE_RULES) if (re.test(l)) out.push(`${i + 1}: ${msg}`);
    if (/^#{3,} /.test(l) && name === "faq.md") out.push(`${i + 1}: FAQ questions are ## headings`);
  });
  if (inCode) out.push("unclosed code block");
  const h1 = lines.filter((l) => /^# /.test(l));
  if (!/^# /.test(lines[0] || "")) out.push("1: file must start with a single # title");
  if (h1.length > 1) out.push(`${h1.length} H1 headings — only one allowed`);
  const h2 = lines.filter((l) => /^## /.test(l)).map((l) => l.slice(3).trim());
  if (h2[h2.length - 1] !== "About this document") out.push("last ## must be 'About this document'");
  if (!/Written against the live BR Clubs admin panel\. Last reviewed \d{4}-\d{2}-\d{2}\.\s*$/.test(text))
    out.push("must end with: Written against the live BR Clubs admin panel. Last reviewed YYYY-MM-DD.");
  if (name === "faq.md") {
    if (!/^# .+ FAQ$/.test(lines[0])) out.push("1: FAQ title must be '# <Module> FAQ'");
    h2.slice(0, -1).filter((q) => !q.includes("?")).forEach((q) => out.push(`FAQ heading is not a question: "${q}"`));
  } else if (name === "glossary.md") {
    if (!/^# .+ Glossary$/.test(lines[0])) out.push("1: glossary title must be '# <Module> Glossary'");
  } else {
    if (!h2.some((h) => / at a glance$/.test(h))) out.push("missing '## <Thing> at a glance' section");
    if (name !== "overview.md" && !/Part of the \*\*.+ Admin Panel\*\* guide\./.test(text))
      out.push("intro must say: Part of the **<Module> Admin Panel** guide.");
  }
  return out;
}

const files = process.argv.slice(2).flatMap((p) =>
  fs.statSync(p).isDirectory() ? fs.readdirSync(p).filter((f) => f.endsWith(".md")).map((f) => path.join(p, f)) : [p]
);
if (!files.length) { console.error("usage: node rag_lint.js <folder-or-file> [...]"); process.exit(2); }
let bad = 0;
for (const f of files) {
  const issues = lintFile(f);
  bad += issues.length;
  console.log(issues.length ? `✗ ${f}\n  ${issues.join("\n  ")}` : `✓ ${f}`);
}
const dirs = [...new Set(files.map(path.dirname))];
for (const d of dirs) for (const need of ["overview.md", "faq.md", "glossary.md"])
  if (fs.statSync(d).isDirectory() && !fs.existsSync(path.join(d, need)) && process.argv.slice(2).includes(d)) { console.log(`✗ ${d}: missing ${need}`); bad++; }
process.exit(bad ? 1 : 0);
