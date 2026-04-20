// VTMB2 Skill Calculator - Outfits Page Logic
// ==============================================

const outfitState = {
  selectedClan: null,   // which clan's outfits we're viewing
  focusedOutfit: null,  // { clanId, index }
  previewGender: "F",   // "F" or "M"
};

// ── Full-size outfit image paths ─────────────────────────────
// Brujah & Toreador use: T_UI_Silhouette_{Clan}_{F|M}_{num}.png
// Others use: T_UI_Phyre_{Clan}_{num}.png (F) / T_UI_Phyre2_{Clan}_{num}.png (M)
function getOutfitFullImage(clanId, thumb, gender) {
  // Extract the number from the thumb filename (e.g. "03" from "T_UI_Thumb_Phyre_Brujah_03.png")
  const numMatch = thumb.match(/_(\d+)\.png$/);
  if (!numMatch) return thumb; // fallback
  const num = numMatch[1];

  const SILO_DIR = `${TEX}/N_Textures/Outfit/Silhouettes`;
  const clanFileNames = {
    brujah: "Brujah",
    tremere: "Tremere",
    banuHaqim: "Banu_Haqim",
    ventrue: "Ventrue",
    lasombra: "Lasombra",
    toreador: "Toreador",
  };
  const clanFile = clanFileNames[clanId];

  if (clanId === "brujah" || clanId === "toreador") {
    return `${SILO_DIR}/T_UI_Silhouette_${clanFile}_${gender}_${num}.png`;
  }
  if (gender === "M") {
    return `${SILO_DIR}/T_UI_Phyre2_${clanFile}_${num}.png`;
  }
  return `${SILO_DIR}/T_UI_Phyre_${clanFile}_${num}.png`;
}

// ── Init ─────────────────────────────────────────────────────
function initOutfits() {
  // Clan selection is now shared via the main clan selector
}

// Called by app.js when switching to the outfits tab
function refreshOutfitsPage() {
  // Sync clan from skill tree
  if (state.selectedClan) {
    outfitState.selectedClan = state.selectedClan;
  }
  // Clear focus if the focused outfit is no longer unlocked
  if (outfitState.focusedOutfit) {
    const { clanId, index } = outfitState.focusedOutfit;
    const outfit = OUTFITS[clanId][index];
    if (!isOutfitUnlocked(clanId, outfit.tier)) {
      outfitState.focusedOutfit = null;
    }
  }
  renderOutfitGrid();
  renderOutfitDetail();
  renderReactionsTable();
}

// ── Outfit Grid ──────────────────────────────────────────────
function renderOutfitGrid() {
  const grid = document.getElementById("outfit-grid");
  grid.innerHTML = "";

  // Layout: clans as rows, tiers as columns
  // Grid: [clan logo] [strike] [relocate] [affect] [mastery]
  const tierLabels = ["strike", "relocate", "affect", "mastery"];

  // Header row: empty corner + tier labels
  const corner = document.createElement("div");
  grid.appendChild(corner);
  for (const tier of tierLabels) {
    const header = document.createElement("div");
    header.className = "outfit-grid__tier-header";
    header.textContent = TIERS[tier].label;
    grid.appendChild(header);
  }

  // One row per clan
  for (const clanId of CLAN_ORDER) {
    const clan = CLANS[clanId];
    // Clan logo cell
    const logoCell = document.createElement("div");
    logoCell.className = "outfit-grid__clan-logo";
    logoCell.innerHTML = `<img src="${clan.logo}" alt="${clan.name}" title="${clan.name}">`;
    grid.appendChild(logoCell);

    // Outfit cells for each tier
    for (let tierIdx = 0; tierIdx < tierLabels.length; tierIdx++) {
      const outfit = OUTFITS[clanId][tierIdx];
      const isUnlocked = isOutfitUnlocked(clanId, outfit.tier);
      const isFocused = outfitState.focusedOutfit &&
        outfitState.focusedOutfit.clanId === clanId &&
        outfitState.focusedOutfit.index === tierIdx;

      const cell = document.createElement("div");
      cell.className = "outfit-cell" +
        (isUnlocked ? " unlocked" : " locked") +
        (isFocused ? " focused" : "");

      if (isUnlocked) {
        cell.innerHTML = `<img class="outfit-cell__thumb" src="${outfit.thumb}" alt="${outfit.name}">
          <div class="outfit-cell__name">${outfit.name}</div>
          <div class="outfit-cell__type">${OUTFIT_TYPES[outfit.type].label}</div>`;
      } else {
        cell.innerHTML = `<img class="outfit-cell__lock" src="${UI.blockedPadlock}" alt="Locked">
          <div class="outfit-cell__name">${outfit.name}</div>`;
      }

      if (isUnlocked) {
        cell.style.cursor = "pointer";
        cell.addEventListener("click", () => {
          outfitState.focusedOutfit = { clanId, index: tierIdx };
          renderOutfitGrid();
          renderOutfitDetail();
          renderReactionsTable();
        });
      }

      grid.appendChild(cell);
    }
  }
}

// Check if an outfit is unlocked based on skill tree state
function isOutfitUnlocked(clanId, tier) {
  const key = `${clanId}:${tier}`;
  const abilityState = state.abilities[key];
  const isOwnClan = clanId === state.selectedClan;
  // Own clan: need unlocked. Cross-clan: need awakened or unlocked.
  if (isOwnClan) {
    return abilityState === "unlocked";
  }
  return abilityState === "awakened" || abilityState === "unlocked";
}

// ── Outfit Detail Panel ──────────────────────────────────────
function renderOutfitDetail() {
  const panel = document.getElementById("outfit-detail");

  if (!outfitState.focusedOutfit) {
    panel.innerHTML = '<div class="empty-state">Select an outfit to view details</div>';
    return;
  }

  const { clanId, index } = outfitState.focusedOutfit;
  const outfit = OUTFITS[clanId][index];
  const clan = CLANS[clanId];
  const typeData = OUTFIT_TYPES[outfit.type];
  const isUnlocked = isOutfitUnlocked(clanId, outfit.tier);
  const ability = ABILITIES[clanId][outfit.tier];

  let html = "";

  // Full-size outfit image
  html += `<div class="outfit-detail__thumb-wrap">`;
  if (isUnlocked) {
    const fullImg = getOutfitFullImage(clanId, outfit.thumb, outfitState.previewGender);
    html += `<img class="outfit-detail__thumb" src="${fullImg}" alt="${outfit.name}">`;
  } else {
    html += `<div class="outfit-detail__thumb-locked">
      <img src="${UI.blockedPadlock}" alt="Locked">
    </div>`;
  }
  html += `</div>`;

  // M/F toggle
  if (isUnlocked) {
    html += `<div class="outfit-detail__gender-toggle">
      <button class="gender-btn${outfitState.previewGender === 'F' ? ' active' : ''}" data-gender="F">F</button>
      <button class="gender-btn${outfitState.previewGender === 'M' ? ' active' : ''}" data-gender="M">M</button>
    </div>`;
  }

  // Name
  html += `<div class="outfit-detail__name">${outfit.name}</div>`;

  // Type badge
  html += `<div class="outfit-detail__type outfit-type--${outfit.type}">${typeData.label}</div>`;

  // Clan
  html += `<div class="outfit-detail__clan">
    <img src="${clan.logo}" alt="${clan.name}">
    <span>${clan.name}</span>
  </div>`;

  // Unlock requirement
  html += `<div class="outfit-detail__req">`;
  if (isUnlocked) {
    html += `<span style="color:var(--green-affinity)">✓ Unlocked</span>`;
  } else {
    const isOwnClan = clanId === state.selectedClan;
    html += `<span style="color:var(--text-dim)">${isOwnClan ? "Unlock" : "Awaken"} <strong>${ability.name}</strong> to obtain</span>`;
  }
  html += `</div>`;

  // Skill tree link
  html += `<div class="outfit-detail__req">
    <button class="outfit-detail__skilltree-btn" data-clan="${clanId}" data-tier="${outfit.tier}">
      ← View in Skill Tree: ${ability.name}
    </button>
  </div>`;

  // Conversation options
  html += `<div class="outfit-detail__convo">
    <div class="outfit-detail__convo-label">Conversation Options:</div>
    <div class="outfit-detail__convo-option friendly">"${typeData.convo[0]}"</div>
    <div class="outfit-detail__convo-option aggressive">"${typeData.convo[1]}"</div>
  </div>`;

  panel.innerHTML = html;

  // Bind gender toggle buttons
  panel.querySelectorAll(".gender-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      outfitState.previewGender = btn.dataset.gender;
      renderOutfitDetail();
    });
  });

  // Bind skill tree link
  const stBtn = panel.querySelector(".outfit-detail__skilltree-btn");
  if (stBtn) {
    stBtn.addEventListener("click", () => {
      navigateToAbility(stBtn.dataset.clan, stBtn.dataset.tier);
    });
  }
}

// ── Reactions Table ──────────────────────────────────────────
// Maps affect ability names to their resonance
const AFFECT_RESONANCE = {
  "Beckon":               { san: true,  mel: false, cho: false },
  "Glimpse of Oblivion":  { san: false, mel: true,  cho: false },
  "Taunt":                { san: false, mel: false, cho: true  },
};

// Check if the player has unlocked/awakened a specific affect ability from any clan
function getUnlockedAffects() {
  const unlocked = [];
  for (const clanId of CLAN_ORDER) {
    const ability = ABILITIES[clanId].affect;
    const key = `${clanId}:affect`;
    const s = state.abilities[key];
    if (s === "unlocked" || s === "awakened") {
      const res = AFFECT_RESONANCE[ability.name];
      if (res) {
        unlocked.push({ name: ability.name, resonance: res, clanId });
      }
    }
  }
  // Deduplicate by ability name (multiple clans can have same affect)
  const seen = new Set();
  return unlocked.filter(a => { if (seen.has(a.name)) return false; seen.add(a.name); return true; });
}

function renderReactionsTable() {
  const container = document.getElementById("reactions-tables");
  container.innerHTML = "";

  if (!outfitState.focusedOutfit) {
    container.innerHTML = '<div style="text-align:center; padding:20px; color:var(--text-dim);">Select an unlocked outfit to see NPC reactions</div>';
    return;
  }

  const { clanId, index } = outfitState.focusedOutfit;
  const outfit = OUTFITS[clanId][index];
  const typeData = OUTFIT_TYPES[outfit.type];

  const npcTypes = [
    { id: "homeless",     label: "Homeless" },
    { id: "biker",        label: "Biker" },
    { id: "streetwalker", label: "Streetwalker" },
    { id: "business",     label: "Business" },
  ];
  const resTypes = [
    { id: "san", icon: UI.resSanguineLg,   cssVar: "--res-sanguine" },
    { id: "mel", icon: UI.resMelancholicLg, cssVar: "--res-melancholic" },
    { id: "cho", icon: UI.resCholericLg,    cssVar: "--res-choleric" },
  ];

  // Helper: resonance icon header
  const resHeader = (r) => `<th><img class="reactions-res-icon" src="${r.icon}" alt="" title="${r.id}"></th>`;

  // ── Table 1: Can you talk to them? (outfit type gating) ──
  let html = `<h3 class="reactions-section__subtitle">Approach – <span class="outfit-type--${outfit.type}">${typeData.label}</span> outfit</h3>`;
  html += `<table class="reactions-table"><thead><tr><th></th>`;
  for (const r of resTypes) {
    html += resHeader(r);
  }
  html += `</tr></thead><tbody>`;
  for (const npc of npcTypes) {
    html += `<tr><td>${npc.label}</td>`;
    for (const r of resTypes) {
      const val = typeData.reactions[npc.id][r.id];
      html += `<td class="${val ? "react-pos" : "react-neg"}">${val ? "✓" : "✗"}</td>`;
    }
    html += `</tr>`;
  }
  html += `</tbody></table>`;

  // ── Table 2: Affect abilities (resonance columns, gated by skill tree) ──
  const unlockedAffects = getUnlockedAffects();
  html += `<h3 class="reactions-section__subtitle">Affect Abilities</h3>`;
  if (unlockedAffects.length === 0) {
    html += `<div style="padding:8px; color:var(--text-dim);">No affect abilities unlocked. Unlock Taunt, Beckon, or Glimpse of Oblivion in the Skill Tree.</div>`;
  } else {
    html += `<table class="reactions-table"><thead><tr><th>Ability</th>`;
    for (const r of resTypes) {
      html += resHeader(r);
    }
    html += `</tr></thead><tbody>`;
    for (const affect of unlockedAffects) {
      html += `<tr><td>${affect.name}</td>`;
      for (const r of resTypes) {
        const val = affect.resonance[r.id];
        html += `<td class="${val ? "react-pos" : "react-neg"}">${val ? "✓" : "✗"}</td>`;
      }
      html += `</tr>`;
    }
    html += `</tbody></table>`;
  }

  // ── Table 3: Conversation options + disposition ──
  html += `<h3 class="reactions-section__subtitle">Conversation &amp; Disposition</h3>`;
  html += `<table class="reactions-table"><thead><tr><th>Option</th>`;
  for (const npc of npcTypes) {
    html += `<th colspan="3">${npc.label}</th>`;
  }
  html += `</tr><tr><th></th>`;
  for (let i = 0; i < npcTypes.length; i++) {
    for (const r of resTypes) {
      html += resHeader(r);
    }
  }
  html += `</tr></thead><tbody>`;

  // Friendly / Aggressive rows (from this outfit's type)
  html += `<tr><td class="convo-friendly">"${typeData.convo[0]}"</td>`;
  for (const npc of npcTypes) {
    for (const r of resTypes) {
      const val = CONVO_EFFECTS.friendly[npc.id][r.id];
      html += `<td class="${val ? "react-pos" : "react-neg"}">${val ? "✓" : "✗"}</td>`;
    }
  }
  html += `</tr>`;
  html += `<tr><td class="convo-aggressive">"${typeData.convo[1]}"</td>`;
  for (const npc of npcTypes) {
    for (const r of resTypes) {
      const val = CONVO_EFFECTS.aggressive[npc.id][r.id];
      html += `<td class="${val ? "react-pos" : "react-neg"}">${val ? "✓" : "✗"}</td>`;
    }
  }
  html += `</tr>`;

  // Disposition rows
  for (const [id, data] of Object.entries(DISPOSITIONS)) {
    html += `<tr><td><strong>${id.charAt(0).toUpperCase() + id.slice(1)}</strong><br><span style="font-size:10px;color:var(--text-dim)">"${data.quote}"</span></td>`;
    for (const npc of npcTypes) {
      for (const r of resTypes) {
        const val = data[npc.id][r.id];
        html += `<td class="${val ? "react-pos" : "react-neg"}">${val ? "✓" : "✗"}</td>`;
      }
    }
    html += `</tr>`;
  }

  html += `</tbody></table>`;

  container.innerHTML = html;
}

// ── Initialize on load ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", initOutfits);
