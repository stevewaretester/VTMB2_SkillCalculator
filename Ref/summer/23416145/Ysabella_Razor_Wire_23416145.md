# Ysabella Razor Wire - 23416145

Razor Wire is split across several assets rather than being a single ordinary melee attack:

- `GA_Player_Ysabella_Wire`: start/lasso/target-selection ability.
- `GA_Player_Ysabella_Wirehold`: hold/yank/sever/break follow-up, triggered by gameplay event.
- `GA_WirePunt`: object/weapon punt follow-up.
- `GA_Enemy_WireTrapped`: enemy victim status/reaction ability.
- `BP_TenseWIre` and `BP_WireWrap`: tether and wrap visuals.

## Hard values found

| Asset | Field | Value | Notes |
| --- | --- | ---: | --- |
| `GA_Player_Ysabella_Wire` | `Punchrange` | 200.0 | Start/lasso target punch range. |
| `GA_WirePunt` | `TraceRange` | 240.0 | Looks for the incoming throw actor near the player. |
| `GA_WirePunt` | `VelocityThreshold` | 30.0 | Punt only activates if the target actor is moving fast enough. |
| `BP_TenseWIre` | `WireRadius` | 1.0 | Visual tether actor default. |
| `BP_TenseWIre` | `Section Length` | 150.0 | Spline mesh section length for the tether. |
| `BP_TenseWIre` | `InitialAnim` | true | Visual tether actor default. |

I did not find an exposed scalar for Razor Wire damage, hold damage, break health, or yank damage in the class defaults. The hold ability has runtime variables named `WireHealth`, `WireLength`, `CurrentDist`, and `TurnInterp`, and it has a pure function `ReactionWireDamage(Tags) -> Damage`, but the cooked FModel JSON only exposes the function signature/local variables, not the numeric switch values inside the blueprint bytecode.

## Player-facing behavior

The tutorial/localization entry is titled `Razor Wire`.

Controls in `TutorialAssetMap`:

| Tutorial key | Primary PC | Primary Xbox | Primary PS | Secondary PC | Secondary Xbox | Secondary PS |
| --- | --- | --- | --- | --- | --- | --- |
| `Ys_Barb` | `Keyboard_Q` | `Box_Right_Trigger` | `PS_Right_Trigger` | `Keyboard_E` | `Box_X` | `PS_Square` |
| `YS_Punt` | `Keyboard_Q` | `Box_Right_Trigger` | `PS_Right_Trigger` | `Mouse_Left_Button` | `Box_Right_Bumper` | `PS_Right_Bumper` |

The UI text says Razor Wire lassos an opponent, pressing the same ability again pulls them toward Ysabella, and it can also pull items/weapons so the player can grab them. Punt Attack uses the same pull input on weapons/explosives, then a strike input to launch the item at an opponent.

## Control graph wiring

`CG_Ysabella_Wire` contains the dedicated wire control state:

| State | Ability |
| --- | --- |
| `GA_Player_Ysabella_Wire` | `/DLC_Ysabella/YsabellaContent/Abilities/Player/GA_Player_Ysabella_Wire.GA_Player_Ysabella_Wire_C` |

`CG_YsabellaCombat` also contains:

| State | Ability |
| --- | --- |
| `GA_WirePunt` | `/DLC_Ysabella/YsabellaContent/Abilities/Player/GA_WirePunt.GA_WirePunt_C` |

I did not find `GA_Player_Ysabella_Wire` or `GA_Player_Ysabella_Wirehold` in `DA_Ysabella_playerdefaultAbilities`; they appear to be reached through the Ysabella control graph/event flow instead.

## Start ability: `GA_Player_Ysabella_Wire`

Class variables:

| Variable | Type |
| --- | --- |
| `Target` | `Actor` |
| `Punchrange` | `float` |
| `TargetingBlocker` | `ActiveGameplayEffectHandle` |
| `Wire` | `BP_TenseWIre_C` |
| `Parried` | `bool` |

Defaults:

| Field | Value |
| --- | --- |
| `Punchrange` | `200.0` |
| `AbilityTags` | `Combat.Ability.Skill.Telekinesis.PickUp` |
| `ActivationOwnedTags` | `Combat.General.ShowWire`, `Combat.Ability.YsaWire.Start` |
| `bRetriggerInstancedAbility` | `true` |
| `CancelAbilitiesWithTag` | `Combat.Ability.Melee.Chargeup`, `Movement.Sprint.Vampire` |
| `ActivationBlockedTags` | `Combat.Ability.Skill.Telekinesis.Throw`, `Combat.Ability.Skill.Telekinesis.Cooldown`, `Combat.Ability.Skill.Telekinesis.Blocked`, `Combat.Blocked`, `Combat.Ability.Skill.Telekinesis.PickUp` |

Main functions exported:

- `CreateWire`
- `GetWireTarget`
- `TargetPunchable`
- `ShouldEnemyParry`
- `Enemy`
- `BodyYank`
- `Interactable`
- `Throwable`
- `MassSpawn`
- `Might Feed`

This ability is target-type aware: it has separate paths for enemies, body yank, interactables, throwable objects, and mass-spawned objects.

## Hold ability: `GA_Player_Ysabella_Wirehold`

This is not directly button-bound in the defaults. It triggers from:

| Trigger tag | Source |
| --- | --- |
| `AbilityEvent.YsaWire.Hold` | `EGameplayAbilityTriggerSource::GameplayEvent` |

Class variables:

| Variable | Type |
| --- | --- |
| `TargetChar` | `WrestlerCharacterBase` |
| `WireLength` | `double` |
| `CurrentDist` | `double` |
| `TurnInterp` | `double` |
| `Wire` | `BP_TenseWIre_C` |
| `Yanking` | `bool` |
| `Wire Wrap` | `BP_WireWrap_C` |
| `WireHealth` | `double` |

Defaults:

| Field | Value |
| --- | --- |
| `AbilityTags` | `Combat.Ability.YsaWire.Hold` |
| `ActivationOwnedTags` | `Combat.Ability.YsaWire.Hold`, `Combat.General.BlockDepth`, `Combat.General.ShowWire` |
| `BlockAbilitiesWithTag` | `Combat.Ability.Skill.Telekinesis.PickUp` |
| `CancelledByAbilitiesWithTag` | `Combat.Ability.Melee.Feed`, `Combat.Status.Knocked`, `Combat.Status.HitReact.Knocked`, `Combat.Status.Torpor` |

Main functions exported:

- `DistanceToTarget`
- `Launch`
- `Sever`
- `Broken`
- `Yank`
- `WireYankPoint`
- `ReactionWireDamage`
- `K2_ActivateAbilityFromEvent`
- `K2_OnEndAbility`
- `OnTick_DF311CEF486DD722E02E83A909840191`

`ReactionWireDamage` takes a `GameplayTagContainer`, breaks it, switches on a gameplay tag, and returns a `double Damage`. The tag cases and numeric outputs are not visible in this export.

## Punt follow-up: `GA_WirePunt`

Class variables:

| Variable | Type |
| --- | --- |
| `TraceRange` | `double` |
| `VelocityThreshold` | `double` |
| `Throwable` | `Actor` |

Defaults:

| Field | Value |
| --- | --- |
| `TraceRange` | `240.0` |
| `VelocityThreshold` | `30.0` |
| `AbilityTags` | `Combat.Ability.YsaWire.Punt`, `Combat.Ability.Melee.Light` |
| `ActivationBlockedTags` | `Combat.Blocked`, `Combat.Status.InCutscene` |

Functions:

- `FindThrowActor`
- `K2_CanActivateAbility`
- `K2_ActivateAbility`

The exported function locals show it casts candidates to `WrestlerTelekinesisTargetInterface`, checks `IsThrowable`, reads the throwable component velocity, and uses the velocity threshold. I did not find a direct punt damage scalar in this ability's defaults.

## Enemy victim status: `GA_Enemy_WireTrapped`

The enemy-side state lives in common content:

`/Game/WrestlerCommon/Pawns/Enemies/WireTrapped/GA_Enemy_WireTrapped`

Class variables:

| Variable | Type |
| --- | --- |
| `bUseDesiredRotationCache` | `bool` |
| `bUseRotationYawCache` | `bool` |
| `CurrentHealth` | `float` |
| `Anim Play Rate` | `double` |
| `WireLength` | `double` |

Defaults:

| Field | Value |
| --- | --- |
| `MontageVariations` | `AM_React_WireTrapped` |
| `AbilityTags` | `Combat.Status.WireHold` |
| `ActivationOwnedTags` | `Movement.NoTurn`, `Combat.Status.Feedable`, `Combat.Status.vulnerable`, `Combat.Status.Disarmable`, `Combat.Status.WireHold` |
| `bRetriggerInstancedAbility` | `true` |

This victim state cancels or blocks most enemy combat, ranged, evade, movement, and AI reaction abilities while active.

## Visual actors and effects

`BP_TenseWIre` is the active tether actor. Its dev dump class fields include:

- `Target`
- `Length`
- `Endpoint`
- `InitialAnim`
- `WireRadius`
- `Slack`
- `Section Length`
- `SplineMeshes`
- `MeshCount`
- `Detatched`

Default values found:

| Field | Value |
| --- | ---: |
| `Endpoint` | `(0, 0, 0)` |
| `InitialAnim` | true |
| `WireRadius` | 1.0 |
| `Section Length` | 150.0 |

It uses eight `SplineMeshComponent` entries with `SM_BarbedWire_Length`, plus `SM_BarbedWire` and hidden physics sphere components.

`BP_WireWrap` is the wrap visual. It has three static mesh components:

- `SM_BarbedWire_Wrap`
- `SM_BarbedWire_Wrap1`
- `SM_BarbedWire_Wrap2`

Niagara systems:

| Asset | Emitters |
| --- | --- |
| `NS_EnemyWireWrap` | 4 emitter handles |
| `NS_ObjectWireTrap` | 3 emitter handles |

## Player wire montages

| Montage | SequenceLength | BlendIn | BlendOut | Segment |
| --- | ---: | ---: | ---: | --- |
| `AM_ysabella_wireHoldStart` | 1.1166667 | 0.00 | 0.20 | `Anim_Wire_EnemyPull`, anim `0.2-1.3166667`, rate `1.0` |
| `AM_ysabella_wirepunt` | 0.62916666 | 0.00 | 0.30 | `Combat_Left_Miss_Brujah`, anim `0.33-0.833333`, rate `0.8` |
| `AM_ysabella_PullEnemy` | 0.83333 | 0.10 | 0.40 | `Anim_Wire_QuickPull`, anim `0.5-1.3333334`, rate `1.0` |
| `AM_ysabella_PullObject` | 0.88718 | 0.00 | 0.40 | `Anim_Wire_QuickPull`, anim `0.18-1.3333334`, rate `1.3` |
| `AM_Wire_Break` | 0.65 | 0.15 | 0.60 | `Anim_Wire_break`, anim `0-0.65`, rate `1.0` |
| `AM_Wire_Parried` | 0.65 | 0.15 | 0.40 | `Anim_Wire_break`, anim `0-0.65`, rate `1.0` |

The common wire hold blendspace `BS_WireHold` blends `Angle` from `-180` to `180` and `Slack` from `0` to `1`, with loose/tight samples for front/left/right/back:

- Loose: `Anim_Wire_LooseF`, `Anim_Wire_LooseL`, `Anim_Wire_LooseR`
- Tight: `Anim_Wire_TightF`, `Anim_Wire_TightL`, `Anim_Wire_TightR`, `Anim_Wire_TightB`

## Enemy trapped animation

| Asset | SequenceLength | BlendIn | BlendOut | Segment |
| --- | ---: | ---: | ---: | --- |
| `AM_React_WireTrapped` | 4.133333 | 0.10 | 0.50 | `Anim_La_AoA_Enemyreact_launch`, anim `1.6-5.733333`, rate `1.0` |
| `Anim_enmy_wiretrapLoop` | 2.3666666 | | | standalone loop sequence |

## Masquerade action data

`DT_MasqueradePlayerActions` has two Razor Wire actions:

| Entry | Tag | Noticeability | ObservationDuration | NoiseRadius | InitialScoreToAdd | ScoreOverTime |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| `YsaWire` | `Combat.Ability.YsaWire.Hold` | 2.0 | 6.0 | 0.0 | 5.0 | 5.0 |
| `YsaWire_start` | `Combat.Ability.YsaWire.Start` | 2.0 | 6.0 | 500.0 | 5.0 | 0.0 |

Both are violent actions, use `Narrative.Prompts.MasqBreach.WitnessAbility`, and have 100% reaction chance.

## Source assets

- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Pawns/CG_Ysabella_Wire.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Pawns/CG_YsabellaCombat.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/GA_Player_Ysabella_Wire.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/GA_Player_Ysabella_Wirehold.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/GA_WirePunt.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/Enemies/WireTrapped/GA_Enemy_WireTrapped.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Wire/BP_TenseWIre.json`
- `EXPORTS/Dev/Bloodlines2_23416145/20260610_143611/CXXHeaderDump/BP_TenseWIre.hpp`
- `EXPORTS/Dev/Bloodlines2_23416145/20260610_143611/Mods/shared/types/BP_TenseWIre.lua`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/BP_WireWrap.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/NS_EnemyWireWrap.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/NS_ObjectWireTrap.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCore/UI/HUD/Tutorial/TutorialAssetMap.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCore/UI/Localization/HUD/HUDUILocalizationTable.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/MassEntity/DT_MasqueradePlayerActions.json`
