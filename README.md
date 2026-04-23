# VTMB2 Skill Calculator

An interactive skill tree and build planner for **Vampire: The Masquerade – Bloodlines 2**.

> Vibe Coded with GitHub Copilot — but tested by a professional QA against current Chrome and OperaGX.

---

## Features

### Phyre — Skill Tree

- **Six playable clans**: Brujah, Tremere, Banu Haqim, Ventrue, Lasombra, Toreador
- Full ability grid across six tiers: Clan Passive, Strike, Relocate, Affect, Mastery, and Clan Perk
- **Ability Point cost calculator** — tracks total AP spend, accounting for in-clan, affinity, and out-of-clan pricing; costs are colour-coded white / green (underlined) / red for accessibility
- **Blood Resonance cost tracker** — cumulative Sanguine / Melancholic / Choleric requirements shown in the sidebar
- **Discipline affinity bar** — shows which disciplines are relevant for the selected clan, with per-discipline colour glows on affinity cells and a white glow for own-clan abilities
- **Ability detail panel** — shows description, blood pip cost, channeled status, conversation ability indicator, resonance effects granted/cleansed, masquerade impact badge, and an in-game video preview
- **Masquerade impact indicators** — per-ability badges (Breach / Moderate / Minor / Safe) derived from real game data
- Click to unlock abilities, click again to unequip; right-click to reset a single ability
- **Clan column header shortcuts**:
  - Left-click → purchase all abilities for that clan
  - Shift+click → unlock all abilities for all clans
  - Right-click → reset that clan's abilities
- Mark clans as **Completed** (✦ button); Shift+click the ✦ to toggle all clans at once
- Collapsible clan selector panel

### Phyre — Outfits

- Browse all unlockable outfits per clan
- Toggle **Female / Male** preview silhouettes
- **NPC Reaction table** — shows how each NPC type (Homeless, Biker, Streetwalker, Business) reacts to the outfit's style, plus conversation disposition effects and affect ability compatibility

### Fabien (Malkavian)

- Dedicated tab for Fabien's unique ability column
- All five abilities displayed with descriptions and detail panel

### Benny / Ysabelle

- Placeholder pages (content coming when DLC drops)

### Mods Panel

- **Obvious Fabien Phlegmatic Fast Travel** toggle — adjusts the calculator to reflect the mod's behaviour, with a shortcut arrow to navigate directly to the relevant ability
- Related mods listed with links to Nexus Mods
- Clan Completion Talents toggle (coming soon)

---

## Project Structure

```
index.html          # Single-page app shell, all tab/modal HTML
css/
  styles.css        # All styling — dark VtM theme, layout, components
js/
  data.js           # All game data: abilities, clans, outfits, masquerade scores, resonance, UI asset paths
  app.js            # Core app logic: state, skill tree rendering, cost calculation, tab/modal wiring
  outfits.js        # Outfits page logic: grid, preview, NPC reactions table
  fabien.js         # Fabien tab logic: ability column, detail panel, video playback
assets/             # Game textures and videos (see Assets section below)
Ref/                # Raw CSV/text data used during development
```

### Tech Stack

- Vanilla HTML / CSS / JavaScript — no frameworks, no build step
- Served as a static site (GitHub Pages compatible)

### Repo Brain

- See `BRAIN.md` for implementation patterns and checklists.
- Includes: state architecture, toggle pattern, URL/cookie persistence model, and feature-safe mutation flow.

---

## Assets

All assets were ripped from Bloodlines 2 using [FModel](https://fmodel.app/):

```
Bloodlines2\Content\WrestlerCore\UI\Textures
```

Only the 231 files actively referenced by the calculator are included in the `assets/` folder. Game assets remain the property of Paradox Interactive / The Chinese Room and are not covered by this project's license.

---

## Author

Made by **stevewaretester** / **obvious** / **teh_steve**

- GitHub: [stevewaretester](https://github.com/stevewaretester)
- Nexus Mods: [obvious](https://www.nexusmods.com/profile/0bv10u5)
- Reddit: [teh_stev3](https://www.reddit.com/user/teh_stev3/)
- Ko-fi: [Support on Ko-fi](https://ko-fi.com/stevewaretester) _(optional, no pressure)_

---

## See Also

**Previous Calculator** — the original Google Sheets version, now superseded by this tool:
[VTMB2 Skill Calculator (Google Sheets)](https://docs.google.com/spreadsheets/d/1d4uAes-V_REOTRoDqoU6dffUb2Hs0m-lfhqwEgH6shI/edit?usp=sharing)

---

## Disclaimer

This is an unofficial fan project, not affiliated with or endorsed by Paradox Interactive or The Chinese Room. All game data and assets belong to their respective copyright holders. Non-commercial, not for profit.

Source code is released under the **MIT License**.
