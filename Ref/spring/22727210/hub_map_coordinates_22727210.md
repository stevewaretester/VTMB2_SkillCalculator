# Hub Map Coordinates & PNG Calibration (22727210)

## Map PNG

- **File**: `EXPORTS/FModel/22727210/Exports/Bloodlines2/Content/WrestlerCore/UI/RPGMenu/Map/MapIcons/HubMap.png`
- **Dimensions**: 2400 × 2048 pixels (from `HubMap.json` `ImportedSize`)
- This is the exact texture used by the in-game map screen.

## Collectibles data

- **File**: `Notes etc/collectibles.lua`
- 242 entries extracted from `LV_WP_Hub_Master/_Generated_/` (1084 WP cell files)
- Format: `{ category='TB', className='...', name='...UAID...', x=N, y=N, z=N }`

### Categories
| Category | Count |
|----------|-------|
| CODEX    | 177   |
| XP       | 34    |
| TB       | 30    |
| KNIFE    | 1     |

## World coordinate ranges (Unreal Units)

| Axis | Min     | Max    | Span   |
|------|---------|--------|--------|
| X    | -41,765 | 16,460 | 58,225 |
| Y    | -16,968 | 69,938 | 86,906 |
| Z    | -728    | 11,574 | 12,302 (vertical, ignore for 2D map) |

## World → pixel transform (CALIBRATED)

Derived empirically from 6 feeding-station markers logged by `ccc collect feeding`
(the in-game map subsystem provides world→uv→pixel for any active marker).
Fit is sub-pixel accurate across all 6 points.

```
px = 0.029986 * worldX + 1469.683
py = -0.017067 * worldY + 1467.793
```

Inverse:
```
worldX = (px - 1469.683) / 0.029986
worldY = (py - 1467.793) / -0.017067
```

### Properties
- **X**: 1 pixel ≈ 33.35 UU (positive — world +X = pixel right / east)
- **Y**: 1 pixel ≈ -58.59 UU (**negative — Y axis is flipped**: world +Y = pixel up / north)
- **World origin (0,0)** is at pixel **(1470, 1468)** — near image center
- **Anisotropic**: X and Y scales differ (X is stretched ~1.76× vs Y in pixels).
  The map is NOT a uniform top-down render — do not assume square pixels.

### Calibration source data
| Marker | World X | World Y | Pixel X | Pixel Y |
|--------|---------|---------|---------|---------|
| EOTW       |   4,842 |  29,589 | 1615 |  963 |
| Guru       | -22,387 |  55,927 |  798 |  513 |
| MedicCarla |  -4,255 |  52,952 | 1342 |  564 |
| MrLemon    | -23,180 |  41,841 |  775 |  754 |
| Reggie     | -15,997 |  25,306 |  990 | 1036 |
| SexWorker  |   2,647 |  -6,410 | 1549 | 1577 |

Source: `ccc collect feeding` output (UE4SS log, `WrestlerUIMapSubsystem` widget fallback).

## Axis orientation note

UE4 world: X = east/west, Y = north/south.
On `HubMap.png`: X axis matches (east = right), Y axis is **flipped** (north = up = lower pixel Y).
This is captured in the calibrated transform above — Y scale is negative.

## Related files
- `SCRIPTS/extract_collectibles.py` — generates `collectibles.lua` from WP cell exports
- `SCRIPTS/calibration_points.py` — prints TB coords for calibration reference
- `SCRIPTS/find_map_bounds.py` — explored map widget files for embedded bounds (none found)
- `SCRIPTS/find_feeding_markers.py` — finds resonance/feeding-tagged actors in WP cells
- `SCRIPTS/derive_map_transform.py` — fits the world→pixel linear transform
