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
  customCursor: true,
};

const phyreInnateState = { focused: null };

const PHYRE_INNATE_ITEMS = [
  {
    id: "telekinesis",
    title: "Telekinesis",
    icon: () => UI.tkIcon,
  },
  {
    id: "glide",
    title: "Glide",
    icon: () => UI.phyreMark,
  },
  {
    id: "melee",
    title: "Melee Combos",
    icon: () => state.selectedClan ? CLANS[state.selectedClan].logo : UI.phyreMark,
  },
  {
    id: "vampiricSprint",
    title: "Vampiric Sprint",
    icon: () => UI.vampiricSprintIcon,
  },
];

const STATE_PARAM = "state";
const STATE_COOKIE = "vtmb2_state";
const STATE_VERSION = 1;
const POS_PARAM = "at";

// ── URL helpers ──────────────────────────────────────────────
// Always writes ?at=...&state=... in that canonical order.
function rewriteUrl(atVal, stateVal) {
  const url = new URL(window.location.href);
  url.search = "";
  if (atVal != null)    url.searchParams.set(POS_PARAM, atVal);
  if (stateVal != null) url.searchParams.set(STATE_PARAM, stateVal);
  history.replaceState(null, "", url.toString());
}

function getCurrentPos() {
  const primary = document.querySelector(".tab-bar--primary .tab-bar__tab.active");
  if (!primary) return null;
  const page = primary.dataset.tab;
  let pos = page;
  if (page === "phyre") {
    const secondary = document.querySelector(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab.active");
    if (secondary) {
      pos = `phyre.${secondary.dataset.subtab}`;
      if (secondary.dataset.subtab === "combos") {
        const combosSub = document.querySelector(".tab-bar--combos .tab-bar__tab.active");
        if (combosSub) pos += `.${combosSub.dataset.combotab}`;
      }
    }
  } else if (page === "fabien") {
    const fabSub = document.querySelector(".tab-bar--fabien .tab-bar__tab.active");
    if (fabSub) pos = `fabien.${fabSub.dataset.fabtab}`;
  }
  return pos;
}

function persistPosition() {
  const pos = getCurrentPos();
  if (!pos) return;
  const stateVal = new URL(window.location.href).searchParams.get(STATE_PARAM);
  rewriteUrl(pos, stateVal);
}

function applyPersistedPosition(pos) {
  if (!pos) return;
  const parts = pos.split(".");
  const page = parts[0];
  const sub = parts[1];
  const subsub = parts[2];

  // Activate primary tab
  const primaryTab = document.querySelector(`.tab-bar--primary .tab-bar__tab[data-tab="${page}"]`);
  if (!primaryTab) return;
  document.querySelectorAll(".tab-bar--primary .tab-bar__tab").forEach(t => t.classList.remove("active"));
  primaryTab.classList.add("active");
  document.querySelectorAll("#app > .page").forEach(p => p.classList.add("hidden"));
  const pageEl = document.getElementById(`page-${page}`);
  if (pageEl) pageEl.classList.remove("hidden");

  if (page === "phyre" && sub) {
    const secondaryTab = document.querySelector(`.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab[data-subtab="${sub}"]`);
    if (secondaryTab) {
      document.querySelectorAll(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab").forEach(t => t.classList.remove("active"));
      secondaryTab.classList.add("active");
      document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
      const subEl = document.getElementById(`subpage-${sub}`);
      if (subEl) subEl.classList.remove("hidden");
      if (sub === "combos" && typeof setActiveCombosSubtab === "function") {
        setActiveCombosSubtab(subsub || "ability");
      }
    }
  } else if (page === "fabien" && sub) {
    const fabTab = document.querySelector(`.tab-bar--fabien .tab-bar__tab[data-fabtab="${sub}"]`);
    if (fabTab) {
      document.querySelectorAll(".tab-bar--fabien .tab-bar__tab").forEach(t => t.classList.remove("active"));
      fabTab.classList.add("active");
      document.querySelectorAll(".fabien-subpage").forEach(p => p.classList.add("hidden"));
      const fabEl = document.getElementById(`fabien-subpage-${sub}`);
      if (fabEl) fabEl.classList.remove("hidden");
    }
  } else if (page === "benny" && typeof refreshBennyPage === "function") {
    refreshBennyPage();
  }
}

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
    cx: state.customCursor !== false,
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

  const atVal = new URL(window.location.href).searchParams.get(POS_PARAM);
  rewriteUrl(atVal, encoded);

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
  if (typeof payload.cx !== "undefined") {
    state.customCursor = payload.cx !== false;
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
  renderPhyreInnateItems();
  bindToggles();
  bindTabs();
  bindClanSelectorToggle();
  initCursorToggle();
  bindShareButtons();
  updatePhyreClanCrest();

  // Restore tab position after tabs are bound
  const posFromUrl = new URL(window.location.href).searchParams.get(POS_PARAM);
  if (posFromUrl) applyPersistedPosition(posFromUrl);

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

function setActiveCombosSubtab(tabId) {
  const tabs = document.querySelectorAll(".tab-bar--combos .tab-bar__tab");
  const targetTab = document.querySelector(`.tab-bar--combos .tab-bar__tab[data-combotab="${tabId}"]`);
  const targetSubpage = document.getElementById(`combos-subpage-${tabId}`);
  if (!targetTab || !targetSubpage) return false;

  tabs.forEach(t => t.classList.remove("active"));
  targetTab.classList.add("active");
  document.querySelectorAll(".combos-subpage").forEach(p => p.classList.add("hidden"));
  targetSubpage.classList.remove("hidden");

  if (tabId === "ability") {
    renderCombosPage();
  } else if (tabId === "melee") {
    renderMeleeCombosPage();
  } else if (tabId === "clan") {
    if (typeof renderClanCombosPage === "function") renderClanCombosPage();
  }
  return true;
}

// ── Share / Save links ───────────────────────────────────────
function flashBtn(btn) {
  btn.classList.add("tab-link-btn--copied");
  setTimeout(() => btn.classList.remove("tab-link-btn--copied"), 1400);
}

function buildShareUrl(includeState) {
  const url = new URL(window.location.href);
  url.search = "";
  const pos = getCurrentPos();
  if (pos) url.searchParams.set(POS_PARAM, pos);
  if (includeState) {
    const encoded = encodeStatePayload(makePersistedState());
    if (encoded) url.searchParams.set(STATE_PARAM, encoded);
  }
  return url.toString();
}

function bindShareButtons() {
  const viewBtn = document.getElementById("view-link-btn");
  const saveBtn = document.getElementById("save-link-btn");
  if (viewBtn) {
    viewBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(buildShareUrl(false)).then(() => flashBtn(viewBtn));
    });
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      navigator.clipboard.writeText(buildShareUrl(true)).then(() => flashBtn(saveBtn));
    });
  }
}

function navigateToClanCombos() {
  // Ensure Phyre page is visible
  document.querySelectorAll(".tab-bar--primary .tab-bar__tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#app > .page").forEach(p => p.classList.add("hidden"));
  const phyreTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="phyre"]');
  if (phyreTab) phyreTab.classList.add("active");
  document.getElementById("page-phyre").classList.remove("hidden");

  // Ensure Combos secondary tab is visible
  const secondaryTabs = document.querySelectorAll(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab");
  secondaryTabs.forEach(t => t.classList.remove("active"));
  const combosTab = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab[data-subtab="combos"]');
  if (combosTab) combosTab.classList.add("active");
  document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
  document.getElementById("subpage-combos").classList.remove("hidden");

  // Switch to Clan subtab
  setActiveCombosSubtab("clan");
  persistPosition();
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
        const activeSecondary = document.querySelector(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab.active");
        if (activeSecondary) {
          document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
          const subpage = document.getElementById(`subpage-${activeSecondary.dataset.subtab}`);
          if (subpage) subpage.classList.remove("hidden");
          if (activeSecondary.dataset.subtab === "outfits" && typeof refreshOutfitsPage === "function") refreshOutfitsPage();
          if (activeSecondary.dataset.subtab === "combos" && typeof setActiveCombosSubtab === "function") setActiveCombosSubtab("ability");
          if (activeSecondary.dataset.subtab === "pickups" && typeof renderPickupsPage === "function") renderPickupsPage();
        }
      }
      if (tab.dataset.tab === "benny" && typeof refreshBennyPage === "function") {
        refreshBennyPage();
      }
      persistPosition();
    });
  });

  // Secondary tabs within Phyre (Skill Tree, Outfits)
  const secondaryTabs = document.querySelectorAll(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab");
  secondaryTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      secondaryTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
      document.getElementById(`subpage-${tab.dataset.subtab}`).classList.remove("hidden");
      if (tab.dataset.subtab === "outfits" && typeof refreshOutfitsPage === "function") {
        refreshOutfitsPage();
      }
      if (tab.dataset.subtab === "combos" && typeof setActiveCombosSubtab === "function") {
        setActiveCombosSubtab("ability");
      }
      if (tab.dataset.subtab === "pickups" && typeof renderPickupsPage === "function") {
        renderPickupsPage();
        if (state.modHaven) {
          setActivePickupsSubtab("maha");
        }
      }
      persistPosition();
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
      persistPosition();
    });
  });

  // Pickups sub-tabs
  const pickupsTabs = document.querySelectorAll(".tab-bar--pickups .tab-bar__tab");
  pickupsTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      setActivePickupsSubtab(tab.dataset.pickuptab);
    });
  });

  // Combos sub-tabs
  const combosTabs = document.querySelectorAll(".tab-bar--combos .tab-bar__tab");
  combosTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      setActiveCombosSubtab(tab.dataset.combotab);
      persistPosition();
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

  // Update innate sidebar so Melee Combos clan icon refreshes
  renderPhyreInnateItems();

  // Refresh clan combos if visible
  const clanCombosEl = document.getElementById("combos-subpage-clan");
  if (clanCombosEl && !clanCombosEl.classList.contains("hidden") && typeof renderClanCombosPage === "function") {
    renderClanCombosPage();
  }

  // Auto-collapse clan selector on selection
  if (!state.clanSelectorCollapsed) {
    state.clanSelectorCollapsed = true;
    applyClanSelectorCollapsed();
  }

  updatePhyreClanCrest();
}

// ── Clan Selector Toggle ─────────────────────────────────────
function updatePhyreClanCrest() {
  const img = document.getElementById("phyre-clan-crest");
  if (!img) return;
  if (state.selectedClan && CLANS[state.selectedClan]) {
    img.src = CLANS[state.selectedClan].logo;
    img.hidden = false;
  } else {
    img.src = "";
    img.hidden = true;
  }
}

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

function applyClanSelectorCollapsed() {
  const sel = document.getElementById("clan-selector");
  if (sel) sel.classList.toggle("collapsed", state.clanSelectorCollapsed);
  const btn = document.getElementById("clan-selector-toggle");
  if (btn) btn.textContent = state.clanSelectorCollapsed ? "\u25bc Select Clan" : "\u25b2 Hide Clan";
  persistState();
}

// ── Phyre Innate Abilities Sidebar ──────────────────────────
function renderPhyreInnateItems() {
  const container = document.getElementById("phyre-innate-items");
  if (!container) return;
  container.innerHTML = "";

  const heading = document.createElement("div");
  heading.className = "phyre-innate-items__heading";
  heading.innerHTML = `Innate Abilities<img class="phyre-innate-items__heading-icon" src="${UI.phyreMark}" alt="Phyre">`;
  container.appendChild(heading);

  PHYRE_INNATE_ITEMS.forEach(item => {
    const el = document.createElement("div");
    el.className = "benny-sidebar-item" + (phyreInnateState.focused === item.id ? " focused" : "");
    el.dataset.itemId = item.id;

    const titleEl = document.createElement("span");
    titleEl.className = "benny-sidebar-item__title";
    titleEl.textContent = item.title;
    el.appendChild(titleEl);

    const iconSrc = typeof item.icon === "function" ? item.icon() : item.icon;
    if (iconSrc) {
      const icon = document.createElement("img");
      icon.className = "benny-sidebar-item__icon phyre-innate-item__icon";
      icon.src = iconSrc;
      icon.alt = item.title;
      el.appendChild(icon);
    }

    el.addEventListener("click", () => {
      const same = phyreInnateState.focused === item.id;
      phyreInnateState.focused = same ? null : item.id;
      state.focusedAbility = null;
      renderPhyreInnateItems();
      renderDetailPanel();
    });

    container.appendChild(el);
  });
}

function renderPhyreInnateDetail(panel) {
  const itemId = phyreInnateState.focused;
  const item = PHYRE_INNATE_ITEMS.find(i => i.id === itemId);
  if (!item) {
    panel.innerHTML = '<div class="empty-state">Select an ability to view details</div>';
    return;
  }

  const iconSrc = typeof item.icon === "function" ? item.icon() : item.icon;
  let html = `<div class="detail-panel__tier">Innate</div>`;

  if (iconSrc) {
    html += `<div class="detail-panel__name-row"><img class="detail-panel__ability-icon" src="${iconSrc}" alt="${item.title}"><div class="detail-panel__name">${item.title}</div></div>`;
  } else {
    html += `<div class="detail-panel__name">${item.title}</div>`;
  }

  if (itemId === "telekinesis") {
    html += `<div class="detail-panel__subtitle">Telekinetic Pull</div>`;
    html += `<div class="innate-section-list">`;
    html += `<div class="innate-section"><span class="innate-section__label">Input</span><span class="innate-section__text">Press <kbd class="innate-key-ref">TK</kbd> (${formatCCTInlineText('[Q]')}) to pick up object. Press <kbd class="innate-key-ref">TK</kbd> (${formatCCTInlineText('[Q]')}) again to drop it. Press <kbd class="innate-key-ref">Throw</kbd> (${formatCCTInlineText('[M1]')}) to throw held objects.</span></div>`;
    html += `<div class="innate-section"><span class="innate-section__label">NPCs</span><span class="innate-section__text">The Nomad can use a Telekinetic Pull on an unaware opponent — brings them within striking distance or opens them to stronger assaults.</span></div>`;
    html += `<div class="innate-section"><span class="innate-section__label">Objects</span><span class="innate-section__text">Pick up an object and throw as a distraction or for light-ranged damage.</span></div>`;
    html += `<div class="innate-section"><span class="innate-section__label">Weapons</span><span class="innate-section__text">Ranged weapons with ammo can be fired back at assailants. Once ammo is empty, they can be Telekinetically thrown.</span></div>`;
    html += `</div>`;
  } else if (itemId === "glide") {
    html += `<div class="detail-panel__desc">After beginning a Jump, hold the Jump button for longer to initiate a Glide. While Gliding, it is possible to change course by pressing a direction.</div>`;
    html += `<div class="innate-tip">&#8220;Whilst airborne, press Dash (default ${formatCCTInlineText('[ctrl]')}) to get a burst of speed forward. Useful for jumping between rooftops.&#8221;</div>`;
  } else if (itemId === "melee") {
    html += `<div class="detail-panel__desc">Phyre uses a full melee combo system — light attacks, heavies, counters, and advanced techniques.</div>`;
    if (state.selectedClan && typeof CLAN_COMBOS !== "undefined" && CLAN_COMBOS[state.selectedClan]) {
      const data = CLAN_COMBOS[state.selectedClan];
      const clan = CLANS[state.selectedClan];
      html += `<details class="innate-combo-lozenge">`;
      html += `<summary class="innate-combo-lozenge__summary">${clan.name} combo stats <span class="innate-combo-lozenge__meta">${data.steps} steps &middot; ${data.lightType === "NoLunge" ? "No-Lunge" : "Lunging"}</span>`;
      if (data.dps) {
        const dps = data.dps;
        const allLightDmg = data.rows.reduce((s, r) => s + r.lightDmg, 0);
        html += `<span class="innate-lozenge-chips">`;
        html += `<span class="innate-dps-badge innate-dps-badge--opt" title="Optimal DPS (${dps.optimalPattern.join('')})"><span class="innate-dps-badge__label">OPT</span><span class="innate-dps-badge__val">${dps.optimalDps.toFixed(2)}</span></span>`;
        html += `</span>`; // innate-lozenge-chips
      }
      html += `</summary>`;
      html += `<div class="innate-combo-lozenge__body">`;
      html += buildClanComboMiniTable(state.selectedClan);
      if (data.notes && data.notes.length) {
        html += `<ul class="innate-mini-notes">`;
        for (const note of data.notes) html += `<li>${note}</li>`;
        html += `</ul>`;
      }
      html += `</div></details>`;
    }
    html += `<div class="innate-tip innate-tip--link" id="innate-combos-link">&#8658; Full breakdown in the <strong>Combos → Clan</strong> tab</div>`;
  } else if (itemId === "vampiricSprint") {
    html += `<div class="detail-panel__desc">Phyre can sprint at supernatural speed by holding the sprint button. Vampiric Sprint is a passive innate ability — it requires no Blood and is always available.</div>`;
    html += `<div class="innate-section-list">`;
    html += `<div class="innate-section"><span class="innate-section__label">Input</span><span class="innate-section__text">Hold <kbd class="innate-key-ref">Sprint</kbd> (${formatCCTInlineText('[Shift]')}) to activate. Release to return to normal movement.</span></div>`;
    html += `<div class="innate-section"><span class="innate-section__label">Effect</span><span class="innate-section__text">Greatly increases movement speed. Can be chained with a Jump or Dash for extended traversal.</span></div>`;
    html += `<div class="innate-section"><span class="innate-section__label">Combat</span><span class="innate-section__text">Sprinting into a melee engagement opens up additional attack options. Pairs well with Telekinetic Pull to close distance before engaging.</span></div>`;
    html += `</div>`;
  }

  panel.innerHTML = html;

  if (itemId === "melee") {
    const lozenge = panel.querySelector(".innate-combo-lozenge");
    if (lozenge && state.selectedClan && typeof CLAN_COMBOS !== "undefined") {
      const cdata = CLAN_COMBOS[state.selectedClan];
      if (cdata && cdata.dps) {
        // Auto-apply optimal highlight
        const pattern = cdata.dps.optimalPattern;
        lozenge.querySelectorAll("tr[data-step]").forEach(row => {
          const step = parseInt(row.dataset.step, 10);
          if (isNaN(step) || step < 0 || step >= pattern.length) return;
          const cell = row.querySelector(`[data-cell="${pattern[step] === "L" ? "ldmg" : "hdmg"}"]`);
          if (cell) cell.classList.add("dps-cell--highlight");
        });
      }
    }
    const link = panel.querySelector("#innate-combos-link");
    if (link) {
      link.addEventListener("click", () => {
        phyreInnateState.focused = null;
        renderPhyreInnateItems();
        if (typeof navigateToCombos === "function") {
          navigateToCombos();
          // Switch to clan sub-tab after navigation settles
          setTimeout(() => {
            if (typeof setActiveCombosSubtab === "function") setActiveCombosSubtab("clan");
          }, 80);
        }
      });
    }
  }
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
    document.querySelectorAll(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
    const pickupsSecondaryTab = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab[data-subtab="pickups"]');
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

// ── Ability lozenge helpers ──────────────────────────────────
function buildAbilityLozengesHtml(ability) {
  let html = '';
  if (ability.duration) {
    html += `<div class="detail-panel__duration">`;
    html += `<img class="detail-panel__duration-icon" src="${UI.splitSecondIcon}" alt="Duration">`;
    html += `<span>${ability.duration}</span>`;
    html += `</div>`;
  }
  if (ability.tags && ability.tags.length) {
    html += `<details class="detail-panel__tags">`;
    html += `<summary class="detail-panel__tags-summary"><span class="masq-summary__arrow">▶</span><img class="detail-panel__tags-icon" src="${UI.tagsIcon}" alt="Tags">Tags</summary>`;
    html += `<ul class="detail-panel__tags-list">`;
    for (const t of ability.tags) html += `<li>${t}</li>`;
    html += `</ul></details>`;
  }
  if (ability.notes && ability.notes.length) {
    html += `<details class="detail-panel__notes">`;
    html += `<summary class="detail-panel__notes-summary"><span class="masq-summary__arrow">▶</span><img class="detail-panel__notes-icon" src="${UI.notesIcon}" alt="Notes">Notes</summary>`;
    html += `<ul class="detail-panel__notes-list">`;
    for (const n of ability.notes) html += `<li>${n}</li>`;
    html += `</ul></details>`;
  }
  return html;
}

function buildAbilityTooltipLozengesHtml(ability) {
  let html = '';
  if (ability.duration) {
    html += `<div class="tooltip__duration">`;
    html += `<img class="tooltip__duration-icon" src="${UI.splitSecondIcon}" alt="Duration">`;
    html += `<span>${ability.duration}</span>`;
    html += `</div>`;
  }
  if (ability.tags && ability.tags.length) {
    html += `<img class="tooltip__tags-icon" src="${UI.tagsIcon}" alt="Has mechanic data">`;
  }
  return html;
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

  // Duration + Notes lozenges
  html += buildAbilityTooltipLozengesHtml(ability);

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
  sprint: 'assets/Keyboard/T_UI_Keyboard_Shift_Left.png',
  f: 'assets/Keyboard/T_UI_Keyboard_F.png',
  m1: 'assets/Keyboard/T_UI_Keyboard_Mouse_Left_Click.png',
  lmb: 'assets/Keyboard/T_UI_Keyboard_Mouse_Left_Click.png',
  throw: 'assets/Keyboard/T_UI_Keyboard_Mouse_Left_Click.png',
  rightclick: 'assets/Keyboard/T_UI_Keyboard_Mouse_Right_Click.png',
  e: 'assets/Keyboard/T_UI_Keyboard_E.png',
  i: 'assets/Keyboard/T_UI_Keyboard_I.png',
  q: 'assets/Keyboard/T_UI_Keyboard_Q.png',
  tk: 'assets/Keyboard/T_UI_Keyboard_Q.png',
  ctrl: 'assets/Keyboard/T_UI_Keyboard_CTRL_Left.png',
  'left-click': 'assets/Keyboard/T_UI_Keyboard_Mouse_Left_Click.png',
  c: 'assets/Keyboard/T_UI_Keyboard_C.png',
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
  let iconRotate = 0;
  let inputText = '';
  let detailLines = [];
  let subLines = [];
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
    iconRotate = talent.iconRotate || 0;
    inputText = talent.input || '';
    detailLines = Array.isArray(talent.lines) ? talent.lines : [];
    subLines = Array.isArray(talent.subLines) ? talent.subLines : [];
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
  html += `<img class="detail-panel__ability-icon" src="${icon}" alt="${name}"${iconRotate ? ` style="transform:rotate(${iconRotate}deg)"` : ''}>`;
  html += `<div class="detail-panel__name">${name}</div>`;
  html += `</div>`;

  if (inputText) {
    html += `<div class="detail-panel__cct-input"><span class="detail-panel__cct-input-label">Input:</span> ${formatCCTInlineText(inputText)}</div>`;
  }

  // Cooldown lozenge (CCTs)
  if (cctKey !== 'bloodHeal') {
    const talentObj = COMPLETION_TALENTS[cctKey];
    if (talentObj && talentObj.cooldown) {
      html += `<div class="detail-panel__duration">`;
      html += `<img class="detail-panel__duration-icon" src="${UI.splitSecondIcon}" alt="Cooldown">`;
      html += `<span>${talentObj.cooldown} cooldown</span>`;
      html += `</div>`;
    }
  }

  if (detailLines.length > 0) {
    html += `<ul class="detail-panel__cct-lines">`;
    for (let i = 0; i < detailLines.length; i++) {
      const isLast = i === detailLines.length - 1 && subLines.length > 0;
      if (isLast) {
        html += `<li>${formatCCTInlineText(detailLines[i])}`;
        html += `<ul class="detail-panel__cct-sublines">`;
        for (const sub of subLines) {
          html += `<li>${formatCCTInlineText(sub)}</li>`;
        }
        html += `</ul></li>`;
      } else {
        html += `<li>${formatCCTInlineText(detailLines[i])}</li>`;
      }
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

  // If an innate item is focused and no normal ability has taken over, show innate detail
  if (phyreInnateState.focused && !state.focusedAbility) {
    renderPhyreInnateDetail(panel);
    return;
  }

  // A normal ability click clears innate focus
  if (state.focusedAbility && phyreInnateState.focused) {
    phyreInnateState.focused = null;
    renderPhyreInnateItems();
  }

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

  // Duration + Tags lozenges (below blood pips / AP)
  html += buildAbilityLozengesHtml(ability);

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
      <button class="detail-panel__outfit-btn" data-clan="${clanId}" data-idx="${outfitTierIdx}"><img class="detail-panel__outfit-btn-icon" src="${UI.outfitNotifIcon}" alt="">${outfit.name}${!isUnlocked ? ' (locked)' : ''}</button>
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
    brujah:    'assets/N_Textures/ClanSelection/T_UI_ClanIconContainer_Selected.png',
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
      ${allCompleted ? `<img class="comp-talent__container-bg" src="${CCT_COMPLETED_CONTAINER}" alt=""><img class="comp-talent__container-bg" src="assets/N_Textures/ClanSelection/T_UI_ClanIconContainer_COMPLETED_Selected.png" alt="">` : ''}
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
        ${isCompleted ? `<img class="comp-talent__container-bg comp-talent__container-bg--back" src="assets/N_Textures/ClanSelection/T_UI_ClanIconContainer_Background_COMPLETED_Selected.png" alt="">` : ''}
        ${isCompleted ? `<img class="comp-talent__container-bg" src="${CLAN_PATTERN_BG[clanId]}" alt="">` : ''}
        <img class="comp-talent__icon" src="${talent.icon}" alt="${talent.name}"${talent.iconRotate ? ` style="transform:rotate(${talent.iconRotate}deg)"` : ''}>
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
  // Ensure Phyre primary tab is active
  document.querySelectorAll(".tab-bar--primary .tab-bar__tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#app > .page").forEach(p => p.classList.add("hidden"));
  const phyreTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="phyre"]');
  if (phyreTab) phyreTab.classList.add("active");
  document.getElementById("page-phyre").classList.remove("hidden");

  const secondaryTabs = document.querySelectorAll(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab");
  secondaryTabs.forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
  const outfitsTab = document.querySelector(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab[data-subtab='outfits']");
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

// ── Cursor Toggle ───────────────────────────────────────────
function applyCursorState() {
  document.body.classList.toggle('no-custom-cursor', !state.customCursor);
  const btn = document.getElementById('cursor-toggle-btn');
  if (btn) btn.classList.toggle('cursor-toggle-btn--off', !state.customCursor);
}

function initCursorToggle() {
  applyCursorState();
  const btn = document.getElementById('cursor-toggle-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    state.customCursor = !state.customCursor;
    applyCursorState();
    persistState();
  });
}

// ── Start ────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", init);

// ── Changelog Modal ────────────────────────────────────────
(function () {
  const overlay = document.getElementById('changelog-modal');
  const openBtn = document.getElementById('changelog-open-btn');
  const closeBtn = document.getElementById('changelog-close-btn');

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
