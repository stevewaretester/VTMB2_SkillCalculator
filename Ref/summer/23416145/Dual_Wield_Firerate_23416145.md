# Dual-Wield Fire Rate - 23416145

## Short read

Dual-wielding does not appear to be a simple "double the fire rate" rule.

The player gun attacksets have their own dual variants. These variants usually keep the same `FireRate` delay as the single version, and add/replace firing montages with `RangedFire_L` and dual-specific animations. A few are tuned faster by hand.

`GA_PlayerShoot` has a `FiringOffhand` helper and selects between normal fire and offhand/left-hand state using weapon-manager ammo state. So the exported data points toward alternating/selecting the firing hand rather than a universal "fire both weapons every trigger" multiplier.

## Attackset fire-rate comparison

`FireRate` here is the player attackset `FireRate`, not the `PlayerWield FireRate` field on `BP_WeaponInstance_*`. Lower means faster. `CadenceMultiplier` is `single FireRate / dual FireRate`; `2.0` would be exactly doubled cadence.

| Weapon | Single `FireRate` | Dual `FireRate` | CadenceMultiplier | Dual fire montage fields | Read |
|---|---:|---:|---:|---|---|
| Crossbow | 0.4 | 0.1 | 4.0 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L` | Much faster than single, not merely double. |
| DollarStoreM4 | 0.1 | 0.1 | 1.0 | `AM_Player_Dual_Fire`, `AM_Player_Dual_Fire` | Same attack cadence. |
| Handgun | 0.06 | 0.06 | 1.0 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L` | Same attack cadence. |
| HighCalRevolver | 0.25 | 0.25 | 1.0 | `AM_Player_Dual_FireBig_R`, `AM_Player_Dual_FireBig_L` | Same attack cadence. |
| IAORifle | 0.1 | 0.1 | 1.0 | `AM_Player_Dual_Fire`, `AM_Player_Dual_Fire` | Same attack cadence. |
| IAOShotgun | 0.06 | 0.06 | 1.0 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L` | Same attack cadence; pellets stay 9. |
| MegaShotgun | 0.25 | blank | unknown | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L` | Dual attackset does not expose a `FireRate`; likely inherited/default, but not explicit in this export. |
| MP5 | 0.07 | 0.07 | 1.0 | `AM_Player_Dual_Fire`, `AM_Player_Dual_Fire` | Same attack cadence. |
| Revolver | 0.15 | 0.1 | 1.5 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L` | Faster, but not doubled. |
| ShedShotgun | 0.06 | 0.06 | 1.0 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L` | Same attack cadence; pellets stay 12; cycle time stays 0.6. |
| Sniper | 0.5 | 0.1 | 5.0 | `AM_Player_Dual_Fire_R`, `AM_Player_Dual_Fire_L` | Much faster than single, not merely double; cycle time stays 0.8. |
| StubbySMG | 0.08 | 0.08 | 1.0 | `AM_Player_Dual_Fire`, `AM_Player_Dual_Fire` | Same attack cadence. |

## Weapon-instance layer

Some `BP_WeaponInstance_*_Dual` assets exist, but most dual player attacksets still point at the same weapon instance as the single version. The clearest dual-specific weapon instances in this export are:

| Instance | PlayerWield Ammo | PlayerWield FireRate | MaxAmmo | ShotsPerBurst | ShotFireRate | Notes |
|---|---:|---:|---:|---:|---:|---|
| `BP_WeaponInstance_HighCaliburPistol_C` | 6 | 0.25 | 6 | 1 | 1.25 | Single high-cal instance. |
| `BP_WeaponInstance_HighCaliburPistol_Dual_C` | 6 | 0.25 | 12 | 4 | 0.35 | Dual class exists, but the player `Attackset_HicalRevolver_Dual` points at the single class in this export. |
| `BP_WeaponInstance_Rifle_C` | 20 | 0.1 | 30 | 5 | 0.1 | Rifle instance. |
| `BP_WeaponInstance_Rifle_Dual_C` | 25 | 0.08 | 60 | 15 | 0.08 | Used by `Attackset_StubbySMG`, not simply the dual variant of every rifle attackset. |

So if you are balancing player dual wield, the player attackset `FireRate` is probably the better first-pass value. If you are reading enemy/GAS behavior, `ShotsPerBurst` and `ShotFireRate` can change separately.
