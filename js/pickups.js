// VTMB2 Skill Calculator — Pickups Page
// =======================================

// ── Weapon Data ─────────────────────────────────────────────
const WEAPONS = [
  // Shadow Mirror order first (when mod is enabled): blunt, sharp, heavy, then guns.
  { id: 'pipe',            name: 'Pipe',               type: 'Melee',  ammo: 0,  thrownDmg: 10,  projDmg: 15.0,     shadowKey: 'Num 1', shadowCost: '10 Melancholic'  },
  { id: 'baseballbat',     name: 'Baseball Bat',       type: 'Melee',  ammo: 0,  thrownDmg: 10,  projDmg: 15.0,     shadowKey: 'Num 1', shadowCost: '10 Melancholic'  },
  { id: 'knife',           name: 'Knife',              type: 'Melee',  ammo: 0,  thrownDmg: 15,  projDmg: 15.0,     shadowKey: 'Num 2', shadowCost: '20 Melancholic'  },
  { id: 'machete',         name: 'Machete',            type: 'Melee',  ammo: 0,  thrownDmg: 15,  projDmg: 15.0,     shadowKey: 'Num 2', shadowCost: '20 Melancholic'  },
  { id: 'sword',           name: 'Sword',              type: 'Melee',  ammo: 0,  thrownDmg: 15,  projDmg: 15.0,     shadowKey: 'Num 2', shadowCost: '20 Melancholic'  },
  { id: 'spikeclub',       name: 'Spike Club',         type: 'Melee',  ammo: 0,  thrownDmg: 15,  projDmg: 15.0,     shadowKey: 'Num 2', shadowCost: '20 Melancholic'  },
  { id: 'sledgehammer',    name: 'Sledge Hammer',      type: 'Melee',  ammo: 0,  thrownDmg: 50,  projDmg: 15.0,     shadowKey: 'Num 3', shadowCost: '30 Melancholic'  },
  { id: 'warhammer',       name: 'War Hammer',         type: 'Melee',  ammo: 0,  thrownDmg: 65,  projDmg: 15.0,     shadowKey: 'Num 3', shadowCost: '30 Melancholic'  },
  { id: 'shotgun',         name: 'Shotgun',            type: 'Ranged', ammo: 1,  thrownDmg: 10,  projDmg: 4.8,      pelletCount: 12, shadowKey: 'Num 4', shadowCost: '50 Melancholic'  },
  { id: 'iaoshotgun',      name: 'IAO Shotgun',        type: 'Ranged', ammo: 2,  thrownDmg: 10,  projDmg: 4.3,      pelletCount: 7,  shadowKey: 'Num 4', shadowCost: '50 Melancholic'  },
  { id: 'pistol',          name: 'Pistol',             type: 'Ranged', ammo: 10, thrownDmg: 10,  projDmg: 10.0,     shadowKey: 'Num 5', shadowCost: '70 Melancholic'  },
  { id: 'highcalrevolver', name: 'High-Cal Revolver',  type: 'Ranged', ammo: 6,  thrownDmg: 10,  projDmg: 15.0,     shadowKey: 'Num 5', shadowCost: '70 Melancholic'  },
  { id: 'dollarstorem4',   name: 'Dollar Store M4',    type: 'Ranged', ammo: 12, thrownDmg: 10,  projDmg: 6.0,      shadowKey: 'Num 6', shadowCost: '100 Melancholic' },
  { id: 'iaorifle',        name: 'IAO Rifle',          type: 'Ranged', ammo: 12, thrownDmg: 10,  projDmg: 6.0,      shadowKey: 'Num 6', shadowCost: '100 Melancholic' },
  { id: 'stubbysmg',       name: 'Stubby SMG',         type: 'Ranged', ammo: 20, thrownDmg: 10,  projDmg: 3.0,      shadowKey: 'Num 7', shadowCost: '100 Melancholic' },
  { id: 'smg',             name: 'SMG',                type: 'Ranged', ammo: 22, thrownDmg: 10,  projDmg: 4.0,      shadowKey: 'Num 7', shadowCost: '100 Melancholic' },
  { id: 'megashotty',      name: 'Riot Gun',           type: 'Ranged', ammo: 5,  thrownDmg: 10,  projDmg: 3.4,      pelletCount: 8,  shadowKey: 'Num 8', shadowCost: '120 Melancholic' },
  { id: 'sniperrifle',     name: 'Sniper Rifle',       type: 'Ranged', ammo: 1,  thrownDmg: 10,  projDmg: 60.0,     shadowKey: 'Num 9', shadowCost: '150 Melancholic' },
  { id: 'crossbow',        name: 'Crossbow',           type: 'Ranged', ammo: 1,  thrownDmg: 10,  projDmg: 'Special', shadowKey: 'Num 9', shadowCost: '150 Melancholic' },
  { id: 'mirror_station_note', name: 'Show Station Notes', type: 'Utility', ammo: 0, thrownDmg: '—', projDmg: '—', shadowKey: 'F1', shadowCost: '—' },
  // Not directly produced by Shadow Mirror recipe list.
  { id: 'revolver',        name: 'Revolver',           type: 'Ranged', ammo: 6,  thrownDmg: 10,  projDmg: 10.0 },
];

const SHADOW_MIRROR_REQUEST_BY_KEY = {
  'Num 1': 'something blunt',
  'Num 2': 'something sharp',
  'Num 3': 'something heavy',
  'Num 4': 'a shotgun',
  'Num 5': 'a sidearm',
  'Num 6': 'a rifle',
  'Num 7': 'an SMG',
  'Num 8': 'a riot gun',
  'Num 9': 'something deadly',
  'F1': 'show station notes',
};

// ── Elixir Data ─────────────────────────────────────────────
// iconSil: white-silhouette PNG path; iconBg: CSS background colour (resonance-matched)
const ELIXIRS = [
  {
    id: 'blood',
    name: 'Blood Elixir',
    iconSil: 'assets/ElixirIcons/sil_bloodpips.png',
    iconBg:  '#862A31',
    effect: 'Restores blood pips.',
    magnitude: '+3 Blood Pips',
    duration: 'Instant',
    missionOnly: false,
    craftKey: 'Num 1',
    craftCost: '150 Sanguine',
    craftTokens: { san: 150 },
  },
  {
    id: 'mending',
    name: 'Mending Elixir',
    iconSil: 'assets/ElixirIcons/sil_bloodhealth.png',
    iconBg:  '#006483',
    effect: 'Restores health.',
    magnitude: '+50 HP',
    duration: 'Instant',
    missionOnly: false,
    craftKey: 'Num 2',
    craftCost: '50 Sanguine + 50 Choleric + 50 Melancholic',
    craftTokens: { san: 50, cho: 50, mel: 50 },
  },
  {
    id: 'potence',
    name: 'Potence Elixir',
    iconSil: 'assets/ElixirIcons/sil_damage.png',
    iconBg:  '#7B5229',
    effect: 'Enables Brujah combat stance and increases attack power.',
    magnitude: '×1.0 Attack Power',
    duration: '8s',
    missionOnly: false,
    craftKey: 'Num 3',
    craftCost: '150 Choleric',
    craftTokens: { cho: 150 },
  },
  {
    id: 'fortitude',
    name: 'Fortitude Elixir',
    iconSil: 'assets/ElixirIcons/sil_armor.png',
    iconBg:  '#733F83',
    effect: 'Drastically reduces damage taken (~90% effective damage reduction).',
    magnitude: 'Health Fragility ×0.1',
    duration: '10s',
    missionOnly: false,
    craftKey: 'Num 4',
    craftCost: '150 Melancholic',
    craftTokens: { mel: 150 },
  },
];

// Alchemy utility actions (MAHAH mod)
const ALCHEMY_EXTRA = [
  { key: 'Num 5', action: 'Craft All (one of each)',  iconType: 'all-four',  cost: 'Up to 4× elixir costs',     result: '1 of each elixir (priority left → right)' },
  { key: 'Num 6', action: 'Craft All Until Full',     iconType: 'stacked-four', cost: 'Repeats rotation',           result: 'Fills all elixir slots to cap' },
  { key: 'Num 7', action: 'Exchange Sanguine',        iconType: 'exchange-cost', costTokens: { san: 150 },          resultTokens: { cho: 50, mel: 50 } },
  { key: 'Num 8', action: 'Exchange Choleric',        iconType: 'exchange-cost', costTokens: { cho: 150 },          resultTokens: { san: 50, mel: 50 } },
  { key: 'Num 9', action: 'Exchange Melancholic',     iconType: 'exchange-cost', costTokens: { mel: 150 },          resultTokens: { san: 50, cho: 50 } },
  { key: 'Num +', action: 'Resonance → AP',           iconType: 'res-to-ap',    costTokens: { san: 500, cho: 500, mel: 500 }, resultTokens: { ap: 1 } },
  { key: 'Num -', action: 'AP → Resonance',           iconType: 'ap-to-res',    costTokens: { ap: 1 },             resultTokens: { san: 300, cho: 300, mel: 300 } },
  { key: 'Num /', action: 'AP → Elixir Cap',          iconType: 'bottle',       costTokens: { ap: 1 },             result: '+1 elixir capacity' },
  { key: 'Num *', action: 'AP → Max HP',              iconType: 'phyre',        costTokens: { ap: 1 },             result: '+5 Phyre Marks (health collectibles, +9.5 Max HP)' },
  { key: 'F1',    action: 'Show Station Note',        iconType: 'station-note', cost: '—',                         result: 'Display HUD note' },
];

const RES_ACTION_ICONS = {
  san: 'assets/ElixirIcons/res_bloodres_sanguine.png',
  cho: 'assets/ElixirIcons/res_bloodres_choleric.png',
  mel: 'assets/ElixirIcons/res_bloodres_melancholic.png',
};

const PICKUPS_SORT_STATE = {
  weapons: { key: null, dir: 'asc' },
  items: { key: null, dir: 'asc' },
};

function toggleSort(tableState, key) {
  if (tableState.key === key) {
    tableState.dir = tableState.dir === 'asc' ? 'desc' : 'asc';
    return;
  }
  tableState.key = key;
  tableState.dir = 'asc';
}

function sortIndicator(tableState, key) {
  if (tableState.key !== key) return '';
  return tableState.dir === 'asc' ? ' ▲' : ' ▼';
}

function parseMirrorCost(costText) {
  if (!costText) return null;
  const m = costText.match(/^(\d+)\s+Melancholic$/i);
  if (!m) return null;
  return Number(m[1]);
}

function parseNumpadKey(raw) {
  if (!raw) return Number.POSITIVE_INFINITY;
  const txt = String(raw).trim().toUpperCase();
  if (!txt.startsWith('NUM')) return Number.POSITIVE_INFINITY;
  const token = txt.slice(3).trim();
  const map = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '+': 10,
    '-': 11,
    '/': 12,
    '*': 13,
  };
  return Object.prototype.hasOwnProperty.call(map, token) ? map[token] : Number.POSITIVE_INFINITY;
}

function compareSortValues(a, b) {
  const aNum = typeof a === 'number' ? a : Number.NaN;
  const bNum = typeof b === 'number' ? b : Number.NaN;
  const aIsNum = !Number.isNaN(aNum);
  const bIsNum = !Number.isNaN(bNum);

  if (aIsNum && bIsNum) return aNum - bNum;

  const aTxt = (a ?? '').toString().toLowerCase();
  const bTxt = (b ?? '').toString().toLowerCase();
  if (aTxt < bTxt) return -1;
  if (aTxt > bTxt) return 1;
  return 0;
}

function sumResourceTokens(tokens) {
  if (!tokens) return null;
  return (tokens.ap || 0) + (tokens.san || 0) + (tokens.cho || 0) + (tokens.mel || 0);
}

function parseLeadingNumber(text) {
  if (!text) return null;
  const m = String(text).match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

function formatResourceTokens(tokens) {
  if (!tokens) return '—';
  const bits = [];

  if (tokens.ap) {
    bits.push(`<span class="pickup-token"><svg class="pickup-token__ap" viewBox="0 0 16 16" width="12" height="12"><polygon points="8,1 15,8 8,15 1,8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg><span>${tokens.ap}</span></span>`);
  }
  if (tokens.san) {
    bits.push(`<span class="pickup-token"><img src="${UI.resSanguine}" alt="Sanguine"><span>${tokens.san}</span></span>`);
  }
  if (tokens.cho) {
    bits.push(`<span class="pickup-token"><img src="${UI.resCholeric}" alt="Choleric"><span>${tokens.cho}</span></span>`);
  }
  if (tokens.mel) {
    bits.push(`<span class="pickup-token"><img src="${UI.resMelancholic}" alt="Melancholic"><span>${tokens.mel}</span></span>`);
  }

  return bits.join('<span class="pickup-token__sep">+</span>');
}

function renderAlchemyRowIcon(row) {
  const iconElixirs = ELIXIRS.slice(0, 4);
  if (row.iconType === 'all-four') {
    return `<div class="pickup-img-slot pickup-img-slot--combo" title="${row.action}">
      ${iconElixirs.map(e => `
        <span class="pickup-mini-elixir" style="background:${e.iconBg}">
          <img src="${e.iconSil}" alt="${e.name}">
        </span>
      `).join('')}
    </div>`;
  }

  if (row.iconType === 'stacked-four') {
    return `<div class="pickup-img-slot pickup-img-slot--stack" title="${row.action}">
      ${iconElixirs.map((e, i) => `
        <span class="pickup-stack-elixir pickup-stack-elixir--${i + 1}" style="background:${e.iconBg}">
          <img src="${e.iconSil}" alt="${e.name}">
        </span>
      `).join('')}
    </div>`;
  }

  if (row.iconType === 'exchange-cost') {
    const cost = row.costTokens || {};
    if (cost.san) {
      return `<div class="pickup-img-slot pickup-img-slot--res-spend pickup-img-slot--exchange-burn" title="Spend Sanguine">
        <img src="${RES_ACTION_ICONS.san}" alt="Sanguine">
        <span class="pickup-res-spend__value">${cost.san}</span>
      </div>`;
    }
    if (cost.cho) {
      return `<div class="pickup-img-slot pickup-img-slot--res-spend pickup-img-slot--exchange-burn" title="Spend Choleric">
        <img src="${RES_ACTION_ICONS.cho}" alt="Choleric">
        <span class="pickup-res-spend__value">${cost.cho}</span>
      </div>`;
    }
    if (cost.mel) {
      return `<div class="pickup-img-slot pickup-img-slot--res-spend pickup-img-slot--exchange-burn" title="Spend Melancholic">
        <img src="${RES_ACTION_ICONS.mel}" alt="Melancholic">
        <span class="pickup-res-spend__value">${cost.mel}</span>
      </div>`;
    }
  }

  if (row.iconType === 'res-to-ap') {
    return `<div class="pickup-img-slot pickup-img-slot--ap-diamond" title="Resonance to AP">
      <svg class="pickup-ap-diamond" viewBox="0 0 16 16" width="20" height="20" aria-hidden="true"><polygon points="8,1 15,8 8,15 1,8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
    </div>`;
  }

  if (row.iconType === 'ap-to-res') {
    return `<div class="pickup-img-slot pickup-img-slot--tri-res" title="AP to Resonance">
      <img class="pickup-tri-res pickup-tri-res--top" src="${RES_ACTION_ICONS.san}" alt="Sanguine">
      <img class="pickup-tri-res pickup-tri-res--left" src="${RES_ACTION_ICONS.cho}" alt="Choleric">
      <img class="pickup-tri-res pickup-tri-res--right" src="${RES_ACTION_ICONS.mel}" alt="Melancholic">
    </div>`;
  }

  if (row.iconType === 'bottle') {
    return `<div class="pickup-img-slot" title="AP to Elixir Capacity">
      <img src="assets/ElixirIcons/icon_bottle.png" alt="Bottle">
    </div>`;
  }

  if (row.iconType === 'phyre') {
    return `<div class="pickup-img-slot pickup-img-slot--phyre" title="AP to Max HP">
      <img class="pickup-phyre-icon" src="assets/ElixirIcons/icon_phyre_mark.png" alt="Phyre Mark">
    </div>`;
  }

  if (row.iconType === 'station-note') {
    return `<div class="pickup-img-slot" title="Show Station Note">
      <img src="assets/ElixirIcons/icon_station_note.png" alt="Station Note">
    </div>`;
  }

  return `<div class="pickup-img-slot" title="Alchemy action">
    <span class="pickup-img-slot__placeholder">⚗</span>
  </div>`;
}

// ── Render ───────────────────────────────────────────────────
function renderPickupsPage() {
  renderWeaponsPage();
  renderItemsPage();
}

function renderWeaponsPage() {
  const havenActive = typeof state !== 'undefined' && state.modHaven;
  const tableSort = PICKUPS_SORT_STATE.weapons;

  const container = document.getElementById('pickups-weapons-table');
  if (!container) return;

  const getWeaponSortValue = (weapon, key) => {
    switch (key) {
      case 'shadowKey': return parseNumpadKey(weapon.shadowKey);
      case 'type': return weapon.type;
      case 'name': return weapon.name;
      case 'projDmg':
        if (weapon.type === 'Melee') return Number.NEGATIVE_INFINITY;
        if (typeof weapon.projDmg !== 'number') return Number.POSITIVE_INFINITY;
        return weapon.projDmg * (weapon.pelletCount || 1);
      case 'thrownDmg': return weapon.thrownDmg;
      case 'ammo': return weapon.type === 'Ranged' ? weapon.ammo : Number.NEGATIVE_INFINITY;
      case 'shadowCost': return parseMirrorCost(weapon.shadowCost);
      default: return null;
    }
  };

  const weaponsRows = WEAPONS
    .map((w, idx) => ({ w, idx }))
    .sort((a, b) => {
      if (!tableSort.key) return a.idx - b.idx;
      const cmp = compareSortValues(getWeaponSortValue(a.w, tableSort.key), getWeaponSortValue(b.w, tableSort.key));
      if (cmp === 0) return a.idx - b.idx;
      return tableSort.dir === 'asc' ? cmp : -cmp;
    })
    .map(({ w }) => w);

  const mergedMirrorStarts = new Map();
  for (let i = 0; i < weaponsRows.length; i++) {
    const curr = weaponsRows[i];
    if (!curr.shadowKey || !curr.shadowCost) continue;

    const prev = weaponsRows[i - 1];
    if (prev && prev.shadowKey === curr.shadowKey && prev.shadowCost === curr.shadowCost) continue;

    let span = 1;
    for (let j = i + 1; j < weaponsRows.length; j++) {
      const next = weaponsRows[j];
      if (next.shadowKey === curr.shadowKey && next.shadowCost === curr.shadowCost) span += 1;
      else break;
    }
    mergedMirrorStarts.set(i, span);
  }

  const formatMirrorCost = (costText) => {
    if (!costText) return '—';
    const m = costText.match(/^(\d+)\s+Melancholic$/i);
    if (!m) return costText;
    return `<span class="pickup-token"><img src="${UI.resMelancholic}" alt="Melancholic"><span>${m[1]}</span></span>`;
  };

  const formatProjDamage = (weapon) => {
    if (weapon.type === 'Melee') return '—';
    if (!weapon || !weapon.pelletCount || typeof weapon.projDmg !== 'number') return weapon.projDmg;
    const total = (weapon.projDmg * weapon.pelletCount).toFixed(1).replace(/\.0$/, '');
    return `${weapon.projDmg}x${weapon.pelletCount} (${total})`;
  };

  let html = `<table class="pickups-table">
    <thead><tr>
      ${havenActive ? `<th class="pickup-sortable" data-sort="shadowKey">Mirror Key${sortIndicator(tableSort, 'shadowKey')}</th>` : ''}
      <th class="col-img"></th>
      <th class="pickup-sortable" data-sort="type">Type${sortIndicator(tableSort, 'type')}</th>
      <th class="pickup-sortable" data-sort="name">Name${sortIndicator(tableSort, 'name')}</th>
      <th class="pickup-sortable" data-sort="projDmg" title="Projectile Damage">Proj. Dmg${sortIndicator(tableSort, 'projDmg')}</th>
      <th class="pickup-sortable" data-sort="thrownDmg" title="Thrown Damage">Thrown Dmg${sortIndicator(tableSort, 'thrownDmg')}</th>
      <th class="pickup-sortable" data-sort="ammo">Clip${sortIndicator(tableSort, 'ammo')}</th>
      ${havenActive ? `<th class="pickup-sortable" data-sort="shadowCost">Mirror Cost${sortIndicator(tableSort, 'shadowCost')}</th>` : ''}
    </tr></thead><tbody>`;

  weaponsRows.forEach((w, i) => {
    let keyCell = '';
    let costCell = '';

    if (havenActive) {
      if (!w.shadowKey || !w.shadowCost) {
        keyCell = '<td>—</td>';
        costCell = '<td class="pickup-cost">—</td>';
      } else {
        const span = mergedMirrorStarts.get(i);
        if (span) {
          const rowspan = span > 1 ? ` rowspan="${span}"` : '';
          const requestText = SHADOW_MIRROR_REQUEST_BY_KEY[w.shadowKey];
          keyCell = `<td${rowspan} class="pickup-merge-cell"><kbd class="pickup-key">${w.shadowKey}</kbd>${requestText ? `<div class="pickup-key-note">"${requestText}"</div>` : ''}</td>`;
          costCell = `<td${rowspan} class="pickup-cost pickup-merge-cell">${formatMirrorCost(w.shadowCost)}</td>`;
        }
      }
    }

    html += `<tr>
      ${havenActive ? keyCell : ''}
      <td class="col-img">
        <div class="pickup-img-slot" title="No image yet">
          <span class="pickup-img-slot__placeholder">?</span>
        </div>
      </td>
      <td>${w.type}</td>
      <td class="pickup-name">${w.name}</td>
      <td>${formatProjDamage(w)}</td>
      <td>${w.thrownDmg}</td>
      <td>${w.type === 'Ranged' ? w.ammo : '—'}</td>
      ${havenActive ? costCell : ''}
    </tr>`;
  });

  html += '</tbody></table>';
  container.innerHTML = html;

  container.querySelectorAll('th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      toggleSort(tableSort, th.dataset.sort);
      renderWeaponsPage();
    });
  });
}

function renderItemsPage() {
  const havenActive = typeof state !== 'undefined' && state.modHaven;
  const tableSort = PICKUPS_SORT_STATE.items;

  // Single items table: base elixirs + mod-only alchemy rows (hidden until MAHAH is enabled).
  const container = document.getElementById('pickups-items-table');
  if (!container) return;

  const itemRows = [];
  for (const e of ELIXIRS) {
    itemRows.push({
      rowKind: 'elixir',
      missionOnly: e.missionOnly,
      key: e.craftKey || '',
      name: e.name,
      effect: e.effect,
      magnitude: e.magnitude,
      duration: e.duration,
      costTokens: e.craftTokens,
      costText: e.craftCost || '—',
      iconBg: e.iconBg,
      iconSil: e.iconSil,
      source: e,
    });
  }

  if (havenActive) {
    for (const r of ALCHEMY_EXTRA) {
      itemRows.push({
        rowKind: 'alchemy',
        key: r.key,
        name: r.action,
        effect: 'Alchemy Station utility',
        magnitude: r.resultTokens ? formatResourceTokens(r.resultTokens) : (r.result || '—'),
        duration: 'Instant',
        costTokens: r.costTokens,
        costText: r.cost || '—',
        source: r,
      });
    }
  }

  const getItemSortValue = (row, key) => {
    switch (key) {
      case 'alchemyKey': return parseNumpadKey(row.key);
      case 'name': return row.name;
      case 'effect': return row.effect;
      case 'magnitude': return row.magnitude;
      case 'duration': return row.duration;
      case 'cost': {
        const tokenSum = sumResourceTokens(row.costTokens);
        if (tokenSum !== null) return tokenSum;
        const parsed = parseLeadingNumber(row.costText);
        return parsed !== null ? parsed : row.costText;
      }
      default: return null;
    }
  };

  const sortedItemRows = itemRows
    .map((row, idx) => ({ row, idx }))
    .sort((a, b) => {
      if (!tableSort.key) return a.idx - b.idx;
      const cmp = compareSortValues(getItemSortValue(a.row, tableSort.key), getItemSortValue(b.row, tableSort.key));
      if (cmp === 0) return a.idx - b.idx;
      return tableSort.dir === 'asc' ? cmp : -cmp;
    })
    .map(({ row }) => row);

  let html = `<table class="pickups-table">
    <thead><tr>
      ${havenActive ? `<th class="pickup-sortable" data-sort="alchemyKey">Alchemy Key${sortIndicator(tableSort, 'alchemyKey')}</th>` : ''}
      <th class="col-img"></th>
      <th class="pickup-sortable" data-sort="name">Name${sortIndicator(tableSort, 'name')}</th>
      <th class="pickup-sortable" data-sort="effect">Effect${sortIndicator(tableSort, 'effect')}</th>
      <th class="pickup-sortable" data-sort="magnitude">Magnitude${sortIndicator(tableSort, 'magnitude')}</th>
      <th class="pickup-sortable" data-sort="duration">Duration${sortIndicator(tableSort, 'duration')}</th>
      ${havenActive ? `<th class="pickup-sortable" data-sort="cost">Alchemy Cost${sortIndicator(tableSort, 'cost')}</th>` : ''}
    </tr></thead><tbody>`;

  for (const row of sortedItemRows) {
    if (row.rowKind === 'elixir') {
      const e = row.source;
      html += `<tr class="${row.missionOnly ? 'elixir-card--mission' : ''}">
      ${havenActive ? `<td>${row.key ? `<kbd class="pickup-key">${row.key}</kbd>` : '—'}</td>` : ''}
      <td class="col-img">
        <div class="pickup-img-slot pickup-img-slot--elixir"${row.iconBg ? ` style="background:${row.iconBg}"` : ''}>
          ${row.iconSil
            ? `<img src="${row.iconSil}" alt="${row.name}" class="elixir-icon-sil">`
            : `<span class="pickup-img-slot__placeholder">?</span>`}
        </div>
      </td>
      <td class="pickup-name">${row.name}${row.missionOnly ? ' <span class="elixir-card__badge">Mission Only</span>' : ''}</td>
      <td>${row.effect}</td>
      <td>${row.magnitude}</td>
      <td>${row.duration}</td>
      ${havenActive
        ? `<td class="pickup-cost">${row.costTokens ? formatResourceTokens(row.costTokens) : row.costText}</td>`
        : ''}
    </tr>`;
      continue;
    }

    const r = row.source;
    const costHtml = row.costTokens ? formatResourceTokens(row.costTokens) : row.costText;
    const resultHtml = r.resultTokens ? formatResourceTokens(r.resultTokens) : (r.result || '—');
    html += `<tr class="pickups-row--alchemy">
      <td><kbd class="pickup-key">${row.key}</kbd></td>
      <td class="col-img">
        ${renderAlchemyRowIcon(r)}
      </td>
      <td class="pickup-name">${row.name}</td>
      <td>${row.effect}</td>
      <td>${resultHtml}</td>
      <td>${row.duration}</td>
      <td class="pickup-cost">${costHtml}</td>
    </tr>`;
  }

  html += '</tbody></table>';
  container.innerHTML = html;

  container.querySelectorAll('th[data-sort]').forEach((th) => {
    th.addEventListener('click', () => {
      toggleSort(tableSort, th.dataset.sort);
      renderItemsPage();
    });
  });
}
