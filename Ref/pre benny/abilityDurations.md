# Phyre Ability & Effect Duration Reference

Extracted from FModel JSON exports, build **21718394**.

> **Source-of-truth policy:**
>
> - ✅ **Confirmed** — `DurationPolicy: HasDuration` present in CDO. Value is what the player experiences.
> - ⚠️ **Instant (GAS default)** — `DurationPolicy` absent from CDO. Any `DurationMagnitude` value present is orphaned/dead data ignored by GAS. Effect fires once.
> - ❌ **Not accessible** — value is SetByCaller or lives in Blueprint graph. Cannot be read from exports.

---

## Blood Cost Pools

All clan abilities drain their full pool (coefficient −1.0, Additive + Override to 0):

| Pool                   | Used by                                                                                              |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `StrikeAbilityBlood`   | BloodBlade, BloodCurse, EntrancingKiss, LightningStrikes, ArmsOfAhriman, TerminalDecree, SpiritTouch |
| `AffectAbilityBlood`   | Mute, Taunt, GlimpseOfOblivion, Beckon, CloudMemory, CauldronOfBlood, ForgetfulMind                  |
| `RelocateAbilityBlood` | SplitSecond, Charge, ShadowStep, Blink, Recall, Possession, MaskOfAThousandFaces                     |
| `MasteryAbilityBlood`  | UnseenAura, BlurredMomentum, BloodSalvo, EnterOblivion, MassManipulation                             |

---

## Clan Ability Cooldowns (from GE files)

Clan GAs have **no `CooldownGameplayEffectClass`** in their CDO — cooldowns are applied via Blueprint graph.

| GE                        | Duration | Notes                   |
| ------------------------- | -------- | ----------------------- |
| `GE_BrujahCoolDown`       | 3s       | Brujah abilities        |
| `GE_CloudMemory`          | 4s       | Ventrue Cloud Memory    |
| `GE_cloakCooldown`        | 10s      | Lasombra cloak          |
| `GE_EarthShock_Cooldown`  | 15s      | Period tick 1s          |
| `GE_Telekinesis_Cooldown` | 0.001s   | Effectively no cooldown |
| `GE_VV_Cooldown`          | 0.4s     | Vampiric Vision         |
| `GE_MatrixPunch_cooldown` | 6s       |                         |
| `GE_sidestepCooldown`     | 4s       |                         |
| `GE_BMCooldown`           | 7s       | Blurred Momentum        |

---

## Enemy Status Effects (applied by player abilities)

These GAs run on the enemy target while the effect is active. Duration ends when GA is cancelled/ends (not time-limited from CDO).

| GA                           | Applied by                  | Enemy Tags while active                                   |
| ---------------------------- | --------------------------- | --------------------------------------------------------- |
| `GA_Enemy_Trapped`           | ArmsOfAhriman               | Feedable, Disarmable, NoMove, NoTurn, vulnerable          |
| `GA_Enemy_Torture`           | CauldronOfBlood             | Feedable, Disarmable, NoMove, NoTurn, Torture, vulnerable |
| `GA_Entranced`               | EntrancingKiss              | Disarmable                                                |
| `GA_Enemy_CloudMemory`       | Cloud Memory                | Disarmable, Blind, Deaf, vulnerable, NoMove, NoTurn       |
| `GA_OblivionGlimpseReaction` | GlimpseOfOblivion           | Disarmable, vulnerable, NoMove, NoTurn                    |
| `GA_Ve_Beckon_trance`        | Beckon                      | Feedable, Disarmable                                      |
| `GA_VE_MM_Subdued`           | MassManipulation            | vulnerable, NoMove, NoTurn                                |
| `GA_VE_TerminalDecree_Kill`  | TerminalDecree              | vulnerable, NoMove, NoTurn                                |
| `GA_Enemy_Anger`             | Taunt                       | Anger, AttackArmor                                        |
| `GA_Enemy_Snatched`          | Charge                      | NoMove, NoDeath                                           |
| `GA_Enemy_Fear`              | GlimpseOfOblivion           | Fear                                                      |
| `GA_Enemy_CloudMemory`       | CloudMemory / ForgetfulMind | Disarmable, Blind, Deaf, NoMove                           |

---

## Passive Buff Durations (on-proc)

All durations below are ✅ confirmed HasDuration unless marked otherwise.

| GE                                | Player-felt Duration        | Player-felt Effects                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GE_Toreador_passive_fleetness`   | **6s** ✅                   | WalkSpeed ×1.8, SprintSpeed ×1.5, CrouchSpeed ×1.6                                                                                                                                                                                                                                                                                                                                                                        |
| `GE_Lasombra_Passive_ShadowCloak` | **8s** ✅                   | WalkSpeed ×1.1, CrouchSpeed ×1.1, Noticeability ×0.2                                                                                                                                                                                                                                                                                                                                                                      |
| `GE_Banu_Passive`                 | **10s** ✅                  | Noticeability ×0.8; also silences Phyre (`Combat.Status.Mute` on self — suppresses AI sound detection)                                                                                                                                                                                                                                                                                                                    |
| `GE_Tremere_Passive`              | **no observable effect** ⚠️ | **Corrosive Touch**: dissolves the fed-on corpse plus nearby corpses. With the Brujah perk, also dissolves killed targets. Dissolve VFX is `NS_PlaceholderBodyDissolve`; corpse actor is `BP_DeadEnemy_Base`. `GE_Tremere_Passive` (Blood +1 Additive, Instant) exists in the files but **is not active in-game** — no blood is restored on dissolve. Trigger conditions and area are Blueprint-only (❌ not in exports). |
| `GE_Brujah_Passive`               | **25s** ✅                  | WalkSpeed ×1.2, SprintSpeed ×1.2, MaxAmmo ×0.7; **damage boost** via C++ `BrutalityMultiplier` (magnitude not in exports — Blueprint-only). AttackPower ×1.0 modifier in GE is a no-op marker; actual damage increase comes from the C++ function checking the granted `Combat.Ability.Passive.Brutality` tag. Stack limit ×1.                                                                                            |

---

## Active Ability State GEs (Infinite — last until GA ends)

These GEs are applied while the ability is actively running and are removed when the GA ends. Duration is not time-limited in the GE itself.

| GE                               | Applied during       | Modifiers / Tags on target                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GE_Mute`                        | Ba Mute              | Grants `Combat.Status.Mute`; removed if target has `Combat.Status.Stunned` or `Combat.General.Boss`                                                                                                                                                                                                                                                           |
| `GE_Ba_UnseenAura`               | Ba UnseenAura        | Noticeability ×0.3. **Effective max duration: 30s** (from `MaxTimeInvisible` in GA CDO — GE itself is Infinite). Breaks early if Phyre moves above `SpeedThreshold: 200` units/s or triggers `InvisBlockedTags` (melee, feed, hit-react, interaction anims). `GE_UnseenAuraEnding_MasqueradeBreach` (1s) fires on end, grants `Masquerade.UnseenAura.Ending`. |
| `GE_Taunted`                     | Br Taunt             | StunFragility ×1.5, WalkSpeed Override 500, SprintSpeed Override 700, AttackPower ×2.0; grants `Combat.Status.Fragile`, `Combat.Status.Anger`                                                                                                                                                                                                                 |
| `GE_BlurredMomentum`             | To BlurredMomentum   | CrouchSpeed ×1.5, WalkSpeed ×1.6, SprintSpeed ×1.2; grants `Combat.Status.DamageImmune`; removed on Feed or `PauseImmunity`                                                                                                                                                                                                                                   |
| `GE_KissStats`                   | To EntrancingKiss    | StunFragility ×0.7, WalkSpeed ×1.2, SprintSpeed ×1.2, Noticeability Override 0.3, AttackPower ×2.0 (on Phyre while Kiss active)                                                                                                                                                                                                                               |
| `GE_La_GlimpseOfOblivion_Target` | La GlimpseOfOblivion | Grants `Combat.Status.Fear` on target                                                                                                                                                                                                                                                                                                                         |
| `GE_Subdued`                     | Ve MassManipulation  | StunResistance ×0.7 on subdued enemy; grants tag `AbilityEvent.Manipulation.Subdue`                                                                                                                                                                                                                                                                           |
| `GE_Posessed` (tick)             | Ve Possession        | WalkSpeed ×1.2, SprintSpeed ×1.2, AccelerationRate Override 5000; `AI.Perception.PauseDetection`; 0.8s, removed on Stunned                                                                                                                                                                                                                                    |

### Brujah Passive (Brutality) — timer reset mechanic

`GA_Brujah_Passive` CDO: `bRetriggerInstancedAbility: true`, blocked by `Combat.Status.NoPassive`. Proc cooldown is `GE_BrujahCoolDown` (3s). Any new qualifying hit while Brutality is active **resets the full 25s timer** — it can be kept up indefinitely in sustained combat. Unlike Ventrue there is no short-duration Override GE beneath it; the 25s is the genuine felt duration.

### GA_BoilingBlood — Tremere passive on feed

Lives in `Tr_Affect_CauldronOfBlood/`. Activates when feeding off a CauldronOfBlood target. No GE — all damage, duration, and blood threshold logic is in the Blueprint graph (`UberGraphFunction`).

| Field                        | Value                     | Notes                                                              |
| ---------------------------- | ------------------------- | ------------------------------------------------------------------ |
| `Boilrate`                   | **0.3s**                  | Tick interval at normal blood                                      |
| `BoilrateLow`                | **0.5s**                  | Tick interval when blood is low                                    |
| `BloodIndex`                 | int32                     | Blood level index — threshold for low/normal rate set in Blueprint |
| `bRetriggerInstancedAbility` | true                      | Keeps ticking while conditions hold                                |
| AbilityTags                  | `Combat.Status.BloodBoil` |                                                                    |

### Abilities with no state GE (cue-launcher files only)

These ability GE files contain only a `GameplayCue` reference — no duration, modifiers, or tags. The ability state is tracked entirely via GA OwnedTags:

| Ability            | GE file             | What it does                                                                                                                                                                                                     |
| ------------------ | ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tremere BloodCurse | `GE_Tr_BloodCurse`  | Fires `GameplayCue.Source.Ability.CauldronOfBlood` only                                                                                                                                                          |
| Tremere BloodSalvo | `GE_Tr_BloodSalvo`  | Fires `GameplayCue.Source.Ability.BloodSalvo` only                                                                                                                                                               |
| Banu BloodBlade    | `GE_Ba_BloodBlade`  | Fires `GameplayCue.Source.Ability.BloodBlade` only                                                                                                                                                               |
| Banu SplitSecond   | `GE_Ba_SplitSecond` | Fires `GameplayCue.Source.Ability.SplitSecond` only. Actual duration data lives in the GA CDO: `Freeze duration: 7.0s`, `PlayerPercievedDilation: 0.7` (enemy time dilation; player perceives time at 70% speed) |

### Abilities with no GE file at all

State tracked via OwnedTags on the GA itself — no GE exported:

- **Lasombra EnterOblivion** — state via `Combat.Status.InOblivion` GA tag
- **Ventrue Possession** — possession state via GA tags; `GE_Posessed` (0.8s) is a per-action tick effect, not the possession duration

---

### Ventrue Passive (Fortitude) — what players actually experience

**Felt behaviour:** Fortitude activates on proc and grants 80% DR for 25s (up to 4 stacks). DR scales dynamically with blood level. Shield bar drains when passive is not being re-proced.

| GE                              | Duration | Status                                                       | Effect                                                                                                                                             |
| ------------------------------- | -------- | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GE_Ventrue_Passive`            | **25s**  | ✅ HasDuration confirmed                                     | `HealthFragility` Multiplicative ×0.2 = **80% DR**; grants `Combat.General.Shield` tag; up to ×4 stacks                                            |
| `GE_Ventrue_Passive_bloodbased` | ~~5s~~   | ⚠️ **Instant** (no DurationPolicy — same as Tremere passive) | `HealthFragility` Override via SetByCaller — Blueprint re-applies continuously to adjust DR with blood level. "5s" DurationMagnitude is dead data. |
| `GE_Ventrue_Passive_reset`      | 5s       | (DurationPolicy unverified)                                  | `MaxShield` + `Shield` Override → 0 (drains shield bar)                                                                                            |
| `GE_Ventrue_Shield_Bonus`       | 6s       | ✅                                                           | Shield bonus buff                                                                                                                                  |
| `GE_Ventrue_Shield_Elixir`      | 10s      | ✅                                                           | `HealthFragility` ×0.1 = **90% DR** (from Elixir)                                                                                                  |
| `GE_Ventrue_PassiveSideeffect`  | 0.2s     | ✅                                                           | Speed/damage/ammo via SetByCaller                                                                                                                  |

---

## Movement / Combat GEs

| GE                               | Duration | Notes                                                             |
| -------------------------------- | -------- | ----------------------------------------------------------------- |
| `GE_PlayerDash_Updated_cooldown` | 0.9s     | Dodge cooldown                                                    |
| `GE_ComboDash_Cooldown`          | 0.65s    | Short combo dash                                                  |
| `GE_ComboDash_long_Cooldown`     | 1.0s     | Long combo dash                                                   |
| `GE_SlideCooldown`               | 0.7s     |                                                                   |
| `GE_WallClimbCooldown`           | 1.5s     |                                                                   |
| `GE_DropKickCooldown`            | 6s       |                                                                   |
| `GE_HeavyPunch_Cooldown`         | 5s       |                                                                   |
| `GE_BackKickenemyaffect`         | 5s       | Enemy WalkSpeed ×0.3, SprintSpeed ×0.3                            |
| `GE_SideKickEnemyAffect`         | 3s       | Status on kicked target                                           |
| `GE_Player_CounterHit`           | 2s       | StunFragility ×2.5                                                |
| `GE_TR_Recall_Teleport`          | 2s       | Post-recall window                                                |
| `GE_TR_Recall_SpawnPoint`        | 0.5s     | Recall marker lifetime                                            |
| `GE_TouchOfOblivion`             | 10s      | Poison applied                                                    |
| `GE_TouchOfOblivion_Poison`      | 5s       | Health −1 every 0.1s = 50 total damage                            |
| `GE_Charge_disableMove`          | 20s      | WalkSpeed/SprintSpeed/CrouchSpeed all ×0 (enemy frozen by Charge) |
| `GE_sprintStumbleBlocker`        | 3s       |                                                                   |
| `GE_GloryKillCooldown`           | 1s       |                                                                   |
| `GE_FeedProof`                   | 0.6s     | Brief immunity window after feed                                  |

---

## Damage Values

Most clan ability and melee damage GEs use C++ execution classes (`WrestlerDamageExecution` / `WrestlerStunDamageExecution`) with **no `CalculationModifiers` in the CDO** — magnitudes are SetByCaller from Blueprint. However, Blueprint GA CDOs do carry readable float fields:

### Melee attack base values (from `GA_PlayerAttack_base` CDO)

| Field                   | Value         | Notes                                            |
| ----------------------- | ------------- | ------------------------------------------------ |
| `Hit Damage`            | **10.0**      | Base damage per melee hit                        |
| `Environment Damage`    | **10.0**      | Damage applied to destructible environment       |
| `BehindEnemyMultiplier` | **×2.0**      | Backstab multiplier                              |
| `SpecialDamageBonus`    | **×2.0**      | Applied when hit qualifies for SpecialDamageTags |
| `Hitfreeze Duration`    | **0.1s**      | Hit-stop on standard hit                         |
| `LungeRange`            | **100 units** | Auto-lunge range                                 |
| `LungeRangeTargeted`    | **300 units** | Targeted lunge range                             |

### Other hardcoded health deltas found in player ability folder

| GE                          | Value                      | Notes                                    |
| --------------------------- | -------------------------- | ---------------------------------------- |
| `GE_TouchOfOblivion_Poison` | Health −1 Additive         | Period 0.1s for 5s = 50 total damage     |
| `GE_ElixirHealthRestore`    | Health +50 Additive        | One-shot Elixir heal                     |
| `GE_BloodHeal`              | Health +0 (SetByCaller) ❌ | Period 0.5s; actual value set at runtime |
| `GE_Feed_DamageResist`      | HealthFragility ×0.7       | 30% DR while feeding                     |
| `GE_InteractStats`          | HealthFragility ×0.01      | 99% DR during interact animations        |

### Values confirmed not accessible from exports ❌

All SetByCaller at runtime from Blueprint graph: LightningStrikes damage, EarthShock damage, Assassination damage, FistOfCaine damage, GroundPound damage, Throw damage, CauldronOfBlood DPS/duration/radius, BoilingBlood damage, Brujah BrutalityMultiplier magnitude.

---

## CXX Header Dump findings (build 21718394)

The header dump (`CXXHeaderDump/*.hpp`) provides C++ class layouts. Key findings:

**`UWrestlerGameplayAbility_Passive`** (base for all clan passives):

- `PassiveEffect` (TSubclassOf GE) — the GE applied on proc; duration from that GE's CDO
- `GetPassiveEffectDuration()` / `ApplyPassiveEffect()` — runtime API

**`GA_Tremere_Passive_C`** extends `GA_PassiveBase_C`, adds `Dead Body Class` (`TSoftClassPtr<AActor>` → `BP_DeadEnemy_Base`) — the actor spawned to represent/trigger the corpse dissolve. VFX is `NS_PlaceholderBodyDissolve`. Trigger conditions (feed target, nearby corpse radius, Brujah kill extension) are Blueprint-only.

**`UWrestlerGameplayAbility_CauldronOfBlood`** — every numeric gameplay value is a `FGameplayTag` channel name, resolved via SetByCaller at runtime from Blueprint. Fields: `DamagePerSecond`, `TimeForActivation`, `Radius`, `Threshold`, `WeightDistance`, `WeightAngle`, `UltimateRadius`. **Actual numbers are not accessible from exports.**

**`GA_BoilingBlood_C`** fields confirmed: `Boilrate` (double), `BoilrateLow` (double), `BloodIndex` (int32), `DamageSource` (AActor\*). Threshold for low-blood mode is Blueprint-computed from `BloodIndex`.

---

## Notes on GAS Modifier Evaluation Order

Override > Additive > Multiplicative (standard GAS). A `bloodbased` Override GE applied after the base Multiplicative GE replaces the effective value for that attribute — this is how Ventrue DR scales dynamically with blood level rather than being a flat 80%.
