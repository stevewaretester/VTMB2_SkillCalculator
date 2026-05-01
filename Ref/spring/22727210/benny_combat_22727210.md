# Benny Combat and Special Moves (22727210)

## Scope

This document tracks Benny-specific and special/context combat surfaces in build `22727210`, plus a drift check against `21718394`.

Primary sources:
- `.../Melee/ContextAttacks/*.json`
- `.../Combat/Punch/PunchAlt/AnimationAssets/*.json`
- `Notes etc/22727210/codex_combat_diff_en_22727210.txt`
- `Notes etc/22727210/codex_new_moves_en_22727210.csv`

## Executive Summary

- `GA_BennyAttack_GodFist` exists in both builds and is numerically stable in key CDO fields.
- `GA_Playerattack_riser` exists in both builds, with one meaningful timing shift:
  - `ComboDelay: 0.56 -> 0.70`
- Core kick and shunt context abilities are stable between builds in sampled combat fields.
- New codex text in `22727210` explicitly introduces Benny `Dash Strike`.
- Benny has a DLC combat config `Attackset_Benny` (plugin path), with per-slot base damage and combo timing values that are directly export-confirmed.
- Benny-specific DLC special attacks are asset-confirmed as `GA_BennyAttack_chop`, `GA_BennyAttack_Kick`, and `GA_Benny_Sweep`.
- Benny's unique sidearm ability (`GA_BennyGun`) is asset-confirmed with explicit fire-rate/spread/phosphor tuning and dedicated gun montage timings.
- Wiki stat extraction should use the Benny DLC assets first (plugin path), not inferred substitutions.

## Benny-Specific Findings

### Codex additions (22727210)

From `Ink_Codex_Benny` new-only combat entries:

- `Dash Strike` title entry.
- `Dash ... then Attack ... Different strikes can be achieved by dashing in different directions.`
- Sidearm and incendiary ammo tutorial additions.

This indicates a tutorial-level dash-attack concept for Benny, but current gameplay observation points to a distinct Benny dash chop/slam presentation rather than Phyre-style directional kicks.

### Asset-side mapping status

Confirmed Benny-specific ability assets:

- `GA_BennyAttack_GodFist` — Benny's context special (the Godfist uppercut)
- `Attackset_Benny` — Benny's full fist combo chain (4 slots, no directionals)
- `GA_BennyAttack_chop`
- `GA_BennyAttack_Kick`
- `GA_Benny_Sweep`

There is no `GA_BennyAttack_DashStrike` asset in the scanned paths. For wiki stats, prioritize Benny DLC combat assets listed above.

## Wiki-Primary Benny Montage Stats (22727210)

Use this section for wiki stat population. Values below are taken from Benny DLC combat assets, not from weapon attacksets.

### Benny fist combo config (`Attackset_Benny`)

Source:
- `Plugins/WrestlerDLC/DLC_Benny/Content/BennyContent/Abilities/Player/Combat/Attackset_Benny.json`

Notes:
- This is Benny's own attack config asset (`Attackset_Benny`).
- It references montage assets located under `WrestlerCommon/Abilities/Player/Melee/Anims/Brujah`.
- Light/heavy base damage values are in the Benny config itself.

| Slot | Light montage | Light combo delay | Light base dmg | Heavy montage | Heavy combo delay | Heavy base dmg |
|---|---|---|---|---|---|---|
| Attack0 | AM_Combat_Brujah_Light2 | 0.20 | 8.0 | AM_Combat_Brujah_Heavy2 | 0.70 | 15.0 |
| Attack1 | AM_Combat_Brujah_Light1 | 0.14 | 8.0 | AM_Combat_Brujah_Heavy1 | 0.70 | 15.0 |
| Attack2 | AM_Combat_Brujah_Light3 | 0.26 | 8.0 | AM_Combat_Brujah_Heavy1 | 0.70 | 15.0 |
| Attack3 | AM_Combat_Brujah_Light4 | 0.70 | 8.0 | AM_Combat_Brujah_Heavy2 | 0.70 | 15.0 |

### Benny DLC special attacks (`GA_BennyAttack_*`, `GA_Benny_Sweep`)

Source path:
- `Plugins/WrestlerDLC/DLC_Benny/Content/BennyContent/Abilities/Player/Combat/`

| Ability | Montage used | Montage length | Hit Damage | ComboDelay | Trace Range |
|---|---|---|---|---|---|
| GA_BennyAttack_chop | AM_Benny_Chop | 1.6666666s | 5.0 | 0.7 | 180.0 |
| GA_BennyAttack_Kick | AM_Benny_Kick | 1.6666666s | 7.0 | 0.8 | 270.0 |
| GA_Benny_Sweep | AM_Benny_Sweep_Left / AM_Benny_Sweep_Right | 1.6666666s | 7.0 | 0.8 | 240.0 |

Approximate montage frequency for these three Benny DLC specials is `1 / 1.6666666 ~= 0.60 attacks/sec` (raw animation duration proxy only).

### Benny sidearm (`GA_BennyGun`) (`asset-confirmed`)

Primary sources:
- `Plugins/WrestlerDLC/DLC_Benny/Content/BennyContent/Abilities/Player/GA_BennyGun.json`
- `Plugins/WrestlerDLC/DLC_Benny/Content/BennyContent/Abilities/Player/AM_BennyGun*.json`
- `Content/WrestlerCommon/GlobalProperties/Collectables/PI_BennyAmmoCounter.json`

#### Core gun tuning (CDO)

From `Default__GA_BennyGun_C`:
- `FireRate`: `0.06` (interval; theoretical cap about `16.67` shots/sec)
- `MaxSpread`: `3.0`
- `PhosphorPerBullet`: `4`
- Ability tag: `Combat.Ability.Skill.Weapon.BennyGun`

#### Ammo properties

- `PI_BennyAmmoCounter.PropertyDefault = 15` (default ammo pool backing Benny's ammo counter)
- `PI_FlashCacheAmmo` is referenced as a property source by `BP_PlayerCharacter_Benny` but no default value is exposed in the exported property asset.

#### Gun montage timing table

| Montage | SequenceLength |
|---|---|
| AM_BennyGunFire | 0.8333333s |
| AM_BennyGunFireLast | 1.3333334s |
| AM_bennyGun_Reload | 1.0s |
| AM_BennyGunDeploy | 0.5s |
| AM_BennyGunDeployfast | 0.4s |
| AM_BennyGunDeploySpin | 0.56s |
| AM_BennyGunDeployEmpty | 0.75s |
| AM_BennyGunPutaway | 0.56666666s |
| AM_BennyGunPutawayEmpty | 0.5s |

#### Damage source status

- No explicit per-shot `Hit Damage` scalar is exposed on `Default__GA_BennyGun_C`.
- Exported graph symbols show projectile spawning via `RangedProjectileParams`/`WrestlerRangedProjectile`, but the concrete projectile-damage scalar is not surfaced as a simple CDO numeric field in this asset export.
- Codex text still confirms mixed regular/incendiary ammo and burning DOT behavior for incendiary bullets.

#### Wiki paste: Benny gun damage status (22727210)

Use this block directly in wiki pages:

- Confirmed: `GA_BennyGun` has `FireRate=0.06`, `MaxSpread=3.0`, `PhosphorPerBullet=4`.
- Confirmed: Benny bullet projectile variant exposes `Unbirthed Damage Multiplier=0.5`.
- Confirmed: Bullet family exposes `HeadShotMultiplier=2.0` on `WrestlerProjectile_Bullet`.
- Confirmed: Phosphor burn actor (`BP_PhosphorBulletBurn`) ticks every `0.5s` for `5.0s` total lifespan.
- Confirmed: Burn actor radius data exposes `OuterRadius=1000`, `InnerRadius=400`.
- Not exposed in current exports: a single raw per-shot base damage float for Benny gun direct hit.
- Interpretation: total damage is assembled at runtime from projectile/weapon/runtime pipelines, then modified by projectile multipliers and hit contex(for example headshot/incendiary paths).

## Verified Benny Montage + Damage Evidence (22727210)

### Direct GA CDO evidence (`asset-confirmed`)

From `Default__GA_BennyAttack_GodFist_C` (`Content/WrestlerCommon/Abilities/Player/Melee/ContextAttacks/GA_BennyAttack_GodFist.json`):

- `AttackMontage`: `AM_Benny_Godfist`
- `ComboDelay`: `0.5`
- `LungeDelay`: `0.2`
- `LungeRange / LungeRangeTargeted`: `150 / 150`
- `LungeDuration / LungeDurationTargeted`: `0.1 / 0.1`
- `Trace Range`: `250`
- `Buffer Delay`: `0.3`
- `Bounceback Distance`: `50`
- `Hitfreeze Duration`: `0.06` (`0.2` brutal)
- `Impact Shake Scale`: `0.5` (`CameraShake_Explosion_sharp_strong`)
- `RightPunch`: `true`
- `LegeslipDuration`: `1.0`
- `Environment Damage`: `3.0`
- `Knockback.VerticalKnockBack`: **`500`**
- `Knockback.HorizontalKnockback`: **`170`**
- `LaunchLightweights`: `true`
- `Damage Should Execute`: `true`
- `Death Behaviour Tag`: `Combat.Death.Impact.Heavy`
- `Attack Type Tag`: `Combat.Attack.Launcher`
- `FlinchOnlyTags`: `Combat.Status.AttackArmor`
- `SpecialDamageTags`: `Combat.Ability.Melee.Light`, `Combat.Ability.Melee.Heavy`, `Combat.Status.Stunned`
- `SpecialHitFliter`: `Combat.Ability.Ranged.Reload`, `Combat.Status.vulnerable`, `Combat.Ability.Melee.Heavy`
- `AbilityTags`: `Combat.Ability.Melee.Kick.Back`
- `ActivationOwnedTags`: `Combat.Ability.Melee.Kick.Back`, `Combat.General.HideWep`
- `CancelAbilitiesWithTag`: `Movement.Crouch`, `Movement.Sprint`, `Combat.Ability.Evade`
- `CancelledByAbilitiesWithTag`: `Combat.Ability.Evade`

Important note:

- No explicit `Hit Damage` field is present in the exposed `GA_BennyAttack_GodFist` CDO properties block (unlike many kick/shunt GAs). It inherits from the `GA_PlayerAttack_base` parent or assigns at runtime via the ubergraph (`AssignTagSetByCallerMagnitude`), so a single CDO hit-damage number cannot be hard-asserted from this asset alone.
- `SpecialDamageBonus` scalar is also not exposed here — only the bonus *trigger* tag list (`SpecialDamageTags` / `SpecialHitFliter`) is.

### GodFist vs Phyre Riser (same Forward → Crouch → Forward → Light Attack motion)

| Field                  | Benny GodFist                                          | Phyre Riser (`GA_Playerattack_riser`)         |
| ---------------------- | ------------------------------------------------------ | --------------------------------------------- |
| Hit Damage             | (inherited from base, not in CDO)                      | 8.0 (explicit)                                |
| Vertical Knockback     | **500**                                                | **700** (highest of the launcher family)      |
| Horizontal Knockback   | **170**                                                | 50                                            |
| Trace Range            | 250                                                    | (base default)                                |
| LungeRange / Targeted  | 150 / 150                                              | 150 / 150 (matches per drift table)           |
| LungeDelay             | 0.2                                                    | 0.25                                          |
| ComboDelay             | 0.5                                                    | 0.7 (`22727210`; was 0.56 in `21718394`)      |
| AttackMontage          | `AM_Benny_Godfist` (1.05s, `Combat_Uppercut_Brujah`)   | `AM_Player_Riser`                             |
| LegeslipDuration       | 1.0                                                    | 1.0                                           |
| LaunchLightweights     | true                                                   | true                                          |
| Damage Should Execute  | true                                                   | true                                          |
| Attack Type Tag        | `Combat.Attack.Launcher`                               | (not explicit; AbilityTag = Kick.Back)        |
| SpecialDamageTags      | Light, Heavy, **Stunned**                              | (none exposed)                                |
| SpecialHitFliter       | Ranged.Reload, **vulnerable**, **Melee.Heavy**         | Ranged.Reload (single)                        |
| SpecialDamageBonus     | (not exposed in CDO)                                   | +30.0                                         |
| Death Behaviour Tag    | `Combat.Death.Impact.Heavy`                            | `Combat.Death.Impact.Heavy`                   |

**Net effect**: Same DP-style input motion, but Benny's variant trades Phyre's pure vertical pop (700 vert / 50 horiz) for a flatter knockback arc (500 vert / 170 horiz) with longer reach (250 trace) and tighter lunge timing (0.2 vs 0.25 delay). The retained `Combat.Attack.Launcher` tag plus reduced vertical lift matches the in-game observation that Benny's version "has no upwards attack" — visually the target is shoved forward rather than skyward. The wider `SpecialDamageTags` list (adds `Stunned`) and `SpecialHitFliter` list (adds `vulnerable`, `Melee.Heavy`) means Godfist triggers bonus damage against more enemy states than Riser does.

### Benny montage payload (`asset-confirmed`)

`AM_Benny_Godfist`:

- `SequenceLength`: `1.05`
- Linked sequence: `Combat_Uppercut_Brujah`

This supports the "single heavy chop/launcher-style strike" read more than a Phyre directional kick chain.

### Benny Fist Combo Chain (`Attackset_Benny`) (`asset-confirmed`)

Source: `Plugins/WrestlerDLC/DLC_Benny/Content/BennyContent/Abilities/Player/Combat/Attackset_Benny.json`

- **No directional variants** — unlike weapon attacksets, Benny's fist combo has zero directional entries.
- All light slots tagged `Combat.Ability.Melee.Light.Lunging`.
- All heavy slots tagged `Combat.Ability.Melee.Heavy`.
- Windup montages: slots 0 and 2 use `AM_ChargedAttack_Br_1` (0.89s); slots 1 and 3 use `AM_ChargedAttack_Br_2` (0.89s).
- Block montage: `AM_Player_Block_brujah`.

| Slot | Light Montage | Len | Dmg | Heavy Montage | Len | Dmg |
|---|---|---|---|---|---|---|
| Attack0 | AM_Combat_Brujah_Light1 | 0.812s | 8 | AM_Combat_Brujah_Heavy1 | 0.80s | 15 |
| Attack1 | AM_Combat_Brujah_Light2 | 1.107s | 8 | AM_Combat_Brujah_Heavy2 | 0.80s | 15 |
| Attack2 | AM_Combat_Brujah_Light3 | 1.107s | 8 | AM_Combat_Brujah_Heavy1 | 0.80s | 15 |
| Attack3 | AM_Combat_Brujah_Light4 | 2.290s | 8 | AM_Combat_Brujah_Heavy2 | 0.80s | 15 |

`Attackset_Benny` references montage assets located in `WrestlerCommon/Abilities/Player/Melee/Anims/Brujah/`.

### Benny Directional Dash Attacks (`asset-confirmed`)

Source: `WrestlerCommon/Abilities/Player/Combat/DashAttack/GA_PlayerDashAttack_*.json`

Damage data source: `DA_DashAttackHitData` (Forward), `DA_PunchLightHitData_Alt` (Left), `DA_PunchHeavyHitData_Alt` (Right). Backward inherits damage from parent class.

| Direction | GA | Montage | Montage Len | AnimSequence | Dmg |
|---|---|---|---|---|---|
| Forward | GA_PlayerDashAttack_Forward | AM_Player_ZL_Combat_Dash_Forward_Attack | 0.60s | Anim_Player_ZL_Combat_Dash_Forward_Attack01 | 10 |
| Backward | GA_PlayerDashAttack_Backward | AM_Player_ZL_Combat_Dash_Back_Attack | 1.50s | Anim_Player_ZL_Combat_Dash_Back_Attack01 | 10 (inherited) |
| Left | GA_PlayerDashAttack_Left | AM_Player_HeavyPunch_Left | 1.003s | Anim_Player_Combat_Attack_Punch_HeavyLeft | 10 |
| Right | GA_PlayerDashAttack_Right | AM_Player_HeavyPunch_Right_Uppercut | 1.010s | Anim_Player_Punch_Heavy_Right_Uppercut | 10 |

Key notes:
- Forward and backward use ZL-prefixed Brujah clan animations in `Prototype/Animation/Combat/`.
- Left and right use heavy punch montages from `Combat/Punch/PunchAlt/AnimationAssets/`.
- All apply `GE_PunchStun` via the hit effect container.
- `AM_Player_Counter_Dash_Attack` (0.355s) and `AM_Player_Dash_Left_Attack` (0.639s) in PunchAlt exist but are **not** the GA-referenced montages. They may be used in a separate counter/parry timing window.
- The backward dash strike is the slowest (1.5s) — consistent with a heavy chop/slam presentation.

## Context Ability Drift (21718394 -> 22727210)

| Ability | 21718394 | 22727210 | Result |
|---|---|---|---|
| `GA_BennyAttack_GodFist` | ComboDelay `0.5`, TraceRange `250`, Lunge `150/150`, LungeDelay `0.2`, FlinchOnly `Combat.Status.AttackArmor` | Same | Unchanged |
| `GA_Playerattack_riser` | ComboDelay `0.56`, HitDamage `8`, TraceRange `250`, Lunge `150/150`, LungeDelay `0.25`, FlinchOnly `Combat.Status.AttackArmor` | ComboDelay `0.7` (other sampled values same) | **Changed** |
| `GA_PlayerAttack_DropKick` | HitDamage `25`, ComboDelay `1`, Trace `200/35`, Lunge `300/400`, LungeDelay `0.34` | Same | Unchanged |
| `GA_PlayerAttack_Kick_Front` | HitDamage `5`, ComboDelay `0.5`, Trace `180/45`, Lunge `330/400`, LungeDelay `0.25`, FlinchOnly includes `Combat.Ability.Melee.Block` | Same | Unchanged |
| `GA_PlayerAttack_Kick_Back` | HitDamage `7`, ComboDelay `1`, Trace `250`, Lunge `300/400`, LungeDelay `0.4` | Same | Unchanged |
| `GA_PlayerAttack_Kick_Side` | HitDamage `7`, ComboDelay `0.8`, Trace `270/60`, Lunge `200/200` | Same | Unchanged |
| `GA_PlayerAttack_Kick_Sliding` | HitDamage `15`, ComboDelay `1`, Trace `300/40`, Lunge `300/400`, LungeDelay `0.34` | Same | Unchanged |
| `GA_PlayerAttack_Shunt` | HitDamage `2`, Lunge `250/400`, LungeDelay `0.1`, HitReact `Stumble`, FlinchOnly `HeavyWeight,AttackArmor` | Same | Unchanged |

## Blocking Notes (Special Moves)

- Codex now explicitly states:
  - block reduces incoming melee damage,
  - some heavier or ability-based attacks cannot be blocked.
- Front kick still carries block-related flinch tags, while several other special moves do not expose the same block-flinch profile in CDO tags.
- This remains consistent with earlier interpretation: special/heavy context attacks are more likely to bypass or punish block compared to baseline light attacks.

## Appendix: 17 Special Combat Moves (Working Roster)

This roster is a practical merged set for tracking/testing, combining codex-named additions and exported context/special ability surfaces.

1. Front Kick (`GA_PlayerAttack_Kick_Front`)
2. Back Kick (`GA_PlayerAttack_Kick_Back`)
3. Side Kick (`GA_PlayerAttack_Kick_Side`)
4. Slide Kick (`GA_PlayerAttack_Kick_Sliding`)
5. Drop Kick (`GA_PlayerAttack_DropKick`)
6. Dash Forward Strike (`GA_PlayerDashAttack_Forward` — codex calls this "Knee Strike"; montage is ZL Brujah punch, not a kick)
7. Dash Backward Strike (`GA_PlayerDashAttack_Backward` — slow chop/slam; codex "Dash Strike" best matches this)
8. Dash Left Strike (`GA_PlayerDashAttack_Left` — heavy punch left)
9. Dash Right Strike (`GA_PlayerDashAttack_Right` — heavy punch right uppercut)
10. Shunt (`GA_PlayerAttack_Shunt`)
11. Riser (`GA_Playerattack_riser`)
12. Benny GodFist / Uppercut (`GA_BennyAttack_GodFist`)
13. Weapon Shove (backward directional in weapon attacksets; e.g., `AM_Bat_Poke`, `AM_wep_Shove`, `AM_Knife_shove`)
14. Heavy Weapon Strike (heavy slot in weapon attacksets; weapon-specific montage)
15. Weapon Overhead (forward directional in bat/spike-bat attacksets; `AM_Overhead_1`)
16. Counter Dash Attack (`AM_Player_Counter_Dash_Attack`, 0.355s — PunchAlt surface, distinct from GA-referenced forward dash montage; likely parry counter window)
17. Mysterious Attack (`Ink_Codex_Phyre` title + icon token; no GA match found in scanned paths)

### Roster notes

- Items 1–12 are directly represented by named GA assets.
- Items 6–9 are Benny-exclusive (GA_PlayerDashAttack_* family). Phyre does not use these GAs; she has a separate kick-based directional move set.
- Codex label "Roundhouse Kick" likely maps to one of the directional kicks (2, 3, or 4) rather than any dash attack.
- Item 17 remains unresolved — no matching GA asset found in exported paths.