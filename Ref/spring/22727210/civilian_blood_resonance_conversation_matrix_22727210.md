# Civilian Blood Resonance Conversation Matrix (22727210)

## What this file answers

This is the wiki reference for:

1. How civilian reaction depends on clothing category.
2. How the 4 civilian conversation options break down.
3. Which combinations lead to `Success`, `Fail`, `InstantFail`, or `Intro`.

## System flow (practical)

1. Approach a civilian with your current outfit category.
2. The game checks conversation gates and outfit tags.
3. If the outfit gate passes, you can get up to 4 conversation options:
   - Option 1: ability-based auto-pass if the matching clan/social ability is unlocked
   - Option 2: top regular speech option
   - Option 3: bottom regular speech option
   - Option 4: temperament-specific option based on Phyre's conversation style
4. Outcome resolves to one of:
   - `Success`: successful BR conversion for that route
   - `Intro`: route opened, but not yet resolved
   - `Fail`: route mismatch/no conversion
   - `InstantFail`: hard mismatch

## Four-option model

### Option 1: ability auto-pass

- Prompt tags:
  - `Narrative.Prompts.Player.Abilities.Br_Taunt`
  - `Narrative.Prompts.Player.Abilities.Br_Seduce`
  - `Narrative.Prompts.Player.Abilities.Br_Scare`
- Matching target flags:
  - `MassConversationFightProperty` -> `PB_BR_NPC_is_FightType`
  - `MassConversationFlirtProperty` -> `PB_BR_NPC_is_FlirtType`
  - `MassConversationFearProperty` -> `PB_BR_NPC_is_FearType`
- Practical rule:
  - `Br_Taunt` auto-passes on `FightType`
  - `Br_Seduce` auto-passes on `FlirtType`
  - `Br_Scare` auto-passes on `FearType`

### Option 2 and 3: regular speech options

- Based on in-game behavior and how the route outcomes shake out, the top regular option is usually the friendlier one.
- The bottom regular option is usually the harsher / more aggressive one.
- The exact line text changes by outfit and by civilian set.
- The exports do not give a single clean table for top-vs-bottom wording/order, but they do give the exact route results once you know which route the option is acting like.

### Option 4: temperament-specific response

- This is the non-outfit special response keyed off Phyre's dialogue persona.
- Internal asset naming uses:
  - `Empath`
  - `Bully`
  - `Sage`
- `Sage` is the internal/export label for what you are calling `Scholar`.
- These are not costume/outfit categories.

## Practical mapping for the 4 options

| Option slot | What it is | Usual route it maps to | Practical result |
|---|---|---|---|
| 1 | Ability prompt | Exact matching route only | Always passes if the civilian is that target type |
| 2 | Top regular option | Usually the friendlier / flirtier route | Best on `FlirtType` targets |
| 3 | Bottom regular option | Usually the aggressive route | Best on `FightType` or `FearType` targets |
| 4 | Temperament option | `Empath`, `Bully`, or `Sage/Scholar` | Mostly niche; asset rows are separate from outfit rows |

### Resonance family mapping (high-confidence, but partly inferred)

| BR conversation target | Most likely resonance family | Why |
|---|---|---|
| FightType | Choleric | Anger/fight semantics and BR event naming (`BloodResEvent.Fight`) |
| FearType | Melancholic | Fear/intimidate semantics and BR event naming (`BloodResEvent.Flee`) |
| FlirtType | Sanguine | Seduce/flirt semantics and BR event naming (`BloodResEvent.Flirt`) |

### Confidence note

- The three ability channels and target-type properties are explicit in config.
- The `Empath/Bully/Sage` temperament lane is explicit from dialogue variables and BR conversation asset rows.
- The exact top-option / bottom-option wording and display order are not exposed in one clean export table, so that part remains a practical gameplay mapping rather than a direct asset table.
- The exact `Fight -> Choleric`, `Fear -> Melancholic`, `Flirt -> Sanguine` bridge is strongly supported by naming, HUD/tutorial wording, and BR event tags, but this export set does not expose a single direct data-table row that spells out the mapping in one place.

## Civilian kinds found in BR conversation assets

- `BikM1`, `BikM2`
- `BusF1`, `BusM1`, `BusM2`
- `SWF1`, `SWF2`, `SWM1`
- `UnhF1`, `UnhM1`, `UnhM2`

## Notes on interpreting the matrix

- This matrix comes from `BR_Conversation_*.json` face animation naming under crowd NPC assets.
- `-` means no outcome asset found for that combination.
- Fear has additional generic success assets without outfit suffix for several types (`...Fear_Success_#`), so fear conversion is partly decoupled from outfit-specific success clips.

## What is exact vs not exact

### Exact in exports

- Which outfit category is active (`Strong`, `Grunge`, `Attractive`, `Wealthy`, `Priest`).
- Which temperament response lane is active (`Empath`, `Bully`, `Sage`).
- Which BR conversation route is being attempted (`Fight`, `Flirt`, `Fear`).
- Which civilian archetype has which route outcome for that outfit:
  - `Success`
  - `Fail`
  - `InstantFail`
  - `Intro`

### Not exact in exports

- The exact in-UI wording/order of the top and bottom regular civilian conversation choices for every outfit.
- A single exported table that explicitly says `top = friendly` and `bottom = aggressive` for each civilian family.

In other words: the assets do expose the exact route/result matrix, but not a neat menu-definition table for every on-screen prompt ordering.

## Outfit-first exact reaction tables

This section is the practical answer to: "If I am wearing `Strong` / `Grunge` / `Attractive`, what happens when I try Fight/Flirt/Fear against bikers, business civilians, sex workers, and unhealthy/unhoused civilians?"

Shorthand used here:

- `Bik*` = biker civilians
- `Bus*` = business civilians
- `SW*` = sex worker civilians
- `Unh*` = unhealthy/unhoused civilian set (name is from asset shorthand only)

## Success cheat sheet by option slot

This is the direct answer to the gameplay model you described.

### If the civilian is a Flirt target

- Option 1: `Beckon/Seduce` always passes if unlocked.
- Option 2: top regular option is the one that matters.
- Option 3: bottom regular option is generally the wrong tone.

| Outfit | Biker | Business | Sex worker | Unhealthy/unhoused |
|---|---|---|---|---|
| `Attractive` | Intro/Success | Intro/Success | Fail/Intro/Success | - |
| `Grunge` | Fail/Intro/Success | InstantFail | InstantFail | - |
| `Strong` | Fail/Intro/Success | Fail/Intro/Success | Fail/Intro/Success | - |
| `Wealthy` | InstantFail | Fail/Intro/Success or InstantFail | Intro/Success | - |
| `Priest` | InstantFail | Fail/Intro/Success | Fail/Intro/Success | - |

### If the civilian is a Fight target

- Option 1: `Taunt` always passes if unlocked.
- Option 3: bottom regular option is the one that matters.
- Option 2: top regular option is generally the wrong tone.

| Outfit | Biker | Business | Sex worker | Unhealthy/unhoused |
|---|---|---|---|---|
| `Attractive` | Fail/Intro/Success | Fail/Intro/Success | - | Fail/Intro/Success |
| `Grunge` | Fail/Intro/Success | Intro/Success | - | Fail/Intro/Success |
| `Strong` | InstantFail | InstantFail or - | - | InstantFail |
| `Wealthy` | Intro/Success | Fail/Intro/Success or - | - | Intro/Success |
| `Priest` | Intro/Success | Fail/Intro/Success | - | Fail/Intro/Success |

### If the civilian is a Fear target

- Option 1: `Glimpse/Scare` always passes if unlocked.
- Option 3: bottom regular option is the one that matters.
- Option 2: top regular option is generally the wrong tone.

| Outfit | Biker | Business | Sex worker | Unhealthy/unhoused |
|---|---|---|---|---|
| `Attractive` | - | InstantFail or - | InstantFail | InstantFail |
| `Grunge` | - | Intro, Fail/Intro, or - | Fail/Intro | Fail/Intro |
| `Strong` | - | Intro or - | Intro | Intro |
| `Wealthy` | - | Fail/Intro or - | Fail/Intro | Fail/Intro |
| `Priest` | - | InstantFail or - | InstantFail | InstantFail |

### Option 4 temperament response

This is separate from outfit.

| Temperament response | Fight targets | Flirt targets | Fear targets |
|---|---|---|---|
| `Empath` | Usually `Fail` | Usually `Success` | Usually `Fail` |
| `Bully` | Usually `Fail` | Usually `Fail` | Usually no result / `Fail` |
| `Sage` / `Scholar` | Usually `Success` | Usually `Fail` | Usually `Fail` |

### Attractive

| Civilian family | Fight | Flirt | Fear |
|---|---|---|---|
| Biker (`BikM1`, `BikM2`) | Fail/Intro/Success | Intro/Success | - |
| Business (`BusF1`, `BusM1`, `BusM2`) | Fail/Intro/Success | Intro/Success | InstantFail or - |
| Sex worker (`SWF1`, `SWF2`, `SWM1`) | - | Fail/Intro/Success | InstantFail |
| Unhealthy/unhoused (`UnhF1`, `UnhM1`, `UnhM2`) | Fail/Intro/Success | - | InstantFail |

### Grunge

| Civilian family | Fight | Flirt | Fear |
|---|---|---|---|
| Biker (`BikM1`, `BikM2`) | Fail/Intro/Success | Fail/Intro/Success | - |
| Business (`BusF1`, `BusM1`, `BusM2`) | Intro/Success | InstantFail | Intro, Fail/Intro, or - depending on subtype |
| Sex worker (`SWF1`, `SWF2`, `SWM1`) | - | InstantFail | Fail/Intro |
| Unhealthy/unhoused (`UnhF1`, `UnhM1`, `UnhM2`) | Fail/Intro/Success | - | Fail/Intro |

### Strong

| Civilian family | Fight | Flirt | Fear |
|---|---|---|---|
| Biker (`BikM1`, `BikM2`) | InstantFail | Fail/Intro/Success | - |
| Business (`BusF1`, `BusM1`, `BusM2`) | InstantFail or - depending on subtype | Fail/Intro/Success | Intro or - depending on subtype |
| Sex worker (`SWF1`, `SWF2`, `SWM1`) | - | Fail/Intro/Success | Intro |
| Unhealthy/unhoused (`UnhF1`, `UnhM1`, `UnhM2`) | InstantFail | - | Intro |

### Wealthy

| Civilian family | Fight | Flirt | Fear |
|---|---|---|---|
| Biker (`BikM1`, `BikM2`) | Intro/Success | InstantFail | - |
| Business (`BusF1`, `BusM1`, `BusM2`) | Fail/Intro/Success or - depending on subtype | Fail/Intro/Success or InstantFail depending on subtype | Fail/Intro or - |
| Sex worker (`SWF1`, `SWF2`, `SWM1`) | - | Intro/Success | Fail/Intro |
| Unhealthy/unhoused (`UnhF1`, `UnhM1`, `UnhM2`) | Intro/Success | - | Fail/Intro |

### Priest

| Civilian family | Fight | Flirt | Fear |
|---|---|---|---|
| Biker (`BikM1`, `BikM2`) | Intro/Success | InstantFail | - |
| Business (`BusF1`, `BusM1`, `BusM2`) | Fail/Intro/Success | Fail/Intro/Success | InstantFail or - |
| Sex worker (`SWF1`, `SWF2`, `SWM1`) | - | Fail/Intro/Success | InstantFail |
| Unhealthy/unhoused (`UnhF1`, `UnhM1`, `UnhM2`) | Fail/Intro/Success | - | InstantFail |

### Temperament response lane: Empath, Bully, Sage/Scholar

These are not outfits. They are the separate temperament-specific dialogue option.

| Temperament response | Typical effect |
|---|---|
| `Empath` | Commonly `Flirt Success`, but often `Fight Fail` and `Fear Fail` |
| `Bully` | Commonly `Fight Fail` and `Flirt Fail` |
| `Sage` / `Scholar` | Commonly `Fight Success`, but `Flirt Fail` and often `Fear Fail` |

## Full matrix by civilian kind and lookup row

Format: `Type | Row | Fight outcome(s) | Flirt outcome(s) | Fear outcome(s)`

`Row` can be either an outfit category (`Attractive`, `Grunge`, `Strong`, `Wealthy`, `Priest`) or a temperament row (`Empath`, `Bully`, `Sage`).

| Type | Row | Fight | Flirt | Fear |
|---|---|---|---|---|
| BikM1 | Attractive | Fail/Intro/Success | Intro/Success | - |
| BikM1 | Bully | Fail | Fail | - |
| BikM1 | Empath | Fail | Success | - |
| BikM1 | Grunge | Fail/Intro/Success | Fail/Intro/Success | - |
| BikM1 | Priest | Intro/Success | InstantFail | - |
| BikM1 | Sage | Success | Fail | - |
| BikM1 | Strong | InstantFail | Fail/Intro/Success | - |
| BikM1 | Wealthy | Intro/Success | InstantFail | - |
| BikM2 | Attractive | Fail/Intro/Success | Intro/Success | - |
| BikM2 | Bully | Fail | Fail | - |
| BikM2 | Empath | Fail | Success | - |
| BikM2 | Grunge | Fail/Intro/Success | Fail/Intro/Success | - |
| BikM2 | Priest | Intro/Success | InstantFail | - |
| BikM2 | Sage | Success | Fail | - |
| BikM2 | Strong | InstantFail | Fail/Intro/Success | - |
| BikM2 | Wealthy | Intro/Success | InstantFail | - |
| BusF1 | Attractive | Fail/Intro/Success | Intro/Success | InstantFail |
| BusF1 | Bully | Fail | Fail | - |
| BusF1 | Empath | Fail | Success | Fail |
| BusF1 | Grunge | Intro/Success | InstantFail | Intro |
| BusF1 | Priest | Fail/Intro/Success | Fail/Intro/Success | InstantFail |
| BusF1 | Sage | Success | Fail | - |
| BusF1 | Strong | InstantFail | Fail/Intro/Success | Intro |
| BusF1 | Wealthy | Fail/Intro/Success | Fail/Intro/Success | Fail/Intro |
| BusM1 | Attractive | Fail/Intro/Success | Intro/Success | InstantFail |
| BusM1 | Bully | Fail | Fail | - |
| BusM1 | Empath | Fail | Success | Fail |
| BusM1 | Grunge | Intro/Success | InstantFail | Fail/Intro |
| BusM1 | Priest | Fail/Intro/Success | Fail/Intro/Success | InstantFail |
| BusM1 | Sage | Success | Fail | Fail |
| BusM1 | Strong | - | Fail/Intro/Success | Intro |
| BusM1 | Wealthy | - | Fail/Intro/Success | Fail/Intro |
| BusM2 | Attractive | Fail/Intro/Success | Intro/Success | - |
| BusM2 | Bully | Fail | Fail | - |
| BusM2 | Empath | Fail | Success | - |
| BusM2 | Grunge | Intro/Success | InstantFail | - |
| BusM2 | Priest | Fail/Intro/Success | Fail/Intro/Success | - |
| BusM2 | Sage | Success | Fail | - |
| BusM2 | Strong | InstantFail | Fail/Intro/Success | - |
| BusM2 | Wealthy | Fail/Intro/Success | Fail/Intro/Success | - |
| SWF1 | Attractive | - | Fail/Intro/Success | InstantFail |
| SWF1 | Bully | - | Fail | - |
| SWF1 | Empath | - | Success | Fail |
| SWF1 | Grunge | - | InstantFail | Fail/Intro |
| SWF1 | Priest | - | Fail/Intro/Success | InstantFail |
| SWF1 | Sage | - | Fail | Fail |
| SWF1 | Strong | - | Fail/Intro/Success | Intro |
| SWF1 | Wealthy | - | Intro/Success | Fail/Intro |
| SWF2 | Attractive | - | Fail/Intro/Success | InstantFail |
| SWF2 | Bully | - | Fail | - |
| SWF2 | Empath | - | Success | Fail |
| SWF2 | Grunge | - | InstantFail | Fail/Intro |
| SWF2 | Priest | - | Fail/Intro/Success | InstantFail |
| SWF2 | Sage | - | Fail | Fail |
| SWF2 | Strong | - | Fail/Intro/Success | Intro |
| SWF2 | Wealthy | - | Intro/Success | Fail/Intro |
| SWM1 | Attractive | - | Fail/Intro/Success | InstantFail |
| SWM1 | Bully | - | Fail | - |
| SWM1 | Empath | - | Success | Fail |
| SWM1 | Grunge | - | InstantFail | Fail/Intro |
| SWM1 | Priest | - | Fail/Intro/Success | InstantFail |
| SWM1 | Sage | - | Fail | Fail |
| SWM1 | Strong | - | Fail/Intro/Success | Intro |
| SWM1 | Wealthy | - | Intro/Success | Fail/Intro |
| UnhF1 | Attractive | Fail/Intro/Success | - | InstantFail |
| UnhF1 | Bully | Fail | - | - |
| UnhF1 | Empath | Fail | - | Fail |
| UnhF1 | Grunge | Fail/Intro/Success | - | Fail/Intro |
| UnhF1 | Priest | Fail/Intro/Success | - | InstantFail |
| UnhF1 | Sage | Success | - | Fail |
| UnhF1 | Strong | InstantFail | - | Intro |
| UnhF1 | Wealthy | Intro/Success | - | Fail/Intro |
| UnhM1 | Attractive | Fail/Intro/Success | - | InstantFail |
| UnhM1 | Bully | Fail | - | - |
| UnhM1 | Empath | Fail | - | Fail |
| UnhM1 | Grunge | Fail/Intro/Success | - | Fail/Intro |
| UnhM1 | Priest | Fail/Intro/Success | - | InstantFail |
| UnhM1 | Sage | Success | - | Fail |
| UnhM1 | Strong | InstantFail | - | Intro |
| UnhM1 | Wealthy | Intro/Success | - | Fail/Intro |
| UnhM2 | Attractive | Fail/Intro/Success | - | InstantFail |
| UnhM2 | Bully | Fail | - | - |
| UnhM2 | Empath | Fail | - | Fail |
| UnhM2 | Grunge | Fail/Intro/Success | - | Fail/Intro |
| UnhM2 | Priest | Fail/Intro/Success | - | InstantFail |
| UnhM2 | Sage | Success | - | Fail |
| UnhM2 | Strong | InstantFail | - | Intro |
| UnhM2 | Wealthy | Intro/Success | - | Fail/Intro |

## Quick tactical summary

- For many `Fight` targets, `Strong` is often bad (`InstantFail`) while `Grunge`, `Attractive`, `Wealthy`, and `Priest` frequently open `Intro`/`Success` paths.
- For many `Flirt` targets, `Attractive` is generally strong, while `Bully` is commonly `Fail`; some archetypes like `Bik*` also allow `Strong` flirt success.
- For many `Fear` targets, `Attractive` and `Priest` frequently `InstantFail`; `Strong` often gives at least `Intro`, with separate generic fear-success assets handling completion.

## Source assets used

- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/NPC/Crowd/Animation/ID_Face/BR_Conversation_*.json`
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Config/DefaultGame.json`
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Config/Tags/WrestlerPromptTags.json`
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Config/DefaultGameplayTags.json`
