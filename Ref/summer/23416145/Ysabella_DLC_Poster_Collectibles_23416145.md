# Ysabella DLC Poster Collectibles - 23416145

## Summary

The UE4SS dev logs did not contain useful placement information for Ysabella's DLC collectibles. The useful data is in the FModel hub map exports.

The collectibles are placed actors of type `BP_AchievementCollectible_Base_DLC2_C` in the hub master map generated exports, not in the DLC map folder. There are exactly 15 placed actors, matching `Bool_PosterAchievementCollected_01` through `Bool_PosterAchievementCollected_15`.

I did not find an exact internal string for `Fire and Flame`. Searches for `Fire and Flame`, `FireAndFlame`, and `Fire_And_Flame` only found unrelated generic fire/flame VFX. Related Ysabella internal naming uses `Flashback` / `YsaFlashback`.

## Key Evidence

- `MS_DLCYsabella_PosterAchievementEncounters.json`
  - State `Collected All The Posters`
  - `INT_PosterCollected_Rule_0`
  - `Value: 15`
  - Achievement unlock: `WA_DLC_Y_GoodPublicity`
- `LV_WP_Hub_Master.json`
  - Contains exactly 15 `BP_AchievementCollectible_Base_DLC2_C_UAID_*` keys.
- `LV_WP_Hub_Master/_Generated_/*.json`
  - Contains the placed actor labels, transforms, and per-instance bool properties.

## Source Paths

```text
EXPORTS\FModel\23416145\Exports\Bloodlines2\Plugins\WrestlerDLC\DLC_Ysabella\Content\YsabellaContent\NarrativeStructure\MS_DLCYsabella_PosterAchievementEncounters.json
EXPORTS\FModel\23416145\Exports\Bloodlines2\Content\WrestlerHubOne\Maps\LV_Hub\LV_WP_Hub_Master.json
EXPORTS\FModel\23416145\Exports\Bloodlines2\Content\WrestlerHubOne\Maps\LV_Hub\LV_WP_Hub_Master\_Generated_
EXPORTS\Dev\Bloodlines2_23416145\20260610_143611\UE4SS.log
EXPORTS\Dev\Bloodlines2_23416145\20260610_143611\1781098512-ue4ss_actor_data.csv
EXPORTS\Dev\Bloodlines2_23416145\20260610_143611\UE4SS_ObjectDump.txt
```

## Collectible Locations

Coordinates are hub master world-space `RelativeLocation` values from the placed actor root component.

| # | Save Flag | Actor Label | X | Y | Z | Generated Chunk |
|---:|---|---|---:|---:|---:|---|
| 1 | `Bool_PosterAchievementCollected_01` | `BP_AchievementCollectible_Base_DLC_1` | -30952.43 | 7075.34 | 2107.52 | `23AK2KXVU82KOXQTZ5JEQA9DT.json` |
| 2 | `Bool_PosterAchievementCollected_02` | `BP_AchievementCollectible_Base_DLC_2` | 10399.93 | 7258.29 | 1915.46 | `DAMQU91XAYDHJUNX243ZZ2MP5.json` |
| 3 | `Bool_PosterAchievementCollected_03` | `BP_AchievementCollectible_Base_DLC_3` | -36372.66 | 29885.09 | 1540.95 | `EON8MA4MWO17WJPFDVDC1GGZ3.json` |
| 4 | `Bool_PosterAchievementCollected_04` | `BP_AchievementCollectible_Base_DLC_4` | -21754.50 | 20219.54 | 1289.85 | `3NN2FM6VYNJ1SF7V8XD8XOS5I.json` |
| 5 | `Bool_PosterAchievementCollected_05` | `BP_AchievementCollectible_Base_DLC_5` | 14362.90 | 45576.34 | 1574.14 | `3YE5AGM1T1ZOR8QPIGEB9T0YD.json` |
| 6 | `Bool_PosterAchievementCollected_06` | `BP_AchievementCollectible_Base_DLC_6` | 7521.25 | -4965.72 | 2029.71 | `BG6KO6TDSTOR0XJJTBIDYU1CE.json` |
| 7 | `Bool_PosterAchievementCollected_07` | `BP_AchievementCollectible_Base_DLC_7` | 1239.96 | 27719.35 | 1879.31 | `4BSTRIVKJNB44JS6RH726CKGU.json` |
| 8 | `Bool_PosterAchievementCollected_08` | `BP_AchievementCollectible_Base_DLC_8` | 2229.92 | 45049.05 | 1654.56 | `4BSTRIVKJNB44JS6RH726CKGU.json` |
| 9 | `Bool_PosterAchievementCollected_09` | `BP_AchievementCollectible_Base_DLC_9` | -17823.69 | 58230.98 | 1020.99 | `EKJX89PGY4USODGZRSW1IJH88.json` |
| 10 | `Bool_PosterAchievementCollected_10` | `BP_AchievementCollectible_Base_DLC_10` | -26567.80 | 48751.37 | 1039.03 | `4GESKADDQI3IW7R3C397HD1GJ.json` |
| 11 | `Bool_PosterAchievementCollected_11` | `BP_AchievementCollectible_Base_DLC_11` | -15913.34 | 38056.56 | 4077.70 | `EON8MA4MWO17WJPFDVDC1GGZ3.json` |
| 12 | `Bool_PosterAchievementCollected_12` | `BP_AchievementCollectible_Base_DLC_12` | -19370.96 | -4199.40 | 1905.60 | `CVQV5ZRNZRJCTJ3OLBDIIRWDN.json` |
| 13 | `Bool_PosterAchievementCollected_13` | `BP_AchievementCollectible_Base_DLC_13` | -28544.53 | 23512.32 | 1473.49 | `3NN2FM6VYNJ1SF7V8XD8XOS5I.json` |
| 14 | `Bool_PosterAchievementCollected_14` | `BP_AchievementCollectible_Base_DLC_14` | 634.56 | -2194.23 | 1930.42 | `4BSTRIVKJNB44JS6RH726CKGU.json` |
| 15 | `Bool_PosterAchievementCollected_15` | `BP_AchievementCollectible_Base_DLC_15` | 3909.06 | 52412.19 | 4484.18 | `4BSTRIVKJNB44JS6RH726CKGU.json` |

## Notes

- Nearby labels in the generated chunks often reference `YsabellaDLC_Poster` path points or AI spawners. Those appear to belong to the poster encounter enemy logic rather than the collectible placement itself.
- Some decorative `SM_CollectiblePoster_*` and `SM_Lab_POSTER_*` actors exist in DLC sublevels, but those are not the authoritative 15 achievement collectible actors.
- The first placed actor example has `Bool_PosterAchievementCollected_01` in `23AK2KXVU82KOXQTZ5JEQA9DT.json`, and the actor label `BP_AchievementCollectible_Base_DLC_1` in the same chunk.
