# Plan: Mobile/Tablet Responsive Redesign

Pure CSS-driven responsive overlay (no JS framework rewrite). Existing desktop UI is preserved at ≥1024px. New mobile UX layered on via media queries + targeted JS additions for sheet/drawer behavior. Hard breakpoint at **≤768px** (mobile), soft breakpoint at **769–1023px** (tablet, hybrid).

---

## Phase 1 — Foundations & Layout Shell

1. Add CSS custom properties for breakpoints + mobile spacing scale (`--mobile-pad`, `--touch-min: 44px`).
2. Add a `body.is-mobile` / `body.is-tablet` class set via a tiny JS bootstrap (`window.matchMedia`) so JS render functions can branch when needed (e.g. card view vs table). Listen for resize to update.
3. Add a single `<div id="app-shell-mobile">` chrome wrapper (header bar + bottom tab bar + drawer + bottom sheet container) that stays empty/hidden on desktop and is populated only when mobile class is set.

## Phase 2 — Mobile Chrome (header, drawer, bottom tab bar)

1. **Top app bar** (mobile only): hamburger button on left, current page title in middle, save-link icon on right. Replaces the existing `.header` visually (existing header is `display:none` at mobile width; its buttons are duplicated into the drawer).
2. **Side drawer** (slide-in from left, scrim backdrop): About, Changelog (v1.10), Mods, Patch link, custom-cursor toggle, copy view link, copy save link. Reuses existing modal handlers — drawer items just dispatch click on the original buttons.
3. **Bottom tab bar** (fixed, full-width): 4 large icon+label buttons for Phyre / Fabien / Benny / Ysabelle. Uses existing `bindTabs()` click logic — buttons forward clicks to the original `.tab-bar--primary` buttons.
4. **Sub-tab pill row** (horizontal scroll, sticky just under app bar): renders the active page's secondary tabs (e.g. Phyre's Outfits/Skilltree/Combos/Pickups/Map). On secondary tab change, mirrors clicks to the existing `.tab-bar--secondary` buttons.

Original `.tab-bar--primary` and `.tab-bar--secondary` are hidden via `display:none` at mobile width. State machine remains 100% in the existing JS — mobile chrome is a thin click-mirror layer.

## Phase 3 — Skill Tree Mobile View (the hero feature)

1. `.main-layout` becomes `display:block` on mobile. Sidebar (cost tracker) and detail panel hidden by default. Sidebar help moves into the drawer; detail content moves into the bottom sheet.
2. **Top stats strip** (sticky under sub-tab pill row): horizontal row, ~44px tall. Left half: AP diamond + 3 resonance numbers + small ↺ reset icon. **Right half: pinned innate-icon strip** — 3–4 round icons (Phyre: TK / Glide / Melee / Sprint; Benny: 4 New Features items; Fabien: Phlegmatic notes card). Tap any icon → opens bottom sheet with that detail content. Always visible.
3. **Skill grid scrolls horizontally by clan column** (one clan column visible at a time on small phones, 2 on wider). Tier labels sticky on the left edge (`position:sticky; left:0`). `scroll-snap-type: x mandatory` + `scroll-snap-align: start` on each clan column so scroll always lands on a clean clan column. Clan logo at top of each column anchors orientation. No pinch-zoom (snap-scroll handles it cleanly).
4. **Tap on ability cell** → atomic action: (a) cycle state `locked → awakened → unlocked → locked` if legal, (b) open bottom sheet (or update its content if already open) showing that ability's detail. If cycle is illegal (prereq not met), don't cycle but still open sheet so user sees why. **Long-press** = cycle backward (`unlocked → awakened → locked`).
5. **Bottom sheet** (slide-up from bottom, scrim backdrop, drag handle at top). Three snap heights: **peek (~30vh)**, **default (~55vh, opens here)**, **expanded (~95vh, near full-screen)**. Drag handle to switch. Tap outside or swipe down past peek dismisses. Renders the existing `renderDetailPanel` HTML. Adds explicit `<button>` row at top for Lock / Awaken / Unlock (only legal transitions enabled). Sheet stays open across cell taps (content swaps in place).

## Phase 4 — Outfits, Combos, Pickups, Reactions

1. **Outfits page**: grid stacks (clans become vertical sections; each clan = horizontal scrolling row of its 4 outfit cells). Detail panel slides up as bottom sheet on cell tap (same component as skill-tree sheet).
2. **Combos table**: at ≤768px, JS renderer (`renderCombosPage`) checks `body.is-mobile` and emits `<article class="combo-card">…</article>` per row instead of `<tr>`. Each card stacks: Name + Rank pill on top, Abilities row of icons, Cost block, Damage/Notes below. Filter buttons unchanged (already pill-style).
3. **Pickups Weapons + Items + Alchemy tables**: same card-view treatment in `renderWeaponsTable()` / `renderItemsTable()` / `renderAlchemyTable()`. Sort header becomes a single `<select>` dropdown above the cards.
4. **Reactions table**: card view per outfit-type, each card lists the 3 NPC reactions.
5. **Map subpage**: leave as-is (image with pan/zoom — already works on mobile).

## Phase 5 — Fabien, Benny, Ysabelle pages

1. Same pattern: tree grid takes full width, sidebar items hidden, tap on cell opens bottom sheet with detail.
2. Benny `New Features` sidebar (sidearm/melee/leap/outfit) becomes a horizontal scrolling row of cards above or below the tree.
3. DLC info banner (Loose Cannon) collapses to a single "DLC" pill that opens the existing modal-style content in the bottom sheet.

## Phase 6 — Polish & Verification

1. Suppress hover tooltips on mobile (`@media (hover: none)`) — they fire on tap and fight the bottom sheet.
2. Custom cursor disabled on touch devices (already controlled by `state.customCursor`; auto-set off when `body.is-mobile`).
3. Set `<meta name="theme-color">` to match `--bg-dark` for nice browser chrome.
4. Add `apple-mobile-web-app-capable` for iOS standalone mode.
5. Test on Chrome DevTools device emulation: iPhone SE (375), Pixel 7 (412), iPad Mini (768), iPad (1024).
6. Real-device smoke test: iOS Safari + Android Chrome.
7. Verify URL state persistence + share-link still works (no JS state changes, just chrome).
8. Verify desktop UI unchanged at ≥1024px (regression baseline).

---

## Relevant Files

- `index.html` — add mobile shell wrapper, bottom-sheet container, drawer scaffold, viewport meta tweaks
- `css/styles.css` — bulk of work: new `@media (max-width: 768px)` block (~300-500 new lines), bottom-sheet/drawer/bottom-tab-bar styles, hide-original-chrome rules
- `js/app.js` — add `initMobileShell()`: matchMedia listener, click-mirroring from mobile chrome to original buttons, bottom-sheet open/close API (`openMobileSheet(htmlContent)`, `closeMobileSheet()`). Modify `handleAbilityClick` to detect mobile and use the cycle pattern + open sheet. Adjust `renderDetailPanel` to accept an optional target element (so it can render into the sheet).
- `js/combos.js` — branch `renderCombosPage` on `body.classList.contains('is-mobile')` for card view
- `js/pickups.js` — same for `renderWeaponsTable`, `renderItemsTable`, `renderAlchemyTable`
- `js/outfits.js` — branch `renderOutfitGrid` for stacked layout; render detail into mobile sheet
- `js/benny.js`, `js/fabien.js` — minimal: tap-to-open-sheet, sidebar collapses

## Verification

1. DevTools device emulation at 375px / 412px / 768px / 1024px / 1440px — all primary flows work
2. Skill tree: tap cycles states, bottom sheet shows description, prereqs honored, reset works
3. Tables render as cards <769px, as tables ≥769px
4. Drawer opens from hamburger, closes via scrim/swipe
5. Bottom tab bar: tap each character switches pages, active state correct
6. Share-link round-trip: build a state on mobile, copy link, paste in desktop browser — same state restored
7. No regression: pixel-diff desktop view at 1440×900 against current main

## Decisions

- **Long-press dropped** (per pushback #1) — bottom sheet shows description on tap
- **Bottom tab bar instead of drawer for primary chars** (pushback #2) — drawer holds secondary actions only
- **Stats bar is stats-only for cost numbers, but pinned innate-icon strip on the right side** of the same bar (revised pushback #3)
- **Tap-to-cycle simplified to 3-state** (pushback #4) — visual select state dropped on mobile. Long-press = cycle backward
- **Skill grid horizontally scrolls by clan column with scroll-snap** (revised pushback #5) — sticky tier labels on left edge, no pinch-zoom
- **Tables → cards, not scroll** (pushback #6) — cleaner on mobile despite more vertical space
- **Sheet has 3 snap heights**: peek 30vh / default 55vh / expanded 95vh
- **Tablet (769–1023px)** = hybrid (option C): keep desktop chrome, hide detail panel by default, open as side sheet on tap
- Excluded: dark/light mode toggle, gesture nav, PWA install prompt
- Excluded: redesigning desktop layout — desktop locked at ≥1024px

## Codebase Context Appendix (pre-gathered, don't re-explore)

### Architecture

- Vanilla HTML/CSS/JS SPA. No framework. State in plain `state` / `bennyState` / `fabienState` / `outfitState` globals.
- Render functions mutate DOM directly: `renderGrid()`, `renderDetailPanel()`, `updateCosts()`, `renderClanSelector()`, `renderOutfitGrid()`, `renderOutfitDetail()`, `renderCombosPage()`, `renderPickupsPage()`, `renderFabienTree()`, `renderBennyTree()`, `renderBennySidebarItems()`, `renderBennyDetail()`.
- Persistence: `?at=` URL param (tab position) + `?state=` URL param + cookie. `persistState()` and `persistPosition()` handle this.
- Deep BRAIN.md exists at workspace root with full architecture notes.

### Current desktop chrome (to be hidden on mobile)

- `<header class="header">` — About / Changelog (v1.10) / Patch link / Mods buttons + logo + title (lines ~13-23 of index.html)
- `<nav class="tab-bar tab-bar--primary">` — Phyre / Fabien / Benny / Ysabelle + tab-bar\_\_end with view/save link buttons + cursor-toggle (lines ~26-50)
- `<nav class="tab-bar tab-bar--secondary">` (Phyre subtabs) — Outfits / Skill Tree / Combos / Pickups / Map
- `<nav class="tab-bar tab-bar--fabien">` and `tab-bar--benny` similarly for those pages
- `<nav class="tab-bar tab-bar--combos">` and `tab-bar--pickups` for sub-sub tabs

### Skill tree DOM structure

- `<main class="main-layout">` contains `.sidebar` (cost tracker, AP/Res, innate items, help) + `.skill-grid-wrapper` (`.affinity-bar` + `.skill-grid`) + `.detail-panel`
- `.sidebar` width: 180px. `.detail-panel` width: 400px. `.main-layout` max-width: 1400px.
- `.skill-grid` grid-template-columns is `60px 1fr` (tier label + 6 clan columns with `repeat(6, ...)`)
- Sidebar contains: `#ap-total`, `#res-san`, `#res-mel`, `#res-cho`, `#reset-all`, `#phyre-innate-items` (rendered by `renderPhyreInnateItems()` from PHYRE_INNATE_ITEMS array), and `.sidebar-help` collapsible

### Ability state cycle (currently in `handleAbilityClick`)

Current: `locked → awakened → unlocked`, then 4th tap toggles `selectedPerTier` visual state.
Mobile target: drop selectedPerTier branch when `body.is-mobile`; reset to locked instead. Long-press = `handleAbilityUndo` (already exists, walks state backward).

### Detail panel render path

- `renderDetailPanel()` writes to `document.getElementById("detail-panel")` directly. To make it work in the mobile sheet, refactor signature to `renderDetailPanel(targetEl)` (default arg = `document.getElementById("detail-panel")`).
- Detail panel content includes: video, tier label, ability icon+name, description, masquerade impact, costs (AP+resonance), blood pips, duration/tags/notes lozenges, status, outfit link, combos list. All HTML-string-built.

### Key existing CSS classes to reuse / extend on mobile

- `.modal-overlay`, `.modal-card` (for drawer styles modeled after these)
- `.video-lightbox` (for full-screen sheet expanded state)
- `.benny-dlc-purchase` (lozenge style — useful pattern for stats strip)

### Innate items data

- `PHYRE_INNATE_ITEMS` array in app.js (line ~28): `[telekinesis, glide, melee, vampiricSprint]` with `id`, `title`, `icon` getter
- `BENNY_SIDEBAR_ITEMS` array in benny.js: `[sidearm, melee, leap, outfit]` with `id`, `icon`, `title`, `image`, `desc`, etc.
- Fabien notes card: hardcoded HTML in fabien.js `renderNotesDetail()`. ID `fabien-notes-phlegmatic` for the sidebar item.

### Tables — JS render entry points to branch on `body.is-mobile`

- `js/combos.js` → `renderCombosPage()` (ability subtab), and the melee + clan combos sub-renderers
- `js/pickups.js` → `renderWeaponsTable()`, `renderItemsTable()`, `renderAlchemyTable()` (search the file)
- `js/outfits.js` → `renderOutfitGrid()`, `renderReactionsTable()`
- All currently emit `<table>` with `<thead>` + `<tbody>` + `<tr>`. Card view: emit `<div class="card-list"><article class="card">…</article>…</div>` and style via CSS.

### Click-mirroring pattern for mobile chrome

The cleanest approach: mobile chrome buttons just call `.click()` on the original buttons (which are `display:none` but still in the DOM). Example:

```js
document
  .querySelector('.mobile-bottom-tab[data-tab="benny"]')
  .addEventListener("click", () => {
    document
      .querySelector('.tab-bar--primary .tab-bar__tab[data-tab="benny"]')
      .click();
  });
```

This means zero state-machine duplication. Active states sync via DOM observation or by re-running the build-mobile-chrome function on every tab change (cheap).

### Currently used CSS variables (don't redefine)

`--bg-dark`, `--bg-mid`, `--bg-panel`, `--bg-cell`, `--border-dim`, `--border-accent`, `--gold`, `--gold-dim`, `--gold-bright`, `--text`, `--text-dim`, `--text-bright`, `--res-sanguine`, `--res-melancholic`, `--res-choleric`, `--green-affinity`, `--red`. Add new: `--touch-min: 44px`, `--mobile-pad: 12px`, `--sheet-peek: 30vh`, `--sheet-default: 55vh`, `--sheet-expanded: 95vh`.

### Existing media queries (only 2)

- `css/styles.css:1231` — `@media (max-width: 1100px)` (one minor adjustment)
- `css/styles.css:4187` — `@media (max-width: 900px)` (one minor adjustment)
  Both can stay; new mobile rules go in a fresh block at the bottom of styles.css.

### File sizes (rough)

- `css/styles.css` ~4500 lines
- `js/app.js` ~2500 lines
- `js/benny.js` ~600 lines, `js/fabien.js` ~250 lines, `js/outfits.js` ~500 lines
- `js/combos.js` ~700 lines, `js/pickups.js` ~1200 lines, `js/data.js` ~3000 lines (pure data, don't touch)

### User preferences

- User deploys mods themselves. Never auto-run deploy scripts.
- VS Code workspace at `e:\REpo\VTMB2_SkillCalculator\` on Windows. Pushes to `main` branch on github.com/stevewaretester/VTMB2_SkillCalculator (GitHub Pages).
- Latest version: v1.10 (commit `c5e7e45`).
- Commit messages: terse, version-prefixed when bumping.

## Further Considerations — RESOLVED

1. **Tablet (769–1023px)**: hybrid (option C) — keep desktop chrome, hide detail-panel by default, open as side sheet on tap. CONFIRMED.
2. **Sheet expansion**: 3 snap heights (peek/default/expanded). CONFIRMED.
3. **Long-press as back-cycle** (unlock→awakened→locked): power-user shortcut. CONFIRMED.
