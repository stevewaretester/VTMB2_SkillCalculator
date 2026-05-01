// Interactive Hub Map
// Depends on: js/collectibles.js (defines const COLLECTIBLES)

(function () {
  "use strict";

  // ── Constants ────────────────────────────────────────────
  const MAP_IMG_W = 2400;
  const MAP_IMG_H = 2048;

  // The HubMap.png has decorative borders/empty letterboxing around the
  // actual playable area. The playable area is a 1910×1146 region whose
  // top-left corner sits at (160, 441) within the 2400×2048 PNG.
  const PLAY = { x: 160, y: 441, w: 1910, h: 1146 };

  // World bounds extracted from collectibles + headroom (see Ref/spring/22727210/hub_map_coordinates_22727210.md)
  const WORLD = {
    xMin: -41765, xMax: 16460,
    yMin: -16968, yMax: 69938,
  };

  // Known calibration anchors: world (x,y) → pixel (px,py).
  // These are the 6 Phlegmatic feeding stations as logged by the game's own
  // map widget (px = uv × image_dim, where the image is 2400×2048). Trust the
  // log over visual ground-truthing — earlier visual picks disagreed because
  // the on-screen render is centred + scaled, not 1:1 with the PNG.
  // With ≥3 anchors we solve a full 2D affine (rotation+shear+scale+translate);
  // with 2 we fall back to axis-aligned scale+offset; with 0–1 we use a
  // bounds-fit of WORLD into the PLAY region.
  const ANCHORS = [
    { name: "Guru",       wx: -22387, wy: 55927, px: 691,  py: 798  },
    { name: "MrLemon",    wx: -23180, wy: 41841, px: 931,  py: 778  },
    { name: "Reggie",     wx: -15997, wy: 25306, px: 1214, py: 906  },
    { name: "MedicCarla", wx:  -4255, wy: 52952, px: 743,  py: 1108 },
    { name: "EOTW",       wx:   4842, wy: 29589, px: 1137, py: 1265 },
    { name: "SexWorker",  wx:   2647, wy: -6410, px: 1755, py: 1224 },
  ];

  // Default linear transform: world(x,y) -> map pixel(px,py).
  // Generalized 2D affine:
  //   px = a*wx + b*wy + e
  //   py = c*wx + d*wy + f
  // (a,d) capture scale, (b,c) capture rotation/shear, (e,f) translate.
  // The earlier 4-param form is a special case where b=c=0.
  const DEFAULT_TX = (() => {
    // Bounds-fit fallback (axis-aligned, no rotation).
    let a = PLAY.w / (WORLD.xMax - WORLD.xMin);
    let d = PLAY.h / (WORLD.yMax - WORLD.yMin);
    let b = 0, c = 0;
    let e = PLAY.x - a * WORLD.xMin;
    let f = PLAY.y - d * WORLD.yMin;

    // Solve a 2×2 symmetric linear system [[A,B],[B,D]] [x;y] = [u;v].
    const solve2 = (A, B, D, u, v) => {
      const det = A * D - B * B;
      if (!det) return null;
      return { x: (D * u - B * v) / det, y: (A * v - B * u) / det };
    };

    if (ANCHORS.length >= 3) {
      // Least-squares fit for affine: separate fits for px and py.
      // Normal equations on [wx, wy, 1] ⇒ [a,b,e] (resp. [c,d,f]).
      // We center on the mean to keep the system well-conditioned and
      // then back out the intercept.
      const n = ANCHORS.length;
      const mwx = ANCHORS.reduce((s, p) => s + p.wx, 0) / n;
      const mwy = ANCHORS.reduce((s, p) => s + p.wy, 0) / n;
      const mpx = ANCHORS.reduce((s, p) => s + p.px, 0) / n;
      const mpy = ANCHORS.reduce((s, p) => s + p.py, 0) / n;
      let Sxx = 0, Sxy = 0, Syy = 0;
      let Sxpx = 0, Sypx = 0, Sxpy = 0, Sypy = 0;
      ANCHORS.forEach(p => {
        const dx = p.wx - mwx, dy = p.wy - mwy;
        const dpx = p.px - mpx, dpy = p.py - mpy;
        Sxx += dx * dx; Sxy += dx * dy; Syy += dy * dy;
        Sxpx += dx * dpx; Sypx += dy * dpx;
        Sxpy += dx * dpy; Sypy += dy * dpy;
      });
      const sx = solve2(Sxx, Sxy, Syy, Sxpx, Sypx);
      const sy = solve2(Sxx, Sxy, Syy, Sxpy, Sypy);
      if (sx && sy) {
        a = sx.x; b = sx.y;
        c = sy.x; d = sy.y;
        e = mpx - a * mwx - b * mwy;
        f = mpy - c * mwx - d * mwy;
      }
    } else if (ANCHORS.length === 2) {
      // Two anchors → axis-aligned scale + offset (no rotation).
      const [p, q] = ANCHORS;
      a = (p.px - q.px) / (p.wx - q.wx);
      d = (p.py - q.py) / (p.wy - q.wy);
      e = p.px - a * p.wx;
      f = p.py - d * p.wy;
    } else if (ANCHORS.length === 1) {
      const p = ANCHORS[0];
      e = p.px - a * p.wx;
      f = p.py - d * p.wy;
    }
    return { a, b, c, d, e, f, flipY: false, swapXY: false };
  })();

  // Bump storage key when default geometry changes so cached transforms
  // from earlier defaults don't override the new defaults.
  const TX_STORAGE_KEY = "vtmb2.mapTransform.v11";
  const FILTERS_STORAGE_KEY = "vtmb2.mapFilters.v2";
  const MAP_STYLE_STORAGE_KEY = "vtmb2.mapStyle.v1";

  // ── Taxonomies ───────────────────────────────────────────
  // Story: which character's narrative does this collectible belong to.
  const STORIES = [
    { id: "phyre",    label: "Phyre",    icon: "assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_ClanLogo_PhyreMark.png" },
    { id: "fabien",   label: "Fabien",   icon: "assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_ClanLogo_Malkavian.png" },
    { id: "benny",    label: "Benny",    icon: "assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_BennyLogo.png" },
    { id: "ysabelle", label: "Ysabelle", icon: "assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_YsabellaLogo.png" },
    { id: "shared",   label: "Shared / Unknown", icon: null },
  ];

  // Type + subtype. Each subtype renders with its own icon + color.
  const TYPES = [
    {
      id: "collectible", label: "Collectibles",
      subtypes: [
        { id: "phyremark", label: "Phyre Mark", color: "#2ad8ff", icon: "assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_ClanLogo_PhyreMark.png" },
        { id: "thinblood", label: "Thinblood", color: "#ff7a7a", icon: "assets/Map/Icons/Collectables/T_UI_Icons_Map_Thinblood.png" },
        { id: "camera",    label: "Camera",     color: "#ffce4d", icon: "assets/Map/Icons/Collectables/T_UI_Icons_Map_Camera.png" },
        { id: "graffiti",  label: "Graffiti",   color: "#4dffce", icon: "assets/Map/Icons/Collectables/T_UI_Icons_Map_Graffiti.png" },
        { id: "sword",     label: "Sword",      color: "#c8a2ff", icon: "assets/Map/Icons/Collectables/T_UI_Icons_Map_Camarilla.png" },
        { id: "resonance", label: "Resonance",  color: "#64d8b6", icon: "assets/N_Textures/ClanTrainer/T_UI_BloodResonance_Sanguine.png" },
      ],
    },
    {
      id: "codex", label: "Codex",
      subtypes: [
        { id: "codex",  label: "Codex Entry",    color: "#ffce4d", icon: "assets/N_Textures/Notifications/T_UI_Icon_Notification_Codex.png" },
        { id: "news",   label: "News",           color: "#b8c4ff", icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ctext x='50%25' y='52%25' dominant-baseline='middle' text-anchor='middle' font-size='44'%3E%F0%9F%93%B0%3C/text%3E%3C/svg%3E" },
        { id: "ringer", label: "Ringer (Combat)", color: "#ff9d4d", icon: "assets/N_Textures/Notifications/T_UI_Icon_Notification_Codex.png" },
      ],
    },
    {
      id: "characters", label: "Characters",
      subtypes: [
        { id: "helper", label: "Fabien's Helper", color: "#9ad8ff", icon: "assets/Map/Icons/Blood/T_UI_Icon_Map_Phlegmatic.png" },
        { id: "trainer", label: "Clan Trainer",    color: "#d7b66a", icon: "assets/Map/Icons/Markers/T_UI_Icon_Map_Ouestion.png" },
        { id: "npc",    label: "NPC",             color: "#7dc8ff", icon: "assets/Map/Icons/Markers/T_UI_Icon_Map_Ouestion.png" },
      ],
    },
  ];

  // Progress / quest gating. Initial buckets — refine as we map specific items.
  const PROGRESS = [
    { id: "early",   label: "Early game" },
    { id: "mid",     label: "Mid game" },
    { id: "late",    label: "Late game" },
    { id: "unknown", label: "Ungated / unknown" },
  ];

  // Landmark building hotspots in PNG pixel space.
  // Coordinates are center points; w/h is a tunable footprint box.
  const BUILDINGS = [
    { id: "dutchman", name: "The Dutchman", px: 728, py: 775, w: 72, h: 93, description: "Landmark building in the downtown district.", poly: [[706,729],[764,765],[732,822],[692,798],[702,781],[693,749]] },
    { id: "police-station", name: "Police Station", px: 960, py: 799, w: 127, h: 105, description: "Police station and nearby civic block.", poly: [[896,800],[924,758],[943,769],[958,745],[1024,782],[988,852]] },
    { id: "haven", name: "Haven", px: 1188, py: 796, w: 101, h: 96, description: "Safe hub point and key mission-adjacent location.", poly: [[1216,845],[1239,807],[1204,786],[1203,748],[1154,752],[1154,778],[1138,777],[1139,800]] },
    { id: "observatory", name: "Observatory", px: 1868, py: 649, w: 118, h: 92, description: "Observatory district landmark.", poly: [[1805,763],[1925,763],[1925,528],[1805,526]] },
    { id: "st-stephens", name: "St Stephens", px: 1329, py: 1038, w: 140, h: 100, description: "St Stephens church complex.", poly: [[1292,993],[1286,994],[1286,1003],[1255,1003],[1256,1049],[1286,1049],[1286,1069],[1328,1068],[1329,1061],[1412,1059],[1413,993],[1320,993],[1320,982],[1293,982],[1293,992],[1292,993]] },
    { id: "wake-the-dead", name: "Wake the Dead", px: 1013, py: 1061, w: 132, h: 88, description: "Wake the Dead venue and surrounding block.", poly: [[1030,1090],[1003,1090],[1002,1044],[1029,1044]] },
    { id: "weaver-tower", name: "Weaver Tower", px: 1878, py: 1008, w: 92, h: 132, description: "Weaver Tower high-rise landmark.", poly: [[1923,890],[1922,1144],[1770,1144],[1771,1078],[1822,1077],[1822,1066],[1799,1063],[1799,974],[1823,974],[1827,969],[1827,958],[1769,957],[1770,890]] },
    { id: "aurora-pawn", name: "Aurora Pawn", px: 805, py: 1108, w: 116, h: 84, description: "Aurora Pawn storefront and nearby street.", poly: [[820,1137],[779,1114],[795,1086],[836,1109]] },
    { id: "autoshop", name: "Autoshop", px: 971, py: 1202, w: 150, h: 92, description: "Autoshop lot and garage buildings.", poly: [[950,1217],[994,1216],[994,1185],[950,1186]] },
    { id: "makom-bar", name: "Makom Bar", px: 1209, py: 1240, w: 136, h: 86, description: "Makom Bar building footprint.", poly: [[1188,1259],[1228,1259],[1228,1228],[1188,1228]] },
    { id: "atrium", name: "Atrium", px: 1704, py: 1219, w: 146, h: 104, description: "Atrium complex landmark.", poly: [[1671,1194],[1662,1206],[1662,1242],[1753,1242],[1753,1201],[1745,1193],[1671,1193]] },
    { id: "hole-in-the-wall", name: "Hole in the Wall", px: 861, py: 1383, w: 112, h: 80, description: "Hole in the Wall venue.", poly: [[842,1400],[862,1410],[865,1404],[870,1407],[890,1370],[865,1356]] },
    { id: "glacier-hotel", name: "The Glacier Hotel", px: 1117, py: 1324, w: 168, h: 118, description: "The Glacier Hotel and connected structures.", poly: [[1097,1376],[1175,1376],[1175,1303],[1098,1303]] },
  ];

  // Flat lookup helpers
  const SUBTYPE_BY_ID = {};
  TYPES.forEach(t => t.subtypes.forEach(s => { SUBTYPE_BY_ID[s.id] = Object.assign({ typeId: t.id }, s); }));

  // ── Tag inference ────────────────────────────────────────
  // Returns { story, type, subtype, progress } for a collectible entry.
  // Heuristics: refined as we learn more about quest gating.
  function inferTags(item) {
    const cls = item.cls || "";
    const n = item.n || "";
    const blob = cls + "|" + n;

    if (item.type && item.subtype) {
      const v = (item.venue || "Overworld");
      const venueGroup = v === "Overworld" ? "overworld"
                       : v.startsWith("Mission:") ? "mission"
                       : "hub_venue";
      return {
        story: item.story || "shared",
        type: item.type,
        subtype: item.subtype,
        progress: item.progress || "unknown",
        venueGroup,
      };
    }

    // ── Authoritative per-class rules ────────────────────────
    // Confirmed mappings: class name → { story, type, subtype }.
    // Add new entries here as we identify them; these win over
    // any heuristic rules below.
    const CLASS_RULES = {
      "BP_AchievementCollectible_Thinblood_C": { story: "phyre", type: "collectible", subtype: "graffiti" },
      "BP_XPCollectable_C":                    { story: "phyre", type: "collectible", subtype: "phyremark"  },
      "BP_CodexItem_MDM_SwordOfStJames1_C":    { story: "fabien", type: "codex",       subtype: "codex" },
    };
    if (CLASS_RULES[cls]) {
      const v = (item.venue || "Overworld");
      const venueGroup = v === "Overworld" ? "overworld"
                       : v.startsWith("Mission:") ? "mission"
                       : "hub_venue";
      return { ...CLASS_RULES[cls], progress: "unknown", venueGroup };
    }

    // ── Heuristic fallback ───────────────────────────────────
    // Type / subtype from the short category code in collectibles.js
    let type, subtype;
    if (item.c === "TB")           { type = "collectible"; subtype = "graffiti"; }
    else if (item.c === "XP")      { type = "collectible"; subtype = "phyremark"; }
    else if (item.c === "BENNY")   { type = "collectible"; subtype = "thinblood"; }
    else if (item.c === "CAM")     { type = "collectible"; subtype = "sword"; }
    else if (item.c === "CAMERA")  { type = "collectible"; subtype = "camera"; }
    else if (item.c === "NEWS")    { type = "codex";       subtype = "news"; }
    else if (item.c === "KNIFE")   { type = "codex";       subtype = "codex"; }
    else if (item.c === "CODEX")   { type = "codex";       subtype = "codex"; }
    else if (item.c === "RINGER")  { type = "codex";       subtype = "ringer"; }
    else if (item.c === "HELPER")  { type = "characters";  subtype = "helper"; }
    else if (item.c === "TRAINER") { type = "characters";  subtype = "trainer"; }
    else                           { type = "characters";  subtype = "npc"; }

    // Story heuristics — prefer the authoritative owner field from collectibles data
    let story = "phyre"; // hub default
    if (item.owner) {
      const o = item.owner.toLowerCase();
      if      (o === "benny")  story = "benny";
      else if (o === "fabien") story = "fabien";
      else if (o === "phyre")  story = "phyre";
      // "unknown" → fall through to heuristics below
    }
    if (!item.owner || item.owner === "Unknown") {
      if (item.c === "HELPER")                  story = "fabien";
      else if (item.c === "TRAINER")            story = "shared";
      else if (item.c === "BENNY")              story = "benny";
      else if (item.c === "KNIFE")              story = "fabien";
      else if (item.c === "CAM")                story = "phyre";
      else if (item.c === "CAMERA")             story = "phyre";
      else if (item.c === "NEWS")               story = "phyre";
      else if (/Fabien/i.test(blob))            story = "fabien";
      else if (/StrickBW|StrickNR/i.test(blob)) story = "fabien";
      else if (/Benny/i.test(blob))             story = "benny";
      else if (/Ysabelle/i.test(blob))          story = "ysabelle";
    }

    // Progress (placeholder — left as 'unknown' until quest map is known)
    const progress = (item.c === "CAMERA" || subtype === "camera") ? "late" : "unknown";

    // Venue group — drives the location filter
    const v = (item.venue || "Overworld");
    const venueGroup = v === "Overworld" ? "overworld"
                     : v.startsWith("Mission:") ? "mission"
                     : "hub_venue";

    return { story, type, subtype, progress, venueGroup };
  }

  // Cached tags per entry index (by reference to ITEMS order)
  let TAGS = null;
  let ITEMS = null;
  function ensureItems() {
    if (ITEMS) return ITEMS;
    const base = (typeof COLLECTIBLES !== "undefined" && Array.isArray(COLLECTIBLES)) ? COLLECTIBLES : [];
    const extras = (typeof window !== "undefined" && Array.isArray(window.MAP_EXTRAS)) ? window.MAP_EXTRAS : [];
    ITEMS = base.concat(extras);
    return ITEMS;
  }
  function ensureTags() {
    if (TAGS) return;
    TAGS = ensureItems().map(inferTags);
  }

  // ── Per-class info registry ──────────────────────────────
  // Optional metadata keyed by class name. Anything not listed
  // falls back to a friendly transform of the class name.
  // Add entries as you author them.
  //   name:        Player-facing general name
  //   description: One- or two-paragraph blurb shown in the preview modal
  //   screenshot:  Optional explicit path. If omitted, the modal will
  //                try `assets/Map/Screenshots/{cls}.png` and fall back
  //                to a placeholder slate when the file is missing.
  const ITEM_INFO = {
    "BP_AchievementCollectible_Thinblood_C": {
      name: "Graffiti Tag",
      description: "Thin-blood graffiti; reading it grants a small surge of insight (XP).",
    },
    "BP_XPCollectable_C": {
      name: "Phyre Mark",
      description: "A psychic resonance left by a fellow thin-blood. Touch it to harvest the imprint.",
    },
  };

  function friendlyName(cls) {
    return cls.replace(/^BP_/, "").replace(/_C$/, "").replace(/_/g, " ");
  }

  function infoFor(item) {
    const reg = ITEM_INFO[item.cls] || {};
    const name = item.c === "BENNY"
      ? "Thinblood Leader"
      : (reg.name || item.name || item.label || friendlyName(item.cls));
    return {
      name,
      description: reg.description || item.description || "",
      screenshot: reg.screenshot || item.screenshot || `assets/Map/Screenshots/${item.cls}.png`,
    };
  }

  function extractEnemyType(item) {
    if (!item) return "";
    // Use the specific et field if present (e.g. "Thinblood_MajorGhoul_Striker")
    if (item.et) {
      return item.et
        .replace(/^Thinblood_/i, "")   // strip leading Thinblood_
        .replace(/_LateGame$/i, "")     // strip trailing _LateGame
        .split("_")                     // split remaining segments
        .map(s => s.replace(/([a-z])([A-Z])/g, "$1 $2")) // CamelCase → words
        .join(" ")
        .trim();
    }
    const raw = (item.enemyType || item.enemy || item.archetype || "").toString().trim();
    const source = raw || ((item.n || "").split("_UAID")[0] || "");
    if (!source) return "";
    const cleaned = source
      .replace(/^BP_/, "")
      .replace(/_C$/, "")
      .replace(/(Enemy)?AISpawner$/i, "")
      .replace(/EnemySpawner$/i, "")
      .replace(/Spawner$/i, "")
      .replace(/_/g, " ")
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/\bAI\b/gi, "")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned;
  }

  function bennyEnemyTypeFor(item, tags) {
    if (!tags || tags.story !== "benny" || tags.subtype !== "thinblood") return "";
    return extractEnemyType(item);
  }

  function hasPixelPosition(item) {
    return Number.isFinite(item.px) && Number.isFinite(item.py);
  }

  function positionFor(item) {
    if (hasPixelPosition(item)) return { px: item.px, py: item.py };
    return worldToPixel(item.x, item.y);
  }

  function markerVisualFor(item, sub) {
    let icon = item.icon || sub.icon;
    // Keep one unified legend/filter subtype for resonance while preserving
    // per-bag blood-family icons on pins/detail/checklist rows.
    if (sub.id === "resonance") {
      const blob = `${item.cls || ""}|${item.n || ""}|${item.name || ""}`.toLowerCase();
      if (blob.includes("sanguine")) icon = "assets/Map/Icons/Blood/T_UI_Icon_Map_Sanguine.png";
      else if (blob.includes("melancholic")) icon = "assets/Map/Icons/Blood/T_UI_Icon_Map_Melancholic.png";
      else if (blob.includes("choleric")) icon = "assets/Map/Icons/Blood/T_UI_Icon_Map_Choleric.png";
      else if (blob.includes("phlegmatic")) icon = "assets/Map/Icons/Blood/T_UI_Icon_Map_Phlegmatic.png";
    }
    return {
      icon,
      color: item.color || sub.color,
    };
  }

  function coordsFor(item) {
    if (hasPixelPosition(item)) return `Map px: (${Math.round(item.px)}, ${Math.round(item.py)})`;
    return `World: (${item.x}, ${item.y}, ${item.z})`;
  }

  // ── State ─────────────────────────────────────────────────
  const state = {
    tx: loadTransform(),
    filters: loadFilters(),
    acquired: loadAcquired(),
    grayscale: loadMapStyle(),
    view: { scale: 1, tx: 0, ty: 0 }, // pan/zoom
    legendExpandedTypes: new Set(TYPES.map(type => type.id)),
    checklistExpanded: {
      types: new Set(TYPES.map(type => type.id)),
      subtypes: new Set(),
    },
    selected: null,
    initialized: false,
  };

  function loadMapStyle() {
    try {
      const raw = localStorage.getItem(MAP_STYLE_STORAGE_KEY);
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      return !!(parsed && parsed.grayscale);
    } catch {}
    return false;
  }

  function saveMapStyle() {
    try { localStorage.setItem(MAP_STYLE_STORAGE_KEY, JSON.stringify({ grayscale: !!state.grayscale })); } catch {}
  }

  function applyMapStyle() {
    const img = document.getElementById("hubmap-img");
    if (!img) return;
    img.classList.toggle("hubmap__img--grayscale", !!state.grayscale);
  }

  function loadAcquired() {
    const acquired = new Set();
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const params = new URLSearchParams(hash);
    const raw = params.get("acq");
    if (!raw) return acquired;
    raw.split(",").forEach(value => {
      const idx = Number(value);
      if (Number.isInteger(idx)) acquired.add(idx);
    });
    return acquired;
  }

  function saveAcquired() {
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const params = new URLSearchParams(hash);
    const values = Array.from(state.acquired).sort((left, right) => left - right);
    if (values.length) params.set("acq", values.join(","));
    else params.delete("acq");
    const nextHash = params.toString();
    history.replaceState(null, "", nextHash ? `#${nextHash}` : window.location.pathname + window.location.search);
  }

  function loadTransform() {
    try {
      const raw = localStorage.getItem(TX_STORAGE_KEY);
      if (raw) return Object.assign({}, DEFAULT_TX, JSON.parse(raw));
    } catch {}
    return Object.assign({}, DEFAULT_TX);
  }
  function saveTransform() {
    try { localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(state.tx)); } catch {}
  }
  function loadFilters() {
    const def = {
      story:    {},
      type:     {},
      subtype:  {},
      progress: {},
      buildingInfo: "hover",
    };
    STORIES.forEach(s => def.story[s.id] = true);
    TYPES.forEach(t => {
      def.type[t.id] = true;
      t.subtypes.forEach(s => def.subtype[s.id] = true);
    });
    PROGRESS.forEach(p => def.progress[p.id] = true);
    // Location defaults: overworld + hub venues visible; mission-only hidden
    def.venueGroup = { overworld: true, hub_venue: true, mission: false };
    try {
      const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        ["story", "type", "subtype", "progress", "venueGroup"].forEach(k => {
          if (parsed[k]) Object.assign(def[k], parsed[k]);
        });
        if (["off", "hover", "on"].includes(parsed.buildingInfo)) {
          def.buildingInfo = parsed.buildingInfo;
        }
      }
    } catch {}
    return def;
  }
  function saveFilters() {
    try { localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(state.filters)); } catch {}
  }

  // ── World → pixel ────────────────────────────────────────
  // 6-param affine: px = a*wx + b*wy + e ; py = c*wx + d*wy + f
  function worldToPixel(wx, wy) {
    const t = state.tx;
    if (t.swapXY) { const tmp = wx; wx = wy; wy = tmp; }
    let px = t.a * wx + (t.b || 0) * wy + (t.e != null ? t.e : 0);
    let py = t.c * wx + (t.d || 0) * wy + (t.f != null ? t.f : 0);
    if (t.flipY) py = MAP_IMG_H - py;
    return { px, py };
  }

  // Inverse of worldToPixel. Returns null if the affine is degenerate.
  function pixelToWorld(px, py) {
    const t = state.tx;
    if (t.flipY) py = MAP_IMG_H - py;
    const a = t.a, b = t.b || 0, c = t.c, d = t.d || 0;
    const e = t.e != null ? t.e : 0, f = t.f != null ? t.f : 0;
    const det = a * d - b * c;
    if (!det) return null;
    const u = px - e, v = py - f;
    let wx = (d * u - b * v) / det;
    let wy = (-c * u + a * v) / det;
    if (t.swapXY) { const tmp = wx; wx = wy; wy = tmp; }
    return { wx, wy };
  }

  // Show a clicked point: PNG-pixel + estimated world coords, with crosshair.
  function reportPick(px, py) {
    const pxEl = document.getElementById("hubmap-coords-px");
    const wEl  = document.getElementById("hubmap-coords-world");
    const hint = document.getElementById("hubmap-coords-hint");
    const cross = document.getElementById("hubmap-crosshair");
    if (!pxEl || !wEl) return;
    const pxR = Math.round(px), pyR = Math.round(py);
    pxEl.textContent = `${pxR}, ${pyR}`;
    const w = pixelToWorld(px, py);
    if (w) {
      wEl.textContent = `${Math.round(w.wx)}, ${Math.round(w.wy)}`;
    } else {
      wEl.textContent = "(degenerate transform)";
    }
    if (cross) {
      cross.hidden = false;
      cross.style.left = pxR + "px";
      cross.style.top  = pyR + "px";
    }
    // Try to copy "px, py" to clipboard for easy pasting back here.
    const txt = `${pxR}, ${pyR}`;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(
        () => { if (hint) hint.textContent = `Copied "${txt}" to clipboard.`; },
        () => { if (hint) hint.textContent = "Click any pixel to read its coords."; }
      );
    } else if (hint) {
      hint.textContent = "Click any pixel to read its coords.";
    }
  }

  function checklistSubtypeKey(typeId, subtypeId) {
    return `${typeId}:${subtypeId}`;
  }

  function createChecklistToggle(label, count, expanded, level, onToggle) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `hubmap__checklist-toggle hubmap__checklist-toggle--${level}`;
    button.setAttribute("aria-expanded", String(expanded));
    button.innerHTML = `
      <span class="hubmap__checklist-toggle-main">
        <span class="hubmap__checklist-chevron">${expanded ? "▾" : "▸"}</span>
        <span class="hubmap__checklist-toggle-label">${label}</span>
      </span>
      <span class="hubmap__checklist-count">${count}</span>
    `;
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      onToggle();
    });
    return button;
  }

  function createChecklistItemRow(entry) {
    const { item, idx, tags, sub, visual } = entry;
    const row = document.createElement("div");
    row.className = "hubmap__checklist-row";
    row.style.setProperty("--pin-color", visual.color);
    row.innerHTML = `
      <input type="checkbox" data-idx="${idx}" ${state.acquired.has(idx) ? "checked" : ""}>
      <img src="${visual.icon}" alt="" class="hubmap__checklist-icon${sub.id === 'phyremark' ? ' hubmap__legend-icon--diamond' : ''}">
      <span class="hubmap__checklist-label">${labelFor(item, tags)}</span>
    `;

    const checkbox = row.querySelector("input");
    checkbox.addEventListener("change", (event) => {
      event.stopPropagation();
      if (event.target.checked) state.acquired.add(idx);
      else state.acquired.delete(idx);
      saveAcquired();
    });

    row.addEventListener("click", (event) => {
      if (event.target.matches("input")) return;
      event.stopPropagation();
      selectPin(idx, item, sub, tags);
      openPreview(item, sub, tags, event);
    });

    return row;
  }

  function renderChecklist() {
    ensureTags();
    const items = ensureItems();
    const list = document.getElementById("hubmap-checklist-list");
    if (!list) return;

    const grouped = new Map();
    items.forEach((item, idx) => {
      const tags = TAGS[idx];
      if (!tags) return;
      if (!state.filters.story[tags.story]) return;
      if (!state.filters.subtype[tags.subtype]) return;
      if (!state.filters.progress[tags.progress]) return;
      if (!state.filters.venueGroup[tags.venueGroup]) return;
      if (!hasPixelPosition(item) && item.x === 0 && item.y === 0 && item.z === 0) return;

      const sub = SUBTYPE_BY_ID[tags.subtype];
      if (!sub) return;
      const visual = markerVisualFor(item, sub);
      let typeGroup = grouped.get(tags.type);
      if (!typeGroup) {
        typeGroup = { count: 0, subtypes: new Map() };
        grouped.set(tags.type, typeGroup);
      }
      let subtypeGroup = typeGroup.subtypes.get(tags.subtype);
      if (!subtypeGroup) {
        subtypeGroup = { count: 0, entries: [] };
        typeGroup.subtypes.set(tags.subtype, subtypeGroup);
      }
      const entry = { item, idx, tags, sub, visual };
      subtypeGroup.entries.push(entry);
      subtypeGroup.count += 1;
      typeGroup.count += 1;
    });

    list.innerHTML = "";
    const fragment = document.createDocumentFragment();

    TYPES.forEach((type) => {
      const typeGroup = grouped.get(type.id);
      if (!typeGroup || !typeGroup.count) return;

      const typeExpanded = state.checklistExpanded.types.has(type.id);
      const typeSection = document.createElement("section");
      typeSection.className = "hubmap__checklist-group";
      const typeToggle = createChecklistToggle(type.label, typeGroup.count, typeExpanded, "type", () => {
        if (state.checklistExpanded.types.has(type.id)) state.checklistExpanded.types.delete(type.id);
        else state.checklistExpanded.types.add(type.id);
        renderChecklist();
      });
      typeSection.appendChild(typeToggle);

      if (typeExpanded) {
        const subtypeList = document.createElement("div");
        subtypeList.className = "hubmap__checklist-subgroups";
        type.subtypes.forEach((subtype) => {
          const subtypeGroup = typeGroup.subtypes.get(subtype.id);
          if (!subtypeGroup || !subtypeGroup.count) return;

          const subtypeKey = checklistSubtypeKey(type.id, subtype.id);
          const subtypeExpanded = state.checklistExpanded.subtypes.has(subtypeKey);
          const subtypeSection = document.createElement("section");
          subtypeSection.className = "hubmap__checklist-subgroup";
          const subtypeToggle = createChecklistToggle(subtype.label, subtypeGroup.count, subtypeExpanded, "subtype", () => {
            if (state.checklistExpanded.subtypes.has(subtypeKey)) state.checklistExpanded.subtypes.delete(subtypeKey);
            else state.checklistExpanded.subtypes.add(subtypeKey);
            renderChecklist();
          });
          subtypeSection.appendChild(subtypeToggle);

          if (subtypeExpanded) {
            const itemList = document.createElement("div");
            itemList.className = "hubmap__checklist-items";
            subtypeGroup.entries.forEach((entry) => {
              itemList.appendChild(createChecklistItemRow(entry));
            });
            subtypeSection.appendChild(itemList);
          }

          subtypeList.appendChild(subtypeSection);
        });
        typeSection.appendChild(subtypeList);
      }

      fragment.appendChild(typeSection);
    });

    list.appendChild(fragment);
  }

  // ── Render ───────────────────────────────────────────────
  function renderMapPage() {
    if (typeof COLLECTIBLES === "undefined") {
      console.warn("[map] COLLECTIBLES dataset not loaded");
      return;
    }
    if (state.initialized) {
      renderPins();
      return;
    }
    const root = document.getElementById("subpage-map");
    if (!root) return;
    root.innerHTML = `
      <div class="hubmap">
        <div class="hubmap__viewport" id="hubmap-viewport">
          <div class="hubmap__wip-frame" aria-label="Work in progress">
            <div class="hubmap__wip-strip hubmap__wip-strip--top">WORK IN PROGRESS</div>
            <div class="hubmap__wip-strip hubmap__wip-strip--right"></div>
            <div class="hubmap__wip-strip hubmap__wip-strip--bottom"></div>
            <div class="hubmap__wip-strip hubmap__wip-strip--left"></div>
          </div>
          <div class="hubmap__stage" id="hubmap-stage">
            <img class="hubmap__img" id="hubmap-img" src="assets/Map/HubMap.png" alt="Hub Map" draggable="false">
            <div class="hubmap__buildings" id="hubmap-buildings"></div>
            <div class="hubmap__pins" id="hubmap-pins"></div>
            <div class="hubmap__crosshair" id="hubmap-crosshair" hidden></div>
          </div>

          <!-- Floating top-left: legend / filter toggles -->
          <div class="hubmap__panel hubmap__panel--legend" id="hubmap-panel-legend">
            <button class="hubmap__panel-toggle" id="hubmap-legend-toggle" aria-expanded="true">
              <span class="hubmap__panel-title">Filters</span>
              <span class="hubmap__panel-chevron">▾</span>
            </button>
            <div class="hubmap__panel-body" id="hubmap-legend-body">
              <div class="hubmap__legend-list" id="hubmap-legend"></div>
              <p class="hubmap__count" id="hubmap-count"></p>
              <div class="hubmap__coords" id="hubmap-coords">
                <div class="hubmap__coords-title">Click to pick a point</div>
                <div class="hubmap__coords-row"><span class="hubmap__coords-label">PNG px:</span> <span id="hubmap-coords-px">—</span></div>
                <div class="hubmap__coords-row"><span class="hubmap__coords-label">Est. world:</span> <span id="hubmap-coords-world">—</span></div>
                <div class="hubmap__coords-hint" id="hubmap-coords-hint">Click anywhere on the map.</div>
              </div>
            </div>
          </div>

          <!-- Floating top-right: zoom / view controls -->
          <div class="hubmap__panel hubmap__panel--options" id="hubmap-panel-options">
            <button class="hubmap__panel-toggle" id="hubmap-options-toggle" aria-expanded="true">
              <span class="hubmap__panel-title">Options</span>
              <span class="hubmap__panel-chevron">▾</span>
            </button>
            <div class="hubmap__panel-body hubmap__panel-body--options" id="hubmap-options-body">
              <div class="hubmap__panel-grid">
                <button class="hubmap__panel-action" id="hubmap-home" title="Recenter map" aria-label="Recenter map">Home</button>
                <button class="hubmap__panel-action" id="hubmap-zoom-in" title="Zoom in" aria-label="Zoom in">Zoom +</button>
                <button class="hubmap__panel-action" id="hubmap-zoom-out" title="Zoom out" aria-label="Zoom out">Zoom −</button>
                <button class="hubmap__panel-action" id="hubmap-fit" title="Fit to view" aria-label="Fit to view">Fit View</button>
                <button class="hubmap__panel-action" id="hubmap-grayscale-toggle" title="Toggle grayscale" aria-label="Toggle grayscale">B/W</button>
                <button class="hubmap__panel-action hubmap__panel-action--wide" id="hubmap-building-info-toggle" title="Building info mode" aria-label="Building info mode">Bldgs: Hover</button>
                <button class="hubmap__panel-action" id="hubmap-calib-toggle" title="Calibration" aria-label="Calibration">Calibrate</button>
                <button class="hubmap__panel-action" id="hubmap-checklist-toggle" title="Checklist" aria-label="Checklist">Checklist</button>
              </div>
            </div>
          </div>

          <div class="hubmap__panel hubmap__panel--checklist hidden" id="hubmap-checklist-panel">
            <div class="hubmap__panel-header">
              <button class="hubmap__panel-toggle" id="hubmap-checklist-panel-toggle" aria-expanded="true">
                <span class="hubmap__panel-title">Checklist</span>
                <span class="hubmap__panel-chevron">▾</span>
              </button>
              <button class="hubmap__detail-close hubmap__checklist-close" id="hubmap-checklist-close" aria-label="Close">×</button>
            </div>
            <div class="hubmap__panel-body hubmap__panel-body--checklist" id="hubmap-checklist-body">
              <div class="hubmap__checklist-list" id="hubmap-checklist-list"></div>
            </div>
          </div>

          <!-- Floating bottom-left: detail card (only when a pin is selected/hovered) -->
          <div class="hubmap__panel hubmap__panel--detail hidden" id="hubmap-detail-panel">
            <button class="hubmap__detail-close" id="hubmap-detail-close" aria-label="Close">×</button>
            <div class="hubmap__detail" id="hubmap-detail"></div>
          </div>

          <!-- Click-preview popover (anchored near click) -->
          <div class="hubmap__popover hidden" id="hubmap-modal" role="dialog" aria-labelledby="hubmap-modal-title">
            <button class="hubmap__modal-close" id="hubmap-modal-close" aria-label="Close">×</button>
            <div class="hubmap__modal-body" id="hubmap-modal-body"></div>
          </div>

          <!-- Floating overlay: calibration -->
          <div class="hubmap__panel hubmap__panel--calib hidden" id="hubmap-calib">
            <div class="hubmap__panel-header">
              <span class="hubmap__panel-title">Calibration</span>
              <button class="hubmap__detail-close" id="hubmap-calib-close" aria-label="Close">×</button>
            </div>
            <p class="hubmap__calib-help">2D affine: <code>px = a·wx + b·wy + e</code>, <code>py = c·wx + d·wy + f</code>. Saved automatically.</p>
            <label>a <input type="number" step="0.00001" id="cal-a"></label>
            <label>b <input type="number" step="0.00001" id="cal-b"></label>
            <label>e <input type="number" step="1" id="cal-e"></label>
            <label>c <input type="number" step="0.00001" id="cal-c"></label>
            <label>d <input type="number" step="0.00001" id="cal-d"></label>
            <label>f <input type="number" step="1" id="cal-f"></label>
            <label class="hubmap__calib-check"><input type="checkbox" id="cal-flipY"> Flip Y</label>
            <label class="hubmap__calib-check"><input type="checkbox" id="cal-swapXY"> Swap X/Y</label>
            <button class="hubmap__btn hubmap__btn--small" id="cal-reset">Reset to Default</button>
          </div>
        </div>
      </div>
    `;

    buildLegend();
  renderChecklist();
    bindCalibration();
    bindViewport();
    applyMapStyle();
    state.initialized = true;
    // Wait for image to load to know natural dims (we know but ensure layout settled)
    const img = document.getElementById("hubmap-img");
    if (img.complete) onMapReady(); else img.addEventListener("load", onMapReady, { once: true });
  }

  function buildLegend() {
      renderChecklist(); // update checklist on filter change
    const list = document.getElementById("hubmap-legend");
    list.innerHTML = "";
    ensureTags();

    // ── Story section ────────────────────────────────────
    list.appendChild(buildSection("Story", STORIES.map(s => {
      const count = TAGS.filter(t => t.story === s.id).length;
      return {
        kind: "story",
        id: s.id,
        label: s.label,
        icon: s.icon,
        color: "#9aa0aa",
        count,
        checked: !!state.filters.story[s.id],
      };
    })));

    // ── Type section (each type has nested subtype rows) ─
    const typeWrap = document.createElement("div");
    typeWrap.className = "hubmap__legend-section";
    const typeHead = document.createElement("div");
    typeHead.className = "hubmap__legend-section-title";
    typeHead.textContent = "Type";
    typeWrap.appendChild(typeHead);

    TYPES.forEach(t => {
      const typeRow = document.createElement("div");
      typeRow.className = "hubmap__legend-typeblock";
      const typeExpanded = state.legendExpandedTypes.has(t.id);
      const totalSubtypeCount = t.subtypes.length;
      const checkedSubtypeCount = t.subtypes.filter(s => !!state.filters.subtype[s.id]).length;
      const typeChecked = totalSubtypeCount > 0 && checkedSubtypeCount === totalSubtypeCount;
      const typeIndeterminate = checkedSubtypeCount > 0 && checkedSubtypeCount < totalSubtypeCount;

      // Type-level checkbox (toggles all subtypes under it)
      const typeCount = TAGS.filter(tg => tg.type === t.id).length;
      const headRow = makeRow({
        kind: "type",
        id: t.id,
        label: t.label,
        icon: (t.subtypes[0] && t.subtypes[0].icon) || null,
        color: (t.subtypes[0] && t.subtypes[0].color) || "#9aa0aa",
        count: typeCount,
        checked: typeChecked,
        indeterminate: typeIndeterminate,
        bold: true,
        expandable: true,
        expanded: typeExpanded,
        onExpandToggle: () => {
          if (state.legendExpandedTypes.has(t.id)) state.legendExpandedTypes.delete(t.id);
          else state.legendExpandedTypes.add(t.id);
          buildLegend();
        },
      });
      typeRow.appendChild(headRow);

      // Subtype rows
      const subtypeWrap = document.createElement("div");
      subtypeWrap.className = "hubmap__legend-subrows" + (typeExpanded ? "" : " is-collapsed");
      t.subtypes.forEach(s => {
        const subCount = TAGS.filter(tg => tg.subtype === s.id).length;
        if (subCount === 0 && s.id !== "npc") return; // hide empty subtypes (except NPC placeholder)
        const subRow = makeRow({
          kind: "subtype",
          id: s.id,
          label: s.label,
          icon: s.icon,
          color: s.color,
          count: subCount,
          checked: !!state.filters.subtype[s.id],
          indent: true,
        });
        subtypeWrap.appendChild(subRow);
      });
      typeRow.appendChild(subtypeWrap);
      typeWrap.appendChild(typeRow);
    });
    list.appendChild(typeWrap);

    // ── Progress section ─────────────────────────────────
    list.appendChild(buildSection("Progress", PROGRESS.map(p => {
      const count = TAGS.filter(t => t.progress === p.id).length;
      return {
        kind: "progress",
        id: p.id,
        label: p.label,
        icon: null,
        color: "#9aa0aa",
        count,
        checked: !!state.filters.progress[p.id],
      };
    })));

    // ── Location section ─────────────────────────────────
    const VENUE_GROUPS = [
      { id: "overworld",  label: "Overworld",    color: "#7dc8ff" },
      { id: "hub_venue",  label: "Hub Venues",   color: "#b8d4a8" },
      { id: "mission",    label: "Mission Only",  color: "#ffb04d" },
    ];
    list.appendChild(buildSection("Location", VENUE_GROUPS.map(vg => {
      const count = TAGS.filter(t => t.venueGroup === vg.id).length;
      return {
        kind: "venueGroup",
        id: vg.id,
        label: vg.label,
        icon: null,
        color: vg.color,
        count,
        checked: !!state.filters.venueGroup[vg.id],
      };
    })));
  }

  function buildSection(title, rows) {
    const wrap = document.createElement("div");
    wrap.className = "hubmap__legend-section";
    const h = document.createElement("div");
    h.className = "hubmap__legend-section-title";
    h.textContent = title;
    wrap.appendChild(h);
    rows.forEach(r => wrap.appendChild(makeRow(r)));
    return wrap;
  }

  function makeRow({ kind, id, label, icon, color, count, checked, indent, bold, indeterminate, expandable, expanded, onExpandToggle }) {
    const row = document.createElement("div");
    row.className = "hubmap__legend-row"
      + (indent ? " is-indent" : "")
      + (bold ? " is-bold" : "")
      + (expandable ? " is-expandable" : "");
    if (expandable) row.dataset.expanded = String(!!expanded);
    row.style.setProperty("--pin-color", color || "#9aa0aa");
    const iconHtml = icon
      ? `<img src="${icon}" alt="" class="hubmap__legend-icon${id === 'phyremark' ? ' hubmap__legend-icon--diamond' : ''}">`
      : `<span class="hubmap__legend-swatch" style="background:${color || "#9aa0aa"}"></span>`;
    row.innerHTML = `
      <input type="checkbox" data-kind="${kind}" data-id="${id}" ${checked ? "checked" : ""}>
      ${iconHtml}
      <span class="hubmap__legend-label">${label}</span>
      <span class="hubmap__legend-count">${count}</span>
    `;
    const checkbox = row.querySelector("input");
    if (checkbox && indeterminate) checkbox.indeterminate = true;
    checkbox.addEventListener("change", (e) => {
      const checked = e.target.checked;
      state.filters[kind][id] = checked;
      // Type checkbox is a bulk child toggle only.
      if (kind === "type") {
        const t = TYPES.find(tt => tt.id === id);
        if (t) {
          t.subtypes.forEach(s => { state.filters.subtype[s.id] = checked; });
          state.filters.type[id] = checked;
        }
        saveFilters();
        buildLegend(); // re-render to sync subtype checkboxes
        renderPins();
        renderChecklist();
        return;
      }
      // Subtype change: update parent type checkbox state implicitly (visual)
      saveFilters();
      renderPins();
      renderChecklist();
    });
    row.addEventListener("click", (event) => {
      if (event.target === checkbox) return;
      if (expandable) {
        event.preventDefault();
        if (typeof onExpandToggle === "function") onExpandToggle();
        return;
      }
      checkbox.click();
    });
    return row;
  }


  function bindCalibration() {
    const fields = ["a", "b", "c", "d"];
    fields.forEach(k => {
      const inp = document.getElementById("cal-" + k);
      inp.value = state.tx[k];
      inp.addEventListener("input", () => {
        const v = parseFloat(inp.value);
        if (!isNaN(v)) { state.tx[k] = v; saveTransform(); renderPins(); }
      });
    });
    const flip = document.getElementById("cal-flipY");
    flip.checked = !!state.tx.flipY;
    flip.addEventListener("change", () => { state.tx.flipY = flip.checked; saveTransform(); renderPins(); });
    const swap = document.getElementById("cal-swapXY");
    swap.checked = !!state.tx.swapXY;
    swap.addEventListener("change", () => { state.tx.swapXY = swap.checked; saveTransform(); renderPins(); });
    document.getElementById("cal-reset").addEventListener("click", () => {
      state.tx = Object.assign({}, DEFAULT_TX);
      saveTransform();
      ["a","b","c","d"].forEach(k => document.getElementById("cal-" + k).value = state.tx[k]);
      document.getElementById("cal-flipY").checked = false;
      document.getElementById("cal-swapXY").checked = false;
      renderPins();
    });
    document.getElementById("hubmap-calib-toggle").addEventListener("click", () => {
      document.getElementById("hubmap-calib").classList.toggle("hidden");
    });
    const calibClose = document.getElementById("hubmap-calib-close");
    if (calibClose) calibClose.addEventListener("click", () => {
      document.getElementById("hubmap-calib").classList.add("hidden");
    });
    document.getElementById("hubmap-checklist-toggle").addEventListener("click", () => {
      const panel = document.getElementById("hubmap-checklist-panel");
      const toggle = document.getElementById("hubmap-checklist-panel-toggle");
      const willShow = panel.classList.contains("hidden");
      syncChecklistPanelPosition();
      panel.classList.toggle("hidden");
      if (willShow) {
        panel.classList.remove("is-collapsed");
        if (toggle) toggle.setAttribute("aria-expanded", "true");
      }
    });
    document.getElementById("hubmap-grayscale-toggle").addEventListener("click", () => {
      state.grayscale = !state.grayscale;
      applyMapStyle();
      saveMapStyle();
    });
    document.getElementById("hubmap-building-info-toggle").addEventListener("click", () => {
      cycleBuildingInfoMode();
    });
    const checklistClose = document.getElementById("hubmap-checklist-close");
    if (checklistClose) checklistClose.addEventListener("click", () => {
      document.getElementById("hubmap-checklist-panel").classList.add("hidden");
    });
    document.getElementById("hubmap-home").addEventListener("click", fitView);
    document.getElementById("hubmap-fit").addEventListener("click", fitView);

    // Zoom buttons (zoom around viewport center)
    const zoomBy = (factor) => {
      const vp = document.getElementById("hubmap-viewport");
      const rect = vp.getBoundingClientRect();
      const mx = rect.width / 2, my = rect.height / 2;
      const newScale = Math.max(0.1, Math.min(8, state.view.scale * factor));
      const sx = (mx - state.view.tx) / state.view.scale;
      const sy = (my - state.view.ty) / state.view.scale;
      state.view.scale = newScale;
      state.view.tx = mx - sx * newScale;
      state.view.ty = my - sy * newScale;
      applyViewTransform();
    };
    document.getElementById("hubmap-zoom-in").addEventListener("click", () => zoomBy(1.25));
    document.getElementById("hubmap-zoom-out").addEventListener("click", () => zoomBy(1 / 1.25));

    const bindPanelToggle = (toggleId, panelId) => {
      const toggle = document.getElementById(toggleId);
      const panel = document.getElementById(panelId);
      if (!toggle || !panel) return;
      toggle.addEventListener("click", () => {
        const collapsed = panel.classList.toggle("is-collapsed");
        toggle.setAttribute("aria-expanded", String(!collapsed));
        if (panelId === "hubmap-panel-options") syncChecklistPanelPosition();
      });
    };

    bindPanelToggle("hubmap-legend-toggle", "hubmap-panel-legend");
    bindPanelToggle("hubmap-options-toggle", "hubmap-panel-options");
    bindPanelToggle("hubmap-checklist-panel-toggle", "hubmap-checklist-panel");
    syncChecklistPanelPosition();
    window.addEventListener("resize", syncChecklistPanelPosition);

    // Detail panel close
    const detailClose = document.getElementById("hubmap-detail-close");
    if (detailClose) detailClose.addEventListener("click", () => {
      closeDetailPanel();
    });

    // Preview popover close (× button only — outside click is reserved for the
    // map; clicking another pin will replace the popover content).
    const mClose = document.getElementById("hubmap-modal-close");
    if (mClose) mClose.addEventListener("click", closePreview);
    // Esc to close popover
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const m = document.getElementById("hubmap-modal");
        if (m && !m.classList.contains("hidden")) closePreview();
      }
    });
  }

  function bindViewport() {
    const vp = document.getElementById("hubmap-viewport");
    const stage = document.getElementById("hubmap-stage");

    let dragging = false, startX = 0, startY = 0, startTx = 0, startTy = 0;
    let dragMoved = 0;
    vp.addEventListener("mousedown", (e) => {
      // Don't start drag on a pin (pins consume their own clicks)
      if (e.target.closest(".hubmap__pin") || e.target.closest(".hubmap__building")) return;
      dragging = true;
      dragMoved = 0;
      vp.classList.add("is-dragging");
      startX = e.clientX; startY = e.clientY;
      startTx = state.view.tx; startTy = state.view.ty;
      e.preventDefault();
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const ndx = e.clientX - startX, ndy = e.clientY - startY;
      dragMoved = Math.max(dragMoved, Math.hypot(ndx, ndy));
      state.view.tx = startTx + ndx;
      state.view.ty = startTy + ndy;
      applyViewTransform();
    });
    window.addEventListener("mouseup", (e) => {
      if (!dragging) return;
      dragging = false;
      vp.classList.remove("is-dragging");
      // Treat a low-movement mouseup over the map as a "click to pick".
      if (dragMoved <= 4 && !e.target.closest(".hubmap__pin") && !e.target.closest(".hubmap__building") && !e.target.closest(".hubmap__panel")) {
        const rect = vp.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const px = (mx - state.view.tx) / state.view.scale;
        const py = (my - state.view.ty) / state.view.scale;
        reportPick(px, py);
      }
    });

    // (legacy click listener kept off — mouseup above handles picks reliably)

    vp.addEventListener("wheel", (e) => {
      e.preventDefault();
      const rect = vp.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      const newScale = Math.max(0.1, Math.min(8, state.view.scale * factor));
      // Zoom around cursor: keep stage point under cursor stationary
      const sx = (mx - state.view.tx) / state.view.scale;
      const sy = (my - state.view.ty) / state.view.scale;
      state.view.scale = newScale;
      state.view.tx = mx - sx * newScale;
      state.view.ty = my - sy * newScale;
      applyViewTransform();
    }, { passive: false });

    // Touch (basic 1-finger pan, 2-finger pinch)
    let lastTouches = null;
    vp.addEventListener("touchstart", (e) => {
      if (e.target.closest(".hubmap__pin") || e.target.closest(".hubmap__building")) return;
      lastTouches = touchInfo(e);
    }, { passive: true });
    vp.addEventListener("touchmove", (e) => {
      if (!lastTouches) return;
      const cur = touchInfo(e);
      if (cur.count === 1 && lastTouches.count === 1) {
        state.view.tx += cur.cx - lastTouches.cx;
        state.view.ty += cur.cy - lastTouches.cy;
      } else if (cur.count >= 2 && lastTouches.count >= 2) {
        const factor = cur.dist / (lastTouches.dist || 1);
        const newScale = Math.max(0.1, Math.min(8, state.view.scale * factor));
        const rect = vp.getBoundingClientRect();
        const mx = cur.cx - rect.left, my = cur.cy - rect.top;
        const sx = (mx - state.view.tx) / state.view.scale;
        const sy = (my - state.view.ty) / state.view.scale;
        state.view.scale = newScale;
        state.view.tx = mx - sx * newScale;
        state.view.ty = my - sy * newScale;
      }
      lastTouches = cur;
      applyViewTransform();
      e.preventDefault();
    }, { passive: false });
    vp.addEventListener("touchend", () => { lastTouches = null; }, { passive: true });
  }

  function syncChecklistPanelPosition() {
    const vp = document.getElementById("hubmap-viewport");
    const options = document.getElementById("hubmap-panel-options");
    const checklist = document.getElementById("hubmap-checklist-panel");
    if (!vp || !options || !checklist) return;
    const gap = 10;
    const bottomPad = 12;
    const top = options.offsetTop + options.offsetHeight + gap;
    const maxHeight = Math.max(140, vp.clientHeight - top - bottomPad);
    checklist.style.top = `${top}px`;
    checklist.style.maxHeight = `${maxHeight}px`;
  }

  function touchInfo(e) {
    const ts = e.touches;
    if (ts.length === 0) return { count: 0, cx: 0, cy: 0, dist: 0 };
    if (ts.length === 1) return { count: 1, cx: ts[0].clientX, cy: ts[0].clientY, dist: 0 };
    const dx = ts[1].clientX - ts[0].clientX;
    const dy = ts[1].clientY - ts[0].clientY;
    return {
      count: ts.length,
      cx: (ts[0].clientX + ts[1].clientX) / 2,
      cy: (ts[0].clientY + ts[1].clientY) / 2,
      dist: Math.hypot(dx, dy),
    };
  }

  function applyViewTransform() {
    const stage = document.getElementById("hubmap-stage");
    if (!stage) return;
    stage.style.transform = `translate(${state.view.tx}px, ${state.view.ty}px) scale(${state.view.scale})`;
    if (state.selected != null) positionDetailPanel(state.selected);
  }

  function fitView() {
    const vp = document.getElementById("hubmap-viewport");
    if (!vp) return;
    const rect = vp.getBoundingClientRect();
    const s = Math.min(rect.width / MAP_IMG_W, rect.height / MAP_IMG_H);
    state.view.scale = s;
    state.view.tx = (rect.width - MAP_IMG_W * s) / 2;
    state.view.ty = (rect.height - MAP_IMG_H * s) / 2;
    applyViewTransform();
  }

  function onMapReady() {
    fitView();
    renderBuildings();
    renderPins();
  }

  function cycleBuildingInfoMode() {
    const current = state.filters.buildingInfo || "hover";
    const next = current === "off" ? "hover" : current === "hover" ? "on" : "off";
    state.filters.buildingInfo = next;
    saveFilters();
    applyBuildingInfoMode();
  }

  function applyBuildingInfoMode() {
    const mode = state.filters.buildingInfo || "hover";
    const layer = document.getElementById("hubmap-buildings");
    const button = document.getElementById("hubmap-building-info-toggle");
    if (layer) {
      layer.classList.remove("hubmap__buildings--off", "hubmap__buildings--hover", "hubmap__buildings--on");
      layer.classList.add(`hubmap__buildings--${mode}`);
    }
    if (button) {
      const text = mode === "off" ? "Bldgs: Off" : mode === "on" ? "Bldgs: On" : "Bldgs: Hover";
      button.textContent = text;
      button.title = `Building info: ${mode}`;
      button.setAttribute("aria-label", `Building info: ${mode}`);
    }
  }

  function renderBuildings() {
    const layer = document.getElementById("hubmap-buildings");
    if (!layer) return;
    layer.innerHTML = "";

    // SVG overlay for polygon-defined buildings
    const polyBuildings = BUILDINGS.filter(b => b.poly);
    if (polyBuildings.length) {
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", `0 0 ${MAP_IMG_W} ${MAP_IMG_H}`);
      svg.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;";
      polyBuildings.forEach(building => {
        const pts = building.poly.map(p => p.join(",")).join(" ");
        const cx = Math.round(building.poly.reduce((s, p) => s + p[0], 0) / building.poly.length);
        const cy = Math.round(building.poly.reduce((s, p) => s + p[1], 0) / building.poly.length);

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "hubmap__building-poly-group");
        g.dataset.id = building.id;
        g.setAttribute("role", "button");
        g.setAttribute("aria-label", building.name);
        g.setAttribute("tabindex", "0");
        g.style.pointerEvents = "auto";
        g.addEventListener("click", (event) => {
          event.stopPropagation();
          openBuildingInfo(building, event);
        });
        g.addEventListener("keydown", (e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openBuildingInfo(building, e); }
        });

        const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        poly.setAttribute("points", pts);
        poly.setAttribute("class", "hubmap__building-poly");

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", cx);
        text.setAttribute("y", cy - 8);
        text.setAttribute("class", "hubmap__building-poly-label");
        text.setAttribute("text-anchor", "middle");
        text.textContent = building.name;

        g.appendChild(poly);
        g.appendChild(text);
        svg.appendChild(g);
      });
      layer.appendChild(svg);
    }

    // Rect buttons for non-polygon buildings
    BUILDINGS.filter(b => !b.poly).forEach((building) => {
      const node = document.createElement("button");
      node.type = "button";
      node.className = "hubmap__building";
      node.dataset.id = building.id;
      node.style.left = building.px + "px";
      node.style.top = building.py + "px";
      node.style.setProperty("--bw", (building.w || 120) + "px");
      node.style.setProperty("--bh", (building.h || 88) + "px");
      node.setAttribute("aria-label", building.name);
      node.title = building.name;
      node.innerHTML = `<span class="hubmap__building-name">${building.name}</span>`;
      node.addEventListener("click", (event) => {
        event.stopPropagation();
        openBuildingInfo(building, event);
      });
      layer.appendChild(node);
    });
    applyBuildingInfoMode();
  }

  function openBuildingInfo(building, evt) {
    const modal = document.getElementById("hubmap-modal");
    const body = document.getElementById("hubmap-modal-body");
    if (!modal || !body) return;
    body.innerHTML = `
      <h2 class="hubmap__modal-title" id="hubmap-modal-title">${building.name}</h2>
      <div class="hubmap__modal-tags">
        <span class="hubmap__tag">Building</span>
        <span class="hubmap__tag">Hub Landmark</span>
      </div>
      <div class="hubmap__modal-desc">${building.description}</div>
      <div class="hubmap__modal-meta">
        <code class="hubmap__modal-coords" title="Map coordinates">Map px: (${building.px}, ${building.py})</code>
        <code class="hubmap__modal-coords" title="Footprint">Footprint: ${building.w || 120}x${building.h || 88}</code>
      </div>
    `;
    modal.classList.remove("hidden");
    positionPopover(modal, evt);
  }

  function renderPins() {
    const layer = document.getElementById("hubmap-pins");
    if (!layer) return;
    ensureTags();
    const items = ensureItems();
    layer.innerHTML = "";
    let visible = 0;
    items.forEach((item, idx) => {
      const tags = TAGS[idx];
      if (!tags) return;
      // All four filter dimensions must pass
      if (!state.filters.story[tags.story]) return;
      if (!state.filters.subtype[tags.subtype]) return;
      if (!state.filters.progress[tags.progress]) return;
      if (!state.filters.venueGroup[tags.venueGroup]) return;
      // Skip obviously unset positions (0,0,0)
      if (!hasPixelPosition(item) && item.x === 0 && item.y === 0 && item.z === 0) return;
      const sub = SUBTYPE_BY_ID[tags.subtype];
      if (!sub) return;
      const { px, py } = positionFor(item);
      if (!isFinite(px) || !isFinite(py)) return;
      const visual = markerVisualFor(item, sub);
      visible++;
      const pin = document.createElement("button");
      pin.className = "hubmap__pin";
      pin.dataset.idx = idx;
      pin.style.left = px + "px";
      pin.style.top = py + "px";
      pin.style.setProperty("--pin-color", visual.color);
      if (sub.id === "phyremark") {
        pin.innerHTML = `<img src="${visual.icon}" alt="${sub.label}" class="hubmap__pin-img hubmap__pin-img--diamond">`;
      } else {
        pin.innerHTML = `<img src="${visual.icon}" alt="${sub.label}" class="hubmap__pin-img">`;
      }
      pin.title = labelFor(item, tags);
      pin.addEventListener("click", (e) => {
        e.stopPropagation();
        selectPin(idx, item, sub, tags);
      });
      layer.appendChild(pin);
    });
    const cnt = document.getElementById("hubmap-count");
    if (cnt) cnt.textContent = `Showing ${visible} of ${items.length} markers`;
    if (state.selected != null) {
      const selectedPin = layer.querySelector(`.hubmap__pin[data-idx="${state.selected}"]`);
      if (selectedPin) {
        selectedPin.classList.add("is-selected");
        positionDetailPanel(state.selected);
      } else {
        closeDetailPanel();
      }
    }
  }

  function labelFor(item, tags) {
    const story = STORIES.find(s => s.id === tags.story);
    const info = infoFor(item);
    const lines = [
      `${(story && story.label) || tags.story} · ${SUBTYPE_BY_ID[tags.subtype].label}`,
      info.name,
    ];
    if (item.location) lines.push(item.location);
    if (item.cls) lines.push(item.cls.replace(/_C$/, ""));
    lines.push(coordsFor(item));
    return lines.join("\n");
  }

  function selectPin(idx, item, sub, tags) {
    state.selected = idx;
    showDetail(item, sub, tags, idx);
    document.querySelectorAll(".hubmap__pin.is-selected").forEach(el => el.classList.remove("is-selected"));
    const el = document.querySelector(`.hubmap__pin[data-idx="${idx}"]`);
    if (el) el.classList.add("is-selected");
  }

  function closeDetailPanel() {
    const panel = document.getElementById("hubmap-detail-panel");
    if (panel) panel.classList.add("hidden");
    document.querySelectorAll(".hubmap__pin.is-selected").forEach(el => el.classList.remove("is-selected"));
    state.selected = null;
  }

  function positionDetailPanel(idx) {
    const panel = document.getElementById("hubmap-detail-panel");
    const vp = document.getElementById("hubmap-viewport");
    const pin = document.querySelector(`.hubmap__pin[data-idx="${idx}"]`);
    if (!panel || !vp || !pin || panel.classList.contains("hidden")) return;

    const vpRect = vp.getBoundingClientRect();
    const pinRect = pin.getBoundingClientRect();
    panel.style.left = "0px";
    panel.style.top = "0px";

    const panelW = panel.offsetWidth;
    const panelH = panel.offsetHeight;
    const margin = 12;
    const offset = 14;
    let x = pinRect.right - vpRect.left + offset;
    let y = (pinRect.top - vpRect.top) + (pinRect.height - panelH) / 2;

    if (x + panelW + margin > vpRect.width) {
      x = pinRect.left - vpRect.left - panelW - offset;
    }
    x = Math.max(margin, Math.min(x, vpRect.width - panelW - margin));
    y = Math.max(margin, Math.min(y, vpRect.height - panelH - margin));

    panel.style.left = x + "px";
    panel.style.top = y + "px";
  }

  function showDetail(item, sub, tags, idx) {
    const panel = document.getElementById("hubmap-detail-panel");
    const box = document.getElementById("hubmap-detail");
    if (!box || !panel) return;
    panel.classList.remove("hidden");
    const info = infoFor(item);
    const visual = markerVisualFor(item, sub);
    const story = STORIES.find(s => s.id === tags.story);
    const storyLabel = (story && story.label) || tags.story;
    const progressLabel = (PROGRESS.find(p => p.id === tags.progress) || {}).label || tags.progress;
    const isAcquired = (idx >= 0) && state.acquired.has(idx);
    const enemyType = bennyEnemyTypeFor(item, tags);
    box.innerHTML = `
      <div class="hubmap__detail-head">
        <img src="${visual.icon}" alt="" style="--pin-color:${visual.color}">
        <div>
          <div class="hubmap__detail-cat">${sub.label} · ${storyLabel}</div>
          <div class="hubmap__detail-name">${info.name}</div>
        </div>
      </div>
      ${enemyType ? `<div class="hubmap__detail-meta">Enemy Type: <strong>${enemyType}</strong></div>` : ""}
      ${item.owner && item.owner !== "Unknown" ? `<div class="hubmap__detail-meta">Owner: <strong>${item.owner}</strong></div>` : ""}
      ${item.venue ? `<div class="hubmap__detail-meta">Venue: <strong>${item.venue}</strong></div>` : ""}
      ${item.sublevel && item.sublevel !== item.venue ? `<div class="hubmap__detail-meta"><span title="Sublevel">↳</span> <code style="font-size:0.75em">${item.sublevel}</code></div>` : ""}
      <div class="hubmap__detail-actions">
        <label class="hubmap__detail-acquired">
          <input type="checkbox" id="detail-acquired-cb" ${isAcquired ? "checked" : ""}>
          Acquired
        </label>
        <button class="hubmap__detail-desc-btn" id="detail-desc-btn">Description ▸</button>
      </div>
    `;
    // Bind acquired checkbox
    if (idx >= 0) {
      const cb = document.getElementById("detail-acquired-cb");
      if (cb) {
        cb.addEventListener("change", (e) => {
          if (e.target.checked) state.acquired.add(idx);
          else state.acquired.delete(idx);
          saveAcquired();
        });
      }
    }
    // Bind description button
    const descBtn = document.getElementById("detail-desc-btn");
    if (descBtn) {
      descBtn.addEventListener("click", (e) => {
        openPreview(item, sub, tags, e);
      });
    }
    positionDetailPanel(idx);
  }

  // ── Preview popover (full description + screenshot) ────
  function openPreview(item, sub, tags, evt) {
    const modal = document.getElementById("hubmap-modal");
    const body = document.getElementById("hubmap-modal-body");
    if (!modal || !body) return;
    ensureTags();
    const items = ensureItems();
    const idx = items.indexOf(item);
    const info = infoFor(item);
    const visual = markerVisualFor(item, sub);
    const story = STORIES.find(s => s.id === tags.story);
    const storyLabel = (story && story.label) || tags.story;
    const progressLabel = (PROGRESS.find(p => p.id === tags.progress) || {}).label || tags.progress;
    const enemyType = bennyEnemyTypeFor(item, tags);
    const coords = coordsFor(item);
    const cls = item.cls;
    const desc = info.description ||
      `<em class="hubmap__modal-desc-empty">No description yet for this item.</em>`;
    const isAcquired = idx >= 0 && state.acquired.has(idx);

    body.innerHTML = `
      <div class="hubmap__modal-shot" id="hubmap-modal-shot">
        <img id="hubmap-modal-img" alt="${info.name} screenshot" style="--pin-color:${visual.color}">
        <div class="hubmap__modal-shot-fallback" id="hubmap-modal-fallback" hidden>
          <span class="hubmap__modal-shot-icon"><img src="${visual.icon}" alt=""></span>
          <span class="hubmap__modal-shot-msg">No screenshot yet.</span>
          <code class="hubmap__modal-shot-path">${info.screenshot}</code>
        </div>
      </div>
      <h2 class="hubmap__modal-title" id="hubmap-modal-title">${info.name}</h2>
      <div class="hubmap__modal-tags">
        <span class="hubmap__tag" style="--pin-color:${visual.color}">${sub.label}</span>
        <span class="hubmap__tag">${storyLabel}</span>
        <span class="hubmap__tag">${progressLabel}</span>
        ${item.location ? `<span class="hubmap__tag">${item.location}</span>` : ""}
        ${item.owner && item.owner !== "Unknown" ? `<span class="hubmap__tag">👤 ${item.owner}</span>` : ""}
        ${item.venue ? `<span class="hubmap__tag">📍 ${item.venue}</span>` : ""}
        ${enemyType ? `<span class="hubmap__tag">Enemy: ${enemyType}</span>` : ""}
      </div>
      <div class="hubmap__modal-desc">${desc}</div>
      <label class="hubmap__modal-acquired">
        <input type="checkbox" id="modal-acquired-checkbox" ${isAcquired ? "checked" : ""}>
        Acquired
      </label>
      <div class="hubmap__modal-meta">
        <code class="hubmap__modal-cls" title="Asset class">${cls}</code>
        <code class="hubmap__modal-coords" title="World coordinates">${coords}</code>
        ${item.sublevel ? `<code class="hubmap__modal-cls" title="Sublevel">${item.sublevel}</code>` : ""}
      </div>
    `;

    // Bind acquired checkbox
    if (idx >= 0) {
      const checkbox = document.getElementById("modal-acquired-checkbox");
      if (checkbox) {
        checkbox.addEventListener("change", (e) => {
          if (e.target.checked) state.acquired.add(idx);
          else state.acquired.delete(idx);
          saveAcquired();
        });
      }
    }

    // Try the screenshot, swap to fallback on error.
    const imgEl = document.getElementById("hubmap-modal-img");
    const fbEl = document.getElementById("hubmap-modal-fallback");
    imgEl.addEventListener("error", () => {
      imgEl.style.display = "none";
      fbEl.hidden = false;
    }, { once: true });
    imgEl.src = info.screenshot;

    modal.classList.remove("hidden");
    positionPopover(modal, evt);
  }

  function positionPopover(modal, evt) {
    // Anchor near the click, with a small offset, clamped to the map viewport.
    const vp = document.getElementById("hubmap-viewport");
    if (!vp) return;
    const vpRect = vp.getBoundingClientRect();
    // Reset before measuring (so width/height are natural)
    modal.style.left = "0px";
    modal.style.top = "0px";
    const cardW = modal.offsetWidth;
    const cardH = modal.offsetHeight;
    const margin = 12;
    const offset = 16; // gap from cursor
    // If no event (e.g. triggered from a panel button), centre the popover
    if (!evt || evt.clientX === undefined) {
      modal.style.left = Math.max(margin, (vpRect.width - cardW) / 2) + "px";
      modal.style.top = Math.max(margin, (vpRect.height - cardH) / 2) + "px";
      return;
    }
    // Mouse position relative to viewport
    let x = evt.clientX - vpRect.left + offset;
    let y = evt.clientY - vpRect.top + offset;
    // If overflowing right edge, flip to the left of the cursor
    if (x + cardW + margin > vpRect.width) {
      x = (evt.clientX - vpRect.left) - cardW - offset;
    }
    // Clamp horizontally
    x = Math.max(margin, Math.min(x, vpRect.width - cardW - margin));
    // If overflowing bottom edge, flip above the cursor
    if (y + cardH + margin > vpRect.height) {
      y = (evt.clientY - vpRect.top) - cardH - offset;
    }
    // Clamp vertically
    y = Math.max(margin, Math.min(y, vpRect.height - cardH - margin));
    modal.style.left = x + "px";
    modal.style.top = y + "px";
  }

  function closePreview() {
    const modal = document.getElementById("hubmap-modal");
    if (!modal) return;
    modal.classList.add("hidden");
  }

  // ── Public API ───────────────────────────────────────────
  window.renderMapPage = renderMapPage;
})();

