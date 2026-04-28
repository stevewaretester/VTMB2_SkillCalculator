# Weapon Attackset Combos (22727210)

## Scope

This file captures per-weapon attackset combo entries in the same style as clan attack-combo extraction: montage asset, montage sequence length, base damage, and directional variants per combo slot.

Primary source path:
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/PlayerCharacter/Weapons/Attackset_*.json`

Supporting source path for montage lengths:
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/PlayerCharacter/Weapons/Anims/*.json`

**Benny clan fist attackset**: `Attackset_Benny` is documented separately in `benny_combat_22727210.md` (DLC plugin path). Key differences from weapon sets: there are **no directional variants**; the combo uses lunging-tagged light attacks and a separate block montage (`AM_Player_Block_Benny`), while referencing Brujah-located montage assets.

Format:
- `Light/Heavy` cells are `MontageName/SequenceLength/BaseDamage`.
- Directional entries are `DirectionEnum -> MontageName/SequenceLength/BaseDamage`.

### Attackset_Bat
| Slot | Light (montage/len/dmg) | Heavy (montage/len/dmg) | Directional variants |
|---|---|---|---|
| Attack0 | AM_Sword_Light1/1.2476166/6.0 | AM_Bat_Swing_01/2.5566666/20.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/3.0; AttackDirection::NewEnumerator1 -> AM_Overhead_1/1.2476166/7.0 |
| Attack1 | AM_Sword_Light2/1.2385334/6.0 | AM_Bat_Swing_02/2.5466666/20.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/3.0; AttackDirection::NewEnumerator1 -> AM_overhead_2/1.2385334/7.0 |
| Attack2 | AM_Sword_Light1/1.2476166/6.0 | AM_Bat_Swing_01/2.5566666/20.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/3.0; AttackDirection::NewEnumerator1 -> AM_Overhead_1/1.2476166/7.0 |
| Attack3 | AM_Sword_Light2/1.2385334/6.0 | AM_Bat_Swing_02/2.5466666/20.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/3.0; AttackDirection::NewEnumerator1 -> AM_overhead_2/1.2385334/7.0 |

### Attackset_Baton_Empty
| Slot | Light (montage/len/dmg) | Heavy (montage/len/dmg) | Directional variants |
|---|---|---|---|
| Attack0 | AM_Sword_Light1/1.2476166/4.0 | AM_Baton_Swing_01/2.5566666/14.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/2.0; AttackDirection::NewEnumerator1 -> AM_Overhead_1/1.2476166/5.0 |
| Attack1 | AM_Sword_Light2/1.2385334/4.0 | AM_Baton_Swing_02/2.5466666/14.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/2.0; AttackDirection::NewEnumerator1 -> AM_overhead_2/1.2385334/5.0 |
| Attack2 | AM_Sword_Light1/1.2476166/4.0 | AM_Baton_Swing_01/2.5566666/14.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/2.0; AttackDirection::NewEnumerator1 -> AM_Overhead_1/1.2476166/5.0 |
| Attack3 | AM_Sword_Light2/1.2385334/4.0 | AM_Baton_Swing_02/2.5466666/14.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/2.0; AttackDirection::NewEnumerator1 -> AM_overhead_2/1.2385334/5.0 |

### Attackset_Baton_Loaded
| Slot | Light (montage/len/dmg) | Heavy (montage/len/dmg) | Directional variants |
|---|---|---|---|
| Attack0 | AM_Sword_Light1/1.2476166/17.0 | AM_Baton_Swing_01/2.5566666/30.0 | AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0 |
| Attack1 | AM_Sword_Light2/1.2385334/17.0 | AM_Baton_Swing_02/2.5466666/30.0 | AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0 |
| Attack2 | AM_Sword_Light1/1.2476166/17.0 | AM_Baton_Swing_01/2.5566666/30.0 | AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0 |
| Attack3 | AM_Sword_Light2/1.2385334/17.0 | AM_Baton_Swing_02/2.5466666/30.0 | AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0 |

### Attackset_Knife
| Slot | Light (montage/len/dmg) | Heavy (montage/len/dmg) | Directional variants |
|---|---|---|---|
| Attack0 | AM_Knife_Light2/0.9996167/5.0 | AM_Knife_Heavy/1.8609333/15.0 | AttackDirection::NewEnumerator1 -> AM_Knife_Light1/0.9633333/7.0; AttackDirection::NewEnumerator2 -> AM_Knife_shove/0.95556/1.0 |
| Attack1 | AM_Knife_Light3/1.0009834/5.0 | AM_Knife_Heavy/1.8609333/15.0 | AttackDirection::NewEnumerator1 -> AM_Knife_Light1/0.9633333/7.0; AttackDirection::NewEnumerator2 -> AM_Knife_shove/0.95556/1.0 |
| Attack2 | AM_Knife_Light2/0.9996167/5.0 | AM_Knife_Heavy/1.8609333/12.0 | AttackDirection::NewEnumerator1 -> AM_Knife_Light1/0.9633333/7.0; AttackDirection::NewEnumerator2 -> AM_Knife_shove/0.95556/1.0 |
| Attack3 | AM_Knife_Light3/1.0009834/5.0 | AM_Knife_Heavy/1.8609333/12.0 | AttackDirection::NewEnumerator1 -> AM_Knife_Light1/0.9633333/7.0; AttackDirection::NewEnumerator2 -> AM_Knife_shove/0.95556/1.0 |

### Attackset_Machete
| Slot | Light (montage/len/dmg) | Heavy (montage/len/dmg) | Directional variants |
|---|---|---|---|
| Attack0 | AM_Knife_Light2/0.9996167/10.0 | AM_Knife_Heavy/1.8609333/15.0 | AttackDirection::NewEnumerator1 -> AM_Knife_Light1/0.9633333/12.8; AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0 |
| Attack1 | AM_Knife_Light3/1.0009834/10.0 | AM_Knife_Heavy/1.8609333/15.0 | AttackDirection::NewEnumerator1 -> AM_Knife_Light1/0.9633333/12.8; AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0 |
| Attack2 | AM_Knife_Light2/0.9996167/10.0 | AM_Knife_Heavy/1.8609333/12.0 | AttackDirection::NewEnumerator1 -> AM_Knife_Light1/0.9633333/12.8; AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0 |
| Attack3 | AM_Knife_Light3/1.0009834/10.0 | AM_Knife_Heavy/1.8609333/12.0 | AttackDirection::NewEnumerator1 -> AM_Knife_Light1/0.9633333/12.8; AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0 |

### Attackset_SledgeHammer
| Slot | Light (montage/len/dmg) | Heavy (montage/len/dmg) | Directional variants |
|---|---|---|---|
| Attack0 | AM_Hammer_light_1/1.3476167/20.0 | AM_Hammer_Heavy/1.4333333/70.0 | AttackDirection::NewEnumerator2 -> AM_Hammer_Poke/1.2507666/6.0 |
| Attack1 | AM_Hammer_Light_2/1.3476167/20.0 | AM_Hammer_Heavy/1.4333333/70.0 | AttackDirection::NewEnumerator2 -> AM_Hammer_Poke/1.2507666/6.0 |

### Attackset_SpikeBat
| Slot | Light (montage/len/dmg) | Heavy (montage/len/dmg) | Directional variants |
|---|---|---|---|
| Attack0 | AM_Sword_Light1/1.2476166/8.0 | AM_Bat_Swing_01/2.5566666/20.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/3.0; AttackDirection::NewEnumerator1 -> AM_Overhead_1/1.2476166/10.0 |
| Attack1 | AM_Sword_Light2/1.2385334/8.0 | AM_Bat_Swing_02/2.5466666/20.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/3.0; AttackDirection::NewEnumerator1 -> AM_overhead_2/1.2385334/10.0 |
| Attack2 | AM_Sword_Light1/1.2476166/8.0 | AM_Bat_Swing_01/2.5566666/20.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/3.0; AttackDirection::NewEnumerator1 -> AM_Overhead_1/1.2476166/10.0 |
| Attack3 | AM_Sword_Light2/1.2385334/8.0 | AM_Bat_Swing_02/2.5466666/20.0 | AttackDirection::NewEnumerator2 -> AM_Bat_Poke/1.2325/3.0; AttackDirection::NewEnumerator1 -> AM_overhead_2/1.2385334/10.0 |

### Attackset_Sword
| Slot | Light (montage/len/dmg) | Heavy (montage/len/dmg) | Directional variants |
|---|---|---|---|
| Attack0 | AM_Sword_Light1/1.2476166/13.0 | AM_Sword_stab_1/1.0449667/15.0 | AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0; AttackDirection::NewEnumerator1 -> AM_Overhead_1/1.2476166/15.0 |
| Attack1 | AM_Sword_Light2/1.2385334/13.0 | AM_Sword_stab_2/1.0449667/15.0 | AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0; AttackDirection::NewEnumerator1 -> AM_overhead_2/1.2385334/15.0 |
| Attack2 | AM_Sword_Light1/1.2476166/13.0 | AM_Sword_stab_1/1.0449667/12.0 | AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0; AttackDirection::NewEnumerator1 -> AM_Overhead_1/1.2476166/15.0 |
| Attack3 | AM_Sword_Light2/1.2385334/13.0 | AM_Sword_stab_2/1.0449667/12.0 | AttackDirection::NewEnumerator2 -> AM_wep_Shove/1.5339333/3.0; AttackDirection::NewEnumerator1 -> AM_overhead_2/1.2385334/15.0 |

### Attackset_WarHammer
| Slot | Light (montage/len/dmg) | Heavy (montage/len/dmg) | Directional variants |
|---|---|---|---|
| Attack0 | AM_Hammer_light_1/1.3476167/22.0 | AM_Hammer_Heavy/1.4333333/70.0 | AttackDirection::NewEnumerator2 -> AM_Hammer_Poke/1.2507666/6.0 |
| Attack1 | AM_Hammer_Light_2/1.3476167/22.0 | AM_Hammer_Heavy/1.4333333/70.0 | AttackDirection::NewEnumerator2 -> AM_Hammer_Poke/1.2507666/6.0 |

## TK Thrown Values (Weapon Instances)

These values are sourced from weapon instance `Throwable Data Asset` assignments and the referenced `WrestlerDataAsset_Throwable` assets.

Mapping sources:
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/**/BP_WeaponInstance_*.json`
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/BP_MeleeWeaponInstance_Base.json`

Throwable tier value sources:
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCore/InteractiveProps/Throwable/DataAssets/Weapons/DA_Throwable_Weapon_LittleDamage.json` (`Damage = 10.0`)
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCore/InteractiveProps/Throwable/DataAssets/Weapons/DA_Throwable_Weapon_MediumDamage.json` (`Damage = 15.0`)
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCore/InteractiveProps/Throwable/DataAssets/Weapons/DA_Throwable_Weapon_HeavyDamage.json` (`Damage = 50.0`)
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCore/InteractiveProps/Throwable/DataAssets/Weapons/DA_Throwable_Weapon_Obliterate.json` (`Damage = 65.0`)

### Attackset -> TK Throw Damage Mapping
| Attackset | Weapon instance source | Throwable data asset source | TK throw damage |
|---|---|---|---|
| Attackset_Bat | `Weapons/BaseballBat/BP_WeaponInstance_BaseballBat` | Inherited from `BP_MeleeWeaponInstance_Base` -> `DA_Throwable_Weapon_LittleDamage` | 10.0 |
| Attackset_Baton_Empty | `Weapons/ElectricBaton/BP_WeaponInstance_ElectricBaton` (`PlayerWeapon_Empty`) | Inherited from `BP_MeleeWeaponInstance_Base` -> `DA_Throwable_Weapon_LittleDamage` | 10.0 |
| Attackset_Baton_Loaded | `Weapons/ElectricBaton/BP_WeaponInstance_ElectricBaton` (`PlayerWeapon`) | Inherited from `BP_MeleeWeaponInstance_Base` -> `DA_Throwable_Weapon_LittleDamage` | 10.0 |
| Attackset_Knife | `Weapons/Knife/BP_WeaponInstance_Knife` | Local override -> `DA_Throwable_Weapon_MediumDamage` | 15.0 |
| Attackset_Machete | `Weapons/Machete/BP_WeaponInstance_Machete` | Local override -> `DA_Throwable_Weapon_MediumDamage` | 15.0 |
| Attackset_SledgeHammer | `Weapons/Hammer/BP_WeaponInstance_Hammer` | Local override -> `DA_Throwable_Weapon_HeavyDamage` | 50.0 |
| Attackset_SpikeBat | `Weapons/SpikedClub/BP_WeaponInstance_SpikedClub` | Local override -> `DA_Throwable_Weapon_MediumDamage` | 15.0 |
| Attackset_Sword | `Weapons/Sword/BP_WeaponInstance_Sword` | Local override -> `DA_Throwable_Weapon_MediumDamage` | 15.0 |
| Attackset_WarHammer | `Weapons/Warhammer/BP_WeaponInstance_Warhammer` | Local override -> `DA_Throwable_Weapon_Obliterate` | 65.0 |

### Shared TK Throw Ability Baseline (GA)

Global throw/impact tuning on `GA_Telekinesis_Throw` CDO:
- `HitImpulseMultiplier = 1.2999999523162842`
- `MinDamageSpeed = 700.0`
- `ImpactThreshold = -2.0`
- `PushBack = 400.0`
- `MovementDuration = 0.30000001192092896`
- `EnvironmentDamage = 50.0`
- `Launch Speed = 4000.0`

Source:
- `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Combat/Telekinesis/GA_Telekinesis_Throw.json` (`Default__GA_Telekinesis_Throw_C`)
