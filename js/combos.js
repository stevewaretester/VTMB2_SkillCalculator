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
      <span class="combos-legend__item combos-legend__item--all">All unlocked</span>
      <span class="combos-legend__item combos-legend__item--partial">Partially unlocked</span>
      <span class="combos-legend__item combos-legend__item--locked">Not started</span>
    </div>
    <table class="combos-table" role="table">
      <thead>
        <tr>
          <th class="combos-table__th combos-table__th--name">Combo</th>
          <th class="combos-table__th combos-table__th--abilities">Abilities</th>
          <th class="combos-table__th combos-table__th--explanation">Explanation</th>
          <th class="combos-table__th combos-table__th--rank">Rank</th>
        </tr>
      </thead>
      <tbody>`;

  for (const combo of COMBOS) {
    const unlockState = getComboUnlockState(combo);
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
      // Auto-select the clan if different from current, then navigate
      if (state.selectedClan !== clan) {
        selectClan(clan);
      }
      navigateToAbility(clan, tier);
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
