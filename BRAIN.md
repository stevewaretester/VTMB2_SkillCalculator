# VTMB2 Skill Calculator - Repo Brain

This file is the local implementation guide for this codebase.
Use it as the source of truth for how to add features safely.

## 1) Core Architecture

- Runtime state lives in `js/app.js` in the `state` object.
- UI is rendered by explicit render functions (not reactive framework state).
- Most interactions mutate `state`, then call one or more render/update functions.
- Global render/update entry points:
  - `renderGrid()`
  - `updateCosts()`
  - `renderDetailPanel()`
  - `renderClanSelector()`
  - `renderPickupsPage()`
  - `refreshOutfitsPage()`
  - `renderFabienTree()`

Rule of thumb:

- Mutate state first.
- Re-render affected UI sections immediately.
- Persist state after mutation.

## 2) State Persistence Model

Persistence is implemented in `js/app.js`.

- URL parameter key: `state`
- Cookie key: `vtmb2_state`
- Cookie max age: 1 year
- Encoding: JSON -> UTF-8 -> base64url

Load precedence:

1. URL `?state=...`
2. Cookie fallback

Normalization behavior:

- Invalid payloads are ignored safely.
- Unknown clan IDs are filtered out.
- Unknown ability keys are ignored.
- If selected clan exists but passive is locked, passive is forced to unlocked baseline.

Current persisted payload shape:

- `v`: schema version
- `sc`: selected clan
- `cc`: completed clans array
- `ct`: completion talents toggle
- `mh`: MAHA/Haven toggle
- `mf`: Fabien fast travel toggle
- `cs`: clan selector collapsed
- `sp`: selectedPerTier map
- `a`: abilities map (only non-locked entries)

## 3) Toggle Pattern (Canonical)

When adding a new toggleable feature, follow this checklist.

1. Add state key

- Add a boolean flag in `state` in `js/app.js`.
- Add persistence field mapping in `makePersistedState()` and `applyPersistedState()`.

2. Add UI control

- Add checkbox/toggle in `index.html` (typically inside Mods modal).
- Give it stable IDs for checkbox and optional navigation helpers.

3. Bind in `bindToggles()`

- Initialize checkbox from state on load.
- Add change handler that updates state and rerenders affected areas.
- If using Shift+Click override pattern for disabled toggles, keep behavior consistent.

4. Render effects

- Add conditional classes/text in the relevant renderer.
- Keep logic in one place when possible.
- Example pattern: `updatePickupsTabLabels()` controls labels and subtab visibility.

5. Persist

- Ensure interaction path calls `persistState()`.
- If UI behavior is driven by `renderGrid()` only, persistence is already covered via that render.

6. Navigation behavior

- If toggle changes where deep-links land, update route helpers.
- Example: `setActivePickupsSubtab()` and Mods arrow navigation.

7. Document

- Add a short note to README feature list.
- Add any implementation caveat to this file.

## 4) URL-Friendly Feature Design

For new feature state that should survive share links:

- Prefer compact keys in persisted payload.
- Avoid storing derived UI values that can be recomputed.
- Keep data deterministic and serializable (strings, numbers, booleans, arrays, plain objects).
- Avoid storing DOM state directly.

Good candidates:

- Toggle booleans
- Selected tab/subtab
- Filter/sort keys
- Chosen clan
- Unlock/awaken states

Avoid or derive:

- Temporary hover/focus DOM-only states
- Cached HTML

## 5) Common UI Patterns Used Here

### Pattern A: Dynamic Tab Labels + Class Toggling

Used in `js/pickups.js` (`updatePickupsTabLabels()`).

- Compute feature active boolean.
- Update textContent.
- Toggle class names for visual identity.
- Show/hide related subtabs and fallback active tab if needed.

### Pattern B: Requirement Lozenges

Used in MAHA guide requirements.

- Container gets one of `req-state-none`, `req-state-partial`, `req-state-full`.
- Child chips get `req-met` if requirement is satisfied.
- Icon chips can swap image source based on state (normal vs completed logos).

### Pattern C: Cross-Page Navigation Helpers

Use small helper functions that centralize active tab/subpage switching.

- `setActivePickupsSubtab(tabId)` is the preferred way to switch pickups subtabs.
- Reuse helper in click handlers and deep-link style interactions.

## 6) Mutation Hotspots (Be Careful)

State changes happen in many places.
When debugging persistence mismatches, inspect these first:

- Clan complete toggle in `renderClanSelector()` click handlers
- Ability unlock/undo handlers (`handleAbilityClick`, `handleAbilityUndo`)
- Mods handlers in `bindToggles()`
- Bulk actions: `purchaseClanAbilities`, `unlockClanAbilities`, `resetAll`

If a new change is not persisting, verify either:

- The path calls `persistState()` directly, or
- It triggers `renderGrid()` (which currently calls `persistState()`).

## 7) Testing Checklist for New Toggle Features

- Toggle on/off updates labels, content, and styles.
- Reload same URL keeps state.
- Copy/paste URL into a new tab restores state.
- Close/reopen browser restores state via cookie.
- Reset flows still behave correctly.
- No console errors when controls are missing/hidden.

## 8) Tab Position Persistence (URL `?at=` param)

Separate from the state blob. Implemented in `js/app.js`.

- URL param key: `POS_PARAM = "at"`
- Written on every tab click via `persistPosition()` using `history.replaceState`
- Read on load via `applyPersistedPosition(pos)` called after `bindTabs()` in `init()`
- Does **not** touch the `?state=` blob — fully independent

Syntax examples:

| Position            | `?at=` value                             |
| ------------------- | ---------------------------------------- |
| Phyre skill tree    | `phyre.skill-tree`                       |
| Phyre outfits       | `phyre.outfits`                          |
| Phyre combos        | `phyre.combos`                           |
| Phyre pickups       | `phyre.pickups`                          |
| Fabien (any subtab) | `fabien.skills` / `fabien.builds` / etc. |
| Benny               | `benny`                                  |
| Ysabelle            | `ysabelle`                               |

`persistPosition()` reads the currently `.active` primary tab + secondary/fabien subtab from the DOM and writes the combined value.

`applyPersistedPosition(pos)` splits on `.`, then activates matching tabs and shows matching pages/subpages. Safe to call with unknown values — returns early if no matching tab found.

## 9) Character-Specific Page Architecture

Each non-Phyre character has its own JS file and an isolated state object.

### Benny (`js/benny.js`)

State object:

```js
bennyState = {
  focused: null,
  pistolFocused: false,
  looseCannon: false,
  dlcInfoOpen: false,
};
```

- `looseCannon`: DLC owned toggle — persisted in state blob as `lc` (boolean)
- `pistolFocused`: sidebar pistol focus state — not persisted, UI-only
- `focused`: currently focused skill node — not persisted

Entry points:

- `initBenny()` — called once on first visit; renders tree + wires all interactions
- `refreshBennyPage()` — called on every tab switch to Benny; re-renders grid and details

Layout: `.benny-layout` wraps crest image + tree + sidebar. No `overflow:hidden` (removed to prevent crest clipping).

DLC section uses `.clan-selector` pattern (same CSS classes as Phyre clan selector) so it shares styles. Requires `z-index:1` + `background: var(--bg-dark)` on `.clan-selector` and `.clan-selector-toggle` so crest image behind layout doesn't bleed through.

Crest: `.benny-layout__crest` — `position:absolute; top:-70%; left:10%; width:1000px; opacity:0.1; z-index:0`

Sidebar pistol: `.benny-sidebar__pistol` — `position:absolute; bottom:0; left:50%; transform:translateX(-50%); cursor:pointer`

- Focused state adds `.benny-pistol--focused` (yellow drop-shadow glow)
- Click calls `openImageLightbox('assets/screenshot/bennyGun.png', ...)`

DLC purchase tile click: `window.open("https://youtu.be/tAN6R0GEJyM", "_blank")` (YouTube embed blocked on file:// origin — use new tab instead)

Render order in detail panel: video renders FIRST (before tier/name), matching Phyre layout.

Persisted state additions (in `makePersistedState` / `applyPersistedState`):

- `lc`: `!!bennyState.looseCannon`

### Fabien (`js/fabien.js`)

Has its own subtabs via `.tab-bar--fabien` with `data-fabtab` attributes.
`persistPosition()` captures active `[data-fabtab]` tab for the `?at=fabien.*` value.

## 10) Lightbox System

Two lightbox types, both in `js/app.js`:

### Image Lightbox — `openImageLightbox(src, alt)`

- Creates a `.video-lightbox` overlay containing a `<img>` element
- Image container gets `.video-lightbox__content--img`
- Sized via CSS: `width:auto; height:auto; max-width:90vw; max-height:90vh`
- Click backdrop or press Escape closes it
- Used for: pistol image (Benny), outfit full images

### Video Lightbox — `openVideoLightbox(src)`

- If `src` contains `youtube.com` or `youtu.be` → renders `<iframe>` with `?autoplay=1`
- Otherwise → renders `<video autoplay controls>`
- Container uses `.video-lightbox__content` (fixed 854×480px for 16:9)
- **Note**: YouTube iframes are blocked on `file://` protocol — prefer `window.open()` for YouTube DLC tiles

## 11) Outfit System Details (`js/outfits.js`)

- Reactions table handles `clanId === "benny"` specially — reads from `BENNY_OUTFIT` directly
- Benny row logo cell uses `assets/ElixirIcons/icon_phyre_mark.png`
- Badge shown on both locked and unlocked Benny cells: `.outfit-cell__badge { bottom:15%; left:4px; width:36px }`
- Full outfit image clickable → `openImageLightbox(outfit.fullImg, ...)`
- `BENNY_OUTFIT.fullImg = 'assets/screenshot/BennyOutfit.png'`

## 12) Clan Pattern / Background System

`CLAN_PATTERN_BG` in `js/app.js` maps clan ID → background image path.

- Brujah uses the container image (not the raw icon):
  `CLAN_PATTERN_BG.brujah = 'assets/N_Textures/ClanSelection/T_UI_ClanIconContainer_Selected.png'`
- Pattern updates via `updateClanPattern()` on every clan change

## 13) Current Persisted Payload Shape (v1.06)

```json
{
  "v": 1,
  "sc": "brujah",
  "cc": [],
  "ct": false,
  "mh": false,
  "mf": false,
  "cs": false,
  "sp": {},
  "a": {},
  "lc": false
}
```

Key additions since v1.0:

- `lc` (v1.06): Benny DLC / Loose Cannon owned toggle

## 14) Future Improvement Suggestion

If toggles keep growing, introduce a registry-driven toggle system:

- one config object per toggle
- shared binder for checkbox, default, persistence key, and rerender hooks
- less repetition and fewer missed persist/render calls

Until then, follow the checklist above strictly.
