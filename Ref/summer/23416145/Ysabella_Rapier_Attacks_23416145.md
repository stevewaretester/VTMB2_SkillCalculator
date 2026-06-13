# Ysabella Rapier Attacks - 23416145

Ysabella's player character default weapon points to the DLC attackset:

`/DLC_Ysabella/YsabellaContent/Pawns/Weapon/Attackset_YsabellaSword.Attackset_YsabellaSword`

This is set on `BP_PlayerCharacter_Ysabella` via `WrestlerPlayerWeaponManager_GEN_VARIABLE -> Default Weapon`.

## Attackset

Shared rapier windup config:

| Field             | Value                                |
| ----------------- | ------------------------------------ |
| Windup montage    | `AM_rapier_windup`                   |
| HeavyThreshold    | `0.5`                                |
| MinimumWindup     | `0.05`                               |
| MaximumWindup     | `1.0`                                |
| ThresholdBias     | `0.2`                                |
| Light ability tag | `Combat.Ability.Melee.Light.NoLunge` |
| Heavy ability tag | `Combat.Ability.Melee.HeavyRapier`   |

Light attacks:

| Combo slot | Light montage       | Damage | BufferDelay | ComboDelay | RightHanded |
| ---------- | ------------------- | -----: | ----------: | ---------: | ----------- |
| 1          | `AM_Rapier_attack1` |    8.0 |        0.01 |       0.30 | true        |
| 2          | `AM_Rapier_attack2` |    8.0 |        0.01 |       0.30 | false       |
| 3          | `AM_Rapier_attack4` |    8.0 |        0.01 |       0.30 | true        |
| 4          | `AM_Rapier_attack3` |   10.0 |        0.20 |       0.55 | false       |

Heavy attack, shared across all four combo slots:

| Montage           | Damage | BufferDelay | ComboDelay | RightHanded |
| ----------------- | -----: | ----------: | ---------: | ----------- |
| `AM_Rapier_heavy` |   16.0 |        0.50 |       0.80 | true        |

`Directionals` is empty on all four DLC rapier attack entries.

## Montage timing

| Montage                 | SequenceLength | BlendIn | BlendOut | Sections                                          |
| ----------------------- | -------------: | ------: | -------: | ------------------------------------------------- |
| `AM_rapier_windup`      |      1.3166667 |    0.20 |     0.10 | `Default@0+1.3166667`; `Loop@0+1.3166667`         |
| `AM_Rapier_attack1`     |      1.6866666 |    0.00 |     0.55 | `Default@0+0.90333337`; `Hit@0.90333337+0.783333` |
| `AM_Rapier_attack2`     |      1.6866666 |    0.00 |     0.55 | `Default@0+0.90333337`; `Hit@0.90333337+0.783333` |
| `AM_Rapier_attack3`     |      1.6866666 |    0.00 |     0.55 | `Default@0+0.90333337`; `Hit@0.90333337+0.783333` |
| `AM_Rapier_attack4`     |      1.6866666 |    0.00 |     0.55 | `Default@0+0.90333337`; `Hit@0.90333337+0.783333` |
| `AM_Rapier_heavy`       |      0.8833333 |    0.00 |     0.35 | `Default@0+0.8833333`                             |
| `AM_Rapier_heavySecond` |      0.8833333 |    0.00 |     0.35 | `Default@0+0.8833333`                             |

The four light rapier montages all use their matching DLC `Anim_YsaSword_Attack*_Anim` sequences at play rate `1.0`.

The heavy attack is not a DLC-specific montage; it resolves to `/Game/WrestlerCommon/Pawns/PlayerCharacter/Weapons/Anims/AM_Rapier_heavy`.

## Rapier heavy ability

The weapon attackset heavy entry is `AM_Rapier_heavy`, `BaseDamage=16.0`, `BufferDelay=0.50`, `ComboDelay=0.80`, tagged `Combat.Ability.Melee.HeavyRapier`.

The actual charged ability granted to Ysabella is the common `/Game/WrestlerCommon/Abilities/Player/Melee/ChargedAttacks/GA_PlayerAttack_HeavyRapier.GA_PlayerAttack_HeavyRapier_C`. Its class defaults carry a heavier hit payload:

| Field                        | Value                                                                                                                                                                              |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hit Damage                   | `30.0`                                                                                                                                                                             |
| Environment Damage           | `30.0`                                                                                                                                                                             |
| Trace Range / Radius / Angle | `240.0` / `50.0` / `15.0`                                                                                                                                                          |
| Lunge Range / Duration       | `300.0` / `0.1`                                                                                                                                                                    |
| Targeted Lunge Range         | `450.0`                                                                                                                                                                            |
| Bounceback Distance          | `70.0`                                                                                                                                                                             |
| Hitfreeze / Brutal           | `0.15` / `0.3`                                                                                                                                                                     |
| Knockback                    | vertical `270.0`, horizontal `450.0`, boost `5.0`, boost decay `7.0`                                                                                                               |
| Lunge assist                 | `550.0`, pre-lunge assist `30.0`                                                                                                                                                   |
| Other flags                  | `LaunchLightweights=true`, `KillStunned=true`, `Executes=true`, `CasualExecution=true`, `Breaks Blocks=true`, `DoProxTrace=false`, `FinishHitImmediate=false`, `NoiseRadius=900.0` |

`GA_PlayerAttack_HeavyRapier` is not a plain data-only variant. The cooked class defines its own `HandleEnemyHits`, `FinishHit`, `TraceHit`, and `MoveToTarget` functions over `GA_PlayerPunch_Charged_base`, and its ubergraph property list includes `WrestlerAbilityTask_PlayMontageAndWaitForEvent`, `WaitDelay`, `BP_ApplyGameplayEffectToOwner`, `AddLooseGameplayTags`, `RemoveLooseGameplayTags`, and time-dilation handles. The cooked text export does not preserve the node order, but this is enough to say the heavy has custom on-hit / finish-hit behavior rather than only the table defaults above.

## Heavy follow-up / decap revisit

After checking the in-game behavior report against the export, this is the cleanest reading:

- The first heavy entry is definitely `AM_Rapier_heavy`, a short `0.8833333s` montage using `Anim_overhead_Attack1`.
- `AM_Rapier_heavySecond` is a real second-swing montage, also `0.8833333s`, using `Anim_Sword_Attack2`.
- The direct text reference to `AM_Rapier_heavySecond` is still missing outside its own montage file. It is not in `Attackset_YsabellaSword`, and the FModel text for `GA_PlayerAttack_HeavyRapier` does not expose a hard asset pointer to it.
- So if the observed on-hit two-swipe heavy uses `AM_Rapier_heavySecond`, the call is hidden in cooked Blueprint bytecode / native ability logic rather than visible as a normal asset reference in these JSON exports.
- The two slashes are not both baked into `AM_Rapier_heavy`; that montage has a single `Default` section and only bark/swing audio notifies.

For decapitation, the rapier heavy ability itself does not expose the explicit `Death Behaviour Tag = Combat.Death.Dismember` that the common `GA_PlayerAttack_sword` uses. The weapon-side data is split between the active DLC rapier attackset and the older/common Ysabella sword setup:

| Source                             | Relevant value                                                         |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `BP_PlayerCharacter_Ysabella`      | active `Default Weapon` is DLC `Attackset_YsabellaSword`               |
| DLC `Attackset_YsabellaSword`      | `CanVT=true`; no exported `DismemberChance` value                      |
| `DABP_PlayerAttackConfig`          | has the editable `DismemberChance` field used by weapon attack configs |
| Common `Attackset_Sword_Ysabella`  | `DismemberChance=0.36`, `CanVT=true`                                   |
| `BP_WeaponInstance_Sword_Ysabella` | points its `PlayerWeapon` back to common `Attackset_Sword_Ysabella`    |
| `BP_DeadEnemy_Base`                | has a `DismemberChance` function that pulls the player weapon manager  |
| `GA_PlayerAttack_HeavyRapier`      | `KillStunned=true`, `Executes=true`, `CasualExecution=true`            |

My read: the rapier heavy's decap behavior is probably coming from the weapon/dismember pipeline plus the heavy ability's execute/kill-stunned path, not from a visible `Combat.Death.Dismember` field on `GA_PlayerAttack_HeavyRapier`. The best exported numeric candidate is the common Ysabella sword's `DismemberChance=0.36`, but the active DLC rapier attackset does not itself export that number, so I would treat `0.36` as likely/inherited rather than confirmed for the DLC rapier until a runtime dump shows the active player weapon config.

For the brief speed burst: I do not see a named WalkSpeed/SprintSpeed buff on `GA_PlayerAttack_HeavyRapier`. What is confirmed is the very fast lunge/target-move tuning: `LungeDelay=0.01`, `LungeRange=300.0`, `LungeRangeTargeted=450.0`, `LungeDuration=0.1`, `LungeAssistStrength=550.0`, plus a custom `MoveToTarget` override. That is the best exported explanation for the quick acceleration feel. The `Knockback` struct's boost `5.0` / decay `7.0` is attached to hit reaction/knockback parameters, so I would not treat it as a player movement-speed buff without runtime confirmation.

`AM_Rapier_heavySecond` timing, for comparison: `SequenceLength=0.8833333`, `BlendIn=0.00`, `BlendOut=0.35`, segment `Anim_Sword_Attack2` from `0.1` to `0.98333335`.

## Dash / context attacks

`CG_YsabellaCombat` wires a context-attack chain that mixes DLC-specific Ysabella attacks with common combat abilities:

`GA_WirePunt -> GA_PlayerAttack_DropKick -> GA_PlayerAttack_SlideKick_Ysabella -> GA_Ysabella_Kick_Front -> GA_PlayerAttack_Kick_Side -> GA_Ysabella_backkick -> GA_Ysa_attack_VT -> GA_PlayerAttack_Shunt -> GA_PlayerShoot -> GA_PlayerWindup`

The Ysabella-specific dash/kick overrides and adjacent context attacks are:

| Ability                              | Montage                       |    Hit Damage | Trace                           | Lunge                                                                | Knockback / notes                                                                                                                                                                                  | Montage timing                                       |
| ------------------------------------ | ----------------------------- | ------------: | ------------------------------- | -------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| `GA_PlayerAttack_DropKick` common    | `AM_Player_Combat_DropKick`   |          25.0 | range `200.0`, radius `35.0`    | range `300.0`, targeted `400.0`, duration `0.1`                      | vertical `-200.0`, horizontal `2000.0`, boost `0.4`; `LaunchLightweights=true`; `Damage Should Execute=true`                                                                                       | length `1.5`, blend in `0.08`, blend out `0.6`       |
| `GA_PlayerAttack_SlideKick_Ysabella` | `AM_Player_Ysa_SlideKick`     |           9.0 | range `300.0`, radius `40.0`    | range `300.0`, targeted `400.0`, duration `0.1`, aim offset Z `80.0` | vertical `400.0`, horizontal `1400.0`, boost `0.4`; `LaunchLightweights=true`; `Damage Should Execute=true`                                                                                        | length `0.93`, blend in `0.08`, blend out `0.6`      |
| `GA_Ysabella_Kick_Front`             | `AM_Ysabella_knee`            |           5.0 | radius `70.0`                   | range `330.0`, targeted `400.0`, duration `0.1`                      | horizontal `300.0`, gravity scale `0.8`; `SpecialDamageBonus=5.0`; requires `Combat.Ability.Evade`                                                                                                 | length `1.15`, blend in `0.20`, blend out `0.35`     |
| `GA_PlayerAttack_Kick_Side` common   | `AM_Player_Combat_Kick_Right` |           7.0 | range `270.0`, radius `60.0`    | range `200.0`, targeted `200.0`, duration `0.1`                      | horizontal `800.0`; `SpecialDamageBonus=4.0`; left variant `AM_Player_Combat_Kick_Left` also exists                                                                                                | length `1.2`, blend in `0.15`, blend out `0.35`      |
| `GA_Ysabella_backkick`               | `AM_Ysa_kick_back`            | 7.0 inherited | range `250.0` inherited         | range `300.0`, targeted `400.0`, duration `0.1` inherited            | DLC class only overrides the montage; combat stats inherit from `GA_PlayerAttack_Kick_Back`: horizontal `800.0`, `LaunchLightweights=true`, `Damage Should Execute=true`, `SpecialDamageBonus=1.5` | length `1.8166667`, blend in `0.06`, blend out `0.5` |
| `GA_Ysa_attack_VT` related follow-up | `AM_YsaSword_VT`              |           5.0 | range `250.0`                   | range `150.0`, targeted `150.0`, duration `0.1`                      | vertical `550.0`, horizontal `50.0`, gravity scale `0.7`, boost `1.0`; `LaunchLightweights=true`; follows `GA_Ysabella_backkick` in the combat graph                                               | length `1.05`, blend out `0.3`                       |
| `GA_PlayerAttack_Shunt` common       | `AM_Player_combat_shunt`      |           2.0 | not overridden on class default | range `250.0`, targeted `400.0`, duration `0.1`                      | vertical `0.0`, horizontal `1400.0`, gravity scale `0.8`, boost `0.5`; `SpecialDamageBonus=1.4`; `LegeslipDuration=0.7`                                                                            | length `0.95`, blend in `0.1`, blend out `0.3`       |

`GA_WirePunt` is in the same Ysabella combat graph, but its exported defaults do not expose a montage or hit damage; the visible defaults are `TraceRange=240.0`, ability tags `Combat.Ability.YsaWire.Punt` and `Combat.Ability.Melee.Light`, and blocking tags for chargeup/heavy/kick/light/shunt/TK pickup.

## Riser / launcher attack

The Ysabella combat graph does not reference the common `GA_Playerattack_riser` state directly. In `CG_YsabellaCombat`, the riser-like launcher is the DLC-specific `GA_Ysa_attack_VT`, wired after `GA_Ysabella_backkick` and before `GA_PlayerAttack_Shunt`.

| Field                    | `GA_Ysa_attack_VT` value                                                                 |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| Montage                  | `AM_YsaSword_VT`                                                                         |
| Attack type              | `Combat.Attack.Launcher`                                                                 |
| Hit Damage               | `5.0`                                                                                    |
| Environment Damage       | `3.0`                                                                                    |
| Trace Range              | `250.0`                                                                                  |
| LungeDelay               | `0.2`                                                                                    |
| LungeRange / Targeted    | `150.0` / `150.0`                                                                        |
| LungeDuration / Targeted | `0.1` / `0.1`                                                                            |
| BufferDelay / ComboDelay | `0.3` / `1.0`                                                                            |
| Bounceback Distance      | `200.0`                                                                                  |
| Hitfreeze / Brutal       | `0.06` / `0.2`                                                                           |
| Knockback                | vertical `550.0`, horizontal `50.0`, gravity scale `0.7`, boost `1.0`                    |
| Flags                    | `LaunchLightweights=true`, `Montage Stop when Ability Ends=false`                        |
| SpecialDamageBonus       | `1.0`                                                                                    |
| SpecialHitFilter         | `Combat.Ability.Ranged.Reload`, `Combat.Status.vulnerable`, `Combat.Ability.Melee.Heavy` |
| Ability tag              | `Combat.Ability.Melee.Kick.Back`                                                         |
| Activation blocked       | `Combat.Blocked`                                                                         |

`AM_YsaSword_VT` timing:

| Field          | Value                                                    |
| -------------- | -------------------------------------------------------- |
| SequenceLength | `1.05`                                                   |
| Slot           | `CombatFullBody`                                         |
| BlendIn        | `CircularOut`, default time                              |
| BlendOut       | `0.3`, `Cubic`                                           |
| Segment        | `Anim_YsaSword_VT_Anim`, anim `0.05-1.1`, rate `1.0`     |
| Audio notify   | `CHAR_Player_Melee_Weapons_Swing_Heavy` at `0.28282446s` |
| Bark notify    | `Narrative.Prompts.Player.Combat.Attack_M` at `0.3s`     |

For comparison, the literal common riser ability is `GA_Playerattack_riser` in common context attacks. I found it wired in `CG_ChargeCombat`, but not in Ysabella's DLC combat graph.

| Field                    | Common `GA_Playerattack_riser` value                                                            |
| ------------------------ | ----------------------------------------------------------------------------------------------- |
| Montage                  | `AM_Player_Riser`                                                                               |
| Attack type              | `Combat.Attack.Launcher`                                                                        |
| Hit Damage               | `8.0`                                                                                           |
| Environment Damage       | `3.0`                                                                                           |
| Trace Range              | `250.0`                                                                                         |
| LungeDelay               | `0.25`                                                                                          |
| LungeRange / Targeted    | `150.0` / `150.0`                                                                               |
| LungeDuration / Targeted | `0.1` / `0.1`                                                                                   |
| BufferDelay / ComboDelay | `0.3` / `0.7`                                                                                   |
| Bounceback Distance      | `100.0`                                                                                         |
| Hitfreeze / Brutal       | `0.06` / `0.2`                                                                                  |
| Knockback                | vertical `700.0`, horizontal `50.0`, boost `1.0`                                                |
| Flags                    | `LaunchLightweights=true`, `Damage Should Execute=true`, `Montage Stop when Ability Ends=false` |
| SpecialDamageBonus       | `30.0`                                                                                          |
| SpecialHitFilter         | `Combat.Ability.Ranged.Reload`                                                                  |

`AM_Player_Riser` timing:

| Field              | Value                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| SequenceLength     | `1.2714334`                                                                                                         |
| Slot               | `CombatFullBody`                                                                                                    |
| BlendIn / BlendOut | `0.1` / `0.3`, both `Cubic`                                                                                         |
| Segments           | `Combat_Uppercut_Brujah` split into `0-0.35` at rate `1.0`, `0.35-0.75` at rate `0.7`, and `0.75-1.1` at rate `1.0` |
| Audio notify       | `WEP_NPC_Ambusher_Kick_Whoosh` at `0.089912914s`                                                                    |
| Bark notify        | `Narrative.Prompts.Player.Combat.Attack_M` at `0.14025763s`                                                         |

## Related weapon setup

- Mesh: `SK_YsabellaSword`
- Combat idle/grip: `Anim_YsaSword_Idle_Anim`
- Crouch: `Anim_YsaSword_crouch_Anim`
- Deploy/grab: `AM_ysaknifeFlourish`
- Impact switch: `SW_WEP_Player_MeleeWeapon-Sword`
- Impact audio: `WEP_Player_Melee_Weapon_Impact`
- `CanVT`: true

## Sources

- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Pawns/BP_PlayerCharacter_Ysabella.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Pawns/Weapon/Attackset_YsabellaSword.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Pawns/Weapon/AM_Rapier_attack*.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/PlayerCharacter/Weapons/Anims/AM_Rapier_heavy.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/PlayerCharacter/Weapons/Anims/AM_Rapier_heavySecond.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Melee/ChargedAttacks/GA_PlayerAttack_HeavyRapier.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/Sword/BP_WeaponInstance_Sword_Ysabella.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/PlayerCharacter/Weapons/Attackset_Sword_Ysabella.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Melee/DABP_PlayerAttackConfig.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Melee/ChargedAttacks/GA_PlayerAttack_sword.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/Enemies/MinorGhoul/BP_DeadEnemy_Base.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Pawns/CG_YsabellaCombat.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Pawns/DA_Ysabella_playerdefaultAbilities.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/GA_Ysabella_Kick_Front.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/GA_PlayerAttack_SlideKick_Ysabella.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/GA_Ysabella_backkick.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/GA_Ysa_attack_VT.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/AM_YsaSword_VT.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Plugins/WrestlerDLC/DLC_Ysabella/Content/YsabellaContent/Abilities/Player/GA_WirePunt.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Melee/ContextAttacks/GA_PlayerAttack_DropKick.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Melee/ContextAttacks/GA_PlayerAttack_Kick_Side.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Melee/ContextAttacks/GA_PlayerAttack_Kick_Back.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Melee/ContextAttacks/GA_PlayerAttack_Shunt.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Melee/ContextAttacks/GA_Playerattack_riser.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Abilities/Player/Melee/ContextAttacks/AM_Player_Riser.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/PlayerCharacter/Prototype/Combat/CG_ChargeCombat.json`
