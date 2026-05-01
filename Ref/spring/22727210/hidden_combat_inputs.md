# Hidden / Codex-Implied Combat Inputs (VTMB2)

## Riser ("Mysterious Attack" codex page)

- **Input**: Forward → Crouch → Forward → Light Attack (Shoryuken / DP motion)
- **Codex flag (Hera)**: `Combat_MysteriousAttack`
- **CodexItem nameID**: `Tutorials_AdvancedCombat.AdvMysteriousAttack`
- **Pickup BP**: `Content/WrestlerCore/InteractiveProps/Collectables/AdvancedCombatCodex/BP_AdvancedCombatCodex_MA`
- **Page art**: `T_UI_CodexCollectibleMysteriousAttack.png` — arrows converging on a fist = motion-input notation (the picture IS the input)
- **Activation gate** (`GA_Playerattack_riser.json` ~L1636+):
  `HasMatchingGameplayTag(CastInput) AND IsCrouching`
  — must enter crouch state mid-motion, not a stationary held crouch.

### Riser stats (`GA_Playerattack_riser.json` L1817–1841)

| Stat                  | Value                                |
| --------------------- | ------------------------------------ |
| Hit Damage            | 8.0                                  |
| Environment Damage    | 3.0                                  |
| Vertical Knockback    | **700** (Shunt-tier launcher)        |
| Horizontal Knockback  | 50                                   |
| SpecialDamageBonus    | **+30.0**                            |
| LaunchLightweights    | true                                 |
| Damage Should Execute | true (auto-finishes low-HP enemies)  |
| Tag                   | `Combat.Attack.Launcher`             |
| Death Behaviour       | `Combat.Death.Impact.Heavy`          |
| Montage               | `AM_Player_Riser`                    |

### Combat graph wiring

- `Content/WrestlerCommon/Pawns/PlayerCharacter/Prototype/Combat/CG_ChargeCombat.json` L1086 — registers `GA_Playerattack_riser_C` as a charge-combat state named `GA_Playerattack_riser` (sibling to Shunt).

## Sibling context attacks (for comparison)

All in `Content/WrestlerCommon/Abilities/Player/Melee/ContextAttacks/`:

- **Slide Kick** — sprint + crouch + attack (`GA_PlayerAttack_Kick_Sliding`)
- **Drop Kick** — airborne + attack (`GA_PlayerAttack_DropKick`)
- **Riser** — forward, crouch, forward, attack (`GA_Playerattack_riser`)
- **Shunt** — parry/disarm sibling in `CG_ChargeCombat`

## Codex input-icon entry

- `Content/WrestlerCore/UI/InputIconsDataTable.json` L11036 — `"MysteriousAttack"` key uses the generic `T_UI_Keyboard_Special` texture (no specific glyph; the codex page art itself encodes the motion).

## ccc commands relevant to this codex page

- `ccc codex pages` — grants all 22 Adv* pages including `Tutorials_AdvancedCombat.AdvMysteriousAttack` (this is what worked).
- `ccc codex unlock Combat_MysteriousAttack` — now also calls `ShowItem` on derived nameIDs (`AdvMysteriousAttack`, `Tutorials_AdvancedCombat.AdvMysteriousAttack`, etc).
