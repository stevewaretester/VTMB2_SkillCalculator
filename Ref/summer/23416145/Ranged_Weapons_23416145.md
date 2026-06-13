# Ranged Weapons - 23416145

Canonical note for the new equippable ranged weapons in build `23416145`.

This consolidates the earlier TKable weapon CSV, dual-wield notes, DPS table, and reload/cycle notes into one file.

## Short Read

- `AmmoBeforeReload` is loaded ammo before reloading/cycling, not pickup total.
- Player DPS below uses the player attackset fields: `FireRate`, `Ranged Damage`, `BulletsPerShot`, `RangedCycle`, and `CycleTime`.
- `BP_WeaponInstance_*` fields are still included later because they explain loaded ammo, max ammo, burst fields, enemy/GAS fields, and some confusing damage differences.
- Rifle/SMG-style dual attacksets use `AM_Player_Dual_Fire`, a shared both-guns montage. The corrected DPS table treats those as two damage events per firing cadence.
- Right/left dual attacksets use `AM_Player_Dual_Fire_R` plus `AM_Player_Dual_Fire_L`, or the big-fire equivalents. The corrected DPS table treats those as one damage event per cadence unless cycle-pair math applies.
- Dual cycle weapons should not pay cycle time after every individual shot. The dual cycle montages cycle both hands in one action.
- If an attackset does not override `FireRate`, it inherits `Default__DABP_PlayerAttackConfig_C.FireRate = 0.2`. This matters for `Attackset_MegaShotgun_dual`.

## DPS Rules Used

```text
non-cycle single DPS = damage per cadence / single FireRate
non-cycle dual DPS   = damage per cadence / dual FireRate

single cycle DPS = 2 shots / (2 * FireRate + CycleTime)
dual cycle DPS   = 4 shots / (4 * FireRate + 1 * CycleTime)
```

For rifle/SMG duals, `damage per cadence` is doubled because `AM_Player_Dual_Fire` is the shared both-guns montage.

Displayed DPS is ammo-limited by available pre-reload damage when the weapon empties before it can sustain its theoretical cadence DPS for a full second. Underlined DPS values use this limit.

## Ranged Tuning Table

| Weapon            |         Attackset damage | Ammo before reload | Cycle                  | Single                            | Dual                                                  | Dual read                                                                         |   Single DPS | Corrected dual DPS |
| ----------------- | -----------------------: | ----------------: | ---------------------- | --------------------------------- | ----------------------------------------------------- | --------------------------------------------------------------------------------- | -----------: | -----------------: |
| Crossbow          | `0.1 + 80 = 80.1` |                 1 | none exported          | `0.4s` `Attackset_Crossbow`       | `0.1s` `Attackset_Crossbow_Dual`                      | Exploding bolt: one R/L bolt per cadence; damage is direct + explosion            | <u>80.1</u> |       <u>160.2</u> |
| IAO Rifle         |                        6 |                20 | none exported          | `0.1s` `Attackset_IAORifle`       | `0.1s` `Attackset_IAORifle_Dual`                      | `AM_Player_Dual_Fire` both montage, assumed 2 damage events/cadence               |           60 |                120 |
| Sniper Rifle      |                       60 |  1 loaded + 1 mag | `0.8s` bolt/load cycle | `0.5s` `Attackset_Sniper`         | `0.1s` `Attackset_Sniper_Dual`                        | R/L montages; one dual cycle after each two-hand pair                             |        66.67 |                200 |
| IAO Shotgun       |         `5.2 x 9 = 46.8` |                 2 | none exported          | `0.06s` `Attackset_IAOShotgun`    | `0.06s` `Attackset_IAOShotgun_Dual`                   | R/L montages; no cycle timing exported, treated as straight fire                  |  <u>93.6</u> |       <u>187.2</u> |
| Dollar Store M4   |                        6 |                20 | none exported          | `0.1s` `Attackset_DollarStoreM4`  | `0.1s` `Attackset_DollarStoreM4_dual`                 | `AM_Player_Dual_Fire` both montage, assumed 2 damage events/cadence               |           60 |                120 |
| Stubby SMG        |                        4 |                25 | none exported          | `0.08s` `Attackset_StubbySMG`     | `0.08s` `Attackset_StubbySMGDual`                     | `AM_Player_Dual_Fire` both montage, assumed 2 damage events/cadence               |           50 |                100 |
| SMG               |                      3.6 |                30 | none exported          | `0.07s` `Attackset_MP5`           | `0.07s` `Attackset_MP5_Dual`                          | `AM_Player_Dual_Fire` both montage, assumed 2 damage events/cadence               |        51.43 |             102.86 |
| Shotgun           |        `4.8 x 12 = 57.6` |  1 loaded + 1 mag | `0.6s` pump cycle      | `0.06s` `Attackset_ShedShotgun`   | `0.06s` `Attackset_ShedShotgun_Dual`                  | R/L montages; one dual pump after each two-hand pair                              | <u>115.2</u> |       <u>230.4</u> |
| Revolver          |                       10 |                 6 | none exported          | `0.15s` `Attackset_Revolver`      | `0.1s` `Attackset_Revolver_Dual`                      | R/L montages; faster cadence only                                                 |    <u>60</u> |          <u>60</u> |
| Mega Shotty       |             `6 x 8 = 48` |                 5 | none exported          | `0.25s` `Attackset_MegaShotgun`   | `0.2s` inherited default `Attackset_MegaShotgun_dual` | R/L montages; no both-fire montage; alternating read at inherited default cadence |          192 |                240 |
| Pistol            |                       10 |                10 | none exported          | `0.06s` `Attackset_Handgun`       | `0.06s` `Attackset_Handgun_Dual`                      | R/L montages; alternating/single damage event per cadence                         |   <u>100</u> |         <u>100</u> |
| High Cal Revolver |                       20 |                 6 | none exported          | `0.25s` `Attackset_HicalRevolver` | `0.25s` `Attackset_HicalRevolver_Dual`                | R/L big-fire montages; alternating/single damage event per cadence                |           80 |                 80 |

## DPS Calculations

| Weapon            | Single math                                             | Dual math                                                  |
| ----------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| Crossbow          | true `80.1 / 0.4 = 200.25`, ammo `80.1 x 1 = 80.1`     | true `80.1 / 0.1 = 801`, ammo `80.1 x 2 = 160.2`          |
| IAO Rifle         | `6 / 0.1 = 60`                                          | `(6 x 2) / 0.1 = 120`                                      |
| Dollar Store M4   | `6 / 0.1 = 60`                                          | `(6 x 2) / 0.1 = 120`                                      |
| Stubby SMG        | `4 / 0.08 = 50`                                         | `(4 x 2) / 0.08 = 100`                                     |
| SMG               | `3.6 / 0.07 = 51.43`                                    | `(3.6 x 2) / 0.07 = 102.86`                                |
| Sniper Rifle      | `(60 x 2) / (2 x 0.5 + 0.8) = 66.67`                    | `(60 x 4) / (4 x 0.1 + 0.8) = 200`                         |
| IAO Shotgun       | true `46.8 / 0.06 = 780`, ammo `46.8 x 2 = 93.6`        | true `46.8 / 0.06 = 780`, ammo `46.8 x 4 = 187.2`          |
| Shotgun           | true `(57.6 x 2) / (2 x 0.06 + 0.6) = 160`, ammo `115.2` | true `(57.6 x 4) / (4 x 0.06 + 0.6) = 274.29`, ammo `230.4` |
| Revolver          | true `10 / 0.15 = 66.67`, ammo `10 x 6 = 60`            | true `10 / 0.1 = 100`, alt-fire ammo `10 x 6 = 60`         |
| Mega Shotty       | `48 / 0.25 = 192`                                       | `48 / 0.2 = 240`                                           |
| Pistol            | true `10 / 0.06 = 166.67`, ammo `10 x 10 = 100`         | true `10 / 0.06 = 166.67`, alt-fire ammo `10 x 10 = 100`   |
| High Cal Revolver | `20 / 0.25 = 80`                                        | `20 / 0.25 = 80`                                           |

## Crossbow Exploding Bolt

The crossbow is the special case because the attackset's `Ranged Damage = 0.1` is only the direct projectile hit. Both single and dual crossbow variants fire `WrestlerProjectile_ExplodingBolt_C`, and the damage payload lives on the spawned explosive bolt / explosion actor path. The table therefore treats each player crossbow bolt as `0.1` direct damage plus `80` enemy explosion damage, for `80.1` damage per bolt.

Attackset fields:

- `Attackset_Crossbow`: `FireRate = 0.4`, `Ranged Damage = 0.1`, `RangedProjectileClass = WrestlerProjectile_ExplodingBolt_C`, `ProjectileSpeed = 6000`, `Quiet = true`.
- `Attackset_Crossbow_Dual`: `FireRate = 0.1`, `Ranged Damage = 0.1`, `RangedProjectileClass = WrestlerProjectile_ExplodingBolt_C`, `ProjectileSpeed = 6000`, R/L fire montages.
- Both use `SM_Crossbow_Bolt` as the visible extra mesh.

Weapon instance fields:

- `BP_WeaponInstance_Crossbow_C`: `PlayerWield Ammo = 1`, `MaxAmmo = 1`, `ShotsPerBurst = 1`, `ShotFireRate = 0.1`.
- Instance projectile speed is `4000`; the player attacksets override/use `6000`.
- `DamageTag = Data.Damage.Ranged.Crossbow`, but I did not find a separate numeric damage table for that tag in the export.
- NPC/instance range: `MinRangedDistance = 500`, `MaxRangedDistance = 6000`; aim/telegraph fields are `AimDuration = 1.5`, `TelegraphDuration = 0.45`, `TelegraphVisualDuration = 0.3`.

Projectile defaults on `WrestlerProjectile_ExplodingBolt_C`:

- Inherits `WrestlerProjectile_base_C`.
- Projectile default speed `4000`, gravity scale `0.7`.
- Attack tag `Combat.Attack.Projectile.Bullet.medium`.
- `HeadShotMultiplier = 1.0`, `HeadshotDeathTag = Combat.Death.BloodSalvo`.
- `Unbirthed Damage Multiplier = 3.0`.
- `BaseFalloff = (500, 1500, 1.0, 1.0)`.
- Trail VFX `NS_ExplodingBolt_trail`.
- Red point light: attenuation radius `300`, intensity `40`.
- Visible bolt mesh `SM_Crossbow_Bolt`, scale `1.5`.
- Has a 1.0s `SS Move` timeline with `bIgnoreTimeDilation = true`.

Explosion path:

- `WrestlerProjectile_ExplodingBolt_C` has a `Bolt` field of type `BP_Throwable_Bolt_C` and a `SpawnBolt` function.
- `BP_Throwable_Bolt_C` overrides `IsExplosive`, has an `AbilitySystemComponent`, and its cooked graph spawns `BP_Explosion_TickDelay_C`.
- `BP_Explosion_TickDelay_C` does not override the explosion defaults; it inherits from `BP_Explosion_C`.
- `BP_Throwable_Bolt_C` has a `Beepline` light-flash timeline with length `3.3s`. The curve flashes at roughly `0.0`, `0.93`, `1.61`, `2.08`, `2.46`, `2.70`, `2.90`, `3.05`, and `3.17s`.

Explosion defaults inherited from `BP_Explosion_C`:

| Field                          |       Value |
| ------------------------------ | ----------: |
| `ExplodeImmediately`           |        true |
| `AffectEnemies`                |        true |
| `AffectPlayer`                 |        true |
| `AffectPhysics`                |        true |
| `EnemyDamage`                  |          80 |
| `EnemyDamageRange`             |  150 to 500 |
| `EnemyForce`                   |         800 |
| `EnemyForceRange`              |  200 to 300 |
| `Enemy Stumble Range`          |         700 |
| `PlayerDamage`                 |          15 |
| `PlayerDamageRange`            |  150 to 300 |
| `PlayerForce`                  |         700 |
| `PlayerForceRange`             | 200 to 1000 |
| `Player Knocked Range`         |         300 |
| `PhysicsForce`                 |        7000 |
| `PhysicsForceRadius`           |         600 |
| `Phys Damage`                  |           5 |
| `PhysDamageRange`              |         250 |
| `Noise Range`                  |        5000 |
| `LightFlashTime`               |         0.1 |
| `ShouldSendExplosionKillEvent` |        true |
| `InitialLifeSpan`              |           1 |

Other explosion defaults:

- Explosion VFX/default VFX: `NS_FragGrenade_02`.
- Scorch decal: `MI_Explosion_scorch`, base decal size `(200, 400, 400)`, fade delay `5.0`, fade duration `2.0`.
- Noise tag: `Noise.Instant.Explosion`.
- Camera shakes: `CameraShake_Explosion_Rumble_strong` strength `2.0` falloff `7000`, and `CameraShake_Explosion_sharp_strong` strength `1.5` falloff `10000`.
- I found an audio asset named `WEP_Explosions_ExplosiveArrow`, but I did not find it explicitly wired into `BP_Explosion_C`, `BP_Explosion_TickDelay_C`, or `BP_Throwable_Bolt_C` defaults. Treat the audio link as unconfirmed unless confirmed in graph/runtime.

## Dual-Wield Attackset Details

`FireRate` here is the player attackset `FireRate`, not `PlayerWield FireRate` on `BP_WeaponInstance_*`. Lower is faster. `CadenceMultiplier` is `single FireRate / dual FireRate`; this only measures cadence, not damage events per cadence.

| Weapon            | Single attackset          | Dual attackset                 | Single `FireRate` |       Dual `FireRate` | Cadence mult | Dual montage fields                                    | Read                                                                                          |
| ----------------- | ------------------------- | ------------------------------ | ----------------: | --------------------: | -----------: | ------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Crossbow          | `Attackset_Crossbow`      | `Attackset_Crossbow_Dual`      |               0.4 |                   0.1 |          4.0 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L`       | Exploding bolt: one R/L bolt per cadence; table uses `0.1 + 80` damage.                       |
| Dollar Store M4   | `Attackset_DollarStoreM4` | `Attackset_DollarStoreM4_dual` |               0.1 |                   0.1 |          1.0 | `AM_Player_Dual_Fire`, `AM_Player_Dual_Fire`           | Same cadence, shared both-guns montage, DPS assumes 2 damage events/cadence.                  |
| Handgun           | `Attackset_Handgun`       | `Attackset_Handgun_Dual`       |              0.06 |                  0.06 |          1.0 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L`       | Same cadence, R/L alternating read.                                                           |
| High Cal Revolver | `Attackset_HicalRevolver` | `Attackset_HicalRevolver_Dual` |              0.25 |                  0.25 |          1.0 | `AM_Player_Dual_FireBig_R`, `AM_Player_Dual_FireBig_L` | Same cadence, R/L alternating read.                                                           |
| IAO Rifle         | `Attackset_IAORifle`      | `Attackset_IAORifle_Dual`      |               0.1 |                   0.1 |          1.0 | `AM_Player_Dual_Fire`, `AM_Player_Dual_Fire`           | Same cadence, shared both-guns montage, DPS assumes 2 damage events/cadence.                  |
| IAO Shotgun       | `Attackset_IAOShotgun`    | `Attackset_IAOShotgun_Dual`    |              0.06 |                  0.06 |          1.0 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L`       | Same cadence and same pellets, R/L alternating read.                                          |
| Mega Shotty       | `Attackset_MegaShotgun`   | `Attackset_MegaShotgun_dual`   |              0.25 | 0.2 inherited default |         1.25 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L`       | No explicit `FireRate` override, so it inherits the data asset default; R/L alternating read. |
| MP5 / SMG         | `Attackset_MP5`           | `Attackset_MP5_Dual`           |              0.07 |                  0.07 |          1.0 | `AM_Player_Dual_Fire`, `AM_Player_Dual_Fire`           | Same cadence, shared both-guns montage, DPS assumes 2 damage events/cadence.                  |
| Revolver          | `Attackset_Revolver`      | `Attackset_Revolver_Dual`      |              0.15 |                   0.1 |          1.5 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L`       | Faster, but not doubled.                                                                      |
| Shed Shotgun      | `Attackset_ShedShotgun`   | `Attackset_ShedShotgun_Dual`   |              0.06 |                  0.06 |          1.0 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L`       | Same cadence and same pellets; cycle time stays 0.6.                                          |
| Sniper Rifle      | `Attackset_Sniper`        | `Attackset_Sniper_Dual`        |               0.5 |                   0.1 |          5.0 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L`       | Much faster dual cadence; cycle time stays 0.8.                                               |
| Stubby SMG        | `Attackset_StubbySMG`     | `Attackset_StubbySMGDual`      |              0.08 |                  0.08 |          1.0 | `AM_Player_Dual_Fire`, `AM_Player_Dual_Fire`           | Same cadence, shared both-guns montage, DPS assumes 2 damage events/cadence.                  |

## Weapon Instance Fields

These are the `BP_WeaponInstance_*` values gathered for the TKable weapon list. They are not always the same as player attackset damage/timing, so use them as raw instance data rather than as the DPS table source.

| Weapon            | Spawner                              | Instance                                     | AmmoBeforeReload | AmmoMag | PlayerFireRate | Instance projectile damage | ProjectilesPerShot | MaxAmmo | ShotsPerBurst | ShotFireRate | DamagePerProjectile |
| ----------------- | ------------------------------------ | -------------------------------------------- | ---------------: | ------: | -------------: | -------------------------: | -----------------: | ------: | ------------: | -----------: | ------------------: |
| Crossbow          | `BP_WeaponSpawner_Crossbow_C`        | `BP_WeaponInstance_Crossbow_C`               |                1 |         |            1.0 |                    special |                  1 |       1 |             1 |          0.1 |             special |
| IAO Rifle         | `BP_WeaponSpawner_IAORifle_C`        | `BP_WeaponInstance_Rifle_C`                  |               20 |         |            0.1 |                        6.0 |                  1 |      30 |             5 |          0.1 |                 1.5 |
| Sniper Rifle      | `BP_WeaponSpawner_SniperRifle_C`     | `BP_WeaponInstance_SniperRifle_C`            |                1 |       1 |            1.0 |                       60.0 |                  1 |       5 |             1 |          0.7 |                14.0 |
| IAO Shotgun       | `BP_WeaponSpawner_IAOShotgun_C`      | `BP_WeaponInstance_Shotgun_C`                |                2 |         |            0.2 |                        4.3 |                  7 |       5 |             1 |          1.4 |                 1.0 |
| Dollar Store M4   | `BP_WeaponSpawner_DollarStoreM4_C`   | `BP_WeaponInstance_Rifle_ThinbloodEarly_C`   |               20 |         |            0.1 |                        6.0 |                  1 |      30 |             5 |          0.1 |                 1.5 |
| Stubby SMG        | `BP_WeaponSpawner_StubbySmg_C`       | `BP_WeaponInstance_Rifle_Dual_C`             |               25 |         |           0.08 |                        4.0 |                  1 |      60 |            15 |         0.08 |                 1.2 |
| SMG               | `BP_WeaponSpawner_SMG_C`             | `BP_WeaponInstance_SMG_C`                    |               30 |         |           0.07 |                        3.0 |                  1 |      30 |             3 |         0.07 |                 1.5 |
| Shotgun           | `BP_WeaponSpawner_Shotgun_C`         | `BP_WeaponInstance_Shotgun_ThinbloodEarly_C` |                1 |       1 |            0.7 |                        4.8 |                 12 |       4 |             1 |          1.5 |                 1.0 |
| Revolver          | `BP_WeaponSpawner_Revolver_C`        | `BP_WeaponInstance_Revolver_C`               |                6 |         |            0.2 |                       10.0 |                  1 |       6 |             1 |         1.25 |                3.75 |
| Mega Shotty       | `BP_WeaponSpawner_MegaShotty_C`      | `BP_WeaponInstance_Shotgun_Pump_C`           |                5 |         |           0.25 |                        3.4 |                  8 |      10 |             5 |          0.8 |                 1.0 |
| Pistol            | `BP_WeaponSpawner_Pistol_C`          | `BP_WeaponInstance_Handgun_C`                |               10 |         |            0.2 |                       10.0 |                  1 |      15 |             6 |          0.5 |                 3.0 |
| High Cal Revolver | `BP_WeaponSpawner_HighCalRevolver_C` | `BP_WeaponInstance_HighCaliburPistol_C`      |                6 |         |           0.25 |                       15.0 |                  1 |       6 |             1 |         1.25 |                3.75 |

Notes:

- `AmmoBeforeReload` is the direct `PlayerWield Ammo` field.
- `AmmoMag` is the direct `PlayerWield Ammo Mag` field. It appears on sniper rifle and plain shotgun in this set, both with value `1`.
- Pickup total is not represented cleanly by these class-default fields. In-game sniper pickups showing 2 shots are consistent with `AmmoBeforeReload = 1` plus a one-round mag/cycle value, but the class defaults should not be treated as authoritative pickup ammo.
- All ranged thrown damage still inherits `DA_Throwable_Weapon_LittleDamage`, which is `Damage = 10.0`.
- `Mega Shotty` does not override `MaxAmmo`; the native `UWrestlerRangedWeaponInstance` default is `10`.
- Crossbow has no direct `PlayerWield Damage` or `DamagePerProjectile` override in the weapon instance, so the raw instance stays `special`; the player-output table uses the exploding bolt path's `0.1 + 80` damage.
- The screenshot had `Stubby SMG` and `SMG` ammo values swapped. Exported loaded ammo is `StubbySmg = 25` and `SMG = 30`.

## Reload, Pump, and Bolt Cycle

The player weapon manager has separate held ammo and held mag ammo properties:

- `PI_HeldWeaponAmmo`
- `PI_HeldWeaponMagAmmo`
- `AmmoMap` entries for `Data.Ammo.CURRENT` and `Data.Ammo.MAG`

For player-held guns, pump/bolt behavior shows up as `RangedCycle` plus `CycleTime` on the player attackset. I did not find a normal player `RangedReload` field on the gun attacksets. There is a bare `CC_Reload` control cue and a generic NPC/GAS reload ability, but the explicit player-side animation hook for pump/bolt is `RangedCycle`.

Only these player gun attacksets expose `RangedCycle` in this export:

| Attackset                    | Instance                                     | Loaded ammo | Ammo mag | RangedCycle             | CycleTime | Montage length | Details                                                                                                            |
| ---------------------------- | -------------------------------------------- | ----------: | -------: | ----------------------- | --------: | -------------: | ------------------------------------------------------------------------------------------------------------------ |
| `Attackset_ShedShotgun`      | `BP_WeaponInstance_Shotgun_ThinbloodEarly_C` |           1 |        1 | `AM_Shotgun_Cycle`      |       0.6 |     0.98333335 | Pump audio `WEP_NPC_Foley_Shotgun_Pump_Player` at 0.27788734s. Plays weapon montage `AM_wep_Player_shotgun_Cycle`. |
| `Attackset_ShedShotgun_Dual` | `BP_WeaponInstance_Shotgun_ThinbloodEarly_C` |           1 |        1 | `AM_Shotgun_Cycle_Dual` |       0.6 |     0.98333335 | Pump audio at 0.2100539s left and 0.30831707s right. Plays `AM_wep_Player_shotgun_Cycle` twice.                    |
| `Attackset_Sniper`           | `BP_WeaponInstance_SniperRifle_C`            |           1 |        1 | `AM_Sniper_Cycle`       |       0.8 |        1.34445 | Bolt/load audio `WEP_Sniper_Load_Player` at 0.19579965s. Rifle shell VFX at 0.47729275s.                           |
| `Attackset_Sniper_Dual`      | `BP_WeaponInstance_SniperRifle_C`            |           1 |        1 | `AM_Sniper_Cycle_Dual`  |       0.8 |     0.98333335 | Uses `WEP_Sniper_Load_Player`, but reuses `Anim_Shotgun_Cycle_Dual` and plays `AM_wep_Player_shotgun_Cycle` twice. |

The weapon montage `AM_wep_Player_shotgun_Cycle` is 0.7075s and emits `NS_Shotgun_Shell` at 0.20549753s. It is referenced by shotgun cycle, dual shotgun cycle, and the dual sniper cycle asset.

Important absence: `Attackset_MegaShotgun` uses `BP_WeaponInstance_Shotgun_Pump_C`, but has no `RangedCycle` or `CycleTime` in this export. Its pump naming seems to be in the weapon instance or asset identity, not an explicit player cycle hook.

Other attacksets without `RangedCycle`: crossbow, Dollar Store M4, handgun, high-cal revolver, IAO rifle, IAO shotgun, Mega Shotty, MP5/SMG, revolver, and Stubby SMG variants.

## Generic Cycle and Reload Abilities

`GA_PlayerCycl`:

- Ability tag: `Combat.Ability.Ranged.Cycle`
- `bRetriggerInstancedAbility`: true
- Has a `MoveAmmo` function
- Reads `WrestlerPlayerWeaponManager`
- Blocks activation while already cycling, firing, scoped, changing weapon, or tagged `Combat.General.NoCycle`

`GA_Weapon_Reload` is generic GAS/NPC reload:

- `ReloadGC`: `GameplayCue.Source.Combat.Weapon.Ranged.Reload`
- `MontageTag`: `Combat.Ability.Ranged.Reload`
- `MontagePlaybackRate`: 1.0
- Blocks: `Combat.Ability.Ranged.Fire`, `Combat.Ability.Ranged.Reload`
- Owned tags while active: `AI.Perception.PauseDetection`, `Combat.Ability.Ranged.Reload`

`GA_Weapon_cycle` is separate from reload:

- `MontageTag`: `AnimationTag.Montage.Ranged.Cycle`
- `Montage`: `AM_shotgun_Cycle`
- Ability tag: `Combat.Ability.Ranged.Cycle`
- Blocks: `Combat.Ability.Ranged`, `Combat.Ability.Melee`

## Enemy Reload and Cycle Animation Timings

These are enemy/GAS-side, not player attackset cycle fields:

| Asset                                       |    Length | Details                                                                 |
| ------------------------------------------- | --------: | ----------------------------------------------------------------------- |
| `AM_shotgun_Cycle`                          |       1.1 | Enemy shotgun cycle. Plays weapon montage `AM_wep_shotgun_Cycle`.       |
| `AM_wep_shotgun_Cycle`                      |       1.1 | Weapon-side shotgun cycle. Shell VFX `NS_Shotgun_Shell` at 0.35004422s. |
| `AM_Enemy_Combat_Reload_Shotgun_01`         |       2.7 | Plays weapon montage `AM_wep_shotgun_reload_01`.                        |
| `AM_wep_shotgun_reload_01`                  |       2.7 | Weapon-side shotgun reload.                                             |
| `AM_Enemy_Combat_Reload_Rifle_01`           |   2.13333 | Plays `AM_Weapon_Rifle_Reload_01`.                                      |
| `AM_Enemy_Combat_Reload_Pistol_01`          |   2.13333 | Plays `AM_Weapon_Pistol_Reload_01`.                                     |
| `AM_Enemy_Combat_Reload_Pistol_Revolver_01` |   2.13333 | Plays `AM_Weapon_Pistol_Reload_Revolver_01`.                            |
| `AM_Enemy_Combat_Reload_Crossbow`           |   4.26667 | Uses rifle reload animation at play rate 0.5.                           |
| `AM_Flusher_Combat_Reload_01`               |   1.76667 | Flusher reload.                                                         |
| `AM_Distractor_Combat_Reload_Shotgun_01`    |      3.38 | Distractor shotgun reload.                                              |
| `AM_MinorGhoulReload`                       | 4.4333334 | Minor ghoul reload.                                                     |

## Audio Reload Fields

Some ranged weapon instances have `AudioRangedWeaponReload`, but this appears to be the NPC/GAS reload audio field rather than the player pump/bolt cycle animation hook:

- Rifle, rifle thinblood, rifle dual, SMG, sniper: `WEP_NPC_AssaultRifle_Reload_GC`
- Handgun, revolver, high-cal, high-cal dual: `WEP_NPC_Pistol_Reload_GC`
- Shotgun variants and crossbow did not expose `AudioRangedWeaponReload` in their weapon instance defaults.

Benny has a separate DLC player reload montage, `AM_bennyGun_Reload`, length 1.0s, with `WEP_NPC_Foley_Shotgun_Pump` at 0.083203614s and `Combat.General.HideWep.Instant` for 0.5895359s. It is not part of the TKable weapon list.

## Telekinesis Boltpull

`GA_Telekenesis_Boltpull` is not a firearm bolt-action reload. It is a Telekinesis player ability:

- `AbilityDataId`: `DA_Ability_Telekinesis`
- Montage: `AM_TK_Boltpull`
- Gameplay tag: `Combat.Ability.Skill.Telekinesis.BoltPull`
- Gameplay cue: `GameplayCue.Source.Ability.Telekinesis.BoltPull`
- Montage length: 0.6666667s
- Hides weapon for the whole montage via `Combat.General.HideWep`

This is granted in Ysabella's default ability data, but it is separate from sniper `RangedCycle`.

## Mega Shotty Dual

`Attackset_MegaShotgun_dual` has:

- `Ranged Damage`: `6`
- `BulletsPerShot`: `8`
- Damage per shot: `48`
- `RangedFire`: `AM_Player_Dual_Fire_R`
- `RangedFire_L`: `AM_Player_Dual_Fire_L`
- No explicit `FireRate` override, so it inherits `Default__DABP_PlayerAttackConfig_C.FireRate = 0.2`
- No explicit `RangedCycle` or `CycleTime`

The dual attackset uses right/left fire montages, not the shared both-guns `AM_Player_Dual_Fire` montage. I would not count Mega Shotty dual as a clean 2x simultaneous-fire case from the exported attackset.

The missing-looking detail was an inheritance/export issue: the dual asset omits `FireRate` because it does not override the parent data asset default. That gives a usable dual cadence of `0.2s`, while the single Mega Shotty explicitly overrides to `0.25s`.

| Read                                                                 | Formula                                 |   Dual DPS |
| -------------------------------------------------------------------- | --------------------------------------- | ---------: |
| Export-supported inherited default, one R/L damage event per cadence | `48 / 0.2`                              |        240 |
| Treating it as simultaneous two-gun fire                             | not supported by the R/L montage fields | unverified |

Related timing:

- Single fire montage `AM_Player_MegaShotty_Fire`: length `0.6s`, `RangedAction` slot, uses `Anim_MegaShotty_FireBig`.
- Dual fire montages `AM_Player_Dual_Fire_R` and `AM_Player_Dual_Fire_L`: both length `0.7s`; right uses `RangedAction`, left uses `CombatLeftArm`.
- Empty montage `AM_MegaShotty_empty`: length `1.0138834s`.

## Changes Versus Older Table

Compared against `Notes etc/TKable_Weapons.csv` from 2026-04-21.

| Weapon        | Old                                    | Current                                                                                   |
| ------------- | -------------------------------------- | ----------------------------------------------------------------------------------------- |
| IAORifle      | AmmoCount `12`                         | AmmoBeforeReload `20`                                                                     |
| DollarStoreM4 | AmmoCount `12`                         | AmmoBeforeReload `20`                                                                     |
| StubbySmg     | AmmoCount `20`, ProjectileDamage `3.0` | AmmoBeforeReload `25`, instance projectile damage `4.0`                                   |
| SMG           | AmmoCount `22`, ProjectileDamage `4.0` | AmmoBeforeReload `30`, instance projectile damage `3.0`; player attackset damage is `3.6` |
| SniperRifle   | AmmoCount `1`                          | `AmmoBeforeReload = 1`, `ReloadAmmoMag = 1`                                               |
| Shotgun       | AmmoCount `1`                          | `AmmoBeforeReload = 1`, `ReloadAmmoMag = 1`                                               |

No projectiles-per-shot/pellet counts changed in the raw TKable weapon instance table.

Placed spawners can override ammo. I found one `BP_WeaponSpawner_SniperRifle` in `Dgn_Dam_Jungle_Gameplay` with `AmmoOverride = 5`, but no exported `OverrideAmmo = true`; the only exported `OverrideAmmo = true` I found is an IAO shotgun in `Dgn_Conservatory_DLC2` with `AmmoOverride = 3`.

## Sources

- Current registry: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/TCR_DebugMenu/Content/Data/Wrestler/DT_ThrowableWeapons.json`
- Player gun attacksets: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/PlayerCharacter/Weapons/Guns/Attackset_*.json`
- Player attackset default values: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Melee/DABP_PlayerAttackConfig.json`
- Dual gun animations: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/PlayerCharacter/Weapons/GunAnims/Dual/*.json`
- Crossbow instance/projectile/explosion: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/Crossbow/BP_WeaponInstance_Crossbow.json`, `Weapons/Projectiles/WrestlerProjectile_ExplodingBolt.json`, `Weapons/Projectiles/BP_Throwable_Bolt.json`, `Weapons/Explosion/BP_Explosion.json`, and `Weapons/Explosion/BP_Explosion_TickDelay.json`
- Shotgun/sniper cycle animations: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/PlayerCharacter/Weapons/GunAnims/Shotgun` and `GunAnims/Sniper`
- Ranged base: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/BP_RangedWeaponInstance_Base.json`
- Native defaults: `EXPORTS/Dev/Bloodlines2_23416145/20260610_143611/UHTHeaderDump/Wrestler/Private/WrestlerRangedWeaponInstance.cpp`
- Throwable damage: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCore/InteractiveProps/Throwable/DataAssets/Weapons/DA_Throwable_Weapon_LittleDamage.json`
