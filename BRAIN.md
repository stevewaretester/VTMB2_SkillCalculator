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

## 8) Future Improvement Suggestion

If toggles keep growing, introduce a registry-driven toggle system:

- one config object per toggle
- shared binder for checkbox, default, persistence key, and rerender hooks
- less repetition and fewer missed persist/render calls

Until then, follow the checklist above strictly.
