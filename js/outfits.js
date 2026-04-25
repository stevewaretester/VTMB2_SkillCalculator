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
  // Sync clan from skill tree, but only if we're not navigating to a specific outfit
  if (state.selectedClan && !outfitState.focusedOutfit) {
    outfitState.selectedClan = state.selectedClan;
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
          <div class="outfit-cell__type outfit-type--${outfit.type}">${OUTFIT_TYPES[outfit.type].label}</div>`;
      } else {
        cell.innerHTML = `<img class="outfit-cell__lock" src="${UI.blockedPadlock}" alt="Locked">
          <div class="outfit-cell__name">${outfit.name}</div>`;
      }

      cell.style.cursor = "pointer";
      cell.addEventListener("click", () => {
        const alreadyFocused = outfitState.focusedOutfit &&
          outfitState.focusedOutfit.clanId === clanId &&
          outfitState.focusedOutfit.index === tierIdx;
        outfitState.focusedOutfit = alreadyFocused ? null : { clanId, index: tierIdx };
        renderOutfitGrid();
        renderOutfitDetail();
        renderReactionsTable();
      });
      cell.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        outfitState.focusedOutfit = null;
        renderOutfitGrid();
        renderOutfitDetail();
        renderReactionsTable();
      });

      grid.appendChild(cell);
    }
  }

  // ── Benny (Loose Cannon DLC) row ──
  const bennyLogoCell = document.createElement("div");
  bennyLogoCell.className = "outfit-grid__clan-logo";
  bennyLogoCell.innerHTML = `<img src="assets/ElixirIcons/icon_phyre_mark.png" alt="Benny" title="Benny — Loose Cannon DLC">`;
  grid.appendChild(bennyLogoCell);

  const isBennyFocused = outfitState.focusedOutfit &&
    outfitState.focusedOutfit.clanId === "benny" &&
    outfitState.focusedOutfit.index === 0;
  const isBennyUnlocked = bennyState.looseCannon;
  const bennyCell = document.createElement("div");
  bennyCell.className = "outfit-cell" +
    (isBennyUnlocked ? " unlocked" : " locked") +
    (isBennyFocused ? " focused" : "");
  if (isBennyUnlocked) {
    bennyCell.innerHTML = `
    <img class="outfit-cell__thumb" src="${BENNY_OUTFIT.thumb}" alt="${BENNY_OUTFIT.name}">
    <img class="outfit-cell__badge" src="${UI.bennyLogo}" alt="Loose Cannon DLC">
    <div class="outfit-cell__name">${BENNY_OUTFIT.name}</div>
    <div class="outfit-cell__type outfit-type--${BENNY_OUTFIT.type}">${OUTFIT_TYPES[BENNY_OUTFIT.type].label}</div>`;
  } else {
    bennyCell.innerHTML = `
    <img class="outfit-cell__lock" src="${UI.blockedPadlock}" alt="Locked">
    <img class="outfit-cell__badge" src="${UI.bennyLogo}" alt="Loose Cannon DLC">
    <div class="outfit-cell__name">${BENNY_OUTFIT.name}</div>`;
  }
  bennyCell.style.cursor = "pointer";
  bennyCell.addEventListener("click", () => {
    const alreadyFocused = outfitState.focusedOutfit &&
      outfitState.focusedOutfit.clanId === "benny" &&
      outfitState.focusedOutfit.index === 0;
    outfitState.focusedOutfit = alreadyFocused ? null : { clanId: "benny", index: 0 };
    renderOutfitGrid();
    renderOutfitDetail();
    renderReactionsTable();
  });
  bennyCell.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    outfitState.focusedOutfit = null;
    renderOutfitGrid();
    renderOutfitDetail();
    renderReactionsTable();
  });
  grid.appendChild(bennyCell);

  // Empty cells for the remaining 3 tier columns
  for (let i = 1; i < tierLabels.length; i++) {
    grid.appendChild(document.createElement("div"));
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

  // ── Benny DLC detail ──
  if (clanId === "benny") {
    const outfit = BENNY_OUTFIT;
    const typeData = OUTFIT_TYPES[outfit.type];
    const isUnlocked = bennyState.looseCannon;
    let html = "";

    html += `<div class="outfit-detail__thumb-wrap">`;
    if (isUnlocked && outfit.fullImg) {
      html += `<img class="outfit-detail__thumb" src="${outfit.fullImg}" alt="${outfit.name}" style="cursor:pointer;">`;
    } else {
      html += `<img class="outfit-detail__thumb outfit-detail__thumb--locked" src="assets/N_Textures/Outfit/Silhouettes/T_UI_Thumb_Bruhjan04.png" alt="Locked">`;
    }
    html += `</div>`;

    html += `<div class="outfit-detail__name">${outfit.name}</div>`;
    if (outfit.desc) html += `<div class="outfit-detail__desc">${outfit.desc}</div>`;
    html += `<div class="outfit-detail__type outfit-type--${outfit.type}">${typeData.label}</div>`;
    html += `<div class="outfit-detail__clan">
      <img src="${UI.bennyLogo}" alt="Loose Cannon DLC">
      <span>Benny — Loose Cannon DLC</span>
    </div>`;
    if (isUnlocked) {
      html += `<div class="outfit-detail__req"><span style="color:var(--green-affinity)">✓ Unlocked</span></div>`;
    } else {
      html += `<div class="outfit-detail__req"><button class="outfit-detail__skilltree-btn" id="benny-dlc-unlock-link">Enable Loose Cannon DLC to unlock →</button></div>`;
    }
    panel.innerHTML = html;
    if (isUnlocked && outfit.fullImg) {
      panel.querySelector(".outfit-detail__thumb").addEventListener("click", () => openImageLightbox(outfit.fullImg, outfit.name));
    }
    panel.querySelector("#benny-dlc-unlock-link")?.addEventListener("click", () => {
      if (typeof navigateToBennyDLC === "function") {
        navigateToBennyDLC();
        // Focus the outfit sidebar item after navigation
        setTimeout(() => {
          if (typeof bennyState !== 'undefined' && typeof renderBennySidebarItems === 'function' && typeof renderBennyDetail === 'function') {
            bennyState.sidebarFocused = 'outfit';
            bennyState.focused = null;
            renderBennySidebarItems();
            const detail = document.getElementById('benny-detail');
            if (detail) renderBennyDetail(detail);
          }
        }, 50);
      }
    });
    return;
  }

  const outfit = OUTFITS[clanId][index];
  const clan = CLANS[clanId];
  const typeData = OUTFIT_TYPES[outfit.type];
  const isUnlocked = isOutfitUnlocked(clanId, outfit.tier);
  const ability = ABILITIES[clanId][outfit.tier];

  let html = "";

  // Full-size outfit image
  const LOCKED_PLACEHOLDER = {
    F: `assets/N_Textures/Outfit/Silhouettes/T_UI_Thumb_Bruhjan04.png`,
    M: `assets/N_Textures/Outfit/Silhouettes/T_UI_Thumb_Bruhjan_M_04.png`,
  };

  html += `<div class="outfit-detail__thumb-wrap">`;
  if (isUnlocked) {
    const fullImg = getOutfitFullImage(clanId, outfit.thumb, outfitState.previewGender);
    html += `<img class="outfit-detail__thumb" src="${fullImg}" alt="${outfit.name}">`;
  } else {
    html += `<img class="outfit-detail__thumb outfit-detail__thumb--locked" src="${LOCKED_PLACEHOLDER[outfitState.previewGender]}" alt="Locked">`;
  }
  html += `</div>`;

  // M/F toggle (always shown)
  html += `<div class="outfit-detail__gender-toggle">
    <button class="gender-btn${outfitState.previewGender === 'F' ? ' active' : ''}" data-gender="F">F</button>
    <button class="gender-btn${outfitState.previewGender === 'M' ? ' active' : ''}" data-gender="M">M</button>
  </div>`;

  // Name
  html += `<div class="outfit-detail__name">${outfit.name}</div>`;

  // Description
  if (outfit.desc) {
    html += `<div class="outfit-detail__desc">${outfit.desc}</div>`;
  }

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
      <img src="${ability.icon}" alt="${ability.name}">${ability.name}
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
        unlocked.push({ name: ability.name, resonance: res, clanId, tier: "affect" });
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

  const npcTypes = [
    { id: "homeless",     label: "Homeless" },
    { id: "biker",        label: "Biker" },
    { id: "streetwalker", label: "Streetwalker" },
    { id: "business",     label: "Business" },
  ];
  const resTypes = [
    { id: "san", icon: UI.resSanguineLg,    cssVar: "--res-sanguine" },
    { id: "mel", icon: UI.resMelancholicLg, cssVar: "--res-melancholic" },
    { id: "cho", icon: UI.resCholericLg,    cssVar: "--res-choleric" },
  ];
  const AFFECT_LINK_DEFS = [
    { name: "Taunt",               lookup: "Taunt",               resVar: "--res-choleric",    convo: "You are nothing to me" },
    { name: "Beckon",              lookup: "Beckon",              resVar: "--res-sanguine",    convo: "You want me" },
    { name: "Glimpse of Oblivion", lookup: "Glimpse of Oblivion", resVar: "--res-melancholic", convo: "You should run" },
  ];

  const resHeader = (r) => `<th><img class="reactions-res-icon" src="${r.icon}" alt="" title="${r.id}"></th>`;

  function buildApproachTable(typeKey, typeData) {
    let h = `<h3 class="reactions-section__subtitle">Approach – <span class="outfit-type--${typeKey}">${typeData.label}</span></h3>`;
    h += `<table class="reactions-table"><thead><tr><th></th>`;
    for (const r of resTypes) h += resHeader(r);
    h += `</tr></thead><tbody>`;
    for (const npc of npcTypes) {
      h += `<tr><td>${npc.label}</td>`;
      for (const r of resTypes) {
        const val = typeData.reactions[npc.id][r.id];
        h += `<td class="${val ? "react-pos" : "react-neg"}">${val ? "✓" : "✗"}</td>`;
      }
      h += `</tr>`;
    }
    h += `</tbody></table>`;
    return h;
  }

  function buildAffectBlock() {
    // Build a lookup of unlocked affect names from state
    const unlockedNames = new Set();
    const unlockedMeta = {}; // name -> { clanId, tier }
    for (const clanId of CLAN_ORDER) {
      const ability = ABILITIES[clanId].affect;
      const key = `${clanId}:affect`;
      const s = state.abilities[key];
      if ((s === "unlocked" || s === "awakened") && !unlockedNames.has(ability.name)) {
        unlockedNames.add(ability.name);
        unlockedMeta[ability.name] = { clanId, tier: "affect" };
      }
    }

    let h = `<h3 class="reactions-section__subtitle">Affect Abilities</h3>`;
    h += `<table class="reactions-table"><thead><tr><th>Ability</th><th>Convo Option</th>`;
    for (const r of resTypes) h += resHeader(r);
    h += `</tr></thead><tbody>`;

    for (const a of AFFECT_LINK_DEFS) {
      const res = AFFECT_RESONANCE[a.lookup];
      const isUnlocked = unlockedNames.has(a.name);
      const meta = unlockedMeta[a.name];
      const loc = ABILITY_LOCATION[a.lookup];
      const icon = loc ? ABILITIES[loc.clan][loc.tier].icon : null;
      const iconHtml = icon ? `<img class="affect-ability-icon" src="${icon}" alt="">` : '';

      if (isUnlocked && meta) {
        h += `<tr>`;
        h += `<td><button class="affect-link-btn" style="color:var(${a.resVar})" data-clan="${meta.clanId}" data-tier="${meta.tier}">${iconHtml}${a.name}</button></td>`;
        h += `<td class="convo-affect-option" style="color:var(${a.resVar})">&ldquo;${a.convo}&rdquo;</td>`;
        for (const r of resTypes) {
          const val = res ? res[r.id] : false;
          h += `<td class="${val ? "react-pos" : "react-neg"}">${val ? "✓" : "✗"}</td>`;
        }
        h += `</tr>`;
      } else {
        const linkBtn = loc
          ? `<button class="affect-link-btn affect-link-btn--locked" data-clan="${loc.clan}" data-tier="${loc.tier}">${iconHtml}🔒 ${a.name}</button>`
          : `<span class="affect-locked-name">${iconHtml}🔒 ${a.name}</span>`;
        h += `<tr class="affect-row--locked">`;
        h += `<td>${linkBtn}</td>`;
        h += `<td class="convo-affect-option convo-affect-option--locked">—</td>`;
        for (const r of resTypes) {
          const val = res ? res[r.id] : false;
          h += `<td class="${val ? "react-pos react-pos--locked" : "react-neg react-neg--locked"}">${val ? "✓" : "✗"}</td>`;
        }
        h += `</tr>`;
      }
    }

    h += `</tbody></table>`;
    return h;
  }

  function buildConvoBlock(friendlyLabel, aggressiveLabel) {
    let h = `<h3 class="reactions-section__subtitle">Conversation &amp; Disposition</h3>`;
    h += `<table class="reactions-table"><thead><tr><th>Option</th>`;
    for (const npc of npcTypes) h += `<th colspan="3">${npc.label}</th>`;
    h += `</tr><tr><th></th>`;
    for (let i = 0; i < npcTypes.length; i++) for (const r of resTypes) h += resHeader(r);
    h += `</tr></thead><tbody>`;

    h += `<tr><td class="convo-friendly">${friendlyLabel}</td>`;
    for (const npc of npcTypes) {
      for (const r of resTypes) {
        const val = CONVO_EFFECTS.friendly[npc.id][r.id];
        h += `<td class="${val ? "react-pos" : "react-neg"}">${val ? "✓" : "✗"}</td>`;
      }
    }
    h += `</tr>`;
    h += `<tr><td class="convo-aggressive">${aggressiveLabel}</td>`;
    for (const npc of npcTypes) {
      for (const r of resTypes) {
        const val = CONVO_EFFECTS.aggressive[npc.id][r.id];
        h += `<td class="${val ? "react-pos" : "react-neg"}">${val ? "✓" : "✗"}</td>`;
      }
    }
    h += `</tr>`;

    for (const [id, data] of Object.entries(DISPOSITIONS)) {
      h += `<tr><td><strong>${id.charAt(0).toUpperCase() + id.slice(1)}</strong><br><span style="font-size:10px;color:var(--text-dim)">"${data.quote}"</span></td>`;
      for (const npc of npcTypes) {
        for (const r of resTypes) {
          const val = data[npc.id][r.id];
          h += `<td class="${val ? "react-pos" : "react-neg"}">${val ? "✓" : "✗"}</td>`;
        }
      }
      h += `</tr>`;
    }
    h += `</tbody></table>`;
    return h;
  }

  let html = "";

  if (!outfitState.focusedOutfit) {
    // ── Default view: all outfit types ──
    for (const typeKey of ["grunge", "strong", "wealthy", "attractive", "priest"]) {
      const td = OUTFIT_TYPES[typeKey];
      if (td) html += buildApproachTable(typeKey, td);
    }
    html += buildAffectBlock();
    html += buildConvoBlock(
      '<span class="convo-friendly">First Option</span>',
      '<span class="convo-aggressive">Second Option</span>'
    );
  } else {
    // ── Focused outfit view ──
    const { clanId, index } = outfitState.focusedOutfit;
    const outfit = clanId === "benny" ? BENNY_OUTFIT : OUTFITS[clanId][index];
    const typeData = OUTFIT_TYPES[outfit.type];
    html += buildApproachTable(outfit.type, typeData);
    html += buildAffectBlock();
    html += buildConvoBlock(
      `<span class="convo-friendly">"${typeData.convo[0]}"</span>`,
      `<span class="convo-aggressive">"${typeData.convo[1]}"</span>`
    );
  }

  container.innerHTML = html;

  container.querySelectorAll(".affect-link-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (typeof navigateToAbility === "function") {
        if (!state.selectedClan) selectClan(btn.dataset.clan);
        navigateToAbility(btn.dataset.clan, btn.dataset.tier);
      }
    });
  });
}

// ── Initialize on load ───────────────────────────────────────
document.addEventListener("DOMContentLoaded", initOutfits);
