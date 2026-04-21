// VTMB2 Skill Calculator - Ability Combos
// =========================================

// ── Rank styling ─────────────────────────────────────────────
const RANK_CLASS = {
  "S+": "rank--s-plus",
  "S":  "rank--s",
  "A+": "rank--a-plus",
  "A":  "rank--a",
  "B+": "rank--b-plus",
  "B":  "rank--b",
  "B-": "rank--b-minus",
  "C":  "rank--c",
  "D":  "rank--d",
  "F":  "rank--f",
};

const COMBOS_FILTER = {
  selected: null, // "all" | "partial" | "locked" | null
};

// ── Unlock state helpers ─────────────────────────────────────
function getAbilityState(abilityName) {
  const loc = ABILITY_LOCATION[abilityName];
  if (!loc) return null;
  return state.abilities[`${loc.clan}:${loc.tier}`] || "locked";
}

function getComboUnlockState(combo) {
  const known = combo.abilities.filter(n => ABILITY_LOCATION[n]);
  if (known.length === 0) return "locked";
  const unlocked = known.filter(n => getAbilityState(n) === "unlocked");
  if (unlocked.length === known.length) return "all";
  if (unlocked.length > 0) return "partial";
  return "locked";
}

function comboPassesFilter(unlockState) {
  if (!COMBOS_FILTER.selected) return true;
  return unlockState === COMBOS_FILTER.selected;
}

// ── Ability icon HTML ─────────────────────────────────────────
function buildComboAbilityIcon(abilityName) {
  const loc = ABILITY_LOCATION[abilityName];
  if (!loc) {
    return `<span class="combo-ability__unknown" title="${abilityName}">${abilityName}</span>`;
  }
  const ability = ABILITIES[loc.clan][loc.tier];
  const abilState = state.abilities[`${loc.clan}:${loc.tier}`] || "locked";
  const stateClass = `combo-ability--${abilState}`;
  return `<button class="combo-ability ${stateClass}"
    data-clan="${loc.clan}" data-tier="${loc.tier}"
    title="${ability.name}"
    aria-label="Go to ${ability.name} in skill tree">
    <img src="${ability.icon}" alt="${ability.name}">
    ${abilState === "unlocked" ? '<span class="combo-ability__state combo-ability__state--unlocked">✓</span>' : ""}
    ${abilState === "awakened" ? '<span class="combo-ability__state combo-ability__state--awakened">◈</span>' : ""}
    ${abilState === "locked"   ? '<span class="combo-ability__state combo-ability__state--locked">🔒</span>' : ""}
  </button>`;
}

// ── Cost cell builder ───────────────────────────────────────────
const AP_DIAMOND = `<svg class="combo-cost__ap-icon" viewBox="0 0 16 16" width="10" height="10"><polygon points="8,1 15,8 8,15 1,8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>`;

function buildComboCostCell(combo) {
  const spent = buildComboTotalSpent(combo);
  const left  = buildComboTotalLeft(combo);
  if (!spent && !left) return '';
  let html = `<div class="combo-cost">`;
  if (spent) html += `<div class="combo-cost__section"><span class="combo-cost__label combo-cost__label--spent">Spent</span>${spent}</div>`;
  if (left)  html += `<div class="combo-cost__section"><span class="combo-cost__label combo-cost__label--left">Left</span>${left}</div>`;
  html += `</div>`;
  return html;
}

function buildComboTotalSpent(combo) {
  let apSpent = 0, sanSpent = 0, melSpent = 0, choSpent = 0;
  for (const name of combo.abilities) {
    const loc = ABILITY_LOCATION[name];
    if (!loc) continue;
    const ability   = ABILITIES[loc.clan][loc.tier];
    const abilState = state.abilities[`${loc.clan}:${loc.tier}`] || "locked";
    const isCross   = loc.clan !== state.selectedClan;
    const isUnlocked = abilState === "unlocked";
    const isAwakened = abilState === "awakened";
    // AP spent = unlocked
    if (isUnlocked) {
      const ap = getAPCost(loc.clan, loc.tier);
      if (ap !== null) apSpent += ap;
    }
    // Resonance spent = awakened or unlocked (cross-clan non-perk)
    if (isCross && (isAwakened || isUnlocked) && loc.tier !== "perk" && loc.tier !== "passive") {
      sanSpent += ability.resonance.san || 0;
      melSpent += ability.resonance.mel || 0;
      choSpent += ability.resonance.cho || 0;
    }
  }
  if (apSpent === 0 && sanSpent === 0 && melSpent === 0 && choSpent === 0) return "";
  let html = `<div class="combo-total combo-total--spent">`;
  if (apSpent > 0) html += `<span class="combo-total__ap">${AP_DIAMOND}${apSpent}</span>`;
  if (sanSpent > 0) html += `<span class="combo-total__res"><img src="${UI.resSanguine}" alt="San">${sanSpent}</span>`;
  if (melSpent > 0) html += `<span class="combo-total__res"><img src="${UI.resMelancholic}" alt="Mel">${melSpent}</span>`;
  if (choSpent > 0) html += `<span class="combo-total__res"><img src="${UI.resCholeric}" alt="Cho">${choSpent}</span>`;
  html += `</div>`;
  return html;
}

function buildComboTotalLeft(combo) {
  let apLeft = 0, sanLeft = 0, melLeft = 0, choLeft = 0;
  for (const name of combo.abilities) {
    const loc = ABILITY_LOCATION[name];
    if (!loc) continue;
    const ability   = ABILITIES[loc.clan][loc.tier];
    const abilState = state.abilities[`${loc.clan}:${loc.tier}`] || "locked";
    const isCross   = loc.clan !== state.selectedClan;
    const isUnlocked = abilState === "unlocked";
    const isAwakened = abilState === "awakened";
    // AP left = not yet unlocked
    if (!isUnlocked) {
      const ap = getAPCost(loc.clan, loc.tier);
      if (ap !== null) apLeft += ap;
    }
    // Resonance left = cross-clan not yet awakened or unlocked
    if (isCross && !isAwakened && !isUnlocked && loc.tier !== "perk" && loc.tier !== "passive") {
      sanLeft += ability.resonance.san || 0;
      melLeft += ability.resonance.mel || 0;
      choLeft += ability.resonance.cho || 0;
    }
  }
  if (apLeft === 0 && sanLeft === 0 && melLeft === 0 && choLeft === 0) return "";
  let html = `<div class="combo-total combo-total--left">`;
  if (apLeft > 0) html += `<span class="combo-total__ap">${AP_DIAMOND}${apLeft}</span>`;
  if (sanLeft > 0) html += `<span class="combo-total__res"><img src="${UI.resSanguine}" alt="San">${sanLeft}</span>`;
  if (melLeft > 0) html += `<span class="combo-total__res"><img src="${UI.resMelancholic}" alt="Mel">${melLeft}</span>`;
  if (choLeft > 0) html += `<span class="combo-total__res"><img src="${UI.resCholeric}" alt="Cho">${choLeft}</span>`;
  html += `</div>`;
  return html;
}

// ── Main render ───────────────────────────────────────────────
function renderCombosPage() {
  const container = document.getElementById("combos-table-container");
  if (!container) return;

  let html = `
    <div class="combos-header">
      <img class="combos-header__icon" src="${COMBO_ICON}" alt="Combos">
      <div>
        <h2 class="combos-header__title">Ability Combos</h2>
        <p class="combos-header__sub">Some abilities are far more powerful when used in combination. Row colour reflects how many of the required abilities you have unlocked.</p>
      </div>
    </div>
    <div class="combos-legend">
      <button class="combos-legend__item combos-legend__item--all ${COMBOS_FILTER.selected === 'all' ? 'is-active' : ''}" data-combo-filter="all" aria-pressed="${COMBOS_FILTER.selected === 'all'}">All unlocked</button>
      <button class="combos-legend__item combos-legend__item--partial ${COMBOS_FILTER.selected === 'partial' ? 'is-active' : ''}" data-combo-filter="partial" aria-pressed="${COMBOS_FILTER.selected === 'partial'}">Partially unlocked</button>
      <button class="combos-legend__item combos-legend__item--locked ${COMBOS_FILTER.selected === 'locked' ? 'is-active' : ''}" data-combo-filter="locked" aria-pressed="${COMBOS_FILTER.selected === 'locked'}">Not started</button>
    </div>
    <table class="combos-table" role="table">
      <thead>
        <tr>
          <th class="combos-table__th combos-table__th--name">Combo</th>
          <th class="combos-table__th combos-table__th--abilities">Abilities</th>
          <th class="combos-table__th combos-table__th--cost">Cost</th>
          <th class="combos-table__th combos-table__th--explanation">Explanation</th>
          <th class="combos-table__th combos-table__th--rank">Rank</th>
        </tr>
      </thead>
      <tbody>`;

  for (const combo of COMBOS) {
    const unlockState = getComboUnlockState(combo);
    if (!comboPassesFilter(unlockState)) continue;
    const rowClass = `combos-table__row combos-table__row--${unlockState}`;

    // Name cell — <details> to expand reference
    let nameCell = `<details class="combo-name">
      <summary class="combo-name__summary">
        <span class="combo-name__text">${combo.name}</span>
        ${combo.subtitle ? `<span class="combo-name__subtitle">${combo.subtitle}</span>` : ""}
        ${combo.patched ? `<span class="combo-name__patched">PATCHED</span>` : ""}
      </summary>`;
    if (combo.reference || combo.referenceUrl) {
      nameCell += `<div class="combo-name__ref">`;
      if (combo.referenceUrl) {
        nameCell += `<span class="combo-name__ref-label">Ref: </span><a href="${combo.referenceUrl}" target="_blank" rel="noopener">${combo.reference || combo.referenceUrl}</a>`;
      } else if (combo.reference) {
        nameCell += `<span class="combo-name__ref-label">Ref: </span><em>${combo.reference}</em>`;
      }
      nameCell += `</div>`;
    }
    nameCell += `</details>`;

    // Abilities cell
    const abilitiesHtml = combo.abilities.map(buildComboAbilityIcon).join("");

    // Explanation cell — newlines → line breaks
    const explanationHtml = combo.explanation.replace(/\n/g, "<br>");

    html += `
      <tr class="${rowClass}" id="combo-row-${combo.id}">
        <td class="combos-table__td combos-table__td--name">${nameCell}</td>
        <td class="combos-table__td combos-table__td--abilities">
          <div class="combo-abilities">${abilitiesHtml}</div>
        </td>
        <td class="combos-table__td combos-table__td--cost">${buildComboCostCell(combo)}</td>
        <td class="combos-table__td combos-table__td--explanation">${explanationHtml}</td>
        <td class="combos-table__td combos-table__td--rank">
          <span class="combo-rank ${RANK_CLASS[combo.rank] || ""}">${combo.rank}</span>
        </td>
      </tr>`;
  }

  html += `</tbody></table>`;
  container.innerHTML = html;

  // Bind ability icon buttons — hover tooltip + click to navigate skill tree
  container.querySelectorAll(".combo-ability[data-clan]").forEach(btn => {
    const clan = btn.dataset.clan;
    const tier = btn.dataset.tier;
    const ability = ABILITIES[clan][tier];
    const abilState = state.abilities[`${clan}:${tier}`] || "locked";
    const tooltipContent = buildTooltipContent(clan, tier, ability, abilState);

    btn.addEventListener("mouseenter", (e) => {
      sharedTooltip.innerHTML = tooltipContent;
      sharedTooltip.classList.add("tooltip--visible");
      positionTooltip(e);
    });
    btn.addEventListener("mousemove", positionTooltip);
    btn.addEventListener("mouseleave", () => {
      sharedTooltip.classList.remove("tooltip--visible");
    });
    btn.addEventListener("click", () => {
      // Only auto-select the clan if none is currently chosen
      if (!state.selectedClan) {
        selectClan(clan);
      }
      navigateToAbility(clan, tier);
    });
  });

  container.querySelectorAll("[data-combo-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      const requested = btn.dataset.comboFilter;
      COMBOS_FILTER.selected = COMBOS_FILTER.selected === requested ? null : requested;
      renderCombosPage();
    });
  });
}

// ── Navigate to combos tab and highlight a row ───────────────
function navigateToCombos(comboId) {
  const secondaryTabs = document.querySelectorAll(".tab-bar--secondary .tab-bar__tab");
  secondaryTabs.forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
  const combosTab = document.querySelector(".tab-bar--secondary .tab-bar__tab[data-subtab='combos']");
  if (combosTab) combosTab.classList.add("active");
  document.getElementById("subpage-combos").classList.remove("hidden");
  renderCombosPage();

  if (comboId) {
    setTimeout(() => {
      const row = document.getElementById(`combo-row-${comboId}`);
      if (row) {
        row.classList.add("combos-table__row--highlight");
        row.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => row.classList.remove("combos-table__row--highlight"), 2200);
      }
    }, 60);
  }
}

// ── Re-render combos if the tab is currently visible ─────────
function refreshCombosIfVisible() {
  const subpage = document.getElementById("subpage-combos");
  if (subpage && !subpage.classList.contains("hidden")) {
    renderCombosPage();
  }
}
