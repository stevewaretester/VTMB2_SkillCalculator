// VTMB2 Skill Calculator - Application Logic
// =============================================

// ── Shared Tooltip ─────────────────────────────────────────
const sharedTooltip = document.createElement('div');
sharedTooltip.className = 'tooltip';
document.addEventListener('DOMContentLoaded', () => document.body.appendChild(sharedTooltip));

// Suppress tooltips triggered by synthetic mouseenter after a touch tap.
// Browsers fire mouse events ~300ms after touchend; block tooltip for 600ms.
let _lastTouch = 0;
document.addEventListener('touchstart', () => { _lastTouch = Date.now(); }, { passive: true });
function showTooltip(html, e) {
  if (Date.now() - _lastTouch < 600) return;
  sharedTooltip.innerHTML = html;
  sharedTooltip.classList.add('tooltip--visible');
  positionTooltip(e);
}

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
const STATE_VERSION = 2;
const POS_PARAM = "at";

// Clan short codes for V2 human-readable URLs (e.g. ?sc=brujah&br=222222&tr=110000)
const CLAN_SHORT = { brujah: 'br', tremere: 'tr', banuHaqim: 'bh', ventrue: 've', lasombra: 'la', toreador: 'to' };
const SHORT_CLAN = Object.fromEntries(Object.entries(CLAN_SHORT).map(([k, v]) => [v, k]));

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
  const url = new URL(window.location.href);
  url.searchParams.set(POS_PARAM, pos);
  history.replaceState(null, '', url.toString());
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
      // Trigger renderers for subpages whose content is populated lazily on
      // tab activation. Without these the page DOM stays empty when arriving
      // via a deep-link like ?at=phyre.outfits.
      if (sub === "outfits" && typeof refreshOutfitsPage === "function") {
        refreshOutfitsPage();
      }
      if (sub === "pickups" && typeof renderPickupsPage === "function") {
        renderPickupsPage();
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
      if (typeof refreshFabienPage === "function") refreshFabienPage();
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

// Build URLSearchParams for V2 human-readable state (no encoding, no base64)
function makeStateParams(payload) {
  const p = new URLSearchParams();
  if (payload.sc) p.set('sc', payload.sc);
  const ccShorts = (payload.cc || []).map(id => CLAN_SHORT[id]).filter(Boolean);
  if (ccShorts.length) p.set('cc', ccShorts.join('.'));
  // Boolean flags — only emit when true (keeps URL clean for defaults)
  if (payload.ct) p.set('ct', '1');
  if (payload.mh) p.set('mh', '1');
  if (payload.mf) p.set('mf', '1');
  if (payload.cs) p.set('cs', '1');
  if (payload.lc) p.set('lc', '1');
  if (payload.cx === false) p.set('cx', '0');
  // Per-clan ability string: 6 digits in TIER_ORDER, 0=locked 1=awakened 2=unlocked
  for (const clanId of CLAN_ORDER) {
    const digits = TIER_ORDER.map(tier => {
      const v = payload.a[`${clanId}:${tier}`];
      return v === 'unlocked' ? '2' : v === 'awakened' ? '1' : '0';
    }).join('');
    if (digits !== '000000') p.set(CLAN_SHORT[clanId], digits);
  }
  return p;
}

// Decode V2 URL params back into a payload object
function decodeStateV2(params) {
  const ccRaw = params.get('cc') || '';
  const a = {};
  for (const clanId of CLAN_ORDER) {
    const digits = params.get(CLAN_SHORT[clanId]) || '';
    TIER_ORDER.forEach((tier, i) => {
      const d = digits[i];
      if (d === '2') a[`${clanId}:${tier}`] = 'unlocked';
      else if (d === '1') a[`${clanId}:${tier}`] = 'awakened';
    });
  }
  return {
    v: 2,
    sc: params.get('sc') || null,
    cc: ccRaw.split('.').filter(Boolean).map(s => SHORT_CLAN[s]).filter(id => id && CLAN_ORDER.includes(id)),
    ct: params.get('ct') === '1',
    mh: params.get('mh') === '1',
    mf: params.get('mf') === '1',
    cs: params.get('cs') === '1',
    lc: params.get('lc') === '1',
    cx: params.get('cx') !== '0',
    sp: {},
    a,
  };
}

function persistState() {
  const payload = makePersistedState();
  const stateParams = makeStateParams(payload);

  const url = new URL(window.location.href);
  const atVal = url.searchParams.get(POS_PARAM);
  url.search = '';
  if (atVal) url.searchParams.set(POS_PARAM, atVal);
  stateParams.forEach((v, k) => url.searchParams.set(k, v));
  history.replaceState(null, '', url.toString());

  // Cookie keeps V1 base64 for broad compat (cookie doesn't need to be readable).
  const encoded = encodeStatePayload(payload);
  if (encoded) setCookie(STATE_COOKIE, encoded, 60 * 60 * 24 * 365);
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
  const params = url.searchParams;

  // V2: human-readable params — detected by presence of 'sc' or any clan short code
  const isV2 = params.has('sc') || CLAN_ORDER.some(id => params.has(CLAN_SHORT[id]));
  if (isV2) {
    const payload = decodeStateV2(params);
    applyPersistedState(payload);
    // Back-fill cookie in V1 format for compat
    const encoded = encodeStatePayload(payload);
    if (encoded) setCookie(STATE_COOKIE, encoded, 60 * 60 * 24 * 365);
    return;
  }

  // V1: legacy base64 blob in ?state=
  const fromUrl = params.get(STATE_PARAM);
  if (fromUrl) {
    const payload = decodeStatePayload(fromUrl);
    if (payload) {
      applyPersistedState(payload);
      setCookie(STATE_COOKIE, fromUrl, 60 * 60 * 24 * 365);
      // V1 URL will be rewritten to V2 when persistState() runs after init()
      return;
    }
  }

  const fromCookie = getCookie(STATE_COOKIE);
  if (fromCookie) {
    const payload = decodeStatePayload(fromCookie);
    if (payload) applyPersistedState(payload);
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

  // Mobile shell (Phases 1–6) — must run after all tabs/state are ready
  initMobileShell();
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
  url.search = '';
  const pos = getCurrentPos();
  if (pos) url.searchParams.set(POS_PARAM, pos);
  if (includeState) {
    const stateParams = makeStateParams(makePersistedState());
    stateParams.forEach((v, k) => url.searchParams.set(k, v));
  }
  return url.toString();
}

function bindShareButtons() {
  const viewBtn = document.getElementById("view-link-btn");
  const saveBtn = document.getElementById("save-link-btn");
  if (viewBtn) {
    viewBtn.addEventListener("click", () => copyShareUrl(buildShareUrl(false), viewBtn));
  }
  if (saveBtn) {
    saveBtn.addEventListener("click", () => copyShareUrl(buildShareUrl(true), saveBtn));
  }
}

// Robust clipboard copy with fallback for non-secure contexts (e.g. file://
// where navigator.clipboard.writeText is unavailable or rejects).
function copyShareUrl(text, btn) {
  const flash = () => { if (btn) flashBtn(btn); };
  const fallback = () => {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      if (ok) flash();
      return ok;
    } catch {
      return false;
    }
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(flash, () => fallback());
  } else {
    fallback();
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
  if (typeof updateMobileChrome === "function") updateMobileChrome();
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
      _clearMobileContext();
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
      _clearMobileContext();
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
      showTooltip(
        `<div class="tooltip__name">${clan.name}</div>` +
        `<div class="tooltip__clan-descr">${clan.descr}</div>` +
        `<div class="tooltip__clan-mastery">COMBAT MASTERY RATING: ${clan.mastery}</div>`,
        e);
    });
    card.addEventListener('mousemove', positionTooltip);
    card.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));

    container.appendChild(card);
  }

  // Sync mobile clan bar (re-bind clicks since innerHTML clone loses listeners)
  const mobileBar = document.getElementById('mobile-clan-bar');
  if (mobileBar) {
    mobileBar.innerHTML = '';
    // Close handle lip at the top of the bar
    const clanBarHandle = document.createElement('div');
    clanBarHandle.className = 'clan-bar-handle';
    clanBarHandle.innerHTML = '<div class="clan-bar-handle__drag"></div><button class="clan-bar-handle__close" aria-label="Close clan selector"><img src="assets/N_Textures/HUD/EnemyStatus/T_UI_HUD_EnemyStatus_Position_Patrolling.png" alt="" aria-hidden="true"></button>';
    clanBarHandle.querySelector('.clan-bar-handle__close').addEventListener('click', () => mobileBar.classList.remove('is-open'));
    mobileBar.appendChild(clanBarHandle);
    for (const clanId of CLAN_ORDER) {
      const clan = CLANS[clanId];
      const isCompleted = state.completedClans.has(clanId);
      const isSelected  = state.selectedClan === clanId;
      const card = document.createElement('div');
      card.className = 'clan-card' +
        (isSelected ? ' selected' : '') +
        (isCompleted ? ' completed' : '');
      const logoSrc = isCompleted ? clan.logoCompleted : clan.logo;
      let cardHtml = `<img class="clan-card__logo" src="${logoSrc}" alt="${clan.name}">
        <div class="clan-card__name">${clan.name}</div>`;
      // Floating affinity chip above the currently-selected clan
      if (isSelected && clan.affinities && clan.affinities.length) {
        let chipHtml = '<div class="clan-card__affinity-chip" aria-label="Affinities">';
        for (const a of clan.affinities) {
          chipHtml += `<span class="affinity-badge is-affinity clan-card__affinity-badge" data-discipline="${a}">
            <img class="affinity-badge__icon" src="${DISCIPLINES[a].icon}" alt="${DISCIPLINES[a].name}">
            <span class="clan-card__affinity-name">${DISCIPLINES[a].name}</span>
          </span>`;
        }
        chipHtml += '</div>';
        cardHtml = chipHtml + cardHtml;
      }
      card.innerHTML = cardHtml;
      // Tap-to-select; tap-again-when-selected toggles completed
      card.addEventListener('click', () => {
        if (state.selectedClan === clanId) {
          // Toggle completed state on second tap
          if (state.completedClans.has(clanId)) {
            state.completedClans.delete(clanId);
          } else {
            state.completedClans.add(clanId);
          }
          if (typeof _clearMobileContext === 'function') _clearMobileContext();
          persistState();
          renderClanSelector();
          if (typeof renderGrid === 'function') renderGrid();
          if (typeof refreshFabienPage === 'function') refreshFabienPage();
        } else {
          selectClan(clanId);
        }
      });
      mobileBar.appendChild(card);
    }
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
  if (typeof _clearMobileContext === 'function') _clearMobileContext();

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
      showTooltip(`<div class="tooltip__name">${row.title}</div>`, e);
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
    // Right-click resets the clan (desktop only). On mobile, the native\n    // contextmenu fires from a long-press \u2014 don't reset, since long-press is\n    // now the \"progress whole clan\" gesture.\n    header.addEventListener(\"contextmenu\", (e) => {\n      e.preventDefault();\n      if (document.body.classList.contains('is-mobile')) return;\n      resetClanAbilities(clanId);\n    });

    // Long-press (touch) on the header = progress the whole clan as far as
    // it can go (mirrors the desktop single-click behaviour).
    let _hdrLongPressTimer = null;
    header.addEventListener('touchstart', () => {
      _hdrLongPressTimer = setTimeout(() => {
        _hdrLongPressTimer = null;
        window.__clanHeaderLongPressAt = Date.now();
        purchaseClanAbilities(clanId);
      }, 500);
    }, { passive: true });
    header.addEventListener('touchmove', () => {
      if (_hdrLongPressTimer) { clearTimeout(_hdrLongPressTimer); _hdrLongPressTimer = null; }
    }, { passive: true });
    header.addEventListener('touchend', () => {
      if (_hdrLongPressTimer) { clearTimeout(_hdrLongPressTimer); _hdrLongPressTimer = null; }
    }, { passive: true });
    header.addEventListener('touchcancel', () => {
      if (_hdrLongPressTimer) { clearTimeout(_hdrLongPressTimer); _hdrLongPressTimer = null; }
    }, { passive: true });
    // Suppress the synthetic click that follows a long-press. Global
    // timestamp so it survives the renderGrid() that the long-press triggers.
    header.addEventListener('click', (e) => {
      if (window.__clanHeaderLongPressAt && (Date.now() - window.__clanHeaderLongPressAt) < 800) {
        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }, true);

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
      showTooltip(headerTooltip, e);
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
      if (document.body.classList.contains('is-mobile')) {
        // Pre-render detail into sheet body (ready) and show the hint pill
        const sheetBody = document.getElementById('mobile-sheet-body');
        if (sheetBody) renderDetailPanel(sheetBody);
        showMobileDetailHint(clanId, tier);
      }
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

  // Long-press (mobile only) = always progress the ability forward.
  // The flag is on `window` so it survives the renderGrid() that replaces
  // this cell DOM; the synthetic click that follows the touch release will
  // land on the freshly rendered cell, whose closure-local flag would
  // otherwise be reset.
  let _longPressTimer = null;

  cell.addEventListener('touchstart', () => {
    _longPressTimer = setTimeout(() => {
      _longPressTimer = null;
      window.__abilityLongPressAt = Date.now();
      handleAbilityClick(clanId, tier);
      state.focusedAbility = { type: 'ability', clanId, tier };
      applyFocusedSelection();
      // handleAbilityClick already calls renderGrid + updateCosts.
      if (document.body.classList.contains('is-mobile') && typeof showMobileDetailHint === 'function') {
        showMobileDetailHint(clanId, tier);
      }
    }, 500);
  }, { passive: true });

  cell.addEventListener('touchmove', () => {
    if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
  }, { passive: true });

  cell.addEventListener('touchend', () => {
    if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
  }, { passive: true });
  cell.addEventListener('touchcancel', () => {
    if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
  }, { passive: true });

  // Click handler
  cell.addEventListener("click", (e) => {
    // Suppress the synthetic click that fires after a long-press. Uses a
    // global timestamp so the suppression survives the renderGrid() that
    // happens inside the long-press handler.
    if (window.__abilityLongPressAt && (Date.now() - window.__abilityLongPressAt) < 800) {
      e.stopImmediatePropagation();
      e.preventDefault();
      return;
    }
    state.focusedAbility = { type: 'ability', clanId, tier };
    if (document.body.classList.contains('is-mobile')) {
      applyFocusedSelection();
      const sheetBody   = document.getElementById('mobile-sheet-body');
      const actionsHtml = buildMobileAbilityActions(clanId, tier);
      if (sheetBody) {
        renderDetailPanel(sheetBody);
        // Stage actions for when the user opens the sheet
        const acts = document.getElementById('mobile-sheet-actions');
        if (acts) acts.innerHTML = actionsHtml || '';
      }
      // Don't auto-open the sheet — show the hint pill instead so quick tapping
      // doesn't constantly pop the drawer.
      showMobileDetailHint(clanId, tier);
    } else {
      handleAbilityClick(clanId, tier);
      applyFocusedSelection();
      renderDetailPanel();
    }
  });

  // Tooltip
  const tooltipContent = buildTooltipContent(clanId, tier, ability, abilityState);
  cell.addEventListener('mouseenter', (e) => {
    showTooltip(tooltipContent, e);
  });
  cell.addEventListener('mousemove', positionTooltip);
  cell.addEventListener('mouseleave', () => {
    sharedTooltip.classList.remove('tooltip--visible');
  });

  // Right-click to undo (desktop only). On mobile, a long-press fires the
  // native `contextmenu` event — we don't want that to undo the ability,
  // since long-press is now the "always progress forward" gesture.
  cell.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    if (document.body.classList.contains('is-mobile')) return;
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
  // Passives are always locked (clan-granted, not user-progressable)
  if (tier === 'passive') return false;

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

  // Sync mobile stats strip
  const mAp  = document.getElementById('m-ap-total');
  const mSan = document.getElementById('m-res-san');
  const mMel = document.getElementById('m-res-mel');
  const mCho = document.getElementById('m-res-cho');
  if (mAp)  mAp.textContent  = totalAP;
  if (mSan) mSan.textContent = totalSan.toLocaleString();
  if (mMel) mMel.textContent = totalMel.toLocaleString();
  if (mCho) mCho.textContent = totalCho.toLocaleString();

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
  if (document.body.classList.contains('is-mobile') && state.focusedAbility) {
    // Pre-render detail into sheet body and show hint pill
    const sheetBody = document.getElementById('mobile-sheet-body');
    if (sheetBody) renderDetailPanel(sheetBody);
    showMobileDetailHintForCCT(cctKey);
  } else {
    renderDetailPanel();
  }
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

function renderDetailPanel(targetEl) {
  const panel = targetEl || document.getElementById("detail-panel");

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

  // Status / action row — desktop only; mobile gets this in the fixed actions bar
  if (panel.id !== 'mobile-sheet-body') {
    const _statusLabel = abilityState ? abilityState.charAt(0).toUpperCase() + abilityState.slice(1) : '';
    const _canAwakenNow = !isPassive && abilityState === 'locked' && typeof canAwaken === 'function' && canAwaken(clanId, tier);
    const _canUnlockNow = !isPassive && abilityState === 'awakened' && typeof canUnlock === 'function' && canUnlock(clanId, tier);
    const _canProgress = _canAwakenNow || _canUnlockNow;
    const _hintText = _canAwakenNow ? 'Tap to awaken' : _canUnlockNow ? 'Tap to unlock' : '';
    html += `<div class="ability-status-row">`;
    if (!isPassive && abilityState && abilityState !== 'locked') {
      html += `<button class="ability-status-row__reset" data-reset-clan="${clanId}" data-reset-tier="${tier}" aria-label="Reset ability">↺</button>`;
    }
    html += `<button class="ability-status-row__main ability-status-row__main--${abilityState}"${!_canProgress ? ' disabled' : ''} data-advance-clan="${clanId}" data-advance-tier="${tier}">`;
    html += `<span class="ability-status-row__label">${_statusLabel}</span>`;
    if (_hintText) html += `<span class="ability-status-row__hint">${_hintText}</span>`;
    html += `</button>`;
    html += `</div>`;
  }

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

  // Status row handlers (inline reset + advance)
  const _refreshSiblingPanel = () => {
    if (panel.id !== 'detail-panel') {
      const dp = document.getElementById('detail-panel');
      if (dp) renderDetailPanel(dp);
    } else {
      const sb = document.getElementById('mobile-sheet-body');
      if (sb && document.body.classList.contains('is-mobile')) renderDetailPanel(sb);
    }
    if (state.focusedAbility && state.focusedAbility.type === 'ability') {
      const sa = document.getElementById('mobile-sheet-actions');
      if (sa) sa.innerHTML = buildMobileAbilityActions(state.focusedAbility.clanId, state.focusedAbility.tier);
    }
  };
  // Status row listeners — desktop panel only (mobile uses the delegated sheetActions handler)
  if (panel.id !== 'mobile-sheet-body') {
    const statusReset = panel.querySelector('.ability-status-row__reset');
    if (statusReset) {
      statusReset.addEventListener('click', () => {
        handleAbilityUndo(statusReset.dataset.resetClan, statusReset.dataset.resetTier);
        renderDetailPanel(panel);
        _refreshSiblingPanel();
      });
    }
    const statusAdvance = panel.querySelector('.ability-status-row__main:not([disabled])');
    if (statusAdvance) {
      statusAdvance.addEventListener('click', () => {
        handleAbilityClick(statusAdvance.dataset.advanceClan, statusAdvance.dataset.advanceTier);
        renderDetailPanel(panel);
        _refreshSiblingPanel();
      });
    }
  }

  // Noise-warn tooltip (Unseen Passage easter egg)
  panel.querySelectorAll('.masq-val-noise-warn').forEach(el => {
    el.addEventListener('mouseenter', (e) => {
      showTooltip(`<div class="tooltip__name" style="color:var(--red)">WHY THE F#$% IS THIS AS NOISY AS VAMPIRIC SPRINT?!1</div>`, e);
    });
    el.addEventListener('mousemove', positionTooltip);
    el.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));
  });

  // Masquerade section header tooltip
  const masqSummary = panel.querySelector('.detail-panel__masq-summary');
  if (masqSummary) {
    masqSummary.addEventListener('mouseenter', (e) => {
      showTooltip(`<div class="tooltip__name">Masquerade Impact</div><div class="tooltip__desc">Denotes when this ability use is witnessed — some abilities are safe provided no NPCs or cops see you.</div>`, e);
    });
    masqSummary.addEventListener('mousemove', positionTooltip);
    masqSummary.addEventListener('mouseleave', () => sharedTooltip.classList.remove('tooltip--visible'));
  }

  // Trainer badge tooltip
  const trainerBadge = panel.querySelector('.detail-panel__trainer');
  if (trainerBadge) {
    trainerBadge.addEventListener('mouseenter', (e) => {
      showTooltip(`<div class="tooltip__name">${trainerBadge.dataset.trainerPos}</div>`, e);
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
    showTooltip(buildCCTTooltip(name, isUnlocked, clanName), e);
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
    showTooltip(`<div class="tooltip__name">Clan Completion Talents</div>`, e);
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
  if (typeof updateMobileChrome === "function") updateMobileChrome();
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
  if (typeof updateMobileChrome === "function") updateMobileChrome();
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

// ── Mobile Shell (Phases 1–6) ─────────────────────────────────

const mobileSheetState = { isOpen: false, snap: 'closed' };

// ── Mobile Detail Hint Pill ──────────────────────────────────
// Floats above the bottom tab bar to advertise that a description is
// queued in the bottom sheet. User taps to open the full sheet — this
// avoids the sheet auto-opening on every quick tap through the tree.
function showMobileDetailHintForCCT(cctKey) {
  const hint = document.getElementById('mobile-detail-hint');
  if (!hint) return;
  const titleEl = document.getElementById('mobile-detail-hint-title');
  const iconEl  = document.getElementById('mobile-detail-hint-icon');

  let title = '';
  let icon  = '';
  try {
    if (cctKey === 'bloodHeal') {
      const allCompleted = CLAN_ORDER.every(id => state.completedClans.has(id));
      title = allCompleted ? BLOOD_HEAL_TALENT.nameCompleted : BLOOD_HEAL_TALENT.name;
      icon  = BLOOD_HEAL_TALENT.icon;
    } else {
      const talent = COMPLETION_TALENTS[cctKey];
      if (talent) {
        title = talent.name;
        icon  = talent.icon;
      }
    }
  } catch (e) { /* fall through */ }

  if (titleEl) titleEl.textContent = title || 'Details ready';
  if (iconEl) {
    if (icon) { iconEl.src = icon; iconEl.style.display = ''; }
    else { iconEl.style.display = 'none'; }
  }
  hint.dataset.sheetTitle = title || '';
  // Non-ability context — no status to show
  const _statusEl = document.getElementById('mobile-detail-hint-status');
  if (_statusEl) {
    _statusEl.textContent = '';
    _statusEl.classList.remove('is-locked', 'is-awakened', 'is-unlocked');
  }
  hint.hidden = false;
  hint.classList.remove('is-visible');
  void hint.offsetWidth;
  hint.classList.add('is-visible');
}

function showMobileDetailHint(clanId, tier) {
  const hint = document.getElementById('mobile-detail-hint');
  if (!hint) return;
  const titleEl = document.getElementById('mobile-detail-hint-title');
  const iconEl  = document.getElementById('mobile-detail-hint-icon');

  let title = '';
  let icon  = '';
  try {
    if (clanId && tier && typeof CLANS !== 'undefined' && CLANS[clanId]) {
      const clan    = CLANS[clanId];
      const ability = (typeof ABILITIES !== 'undefined' && ABILITIES[clanId]) ? ABILITIES[clanId][tier] : null;
      if (tier === 'perk') {
        title = `${clan.name} — Perk`;
        icon  = clan.logo;
      } else if (ability) {
        title = ability.name || tier;
        icon  = ability.icon || clan.logo;
      } else {
        title = clan.name;
        icon  = clan.logo;
      }
    }
  } catch (e) { /* fall through to defaults */ }

  if (titleEl) titleEl.textContent = title || 'Details ready';
  if (iconEl) {
    if (icon) {
      iconEl.src = icon;
      iconEl.style.display = '';
    } else {
      iconEl.style.display = 'none';
    }
  }
  hint.dataset.sheetTitle = title || '';
  hint.dataset.hintClanId  = clanId  || '';
  hint.dataset.hintTier    = tier    || '';

  // Update minus / plus button states
  const minusBtn = document.getElementById('mobile-detail-hint-minus');
  const plusBtn  = document.getElementById('mobile-detail-hint-plus');
  const statusEl = document.getElementById('mobile-detail-hint-status');
  if (minusBtn && plusBtn) {
    const key         = `${clanId}:${tier}`;
    const curState    = state.abilities[key];
    const canReset    = !!(curState && curState !== 'locked');
    const canAwakenNow = curState === 'locked' && typeof canAwaken === 'function' && canAwaken(clanId, tier);
    const canUnlockNow = curState === 'awakened' && typeof canUnlock === 'function' && canUnlock(clanId, tier);
    const canProgress  = canAwakenNow || canUnlockNow;
    const isFullyDone  = curState === 'unlocked';

    minusBtn.disabled = !canReset;

    plusBtn.disabled = !canProgress;
    plusBtn.classList.remove('can-progress', 'is-done');
    if (isFullyDone)      plusBtn.classList.add('is-done');
    else if (canProgress) plusBtn.classList.add('can-progress');

    if (statusEl) {
      // Show the current ability state (Locked / Awakened / Unlocked) in
      // the slot vacated by the old "Tap to view details" CTA.
      const label = curState ? (curState.charAt(0).toUpperCase() + curState.slice(1)) : 'Locked';
      statusEl.textContent = label;
      statusEl.classList.remove('is-locked', 'is-awakened', 'is-unlocked');
      statusEl.classList.add(`is-${curState || 'locked'}`);
    }
  } else if (statusEl) {
    statusEl.textContent = '';
    statusEl.classList.remove('is-locked', 'is-awakened', 'is-unlocked');
  }

  // Remove hidden attr and re-trigger the slide-in animation each time
  hint.hidden = false;
  hint.classList.remove('is-visible');
  // Force reflow so the animation restarts when class is re-added
  void hint.offsetWidth;
  hint.classList.add('is-visible');
}

function hideMobileDetailHint() {
  const hint = document.getElementById('mobile-detail-hint');
  if (!hint) return;
  hint.classList.remove('is-visible');
  hint.hidden = true;
}

// Generic hint pill display for non-Phyre callers (Benny / Fabien).
// Pass a title and icon; the pill will open the sheet on tap (sheet body
// must already have been pre-rendered by the caller).
function showMobileDetailHintRaw(title, icon) {
  const hint = document.getElementById('mobile-detail-hint');
  if (!hint) return;
  const titleEl = document.getElementById('mobile-detail-hint-title');
  const iconEl  = document.getElementById('mobile-detail-hint-icon');
  if (titleEl) titleEl.textContent = title || 'Details ready';
  if (iconEl) {
    if (icon) { iconEl.src = icon; iconEl.style.display = ''; }
    else { iconEl.style.display = 'none'; }
  }
  hint.dataset.sheetTitle = title || '';
  hint.dataset.hintClanId  = '';
  hint.dataset.hintTier    = '';
  // Disable plus/minus — no ability context in raw mode
  const _mb = document.getElementById('mobile-detail-hint-minus');
  const _pb = document.getElementById('mobile-detail-hint-plus');
  if (_mb) { _mb.disabled = true; }
  if (_pb) { _pb.disabled = true; _pb.classList.remove('can-progress', 'is-done'); }

  // Non-ability context — clear any stale Phyre-ability focus and wipe the
  // sheet action row so the previous clan's stepper buttons don't leak in.
  if (state && state.focusedAbility && state.focusedAbility.type === 'ability') {
    state.focusedAbility = null;
  }
  const _sa = document.getElementById('mobile-sheet-actions');
  if (_sa) _sa.innerHTML = '';

  hint.hidden = false;
  hint.classList.remove('is-visible');
  void hint.offsetWidth;
  hint.classList.add('is-visible');
}

// Bind the hint pill once on load
document.addEventListener('DOMContentLoaded', () => {
  const hint = document.getElementById('mobile-detail-hint');
  if (!hint) return;

  // Centre body: open the sheet
  const hintBody = document.getElementById('mobile-detail-hint-body');
  if (hintBody) {
    hintBody.addEventListener('click', () => {
      const stagedTitle = hint.dataset.sheetTitle || '';
      openMobileSheet(undefined, undefined, stagedTitle);
      hideMobileDetailHint();
    });
  }

  // Helper: refresh grid, hint pill buttons, and sheet if open
  function _hintRefresh(clanId, tier) {
    renderGrid();
    updateCosts();
    showMobileDetailHint(clanId, tier);
    const sheetBody = document.getElementById('mobile-sheet-body');
    if (sheetBody) renderDetailPanel(sheetBody);
    const acts = document.getElementById('mobile-sheet-actions');
    if (acts) acts.innerHTML = buildMobileAbilityActions(clanId, tier);
  }

  // Minus button: undo one step
  const hintMinus = document.getElementById('mobile-detail-hint-minus');
  if (hintMinus) {
    hintMinus.addEventListener('click', (e) => {
      e.stopPropagation();
      const clanId = hint.dataset.hintClanId;
      const tier   = hint.dataset.hintTier;
      if (!clanId || !tier) return;
      handleAbilityUndo(clanId, tier);
      _hintRefresh(clanId, tier);
    });
  }

  // Plus button: advance one step
  const hintPlus = document.getElementById('mobile-detail-hint-plus');
  if (hintPlus) {
    hintPlus.addEventListener('click', (e) => {
      e.stopPropagation();
      const clanId = hint.dataset.hintClanId;
      const tier   = hint.dataset.hintTier;
      if (!clanId || !tier) return;
      handleAbilityClick(clanId, tier);
      _hintRefresh(clanId, tier);
    });
  }
});

function setMobileSheetTitle(text) {
  const el = document.getElementById('mobile-sheet-title');
  if (el) el.textContent = text || '';
  _refreshMobileSheetHeader();
}

function setMobileSheetBack(fn) {
  const btn = document.getElementById('mobile-sheet-back');
  if (!btn) return;
  btn._backFn = fn || null;
  btn.hidden = !fn;
  _refreshMobileSheetHeader();
}

function _refreshMobileSheetHeader() {
  const header = document.getElementById('mobile-sheet-header');
  const title  = document.getElementById('mobile-sheet-title');
  const back   = document.getElementById('mobile-sheet-back');
  if (!header) return;
  const hasTitle = !!(title && title.textContent.trim());
  const hasBack  = !!(back && !back.hidden);
  header.classList.toggle('is-empty', !hasTitle && !hasBack);
}

function openMobileSheet(htmlContent, actionsHtml, title) {
  const sheet = document.getElementById('mobile-sheet');
  const body  = document.getElementById('mobile-sheet-body');
  const acts  = document.getElementById('mobile-sheet-actions');
  const scrim = document.getElementById('mobile-sheet-scrim');
  if (!sheet) return;

  if (htmlContent !== undefined && body) {
    body.innerHTML = htmlContent;
    _bindSheetBodyEvents(body);
  }
  // Only update the actions bar when explicitly provided; passing undefined preserves staged content
  if (actionsHtml !== undefined && acts) {
    acts.innerHTML = actionsHtml;
  }
  setMobileSheetTitle(title || '');
  setMobileSheetBack(null);

  if (scrim) scrim.classList.remove('hidden');
  sheet.dataset.snap = 'default';

  // Push a history entry so the back button can dismiss the sheet
  if (!mobileSheetState.isOpen) {
    history.pushState({ mobileSheet: true }, '');
  }

  mobileSheetState.isOpen = true;
  mobileSheetState.snap   = 'default';
}

function closeMobileSheet() {
  const sheet = document.getElementById('mobile-sheet');
  const scrim = document.getElementById('mobile-sheet-scrim');
  if (!sheet) return;
  sheet.dataset.snap = 'closed';
  if (scrim) scrim.classList.add('hidden');

  // If we own the top history entry, go back to remove it
  if (mobileSheetState.isOpen && history.state && history.state.mobileSheet) {
    history.back();
  }

  mobileSheetState.isOpen = false;
  mobileSheetState.snap   = 'closed';

  if (typeof hideMobileDetailHint === 'function') hideMobileDetailHint();
}

function _bindSheetBodyEvents(body) {
  // Video lightbox
  body.querySelectorAll('.detail-panel__video video').forEach(vid => {
    vid.style.cursor = 'pointer';
    vid.addEventListener('click', () => {
      if (typeof openVideoLightbox === 'function') openVideoLightbox(vid.dataset.videoSrc);
    });
  });
  body.querySelectorAll('.detail-panel__video-expand').forEach(btn => {
    const vid = btn.parentElement && btn.parentElement.querySelector('video');
    if (vid) btn.addEventListener('click', () => {
      if (typeof openVideoLightbox === 'function') openVideoLightbox(vid.dataset.videoSrc);
    });
  });
  // Outfit link
  const outfitBtn = body.querySelector('.detail-panel__outfit-btn');
  if (outfitBtn) {
    outfitBtn.addEventListener('click', () => {
      if (typeof navigateToOutfit === 'function') {
        navigateToOutfit(outfitBtn.dataset.clan, parseInt(outfitBtn.dataset.idx, 10));
        closeMobileSheet();
      }
    });
  }
  // Combo links
  body.querySelectorAll('.detail-panel__combo-link').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof navigateToCombos === 'function') navigateToCombos(btn.dataset.comboId);
      closeMobileSheet();
    });
  });
}

function buildMobileAbilityActions(clanId, tier) {
  if (tier === 'passive') return '';
  const key = `${clanId}:${tier}`;
  const curState = state.abilities[key];
  const statusLabel = curState ? curState.charAt(0).toUpperCase() + curState.slice(1) : '';
  const canAwakenNow = curState === 'locked' && typeof canAwaken === 'function' && canAwaken(clanId, tier);
  const canUnlockNow = curState === 'awakened' && typeof canUnlock === 'function' && canUnlock(clanId, tier);
  const canProgress = canAwakenNow || canUnlockNow;
  const canReset = curState && curState !== 'locked';
  const isFullyDone = curState === 'unlocked';
  const hintText = canAwakenNow ? 'Tap + to awaken' : canUnlockNow ? 'Tap + to unlock' : '';
  let html = `<div class="ability-status-row" style="margin-top:0; width:100%;">`;
  html += `<button class="ability-status-row__minus mobile-sheet__action-btn" id="sheet-reset-btn" data-reset-clan="${clanId}" data-reset-tier="${tier}" aria-label="Decrease"${!canReset ? ' disabled' : ''}>−</button>`;
  html += `<div class="ability-status-row__status ability-status-row__status--${curState}">`;
  html += `<span class="ability-status-row__label">${statusLabel}</span>`;
  if (hintText) html += `<span class="ability-status-row__hint">${hintText}</span>`;
  html += `</div>`;
  const plusClasses = ['ability-status-row__plus', 'mobile-sheet__action-btn'];
  if (canProgress) plusClasses.push('can-progress');
  if (isFullyDone) plusClasses.push('is-done');
  html += `<button class="${plusClasses.join(' ')}" id="sheet-progress-btn" data-advance-clan="${clanId}" data-advance-tier="${tier}" aria-label="Advance"${!canProgress ? ' disabled' : ''}>+</button>`;
  html += `</div>`;
  return html;
}

function renderMobileInnateStrip() {
  const strip = document.getElementById('mobile-innate-strip');
  if (!strip) return;

  const activePrimary   = document.querySelector('.tab-bar--primary .tab-bar__tab.active');
  const activeSecondary = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab.active');
  const isPhyreSkillTree = activePrimary && activePrimary.dataset.tab === 'phyre'
                        && activeSecondary && activeSecondary.dataset.subtab === 'skilltree';

  if (!isPhyreSkillTree) { strip.innerHTML = ''; return; }

  const hasActive = phyreInnateState.focused !== null;

  strip.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'mobile-innate-toggle' + (hasActive ? ' is-active' : '');
  btn.title = 'Innate abilities';
  btn.innerHTML = `<img src="assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_ClanLogo_PhyreMark.png" alt="Innates">`;

  btn.addEventListener('click', _openInnatePickerSheet);

  strip.appendChild(btn);
}

function _openInnatePickerSheet() {
  let html = '<div class="mobile-innate-picker">';
  PHYRE_INNATE_ITEMS.forEach(item => {
    const iconSrc = typeof item.icon === 'function' ? item.icon() : item.icon;
    const isSelected = phyreInnateState.focused === item.id;
    html += `<button class="mobile-innate-picker__item${isSelected ? ' is-active' : ''}" data-innate-id="${item.id}">`;
    if (iconSrc) html += `<img src="${iconSrc}" alt="">`;
    html += `<span>${item.title}</span></button>`;
  });
  html += '</div>';

  openMobileSheet(html, '', 'Innate Abilities');

  const sheetBody = document.getElementById('mobile-sheet-body');
  if (sheetBody) {
    sheetBody.querySelectorAll('.mobile-innate-picker__item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.innateId;
        const isSame = phyreInnateState.focused === id;
        phyreInnateState.focused = isSame ? null : id;
        state.focusedAbility = null;
        renderMobileInnateStrip();
        renderPhyreInnateItems();
        if (phyreInnateState.focused) {
          renderPhyreInnateDetail(sheetBody);
          const _item = PHYRE_INNATE_ITEMS.find(i => i.id === phyreInnateState.focused);
          setMobileSheetTitle(_item ? _item.title : '');
          setMobileSheetBack(_openInnatePickerSheet);
        } else {
          closeMobileSheet();
        }
      });
    });
  }
}

function renderMobileBennyFeatureStrip() {
  const strip = document.getElementById('mobile-benny-feature-strip');
  if (!strip) return;
  const activePrimary = document.querySelector('.tab-bar--primary .tab-bar__tab.active');
  if (!activePrimary || activePrimary.dataset.tab !== 'benny') { strip.innerHTML = ''; return; }

  const hasActive = bennyState.sidebarFocused !== null;
  strip.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'mobile-innate-toggle' + (hasActive ? ' is-active' : '');
  btn.title = 'New Features';
  btn.innerHTML = `<img src="assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_BennyLogo.png" alt="New Features">`;

  btn.addEventListener('click', _openBennyPickerSheet);

  strip.appendChild(btn);
}

function _openBennyPickerSheet() {
  let html = '<div class="mobile-innate-picker">';
  BENNY_SIDEBAR_ITEMS.forEach(item => {
    const isSelected = bennyState.sidebarFocused === item.id;
    html += `<button class="mobile-innate-picker__item${isSelected ? ' is-active' : ''}" data-benny-item="${item.id}">`;
    if (item.icon) html += `<img src="${item.icon}" alt="">`;
    html += `<span>${item.title}</span></button>`;
  });
  html += '</div>';
  openMobileSheet(html, '', 'New Features');

  const sheetBody = document.getElementById('mobile-sheet-body');
  if (sheetBody) {
    sheetBody.querySelectorAll('.mobile-innate-picker__item').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.bennyItem;
        const isSame = bennyState.sidebarFocused === id;
        bennyState.sidebarFocused = isSame ? null : id;
        bennyState.focused = null;
        renderBennySidebarItems();
        renderMobileBennyFeatureStrip();
        if (bennyState.sidebarFocused) {
          renderBennyDetail(sheetBody);
          const _item = BENNY_SIDEBAR_ITEMS.find(i => i.id === bennyState.sidebarFocused);
          setMobileSheetTitle(_item ? _item.title : '');
          setMobileSheetBack(_openBennyPickerSheet);
        } else {
          closeMobileSheet();
        }
      });
    });
  }
}

function renderMobileFabienFeatureStrip() {
  const strip = document.getElementById('mobile-fabien-feature-strip');
  if (!strip) return;
  const activePrimary = document.querySelector('.tab-bar--primary .tab-bar__tab.active');
  if (!activePrimary || activePrimary.dataset.tab !== 'fabien') { strip.innerHTML = ''; return; }

  const hasActive = fabienState.notesCardFocused;
  strip.innerHTML = '';
  const btn = document.createElement('button');
  btn.className = 'mobile-innate-toggle' + (hasActive ? ' is-active' : '');
  btn.title = 'Phlegmatic Resonance';
  btn.innerHTML = `<img src="assets/N_Textures/General/T_UI_Icon_PhlegmaticSymbol.png" alt="Detective Notes" style="filter:brightness(0) invert(44%) sepia(1) saturate(6) hue-rotate(148deg) brightness(0.9);">`;

  btn.addEventListener('click', () => {
    fabienState.notesCardFocused = !fabienState.notesCardFocused;
    fabienState.focusedIndex = null;
    renderFabienTree();
    renderMobileFabienFeatureStrip();
    if (fabienState.notesCardFocused) {
      const sheetBody = document.getElementById('mobile-sheet-body');
      if (sheetBody) renderFabienDetail(sheetBody);
      openMobileSheet(undefined, undefined, 'Detective Notes');
    } else {
      closeMobileSheet();
    }
  });

  strip.appendChild(btn);
}

// Clear mobile-only UI state (focused selection, open sheet, detail hint pill)
// when the user switches tabs / subtabs / clans. Safe to call on desktop too.
function _clearMobileContext() {
  if (typeof state !== 'undefined') state.focusedAbility = null;
  if (typeof outfitState !== 'undefined') outfitState.focusedOutfit = null;
  if (typeof closeMobileSheet === 'function') closeMobileSheet();
  if (typeof hideMobileDetailHint === 'function') hideMobileDetailHint();
}

function buildMobileSubtabBar(activeTab) {
  const bar = document.getElementById('mobile-subtab-bar');
  if (!bar) return;
  bar.innerHTML = '';

  let origTabs;
  let backTarget = null; // when set, render a back button that clicks this tab
  if (activeTab === 'phyre') {
    // Check which secondary subpage is active — combos/pickups have their own inner tabs
    const activeSecondary = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab.active');
    const activeSub = activeSecondary ? activeSecondary.dataset.subtab : null;
    if (activeSub === 'combos') {
      origTabs = document.querySelectorAll('.tab-bar--combos .tab-bar__tab');
      backTarget = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab[data-subtab="skilltree"]');
    } else if (activeSub === 'pickups') {
      origTabs = document.querySelectorAll('.tab-bar--pickups .tab-bar__tab');
      backTarget = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab[data-subtab="skilltree"]');
    } else {
      origTabs = document.querySelectorAll('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab');
    }
  } else if (activeTab === 'fabien') {
    origTabs = document.querySelectorAll('.tab-bar--fabien .tab-bar__tab');
  } else if (activeTab === 'benny') {
    origTabs = document.querySelectorAll('.tab-bar--benny .tab-bar__tab');
  }
  if (!origTabs || origTabs.length === 0) return;

  // Back button — return to the parent subtab bar (e.g. from Combos inner tabs back to Skill Tree / Outfits / Combos / Pickups)
  if (backTarget) {
    const backBtn = document.createElement('button');
    backBtn.className = 'mobile-subtab-back';
    backBtn.setAttribute('aria-label', 'Back to main tabs');
    backBtn.title = 'Back';
    backBtn.innerHTML = '&#x2039;'; // ‹
    backBtn.addEventListener('click', () => {
      backTarget.click();
      requestAnimationFrame(updateMobileChrome);
    });
    bar.appendChild(backBtn);
  }

  origTabs.forEach(origTab => {
    // Skip tabs that are hidden in the desktop UI (e.g. the MAHA pickups tab
    // is only revealed when the "Make a Haven a Home" mod toggle is enabled).
    if (origTab.classList.contains('hidden')) return;
    const pill = document.createElement('button');
    const subtabId = origTab.dataset.subtab;
    const hasDeepNav = subtabId === 'combos' || subtabId === 'pickups';
    pill.className = 'mobile-subtab-pill' + (origTab.classList.contains('active') ? ' is-active' : '') + (hasDeepNav ? ' has-deep-nav' : '');
    if (hasDeepNav) {
      pill.innerHTML = origTab.textContent.trim() + ' <span class="subtab-pill__arrow" aria-hidden="true">&#x203A;</span>';
    } else {
      pill.textContent = origTab.textContent.trim();
    }
    pill.addEventListener('click', () => {
      origTab.click();
      requestAnimationFrame(updateMobileChrome);
    });
    bar.appendChild(pill);
  });
}

function updateMobileChrome() {
  if (!document.body.classList.contains('is-mobile')) return;

  // Sync bottom tab active state
  const activePrimary = document.querySelector('.tab-bar--primary .tab-bar__tab.active');
  const activeTab = activePrimary ? activePrimary.dataset.tab : null;
  document.querySelectorAll('.mobile-bottom-tab[data-mobile-tab]').forEach(btn => {
    btn.classList.toggle('is-active', btn.dataset.mobileTab === activeTab);
  });

  // Hide the detail hint pill when changing tabs (stale focus)
  if (typeof hideMobileDetailHint === 'function') hideMobileDetailHint();

  // App-bar title is static ("VTMB2 Skill Calculator") — page context comes from the bottom tabs.

  // Build subtab pills
  buildMobileSubtabBar(activeTab);

  // Update mobile stats strip costs display
  _syncMobileStats();

  // Update innate strip
  renderMobileInnateStrip();
  renderMobileBennyFeatureStrip();
  renderMobileFabienFeatureStrip();

  // Show/hide stats strip based on active subpage
  const statsStrip = document.getElementById('mobile-stats-strip');
  if (statsStrip) {
    const activeSecondary = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab.active');
    const isPhyreTree = activeTab === 'phyre' && activeSecondary && activeSecondary.dataset.subtab === 'skilltree';
    statsStrip.style.display = isPhyreTree ? '' : 'none';
  }
}

function _syncMobileStats() {
  const apEl  = document.getElementById('m-ap-total');
  const sanEl = document.getElementById('m-res-san');
  const melEl = document.getElementById('m-res-mel');
  const choEl = document.getElementById('m-res-cho');
  if (apEl)  apEl.textContent  = document.getElementById('ap-total')  ? document.getElementById('ap-total').textContent  : '0';
  if (sanEl) sanEl.textContent = document.getElementById('res-san')   ? document.getElementById('res-san').textContent   : '0';
  if (melEl) melEl.textContent = document.getElementById('res-mel')   ? document.getElementById('res-mel').textContent   : '0';
  if (choEl) choEl.textContent = document.getElementById('res-cho')   ? document.getElementById('res-cho').textContent   : '0';
}

function initMobileShell() {
  // ── Body class management ─────────────────────────────
  // Drop any leftover localStorage 'forced-layout' (old persistent override).
  // sessionStorage now owns the override so auto-detect works each new session.
  if (localStorage.getItem('forced-layout')) {
    localStorage.removeItem('forced-layout');
  }
  // Phone / narrow-portrait: width <= 900 (covers iPhones, iPad Pro 11" portrait,
  // Zenbook Fold portrait ~853w, etc.) OR height <= 500 (landscape phone).
  const mq768   = window.matchMedia('(max-width: 900px), (max-height: 500px)');
  const mq1023  = window.matchMedia('(max-width: 1023px)');
  const mqLand  = window.matchMedia('(orientation: landscape)');

  function applyBodyClasses() {
    const forced = sessionStorage.getItem('forced-layout'); // 'mobile' | 'desktop' | null
    const mqMobile = mq768.matches;
    const isMobile = forced === 'mobile' ? true : forced === 'desktop' ? false : mqMobile;
    const wasMobile = document.body.classList.contains('is-mobile');
    const layoutFlipped = wasMobile !== isMobile;
    const isLandscape = mqLand.matches;
    document.body.classList.toggle('is-mobile',  isMobile);
    document.body.classList.toggle('is-tablet',  !isMobile && mq1023.matches);
    document.body.classList.toggle('is-force-desktop', forced === 'desktop');
    // Only show rotate overlay in auto-detect mode (not when user explicitly forced a layout)
    document.body.classList.toggle('is-mobile-landscape', isMobile && isLandscape && !forced);
    // When forcing desktop on a mobile viewport the @media block sets html overflow:hidden —
    // override that inline so the page can scroll normally.
    // When in mobile mode (forced or auto), html must be height:100% + overflow:hidden so
    // #app's internal overflow-y:auto becomes the actual scroll container.
    if (forced === 'desktop') {
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height   = 'auto';
    } else if (isMobile) {
      document.documentElement.style.overflow = 'hidden';
      document.documentElement.style.height   = '100%';
    } else {
      document.documentElement.style.overflow = '';
      document.documentElement.style.height   = '';
    }
    if (isMobile) {
      // Auto-disable custom cursor on touch devices
      if (state.customCursor) {
        state.customCursor = false;
        applyCursorState();
      }
    }
    // Update universal layout toggle button (icon highlight is CSS-driven via body.is-mobile)
    const layoutToggle = document.getElementById('layout-toggle-btn');
    if (layoutToggle) {
      const label = isMobile ? 'Switch to desktop view' : 'Switch to mobile view';
      layoutToggle.title = forced ? `${label} (override active — click to reset)` : label;
      layoutToggle.setAttribute('aria-label', label);
      layoutToggle.classList.toggle('is-forced', !!forced);
    }
    updateMobileChrome();
    // When the mobile/desktop layout flips, re-render any pages whose markup
    // differs between layouts (cards vs. tables, etc.).
    if (layoutFlipped) {
      try { if (typeof renderPickupsPage === 'function') renderPickupsPage(); } catch(_) {}
      try { if (typeof renderCombosPage  === 'function') renderCombosPage();  } catch(_) {}
      try { if (typeof renderGrid        === 'function') renderGrid();        } catch(_) {}
      try { if (typeof renderClanSelector=== 'function') renderClanSelector();} catch(_) {}
      try { if (typeof renderAffinityBar === 'function') renderAffinityBar(); } catch(_) {}
      try { if (typeof renderMobileInnateStrip        === 'function') renderMobileInnateStrip();        } catch(_) {}
      try { if (typeof renderMobileBennyFeatureStrip  === 'function') renderMobileBennyFeatureStrip();  } catch(_) {}
      try { if (typeof renderMobileFabienFeatureStrip === 'function') renderMobileFabienFeatureStrip(); } catch(_) {}
    }
  }

  applyBodyClasses();
  mq768.addEventListener('change',  applyBodyClasses);
  mq1023.addEventListener('change', applyBodyClasses);
  mqLand.addEventListener('change', applyBodyClasses);
  window.addEventListener('orientationchange', applyBodyClasses);

  // ── Hamburger → Drawer ────────────────────────────────
  const menuBtn     = document.getElementById('mobile-menu-btn');
  const drawer      = document.getElementById('mobile-drawer');
  const drawerScrim = document.getElementById('mobile-drawer-scrim');

  function openDrawer()  { drawer && drawer.classList.add('is-open');    drawerScrim && drawerScrim.classList.add('is-open'); }
  function closeDrawer() { drawer && drawer.classList.remove('is-open'); drawerScrim && drawerScrim.classList.remove('is-open'); }

  if (menuBtn)     menuBtn.addEventListener('click', openDrawer);
  if (drawerScrim) drawerScrim.addEventListener('click', closeDrawer);

  const drawerCloseBtn = document.getElementById('mobile-drawer-close-btn');
  if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);

  // Drawer → forward to original buttons
  const mirrors = [
    ['mobile-about-btn',           '#about-open-btn'],
    ['mobile-changelog-btn',       '#changelog-open-btn'],
    ['mobile-mods-btn',            '#mods-open-btn'],
    ['mobile-view-link-btn-drawer','#view-link-btn'],
    ['mobile-save-link-btn-drawer','#save-link-btn'],
  ];
  mirrors.forEach(([mId, origSel]) => {
    const el = document.getElementById(mId);
    if (el) el.addEventListener('click', () => { closeDrawer(); const orig = document.querySelector(origSel); if (orig) orig.click(); });
  });

  // ── Universal layout toggle ─────────────────────
  const layoutToggleBtn = document.getElementById('layout-toggle-btn');
  if (layoutToggleBtn) {
    layoutToggleBtn.addEventListener('click', () => {
      const current = sessionStorage.getItem('forced-layout');
      const autoMobile = mq768.matches;
      if (current) {
        // Already forced — clear override (revert to auto-detect)
        sessionStorage.removeItem('forced-layout');
      } else if (autoMobile) {
        // Auto is mobile — force desktop
        sessionStorage.setItem('forced-layout', 'desktop');
      } else {
        // Auto is desktop — force mobile
        sessionStorage.setItem('forced-layout', 'mobile');
      }
      applyBodyClasses();
    });
  }

  // ── Bottom Tab Bar ────────────────────────────────────
  document.querySelectorAll('.mobile-bottom-tab[data-mobile-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.dataset.mobileTab;
      const isPhyre = tabId === 'phyre';
      const alreadyActive = btn.classList.contains('is-active');
      const clanBar = document.getElementById('mobile-clan-bar');

      // Phyre re-tap while on Phyre tab: toggle clan bar
      if (isPhyre && alreadyActive && clanBar) {
        clanBar.classList.toggle('is-open');
        if (clanBar.classList.contains('is-open')) hideMobileDetailHint();
        return;
      }

      // Switching to a different tab: close clan bar
      if (clanBar) clanBar.classList.remove('is-open');

      const orig = document.querySelector(`.tab-bar--primary .tab-bar__tab[data-tab="${tabId}"]`);
      if (orig) orig.click();
      requestAnimationFrame(updateMobileChrome);
    });
  });

  // Hook into primary/secondary tab clicks to sync mobile chrome
  document.querySelectorAll('.tab-bar--primary .tab-bar__tab').forEach(tab => {
    tab.addEventListener('click', () => requestAnimationFrame(updateMobileChrome));
  });
  document.querySelectorAll('.tab-bar--secondary .tab-bar__tab, .tab-bar--fabien .tab-bar__tab, .tab-bar--benny .tab-bar__tab, .tab-bar--combos .tab-bar__tab, .tab-bar--pickups .tab-bar__tab').forEach(tab => {
    tab.addEventListener('click', () => requestAnimationFrame(updateMobileChrome));
  });

  // ── Bottom Sheet drag ─────────────────────────────────
  const sheet      = document.getElementById('mobile-sheet');
  const sheetScrim = document.getElementById('mobile-sheet-scrim');
  const handle     = document.getElementById('mobile-sheet-handle');

  const SNAP_FRACTIONS = { closed: 0, peek: 0.3, default: 0.65, expanded: 0.95 };
  const SNAP_ORDER     = ['closed', 'peek', 'default', 'expanded'];

  if (sheet && handle) {
    let dragStartY = 0, dragStartSnap = 'default';

    function snapTranslatePx(snapName) {
      const vh = window.innerHeight;
      const sheetH = vh * 0.95;
      const visible = (SNAP_FRACTIONS[snapName] || 0) * vh;
      return sheetH - visible;
    }

    handle.addEventListener('touchstart', e => {
      dragStartY    = e.touches[0].clientY;
      dragStartSnap = sheet.dataset.snap || 'default';
      sheet.classList.add('is-dragging');
    }, { passive: true });

    handle.addEventListener('touchmove', e => {
      const dy = e.touches[0].clientY - dragStartY;
      const base = snapTranslatePx(dragStartSnap);
      const clamped = Math.max(0, base + dy);
      sheet.style.transform = `translateY(${clamped}px)`;
    }, { passive: true });

    handle.addEventListener('touchend', e => {
      sheet.classList.remove('is-dragging');
      sheet.style.transform = '';
      const dy = e.changedTouches[0].clientY - dragStartY;

      // Tap (≤10px movement) → close
      if (Math.abs(dy) <= 10) { closeMobileSheet(); return; }

      const idx = SNAP_ORDER.indexOf(dragStartSnap);
      let newSnap = dragStartSnap;
      if (dy > 80)       newSnap = SNAP_ORDER[Math.max(0, idx - 1)];
      else if (dy < -80) newSnap = SNAP_ORDER[Math.min(SNAP_ORDER.length - 1, idx + 1)];

      if (newSnap === 'closed') { closeMobileSheet(); }
      else { sheet.dataset.snap = newSnap; mobileSheetState.snap = newSnap; }
    });

    // Also close on click (mouse / accessibility)
    handle.addEventListener('click', () => closeMobileSheet());

    // Close button inside the handle
    const sheetHandleClose = document.getElementById('mobile-sheet')?.querySelector('.mobile-sheet__handle-close');
    if (sheetHandleClose) {
      sheetHandleClose.addEventListener('click', e => { e.stopPropagation(); closeMobileSheet(); });
    }
  }

  // ── Body drag-to-resize ─────────────────────────────
  // Lets the user grab anywhere on the sheet content and drag to change snap,
  // while still allowing the body to scroll natively when content overflows.
  const sheetBody = document.getElementById('mobile-sheet-body');
  if (sheet && sheetBody) {
    let bDragStartY = 0;
    let bDragStartScroll = 0;
    let bDragStartSnap = 'default';
    let bDragging = false;        // committed to dragging the sheet
    let bMaybeDrag = false;       // touch in progress, decision pending
    let bStartedAtTop = false;

    function snapTranslatePxBody(snapName) {
      const vh = window.innerHeight;
      const sheetH = vh * 0.95;
      const visible = (SNAP_FRACTIONS[snapName] || 0) * vh;
      return sheetH - visible;
    }

    sheetBody.addEventListener('touchstart', e => {
      // Don't hijack drags that start on interactive controls
      if (e.target.closest('button, a, input, select, textarea, label, .mobile-sheet__action-btn')) {
        bMaybeDrag = false;
        return;
      }
      bDragStartY      = e.touches[0].clientY;
      bDragStartScroll = sheetBody.scrollTop;
      bDragStartSnap   = sheet.dataset.snap || 'default';
      bStartedAtTop    = bDragStartScroll <= 0;
      bMaybeDrag       = true;
      bDragging        = false;
    }, { passive: true });

    sheetBody.addEventListener('touchmove', e => {
      if (!bMaybeDrag) return;
      const dy = e.touches[0].clientY - bDragStartY;

      if (!bDragging) {
        // Decide: only commit to dragging the sheet if the user pulls DOWN
        // while the body is already at scrollTop 0, OR pulls UP from a
        // non-expanded snap (so swiping up grows the sheet before scrolling).
        const PULL_THRESHOLD = 8;
        if (Math.abs(dy) < PULL_THRESHOLD) return;
        const pullingDown = dy > 0;
        const pullingUp   = dy < 0;
        if (pullingDown && bStartedAtTop) {
          bDragging = true;
        } else if (pullingUp && bDragStartSnap !== 'expanded' && bStartedAtTop) {
          bDragging = true;
        } else {
          // Native scroll wins; abandon drag for the rest of this gesture
          bMaybeDrag = false;
          return;
        }
        sheet.classList.add('is-dragging');
      }

      if (bDragging) {
        const base = snapTranslatePxBody(bDragStartSnap);
        const clamped = Math.max(0, base + dy);
        sheet.style.transform = `translateY(${clamped}px)`;
        // Keep body pinned at top while dragging so the gesture feels anchored
        if (sheetBody.scrollTop !== 0) sheetBody.scrollTop = 0;
      }
    }, { passive: true });

    sheetBody.addEventListener('touchend', e => {
      if (!bDragging) { bMaybeDrag = false; return; }
      sheet.classList.remove('is-dragging');
      sheet.style.transform = '';
      const dy = e.changedTouches[0].clientY - bDragStartY;
      const idx = SNAP_ORDER.indexOf(bDragStartSnap);
      let newSnap = bDragStartSnap;
      if (dy > 80)       newSnap = SNAP_ORDER[Math.max(0, idx - 1)];
      else if (dy < -80) newSnap = SNAP_ORDER[Math.min(SNAP_ORDER.length - 1, idx + 1)];

      if (newSnap === 'closed') { closeMobileSheet(); }
      else { sheet.dataset.snap = newSnap; mobileSheetState.snap = newSnap; }

      bDragging  = false;
      bMaybeDrag = false;
    });

    sheetBody.addEventListener('touchcancel', () => {
      if (bDragging) {
        sheet.classList.remove('is-dragging');
        sheet.style.transform = '';
      }
      bDragging  = false;
      bMaybeDrag = false;
    });
  }

  // Scrim tap → close sheet
  if (sheetScrim) sheetScrim.addEventListener('click', closeMobileSheet);

  // Sheet back button
  const sheetBackBtn = document.getElementById('mobile-sheet-back');
  if (sheetBackBtn) {
    sheetBackBtn.addEventListener('click', () => {
      if (typeof sheetBackBtn._backFn === 'function') sheetBackBtn._backFn();
    });
  }

  // Back button → close sheet if it's open
  window.addEventListener('popstate', e => {
    if (mobileSheetState.isOpen) {
      // Suppress the normal go-back: close the sheet instead.
      // We need to re-push the entry so the page URL doesn't change.
      const sheet = document.getElementById('mobile-sheet');
      const scrim = document.getElementById('mobile-sheet-scrim');
      if (sheet) sheet.dataset.snap = 'closed';
      if (scrim) scrim.classList.add('hidden');
      mobileSheetState.isOpen = false;
      mobileSheetState.snap   = 'closed';
    }
  });

  // Sheet action buttons (delegated) ─────────────────────
  const sheetActions = document.getElementById('mobile-sheet-actions');
  if (sheetActions) {
    sheetActions.addEventListener('click', e => {
      const btn = e.target.closest('.mobile-sheet__action-btn');
      if (!btn || !state.focusedAbility || state.focusedAbility.type !== 'ability') return;
      if (btn.id !== 'sheet-progress-btn' && btn.id !== 'sheet-reset-btn') return;
      const { clanId, tier } = state.focusedAbility;

      if (btn.id === 'sheet-progress-btn') {
        handleAbilityClick(clanId, tier);
      } else if (btn.id === 'sheet-reset-btn') {
        handleAbilityUndo(clanId, tier);
      }

      // Refresh sheet content
      const sheetBody = document.getElementById('mobile-sheet-body');
      if (sheetBody) renderDetailPanel(sheetBody);
      sheetActions.innerHTML = buildMobileAbilityActions(clanId, tier);
    });
  }

  // ── Mobile reset button ───────────────────────────────
  const resetBtn = document.getElementById('mobile-reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', () => {
    if (typeof resetAll === 'function') resetAll();
    closeMobileSheet();
    _syncMobileStats();
  });

  // ── Mobile help button ────────────────────────────────
  const helpBtn = document.getElementById('mobile-help-btn');
  if (helpBtn) helpBtn.addEventListener('click', () => {
    const html = `
      <div class="mobile-help-sheet">
        <h3 class="mobile-help-sheet__title">How to Unlock Abilities</h3>
        <div class="mobile-help-sheet__section">
          <h4>In-Clan</h4>
          <p>Unlock abilities in sequence <span class="mobile-help-sheet__seq">Passive → Strike → Relocate → Affect → Mastery → Perk</span> by spending AP.</p>
        </div>
        <div class="mobile-help-sheet__section">
          <h4>Cross-Clan</h4>
          <p>To unlock another clan's ability:</p>
          <ol>
            <li>Awaken it at the Clan Trainer by spending Blood Resonance.</li>
            <li>Unlock the equivalent ability in your own clan tree first.</li>
            <li>Spend AP — usually more than in-clan cost, but <strong>discounted 50%</strong> if your clan shares affinity.</li>
          </ol>
        </div>
        <div class="mobile-help-sheet__section">
          <h4>Cross-Clan Perks</h4>
          <ol>
            <li>Unlock your own clan's Perk first.</li>
            <li>Awaken <em>every</em> ability in the target clan's tree.</li>
            <li>Spend 6 AP to unlock their Perk.</li>
          </ol>
        </div>
        <div class="mobile-help-sheet__tips">
          <h4>Quick Tips</h4>
          <ul>
            <li><strong>Tap the clan logo bar</strong> (bottom Phyre tab) to open the clan selector — pick your active clan there.</li>
            <li><strong>Tap a clan card once</strong> to select it; <strong>tap again</strong> to mark it completed (golden logo).</li>
            <li><strong>Tap any ability cell</strong> to preview it — then tap the hint pill that appears to open full details.</li>
            <li><strong>Long-press / tap the Phyre mark</strong> icon in the stats bar to browse innate abilities.</li>
            <li>AP and Resonance totals update live in the bar at the top of the skill tree.</li>
          </ul>
        </div>
      </div>`;
    openMobileSheet(html, '', 'Help');
  });

  // Initial update
  updateMobileChrome();
}
