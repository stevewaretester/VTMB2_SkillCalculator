# TKable Weapons - 23416145 Changes

Compared against `Notes etc/TKable_Weapons.csv` from 2026-04-21.

## Meaningful changes

| Weapon | Old | Current |
| --- | --- | --- |
| IAORifle | AmmoCount `12` | AmmoCount `20` |
| DollarStoreM4 | AmmoCount `12` | AmmoCount `20` |
| StubbySmg | AmmoCount `20`, ProjectileDamage `3.0` | AmmoCount `25`, ProjectileDamage `4.0` |
| SMG | AmmoCount `22`, ProjectileDamage `4.0` | AmmoCount `30`, ProjectileDamage `3.0` |
| SniperRifle | AmmoCount `1` | `AmmoBeforeReload = 1`, `ReloadAmmoMag = 1` |
| Shotgun | AmmoCount `1` | `AmmoBeforeReload = 1`, `ReloadAmmoMag = 1` |

No projectiles-per-shot/pellet counts changed.

Ranged thrown damage still inherits `BP_RangedWeaponInstance_Base -> DA_Throwable_Weapon_LittleDamage`, which is still `Damage = 10.0`.

## Current notes

- `AmmoBeforeReload` is the direct `PlayerWield Ammo` field. Treat it as the loaded shots before the weapon reloads/cycles, not the total ammo granted on pickup.
- `ReloadAmmoMag` is the direct `PlayerWield Ammo Mag` field. It only appears on `SniperRifle` and the plain `Shotgun` in this set, both with value `1`.
- Pickup total is not represented cleanly by these class-default fields. In-game sniper pickups showing 2 shots are consistent with `AmmoBeforeReload = 1` plus a one-round reload/cycle mag, but the CSV should not treat that sum as authoritative pickup ammo.
- `MaxAmmo`, `ShotFireRate`, and `DamagePerProjectile` are the ranged weapon instance fields used by the enemy/GAS ranged weapon layer.
- `MegaShotty` does not override `MaxAmmo`; the native `UWrestlerRangedWeaponInstance` default is `10`.
- Crossbow still has no direct `PlayerWield Damage` or `DamagePerProjectile` override in the weapon instance; keep it as `special`.
- Placed spawners can override ammo. I found one `BP_WeaponSpawner_SniperRifle` in `Dgn_Dam_Jungle_Gameplay` with `AmmoOverride = 5`, but no exported `OverrideAmmo = true`; the only exported `OverrideAmmo = true` I found is an IAO shotgun in `Dgn_Conservatory_DLC2` with `AmmoOverride = 3`.

## Sources

- Current registry: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/TCR_DebugMenu/Content/Data/Wrestler/DT_ThrowableWeapons.json`
- Ranged base: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/BP_RangedWeaponInstance_Base.json`
- Native defaults: `EXPORTS/Dev/Bloodlines2_23416145/20260610_143611/UHTHeaderDump/Wrestler/Private/WrestlerRangedWeaponInstance.cpp`
- Throwable damage: `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCore/InteractiveProps/Throwable/DataAssets/Weapons/DA_Throwable_Weapon_LittleDamage.json`
