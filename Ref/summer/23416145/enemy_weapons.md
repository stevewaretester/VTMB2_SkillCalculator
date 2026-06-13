# Enemy Weapons - 23416145

This note is for the enemies spawnable through `ccc spawn enemy <type>` in `MODS/debug_consoleCheatCommands/Scripts/spawn.lua`.

The join used here is:

- CCC alias in `ENEMY_SPAWN_BLUEPRINTS`
- `etdName`
- matching `DA_ModularEnemies.Properties.Enemies[etdName]`
- `WeaponDefinition` and `EnemyStats`

Important reads:

- `AmmoBeforeReload` below is `PlayerWield Ammo`: loaded ammo before reload/cycling, not pickup ammo.
- `PlayerFireRate` is the player-held weapon-instance field.
- `ShotFireRate` is the NPC ranged burst shot interval.
- Ranged damage is split between `PlayerDamage`, `DamagePerProjectile`, `Projectiles/shot`, and sometimes `DamageTag`.
- Melee/unarmed damage is enemy-stat driven through `DamageByTag`, so the same WID can hit differently depending on the stats asset.
- Enemy HP is `MaxHealth` from the stats asset; some lightweight human/police-style stats assets omit it.
- Runtime interpretation caveat: the export gives both `MaxHealth` and `MaxStun`, but does not prove which pool the game uses for enemy defeat. Current in-game reading suggests `MaxStun` may be the effective enemy durability/HP value in practice. Keep both visible; label `MaxHealth` as the raw exported health field.
- I did not find a normal enemy loot table in the enemy data assets. The exported drop clues are weapon/throwable drop support, weapon harvesting/disarm paths, and a generic TK-object drop chance on `BP_EnemyCharacterBase`.

## CCC Spawn Enemy Loadouts

Some CCC labels are descriptive/stale rather than exact weapon IDs. Most notably, `ghoulsmg` resolves to `WID_Rifle_ThinbloodEarly` / Dollar Store M4, while `sabbatar` resolves to `WID_SMG`.

| Aliases                                 | Spawn label                                  | ETD row                                         | Weapon                  | WID                          | Stats asset                              | Potential weapon/TK drop                                 |
| --------------------------------------- | -------------------------------------------- | ----------------------------------------------- | ----------------------- | ---------------------------- | ---------------------------------------- | -------------------------------------------------------- |
| mannequin                               | Mannequin                                    | `Mannequin`                                     | Unarmed                 | `WID_Unarmed`                | `DA_Mannequin_Stats`                     | no weapon drop                                           |
| dummy / testdummy                       | Test Dummy                                   | `TestDummy`                                     | Unarmed                 | `WID_Unarmed`                | `DA_TestDummy`                           | no weapon drop                                           |
| ghoul                                   | Thinblood Minor Ghoul (Bat)                  | `Thinblood_MinorGhoul_BaseballBat`              | Baseball Bat            | `WID_BaseballBat`            | `DA_Thinblood_MinorGhoul_Stats`          | world spawner; little TK throw, 10 damage inherited      |
| ghoulknife                              | Thinblood Minor Ghoul (Knife)                | `Thinblood_MinorGhoul_Knife`                    | Knife                   | `WID_Knife`                  | `DA_Thinblood_MinorGhoul_Knife_Stats`    | world spawner; medium TK throw, 15 damage                |
| ghoulmac                                | Thinblood Minor Ghoul (Machete)              | `Thinblood_MinorGhoul_Machete`                  | Machete                 | `WID_Machete`                | `DA_Thinblood_MinorGhoul_Stats`          | world spawner; medium TK throw, 15 damage                |
| ghoulpis                                | Thinblood Minor Ghoul (Pistol)               | `Thinblood_MinorGhoul_Pistol`                   | Pistol                  | `WID_Handgun`                | `DA_Thinblood_MinorGhoul_Stats`          | ranged little TK throw, 10 damage                        |
| ghoulrev                                | Thinblood Minor Ghoul (Revolver)             | `Thinblood_MinorGhoul_Revolver`                 | Revolver                | `WID_Revolver`               | `DA_Thinblood_MinorGhoul_Stats`          | ranged little TK throw, 10 damage                        |
| ghoulsmg                                | Thinblood Minor Ghoul (SMG)                  | `Thinblood_MinorGhoul_SMG`                      | Dollar Store M4         | `WID_Rifle_ThinbloodEarly`   | `DA_Thinblood_MinorGhoul_Stats`          | ranged little TK throw, 10 damage                        |
| ghoulsho                                | Thinblood Minor Ghoul (Shotgun)              | `Thinblood_MinorGhoul_Shotgun`                  | Shotgun                 | `WID_Shotgun_ThinbloodEarly` | `DA_Thinblood_MinorGhoul_Stats`          | ranged little TK throw, 10 damage                        |
| ghoulun                                 | Thinblood Minor Ghoul (Unarmed)              | `Thinblood_MinorGhoul_Unarmed`                  | Unarmed                 | `WID_Unarmed`                | `DA_Thinblood_MinorGhoul_Stats`          | no weapon drop                                           |
| ghoulbaton                              | Thinblood Minor Ghoul (Baton)                | `Thinblood_MinorGhoul_ElectricBaton`            | Electric Baton (single) | `WID_ElectricBaton_Single`   | `DA_Thinblood_MinorGhoul_Stats`          | enemy-held; little TK throw, 10 damage inherited         |
| ghoulsniper                             | Thinblood Ghoul Sniper                       | `Thinblood_MinorGhoul_Inquisition_Sniper`       | Sniper Rifle            | `WID_SniperRifle`            | `DA_Thinblood_MinorGhoul_Stats`          | ranged little TK throw, 10 damage                        |
| ghoulrifle                              | Thinblood Ghoul (Assault Rifle)              | `Thinblood_MinorGhoul_Inquisition_AssaultRifle` | IAO Rifle               | `WID_Rifle`                  | `DA_Thinblood_MinorGhoul_Stats`          | ranged little TK throw, 10 damage                        |
| ghoulinqshotgun                         | Thinblood Ghoul (Inquisition Shotgun)        | `Thinblood_MinorGhoul_Inquisition_Shotgun`      | IAO Shotgun             | `WID_Shotgun`                | `DA_Thinblood_MinorGhoul_Stats`          | ranged little TK throw, 10 damage                        |
| majorgs                                 | Thinblood Major Ghoul Striker                | `Thinblood_MajorGhoul_Striker`                  | Striker Hammer          | `WID_Striker_Hammer`         | `DA_Thinblood_MajorGhoul_Stats`          | hammer/sledge spawner; heavy TK throw, 50 damage         |
| majorgd                                 | Thinblood Major Ghoul Distractor             | `Thinblood_MajorGhoul_Distractor`               | Mega Shotty             | `WID_Shotgun_Pump`           | `DA_Thinblood_MajorGhoul_Stats`          | ranged little TK throw, 10 damage                        |
| majorgslate                             | Thinblood Major Ghoul Striker (Late Game)    | `Thinblood_MajorGhoul_Striker_LateGame`         | Striker Hammer          | `WID_Striker_Hammer`         | `DA_Thinblood_MajorGhoul_LateGame_Stats` | hammer/sledge spawner; heavy TK throw, 50 damage         |
| majorgdlate                             | Thinblood Major Ghoul Distractor (Late Game) | `Thinblood_MajorGhoul_Distractor_LateGame`      | Mega Shotty             | `WID_Shotgun_Pump`           | `DA_Thinblood_MajorGhoul_Stats`          | ranged little TK throw, 10 damage                        |
| thinvamp                                | Thinblood Vampire (Ambusher)                 | `Thinblood_WeakVampire_Ambusher`                | Claws                   | `WID_Claws`                  | `DA_Thinblood_Vampire_Melee_Stats`       | no weapon drop                                           |
| thinvampf                               | Thinblood Vampire (Flusher)                  | `Thinblood_WeakVampire_Flusher`                 | Stubby SMG              | `WID_Rifle_Dual`             | `DA_Thinblood_Vampire_Ranged_Stats`      | harvested dual rifle; little TK throw, 10 damage         |
| thinvamplate                            | Thinblood Vampire Ambusher (Late Game)       | `Thinblood_WeakVampire_Ambusher_LateGame`       | Claws                   | `WID_Claws`                  | `DA_Thinblood_Vampire_Melee_Stats`       | no weapon drop                                           |
| thinvampflate                           | Thinblood Vampire Flusher (Late Game)        | `Thinblood_WeakVampire_Flusher_LateGame`        | Stubby SMG              | `WID_Rifle_Dual`             | `DA_Thinblood_Vampire_Ranged_Stats`      | harvested dual rifle; little TK throw, 10 damage         |
| thinfort                                | Thinblood Fortidude                          | `Thinblood_Fortidude`                           | Unarmed                 | `WID_Unarmed`                | `DA_Thinblood_Fortidude_Stats`           | no weapon drop                                           |
| sabbat                                  | Sabbat Minor Ghoul (Sword)                   | `Sabbat_MinorGhoul_Sword`                       | Sword                   | `WID_Sword`                  | `DA_Sabbat_MinorGhoul_Sword_Stats`       | world spawner; medium TK throw, 15 damage                |
| sabbatpis                               | Sabbat Minor Ghoul (Pistol)                  | `Sabbat_MinorGhoul_HighCaliburPistol`           | High Cal Revolver       | `WID_HighCaliburPistol`      | `DA_Sabbat_MinorGhoul_Stats`             | ranged little TK throw, 10 damage                        |
| sabbatclub                              | Sabbat Minor Ghoul (Club)                    | `Sabbat_MinorGhoul_SpikedClub`                  | Spiked Club             | `WID_SpikedClub`             | `DA_Sabbat_MinorGhoul_Stats`             | world spawner; medium TK throw, 15 damage                |
| sabbatar                                | Sabbat Minor Ghoul (Auto Rifle)              | `Sabbat_MinorGhoul_AutomaticRifle`              | SMG                     | `WID_SMG`                    | `DA_Sabbat_MinorGhoul_Stats`             | ranged little TK throw, 10 damage                        |
| sabbatsniper                            | Sabbat Minor Ghoul Sniper                    | `Sabbat_MinorGhoul_SniperRifle`                 | Sniper Rifle            | `WID_SniperRifle`            | `DA_Sabbat_MinorGhoul_Stats`             | ranged little TK throw, 10 damage                        |
| sabbatmaj                               | Sabbat Major Ghoul Striker                   | `Sabbat_MajorGhoulStriker_Warhammer`            | Warhammer               | `WID_Warhammer`              | `DA_Sabbat_MajorGhoul_Stats`             | world spawner; obliterate TK throw, 65 damage            |
| sabbatmajd                              | Sabbat Major Ghoul Distractor                | `Sabbat_MajorGhoulDistractor_Shotgun`           | Mega Shotty             | `WID_Shotgun_Pump`           | `DA_Sabbat_MajorGhoul_Stats`             | ranged little TK throw, 10 damage                        |
| sabbatvamp                              | Sabbat Vampire (Ambusher)                    | `Sabbat_WeakVampire_Ambusher`                   | Claws                   | `WID_Claws`                  | `DA_Sabbat_Vampire_Melee_Stats`          | no weapon drop                                           |
| sabbatvampf                             | Sabbat Vampire (Flusher)                     | `Sabbat_WeakVampire_Flusher`                    | Stubby SMG              | `WID_Rifle_Dual`             | `DA_Sabbat_Vampire_Ranged_Stats`         | harvested dual rifle; little TK throw, 10 damage         |
| sabbatvamplate                          | Sabbat Vampire Ambusher (Late Game)          | `Sabbat_WeakVampire_Ambusher_LateGame`          | Claws                   | `WID_Claws`                  | `DA_Sabbat_Vampire_Melee_Stats`          | no weapon drop                                           |
| sabbatvampflate                         | Sabbat Vampire Flusher (Late Game)           | `Sabbat_WeakVampire_Flusher_LateGame`           | Stubby SMG              | `WID_Rifle_Dual`             | `DA_Sabbat_Vampire_Ranged_Stats`         | harvested dual rifle; little TK throw, 10 damage         |
| inq                                     | Inquisitor (Assault Rifle)                   | `Inquisitor_TacticalAssaultRifle`               | IAO Rifle               | `WID_Rifle`                  | `DA_Inquisitor_Ranged_Stats`             | ranged little TK throw, 10 damage                        |
| inqshotgun                              | Inquisitor (Shotgun)                         | `Inquisitor_CombatShotgun`                      | IAO Shotgun             | `WID_Shotgun`                | `DA_Inquisitor_Melee_Stats`              | ranged little TK throw, 10 damage                        |
| inqbaton                                | Inquisitor (Electric Baton)                  | `Inquisitor_ElectricBaton`                      | Electric Baton          | `WID_ElectricBaton`          | `DA_Inquisitor_Melee_Stats`              | enemy-harvest only; little TK throw, 10 damage inherited |
| inqsniper / inqsniperbase               | Inquisitor Sniper                            | `Inquisitor_Sniper`                             | Sniper Rifle            | `WID_SniperRifle`            | `DA_Inquisitor_Sniper_Stats`             | ranged little TK throw, 10 damage                        |
| inqxbow                                 | Inquisitor Crossbow Sniper                   | `Inquisitor_SniperCrossbowRifle`                | Crossbow                | `WID_Crossbow`               | `DA_Inquisitor_Ranged_Stats`             | pickup spawner only; exploding bolt special              |
| husk                                    | Husk                                         | `Husk`                                          | Unarmed                 | `WID_Unarmed`                | `DA_Husk_Stats`                          | no weapon drop                                           |
| shovelhead / shovel                     | Shovelhead                                   | `Shovelhead`                                    | Claws                   | `WID_Claws`                  | `DA_Shovelhead_Stats`                    | no weapon drop                                           |
| shadow                                  | Shadow Demon                                 | `ShadowDemon`                                   | Claws                   | `WID_Claws`                  | `DA_Demon_stats`                         | no weapon drop                                           |
| damsel                                  | Damsel (Enemy)                               | `Damsel`                                        | Unarmed                 | `WID_Unarmed`                | `DA_Damsel_Stats`                        | no weapon drop                                           |
| cop                                     | Police                                       | `Police`                                        | Pistol                  | `WID_Handgun`                | `DA_Police_Stats`                        | ranged little TK throw, 10 damage                        |
| copin                                   | Police (Indoor)                              | `Police_Inside`                                 | Pistol                  | `WID_Handgun`                | `DA_Police_Stats`                        | ranged little TK throw, 10 damage                        |
| pedestrian                              | Pedestrian                                   | `Pedestrian`                                    | Unarmed                 | `WID_Unarmed`                | `DA_Human_Stats`                         | no weapon drop                                           |
| massped / masspedestrian                | Mass Pedestrian                              | `Mass_Pedestrian`                               | Unarmed                 | `WID_Unarmed`                | `DA_Human_Stats`                         | no weapon drop                                           |
| masscop / masspolice                    | Mass Police                                  | `Mass_Police`                                   | Pistol                  | `WID_Handgun`                | `DA_Police_Stats`                        | ranged little TK throw, 10 damage                        |
| frank                                   | Human Frank                                  | `Human_Frank`                                   | Unarmed                 | `WID_Unarmed`                | `DA_Human_Stats`                         | no weapon drop                                           |
| bossbenny / benny                       | Boss: Benny                                  | `Boss_Benny`                                    | Benny Unarmed           | `WID_BennyUnarmed`           | `DA_Benny_Stats`                         | no weapon drop                                           |
| bosschamp / champion                    | Boss: Champion                               | `Boss_Champion`                                 | Dual High Cal Revolver  | `WID_HighCaliburPistol_Dual` | `DA_Champion_Stats`                      | ranged little TK throw, 10 damage                        |
| bosssafia / safia                       | Boss: Safia (Cemile)                         | `Boss_Safia`                                    | Claws                   | `WID_Claws`                  | `DA_Safia_Stats`                         | no weapon drop                                           |
| bossysabella / ysabella                 | Boss: Ysabella                               | `Boss_Ysabella`                                 | Ysabella Rapier/Sword   | `WID_SwordYsabella`          | `DA_Ysbella_Stats`                       | enemy-held rapier; medium TK throw, 15 damage            |
| bossysabellabeast / ysabellabeast       | Boss: Ysabella Beast                         | `Boss_Ysabella_Beast`                           | Ysabella Rapier/Sword   | `WID_SwordYsabella`          | `DA_Ysbella_Stats`                       | enemy-held rapier; medium TK throw, 15 damage            |
| bossysabelladiva / ysabelladiva         | Boss: Ysabella Diva                          | `Boss_Ysabella_Diva`                            | Claws                   | `WID_Claws`                  | `DA_Sabbat_Vampire_Melee_Stats`          | no weapon drop                                           |
| bossysabellapredator / ysabellapredator | Boss: Ysabella Predator                      | `Boss_Ysabella_Predator`                        | Benny Unarmed           | `WID_BennyUnarmed`           | `DA_Sabbat_Vampire_Melee_Stats`          | no weapon drop                                           |

## Enemy Health And Stun

These are the exported `MaxHealth`, `MaxStun`, and `AttackPower` fields from the same `EnemyStats` assets used by the loadout table.

Important for webpage display: `HP` below is the raw exported `MaxHealth`. `Stun` is raw exported `MaxStun`; based on runtime observation, this may be the better candidate for "effective HP" or combat durability. I have not found proof of that mapping in these JSON exports alone.

| Aliases                                 | Enemy                                        | Weapon                                                | Stats asset                              |  HP |   Stun | AttackPower |
| --------------------------------------- | -------------------------------------------- | ----------------------------------------------------- | ---------------------------------------- | --: | -----: | ----------: |
| mannequin                               | Mannequin                                    | Unarmed (`WID_Unarmed`)                               | `DA_Mannequin_Stats`                     |   - |     15 |           - |
| dummy / testdummy                       | Test Dummy                                   | Unarmed (`WID_Unarmed`)                               | `DA_TestDummy`                           |  75 | 100000 |           - |
| ghoul                                   | Thinblood Minor Ghoul (Bat)                  | Baseball Bat (`WID_BaseballBat`)                      | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| ghoulknife                              | Thinblood Minor Ghoul (Knife)                | Knife (`WID_Knife`)                                   | `DA_Thinblood_MinorGhoul_Knife_Stats`    |  75 |     65 |           - |
| ghoulmac                                | Thinblood Minor Ghoul (Machete)              | Machete (`WID_Machete`)                               | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| ghoulpis                                | Thinblood Minor Ghoul (Pistol)               | Pistol (`WID_Handgun`)                                | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| ghoulrev                                | Thinblood Minor Ghoul (Revolver)             | Revolver (`WID_Revolver`)                             | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| ghoulsmg                                | Thinblood Minor Ghoul (SMG)                  | Dollar Store M4 (`WID_Rifle_ThinbloodEarly`)          | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| ghoulsho                                | Thinblood Minor Ghoul (Shotgun)              | Shotgun (`WID_Shotgun_ThinbloodEarly`)                | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| ghoulun                                 | Thinblood Minor Ghoul (Unarmed)              | Unarmed (`WID_Unarmed`)                               | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| ghoulbaton                              | Thinblood Minor Ghoul (Baton)                | Electric Baton (single) (`WID_ElectricBaton_Single`)  | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| ghoulsniper                             | Thinblood Ghoul Sniper                       | Sniper Rifle (`WID_SniperRifle`)                      | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| ghoulrifle                              | Thinblood Ghoul (Assault Rifle)              | IAO Rifle (`WID_Rifle`)                               | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| ghoulinqshotgun                         | Thinblood Ghoul (Inquisition Shotgun)        | IAO Shotgun (`WID_Shotgun`)                           | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |
| majorgs                                 | Thinblood Major Ghoul Striker                | Striker Hammer (`WID_Striker_Hammer`)                 | `DA_Thinblood_MajorGhoul_Stats`          | 120 |    150 |         1.5 |
| majorgd                                 | Thinblood Major Ghoul Distractor             | Mega Shotty (`WID_Shotgun_Pump`)                      | `DA_Thinblood_MajorGhoul_Stats`          | 120 |    150 |         1.5 |
| majorgslate                             | Thinblood Major Ghoul Striker (Late Game)    | Striker Hammer (`WID_Striker_Hammer`)                 | `DA_Thinblood_MajorGhoul_LateGame_Stats` | 120 |    150 |         1.5 |
| majorgdlate                             | Thinblood Major Ghoul Distractor (Late Game) | Mega Shotty (`WID_Shotgun_Pump`)                      | `DA_Thinblood_MajorGhoul_Stats`          | 120 |    150 |         1.5 |
| thinvamp                                | Thinblood Vampire (Ambusher)                 | Claws (`WID_Claws`)                                   | `DA_Thinblood_Vampire_Melee_Stats`       | 270 |    150 |         2.5 |
| thinvampf                               | Thinblood Vampire (Flusher)                  | Stubby SMG (`WID_Rifle_Dual`)                         | `DA_Thinblood_Vampire_Ranged_Stats`      | 240 |    140 |           - |
| thinvamplate                            | Thinblood Vampire Ambusher (Late Game)       | Claws (`WID_Claws`)                                   | `DA_Thinblood_Vampire_Melee_Stats`       | 270 |    150 |         2.5 |
| thinvampflate                           | Thinblood Vampire Flusher (Late Game)        | Stubby SMG (`WID_Rifle_Dual`)                         | `DA_Thinblood_Vampire_Ranged_Stats`      | 240 |    140 |           - |
| thinfort                                | Thinblood Fortidude                          | Unarmed (`WID_Unarmed`)                               | `DA_Thinblood_Fortidude_Stats`           | 120 |    300 |         1.5 |
| sabbat                                  | Sabbat Minor Ghoul (Sword)                   | Sword (`WID_Sword`)                                   | `DA_Sabbat_MinorGhoul_Sword_Stats`       |  95 |     65 |         1.1 |
| sabbatpis                               | Sabbat Minor Ghoul (Pistol)                  | High Cal Revolver (`WID_HighCaliburPistol`)           | `DA_Sabbat_MinorGhoul_Stats`             |  95 |     65 |         1.1 |
| sabbatclub                              | Sabbat Minor Ghoul (Club)                    | Spiked Club (`WID_SpikedClub`)                        | `DA_Sabbat_MinorGhoul_Stats`             |  95 |     65 |         1.1 |
| sabbatar                                | Sabbat Minor Ghoul (Auto Rifle)              | SMG (`WID_SMG`)                                       | `DA_Sabbat_MinorGhoul_Stats`             |  95 |     65 |         1.1 |
| sabbatsniper                            | Sabbat Minor Ghoul Sniper                    | Sniper Rifle (`WID_SniperRifle`)                      | `DA_Sabbat_MinorGhoul_Stats`             |  95 |     65 |         1.1 |
| sabbatmaj                               | Sabbat Major Ghoul Striker                   | Warhammer (`WID_Warhammer`)                           | `DA_Sabbat_MajorGhoul_Stats`             | 160 |    150 |         1.5 |
| sabbatmajd                              | Sabbat Major Ghoul Distractor                | Mega Shotty (`WID_Shotgun_Pump`)                      | `DA_Sabbat_MajorGhoul_Stats`             | 160 |    150 |         1.5 |
| sabbatvamp                              | Sabbat Vampire (Ambusher)                    | Claws (`WID_Claws`)                                   | `DA_Sabbat_Vampire_Melee_Stats`          | 270 |    150 |         1.8 |
| sabbatvampf                             | Sabbat Vampire (Flusher)                     | Stubby SMG (`WID_Rifle_Dual`)                         | `DA_Sabbat_Vampire_Ranged_Stats`         | 270 |    140 |           - |
| sabbatvamplate                          | Sabbat Vampire Ambusher (Late Game)          | Claws (`WID_Claws`)                                   | `DA_Sabbat_Vampire_Melee_Stats`          | 270 |    150 |         1.8 |
| sabbatvampflate                         | Sabbat Vampire Flusher (Late Game)           | Stubby SMG (`WID_Rifle_Dual`)                         | `DA_Sabbat_Vampire_Ranged_Stats`         | 270 |    140 |           - |
| inq                                     | Inquisitor (Assault Rifle)                   | IAO Rifle (`WID_Rifle`)                               | `DA_Inquisitor_Ranged_Stats`             | 150 |     40 |         1.5 |
| inqshotgun                              | Inquisitor (Shotgun)                         | IAO Shotgun (`WID_Shotgun`)                           | `DA_Inquisitor_Melee_Stats`              |  95 |     60 |        1.25 |
| inqbaton                                | Inquisitor (Electric Baton)                  | Electric Baton (`WID_ElectricBaton`)                  | `DA_Inquisitor_Melee_Stats`              |  95 |     60 |        1.25 |
| inqsniper / inqsniperbase               | Inquisitor Sniper                            | Sniper Rifle (`WID_SniperRifle`)                      | `DA_Inquisitor_Sniper_Stats`             | 150 |     40 |         1.5 |
| inqxbow                                 | Inquisitor Crossbow Sniper                   | Crossbow (`WID_Crossbow`)                             | `DA_Inquisitor_Ranged_Stats`             | 150 |     40 |         1.5 |
| husk                                    | Husk                                         | Unarmed (`WID_Unarmed`)                               | `DA_Husk_Stats`                          |   - |      5 |           - |
| shovelhead / shovel                     | Shovelhead                                   | Claws (`WID_Claws`)                                   | `DA_Shovelhead_Stats`                    |  50 |     70 |         1.5 |
| shadow                                  | Shadow Demon                                 | Claws (`WID_Claws`)                                   | `DA_Demon_stats`                         |  50 |     65 |         1.5 |
| damsel                                  | Damsel (Enemy)                               | Unarmed (`WID_Unarmed`)                               | `DA_Damsel_Stats`                        |  75 |    180 |          20 |
| cop                                     | Police                                       | Pistol (`WID_Handgun`)                                | `DA_Police_Stats`                        |   - |     20 |           - |
| copin                                   | Police (Indoor)                              | Pistol (`WID_Handgun`)                                | `DA_Police_Stats`                        |   - |     20 |           - |
| pedestrian                              | Pedestrian                                   | Unarmed (`WID_Unarmed`)                               | `DA_Human_Stats`                         |   - |     20 |           - |
| massped / masspedestrian                | Mass Pedestrian                              | Unarmed (`WID_Unarmed`)                               | `DA_Human_Stats`                         |   - |     20 |           - |
| masscop / masspolice                    | Mass Police                                  | Pistol (`WID_Handgun`)                                | `DA_Police_Stats`                        |   - |     20 |           - |
| frank                                   | Human Frank                                  | Unarmed (`WID_Unarmed`)                               | `DA_Human_Stats`                         |   - |     20 |           - |
| bossbenny / benny                       | Boss: Benny                                  | Benny Unarmed (`WID_BennyUnarmed`)                    | `DA_Benny_Stats`                         |  75 |    180 |           - |
| bosschamp / champion                    | Boss: Champion                               | Dual High Cal Revolver (`WID_HighCaliburPistol_Dual`) | `DA_Champion_Stats`                      |  75 |    250 |           - |
| bosssafia / safia                       | Boss: Safia (Cemile)                         | Claws (`WID_Claws`)                                   | `DA_Safia_Stats`                         | 150 |    250 |           - |
| bossysabella / ysabella                 | Boss: Ysabella                               | Ysabella Rapier/Sword (`WID_SwordYsabella`)           | `DA_Ysbella_Stats`                       |  75 |    175 |           - |
| bossysabellabeast / ysabellabeast       | Boss: Ysabella Beast                         | Ysabella Rapier/Sword (`WID_SwordYsabella`)           | `DA_Ysbella_Stats`                       |  75 |    175 |           - |
| bossysabelladiva / ysabelladiva         | Boss: Ysabella Diva                          | Claws (`WID_Claws`)                                   | `DA_Sabbat_Vampire_Melee_Stats`          | 270 |    150 |         1.8 |
| bossysabellapredator / ysabellapredator | Boss: Ysabella Predator                      | Benny Unarmed (`WID_BennyUnarmed`)                    | `DA_Sabbat_Vampire_Melee_Stats`          | 270 |    150 |         1.8 |

## Ranged Weapon Stats

These are raw `BP_WeaponInstance_*` defaults for the WIDs carried by enemy loadouts above.

| Weapon                 | WID                          | AmmoBeforeReload | AmmoMag | PlayerFireRate | PlayerDamage | Projectiles/shot |           MaxAmmo | ShotsPerBurst | ShotFireRate | DamagePerProjectile | DamageTag                         |
| ---------------------- | ---------------------------- | ---------------: | ------: | -------------: | -----------: | ---------------: | ----------------: | ------------: | -----------: | ------------------: | --------------------------------- |
| Crossbow               | `WID_Crossbow`               |                1 |       - |              1 |            - |                1 |                 1 |             1 |          0.1 |                   - | `Data.Damage.Ranged.Crossbow`     |
| IAO Rifle              | `WID_Rifle`                  |               20 |       - |            0.1 |            6 |                1 |                30 |             5 |          0.1 |                 1.5 | `Data.Damage.Ranged.AssaultRifle` |
| Dollar Store M4        | `WID_Rifle_ThinbloodEarly`   |               20 |       - |            0.1 |            6 |                1 |                30 |             5 |          0.1 |                 1.5 | `Data.Damage.Ranged.AssaultRifle` |
| Stubby SMG             | `WID_Rifle_Dual`             |               25 |       - |           0.08 |            4 |                1 |                60 |            15 |         0.08 |                 1.2 | -                                 |
| SMG                    | `WID_SMG`                    |               30 |       - |           0.07 |            3 |                1 |                30 |             - |         0.07 |                 1.5 | -                                 |
| Sniper Rifle           | `WID_SniperRifle`            |                1 |       1 |              1 |           60 |                1 |                 5 |             1 |          0.7 |                  14 | -                                 |
| IAO Shotgun            | `WID_Shotgun`                |                2 |       - |            0.2 |          4.3 |                7 |                 5 |             1 |          1.4 |                   1 | `Data.Damage.Ranged.Shotgun`      |
| Shotgun                | `WID_Shotgun_ThinbloodEarly` |                1 |       1 |            0.7 |          4.8 |               12 |                 4 |             1 |          1.5 |                   1 | `Data.Damage.Ranged.Shotgun`      |
| Mega Shotty            | `WID_Shotgun_Pump`           |                5 |       - |           0.25 |          3.4 |                8 | 10 native default |             5 |          0.8 |                   1 | `Data.Damage.Ranged.Shotgun`      |
| Pistol                 | `WID_Handgun`                |               10 |       - |            0.2 |           10 |                1 |                15 |             6 |          0.5 |                   3 | `Data.Damage.Ranged.Handgun`      |
| Revolver               | `WID_Revolver`               |                6 |       - |            0.2 |           10 |                1 |                 6 |             1 |         1.25 |                3.75 | `Data.Damage.Ranged.Revolver`     |
| High Cal Revolver      | `WID_HighCaliburPistol`      |                6 |       - |           0.25 |           15 |                1 |                 6 |             1 |         1.25 |                3.75 | `Data.Damage.Ranged.Revolver`     |
| Dual High Cal Revolver | `WID_HighCaliburPistol_Dual` |                6 |       - |           0.25 |           15 |                1 |                12 |             4 |         0.35 |                3.75 | `Data.Damage.Ranged.Revolver`     |

For shotguns, projectile/pellet totals from the raw weapon instance are:

- IAO Shotgun: `7 * 1.0 = 7.0` per full shot by `DamagePerProjectile`.
- Shotgun: `12 * 1.0 = 12.0` per full shot by `DamagePerProjectile`.
- Mega Shotty: `8 * 1.0 = 8.0` per full shot by `DamagePerProjectile`.

`PlayerDamage` is the player-wield damage field and is much higher for shotguns because it is tuned separately from NPC `DamagePerProjectile`.

## Ranged Damage Tags On Enemy Stats

These are the ranged `DamageByTag` values present on the enemy stats assets. Blanks mean the stats asset did not export that tag; it does not necessarily mean the weapon cannot deal damage, because many ranged weapon instances also carry direct `DamagePerProjectile`.

| Aliases                   | Weapon                                       | Stats asset                     | Crossbow | AssaultRifle | Handgun | Revolver | Shotgun |
| ------------------------- | -------------------------------------------- | ------------------------------- | -------: | -----------: | ------: | -------: | ------: |
| ghoulpis                  | Pistol (`WID_Handgun`)                       | `DA_Thinblood_MinorGhoul_Stats` |      5.5 |            - |     3.5 |        5 |       1 |
| ghoulrev                  | Revolver (`WID_Revolver`)                    | `DA_Thinblood_MinorGhoul_Stats` |      5.5 |            - |     3.5 |        5 |       1 |
| ghoulsmg                  | Dollar Store M4 (`WID_Rifle_ThinbloodEarly`) | `DA_Thinblood_MinorGhoul_Stats` |      5.5 |            - |     3.5 |        5 |       1 |
| ghoulsho                  | Shotgun (`WID_Shotgun_ThinbloodEarly`)       | `DA_Thinblood_MinorGhoul_Stats` |      5.5 |            - |     3.5 |        5 |       1 |
| ghoulsniper               | Sniper Rifle (`WID_SniperRifle`)             | `DA_Thinblood_MinorGhoul_Stats` |      5.5 |            - |     3.5 |        5 |       1 |
| ghoulrifle                | IAO Rifle (`WID_Rifle`)                      | `DA_Thinblood_MinorGhoul_Stats` |      5.5 |            - |     3.5 |        5 |       1 |
| ghoulinqshotgun           | IAO Shotgun (`WID_Shotgun`)                  | `DA_Thinblood_MinorGhoul_Stats` |      5.5 |            - |     3.5 |        5 |       1 |
| sabbatpis                 | High Cal Revolver (`WID_HighCaliburPistol`)  | `DA_Sabbat_MinorGhoul_Stats`    |        - |            - |       - |       10 |       - |
| sabbatar                  | SMG (`WID_SMG`)                              | `DA_Sabbat_MinorGhoul_Stats`    |        - |            - |       - |       10 |       - |
| sabbatsniper              | Sniper Rifle (`WID_SniperRifle`)             | `DA_Sabbat_MinorGhoul_Stats`    |        - |            - |       - |       10 |       - |
| inq                       | IAO Rifle (`WID_Rifle`)                      | `DA_Inquisitor_Ranged_Stats`    |        - |            2 |       - |        - |     1.4 |
| inqsniper / inqsniperbase | Sniper Rifle (`WID_SniperRifle`)             | `DA_Inquisitor_Sniper_Stats`    |        - |            1 |       - |        - |       2 |
| inqxbow                   | Crossbow (`WID_Crossbow`)                    | `DA_Inquisitor_Ranged_Stats`    |        - |            2 |       - |        - |     1.4 |
| cop                       | Pistol (`WID_Handgun`)                       | `DA_Police_Stats`               |      5.5 |            - |     3.5 |        - |       1 |
| copin                     | Pistol (`WID_Handgun`)                       | `DA_Police_Stats`               |      5.5 |            - |     3.5 |        - |       1 |
| masscop / masspolice      | Pistol (`WID_Handgun`)                       | `DA_Police_Stats`               |      5.5 |            - |     3.5 |        - |       1 |

## Melee And Unarmed Damage

These values are from each enemy's stats asset `DamageByTag`. `Armed L/H/C` means `LightAttack.Armed` / `HeavyAttack.Armed` / `Counter.Armed`; `Unarmed L/H/C` is the same for unarmed tags.

| Aliases                                 | Weapon                                               | Stats asset                              |  HP |   Stun | AttackPower | Armed L/H/C | Unarmed L/H/C |
| --------------------------------------- | ---------------------------------------------------- | ---------------------------------------- | --: | -----: | ----------: | ----------: | ------------: |
| mannequin                               | Unarmed (`WID_Unarmed`)                              | `DA_Mannequin_Stats`                     |   - |     15 |           - |       -/-/- |    3.75/7.5/- |
| dummy / testdummy                       | Unarmed (`WID_Unarmed`)                              | `DA_TestDummy`                           |  75 | 100000 |           - |  7.5/14/7.5 | 3.75/7.5/3.75 |
| ghoul                                   | Baseball Bat (`WID_BaseballBat`)                     | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |  7.5/14/7.5 | 3.75/7.5/3.75 |
| ghoulknife                              | Knife (`WID_Knife`)                                  | `DA_Thinblood_MinorGhoul_Knife_Stats`    |  75 |     65 |           - |    5/10/7.5 | 3.75/7.5/3.75 |
| ghoulmac                                | Machete (`WID_Machete`)                              | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |  7.5/14/7.5 | 3.75/7.5/3.75 |
| ghoulun                                 | Unarmed (`WID_Unarmed`)                              | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |  7.5/14/7.5 | 3.75/7.5/3.75 |
| ghoulbaton                              | Electric Baton (single) (`WID_ElectricBaton_Single`) | `DA_Thinblood_MinorGhoul_Stats`          |  75 |     65 |           - |  7.5/14/7.5 | 3.75/7.5/3.75 |
| majorgs                                 | Striker Hammer (`WID_Striker_Hammer`)                | `DA_Thinblood_MajorGhoul_Stats`          | 120 |    150 |         1.5 |  7.5/14/7.5 |     5/12/3.75 |
| majorgslate                             | Striker Hammer (`WID_Striker_Hammer`)                | `DA_Thinblood_MajorGhoul_LateGame_Stats` | 120 |    150 |         1.5 |  7.5/14/7.5 | 3.75/7.5/3.75 |
| thinvamp                                | Claws (`WID_Claws`)                                  | `DA_Thinblood_Vampire_Melee_Stats`       | 270 |    150 |         2.5 |  7.5/14/7.5 | 3.75/7.5/3.75 |
| thinvamplate                            | Claws (`WID_Claws`)                                  | `DA_Thinblood_Vampire_Melee_Stats`       | 270 |    150 |         2.5 |  7.5/14/7.5 | 3.75/7.5/3.75 |
| thinfort                                | Unarmed (`WID_Unarmed`)                              | `DA_Thinblood_Fortidude_Stats`           | 120 |    300 |         1.5 |  7.5/14/7.5 |     5/12/3.75 |
| sabbat                                  | Sword (`WID_Sword`)                                  | `DA_Sabbat_MinorGhoul_Sword_Stats`       |  95 |     65 |         1.1 |   10/18/7.5 |      -/-/3.75 |
| sabbatclub                              | Spiked Club (`WID_SpikedClub`)                       | `DA_Sabbat_MinorGhoul_Stats`             |  95 |     65 |         1.1 |  7.5/14/7.5 |      -/-/3.75 |
| sabbatmaj                               | Warhammer (`WID_Warhammer`)                          | `DA_Sabbat_MajorGhoul_Stats`             | 160 |    150 |         1.5 |  7.5/14/7.5 | 3.75/7.5/3.75 |
| sabbatvamp                              | Claws (`WID_Claws`)                                  | `DA_Sabbat_Vampire_Melee_Stats`          | 270 |    150 |         1.8 |  7.5/14/7.5 | 3.75/7.5/3.75 |
| sabbatvamplate                          | Claws (`WID_Claws`)                                  | `DA_Sabbat_Vampire_Melee_Stats`          | 270 |    150 |         1.8 |  7.5/14/7.5 | 3.75/7.5/3.75 |
| inqbaton                                | Electric Baton (`WID_ElectricBaton`)                 | `DA_Inquisitor_Melee_Stats`              |  95 |     60 |        1.25 |  7.5/14/7.5 | 3.75/7.5/3.75 |
| husk                                    | Unarmed (`WID_Unarmed`)                              | `DA_Husk_Stats`                          |   - |      5 |           - |       -/-/- |         1/2/2 |
| shovelhead / shovel                     | Claws (`WID_Claws`)                                  | `DA_Shovelhead_Stats`                    |  50 |     70 |         1.5 |       -/-/- |  3.75/7.5/7.5 |
| shadow                                  | Claws (`WID_Claws`)                                  | `DA_Demon_stats`                         |  50 |     65 |         1.5 |       -/-/- |         2/2/2 |
| damsel                                  | Unarmed (`WID_Unarmed`)                              | `DA_Damsel_Stats`                        |  75 |    180 |          20 |  7.5/14/7.5 | 3.75/7.5/3.75 |
| pedestrian                              | Unarmed (`WID_Unarmed`)                              | `DA_Human_Stats`                         |   - |     20 |           - |       -/-/- |         2/2/- |
| massped / masspedestrian                | Unarmed (`WID_Unarmed`)                              | `DA_Human_Stats`                         |   - |     20 |           - |       -/-/- |         2/2/- |
| frank                                   | Unarmed (`WID_Unarmed`)                              | `DA_Human_Stats`                         |   - |     20 |           - |       -/-/- |         2/2/- |
| bossbenny / benny                       | Benny Unarmed (`WID_BennyUnarmed`)                   | `DA_Benny_Stats`                         |  75 |    180 |           - |       -/-/- |        7/15/4 |
| bosssafia / safia                       | Claws (`WID_Claws`)                                  | `DA_Safia_Stats`                         | 150 |    250 |           - |    -/14/7.5 |     -/15/3.75 |
| bossysabella / ysabella                 | Ysabella Rapier/Sword (`WID_SwordYsabella`)          | `DA_Ysbella_Stats`                       |  75 |    175 |           - |      6/10/6 |         -/-/3 |
| bossysabellabeast / ysabellabeast       | Ysabella Rapier/Sword (`WID_SwordYsabella`)          | `DA_Ysbella_Stats`                       |  75 |    175 |           - |      6/10/6 |         -/-/3 |
| bossysabelladiva / ysabelladiva         | Claws (`WID_Claws`)                                  | `DA_Sabbat_Vampire_Melee_Stats`          | 270 |    150 |         1.8 |  7.5/14/7.5 | 3.75/7.5/3.75 |
| bossysabellapredator / ysabellapredator | Benny Unarmed (`WID_BennyUnarmed`)                   | `DA_Sabbat_Vampire_Melee_Stats`          | 270 |    150 |         1.8 |  7.5/14/7.5 | 3.75/7.5/3.75 |

## Melee Weapon Data

This is the WID/instance layer. It explains what can plausibly become a dropped/throwable weapon, but combat damage still comes from the enemy stats table above.

| Weapon                  | WID                        | Instance                             | Ability set                       | Throwable/drop data                                                                            |
| ----------------------- | -------------------------- | ------------------------------------ | --------------------------------- | ---------------------------------------------------------------------------------------------- |
| Baseball Bat            | `WID_BaseballBat`          | `BP_WeaponInstance_BaseballBat_C`    | `DA_BaseballBat_AbilitySet`       | inherits little weapon throwable, 10 damage; has world spawner                                 |
| Electric Baton          | `WID_ElectricBaton`        | `BP_WeaponInstance_ElectricBaton_C`  | `DA_BaseballBat_AbilitySet`       | inherits little weapon throwable, 10 damage; enemy-harvest path, no normal world spawner found |
| Electric Baton (single) | `WID_ElectricBaton_Single` | `BP_WeaponInstance_ElectricBaton_C`  | `DA_BaseballBat_AbilitySet`       | inherits little weapon throwable, 10 damage; enemy-held                                        |
| Knife                   | `WID_Knife`                | `BP_WeaponInstance_Knife_C`          | `DA_Knife_AbilitySet`             | `DA_Throwable_Weapon_MediumDamage`, 15 damage; has world spawner                               |
| Machete                 | `WID_Machete`              | `BP_WeaponInstance_Machete_C`        | `DA_Machete_AbilitySet`           | `DA_Throwable_Weapon_MediumDamage`, 15 damage; has world spawner                               |
| Spiked Club             | `WID_SpikedClub`           | `BP_WeaponInstance_SpikedClub_C`     | `DA_SpikedClub_AbilitySet`        | `DA_Throwable_Weapon_MediumDamage`, 15 damage; has world spawner                               |
| Striker Hammer          | `WID_Striker_Hammer`       | `BP_WeaponInstance_Hammer_C`         | `DA_Hammer_AbilitySet`            | `DA_Throwable_Weapon_HeavyDamage`, 50 damage; hammer/sledge world spawner                      |
| Sword                   | `WID_Sword`                | `BP_WeaponInstance_Sword_C`          | `DA_Sword_AbilitySet`             | `DA_Throwable_Weapon_MediumDamage`, 15 damage; has world spawner                               |
| Ysabella Rapier/Sword   | `WID_SwordYsabella`        | `BP_WeaponInstance_Sword_Ysabella_C` | `DA_Sword_AbilitySet`             | `DA_Throwable_Weapon_MediumDamage`, 15 damage; enemy-held rapier                               |
| Warhammer               | `WID_Warhammer`            | `BP_WeaponInstance_Warhammer_C`      | `DA_Warhammer_AbilitySet`         | `DA_Throwable_Weapon_Obliterate`, 65 damage; has world spawner                                 |
| Unarmed                 | `WID_Unarmed`              | `BP_WeaponInstance_Unarmed_C`        | `DA_MinorGhoulUnarmed_AbilitySet` | no weapon drop                                                                                 |
| Claws                   | `WID_Claws`                | `BP_WeaponInstance_Claws_C`          | `DA_MinorGhoulUnarmed_AbilitySet` | no weapon drop                                                                                 |
| Benny Unarmed           | `WID_BennyUnarmed`         | `BP_WeaponInstance_BennyUnarmed_C`   | `DA_Benny_AbilitySet`             | no weapon drop                                                                                 |

## Crossbow Exploding Bolt

The crossbow is special because the attackset's direct ranged damage is only `0.1`; the real payload is the explosive bolt.

- `Attackset_Crossbow`: `FireRate = 0.4`, `Ranged Damage = 0.1`, `RangedProjectileClass = WrestlerProjectile_ExplodingBolt_C`, `ProjectileSpeed = 6000`, `Quiet = true`.
- `Attackset_Crossbow_Dual`: `FireRate = 0.1`, `Ranged Damage = 0.1`, same projectile class and speed.
- `BP_WeaponInstance_Crossbow_C`: `AmmoBeforeReload = 1`, `MaxAmmo = 1`, `ShotsPerBurst = 1`, `ShotFireRate = 0.1`, `DamageTag = Data.Damage.Ranged.Crossbow`.
- `WrestlerProjectile_ExplodingBolt_C` spawns/uses `BP_Throwable_Bolt_C`.
- `BP_Throwable_Bolt_C` is explosive and spawns `BP_Explosion_TickDelay_C`.
- `BP_Explosion_TickDelay_C` inherits the defaults from `BP_Explosion_C`.

Explosion defaults inherited from `BP_Explosion_C`:

| Field                          |       Value |
| ------------------------------ | ----------: |
| `ExplodeImmediately`           |        true |
| `AffectEnemies`                |        true |
| `AffectPlayer`                 |        true |
| `AffectPhysics`                |        true |
| `EnemyDamage`                  |          80 |
| `EnemyDamageRange`             |  150 to 500 |
| `EnemyForce`                   |         800 |
| `EnemyForceRange`              |  200 to 300 |
| `Enemy Stumble Range`          |         700 |
| `PlayerDamage`                 |          15 |
| `PlayerDamageRange`            |  150 to 300 |
| `PlayerForce`                  |         700 |
| `PlayerForceRange`             | 200 to 1000 |
| `Player Knocked Range`         |         300 |
| `PhysicsForce`                 |        7000 |
| `PhysicsForceRadius`           |         600 |
| `Phys Damage`                  |           5 |
| `PhysDamageRange`              |         250 |
| `Noise Range`                  |        5000 |
| `LightFlashTime`               |         0.1 |
| `ShouldSendExplosionKillEvent` |        true |
| `InitialLifeSpan`              |           1 |

## Potential Drops

I did not find per-enemy random loot/drop tables in `DA_ModularEnemies`, enemy stats assets, or the enemy pawn exports. What the export does expose:

- `BP_EnemyCharacterBase.DropTKObjectChance = 0.25`, which appears to be a generic chance for a TK object rather than a specific weapon loot table.
- `BP_EnemyCharacterBase` owns `WrestlerWeaponStowComponent`.
- `WrestlerWeaponStowComponent` has weapon/drop fields including `InitialWeaponClass`, `OverrideWeaponClass`, `InitialWeaponInfos`, `InitialWeaponEquipped`, `InitialRangedWeaponInstanceClass`, `OverrideRangedWeaponInstanceClass`, `DroppedWeaponSkeletalMesh`, and `DroppedWeaponTransform`.
- `BP_Weapon_C:DropThrowable` is the common drop function, with overrides/paths on some weapons such as `BP_Rifle_Dual_C` and `BP_ElectricBaton_C`.
- Disarm and backup weapon swaps are broken out in the next section; the important special case is Mega Shotty major ghouls swapping through `Distractor_SwapToPistol` into a High Cal Revolver path.
- The debug console's weapon spawning code notes that Electric Baton and Dual Rifle lack normal world spawners in this export and are harvested from enemy hands by spawning the enemy hidden, calling `DropThrowable`, teleporting the result, then destroying the enemy.

Throwable weapon data assets:

| Throwable data asset               | Damage | Audio stimulus range | Used by                                                               |
| ---------------------------------- | -----: | -------------------: | --------------------------------------------------------------------- |
| `DA_Throwable_Weapon_LittleDamage` |     10 |                 1600 | ranged base throwable, baseball bat/electric baton inherited defaults |
| `DA_Throwable_Weapon_MediumDamage` |     15 |                 1600 | knife, machete, spiked club, sword, Ysabella sword                    |
| `DA_Throwable_Weapon_HeavyDamage`  |     50 |                 1600 | striker hammer                                                        |
| `DA_Throwable_Weapon_Obliterate`   |     65 |                 1600 | warhammer                                                             |

## Disarm And Backup Weapon Swaps

The disarm behavior is split between task collections, weapon-swap gameplay abilities, and owner tags on the held weapon actor. The Mega Shotty path is not the same as the generic backup-knife path: `BP_Shotgun_Pump` has no exported `TagsForOwner`, while major ghoul distractors can enter `BigBoyUnarmed` and run `Distractor_SwapToPistol`.

| Situation                                                   | Task / ability                                                                                                         | Backup weapon                                 | Gate / timing                                                                                               | Resulting task collection             | Notes                                                                                                                                                                       |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mega Shotty major ghoul disarmed / big-boy unarmed fallback | `BigBoyUnarmed` includes `Distractor_SwapToPistol`, which runs `GA_Distractor_Pullpistol`                              | High Cal Revolver (`WID_HighCaliburPistol`)   | Requires `Combat.General.Distractor`; distance score ideal 200, max 300, absolute and inverted; cooldown 3s | `MeleePistol`                         | Uses `Animset_USK_Base_Pistol_Untrained_Revolver`, `DA_moveset_Distractor`, `StowWeapon=false`. This is the observed Mega Shotty major ghoul to High Cal Revolver fallback. |
| Generic unarmed backup weapon path                          | `Unarmed_SwapToKnife`, which runs `GA_disarmed_WeaponSwap_Toknife`                                                     | Knife (`WID_Knife`) in the exported swap info | Requires `BP_WrestlerTaskScore_HasBackupWeapon`; cooldown 1s                                                | `BackupKnife`                         | The ability has a `HasPistol` bool, but the exported default `WeaponSwapInfos` points at knife, knife animset, and minor ghoul movement.                                    |
| Inquisition sniper / crossbow close-range swap              | `Inquisition_SwapToPistol`, which runs `GA_WeaponSwap_ToPistol`                                                        | Pistol (`WID_Handgun`)                        | Distance threshold less than 600, weight 500; cooldown 0.5s                                                 | `Inquisitor_Pistol`                   | Used by `Inquisitor_Sniper` and `Inquisitor_SniperCrossbowRifle`.                                                                                                           |
| Sabbat sniper swap                                          | `Sabbat_SwapToPistol`, which runs `GA_WeaponSwap_ToPistol_Sabbat`                                                      | High Cal Revolver (`WID_HighCaliburPistol`)   | Distance/angle/seen-action/initial-weapon task scores                                                       | `Sabbat_MinorGhoul_HighCaliburPistol` | The post-swap set has High Cal ranged attack, defensive dash, backoff kick, block, melee attack, reload, and return-to-initial.                                             |
| Melee enemy pistol swap                                     | `Melee_SwapToPistol`, which runs `GA_Melee_WeaponSwap_ToPistol`                                                        | Pistol (`WID_Handgun`)                        | Path-check score                                                                                            | `MeleePistol`                         | Used by Inquisition baton, Sabbat melee, and Thinblood ambusher collections.                                                                                                |
| Melee enemy SMG swap                                        | `Melee_SwapToSMG`, which runs `GA_Melee_WeaponSwap_ToSMG`                                                              | SMG (`WID_SMG`)                               | Path-check score                                                                                            | `MeleeSMG`                            | Used by Sabbat striker/vampire variants and Ysabella Diva/Predator task sets.                                                                                               |
| Return to starting weapon                                   | `Shared_WeaponSwap_BackToInitial`, `Shared_WeaponSwap_BackToInitial_ranged`, or `Shared_MeleeWeaponSwap_BackToInitial` | Initial weapon                                | Task collection dependent                                                                                   | Original task set                     | Implemented by `GA_WeaponSwap_ReturnToInitial` / `GA_MeleeWeaponSwap_ReturnToInitial` with `ReturnToInitialWeapon=true` and `StowWeapon=false`.                             |

Backup owner tags found on weapon actors:

- `Combat.General.HasKnife`: `BP_Rifle`, `BP_Rifle_ThinbloodEarly`, `BP_Crossbow`, `BP_ElectricBaton`, `BP_SMG`, `BP_Shotgun`, `BP_Shotgun_ThinbloodEarly`, `BP_SniperRifle`.
- `Combat.General.HasPistol`: `BP_Rifle`, `BP_ElectricBaton`, `BP_SpikedClub`, `BP_Sword`, `BP_Sword_Ysabella`.
- `Combat.General.HasPhosphor`: `BP_Rifle`, `BP_Shotgun`.
- No `TagsForOwner` export was found on `BP_Shotgun_Pump`, so the Mega Shotty backup behavior appears to come from the major ghoul distractor task path rather than the weapon actor itself.

Useful post-swap task collections:

| Collection         | Tasks                                                                                                                                                                                                                                               |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MeleePistol`      | `Shared_Throw_Grenade`, `Shared_Throw_PhosphorGrenade`, `Shared_MeleeWeaponSwap_BackToInitial`, `Shared_RangedAttack_Pistol`, `Shared_RangedReload`                                                                                                 |
| `MeleeSMG`         | `Shared_MeleeWeaponSwap_BackToInitial`, `Shared_RangedAttack_SMG`, `Shared_RangedReload`                                                                                                                                                            |
| `BackupKnife`      | `MeleeWeapon_HeavyAttack`, `Shared_Interrupt_HeavyAttack`, `MeleeWeapon_MediumAttack`, `MeleeWeapon_LightAttack`, `Special_DefensiveDash_Weak`, `MeleeWeapon_BackOff`, `Shared_Throw_PhosphorGrenade`, `Shared_Throw_Grenade`, `Shared_Throw_Stone` |
| `BigBoyUnarmed`    | `Special_EarthShock`, `Distractor_SwapToPistol`, `Unarmed_LightAttack`, `Unarmed_HeavyAttack`, `Special_Charge`, `Shared_Interrupt_HeavyAttack`, `LargeEnemy_BackOff`, `Shared_Throw_Boulder`                                                       |
| `DistractorPistol` | `Special_Recall`, `Shared_RangedAttack_HighCaliburPistol`, `Special_DefensiveDash_Weak`, `Shared_Kick_BackOff_Combo`, `Ranged_MeleeAttack`, `Shared_RangedReload`, `Special_TheftOfVitae`                                                           |

Note: `DistractorPistol` exists as a collection, but `GA_Distractor_Pullpistol` hard-exports the task override name as `MeleePistol` in this build.

## Special Attacks And Discipline-Like Abilities

These are task collection names from `DA_ModularEnemyTasks`. They expose which behavior options each modular enemy can pick, but individual animation notifies, hit windows, and task-score conditions still live in the referenced task assets.

| Unit / aliases                                                   | Task collection(s)                                                                             | Notable attacks / specials                                                                                                                                                                                                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bossysabella`, `ysabella`, `bossysabellabeast`, `ysabellabeast` | `Boss_Ysabella`, `Boss_Ysabella_Beast`                                                         | `Special_DefensiveDash_Ysabella`, `Ysabella_HeavyAttack`, `Ysabella_MediumAttack`, `Ysabella_LightAttack`, `Shared_Interrupt_HeavyAttack`.                                                                                                       |
| `bossysabelladiva`, `ysabelladiva`                               | `Boss_Ysabella_Diva`                                                                           | Ambusher-style `Special_Kick_Dash_Dodge_VariableCombo`, `Special_DefensiveDash_Vampire`, `Special_Block_Ambusher`, `Ambusher_VariedAttack`, `Melee_SwapToSMG`, `Special_TheftOfVitae`.                                                           |
| `bossysabellapredator`, `ysabellapredator`                       | `Boss_Ysabella_Predator`                                                                       | Benny-style `Special_DefensiveDash_Benny`, `Special_Charge_Benny_P1`, `Special_EarthShock_Benny`, `HeavyAttack_Benny`, `Interrupt_HeavyAttack_Benny`, `Special_Block_Benny`, `MediumAttack_Benny`, `LightAttack_Benny`, `Melee_SwapToSMG`.       |
| `bossbenny`, `benny`                                             | `Boss_Benny`                                                                                   | Defensive dash, three charge phases, earth shock, heavy/medium/light attacks, block/counter, boulder throw.                                                                                                                                      |
| `bosschamp`, `champion`                                          | `Boss_champion`                                                                                | Vampire defensive dash, kick/dash/dodge variable combo, `ChampionAttacks`, `RangedAttack_ChampEvasive`, reload.                                                                                                                                  |
| `bosssafia`, `safia`                                             | `Boss_Safia`                                                                                   | `Special_TheftOfVitae_Safia`, `Special_BloodCurse_Safia`, `Safia_LightMelee`, `Special_BloodSalvo_Safia`.                                                                                                                                        |
| `majorgd`, `majorgdlate`, `sabbatmajd`                           | Distractor collections                                                                         | Thinblood distractor has `Special_TheftOfVitae`, `Distractor_RangedAttack`, reload, heavy interrupt. Late-game and Sabbat versions also add `Special_Recall`. Disarmed/big-boy fallback is `BigBoyUnarmed`, including `Distractor_SwapToPistol`. |
| `majorgs`, `majorgslate`, `sabbatmaj`                            | Striker collections                                                                            | Thinblood striker uses `Special_Charge`; late-game adds `Special_EarthShock`. Sabbat warhammer uses `Special_SabbatStriker_EarthShock`, `Special_SabbatStriker_Charge`, Sabbat melee attacks, and `Melee_SwapToSMG`.                             |
| `thinvamp`, `thinvamplate`, `sabbatvamp`, `sabbatvamplate`       | Ambusher collections                                                                           | Kick/dash/dodge variable combo, vampire defensive dash, ambusher block, varied attack. Late-game ambushers add `Special_CloakofShadows`. Thinblood ambushers swap to pistol; Sabbat ambushers swap to SMG.                                       |
| `thinvampf`, `thinvampflate`, `sabbatvampf`, `sabbatvampflate`   | Flusher collections                                                                            | `Special_PositionSwap`, vampire defensive dash, kick/dash/dodge variable combo, evasive rifle attack, reload. Late-game flushers add `Special_BlurredMomentum_Flusher`.                                                                          |
| `thinfort`                                                       | `Thinblood_Fortidude`                                                                          | `Special_DrinkElixir`, unarmed light/heavy, heavy interrupt, backoff, boulder throw.                                                                                                                                                             |
| Thinblood melee minors                                           | Bat, knife, machete, electric baton collections                                                | Armed heavy/medium/light attacks, heavy interrupt, weak defensive dash, melee backoff/block, stone throw, taunt. Baton uses `Shared_Block` rather than the weaker melee block name.                                                              |
| `ghoulun`                                                        | `Thinblood_MinorGhoul_Unarmed`                                                                 | `Unarmed_LightAttack`, heavy interrupt, weak defensive dash/block, grenade/phosphor/stone throws, taunt, `Unarmed_SwapToKnife`.                                                                                                                  |
| Thinblood ranged minors                                          | Pistol, revolver, SMG, shotgun, IAO rifle, IAO shotgun, sniper collections                     | Ranged attack by weapon, reload, close melee/backoff where present, defensive dash on pistol/revolver/sniper, and grenade spam on pistol/SMG.                                                                                                    |
| Sabbat minors                                                    | Sword, club, high-cal, automatic rifle, sniper collections                                     | Sabbat melee can `Melee_SwapToPistol`; Sabbat sniper can `Sabbat_SwapToPistol`; automatic rifle can throw grenades; pistol has return-to-initial, defensive dash, block, kick/backoff, melee, reload.                                            |
| Inquisition                                                      | Tactical rifle, shotgun, baton, sniper, crossbow collections                                   | IAO rifle aimed/burst attacks, shotgun attack, phosphor grenade, defensive dash, close kick/backoff/melee. Baton has melee block/counter and `Melee_SwapToPistol`. Sniper/crossbow use `Inquisition_SwapToPistol`.                               |
| `shovelhead`, `shovel`                                           | `Shovelhead`                                                                                   | `Special_Leap`, `Shead_Lightattack`, `Shead_FranticEvade`, taunt.                                                                                                                                                                                |
| `husk`, `shadow`                                                 | `Husk`, `ShadowDemon`                                                                          | Husk medium/light/heavy attack set; ShadowDemon reuses the same Husk attacks.                                                                                                                                                                    |
| `mannequin`                                                      | `Mannequin`                                                                                    | Unarmed heavy, heavy interrupt, mannequin slow/fast attacks, `Throw_mannequin`.                                                                                                                                                                  |
| Police / pedestrians / Damsel / dummy                            | `Police`, `Mass_Police`, `Pedestrian`, `Mass_Pedestrian`, `Damsel`, `TestDummy`, `Human_Frank` | Police use pistol/mag-dump/backoff/reload. Pedestrians and Frank have simple light/stone/interruption tasks. Damsel has unarmed light. Test dummy has light/heavy.                                                                               |

Closest discipline-like names in the export are task/ability names rather than clean per-unit discipline enums:

- `Special_CloakofShadows` on late-game ambushers.
- `Special_BlurredMomentum_Flusher` on late-game flushers.
- `Special_TheftOfVitae` and `Special_Recall` on major ghoul distractors; Safia has `Special_TheftOfVitae_Safia`.
- `Special_PositionSwap` on flushers.
- `Special_DrinkElixir` on `Thinblood_Fortidude`.
- `Special_Charge`, `Special_EarthShock`, and Sabbat/Benny variants on major ghouls and Benny/Ysabella Predator.
- `Special_BloodCurse_Safia` and `Special_BloodSalvo_Safia` on Safia.

## Perception And Detection

Perception assignments come from the `ETD_*.json` enemy type definitions. Numeric ranges are Unreal units. In the sight table, `W/H/F` means width, height, and forward offset of that coffin-sight pane.

| Enemy definitions                                | Base perception                                                                                         | State overrides / tags                                                                                                                                                                                                                                                                     |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Normal Thinblood and Sabbat ghouls/vampires      | `DA_EnemySenseConfig_Default` + `DA_EnemyAwarenessConfig_Default`                                       | Combat uses `DefaultCombat`; chase uses `Chase_Default`; fear uses `Fear`; heightened/investigate/hostile search use `Heightened_Default`. Sabbat variants are on team `Sabbat`; ghoul/vampire/scary/long-legs tags vary by ETD.                                                           |
| Thinblood/Sabbat sniper ghoul ETDs               | Base default sense/awareness plus sniper focus                                                          | Heightened uses `DA_EnemySenseConfig_Heightened_Inquisition_Sniper`; combat uses `DA_EnemySenseConfig_Heightened_Inquisition`; fear uses `Fear`; combat/chase awareness uses `DefaultCombat`. Startup tags include `Combat.General.Sniper`; Sabbat sniper also has `Combat.General.Scary`. |
| Inquisition normal/ranged/shotgun                | `DA_EnemySenseConfig_Inquisition` + `DA_EnemyAwarenessConfig_Default`                                   | Team `IAO`, startup tags include `Data.Glow` and `Species.Human.IAO`; combat/chase/fear/heightened state overrides use the Inquisition/default perception stack.                                                                                                                           |
| `Inquisitor_Sniper`                              | `DA_EnemySenseConfig_Relaxed_Inquisition_Sniper` + `DA_EnemyAwarenessConfig_Inquisition_Sniper`         | Focus config is sniper; heightened/combat sense uses `DA_EnemySenseConfig_Heightened_Inquisition`; fear uses `Fear`; combat/chase awareness uses `DefaultCombat`.                                                                                                                          |
| Boss Benny/Camile/Champion/Ysabella/Ysabella DLC | `DA_EnemySenseConfig_Boss` + `DA_EnemyAwarenessConfig_Boss`                                             | Team usually `Sabbat`; boss startup tags include boss/show UI style tags. Boss sense has extremely large hearing and last-seen auto-success.                                                                                                                                               |
| Ysabella Diva / Predator                         | Default sense + default awareness                                                                       | Team `Sabbat`; startup tags include `Combat.Status.StunRegenerable`, `Species.Vampire`, `Combat.General.Scary`, `Combat.General.LongLegs`.                                                                                                                                                 |
| Shovelhead                                       | `DA_EnemySenseConfig_Blind` + `DA_EnemyAwarenessConfig_Shovelhead_NonCombat`                            | Combat switches to `DA_EnemySenseConfig_Shovelhead_Combat` and `DA_EnemyAwarenessConfig_Shovelhead_Combat`; team `Sabbat`; tags include `Species.Unbirthed`, `Combat.General.Oversized`, `Combat.Status.NoFeed`, `Combat.General.Scary`.                                                   |
| Shadow Demon                                     | Default base sense, but combat uses `DA_EnemySenseConfig_Shovelhead_Combat`; shovelhead awareness stack | Adds `Combat.Status.NoStealthKill`, `Combat.Status.DamageImmune`, `Combat.General.HideUI`, `Combat.General.Targeting.Blocked`, `Combat.Status.InOblivion`.                                                                                                                                 |
| Damsel                                           | `DA_EnemySenseConfig_Damsel` + `DA_EnemyAwarenessConfig_Damsel`                                         | Adds proximity sense; team neutral; startup tag `Species.Vampire`.                                                                                                                                                                                                                         |
| Mannequin                                        | `DA_EnemySenseConfig_Mannequin` + `DA_EnemyAwarenessConfig_Default`                                     | Huge all-around coffin-sight panes; tags include mannequin species/character tags. `DA_EnemyAwarenessConfig_Mannequin` exists, but the ETD does not point at it in this export.                                                                                                            |
| Police, humans, pedestrians                      | Default sense/awareness unless overridden by their ETD                                                  | Teams vary between cops, pedestrians, neutral, or IAO depending on ETD.                                                                                                                                                                                                                    |

Sense config ranges:

| Sense config                    | Sight type / range                                                                        |                  Hearing | Other senses / notes                                                                          |
| ------------------------------- | ----------------------------------------------------------------------------------------- | -----------------------: | --------------------------------------------------------------------------------------------- |
| `Default`                       | Coffin sight: Mid W1800; Far W3000/H1000/F2800; auto last-seen 100; sight age 2           |                     5000 | Sight, hearing, damage, touch.                                                                |
| `Chase_Default`                 | Mid W1800/H1000; Far W3000/H2000/F3400; auto 100; age 2                                   |                     2500 | Chase narrows hearing but pushes far pane forward.                                            |
| `DefaultCombat`                 | Mid W1800/H1800; Far W3000/H3000/F4000; auto 100; age 2                                   |                      700 | Combat sight is taller/longer, but hearing drops sharply.                                     |
| `Heightened_Default`            | Mid W1800/H1000; Far W3000/H2000/F2800; auto 100; age 2                                   |                     8000 | Heightened hearing is much larger than default.                                               |
| `Fear`                          | Near F0; Mid W500/H300/F300; Far W700/H400/F700; auto 50; age 2                           |                      600 | Very short fear perception.                                                                   |
| `Inquisition`                   | Mid W1800; Far W3000/H1000/F4000; auto 100; age 2                                         |                     7500 | Longer forward sight and hearing than default.                                                |
| `Heightened_Inquisition`        | Mid H1000/F400; Far W2000/H2000/F7500; auto 200                                           |                     7500 | Very long forward far pane.                                                                   |
| `Relaxed_Inquisition_Sniper`    | Near W600/H550; Mid W1400/H1200/F800; Far W500/H500/F7000                                 |                     7500 | Narrow long sniper far pane.                                                                  |
| `Heightened_Inquisition_Sniper` | Near W600/H550; Mid W500/H800/F800; Far W600/H1600/F10000                                 |                     7500 | Even longer sniper far pane.                                                                  |
| `Boss`                          | Near W500/H800; Mid W3600/H1600/F1200; Far W6000/H3200/F6000; auto last-seen 10000; age 2 |                   500000 | Bosses are effectively impossible to lose by sound at normal encounter scale.                 |
| `Damsel`                        | Same coffin sight as default                                                              |                     5000 | Adds proximity sense range 5000.                                                              |
| `Mannequin`                     | Near W3000/H3000/F-1500; Mid W3000/H3000/F0; Far W3000/H3000/F1500                        |                     5000 | All-around block-like sight volume.                                                           |
| `Blind`                         | Vision cone radius 500, lose radius 500, angle 180                                        |                     5000 | Proximity 600; hearing max age 10; used by noncombat shovelhead.                              |
| `Shovelhead_Combat`             | Standard sight radius 2500, lose radius 2500, angle 180                                   | not exported; max age 10 | Includes proximity sense and damage/touch; used in shovelhead combat and Shadow Demon combat. |

Awareness config rates:

| Awareness config       | Detect up/down | Awareness up/down |                   Proximity | Damage | Lost-sight delay | Distance curve                             |
| ---------------------- | -------------: | ----------------: | --------------------------: | -----: | ---------------: | ------------------------------------------ |
| `Default`              |      2.5 / 1.5 |           2 / 0.5 |                  detect 0.2 |      1 |              2.5 | 0:1, 550:1, 850:0.9, 1500:0.6, 1900:0.3    |
| `DefaultCombat`        |       3 / 0.75 |            25 / - |                           - |      1 |              2.5 | same default distance curve                |
| `Heightened_Default`   |          4 / 1 |           3 / 0.3 |                           - |      1 |              2.5 | 300:5, 800:1, 2000:1, 2600:0.6             |
| `Inquisition`          |        5 / 1.5 |           5 / 0.5 |                           - |      1 |              2.5 | same default distance curve                |
| `Inquisition_Sniper`   |       10 / 1.5 |         1.5 / 0.5 |                           - |      1 |              2.5 | same default distance curve                |
| `Boss`                 |       6 / 0.25 |        100 / 0.15 |         prox awareness 0.75 |      1 |              2.5 | same default distance curve; angle max 160 |
| `Damsel`               |      2.5 / 1.5 |           2 / 0.5 | detect 0.45, awareness 0.45 |      1 |              2.5 | same default distance curve                |
| `Mannequin`            |              - |            60 / 0 |                           - |      1 |               10 | 0:1, 1:1                                   |
| `Shovelhead_NonCombat` |        - / 0.4 |         20 / 0.25 |     detect 600, awareness 1 |      1 |              2.5 | 0:1, 500:0.5                               |
| `Shovelhead_Combat`    |        - / 0.4 |         20 / 0.25 |     detect 600, awareness 3 |      1 |              2.5 | 0:1, 500:0.5                               |

## Teams And Hostility

I did not find a separate combat field literally called `Faction` on the enemy definitions. The faction-like combat layer is `Team` on `ETD_*.json`, backed by `DA_EnemyTeamAttitudes.json`. Species/clan-style grouping is mostly expressed through `StartupTags` such as `Species.Ghoul`, `Species.Vampire`, `Species.Human.IAO`, `Combat.General.Scary`, and so on.

Hostility matrix:

| Team          | Hostile to                                                            |
| ------------- | --------------------------------------------------------------------- |
| `Player`      | `Anarch`, `Sabbat`, `IAO`, `Berserk`                                  |
| `Pedestrians` | none                                                                  |
| `Cops`        | `Anarch`, `Sabbat`, `Berserk`                                         |
| `Anarch`      | `Player`, `Cops`, `Sabbat`, `IAO`, `Berserk`                          |
| `Sabbat`      | `Player`, `Pedestrians`, `Cops`, `Anarch`, `IAO`, `Berserk`           |
| `IAO`         | `Player`, `Anarch`, `Sabbat`, `Berserk`                               |
| `Berserk`     | `Player`, `Pedestrians`, `Cops`, `Anarch`, `Sabbat`, `IAO`, `Berserk` |
| `Neutral`     | `Player`                                                              |

Enemy team assignments from ETDs:

| Team assignment                 | Enemy definitions / CCC groups                                                                                                                                |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Sabbat`                        | Boss Benny, Camile/Safia, Champion, Ysabella, Ysabella DLC, Ysabella Diva, Ysabella Predator; Sabbat minor/major/vampire ETDs; Husk; Shovelhead; Shadow Demon |
| `IAO`                           | Inquisitor, Inquisitor ranged, Inquisitor shotgun, Inquisitor sniper; `Police`; `Police_Inside`                                                               |
| `Cops`                          | `Mass_Police`                                                                                                                                                 |
| `Pedestrians`                   | `Human_Enemy`, `Human_Frank`, `Mass_Pedestrian`                                                                                                               |
| `Neutral`                       | `Damsel`                                                                                                                                                      |
| `Player`                        | `TestDummy`                                                                                                                                                   |
| No explicit `Team` field on ETD | Thinblood minor ghoul, minor ghoul sniper, major ghoul, major ghoul ranged, Fortidude, Thinblood vampire, Thinblood vampire ranged, Mannequin                 |

## Unresolved CCC Aliases

These aliases exist in `spawn.lua`, but their `etdName` did not resolve to a concrete `DA_ModularEnemies` row in this 23416145 export:

- `ghoulbase` -> `Thinblood_MinorGhoul`
- `ghoulsnipertype` -> `Thinblood_MinorGhoul_Sniper`
- `majorgbase` -> `Thinblood_MajorGhoul`
- `majorgsr` -> `Thinblood_MajorGhoul_Ranged`
- `thinvampbase` -> `Thinblood_Vampire`
- `thinvampr` -> `Thinblood_Vampire_Ranged`
- `sabbatbase` -> `Sabbat_MinorGhoul_USK`
- `sabbatsnipertype` -> `Sabbat_MinorGhoul_Sniper`
- `sabbatmajbase` -> `Sabbat_MajorGhoul`
- `sabbatmajr` -> `Sabbat_MajorGhoul_Ranged`
- `sabbatvampbase` -> `Sabbat_Vampire`
- `sabbatvampr` -> `Sabbat_Vampire_Ranged`
- `inqmelee` -> `Inquisitor`
- `inqranged` -> `Inquisitor_Ranged`
- `inqshotgunbase` -> `Inquisitor_Shotgun`
- `human` -> `Human_Enemy`
- `humanenemy` -> `Human_Enemy`
- `bossysabelladlc` -> `Boss_Ysabella_DLC`
- `ysabelladlc` -> `Boss_Ysabella_DLC`
- `bosscemile` -> `Boss_Camile`
- `cemile` -> `Boss_Camile`

## Source Files

- `MODS/debug_consoleCheatCommands/Scripts/spawn.lua`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/LiveTuneables/AI/Enemies/DA_ModularEnemies.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/LiveTuneables/Enemies/**/DA_*_Stats.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/**/WID_*.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/**/BP_WeaponInstance_*.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/Enemies/Shared/BP_EnemyCharacterBase.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/Enemies/Shared/WrestlerWeaponStowComponent.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/GA_disarmed_WeaponSwap_Toknife.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/Projectiles/WrestlerProjectile_ExplodingBolt.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/Projectiles/BP_Throwable_Bolt.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/Explosion/BP_Explosion.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/Explosion/BP_Explosion_TickDelay.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/AI/AgentTasks/DA_ModularEnemyTasks.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/AI/AgentTasks/**/*.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Pawns/Enemies/EnemyDefinition/ETD_*.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/LiveTuneables/AI/Enemies/Perception/DA_EnemySenseConfig_*.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/LiveTuneables/AI/Enemies/Perception/DA_EnemyAwarenessConfig_*.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/LiveTuneables/AI/Enemies/DA_EnemyTeamAttitudes.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/GA_Distractor_Pullpistol.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/GA_WeaponSwap_ToPistol.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/GA_WeaponSwap_ToPistol_Sabbat.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/GA_Melee_WeaponSwap_ToPistol.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/GA_Melee_WeaponSwap_ToSMG.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/GA_WeaponSwap_ReturnToInitial.json`
- `EXPORTS/FModel/23416145/Exports/Bloodlines2/Content/WrestlerCommon/Weapons/GA_MeleeWeaponSwap_ReturnToInitial.json`
