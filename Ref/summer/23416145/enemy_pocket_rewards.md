# Enemy Pocket Rewards - 23416145

This note covers the enemy "back pocket" elixir and blood resonance bag system in build `23416145`.

## Short answer

Enemy pocket rewards are not authored as static loot on each `ETD_*` enemy definition. They are applied by dynamic combat spawning:

1. `BP_DynamicCombatSpawnVolume` decides reward tags in `DetirmineSpawnTags`.
2. The selected tags are passed through `FWrestlerDeferredEnemySpawnParam.TagsToApply`.
3. `BP_EnemyCharacterBase` checks its gameplay tags with `GetPocketClass`.
4. If a matching tag exists, it spawns and attaches a `BP_Elixir_C` subclass as `PocketElixir`.

The useful rule of thumb is: a dynamic combat enemy can get a pocket reward if it is in the active DESS enemy pool and is not in the reward blacklist.

## Important caveats

- I can see the reward gates, item tag map, blacklist, DESS pools, and placed hub volumes.
- I cannot see a clean literal percentage for "chance to give a pocket item" in the cooked Blueprint export. The graph has `RandomBoolWithWeightFromStream`, `RandomIntegerInRangeFromStream`, and `Array_RandomFromStream`, but the cooked JSON does not expose the weight constant in a trustworthy human-readable way.
- The class has `HasSpawnedBloodBag` and `HasSpawnedElixir`, which strongly suggests each combat spawn volume limits itself to one blood bag and one elixir reward per volume/encounter.
- The reward tier map is explicit, but the exact contents of the `SmallRewards`, `MediumRewards`, and `LargeRewards` arrays are not exposed as readable gameplay tag literals in `BP_DynamicCombatSpawnVolume.json`.
- `DA_DESS_Beta_BennyDLC` and `DA_DESS_Beta_YsabellaDLC` are referenced by placed hub volume encounter overrides, but they are not present in the default `RewardArrayMap`. From the default class data alone, those pools are not confirmed to generate pocket rewards.

## Sources

- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/DynamicEnemySpawnSystem/BP_DynamicCombatSpawnVolume.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/Enemies/Shared/BP_EnemyCharacterBase.json`
- `EXPORTS/Dev/Bloodlines2_23416145/20260610_143611/CXXHeaderDump/BP_EnemyCharacterBase.hpp`
- `EXPORTS/Dev/Bloodlines2_23416145/20260610_143611/UHTHeaderDump/Wrestler/Public/WrestlerDeferredEnemySpawnParam.h`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/DynamicEnemySpawnSystem/LevelDataAssets/BetaDataAssets/*.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerHubOne/Maps/LV_Hub/LV_WP_Hub_Master.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/MassEntity/BloodResonanceEvents/DA_BloodResonanceEvents.json`

## Pocket item tag map

`BP_EnemyCharacterBase` maps these tags to pocket item classes:

| Gameplay tag | Pocket class |
|---|---|
| `Combat.General.HasItem.Elixir.Blood` | `BP_ElixirBlood` |
| `Combat.General.HasItem.Elixir.Brujah` | `BP_ElixirBrujah` |
| `Combat.General.HasItem.Elixir.Health` | `BP_ElixirHealth` |
| `Combat.General.HasItem.Elixir.Ventrue` | `BP_ElixirVentrue` |
| `Combat.General.HasItem.Elixir.Choleric.Small` | `BP_BloodResonanceBag_Choleric_Small` |
| `Combat.General.HasItem.Elixir.Choleric.Medium` | `BP_BloodResonanceBag_Choleric_Medium` |
| `Combat.General.HasItem.Elixir.Choleric.Large` | `BP_BloodResonanceBag_Choleric_Large` |
| `Combat.General.HasItem.Elixir.Melancholic.Small` | `BP_BloodResonanceBag_Melancholic_Small` |
| `Combat.General.HasItem.Elixir.Melancholic.Medium` | `BP_BloodResonanceBag_Melancholic_Medium` |
| `Combat.General.HasItem.Elixir.Melancholic.Large` | `BP_BloodResonanceBag_Melancholic_Large` |
| `Combat.General.HasItem.Elixir.Sanguine.Small` | `BP_BloodResonanceBag_Sanguine_Small` |
| `Combat.General.HasItem.Elixir.Sanguine.Medium` | `BP_BloodResonanceBag_Sanguine_Medium` |
| `Combat.General.HasItem.Elixir.Sanguine.Large` | `BP_BloodResonanceBag_Sanguine_Large` |
| `Combat.General.HasItem.Key` | `BP_Elixir_Key` |

## Default reward blacklist

The default `BP_DynamicCombatSpawnVolume` reward blacklist excludes:

| Enemy | Result |
|---|---|
| `Inquisitor_CombatShotgun` | No pocket reward from this system |
| `Inquisitor_ElectricBaton` | No pocket reward from this system |
| `Inquisitor_Sniper` | No pocket reward from this system |
| `Inquisitor_SniperCrossbowRifle` | No pocket reward from this system |
| `Inquisitor_TacticalAssaultRifle` | No pocket reward from this system |
| `Police` | No pocket reward from this system |

I did not see placed hub volume overrides for `BlacklistRewardEnemies`, so these defaults appear to apply to the placed hub dynamic combat volumes.

## Reward tier map

`RewardArrayMap` maps DESS data assets to integer tiers. The function locals are named `SmallRewards`, `MediumRewards`, and `LargeRewards`, so this likely means:

| Tier | Likely meaning | DESS assets |
|---|---|---|
| `0` | Small/early rewards | `DA_DESS_Beta_01_ThinAndPolice`, `DA_DESS_Beta_02_ThinAndPolice`, `DA_DESS_Beta_03_ThinAndPolice` |
| `1` | Medium rewards | `DA_DESS_Beta_04_ThinAndPolice`, `DA_DESS_Beta_05_ThinAndSabbat`, `DA_DESS_Beta_06_ThinAndSabbat`, `DA_DESS_Beta_NO_Encounters` |
| `2` | Large/late rewards | `DA_DESS_Beta_07a_ThinAndInquisition`, `DA_DESS_Beta_07b_ThinAndPolice`, `DA_DESS_Beta_08_ThinAndPolice` |
| Not mapped | Unknown/no default reward tier | `DA_DESS_Beta_BennyDLC`, `DA_DESS_Beta_YsabellaDLC`, `DA_DESS_Test1` |

## Eligible enemy pools

Duplicate entries in the DESS arrays are meaningful: the spawn system uses random selection from arrays, so repeated names are weighting.

| DESS asset | Reward tier | Eligible pocket candidates | Blacklisted or not confirmed | Spawn/encounter hints |
|---|---:|---|---|---|
| `DA_DESS_Beta_01_ThinAndPolice` | `0` | `Thinblood_MinorGhoul_Unarmed x1`, `Thinblood_MinorGhoul_BaseballBat x1`, `Thinblood_MinorGhoul_Knife x2` | `Police x1` blacklisted | Elite `0`; sniper `0`; max enemies fraction `0.3-0.4`; A `0.434`, B `0`, infighting `0.05`, no-combat `1.0` |
| `DA_DESS_Beta_02_ThinAndPolice` | `0` | `Thinblood_MinorGhoul_BaseballBat x2`, `Thinblood_MinorGhoul_Knife x2`, `Thinblood_MinorGhoul_Revolver x1` | `Police x1` blacklisted | Elite `0`; sniper `0`; max enemies fraction `0.4-0.5`; A `0.434`, B `0`, infighting `0`, no-combat `1.0` |
| `DA_DESS_Beta_03_ThinAndPolice` | `0` | `Thinblood_MinorGhoul_BaseballBat x3`, `Thinblood_MinorGhoul_Knife x2`, `Thinblood_MinorGhoul_Machete x2`, `Thinblood_MinorGhoul_Revolver x2`, `Thinblood_MinorGhoul_Shotgun x1`; elite `Thinblood_MajorGhoul_Striker x1` | `Police x1` blacklisted | Sniper `0`; max enemies fraction `0.6-0.7`; A `0.434`, B `0`, infighting `0`, no-combat `1.0` |
| `DA_DESS_Beta_04_ThinAndPolice` | `1` | `Thinblood_MinorGhoul_BaseballBat x2`, `Thinblood_MinorGhoul_Knife x2`, `Thinblood_MinorGhoul_Machete x1`, `Thinblood_MinorGhoul_Revolver x2`, `Thinblood_MinorGhoul_Shotgun x1`; elite `Thinblood_MajorGhoul_Striker x1` | `Police x1` blacklisted | Elite `0.316`; sniper `0`; max enemies fraction `0.55-0.7`; A `0.858`, B `0`, infighting `0.098`, no-combat `0.84` |
| `DA_DESS_Beta_05_ThinAndSabbat` | `1` | Thinblood: `BaseballBat x3`, `Knife x1`, `Machete x2`, `Revolver x2`, `Shotgun x1`, `SMG x2`; Thinblood elites: `MajorGhoul_Distractor x1`, `MajorGhoul_Striker x1`, `WeakVampire_Ambusher x1`, `WeakVampire_Flusher x1`; Sabbat: `AutomaticRifle x1`, `HighCaliburPistol x1`, `SpikedClub x3`, `Sword x1`; Sabbat elites: `MajorGhoulDistractor_Shotgun x1`, `MajorGhoulStriker_Warhammer x1` | None in default blacklist | Sniper `0`; max enemies fraction `0.5-0.85`; A `0.802`, B `0.264`, infighting `0.546`, no-combat `0.568` |
| `DA_DESS_Beta_06_ThinAndSabbat` | `1` | Thinblood: `BaseballBat x2`, `Knife x1`, `Machete x2`, `Pistol x1`, `Shotgun x1`, `SMG x1`; Thinblood elites: `MajorGhoul_Distractor x1`, `MajorGhoul_Striker x1`, `WeakVampire_Ambusher x1`, `WeakVampire_Flusher x1`; Sabbat: `AutomaticRifle x1`, `HighCaliburPistol x1`, `SpikedClub x3`, `Sword x2`; Sabbat elites: `MajorGhoulDistractor_Shotgun x1`, `MajorGhoulStriker_Warhammer x1`, `WeakVampire_Ambusher x1`, `WeakVampire_Flusher x1` | None in default blacklist | Elite `0.21`; sniper `0`; max enemies fraction `0.5-0.9`; A `0.338`, B `0.264`, infighting `0.442`, no-combat `0.808` |
| `DA_DESS_Beta_07a_ThinAndInquisition` | `2` | Thinblood: `BaseballBat x1`, `Inquisition_AssaultRifle x2`, `Machete x2`, `Revolver x1`, `Shotgun x2`; elites: `MajorGhoul_Distractor_LateGame x1`, `MajorGhoul_Striker_LateGame x1`, `WeakVampire_Ambusher x1`, `WeakVampire_Flusher x1` | Inquisitors blacklisted: `CombatShotgun x2`, `ElectricBaton x2`, `SniperCrossbowRifle x1`, `TacticalAssaultRifle x6` | Elite `0.64`; sniper `0`; max enemies fraction `0.7`; A `0.18`, B `1.0`, infighting `0.756`, no-combat `0.24` |
| `DA_DESS_Beta_07b_ThinAndPolice` | `2` | `Thinblood_MinorGhoul_BaseballBat x2`, `Knife x2`, `Machete x2`, `Pistol x2`, `Shotgun x2`, `SMG x1`; elites `MajorGhoul_Distractor_LateGame x1`, `MajorGhoul_Striker_LateGame x1`, `WeakVampire_Ambusher x1`, `WeakVampire_Flusher x1` | `Police x1` blacklisted | Elite `0.6`; sniper `0`; max enemies fraction `0.9`; A `0.5`, B `0`, infighting `0.5`, no-combat `0.768` |
| `DA_DESS_Beta_08_ThinAndPolice` | `2` | `Thinblood_MinorGhoul_BaseballBat x1`, `Knife x1`, `Machete x2`, `Pistol x1`, `Shotgun x1`, `SMG x2`; elites `MajorGhoul_Distractor_LateGame x1`, `MajorGhoul_Striker_LateGame x1`, `WeakVampire_Ambusher x1`, `WeakVampire_Flusher x1` | `Police x1` blacklisted | Elite `0.704`; sniper `0`; max enemies fraction `0.9`; A `0.664`, B `0`, infighting `0.14`, no-combat `1.0` |
| `DA_DESS_Beta_BennyDLC` | Not mapped | Pool contains Thinblood `Inquisition_AssaultRifle x2`, `Inquisition_Shotgun x1`, `Knife x1`, `Machete x5`, `SMG x2`, plus B-side `Pistol x1` | Reward generation not confirmed because asset is absent from default `RewardArrayMap` | Elite `0.6`; sniper `0`; max enemies fraction `0.9`; A `1.0`, B `0`, infighting `0`, no-combat `0.2` |
| `DA_DESS_Beta_YsabellaDLC` | Not mapped | Pool contains Thinblood `Machete x4`, `Revolver x3`, `Shotgun x1`, `SMG x3`, plus B-side `Revolver x1`; elites include Thinblood major ghouls and weak vampires, including late-game variants | Reward generation not confirmed because asset is absent from default `RewardArrayMap` | Elite `0.45`; sniper `0`; max enemies fraction `0.9`; A `1.0`, B `0`, infighting `0`, no-combat `0.2` |
| `DA_DESS_Beta_NO_Encounters` | `1` | None | No enemies | No-combat only |

## Where: hub dynamic combat volumes

The hub map `LV_WP_Hub_Master` has one `BP_DynamicEnemySpawnSystem` actor. It links 42 `BP_DynamicCombatSpawnVolume` actors. Its default `LevelDataAsset` is `DA_DESS_Beta_04_ThinAndPolice`, but individual volumes also define `ForceEncouterType` overrides for specific DESS assets.

Encounter type enum:

| Enum | Meaning |
|---|---|
| `NewEnumerator0` | `Faction A Only` |
| `NewEnumerator1` | `Faction B Only` |
| `NewEnumerator2` | `Infighting` |
| `NewEnumerator3` | `No Combat` |

Volume centers are map coordinates from `CentrePoint`.

| Block/volume | Max enemies | Center point | Random seed | Forced encounter overrides |
|---|---:|---|---:|---|
| `CT_Block_03` | 12 | `(8750, 50014, 6190)` | 2478 | `Beta_03=No Combat`, `Beta_08=No Combat`, `Beta_07b=No Combat` |
| `CT_Block_07` | 15 | `(5123, 57027, 5372)` | 8295 | None |
| `CT_Block_09` | 12 | `(13243, 37949, 5391)` | 1643 | `Beta_01=No Combat`, `Beta_03=No Combat`, `Beta_02=No Combat` |
| `CT_Block_09 (Hole in the wall)` | 10 | `(11262, 45400, 6231)` | 7357 | `Beta_08=No Combat`, `Beta_03=No Combat`, `Beta_05=No Combat`, `Beta_07b=No Combat` |
| `DT_Block_01` | 9 | `(-2695, 52509, 4340)` | 6336 | `Beta_04=Faction A Only`, `Beta_07a=No Combat`, `Beta_02=Faction A Only` |
| `DT_Block_02` | 11 | `(-11260, 51906, 5060)` | 844 | `Beta_04=No Combat`, `Beta_07a=No Combat`, `Beta_05=No Combat`, `Beta_03=Faction A Only`, `BennyDLC=No Combat` |
| `DT_Block_02` | 10 | `(-18718, 50588, 4270)` | 6964 | `Beta_04=No Combat`, `Beta_05=No Combat` |
| `DT_Block_03` | 8 | `(-25890, 43511, 4204)` | 683 | `Beta_07a=Infighting`, `Beta_05=No Combat`, `Beta_07b=Faction A Only` |
| `DT_Block_03` | 7 | `(-27371, 51152, 3574)` | 2632 | `Beta_07a=Infighting`, `Beta_05=No Combat` |
| `DT_Block_04` | 8 | `(-20346, 57554, 3657)` | 1175 | `Beta_04=No Combat`, `Beta_07a=No Combat`, `Beta_05=No Combat` |
| `DT_Block_06` | 6 | `(-33277, 51351, 3826)` | 4917 | `Beta_07a=No Combat` |
| `DT_Block_07` | 10 | `(-37534, 32895, 4603)` | 779 | `Beta_03=No Combat` |
| `DT_Block_07` | 10 | `(-32708, 32643, 4501)` | 5031 | `Beta_03=No Combat`, `Beta_02=Faction A Only` |
| `DT_Block_08` | 10 | `(-34006, 20655, 4308)` | 1703 | `Beta_02=Faction A Only`, `Beta_03=No Combat`, `Beta_04=No Combat` |
| `DT_Block_09` | 14 | `(-23492, 16183, 5430)` | 6675 | `Beta_06=Infighting`, `Beta_07a=Infighting`, `BennyDLC=No Combat` |
| `DT_Block_09` | 9 | `(-22080, 24896, 4549)` | 4488 | `Beta_03=Faction A Only`, `Beta_06=No Combat`, `Beta_07a=No Combat`, `Beta_08=Faction A Only`, `BennyDLC=No Combat` |
| `DT_Block_09 (Haven)` | 12 | `(-26234, 27062, 5118)` | 9011 | `Beta_01=No Combat`, `Beta_02=No Combat`, `Beta_03=No Combat`, `Beta_06=No Combat`, `Beta_07a=No Combat`, `Beta_05=No Combat`, `Beta_07b=No Combat`, `Beta_04=Infighting` |
| `F_Block_14` | 12 | `(-4620, -33, 6003)` | 4188 | None |
| `F_Block_14` | 11 | `(-4611, 7340, 5758)` | 4040 | `Beta_03=Faction A Only`, `Beta_02=Infighting`, `Beta_06=Infighting` |
| `F_Block_15` | Unknown | `(-19366, 5855, 6489)` | 3600 | `Beta_06=Infighting` |
| `F_Block_15` | 12 | `(-13814, 3975, 6034)` | 1269 | `Beta_02=Faction A Only`, `Beta_03=Faction A Only` |
| `I_Block_04` | 15 | `(-5779, 64621, 4109)` | 812 | `Beta_04=No Combat`, `Beta_07a=No Combat`, `Beta_01=No Combat`, `Beta_03=No Combat`, `Beta_02=Infighting` |
| `I_Block_04` | 12 | `(-9430, 60482, 4230)` | 2621 | `Beta_04=No Combat`, `Beta_07a=No Combat`, `Beta_03=No Combat` |
| `I_Block_05 (Willems Warehouse)` | 10 | `(-689, 67392, 2743)` | 5278 | `Beta_01=No Combat`, `Beta_04=No Combat`, `Beta_07a=No Combat` |
| `UT_Block_01` | 10 | `(5663, 37107, 5425)` | 3464 | `Beta_02=No Combat` |
| `UT_Block_01` | 12 | `(1938, 44530, 5436)` | 5067 | `Beta_03=No Combat` |
| `UT_Block_01 (Auto Repair)` | 10 | `(-1310, 37963, 5837)` | 3890 | `Beta_02=No Combat`, `Beta_03=No Combat` |
| `UT_Block_02` | 10 | `(-16189, 36075, 5140)` | 4195 | `Beta_07b=No Combat`, `Beta_03=No Combat` |
| `UT_Block_02 (WTD)` | 10 | `(-8974, 38209, 5041)` | 936 | `Beta_07b=No Combat`, `Beta_03=No Combat`, `Beta_05=No Combat`, `Beta_02=No Combat`, `Beta_06=Faction A Only`, `BennyDLC=No Combat` |
| `UT_Block_03` | 10 | `(-13703, 28700, 4952)` | 5649 | `Beta_02=No Combat` |
| `UT_Block_03` | 10 | `(-14678, 18876, 4859)` | 886 | None |
| `UT_Block_03` | 10 | `(-8177, 27662, 5100)` | 3277 | `Beta_02=No Combat` |
| `UT_Block_04` | 10 | `(-1454, 19391, 5372)` | 4985 | `Beta_02=No Combat`, `Beta_03=Faction A Only` |
| `UT_Block_04` | 10 | `(653, 29944, 5553)` | 2876 | `BennyDLC=No Combat` |
| `UT_Block_04 (Makom)` | 10 | `(2732, 22054, 5583)` | 5671 | `Beta_02=No Combat`, `Beta_06=No Combat`, `Beta_07b=No Combat` |
| `UT_Block_05` | 12 | `(10414, 17287, 5469)` | 1867 | `Beta_02=No Combat`, `Beta_07b=No Combat` |
| `UT_Block_05 (Glacier)` | Unknown | `(12460, 22144, 3860)` | 8326 | `Beta_01=No Combat`, `Beta_02=No Combat`, `Beta_06=No Combat`, `Beta_03=No Combat`, `Beta_05=No Combat`, `Beta_07b=No Combat`, `Beta_04=Infighting` |
| `UT_Block_05 (Glacier)` | Unknown | `(8790, 26275, 5837)` | 6653 | `Beta_01=No Combat`, `Beta_02=No Combat`, `Beta_06=No Combat`, `Beta_03=No Combat`, `Beta_05=No Combat`, `Beta_07b=No Combat`, `Beta_04=Faction A Only` |
| `UT_Block_05 (Glacier)` | 10 | `(13278, 28485, 5340)` | 1997 | `Beta_01=No Combat`, `Beta_02=No Combat`, `Beta_06=No Combat`, `Beta_03=No Combat`, `Beta_05=No Combat`, `Beta_07b=No Combat`, `Beta_04=Infighting` |
| `UT_Block_07` | Unknown | `(11698, 8637, 5800)` | 5565 | `Beta_02=Faction A Only`, `YsabellaDLC=No Combat` |
| `UT_Block_07` | 10 | `(7785, 3999, 5891)` | 4743 | `YsabellaDLC=No Combat` |
| `UT_Block_07` | 10 | `(3464, 6282, 6598)` | 2192 | `Beta_02=Faction A Only`, `Beta_06=Infighting` |

## Separate blood resonance event system

There is also `DA_BloodResonanceEvents`. This is not the enemy pocket reward system, but it is relevant if "blood resonance" refers to world/crowd events rather than enemy back-pocket bags.

Global event settings:

| Setting | Value |
|---|---:|
| `MinTimeToStartSpawning` | `6.0` |
| `MinTimeBetweenSpawns` | `36.0` |
| `MinSpawnDistance` | `5.0` |
| `MaxSpawnDistance` | `500.0` |
| `GlobalMaxNumEventsAtOnce` | `8` |
| Max Sanguine events at once | `3` |
| Max Choleric events at once | `3` |
| Max Melancholic events at once | `3` |

Each listed event has `PercentChance = 50`, `MaxNumSpawnedAtOneTime = 2`, and `MinTimeBetweenSpawns = 120`.

| Resonance type | Event smart object tags |
|---|---|
| Choleric | `BloodResEvent.ATM`, `BloodResEvent.PhoneArgue`, `BloodResEvent.PhoneWallMugger` |
| Melancholic | `BloodResEvent.Grafitti`, `BloodResEvent.CarThief`, `BloodResEvent.BusStop` |
| Sanguine | `BloodResEvent.StandingDrunk`, `BloodResEvent.SittingDrunk`, `BloodResEvent.PedSmoking`, `BloodResEvent.SexPred` |
