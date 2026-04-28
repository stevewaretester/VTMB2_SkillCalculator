# Melee Weapons Analysis (22727210)

## Scope

This document is a focused update to the earlier combat analysis, centered on melee weapon attack assets and new codex/tutorial text in build `22727210`.

Primary sources:
- `EXPORTS/FModel/21718394/.../Abilities/Player/Melee/ChargedAttacks/*.json`
- `EXPORTS/FModel/22727210/.../Abilities/Player/Melee/ChargedAttacks/*.json`
- `Notes etc/22727210/codex_combat_diff_en_22727210.txt`
- `Notes etc/22727210/codex_new_moves_en_22727210.csv`

## Executive Summary

- Core melee weapon GA numeric values are stable between `21718394` and `22727210`.
- `GA_PlayerAttack_Baton.json` exists in `22727210` and is missing in `21718394` exports.
- New codex text in `22727210` adds explicit melee tutorial coverage for:
  - pickup/pull/transfer of weapons via TK,
  - directional weapon behavior (forward single-target vs backward shove),
  - bladed vs blunt identity,
  - blocking and unblockable heavy/ability attacks.

## 22727210 Weapon Ability Snapshot

Values below are from `Default__*` CDO properties.

| Ability | Practical Input Trigger | ComboDelay | Hit Damage | Trace Range | Trace Radius | LungeRange | LungeRangeTargeted | LungeDelay | Hit React | FlinchOnlyTags |
|---|---|---:|---:|---:|---:|---:|---:|---:|---|---|
| `GA_PlayerAttack_Light` | Tap Attack (base/fists light attack path) | 0.2 | 8 | 170 | 35 | - | 450 | 0.01 | `Combat.Status.HitReact.Light` | - |
| `GA_PlayerAttack_Heavy` | Hold Attack then release/auto-fire (base/fists heavy path) | 0.7 | 30 | 240 | 50 | 200 | 450 | 0.01 | `Combat.Status.HitReact.HeavyFirst` | `Combat.Status.AttackArmor.Heavy` |
| `GA_PlayerAttack_Bat` | Attack with bat-class melee weapon equipped (forward/neutral strike) | 0.2 | 8 | 270 | 60 | 200 | - | 0.05 | `Combat.Status.HitReact.Light` | - |
| `GA_PlayerAttack_Baton` | Attack with baton equipped (forward/neutral strike) | 0.2 | 8 | 270 | 60 | 200 | - | 0.05 | `Combat.Status.HitReact.Light` | - |
| `GA_PlayerAttack_Hammer` | Attack with hammer-class melee weapon equipped (forward/neutral strike) | 0.2 | 8 | 270 | 60 | 200 | - | 0.06 | `Combat.Status.HitReact.Light` | - |
| `GA_PlayerAttack_sword` | Attack with sword-class melee weapon equipped (forward/neutral strike) | 0.2 | 8 | 270 | 60 | - | 200 | 0.05 | `Combat.Status.HitReact.Light` | - |
| `GA_PlayerAttack_Stab` | Attack with stab-capable bladed weapon equipped (forward/neutral stab profile) | 0.2 | 8 | 250 | 35 | 240 | 350 | 0.01 | `Combat.Status.HitReact.Light` | - |
| `GA_PlayerAttack_LightBlade` | Attack with light blade equipped (forward/neutral strike) | 0.2 | 8 | 270 | 35 | 140 | 270 | 0.01 | `Combat.Status.HitReact.Light` | - |
| `GA_PlayerAttack_HeavyBat` | Hold Attack with bat-class weapon equipped (heavy attack) | 0.7 | 30 | 300 | 100 | 200 | 450 | 0.1 | `Combat.Status.HitReact.HeavyFirst` | `Combat.Status.AttackArmor.Heavy` |
| `GA_PlayerAttack_HeavyHammer` | Hold Attack with hammer-class weapon equipped (heavy attack) | 0.7 | 30 | 300 | 100 | 200 | 450 | 0.55 | `Combat.Status.HitReact.HeavyFirst` | `Combat.Status.AttackArmor.Heavy` |
| `GA_PlayerAttack_Shove` | Move backward + tap Attack while holding a melee weapon (quick shove) | 0.2 | 8 | 400 | 30 | 50 | 50 | 0.1 | `Combat.Status.HitReact.Light` | - |

## Build-to-Build Drift Check

Compared directly against `21718394` exports:

- Unchanged (sampled fields: combo delay, damage, trace, lunge, hit react, flinch tags):
  - `GA_PlayerAttack_Light` (input: tap Attack, base/fists light path)
  - `GA_PlayerAttack_Heavy` (input: hold Attack, base/fists heavy path)
  - `GA_PlayerAttack_Bat` (input: attack with bat-class weapon equipped)
  - `GA_PlayerAttack_Hammer` (input: attack with hammer-class weapon equipped)
  - `GA_PlayerAttack_sword` (input: attack with sword-class weapon equipped)
  - `GA_PlayerAttack_Stab` (input: attack with stab-capable bladed weapon equipped)
  - `GA_PlayerAttack_LightBlade` (input: attack with light blade equipped)
  - `GA_PlayerAttack_HeavyBat` (input: hold Attack with bat-class weapon equipped)
  - `GA_PlayerAttack_HeavyHammer` (input: hold Attack with hammer-class weapon equipped)
  - `GA_PlayerAttack_Shove` (input: move backward + tap Attack with melee weapon equipped)
- `GA_PlayerAttack_Baton`:
  - `21718394`: missing in export path
  - `22727210`: present, with bat-like profile

## Blocking Notes (22727210 Codex + Ability Tags)

### Newly explicit codex guidance

The `22727210` codex diff includes new melee strings that reinforce block/weapon behavior:

- `"Most melee weapons will perform a single target attack when moving forward and quicker shove attack when moving backward."`
- `"Bladed vs. Blunt Melee Weapons"`
- `"Bladed weapons are good at dealing damage but less effective at staggering opponents."`
- `"Blunt weapons are effective at staggering opponents and interrupting their attacks but deal less damage."`
- `"Whilst not performing any actions, look directly at an incoming melee attack to block it, significantly reducing the damage received."`
- `"Some heavier or ability based attacks cannot be blocked."`

### Asset-level interpretation

- Heavy variants (`Heavy`, `HeavyBat`, `HeavyHammer`) retain heavy hitreact and attack-armor flinch handling.
- Light/standard weapon attacks mostly keep light hitreact profiles.
- There is no broad numerical rebalance in weapon CDOs; behavior differences are still mainly in interaction logic (block/parry response, reactions, and downstream GE handling), now surfaced more clearly in codex/tutorial text.

## Notes

- This file intentionally isolates melee weapon attack assets. Kicks, shunt, riser, and Benny-special moves are covered in the companion Benny/special combat document.
- Full per-weapon combo-slot extraction (montage file names, sequence lengths, base damage, directional entries) is now in:
  - `Notes etc/22727210/weapon_attacksets_22727210.md`

## Weapon Combo-Attackset Highlights (22727210)

From `WrestlerCommon/Pawns/PlayerCharacter/Weapons/Attackset_*.json`:

- Weapon chain montages are defined in attacksets (not directly on the individual `GA_PlayerAttack_*` CDOs).
- This is why direct GA extraction can show stable GA damage/trace values while real chain behavior differs by equipped weapon attackset.
- Notable high points from base-damage values in the attackset rows:
  - `Attackset_Baton_Loaded` heavy slots: `30.0`.
  - `Attackset_WarHammer` and `Attackset_SledgeHammer` heavy slots: `70.0`.
  - `Attackset_Sword` light slots: `13.0`; heavy stab slots: `15.0` then `12.0` in later combo slots.
  - `Attackset_Knife` light slots: `5.0`; heavy slots: `15.0` then `12.0`.
- Directional backward/shove entries are explicit in attacksets, matching the codex guidance about weapon behavior changing with movement direction.