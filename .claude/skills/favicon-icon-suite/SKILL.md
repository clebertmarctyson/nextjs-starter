---
name: favicon-icon-suite
description: Generate a complete favicon/icon suite (favicon.ico, apple-touch-icon, android-chrome sizes, site.webmanifest, browserconfig.xml) from a source logo — self-contained script, no external tool/project dependency. Use whenever a project needs its favicon/icons set up or replaced, whether from a real client logo or a placeholder mark for a fresh starter clone.
metadata:
  tags: seo, branding, assets, project-setup
---

## When to use

Load this whenever a project needs a favicon/icon suite generated or regenerated — a fresh clone still on a placeholder mark, a client's branding finalized, or a rebrand. This comes up on essentially every client project, so it's worth having as a one-shot, repeatable script rather than a manual per-project task or a dependency on any one specific tool/project existing on the machine.

## What it produces

- `favicon.ico` (multi-size ICO: 16/32/48px)
- `favicon-16x16.png`, `favicon-32x32.png`
- `apple-touch-icon.png` (180px)
- `android-chrome-192x192.png`, `android-chrome-512x512.png`
- `mstile-150x150.png`
- `site.webmanifest`
- `browserconfig.xml`

## Prerequisites

Needs `sharp` (native image processing). Don't add it as a permanent dependency to an app that doesn't otherwise need it — install it temporarily, generate, then remove:

```bash
pnpm add -D sharp
# ... generate (see script below) ...
pnpm remove sharp
```

If the project already has `sharp` (e.g. it does other image processing), skip the temporary install/remove and just run the script.

## The script

Save as a temporary file (e.g. `scripts/_generate-favicons.mjs`), run once, then delete it — this is a one-shot asset-generation tool, not something that should live in the app's runtime code.

```js
import sharp from "sharp";
import fs from "fs";
import path from "path";

// Adjust these three things per project:
const SOURCE = "./logo.png"; // real logo, OR omit and use PLACEHOLDER_SVG below
const OUT_APP = "./app"; // wherever favicon.ico should land (Next.js App Router: app/favicon.ico)
const OUT_PUBLIC = "./public";
const APP_NAME = "my-project";
const THEME_COLOR = "#000000";

// Placeholder mark (solid rounded square) — used only if SOURCE doesn't exist,
// e.g. generating a starter clone's placeholder before real branding lands.
const PLACEHOLDER_SVG = Buffer.from(
  `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="512" height="512" rx="96" fill="${THEME_COLOR}"/></svg>`
);

function buildIco(entries) {
  const HEADER = 6, ENTRY = 16;
  const headerBuf = Buffer.alloc(HEADER + ENTRY * entries.length);
  headerBuf.writeUInt16LE(0, 0);
  headerBuf.writeUInt16LE(1, 2);
  headerBuf.writeUInt16LE(entries.length, 4);
  let dataOffset = HEADER + ENTRY * entries.length;
  entries.forEach(({ size, png }, i) => {
    const base = HEADER + ENTRY * i;
    headerBuf.writeUInt8(size >= 256 ? 0 : size, base);
    headerBuf.writeUInt8(size >= 256 ? 0 : size, base + 1);
    headerBuf.writeUInt8(0, base + 2);
    headerBuf.writeUInt8(0, base + 3);
    headerBuf.writeUInt16LE(1, base + 4);
    headerBuf.writeUInt16LE(32, base + 6);
    headerBuf.writeUInt32LE(png.length, base + 8);
    headerBuf.writeUInt32LE(dataOffset, base + 12);
    dataOffset += png.length;
  });
  return Buffer.concat([headerBuf, ...entries.map((e) => e.png)]);
}

const SIZES = [
  { filename: "favicon-16x16.png", size: 16 },
  { filename: "favicon-32x32.png", size: 32 },
  { filename: "apple-touch-icon.png", size: 180 },
  { filename: "android-chrome-192x192.png", size: 192 },
  { filename: "android-chrome-512x512.png", size: 512 },
  { filename: "mstile-150x150.png", size: 150 },
];

async function main() {
  const source = fs.existsSync(SOURCE) ? fs.readFileSync(SOURCE) : PLACEHOLDER_SVG;

  const base512 = await sharp(source)
    .resize({ width: 512, height: 512, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .png()
    .toBuffer();

  const resize = (size) => sharp(base512).resize(size, size, { fit: "cover" }).ensureAlpha().png().toBuffer();

  const pngBuffers = await Promise.all(SIZES.map(({ size }) => resize(size)));
  const [ico16, ico32, ico48] = await Promise.all([resize(16), resize(32), resize(48)]);
  const icoBuffer = buildIco([{ size: 16, png: ico16 }, { size: 32, png: ico32 }, { size: 48, png: ico48 }]);

  fs.mkdirSync(OUT_PUBLIC, { recursive: true });
  fs.writeFileSync(path.join(OUT_APP, "favicon.ico"), icoBuffer);
  SIZES.forEach(({ filename }, i) => fs.writeFileSync(path.join(OUT_PUBLIC, filename), pngBuffers[i]));

  fs.writeFileSync(
    path.join(OUT_PUBLIC, "site.webmanifest"),
    JSON.stringify(
      {
        name: APP_NAME,
        short_name: APP_NAME,
        icons: [
          { src: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
        ],
        theme_color: THEME_COLOR,
        background_color: THEME_COLOR,
        display: "standalone",
      },
      null,
      2
    )
  );

  fs.writeFileSync(
    path.join(OUT_PUBLIC, "browserconfig.xml"),
    `<?xml version="1.0" encoding="utf-8"?>\n<browserconfig>\n  <msapplication>\n    <tile>\n      <square150x150logo src="/mstile-150x150.png"/>\n      <TileColor>${THEME_COLOR}</TileColor>\n    </tile>\n  </msapplication>\n</browserconfig>`
  );

  console.log("Favicon suite generated.");
}

main().catch((e) => { console.error(e); process.exit(1); });
```

Run with `node scripts/_generate-favicons.mjs`, then delete the script — the generated files are the deliverable, not the script itself.

## Wiring it into a Next.js App Router project

```ts
// app/layout.tsx (or app/[locale]/layout.tsx if using i18n — see [[docs-project-docs]])
export const metadata: Metadata = {
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};
```

`favicon.ico` at `app/favicon.ico` is picked up automatically by Next.js's App Router convention — no explicit wiring needed for that one file.

## Checklist

- [ ] `sharp` is installed only temporarily unless the project already needs it for other reasons — removed after generation.
- [ ] The generation script is deleted after running — it's a one-shot tool, not app code.
- [ ] `APP_NAME` and `THEME_COLOR` in the script match the actual project, not left at generic defaults.
- [ ] If using a real logo, it's reasonably square and high-resolution (512px+) — a low-res or non-square source produces visibly bad results at larger sizes.
- [ ] The generated `favicon.ico` actually renders correctly — `file favicon.ico` should report valid ICO/PNG data, and it's worth an actual visual check in a browser tab, not just trusting the file exists.

## Quick self-audit

1. Does `favicon.ico` open/render correctly (not just exist as a file)?
2. Does `site.webmanifest`'s `name`/`theme_color` match the actual project, not a copy-pasted placeholder?
3. Was the temporary generation script actually removed, or did it get left in the repo as clutter?
