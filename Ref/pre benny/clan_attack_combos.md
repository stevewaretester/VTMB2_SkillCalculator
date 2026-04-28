# Clan Attack Combo Data (Build 21718394)

Source: FModel exports from `WrestlerCommon/Abilities/Player/Melee/ChargedAttacks/`

Each set is a `DABP_PlayerAttackConfig` with an `Attacks` array. Each step has a windup montage, a light attack, and a heavy attack. Whether light or heavy fires depends on how long the player held — `HeavyThreshold` is the normalized hold value required to trigger heavy.

**Windup model:** Press and hold attack → windup montage plays. `MinWU` = earliest you can release (seconds). `MaxWU` = auto-fires at this point. On release: `normalised = holdTime / MaxWU` (0–1). If `normalised >= HeavyThresh` → heavy fires; otherwise → light fires. This is a single one-way decision at release — there is no "fire light then keep charging for heavy." The windup montage is purely visual feedback; `MaxWU` is the real timing cap.

**Combo timing model:** `ComboDelay` is the time (s) from attack trigger until the next combo step can be inputted — the current montage is blended out early at this point if you press attack again. `L.Len` / `H.Len` are the full `SequenceLength` of the light and heavy montages — only reached if you stop the combo. In a flowing chain, each animation is cut short at `ComboDelay` seconds, not `L.Len`.

---

## Banu Haqim — 5 steps

| Step | Windup                                                 | MinWU   | MaxWU   | Light Montage                                        | L.Dmg | ComboDelay | L.Len | Heavy Montage                                        | H.Dmg  | H.Len | HeavyThresh |
| ---- | ------------------------------------------------------ | ------- | ------- | ---------------------------------------------------- | ----- | ---------- | ----- | ---------------------------------------------------- | ------ | ----- | ----------- |
| 1    | <abbr title="AM_Combat_BA_Windup_1">BA_Windup_1</abbr> | 0.2     | 1.0     | <abbr title="AM_Combat_BA_Light_1">BA_Light_1</abbr> | 6     | 0.36       | 0.88  | <abbr title="AM_Combat_BA_Heavy_1">BA_Heavy_1</abbr> | 15     | 1.53  | 0.7         |
| 2    | <abbr title="AM_Combat_BA_Windup_2">BA_Windup_2</abbr> | 0.1     | 1.0     | <abbr title="AM_Combat_BA_Light_2">BA_Light_2</abbr> | 5     | 0.15       | 0.88  | <abbr title="AM_Combat_BA_Heavy_2">BA_Heavy_2</abbr> | 15     | 1.53  | 0.7         |
| 3    | <abbr title="AM_Combat_BA_Windup_1">BA_Windup_1</abbr> | **0.0** | 1.0     | <abbr title="AM_Combat_BA_Light_3">BA_Light_3</abbr> | 5     | 0.35       | 0.88  | <abbr title="AM_Combat_BA_Heavy_1">BA_Heavy_1</abbr> | 15     | 1.53  | 0.7         |
| 4    | <abbr title="AM_Combat_BA_Windup_2">BA_Windup_2</abbr> | 0.2     | 1.0     | <abbr title="AM_Combat_BA_Light_4">BA_Light_4</abbr> | 7     | 0.30       | 0.88  | <abbr title="AM_Combat_BA_Heavy_2">BA_Heavy_2</abbr> | 15     | 1.53  | 0.7         |
| 5    | <abbr title="AM_Combat_BA_Windup_1">BA_Windup_1</abbr> | 0.2     | **1.1** | <abbr title="AM_Combat_BA_Light_5">BA_Light_5</abbr> | 10    | 0.80       | 1.12  | <abbr title="AM_Combat_BA_Heavy_1">BA_Heavy_1</abbr> | **18** | 1.53  | **0.9**     |

- All lights: `Combat.Ability.Melee.Light.Lunging`
- Step 5 is the finisher: highest threshold (0.9), longest delay, biggest damage

---

## Brujah — 4 steps

| Step | Windup                                          | MinWU | MaxWU | Light Montage                                              | L.Dmg | ComboDelay | L.Len    | Heavy Montage                                              | H.Dmg | H.Len | HeavyThresh |
| ---- | ----------------------------------------------- | ----- | ----- | ---------------------------------------------------------- | ----- | ---------- | -------- | ---------------------------------------------------------- | ----- | ----- | ----------- |
| 1    | <abbr title="AM_ChargedAttack_Br_1">Br_1</abbr> | 0.2   | 1.0   | <abbr title="AM_Combat_Brujah_Light1">Brujah_Light1</abbr> | 8     | 0.20       | 0.81     | <abbr title="AM_Combat_Brujah_Heavy1">Brujah_Heavy1</abbr> | 15    | 0.80  | 0.7         |
| 2    | <abbr title="AM_ChargedAttack_Br_2">Br_2</abbr> | 0.2   | 1.0   | <abbr title="AM_Combat_Brujah_Light2">Brujah_Light2</abbr> | 8     | 0.20       | 1.11     | <abbr title="AM_Combat_Brujah_Heavy2">Brujah_Heavy2</abbr> | 15    | 0.80  | 0.7         |
| 3    | <abbr title="AM_ChargedAttack_Br_1">Br_1</abbr> | 0.2   | 1.0   | <abbr title="AM_Combat_Brujah_Light3">Brujah_Light3</abbr> | 8     | 0.20       | 1.11     | <abbr title="AM_Combat_Brujah_Heavy1">Brujah_Heavy1</abbr> | 15    | 0.80  | 0.7         |
| 4    | <abbr title="AM_ChargedAttack_Br_2">Br_2</abbr> | 0.2   | 1.0   | <abbr title="AM_Combat_Brujah_Light4">Brujah_Light4</abbr> | 8     | 0.70       | **2.29** | <abbr title="AM_Combat_Brujah_Heavy2">Brujah_Heavy2</abbr> | 15    | 0.80  | 0.7         |

- All lights: Lunging
- Most uniform set — every light deals 8, every heavy deals 15
- Step 4 has a long combo delay (0.7) acting as a natural finisher pause

---

## Tremere — 4 steps

| Step | Windup                                                 | MinWU | MaxWU   | Light Montage                                        | L.Dmg | ComboDelay | L.Len | Heavy Montage                                        | H.Dmg | H.Len | HeavyThresh |
| ---- | ------------------------------------------------------ | ----- | ------- | ---------------------------------------------------- | ----- | ---------- | ----- | ---------------------------------------------------- | ----- | ----- | ----------- |
| 1    | <abbr title="AM_TR_Combat_Windup_1">TR_Windup_1</abbr> | 0.2   | **0.8** | <abbr title="AM_TR_Combat_Light_1">TR_Light_1</abbr> | 8     | 0.30       | 0.92  | <abbr title="AM_TR_Combat_Heavy_1">TR_Heavy_1</abbr> | 12    | 1.33  | 0.7         |
| 2    | <abbr title="AM_TR_Combat_Windup_2">TR_Windup_2</abbr> | 0.15  | **0.8** | <abbr title="AM_TR_Combat_Light_2">TR_Light_2</abbr> | 8     | 0.30       | 0.92  | <abbr title="AM_TR_Combat_Heavy_2">TR_Heavy_2</abbr> | 12    | 1.33  | 0.7         |
| 3    | <abbr title="AM_TR_Combat_Windup_1">TR_Windup_1</abbr> | 0.15  | **0.8** | <abbr title="AM_TR_Combat_Light_1">TR_Light_1</abbr> | 8     | 0.30       | 0.92  | <abbr title="AM_TR_Combat_Heavy_1">TR_Heavy_1</abbr> | 12    | 1.33  | 0.7         |
| 4    | <abbr title="AM_TR_Combat_Windup_2">TR_Windup_2</abbr> | 0.15  | **0.8** | <abbr title="AM_TR_Combat_Light_2">TR_Light_2</abbr> | 8     | 0.70       | 0.92  | <abbr title="AM_TR_Combat_Heavy_2">TR_Heavy_2</abbr> | 12    | 1.33  | 0.7         |

- All lights: **`Combat.Ability.Melee.Light.NoLunge`** — unique to Tremere, no dash on light attacks
- MaxWindup capped at **0.8** (all others = 1.0)
- Heavy damage is 12 (lowest of all clans)
- Steps 1–3 reuse only 2 montages alternating (Light_1 appears on steps 1 and 3)

---

## Lasombra — 4 steps

| Step | Windup                                                     | MinWU | MaxWU | Light Montage                                            | L.Dmg | ComboDelay | L.Len | Heavy Montage                                                | H.Dmg | H.Len | HeavyThresh |
| ---- | ---------------------------------------------------------- | ----- | ----- | -------------------------------------------------------- | ----- | ---------- | ----- | ------------------------------------------------------------ | ----- | ----- | ----------- |
| 1    | **<abbr title="AM_Combat_VT_Windup_4">VT_Windup_4</abbr>** | 0.2   | 1.0   | <abbr title="AM_Combat_LA_Light_1">LA_Light_1</abbr>     | 8     | 0.20       | 1.13  | <abbr title="AM_Combat_LA_Heavy_Right">LA_Heavy_Right</abbr> | 15    | 0.73  | 0.7         |
| 2    | **<abbr title="AM_Combat_VT_Windup_3">VT_Windup_3</abbr>** | 0.2   | 1.0   | <abbr title="AM_Combat_LA_Light_2">LA_Light_2</abbr>     | 8     | 0.20       | 0.77  | <abbr title="AM_Combat_LA_Heavy_Right">LA_Heavy_Right</abbr> | 15    | 0.73  | 0.7         |
| 3    | **<abbr title="AM_Combat_VT_Windup_4">VT_Windup_4</abbr>** | 0.2   | 1.0   | <abbr title="AM_Combat_LA_Light_3">LA_Light_3</abbr>     | 8     | 0.20       | 1.11  | <abbr title="AM_Combat_LA_Heavy_Right">LA_Heavy_Right</abbr> | 15    | 0.73  | 0.7         |
| 4    | **<abbr title="AM_Combat_VT_Windup_3">VT_Windup_3</abbr>** | 0.2   | 1.0   | <abbr title="AM_Combat_LA_Light_End">LA_Light_End</abbr> | 8     | 0.70       | 1.16  | <abbr title="AM_Combat_LA_Heavy_Right">LA_Heavy_Right</abbr> | 15    | 0.73  | 0.7         |

- Borrows **Ventrue windups** (VT_Windup_3/4) — no dedicated Lasombra windup montages
- Single heavy montage (`LA_Heavy_Right`) used on every step — intentional design
- Step 4 light is `LA_Light_End` (dedicated combo ender)

---

## Toreador — 5 steps

| Step | Windup                                                          | MinWU | MaxWU   | Light Montage                                                 | L.Dmg | ComboDelay | L.Len | Heavy Montage                                                 | H.Dmg  | H.Len | HeavyThresh |
| ---- | --------------------------------------------------------------- | ----- | ------- | ------------------------------------------------------------- | ----- | ---------- | ----- | ------------------------------------------------------------- | ------ | ----- | ----------- |
| 1    | <abbr title="AM_Combat_Toreador_Windup_01">Tor_Windup_01</abbr> | 0.06  | 1.0     | <abbr title="AM_Combat_Toreador_Light_01">Tor_Light_01</abbr> | 5     | 0.25       | 1.30  | <abbr title="AM_Combat_Toreador_Heavy_01">Tor_Heavy_01</abbr> | 15     | 1.53  | 0.7         |
| 2    | <abbr title="AM_Combat_Toreador_Windup_02">Tor_Windup_02</abbr> | 0.03  | 1.0     | <abbr title="AM_Combat_Toreador_Light_02">Tor_Light_02</abbr> | 5     | 0.25       | 1.30  | <abbr title="AM_Combat_Toreador_Heavy_02">Tor_Heavy_02</abbr> | 15     | 1.30  | 0.7         |
| 3    | <abbr title="AM_Combat_Toreador_Windup_01">Tor_Windup_01</abbr> | 0.03  | 1.0     | **<abbr title="AM_Combat_BA_Light_3">BA_Light_3</abbr>**      | 6     | 0.25       | 0.88  | <abbr title="AM_Combat_Toreador_Heavy_01">Tor_Heavy_01</abbr> | 12     | 1.53  | **0.55**    |
| 4    | <abbr title="AM_Combat_Toreador_Windup_02">Tor_Windup_02</abbr> | 0.03  | 1.0     | **<abbr title="AM_Combat_BA_Light_4">BA_Light_4</abbr>**      | 6     | 0.25       | 0.88  | <abbr title="AM_Combat_Toreador_Heavy_02">Tor_Heavy_02</abbr> | 12     | 1.30  | **0.55**    |
| 5    | **<abbr title="AM_Combat_BA_Windup_1">BA_Windup_1</abbr>**      | 0.1   | **1.1** | **<abbr title="AM_Combat_BA_Light_5">BA_Light_5</abbr>**      | 7     | 0.80       | 1.12  | **<abbr title="AM_Combat_BA_Heavy_1">BA_Heavy_1</abbr>**      | **18** | 1.53  | **0.45**    |

- Steps 3–4 reuse Banu light montages; step 5 is fully Banu (windup + light + heavy)
- Heavy threshold drops across the chain: 0.7 → 0.55 → 0.45 — heavies become easier to trigger as the combo progresses
- Lowest per-hit light damage (5–7) but highest combo speed

---

## Ventrue — 4 steps

| Step | Windup                                                 | MinWU | MaxWU | Light Montage                                        | L.Dmg | ComboDelay | L.Len | Heavy Montage                                                          | H.Dmg | H.Len | HeavyThresh |
| ---- | ------------------------------------------------------ | ----- | ----- | ---------------------------------------------------- | ----- | ---------- | ----- | ---------------------------------------------------------------------- | ----- | ----- | ----------- |
| 1    | <abbr title="AM_Combat_VT_Windup_3">VT_Windup_3</abbr> | 0.2   | 1.0   | <abbr title="AM_Combat_VT_Light_3">VT_Light_3</abbr> | 8     | 0.30       | 0.86  | <abbr title="AM_VE_Combat_Heavy_Recycle_01">VE_Heavy_Recycle_01</abbr> | 15    | 1.40  | 0.7         |
| 2    | <abbr title="AM_Combat_VT_Windup_4">VT_Windup_4</abbr> | 0.1   | 1.0   | <abbr title="AM_Combat_VT_Light_4">VT_Light_4</abbr> | 7     | 0.30       | 0.87  | <abbr title="AM_VE_Combat_Heavy_Recycle_02">VE_Heavy_Recycle_02</abbr> | 15    | 1.40  | 0.7         |
| 3    | <abbr title="AM_Combat_VT_Windup_3">VT_Windup_3</abbr> | 0.1   | 1.0   | <abbr title="AM_Combat_VE_Light_3">VE_Light_3</abbr> | 7     | 0.30       | 0.73  | <abbr title="AM_VE_Combat_Heavy_Recycle_01">VE_Heavy_Recycle_01</abbr> | 15    | 1.40  | 0.7         |
| 4    | <abbr title="AM_Combat_VT_Windup_4">VT_Windup_4</abbr> | 0.1   | 1.0   | <abbr title="AM_Combat_VT_Light_5">VT_Light_5</abbr> | 7     | 0.70       | 1.01  | <abbr title="AM_VE_Combat_Heavy_Recycle_02">VE_Heavy_Recycle_02</abbr> | 15    | 1.40  | 0.7         |

- Only clan using "Recycle" naming on heavy montages (`VE_Heavy_Recycle_01/02`)
- Step 3 uses `VE_Light_3` (different prefix from `VT_Light_3` on step 1)

---

## Kicks (All Clans)

Kicks are clan-agnostic — same ability data applies to all clans. Source: `WrestlerCommon/Abilities/Player/Melee/ContextAttacks/`

All directional kicks require `ActivationRequiredTags: Combat.Ability.Evade` — they are **evade-linked** and can only fire while Phyre is in a dodge. Direction (front/back/side) is determined by which dodge is active when the attack input is pressed.

| Kick      | Trigger           | Montage                                                                         | Anim Len | Dmg                    | Bonus Dmg                         | Trace Range | Trace Radius | LungeRange | LungeDelay | ComboDelay | Knockback        | HitReact | vs. Block                 | Reuse CD |
| --------- | ----------------- | ------------------------------------------------------------------------------- | -------- | ---------------------- | --------------------------------- | ----------- | ------------ | ---------- | ---------- | ---------- | ---------------- | -------- | ------------------------- | -------- |
| Front     | Dodge forward     | <abbr title="AM_Player_Combat_Kick_Front">Kick_Front</abbr>                     | 1.17s    | 5                      | +5 vs `Stunned` → 10              | 180         | 35           | 330 / 400  | 0.25s      | 0.50s      | H: 300           | Stumble  | **Connects, flinch only** | 0.3s     |
| Back      | Dodge backward    | <abbr title="AM_Player_Combat_Kick_Back">Kick_Back</abbr>                       | 1.83s    | 7                      | +1.5 _(unconditional — see note)_ | 250         | 35           | 300 / 400  | 0.40s      | 1.00s      | H: 800           | —        | Likely bypasses           | 0.3s     |
| Side      | Dodge left/right  | <abbr title="AM_Player_Combat_Kick_Right (mirrored for left)">Kick_Right</abbr> | 1.20s    | 7                      | +4 vs `TkPull` → 11               | 270         | **60**       | 200 / 200  | —          | 0.80s      | H: 800           | Stumble  | Likely bypasses           | 0.3s     |
| Sliding   | Sprint + attack   | <abbr title="AM_Player_Combat_Kick_Sliding">Kick_Sliding</abbr>                 | 1.50s    | 15                     | —                                 | 300         | 40           | 300 / 400  | 0.34s      | 1.00s      | H: 1400, V: +400 | Stumble  | Likely bypasses           | 0.3s     |
| Drop Kick | Airborne + attack | <abbr title="AM_Player_Combat_DropKick">DropKick</abbr>                         | 1.50s    | **15–70** _(see note)_ | —                                 | 200         | 35           | 300 / 400  | 0.34s      | 1.00s      | H: 2000, V: −200 | Stumble  | Likely bypasses           | **6.0s** |

**Kick timing / cooldown mechanics:**

- **Reuse CD** (`GE_Cooldown_kick_*`) is a **player-side** tag applied to Phyre. It adds `Combat.Ability.Cooldown.Kick.F/B/S` to her tag container, which is listed in the kick's `ActivationBlockedTags` — blocking the same kick from firing twice on one dodge. The 0.3s directional cooldown is effectively a double-fire guard, since kicks are already gated to the dodge window.
- **`GE_KickBlocker`** (0.5s, separate from the table) is applied to the **target** and grants `AbilityEvent.KickBlocker` — this is a per-enemy hit-prevention window preventing the enemy from being kicked again immediately after landing one.
- **`GE_KickBuffer`** (0.2s) is applied to the **target** and grants `Combat.General.KickBuffer` — likely a brief window around the kick's hit frame for timing purposes.
- **Drop kick's 6.0s** (`GE_DropKickCooldown`) grants `Combat.Ability.Cooldown.Dropkick` to Phyre — but has `RemovalTagRequirements: RequireTags: Movement.Mode.Walking`, meaning it **expires the moment she lands**. The 6s is a maximum cap (e.g. if she never lands), not a flat reuse timer. In practice you can chain drop kicks as fast as you can jump again.

**Block behavior:**

- **Front kick**: `FlinchOnlyTags` includes `Combat.Ability.Melee.Block` — the kick **connects** against blocking enemies but only produces a flinch reaction (not a stumble). Damage application depends on the damage GE (Blueprint graph, not in CDO).
- **Side, Back, Sliding, Drop kick**: `Combat.Ability.Melee.Block` is **not** in `FlinchOnlyTags`. Combined with `Damage Should Execute: true` on sliding/drop kick (same mechanism as heavy punch, which is confirmed to bypass block), all four likely bypass block entirely. Cannot be definitively confirmed from exports as the damage GE is referenced in the Blueprint graph.
- **Reference**: light punch (`GE_PunchDamage`) has `Combat.Ability.Response.Block.Active` in `IgnoreTags` → blocked. Heavy punch (`GE_PunchDamageHeavy`) omits it → bypasses block. This is the confirmed pattern; kicks follow the same logic.

**Drop kick damage — velocity scaling:**
The GA CDO exposes three damage values: `Hit Damage: 25.0`, `Base damage: 15.0`, `Bonus Damage: 55.0`. `Hit Damage` is the standard trace-hit field; `Base damage` + `Bonus Damage` are Blueprint variables likely used for a velocity-scaled formula: `damage = 15 + (velocity_factor × 55)`, giving a range of **15–70** depending on fall speed. Exact formula is not readable from exports.

**Post-hit movement slowdowns (on target):**

- **`GE_KickSlowdown`**: WalkSpeed ×0.2, duration SetByCaller (varies by kick). Removed if target has `Combat.Ability.Skill.SplitSecond`. Applied by directional kicks (front/back/side).
- **`GE_SlideKickSlowdown`**: 0.8s, WalkSpeed ×0.0 — **full movement stop**. Removed if `SplitSecond`. Applied by sliding kick only.

**Other notes:**

- Damage **is not uniform** — front kick is weakest (5), drop kick is strongest (25)
- **Front kick** doubles its damage vs Stunned enemies (`Combat.Status.Stunned`)
- **Side kick** has a bonus vs TK-pulled enemies (`Combat.Status.Hitreact.TkPull`) — synergy with Telekinesis abilities; also has a wider trace radius (60 vs standard 35)
- **Back kick** applies `GE_BackKickenemyaffect` — a 5s multiplicative stat debuff on the target (exact attribute not decompilable from bytecode); `SpecialDamageBonus: 1.5` has no condition tag, likely always applies
- **Side kick** `LungeRangeTargeted` = 200 (matches base `LungeRange`) — no extended snap-to-target assist, unlike all other kicks
- **Sliding kick** launches the enemy upward (V: +400); **drop kick** pins the enemy downward (V: −200)
- Side kick uses `AM_Player_Combat_Kick_Right` for both directions — the engine mirrors it for left input; `AM_Player_Combat_Kick_Left` exists in the exports but is not referenced by the GA

---

## Shunt (All Clans)

Source: `WrestlerCommon/Abilities/Player/Melee/ContextAttacks/GA_PlayerAttack_Shunt`

Shunt is a clan-agnostic melee counter — no `ActivationRequiredTags`, so it fires freely (not evade-locked like kicks).

| Property           | Value                                                                      |
| ------------------ | -------------------------------------------------------------------------- |
| Montage            | <abbr title="AM_Player_combat_shunt">AM_Player_combat_shunt</abbr> (0.95s) |
| Hit Damage         | 2.0                                                                        |
| Special Bonus      | ×1.4 vs enemies with `AttackArmor` / `Melee.Heavy` / `Melee.Light`         |
| Trace / Radius     | — (inherits from base; no override in GA)                                  |
| LungeRange         | 250 / 400 (targeted)                                                       |
| LungeDelay         | 0.1s                                                                       |
| Knockback          | H: 1400, V: 0                                                              |
| HitReact           | Stumble                                                                    |
| Multi Hit          | true                                                                       |
| Cooldown           | none (`CooldownGameplayEffectClass: null`)                                 |
| AbilityTags        | `Combat.Ability.Melee.Shunt`                                               |
| ActivationRequired | —                                                                          |
| ActivationBlocked  | `Combat.Ability.Skill.Telekinesis`, `Combat.Blocked`                       |
| LegeslipDuration   | 0.7s                                                                       |
| Environment Damage | 3.0                                                                        |

**Notes:**

- `SpecialDamageTags` (`AttackArmor`, `Melee.Heavy`, `Melee.Light`) — the ×1.4 bonus applies when the target is currently in an attack state; rewards intercepting mid-swing
- `FlinchOnlyTags`: `Combat.General.HeavyWeight`, `Combat.Status.AttackArmor` — heavy/armored enemies only flinch on shunt hit, they do not stumble
- `SpecialHitFilter`: `HitReact.Countered`, `Status.Disarmable`, `Ability.Ranged.Reload` — shunt's disarm/interrupt special behavior only triggers against enemies with one of these tags. All three are **natural AI states**, not player-injectable:
  - `HitReact.Countered` — set by `GA_EnemyReact_Hit_Counter` while a counter-capable enemy (e.g. Flusher) is mid-counter animation
  - `Ranged.Reload` — set by `GA_ReloadAmmo` while a ranged enemy is actively reloading
  - `Disarmable` — set during: Arms of Ahriman (Lasombra), Entrancing Kiss (Toreador), Glimpse of Oblivion (Lasombra), Beckon (Ventrue), Cloud Memory (Ventrue), Cauldron of Blood (Tremere), and **`GA_EnemyReact_WallSlam`** — any enemy mid-wallslam reaction is also disarmable, no clan ability required
- `GC_ShuntImpact` is the gameplay cue applied on hit
- `LegeslipDuration: 0.7s` — a post-hit follow-up dodge/footwork window (exact mechanic tied to Legeslip passive skill)
- No cooldown at all — can be used on consecutive frames if the ability completes; the only limit is `Combat.Blocked` blocking it

---

## Dash (All Clans)

Source: `WrestlerCommon/Abilities/Player/Movement/Dash/Updated/GA_PlayerDash_Updated`

The current evade is `GA_PlayerDash_Updated`. Two legacy variants exist: `GA_PlayerDash_S` (old ground dash, 0.3s cooldown) and `GA_PlayerDash_Omni` (prototype, tag `Combat.Ability.Evade.Omni` — does **not** enable kicks).

### Regular Dash

| Property               | Value                                                                               |
| ---------------------- | ----------------------------------------------------------------------------------- |
| AbilityTags            | `Combat.Ability.Evade`                                                              |
| ActivationOwnedTags    | `Combat.Ability.Evade` (active during dash → enables kicks)                         |
| Cooldown               | **0.9s** (`GE_PlayerDash_Updated_cooldown`, grants `Combat.Ability.Evade.Cooldown`) |
| Dash duration          | **0.2s** (movement phase, from `DA_PlayerDashConfig`)                               |
| Dash strength          | 2400.0 (config)                                                                     |
| Iframes                | `Combat.Status.DamageImmune` applied during dash                                    |
| DashAbuseDelay         | 0.6s — spam penalty timer                                                           |
| 3-dash penalty         | `GE_LockDash` 0.5s applied on 3rd consecutive rapid dash                            |
| CancelAbilitiesWithTag | `Combat.Ability.Melee`, `Combat.Ability.Evade`, `Movement.Glide`                    |

**Air dash:** additionally applies `GE_PlayerAirDashCooldown` (Infinite duration) on use — removed on landing. One air dash per jump.

**Montages:**

| Direction | Montage                                                | Anim Len |
| --------- | ------------------------------------------------------ | -------- |
| Forward   | <abbr title="AM_PlayerDash_Updated_F">Updated_F</abbr> | 1.28s    |
| Backward  | <abbr title="AM_PlayerDash_Updated_B">Updated_B</abbr> | 1.28s    |
| Left      | <abbr title="AM_PlayerDash_Updated_L">Updated_L</abbr> | 0.77s    |
| Right     | <abbr title="AM_PlayerDash_Updated_R">Updated_R</abbr> | 0.77s    |

Dash movement is 0.2s; the remaining anim time is a recovery roll. F/B rolls are longer (~1.28s) than L/R side-steps (~0.77s).

**`GE_MidDash_Notify` (0.5s):** applied mid-dash; this is the window during which kick inputs are recognised — the `ActivationOwnedTags: Combat.Ability.Evade` is active for the full tag duration, but this notify controls the kick acceptance window.

### Combo Dashes

| Variant | GA                   | Dash Force | Cooldown                            | Anim Len                                                      | Notes                                              |
| ------- | -------------------- | ---------- | ----------------------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| Short   | `GA_ComboDash_Short` | 700.0      | 0.65s (`GE_ComboDash_Cooldown`)     | <abbr title="AM_combodash_short">combodash_short</abbr> 0.40s | `Counter Duration: 0.35s`, `DashJumpBoost: 1250.0` |
| Long    | `GA_ComboDash_long`  | 900.0      | 1.0s (`GE_ComboDash_long_Cooldown`) | Uses F/B/L/R montages                                         | No `Counter Duration` property                     |

Both combo dashes:

- Use `AbilityTags: Combat.Ability.Evade` → kicks can fire off them
- `CancelAbilitiesWithTag`: Melee, Evade, Glide, `Combat.Ability.Skill.Telekinesis.PickUp`

---

## Cross-Clan Notes

### Shared Montage Borrowing

- **Lasombra** uses Ventrue windups entirely
- **Toreador** uses Banu light montages for steps 3–5 and Banu heavy for step 5
- **Banu and Toreador** share the same step-5 finisher (`BA_Light_5`, `BA_Heavy_1`)

### Windup & Heavy Threshold

Press and hold attack → windup montage starts. On release (or at `MaxWU` auto-fire):

```
normalised = holdTime / MaxWU   (clamped 0–1)

normalised >= HeavyThresh  →  heavy fires
normalised <  HeavyThresh  →  light fires
```

- `MinWU` = minimum hold before release has any effect — releasing earlier does nothing
- `MaxWU` = hard cap; ability auto-fires at this point regardless
- The windup montage is **purely visual** — `MaxWU` is the real timing authority; the montage is almost always longer and gets cut when the attack fires
- Light and heavy are **mutually exclusive on any given step** — there is no "fire a light then keep charging into a heavy"
- `ThresholdBias` (0.2 on most Banu/Toreador steps) likely nudges the effective threshold or adds input leniency; exact formula not decompilable from bytecode

**Windup montage length vs MaxWU** (how much of the animation you ever see at max hold):

| Clan     | Windup SequenceLength | MaxWU    | % seen at max hold |
| -------- | --------------------- | -------- | ------------------ |
| Brujah   | 0.89s                 | 1.0s     | ~89%               |
| Banu     | 1.30s                 | 1.0–1.1s | ~77–85%            |
| Ventrue  | 2.18–2.80s            | 1.0s     | ~36–46%            |
| Tremere  | 2.33–2.60s            | 0.8s     | ~31–34%            |
| Toreador | 3.47s                 | 1.0–1.1s | ~29–32%            |

### Combo Timing

The ability (`GA_PlayerAttack_base`) runs `AbilityTask_PlayMontageAndWait` and a `ComboDelay` timer concurrently. When the timer fires the ability accepts the next input; pressing attack at that point interrupts (blends out) the current montage early. The montage's full `SequenceLength` (`L.Len`/`H.Len`) is only ever seen if you let the combo lapse.

| Observation                           | Detail                                                                    |
| ------------------------------------- | ------------------------------------------------------------------------- |
| Mid-chain lights                      | Cut at 17–40% of their full length — you see a fraction of the animation  |
| Finisher lights                       | Cut at 70–80% of length — noticeably longer commit before next step opens |
| Brujah `Light4` extreme               | 2.29s montage, 0.70s window — only 31% plays in a flowing combo           |
| Lasombra heavy almost fully plays     | `LA_Heavy_Right` = 0.73s, window = 0.70s — only 0.03s gets clipped        |
| Brujah heavies barely clipped         | 0.80s montage, 0.70s window — 87% of the animation plays                  |
| Banu/Toreador heavies heavily clipped | 1.53s montage, 0.70s window — only 46% plays if you chain off a heavy     |

### Damage Summary

| Clan     | Light Range | Heavy | Max Heavy       |
| -------- | ----------- | ----- | --------------- |
| Banu     | 5–10        | 15    | **18** (step 5) |
| Brujah   | 8           | 15    | 15              |
| Tremere  | 8           | 12    | 12              |
| Lasombra | 8           | 15    | 15              |
| Toreador | 5–7         | 12–15 | **18** (step 5) |
| Ventrue  | 7–8         | 15    | 15              |

### DPS Analysis

**Model:** Each step in a flowing combo costs `MinWU + ComboDelay` seconds (minimum hold + wait before next input). For a heavy, hold time = `HeavyThresh × MaxWU` instead of `MinWU`. DPS rate is identical for any number of repeated sequences — there is no ramp-up.

**Marginal heavy test:** For each step, `(H.Dmg − L.Dmg) / (heavy_time − light_time)` must exceed the sequence's all-light DPS to be worth using. If it doesn't, the extra charge time loses more than it gains.

**All-light baseline:**

| Clan     | Total Dmg | Total Time | All-Light DPS |
| -------- | --------- | ---------- | ------------- |
| Brujah   | 32        | 2.10s      | 15.24         |
| Lasombra | 32        | 2.10s      | 15.24         |
| Toreador | 29        | 2.05s      | 14.15         |
| Tremere  | 32        | 2.25s      | 14.22         |
| Banu     | 33        | 2.66s      | 12.41         |
| Ventrue  | 29        | 2.10s      | 13.81         |

**Optimal pattern per clan:**

| Clan         | Optimal Pattern   | Dmg | Time   | **Optimal DPS** | Notes                                                                                      |
| ------------ | ----------------- | --- | ------ | --------------- | ------------------------------------------------------------------------------------------ |
| **Toreador** | L, L, L, L, **H** | 40  | 2.445s | **16.36**       | Step-5 heavy: only 0.495s hold for 18 dmg — best marginal in game (27.9 dps marginal)      |
| **Brujah**   | L, L, L, L        | 32  | 2.10s  | **15.24**       | No heavy earns its charge time; all marginals ≤ 14.0 dps                                   |
| **Lasombra** | L, L, L, L        | 32  | 2.10s  | **15.24**       | Identical structure to Brujah                                                              |
| **Tremere**  | L, L, L, L        | 32  | 2.25s  | **14.22**       | Heavies are actively bad — 12 dmg in 0.86s vs 8 dmg in 0.45–0.50s                          |
| **Banu**     | **H, H, H, H**, L | 70  | 4.96s  | **14.11**       | Steps 1–4 heavy marginals all ~14–18 dps (above baseline); step-5 heavy marginal only 10.1 |
| **Ventrue**  | **H**, L, L, L    | 36  | 2.60s  | **13.85**       | Step-1 marginal = 14.0 dps, just clears; negligible gain over all-lights (13.81)           |

**Single-sequence burst damage (time irrelevant — e.g. vs a staggered enemy):**

| Rank | Clan                        | Pattern | Total Dmg |
| ---- | --------------------------- | ------- | --------- |
| 1    | **Banu**                    | All H   | **78**    |
| 2    | Toreador                    | All H   | 72        |
| 3    | Brujah / Lasombra / Ventrue | All H   | 60        |
| 6    | Tremere                     | All H   | 48        |

**Key findings:**

- **Toreador wins sustained DPS** despite lowest per-hit light damage — extremely low MinWU (0.03–0.06s) makes steps 1–4 the fastest in the game, and step-5's HeavyThresh of 0.45 means only 0.495s hold for 18 damage
- **Banu and Toreador have opposite optimal strategies**: Banu should use heavies everywhere _except_ the finisher (step-5 heavy marginal is too slow); Toreador should use lights everywhere _except_ the finisher (step-5 heavy is the most time-efficient hit in the game)
- **Tremere heavies are a trap** — 12 damage in 0.86s is strictly worse than two lights (16 damage in ~0.90s)
- **Brujah/Lasombra** have the simplest optimal play: spam lights, the uniform 8-damage hits at 0.40s each can't be beaten by any heavy
- Banu has the highest single-sequence **burst damage** ceiling (78 all-heavy), useful when an enemy is stunned or staggered and DPS rate doesn't matter

### Attack Range & Lunge (from `GA_PlayerAttack_Light` / `GA_PlayerAttack_Light_NoLunge`)

| Property              | Lunging Clans (all except Tremere) | Tremere (NoLunge)               |
| --------------------- | ---------------------------------- | ------------------------------- |
| `Trace Range`         | **170.0** (~1.7m)                  | **400.0** (~4m)                 |
| `Trace Radius`        | 35.0 (~35cm sphere)                | 35.0 (inherited)                |
| `LungeRangeTargeted`  | **450.0** (~4.5m snap-to-target)   | **30.0** (effectively disabled) |
| `LungeAssistStrength` | 200.0                              | —                               |
| `Bounceback Distance` | **10.0**                           | **30.0**                        |

- Tremere's hit trace is **more than twice as long** as lunging clans, compensating for the lack of dash
- Lunging clans close up to 4.5m toward the target before the trace fires — this is why Tremere _feels_ shorter-ranged despite the longer trace
- Tremere pushes the target back further on each hit (30 vs 10 units)

### NoLunge

Only **Tremere** uses `Combat.Ability.Melee.Light.NoLunge`. All others use `Combat.Ability.Melee.Light.Lunging`.

### Combat Idle / Block / Shield

| Clan     | Combat Idle              | Block Montage            | Shield Idle                        |
| -------- | ------------------------ | ------------------------ | ---------------------------------- |
| Banu     | Anim_CombatIdle_Banu     | AM_Player_Block_Banu     | —                                  |
| Brujah   | _(not set in asset)_     | AM_Player_Block_brujah   | —                                  |
| Tremere  | Tremere_Combat_Idle      | AM_Player_Block_Tremere  | —                                  |
| Lasombra | Anim_Lasombra_combatIdle | AM_Player_Block_Lasombra | —                                  |
| Toreador | Combat_Idle_Toreador     | AM_Player_Block_Toreador | —                                  |
| Ventrue  | Anim_Ventrue_Combat_Idle | AM_Player_Block_ventrue  | **Anim_Ventrue_Combat_Idle_Guard** |

Ventrue is the only clan with a dedicated `Shield` idle animation (guard stance). Note that the `AM_Player_Block_*` montages are **reaction animations** (player HitReact slot), not a held-guard pose — there is no dedicated block input in the game.

---

## Parry / Counter System

### Mechanism

There is **no dedicated block button**. Counters are triggered entirely by **dashing into an incoming enemy attack**. Two GAs handle the counter response:

1. **`GA_Player_CounterSwipe`** — the counter window ability; activated when a dash intercepts an incoming hit
2. **`GA_Player_CounterHit`** — auto-triggered follow-up attack when the counter lands

**Event flow:**

1. Phyre dashes into an incoming enemy attack during the dash's active counter window
2. `GA_Player_CounterSwipe` activates → tags include `Combat.Montage.CounterOpen` (counter window now live); the 0.5s Buffer Delay is the post-dash warm-up, then the **0.32s** active window opens
3. Enemy hit lands during the active window → hit processing sends `Combat.Ability.Response.Counter` event to Phyre
4. `GA_Player_CounterHit` fires on Phyre (triggered by that GameplayEvent, ComboDelay 0.05s — near-instant)
5. Attacker receives HitResponseTag `Combat.Status.HitReact.Stagger` + `GE_Player_CounterHit` (StunFragility ×2.5)

> **Combo dash also has a counter window:** `GA_ComboDash_Short` exposes `Counter Duration: 0.35s` separately from the regular dash — the short combo dash has a slightly longer counter window than the regular parry (0.35s vs 0.32s).

### Timing

| Property                                      | Value     | Notes                                                                       |
| --------------------------------------------- | --------- | --------------------------------------------------------------------------- |
| **Active parry window**                       | **0.32s** | `Counter Duration` in CDO — the only window where an incoming hit is caught |
| Buffer Delay (post-dash warm-up)              | 0.5s      | Delay after dash intercept before counter window opens                      |
| Combo Delay (post-sequence cool-down)         | 0.8s      | Time before another ability can chain                                       |
| Follow-up ComboDelay (`GA_Player_CounterHit`) | 0.05s     | Near-instant counter strike                                                 |

### Animations

| Montage                         | Length    | Slot            | Notes                                                                                                                                        |
| ------------------------------- | --------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `AM_Combat_Parry_Short`         | **0.83s** | CombatUpperBody | Main parry animation; plays at 1.0× speed; audio bark `Narrative.Prompts.Player.Combat.Parry`; camera shake `BP_Shake_Swipe_C`               |
| `AM_Combat_Parry_Hit`           | **0.53s** | CombatUpperBody | Successful-parry reaction (starts at 0.30s into raw 0.83s sequence); VFX `NS_Player_Hit_Parry` at CameraSocket, scale 0.4, offset (50, 0, 0) |
| `AM_counterswing`               | **0.67s** | CombatUpperBody | Counter attack follow-up; uses `Combat_Parry_Short` at 0.5× speed (0–0.17s) then 0.15× (0.17–0.34s); WepLower curve fires at 0.05s           |
| `AM_Player_Counter_Dash_Attack` | **0.36s** | CombatUpperBody | Counter dash-forward attack; uses `Anim_Player_ZL_Combat_Dash_Forward_Attack01`                                                              |

> **Note on AM_counterswing path:** file lives under `Movement/Dash/Updated/` despite being a melee counter — this appears to be a legacy placement.

**Grab-counter assets (no player GA references them):**

`AM_Player_Grab_Counter_01` (2.0s, CombatFullBody) and `Anim_Player_ArmCatch_Counter` (3.13s, root motion) exist in `Combat/Counter/Animation/` but no player GA CDO references either. They are either:

- **Cut content** — assets were built but the ability was never shipped
- **Enemy-side triggered** — an enemy grab GA could fire a GameplayEvent to the player, with the player character Blueprint (not a GA) responding by playing the montage. This is not readable from CDO exports.

There is no player-activatable grab counter via the dash system. Grab counters, if functional at all, would be scripted escape animations tied to specific enemy grab attacks.

### GE Applied on Successful Counter

**`GE_Player_CounterHit`** — `HasDuration` **2.0s**:

| Modifier               | Value                                                                                               |
| ---------------------- | --------------------------------------------------------------------------------------------------- |
| `StunFragility`        | **×2.5 Multiplicative** — target takes 2.5× stun damage for the duration                            |
| GameplayCue            | `GameplayCue.Source.Combat.Counter`                                                                 |
| OngoingTagRequirements | `RequireTags: Combat.Status.HitReact.Countered` — GE is removed if target loses the Countered state |

### VFX

| Asset                  | Used By                      | Notes                                                                                       |
| ---------------------- | ---------------------------- | ------------------------------------------------------------------------------------------- |
| `NS_Player_Hit_Parry`  | `AM_Combat_Parry_Hit` notify | Directional burst at CameraSocket on successful parry                                       |
| `NS_Player_CounterHit` | `GC_Player_CounterHit`       | Attached to owner (`bAutoAttachToOwner: true`), cue tag `GameplayCue.Source.Combat.Counter` |

### Related Utility GEs

| GE                        | Duration | Effect                                | Notes                                                          |
| ------------------------- | -------- | ------------------------------------- | -------------------------------------------------------------- |
| `GE_KickBlocker`          | **0.5s** | Grants `AbilityEvent.KickBlocker` tag | Applied during kick context; mechanism for kick counter window |
| `GE_sprintStumbleBlocker` | **3.0s** | `Combat.Status.SprintBlocked`         | Applied post-hit; removed early by SplitSecond                 |
