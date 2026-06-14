# CCC Command Reference

All commands are prefixed with `ccc` in the UE4SS console (`F10`).

Commands marked **EXPERIMENTAL** are research/debug helpers, direct state pokes, or areas whose behavior is still thinly documented. Use them after saving.

## General

| Command | Description |
|---|---|
| `ccc help [category]` | Show help (categories: spawn, tp, blood, target, etc.) |
| `ccc commands [category]` / `ccc list [category]` | Alias for help |
| `ccc version` | Show mod version |
| `ccc versions` | Show all module versions |

## Elixirs & Resources

**Aliases:** `eli`, `res`, `resource`

| Command | Description |
|---|---|
| `ccc elixir <b\|m\|p\|f\|a> [count]` | Grant elixirs (blood/mending/potence/fortitude/all) |
| `ccc elixir flash <blood\|mending\|potence\|fortitude\|all> [count]` | Grant flash-cache elixirs (PI_FlashElixir*) |
| `ccc resonance <san\|mel\|cho\|all> <delta>` | Adjust blood resonance |
| `ccc resonance multiplier [value]` | Set/show resonance gain multiplier |
| `ccc xp <amount>` | Grant experience points |
| `ccc ap <amount>` | Grant ability points |
| `ccc maxhp <value>` | Set maximum health |
| `ccc shield [set\|add\|max\|fill] [value]` | Read or modify player shield |
| `ccc playerdam [amount]` | Damage player or trigger a 0-damage HUD refresh |
| `ccc collectable <delta>` | Adjust collectables count |
| `ccc heal` | Fill health to max |
| `ccc hpup [count]` | Add Phyre Marks (+1.9 max HP each) |
| `ccc hpreset` | Reset max HP to base |
| `ccc hpbar [sub] [value]` | **EXPERIMENTAL** HP bar widget diagnostics |
| `ccc elixircap [value]` | Set/show elixir carrying capacity |
| `ccc elixircap add <delta>` | Add to current elixir carrying capacity |
| `ccc bloodmat [on\|off\|toggle\|blood\|feed\|acid] [ms]` | **EXPERIMENTAL** quick player blood material overlay |

## Clan & Training

| Command | Description |
|---|---|
| `ccc clan <name>` | Switch clan (brujah, tremere, toreador, ventrue, banu, lasombra) |
| `ccc train <menuId>` | Open training menu by ID |

## Blood Pips

**Aliases:** `pip`, `pips`

| Command | Description |
|---|---|
| `ccc blood read` | Read current/max blood pip values |
| `ccc blood set <type> <value>` | Set blood pips (strike/relocate/affect/mastery) |
| `ccc blood add <type> [amount]` | Add to blood pips (default: 1) |
| `ccc blood max` | Fill all blood pips to max |
| `ccc blood info` | Show blood pip status |

## Player Info

| Command | Description |
|---|---|
| `ccc player info` | Print player state and pawn info |
| `ccc player pos` | Print location, rotation, map |
| `ccc player hp [max\|set\|fill] [value]` | Health management |
| `ccc player shield [set\|add\|max\|fill] [value]` | Shield management |
| `ccc player lookat [debug]` | Show what player is targeting |
| `ccc player combat` | Check if player is in combat |
| `ccc player narrative [on\|off\|toggle\|status]` | Set narrative/non-narrative mode |
| `ccc narrative [on\|off\|toggle\|status]` | Alias for player narrative mode |
| `ccc player state` | Comprehensive player state diagnostic |

## Player Gameplay Tags [EXPERIMENTAL]

**Aliases:** `ps`, `pstate`

| Command | Description |
|---|---|
| `ccc playerstate` | Show usage and known state kinds |
| `ccc playerstate list` | List known kinds and backing tag fields |
| `ccc playerstate status` | Show every known kind |
| `ccc playerstate <kind> on\|off\|toggle\|status` | Add/remove/read a loose gameplay tag |

Known kind today: `combat`.

## Movement Cheats

| Command | Description |
|---|---|
| `ccc fly [on\|off\|status]` | Toggle flying mode |
| `ccc gravity [on\|off\|value\|status]` | Set gravity scale (0=off, 1=normal) |
| `ccc noclip [on\|off]` | Noclip mode (fly + no collision). Alias: `ghost` |
| `ccc speed <type> [value\|reset\|status]` | Speed control (walk, sprint, crouch, all) |
| `ccc animspeed [value\|reset\|status]` | Animation speed multiplier. Aliases: `animationspeed`, `attackspeed` |
| `ccc slowwalk [on\|off\|toggle\|status]` | Walk at crouch speed. Aliases: `walk`, `creep` |
| `ccc prowl [on\|off\|status]` | **EXPERIMENTAL** auto-mute footstep noise only during Prowl |

## Target

**Aliases:** `tgt`

### Identification

| Command | Description |
|---|---|
| `ccc target` | Identify what you're looking at |
| `ccc target me` | Target yourself (Phyre) |
| `ccc target npc` | Target NPC under crosshair |
| `ccc target info` | Re-inspect stored target |
| `ccc target tags` | Dump all gameplay tags/abilities/effects |
| `ccc target scan` | Show all targeting sources at once |
| `ccc target find <class>` | Find actor by class name |
| `ccc target mesh` | Identify nearest mesh at crosshair |
| `ccc target mesh <pattern> [index]` | Find mesh actor by asset name |
| `ccc target nearby [radius] [index]` | List/pick nearby mesh actors |
| `ccc target audio [pattern]` | Find audio/sound actors near player |
| `ccc target interact add [range] [text]` | **EXPERIMENTAL** add reticle interaction to target |
| `ccc target interact remove` | Remove added interaction component |
| `ccc target glow [blue\|white\|bright]` | **EXPERIMENTAL** add item glow/shimmer to target |
| `ccc target glow off` | Remove native glow from target |
| `ccc target pos` | Show target location |
| `ccc target clear` | Release stored target |
| `ccc target debug` | Acquire with debug output |

### Hide / Cleanup

| Command | Description |
|---|---|
| `ccc target hide` | Hide stored target |
| `ccc target show` | Restore hidden target |
| `ccc target hideall [pattern]` | Hide all meshes matching target's mesh. Alias: `ha` |
| `ccc target cleandecal [pattern\|all\|scan]` | Hide decals near crosshair. Alias: `cd` |
| `ccc target material <name> [duration]` | Apply material overlay. Alias: `mat` |
| `ccc target undo` | Undo last hide/cleandecal/material/move/scale/rotate |
| `ccc target addcleanup` | Add target to persistent haven cleanup list. Alias: `ac` |
| `ccc target addcleanup keep` | Protect target from cleanup list processing |
| `ccc target removecleanup` | Remove target from persistent haven cleanup list. Alias: `rc` |

### Transform (Move / Scale / Rotate)

Move, scale, and rotate the stored target. Transforms can be persisted via `addcleanup`.

**Move** (alias: `mv`)

| Command | Description |
|---|---|
| `ccc target move here` | Teleport target to player position |
| `ccc target move up [n]` | Nudge up (default 10 units). Also: `down`, `u`, `d` |
| `ccc target move forward [n]` | Nudge forward (player-facing). Also: `back`, `left`, `right`, `f`, `b`, `l`, `r` |
| `ccc target move x [n]` | Nudge along world X axis. Also: `y`, `z` |
| `ccc target move <x> <y> <z>` | Teleport to absolute coordinates |
| `ccc target move reset` | Restore original position |

**Scale** (alias: `sz`)

| Command | Description |
|---|---|
| `ccc target scale <factor>` | Uniform scale (2 = double, 0.5 = half) |
| `ccc target scale up [step]` | Increment scale (default +0.1). Also: `down`, `+`, `-` |
| `ccc target scale <x> <y> <z>` | Non-uniform scale |
| `ccc target scale reset` | Restore original scale |

**Rotate** (alias: `rot`)

| Command | Description |
|---|---|
| `ccc target rotate yaw [degrees]` | Rotate yaw (default 15°). Also: `pitch`, `roll`, `y`, `p` |
| `ccc target rotate <pitch> <yaw> <roll>` | Set absolute rotation |
| `ccc target rotate reset` | Restore original rotation |

**Workflow:** `target` → `move`/`scale`/`rotate` → `addcleanup` (persists transform to disk)

### Force / Time Dilation [EXPERIMENTAL]

| Command | Description |
|---|---|
| `ccc target force back [strength] [lift]` | Launch target backward |
| `ccc target force forward\|left\|right [strength] [lift]` | Directional impulse relative to camera |
| `ccc target force up\|down [strength]` | Vertical impulse |
| `ccc target force <x> <y> <z>` | Raw velocity vector |
| `ccc target reload` | Force target weapon reload/refill |
| `ccc target slow [rate]` | Per-target time dilation |
| `ccc target freeze` / `ccc target unfreeze` | Freeze or restore target speed |

### VFX on Target

| Command | Description |
|---|---|
| `ccc target vfx <slot> <name> [scale]` | Spawn VFX at body slot |
| `ccc target vfx bone:<name> <vfx> [scale]` | Spawn VFX at exact bone/socket |
| `ccc target vfx all <name> [scale]` | **EXPERIMENTAL** spawn VFX on every bone |
| `ccc target vfxspawn <name> [durationMs]` | Spawn world VFX at target location |
| `ccc target vfx respawn` | Reapply last target VFX setup |
| `ccc target vfx pos` | Print live target VFX positions |
| `ccc target vfx stop` | Stop all VFX on target |
| `ccc target vfx slots` | Show available body slots |
| `ccc target eyes <name>` | Both eyes (L+R pair) |
| `ccc target hands <name>` | Both hands (L+R pair) |
| `ccc target feet <name>` | Both feet (L+R pair) |
| `ccc target bones [filter]` | List bones/sockets on target |

### Other Target Commands

| Command | Description |
|---|---|
| `ccc target curse` | Apply Blood Curse to target |
| `ccc target purge bloodcurse` | Remove Blood Curse |
| `ccc target resonance [type]` | Get/set blood resonance on NPC target |
| `ccc target feedable [type]` | [EXPERIMENTAL] Make feedable |

## Teleport

**Aliases:** `tp`, `teleport`, `tele`

| Command | Description |
|---|---|
| `ccc tp <x> <y> <z> [pitch yaw roll]` | Teleport to coordinates |
| `ccc tp save <name>` | Save current position |
| `ccc tp load <name>` | Load saved position |
| `ccc tp list` | List saved positions |
| `ccc tp delete <name>` | Delete saved position |
| `ccc tp export` | Export as Lua table |

## Spawn

**Aliases:** `s`

| Command | Description |
|---|---|
| `ccc spawn enemy <type> [count] [distance\|point] [team=<name>] [pitch=<deg>] [yaw=<deg>] [roll=<deg>]` | Spawn enemies at distance or at crosshair point |
| `ccc spawn elixir <type> [distance]` | Spawn elixirs, blood bags |
| `ccc spawn elixir all [distance]` | Spawn all elixirs in a row |
| `ccc spawn elixir bloodbags [distance]` | Spawn all 9 blood bags |
| `ccc spawn weapon <type> [ammo]` | Spawn weapon pickup |
| `ccc spawn weapon all` | Spawn all weapons in a row |
| `ccc spawn explosive <type>` | Spawn explosive/grenade pickup |
| `ccc spawn explosive boom [type] [color] [size] [safe]` | Spawn a real explosion |
| `ccc spawn npc <type> [distance]` | Spawn NPC (includes `fabien`) |
| `ccc spawn mesh <type> [distance\|look] [scale]` | Spawn decoration-only static/skeletal mesh |
| `ccc spawn mesh bennygun` | Spawn Benny's pistol / Smart Benny gun mesh |
| `ccc spawn mesh bennygunstatic` | Spawn Benny's pistol static mesh |
| `ccc spawn mesh bennyflare` | Spawn the DLC flare gun prop |
| `ccc spawn mesh ysrapier look` | Spawn Ysabella's rapier mesh at crosshair |
| `ccc spawn tk <item> [ammo] [manual]` | Spawn into TK hold |
| `ccc spawn types [enemy\|item\|weapon\|npc\|mesh]` | List all spawnable types |
| `ccc spawn pos [distance]` | Show spawn position (debug) |

## Shockwave

**Aliases:** `sw`, `boop`

| Command | Description |
|---|---|
| `ccc shockwave [position] [type] [flags] [knob=val]` | Force-pulse explosion — zero dmg, enemies only, player-safe by default |
| `ccc shockwave stumble [radius] [feet\|aim]` | Invisible stumble pulse (no LaunchCharacter) |
| `ccc shockwave stumbleacid [radius] [feet\|aim] [vfx=<burst\|pool\|smoke\|giblet\|ash>] [scale=<n>]` | Same + per-enemy attached acid VFX (silent); defaults: `vfx=burst`, preset scale |
| `ccc shockwave probe [type]` | Dump explosion BP default property values |

**Position:** `feet\|me` (default) \| `aim\|crosshair\|look` \| `<x> <y> <z>`
**Types:** `frag` (default) \| `burn` \| `flash` \| `moab` \| `blood` \| `delay`
**Flags:** `safe`/`unsafe` · `nohit`/`hit` · `invis`/`visible`
**Knobs:** `force=` `radius=` `edmg=` `eforce=` `pdmg=` `pforce=` `size=`

```
ccc shockwave                         # feet, zero-dmg, frag VFX
ccc shockwave aim                     # at crosshair
ccc shockwave aim invis force=4000    # silent strong push
ccc shockwave aim hit edmg=50         # 50 dmg + force
ccc shockwave burn aim unsafe         # burning at crosshair, hits player
ccc shockwave stumble 800 aim         # stumble enemies near crosshair
```

## Encounter [EXPERIMENTAL]

**Aliases:** `enc`

| Command | Description |
|---|---|
| `ccc encounter points` | List the saved encounter position table |
| `ccc encounter markers [duration_ms]` | Spawn long-lasting `horrific_eyes` markers at all saved points |
| `ccc encounter spawners [radius] [duration_ms]` | Spawn `possession_eyes` at spawners near saved points |
| `ccc encounter clear` | Clear active encounter marker/highlight components |

## Telekinesis

**Aliases:** `tk`

### Info & Control

| Command | Description |
|---|---|
| `ccc tk info` | Detailed info about held object |
| `ccc tk info weapon` | Focused weapon/throwable field snapshot |
| `ccc tk held` | Check if holding something |
| `ccc tk ammo` | Show ammo for held weapon |
| `ccc tk drop` | Force drop held object |
| `ccc tk despawn` | Destroy held object |
| `ccc tk despawn hard` | Remove without death events |
| `ccc tk shadow_put` | Despawn held object with shadow VFX |

### Ammo & Damage

| Command | Description |
|---|---|
| `ccc tk blood_load` | Blood magic: +4 ammo with VFX |
| `ccc tk ammo set <num>` | Set held weapon ammo count |
| `ccc tk reload` | Refill weapon to max ammo |
| `ccc tk infinite` | Toggle infinite ammo |
| `ccc tk damage <value>` | Set projectile damage |
| `ccc tk throwdamage <value>` | Set throw damage |
| `ccc tk itemdamage [explode]` | Damage held object or detonate explosives |

### Effects & Overrides

| Command | Description |
|---|---|
| `ccc tk effect <name>` | Spawn VFX on held object |
| `ccc tk material <name>` | Apply overlay (blood, shadow) |
| `ccc tk material solid <name>` | Replace held mesh material slots directly |
| `ccc tk resist` | Override TK stun resistance on target |
| `ccc tk resist all` | Override TK resistance on all enemies |
| `ccc tk speed [fast\|instant\|off]` | TK pull speed override |
| `ccc tk stun [on\|off]` | Disable stun threshold on enemies |
| `ccc tk npcexecute [on\|off]` | Auto-kill staggered NPCs on TK pull |
| `ccc tk moopsy [on\|off\|velocity]` | Ragdoll NPCs on TK grab |
| `ccc tk launch [on\|off\|velocity]` | Launch NPCs upward on hit |
| `ccc tk react [on\|off\|type]` | Play reaction anim on TK grab |
| `ccc tk potionswitch [type]` | Swap held elixir type |

## Visual Effects (VFX) [EXPERIMENTAL]

**Aliases:** `effect`, `fx`, `visual`, `vfx`

### World Spawn

| Command | Description |
|---|---|
| `ccc effect <name> [ms]` | Spawn VFX at player position |
| `ccc effect <name> front [dist] [ms]` | Spawn VFX in front of player |
| `ccc effect <name> at X Y Z [ms]` | Spawn VFX at world coordinates |
| `ccc vfx spawn <name> front [dist]` | Spawn in front (default 300u) |
| `ccc vfx heart [front <dist>\|at X Y Z] [ms] [scale <n>]` | Floating BloodCurse heart |
| `ccc vfx select [latest\|index\|list]` | Select a world-spawned VFX instance |
| `ccc vfx move <dir\|x y z> [amount]` | Move selected world VFX |
| `ccc vfx pos` | Print selected VFX coordinates |
| `ccc vfx replay [ms]` | Replay selected VFX at current position |

### Attached to Player

| Command | Description |
|---|---|
| `ccc vfx eyes <name>` | Attach to head/eye sockets |
| `ccc vfx hands <name>` | Attach to hand sockets |
| `ccc vfx body <name>` | Attach to body/mesh root |
| `ccc vfx screen <name> [alpha]` | Camera-attached screen FX |
| `ccc vfx stop [eyes\|hands\|body\|screen\|all]` | Stop player-attached VFX |

### Beam VFX

| Command | Description |
|---|---|
| `ccc vfx beam [ms] [key]` | Beam: target → player |
| `ccc vfx beam front [dist] [ms] [key]` | Beam ahead of player |
| `ccc vfx beam test [ms] [key]` | Short test beam (500u) |
| `ccc vfx trail [ms] [key]` | Trail VFX from crosshair/target to player |

### VFX Lists

| Command | Description |
|---|---|
| `ccc vfx list [filter]` | List all spawn VFX (filterable) |
| `ccc vfx list attached` | List socket VFX |
| `ccc vfx list eyes\|hands\|materials` | List specific categories |
| `ccc vfx active [filter]` | List live VFX and spawn history |
| `ccc vfx audit [filter]` | Show registry VFX with active world instances |
| `ccc vfx warm <load\|create\|activate\|use\|hide\|destroy\|status>` | Component reuse warm-test system |

### Material Overlays

| Command | Description |
|---|---|
| `ccc material <name> [ms]` | Apply material to player |
| `ccc material clear` | Remove overlay |
| `ccc vfx shield <bloodball\|blood\|acid> [on\|off\|toggle]` | **EXPERIMENTAL** player shield VFX/material toggles |

Materials: `shimmer`, `pulse`, `shadow`, `blood`, `fire`, `mute`, `bloodcurse`, `elixir`

## GameplayCue VFX

**Aliases:** `cue`, `cuevfx`

| Command | Description |
|---|---|
| `ccc cuevfx <name>` | Fire burst cue on player |
| `ccc cuevfx <name> on` | Add looping cue on player |
| `ccc cuevfx <name> off` | Remove looping cue |
| `ccc cuevfx <name> target [on\|off]` | Fire/loop cue on TK target |
| `ccc cuevfx stop` | Remove all active looping cues |
| `ccc cuevfx status` | Show active looping cues |
| `ccc cuevfx list [filter]` | List available cues |

## Sound Effects [EXPERIMENTAL]

**Aliases:** `sfx`, `sound`, `audio`

| Command | Description |
|---|---|
| `ccc sfx <name>` | Play sound at player |
| `ccc sfx <name> location` | Play at player position (3D) |
| `ccc sfx list` | Show available sounds |
| `ccc sfx list ysabella` | Show Ysabella/DLC sound aliases |
| `ccc sfx cat dlc` | Show DLC/Ysabella sound category |
| `ccc sfx vo_ysabella_combat` | Try Ysabella combat VO/bark event |
| `ccc sfx dlc_start` | Play the Benny DLC flashback/start UI sting |
| `ccc sfx fire_flashback` | Play the Benny/fire DLC flashback/start UI sting |
| `ccc sfx flower_flashback` | Try the Ysabella/flower DLC flashback cutscene event |
| `ccc sfx ysabella_sword_pickup` | Try the second Ysabella sword flourish/draw notify |
| `ccc sfx tk_whip_cast` | Try Ysabella wire-whip cast SFX |
| `ccc sfx ysabella_crowd_woo` | Try Ysabella DLC crowd ambience |
| `ccc sfx ysabella_curtain_open` | Try Ysabella DLC curtain emitter |
| `ccc sfx scan` | Scan memory for audio objects |
| `ccc sfx debug` | Toggle verbose debug logging |

## Radio Show

**Aliases:** `radio`

| Command | Description |
|---|---|
| `ccc radio play <0-7\|weather\|random>` | Play a haven radio episode event |
| `ccc radio play native [0-7\|weather\|random]` | Trigger native `RadioShow_C` interaction, then run a failsafe play event |
| `ccc radio force <0-7\|weather\|random>` | Force player-local radio event only (no native interaction, no actor targeting) |
| `ccc radio force stop [0-7\|weather\|all]` | Force-stop using player-local stop events only |
| `ccc radio stop [0-7\|weather\|all]` | Stop one or all radio episodes |
| `ccc radio list` | Show episode/event mapping |
| `ccc radio button` | Play radio interact button SFX |
| `ccc radio interact` | Trigger native `RadioShow_C` interaction directly |
| `ccc radio ensure` or `ccc radio spawn` | Spawn a fallback Fabien radio actor if no radio actor is available |
| `ccc radio mode <event\|native\|hybrid>` | Set `play random` default behavior |
| `ccc radio status` | Show current mode and native actor availability |
| `ccc radio <0-7\|weather>` | Shortcut for `ccc radio play ...` |

## Animations [EXPERIMENTAL]

**Aliases:** `anim`, `animation`

| Command | Description |
|---|---|
| `ccc anim play <name>` | Play animation montage |
| `ccc anim fx <name>` | Trigger ability for VFX+anim |
| `ccc anim play wpn_bennygundeploy` | Play Benny gun draw/deploy montage |
| `ccc anim play wpn_bennygundeployfast` | Play Benny gun fast draw montage |
| `ccc anim play wpn_bennygundeployspin` | Play Benny gun spin draw montage |
| `ccc anim play wpn_ysabella_sword_flourish` | Play Ysabella sword draw/flourish montage |
| `ccc anim fade <in\|out> [duration]` | Screen fade effect |
| `ccc anim veins <show\|hide\|pulse>` | Blood veins screen overlay |
| `ccc anim scry <show\|hide>` | Malkavian mind-read visual |
| `ccc anim stop` | Stop current animation/montage |
| `ccc anim list` | Show available animations |

## HUD

**Aliases:** `ui`, `hud`

### Element Visibility

| Command | Description |
|---|---|
| `ccc hud <element> [on\|off\|toggle]` | Show/hide element (quest, abilities, elixirs, health, masquerade) |
| `ccc hud all [on\|off]` | Toggle all 5 elements |
| `ccc hud status` | Show which elements are visible/hidden |

### Master HUD

| Command | Description |
|---|---|
| `ccc hud master [on\|off\|toggle]` | Toggle entire HUD widget |
| `ccc hud opacity <0.0-1.0>` | Set HUD master opacity |
| `ccc hud hide` | Shortcut: opacity 0 |
| `ccc hud show` | Shortcut: opacity 1 |

### Ability Slot Effects

| Command | Description |
|---|---|
| `ccc hud potency <slot\|all> [debug]` | Trigger Greed animation (clan flash). Aliases: `potency`, `pot`, `bop`, `greed` |
| `ccc hud slot <slot> <action> [value]` | Fine-grained ability icon control |

Slot actions: `filled`/`unfilled`, `tint <color>`, `anim <name>`, `progress <0-1>`, `refill`, `refresh`

### Masquerade Animations

| Command | Description |
|---|---|
| `ccc hud shatter [name]` | Play masquerade widget animation (shatter, broken, restored, blink, fadeout) |

## Masquerade

| Command | Description |
|---|---|
| `ccc masq read` / `ccc masq state` | Read current masquerade state and score |
| `ccc masq score` | Read raw masquerade score |
| `ccc masq set <0-3\|upheld\|caution\|engaged\|forfeit>` | Force masquerade state |
| `ccc masq reset` | Reset to Upheld |
| `ccc masq disable\|enable [reset]` | Toggle masquerade system |

## Abilities

**Aliases:** `ab`, `ability`

| Command | Description |
|---|---|
| `ccc ability list` | Show clan and equipped abilities |
| `ccc ability unlock [all\|clan]` | Unlock abilities |
| `ccc ability ap <amount>` | Grant ability points |
| `ccc ability tier <name> <tier>` | Set ability tier (0-3) |
| `ccc ability activate heavyrapier` | Grant/try Ysabella rapier heavy ability |
| `ccc ability activate bennygun` | Grant/try Benny firearm ability |
| `ccc ability activate wirewhip` | Warm the wire kit, then grant/try Ysabella wirewhip ability |
| `ccc ability save\|loadouts\|show <name>` | Manage loadouts |
| `ccc ability passive[:clan] [seconds]` | Activate current or chosen clan passive, optionally with custom duration (e.g. `passive:toreador 60`, `passive:ventrue 90`) |
| `ccc ability rename <ability> <text>` | Rename ability UI text |
| `ccc ability describe <ability> <text>` | Change ability helper/description text |

## Ability Manager [EXPERIMENTAL]

**Aliases:** `am`, `abman`

| Command | Description |
|---|---|
| `ccc abman acquired [debug]` | Show acquired abilities |
| `ccc abman available [debug]` | Show tier unlock tracking |
| `ccc abman equipped [debug]` | Show equipped abilities |
| `ccc abman list [debug]` | Show all tracking lists |
| `ccc abman abilities [clan]` | List known ability names |
| `ccc abman equip <ability>` | Add to equipped list |
| `ccc abman unequip <ability>` | Remove from equipped list |
| `ccc abman unlock <ability>` | Add to available list |
| `ccc abman acquire <ability>` | Add to acquired list |
| `ccc abman clear <list>` | Clear tracking list |

## Keybinds

**Aliases:** `bind`, `key`

| Command | Description |
|---|---|
| `ccc bind <key> <ccc args...>` | Bind a key to a ccc command |
| `ccc bind list` | Show all current bindings |
| `ccc bind preset <name>` | Load a preset (`moving`, `cleaning`) |
| `ccc bind preset list` | List available presets |
| `ccc bind precision` | Toggle precision mode (fine increments) |
| `ccc bind unbind <key>` | Remove a single binding |
| `ccc bind clear` | Remove all bindings |

Keys: `F1`-`F9`, `num0`-`num9`, numpad ops (`numadd`/`numsub`/`nummul`/`numdiv`/`numdot`), `tab`, `capslock`, `a`-`z`

### Presets

| Preset | Description |
|---|---|
| `moving` | Numpad object manipulation — move/rotate/scale the current target |
| `cleaning` | F-key cleanup workflow — acquire, hide, save, undo |

**Moving preset layout:**

| Key | Action |
|---|---|
| `Num8` / `Num2` | Move forward / back |
| `Num4` / `Num6` | Move left / right |
| `Num+` / `Num-` | Move up / down |
| `Num5` | Move to player (here) |
| `Num7` / `Num9` | Rotate yaw + / − |
| `Num1` / `Num3` | Rotate pitch + / − |
| `Num*` / `Num/` | Scale up / down |
| `Num0` / `Num.` | Rotate roll + / − |
| `CapsLock` | Toggle precision mode |
| `Backspace` | Undo last action |

**Cleaning preset layout:**

| Key | Action |
|---|---|
| `F1` | `target mesh` (scan nearby meshes) |
| `1`-`9` | `target mesh 1`-`9` (pick from cached scan) |
| `F2` | `target hide` |
| `F3` | `target addcleanup` |
| `F4` | `target undo` |
| `F6` | `target removecleanup` (remove current target from list) |
| `F7` | `target cleandecal all 500` (hide decals within 500u) |

**Precision mode:** When enabled, move uses 1u (vs 10), rotate uses 1° (vs 15°), scale uses ±0.02 (vs ±0.1).

## Control Bindings (Game Input)

**Aliases:** `keybinds`, `keys`, `controls`

| Command | Description |
|---|---|
| `ccc keybinds` | Show all player key bindings |
| `ccc keybinds <action>` | Show binding for one action |
| `ccc keybinds remap <action> <key>` | Remap an action |
| `ccc keybinds reset <action\|all>` | Reset to original |

## Haven (Apartment)

**Aliases:** `apartment`, `apt`

### DLC Items

| Command | Description |
|---|---|
| `ccc haven dlc [on\|off\|status]` | Toggle all DLC cosmetic items |
| `ccc haven dlc <name> [on\|off]` | Toggle specific DLC item (cosmetics, stopsign, sarcophagus, jukebox, voerman) |

### Cleanup

| Command | Description |
|---|---|
| `ccc haven cleanup [all\|trash\|debris\|decals]` | Hide apartment junk/mess |
| `ccc haven cleanup undo` | Restore hidden items |
| `ccc haven cleanup status` | Show cleanup state |
| `ccc haven cleanup report` | Checklist coverage report |

### Custom Cleanup (Persistent)

| Command | Description |
|---|---|
| `ccc haven cleanup custom` | Run custom cleanup (hide + apply transforms) |
| `ccc haven cleanup custom list` | Show custom cleanup entries |
| `ccc haven cleanup custom undo` | Restore custom-hidden/transformed items |
| `ccc haven cleanup custom remove <N>` | Remove entry by number |
| `ccc haven cleanup custom relabel` | Update all labels from live actors |
| `ccc haven cleanup custom clear` | Clear entire custom list |

**Custom cleanup workflow:**
1. `ccc target` or `ccc target mesh` — identify an actor
2. `ccc target move/scale/rotate` — optionally transform it
3. `ccc target addcleanup` — add to persistent list (saved to disk)
4. `ccc target removecleanup` — remove from list if needed
5. `ccc haven cleanup custom` — apply all entries
6. `ccc haven cleanup custom relabel` — refresh labels from live actors

### Scanning

| Command | Description |
|---|---|
| `ccc haven scan` | List haven actors |

## Melee Combat Style

**Aliases:** `melee`, `combat`, `style`

| Command | Description |
|---|---|
| `ccc melee <style> [persist:false]` | Change combat style (banu, brujah, lasombra, toreador, tremere, ventrue, ysabella/rapier) |
| `ccc melee both <style> [persist:false]` | Change attacks and idle |
| `ccc melee only <style> [persist:false]` | Change attacks only |
| `ccc melee reset` | Restore original style |
| `ccc melee info` | Show current melee info |
| `ccc melee list` | List available styles |
| `ccc melee rapierheavy [status\|grant\|listen]` | Ysabella rapier heavy ability helper |
| `ccc melee threshold [value]` | Heavy attack trigger threshold |
| `ccc melee speed [rate]` | Animation playback speed |
| `ccc melee heavyreset` | Reset heavy settings |

## Weapon Manager [EXPERIMENTAL]

**Aliases:** `wep`, `w`

Prefer `ccc guns` for ranged testing when it covers your use case. `ccc weapon` talks directly to `WrestlerPlayerWeaponManager_C`.

| Command | Description |
|---|---|
| `ccc weapon` / `ccc weapon info` | Show current weapon manager state |
| `ccc weapon list` | List equippable weapon names and indices |
| `ccc weapon equip <name> [override\|redraw]` | Equip by AttackConfig override |
| `ccc weapon select <index>` | Equip by default weapon-map index |
| `ccc weapon unequip` | Return to default/unarmed |
| `ccc weapon drop` | Drop/throw current weapon |
| `ccc weapon grab` | Pick up nearby grabbable weapon |
| `ccc weapon ammo <n>` | Set baton charge count |
| `ccc weapon recharge` | Recharge TK-held baton/weapon |
| `ccc weapon hide\|show` | Toggle equipped weapon mesh visibility |
| `ccc weapon stance [on\|off\|toggle]` | Toggle combat/idle stance |
| `ccc weapon skin list\|clear\|<name>` | List/apply/clear weapon skin presets |
| `ccc weapon asset [weapon\|mapping\|held\|mesh\|grab]` | Dump live weapon fields |
| `ccc weapon probe` / `ccc weapon dumpfn [filter]` | Weapon manager diagnostics |

## Guns

**Aliases:** `guns`, `gun`

| Command | Description |
|---|---|
| `ccc guns list` | List direct ranged AttackConfigs |
| `ccc guns <name> [dual] [ammo] [mag]` | Equip a gun with default ammo |
| `ccc guns equip <name> [dual] [ammo] [mag]` | Equip a gun or dual guns |
| `ccc guns dual <name> [ammo] [mag]` | Equip the dual version |
| `ccc guns info` | Read current weapon, held index, and ammo counts |
| `ccc guns unequip` | Return to default/unarmed |
| `ccc guns ammo <heldAmmo> [magAmmo]` | Manually set current gun ammo |

Names include `handgun`/`pistol`, `revolver`, `highcal`, `mp5`/`smg`, `stubbysmg`, `rifle`/`m4`, `iaorifle`, `shotgun`, `iaoshotgun`, `megashotgun`, `sniper`, and `crossbow`. Example: `ccc guns handgun` equips a single pistol with default ammo; `ccc guns handgun dual` equips dual pistols with default ammo.

## DLC Telekinesis Experiments [EXPERIMENTAL]

| Command | Description |
|---|---|
| `ccc tkability` / `ccc tkability status` | Show experiment state flags |
| `ccc tkability help` | Show module-native full help |
| `ccc tkability tk status` | Show the live Telekinesis control graph slot |
| `ccc tkability tk benny` | Prepare Benny's gun mesh/GA, then route Phyre TK input through Benny's firearm graph |
| `ccc tkability tk wire` | Warm/grant/swap to Ysabella wire TK, then delayed-activate the wire GA |
| `ccc tkability tk reset` | Restore Phyre's default Telekinesis graph |
| `ccc tkability gun kit` | Warm Benny gun assets and prepare a Weapon-tagged Smart Benny gun mesh |
| `ccc tkability gun probe` | Show Weapon-tagged skeletal components visible to `GA_BennyGun` |
| `ccc tkability gun equip` | Kit + grant + Benny TK graph swap + delayed `GA_BennyGun` activation |
| `ccc tkability gun grant\|fire\|revoke` | Direct `GA_BennyGun` ability grant/activate/remove tests |
| `ccc tkability warm gun` | Preload Benny gun kit assets without swapping TK |
| `ccc tkability warm wire` | Preload Ysabella wire kit assets without swapping TK |
| `ccc tkability cg [reset]` | Hot-swap CombatControlGraph |
| `ccc tkability movement [reset]` | Hot-swap movement control graph |
| `ccc tkability probe` | Dump live control component and ASC state |
| `ccc tkability fist` / `attackset` | Broken DLC path test retained for research |
| `ccc spawn mesh bennygun` | Spawn Benny's pistol / Smart Benny gun display mesh |
| `ccc spawn mesh bennyflare` | Spawn the separate DLC flare gun prop |
| `ccc spawn mesh ysrapier` | Spawn Ysabella's rapier display mesh |

These are runtime control-graph overrides, not normal spawned weapon pickups.

## Outfits & Customization [EXPERIMENTAL]

**Aliases:** `outfit`, `costume`, `cosmetic`

| Command | Description |
|---|---|
| `ccc outfits info` | Show current outfit details |
| `ccc outfits list [type]` | List available items |
| `ccc outfits details <name\|idx>` | Show costume metadata and tags |
| `ccc outfits scan [debug]` | Debug scan for assets |
| `ccc outfits dialogue [type] [on\|off]` | **EXPERIMENTAL** outfit dialogue type/property controls |
| `ccc outfits unlock <name\|idx>` | Unlock a specific costume |
| `ccc outfits unlockall` | Unlock ALL costumes |
| `ccc outfits set <type> <name>` | Change outfit piece |
| `ccc outfits save\|load\|saved\|delete <name>` | Manage outfit presets |
| `ccc outfits refresh` | Refresh appearance menu preview |

## Game Menus [EXPERIMENTAL]

| Command | Description |
|---|---|
| `ccc menu map` | Open map |
| `ccc menu quests` | Open quests |
| `ccc menu appearance` | Open appearance |
| `ccc menu codex` | Open codex |
| `ccc menu abilities` | Open ability tree |
| `ccc menu train <clan>` | Open clan training menu |
| `ccc menu status` | Show current menu ID |

## Map / Fast Travel [EXPERIMENTAL]

**Aliases:** `map`, `fasttravel`, `ft`

| Command | Description |
|---|---|
| `ccc map status` | Show map state and cursor |
| `ccc map zones` | List all fast travel zones |
| `ccc map travel <zone>` | Teleport to zone |
| `ccc map <zone>` | Quick travel shortcut |
| `ccc map add <name>` | Add zone at player position |
| `ccc map remove <name>` | Remove a custom zone |
| `ccc map cursor` | Show cursor position on map |
| `ccc map markers` | List map marker data/tags/world positions |
| `ccc map layers [filter]` | Show data layer states |
| `ccc map go <Location.Tag>` | **EXPERIMENTAL** transition by location tag |

Default zones: `haven`, `pioneer_square`, `chinatown`, `waterfront`

## Save State

**Aliases:** `save`, `saves`

| Command | Description |
|---|---|
| `ccc save info` | Save system overview |
| `ccc save list` | List save slots with metadata |
| `ccc save clans [true\|false] [hard]` | Clan completion status |
| `ccc save <clan> [true\|false] [hard]` | Toggle one clan completed |
| `ccc save quests` | Show completed/open quest tags |
| `ccc save props [filter]` | Dump HeraPropertyBool values |
| `ccc save set <name> <true\|false> [hard]` | Write a HeraPropertyBool |
| `ccc save ints\|floats [filter]` | Dump integer/float Hera properties |
| `ccc save setint\|setfloat <name> <value> [hard]` | Write integer/float Hera property |
| `ccc save probeint\|probeintget <filter>` | **EXPERIMENTAL** integer property diagnostics |
| `ccc save achievements [filter]` | List achievements + status |
| `ccc save achcheck [filter]` | Achievement diagnostic check |
| `ccc save sync [hard]` | Sync clan props from achievements |

## Story Night Diagnostic [EXPERIMENTAL]

**Aliases:** `nightdiag`, `storydiag`

| Command | Description |
|---|---|
| `ccc storynight` | Dump newspapers, codex, and quest snapshot |
| `ccc storynight newspapers` | Dump `BP_Newspaper_Codex_Dispenser_C` state |
| `ccc storynight codex` | Walk MainCodex / MalkavianCodex / BennyCodex |
| `ccc storynight quests` | Dump player-state quest progress fields |
| `ccc storynight help` | Show module help |

## AI Distraction

**Aliases:** `distract`, `noise`

| Command | Description |
|---|---|
| `ccc distract` | Noise at crosshair |
| `ccc distract [loudness] [range]` | Custom loudness (0-1) and range |
| `ccc distract fear [strength] [range]` | Fear stimulus (AI flees) |
| `ccc distract attract` | Attraction (AI comes to point) |

## Collectible & NPC Location Scanner [EXPERIMENTAL]

**Aliases:** `collectibles`

| Command | Description |
|---|---|
| `ccc collect [all\|xp\|cam\|tb\|knife\|codex\|trainers\|feeding] [--file]` | Scan collectible/NPC marker categories |
| `ccc collect sweep [codex\|all\|xp\|cam\|tb] [--wait N] [--file]` | Ghost sweep full map |
| `ccc collect sweep stop` | Cancel in-progress sweep |
| `ccc collect bounds` | Dump active map zone bounds and JSON blob |
| `ccc collect calibrate` | Show player UV in both v-sign options |
| `ccc collect vflip` | Toggle v-axis flip for UV projection |
| `ccc collect help` | Show scanner help |

## Codex (Journal)

**Aliases:** `codex`, `journal`

| Command | Description |
|---|---|
| `ccc codex list [filter]` | List codex entries |
| `ccc codex search <term>` | Search by name/ID/desc |
| `ccc codex parents` | List categories with children |
| `ccc codex items` | List codex item actors in world |
| `ccc codex show <id>` | Show a codex item by ID |
| `ccc codex unlock <flag>` | Unlock a codex flag |
| `ccc codex open` | Open codex menu |
| `ccc codex debug` | Inspect codex subsystem |
| `ccc codex create <name> [parent]` | **EXPERIMENTAL** create entry |

## Blood Resonance Events

**Aliases:** `resonance`, `br`, `influence`

| Command | Description |
|---|---|
| `ccc br info` / `ccc influence info` | Show NPC resonance system state |
| `ccc resonance scan` | Find nearby BR event NPCs |
| `ccc resonance approach [type]` | Set approach (fear, fight, flirt, all, clear) |
| `ccc resonance skills` | Show ability-based unlocks |
| `ccc resonance skills all on` | Unlock all ability options |
| `ccc resonance target` | Analyze stored target for BR data |
| `ccc resonance costume [info\|bypass]` | Costume/outfit requirement diagnostics |
| `ccc resonance bypass [on\|off\|status]` | **EXPERIMENTAL** outfit bypass state |

Note: `ccc resonance info` is consumed by the resource resonance handler. For NPC resonance info, prefer `ccc br info` or `ccc influence info`.

## Dialogue System

**Aliases:** `dialogue`, `dialog`, `convo`

| Command | Description |
|---|---|
| `ccc dialogue log <on\|off>` | Toggle conversation logging |
| `ccc dialogue automatch <on\|off>` | Auto-set outfit to match NPC |
| `ccc dialogue automatch set <approach> <outfit>` | Configure mapping |
| `ccc dialogue props` | Show all dialogue properties |

## Camera

**Aliases:** `cam`

| Command | Description |
|---|---|
| `ccc cam third` | Toggle third person camera. Aliases: `3p`, `thirdperson` |
| `ccc cam debug` | Toggle debug flying camera. Aliases: `free`, `fly` |
| `ccc cam alt` | Toggle secondary viewpoint |
| `ccc cam fov [value]` | Show/set field of view (10-170) |
| `ccc cam fov reset` | Reset FOV to original |
| `ccc cam info` | Show camera state & properties |
| `ccc cam reset` | Reset all camera changes |

## Transition Doors [EXPERIMENTAL]

**Aliases:** `doors`, `transition`

| Command | Description |
|---|---|
| `ccc door` / `ccc door list` | List nearby transition doors and status |
| `ccc door inspect` | Deep inspect current target door |
| `ccc door fix` | Try to unblock and activate target door |
| `ccc door compare` | Compare two inspected door snapshots |
| `ccc door components` | Dump all components on target door |
| `ccc door interact [range]` | Add interaction prompt to target door |
| `ccc door interact remove` | Remove added interaction |
| `ccc door go` | Force transition through target door |
| `ccc door unblock` | SetBlocked(false) on interaction component |
| `ccc door activate` | SetItemState(Active) on persistence component |
| `ccc door clear` | Clear stored snapshots |
| `ccc transition go <Location.Tag>` | Seamless travel by location tag |
| `ccc transition <Location.Tag>` | Shorthand for `transition go` |

## World Interaction Logger [EXPERIMENTAL]

**Aliases:** `wl`

| Command | Description |
|---|---|
| `ccc world` | Snapshot crosshair hit, targets, and player position |
| `ccc world verbose` | Snapshot with extra detail |
| `ccc world start [ms]` | Start continuous logger |
| `ccc world stop` | Stop continuous logger |
| `ccc world scan` | Deep scan actor under crosshair |
| `ccc world here` | Player position and rotation only |
| `ccc world surface` | Physical material / surface type at crosshair |

## Text / StringTables [EXPERIMENTAL]

**Aliases:** `text`, `string`, `loc`

| Command | Description |
|---|---|
| `ccc text cat` | List StringTable categories |
| `ccc text scan` | Scan for loaded StringTables |
| `ccc text list <category> [filter]` | List keys in a StringTable |
| `ccc text read <cat> <key>` | Read a specific entry |
| `ccc text set <cat> <key> "value"` | Set entry (experimental) |
| `ccc text ability <ability> name\|desc "value"` | Set ability UI text by ability alias |

## Game Info

| Command | Description |
|---|---|
| `ccc gameinfo` | Show build, engine, DLC info. Aliases: `info`, `build` |
