// VTMB2 Skill Calculator - Application Logic
// =============================================

// ── Shared Tooltip ─────────────────────────────────────────
const sharedTooltip = document.createElement('div');
sharedTooltip.className = 'tooltip';
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(sharedTooltip));

// ── State ────────────────────────────────────────────────────
const state = {
  selectedClan: null,
  completedClans: new Set(),
  completionTalents: false,
  modFabienPhlegmatic: false,
  modHaven: false,
  // Per-ability state: "locked" | "awakened" | "unlocked"
  // Key: "clanId:tier"
  abilities: {},
  // Which ability is "selected" per tier (visual only)
  selectedPerTier: {},
  // Currently hovered/focused ability for detail panel
  focusedAbility: null,
  clanSelectorCollapsed: false,
};

const STATE_PARAM = "state";
const STATE_COOKIE = "vtmb2_state";
const STATE_VERSION = 1;

function initAbilityStateDefaults() {
  for (const clanId of CLAN_ORDER) {
    for (const tier of TIER_ORDER) {
      state.abilities[`${clanId}:${tier}`] = "locked";
    }
  }
}

function encodeStatePayload(payload) {
  try {
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  } catch {
    return "";
  }
}

function decodeStatePayload(encoded) {
  try {
    const padded = encoded + "===".slice((encoded.length + 3) % 4);
    const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function makePersistedState() {
  const abilityEntries = {};
  for (const [k, v] of Object.entries(state.abilities)) {
    if (v !== "locked") abilityEntries[k] = v;
  }

  return {
    v: STATE_VERSION,
    sc: state.selectedClan,
    cc: Array.from(state.completedClans),
    ct: !!state.completionTalents,
    mh: !!state.modHaven,
    mf: !!state.modFabienPhlegmatic,
    cs: !!state.clanSelectorCollapsed,
    sp: state.selectedPerTier,
    a: abilityEntries,
    lc: !!bennyState.looseCannon,
  };
}

function setCookie(name, value, maxAgeSeconds) {
  document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function getCookie(name) {
  const prefix = `${name}=`;
  const parts = document.cookie ? document.cookie.split("; ") : [];
  for (const p of parts) {
    if (p.startsWith(prefix)) return p.substring(prefix.length);
  }
  return "";
}

function persistState() {
  const payload = makePersistedState();
  const encoded = encodeStatePayload(payload);
  if (!encoded) return;

  const url = new URL(window.location.href);
  url.searchParams.set(STATE_PARAM, encoded);
  history.replaceState(null, "", url.toString());

  // Keep one-year rolling save for returning visitors.
  setCookie(STATE_COOKIE, encoded, 60 * 60 * 24 * 365);
}

function applyPersistedState(payload) {
  if (!payload || typeof payload !== "object") return;

  state.selectedClan = CLAN_ORDER.includes(payload.sc) ? payload.sc : null;
  state.completedClans = new Set(
    Array.isArray(payload.cc) ? payload.cc.filter(id => CLAN_ORDER.includes(id)) : []
  );
  state.completionTalents = !!payload.ct;
  state.modHaven = !!payload.mh;
  state.modFabienPhlegmatic = !!payload.mf;
  state.clanSelectorCollapsed = !!payload.cs;
  state.selectedPerTier = payload.sp && typeof payload.sp === "object" ? payload.sp : {};

  initAbilityStateDefaults();
  if (payload.a && typeof payload.a === "object") {
    for (const [k, v] of Object.entries(payload.a)) {
      if (Object.prototype.hasOwnProperty.call(state.abilities, k) && ["locked", "awakened", "unlocked"].includes(v)) {
        state.abilities[k] = v;
      }
    }
  }

  // If a clan is selected but no state was persisted for its baseline, keep the UX baseline intact.
  if (state.selectedClan && state.abilities[`${state.selectedClan}:passive`] === "locked") {
    state.abilities[`${state.selectedClan}:passive`] = "unlocked";
  }

  if (typeof bennyState !== "undefined") {
    bennyState.looseCannon = !!payload.lc;
  }
}

function loadPersistedState() {
  const url = new URL(window.location.href);
  const fromUrl = url.searchParams.get(STATE_PARAM);
  if (fromUrl) {
    const payload = decodeStatePayload(fromUrl);
    if (payload) {
      applyPersistedState(payload);
      // Sync cookie to latest URL payload.
      setCookie(STATE_COOKIE, fromUrl, 60 * 60 * 24 * 365);
      return;
    }
  }

  const fromCookie = getCookie(STATE_COOKIE);
  if (fromCookie) {
    const payload = decodeStatePayload(fromCookie);
    if (payload) {
      applyPersistedState(payload);
    }
  }
}

// ── Init ─────────────────────────────────────────────────────
function init() {
  initAbilityStateDefaults();
  loadPersistedState();

  renderClanSelector();
  renderGrid();
  updateCosts();
  renderDetailPanel();
  updateClanPattern();
  applyClanSelectorCollapsed();
  bindToggles();
  bindTabs();
  bindClanSelectorToggle();

  // Ensure URL/cookie reflect normalized runtime state after initial load.
  persistState();
}

function setActivePickupsSubtab(tabId) {
  const tabs = document.querySelectorAll(".tab-bar--pickups .tab-bar__tab");
  const targetTab = document.querySelector(`.tab-bar--pickups .tab-bar__tab[data-pickuptab="${tabId}"]`);
  const targetSubpage = document.getElementById(`pickups-subpage-${tabId}`);
  if (!targetTab || !targetSubpage) return false;

  tabs.forEach(t => t.classList.remove("active"));
  targetTab.classList.add("active");
  document.querySelectorAll(".pickups-subpage").forEach(p => p.classList.add("hidden"));
  targetSubpage.classList.remove("hidden");
  return true;
}

// ── Tab Navigation ───────────────────────────────────────────
function bindTabs() {
  // Primary tabs (Phyre, Fabien, Benny, Ysabelle)
  const primaryTabs = document.querySelectorAll(".tab-bar--primary .tab-bar__tab");
  primaryTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      primaryTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll("#app > .page").forEach(p => p.classList.add("hidden"));
      document.getElementById(`page-${tab.dataset.tab}`).classList.remove("hidden");
      if (tab.dataset.tab === "phyre") {
        // Restore the active secondary tab (whichever was last active)
        const activeSecondary = document.querySelector(".tab-bar--secondary:not(.tab-bar--fabien) .tab-bar__tab.active");
        if (activeSecondary) {
          document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
          const subpage = document.getElementById(`subpage-${activeSecondary.dataset.subtab}`);
          if (subpage) subpage.classList.remove("hidden");
          if (activeSecondary.dataset.subtab === "outfits" && typeof refreshOutfitsPage === "function") refreshOutfitsPage();
          if (activeSecondary.dataset.subtab === "combos" && typeof renderCombosPage === "function") renderCombosPage();
          if (activeSecondary.dataset.subtab === "pickups" && typeof renderPickupsPage === "function") renderPickupsPage();
        }
      }
      if (tab.dataset.tab === "benny" && typeof refreshBennyPage === "function") {
        refreshBennyPage();
      }
    });
  });

  // Secondary tabs within Phyre (Skill Tree, Outfits)
  const secondaryTabs = document.querySelectorAll(".tab-bar--secondary:not(.tab-bar--fabien) .tab-bar__tab");
  secondaryTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      secondaryTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
      document.getElementById(`subpage-${tab.dataset.subtab}`).classList.remove("hidden");
      if (tab.dataset.subtab === "outfits" && typeof refreshOutfitsPage === "function") {
        refreshOutfitsPage();
      }
      if (tab.dataset.subtab === "combos" && typeof renderCombosPage === "function") {
        renderCombosPage();
      }
      if (tab.dataset.subtab === "pickups" && typeof renderPickupsPage === "function") {
        renderPickupsPage();
        if (state.modHaven) {
          setActivePickupsSubtab("maha");
        }
      }
    });
  });

  // Fabien sub-tabs
  const fabienTabs = document.querySelectorAll(".tab-bar--fabien .tab-bar__tab");
  fabienTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      fabienTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll(".fabien-subpage").forEach(p => p.classList.add("hidden"));
      document.getElementById(`fabien-subpage-${tab.dataset.fabtab}`).classList.remove("hidden");
    });
  });

  // Pickups sub-tabs
  const pickupsTabs = document.querySelectorAll(".tab-bar--pickups .tab-bar__tab");
  pickupsTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      setActivePickupsSubtab(tab.dataset.pickuptab);
    });
  });
}

// ── Clan Selector ────────────────────────────────────────────
function renderClanSelector() {
  const container = document.getElementById("clan-selector");
  container.innerHTML = "";

  for (const clanId of CLAN_ORDER) {
    const clan = CLANS[clanId];
    const card = document.createElement("div");
    const isCompleted = state.completedClans.has(clanId);
    card.className = "clan-card" +
      (state.selectedClan === clanId ? " selected" : "") +
      (isCompleted ? " completed" : "");
    card.dataset.clan = clanId;

    const logoSrc = isCompleted ? clan.logoCompleted : clan.logo;

    card.innerHTML = `
      <img class="clan-card__logo" src="${logoSrc}" alt="${clan.name}">
      <div class="clan-card__name">${clan.name}</div>
      <button class="clan-card__complete-btn${isCompleted ? ' active' : ''}" title="Toggle completed">✦</button>
    `;

    card.querySelector(".clan-card__complete-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      // Ensure a clan is selected so the grid initialises
      if (!state.selectedClan) selectClan(clanId);
      if (e.shiftKey) {
        // Shift+click: toggle ALL clans completed at once
        const allCompleted = CLAN_ORDER.every(id => state.completedClans.has(id));
        if (allCompleted) {
          state.completedClans.clear();
        } else {
          CLAN_ORDER.forEach(id => state.completedClans.add(id));
        }
      } else {
        if (state.completedClans.has(clanId)) {
          state.completedClans.delete(clanId);
        } else {
          state.completedClans.add(clanId);
        }
      }
      renderClanSelector();
      renderGrid();
      if (typeof renderFabienTree === "function") renderFabienTree();
      if (typeof renderPickupsPage === "function") renderPickupsPage();
    });

    card.addEventListener("click", () => selectClan(clanId));

    // Clan description tooltip
    card.addEventListener('mouseenter', (e) => {
      sharedTooltip.innerHTML =
        `<div class="tooltip__name">${clan.name}</div>` +
        `<div class="tooltip__clan-descr">${clan.descr}</div>` +
        `<div class="tooltip__clan-mastery">COMBAT MASTERY RATING: ${clan.mastery}</div>`;
      sharedTooltip.classList.add('tooltip--visible');
      positionTooltip(e);
    });
    card.addEventListener('mousemove', positionTooltip);
    card.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));

    container.appendChild(card);
  }
}

function selectClan(clanId) {
  if (state.selectedClan === clanId) return;

  const oldClan = state.selectedClan;
  state.selectedClan = clanId;

  // Sync to outfits page
  if (typeof outfitState !== 'undefined') {
    outfitState.selectedClan = clanId;
  }

  // If first clan selection, unlock own passive and auto-awaken strike
  if (!oldClan) {
    state.abilities[`${clanId}:passive`] = "unlocked";
    state.abilities[`${clanId}:strike`] = "awakened";
  } else {
    // Transfer old own-clan passive → locked, old strike → locked if still awakened
    state.abilities[`${oldClan}:passive`] = "locked";
    if (state.abilities[`${oldClan}:strike`] === "awakened") {
      state.abilities[`${oldClan}:strike`] = "locked";
    }
    state.abilities[`${clanId}:passive`] = "unlocked";
    state.abilities[`${clanId}:strike`] = state.abilities[`${clanId}:strike`] === "locked" ? "awakened" : state.abilities[`${clanId}:strike`];
  }

  state.focusedAbility = null;

  renderClanSelector();
  renderGrid();
  updateCosts();
  renderDetailPanel();
  updateClanPattern();

  // Also refresh outfits page if it's currently visible
  if (typeof refreshOutfitsPage === "function" && !document.getElementById("subpage-outfits").classList.contains("hidden")) {
    refreshOutfitsPage();
  }

  // Auto-collapse clan selector on selection
  if (!state.clanSelectorCollapsed) {
    state.clanSelectorCollapsed = true;
    applyClanSelectorCollapsed();
  }
}

// ── Clan Selector Toggle ─────────────────────────────────────
function bindClanSelectorToggle() {
  const toggle = document.getElementById("clan-selector-toggle");
  if (toggle) {
    toggle.addEventListener("click", () => {
      state.clanSelectorCollapsed = !state.clanSelectorCollapsed;
      applyClanSelectorCollapsed();
    });
  }
}

function applyClanSelectorCollapsed() {
  const sel = document.getElementById("clan-selector");
  if (sel) sel.classList.toggle("collapsed", state.clanSelectorCollapsed);
  const btn = document.getElementById("clan-selector-toggle");
  if (btn) btn.textContent = state.clanSelectorCollapsed ? "\u25bc Select Clan" : "\u25b2 Hide Clan";
  persistState();
}

// ── Clan Pattern Background ─────────────────────────────────
function updateClanPattern() {
  const el = document.getElementById("clan-pattern-bg");
  if (!el) return;
  if (state.selectedClan) {
    el.style.backgroundImage = `url('${CLANS[state.selectedClan].pattern}')`;
  } else {
    el.style.backgroundImage = "none";
  }
}

// ── Toggles ──────────────────────────────────────────────────
function bindToggles() {
  const completionToggle = document.getElementById("toggle-completion-talents");
  if (completionToggle) completionToggle.checked = state.completionTalents;
  completionToggle.addEventListener("change", (e) => {
    state.completionTalents = e.target.checked;
    renderGrid();
    if (typeof renderPickupsPage === "function") renderPickupsPage();
  });
  // Shift+Click on label to force-enable disabled toggle
  const completionLabel = completionToggle && completionToggle.closest('label');
  if (completionLabel) {
    completionLabel.addEventListener("click", (e) => {
      if (e.shiftKey) {
        e.preventDefault();
        state.completionTalents = !state.completionTalents;
        completionToggle.checked = state.completionTalents;
        renderGrid();
        if (typeof renderPickupsPage === "function") renderPickupsPage();
      }
    });
  }

  const phlegmaticToggle = document.getElementById("toggle-fabien-phlegmatic");
  if (phlegmaticToggle) phlegmaticToggle.checked = state.modFabienPhlegmatic;
  document.getElementById("goto-fabien-phlegmatic").classList.toggle("hidden", !state.modFabienPhlegmatic);
  phlegmaticToggle.addEventListener("change", (e) => {
    state.modFabienPhlegmatic = e.target.checked;
    document.getElementById("goto-fabien-phlegmatic").classList.toggle("hidden", !e.target.checked);
    if (typeof renderFabienTree === "function") renderFabienTree();
    persistState();
  });

  const havenToggle = document.getElementById("toggle-haven");
  if (havenToggle) {
    havenToggle.checked = state.modHaven;
    document.getElementById("goto-haven-items").classList.toggle("hidden", !state.modHaven);
    havenToggle.addEventListener("change", (e) => {
      state.modHaven = e.target.checked;
      document.getElementById("goto-haven-items").classList.toggle("hidden", !e.target.checked);
      if (typeof renderPickupsPage === "function") renderPickupsPage();
      persistState();
    });
    // Shift+Click on label to force-enable disabled toggle
    const havenLabel = havenToggle.closest('label');
    if (havenLabel) {
      havenLabel.addEventListener("click", (e) => {
        if (e.shiftKey) {
          e.preventDefault();
          state.modHaven = !state.modHaven;
          havenToggle.checked = state.modHaven;
          document.getElementById("goto-haven-items").classList.toggle("hidden", !state.modHaven);
          if (typeof renderPickupsPage === "function") renderPickupsPage();
          persistState();
        }
      });
    }
  }

  document.getElementById("goto-fabien-phlegmatic").addEventListener("click", () => {
    // Close modal
    document.getElementById("mods-modal").classList.add("hidden");
    // Switch to Fabien tab
    document.querySelectorAll(".tab-bar__tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
    const fabienTab = document.querySelector('.tab-bar__tab[data-tab="fabien"]');
    if (fabienTab) fabienTab.classList.add("active");
    document.getElementById("page-fabien").classList.remove("hidden");
    // Focus the passive ability (Fast Forward) — last in array = index 4
    if (typeof fabienState !== "undefined" && typeof renderFabienDetail === "function") {
      const passiveIndex = FABIEN_ABILITIES.findIndex(a => a.tier === "passive");
      fabienState.focusedIndex = passiveIndex;
      renderFabienTree();
    }
  });

  document.getElementById("goto-haven-items").addEventListener("click", () => {
    // Close modal
    document.getElementById("mods-modal").classList.add("hidden");

    // Primary: Phyre
    document.querySelectorAll(".tab-bar--primary .tab-bar__tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll("#app > .page").forEach(p => p.classList.add("hidden"));
    const phyreTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="phyre"]');
    if (phyreTab) phyreTab.classList.add("active");
    document.getElementById("page-phyre").classList.remove("hidden");

    // Secondary: Pickups
    document.querySelectorAll(".tab-bar--secondary:not(.tab-bar--fabien) .tab-bar__tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
    const pickupsSecondaryTab = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien) .tab-bar__tab[data-subtab="pickups"]');
    if (pickupsSecondaryTab) pickupsSecondaryTab.classList.add("active");
    document.getElementById("subpage-pickups").classList.remove("hidden");

    if (typeof renderPickupsPage === "function") renderPickupsPage();

    const targetTab = state.modHaven ? "maha" : "items";
    if (!setActivePickupsSubtab(targetTab)) {
      setActivePickupsSubtab("items");
    }
  });

  document.getElementById("reset-all").addEventListener("click", resetAll);

  // Controls-legend sharedTooltip
  document.querySelectorAll('.controls-legend__row').forEach(row => {
    row.addEventListener('mouseenter', (e) => {
      sharedTooltip.innerHTML = `<div class="tooltip__name">${row.title}</div>`;
      sharedTooltip.classList.add('tooltip--visible');
      positionTooltip(e);
    });
    row.addEventListener('mousemove', positionTooltip);
    row.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));
  });
}

function resetAll() {
  for (const key of Object.keys(state.abilities)) {
    state.abilities[key] = "locked";
  }
  state.selectedPerTier = {};
  state.focusedAbility = null;
  state.completedClans.clear();

  if (state.selectedClan) {
    state.abilities[`${state.selectedClan}:passive`] = "unlocked";
    state.abilities[`${state.selectedClan}:strike`] = "awakened";
  }

  renderClanSelector();
  renderGrid();
  updateCosts();
  renderDetailPanel();
  updateClanPattern();
}

function purchaseClanAbilities(clanId) {
  if (!state.selectedClan) return;
  const isOwnClan = clanId === state.selectedClan;
  const tiers = ["strike", "relocate", "affect", "mastery"];

  for (const t of tiers) {
    if (isOwnClan) {
      state.abilities[`${clanId}:${t}`] = "unlocked";
    } else {
      if (state.abilities[`${clanId}:${t}`] === "locked") {
        state.abilities[`${clanId}:${t}`] = "awakened";
      }
      if (state.abilities[`${state.selectedClan}:${t}`] === "unlocked") {
        state.abilities[`${clanId}:${t}`] = "unlocked";
      }
    }
  }
  autoAwakenPerks();
  renderGrid();
  updateCosts();
}

function resetClanAbilities(clanId) {
  if (!state.selectedClan) return;
  const isOwnClan = clanId === state.selectedClan;
  const tiers = ["strike", "relocate", "affect", "mastery"];

  for (const t of [...tiers, "perk"]) {
    state.abilities[`${clanId}:${t}`] = "locked";
  }
  if (isOwnClan) {
    state.abilities[`${clanId}:strike`] = "awakened";
  }
  deawakenInvalidPerks();
  renderGrid();
  updateCosts();
}

function unlockClanAbilities(clanId) {
  if (!state.selectedClan) selectClan(clanId);
  const tiers = ["passive", "strike", "relocate", "affect", "mastery", "perk"];
  for (const id of CLAN_ORDER) {
    tiers.forEach(t => { state.abilities[`${id}:${t}`] = "unlocked"; });
  }
  renderClanSelector();
  renderGrid();
  updateCosts();
}

// ── Affinity Bar ─────────────────────────────────────────────
function renderAffinityBar() {
  const bar = document.getElementById("affinity-bar");
  bar.innerHTML = "";
  if (!state.selectedClan) return;

  const clan = CLANS[state.selectedClan];
  for (const a of clan.affinities) {
    const badge = createEl("div", "affinity-badge is-affinity");
    badge.dataset.discipline = a;
    badge.innerHTML = `<img class="affinity-badge__icon" src="${DISCIPLINES[a].icon}" alt="${DISCIPLINES[a].name}"><span>${DISCIPLINES[a].name}</span>`;
    bar.appendChild(badge);
  }
}

// ── Grid Rendering ───────────────────────────────────────────
function renderGrid() {
  const grid = document.getElementById("skill-grid");
  grid.innerHTML = "";

  // Render affinity bar
  renderAffinityBar();

  // Completion talent rows (mod: Clan Completion Talents)
  if (state.completionTalents) {
    renderCompletionTalentRows(grid);
  }

  // Column headers row
  grid.appendChild(createEl("div", "")); // empty corner
  for (const clanId of CLAN_ORDER) {
    const clan = CLANS[clanId];
    const header = createEl("div", "clan-col-header");
    const logoSrc = state.completedClans.has(clanId) ? clan.logoCompleted : clan.logo;
    header.innerHTML = `
      <img class="clan-col-header__logo" src="${logoSrc}" alt="${clan.name}">
      <div class="clan-col-header__name">${clan.name}</div>
    `;
    header.style.cursor = "pointer";
    header.addEventListener("click", (e) => {
      if (e.shiftKey) {
        unlockClanAbilities(clanId);
      } else {
        purchaseClanAbilities(clanId);
      }
    });
    header.addEventListener("contextmenu", (e) => { e.preventDefault(); resetClanAbilities(clanId); });

    // Rich sharedTooltip on the logo showing controls legend
    const logoImg = header.querySelector('.clan-col-header__logo');
    const LMB = 'assets/Keyboard/T_UI_Keyboard_Mouse_Left_Click.png';
    const RMB = 'assets/Keyboard/T_UI_Keyboard_Mouse_Right_Click.png';
    const SHF = 'assets/Keyboard/T_UI_Keyboard_Shift_Left.png';
    const headerTooltip =
      `<div class="tooltip__controls-row"><img src="${LMB}" alt="LMB"> Purchase all</div>` +
      `<div class="tooltip__controls-row"><img src="${SHF}" alt="Shift"> + <img src="${LMB}" alt="LMB"> Unlock all</div>` +
      `<div class="tooltip__controls-row"><img src="${RMB}" alt="RMB"> Reset clan</div>` +
      `<div class="tooltip__clan-hint"><em>to change clan, use the "Select Clan" divider above</em></div>`;
    const headerFullTooltip =
      `<div class="tooltip__name">${clan.name}</div>` +
      `<div class="tooltip__clan-descr">${clan.descr}</div>` +
      `<div class="tooltip__clan-mastery">COMBAT MASTERY RATING: ${clan.mastery}</div>` +
      `<div class="tooltip__clan-hint"><em>to change clan, use the "Select Clan" divider above</em></div>`;
    header.addEventListener('mouseenter', (e) => {
      sharedTooltip.innerHTML = headerTooltip;
      sharedTooltip.classList.add('tooltip--visible');
      positionTooltip(e);
    });
    header.addEventListener('mousemove', positionTooltip);
    header.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));
    grid.appendChild(header);
  }

  // Ability rows
  for (const tier of TIER_ORDER) {
    // Row label
    const label = createEl("div", "tier-label");
    label.textContent = TIERS[tier].label;
    grid.appendChild(label);

    // Cells per clan
    for (const clanId of CLAN_ORDER) {
      const cell = createAbilityCell(clanId, tier);
      grid.appendChild(cell);
    }
  }

  persistState();
}

function createAbilityCell(clanId, tier) {
  const ability = ABILITIES[clanId][tier];
  const clan = CLANS[clanId];
  const key = `${clanId}:${tier}`;
  const abilityState = state.abilities[key];
  const isOwnClan = clanId === state.selectedClan;
  const isPerk = tier === "perk";
  const isPassive = tier === "passive";

  const cell = createEl("div", "ability-cell");
  cell.classList.add(abilityState);
  cell.dataset.clan = clanId;
  cell.dataset.tier = tier;
  cell.dataset.key = key;

  if (isPerk) cell.classList.add("perk-cell");
  if (!isOwnClan) cell.classList.add("cross-clan");
  if (abilityState === "awakened" && !isOwnClan && !canUnlock(clanId, tier)) {
    cell.classList.add("blocked");
  }

  // Affinity glow on cell background
  if (isPerk && isOwnClan) {
    cell.classList.add("is-own-affinity");
  } else if (state.selectedClan && ability.discipline && !isPassive && CLANS[state.selectedClan].affinities.includes(ability.discipline)) {
    if (isOwnClan) {
      cell.classList.add("is-own-affinity");
    } else {
      cell.classList.add("is-affinity");
      cell.dataset.discipline = ability.discipline;
    }
  }

  // Mark invalid if prerequisites not met for current clan choice
  if (abilityState !== "locked" && !isPassive) {
    if (!isPrereqMet(clanId, tier)) {
      cell.classList.add("invalid");
    }
  }

  // Passive for other clan: show just the faded column icon, no diamond
  if (isPassive && !isOwnClan) {
    cell.classList.add("passive-other");
    cell.innerHTML = `
      <img class="ability-cell__passive-column" src="${clan.column}" alt="${clan.name}">
    `;
    cell.addEventListener("click", () => {
      toggleFocusedAbility(clanId, tier);
    });
    if (state.focusedAbility && state.focusedAbility.clanId === clanId && state.focusedAbility.tier === tier) {
      cell.classList.add("selected-ability");
    }
    return cell;
  }

  // Determine button background
  const btnBgSrc = getButtonBg(tier, abilityState, isPerk);

  // Determine icon
  let iconSrc;
  if (isPerk) {
    iconSrc = clan.logo; // Perks use clan logo
  } else if (isPassive && !isOwnClan) {
    iconSrc = clan.column; // Unselected passives show faded clan column icon
  } else {
    iconSrc = ability.icon;
  }

  // Build cell HTML
  let html = `<div class="ability-cell__btn">`;
  html += `<img class="ability-cell__btn-bg" src="${btnBgSrc}" alt="">`;

  if (abilityState === "locked" && !isOwnClan && !isPassive) {
    // Unawakened: show Phyre mark, hide icon
    html += `<img class="ability-cell__phyre" src="${UI.phyreMark}" alt="Locked">`;
    html += `<img class="ability-cell__icon" src="${iconSrc}" alt="${ability.name}">`;
  } else if (abilityState === "awakened" && !canUnlock(clanId, tier)) {
    // Awakened but can't purchase yet: show padlock instead of icon
    html += `<img class="ability-cell__phyre" src="assets/N_Textures/General/T_UI_Icon_Lock.png" alt="Cannot unlock">`;
    html += `<img class="ability-cell__icon" src="${iconSrc}" alt="${ability.name}">`;
  } else {
    html += `<img class="ability-cell__icon" src="${iconSrc}" alt="${ability.name}">`;
  }

  if (abilityState === "awakened") {
    const unlockable = canUnlock(clanId, tier);
    if (unlockable) {
      const apCost = getAPCost(clanId, tier);
      html += `<span class="ability-cell__ap-cost">${apCost}</span>`;
    }
  }

  html += `</div>`;

  // Discipline badge removed — affinity shown via cell background glow

  // Blood pips
  if (ability.bloodPips > 0) {
    const filled = abilityState === "unlocked";
    html += `<div class="ability-cell__pips">`;
    for (let i = 0; i < ability.bloodPips; i++) {
      let cls = "blood-pip";
      if (ability.channeled) cls += " channeled";
      if (filled) cls += " filled";
      html += `<div class="${cls}"></div>`;
    }
    html += `</div>`;
  }

  // Affinity marker removed — affinity shown via cell background glow

  cell.innerHTML = html;

  // Click handler
  cell.addEventListener("click", () => {
    // Set focus state BEFORE handleAbilityClick so renderGrid restores the class
    state.focusedAbility = { type: 'ability', clanId, tier };
    handleAbilityClick(clanId, tier);
    applyFocusedSelection();
    renderDetailPanel();
  });

  // Tooltip
  const tooltipContent = buildTooltipContent(clanId, tier, ability, abilityState);
  cell.addEventListener('mouseenter', (e) => {
    sharedTooltip.innerHTML = tooltipContent;
    sharedTooltip.classList.add('tooltip--visible');
    positionTooltip(e);
  });
  cell.addEventListener('mousemove', positionTooltip);
  cell.addEventListener('mouseleave', () => {
    sharedTooltip.classList.remove('tooltip--visible');
  });

  // Right-click to undo
  cell.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    handleAbilityUndo(clanId, tier);
  });

  // Apply selected-ability class if this is the focused ability
  if (state.focusedAbility && state.focusedAbility.clanId === clanId && state.focusedAbility.tier === tier) {
    cell.classList.add("selected-ability");
  }

  return cell;
}

function getButtonBg(tier, abilityState, isPerk) {
  const prefix = isPerk ? "perk" : "btn";
  switch (abilityState) {
    case "locked":   return UI[`${prefix}Locked`];
    case "awakened":  return UI[`${prefix}NotEquipped`];
    case "unlocked":  return UI[`${prefix}Equipped`];
    default:          return UI[`${prefix}Locked`];
  }
}

function positionTooltip(e) {
  const tip = sharedTooltip;
  const margin = 12;
  const tw = tip.offsetWidth;
  const th = tip.offsetHeight;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let x = e.clientX + margin;
  let y = e.clientY - th - margin;
  if (x + tw > vw - margin) x = e.clientX - tw - margin;
  if (y < margin) y = e.clientY + margin;
  tip.style.left = x + 'px';
  tip.style.top = y + 'px';
}

function buildTooltipContent(clanId, tier, ability, abilityState) {
  const isOwnClan = clanId === state.selectedClan;
  const isPassive = tier === "passive";

  let html = ``;
  html += `<div class="tooltip__name">${ability.name}</div>`;
  html += `<div class="tooltip__tier">${TIERS[tier].label}</div>`;

  // Discipline
  if (ability.discipline) {
    const disc = DISCIPLINES[ability.discipline];
    const isAffinityDisc = !isOwnClan && state.selectedClan && CLANS[state.selectedClan].affinities.includes(ability.discipline);
    const isOwnClanAffinity = isOwnClan && state.selectedClan && CLANS[state.selectedClan].affinities.includes(ability.discipline);
    html += `<div class="tooltip__discipline${isAffinityDisc ? ' is-affinity' : ''}${isOwnClanAffinity ? ' is-own-clan' : ''}" data-discipline="${ability.discipline}">
      <img src="${disc.icon}" alt="${disc.name}">
      <span>${disc.name}</span>
    </div>`;
  }

  html += `<div class="tooltip__costs">`;

  // AP + resonance on one row
  const apCost = getAPCost(clanId, tier);
  if (apCost !== null) {
    const isAffinity = !isOwnClan && isAffinityAbility(clanId, tier);
    let row = `<div class="tooltip__cost-row">`;
    row += `<svg class="tooltip__ap-icon" viewBox="0 0 16 16" width="12" height="12"><polygon points="8,1 15,8 8,15 1,8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
    row += `<span class="value${isAffinity ? ' affinity' : (!isOwnClan ? ' cross-clan' : '')}">${apCost}</span>`;
    // Inline resonance icons (no labels)
    if (!isOwnClan && !isPassive && tier !== "perk") {
      const res = ability.resonance;
      if (res.san > 0) row += `<img src="${UI.resSanguine}" alt="San"><span class="value res-san">${res.san}</span>`;
      if (res.mel > 0) row += `<img src="${UI.resMelancholic}" alt="Mel"><span class="value res-mel">${res.mel}</span>`;
      if (res.cho > 0) row += `<img src="${UI.resCholeric}" alt="Cho"><span class="value res-cho">${res.cho}</span>`;
    }
    row += `</div>`;
    html += row;
  }

  // Perk unlock condition
  if (tier === "perk" && !isOwnClan) {
    html += `<div class="tooltip__cost-row">
      <span class="label" style="font-size:10px;">Requires all abilities in this clan tree awakened</span>
    </div>`;
  }

  // Masquerade impact + resonance grant/cleanse — all on one row of small icons
  const resGrant = RESONANCE_GRANT[ability.name];
  const resCleanse = RESONANCE_CLEANSE.has(ability.name);
  const hasMasq = tier !== "passive" && MASQUERADE[clanId] && MASQUERADE[clanId][tier]?.length > 0;
  if (hasMasq || resGrant || resCleanse) {
    html += `<div class="tooltip__masq-row">`;
    if (hasMasq) {
      const masqEvents = MASQUERADE[clanId][tier];
      const isViolent = masqEvents.some(e => e.violent);
      const masqTierKey = getMasqBadgeTier(masqEvents);
      const masqData = MASQ_TIERS[masqTierKey];
      html += `<div class="tooltip__masq ${masqData.glow}">
        <img src="${masqData.icon}" alt="${masqData.label}" title="${masqData.label}">
      </div>`;
      if (isViolent) {
        html += `<div class="tooltip__masq tooltip__violent">
          <img src="${SKULL_ICON}" alt="Violent" title="Violent">
        </div>`;
      }
    }
    if (resGrant) {
      const resLabel = resGrant.charAt(0).toUpperCase() + resGrant.slice(1);
      html += `<div class="tooltip__masq tooltip__res-effect tooltip__res-${resGrant}">
        <img src="${RES_ICONS[resGrant]}" alt="Applies ${resLabel}" title="Applies ${resLabel}">
      </div>`;
    }
    if (resCleanse) {
      html += `<div class="tooltip__masq tooltip__res-effect tooltip__res-cleanse">
        <img src="${RES_CLEANSE_ICON}" alt="Cleanses Resonance" title="Cleanses Resonance">
      </div>`;
    }
    if (FEEDABLE.has(ability.name)) {
      html += `<div class="tooltip__masq tooltip__feedable">
        <img src="${FEED_ICON}" alt="Makes Feedable" title="Makes Feedable">
      </div>`;
    }
    if (CONVO_ABILITIES.has(ability.name)) {
      const resKey = RESONANCE_GRANT[ability.name];
      html += `<div class="tooltip__masq tooltip__convo tooltip__convo--${resKey}">
        <img src="${CONVO_ICON}" alt="Conversation Ability" title="Conversation Ability">
      </div>`;
    }
    if (CANCELLABLE.has(ability.name)) {
      html += `<div class="tooltip__masq tooltip__cancellable">
        <img src="${CANCEL_ICON}" alt="Can be cancelled" title="Can be cancelled early">
      </div>`;
    }
    html += `</div>`;
  }

  html += `</div>`;
  return html;
}

// ── AP Cost Calculation ──────────────────────────────────────
function getAPCost(clanId, tier) {
  const isOwnClan = clanId === state.selectedClan;
  const tierData = TIERS[tier];

  if (tier === "passive") {
    return isOwnClan ? tierData.ap[0] : null; // passives are in-clan only
  }

  if (isOwnClan) {
    return tierData.ap[0]; // in-clan
  }

  if (tier === "perk") {
    return tierData.ap[2]; // always 6 for cross-clan perks
  }

  // Cross-clan: check affinity
  if (isAffinityAbility(clanId, tier)) {
    return tierData.ap[1]; // affinity cost
  }

  return tierData.ap[2]; // out-of-clan
}

function isAffinityAbility(clanId, tier) {
  if (!state.selectedClan) return false;
  const ability = ABILITIES[clanId][tier];
  if (!ability.discipline) return false;
  const ownClan = CLANS[state.selectedClan];
  return ownClan.affinities.includes(ability.discipline);
}

// ── Click Handling ───────────────────────────────────────────
function handleAbilityClick(clanId, tier) {
  const key = `${clanId}:${tier}`;
  const currentState = state.abilities[key];
  const isOwnClan = clanId === state.selectedClan;
  const isPassive = tier === "passive";

  // Passive: own clan is auto-unlocked, other clans can't be touched
  if (isPassive) return;

  switch (currentState) {
    case "locked":
      if (canAwaken(clanId, tier)) {
        if (isOwnClan) {
          // In-clan: should already be awakened via auto-awaken, but handle edge case
          state.abilities[key] = "awakened";
        } else {
          // Cross-clan: awaken (spend resonance)
          state.abilities[key] = "awakened";
        }
        // Auto-awaken any perks whose prerequisites are now met
        autoAwakenPerks();
      }
      break;

    case "awakened":
      if (canUnlock(clanId, tier)) {
        state.abilities[key] = "unlocked";
        // Auto-awaken next own-clan tier
        if (isOwnClan) {
          const nextTier = getNextTier(tier);
          if (nextTier && state.abilities[`${clanId}:${nextTier}`] === "locked") {
            state.abilities[`${clanId}:${nextTier}`] = "awakened";
          }
        }
        // Auto-awaken any perks whose prerequisites are now met
        autoAwakenPerks();
      }
      break;

    case "unlocked":
      // Visual toggle: select/deselect as active ability for this tier
      const selKey = tier;
      if (state.selectedPerTier[selKey] === key) {
        delete state.selectedPerTier[selKey];
      } else {
        state.selectedPerTier[selKey] = key;
      }
      break;
  }

  renderGrid();
  updateCosts();
}

// ── Unlock Prerequisites ─────────────────────────────────────
function canAwaken(clanId, tier) {
  const isOwnClan = clanId === state.selectedClan;
  const tierIndex = TIER_ORDER.indexOf(tier);

  if (tier === "perk") {
    // Own clan abilities (strike-mastery) must all be unlocked
    for (const t of ["strike", "relocate", "affect", "mastery"]) {
      if (state.abilities[`${state.selectedClan}:${t}`] !== "unlocked") return false;
    }
    if (!isOwnClan) {
      // Cross-clan perk: target clan abilities (strike-mastery) must all be at least awakened
      for (const t of ["strike", "relocate", "affect", "mastery"]) {
        if (state.abilities[`${clanId}:${t}`] === "locked") return false;
      }
    }
    return true;
  }

  if (isOwnClan) {
    // Sequential: previous tier must be at least awakened
    const prevTier = getPreviousTier(tier);
    if (!prevTier) return true; // strike has no prereq beyond passive
    if (prevTier === "passive") return true; // passive is auto-unlocked
    return state.abilities[`${clanId}:${prevTier}`] !== "locked";
  } else {
    // Cross-clan: can always awaken (just costs resonance)
    return true;
  }
}

function canUnlock(clanId, tier) {
  const isOwnClan = clanId === state.selectedClan;
  if (isOwnClan) return true; // in-clan awakened can always unlock
  // Cross-clan: own clan same tier must be unlocked first
  const ownKey = `${state.selectedClan}:${tier}`;
  return state.abilities[ownKey] === "unlocked";
}

// Check if an ability's prerequisites are currently met (for validity highlighting)
function isPrereqMet(clanId, tier) {
  const isOwnClan = clanId === state.selectedClan;

  if (tier === "perk") {
    // Own clan abilities (strike-mastery) must all be unlocked
    for (const t of ["strike", "relocate", "affect", "mastery"]) {
      if (state.abilities[`${state.selectedClan}:${t}`] !== "unlocked") return false;
    }
    if (!isOwnClan) {
      // Cross-clan perk: target clan abilities (strike-mastery) must all be at least awakened
      for (const t of ["strike", "relocate", "affect", "mastery"]) {
        if (state.abilities[`${clanId}:${t}`] === "locked") return false;
      }
    }
    return true;
  }

  if (isOwnClan) {
    const prevTier = getPreviousTier(tier);
    if (!prevTier || prevTier === "passive") return true;
    return state.abilities[`${clanId}:${prevTier}`] !== "locked";
  } else {
    // Cross-clan awakened: always valid (no prereq to awaken)
    // Cross-clan unlocked: own-clan same tier must still be unlocked
    if (state.abilities[`${clanId}:${tier}`] === "unlocked") {
      return canUnlock(clanId, tier);
    }
    return true;
  }
}

function handleAbilityUndo(clanId, tier) {
  const key = `${clanId}:${tier}`;
  const currentState = state.abilities[key];
  const isPassive = tier === "passive";
  const isOwnClan = clanId === state.selectedClan;

  // Can't undo own passive
  if (isPassive && isOwnClan) return;
  if (isPassive) return;

  switch (currentState) {
    case "unlocked":
      state.abilities[key] = "awakened";
      // Remove from selected if it was
      if (state.selectedPerTier[tier] === key) {
        delete state.selectedPerTier[tier];
      }
      break;
    case "awakened":
      state.abilities[key] = "locked";
      break;
    case "locked":
      // Already locked, nothing to undo
      return;
  }

  // Re-validate perks: revert any auto-awakened perks whose prereqs are no longer met
  deawakenInvalidPerks();

  renderGrid();
  updateCosts();
}

function getPreviousTier(tier) {
  // Order: passive → strike → relocate → affect → mastery → perk
  const sequence = ["passive", "strike", "relocate", "affect", "mastery", "perk"];
  const idx = sequence.indexOf(tier);
  return idx > 0 ? sequence[idx - 1] : null;
}

function getNextTier(tier) {
  const sequence = ["passive", "strike", "relocate", "affect", "mastery", "perk"];
  const idx = sequence.indexOf(tier);
  return idx < sequence.length - 1 ? sequence[idx + 1] : null;
}

function autoAwakenPerks() {
  for (const clanId of CLAN_ORDER) {
    const perkKey = `${clanId}:perk`;
    if (state.abilities[perkKey] !== "locked") continue;
    if (canAwaken(clanId, "perk")) {
      state.abilities[perkKey] = "awakened";
    }
  }
}

function deawakenInvalidPerks() {
  for (const clanId of CLAN_ORDER) {
    const perkKey = `${clanId}:perk`;
    if (state.abilities[perkKey] === "awakened" && !canAwaken(clanId, "perk")) {
      state.abilities[perkKey] = "locked";
    }
  }
}

// ── Cost Tracking ────────────────────────────────────────────
function updateCosts() {
  let totalAP = 0;
  let totalSan = 0;
  let totalMel = 0;
  let totalCho = 0;

  for (const clanId of CLAN_ORDER) {
    for (const tier of TIER_ORDER) {
      const key = `${clanId}:${tier}`;
      const abilityState = state.abilities[key];
      const isOwnClan = clanId === state.selectedClan;
      const ability = ABILITIES[clanId][tier];
      const isPassive = tier === "passive";

      // AP: spent when unlocked (or awakened for in-clan since they skip awakening)
      if (abilityState === "unlocked") {
        const ap = getAPCost(clanId, tier);
        if (ap !== null) totalAP += ap;
      } else if (abilityState === "awakened" && isOwnClan) {
        // In-clan awakened counts as AP pending but not yet spent
        // Actually don't count until unlocked
      }

      // Resonance: spent when awakened (cross-clan only)
      if ((abilityState === "awakened" || abilityState === "unlocked") && !isOwnClan && !isPassive && tier !== "perk") {
        totalSan += ability.resonance.san;
        totalMel += ability.resonance.mel;
        totalCho += ability.resonance.cho;
      }
    }
  }

  // Passive is auto-unlocked and free, don't count it

  document.getElementById("ap-total").textContent = totalAP;
  document.getElementById("res-san").textContent = totalSan.toLocaleString();
  document.getElementById("res-mel").textContent = totalMel.toLocaleString();
  document.getElementById("res-cho").textContent = totalCho.toLocaleString();

  if (typeof refreshCombosIfVisible === "function") refreshCombosIfVisible();
}

// ── Detail Panel ─────────────────────────────────────────────
function toggleFocusedAbility(clanId, tier) {
  if (state.focusedAbility && state.focusedAbility.clanId === clanId && state.focusedAbility.tier === tier) {
    state.focusedAbility = null;
  } else {
    state.focusedAbility = { type: "ability", clanId, tier };
  }
  applyFocusedSelection();
  renderDetailPanel();
}

function toggleFocusedCCT(cctKey) {
  if (state.focusedAbility && state.focusedAbility.type === 'cct' && state.focusedAbility.cctKey === cctKey) {
    state.focusedAbility = null;
  } else {
    state.focusedAbility = { type: 'cct', cctKey };
  }
  applyFocusedSelection();
  renderDetailPanel();
}

function applyFocusedSelection() {
  document.querySelectorAll('.ability-cell, .comp-talent').forEach(cell => {
    cell.classList.remove('selected-ability');
  });

  if (!state.focusedAbility) return;

  if (state.focusedAbility.type === 'cct') {
    const cctEl = document.querySelector(`.comp-talent[data-cct-key="${state.focusedAbility.cctKey}"]`);
    if (cctEl) cctEl.classList.add('selected-ability');
    return;
  }

  const key = `${state.focusedAbility.clanId}:${state.focusedAbility.tier}`;
  const el = document.querySelector(`.ability-cell[data-key="${key}"]`);
  if (el) el.classList.add('selected-ability');
}

const CCT_INLINE_KEY_ICONS = {
  shift: 'assets/Keyboard/T_UI_Keyboard_Shift_Left.png',
  f: 'assets/Keyboard/T_UI_Keyboard_F.png',
  m1: 'assets/Keyboard/T_UI_Keyboard_Mouse_Left_Click.png',
  lmb: 'assets/Keyboard/T_UI_Keyboard_Mouse_Left_Click.png',
  rightclick: 'assets/Keyboard/T_UI_Keyboard_Mouse_Right_Click.png',
  e: 'assets/Keyboard/T_UI_Keyboard_E.png',
  i: 'assets/Keyboard/T_UI_Keyboard_I.png',
};

const CCT_SHIFT_LMB_ICONS = `<img class="cct-inline-key" src="assets/Keyboard/T_UI_Keyboard_Shift_Left.png" alt="Shift"> + <img class="cct-inline-key" src="assets/Keyboard/T_UI_Keyboard_Mouse_Left_Click.png" alt="LMB">`;

function formatCCTInlineText(text) {
  if (!text) return '';
  return String(text).replace(/\[([^\]]+)\]/g, (full, tokenRaw) => {
    const token = String(tokenRaw || '').trim();
    const key = token.toLowerCase();
    const src = CCT_INLINE_KEY_ICONS[key];
    if (!src) return full;
    return `<img class="cct-inline-key" src="${src}" alt="${token}" title="${token}">`;
  });
}

function renderCCTDetailPanel(panel) {
  const allCompleted = CLAN_ORDER.every(id => state.completedClans.has(id));
  const { cctKey } = state.focusedAbility || {};
  if (!cctKey) {
    panel.innerHTML = '<div class="empty-state">Select an ability to view details</div>';
    return;
  }

  let name = '';
  let icon = '';
  let inputText = '';
  let detailLines = [];
  let bloodPips = 0;
  let isUnlocked = false;
  let statusText = '';
  let cctClanId = null;

  if (cctKey === 'bloodHeal') {
    name = allCompleted ? BLOOD_HEAL_TALENT.nameCompleted : BLOOD_HEAL_TALENT.name;
    icon = BLOOD_HEAL_TALENT.icon;
    inputText = BLOOD_HEAL_TALENT.input || '';
    detailLines = allCompleted ? (BLOOD_HEAL_TALENT.linesCompleted || []) : (BLOOD_HEAL_TALENT.lines || []);
    bloodPips = BLOOD_HEAL_TALENT.bloodPips || 0;
    isUnlocked = true;
    statusText = allCompleted ? 'Enhanced (all clans complete)' : 'Unlocked by default';
  } else {
    const talent = COMPLETION_TALENTS[cctKey];
    if (!talent) {
      panel.innerHTML = '<div class="empty-state">Select an ability to view details</div>';
      return;
    }
    name = talent.name;
    icon = talent.icon;
    inputText = talent.input || '';
    detailLines = Array.isArray(talent.lines) ? talent.lines : [];
    bloodPips = talent.bloodPips || 0;
    isUnlocked = state.completedClans.has(cctKey);
    statusText = isUnlocked ? 'Unlocked' : `Locked (complete ${CLANS[cctKey].name})`;
    cctClanId = cctKey;
  }

  const fallbackClanId = state.selectedClan || CLAN_ORDER.find(id => state.completedClans.has(id)) || CLAN_ORDER[0];
  const videoClanId = cctKey === 'bloodHeal' ? fallbackClanId : cctKey;
  const cctVideo = ABILITIES[videoClanId] && ABILITIES[videoClanId].passive
    ? ABILITIES[videoClanId].passive.video
    : null;

  let html = '';
  html += `<div class="detail-panel__video">`;
  if (cctVideo) {
    html += `<video src="${cctVideo}" autoplay loop muted data-video-src="${cctVideo}"></video>`;
    html += `<div class="detail-panel__video-expand" title="Click to enlarge">&#x26F6;</div>`;
  } else {
    html += `<span class="detail-panel__video-placeholder">Video preview</span>`;
  }
  html += `</div>`;

  html += `<div class="detail-panel__tier">Clan Completion Talent</div>`;
  html += `<div class="detail-panel__name-row">`;
  html += `<img class="detail-panel__ability-icon" src="${icon}" alt="${name}">`;
  html += `<div class="detail-panel__name">${name}</div>`;
  html += `</div>`;

  if (inputText) {
    html += `<div class="detail-panel__cct-input"><span class="detail-panel__cct-input-label">Input:</span> ${formatCCTInlineText(inputText)}</div>`;
  }

  if (detailLines.length > 0) {
    html += `<ul class="detail-panel__cct-lines">`;
    for (const line of detailLines) {
      html += `<li>${formatCCTInlineText(line)}</li>`;
    }
    html += `</ul>`;
  }

  if (cctClanId) {
    const cctClan = CLANS[cctClanId];
    const clanLogo = isUnlocked ? cctClan.logoCompleted : cctClan.logo;
    html += `<div class="detail-panel__discipline cct-clan-symbol ${isUnlocked ? 'cct-clan-symbol--unlocked' : 'cct-clan-symbol--locked'}">
      <img src="${clanLogo}" alt="${cctClan.name}">
      <span>${cctClan.name}</span>
      <span class="discipline-badge ${isUnlocked ? 'in-clan-badge' : 'cct-clan-symbol__badge--locked'}">${isUnlocked ? 'Completed' : 'Not Complete'}</span>
    </div>`;
  }

  if (bloodPips > 0) {
    html += `<div class="detail-panel__costs">`;
    html += `<div style="display:flex; gap:3px; margin-top:4px;">`;
    for (let i = 0; i < bloodPips; i++) {
      html += `<div class="blood-pip${isUnlocked ? ' filled' : ''}" style="width:14px; height:6px;"></div>`;
    }
    html += `</div>`;
    html += `</div>`;
  }

  html += `<div style="margin-top:12px; font-size:11px; color:var(--text-dim);">Status: ${statusText}</div>`;
  panel.innerHTML = html;

  const videoWrap = panel.querySelector('.detail-panel__video');
  const videoEl = videoWrap && videoWrap.querySelector('video');
  if (videoEl) {
    const openLightbox = () => openVideoLightbox(videoEl.dataset.videoSrc);
    videoEl.style.cursor = 'pointer';
    videoEl.addEventListener('click', openLightbox);
    const expandBtn = videoWrap.querySelector('.detail-panel__video-expand');
    if (expandBtn) expandBtn.addEventListener('click', openLightbox);
  }
}

function renderDetailPanel() {
  const panel = document.getElementById("detail-panel");

  if (!state.focusedAbility) {
    panel.innerHTML = '<div class="empty-state">Select an ability to view details</div>';
    return;
  }

  if (state.focusedAbility.type === 'cct') {
    renderCCTDetailPanel(panel);
    return;
  }

  const { clanId, tier } = state.focusedAbility;
  const ability = ABILITIES[clanId][tier];
  const clan = CLANS[clanId];
  const isOwnClan = clanId === state.selectedClan;
  const isPassive = tier === "passive";
  const isPerk = tier === "perk";
  const key = `${clanId}:${tier}`;
  const abilityState = state.abilities[key];

  let html = "";

  // Video placeholder (skip for perks)
  if (!isPerk) {
    html += `<div class="detail-panel__video">`;
    if (ability.video) {
      html += `<video src="${ability.video}" autoplay loop muted data-video-src="${ability.video}"></video>`;
      html += `<div class="detail-panel__video-expand" title="Click to enlarge">&#x26F6;</div>`;
    } else {
      html += `<span class="detail-panel__video-placeholder">Video preview</span>`;
    }
    html += `</div>`;
  }

  // Name & tier
  html += `<div class="detail-panel__tier">${TIERS[tier].label}</div>`;

  // Icon + Name row
  const iconSrc = isPerk ? clan.logo : ability.icon;
  html += `<div class="detail-panel__name-row">`;
  if (iconSrc) {
    html += `<img class="detail-panel__ability-icon" src="${iconSrc}" alt="${ability.name}">`;
  }
  html += `<div class="detail-panel__name">${ability.name}</div>`;
  html += `</div>`;

  // Description
  if (ability.description) {
    html += `<div class="detail-panel__desc">${ability.description}</div>`;
  }

  // Discipline — highlight if affinity match
  if (ability.discipline) {
    const disc = DISCIPLINES[ability.discipline];
    const isAffinityDisc = state.selectedClan && CLANS[state.selectedClan].affinities.includes(ability.discipline);
    const badge = isOwnClan
      ? '<span class="discipline-badge in-clan-badge">In Clan</span>'
      : isAffinityDisc ? '<span class="discipline-badge affinity-badge">Affinity</span>' : '';
    html += `<div class="detail-panel__discipline${isAffinityDisc ? ' is-affinity' : ''}${isOwnClan ? ' is-own-clan' : ''}" data-discipline="${ability.discipline}">
      <img src="${disc.icon}" alt="${disc.name}">
      <span>${disc.name}</span>
      ${badge}
    </div>`;
  }

  // Trainer badge (out-of-clan non-passive non-perk abilities)
  if (!isOwnClan && !isPassive && !isPerk) {
    html += `<div class="detail-panel__trainer" data-trainer-pos="${clan.trainerPos}">`;
    html += `<img class="detail-panel__trainer-logo" src="${clan.logo}" alt="${clan.name}">`;
    html += `<span class="detail-panel__trainer-name">Clan Contact: ${clan.trainerName}</span>`;
    html += `</div>`;
  }

  // Masquerade impact — expandable dropdown
  if (tier !== "passive" && MASQUERADE[clanId]) {
    const masqEvents = MASQUERADE[clanId][tier];
    if (masqEvents && masqEvents.length > 0) {
      const masqTierKey = getMasqBadgeTier(masqEvents);
      const masqData = MASQ_TIERS[masqTierKey];
      const violentEvents = masqEvents.filter(e => e.violent);
      const isViolent = violentEvents.length > 0;

      const eventsHtml = masqEvents.map(e => {
        const initClass = e.initial > 0 ? `masq-val-${getMasqTier(e.initial)}` : '';
        const perSecClass = e.perSec > 0 ? `masq-val-${getMasqTier(e.perSec)}` : '';
        const noteHtml = e.note ? ` <span class="masq-event__note" title="${e.note}">ⓘ</span>` : '';
        const noiseWarnClass = e.noiseWarn ? ' masq-val-noise-warn' : '';
        return `<div class="detail-panel__masq-event">
          <span class="masq-event__label">${e.label}${noteHtml}</span>
          <span class="masq-event__val ${initClass}">${e.initial || '—'}</span>
          <span class="masq-event__val ${perSecClass}">${e.perSec || '—'}</span>
          <span class="masq-event__val${noiseWarnClass}">${e.noise || '—'}</span>
          <span class="masq-event__val${noiseWarnClass}">${e.notice || '—'}</span>
        </div>`;
      }).join('');

      html += `<div class="detail-panel__masq-col">`;

      html += `<details class="detail-panel__masq-details ${masqData.glow}">
        <summary class="detail-panel__masq-summary">
          <span class="masq-summary__arrow">▶</span>
          <img src="${masqData.icon}" alt="${masqData.label}">
          <span>${masqData.label}</span>
        </summary>
        <div class="detail-panel__masq-events">
          <div class="detail-panel__masq-event-header">
            <span>Event</span><span title="Initial score">Init</span><span title="Score per second">/sec</span><span title="Noise radius">Noise</span><span title="Notice radius">Notice</span>
          </div>
          ${eventsHtml}
        </div>
      </details>`;

      if (isViolent) {
        const violentEventsHtml = violentEvents.map(e => {
          const noteHtml = e.note ? ` <span class="masq-event__note" title="${e.note}">ⓘ</span>` : '';
          return `<div class="detail-panel__violent-event">${e.label}${noteHtml}</div>`;
        }).join('');
        html += `<details class="detail-panel__violent-details">
          <summary class="detail-panel__violent-summary">
            <span class="masq-summary__arrow">▶</span>
            <img src="${SKULL_ICON}" alt="Violent">
            <span>Violent</span>
          </summary>
          <div class="detail-panel__violent-events">${violentEventsHtml}</div>
        </details>`;
      }

      html += `</div>`;
    }
  }

  // Resonance grant / cleanse
  const resGrant = RESONANCE_GRANT[ability.name];
  const resCleanse = RESONANCE_CLEANSE.has(ability.name);
  if (CONVO_ABILITIES.has(ability.name)) {
    const resKey = RESONANCE_GRANT[ability.name];
    html += `<div class="detail-panel__res-effect detail-panel__convo detail-panel__convo--${resKey}">
      <img src="${CONVO_ICON}" alt="Conversation Ability">
      <span>Conversation Ability</span>
    </div>`;
  }
  if (resGrant) {
    const resLabel = resGrant.charAt(0).toUpperCase() + resGrant.slice(1);
    html += `<div class="detail-panel__res-effect detail-panel__res-${resGrant}">
      <img src="${RES_ICONS[resGrant]}" alt="${resLabel}">
      <span>Applies <strong>${resLabel}</strong> resonance</span>
    </div>`;
  }
  if (resCleanse) {
    html += `<div class="detail-panel__res-effect detail-panel__res-cleanse">
      <img src="${RES_CLEANSE_ICON}" alt="Cleanses Resonance">
      <span>Cleanses resonance from target</span>
    </div>`;
  }
  if (FEEDABLE.has(ability.name)) {
    html += `<div class="detail-panel__res-effect detail-panel__feedable">
      <img src="${FEED_ICON}" alt="Makes Feedable">
      <span>Makes Feedable</span>
    </div>`;
  }
  if (CANCELLABLE.has(ability.name)) {
    const cancelNote = CANCEL_NOTES[ability.name];
    if (cancelNote) {
      html += `<details class="detail-panel__res-effect detail-panel__cancellable detail-panel__cancellable--dropdown">
        <summary>
          <img src="${CANCEL_ICON}" alt="Can be cancelled">
          <span>Can be cancelled early</span>
        </summary>
        <p class="detail-panel__cancel-note">${cancelNote}</p>
      </details>`;
    } else {
      html += `<div class="detail-panel__res-effect detail-panel__cancellable">
        <img src="${CANCEL_ICON}" alt="Can be cancelled">
        <span>Can be cancelled early</span>
      </div>`;
    }
  }

  // Costs
  html += `<div class="detail-panel__costs">`;

  const apCost = getAPCost(clanId, tier);
  if (apCost !== null) {
    const isAffinity = !isOwnClan && isAffinityAbility(clanId, tier);
    const apClass = !isOwnClan ? (isAffinity ? ' affinity' : ' cross-clan') : '';
    html += `<div class="detail-panel__cost-row">
      <svg class="detail-panel__ap-icon" viewBox="0 0 16 16" width="14" height="14"><polygon points="8,1 15,8 8,15 1,8" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>
      <span class="detail-panel__ap-value${apClass}">${apCost} AP</span>
      ${isAffinity ? '<span class="affinity-discount">Affinity 50%</span>' : ''}
    </div>`;
  }

  if (!isOwnClan && !isPassive && !isPerk) {
    const res = ability.resonance;
    if (res.san > 0) {
      html += `<div class="detail-panel__cost-row">
        <img src="${UI.resSanguineLg}" alt="">
        <span style="color:var(--res-sanguine)">${res.san} Sanguine</span>
      </div>`;
    }
    if (res.mel > 0) {
      html += `<div class="detail-panel__cost-row">
        <img src="${UI.resMelancholicLg}" alt="">
        <span style="color:var(--res-melancholic)">${res.mel} Melancholic</span>
      </div>`;
    }
    if (res.cho > 0) {
      html += `<div class="detail-panel__cost-row">
        <img src="${UI.resCholericLg}" alt="">
        <span style="color:var(--res-choleric)">${res.cho} Choleric</span>
      </div>`;
    }
  }

  html += `</div>`;

  // Blood pips
  if (ability.bloodPips > 0) {
    const filled = abilityState === "unlocked";
    html += `<div style="display:flex; gap:3px; margin-top:8px;">`;
    for (let i = 0; i < ability.bloodPips; i++) {
      html += `<div class="blood-pip${ability.channeled ? ' channeled' : ''}${filled ? ' filled' : ''}" style="width:14px; height:6px;"></div>`;
    }
    html += `</div>`;
  }

  // State info
  html += `<div style="margin-top:12px; font-size:11px; color:var(--text-dim);">
    Status: ${abilityState.charAt(0).toUpperCase() + abilityState.slice(1)}
  </div>`;

  // Outfit link (for tiers that have outfits: strike/relocate/affect/mastery)
  const outfitTiers = ["strike", "relocate", "affect", "mastery"];
  const outfitTierIdx = outfitTiers.indexOf(tier);
  if (outfitTierIdx !== -1 && typeof OUTFITS !== 'undefined' && OUTFITS[clanId]) {
    const outfit = OUTFITS[clanId][outfitTierIdx];
    const isUnlocked = isOutfitUnlocked(clanId, tier);
    html += `<div class="detail-panel__outfit-link">
      <span class="detail-panel__outfit-link-label">Outfit:</span>
      <button class="detail-panel__outfit-btn" data-clan="${clanId}" data-idx="${outfitTierIdx}">${isUnlocked ? '← ' : ''}${outfit.name}${!isUnlocked ? ' (locked)' : ''}</button>
    </div>`;
  }

  // Combos (below outfit)
  const comboIds = (typeof ABILITY_TO_COMBOS !== "undefined" && ABILITY_TO_COMBOS[ability.name]) || [];
  if (comboIds.length > 0) {
    const matchedCombos = COMBOS.filter(c => comboIds.includes(c.id));
    html += `<details class="detail-panel__res-effect detail-panel__combos">
      <summary>
        <img src="${COMBO_ICON}" alt="Combos">
        <span>Combos (${matchedCombos.length})</span>
      </summary>
      <ul class="detail-panel__combos-list">`;
    for (const c of matchedCombos) {
      html += `<li>
        <button class="detail-panel__combo-link" data-combo-id="${c.id}">
          <span class="detail-panel__combo-name">${c.name}</span>
          <span class="combo-rank ${RANK_CLASS[c.rank] || ""} combo-rank--sm">${c.rank}</span>
          <span class="detail-panel__combo-arrow">→</span>
        </button>
      </li>`;
    }
    html += `</ul></details>`;
  }

  panel.innerHTML = html;

  // Noise-warn tooltip (Unseen Passage easter egg)
  panel.querySelectorAll('.masq-val-noise-warn').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      sharedTooltip.innerHTML = `<div class="tooltip__name" style="color:var(--red)">WHY THE F#$% IS THIS AS NOISY AS VAMPIRIC SPRINT?!1</div>`;
      sharedTooltip.classList.add('tooltip--visible');
      positionTooltip(e);
    });
    el.addEventListener('mousemove', positionTooltip);
    el.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));
  });

  // Masquerade section header tooltip
  const masqSummary = panel.querySelector('.detail-panel__masq-summary');
  if (masqSummary) {
    masqSummary.addEventListener('mouseenter', (e) => {
      sharedTooltip.innerHTML = `<div class="tooltip__name">Masquerade Impact</div><div class="tooltip__desc">Denotes when this ability use is witnessed — some abilities are safe provided no NPCs or cops see you.</div>`;
      sharedTooltip.classList.add('tooltip--visible');
      positionTooltip(e);
    });
    masqSummary.addEventListener('mousemove', positionTooltip);
    masqSummary.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));
  }

  // Trainer badge tooltip
  const trainerBadge = panel.querySelector('.detail-panel__trainer');
  if (trainerBadge) {
    trainerBadge.addEventListener('mouseenter', (e) => {
      sharedTooltip.innerHTML = `<div class="tooltip__name">${trainerBadge.dataset.trainerPos}</div>`;
      sharedTooltip.classList.add('tooltip--visible');
      positionTooltip(e);
    });
    trainerBadge.addEventListener('mousemove', positionTooltip);
    trainerBadge.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));
  }

  // Bind video lightbox click
  const videoWrap = panel.querySelector(".detail-panel__video");
  const videoEl = videoWrap && videoWrap.querySelector("video");
  if (videoEl) {
    const openLightbox = () => openVideoLightbox(videoEl.dataset.videoSrc);
    videoEl.style.cursor = "pointer";
    videoEl.addEventListener("click", openLightbox);
    const expandBtn = videoWrap.querySelector(".detail-panel__video-expand");
    if (expandBtn) expandBtn.addEventListener("click", openLightbox);
  }

  // Bind outfit link button
  const outfitBtn = panel.querySelector(".detail-panel__outfit-btn");
  if (outfitBtn) {
    outfitBtn.addEventListener("click", () => {
      navigateToOutfit(outfitBtn.dataset.clan, parseInt(outfitBtn.dataset.idx));
    });
  }

  // Bind combo link buttons
  panel.querySelectorAll(".detail-panel__combo-link").forEach(btn => {
    btn.addEventListener("click", () => {
      if (typeof navigateToCombos === "function") navigateToCombos(btn.dataset.comboId);
    });
  });
}

function openImageLightbox(src, alt) {
  const old = document.getElementById("video-lightbox");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.id = "video-lightbox";
  overlay.className = "video-lightbox";
  overlay.innerHTML = `
    <div class="video-lightbox__content video-lightbox__content--img">
      <img src="${src}" alt="${alt || ''}" style="width:100%; height:100%; object-fit:contain; border-radius:4px; cursor:default;">
      <button class="video-lightbox__close">&times;</button>
    </div>
  `;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.classList.contains("video-lightbox__close")) {
      overlay.remove();
    }
  });
  document.body.appendChild(overlay);
}

function openVideoLightbox(src) {
  // Remove existing
  const old = document.getElementById("video-lightbox");
  if (old) old.remove();

  const isYouTube = src.includes("youtube.com/embed") || src.includes("youtu.be");

  const overlay = document.createElement("div");
  overlay.id = "video-lightbox";
  overlay.className = "video-lightbox";
  overlay.innerHTML = isYouTube
    ? `<div class="video-lightbox__content">
        <iframe src="${src}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen style="width:100%;height:100%;"></iframe>
        <button class="video-lightbox__close">&times;</button>
      </div>`
    : `<div class="video-lightbox__content">
        <video src="${src}" autoplay loop muted></video>
        <button class="video-lightbox__close">&times;</button>
      </div>`;
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.classList.contains("video-lightbox__close")) {
      overlay.remove();
    }
  });
  document.body.appendChild(overlay);
}

// ── Helpers ──────────────────────────────────────────────────
function buildCCTTooltip(name, isUnlocked, clanName) {
  const tierLabel = 'Clan Completion Talent';
  const clanId = CLAN_ORDER.find(id => CLANS[id].name === clanName);
  const isUniversalCCT = !clanId;
  const clanLogo = clanId ? (isUnlocked ? CLANS[clanId].logoCompleted : CLANS[clanId].logo) : null;
  const statusClass = isUnlocked ? 'cct-tooltip__status--unlocked' : 'cct-tooltip__status--locked';
  const statusHtml = isUnlocked
    ? `<div class="cct-tooltip__status ${statusClass}">Unlocked</div>`
    : `<div class="cct-tooltip__status ${statusClass}">Complete ${clanName} to unlock</div>` +
      `<div class="cct-tooltip__status cct-tooltip__status--hint">Set clan to completed to unlock this ability</div>`;
  const interactionHint = isUniversalCCT
    ? `<div class="tooltip__clan-hint">${CCT_SHIFT_LMB_ICONS} complete all clans and unlock Blood Quickening</div>`
    : `<div class="tooltip__clan-hint">${CCT_SHIFT_LMB_ICONS} set ${clanName} to completed</div>`;

  const clanSymbolHtml = clanLogo
    ? `<div class="tooltip__discipline cct-clan-symbol ${isUnlocked ? 'cct-clan-symbol--unlocked' : 'cct-clan-symbol--locked'}">
        <img src="${clanLogo}" alt="${clanName}">
        <span>${clanName}</span>
      </div>`
    : '';

  return `<div class="tooltip__name">${name}</div>` +
    `<div class="tooltip__tier">${tierLabel}</div>` +
    clanSymbolHtml +
    `<div class="tooltip__divider"></div>` +
    statusHtml +
    interactionHint;
}

function attachCCTTooltip(el, name, isUnlocked, clanName) {
  el.addEventListener('mouseenter', (e) => {
    sharedTooltip.innerHTML = buildCCTTooltip(name, isUnlocked, clanName);
    sharedTooltip.classList.add('tooltip--visible');
    positionTooltip(e);
  });
  el.addEventListener('mousemove', positionTooltip);
  el.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));
}

function buildCCTPipsMarkup(pipCount, isFilled) {
  if (!pipCount || pipCount <= 0) return '';
  let html = '<div class="comp-talent__pips">';
  for (let i = 0; i < pipCount; i++) {
    html += `<div class="blood-pip${isFilled ? ' filled' : ''}"></div>`;
  }
  html += '</div>';
  return html;
}

function setCCTClanCompleted(clanId) {
  if (!state.completedClans.has(clanId)) {
    state.completedClans.add(clanId);
  }
  renderClanSelector();
  renderGrid();
  renderDetailPanel();
  if (typeof renderFabienTree === 'function') renderFabienTree();
}

function setAllClansCompletedFromBloodHeal() {
  CLAN_ORDER.forEach(id => state.completedClans.add(id));
  renderClanSelector();
  renderGrid();
  renderDetailPanel();
  if (typeof renderFabienTree === 'function') renderFabienTree();
}

function renderCompletionTalentRows(grid) {
  const allCompleted = CLAN_ORDER.every(id => state.completedClans.has(id));
  const CCT_COMPLETED_CONTAINER = 'assets/N_Textures/ClanSelection/T_UI_ClanIconContainer_Selected.png';
  
  // Clan-specific colored diamond frame backgrounds (Brujah uses plain uncolored container)
  const CLAN_PATTERN_BG = {
    tremere:   'assets/ClanPatterns/T_UI_ClanIconContainer_Selected_Tremere.png',
    ventrue:   'assets/ClanPatterns/T_UI_ClanIconContainer_Selected_Ventrue.png',
    banuHaqim: 'assets/ClanPatterns/T_UI_ClanIconContainer_Selected_BanuHaqim.png',
    brujah:    'assets/ClanPatterns/T_UI_ClanIconContainer.png',
    lasombra:  'assets/ClanPatterns/T_UI_ClanIconContainer_Selected_Lasombra.png',
    toreador:  'assets/ClanPatterns/T_UI_ClanIconContainer_Selected_Toreador.png',
  };

  // ── Row A: Blood Heal (universal, spans all 6 clan columns) ──
  grid.appendChild(createEl('div', 'tier-label')); // empty corner

  const bhName = allCompleted ? BLOOD_HEAL_TALENT.nameCompleted : BLOOD_HEAL_TALENT.name;
  const bhDesc = allCompleted ? BLOOD_HEAL_TALENT.descCompleted : BLOOD_HEAL_TALENT.desc;
  const bhCell = createEl('div', 'comp-talent comp-talent--universal');
  if (allCompleted) bhCell.classList.add('comp-talent--completed');
  bhCell.dataset.cctKey = 'bloodHeal';
  bhCell.innerHTML = `
    <div class="comp-talent__icon-wrap">
      <img class="ability-cell__btn-bg" src="assets/N_Textures/AbilityTree/Assets/T_AbilityTree_ButtonBg_Equipped.png" alt="">
      ${allCompleted ? `<img class="comp-talent__container-bg" src="${CCT_COMPLETED_CONTAINER}" alt="">` : ''}
      <img class="comp-talent__icon" src="${BLOOD_HEAL_TALENT.icon}" alt="${bhName}">
    </div>
    ${buildCCTPipsMarkup(BLOOD_HEAL_TALENT.bloodPips, true)}
  `;
  bhCell.addEventListener('click', (e) => {
    if (e.shiftKey) {
      setAllClansCompletedFromBloodHeal();
      return;
    }
    toggleFocusedCCT('bloodHeal');
  });
  if (state.focusedAbility && state.focusedAbility.type === 'cct' && state.focusedAbility.cctKey === 'bloodHeal') {
    bhCell.classList.add('selected-ability');
  }
  attachCCTTooltip(bhCell, bhName, true, 'all clans');
  grid.appendChild(bhCell);

  // ── Row B: Clan-specific completion talents ──
  const rowLabel = createEl('div', 'tier-label tier-label--cct');
  rowLabel.textContent = 'CCT';
  rowLabel.addEventListener('mouseenter', (e) => {
    sharedTooltip.innerHTML = `<div class="tooltip__name">Clan Completion Talents</div>`;
    sharedTooltip.classList.add('tooltip--visible');
    positionTooltip(e);
  });
  rowLabel.addEventListener('mousemove', positionTooltip);
  rowLabel.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));
  grid.appendChild(rowLabel);

  for (const clanId of CLAN_ORDER) {
    const talent = COMPLETION_TALENTS[clanId];
    const isCompleted = state.completedClans.has(clanId);
    const cell = createEl('div', 'comp-talent');
    cell.classList.add(isCompleted ? 'comp-talent--completed' : 'comp-talent--locked');
    cell.dataset.clan = clanId;
    cell.dataset.cctKey = clanId;
    cell.innerHTML = `
      <div class="comp-talent__icon-wrap">
        ${isCompleted ? `<img class="comp-talent__container-bg" src="${CLAN_PATTERN_BG[clanId]}" alt="">` : ''}
        <img class="comp-talent__icon" src="${talent.icon}" alt="${talent.name}">
      </div>
      ${buildCCTPipsMarkup(talent.bloodPips, isCompleted)}
    `;
    cell.addEventListener('click', (e) => {
      if (e.shiftKey) {
        setCCTClanCompleted(clanId);
        return;
      }
      toggleFocusedCCT(clanId);
    });
    if (state.focusedAbility && state.focusedAbility.type === 'cct' && state.focusedAbility.cctKey === clanId) {
      cell.classList.add('selected-ability');
    }
    attachCCTTooltip(cell, talent.name, isCompleted, CLANS[clanId].name);
    grid.appendChild(cell);
  }
}

function createEl(tag, className) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  return el;
}

// Navigate to the outfits tab and focus a specific outfit
function navigateToOutfit(clanId, tierIdx) {
  const secondaryTabs = document.querySelectorAll(".tab-bar--secondary .tab-bar__tab");
  secondaryTabs.forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
  const outfitsTab = document.querySelector(".tab-bar--secondary .tab-bar__tab[data-subtab='outfits']");
  if (outfitsTab) outfitsTab.classList.add("active");
  document.getElementById("subpage-outfits").classList.remove("hidden");
  outfitState.selectedClan = clanId;
  outfitState.focusedOutfit = { clanId, index: tierIdx };
  if (typeof refreshOutfitsPage === "function") refreshOutfitsPage();
}

// Navigate to the skill tree tab and focus a specific ability
function navigateToAbility(clanId, tier) {
  const secondaryTabs = document.querySelectorAll(".tab-bar--secondary .tab-bar__tab");
  secondaryTabs.forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
  const skilltreeTab = document.querySelector(".tab-bar--secondary .tab-bar__tab[data-subtab='skilltree']");
  if (skilltreeTab) skilltreeTab.classList.add("active");
  document.getElementById("subpage-skilltree").classList.remove("hidden");
  state.focusedAbility = { clanId, tier };
  renderGrid();
  updateCosts();
  renderDetailPanel();
}

// ── Start ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);

// ── About Modal ────────────────────────────────────────────
(function () {
  const overlay = document.getElementById('about-modal');
  const openBtn = document.getElementById('about-open-btn');
  const closeBtn = document.getElementById('about-close-btn');

  function openModal() {
    overlay.classList.remove('hidden');
    overlay.focus();
  }

  function closeModal() {
    overlay.classList.add('hidden');
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
}());

// ── Mods Modal ─────────────────────────────────────────────
(function () {
  const overlay = document.getElementById('mods-modal');
  const openBtn = document.getElementById('mods-open-btn');
  const closeBtn = document.getElementById('mods-close-btn');

  function openModal() {
    overlay.classList.remove('hidden');
  }

  function closeModal() {
    overlay.classList.add('hidden');
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeModal();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
}());
