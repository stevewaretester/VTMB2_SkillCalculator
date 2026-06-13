# Weapon Reload, Pump, and Bolt Cycle Notes - 23416145

## Short read

The small ammo numbers on the weapon instances are loaded ammo before reload/cycle, not pickup total. The player weapon manager has separate held ammo and held mag ammo properties:

- `PI_HeldWeaponAmmo`
- `PI_HeldWeaponMagAmmo`
- `AmmoMap` entries for `Data.Ammo.CURRENT` and `Data.Ammo.MAG`

For player-held guns, pump/bolt behavior shows up as `RangedCycle` plus `CycleTime` on the player `Attackset_*` assets. I did not find a normal player `RangedReload` field on the gun attacksets. There is a bare `CC_Reload` control cue and the generic NPC/GAS reload ability, but the explicit player-side animation hook for pump/bolt is `RangedCycle`.

## Player cycle attacksets

Only these player gun attacksets expose `RangedCycle` in this export:

| Attackset | Instance | Loaded ammo | Ammo mag | RangedCycle | CycleTime | Montage length | Details |
|---|---:|---:|---:|---|---:|---:|---|
| `Attackset_ShedShotgun` | `BP_WeaponInstance_Shotgun_ThinbloodEarly_C` | 1 | 1 | `AM_Shotgun_Cycle` | 0.6 | 0.98333335 | Pump audio `WEP_NPC_Foley_Shotgun_Pump_Player` at 0.27788734s. Plays weapon montage `AM_wep_Player_shotgun_Cycle`. |
| `Attackset_ShedShotgun_Dual` | `BP_WeaponInstance_Shotgun_ThinbloodEarly_C` | 1 | 1 | `AM_Shotgun_Cycle_Dual` | 0.6 | 0.98333335 | Pump audio at 0.2100539s left and 0.30831707s right. Plays `AM_wep_Player_shotgun_Cycle` twice. |
| `Attackset_Sniper` | `BP_WeaponInstance_SniperRifle_C` | 1 | 1 | `AM_Sniper_Cycle` | 0.8 | 1.34445 | Bolt/load audio `WEP_Sniper_Load_Player` at 0.19579965s. Rifle shell VFX at 0.47729275s. |
| `Attackset_Sniper_Dual` | `BP_WeaponInstance_SniperRifle_C` | 1 | 1 | `AM_Sniper_Cycle_Dual` | 0.8 | 0.98333335 | Uses `WEP_Sniper_Load_Player`, but the montage reuses `Anim_Shotgun_Cycle_Dual` and plays `AM_wep_Player_shotgun_Cycle` twice. Looks like dual-cycle asset reuse. |

The weapon montage `AM_wep_Player_shotgun_Cycle` is 0.7075s and emits `NS_Shotgun_Shell` at 0.20549753s. It is referenced by shotgun cycle, dual shotgun cycle, and the dual sniper cycle asset.

Important absence: `Attackset_MegaShotgun` uses `BP_WeaponInstance_Shotgun_Pump_C`, but it has no `RangedCycle` or `CycleTime` in this export. Its pump naming seems to be in the weapon instance/asset identity, not an explicit player cycle hook.

Other attacksets without `RangedCycle`: crossbow, DollarStoreM4, handgun, high-cal revolver, IAO rifle, IAO shotgun, MegaShotgun, MP5, revolver, and StubbySMG variants.

## Generic player cycle ability

`GA_PlayerCycl`:

- Ability tag: `Combat.Ability.Ranged.Cycle`
- `bRetriggerInstancedAbility`: true
- Has a `MoveAmmo` function
- Reads `WrestlerPlayerWeaponManager`
- Blocks activation while already cycling, firing, scoped, changing weapon, or tagged `Combat.General.NoCycle`

The exported JSON does not decompile the full Blueprint graph into readable execution nodes, but its properties and temp fields show it is the player-side ability that performs cycle timing/ammo movement around the current weapon manager.

## Generic reload ability

`GA_Weapon_Reload` is the generic GAS/NPC reload ability:

- `ReloadGC`: `GameplayCue.Source.Combat.Weapon.Ranged.Reload`
- `MontageTag`: `Combat.Ability.Ranged.Reload`
- `MontagePlaybackRate`: 1.0
- Blocks: `Combat.Ability.Ranged.Fire`, `Combat.Ability.Ranged.Reload`
- Owned tags while active: `AI.Perception.PauseDetection`, `Combat.Ability.Ranged.Reload`

The player control cue `CC_Reload` exists, but is only a bare `WrestlerControlCue` asset in the export.

## Enemy reload and cycle animation timings

These are enemy/GAS-side, not player attackset cycle fields:

| Asset | Length | Details |
|---|---:|---|
| `AM_shotgun_Cycle` | 1.1 | Enemy shotgun cycle. Plays weapon montage `AM_wep_shotgun_Cycle`. |
| `AM_wep_shotgun_Cycle` | 1.1 | Weapon-side shotgun cycle. Shell VFX `NS_Shotgun_Shell` at 0.35004422s. |
| `AM_Enemy_Combat_Reload_Shotgun_01` | 2.7 | Plays weapon montage `AM_wep_shotgun_reload_01`. |
| `AM_wep_shotgun_reload_01` | 2.7 | Weapon-side shotgun reload. |
| `AM_Enemy_Combat_Reload_Rifle_01` | 2.13333 | Plays `AM_Weapon_Rifle_Reload_01`. |
| `AM_Enemy_Combat_Reload_Pistol_01` | 2.13333 | Plays `AM_Weapon_Pistol_Reload_01`. |
| `AM_Enemy_Combat_Reload_Pistol_Revolver_01` | 2.13333 | Plays `AM_Weapon_Pistol_Reload_Revolver_01`. |
| `AM_Enemy_Combat_Reload_Crossbow` | 4.26667 | Uses rifle reload animation at play rate 0.5. |
| `AM_Flusher_Combat_Reload_01` | 1.76667 | Flusher reload. |
| `AM_Distractor_Combat_Reload_Shotgun_01` | 3.38 | Distractor shotgun reload. |
| `AM_MinorGhoulReload` | 4.4333334 | Minor ghoul reload. |

`GA_Weapon_cycle` is separate from reload. It uses:

- `MontageTag`: `AnimationTag.Montage.Ranged.Cycle`
- `Montage`: `AM_shotgun_Cycle`
- Ability tag: `Combat.Ability.Ranged.Cycle`
- Blocks: `Combat.Ability.Ranged`, `Combat.Ability.Melee`

## Telekinesis boltpull

`GA_Telekenesis_Boltpull` is not a firearm bolt-action reload. It is a Telekinesis player ability:

- `AbilityDataId`: `DA_Ability_Telekinesis`
- Montage: `AM_TK_Boltpull`
- Gameplay tag: `Combat.Ability.Skill.Telekinesis.BoltPull`
- Gameplay cue: `GameplayCue.Source.Ability.Telekinesis.BoltPull`
- Montage length: 0.6666667s
- Hides weapon for the whole montage via `Combat.General.HideWep`

This is granted in Ysabella's default ability data, but it is separate from sniper `RangedCycle`.

## Audio reload fields on weapon instances

Some ranged weapon instances have `AudioRangedWeaponReload`, but this appears to be the NPC/GAS reload audio field rather than the player pump/bolt cycle animation hook:

- Rifle, rifle thinblood, rifle dual, SMG, sniper: `WEP_NPC_AssaultRifle_Reload_GC`
- Handgun, revolver, high-cal, high-cal dual: `WEP_NPC_Pistol_Reload_GC`
- Shotgun variants and crossbow did not expose `AudioRangedWeaponReload` in their weapon instance defaults.

Benny has a separate DLC player reload montage, `AM_bennyGun_Reload`, length 1.0s, with `WEP_NPC_Foley_Shotgun_Pump` at 0.083203614s and `Combat.General.HideWep.Instant` for 0.5895359s. It is not part of the TKable weapon list.
