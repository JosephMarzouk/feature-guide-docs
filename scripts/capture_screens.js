// Capture admin-portal screenshots for a guide pack.
// Usage: node capture_screens.js <pack>/captures.json [--base http://localhost:3000] [--branch <branch_id>] [--only 03-name]
//
// captures.json: [{ "out": "screenshots/03-name.png", "path": "/access-control/settings",
//                   "steps": [{ "click": "text=Create" }, { "wait": 800 }, { "press": "Escape" }] }]
// `path` is relative to /<branch_id>; `out` is relative to the captures.json folder.
// Steps: click, fill+text (search boxes only), hover, press, scroll, wait. "settle": ms after load.
// "dump": true also writes <out>.txt with the page text and its buttons/tabs/links (for recon).
// A visible browser opens; the USER signs in. The login is kept in a profile folder for later runs.
// Clicks on Submit / Confirm / Save / Delete / Pay are refused — screenshots never change data.
const fs = require("fs");
const os = require("os");
const path = require("path");
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const file = args.find((a) => a.endsWith(".json"));
if (!file) { console.error("usage: node capture_screens.js <captures.json> [--base URL] [--only NAME]"); process.exit(2); }
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
// Defaults come from the skill's config.json (panelUrl, dataBranch); flags override them.
let cfg = {};
try { cfg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config.json"), "utf8")); } catch {}
const base = opt("--base", cfg.panelUrl || cfg.localDevUrl || "http://localhost:3000").replace(/\/$/, "");
const only = opt("--only", null);
const forceBranch = opt("--branch", cfg.dataBranch || null);
const root = path.dirname(path.resolve(file));
const captures = JSON.parse(fs.readFileSync(file, "utf8")).filter((c) => !only || c.out.includes(only));
const RISKY = /submit|confirm|save|delete|remove|pay\b|send|publish/i;

(async () => {
  const profile = path.join(os.tmpdir(), "feature-guide-docs-profile");
  const ctx = await chromium.launchPersistentContext(profile, { headless: false, viewport: { width: 1440, height: 900 } });
  const page = ctx.pages()[0] || (await ctx.newPage());
  await page.goto(base);

  // Wait for the user to sign in: a URL like /<branch_id>/... that is not a login page.
  let branch = null;
  for (let i = 0; i < 600 && !branch; i++) {
    const m = new URL(page.url()).pathname.match(/^\/([^/]+)\/?/);
    if (m && !/login|signin|auth|reset/i.test(page.url()) && m[1] !== "") branch = m[1];
    else { if (i === 0) console.log("Sign in in the browser window. Waiting…"); await page.waitForTimeout(1000); }
  }
  if (!branch) { console.error("Timed out waiting for sign-in."); await ctx.close(); process.exit(1); }
  if (forceBranch) branch = forceBranch;
  console.log(`Signed in. Branch: ${branch}`);

  let ok = 0;
  for (const c of captures) {
    try {
      await page.goto(`${base}/${branch}${c.path}`);
      await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
      await page.waitForTimeout(c.settle ?? 1500);
      for (const s of c.steps || []) {
        if (s.click) {
          if (RISKY.test(s.click)) throw new Error(`refused risky click: ${s.click}`);
          await page.locator(s.click).first().click({ timeout: 10000 });
        }
        if (s.fill) await page.locator(s.fill).first().fill(s.text ?? "", { timeout: 10000 }); // search/filter boxes only
        if (s.hover)await page.locator(s.hover).first().hover({ timeout: 10000 });
        if (s.press) await page.keyboard.press(s.press);
        if (s.scroll) await page.mouse.wheel(0, s.scroll);
        await page.waitForTimeout(s.wait ?? 600);
      }
      const out = path.join(root, c.out);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      // Hide floating helper buttons (debug capture, assistant) so they don't cover the screen.
      await page.evaluate(() => document.querySelectorAll("button").forEach((b) => {
        if (/debug capture|open assistant/i.test(b.getAttribute("aria-label") || b.title || b.innerText)) b.style.visibility = "hidden";
      }));
      try {
        await page.screenshot({ path: out, fullPage: false, animations: "disabled", caret: "hide", timeout: 20000 });
      } catch {
        // Some dialogs never settle for Playwright's screenshot; grab the frame straight from Chrome.
        const cdp = await ctx.newCDPSession(page);
        const { data } = await cdp.send("Page.captureScreenshot", { format: "png" });
        fs.writeFileSync(out, Buffer.from(data, "base64"));
      }
      if (c.dump) {
        const controls = await page.$$eval("button, [role=tab], a", (els) => els.map((e) => `${e.tagName} ${(e.innerText || e.getAttribute("aria-label") || e.title || "").trim().slice(0, 60)}`).filter((t) => t.length > 4));
        fs.writeFileSync(out.replace(/\.png$/i, ".txt"), `${page.url()}\n\n${await page.innerText("body")}\n\n--- controls ---\n${controls.join("\n")}`);
      }
      console.log(`✓ ${c.out}`);
      ok++;
    } catch (e) {
      console.log(`✗ ${c.out}: ${e.message.split("\n")[0]}`);
    }
  }
  console.log(`${ok}/${captures.length} captured.`);
  await ctx.close();
})();
