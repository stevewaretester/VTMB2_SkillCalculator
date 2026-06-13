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

const COMBO_RANK_ORDER = ["S+", "S", "A+", "A", "B+", "B", "B-", "C", "D", "F"];

const COMBOS_FILTER = {
  selected: null, // "all" | "partial" | "locked" | null
};

function getComboRankSortValue(rank) {
  const idx = COMBO_RANK_ORDER.indexOf(rank);
  return idx === -1 ? COMBO_RANK_ORDER.length : idx;
}

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

function escapeComboHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildComboExplanationHtml(combo) {
  const explanation = combo.explanation || "";
  const explanationHtml = typeof linkifyAbilityText === "function"
    ? linkifyAbilityText(explanation)
    : escapeComboHtml(explanation).replace(/\n/g, "<br>");

  if (!combo.outputElixir) return explanationHtml;

  const elixirId = escapeComboHtml(combo.outputElixir.id);
  const elixirName = escapeComboHtml(combo.outputElixir.name);
  return `<div class="combo-output-line">Produces a <button class="combo-pickup-link" type="button" data-pickup-elixir="${elixirId}">${elixirName}</button></div>${explanationHtml}`;
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
  const iconSrc = ability.icon || (CLANS[loc.clan] ? CLANS[loc.clan].logo : "");
  return `<button class="combo-ability ${stateClass}"
    data-clan="${loc.clan}" data-tier="${loc.tier}"
    title="${ability.name}"
    aria-label="Go to ${ability.name} in skill tree">
    ${iconSrc ? `<img src="${iconSrc}" alt="${ability.name}">` : ""}
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
  const skilltreeCombosSubpage = document.getElementById("skilltree-subpage-combos");
  const combatAbilitySubpage = document.getElementById("combos-subpage-ability");
  let container = null;
  if (skilltreeCombosSubpage && !skilltreeCombosSubpage.classList.contains("hidden")) {
    container = document.getElementById("skilltree-combos-container");
  } else if (combatAbilitySubpage && !combatAbilitySubpage.classList.contains("hidden")) {
    // Legacy fallback if old combat ability subpage is used.
    container = document.getElementById("combos-table-container");
  }
  if (!container) return;

  const isMobile = document.body.classList.contains('is-mobile');
  const orderedCombos = COMBOS
    .map((combo, index) => ({ combo, index }))
    .sort((a, b) => getComboRankSortValue(a.combo.rank) - getComboRankSortValue(b.combo.rank) || a.index - b.index)
    .map(entry => entry.combo);

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
    </div>`;

  if (isMobile) {
    // ── Mobile: card view ─────────────────────────────────────
    html += `<div class="combo-card-list">`;
    for (const combo of orderedCombos) {
      if (typeof comboIsVisible === "function" && !comboIsVisible(combo)) continue;
      const unlockState = getComboUnlockState(combo);
      if (!comboPassesFilter(unlockState)) continue;
      const abilitiesHtml = combo.abilities.map(buildComboAbilityIcon).join("");
      const explanationHtml = buildComboExplanationHtml(combo);
      let refHtml = '';
      if (combo.referenceUrl) {
        refHtml = `<div class="combo-card__ref">Ref: <a href="${combo.referenceUrl}" target="_blank" rel="noopener">${combo.reference || combo.referenceUrl}</a></div>`;
      } else if (combo.reference) {
        refHtml = `<div class="combo-card__ref">Ref: <em>${combo.reference}</em></div>`;
      }
      const modClass = combo.requiresMod ? " combo-card--mod" : "";
      html += `<article class="combo-card combo-card--${unlockState}${modClass}" id="combo-row-${combo.id}">
        <div class="combo-card__header">
          <div>
            <div class="combo-card__name">${combo.name}</div>
            ${combo.subtitle ? `<div class="combo-card__subtitle">${combo.subtitle}</div>` : ""}
            ${combo.patched  ? `<div class="combo-card__patched">PATCHED</div>` : ""}
          </div>
          <span class="combo-rank ${RANK_CLASS[combo.rank] || ""}">${combo.rank}</span>
        </div>
        <div class="combo-card__abilities">${abilitiesHtml}</div>
        <div class="combo-card__cost">${buildComboCostCell(combo)}</div>
        <div class="combo-card__body">${explanationHtml}</div>
        ${refHtml}
      </article>`;
    }
    html += `</div>`;
  } else {
    // ── Desktop: table view ───────────────────────────────────
    html += `<table class="combos-table" role="table">
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

    for (const combo of orderedCombos) {
      if (typeof comboIsVisible === "function" && !comboIsVisible(combo)) continue;
      const unlockState = getComboUnlockState(combo);
      if (!comboPassesFilter(unlockState)) continue;
      const rowClass = `combos-table__row combos-table__row--${unlockState}`;

      const modClass = combo.requiresMod ? " combo-name--mod" : "";
      const subtitleHtml = combo.subtitle ? `<div class="combo-name__subtitle">${combo.subtitle}</div>` : "";
      const patchedHtml = combo.patched ? `<span class="combo-name__patched">PATCHED</span>` : "";
      let refHtml = "";
      if (combo.reference || combo.referenceUrl) {
        refHtml += `<div class="combo-name__ref">`;
        if (combo.referenceUrl) {
          refHtml += `<span class="combo-name__ref-label">Ref: </span><a href="${combo.referenceUrl}" target="_blank" rel="noopener">${combo.reference || combo.referenceUrl}</a>`;
        } else if (combo.reference) {
          refHtml += `<span class="combo-name__ref-label">Ref: </span><em>${combo.reference}</em>`;
        }
        refHtml += `</div>`;
      }

      let nameCell = "";
      if (refHtml) {
        nameCell = `<details class="combo-name${modClass}">
          <summary class="combo-name__summary">
            <span class="combo-name__text">${combo.name}</span>
            ${patchedHtml}
            ${subtitleHtml}
          </summary>
          ${refHtml}
        </details>`;
      } else {
        nameCell = `<div class="combo-name combo-name--plain${modClass}">
          <span class="combo-name__text">${combo.name}</span>
          ${patchedHtml}
          ${subtitleHtml}
        </div>`;
      }

      const abilitiesHtml  = combo.abilities.map(buildComboAbilityIcon).join("");
      const explanationHtml = buildComboExplanationHtml(combo);

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
  }

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

  container.querySelectorAll(".combo-pickup-link[data-pickup-elixir]").forEach(btn => {
    btn.addEventListener("click", () => {
      navigateToPickupElixir(btn.dataset.pickupElixir);
    });
  });

  if (typeof bindInlineDetailLinks === "function") {
    bindInlineDetailLinks(container);
  }

  container.querySelectorAll("[data-combo-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      const requested = btn.dataset.comboFilter;
      COMBOS_FILTER.selected = COMBOS_FILTER.selected === requested ? null : requested;
      renderCombosPage();
    });
  });
}

function navigateToPickupElixir(elixirId) {
  if (!elixirId) return;

  document.querySelectorAll(".tab-bar--primary .tab-bar__tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#app > .page").forEach(p => p.classList.add("hidden"));
  const phyreTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="phyre"]');
  if (phyreTab) phyreTab.classList.add("active");
  const phyrePage = document.getElementById("page-phyre");
  if (phyrePage) phyrePage.classList.remove("hidden");

  document.querySelectorAll(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny):not(.tab-bar--ysabelle) .tab-bar__tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
  const pickupsSecondaryTab = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny):not(.tab-bar--ysabelle) .tab-bar__tab[data-subtab="pickups"]');
  if (pickupsSecondaryTab) pickupsSecondaryTab.classList.add("active");
  const pickupsPage = document.getElementById("subpage-pickups");
  if (pickupsPage) pickupsPage.classList.remove("hidden");

  if (typeof renderPickupsPage === "function") renderPickupsPage();
  if (typeof setActivePickupsSubtab === "function") setActivePickupsSubtab("items");

  setTimeout(() => {
    const target = document.getElementById(`pickup-elixir-${elixirId}`);
    if (!target) return;
    target.classList.add("pickup-row--highlight");
    target.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => target.classList.remove("pickup-row--highlight"), 2200);
  }, 60);

  if (typeof persistPosition === "function") persistPosition();
  if (typeof updateMobileChrome === "function") updateMobileChrome();
}

// ── Navigate to combos tab and highlight a row ───────────────
function navigateToCombos(comboId) {
  const secondaryTabs = document.querySelectorAll(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab");
  secondaryTabs.forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
  const skilltreeTab = document.querySelector(".tab-bar--secondary .tab-bar__tab[data-subtab='skilltree']");
  if (skilltreeTab) skilltreeTab.classList.add("active");
  document.getElementById("subpage-skilltree").classList.remove("hidden");
  if (typeof setActiveSkilltreeSubtab === "function") setActiveSkilltreeSubtab("combos");

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
  if (typeof persistPosition === "function") persistPosition();
  if (typeof updateMobileChrome === "function") updateMobileChrome();
}

// ── Re-render combos if the tab is currently visible ─────────
function refreshCombosIfVisible() {
  const skilltreeSubpage = document.getElementById("subpage-skilltree");
  const skilltreeCombosSubpage = document.getElementById("skilltree-subpage-combos");
  if (skilltreeSubpage && !skilltreeSubpage.classList.contains("hidden") && skilltreeCombosSubpage && !skilltreeCombosSubpage.classList.contains("hidden")) {
    renderCombosPage();
    return;
  }

  const subpage = document.getElementById("subpage-combos");
  if (subpage && !subpage.classList.contains("hidden")) {
    const abilitySubpage = document.getElementById("combos-subpage-ability");
    if (abilitySubpage && !abilitySubpage.classList.contains("hidden")) {
      renderCombosPage();
    }
  }
}

// ── Melee combos data ─────────────────────────────────────────
const MELEE_COMBOS = [
  {
    section: "Standard Inputs",
    sectionSub: "Single button inputs",
    rows: [
      {
        name: "Standard Attack",
        input: "Attack button\n([left-click])",
        effect: "A clan-specific light attack that can be repeated into a combo.",
        damage: "Low",
      },
      {
        name: "Heavy Attack",
        input: "Hold attack button\n(Hold [left-click])",
        effect: "After a charge-up, unleash an attack that knocks back enemies and deals more damage.\nCan break enemy blocks.",
        damage: "Moderate",
      },
      {
        name: "Feed — Enemy",
        input: "Near an unaware, stunned or low-health enemy\nFeed button ([f])",
        effect: "A lengthy animation where Phyre bites the enemy, restoring blood pips, then kills them with a neck-snap or similar.\nNote: You are vulnerable during this.",
        damage: "Finisher",
      },
      {
        name: "Feed — Civilian",
        input: "Near a civilian\nFeed button ([f])",
        effect: "An even longer animation — especially if the target has full resonance (they glow fully). Target is left dazed after feeding.\nMasquerade violation.",
        damage: "Non-lethal",
      },
      {
        name: "Assassinate",
        input: "Near an unaware, stunned or low-health enemy\nInteract button ([e])",
        effect: "A faster animation that kills the enemy outright — no health or blood pips from this though.\nNote: You are still vulnerable during this.",
        damage: "Finisher",
      },
      {
        name: "Telekinetic Pull",
        input: "TK button ([q])",
        effect: "Pulls an enemy towards you, allowing follow-up attacks, or pulls them off ledges.\nLarger enemies can resist, and smaller enemies will resist after the first attempt.\nAlso lets you grab items from around the world, including dropped weapons.",
        damage: "N/A",
      },
      {
        name: "Dash",
        input: "Dash button + direction\n([ctrl])",
        effect: "A quick burst of speed in the input direction. Can be combined with attack inputs to do \"dash kicks\".\nBy default you'll hop backwards; with directional inputs you'll move that way.",
        damage: "N/A",
      },
      {
        name: "Block",
        input: "No input while facing an attacking enemy",
        effect: "Blocking reduces incoming melee damage, but some heavier or ability-based attacks cannot be blocked.",
        damage: "Reduced",
      },
    ],
  },
  {
    section: "Contextual Inputs",
    sectionSub: "Mobility and counter-attacks",
    rows: [
      {
        name: "Standard Attack Chain",
        input: "Multiple attack button inputs\n([left-click] [left-click] [left-click])",
        effect: "Repeatedly attacking chains into a clan-specific light combo — easily dodged and blocked by enemies.\nVaries by clan: faster (Toreador, Banu Haqim), more impactful (Brujah, Lasombra), extra range (Tremere).",
        damage: "Low–Med",
      },
      {
        name: "Shunt",
        input: "Sprint + Attack\n([shift]+[left-click])",
        effect: "A very fast elbow attack that can close distances and disrupt enemies. Best used as a closer when you don't want to send the enemy flying.",
        damage: "Low",
      },
      {
        name: "Parry",
        input: "Dash into an incoming attack\n([ctrl] into an attack)",
        effect: "Blocks the triggering attack and staggers the attacker, opening them to follow-ups and counters (including disarming — see Advanced Combos).\nCan send enemies upward if they were performing a jump attack of their own.",
        damage: "N/A",
      },
      {
        name: "Back Kick",
        input: "Dash + Back + Attack\n([ctrl]+Back+[left-click])",
        effect: "A powerful push-kick that sends enemies flying, often off their feet.\nCan break enemy blocks.",
        damage: "Moderate",
      },
      {
        name: "Front Knee",
        input: "Dash + Forward + Attack\n([ctrl]+Forward+[left-click])",
        effect: "A strong, fast gap-closing knee strike.",
        damage: "Low",
      },
      {
        name: "Side-Kick",
        input: "Dash + Left or Right + Attack\n([ctrl]+Direction+[left-click])",
        effect: "A roundhouse kick that knocks all enemies within range in the input direction, staggering them. Good for crowds.",
        damage: "Moderate",
      },
      {
        name: "Slide",
        input: "Sprint + Crouch\n([shift]+[c])",
        effect: "Slides Phyre along the ground, lowering their profile.",
        damage: "N/A",
      },
      {
        name: "Slide Kick",
        input: "Attack while sliding or on your back\n([left-click])",
        effect: "Performed by attacking while sliding or on their back. Equivalent to a Back Kick, but can't break guards.",
        damage: "Moderate",
      },
      {
        name: "Drop Kick",
        input: "Airborne + Crouch + Attack\n(easiest: [ctrl]+[c]+[left-click])",
        effect: "A two-footed attack that deals heavy damage and knockback. Will \"bounce\" Phyre on hit — letting you land on your feet or bounce around the environment. If it misses, you'll land on your back and can immediately slide-kick.",
        damage: "High",
      },
      {
        name: "TK Fire",
        input: "Attack while holding a loaded gun via TK\n([left-click])",
        effect: "Fires the gun in quick succession, emptying its current ammo reserves (clip / cylinder / magazine / drum).\nSome weapons have more shots than others.",
        damage: "Weapon-dependent\n(Med–High)",
      },
      {
        name: "TK Throw",
        input: "Attack while holding any other item via TK\n([left-click])",
        effect: "Throws the held item — melee weapon, dismembered body part or firearm — at a target for distraction or direct damage.",
        damage: "Object-dependent\nLow (bottle)\nMed (bat)\nLethal (knife)",
      },
      {
        name: "Drop Assassination",
        input: "Above an unaware (or stunned / low-health) enemy\nInteract button ([e])",
        effect: "Same as a standard assassination but performed from the air. Useful for silently eliminating enemies by jumping overtop — faster than crawling.",
        damage: "Lethal",
      },
    ],
  },
  {
    section: "Advanced Combos",
    sectionSub: "Combined or chained inputs",
    rows: [
      {
        name: "Shunt-Disarm",
        input: "Shunt an enemy who has just been Parried, or is currently Reloading\n([shift]+[left-click])",
        effect: "Knocks the weapon out of an enemy's hand.\n1. During a reload — causes them to drop their gun.\n2. After blocking a melee attack.",
        damage: "—",
      },
      {
        name: "Dash–Drop Kick",
        input: "Dash + Crouch + Attack\n([ctrl]+[c]+[left-click])\n(forwards or backwards work best)",
        effect: "Instantly activates the Drop Kick, making it usable as a powerful gap-closer or combat opener.",
        damage: "High",
      },
      {
        name: "\"Death from Above\"",
        input: "Jump overhead + Dash + Drop Assassination\n([ctrl] overhead + [e])",
        effect: "Stomp enemies like an Italian Plumber — jump over a target, dash, and perform a Drop Assassination before they can notice you.",
        damage: "Lethal",
      },
      {
        name: "Kick + Knee + 1, 2, 3",
        input: "Back Kick → Front Knee → Standard Attack chain\n(other kicks or a jump can replace the Front Knee, but this is the most reliable trigger)",
        effect: "Knocks a light enemy into the air, closes the distance with a Front Knee, then begins mid-air juggling with your standard combo. You should \"stick\" to the enemy if done correctly, travelling with them.\nClan note: Tremere performs this at range from the ground; Banu Haqim and Toreador stick to the enemy very effectively; Ventrue need slightly more timing.",
        damage: "Med–High",
      },
      {
        name: "Heavy Mixup",
        input: "Hold Attack at any point during a Standard Attack chain\n(Hold [left-click] during chain)",
        effect: "Converts the next hit into a Heavy Attack, cutting the initial charge-up significantly.",
        damage: "Moderate",
      },
    ],
  },
];

// ── Damage badge HTML ─────────────────────────────────────────
const DAMAGE_CLASS = {
  "Low":       "damage--low",
  "Low–Med":   "damage--low-med",
  "Moderate":  "damage--moderate",
  "Med–High":  "damage--med-high",
  "High":      "damage--high",
  "Lethal":    "damage--lethal",
  "Finisher":  "damage--finisher",
  "Non-lethal":"damage--nonlethal",
};

function buildDamageBadge(damage) {
  if (!damage || damage === "N/A" || damage === "—") {
    return `<span class="combo-damage combo-damage--na">${damage || "—"}</span>`;
  }
  // Multi-line damage (TK Throw etc.) — split and render each line
  const lines = damage.split("\n");
  const mainLine = lines[0];
  const cls = DAMAGE_CLASS[mainLine] || "";
  let html = `<span class="combo-damage ${cls}">${mainLine}</span>`;
  if (lines.length > 1) {
    html += `<ul class="combo-damage__sub">` + lines.slice(1).map(l => `<li>${l}</li>`).join("") + `</ul>`;
  }
  return html;
}

// ── Melee combos render ───────────────────────────────────────
function renderMeleeCombosPage() {
  const container = document.getElementById("combos-subpage-melee");
  if (!container) return;

  let html = `
    <div class="combos-layout">
      <div class="combos-header">
        <div>
          <h2 class="combos-header__title">Combat Tutorial</h2>
          <p class="combos-header__sub">A reference for all combat inputs — from basic actions to advanced combo chains.</p>
        </div>
      </div>
      <div class="combos-legend combos-legend--melee">
        ${MELEE_COMBOS.map(s => `<a class="combos-legend__item" href="#melee-section-${s.section.toLowerCase().replace(/[^a-z0-9]+/g,'-')}">${s.section}</a>`).join("")}
      </div>
      <table class="combos-table combos-table--melee" role="table">
        <thead>
          <tr>
            <th class="combos-table__th combos-table__th--melee-name">Move</th>
            <th class="combos-table__th combos-table__th--melee-input">Input</th>
            <th class="combos-table__th combos-table__th--melee-effect">Effect</th>
            <th class="combos-table__th combos-table__th--melee-damage">Damage</th>
          </tr>
        </thead>`;

  for (const section of MELEE_COMBOS) {
    const sectionId = `melee-section-${section.section.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    html += `<tbody>
      <tr class="combos-table__section-header" id="${sectionId}">
        <td colspan="4" class="combos-table__section-cell">
          <span class="combos-table__section-name">${section.section}</span>
          <span class="combos-table__section-sub">${section.sectionSub}</span>
        </td>
      </tr>`;
    if (section.notes && section.notes.length) {
      html += `<tr class="combos-table__row combos-table__row--melee combos-table__row--section-notes">
        <td colspan="4" class="combos-table__td combos-table__td--section-notes">
          <ul class="melee-section-notes">
            ${section.notes.map(n => `<li>${n}</li>`).join("")}
          </ul>
        </td>
      </tr>`;
    }
    for (const row of section.rows) {
      const inputHtml  = row.input.split("\n").map(line => formatCCTInlineText(line)).join("<br>");
      const effectHtml = row.effect.replace(/\n/g, "<br>");
      const isSA = row.name === "Standard Attack";
      const saLink = isSA
        ? ` <button class="combo-clan-link-btn" title="View Clan Attack Combos">Clan Combo →</button>`
        : "";
      html += `
      <tr class="combos-table__row combos-table__row--melee">
        <td class="combos-table__td combos-table__td--melee-name">${row.name}</td>
        <td class="combos-table__td combos-table__td--melee-input">${inputHtml}</td>
        <td class="combos-table__td combos-table__td--explanation">${effectHtml}${saLink}</td>
        <td class="combos-table__td combos-table__td--melee-damage">${buildDamageBadge(row.damage)}</td>
      </tr>`;
    }
    html += `</tbody>`;
  }

  html += `</table></div>`;
  container.innerHTML = html;

  container.querySelectorAll(".combo-clan-link-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (typeof navigateToClanCombos === "function") navigateToClanCombos();
    });
  });
}

// ── Clan Attack Combo Data ─────────────────────────────────────
const CLAN_COMBOS = {
  brujah: {
    name: "Brujah",
    steps: 4,
    lightType: "Lunging",
    rows: [
      { step: 1, lightDmg: 8,  lightMontage: "Brujah_Light1", lightLen: 0.81, heavyDmg: 15, heavyMontage: "Brujah_Heavy1", heavyLen: 0.80, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 2, lightDmg: 8,  lightMontage: "Brujah_Light2", lightLen: 1.11, heavyDmg: 15, heavyMontage: "Brujah_Heavy2", heavyLen: 0.80, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 3, lightDmg: 8,  lightMontage: "Brujah_Light3", lightLen: 1.11, heavyDmg: 15, heavyMontage: "Brujah_Heavy1", heavyLen: 0.80, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 4, lightDmg: 8,  lightMontage: "Brujah_Light4", lightLen: 2.29, heavyDmg: 15, heavyMontage: "Brujah_Heavy2", heavyLen: 0.80, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.70, finisher: true },
    ],
    notes: [
      "Most uniform combo — all lights deal 8, all heavies deal 15",
      "Step 4 long combo delay (0.70) acts as the finisher pause",
      "Windup animation almost fully visible — 0.89s montage vs 1.0s MaxWU (~89% seen)",
      "Heavy animation barely clipped in a flowing combo — 0.80s montage, 0.70s window (87% plays)",
    ],
    dps: {
      optimalPattern: ["L","L","L","L"],
      optimalDps: 15.24, optimalDmg: 32, optimalTime: 2.10,
      allLightDps: 15.24,
      burstDmg: 60,
      note: "No heavy earns its charge time — all heavy marginals ≤ 14.0 DPS vs 15.24 baseline. Spam lights.",
    },
  },
  tremere: {
    name: "Tremere",
    steps: 4,
    lightType: "NoLunge",
    rows: [
      { step: 1, lightDmg: 8,  lightMontage: "TR_Light_1", lightLen: 0.92, heavyDmg: 12, heavyMontage: "TR_Heavy_1", heavyLen: 1.33, minWindup: 0.2,  maxWindup: 0.8, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 2, lightDmg: 8,  lightMontage: "TR_Light_2", lightLen: 0.92, heavyDmg: 12, heavyMontage: "TR_Heavy_2", heavyLen: 1.33, minWindup: 0.15, maxWindup: 0.8, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 3, lightDmg: 8,  lightMontage: "TR_Light_1", lightLen: 0.92, heavyDmg: 12, heavyMontage: "TR_Heavy_1", heavyLen: 1.33, minWindup: 0.15, maxWindup: 0.8, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 4, lightDmg: 8,  lightMontage: "TR_Light_2", lightLen: 0.92, heavyDmg: 12, heavyMontage: "TR_Heavy_2", heavyLen: 1.33, minWindup: 0.15, maxWindup: 0.8, heavyThresh: 0.7, comboDelay: 0.70, finisher: true },
    ],
    notes: [
      "No lunge on light attacks — hit trace range compensates (400 vs 170 units)",
      "Heavy damage capped at 12 (lowest of all clans)",
      "MaxWindup capped at 0.8 vs 1.0 for other clans",
      "Windup animation rarely seen in full — 2.33–2.60s montage cut at 0.8s MaxWU (only 31–34% plays)",
    ],
    dps: {
      optimalPattern: ["L","L","L","L"],
      optimalDps: 14.22, optimalDmg: 32, optimalTime: 2.25,
      allLightDps: 14.22,
      burstDmg: 48,
      note: "Heavies are actively bad — 12 dmg in 0.86s loses to two lights (16 dmg in ~0.90s).",
    },
  },
  banuHaqim: {
    name: "Banu Haqim",
    steps: 5,
    lightType: "Lunging",
    rows: [
      { step: 1, lightDmg: 6,  lightMontage: "BA_Light_1", lightLen: 0.88, heavyDmg: 15, heavyMontage: "BA_Heavy_1", heavyLen: 1.53, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7,  comboDelay: 0.36 },
      { step: 2, lightDmg: 5,  lightMontage: "BA_Light_2", lightLen: 0.88, heavyDmg: 15, heavyMontage: "BA_Heavy_2", heavyLen: 1.53, minWindup: 0.1, maxWindup: 1.0, heavyThresh: 0.7,  comboDelay: 0.15 },
      { step: 3, lightDmg: 5,  lightMontage: "BA_Light_3", lightLen: 0.88, heavyDmg: 15, heavyMontage: "BA_Heavy_1", heavyLen: 1.53, minWindup: 0.0, maxWindup: 1.0, heavyThresh: 0.7,  comboDelay: 0.35 },
      { step: 4, lightDmg: 7,  lightMontage: "BA_Light_4", lightLen: 0.88, heavyDmg: 15, heavyMontage: "BA_Heavy_2", heavyLen: 1.53, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7,  comboDelay: 0.30 },
      { step: 5, lightDmg: 10, lightMontage: "BA_Light_5", lightLen: 1.12, heavyDmg: 18, heavyMontage: "BA_Heavy_1", heavyLen: 1.53, minWindup: 0.2, maxWindup: 1.1, heavyThresh: 0.9,  comboDelay: 0.80, finisher: true },
    ],
    notes: [
      "Step 5 finisher: highest heavy threshold (0.9), longest delay, peak damage (18)",
      "Step 3 has no minimum windup — can release instantly",
      "ThresholdBias (0.2) on most steps adds input leniency to heavy triggering",
      "Step 5 montages (windup, light, heavy) are shared with Toreador's step 5",
    ],
    dps: {
      optimalPattern: ["H","H","H","H","L"],
      optimalDps: 14.11, optimalDmg: 70, optimalTime: 4.96,
      allLightDps: 12.41,
      burstDmg: 78,
      note: "Best full-chain DPS is H/H/H/H/L; step 3 is a per-step tie, but heavy preserves the strongest full-combo average before a light finisher.",
    },
  },
  ventrue: {
    name: "Ventrue",
    steps: 4,
    lightType: "Lunging",
    rows: [
      { step: 1, lightDmg: 8,  lightMontage: "VT_Light_3",  lightLen: 0.86, heavyDmg: 15, heavyMontage: "VE_Heavy_Recycle_01", heavyLen: 1.40, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 2, lightDmg: 7,  lightMontage: "VT_Light_4",  lightLen: 0.87, heavyDmg: 15, heavyMontage: "VE_Heavy_Recycle_02", heavyLen: 1.40, minWindup: 0.1, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 3, lightDmg: 7,  lightMontage: "VE_Light_3",  lightLen: 0.73, heavyDmg: 15, heavyMontage: "VE_Heavy_Recycle_01", heavyLen: 1.40, minWindup: 0.1, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 4, lightDmg: 7,  lightMontage: "VT_Light_5",  lightLen: 1.01, heavyDmg: 15, heavyMontage: "VE_Heavy_Recycle_02", heavyLen: 1.40, minWindup: 0.1, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.70, finisher: true },
    ],
    notes: [
      "Only clan with a dedicated guard-stance idle animation (Shield Idle)",
      "Windup animations are the longest of any clan (2.18–2.80s) but only ~36–46% plays within the 1.0s MaxWU",
    ],
    dps: {
      optimalPattern: ["H","L","L","L"],
      optimalDps: 13.85, optimalDmg: 36, optimalTime: 2.60,
      allLightDps: 13.81,
      burstDmg: 60,
      note: "Step-1 heavy marginal (14.0 DPS) barely clears the 13.81 baseline — negligible gain over all-lights.",
    },
  },
  lasombra: {
    name: "Lasombra",
    steps: 4,
    lightType: "Lunging",
    rows: [
      { step: 1, lightDmg: 8,  lightMontage: "LA_Light_1",   lightLen: 1.13, heavyDmg: 15, heavyMontage: "LA_Heavy_Right", heavyLen: 0.73, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 2, lightDmg: 8,  lightMontage: "LA_Light_2",   lightLen: 0.77, heavyDmg: 15, heavyMontage: "LA_Heavy_Right", heavyLen: 0.73, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 3, lightDmg: 8,  lightMontage: "LA_Light_3",   lightLen: 1.11, heavyDmg: 15, heavyMontage: "LA_Heavy_Right", heavyLen: 0.73, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 4, lightDmg: 8,  lightMontage: "LA_Light_End", lightLen: 1.16, heavyDmg: 15, heavyMontage: "LA_Heavy_Right", heavyLen: 0.73, minWindup: 0.2, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.70, finisher: true },
    ],
    notes: [
      "Borrows Ventrue windup montages — no dedicated Lasombra windups",
      "Single heavy animation used on every step",
      "Step 4 light uses a dedicated combo-ender animation",
      "Heavy animation almost fully plays in a flowing combo — 0.73s montage with only 0.03s clipped at the 0.70s window",
    ],
    dps: {
      optimalPattern: ["L","L","L","L"],
      optimalDps: 15.24, optimalDmg: 32, optimalTime: 2.10,
      allLightDps: 15.24,
      burstDmg: 60,
      note: "Identical structure to Brujah — spam lights. No heavy earns its charge time.",
    },
  },
  toreador: {
    name: "Toreador",
    steps: 5,
    lightType: "Lunging",
    rows: [
      { step: 1, lightDmg: 5,  lightMontage: "Tor_Light_01", lightLen: 1.30, heavyDmg: 15, heavyMontage: "Tor_Heavy_01", heavyLen: 1.53, minWindup: 0.06, maxWindup: 1.0, heavyThresh: 0.70, comboDelay: 0.25 },
      { step: 2, lightDmg: 5,  lightMontage: "Tor_Light_02", lightLen: 1.30, heavyDmg: 15, heavyMontage: "Tor_Heavy_02", heavyLen: 1.30, minWindup: 0.03, maxWindup: 1.0, heavyThresh: 0.70, comboDelay: 0.25 },
      { step: 3, lightDmg: 6,  lightMontage: "BA_Light_3",   lightLen: 0.88, heavyDmg: 12, heavyMontage: "Tor_Heavy_01", heavyLen: 1.53, minWindup: 0.03, maxWindup: 1.0, heavyThresh: 0.55, comboDelay: 0.25 },
      { step: 4, lightDmg: 6,  lightMontage: "BA_Light_4",   lightLen: 0.88, heavyDmg: 12, heavyMontage: "Tor_Heavy_02", heavyLen: 1.30, minWindup: 0.03, maxWindup: 1.0, heavyThresh: 0.55, comboDelay: 0.25 },
      { step: 5, lightDmg: 7,  lightMontage: "BA_Light_5",   lightLen: 1.12, heavyDmg: 18, heavyMontage: "BA_Heavy_1",   heavyLen: 1.53, minWindup: 0.1,  maxWindup: 1.1, heavyThresh: 0.45, comboDelay: 0.80, finisher: true },
    ],
    notes: [
      "Fastest combo chain of all clans (MinWindup as low as 0.03)",
      "Heavy threshold drops across the chain — heavies become easier to trigger as the combo progresses",
      "Steps 3–5 share animations with Banu Haqim",
      "ThresholdBias (0.2) on most steps adds input leniency to heavy triggering",
      "Windup animation least visible of all clans — 3.47s montage, only 29–32% plays at MaxWU",
    ],
    dps: {
      optimalPattern: ["L","L","L","L","H"],
      optimalDps: 16.36, optimalDmg: 40, optimalTime: 2.445,
      allLightDps: 14.15,
      burstDmg: 72,
      note: "Step-5 heavy: 0.45 threshold × 1.1s MaxWU = only 0.495s hold for 18 dmg — best marginal in the game (27.9 DPS).",
    },
  },
};

let clanCombosFilter = null; // null = all clans

function buildPatternFromMask(length, mask) {
  const pattern = [];
  for (let i = 0; i < length; i++) pattern.push((mask & (1 << i)) ? "H" : "L");
  return pattern;
}

function evaluateClanPattern(rows, pattern) {
  let damage = 0;
  let time = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const type = pattern[i];
    if (type === "H") {
      damage += row.heavyDmg;
      time += getClanHeavyStepTime(row);
    } else {
      damage += row.lightDmg;
      time += getClanLightStepTime(row);
    }
  }
  return {
    pattern,
    damage,
    time,
    dps: time > 0 ? (damage / time) : 0,
  };
}

function findOptimalPattern(rows) {
  const length = rows.length;
  let best = null;
  for (let mask = 0; mask < (1 << length); mask++) {
    const pattern = buildPatternFromMask(length, mask);
    const result = evaluateClanPattern(rows, pattern);
    if (!best || result.dps > best.dps) best = result;
  }
  return best;
}

function findSingleRunPeakPattern(rows) {
  const pattern = rows.map((row) => {
    const lightTime = getClanLightStepTime(row);
    const heavyTime = getClanHeavyStepTime(row);
    const lightDps = lightTime > 0 ? (row.lightDmg / lightTime) : 0;
    const heavyDps = heavyTime > 0 ? (row.heavyDmg / heavyTime) : 0;
    return heavyDps > lightDps ? "H" : "L";
  });
  return evaluateClanPattern(rows, pattern);
}

function evaluateLoopPattern(rows, cyclePattern, cycles) {
  const base = evaluateClanPattern(rows, cyclePattern);
  return {
    pattern: cyclePattern,
    cycles,
    damage: base.damage * cycles,
    time: base.time * cycles,
    dps: base.dps,
  };
}

function buildClanComboMiniTable(clanId) {
  const data = CLAN_COMBOS[clanId];
  if (!data) return "";
  let html = `<table class="clan-combo-mini-table">`;
  html += `<thead><tr>
    <th>Step</th>
    <th title="Light attack damage">L.Dmg</th>
    <th title="Heavy attack damage">H.Dmg</th>
    <th title="Hold threshold to trigger heavy (0–1)">H.Thresh</th>
  </tr></thead><tbody>`;
  for (const row of data.rows) {
    const finClass = row.finisher ? " clan-combo-mini-table__row--finisher" : "";
    html += `<tr class="${finClass}" data-step="${row.step - 1}">
      <td>${row.step}${row.finisher ? " ★" : ""}</td>
      <td data-cell="ldmg">${row.lightDmg}</td>
      <td class="${row.heavyDmg >= 18 ? "clan-combo__dmg--peak" : ""}" data-cell="hdmg">${row.heavyDmg}</td>
      <td class="${row.heavyThresh <= 0.5 ? "clan-combo__thresh--easy" : row.heavyThresh >= 0.85 ? "clan-combo__thresh--hard" : ""}">${row.heavyThresh.toFixed(2)}</td>
    </tr>`;
  }
  html += `</tbody></table>`;
  return html;
}

function renderClanCombosPage() {
  const container = document.getElementById("combos-subpage-clan");
  if (!container) return;

  const selectedClan = typeof state !== "undefined" ? state.selectedClan : null;
  const clansToShow = clanCombosFilter
    ? [clanCombosFilter]
    : ["brujah", "tremere", "banuHaqim", "ventrue", "lasombra", "toreador"];

  // Filter bar
  let html = `<div class="combos-layout"><div class="clan-combos-header">`;
  html += `<h2 class="combos-header__title">Clan Attack Data</h2>`;
  html += `<p class="combos-header__sub">Detailed data for each clan's light and heavy attack chains, alongside Phyre's universal combat actions — kicks, dashes, and shunts.</p>`;
  html += `<div class="clan-combos-filter-row">`;
  html += `<div class="clan-combos-filter">`;
  html += `<button class="clan-combos-filter__btn${!clanCombosFilter ? " active" : ""}" data-filter="">All</button>`;
  for (const clanId of ["brujah", "tremere", "banuHaqim", "ventrue", "lasombra", "toreador"]) {
    const clan = typeof CLANS !== "undefined" ? CLANS[clanId] : null;
    const isSelected = selectedClan === clanId;
    const isActive = clanCombosFilter === clanId;
    html += `<button class="clan-combos-filter__btn${isActive ? " active" : ""}${isSelected ? " is-selected-clan" : ""}" data-filter="${clanId}" title="${clan ? clan.name : clanId}">`;
    if (clan && clan.logo) html += `<img src="${clan.logo}" alt="${clan.name}">`;
    html += `</button>`;
  }
  html += `</div>`; // clan-combos-filter
  html += `<div class="clan-combos-jump-btns">`;
  html += `<button class="clan-combos-filter__btn clan-combos-notes-btn" id="clan-combos-kicks-btn" title="Special Attacks"><img src="assets/N_Textures/AbilityTree/AbilitiesIcons/T_UI_Icon_Fleetness.png" alt="" style="transform:rotate(270deg)"> Special Attacks</button>`;
  html += `<button class="clan-combos-filter__btn clan-combos-notes-btn" id="clan-combos-mobility-btn" title="Dash &amp; Shunt"><img src="assets/N_Textures/AbilityTree/AbilitiesIcons/T_UI_Icon_BlurredMovement.png" alt=""> Mobility</button>`;
  html += `<button class="clan-combos-filter__btn clan-combos-notes-btn" id="clan-combos-notes-btn" title="Cross-Clan Notes"><img src="${typeof UI !== 'undefined' && UI.phyreMark ? UI.phyreMark : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}" alt=""> Notes</button>`;
  html += `</div>`; // clan-combos-jump-btns
  html += `<div class="clan-combos-legend"><span class="clan-combos-legend__item clan-combos-legend__item--finisher">★ Finisher step</span><span class="clan-combos-legend__item clan-combos-legend__item--selected">Highlighted = your clan</span></div>`;
  html += `</div>`; // filter-row
  html += `<ul class="combos-header__primer">
    <li><strong class="combos-header__primer-label combos-header__primer-label--light">Light attacks:</strong> Fast, low-commitment swings — easy for enemies to block, but excellent for juggling airborne targets and chaining hit-confirms.</li>
    <li><strong class="combos-header__primer-label combos-header__primer-label--heavy">Heavy attacks:</strong> Slower wind-up, but bypass guard — they break blocks outright and can knock enemies back or launch them into the air.</li>
    <li><strong>MinWU/MaxWU:</strong> shown as <code>min/max</code> hold time in seconds (for example <code>0.2/1.0</code>). MinWU is the earliest release that can fire; MaxWU is the auto-fire cap and timing basis for heavy threshold checks.</li>
  </ul>`;
  html += `</div>`; // clan-combos-header

  // Per-clan tables
  html += `<div class="clan-combos-tables">`;

  for (const clanId of clansToShow) {
    const data = CLAN_COMBOS[clanId];
    const clan = typeof CLANS !== "undefined" ? CLANS[clanId] : null;
    const isSelected = selectedClan === clanId;

    html += `<div class="clan-combo-block${isSelected ? " clan-combo-block--selected" : ""}" id="clan-combo-block-${clanId}">`;

    // Clan heading
    html += `<div class="clan-combo-block__heading">`;
    if (clan && clan.logo) html += `<img class="clan-combo-block__logo" src="${clan.logo}" alt="${data.name}">`;
    html += `<span class="clan-combo-block__name">${data.name}</span>`;
    html += `<span class="clan-combo-block__meta">${data.steps} steps &middot; ${data.lightType === "NoLunge" ? "No-Lunge" : "Lunging"} lights</span>`;
    if (typeof TIERLIST_ITEMS !== 'undefined') {
      const _mClanShort = clanId === 'banuHaqim' ? 'banu' : clanId;
      const _mItem = TIERLIST_ITEMS.find(i => i.id === `melee-${_mClanShort}`);
      if (_mItem && _mItem.tier) {
        const _mLabel = _mItem.tier === 's-plus' ? 'S+' : _mItem.tier.toUpperCase();
        html += `<button class="detail-panel__tier-rank tier-rank--${_mItem.tier}" data-tierlist-id="${_mItem.id}">Melee: ${_mLabel}</button>`;
      }
    }
    if (data.rows && data.rows.length) {
      const comboPeak = findSingleRunPeakPattern(data.rows);
      const loopCycleOptimal = findOptimalPattern(data.rows);
      const loopOptimal = evaluateLoopPattern(data.rows, loopCycleOptimal.pattern, 3);
      const comboPatHtml = comboPeak.pattern.map(t =>
        `<span class="dps-chip__pat-step dps-chip__pat-step--${t === 'H' ? 'h' : 'l'}">${t}</span>`
      ).join("");
      const loopPatHtml = loopOptimal.pattern.map(t =>
        `<span class="dps-chip__pat-step dps-chip__pat-step--${t === 'H' ? 'h' : 'l'}">${t}</span>`
      ).join("");
      html += `<div class="dps-chip-group">`;
      html += `<div class="dps-chip dps-chip--opt" data-clan="${clanId}" data-mode="combo" data-pattern="${comboPeak.pattern.join("")}" tabindex="0" role="button" title="Single-run combo peak mix (step-by-step best damage rate)">`;
      html += `<span class="dps-chip__head"><span class="dps-chip__label">Combo</span><span class="dps-chip__val">${comboPeak.dps.toFixed(2)}</span></span>`;
      html += `<div class="dps-chip__panel"><span class="dps-chip__panel-row"><span class="dps-chip__row-label">Dmg</span><span class="dps-chip__row-val">${comboPeak.damage}</span></span><span class="dps-chip__panel-row"><span class="dps-chip__row-label">DPS</span><span class="dps-chip__row-val">${comboPeak.dps.toFixed(2)}</span></span><span class="dps-chip__rotation">${comboPatHtml}</span><span class="dps-chip__panel-row"><span class="dps-chip__row-label">Time</span><span class="dps-chip__row-val">${comboPeak.time.toFixed(2)}s</span></span></div>`;
      html += `</div>`;
      html += `<div class="dps-chip dps-chip--lights" data-clan="${clanId}" data-mode="loop" data-pattern="${loopOptimal.pattern.join("")}" tabindex="0" role="button" title="Sustained DPS across repeated combos">`;
      html += `<span class="dps-chip__head"><span class="dps-chip__label">Loop</span><span class="dps-chip__val">${loopOptimal.dps.toFixed(2)}</span></span>`;
      html += `<div class="dps-chip__panel"><span class="dps-chip__panel-row"><span class="dps-chip__row-label">DPS</span><span class="dps-chip__row-val">${loopOptimal.dps.toFixed(2)}</span></span><span class="dps-chip__panel-row"><span class="dps-chip__row-label">Dmg</span><span class="dps-chip__row-val">${loopOptimal.damage}</span></span><span class="dps-chip__rotation">${loopPatHtml}</span><span class="dps-chip__panel-row"><span class="dps-chip__row-label">Time</span><span class="dps-chip__row-val">${loopOptimal.time.toFixed(2)}s (x${loopOptimal.cycles})</span></span></div>`;
      html += `</div>`;
      html += `</div>`; // dps-chip-group
    }
    html += `</div>`;

    // Step table
    html += `<table class="combos-table clan-combos-table">`;
    html += `<thead><tr>
      <th class="combos-table__th clan-combos-table__th--step">Step</th>
      <th class="combos-table__th clan-combos-table__th--steptime" title="Time between light attacks">Light Step Time</th>
      <th class="combos-table__th clan-combos-table__th--ldmg" title="Light attack damage">Light Dmg</th>
      <th class="combos-table__th clan-combos-table__th--dps" title="Light damage per second">Light Dmg/s</th>
      <th class="combos-table__th clan-combos-table__th--steptime" title="Time between heavy attacks">Heavy Step Time</th>
      <th class="combos-table__th clan-combos-table__th--hdmg" title="Heavy attack damage">Heavy Dmg</th>
      <th class="combos-table__th clan-combos-table__th--dps" title="Heavy damage per second">Heavy Dmg/s</th>
    </tr></thead><tbody>`;

    for (const row of data.rows) {
      const isFinisher = row.finisher;
      html += `<tr class="clan-combos-table__row${isFinisher ? " clan-combos-table__row--finisher" : ""}" data-step="${row.step - 1}">`;
      html += `<td class="combos-table__td clan-combos-table__td--step">${row.step}${isFinisher ? `<span class="clan-combo-star" title="Finisher">★</span>` : ""}</td>`;
      
      const minWindup = typeof row.minWindup === "number" ? row.minWindup : 0.2;
      const lightStepTime = minWindup + row.comboDelay;
      const lightStepTooltip = `MinWU + ComboDelay = ${minWindup.toFixed(2)} + ${row.comboDelay.toFixed(2)} = ${lightStepTime.toFixed(2)}s`;
      html += `<td class="combos-table__td clan-combos-table__td--steptime" title="${lightStepTooltip}">${lightStepTime.toFixed(2)}s</td>`;
      
      const lightMontageTooltip = row.lightMontage ? `${row.lightMontage}` : "";
      html += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="ldmg" title="${lightMontageTooltip}">${row.lightDmg}</td>`;
      
      const lightDmgPerSec = row.lightDmg / lightStepTime;
      html += `<td class="combos-table__td clan-combos-table__td--dps">${lightDmgPerSec.toFixed(2)}</td>`;
      
      const heavyHoldTime = row.heavyThresh * row.maxWindup;
      const heavyStepTime = heavyHoldTime + row.comboDelay;
      const heavyStepTooltip = `(HeavyThreshold × MaxWU) + ComboDelay = (${row.heavyThresh.toFixed(2)} × ${row.maxWindup.toFixed(1)}) + ${row.comboDelay.toFixed(2)} = ${heavyStepTime.toFixed(2)}s`;
      html += `<td class="combos-table__td clan-combos-table__td--steptime" title="${heavyStepTooltip}">${heavyStepTime.toFixed(2)}s</td>`;
      
      const heavyClass = row.heavyDmg >= 18 ? "clan-combo__dmg--peak" : "";
      const heavyMontageTooltip = row.heavyMontage ? `${row.heavyMontage}` : "";
      html += `<td class="combos-table__td clan-combos-table__td--dmg ${heavyClass}" data-cell="hdmg" title="${heavyMontageTooltip}">${row.heavyDmg}</td>`;
      
      const heavyDmgPerSec = row.heavyDmg / heavyStepTime;
      html += `<td class="combos-table__td clan-combos-table__td--dps">${heavyDmgPerSec.toFixed(2)}</td>`;
      
      html += `</tr>`;
    }
    html += `</tbody></table>`;

    // Notes
    if (data.notes && data.notes.length) {
      html += `<ul class="clan-combo-block__notes">`;
      for (const note of data.notes) {
        html += `<li>${note}</li>`;
      }
      html += `</ul>`;
    }

    html += `</div>`; // clan-combo-block
  }

  html += `</div></div>`; // clan-combos-tables / combos-layout

  // ── Special Attacks section (Kicks + Riser) ─────────────────
  html += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad" id="clan-kicks-section">`;
  html += `<div class="crossclan-section-heading">`;
  html += `<img class="crossclan-section-heading__icon" src="assets/N_Textures/AbilityTree/AbilitiesIcons/T_UI_Icon_Fleetness.png" alt="Special Attacks" style="transform:rotate(270deg)">`;
  html += `<span>Special Attacks</span>`;
  html += `<span class="crossclan-section-heading__sub">All clans — clan-agnostic</span>`;
  html += `</div>`;

  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Kick Data</summary><div class="crossclan-lozenge__body">`;
  html += `<table class="combos-table crossclan-table kicks-table">`;
  html += `<thead><tr>
    <th class="combos-table__th kicks-table__th--name">Kick</th>
    <th class="combos-table__th kicks-table__th--input">Input</th>
    <th class="combos-table__th kicks-table__th--len" title="Full animation length">Anim Len</th>
    <th class="combos-table__th kicks-table__th--dmg" title="Base damage">Dmg</th>
    <th class="combos-table__th kicks-table__th--bonus" title="Conditional bonus damage">Bonus Dmg</th>
    <th class="combos-table__th kicks-table__th--range" title="Hit trace range (units)">Trace</th>
    <th class="combos-table__th kicks-table__th--delay" title="Time before next combo input is accepted">Combo Delay</th>
    <th class="combos-table__th kicks-table__th--kb" title="Knockback impulse applied to target">Knockback</th>
    <th class="combos-table__th kicks-table__th--block" title="Behaviour against an actively blocking enemy">vs. Block</th>
    <th class="combos-table__th kicks-table__th--cd" title="Cooldown before kick can be used again">Cooldown</th>
  </tr></thead><tbody>`;

  const _ki = (src, alt) => `<img class="cct-inline-key" src="assets/Keyboard/${src}" alt="${alt}" title="${alt}">`;
  const _lmb = _ki('T_UI_Keyboard_Mouse_Left_Click.png', 'LMB');

  const kickRows = [
    { name: "Front",   context: "Ground, moving forward",  input: `Forward + Kick<br>(${_ki('T_UI_Keyboard_W.png','W')}+${_lmb})`,                                                                              animLen: "1.17s", dmg: "5",     dmgPeak: false, dmgTip: "",                                                                                  bonus: "+5 vs Stunned",   bonusTip: "Doubles to 10 vs Combat.Status.Stunned", range: 180, radius: 35, comboDelay: "0.50s", kb: "H: 300",           hitReact: "Stumble", block: "Connects (flinch)", blockBreak: false, blockTip: "Combat.Ability.Melee.Block is in FlinchOnlyTags — the kick lands but produces only a flinch reaction, not a stumble.", cooldown: "0.3s", cdPeak: false },
    { name: "Back",    context: "Ground, moving backward", input: `Back + Kick<br>(${_ki('T_UI_Keyboard_S.png','S')}+${_lmb})`,                                                                                animLen: "1.83s", dmg: "7",     dmgPeak: false, dmgTip: "",                                                                                  bonus: "+1.5 (always?)", bonusTip: "No condition tag on SpecialDamageBonus — may always apply; also applies GE_BackKickenemyaffect (5s stat debuff)", range: 250, radius: 35, comboDelay: "1.00s", kb: "H: 800",           hitReact: "—",       block: "Bypasses",          blockBreak: true,  blockTip: "Block tag is not in FlinchOnlyTags — kick goes through guard.",                                                            cooldown: "0.3s", cdPeak: false },
    { name: "Side",    context: "Ground, left or right",   input: `Left/Right + Kick<br>(${_ki('T_UI_Keyboard_A.png','A')}/${_ki('T_UI_Keyboard_D.png','D')}+${_lmb})`,                                        animLen: "1.20s", dmg: "7",     dmgPeak: false, dmgTip: "",                                                                                  bonus: "+4 vs TK-Pulled",bonusTip: "+4 vs Combat.Status.Hitreact.TkPull (TK combo synergy) — trace radius 60 vs standard 35", range: 270, radius: 60, comboDelay: "0.80s", kb: "H: 800",           hitReact: "Stumble", block: "Bypasses",          blockBreak: true,  blockTip: "Block tag is not in FlinchOnlyTags — kick goes through guard.",                                                            cooldown: "0.3s", cdPeak: false },
    { name: "Sliding", context: "Sprinting",               input: `Sprint + Kick<br>(${_ki('T_UI_Keyboard_CTRL_Left.png','ctrl')}+${_lmb})`,                                                                     animLen: "1.50s", dmg: "15",    dmgPeak: false, dmgTip: "",                                                                                  bonus: "—",              bonusTip: "",  range: 300, radius: 40, comboDelay: "1.00s", kb: "H: 1400, V: +400", hitReact: "Stumble", block: "Bypasses",          blockBreak: true,  blockTip: "Damage Should Execute: true — same mechanism as heavy punch, which is confirmed to bypass block.",                          cooldown: "0.3s", cdPeak: false },
    { name: "Drop",    context: "Airborne",                input: `Airborne + Kick<br>(${_ki('T_UI_Keyboard_SpaceBar.png','Space')} &#8594; ${_lmb})`,                                                           animLen: "1.50s", dmg: "15–70", dmgPeak: true,  dmgTip: "Velocity-scaled: 15 base + up to 55 bonus depending on fall speed (Hit Damage 25 listed in CDO).", bonus: "—",              bonusTip: "",  range: 200, radius: 35, comboDelay: "1.00s", kb: "H: 2000, V: −200", hitReact: "Stumble", block: "Bypasses",          blockBreak: true,  blockTip: "Damage Should Execute: true — bypasses block entirely.",                                                                    cooldown: "6.0s", cdPeak: true  },
  ];

  for (const k of kickRows) {
    html += `<tr class="combos-table__tr${k.cdPeak ? " kicks-table__row--cooldown" : ""}">`;
    html += `<td class="combos-table__td kicks-table__td--name">${k.name}</td>`;
    html += `<td class="combos-table__td kicks-table__td--input" title="${k.context}">${k.input}</td>`;
    html += `<td class="combos-table__td clan-combos-table__td--len">${k.animLen}</td>`;
    html += `<td class="combos-table__td clan-combos-table__td--dmg${k.dmgPeak ? " clan-combo__dmg--peak" : ""}"${k.dmgTip ? ` title="${k.dmgTip}"` : ""}>${k.dmg}</td>`;
    html += `<td class="combos-table__td kicks-table__td--bonus"${k.bonusTip ? ` title="${k.bonusTip}"` : ""}>${k.bonus}</td>`;
    html += `<td class="combos-table__td kicks-table__td--range" title="Trace range: ${k.range} | Radius: ${k.radius}">${k.range} <span class="crossclan-note">(r:${k.radius})</span></td>`;
    html += `<td class="combos-table__td clan-combos-table__td--delay">${k.comboDelay}</td>`;
    html += `<td class="combos-table__td kicks-table__td--kb">${k.kb}</td>`;
    html += `<td class="combos-table__td kicks-table__td--block${k.blockBreak ? " kicks-table__td--block-break" : ""}"${k.blockTip ? ` title="${k.blockTip}"` : ""}>${k.block}</td>`;
    html += `<td class="combos-table__td kicks-table__td--cd${k.cdPeak ? " kicks-table__td--cd-peak" : ""}">${k.cooldown}</td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  html += `<ul class="crossclan-list crossclan-list--notes">
    <li><strong>Front kick</strong> doubles damage vs <code>Stunned</code> enemies (5 → 10).</li>
    <li><strong>Side kick</strong> synergises with Telekinesis — bonus damage vs TK-pulled enemies; also has a wider trace radius (60 vs 35).</li>
    <li><strong>Back kick</strong> applies a 5s multiplicative stat debuff (<code>GE_BackKickenemyaffect</code>) on the target.</li>
    <li><strong>Sliding kick</strong> launches the enemy upward (V: +400); <strong>drop kick</strong> pins them downward (V: −200).</li>
    <li><strong>Drop kick</strong> damage scales with fall speed: <strong>15</strong> at minimum, up to <strong>70</strong> at terminal velocity (formula: 15 + velocity-factor × 55). The faster Phyre is falling on impact, the harder the hit.</li>
    <li><strong>Drop kick</strong> has a 6s cooldown — but it expires the moment Phyre lands, so in practice you can chain drop kicks as fast as you can jump again. All other kicks share a 0.3s cooldown.</li>
    <li><strong>Block-breaking:</strong> Back, Side, Sliding, and Drop kicks all <strong>bypass</strong> blocking enemies — they punch straight through guard. Only the front kick is partially absorbed (it connects but produces a flinch reaction rather than a full stumble).</li>
    <li><strong>Side kick</strong> uses <code>Kick_Right</code> mirrored for left input — <code>Kick_Left</code> exists in exports but is not referenced.</li>
  </ul>`;
  html += `</div></details>`;

  // ── Riser lozenge (hidden codex move) ───────────────────────
  // The "Mysterious Attack" codex page is the in-game tutorial for this move:
  // forward → crouch → forward → light attack (Shoryuken DP motion). The codex
  // art itself encodes the input — three arrows converging on a fist.
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Riser <span class="crossclan-note">— hidden combat input</span></summary><div class="crossclan-lozenge__body">`;
  html += `<div class="riser-lozenge__layout">`;
  html += `<img class="riser-lozenge__codex" src="assets/T_UI_CodexCollectibleMysteriousAttack.png" alt="Mysterious Attack codex page — the input is encoded in the art" title="Codex: Mysterious Attack — three arrows converging on a fist (the picture IS the input)">`;
  html += `<div class="riser-lozenge__body">`;
  html += `<p class="crossclan-note--sub">A hidden launcher unlocked by the <strong>Mysterious Attack</strong> codex page (Tutorials_AdvancedCombat). The codex art is the input notation: three arrows converging on a fist — a Shoryuken / dragon-punch motion.</p>`;
  html += `<p class="crossclan-note--sub"><strong>Input:</strong> ${_ki('T_UI_Keyboard_W.png','W')} &rarr; ${_ki('T_UI_Keyboard_CTRL_Left.png','ctrl')} &rarr; ${_ki('T_UI_Keyboard_W.png','W')} &rarr; ${_lmb} &nbsp;<span class="crossclan-note">(four distinct inputs — forward, crouch, forward, light attack. Performed fast enough, it fires as an instant uppercut.)</span></p>`;
  html += `<table class="combos-table crossclan-table"><thead><tr>`;
  html += `<th class="combos-table__th" style="width:18%">Property</th><th class="combos-table__th" style="width:82%">Value</th></tr></thead><tbody>`;
  const riserRows = [
    { prop: "Montage",          val: `<code class="crossclan-code">AM_Player_Riser</code>` },
    { prop: "GA",               val: `<code class="crossclan-code">GA_Playerattack_riser</code>` },
    { prop: "Hit Damage",       val: "8.0" },
    { prop: "Env. Damage",      val: "3.0" },
    { prop: "Special Bonus",    val: `<strong>+30.0</strong> &nbsp;<span class="crossclan-note">(huge conditional bonus — pushes total to 38)</span>` },
    { prop: "Knockback",        val: `H: 50, <strong>V: 700</strong> &nbsp;<span class="crossclan-note">(Shunt-tier launcher)</span>` },
    { prop: "Tag",              val: `<code class="crossclan-code">Combat.Attack.Launcher</code>` },
    { prop: "Death Behaviour",  val: `<code class="crossclan-code">Combat.Death.Impact.Heavy</code>` },
    { prop: "Lightweights",     val: "Launches lightweight enemies on contact" },
    { prop: "Execute",          val: `<strong>Damage Should Execute: true</strong> &mdash; auto-finishes low-HP enemies` },
    { prop: "Activation gate",  val: `<code class="crossclan-code">HasMatchingGameplayTag(CastInput) AND IsCrouching</code>` },
  ];
  for (const r of riserRows) {
    html += `<tr class="combos-table__tr"><td class="combos-table__td" style="font-family:'Cinzel',serif;font-size:11px;font-weight:600;color:var(--text-dim);white-space:nowrap">${r.prop}</td><td class="combos-table__td" style="font-size:11px">${r.val}</td></tr>`;
  }
  html += `</tbody></table>`;
  html += `<ul class="crossclan-list crossclan-list--notes">
    <li><strong>Four distinct inputs</strong> — the activation gate checks <code>IsCrouching</code> at the moment of attack, so the crouch tap has to register as its own input between the two forward taps. Done fast enough, the whole sequence resolves into an instant uppercut.</li>
    <li>The <strong>+30 special bonus</strong> stacks on top of the 8 base damage for a 38-damage launcher. No condition tag is set on the bonus — it appears to apply unconditionally.</li>
    <li>Vertical knockback of <strong>700</strong> puts Riser in the same launcher tier as Shunt — ideal for setting up a juggle or follow-up drop kick.</li>
    <li>Registered as a charge-combat state in <code>CG_ChargeCombat</code> alongside Shunt, sharing the same input-gate machinery.</li>
    <li>Discovered via the <strong>Mysterious Attack</strong> codex page (<code>Combat_MysteriousAttack</code>); the page art encodes the motion rather than spelling it out in text.</li>
  </ul>`;
  html += `</div>`; // riser-lozenge__body
  html += `</div>`; // riser-lozenge__layout
  html += `</div></details>`;

  html += `</div>`; // kicks section-wrap

  // ── Dash & Shunt section ────────────────────────────────────
  html += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad" id="clan-mobility-section">`;
  html += `<div class="crossclan-section-heading">`;
  html += `<img class="crossclan-section-heading__icon" src="assets/N_Textures/AbilityTree/AbilitiesIcons/T_UI_Icon_BlurredMovement.png" alt="Mobility">`;
  html += `<span>Dash &amp; Shunt</span>`;
  html += `<span class="crossclan-section-heading__sub">All clans — clan-agnostic</span>`;
  html += `</div>`;

  // Lozenge: Shunt
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Shunt</summary><div class="crossclan-lozenge__body">`;
  html += `<p class="crossclan-note--sub">A quick counter-strike — fires freely (no dodge required). Rewards timing it mid-enemy-swing.</p>`;
  html += `<table class="combos-table crossclan-table"><thead><tr>`;
  html += `<th class="combos-table__th" style="width:14%">Property</th><th class="combos-table__th" style="width:86%">Value</th></tr></thead><tbody>`;
  const shuntRows = [
    { prop: "Montage",       val: `<code class="crossclan-code">AM_Player_combat_shunt</code> — 0.95s` },
    { prop: "Damage",        val: `2.0 base <span class="crossclan-note">(×1.4 vs target mid-attack: AttackArmor / Melee.Heavy / Melee.Light)</span>` },
    { prop: "Env. Damage",   val: "3.0" },
    { prop: "Knockback",     val: "H: 1400, V: 0" },
    { prop: "Lunge",         val: "250 base / 400 targeted &nbsp;<span class='crossclan-note'>(0.1s delay)</span>" },
    { prop: "HitReact",      val: `Stumble <span class="crossclan-note">(heavy/armored enemies: flinch only)</span>` },
    { prop: "Multi Hit",     val: "Yes" },
    { prop: "Cooldown",      val: `<span class="clan-combo__thresh--easy">None</span>` },
    { prop: "Legeslip",      val: "0.7s follow-up dodge window after hit" },
    { prop: "Blocked by",    val: `<code class="crossclan-code">Combat.Ability.Skill.Telekinesis</code>, <code class="crossclan-code">Combat.Blocked</code>` },
  ];
  for (const r of shuntRows) {
    html += `<tr class="combos-table__tr"><td class="combos-table__td" style="font-family:'Cinzel',serif;font-size:11px;font-weight:600;color:var(--text-dim);white-space:nowrap">${r.prop}</td><td class="combos-table__td" style="font-size:11px">${r.val}</td></tr>`;
  }
  html += `</tbody></table>`;
  html += `<ul class="crossclan-list crossclan-list--notes">
    <li>The ×1.4 damage bonus only applies when the <strong>target</strong> has an active attack tag — rewards intercepting mid-swing.</li>
    <li>Heavy / armored enemies (<code>HeavyWeight</code>, <code>AttackArmor</code>) only flinch on shunt — they do not stumble.</li>
    <li>The <code>SpecialHitFilter</code> (<code>HitReact.Countered</code>, <code>Status.Disarmable</code>, <code>Ability.Ranged.Reload</code>) gates disarm/interrupt behaviour — shunt can interrupt a reload or disarm a flagged enemy.</li>
    <li>No cooldown — the only rate-limiter is <code>Combat.Blocked</code>.</li>
  </ul>`;
  html += `</div></details>`;

  // Lozenge: Regular Dash
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Regular Dash</summary><div class="crossclan-lozenge__body">`;
  html += `<p class="crossclan-note--sub">Ground and air evade. Grants iframes and enables kicks during the active window.</p>`;
  html += `<table class="combos-table crossclan-table"><thead><tr><th class="combos-table__th" style="width:14%">Property</th><th class="combos-table__th" style="width:86%">Value</th></tr></thead><tbody>`;
  const dashRows = [
    { prop: "Cooldown",       val: `<span class="clan-combo__thresh--easy">0.9s</span> (<code class="crossclan-code">GE_PlayerDash_Updated_cooldown</code>)` },
    { prop: "Duration",       val: "0.2s movement phase" },
    { prop: "Force",          val: "2400" },
    { prop: "Iframes",        val: `<code class="crossclan-code">Combat.Status.DamageImmune</code> applied during dash` },
    { prop: "Kick window",    val: `<code class="crossclan-code">GE_MidDash_Notify</code> (0.5s) — kick input accepted during this window` },
    { prop: "Spam penalty",   val: `DashAbuseDelay 0.6s; 3rd rapid dash triggers <code class="crossclan-code">GE_LockDash</code> 0.5s` },
    { prop: "Air dash",       val: `One per jump — <code class="crossclan-code">GE_PlayerAirDashCooldown</code> removed on landing` },
    { prop: "Cancels",        val: `<code class="crossclan-code">Combat.Ability.Melee</code>, <code class="crossclan-code">Combat.Ability.Evade</code>, <code class="crossclan-code">Movement.Glide</code>` },
  ];
  for (const r of dashRows) {
    html += `<tr class="combos-table__tr"><td class="combos-table__td" style="font-family:'Cinzel',serif;font-size:11px;font-weight:600;color:var(--text-dim);white-space:nowrap">${r.prop}</td><td class="combos-table__td" style="font-size:11px">${r.val}</td></tr>`;
  }
  html += `</tbody></table>`;
  const dashMontages = [
    { dir: "Forward",  montage: "AM_PlayerDash_Updated_F", len: "1.28s" },
    { dir: "Backward", montage: "AM_PlayerDash_Updated_B", len: "1.28s" },
    { dir: "Left",     montage: "AM_PlayerDash_Updated_L", len: "0.77s" },
    { dir: "Right",    montage: "AM_PlayerDash_Updated_R", len: "0.77s" },
  ];
  html += `<table class="combos-table crossclan-table" style="margin-top:8px"><thead><tr><th class="combos-table__th" style="width:18%">Direction</th><th class="combos-table__th" style="width:55%">Montage</th><th class="combos-table__th" style="width:27%" title="Full animation length including recovery">Anim Len</th></tr></thead><tbody>`;
  for (const m of dashMontages) {
    html += `<tr class="combos-table__tr"><td class="combos-table__td" style="font-size:11px;font-family:'Cinzel',serif;color:var(--text-dim)">${m.dir}</td><td class="combos-table__td"><code class="crossclan-code">${m.montage}</code></td><td class="combos-table__td" style="font-size:11px">${m.len}</td></tr>`;
  }
  html += `</tbody></table>`;
  html += `<ul class="crossclan-list crossclan-list--notes">
    <li>The 0.2s movement phase is short — the rest of the animation is a recovery roll (F/B ~1.08s of recovery; L/R ~0.57s).</li>
    <li>Kicks fire during the <code>GE_MidDash_Notify</code> 0.5s window, not the full dash tag duration.</li>
    <li>Three rapid dashes triggers a 0.5s lock — <code>GE_LockDash</code> prevents a 4th until it expires.</li>
  </ul>`;
  html += `</div></details>`;

  // Lozenge: Parry
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Parry</summary><div class="crossclan-lozenge__body">`;
  html += `<p class="crossclan-note--sub">Triggered by dashing <em>into</em> an incoming enemy <strong>light</strong> attack — Phyre absorbs the hit with no damage, and the attacker is left vulnerable.</p>`;
  html += `<table class="combos-table crossclan-table"><thead><tr><th class="combos-table__th" style="width:18%">Property</th><th class="combos-table__th" style="width:82%">Value</th></tr></thead><tbody>`;
  const parryRows = [
    { prop: "Trigger",        val: `Dash directly into an enemy <strong>light</strong> attack as it lands. Heavy attacks cannot be parried — they bypass guard.` },
    { prop: "Damage taken",   val: `<span class="clan-combo__thresh--easy">None</span> — incoming damage is fully negated` },
    { prop: "Attacker reaction", val: `Staggered briefly; flagged with <code class="crossclan-code">Combat.Status.Disarmable</code>` },
    { prop: "Follow-up",      val: `<strong>Shunt-Disarm</strong> within the disarm window strips the enemy's weapon (see <em>Shunt</em> above).` },
    { prop: "Vertical parry", val: `Parrying a jump-attack launches the attacker upward — sets up aerial juggles.` },
  ];
  for (const r of parryRows) {
    html += `<tr class="combos-table__tr"><td class="combos-table__td" style="font-family:'Cinzel',serif;font-size:11px;font-weight:600;color:var(--text-dim);white-space:nowrap">${r.prop}</td><td class="combos-table__td" style="font-size:11px">${r.val}</td></tr>`;
  }
  html += `</tbody></table>`;
  html += `<ul class="crossclan-list crossclan-list--notes">
    <li>Only <strong>light</strong> attacks can be parried — heavies still connect (and bypass block entirely).</li>
    <li>The dash i-frames cover the parry, so a mistimed parry still avoids damage as long as the dash is active.</li>
    <li>The disarm window is the same flag the Shunt-Disarm checks for (<code>SpecialHitFilter</code>: <code>HitReact.Countered</code>, <code>Status.Disarmable</code>, <code>Ability.Ranged.Reload</code>).</li>
    <li><button class="affect-link-btn" data-clan="toreador" data-tier="mastery">Blurred Momentum</button> allows for auto-parrying — incoming light attacks are deflected automatically while the ability is active.</li>
  </ul>`;
  html += `</div></details>`;

  // Lozenge: Combo Dashes
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Combo Dashes</summary><div class="crossclan-lozenge__body">`;
  html += `<p class="crossclan-note--sub">Shorter dedicated evades available within a melee combo. Both carry <code class="crossclan-code">Combat.Ability.Evade</code> — kicks can be triggered off them.</p>`;
  html += `<table class="combos-table crossclan-table"><thead><tr><th class="combos-table__th" style="width:12%">Variant</th><th class="combos-table__th" style="width:14%">Force</th><th class="combos-table__th" style="width:14%">Cooldown</th><th class="combos-table__th" style="width:16%">Anim Len</th><th class="combos-table__th">Notes</th></tr></thead><tbody>`;
  html += `<tr class="combos-table__tr"><td class="combos-table__td" style="font-family:'Cinzel',serif;font-size:11px;font-weight:600">Short</td><td class="combos-table__td" style="font-size:11px">700</td><td class="combos-table__td" style="font-size:11px">0.65s</td><td class="combos-table__td" style="font-size:11px">0.40s</td><td class="combos-table__td" style="font-size:11px">Counter window 0.35s; DashJumpBoost 1250</td></tr>`;
  html += `<tr class="combos-table__tr"><td class="combos-table__td" style="font-family:'Cinzel',serif;font-size:11px;font-weight:600">Long</td><td class="combos-table__td" style="font-size:11px">900</td><td class="combos-table__td" style="font-size:11px">1.0s</td><td class="combos-table__td" style="font-size:11px">Uses F/B/L/R</td><td class="combos-table__td" style="font-size:11px">No counter window property</td></tr>`;
  html += `</tbody></table>`;
  html += `<ul class="crossclan-list crossclan-list--notes">
    <li>Both use <code>AbilityTags: Combat.Ability.Evade</code> — kicks fire off them identically to regular dash.</li>
    <li>Both cancel: Melee, Evade, Glide, and <code>Combat.Ability.Skill.Telekinesis.PickUp</code>.</li>
  </ul>`;
  html += `</div></details>`;

  // Lozenge: Blocking
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Blocking</summary><div class="crossclan-lozenge__body">`;
  html += `<p class="crossclan-note--sub">From in-game Codex entries and CDO tags (build 22727210).</p>`;
  html += `<ul class="crossclan-list crossclan-list--notes">
    <li>Look directly at an incoming melee attack while idle to <strong>block</strong>, significantly reducing damage taken.</li>
    <li>Some <strong>heavier or ability-based attacks cannot be blocked</strong> — they connect through guard.</li>
    <li>The <strong>front kick</strong> still triggers block-flinch tags — enemies who are blocking will flinch but take reduced damage. Several other special moves do not share this profile.</li>
    <li>Special and heavy-context attacks are more likely to <strong>bypass or punish block</strong> compared to standard light attacks.</li>
  </ul>`;
  html += `</div></details>`;

  html += `</div>`; // mobility section-wrap

  // ── Cross-Clan Notes section ────────────────────────────────
  html += `<div class="crossclan-section-wrap" id="clan-crossclan-notes">`;
  html += `<div class="crossclan-section-heading"><img class="crossclan-section-heading__icon" src="${typeof UI !== 'undefined' && UI.phyreMark ? UI.phyreMark : 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='}" alt=""><span>Cross-Clan Notes</span></div>`;

  // Lozenge 1: Damage Summary
  const dmgRows = [
    { clan: "banuHaqim", lightRange: "5–10", heavy: "15",    maxHeavy: "18", maxNote: "step 5" },
    { clan: "brujah",    lightRange: "8",    heavy: "15",    maxHeavy: "15", maxNote: null },
    { clan: "tremere",   lightRange: "8",    heavy: "12",    maxHeavy: "12", maxNote: "lowest" },
    { clan: "lasombra",  lightRange: "8",    heavy: "15",    maxHeavy: "15", maxNote: null },
    { clan: "toreador",  lightRange: "5–7",  heavy: "12–15", maxHeavy: "18", maxNote: "step 5" },
    { clan: "ventrue",   lightRange: "7–8",  heavy: "15",    maxHeavy: "15", maxNote: null },
  ];
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Damage Summary</summary><div class="crossclan-lozenge__body">`;
  html += `<table class="combos-table crossclan-table"><thead><tr><th class="combos-table__th">Clan</th><th class="combos-table__th">Light Range</th><th class="combos-table__th">Heavy (std)</th><th class="combos-table__th">Max Heavy</th></tr></thead><tbody>`;
  for (const row of dmgRows) {
    const clanD = typeof CLANS !== "undefined" ? CLANS[row.clan] : null;
    const isPeak = row.maxHeavy === "18";
    const isLow  = row.maxHeavy === "12";
    html += `<tr class="combos-table__tr"><td class="combos-table__td crossclan-table__td--clan">${clanD && clanD.logo ? `<img class="crossclan-clan-logo" src="${clanD.logo}" alt="">` : ""}<span class="crossclan-clan-name">${clanD ? clanD.name : row.clan}</span></td>`;
    html += `<td class="combos-table__td">${row.lightRange}</td><td class="combos-table__td">${row.heavy}</td>`;
    html += `<td class="combos-table__td ${isPeak ? "clan-combo__dmg--peak" : isLow ? "crossclan__dmg--low" : ""}">${row.maxHeavy}${row.maxNote ? `<span class="crossclan-note"> (${row.maxNote})</span>` : ""}</td></tr>`;
  }
  html += `</tbody></table></div></details>`;

  // Lozenge: DPS & Optimal Patterns
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">DPS &amp; Optimal Patterns</summary><div class="crossclan-lozenge__body">`;
  html += `<p class="crossclan-note crossclan-note--sub">Model: each step costs <code>MinWU + ComboDelay</code> (light) or <code>HeavyThresh × MaxWU + ComboDelay</code> (heavy). Sorted by optimal sustained DPS. <strong>Hover</strong> any step pill to see step number and attack type.</p>`;
  html += `<table class="combos-table crossclan-table dps-table"><thead><tr>
    <th class="combos-table__th dps-table__th--clan">Clan</th>
    <th class="combos-table__th dps-table__th--pattern" title="Optimal attack type per step — L = Light, H = Heavy">Optimal Pattern</th>
    <th class="combos-table__th dps-table__th--dps" title="Sustained DPS of the optimal rotation">Opt. DPS</th>
    <th class="combos-table__th dps-table__th--base" title="All-light baseline DPS for comparison">L-Only DPS</th>
    <th class="combos-table__th dps-table__th--dmg" title="Total damage per optimal rotation">Rot. Dmg</th>
    <th class="combos-table__th dps-table__th--time" title="Seconds per optimal rotation">Rot. Time</th>
    <th class="combos-table__th dps-table__th--burst" title="All-heavy single sequence — max burst vs a stunned/staggered target">All-H Burst</th>
  </tr></thead><tbody>`;
  const dpsOrder = (typeof CLAN_ORDER !== "undefined" ? [...CLAN_ORDER] : Object.keys(CLAN_COMBOS))
    .filter(id => CLAN_COMBOS[id] && CLAN_COMBOS[id].dps)
    .sort((a, b) => CLAN_COMBOS[b].dps.optimalDps - CLAN_COMBOS[a].dps.optimalDps);
  for (const clanId of dpsOrder) {
    const data = CLAN_COMBOS[clanId];
    const dps = data.dps;
    const clanD = typeof CLANS !== "undefined" ? CLANS[clanId] : null;
    const isTop = dps.optimalDps >= 16;
    const patternHtml = dps.optimalPattern.map((type, i) =>
      `<span class="dps-pattern__step dps-pattern__step--${type === "H" ? "heavy" : "light"}" title="Step ${i + 1}: ${type === "H" ? "Heavy" : "Light"}">${type}</span>`
    ).join("");
    html += `<tr class="combos-table__tr${isTop ? " dps-table__row--top" : ""}">`;
    html += `<td class="combos-table__td crossclan-table__td--clan">${clanD && clanD.logo ? `<img class="crossclan-clan-logo" src="${clanD.logo}" alt="">` : ""}<span class="crossclan-clan-name">${clanD ? clanD.name : clanId}</span></td>`;
    html += `<td class="combos-table__td dps-table__td--pattern"><div class="dps-pattern">${patternHtml}</div></td>`;
    html += `<td class="combos-table__td dps-table__td--dps${isTop ? " clan-combo__dmg--peak" : ""}">${dps.optimalDps.toFixed(2)}</td>`;
    html += `<td class="combos-table__td clan-combos-table__td--len">${dps.allLightDps.toFixed(2)}</td>`;
    html += `<td class="combos-table__td dps-table__td--dmg">${dps.optimalDmg}</td>`;
    html += `<td class="combos-table__td clan-combos-table__td--delay">${dps.optimalTime.toFixed(2)}s</td>`;
    html += `<td class="combos-table__td dps-table__td--burst">${dps.burstDmg}</td>`;
    html += `</tr>`;
    html += `<tr class="combos-table__tr dps-table__row--note"><td class="combos-table__td dps-table__td--note" colspan="7">${dps.note}</td></tr>`;
  }
  html += `</tbody></table>`;
  html += `<ul class="crossclan-list crossclan-list--notes">
    <li><strong>Toreador</strong> wins sustained DPS despite the lowest per-hit light damage — ultra-low MinWU (0.03–0.06s) and step-5's 0.45 threshold means only 0.495s of hold for 18 damage.</li>
    <li><strong>Banu</strong> and <strong>Toreador</strong> have opposite strategies: Banu heavies steps 1–4 and lights the finisher; Toreador lights steps 1–4 and heavies the finisher.</li>
    <li><strong>Tremere heavies are a trap</strong> — 12 damage in 0.86s loses to two lights (16 damage in ~0.90s). Never use heavies in a sustained fight.</li>
    <li><strong>Banu</strong> has the highest burst ceiling (78 all-heavy) — most valuable when an enemy is stunned or staggered and DPS rate is irrelevant.</li>
  </ul>`;
  html += `</div></details>`;

  // Lozenge 2: Attack Range & Lunge
  const rangeRows = [
    { prop: "Trace Range",            lunging: "170 units (~1.7 m)", tremere: "400 units (~4 m)",      cls: "crossclan__val--notable" },
    { prop: "Trace Radius",           lunging: "35 units (~35 cm)",  tremere: "35 units (inherited)",  cls: "" },
    { prop: "Lunge Range (targeted)", lunging: "450 units (~4.5 m)", tremere: "30 units (disabled)",   cls: "crossclan__val--dim" },
    { prop: "Lunge Assist Strength",  lunging: "200",                tremere: "—",                     cls: "crossclan__val--dim" },
    { prop: "Bounceback Distance",    lunging: "10 units",           tremere: "30 units",              cls: "crossclan__val--notable" },
  ];
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Attack Range &amp; Lunge</summary><div class="crossclan-lozenge__body">`;
  html += `<p class="crossclan-note crossclan-note--sub">From <code>GA_PlayerAttack_Light</code> vs <code>GA_PlayerAttack_Light_NoLunge</code></p>`;
  html += `<table class="combos-table crossclan-table"><thead><tr><th class="combos-table__th">Property</th><th class="combos-table__th">Lunging <span class="crossclan-note">(all except Tremere)</span></th><th class="combos-table__th">Tremere (No-Lunge)</th></tr></thead><tbody>`;
  for (const row of rangeRows) {
    html += `<tr class="combos-table__tr"><td class="combos-table__td crossclan-table__td--prop">${row.prop}</td><td class="combos-table__td">${row.lunging}</td><td class="combos-table__td ${row.cls}">${row.tremere}</td></tr>`;
  }
  html += `</tbody></table>`;
  html += `<ul class="crossclan-list crossclan-list--notes"><li>Tremere's trace is <strong>2× longer</strong> than lunging clans, compensating for no dash.</li><li>Lunging clans snap up to <strong>4.5 m</strong> before the trace fires — Tremere <em>feels</em> shorter despite the longer trace.</li><li>Tremere pushes targets back further per hit (30 vs 10 units).</li></ul>`;
  html += `</div></details>`;

  // Lozenge 3: Shared Montages & Audio
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Shared Montages &amp; Audio</summary><div class="crossclan-lozenge__body">`;
  html += `<ul class="crossclan-list"><li><span class="crossclan-clan-name">Lasombra</span> uses <span class="crossclan-clan-name">Ventrue</span> windups entirely — no dedicated Lasombra windup montages exist.</li><li><span class="crossclan-clan-name">Toreador</span> uses <span class="crossclan-clan-name">Banu Haqim</span> light montages for steps 3–5, and Banu's windup &amp; heavy for step 5.</li><li><span class="crossclan-clan-name">Banu Haqim</span> and <span class="crossclan-clan-name">Toreador</span> share the same step-5 finisher (<code>BA_Light_5</code>, <code>BA_Heavy_1</code>).</li><li>Tremere, Lasombra, and Ventrue all use the <span class="crossclan-clan-name">Brujah</span> audio switch for heavy attacks (<code>SW_ABL_Clan_Combat_Set-Brujah_Attack_Light_One</code>).</li></ul>`;
  html += `</div></details>`;

  // Lozenge 4: Combat Animations
  const idleRows = [
    { clan: "banuHaqim", idle: "Anim_CombatIdle_Banu",     block: "AM_Player_Block_Banu",     shield: null },
    { clan: "brujah",    idle: "(not set)",                 block: "AM_Player_Block_brujah",   shield: null },
    { clan: "tremere",   idle: "Tremere_Combat_Idle",       block: "AM_Player_Block_Tremere",  shield: null },
    { clan: "lasombra",  idle: "Anim_Lasombra_combatIdle",  block: "AM_Player_Block_Lasombra", shield: null },
    { clan: "toreador",  idle: "Combat_Idle_Toreador",      block: "AM_Player_Block_Toreador", shield: null },
    { clan: "ventrue",   idle: "Anim_Ventrue_Combat_Idle",  block: "AM_Player_Block_ventrue",  shield: "Anim_Ventrue_Combat_Idle_Guard" },
  ];
  html += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Combat Animations</summary><div class="crossclan-lozenge__body">`;
  html += `<table class="combos-table crossclan-table"><thead><tr><th class="combos-table__th">Clan</th><th class="combos-table__th">Combat Idle</th><th class="combos-table__th">Block</th><th class="combos-table__th">Shield Idle</th></tr></thead><tbody>`;
  for (const row of idleRows) {
    const clanI = typeof CLANS !== "undefined" ? CLANS[row.clan] : null;
    html += `<tr class="combos-table__tr"><td class="combos-table__td crossclan-table__td--clan">${clanI && clanI.logo ? `<img class="crossclan-clan-logo" src="${clanI.logo}" alt="">` : ""}<span class="crossclan-clan-name">${clanI ? clanI.name : row.clan}</span></td>`;
    html += `<td class="combos-table__td"><code class="crossclan-code">${row.idle}</code></td>`;
    html += `<td class="combos-table__td"><code class="crossclan-code">${row.block}</code></td>`;
    html += `<td class="combos-table__td">${row.shield ? `<code class="crossclan-code crossclan-code--unique">${row.shield}</code>` : `<span class="crossclan__val--dim">—</span>`}</td></tr>`;
  }
  html += `</tbody></table><p class="crossclan-note crossclan-note--foot">Ventrue is the only clan with a dedicated guard-stance idle animation.</p>`;
  html += `</div></details>`;

  html += `</div>`; // crossclan-section-wrap

  container.innerHTML = html;

  // Bind clan filter buttons
  container.querySelectorAll(".clan-combos-filter__btn[data-filter]").forEach(btn => {
    btn.addEventListener("click", () => {
      clanCombosFilter = btn.dataset.filter || null;
      renderClanCombosPage();
    });
  });

  // DPS chip click: highlight damage cells for the chip's pattern
  container.querySelectorAll('.dps-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const clanId = chip.dataset.clan;
      const patternStr = chip.dataset.pattern || "";
      const pattern = patternStr.split("").filter(t => t === "L" || t === "H");
      const block = container.querySelector(`#clan-combo-block-${clanId}`);
      if (!block || !pattern.length) return;
      const isActive = chip.classList.contains('dps-chip--active');
      block.querySelectorAll('.dps-chip').forEach(c => c.classList.remove('dps-chip--active'));
      block.querySelectorAll('.dps-cell--highlight').forEach(c => c.classList.remove('dps-cell--highlight'));
      if (!isActive) {
        chip.classList.add('dps-chip--active');
        block.querySelectorAll('.clan-combos-table__row[data-step]').forEach(row => {
          const step = parseInt(row.dataset.step, 10);
          if (isNaN(step) || step < 0 || step >= pattern.length) return;
          const type = pattern[step];
          const cell = row.querySelector(`[data-cell="${type === 'L' ? 'ldmg' : 'hdmg'}"]`);
          if (cell) cell.classList.add('dps-cell--highlight');
        });
      }
    });
  });

  // Mobility button: scroll to mobility section + expand its lozenges
  const mobilityBtn = container.querySelector("#clan-combos-mobility-btn");
  if (mobilityBtn) {
    mobilityBtn.addEventListener("click", () => {
      const section = container.querySelector("#clan-mobility-section");
      if (section) {
        section.querySelectorAll("details.crossclan-lozenge").forEach(d => d.open = true);
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // Kicks button: scroll to kicks section + expand its lozenge
  const kicksBtn = container.querySelector("#clan-combos-kicks-btn");
  if (kicksBtn) {
    kicksBtn.addEventListener("click", () => {
      const section = container.querySelector("#clan-kicks-section");
      if (section) {
        section.querySelectorAll("details.crossclan-lozenge").forEach(d => d.open = true);
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // Notes button: scroll to section + expand all lozenges
  const notesBtn = container.querySelector("#clan-combos-notes-btn");
  if (notesBtn) {
    notesBtn.addEventListener("click", () => {
      const section = container.querySelector("#clan-crossclan-notes");
      if (section) {
        section.querySelectorAll("details.crossclan-lozenge").forEach(d => d.open = true);
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // Melee tier badges in clan headings → open tierlist popover
  container.querySelectorAll('.clan-combo-block__heading [data-tierlist-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (typeof openTierBadgePopover === 'function') openTierBadgePopover(btn.dataset.tierlistId, btn);
    });
  });

  // Ability cross-links inside lozenges (e.g. Blurred Momentum)
  container.querySelectorAll(".affect-link-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (typeof navigateToAbility !== "function") return;
      if (!state.selectedClan && typeof selectClan === "function") selectClan(btn.dataset.clan);
      navigateToAbility(btn.dataset.clan, btn.dataset.tier);
    });
  });

  // Riser codex image: click to fullscreen via existing image lightbox
  // (skip the Benny-logo variant on the GodFist lozenge — it's just a crest,
  // not a codex page worth zooming.)
  container.querySelectorAll(".riser-lozenge__codex:not(.riser-lozenge__codex--benny)").forEach(img => {
    img.addEventListener("click", () => {
      if (typeof openImageLightbox === "function") {
        openImageLightbox(img.getAttribute("src"), img.getAttribute("alt") || "Mysterious Attack codex page");
      }
    });
  });
}

// ── Cross-Clan Notes Page ─────────────────────────────────────
function renderCrossClanPage() {
  const container = document.getElementById("combos-subpage-crossclan");
  if (!container) return;

  let h = `<div class="combos-layout crossclan-page">`;

  // ── Section: Shared Audio
  h += `<section class="crossclan-section">`;
  h += `<h3 class="crossclan-section__title">Shared Audio (Heavy Attacks)</h3>`;
  h += `<p class="crossclan-section__body">Tremere, Lasombra, and Ventrue all route their heavy attack SFX through the <strong>Brujah audio switch</strong> (<code>SW_ABL_Clan_Combat_Set-Brujah_Attack_Light_One</code>). This appears to be an intentional design decision — a shared fallback heavy SFX rather than per-clan heavy audio.</p>`;
  h += `</section>`;

  // ── Section: Montage Borrowing
  h += `<section class="crossclan-section">`;
  h += `<h3 class="crossclan-section__title">Shared Montage Borrowing</h3>`;
  h += `<ul class="crossclan-list">`;
  h += `<li><span class="crossclan-clan-name">Lasombra</span> uses <span class="crossclan-clan-name">Ventrue</span> windups entirely — no dedicated Lasombra windup montages exist.</li>`;
  h += `<li><span class="crossclan-clan-name">Toreador</span> uses <span class="crossclan-clan-name">Banu Haqim</span> light montages for steps 3–5, and Banu's windup &amp; heavy for step 5.</li>`;
  h += `<li><span class="crossclan-clan-name">Banu Haqim</span> and <span class="crossclan-clan-name">Toreador</span> share the same step-5 finisher (<code>BA_Light_5</code>, <code>BA_Heavy_1</code>).</li>`;
  h += `</ul>`;
  h += `</section>`;

  // ── Section: Damage Summary
  h += `<section class="crossclan-section">`;
  h += `<h3 class="crossclan-section__title">Damage Summary</h3>`;
  h += `<table class="combos-table crossclan-table">`;
  h += `<thead><tr>
    <th class="combos-table__th">Clan</th>
    <th class="combos-table__th" title="Light attack damage range across all steps">Light Range</th>
    <th class="combos-table__th" title="Standard heavy attack damage">Heavy (std)</th>
    <th class="combos-table__th" title="Highest heavy damage value in the chain">Max Heavy</th>
  </tr></thead><tbody>`;

  const dmgRows = [
    { clan: "banuHaqim", lightRange: "5–10", heavy: "15",  maxHeavy: "18", maxNote: "step 5 finisher" },
    { clan: "brujah",    lightRange: "8",    heavy: "15",  maxHeavy: "15", maxNote: null },
    { clan: "tremere",   lightRange: "8",    heavy: "12",  maxHeavy: "12", maxNote: "lowest of all clans" },
    { clan: "lasombra",  lightRange: "8",    heavy: "15",  maxHeavy: "15", maxNote: null },
    { clan: "toreador",  lightRange: "5–7",  heavy: "12–15", maxHeavy: "18", maxNote: "step 5 finisher" },
    { clan: "ventrue",   lightRange: "7–8",  heavy: "15",  maxHeavy: "15", maxNote: null },
  ];

  for (const row of dmgRows) {
    const clan = typeof CLANS !== "undefined" ? CLANS[row.clan] : null;
    const isPeak = row.maxHeavy === "18";
    const isLow  = row.maxHeavy === "12";
    h += `<tr class="combos-table__tr">`;
    h += `<td class="combos-table__td crossclan-table__td--clan">`;
    h += `<img class="crossclan-clan-logo" src="${clan.logo}" alt="">`;
    h += `<span class="crossclan-clan-name">${clan ? clan.name : row.clan}</span></td>`;
    h += `<td class="combos-table__td">${row.lightRange}</td>`;
    h += `<td class="combos-table__td">${row.heavy}</td>`;
    h += `<td class="combos-table__td ${isPeak ? "clan-combo__dmg--peak" : isLow ? "crossclan__dmg--low" : ""}">${row.maxHeavy}${row.maxNote ? `<span class="crossclan-note"> (${row.maxNote})</span>` : ""}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table></section>`;

  // ── Section: Attack Range & Lunge
  h += `<section class="crossclan-section">`;
  h += `<h3 class="crossclan-section__title">Attack Range &amp; Lunge</h3>`;
  h += `<p class="crossclan-section__body crossclan-section__body--sub">From <code>GA_PlayerAttack_Light</code> vs <code>GA_PlayerAttack_Light_NoLunge</code></p>`;
  h += `<table class="combos-table crossclan-table">`;
  h += `<thead><tr>
    <th class="combos-table__th">Property</th>
    <th class="combos-table__th">Lunging <span class="crossclan-note">(all clans except Tremere)</span></th>
    <th class="combos-table__th">Tremere (No-Lunge)</th>
  </tr></thead><tbody>`;

  const rangeRows = [
    { prop: "Trace Range",           lunging: "170 units (~1.7 m)",   tremere: "400 units (~4 m)",           tremereClass: "crossclan__val--notable" },
    { prop: "Trace Radius",          lunging: "35 units (~35 cm)",    tremere: "35 units (inherited)",       tremereClass: "" },
    { prop: "Lunge Range (targeted)", lunging: "450 units (~4.5 m)",   tremere: "30 units (effectively off)", tremereClass: "crossclan__val--dim" },
    { prop: "Lunge Assist Strength", lunging: "200",                  tremere: "—",                          tremereClass: "crossclan__val--dim" },
    { prop: "Bounceback Distance",   lunging: "10 units",             tremere: "30 units",                   tremereClass: "crossclan__val--notable" },
  ];

  for (const row of rangeRows) {
    h += `<tr class="combos-table__tr">`;
    h += `<td class="combos-table__td crossclan-table__td--prop">${row.prop}</td>`;
    h += `<td class="combos-table__td">${row.lunging}</td>`;
    h += `<td class="combos-table__td ${row.tremereClass}">${row.tremere}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `<ul class="crossclan-list crossclan-list--notes">`;
  h += `<li>Tremere's hit trace is <strong>more than twice as long</strong> as lunging clans, compensating for the lack of dash.</li>`;
  h += `<li>Lunging clans snap up to <strong>4.5 m</strong> toward the target before the trace fires — this is why Tremere <em>feels</em> shorter-ranged despite the longer trace.</li>`;
  h += `<li>Tremere pushes targets back further per hit (30 vs 10 units).</li>`;
  h += `</ul>`;
  h += `</section>`;

  // ── Section: Combat Idle / Block / Shield
  h += `<section class="crossclan-section">`;
  h += `<h3 class="crossclan-section__title">Combat Idle, Block &amp; Shield Animations</h3>`;
  h += `<table class="combos-table crossclan-table">`;
  h += `<thead><tr>
    <th class="combos-table__th">Clan</th>
    <th class="combos-table__th">Combat Idle</th>
    <th class="combos-table__th">Block Montage</th>
    <th class="combos-table__th">Shield Idle</th>
  </tr></thead><tbody>`;

  const idleRows = [
    { clan: "banuHaqim", idle: "Anim_CombatIdle_Banu",       block: "AM_Player_Block_Banu",     shield: null },
    { clan: "brujah",    idle: "(not set in asset)",          block: "AM_Player_Block_brujah",   shield: null },
    { clan: "tremere",   idle: "Tremere_Combat_Idle",         block: "AM_Player_Block_Tremere",  shield: null },
    { clan: "lasombra",  idle: "Anim_Lasombra_combatIdle",   block: "AM_Player_Block_Lasombra", shield: null },
    { clan: "toreador",  idle: "Combat_Idle_Toreador",        block: "AM_Player_Block_Toreador", shield: null },
    { clan: "ventrue",   idle: "Anim_Ventrue_Combat_Idle",    block: "AM_Player_Block_ventrue",  shield: "Anim_Ventrue_Combat_Idle_Guard" },
  ];

  for (const row of idleRows) {
    const clan = typeof CLANS !== "undefined" ? CLANS[row.clan] : null;
    h += `<tr class="combos-table__tr">`;
    h += `<td class="combos-table__td crossclan-table__td--clan">`;
    h += `<img class="crossclan-clan-logo" src="${clan.logo}" alt="">`;
    h += `<span class="crossclan-clan-name">${clan ? clan.name : row.clan}</span></td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${row.idle}</code></td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${row.block}</code></td>`;
    h += `<td class="combos-table__td">${row.shield ? `<code class="crossclan-code crossclan-code--unique">${row.shield}</code>` : `<span class="crossclan__val--dim">—</span>`}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `<p class="crossclan-section__body">Ventrue is the only clan with a dedicated guard-stance idle animation.</p>`;
  h += `</section>`;

  h += `</div>`; // crossclan-page
  container.innerHTML = h;
}

// ── Melee Weapons Combat Page ─────────────────────────────────
// Asset-confirmed data from build 22727210, Attackset_*.json files.
// Light/Heavy: montage / sequence length / base damage per slot.
// Directional variants: forward Overhead (W+attack) and backward Shove (S+attack).
// Source: Ref/spring/22727210/weapon_attacksets_22727210.md
const MELEE_WEAPONS = [
  {
    id: "bat", name: "Baseball Bat", category: "Blunt — Bat-class",
    attackset: "Attackset_Bat", thrownDmg: 10,
    lightType: "Lunging", steps: 4,
    rows: [
      { step: 1, lightMontage: "AM_Sword_Light1",  lightLen: 1.248, lightDmg: 6,  heavyMontage: "AM_Bat_Swing_01", heavyLen: 2.557, heavyDmg: 20, fwdMontage: "AM_Overhead_1",  fwdLen: 1.248, fwdDmg: 7, shoveMontage: "AM_Bat_Poke", shoveLen: 1.233, shoveDmg: 3 },
      { step: 2, lightMontage: "AM_Sword_Light2",  lightLen: 1.239, lightDmg: 6,  heavyMontage: "AM_Bat_Swing_02", heavyLen: 2.547, heavyDmg: 20, fwdMontage: "AM_overhead_2",  fwdLen: 1.239, fwdDmg: 7, shoveMontage: "AM_Bat_Poke", shoveLen: 1.233, shoveDmg: 3 },
      { step: 3, lightMontage: "AM_Sword_Light1",  lightLen: 1.248, lightDmg: 6,  heavyMontage: "AM_Bat_Swing_01", heavyLen: 2.557, heavyDmg: 20, fwdMontage: "AM_Overhead_1",  fwdLen: 1.248, fwdDmg: 7, shoveMontage: "AM_Bat_Poke", shoveLen: 1.233, shoveDmg: 3 },
      { step: 4, lightMontage: "AM_Sword_Light2",  lightLen: 1.239, lightDmg: 6,  heavyMontage: "AM_Bat_Swing_02", heavyLen: 2.547, heavyDmg: 20, fwdMontage: "AM_overhead_2",  fwdLen: 1.239, fwdDmg: 7, shoveMontage: "AM_Bat_Poke", shoveLen: 1.233, shoveDmg: 3 },
    ],
    notes: [
      "Reuses sword light-attack montages — same swing animation, different damage scalar.",
      "Forward overhead deals more damage (7) than the standard light (6).",
      "Heavy swings are 2.5s long — the slowest light-class weapon by montage.",
      "Codex: blunt weapons stagger and interrupt better but deal less damage than blades.",
    ],
  },
  {
    id: "spikebat", name: "Spike Club", category: "Blunt + Sharp — Bat-class",
    attackset: "Attackset_SpikeBat", thrownDmg: 15,
    lightType: "Lunging", steps: 4,
    rows: [
      { step: 1, lightMontage: "AM_Sword_Light1",  lightLen: 1.248, lightDmg: 8,  heavyMontage: "AM_Bat_Swing_01", heavyLen: 2.557, heavyDmg: 20, fwdMontage: "AM_Overhead_1",  fwdLen: 1.248, fwdDmg: 10, shoveMontage: "AM_Bat_Poke", shoveLen: 1.233, shoveDmg: 3 },
      { step: 2, lightMontage: "AM_Sword_Light2",  lightLen: 1.239, lightDmg: 8,  heavyMontage: "AM_Bat_Swing_02", heavyLen: 2.547, heavyDmg: 20, fwdMontage: "AM_overhead_2",  fwdLen: 1.239, fwdDmg: 10, shoveMontage: "AM_Bat_Poke", shoveLen: 1.233, shoveDmg: 3 },
      { step: 3, lightMontage: "AM_Sword_Light1",  lightLen: 1.248, lightDmg: 8,  heavyMontage: "AM_Bat_Swing_01", heavyLen: 2.557, heavyDmg: 20, fwdMontage: "AM_Overhead_1",  fwdLen: 1.248, fwdDmg: 10, shoveMontage: "AM_Bat_Poke", shoveLen: 1.233, shoveDmg: 3 },
      { step: 4, lightMontage: "AM_Sword_Light2",  lightLen: 1.239, lightDmg: 8,  heavyMontage: "AM_Bat_Swing_02", heavyLen: 2.547, heavyDmg: 20, fwdMontage: "AM_overhead_2",  fwdLen: 1.239, fwdDmg: 10, shoveMontage: "AM_Bat_Poke", shoveLen: 1.233, shoveDmg: 3 },
    ],
    notes: [
      "Same montages as the Baseball Bat — Spike Club is a damage-tier upgrade of the same animation set.",
      "Forward overhead spikes to 10 damage (vs 7 on the plain Bat).",
      "Hybrid blunt/sharp profile — keeps stagger value of bat-class while approaching blade damage.",
    ],
  },
  {
    id: "baton_loaded", name: "Electric Baton (Loaded)", category: "Bat-class — DLC",
    attackset: "Attackset_Baton_Loaded", thrownDmg: 10,
    lightType: "Lunging", steps: 4,
    rows: [
      { step: 1, lightMontage: "AM_Sword_Light1", lightLen: 1.248, lightDmg: 17, heavyMontage: "AM_Baton_Swing_01", heavyLen: 2.557, heavyDmg: 30, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
      { step: 2, lightMontage: "AM_Sword_Light2", lightLen: 1.239, lightDmg: 17, heavyMontage: "AM_Baton_Swing_02", heavyLen: 2.547, heavyDmg: 30, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
      { step: 3, lightMontage: "AM_Sword_Light1", lightLen: 1.248, lightDmg: 17, heavyMontage: "AM_Baton_Swing_01", heavyLen: 2.557, heavyDmg: 30, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
      { step: 4, lightMontage: "AM_Sword_Light2", lightLen: 1.239, lightDmg: 17, heavyMontage: "AM_Baton_Swing_02", heavyLen: 2.547, heavyDmg: 30, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
    ],
    notes: [
      "Highest light-attack damage of any one-handed melee weapon (17/swing).",
      "No forward overhead variant — only the backward shove.",
      "Empty (uncharged) variant deals only 4 light / 14 heavy — same montages, scaled-down damage.",
      "Toggle between charged/empty to compare damage states.",
    ],
    variants: [
      {
        id: "baton_empty", name: "Electric Baton (Empty)",
        attackset: "Attackset_Baton_Empty", thrownDmg: 10,
        lightType: "Lunging", steps: 4,
        rows: [
          { step: 1, lightMontage: "AM_Sword_Light1", lightLen: 1.248, lightDmg: 4, heavyMontage: "AM_Baton_Swing_01", heavyLen: 2.557, heavyDmg: 14, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 2 },
          { step: 2, lightMontage: "AM_Sword_Light2", lightLen: 1.239, lightDmg: 4, heavyMontage: "AM_Baton_Swing_02", heavyLen: 2.547, heavyDmg: 14, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 2 },
          { step: 3, lightMontage: "AM_Sword_Light1", lightLen: 1.248, lightDmg: 4, heavyMontage: "AM_Baton_Swing_01", heavyLen: 2.557, heavyDmg: 14, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 2 },
          { step: 4, lightMontage: "AM_Sword_Light2", lightLen: 1.239, lightDmg: 4, heavyMontage: "AM_Baton_Swing_02", heavyLen: 2.547, heavyDmg: 14, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 2 },
        ],
        notes: [
          "Same animations as loaded baton, but much lower damage.",
          "Represents the uncharged/drained state (PlayerWeapon_Empty).",
        ],
      },
    ],
  },
  {
    id: "knife", name: "Knife", category: "Sharp — Light Blade",
    attackset: "Attackset_Knife", thrownDmg: 15,
    lightType: "Lunging", steps: 4,
    rows: [
      { step: 1, lightMontage: "AM_Knife_Light2", lightLen: 1.000, lightDmg: 5, heavyMontage: "AM_Knife_Heavy", heavyLen: 1.861, heavyDmg: 15, fwdMontage: "AM_Knife_Light1", fwdLen: 0.963, fwdDmg: 7, shoveMontage: "AM_Knife_shove", shoveLen: 0.956, shoveDmg: 1 },
      { step: 2, lightMontage: "AM_Knife_Light3", lightLen: 1.001, lightDmg: 5, heavyMontage: "AM_Knife_Heavy", heavyLen: 1.861, heavyDmg: 15, fwdMontage: "AM_Knife_Light1", fwdLen: 0.963, fwdDmg: 7, shoveMontage: "AM_Knife_shove", shoveLen: 0.956, shoveDmg: 1 },
      { step: 3, lightMontage: "AM_Knife_Light2", lightLen: 1.000, lightDmg: 5, heavyMontage: "AM_Knife_Heavy", heavyLen: 1.861, heavyDmg: 12, fwdMontage: "AM_Knife_Light1", fwdLen: 0.963, fwdDmg: 7, shoveMontage: "AM_Knife_shove", shoveLen: 0.956, shoveDmg: 1 },
      { step: 4, lightMontage: "AM_Knife_Light3", lightLen: 1.001, lightDmg: 5, heavyMontage: "AM_Knife_Heavy", heavyLen: 1.861, heavyDmg: 12, fwdMontage: "AM_Knife_Light1", fwdLen: 0.963, fwdDmg: 7, shoveMontage: "AM_Knife_shove", shoveLen: 0.956, shoveDmg: 1 },
    ],
    notes: [
      "Fastest weapon overall — light montages ~1.00s, dedicated knife shove just 0.96s.",
      "Heavy damage drops from 15 → 12 in slots 3–4 (chain falloff).",
      "Forward stab deals more damage (7) than the standard light (5).",
      "Codex: bladed weapons deal more damage but stagger less than blunt.",
    ],
  },
  {
    id: "machete", name: "Machete", category: "Sharp — Heavy Blade",
    attackset: "Attackset_Machete", thrownDmg: 15,
    lightType: "Lunging", steps: 4,
    rows: [
      { step: 1, lightMontage: "AM_Knife_Light2", lightLen: 1.000, lightDmg: 10, heavyMontage: "AM_Knife_Heavy", heavyLen: 1.861, heavyDmg: 15, fwdMontage: "AM_Knife_Light1", fwdLen: 0.963, fwdDmg: 12.8, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
      { step: 2, lightMontage: "AM_Knife_Light3", lightLen: 1.001, lightDmg: 10, heavyMontage: "AM_Knife_Heavy", heavyLen: 1.861, heavyDmg: 15, fwdMontage: "AM_Knife_Light1", fwdLen: 0.963, fwdDmg: 12.8, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
      { step: 3, lightMontage: "AM_Knife_Light2", lightLen: 1.000, lightDmg: 10, heavyMontage: "AM_Knife_Heavy", heavyLen: 1.861, heavyDmg: 12, fwdMontage: "AM_Knife_Light1", fwdLen: 0.963, fwdDmg: 12.8, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
      { step: 4, lightMontage: "AM_Knife_Light3", lightLen: 1.001, lightDmg: 10, heavyMontage: "AM_Knife_Heavy", heavyLen: 1.861, heavyDmg: 12, fwdMontage: "AM_Knife_Light1", fwdLen: 0.963, fwdDmg: 12.8, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
    ],
    notes: [
      "Reuses knife montages — same speed as a knife with double the light damage.",
      "Forward strike (12.8) is the highest single-light-hit value of any one-handed weapon.",
      "Uses generic <code>AM_wep_Shove</code> instead of the dedicated knife shove.",
    ],
  },
  {
    id: "sword", name: "Sword", category: "Sharp — Heavy Blade",
    attackset: "Attackset_Sword", thrownDmg: 15,
    lightType: "Lunging", steps: 4,
    rows: [
      { step: 1, lightMontage: "AM_Sword_Light1", lightLen: 1.248, lightDmg: 13, heavyMontage: "AM_Sword_stab_1", heavyLen: 1.045, heavyDmg: 15, fwdMontage: "AM_Overhead_1", fwdLen: 1.248, fwdDmg: 15, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
      { step: 2, lightMontage: "AM_Sword_Light2", lightLen: 1.239, lightDmg: 13, heavyMontage: "AM_Sword_stab_2", heavyLen: 1.045, heavyDmg: 15, fwdMontage: "AM_overhead_2", fwdLen: 1.239, fwdDmg: 15, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
      { step: 3, lightMontage: "AM_Sword_Light1", lightLen: 1.248, lightDmg: 13, heavyMontage: "AM_Sword_stab_1", heavyLen: 1.045, heavyDmg: 12, fwdMontage: "AM_Overhead_1", fwdLen: 1.248, fwdDmg: 15, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
      { step: 4, lightMontage: "AM_Sword_Light2", lightLen: 1.239, lightDmg: 13, heavyMontage: "AM_Sword_stab_2", heavyLen: 1.045, heavyDmg: 12, fwdMontage: "AM_overhead_2", fwdLen: 1.239, fwdDmg: 15, shoveMontage: "AM_wep_Shove", shoveLen: 1.534, shoveDmg: 3 },
    ],
    notes: [
      "Highest sustained light damage among one-handed weapons (13/swing × 4-step chain).",
      "Heavies use the stab montages (~1.05s) — nearly half the length of bat-class heavies.",
      "Forward overhead matches first-slot heavy damage (15).",
    ],
  },
  {
    id: "sledgehammer", name: "Sledge Hammer", category: "Heavy Two-Hander",
    attackset: "Attackset_SledgeHammer", thrownDmg: 50,
    lightType: "Lunging", steps: 2,
    rows: [
      { step: 1, lightMontage: "AM_Hammer_light_1", lightLen: 1.348, lightDmg: 20, heavyMontage: "AM_Hammer_Heavy", heavyLen: 1.433, heavyDmg: 70, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_Hammer_Poke", shoveLen: 1.251, shoveDmg: 6 },
      { step: 2, lightMontage: "AM_Hammer_Light_2", lightLen: 1.348, lightDmg: 20, heavyMontage: "AM_Hammer_Heavy", heavyLen: 1.433, heavyDmg: 70, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_Hammer_Poke", shoveLen: 1.251, shoveDmg: 6 },
    ],
    notes: [
      "Only a 2-step chain — no light falloff and no forward variant.",
      "Heavy strikes deal <strong>70 damage</strong>, the highest single-hit value of any weapon.",
      "Throw deals 50 damage — heavy throwable tier.",
      "Codex: heavy/ability-based attacks cannot be blocked.",
    ],
  },
  {
    id: "warhammer", name: "War Hammer", category: "Heavy Two-Hander",
    attackset: "Attackset_WarHammer", thrownDmg: 65,
    lightType: "Lunging", steps: 2,
    rows: [
      { step: 1, lightMontage: "AM_Hammer_light_1", lightLen: 1.348, lightDmg: 22, heavyMontage: "AM_Hammer_Heavy", heavyLen: 1.433, heavyDmg: 70, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_Hammer_Poke", shoveLen: 1.251, shoveDmg: 6 },
      { step: 2, lightMontage: "AM_Hammer_Light_2", lightLen: 1.348, lightDmg: 22, heavyMontage: "AM_Hammer_Heavy", heavyLen: 1.433, heavyDmg: 70, fwdMontage: null, fwdLen: 0, fwdDmg: 0, shoveMontage: "AM_Hammer_Poke", shoveLen: 1.251, shoveDmg: 6 },
    ],
    notes: [
      "Same montages and heavy damage as the Sledge — light damage bumped from 20 → 22.",
      "Throw deals <strong>65 damage</strong> (Obliterate tier) — highest thrown damage of any melee weapon.",
    ],
  },
];

const WEAPON_ATTACKSET_TIMINGS = {
  Attackset_Bat: [
    { minWindup: 0.24, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 1.0 },
    { minWindup: 0.24, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 1.0 },
    { minWindup: 0.24, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 1.0 },
    { minWindup: 0.24, lightComboDelay: 0.70, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 1.0 },
  ],
  Attackset_Baton_Empty: [
    { minWindup: 0.24, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.24, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.24, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.24, lightComboDelay: 0.70, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.8 },
  ],
  Attackset_Baton_Loaded: [
    { minWindup: 0.24, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.24, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.24, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.24, lightComboDelay: 0.70, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.8 },
  ],
  Attackset_Knife: [
    { minWindup: 0.06, lightComboDelay: 0.25, maxWindup: 1.0, heavyThresh: 0.5, heavyComboDelay: 0.8 },
    { minWindup: 0.03, lightComboDelay: 0.25, maxWindup: 1.0, heavyThresh: 0.5, heavyComboDelay: 0.8 },
    { minWindup: 0.03, lightComboDelay: 0.25, maxWindup: 1.0, heavyThresh: 0.5, heavyComboDelay: 0.8 },
    { minWindup: 0.03, lightComboDelay: 0.35, maxWindup: 1.0, heavyThresh: 0.5, heavyComboDelay: 0.8 },
  ],
  Attackset_Machete: [
    { minWindup: 0.20, lightComboDelay: 0.20, maxWindup: 1.0, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.06, lightComboDelay: 0.30, maxWindup: 1.0, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.06, lightComboDelay: 0.30, maxWindup: 1.0, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.06, lightComboDelay: 0.60, maxWindup: 1.0, heavyThresh: 0.7, heavyComboDelay: 0.8 },
  ],
  Attackset_SledgeHammer: [
    { minWindup: 0.40, lightComboDelay: 0.40, maxWindup: 1.7, heavyThresh: 1.0, heavyComboDelay: 1.4 },
    { minWindup: 0.40, lightComboDelay: 0.40, maxWindup: 1.7, heavyThresh: 1.0, heavyComboDelay: 1.4 },
  ],
  Attackset_SpikeBat: [
    { minWindup: 0.30, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.30, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.30, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.30, lightComboDelay: 0.70, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.8 },
  ],
  Attackset_Sword: [
    { minWindup: 0.20, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.22, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.25, lightComboDelay: 0.30, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.7 },
    { minWindup: 0.30, lightComboDelay: 0.70, maxWindup: 1.1, heavyThresh: 0.7, heavyComboDelay: 0.8 },
  ],
  Attackset_WarHammer: [
    { minWindup: 0.55, lightComboDelay: 0.40, maxWindup: 1.7, heavyThresh: 1.0, heavyComboDelay: 1.4 },
    { minWindup: 0.55, lightComboDelay: 0.40, maxWindup: 1.7, heavyThresh: 1.0, heavyComboDelay: 1.4 },
  ],
};

function applyWeaponTimingProfiles(weapon) {
  const timingRows = WEAPON_ATTACKSET_TIMINGS[weapon.attackset];
  if (timingRows) {
    weapon.rows = weapon.rows.map((row, index) => ({ ...row, ...(timingRows[index] || {}) }));
  }
  if (weapon.variants) {
    weapon.variants.forEach((variant) => {
      const variantTimingRows = WEAPON_ATTACKSET_TIMINGS[variant.attackset];
      if (!variantTimingRows) return;
      variant.rows = variant.rows.map((row, index) => ({ ...row, ...(variantTimingRows[index] || {}) }));
    });
  }
}

MELEE_WEAPONS.forEach(applyWeaponTimingProfiles);

// Shared GA tuning (applies to all melee-weapon strikes via GA_PlayerAttack_*)
// Source: melee_weapons_22727210.md
const MELEE_WEAPON_GA_DATA = [
  { ga: "GA_PlayerAttack_Light",       trigger: "Tap attack — base/fists light",                     comboDelay: 0.2, hitDmg: 8,  trace: "170 / r35",  lunge: "— / 450",   lungeDelay: 0.01, hitReact: "Light" },
  { ga: "GA_PlayerAttack_Heavy",       trigger: "Hold attack — base/fists heavy",                    comboDelay: 0.7, hitDmg: 30, trace: "240 / r50",  lunge: "200 / 450", lungeDelay: 0.01, hitReact: "HeavyFirst", flinch: "AttackArmor.Heavy" },
  { ga: "GA_PlayerAttack_Bat",         trigger: "Tap attack with a bat-class weapon",                comboDelay: 0.2, hitDmg: 8,  trace: "270 / r60",  lunge: "200 / —",   lungeDelay: 0.05, hitReact: "Light" },
  { ga: "GA_PlayerAttack_Baton",       trigger: "Tap attack with the electric baton",                comboDelay: 0.2, hitDmg: 8,  trace: "270 / r60",  lunge: "200 / —",   lungeDelay: 0.05, hitReact: "Light", flag: "new in 22727210" },
  { ga: "GA_PlayerAttack_Hammer",      trigger: "Tap attack with a hammer-class weapon",             comboDelay: 0.2, hitDmg: 8,  trace: "270 / r60",  lunge: "200 / —",   lungeDelay: 0.06, hitReact: "Light" },
  { ga: "GA_PlayerAttack_sword",       trigger: "Tap attack with a sword-class weapon",              comboDelay: 0.2, hitDmg: 8,  trace: "270 / r35",  lunge: "— / 200",   lungeDelay: 0.05, hitReact: "Light" },
  { ga: "GA_PlayerAttack_Stab",        trigger: "Tap attack with a stab-capable bladed weapon",      comboDelay: 0.2, hitDmg: 8,  trace: "250 / r35",  lunge: "240 / 350", lungeDelay: 0.01, hitReact: "Light" },
  { ga: "GA_PlayerAttack_LightBlade",  trigger: "Tap attack with a light blade",                     comboDelay: 0.2, hitDmg: 8,  trace: "270 / r35",  lunge: "140 / 270", lungeDelay: 0.01, hitReact: "Light" },
  { ga: "GA_PlayerAttack_HeavyBat",    trigger: "Hold attack with a bat-class weapon",               comboDelay: 0.7, hitDmg: 30, trace: "300 / r100", lunge: "200 / 450", lungeDelay: 0.10, hitReact: "HeavyFirst", flinch: "AttackArmor.Heavy" },
  { ga: "GA_PlayerAttack_HeavyHammer", trigger: "Hold attack with a hammer-class weapon",            comboDelay: 0.7, hitDmg: 30, trace: "300 / r100", lunge: "200 / 450", lungeDelay: 0.55, hitReact: "HeavyFirst", flinch: "AttackArmor.Heavy" },
  { ga: "GA_PlayerAttack_Shove",       trigger: "Move backward + tap attack with any melee weapon",  comboDelay: 0.2, hitDmg: 8,  trace: "400 / r30",  lunge: "50 / 50",   lungeDelay: 0.10, hitReact: "Light" },
];

// Optimal sustained-rotation DPS for a single attack type across a weapon's chain.
// Sums damage and montage length only over rows that actually have a montage for
// that slot (so weapons without a forward variant skip those steps).
function computeWeaponRotationDps(rows, kind) {
  const dmgKey = kind + "Dmg";
  const lenKey = kind + "Len";
  const mKey   = kind + "Montage";
  const modeMap = { light: "L", fwd: "F", shove: "S" };
  const valid  = rows.filter(r => r[mKey] && r[lenKey] > 0);
  if (!valid.length) return null;
  const totalDmg  = valid.reduce((a, r) => a + (r[dmgKey] || 0), 0);
  const totalTime = valid.reduce((a, r) => a + getWeaponStepTiming(r, modeMap[kind]).time, 0);
  if (totalTime <= 0) return null;
  return {
    dps: totalDmg / totalTime,
    dmg: totalDmg,
    time: totalTime,
    steps: valid.length,
  };
}

// Static DPS chip — same visual family as clan-combo chips but no popup panel
// (these are summary numbers, not interactive rotation pickers).
function renderWeaponDpsChip(label, title, data) {
  if (!data) {
    return `<div class="dps-chip dps-chip--disabled" title="${title} — no montage"><span class="dps-chip__head"><span class="dps-chip__label">${label}</span><span class="dps-chip__val">—</span></span></div>`;
  }
  const tooltip = `${title}: ${data.dmg} dmg over ${data.time.toFixed(2)}s (${data.steps} step${data.steps === 1 ? "" : "s"})`;
  const cls = label === "L" ? "dps-chip--opt" : (label === "FWD" ? "dps-chip--lights" : "dps-chip--shove");
  return `<div class="dps-chip ${cls}" title="${tooltip}"><span class="dps-chip__head"><span class="dps-chip__label">${label}</span><span class="dps-chip__val">${data.dps.toFixed(2)}</span></span></div>`;
}

function renderWeaponInfoChip(label, value, title, cls = "") {
  return `<div class="dps-chip ${cls}" title="${title}"><span class="dps-chip__head"><span class="dps-chip__label">${label}</span><span class="dps-chip__val">${value}</span></span></div>`;
}

function getWeaponShoveSummary(rows) {
  const shoveRow = rows.find((row) => row.shoveMontage && row.shoveLen > 0);
  if (!shoveRow) return null;
  const timing = getWeaponStepTiming(shoveRow, "S");
  return {
    damage: shoveRow.shoveDmg,
    time: timing.time,
    tooltip: `${shoveRow.shoveDmg} damage in ${timing.time.toFixed(2)}s`,
  };
}

function renderWeaponSupportChips(weaponData) {
  const shove = getWeaponShoveSummary(weaponData.rows);
  let html = `<div class="dps-chip-group dps-chip-group--weapon dps-chip-group--utility">`;
  html += renderWeaponInfoChip("THR", `${weaponData.thrownDmg} dmg`, `Throw damage: ${weaponData.thrownDmg}`);
  if (shove) {
    html += renderWeaponInfoChip("SHV", `${shove.damage} / ${shove.time.toFixed(2)}s`, `Shove: ${shove.tooltip}`, "dps-chip--shove");
  }
  html += `</div>`;
  return html;
}

function getWeaponStepTiming(row, mode) {
  if (mode === "L") {
    if (typeof row.lightMinWindup === "number" && typeof row.lightComboDelay === "number") {
      return {
        time: row.lightMinWindup + row.lightComboDelay,
        tooltip: `Light: MinWU + ComboDelay = ${row.lightMinWindup.toFixed(2)} + ${row.lightComboDelay.toFixed(2)}`,
      };
    }
    if (typeof row.minWindup === "number" && typeof row.lightComboDelay === "number") {
      return {
        time: row.minWindup + row.lightComboDelay,
        tooltip: `Light: MinWU + ComboDelay = ${row.minWindup.toFixed(2)} + ${row.lightComboDelay.toFixed(2)}`,
      };
    }
    return {
      time: row.lightLen,
      tooltip: `${row.lightMontage} (montage length fallback)`,
    };
  }
  if (mode === "H") {
    if (typeof row.maxWindup === "number" && typeof row.heavyThresh === "number" && typeof row.heavyComboDelay === "number") {
      const holdTime = row.heavyThresh * row.maxWindup;
      return {
        time: holdTime + row.heavyComboDelay,
        tooltip: `Heavy: (Threshold × MaxWU) + ComboDelay = (${row.heavyThresh.toFixed(2)} × ${row.maxWindup.toFixed(2)}) + ${row.heavyComboDelay.toFixed(2)}`,
      };
    }
    return {
      time: row.heavyLen,
      tooltip: `${row.heavyMontage} (montage length fallback)`,
    };
  }
  if (mode === "F") {
    if (typeof row.fwdWindup === "number" && typeof row.fwdComboDelay === "number") {
      return {
        time: row.fwdWindup + row.fwdComboDelay,
        tooltip: `Forward: Windup + ComboDelay = ${row.fwdWindup.toFixed(2)} + ${row.fwdComboDelay.toFixed(2)}`,
      };
    }
    if (typeof row.lightMinWindup === "number" && typeof row.lightComboDelay === "number") {
      return {
        time: row.lightMinWindup + row.lightComboDelay,
        tooltip: `Forward: using light cadence (MinWU + ComboDelay) = ${row.lightMinWindup.toFixed(2)} + ${row.lightComboDelay.toFixed(2)}`,
      };
    }
    if (typeof row.minWindup === "number" && typeof row.lightComboDelay === "number") {
      return {
        time: row.minWindup + row.lightComboDelay,
        tooltip: `Forward: using light cadence (MinWU + ComboDelay) = ${row.minWindup.toFixed(2)} + ${row.lightComboDelay.toFixed(2)}`,
      };
    }
    return {
      time: row.fwdLen,
      tooltip: `${row.fwdMontage || "Forward"} (montage length fallback)`,
    };
  }
  if (typeof row.shoveWindup === "number" && typeof row.shoveComboDelay === "number") {
    return {
      time: row.shoveWindup + row.shoveComboDelay,
      tooltip: `Shove: Windup + ComboDelay = ${row.shoveWindup.toFixed(2)} + ${row.shoveComboDelay.toFixed(2)}`,
    };
  }
  return {
    time: row.shoveLen,
    tooltip: `${row.shoveMontage} (montage length fallback)`,
  };
}

function getWeaponStepModes(row) {
  const modes = ["L", "S"];
  if (row.fwdMontage && row.fwdLen > 0) modes.push("F");
  return modes;
}

function evaluateWeaponPattern(rows, pattern) {
  let damage = 0;
  let time = 0;
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const mode = pattern[i];
    const timing = getWeaponStepTiming(row, mode);
    if (mode === "L") damage += row.lightDmg;
    else if (mode === "F") damage += row.fwdDmg;
    else damage += row.shoveDmg;
    time += timing.time;
  }
  return {
    pattern,
    damage,
    time,
    dps: time > 0 ? (damage / time) : 0,
  };
}

function findWeaponComboPeakPattern(rows) {
  const pattern = rows.map((row) => {
    let bestMode = "L";
    let bestDps = -1;
    for (const mode of getWeaponStepModes(row)) {
      const timing = getWeaponStepTiming(row, mode);
      const dmg = mode === "L" ? row.lightDmg : mode === "F" ? row.fwdDmg : row.shoveDmg;
      const dps = timing.time > 0 ? (dmg / timing.time) : 0;
      if (dps > bestDps) {
        bestDps = dps;
        bestMode = mode;
      }
    }
    return bestMode;
  });
  return evaluateWeaponPattern(rows, pattern);
}

function findWeaponLoopOptimalPattern(rows) {
  const best = { pattern: null, damage: 0, time: 0, dps: -1 };

  function walk(step, path) {
    if (step >= rows.length) {
      const result = evaluateWeaponPattern(rows, path.slice());
      if (result.dps > best.dps) {
        best.pattern = result.pattern;
        best.damage = result.damage;
        best.time = result.time;
        best.dps = result.dps;
      }
      return;
    }
    for (const mode of getWeaponStepModes(rows[step])) {
      path.push(mode);
      walk(step + 1, path);
      path.pop();
    }
  }

  walk(0, []);
  return best;
}

function evaluateWeaponLoopPattern(rows, cyclePattern, cycles) {
  const base = evaluateWeaponPattern(rows, cyclePattern);
  return {
    pattern: cyclePattern,
    cycles,
    damage: base.damage * cycles,
    time: base.time * cycles,
    dps: base.dps,
  };
}

function renderWeaponPatternSteps(pattern) {
  return pattern.map((t) => {
    const cls = t === "L" ? "l" : "h";
    return `<span class="dps-chip__pat-step dps-chip__pat-step--${cls}">${t}</span>`;
  }).join("");
}

function navigateToMeleeWeapons() {
  // Switch to primary Phyre tab if not already there
  const phyreTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="phyre"]');
  if (phyreTab && !phyreTab.classList.contains("active")) {
    phyreTab.click();
  }
  // Activate Combat (data-subtab="combos") secondary tab
  const combosTab = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab[data-subtab="combos"]');
  if (combosTab && !combosTab.classList.contains("active")) {
    combosTab.click();
  }
  // Activate weapons combotab
  const weaponsTab = document.querySelector('.tab-bar--combos .tab-bar__tab[data-combotab="weapons"]');
  if (weaponsTab) weaponsTab.click();
}

function renderMeleeWeaponsPage() {
  const container = document.getElementById("combos-subpage-weapons");
  if (!container) return;

  let h = `<div class="combos-layout">`;

  // Header
  h += `<div class="clan-combos-header">`;
  h += `<h2 class="combos-header__title">Melee Weapon Attack Data</h2>`;
  h += `<p class="combos-header__sub">Per-weapon combo chains, montage timings, and directional variants — pulled directly from <code>Attackset_*</code> exports (build 22727210).</p>`;
  h += `<div class="combos-legend combos-legend--melee">`;
  for (const w of MELEE_WEAPONS) {
    h += `<a class="combos-legend__item" href="#mw-${w.id}">${w.name}</a>`;
  }
  h += `</div>`;
  h += `<ul class="combos-header__primer">
    <li><strong class="combos-header__primer-label combos-header__primer-label--light">Light slot:</strong> the per-step swing — most weapons reuse one of two alternating montages.</li>
    <li><strong class="combos-header__primer-label combos-header__primer-label--heavy">Heavy slot:</strong> hold-to-charge release; bypasses block on heavy classes. <strong>Heavy attacks BREAK the weapon</strong> — single-use, throws the weapon away after impact, but deals significant damage.</li>
    <li><strong class="combos-header__primer-label">Forward (W+attack):</strong> directional overhead/stab variant — usually higher damage than the light.</li>
    <li><strong class="combos-header__primer-label">Backward (S+attack):</strong> quick shove — low damage, mainly for spacing.</li>
    <li><strong class="combos-header__primer-label">Timing model:</strong> Light and Forward use attackset light cadence by default, Heavy uses extracted Threshold / MaxWU / ComboDelay cadence, and Shove stays on its own timing path unless separate directional timing fields are available.</li>
    <li><strong class="combos-header__primer-label">Header lozenges:</strong> Light and Forward stay as DPS chips, while Throw and Shove now sit in utility lozenges with direct damage readouts.</li>
  </ul>`;
  h += `</div>`; // header

  // Per-weapon tables
  h += `<div class="clan-combos-tables">`;
  for (const w of MELEE_WEAPONS) {
    const dpsLight = computeWeaponRotationDps(w.rows, "light");
    const dpsFwd   = computeWeaponRotationDps(w.rows, "fwd");

    h += `<div class="clan-combo-block" id="mw-${w.id}">`;
    h += `<div class="clan-combo-block__heading clan-combo-block__heading--with-dps">`;
    h += `<div class="clan-combo-block__heading-text">`;
    h += `<span class="clan-combo-block__name">${w.name}</span>`;
    h += `<span class="clan-combo-block__meta">${w.category} &middot; ${w.steps}-step chain</span>`;
    h += `</div>`;
    h += `<div class="dps-chip-group dps-chip-group--weapon dps-chip-group--heading">`;
    h += renderWeaponDpsChip("L",   "Light rotation",   dpsLight);
    h += renderWeaponDpsChip("FWD", "Forward rotation", dpsFwd);
    h += `</div>`;
    h += `</div>`;
    h += `<div class="weapon-variant-summary" data-variant="main" data-weapon-id="${w.id}">`;
    h += renderWeaponSupportChips(w);
    h += `</div>`;
    
    // Variant tabs (if variants exist)
    if (w.variants && w.variants.length > 0) {
      h += `<div class="weapon-variant-tabs">`;
      h += `<button class="weapon-variant-tab weapon-variant-tab--active" data-variant="main" data-weapon-id="${w.id}">Charged</button>`;
      for (const v of w.variants) {
        h += `<button class="weapon-variant-tab" data-variant="${v.id}" data-weapon-id="${w.id}">${v.name.split('(')[1].trim()}</button>`;
      }
      h += `</div>`;
      for (const v of w.variants) {
        h += `<div class="weapon-variant-summary" data-variant="${v.id}" data-weapon-id="${w.id}" style="display:none;">`;
        h += renderWeaponSupportChips(v);
        h += `</div>`;
      }
    }

    // Step table — main weapon
    h += `<div class="weapon-variant-content" data-variant="main" data-weapon-id="${w.id}">`;
    h += `<table class="combos-table clan-combos-table"><thead><tr>
      <th class="combos-table__th clan-combos-table__th--step">Step</th>
      <th class="combos-table__th clan-combos-table__th--steptime" title="Light step time">Light Time</th>
      <th class="combos-table__th clan-combos-table__th--ldmg" title="Light attack base damage">Light Dmg</th>
      <th class="combos-table__th clan-combos-table__th--dps" title="Light damage per second">Light Dmg/s</th>
      <th class="combos-table__th clan-combos-table__th--steptime" title="Forward step time (W+attack)">Fwd Time</th>
      <th class="combos-table__th" title="Forward (W+attack) variant damage">Fwd Dmg</th>
      <th class="combos-table__th clan-combos-table__th--dps" title="Forward damage per second">Fwd Dmg/s</th>
      <th class="combos-table__th clan-combos-table__th--steptime" title="Heavy step time">Heavy Time</th>
      <th class="combos-table__th clan-combos-table__th--hdmg" title="Heavy attack base damage">Heavy Dmg</th>
      <th class="combos-table__th clan-combos-table__th--dps" title="Heavy damage per second">Heavy Dmg/s</th>
    </tr></thead><tbody>`;
    for (const r of w.rows) {
      const isPeak = r.heavyDmg >= 30;
      const lightTiming = getWeaponStepTiming(r, "L");
      const heavyTiming = getWeaponStepTiming(r, "H");
      const heavyDps = heavyTiming.time > 0 ? (r.heavyDmg / heavyTiming.time) : 0;
      const lightDps = lightTiming.time > 0 ? (r.lightDmg / lightTiming.time) : 0;
      h += `<tr class="clan-combos-table__row">`;
      h += `<td class="combos-table__td clan-combos-table__td--step">${r.step}</td>`;
      h += `<td class="combos-table__td clan-combos-table__td--steptime" title="${lightTiming.tooltip}">${lightTiming.time.toFixed(2)}s</td>`;
      h += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="ldmg">${r.lightDmg}</td>`;
      h += `<td class="combos-table__td clan-combos-table__td--dps">${lightDps.toFixed(2)}</td>`;
      if (r.fwdMontage) {
        const fwdTiming = getWeaponStepTiming(r, "F");
        const fwdDps = fwdTiming.time > 0 ? (r.fwdDmg / fwdTiming.time) : 0;
        h += `<td class="combos-table__td clan-combos-table__td--steptime" title="${fwdTiming.tooltip}">${fwdTiming.time.toFixed(2)}s</td>`;
        h += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="fdmg">${r.fwdDmg}</td>`;
        h += `<td class="combos-table__td clan-combos-table__td--dps">${fwdDps.toFixed(2)}</td>`;
      } else {
        h += `<td class="combos-table__td"><span class="crossclan__val--dim">—</span></td>`;
        h += `<td class="combos-table__td"><span class="crossclan__val--dim">—</span></td>`;
        h += `<td class="combos-table__td"><span class="crossclan__val--dim">—</span></td>`;
      }
      h += `<td class="combos-table__td clan-combos-table__td--steptime" title="${heavyTiming.tooltip}">${heavyTiming.time.toFixed(2)}s</td>`;
      h += `<td class="combos-table__td clan-combos-table__td--dmg ${isPeak ? "clan-combo__dmg--peak" : ""}" data-cell="hdmg">${r.heavyDmg}</td>`;
      h += `<td class="combos-table__td clan-combos-table__td--dps">${heavyDps.toFixed(2)}</td>`;
      h += `</tr>`;
    }
    h += `</tbody></table>`;
    h += `</div>`;
    
    // Variant tables
    if (w.variants && w.variants.length > 0) {
      for (const v of w.variants) {
        h += `<div class="weapon-variant-content" data-variant="${v.id}" data-weapon-id="${w.id}" style="display:none;">`;
        h += `<table class="combos-table clan-combos-table"><thead><tr>
          <th class="combos-table__th clan-combos-table__th--step">Step</th>
          <th class="combos-table__th clan-combos-table__th--steptime" title="Light step time">Light Time</th>
          <th class="combos-table__th clan-combos-table__th--ldmg" title="Light attack base damage">Light Dmg</th>
          <th class="combos-table__th clan-combos-table__th--dps" title="Light damage per second">Light Dmg/s</th>
          <th class="combos-table__th clan-combos-table__th--steptime" title="Forward step time (W+attack)">Fwd Time</th>
          <th class="combos-table__th" title="Forward (W+attack) variant damage">Fwd Dmg</th>
          <th class="combos-table__th clan-combos-table__th--dps" title="Forward damage per second">Fwd Dmg/s</th>
          <th class="combos-table__th clan-combos-table__th--steptime" title="Heavy step time">Heavy Time</th>
          <th class="combos-table__th clan-combos-table__th--hdmg" title="Heavy attack base damage">Heavy Dmg</th>
          <th class="combos-table__th clan-combos-table__th--dps" title="Heavy damage per second">Heavy Dmg/s</th>
        </tr></thead><tbody>`;
        for (const r of v.rows) {
          const isPeak = r.heavyDmg >= 30;
          const lightTiming = getWeaponStepTiming(r, "L");
          const heavyTiming = getWeaponStepTiming(r, "H");
          const heavyDps = heavyTiming.time > 0 ? (r.heavyDmg / heavyTiming.time) : 0;
          const lightDps = lightTiming.time > 0 ? (r.lightDmg / lightTiming.time) : 0;
          h += `<tr class="clan-combos-table__row">`;
          h += `<td class="combos-table__td clan-combos-table__td--step">${r.step}</td>`;
          h += `<td class="combos-table__td clan-combos-table__td--steptime" title="${lightTiming.tooltip}">${lightTiming.time.toFixed(2)}s</td>`;
          h += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="ldmg">${r.lightDmg}</td>`;
          h += `<td class="combos-table__td clan-combos-table__td--dps">${lightDps.toFixed(2)}</td>`;
          if (r.fwdMontage) {
            const fwdTiming = getWeaponStepTiming(r, "F");
            const fwdDps = fwdTiming.time > 0 ? (r.fwdDmg / fwdTiming.time) : 0;
            h += `<td class="combos-table__td clan-combos-table__td--steptime" title="${fwdTiming.tooltip}">${fwdTiming.time.toFixed(2)}s</td>`;
            h += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="fdmg">${r.fwdDmg}</td>`;
            h += `<td class="combos-table__td clan-combos-table__td--dps">${fwdDps.toFixed(2)}</td>`;
          } else {
            h += `<td class="combos-table__td"><span class="crossclan__val--dim">—</span></td>`;
            h += `<td class="combos-table__td"><span class="crossclan__val--dim">—</span></td>`;
            h += `<td class="combos-table__td"><span class="crossclan__val--dim">—</span></td>`;
          }
          h += `<td class="combos-table__td clan-combos-table__td--steptime" title="${heavyTiming.tooltip}">${heavyTiming.time.toFixed(2)}s</td>`;
          h += `<td class="combos-table__td clan-combos-table__td--dmg ${isPeak ? "clan-combo__dmg--peak" : ""}" data-cell="hdmg">${r.heavyDmg}</td>`;
          h += `<td class="combos-table__td clan-combos-table__td--dps">${heavyDps.toFixed(2)}</td>`;
          h += `</tr>`;
        }
        h += `</tbody></table>`;
        h += `</div>`;
      }
    }

    // Notes
    if (w.notes && w.notes.length) {
      h += `<ul class="clan-combo-block__notes">`;
      for (const n of w.notes) h += `<li>${n}</li>`;
      h += `</ul>`;
    }

    h += `<p class="crossclan-note--sub" style="margin-top:6px"><code class="crossclan-code">${w.attackset}</code></p>`;
    h += `</div>`; // clan-combo-block
  }
  h += `</div>`; // clan-combos-tables

  // ── Shared GA section ──────────────────────────────────────
  h += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad">`;
  h += `<div class="crossclan-section-heading">`;
  h += `<span>Shared GA Tuning</span>`;
  h += `<span class="crossclan-section-heading__sub">All weapon strikes route through these GameplayAbility CDOs</span>`;
  h += `</div>`;
  h += `<details class="crossclan-lozenge" open><summary class="crossclan-lozenge__summary">Per-class GA values</summary><div class="crossclan-lozenge__body">`;
  h += `<p class="crossclan-note--sub">Per-weapon damage shown in the tables above lives in the attackset; the trace, lunge, combo-delay and hit-react values below are shared across every weapon of the same class.</p>`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th">GA</th>
    <th class="combos-table__th">Trigger</th>
    <th class="combos-table__th">Combo Delay</th>
    <th class="combos-table__th">Hit Dmg</th>
    <th class="combos-table__th">Trace</th>
    <th class="combos-table__th">Lunge</th>
    <th class="combos-table__th">Lunge Delay</th>
    <th class="combos-table__th">Hit React</th>
    <th class="combos-table__th">Flinch-Only</th>
  </tr></thead><tbody>`;
  for (const g of MELEE_WEAPON_GA_DATA) {
    const isHeavy = /Heavy/.test(g.ga);
    h += `<tr class="combos-table__tr">`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${g.ga}</code>${g.flag ? ` <span class="crossclan-note">(${g.flag})</span>` : ""}</td>`;
    h += `<td class="combos-table__td" style="font-size:11px">${g.trigger}</td>`;
    h += `<td class="combos-table__td">${g.comboDelay.toFixed(2)}s</td>`;
    h += `<td class="combos-table__td clan-combos-table__td--dmg ${isHeavy ? "clan-combo__dmg--peak" : ""}">${g.hitDmg}</td>`;
    h += `<td class="combos-table__td">${g.trace}</td>`;
    h += `<td class="combos-table__td">${g.lunge}</td>`;
    h += `<td class="combos-table__td">${g.lungeDelay.toFixed(2)}s</td>`;
    h += `<td class="combos-table__td">${g.hitReact}</td>`;
    h += `<td class="combos-table__td">${g.flinch ? `<code class="crossclan-code">${g.flinch}</code>` : `<span class="crossclan__val--dim">—</span>`}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `<ul class="crossclan-list crossclan-list--notes">
    <li><strong>Combo Delay</strong> on the GA is the input window before the next combo step — per-step combo delays come from the attackset's per-slot data.</li>
    <li><strong>Hit Dmg</strong> here is the GA fallback; real damage is whatever the attackset slot specifies (see per-weapon tables above).</li>
    <li>Heavy classes carry <code>Combat.Status.AttackArmor.Heavy</code> as flinch-only — they bypass standard guard and only flinch on armored enemies.</li>
    <li><strong>Heavy attacks BREAK the weapon</strong> — a heavy strike consumes the weapon (one-shot release, weapon is thrown/destroyed after impact), but deals significant damage.</li>
    <li><code>GA_PlayerAttack_Baton</code> is new in build 22727210 — adds the loaded electric baton's neutral strike profile.</li>
  </ul>`;
  h += `</div></details>`;
  h += `</div>`; // crossclan-section-wrap

  // ── Codex blocking notes ───────────────────────────────────
  h += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad">`;
  h += `<div class="crossclan-section-heading">`;
  h += `<span>Codex Notes — Blocking &amp; Direction</span>`;
  h += `<span class="crossclan-section-heading__sub">From in-game tutorial entries</span>`;
  h += `</div>`;
  h += `<details class="crossclan-lozenge" open><summary class="crossclan-lozenge__summary">Tutorial codex strings</summary><div class="crossclan-lozenge__body">`;
  h += `<ul class="crossclan-list crossclan-list--notes">
    <li>Most melee weapons perform a <strong>single-target attack</strong> when moving forward and a <strong>quicker shove</strong> when moving backward.</li>
    <li><strong>Bladed</strong> weapons deal more damage but stagger less effectively.</li>
    <li><strong>Blunt</strong> weapons stagger and interrupt better but deal less damage.</li>
    <li>Look directly at an incoming melee attack while idle to <strong>block</strong>, significantly reducing damage taken.</li>
    <li>Some <strong>heavier or ability-based attacks</strong> cannot be blocked.</li>
  </ul>`;
  h += `</div></details>`;
  h += `</div>`; // crossclan-section-wrap

  h += `</div>`; // combos-layout
  container.innerHTML = h;

  // Weapon variant tab event listeners
  document.querySelectorAll('.weapon-variant-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      const variantId = tab.dataset.variant;
      const weaponId = tab.dataset.weaponId;
      
      // Hide all variants for this weapon
      document.querySelectorAll(`.weapon-variant-content[data-weapon-id="${weaponId}"]`).forEach(content => {
        content.style.display = 'none';
      });
      document.querySelectorAll(`.weapon-variant-summary[data-weapon-id="${weaponId}"]`).forEach(summary => {
        summary.style.display = 'none';
      });
      
      // Remove active class from all tabs for this weapon
      document.querySelectorAll(`.weapon-variant-tab[data-weapon-id="${weaponId}"]`).forEach(t => {
        t.classList.remove('weapon-variant-tab--active');
      });
      
      // Show selected variant
      const selectedContent = document.querySelector(`.weapon-variant-content[data-variant="${variantId}"][data-weapon-id="${weaponId}"]`);
      if (selectedContent) selectedContent.style.display = 'block';
      const selectedSummary = document.querySelector(`.weapon-variant-summary[data-variant="${variantId}"][data-weapon-id="${weaponId}"]`);
      if (selectedSummary) selectedSummary.style.display = 'block';
      
      // Mark tab as active
      tab.classList.add('weapon-variant-tab--active');
    });
  });
}

// ── Ranged Weapons Combat Page ────────────────────────────────
// Sources:
// - Ref/summer/23416145/Ranged_Weapons_23416145.md
// - Ref/summer/23416145/TKable_Weapons_23416145.csv
// - Ref/summer/23416145/Weapon_Cycle_Attacksets_23416145.csv
// - Ref/summer/23416145/Weapon_Reload_Cycle_23416145.md
const RANGED_WEAPONS = [
  {
    id: "crossbow",
    name: "Crossbow",
    registryName: "Crossbow",
    family: "Crossbow",
    icon: "assets/ammo/T_UI_tempwep_crossbow.png",
    ammoBeforeReload: 1,
    reloadAmmoMag: null,
    defaultAmmoTotal: 1,
    projectileDamage: "special",
    directDamage: 0.1,
    explosionDamage: 80,
    shotDamageOverride: 80.1,
    projectilesPerShot: 1,
    playerFireRate: 1.0,
    maxAmmo: 1,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 1, shotFireRate: 0.1, damagePerProjectile: "special" },
    damageTag: "Data.Damage.Ranged.Crossbow",
    instanceClass: "BP_WeaponInstance_Crossbow_C",
    projectileSource: "verified:BP_WeaponInstance_Crossbow",
    notes: ["Only crossbows have a true one-shot pickup profile.", "Player attacksets fire WrestlerProjectile_ExplodingBolt_C: 0.1 direct damage plus 80 enemy explosion damage."],
  },
  {
    id: "iao-rifle",
    name: "IAO Rifle",
    registryName: "IAORifle",
    family: "Rifle",
    icon: "assets/ammo/T_UI_tempwep_IAOrifle.png",
    ammoBeforeReload: 20,
    reloadAmmoMag: null,
    defaultAmmoTotal: 20,
    projectileDamage: 6.0,
    projectilesPerShot: 1,
    playerFireRate: 0.1,
    maxAmmo: 30,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 5, shotFireRate: 0.1, damagePerProjectile: 1.5 },
    damageTag: "Data.Damage.Ranged.AssaultRifle",
    instanceClass: "BP_WeaponInstance_Rifle_C",
    projectileSource: "verified:DT_ThrowableWeapons",
  },
  {
    id: "sniper-rifle",
    name: "Sniper Rifle",
    registryName: "SniperRifle",
    family: "Scoped rifle",
    icon: "assets/ammo/T_UI_tempwep_sniper.png",
    ammoBeforeReload: 1,
    reloadAmmoMag: 1,
    defaultAmmoTotal: 2,
    projectileDamage: 60.0,
    projectilesPerShot: 1,
    playerFireRate: 1.0,
    maxAmmo: 5,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 1, shotFireRate: 0.7, damagePerProjectile: 14.0 },
    damageTag: "",
    instanceClass: "BP_WeaponInstance_SniperRifle_C",
    projectileSource: "verified:DT_ThrowableWeapons",
    cycle: {
      kind: "Bolt/load cycle",
      single: { attackset: "Attackset_Sniper", cycle: "AM_Sniper_Cycle", cycleTime: 0.8, montageLength: 1.34445 },
      dual: { attackset: "Attackset_Sniper_Dual", cycle: "AM_Sniper_Cycle_Dual", cycleTime: 0.8, montageLength: 0.98333335 },
      notes: ["Dual sniper cycle reuses the shotgun dual-cycle animation asset."],
    },
    notes: ["Hold right click for scope. Scope is lost while dual-wielding.", "Observed pickups can show 2 shots, but reload/cycle mag is 1."],
  },
  {
    id: "iao-shotgun",
    name: "IAO Shotgun",
    registryName: "IAOShotgun",
    family: "Shotgun",
    icon: "assets/ammo/T_UI_tempwep_IAOShotgun.png",
    ammoBeforeReload: 2,
    reloadAmmoMag: null,
    defaultAmmoTotal: 2,
    projectileDamage: 4.3,
    projectilesPerShot: 7,
    playerFireRate: 0.2,
    maxAmmo: 5,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 1, shotFireRate: 1.4, damagePerProjectile: 1.0 },
    damageTag: "Data.Damage.Ranged.Shotgun",
    instanceClass: "BP_WeaponInstance_Shotgun_C",
    projectileSource: "verified:BP_WeaponInstance_Shotgun",
    cycleAbsentNote: "No RangedCycle or CycleTime in this export; treated as straight fire.",
    notes: ["Loaded ammo is 2 shots; no pump/cycle timing is applied."],
  },
  {
    id: "dollar-store-m4",
    name: "Dollar Store M4",
    registryName: "DollarStoreM4",
    family: "Rifle",
    icon: "assets/ammo/T_UI_tempwep_M4.png",
    ammoBeforeReload: 20,
    reloadAmmoMag: null,
    defaultAmmoTotal: 20,
    projectileDamage: 6.0,
    projectilesPerShot: 1,
    playerFireRate: 0.1,
    maxAmmo: 30,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 5, shotFireRate: 0.1, damagePerProjectile: 1.5 },
    damageTag: "Data.Damage.Ranged.AssaultRifle",
    instanceClass: "BP_WeaponInstance_Rifle_ThinbloodEarly_C",
    projectileSource: "verified:DT_ThrowableWeapons",
  },
  {
    id: "stubby-smg",
    name: "Stubby SMG",
    registryName: "StubbySmg",
    family: "SMG",
    icon: "assets/ammo/T_UI_tempwep_stubby.png",
    ammoBeforeReload: 25,
    reloadAmmoMag: null,
    defaultAmmoTotal: 25,
    projectileDamage: 4.0,
    projectilesPerShot: 1,
    playerFireRate: 0.08,
    maxAmmo: 60,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 15, shotFireRate: 0.08, damagePerProjectile: 1.2 },
    damageTag: "",
    instanceClass: "BP_WeaponInstance_Rifle_Dual_C",
    projectileSource: "verified:DT_ThrowableWeapons",
  },
  {
    id: "smg",
    name: "SMG",
    registryName: "SMG",
    family: "SMG",
    icon: "assets/ammo/T_UI_tempwep_mp5.png",
    ammoBeforeReload: 30,
    reloadAmmoMag: null,
    defaultAmmoTotal: 30,
    projectileDamage: 3.0,
    projectilesPerShot: 1,
    playerFireRate: 0.07,
    maxAmmo: 30,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 3, shotFireRate: 0.07, damagePerProjectile: 1.5 },
    damageTag: "",
    instanceClass: "BP_WeaponInstance_SMG_C",
    projectileSource: "verified:BP_WeaponInstance_SMG",
  },
  {
    id: "shotgun",
    name: "Shotgun",
    registryName: "Shotgun",
    family: "Shotgun",
    icon: "assets/ammo/T_UI_tempwep_shotgun.png",
    ammoBeforeReload: 1,
    reloadAmmoMag: 1,
    defaultAmmoTotal: 2,
    projectileDamage: 4.8,
    projectilesPerShot: 12,
    playerFireRate: 0.7,
    maxAmmo: 4,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 1, shotFireRate: 1.5, damagePerProjectile: 1.0 },
    damageTag: "Data.Damage.Ranged.Shotgun",
    instanceClass: "BP_WeaponInstance_Shotgun_ThinbloodEarly_C",
    projectileSource: "verified:BP_WeaponInstance_Shotgun_ThinbloodEarly",
    cycle: {
      kind: "Pump action",
      single: { attackset: "Attackset_ShedShotgun", cycle: "AM_Shotgun_Cycle", cycleTime: 0.6, montageLength: 0.98333335 },
      dual: { attackset: "Attackset_ShedShotgun_Dual", cycle: "AM_Shotgun_Cycle_Dual", cycleTime: 0.6, montageLength: 0.98333335 },
      notes: ["Player pump cycle uses AM_wep_Player_shotgun_Cycle."],
    },
    notes: ["Pickup total can show 2 shots, but reload/cycle mag is 1."],
  },
  {
    id: "revolver",
    name: "Revolver",
    registryName: "Revolver",
    family: "Handgun",
    icon: "assets/ammo/T_UI_tempwep_revolver.png",
    ammoBeforeReload: 6,
    reloadAmmoMag: null,
    defaultAmmoTotal: 6,
    projectileDamage: 10.0,
    projectilesPerShot: 1,
    playerFireRate: 0.2,
    maxAmmo: 6,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 1, shotFireRate: 1.25, damagePerProjectile: 3.75 },
    damageTag: "Data.Damage.Ranged.Revolver",
    instanceClass: "BP_WeaponInstance_Revolver_C",
    projectileSource: "verified:BP_WeaponInstance_Revolver",
  },
  {
    id: "mega-shotty",
    name: "Mega Shotty",
    registryName: "MegaShotty",
    family: "Shotgun",
    icon: "assets/ammo/T_UI_tempwep_MegaShotgun.png",
    ammoBeforeReload: 5,
    reloadAmmoMag: null,
    defaultAmmoTotal: 5,
    projectileDamage: 3.4,
    projectilesPerShot: 8,
    playerFireRate: 0.25,
    maxAmmo: 10,
    maxAmmoSource: "inherited_native_default",
    enemy: { shotsPerBurst: 5, shotFireRate: 0.8, damagePerProjectile: 1.0 },
    damageTag: "Data.Damage.Ranged.Shotgun",
    instanceClass: "BP_WeaponInstance_Shotgun_Pump_C",
    projectileSource: "verified:BP_WeaponInstance_Shotgun_Pump",
    cycleAbsentNote: "No RangedCycle or CycleTime in this export; pump naming is on the weapon instance/asset identity.",
  },
  {
    id: "pistol",
    name: "Pistol",
    registryName: "Pistol",
    family: "Handgun",
    icon: "assets/ammo/T_UI_tempwep_pistol.png",
    ammoBeforeReload: 10,
    reloadAmmoMag: null,
    defaultAmmoTotal: 10,
    projectileDamage: 10.0,
    projectilesPerShot: 1,
    playerFireRate: 0.2,
    maxAmmo: 15,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 6, shotFireRate: 0.5, damagePerProjectile: 3.0 },
    damageTag: "Data.Damage.Ranged.Handgun",
    instanceClass: "BP_WeaponInstance_Handgun_C",
    projectileSource: "verified:BP_WeaponInstance_Handgun",
  },
  {
    id: "high-cal-revolver",
    name: "High Cal Revolver",
    registryName: "HighCalRevolver",
    family: "Handgun",
    icon: "assets/ammo/T_UI_tempwep_hical.png",
    ammoBeforeReload: 6,
    reloadAmmoMag: null,
    defaultAmmoTotal: 6,
    projectileDamage: 15.0,
    projectilesPerShot: 1,
    playerFireRate: 0.25,
    maxAmmo: 6,
    maxAmmoSource: "override",
    enemy: { shotsPerBurst: 1, shotFireRate: 1.25, damagePerProjectile: 3.75 },
    damageTag: "Data.Damage.Ranged.Revolver",
    instanceClass: "BP_WeaponInstance_HighCaliburPistol_C",
    projectileSource: "verified:BP_WeaponInstance_HighCaliburPistol",
  },
];

const RANGED_DUAL_FIRE_DATA = {
  "crossbow": {
    singleAttackset: "Attackset_Crossbow",
    dualAttackset: "Attackset_Crossbow_Dual",
    singleFireRate: 0.4,
    dualFireRate: 0.1,
    cadenceMultiplier: 4.0,
    singleDamage: 0.1,
    dualDamage: 0.1,
    singlePellets: null,
    dualPellets: null,
    dualRangedFire: "AM_Player_Dual_Fire_R",
    dualRangedFireL: "AM_Player_Dual_Fire_L",
    notes: "Much faster than single; not simply doubled.",
  },
  "dollar-store-m4": {
    singleAttackset: "Attackset_DollarStoreM4",
    dualAttackset: "Attackset_DollarStoreM4_dual",
    singleFireRate: 0.1,
    dualFireRate: 0.1,
    cadenceMultiplier: 1.0,
    singleDamage: 6,
    dualDamage: 6,
    singlePellets: null,
    dualPellets: null,
    dualRangedFire: "AM_Player_Dual_Fire",
    dualRangedFireL: "AM_Player_Dual_Fire",
    notes: "Same attack cadence.",
  },
  "pistol": {
    singleAttackset: "Attackset_Handgun",
    dualAttackset: "Attackset_Handgun_Dual",
    singleFireRate: 0.06,
    dualFireRate: 0.06,
    cadenceMultiplier: 1.0,
    singleDamage: 10,
    dualDamage: 10,
    singlePellets: null,
    dualPellets: null,
    dualRangedFire: "AM_Player_Dual_Fire_R",
    dualRangedFireL: "AM_Player_Dual_Fire_L",
    notes: "Same attack cadence.",
  },
  "high-cal-revolver": {
    singleAttackset: "Attackset_HicalRevolver",
    dualAttackset: "Attackset_HicalRevolver_Dual",
    singleFireRate: 0.25,
    dualFireRate: 0.25,
    cadenceMultiplier: 1.0,
    singleDamage: 20,
    dualDamage: 20,
    singlePellets: null,
    dualPellets: null,
    dualRangedFire: "AM_Player_Dual_FireBig_R",
    dualRangedFireL: "AM_Player_Dual_FireBig_L",
    notes: "Same attack cadence.",
  },
  "iao-rifle": {
    singleAttackset: "Attackset_IAORifle",
    dualAttackset: "Attackset_IAORifle_Dual",
    singleFireRate: 0.1,
    dualFireRate: 0.1,
    cadenceMultiplier: 1.0,
    singleDamage: 6,
    dualDamage: 6,
    singlePellets: null,
    dualPellets: null,
    dualRangedFire: "AM_Player_Dual_Fire",
    dualRangedFireL: "AM_Player_Dual_Fire",
    notes: "Same attack cadence.",
  },
  "iao-shotgun": {
    singleAttackset: "Attackset_IAOShotgun",
    dualAttackset: "Attackset_IAOShotgun_Dual",
    singleFireRate: 0.06,
    dualFireRate: 0.06,
    cadenceMultiplier: 1.0,
    singleDamage: 5.2,
    dualDamage: 5.2,
    singlePellets: 9,
    dualPellets: 9,
    dualRangedFire: "AM_Player_Dual_Fire_R",
    dualRangedFireL: "AM_Player_Dual_Fire_L",
    notes: "Same attack cadence and same pellets.",
  },
  "mega-shotty": {
    singleAttackset: "Attackset_MegaShotgun",
    dualAttackset: "Attackset_MegaShotgun_dual",
    singleFireRate: 0.25,
    dualFireRate: 0.2,
    cadenceMultiplier: 1.25,
    singleDamage: 6,
    dualDamage: 6,
    singlePellets: 8,
    dualPellets: 8,
    dualRangedFire: "AM_Player_Dual_Fire_R",
    dualRangedFireL: "AM_Player_Dual_Fire_L",
    notes: "Dual uses inherited 0.2s FireRate.",
  },
  "smg": {
    singleAttackset: "Attackset_MP5",
    dualAttackset: "Attackset_MP5_Dual",
    singleFireRate: 0.07,
    dualFireRate: 0.07,
    cadenceMultiplier: 1.0,
    singleDamage: 3.6,
    dualDamage: 3.6,
    singlePellets: null,
    dualPellets: null,
    dualRangedFire: "AM_Player_Dual_Fire",
    dualRangedFireL: "AM_Player_Dual_Fire",
    notes: "Same attack cadence.",
  },
  "revolver": {
    singleAttackset: "Attackset_Revolver",
    dualAttackset: "Attackset_Revolver_Dual",
    singleFireRate: 0.15,
    dualFireRate: 0.1,
    cadenceMultiplier: 1.5,
    singleDamage: 10,
    dualDamage: 10,
    singlePellets: null,
    dualPellets: null,
    dualRangedFire: "AM_Player_Dual_Fire_R",
    dualRangedFireL: "AM_Player_Dual_Fire_L",
    notes: "Faster, but not doubled.",
  },
  "shotgun": {
    singleAttackset: "Attackset_ShedShotgun",
    dualAttackset: "Attackset_ShedShotgun_Dual",
    singleFireRate: 0.06,
    dualFireRate: 0.06,
    cadenceMultiplier: 1.0,
    singleDamage: 4.8,
    dualDamage: 4.8,
    singlePellets: 12,
    dualPellets: 12,
    dualRangedFire: "AM_Player_Dual_Fire_R",
    dualRangedFireL: "AM_Player_Dual_Fire_L",
    notes: "Same attack cadence and same pellets.",
  },
  "sniper-rifle": {
    singleAttackset: "Attackset_Sniper",
    dualAttackset: "Attackset_Sniper_Dual",
    singleFireRate: 0.5,
    dualFireRate: 0.1,
    cadenceMultiplier: 5.0,
    singleDamage: 60,
    dualDamage: 60,
    singlePellets: null,
    dualPellets: null,
    dualRangedFire: "AM_Player_Dual_Fire_R",
    dualRangedFireL: "AM_Player_Dual_Fire_L",
    notes: "Much faster than single; not simply doubled.",
  },
  "stubby-smg": {
    singleAttackset: "Attackset_StubbySMG",
    dualAttackset: "Attackset_StubbySMGDual",
    singleFireRate: 0.08,
    dualFireRate: 0.08,
    cadenceMultiplier: 1.0,
    singleDamage: 4,
    dualDamage: 4,
    singlePellets: null,
    dualPellets: null,
    dualRangedFire: "AM_Player_Dual_Fire",
    dualRangedFireL: "AM_Player_Dual_Fire",
    notes: "Same attack cadence.",
  },
};

const RANGED_DUAL_READS = {
  "crossbow": {
    label: "Exploding bolt",
    text: "Exploding bolt: one R/L bolt per cadence; damage is 0.1 direct + 80 explosion.",
    damageEventsPerCadence: 1,
  },
  "iao-rifle": {
    label: "Both-guns",
    text: "Shared AM_Player_Dual_Fire montage; assumes 2 damage events per cadence.",
    damageEventsPerCadence: 2,
  },
  "sniper-rifle": {
    label: "R/L cycle pair",
    text: "R/L montages; one dual cycle after each two-hand pair.",
    damageEventsPerCadence: 1,
  },
  "iao-shotgun": {
    label: "R/L straight",
    text: "R/L montages; no cycle timing exported, treated as straight fire.",
    damageEventsPerCadence: 1,
  },
  "dollar-store-m4": {
    label: "Both-guns",
    text: "Shared AM_Player_Dual_Fire montage; assumes 2 damage events per cadence.",
    damageEventsPerCadence: 2,
  },
  "stubby-smg": {
    label: "Both-guns",
    text: "Shared AM_Player_Dual_Fire montage; assumes 2 damage events per cadence.",
    damageEventsPerCadence: 2,
  },
  "smg": {
    label: "Both-guns",
    text: "Shared AM_Player_Dual_Fire montage; assumes 2 damage events per cadence.",
    damageEventsPerCadence: 2,
  },
  "shotgun": {
    label: "R/L cycle pair",
    text: "R/L montages; one dual pump after each two-hand pair.",
    damageEventsPerCadence: 1,
  },
  "revolver": {
    label: "R/L faster",
    text: "R/L montages; faster cadence only.",
    damageEventsPerCadence: 1,
  },
  "mega-shotty": {
    label: "R/L inherited",
    text: "R/L montages; inherited 0.2s dual FireRate, no cycle timing.",
    damageEventsPerCadence: 1,
  },
  "pistol": {
    label: "R/L alternating",
    text: "R/L montages; alternating/single damage event per cadence.",
    damageEventsPerCadence: 1,
  },
  "high-cal-revolver": {
    label: "R/L big-fire",
    text: "R/L big-fire montages; alternating/single damage event per cadence.",
    damageEventsPerCadence: 1,
  },
};

const RANGED_ENEMY_RELOAD_PROFILES = {
  crossbow: { asset: "AM_Enemy_Combat_Reload_Crossbow", length: 4.26667, note: "Rifle reload animation at play rate 0.5." },
  rifle: { asset: "AM_Enemy_Combat_Reload_Rifle_01", length: 2.13333, note: "Generic enemy rifle reload." },
  shotgun: { asset: "AM_Enemy_Combat_Reload_Shotgun_01", length: 2.7, cycle: "AM_shotgun_Cycle", cycleLength: 1.1, note: "Enemy shotgun reload; enemy shotgun cycle is separate." },
  pistol: { asset: "AM_Enemy_Combat_Reload_Pistol_01", length: 2.13333, note: "Generic enemy pistol reload." },
  revolver: { asset: "AM_Enemy_Combat_Reload_Pistol_Revolver_01", length: 2.13333, note: "Generic enemy revolver reload." },
};

let RANGED_WEAPON_TABLE_MODE = "single";
const RANGED_DUAL_CAP_NO_DOUBLE = new Set(["pistol", "revolver", "high-cal-revolver"]);

function formatRangedNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return String(value || "");
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatRangedValue(value, suffix = "") {
  const formatted = formatRangedNumber(value);
  if (!formatted) return `<span class="crossclan__val--dim">&mdash;</span>`;
  return `${formatted}${suffix}`;
}

function getRangedEnemyBurstTotal(weapon) {
  const enemy = weapon.enemy || {};
  if (typeof enemy.damagePerProjectile !== "number" || typeof enemy.shotsPerBurst !== "number") return null;
  return enemy.damagePerProjectile * enemy.shotsPerBurst;
}

function renderRangedCardStat(label, value, extra = "") {
  return `<div class="ranged-card-stat"><span class="ranged-card-stat__label">${label}</span><span class="ranged-card-stat__value">${value}</span>${extra ? `<span class="ranged-card-stat__extra">${extra}</span>` : ""}</div>`;
}

function renderRangedAttacksetDamage(damage, pellets) {
  if (typeof damage !== "number") return `<span class="crossclan__val--dim">&mdash;</span>`;
  if (typeof pellets === "number" && pellets > 1) {
    const total = damage * pellets;
    return `${formatRangedNumber(damage)} x ${formatRangedNumber(pellets)} <span class="ranged-card-stat__total">${formatRangedNumber(total)}</span>`;
  }
  return formatRangedNumber(damage);
}

function renderRangedWeaponDamageValue(weapon) {
  if (typeof weapon.shotDamageOverride === "number") {
    return `${formatRangedNumber(weapon.directDamage)} + ${formatRangedNumber(weapon.explosionDamage)} <span class="ranged-card-stat__total">${formatRangedNumber(weapon.shotDamageOverride)}</span>`;
  }
  const data = RANGED_DUAL_FIRE_DATA[weapon.id];
  const damageChanges = data.singleDamage !== data.dualDamage || data.singlePellets !== data.dualPellets;
  if (weapon.projectileDamage === "special") return `<span class="crossclan__val--dim">special</span>`;
  if (damageChanges) {
    return `Single ${renderRangedAttacksetDamage(data.singleDamage, data.singlePellets)} / Dual ${renderRangedAttacksetDamage(data.dualDamage, data.dualPellets)}`;
  }
  return renderRangedAttacksetDamage(data.singleDamage, data.singlePellets);
}

function getRangedWeaponDamageNote(weapon) {
  if (typeof weapon.shotDamageOverride === "number") {
    return "direct attackset hit + BP_Explosion_C EnemyDamage";
  }
  const data = RANGED_DUAL_FIRE_DATA[weapon.id];
  const damageChanges = data.singleDamage !== data.dualDamage || data.singlePellets !== data.dualPellets;
  if (weapon.projectileDamage === "special") {
    return "damage is special-cased outside the direct attackset/projectile fields";
  }
  if (damageChanges) return "single and dual attacksets differ";
  return typeof data.singlePellets === "number" && data.singlePellets > 1
    ? "per projectile x pellets; unchanged by dual-wield"
    : "attackset damage; unchanged by dual-wield";
}

function getRangedAttacksetShotDamage(weapon, mode) {
  if (typeof weapon.shotDamageOverride === "number") return weapon.shotDamageOverride;
  if (weapon.projectileDamage === "special") return null;
  const data = RANGED_DUAL_FIRE_DATA[weapon.id];
  const damage = mode === "dual" ? data.dualDamage : data.singleDamage;
  const pellets = mode === "dual" ? data.dualPellets : data.singlePellets;
  if (typeof damage !== "number") return null;
  return damage * (typeof pellets === "number" && pellets > 1 ? pellets : 1);
}

function getRangedCapDisplay(weapon) {
  if (typeof weapon.reloadAmmoMag === "number") {
    return `${formatRangedNumber(weapon.ammoBeforeReload)} loaded + ${formatRangedNumber(weapon.reloadAmmoMag)} mag`;
  }
  return formatRangedNumber(weapon.ammoBeforeReload || weapon.defaultAmmoTotal || weapon.maxAmmo);
}

function getRangedAmmoCapShots(weapon, mode) {
  const baseCap = typeof weapon.defaultAmmoTotal === "number"
    ? weapon.defaultAmmoTotal
    : (weapon.ammoBeforeReload || 0) + (weapon.reloadAmmoMag || 0);
  if (mode !== "dual" || RANGED_DUAL_CAP_NO_DOUBLE.has(weapon.id)) return baseCap;
  return baseCap * 2;
}

function getRangedDualRead(weapon) {
  return RANGED_DUAL_READS[weapon.id] || {
    label: "Dual",
    text: "Dual read unavailable.",
    damageEventsPerCadence: 1,
  };
}

function getRangedCycleTime(weapon, mode) {
  if (!weapon.cycle) return 0;
  const cycle = mode === "dual" ? weapon.cycle.dual : weapon.cycle.single;
  return cycle && typeof cycle.cycleTime === "number" ? cycle.cycleTime : 0;
}

function getRangedDpsOutput(weapon, mode) {
  const data = RANGED_DUAL_FIRE_DATA[weapon.id];
  const fireRate = mode === "dual" ? data.dualFireRate : data.singleFireRate;
  const damagePerShot = getRangedAttacksetShotDamage(weapon, mode);
  if (typeof fireRate !== "number" || typeof damagePerShot !== "number") return null;

  const capShots = getRangedAmmoCapShots(weapon, mode);
  if (typeof capShots !== "number" || capShots <= 0) return null;

  if (weapon.cycle) {
    const shots = capShots;
    const cycleTime = getRangedCycleTime(weapon, mode);
    const fireTime = fireRate * shots;
    const totalCycleTime = cycleTime;
    const totalTime = fireTime + totalCycleTime;
    const totalDamage = damagePerShot * shots;
    const theoreticalDps = totalTime > 0 ? totalDamage / totalTime : null;
    const ammoLimited = typeof theoreticalDps === "number" && totalDamage + 0.0001 < theoreticalDps;
    return {
      shots,
      damageEvents: shots,
      damagePerShot,
      totalDamage,
      totalTime,
      dps: ammoLimited ? totalDamage : theoreticalDps,
      theoreticalDps,
      ammoLimited,
      capShots,
      fireTime,
      cycleTime,
      totalCycleTime,
      cycleCount: cycleTime > 0 ? 1 : 0,
      formulaType: "cycle",
    };
  }

  const read = getRangedDualRead(weapon);
  const damageEvents = mode === "dual" && typeof read.damageEventsPerCadence === "number"
    ? read.damageEventsPerCadence
    : 1;
  const cadenceDamage = damagePerShot * damageEvents;
  const cadenceTime = fireRate;
  const totalDamage = damagePerShot * capShots;
  const totalTime = (capShots / damageEvents) * fireRate;
  const theoreticalDps = cadenceTime > 0 ? cadenceDamage / cadenceTime : null;
  const ammoLimited = typeof theoreticalDps === "number" && totalDamage + 0.0001 < theoreticalDps;
  return {
    shots: capShots,
    damageEvents,
    damagePerShot,
    totalDamage,
    totalTime,
    dps: ammoLimited ? totalDamage : theoreticalDps,
    theoreticalDps,
    ammoLimited,
    capShots,
    cadenceDamage,
    cadenceTime,
    fireTime: fireRate,
    cycleTime: 0,
    totalCycleTime: 0,
    cycleCount: 0,
    formulaType: "cadence",
  };
}

function getRangedClipOutput(weapon, mode) {
  return getRangedDpsOutput(weapon, mode);
}

function renderRangedClipOutput(weapon, mode) {
  const output = getRangedDpsOutput(weapon, mode);
  if (!output || typeof output.dps !== "number") {
    return `<span class="ranged-cadence-cell__output"><span class="crossclan__val--dim">DPS unavailable</span></span>`;
  }

  const valueClass = output.ammoLimited ? " ranged-cadence-cell__output-value--ammo-limited" : "";
  const cycleNote = output.formulaType === "cycle" && output.totalCycleTime > 0
    ? ` + ${formatRangedNumber(output.totalCycleTime)}s cycle`
    : "/cadence";
  const outputUnit = output.formulaType === "cycle"
    ? `${output.shots} shots`
    : `${formatRangedNumber(output.damageEvents)} damage event${output.damageEvents === 1 ? "" : "s"}`;
  const note = output.ammoLimited
    ? `ammo limit: ${formatRangedNumber(output.totalDamage)} dmg in ${formatRangedNumber(output.totalTime)}s; true ${formatRangedNumber(output.theoreticalDps)}`
    : `${formatRangedNumber(output.totalDamage)} dmg / ${formatRangedNumber(output.totalTime)}s (${outputUnit}${cycleNote})`;
  return `<span class="ranged-cadence-cell__output">
    <span class="ranged-cadence-cell__output-value${valueClass}">${formatRangedNumber(output.dps)} DPS</span>
    <span class="ranged-cadence-cell__output-note">${note}</span>
  </span>`;
}

function renderRangedCapSummary(weapon) {
  return {
    value: getRangedCapDisplay(weapon),
    note: "loaded before reload/cycle",
  };
}

function renderRangedCycleSummary(weapon) {
  if (!weapon.cycle) {
    return {
      value: `<span class="crossclan__val--dim">none exported</span>`,
      note: weapon.cycleAbsentNote || "No player RangedCycle field.",
    };
  }

  const single = weapon.cycle.single;
  const dual = weapon.cycle.dual;
  const sameTime = dual && single.cycleTime === dual.cycleTime;
  const dualLine = dual
    ? ` Dual: <code class="crossclan-code">${dual.cycle}</code>${sameTime ? "" : ` ${formatRangedNumber(dual.cycleTime)}s`}.`
    : "";
  const notes = weapon.cycle.notes && weapon.cycle.notes.length ? ` ${weapon.cycle.notes.join(" ")}` : "";
  return {
    value: `${weapon.cycle.kind} ${formatRangedNumber(single.cycleTime)}s`,
    note: `Single: <code class="crossclan-code">${single.cycle}</code>.${dualLine} ${formatRangedNumber(single.montageLength)}s single montage.${notes}`,
  };
}

function renderRangedSharedStats(weapon) {
  const cap = renderRangedCapSummary(weapon);
  const cycle = renderRangedCycleSummary(weapon);
  const damageValue = renderRangedWeaponDamageValue(weapon);
  const damageNote = getRangedWeaponDamageNote(weapon);

  let html = `<div class="ranged-shared-panel">`;
  html += `<div class="ranged-shared-panel__title">Shared Weapon Stats</div>`;
  html += renderRangedCardStat("Damage", damageValue, damageNote);
  html += renderRangedCardStat("Ammo", cap.value, cap.note);
  html += renderRangedCardStat("Cycle", cycle.value, cycle.note);
  html += `</div>`;
  return html;
}

function getRangedEnemyReloadProfile(weapon) {
  if (weapon.id === "crossbow") return RANGED_ENEMY_RELOAD_PROFILES.crossbow;
  if (weapon.id === "pistol") return RANGED_ENEMY_RELOAD_PROFILES.pistol;
  if (weapon.id === "revolver" || weapon.id === "high-cal-revolver") return RANGED_ENEMY_RELOAD_PROFILES.revolver;
  if (/shotgun/i.test(weapon.family)) return RANGED_ENEMY_RELOAD_PROFILES.shotgun;
  return RANGED_ENEMY_RELOAD_PROFILES.rifle;
}

function renderRangedCadenceBlock(weapon) {
  const data = RANGED_DUAL_FIRE_DATA[weapon.id];
  const mult = typeof data.cadenceMultiplier === "number"
    ? `${formatRangedNumber(data.cadenceMultiplier)}x`
    : "unknown";
  const hot = typeof data.cadenceMultiplier === "number" && data.cadenceMultiplier > 1;
  const singleOutput = getRangedDpsOutput(weapon, "single");
  const dualOutput = getRangedDpsOutput(weapon, "dual");
  const dpsMult = singleOutput && dualOutput && singleOutput.dps > 0
    ? dualOutput.dps / singleOutput.dps
    : null;
  let html = `<div class="ranged-cadence-panel">`;
  html += `<div class="ranged-cadence-panel__title">Wield Cadence</div>`;
  html += `<div class="ranged-cadence-panel__grid">`;
  html += `<div class="ranged-cadence-cell"><span class="ranged-cadence-cell__label">Single</span><span class="ranged-cadence-cell__value">${formatRangedValue(data.singleFireRate, "s")}</span>${renderRangedClipOutput(weapon, "single")}<code class="crossclan-code ranged-code">${data.singleAttackset}</code></div>`;
  html += `<div class="ranged-cadence-cell ranged-cadence-cell--dual"><span class="ranged-cadence-cell__label">Dual</span><span class="ranged-cadence-cell__value">${formatRangedValue(data.dualFireRate, "s")}</span>${renderRangedClipOutput(weapon, "dual")}<code class="crossclan-code ranged-code">${data.dualAttackset}</code></div>`;
  html += `<div class="ranged-cadence-cell ranged-cadence-cell--mult"><span class="ranged-cadence-cell__label">FireRate Mult</span><span class="ranged-cadence-cell__value${hot ? " ranged-cadence-cell__value--hot" : ""}">${mult}</span><span>${data.notes}</span>${dpsMult ? `<span class="ranged-cadence-cell__output"><span class="ranged-cadence-cell__output-value">${formatRangedNumber(dpsMult)}x DPS</span><span class="ranged-cadence-cell__output-note">after corrected cadence/cycle math</span></span>` : ""}</div>`;
  html += `</div>`;
  html += `<div class="ranged-cadence-panel__montages">Dual fire montages: <code class="crossclan-code ranged-code">${data.dualRangedFire}</code> / <code class="crossclan-code ranged-code">${data.dualRangedFireL}</code></div>`;
  html += `</div>`;
  return html;
}

function renderRangedEnemyBlock(weapon) {
  const enemyBurstTotal = getRangedEnemyBurstTotal(weapon);
  const reload = getRangedEnemyReloadProfile(weapon);
  let html = `<div class="ranged-card-sideblock ranged-card-sideblock--enemy">`;
  html += `<span class="ranged-card-sideblock__label">Enemy / GAS</span>`;
  html += `<span class="ranged-card-sideblock__note">Burst: ${formatRangedValue(weapon.enemy.shotsPerBurst)}${enemyBurstTotal !== null ? ` (${formatRangedNumber(enemyBurstTotal)} dmg)` : ""}</span>`;
  html += `<span class="ranged-card-sideblock__note">ShotFireRate: ${formatRangedValue(weapon.enemy.shotFireRate, "s")}</span>`;
  html += `<span class="ranged-card-sideblock__note">Projectile dmg: ${formatRangedValue(weapon.enemy.damagePerProjectile)}</span>`;
  html += `<span class="ranged-card-sideblock__note">Reload: <code class="crossclan-code ranged-code">${reload.asset}</code> ${formatRangedNumber(reload.length)}s</span>`;
  if (reload.cycle) {
    html += `<span class="ranged-card-sideblock__note">Cycle: <code class="crossclan-code ranged-code">${reload.cycle}</code> ${formatRangedNumber(reload.cycleLength)}s</span>`;
  }
  html += `<span class="ranged-card-sideblock__note">${reload.note}</span>`;
  html += `</div>`;
  return html;
}

function renderRangedDamageCell(weapon) {
  const data = RANGED_DUAL_FIRE_DATA[weapon.id];
  if (typeof weapon.shotDamageOverride === "number") {
    return `<span class="ranged-table__value">${formatRangedNumber(weapon.directDamage)} + ${formatRangedNumber(weapon.explosionDamage)}</span><span class="ranged-table__sub">direct + explosion = ${formatRangedNumber(weapon.shotDamageOverride)}</span>`;
  }
  if (weapon.projectileDamage === "special") {
    return `<span class="crossclan__val--dim">special</span><span class="ranged-table__sub">outside direct damage fields</span>`;
  }
  const changes = data.singleDamage !== data.dualDamage || data.singlePellets !== data.dualPellets;
  const base = renderRangedAttacksetDamage(data.singleDamage, data.singlePellets);
  if (!changes) return `${base}<span class="ranged-table__sub">attackset shot damage</span>`;
  return `<span>Single ${renderRangedAttacksetDamage(data.singleDamage, data.singlePellets)}</span><span class="ranged-table__sub">Dual ${renderRangedAttacksetDamage(data.dualDamage, data.dualPellets)}</span>`;
}

function renderRangedCapCell(weapon) {
  return `<span class="ranged-table__value">${getRangedCapDisplay(weapon)}</span>`;
}

function renderRangedDualReadCell(weapon) {
  const read = getRangedDualRead(weapon);
  return `<span class="ranged-table__value">${read.label}</span><span class="ranged-table__sub">${read.text}</span>`;
}

function renderRangedCycleTableCell(weapon) {
  if (!weapon.cycle) {
    return `<span class="crossclan__val--dim">none exported</span><span class="ranged-table__sub">${weapon.cycleAbsentNote || "no cycle timing applied"}</span>`;
  }

  const single = weapon.cycle.single;
  const dual = weapon.cycle.dual;
  const inferred = weapon.cycle.inferred ? "inferred" : "exported";
  const dualText = dual && dual.cycleTime !== single.cycleTime ? ` / dual ${formatRangedNumber(dual.cycleTime)}s` : "";
  const montageText = typeof single.montageLength === "number"
    ? `<span class="ranged-table__sub">${formatRangedNumber(single.montageLength)}s montage</span>`
    : "";
  return `<span class="ranged-table__value">${formatRangedNumber(single.cycleTime)}s${dualText}</span><span class="ranged-table__sub">${weapon.cycle.kind} wait, ${inferred}</span>${montageText}`;
}

function renderRangedFireRateCell(weapon, mode) {
  const data = RANGED_DUAL_FIRE_DATA[weapon.id];
  const isDual = mode === "dual";
  const fireRate = isDual ? data.dualFireRate : data.singleFireRate;
  const attackset = isDual ? data.dualAttackset : data.singleAttackset;
  const mult = typeof data.cadenceMultiplier === "number" ? ` (${formatRangedNumber(data.cadenceMultiplier)}x)` : " (unknown mult)";
  return `<span class="ranged-table__value">${formatRangedValue(fireRate, "s")}${isDual ? mult : ""}</span><span class="ranged-table__sub"><code class="crossclan-code ranged-code">${attackset}</code></span>`;
}

function renderRangedDpsCell(weapon, mode) {
  const output = getRangedDpsOutput(weapon, mode);
  if (!output || typeof output.dps !== "number") {
    return `<span class="crossclan__val--dim">n/a</span><span class="ranged-table__sub">special/unknown damage</span>`;
  }
  const detail = output.formulaType === "cycle"
    ? `${output.shots} shots + ${formatRangedNumber(output.totalCycleTime)}s cycle`
    : `${formatRangedNumber(output.damageEvents)} damage event${output.damageEvents === 1 ? "" : "s"}/cadence`;
  const valueClass = output.ammoLimited ? " ranged-table__value--ammo-limited" : "";
  const note = output.ammoLimited
    ? `ammo-limited: ${formatRangedNumber(output.totalDamage)} dmg in ${formatRangedNumber(output.totalTime)}s; true ${formatRangedNumber(output.theoreticalDps)}`
    : `over ${formatRangedNumber(output.totalTime)}s (${detail})`;
  return `<span class="ranged-table__value ranged-table__value--dps${valueClass}">${formatRangedNumber(output.dps)}</span><span class="ranged-table__sub">${note}</span>`;
}

function renderRangedTotalDamageCell(weapon, mode) {
  const output = getRangedDpsOutput(weapon, mode);
  if (!output || typeof output.totalDamage !== "number") {
    return `<span class="crossclan__val--dim">n/a</span><span class="ranged-table__sub">special/unknown damage</span>`;
  }
  const note = output.formulaType === "cycle"
    ? `${output.shots} shots before empty`
    : `${output.capShots} shots before empty`;
  return `<span class="ranged-table__value">${formatRangedNumber(output.totalDamage)}</span><span class="ranged-table__sub">${note}</span>`;
}

function renderRangedWeaponCard(weapon) {
  const notes = weapon.notes && weapon.notes.length
    ? `<ul class="ranged-weapon-card__notes">${weapon.notes.map(note => `<li>${note}</li>`).join("")}</ul>`
    : "";
  const cycleNotes = weapon.cycle && weapon.cycle.notes && weapon.cycle.notes.length
    ? `<ul class="ranged-weapon-card__notes ranged-weapon-card__notes--cycle">${weapon.cycle.notes.map(note => `<li>${note}</li>`).join("")}</ul>`
    : "";

  let html = `<article class="ranged-weapon-card" id="rw-${weapon.id}">`;
  html += `<header class="ranged-weapon-card__header">`;
  html += `<img src="${weapon.icon}" alt="" class="ranged-weapon-card__icon">`;
  html += `<div class="ranged-weapon-card__heading">`;
  html += `<h3 class="ranged-weapon-card__name">${weapon.name}</h3>`;
  html += `<span class="ranged-weapon-card__meta">${weapon.family} &middot; <code class="crossclan-code">${weapon.registryName}</code></span>`;
  html += `</div>`;
  html += `<span class="ranged-weapon-card__instance"><code class="crossclan-code ranged-code">${weapon.instanceClass}</code></span>`;
  html += `</header>`;
  html += `<div class="ranged-weapon-card__body">`;
  html += `<div class="ranged-weapon-card__main">`;
  html += renderRangedSharedStats(weapon);
  html += renderRangedCadenceBlock(weapon);
  html += `</div>`;
  html += `<aside class="ranged-weapon-card__side">`;
  html += renderRangedEnemyBlock(weapon);
  html += `</aside>`;
  html += `</div>`;
  html += `${notes}${cycleNotes}`;
  html += `</article>`;
  return html;
}

function renderRangedWeaponsPage() {
  const container = document.getElementById("combos-subpage-ranged");
  if (!container) return;
  const activeMode = RANGED_WEAPON_TABLE_MODE === "dual" ? "dual" : "single";
  const activeModeLabel = activeMode === "dual" ? "Dual" : "Single";
  const dpsHeading = activeMode === "dual" ? "Corrected Dual DPS" : "Single DPS";

  let h = `<div class="combos-layout">`;

  h += `<div class="clan-combos-header">`;
  h += `<h2 class="combos-header__title">Ranged Weapon Data</h2>`;
  h += `<p class="combos-header__sub">Gun, shotgun, sniper and crossbow tuning from <code>Ranged_Weapons_23416145.md</code> (Summer Update build 23416145).</p>`;
  h += `<div class="combos-legend combos-legend--melee combos-legend--ranged">`;
  for (const w of RANGED_WEAPONS) {
    h += `<a class="combos-legend__item" href="#rw-${w.id}"><img src="${w.icon}" alt="" class="combos-legend__icon">${w.name}</a>`;
  }
  h += `</div>`;
  h += `<ul class="combos-header__primer">
    <li><strong class="combos-header__primer-label combos-header__primer-label--light">Carry:</strong> guns can be used one-handed or dual-wielded.</li>
    <li><strong class="combos-header__primer-label combos-header__primer-label--light">Scopes:</strong> sniper rifles scope by holding right click, but lose scope access when dual-wielded.</li>
    <li><strong class="combos-header__primer-label combos-header__primer-label--heavy">Ammo:</strong> <code>AmmoBeforeReload</code> is loaded ammo before reload/cycle, not pickup total.</li>
    <li><strong class="combos-header__primer-label">Single/Dual:</strong> DPS uses player attackset <code>FireRate</code>, attackset damage, pellets, dual montage read, ammo limit, and cycle timing.</li>
    <li><strong class="combos-header__primer-label">Dual reads:</strong> shared <code>AM_Player_Dual_Fire</code> rifle/SMG entries count as two damage events per cadence; R/L entries usually count as one.</li>
    <li><strong class="combos-header__primer-label">Cycle:</strong> dual shotgun/sniper-style cycle montages cycle both hands in one action, so dual cycle DPS pays one cycle per two-hand pair.</li>
  </ul>`;
  h += `</div>`;

  h += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad">`;
  h += `<div class="crossclan-section-heading">`;
  h += `<span>Ranged Tuning Table</span>`;
  h += `<span class="crossclan-section-heading__sub">Attackset damage, loaded ammo and ${activeModeLabel.toLowerCase()} cadence output</span>`;
  h += `</div>`;
  h += `<div class="ranged-weapons-mode" role="group" aria-label="Ranged weapon firing mode">`;
  h += `<button type="button" class="ranged-weapons-mode__btn ${activeMode === "single" ? "is-active" : ""}" data-ranged-mode="single" aria-pressed="${activeMode === "single"}">Single</button>`;
  h += `<button type="button" class="ranged-weapons-mode__btn ${activeMode === "dual" ? "is-active" : ""}" data-ranged-mode="dual" aria-pressed="${activeMode === "dual"}">Dual</button>`;
  h += `</div>`;
  h += `<div class="ranged-weapons-table-wrap">`;
  h += `<table class="combos-table ranged-weapons-table"><thead><tr>
    <th class="combos-table__th ranged-weapons-table__th--weapon">Weapon</th>
    <th class="combos-table__th">Attackset Damage</th>
    <th class="combos-table__th">Ammo</th>
    <th class="combos-table__th">Cycle</th>
    <th class="combos-table__th">${activeModeLabel}</th>
    ${activeMode === "dual" ? `<th class="combos-table__th">Dual Read</th>` : ""}
    <th class="combos-table__th">Total Damage</th>
    <th class="combos-table__th">${dpsHeading}</th>
  </tr></thead><tbody>`;
  for (const w of RANGED_WEAPONS) {
    h += `<tr class="ranged-weapons-table__row" id="rw-${w.id}">`;
    h += `<td class="combos-table__td ranged-weapons-table__weapon"><img src="${w.icon}" alt="" class="ranged-weapons-table__icon"><span><span class="ranged-weapons-table__name">${w.name}</span><span class="ranged-table__sub">${w.family} &middot; <code class="crossclan-code">${w.registryName}</code></span></span></td>`;
    h += `<td class="combos-table__td ranged-weapons-table__metric">${renderRangedDamageCell(w)}</td>`;
    h += `<td class="combos-table__td ranged-weapons-table__metric">${renderRangedCapCell(w)}</td>`;
    h += `<td class="combos-table__td ranged-weapons-table__metric">${renderRangedCycleTableCell(w)}</td>`;
    h += `<td class="combos-table__td ranged-weapons-table__metric">${renderRangedFireRateCell(w, activeMode)}</td>`;
    if (activeMode === "dual") {
      h += `<td class="combos-table__td ranged-weapons-table__metric">${renderRangedDualReadCell(w)}</td>`;
    }
    h += `<td class="combos-table__td ranged-weapons-table__metric">${renderRangedTotalDamageCell(w, activeMode)}</td>`;
    h += `<td class="combos-table__td ranged-weapons-table__metric">${renderRangedDpsCell(w, activeMode)}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `</div>`;
  h += `<ul class="crossclan-list crossclan-list--notes ranged-weapons-footnotes">
    <li>Throw damage is intentionally omitted here; this tab is focused on ranged firing data.</li>
    <li>Attackset damage/pellet values can differ from weapon-instance projectile values; corrected DPS uses player attackset damage fields from the consolidated source.</li>
    <li><strong>Ammo</strong> shows loaded ammo before reload/cycle. Sniper and shotgun show <code>1 loaded + 1 mag</code> because they have a one-round mag/cycle value.</li>
    <li>Non-cycle DPS is damage per firing cadence divided by <code>FireRate</code>, ammo-limited by the selected mode's pre-reload damage if the weapon empties before one second.</li>
    <li>Cycle DPS uses <code>2 shots / (2 * FireRate + CycleTime)</code>; dual cycle DPS uses <code>4 shots / (4 * FireRate + CycleTime)</code>.</li>
    <li>Underlined DPS values are ammo-limited; the subline shows the theoretical cadence DPS that the weapon cannot sustain before emptying.</li>
    <li>Dual ammo doubles the listed ammo unless the weapon uses pistol/revolver-style alternate fire behavior.</li>
    <li>IAO Shotgun has no exported player <code>RangedCycle</code>, so it is treated as straight fire despite its loaded ammo of 2.</li>
    <li>Mega Shotty dual uses inherited <code>FireRate = 0.2</code> with no cycle timing, producing 240 DPS from its 48 damage shot.</li>
    <li><strong>Crossbow explosive:</strong> the bolt's direct hit is only <code>0.1</code>; <code>WrestlerProjectile_ExplodingBolt_C</code> spawns <code>BP_Throwable_Bolt_C</code>, which spawns <code>BP_Explosion_TickDelay_C</code>. The listed <code>80</code> damage is the spawned explosion payload, and the throwable bolt has a <code>3.3s</code> Beepline blinking light timeline before/around detonation.</li>
  </ul>`;
  h += `</div>`;
  h += `</div>`;

  container.innerHTML = h;
  attachRangedWeaponsModeListeners(container);
}

function attachRangedWeaponsModeListeners(container) {
  container.querySelectorAll("[data-ranged-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.rangedMode === "dual" ? "dual" : "single";
      if (RANGED_WEAPON_TABLE_MODE === mode) return;
      RANGED_WEAPON_TABLE_MODE = mode;
      renderRangedWeaponsPage();
    });
  });
}


// ═══════════════════════════════════════════════════════════════════════════
// Combat Graph — aggregate damage-over-time visualisation for clan combos,
// melee weapons, and ranged weapons. Reuses the same rotation evaluators as the
// Clan / Melee / Ranged tabs so the curves match those tables exactly.
// ═══════════════════════════════════════════════════════════════════════════

const LOOP_GRAPH_CYCLES = 3;
const RANGED_GRAPH_DURATION_SECONDS = 5;

const CLAN_GRAPH_COLORS = {
  brujah:    "#c44121",
  tremere:   "#9d6dd6",
  banuHaqim: "#4a78b5",
  ventrue:   "#d8b352",
  lasombra:  "#7e7ea8",
  toreador:  "#3fb6a4",
  ysabella:  "#ec748e",
};

const CLAN_GRAPH_ORDER = ["brujah", "tremere", "banuHaqim", "ventrue", "lasombra", "toreador", "ysabella"];

const RANGED_GRAPH_COLORS = [
  "#d86b72",
  "#d99f54",
  "#d6c65e",
  "#74bd75",
  "#55b7a8",
  "#54a9d6",
  "#7f92df",
  "#a879d6",
  "#d174b7",
  "#bb8e62",
  "#8eb0ef",
  "#b5bd64",
  "#e0c96e",
];

function buildYsabellaGraphData() {
  if (typeof YSABELLA_RAPIER_COMBO === "undefined") return null;
  const rapier = YSABELLA_RAPIER_COMBO;
  return {
    name: "Ysabella",
    icon: typeof YSABELLA_LOGO !== "undefined" ? YSABELLA_LOGO : (typeof UI !== "undefined" ? UI.ysabellaLogo : null),
    steps: rapier.steps,
    lightType: rapier.lightType,
    rows: rapier.rows.map(row => ({
      step: row.step,
      lightDmg: row.lightDmg,
      lightMontage: row.lightMontage,
      lightLen: row.lightLen,
      heavyDmg: rapier.heavy.observedTotalDamage || rapier.heavy.chargedDamage,
      heavyMontage: rapier.heavy.followUpMontage ? `${rapier.heavy.montage} + ${rapier.heavy.followUpMontage}` : rapier.heavy.montage,
      heavyLen: rapier.heavy.followUpSequenceLength ? rapier.heavy.sequenceLength + rapier.heavy.followUpSequenceLength : rapier.heavy.sequenceLength,
      minWindup: rapier.windup.minimumWindup,
      maxWindup: rapier.windup.maximumWindup,
      heavyThresh: rapier.windup.heavyThreshold,
      comboDelay: row.comboDelay,
      lightComboDelay: row.comboDelay,
      heavyComboDelay: rapier.heavy.comboDelay,
      finisher: !!row.finisher,
    })),
  };
}

function getGraphClanData(clanId) {
  if (CLAN_COMBOS[clanId]) return CLAN_COMBOS[clanId];
  if (clanId === "ysabella") return buildYsabellaGraphData();
  return null;
}

function getGraphClanIcon(clanId, data) {
  if (data && data.icon) return data.icon;
  return CLANS[clanId] && CLANS[clanId].logo ? CLANS[clanId].logo : null;
}

function getClanLightStepTime(row) {
  const minWindup = typeof row.minWindup === "number" ? row.minWindup : 0.2;
  const comboDelay = typeof row.lightComboDelay === "number" ? row.lightComboDelay : row.comboDelay;
  return minWindup + comboDelay;
}

function getClanHeavyStepTime(row) {
  const maxWindup = typeof row.maxWindup === "number" ? row.maxWindup : 1.0;
  const heavyThresh = typeof row.heavyThresh === "number" ? row.heavyThresh : 0.7;
  const comboDelay = typeof row.heavyComboDelay === "number" ? row.heavyComboDelay : row.comboDelay;
  return (heavyThresh * maxWindup) + comboDelay;
}

function buildClanGraphPattern(rows, mode) {
  if (mode === "H") return rows.map(() => "H");
  if (mode === "O") return findOptimalPattern(rows).pattern;
  return rows.map(() => "L");
}

function getClanGraphModeLabel(mode) {
  if (mode === "H") return "Heavy";
  if (mode === "O") return "Optimal";
  return "Light";
}

function weaponHasMode(weapon, mode) {
  if (mode === "L") return true;
  if (mode === "F") return weapon.rows.some(r => r.fwdMontage && r.fwdLen >= 0 && r.fwdDmg > 0);
  if (mode === "S") return weapon.rows.some(r => r.shoveMontage && r.shoveLen > 0);
  return false;
}

// Flatten MELEE_WEAPONS + nested variants into a single ordered list so the
// graph filters can show variants (e.g. Electric Baton Empty) as their own row.
function getGraphableWeapons() {
  const out = [];
  for (const w of MELEE_WEAPONS) {
    out.push({ id: w.id, name: w.name, rows: w.rows, parentId: null });
    if (Array.isArray(w.variants)) {
      for (const v of w.variants) {
        out.push({ id: v.id, name: v.name, rows: v.rows, parentId: w.id });
      }
    }
  }
  return out;
}

function getWeaponGraphColor(idx) {
  // Deterministic spread around the wheel, skipping clan-ish hues for clarity.
  const hue = (idx * 47 + 18) % 360;
  return `hsl(${hue}, 62%, 58%)`;
}

function getRangedGraphColor(idx) {
  return RANGED_GRAPH_COLORS[idx % RANGED_GRAPH_COLORS.length];
}

function getRangedGraphModeLabel(mode) {
  return mode === "dual" ? "Dual" : "Single";
}

// ── Series construction ──────────────────────────────────────
function buildClanSeries(clanId, mode, loop = false) {
  const data = getGraphClanData(clanId);
  if (!data) return null;
  const rows = data.rows;
  const cycles = loop ? LOOP_GRAPH_CYCLES : 1;
  const cyclePattern = buildClanGraphPattern(rows, mode);
  const modeLabel = getClanGraphModeLabel(mode);

  const points = [{ t: 0, dmg: 0, label: "start" }];
  let t = 0, dmg = 0;
  for (let c = 0; c < cycles; c++) {
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const type = cyclePattern[i];
      let stepDmg, stepTime, stepLabel;
      if (type === "H") {
        stepDmg = row.heavyDmg;
        stepTime = getClanHeavyStepTime(row);
        stepLabel = `Step ${row.step} Heavy (${row.heavyDmg})`;
      } else {
        stepDmg = row.lightDmg;
        stepTime = getClanLightStepTime(row);
        stepLabel = `Step ${row.step} Light (${row.lightDmg})`;
      }
      t += stepTime;
      dmg += stepDmg;
      points.push({ t, dmg, label: cycles > 1 ? `Cycle ${c + 1} ${stepLabel}` : stepLabel });
    }
  }
  return {
    id: `clan:${clanId}:${mode}:${cycles > 1 ? "loop" : "single"}`,
    kind: "clan",
    sourceId: clanId,
    label: `${data.name} - ${modeLabel}${cycles > 1 ? ` Loop x${cycles}` : " Chain"}`,
    icon: getGraphClanIcon(clanId, data),
    color: CLAN_GRAPH_COLORS[clanId] || "#aaaaaa",
    pattern: cyclePattern.join(""),
    points,
    totals: {
      damage: dmg,
      time: t,
      dps: t > 0 ? dmg / t : 0,
    },
  };
}

function buildWeaponSeries(weapon, mode, color, loop = false) {
  if (!weaponHasMode(weapon, mode)) return null;
  const rows = weapon.rows;
  const cycles = (loop && (mode === "L" || mode === "F")) ? LOOP_GRAPH_CYCLES : 1;
  const points = [{ t: 0, dmg: 0, label: "start" }];
  let t = 0, dmg = 0;
  const modeName = mode === "L" ? "Light" : mode === "F" ? "Forward" : "Shove";
  for (let c = 0; c < cycles; c++) {
    for (const row of rows) {
      let stepDmg, stepTime;
      if (mode === "L") {
        stepDmg = row.lightDmg;
        stepTime = getWeaponStepTiming(row, "L").time;
      } else if (mode === "F") {
        if (!row.fwdMontage) {
          stepDmg = row.lightDmg;
          stepTime = getWeaponStepTiming(row, "L").time;
        } else {
          stepDmg = row.fwdDmg;
          stepTime = getWeaponStepTiming(row, "F").time;
        }
      } else {
        stepDmg = row.shoveDmg;
        stepTime = getWeaponStepTiming(row, "S").time;
      }
      t += stepTime;
      dmg += stepDmg;
      const stepLabel = cycles > 1 ? `Cycle ${c + 1} Step ${row.step} ${modeName} (${stepDmg})` : `Step ${row.step} ${modeName} (${stepDmg})`;
      points.push({ t, dmg, label: stepLabel });
    }
  }
  return {
    id: `weapon:${weapon.id}:${mode}:${cycles > 1 ? "loop" : "single"}`,
    kind: "weapon",
    sourceId: weapon.id,
    label: `${weapon.name} — ${modeName}${cycles > 1 ? ` Loop ×${cycles}` : ""}`,
    color,
    pattern: mode,
    points,
    totals: {
      damage: dmg,
      time: t,
      dps: t > 0 ? dmg / t : 0,
    },
  };
}

function getRangedGraphConfig(weapon, mode) {
  const data = RANGED_DUAL_FIRE_DATA[weapon.id];
  if (!data) return null;
  const fireRate = mode === "dual" ? data.dualFireRate : data.singleFireRate;
  const damagePerShot = getRangedAttacksetShotDamage(weapon, mode);
  const ammoShots = getRangedAmmoCapShots(weapon, mode);
  if (typeof fireRate !== "number" || fireRate <= 0) return null;
  if (typeof damagePerShot !== "number" || damagePerShot <= 0) return null;
  if (typeof ammoShots !== "number" || ammoShots <= 0) return null;
  const read = getRangedDualRead(weapon);
  const damageEvents = mode === "dual" && typeof read.damageEventsPerCadence === "number"
    ? read.damageEventsPerCadence
    : 1;
  return {
    fireRate,
    damagePerShot,
    ammoShots,
    damageEvents: Math.max(1, damageEvents),
    cycleTime: getRangedCycleTime(weapon, mode),
  };
}

function pushGraphPoint(points, t, dmg, label) {
  const last = points[points.length - 1];
  if (last && Math.abs(last.t - t) < 0.0001 && Math.abs(last.dmg - dmg) < 0.0001) return;
  points.push({ t, dmg, label });
}

function buildRangedSeries(weapon, mode, color, infiniteAmmo = false) {
  const config = getRangedGraphConfig(weapon, mode);
  if (!config) return null;

  const points = [{ t: 0, dmg: 0, label: "start" }];
  const modeLabel = getRangedGraphModeLabel(mode);
  const targetDuration = infiniteAmmo ? RANGED_GRAPH_DURATION_SECONDS : Number.POSITIVE_INFINITY;
  const maxShots = infiniteAmmo ? Number.POSITIVE_INFINITY : config.ammoShots;
  let t = 0;
  let dmg = 0;
  let shotsUsed = 0;
  let cadenceIndex = 0;

  if (weapon.cycle && config.cycleTime > 0) {
    const shotsPerCycle = Math.max(1, config.ammoShots);
    let cycleIndex = 1;
    while (shotsUsed < maxShots && t < targetDuration - 0.0001) {
      let shotsThisCycle = 0;
      while (shotsThisCycle < shotsPerCycle && shotsUsed < maxShots) {
        const nextT = t + config.fireRate;
        if (nextT > targetDuration + 0.0001) break;
        t = nextT;
        shotsThisCycle += 1;
        shotsUsed += 1;
        dmg += config.damagePerShot;
        pushGraphPoint(points, t, dmg, `${modeLabel} shot ${Number.isFinite(shotsUsed) ? shotsUsed : shotsThisCycle} (${formatRangedNumber(config.damagePerShot)})`);
      }
      if (shotsThisCycle === 0 || t >= targetDuration - 0.0001) break;
      const cycleEnd = t + config.cycleTime;
      const nextT = infiniteAmmo ? Math.min(cycleEnd, targetDuration) : cycleEnd;
      t = nextT;
      pushGraphPoint(points, t, dmg, `${modeLabel} cycle ${cycleIndex}`);
      cycleIndex += 1;
    }
  } else {
    while (shotsUsed < maxShots && t < targetDuration - 0.0001) {
      const nextT = t + config.fireRate;
      if (nextT > targetDuration + 0.0001) break;
      const shotsThisCadence = infiniteAmmo
        ? config.damageEvents
        : Math.min(config.damageEvents, maxShots - shotsUsed);
      if (shotsThisCadence <= 0) break;
      t = nextT;
      cadenceIndex += 1;
      shotsUsed += shotsThisCadence;
      const cadenceDamage = config.damagePerShot * shotsThisCadence;
      dmg += cadenceDamage;
      const eventText = shotsThisCadence === 1 ? "shot" : `${shotsThisCadence} shots`;
      pushGraphPoint(points, t, dmg, `${modeLabel} cadence ${cadenceIndex}: ${eventText} (${formatRangedNumber(cadenceDamage)})`);
    }
  }

  if (infiniteAmmo) {
    if (t < RANGED_GRAPH_DURATION_SECONDS - 0.0001) {
      pushGraphPoint(points, RANGED_GRAPH_DURATION_SECONDS, dmg, "5s marker");
      t = RANGED_GRAPH_DURATION_SECONDS;
    }
  } else if (t > 0 && t < 1 - 0.0001) {
    pushGraphPoint(points, 1, dmg, "empty before 1s");
    t = 1;
  }

  if (points.length <= 1 || t <= 0) return null;
  return {
    id: `ranged:${weapon.id}:${mode}:${infiniteAmmo ? "infinite" : "ammo"}`,
    kind: "ranged",
    sourceId: weapon.id,
    label: `${weapon.name} - ${modeLabel}${infiniteAmmo ? " 5s" : " Ammo"}`,
    icon: weapon.icon,
    color,
    pattern: mode,
    points,
    totals: {
      damage: dmg,
      time: t,
      dps: t > 0 ? dmg / t : 0,
    },
  };
}

function buildGraphSeries(state) {
  const series = [];
  // Clans
  for (const clanId of CLAN_GRAPH_ORDER) {
    const sel = state.clans[clanId];
    if (!sel || !sel.enabled) continue;
    const s = buildClanSeries(clanId, sel.mode, !!sel.loop);
    if (s) series.push(s);
  }
  // Weapons
  const weapons = getGraphableWeapons();
  weapons.forEach((w, idx) => {
    const sel = state.weapons[w.id];
    if (!sel || !sel.enabled) return;
    const color = getWeaponGraphColor(idx);
    const s = buildWeaponSeries(w, sel.mode, color, !!sel.loop);
    if (s) series.push(s);
  });
  // Ranged weapons
  RANGED_WEAPONS.forEach((w, idx) => {
    const sel = state.ranged[w.id];
    if (!sel || !sel.enabled) return;
    const color = getRangedGraphColor(idx);
    const mode = sel.mode === "dual" ? "dual" : "single";
    const s = buildRangedSeries(w, mode, color, !!sel.loop);
    if (s) series.push(s);
  });
  return series;
}

// ── Graph state ─────────────────────────────────────────────
const GRAPH_STATE = {
  displayMode: "cumulative",
  sections: {
    clans: true,
    melee: true,
    ranged: true,
  },
  clans: {},
  weapons: {},
  ranged: {},
};

function initGraphState() {
  if (!GRAPH_STATE.sections) GRAPH_STATE.sections = { clans: true, melee: true, ranged: true };
  for (const key of ["clans", "melee", "ranged"]) {
    if (typeof GRAPH_STATE.sections[key] !== "boolean") GRAPH_STATE.sections[key] = true;
  }
  for (const clanId of CLAN_GRAPH_ORDER) {
    const existing = GRAPH_STATE.clans[clanId];
    const oldLoopMode = existing && existing.mode === "loop";
    const oldSingleMode = existing && existing.mode === "single";
    if (!GRAPH_STATE.clans[clanId]) {
      GRAPH_STATE.clans[clanId] = { enabled: false, mode: "L", loop: false };
    } else if (oldLoopMode || oldSingleMode) {
      GRAPH_STATE.clans[clanId].mode = "O";
      GRAPH_STATE.clans[clanId].loop = oldLoopMode;
    } else {
      if (!["L", "H", "O"].includes(GRAPH_STATE.clans[clanId].mode)) GRAPH_STATE.clans[clanId].mode = "L";
      if (typeof GRAPH_STATE.clans[clanId].loop !== "boolean") GRAPH_STATE.clans[clanId].loop = false;
    }
  }
  for (const w of getGraphableWeapons()) {
    if (!GRAPH_STATE.weapons[w.id]) {
      GRAPH_STATE.weapons[w.id] = { enabled: false, mode: "L", loop: false };
    } else if (typeof GRAPH_STATE.weapons[w.id].loop !== "boolean") {
      GRAPH_STATE.weapons[w.id].loop = false;
    }
  }
  for (const w of RANGED_WEAPONS) {
    if (!GRAPH_STATE.ranged[w.id]) {
      GRAPH_STATE.ranged[w.id] = { enabled: false, mode: "single", loop: false };
    } else {
      if (!["single", "dual"].includes(GRAPH_STATE.ranged[w.id].mode)) GRAPH_STATE.ranged[w.id].mode = "single";
      if (typeof GRAPH_STATE.ranged[w.id].loop !== "boolean") GRAPH_STATE.ranged[w.id].loop = false;
      if (typeof GRAPH_STATE.ranged[w.id].enabled !== "boolean") GRAPH_STATE.ranged[w.id].enabled = false;
    }
  }
  // Sensible default selection on first open: a quick comparison.
  const anyEnabled =
    Object.values(GRAPH_STATE.clans).some(c => c.enabled) ||
    Object.values(GRAPH_STATE.weapons).some(w => w.enabled) ||
    Object.values(GRAPH_STATE.ranged).some(w => w.enabled);
  if (!anyEnabled) {
    if (GRAPH_STATE.clans.brujah) { GRAPH_STATE.clans.brujah.enabled = true; GRAPH_STATE.clans.brujah.mode = "L"; GRAPH_STATE.clans.brujah.loop = false; }
    if (GRAPH_STATE.weapons.bat) { GRAPH_STATE.weapons.bat.enabled = true; }
    if (GRAPH_STATE.weapons.knife) { GRAPH_STATE.weapons.knife.enabled = true; }
  }
}

// ── SVG renderer ─────────────────────────────────────────────
function getSeriesMetricPoints(series, displayMode) {
  if (displayMode === "dps") {
    const values = [];
    let firstDps = 0;
    for (let i = 1; i < series.points.length; i++) {
      const prev = series.points[i - 1];
      const curr = series.points[i];
      const dt = curr.t - prev.t;
      const dd = curr.dmg - prev.dmg;
      const dps = dt > 0 ? (dd / dt) : 0;
      if (i === 1) firstDps = dps;
      values.push({ t: curr.t, val: dps, label: curr.label });
    }
    if (values.length > 0) {
      values.unshift({ t: 0, val: firstDps, label: "start" });
    }
    return values;
  }
  return series.points.map((p) => ({ t: p.t, val: p.dmg, label: p.label }));
}

function renderGraphSvg(series, displayMode) {
  const W = 700, H = 575;
  const M = { top: 18, right: 18, bottom: 38, left: 52 };
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;

  if (series.length === 0) {
    return `<div class="combat-graph__empty">Enable a clan profile, melee weapon, or ranged weapon on the left to start the comparison.</div>`;
  }

  const renderSeries = series.map((s) => ({
    series: s,
    points: getSeriesMetricPoints(s, displayMode),
  }));

  const xMax = Math.max(0.5, ...renderSeries.map((s) => s.points[s.points.length - 1].t));
  const yMax = Math.max(1, ...renderSeries.map((s) => Math.max(...s.points.map((p) => p.val))));
  const xUpper = Math.ceil(xMax / 0.5) * 0.5;
  // Round Y up to a clean step size.
  const yStepRaw = yMax / 5;
  const niceSteps = [5, 10, 20, 25, 50, 100, 200];
  const yStep = niceSteps.find(s => s >= yStepRaw) || Math.ceil(yStepRaw / 50) * 50;
  const yUpper = Math.ceil(yMax / yStep) * yStep;

  const xScale = (t) => M.left + (t / xUpper) * plotW;
  const yScale = (d) => M.top + plotH - (d / yUpper) * plotH;

  let g = `<svg class="combat-graph__svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Damage over time comparison">`;

  // Gridlines + Y axis ticks
  g += `<g class="combat-graph__grid">`;
  for (let dy = 0; dy <= yUpper + 0.0001; dy += yStep) {
    const y = yScale(dy);
    g += `<line x1="${M.left}" y1="${y}" x2="${M.left + plotW}" y2="${y}" />`;
    g += `<text class="combat-graph__axis-label combat-graph__axis-label--y" x="${M.left - 8}" y="${y + 4}" text-anchor="end">${dy}</text>`;
  }
  // X axis ticks every 0.5s, label every 1s when xUpper <= 6, else every step
  const xTickStep = xUpper <= 4 ? 0.5 : (xUpper <= 10 ? 1 : 2);
  for (let dx = 0; dx <= xUpper + 0.0001; dx += xTickStep) {
    const x = xScale(dx);
    g += `<line x1="${x}" y1="${M.top}" x2="${x}" y2="${M.top + plotH}" class="combat-graph__grid-x" />`;
    g += `<text class="combat-graph__axis-label combat-graph__axis-label--x" x="${x}" y="${M.top + plotH + 18}" text-anchor="middle">${dx.toFixed(dx % 1 === 0 ? 0 : 1)}s</text>`;
  }
  g += `</g>`;

  // Axis labels
  g += `<text class="combat-graph__axis-title" x="${M.left + plotW / 2}" y="${H - 6}" text-anchor="middle">Time (seconds)</text>`;
  g += `<text class="combat-graph__axis-title" transform="translate(14 ${M.top + plotH / 2}) rotate(-90)" text-anchor="middle">${displayMode === "dps" ? "DPS (damage/sec)" : "Cumulative damage"}</text>`;

  // Series paths (stepped cumulative or smooth DPS lines)
  for (const item of renderSeries) {
    const s = item.series;
    const pts = item.points;
    let d = "";
    pts.forEach((p, i) => {
      const x = xScale(p.t);
      const y = yScale(p.val);
      if (i === 0) {
        d += `M ${x.toFixed(2)} ${y.toFixed(2)}`;
      } else if (displayMode === "dps") {
        d += ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
      } else {
        const prev = pts[i - 1];
        const py = yScale(prev.val);
        // Step shape: horizontal at previous Y to new X, then vertical to new Y.
        d += ` L ${x.toFixed(2)} ${py.toFixed(2)} L ${x.toFixed(2)} ${y.toFixed(2)}`;
      }
    });
    g += `<path class="combat-graph__series-path" data-series-id="${s.id}" d="${d}" stroke="${s.color}" />`;
  }

  // Series points (on top)
  for (const item of renderSeries) {
    const s = item.series;
    const pts = item.points;
    pts.forEach((p, i) => {
      if (i === 0) return;
      const x = xScale(p.t);
      const y = yScale(p.val);
      const title = displayMode === "dps"
        ? `${s.label} — ${p.label} · t=${p.t.toFixed(2)}s · ${p.val.toFixed(2)} DPS`
        : `${s.label} — ${p.label} · t=${p.t.toFixed(2)}s · cum=${p.val}`;
      g += `<circle class="combat-graph__series-point" data-series-id="${s.id}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="4" fill="${s.color}"><title>${title}</title></circle>`;
    });
  }

  g += `</svg>`;
  return g;
}

function renderGraphLegend(series) {
  if (series.length === 0) return "";
  let h = `<div class="combat-graph__legend">`;
  for (const s of series) {
    h += `<button type="button" class="combat-graph__legend-item" data-series-id="${s.id}" title="Click to remove from graph">`;
    h += `<span class="combat-graph__legend-swatch" style="background:${s.color};"></span>`;
    if (s.icon) {
      h += `<img class="combat-graph__legend-icon" src="${s.icon}" alt="${s.label} icon">`;
    }
    h += `<span class="combat-graph__legend-label">${s.label}</span>`;
    h += `<span class="combat-graph__legend-stats">`;
    h += `<span class="combat-graph__legend-stat" title="Total damage">${s.totals.damage} dmg</span>`;
    h += `<span class="combat-graph__legend-stat" title="Total time">${s.totals.time.toFixed(2)}s</span>`;
    h += `<span class="combat-graph__legend-stat combat-graph__legend-stat--dps" title="Damage per second">${s.totals.dps.toFixed(2)} DPS</span>`;
    h += `</span>`;
    h += `</button>`;
  }
  h += `</div>`;
  return h;
}

// ── Filter panel ─────────────────────────────────────────────
function getGraphSectionStates(key) {
  if (key === "clans") {
    return CLAN_GRAPH_ORDER.map(id => GRAPH_STATE.clans[id]).filter(Boolean);
  }
  if (key === "melee") {
    return getGraphableWeapons().map(w => GRAPH_STATE.weapons[w.id]).filter(Boolean);
  }
  if (key === "ranged") {
    return RANGED_WEAPONS.map(w => GRAPH_STATE.ranged[w.id]).filter(Boolean);
  }
  return [];
}

function getGraphSectionLoopStates(key) {
  if (key !== "melee") return getGraphSectionStates(key);
  return getGraphableWeapons()
    .map(w => GRAPH_STATE.weapons[w.id])
    .filter(state => state && state.mode !== "S");
}

function getGraphSectionCommonMode(key) {
  const states = getGraphSectionStates(key);
  if (!states.length) return "";
  const firstMode = states[0].mode;
  return states.every(state => state.mode === firstMode) ? firstMode : "";
}

function renderGraphSectionControls(key, modes, title) {
  const states = getGraphSectionStates(key);
  const loopStates = getGraphSectionLoopStates(key);
  const allEnabled = states.length > 0 && states.every(state => state.enabled);
  const someEnabled = states.some(state => state.enabled);
  const allLoop = loopStates.length > 0 && loopStates.every(state => state.loop);
  const someLoop = loopStates.some(state => state.loop);
  const commonMode = getGraphSectionCommonMode(key);
  let html = `<div class="combat-graph__section-tools" aria-label="${title} bulk controls">`;
  html += `<label class="combat-graph__section-check ${someEnabled && !allEnabled ? "is-mixed" : ""}" title="Toggle every ${title.toLowerCase()} item">`;
  html += `<input type="checkbox" data-graph-section-enable="${key}" ${allEnabled ? "checked" : ""}>All</label>`;
  html += `<div class="combat-graph__radio-group combat-graph__radio-group--section" role="radiogroup" aria-label="${title} bulk mode">`;
  modes.forEach(mode => {
    const active = commonMode === mode.value;
    html += `<label class="combat-graph__radio ${active ? "is-active" : ""}"><input type="radio" name="graph-section-mode-${key}" data-graph-section-mode="${key}" value="${mode.value}" ${active ? "checked" : ""}>${mode.label}</label>`;
  });
  html += `</div>`;
  html += `<label class="combat-graph__section-check ${someLoop && !allLoop ? "is-mixed" : ""}" title="Set loop for this section">`;
  html += `<input type="checkbox" data-graph-section-loop="${key}" ${allLoop ? "checked" : ""}>Loop</label>`;
  html += `</div>`;
  return html;
}

function setGraphSectionEnabled(key, enabled) {
  getGraphSectionStates(key).forEach(state => {
    state.enabled = enabled;
  });
}

function setGraphSectionMode(key, mode) {
  if (key === "clans") {
    for (const state of getGraphSectionStates("clans")) {
      state.mode = ["L", "H", "O"].includes(mode) ? mode : "L";
    }
  } else if (key === "melee") {
    for (const w of getGraphableWeapons()) {
      const state = GRAPH_STATE.weapons[w.id];
      if (!state) continue;
      state.mode = weaponHasMode(w, mode) ? mode : "L";
      if (state.mode === "S") state.loop = false;
    }
  } else if (key === "ranged") {
    for (const state of getGraphSectionStates("ranged")) {
      state.mode = mode === "dual" ? "dual" : "single";
    }
  }
}

function setGraphSectionLoop(key, loop) {
  if (key === "melee") {
    for (const state of getGraphSectionLoopStates("melee")) {
      state.loop = loop;
    }
    return;
  }
  getGraphSectionStates(key).forEach(state => {
    state.loop = loop;
  });
}

function renderGraphFilterSection(key, title, bodyHtml) {
  const expanded = GRAPH_STATE.sections[key] !== false;
  return `<section class="combat-graph__filter-section ${expanded ? "" : "is-collapsed"}" data-graph-section="${key}">
    <button type="button" class="combat-graph__filter-heading" data-graph-section-toggle="${key}" aria-expanded="${expanded}" aria-controls="combat-graph-section-${key}">
      <span class="combat-graph__filter-heading-text">${title}</span>
      <span class="combat-graph__filter-heading-icon" aria-hidden="true">${expanded ? "-" : "+"}</span>
    </button>
    <div class="combat-graph__filter-section-body" id="combat-graph-section-${key}" ${expanded ? "" : "hidden"}>${bodyHtml}</div>
  </section>`;
}

function renderGraphFilters() {
  let h = `<aside class="combat-graph__filters">`;

  // Bulk actions
  h += `<div class="combat-graph__filter-actions">`;
  h += `<button type="button" class="combat-graph__filter-action" data-graph-action="reset">Reset</button>`;
  h += `<div class="combat-graph__display-toggle" role="radiogroup" aria-label="Graph display mode">`;
  h += `<label class="combat-graph__radio ${GRAPH_STATE.displayMode === "cumulative" ? "is-active" : ""}"><input type="radio" name="graph-display-mode" value="cumulative" ${GRAPH_STATE.displayMode === "cumulative" ? "checked" : ""}>Ladder</label>`;
  h += `<label class="combat-graph__radio ${GRAPH_STATE.displayMode === "dps" ? "is-active" : ""}"><input type="radio" name="graph-display-mode" value="dps" ${GRAPH_STATE.displayMode === "dps" ? "checked" : ""}>DPS</label>`;
  h += `</div>`;
  h += `</div>`;

  // Clans section
  let clanBody = renderGraphSectionControls("clans", [
    { value: "L", label: "L" },
    { value: "H", label: "H" },
    { value: "O", label: "OPT" },
  ], "Clans");
  for (const clanId of CLAN_GRAPH_ORDER) {
    const data = getGraphClanData(clanId);
    if (!data) continue;
    const sel = GRAPH_STATE.clans[clanId];
    const color = CLAN_GRAPH_COLORS[clanId];
    clanBody += `<div class="combat-graph__filter-row" data-graph-clan="${clanId}">`;
    clanBody += `<label class="combat-graph__filter-toggle">`;
    clanBody += `<input type="checkbox" data-graph-clan-toggle="${clanId}" ${sel.enabled ? "checked" : ""}>`;
    clanBody += `<span class="combat-graph__filter-swatch" style="background:${color};"></span>`;
    clanBody += `<span class="combat-graph__filter-name">${data.name}</span>`;
    clanBody += `</label>`;
    clanBody += `<div class="combat-graph__clan-controls">`;
    clanBody += `<div class="combat-graph__radio-group" role="radiogroup" aria-label="${data.name} attack type">`;
    clanBody += `<label class="combat-graph__radio ${sel.mode === "L" ? "is-active" : ""}"><input type="radio" name="graph-clan-mode-${clanId}" value="L" ${sel.mode === "L" ? "checked" : ""}>L</label>`;
    clanBody += `<label class="combat-graph__radio ${sel.mode === "H" ? "is-active" : ""}"><input type="radio" name="graph-clan-mode-${clanId}" value="H" ${sel.mode === "H" ? "checked" : ""}>H</label>`;
    clanBody += `<label class="combat-graph__radio ${sel.mode === "O" ? "is-active" : ""}"><input type="radio" name="graph-clan-mode-${clanId}" value="O" ${sel.mode === "O" ? "checked" : ""}>OPT</label>`;
    clanBody += `</div>`;
    clanBody += `<label class="combat-graph__weapon-loop" title="Loop repeats the selected clan chain for a longer timeline">`;
    clanBody += `<input type="checkbox" data-graph-clan-loop="${clanId}" ${sel.loop ? "checked" : ""}>Loop</label>`;
    clanBody += `</div>`;
    clanBody += `</div>`;
  }
  h += renderGraphFilterSection("clans", "Clans", clanBody);

  // Weapons section
  let meleeBody = renderGraphSectionControls("melee", [
    { value: "L", label: "L" },
    { value: "F", label: "F" },
    { value: "S", label: "S" },
  ], "Melee");
  const weapons = getGraphableWeapons();
  weapons.forEach((w, idx) => {
    const sel = GRAPH_STATE.weapons[w.id];
    const color = getWeaponGraphColor(idx);
    const hasF = weaponHasMode(w, "F");
    const hasS = weaponHasMode(w, "S");
    const loopLocked = sel.mode === "S";
    const loopEnabled = !loopLocked && !!sel.loop;
    const variantClass = w.parentId ? " combat-graph__filter-row--variant" : "";
    meleeBody += `<div class="combat-graph__filter-row${variantClass}" data-graph-weapon="${w.id}">`;
    meleeBody += `<label class="combat-graph__filter-toggle">`;
    meleeBody += `<input type="checkbox" data-graph-weapon-toggle="${w.id}" ${sel.enabled ? "checked" : ""}>`;
    meleeBody += `<span class="combat-graph__filter-swatch" style="background:${color};"></span>`;
    meleeBody += `<span class="combat-graph__filter-name">${w.name}</span>`;
    meleeBody += `</label>`;
    meleeBody += `<div class="combat-graph__weapon-controls">`;
    meleeBody += `<div class="combat-graph__radio-group" role="radiogroup" aria-label="${w.name} attack type">`;
    meleeBody += `<label class="combat-graph__radio ${sel.mode === "L" ? "is-active" : ""}"><input type="radio" name="graph-weapon-mode-${w.id}" value="L" ${sel.mode === "L" ? "checked" : ""}>L</label>`;
    meleeBody += `<label class="combat-graph__radio ${sel.mode === "F" ? "is-active" : ""} ${hasF ? "" : "is-disabled"}"><input type="radio" name="graph-weapon-mode-${w.id}" value="F" ${sel.mode === "F" ? "checked" : ""} ${hasF ? "" : "disabled"}>F</label>`;
    meleeBody += `<label class="combat-graph__radio ${sel.mode === "S" ? "is-active" : ""} ${hasS ? "" : "is-disabled"}"><input type="radio" name="graph-weapon-mode-${w.id}" value="S" ${sel.mode === "S" ? "checked" : ""} ${hasS ? "" : "disabled"}>S</label>`;
    meleeBody += `</div>`;
    meleeBody += `<label class="combat-graph__weapon-loop ${loopLocked ? "is-disabled" : ""}" title="Pseudo-loop repeats Light/Forward for a longer timeline">`;
    meleeBody += `<input type="checkbox" data-graph-weapon-loop="${w.id}" ${loopEnabled ? "checked" : ""} ${loopLocked ? "disabled" : ""}>Loop</label>`;
    meleeBody += `</div>`;
    meleeBody += `</div>`;
  });
  h += renderGraphFilterSection("melee", "Melee", meleeBody);

  // Ranged section
  let rangedBody = renderGraphSectionControls("ranged", [
    { value: "single", label: "S" },
    { value: "dual", label: "D" },
  ], "Ranged");
  RANGED_WEAPONS.forEach((w, idx) => {
    const sel = GRAPH_STATE.ranged[w.id];
    const color = getRangedGraphColor(idx);
    const mode = sel.mode === "dual" ? "dual" : "single";
    rangedBody += `<div class="combat-graph__filter-row combat-graph__filter-row--ranged" data-graph-ranged="${w.id}">`;
    rangedBody += `<label class="combat-graph__filter-toggle">`;
    rangedBody += `<input type="checkbox" data-graph-ranged-toggle="${w.id}" ${sel.enabled ? "checked" : ""}>`;
    rangedBody += `<span class="combat-graph__filter-swatch" style="background:${color};"></span>`;
    rangedBody += `<span class="combat-graph__filter-name">${w.name}</span>`;
    rangedBody += `</label>`;
    rangedBody += `<div class="combat-graph__weapon-controls">`;
    rangedBody += `<div class="combat-graph__radio-group" role="radiogroup" aria-label="${w.name} firing mode">`;
    rangedBody += `<label class="combat-graph__radio ${mode === "single" ? "is-active" : ""}" title="Single"><input type="radio" name="graph-ranged-mode-${w.id}" value="single" ${mode === "single" ? "checked" : ""}>S</label>`;
    rangedBody += `<label class="combat-graph__radio ${mode === "dual" ? "is-active" : ""}" title="Dual"><input type="radio" name="graph-ranged-mode-${w.id}" value="dual" ${mode === "dual" ? "checked" : ""}>D</label>`;
    rangedBody += `</div>`;
    rangedBody += `<label class="combat-graph__weapon-loop" title="Treat ammo as infinite and graph five seconds of firing">`;
    rangedBody += `<input type="checkbox" data-graph-ranged-loop="${w.id}" ${sel.loop ? "checked" : ""}>Loop</label>`;
    rangedBody += `</div>`;
    rangedBody += `</div>`;
  });
  h += renderGraphFilterSection("ranged", "Ranged", rangedBody);

  h += `</aside>`;
  return h;
}

function rerenderGraphChart() {
  const root = document.getElementById("combos-subpage-graph");
  if (!root) return;
  const chartWrap = root.querySelector(".combat-graph__chart-inner");
  if (!chartWrap) return;
  const series = buildGraphSeries(GRAPH_STATE);
  chartWrap.innerHTML = renderGraphSvg(series, GRAPH_STATE.displayMode) + renderGraphLegend(series);
  attachGraphLegendListeners(root);
}

function attachGraphLegendListeners(root) {
  const highlightLegendItem = (seriesId, active) => {
    root.querySelectorAll(".combat-graph__legend-item").forEach(item => {
      item.classList.toggle("is-highlighted", active && item.dataset.seriesId === seriesId);
    });
  };

  root.querySelectorAll(".combat-graph__legend-item").forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      const id = btn.dataset.seriesId;
      root.querySelectorAll(".combat-graph__series-path, .combat-graph__series-point").forEach(el => {
        el.classList.toggle("is-dimmed", el.dataset.seriesId !== id);
      });
    });
    btn.addEventListener("mouseleave", () => {
      root.querySelectorAll(".combat-graph__series-path, .combat-graph__series-point").forEach(el => {
        el.classList.remove("is-dimmed");
      });
    });
    btn.addEventListener("click", () => {
      const id = btn.dataset.seriesId;
      // id is "clan:<clanId>:<mode>", "weapon:<weaponId>:<mode>", or "ranged:<weaponId>:<mode>"
      const parts = id.split(":");
      if (parts[0] === "clan" && GRAPH_STATE.clans[parts[1]]) {
        GRAPH_STATE.clans[parts[1]].enabled = false;
      } else if (parts[0] === "weapon" && GRAPH_STATE.weapons[parts[1]]) {
        GRAPH_STATE.weapons[parts[1]].enabled = false;
      } else if (parts[0] === "ranged" && GRAPH_STATE.ranged[parts[1]]) {
        GRAPH_STATE.ranged[parts[1]].enabled = false;
      }
      // Update the matching filter checkbox in place.
      const cb = root.querySelector(`[data-graph-clan-toggle="${parts[1]}"], [data-graph-weapon-toggle="${parts[1]}"], [data-graph-ranged-toggle="${parts[1]}"]`);
      if (cb) cb.checked = false;
      rerenderGraphChart();
    });
  });

  root.querySelectorAll(".combat-graph__series-path, .combat-graph__series-point").forEach(el => {
    el.addEventListener("mouseenter", () => {
      highlightLegendItem(el.dataset.seriesId, true);
    });
    el.addEventListener("mouseleave", () => {
      highlightLegendItem(el.dataset.seriesId, false);
    });
  });
}

function attachGraphFilterListeners(root) {
  root.querySelectorAll("[data-graph-section-toggle]").forEach(btn => {
    btn.addEventListener("click", () => {
      const key = btn.dataset.graphSectionToggle;
      if (!GRAPH_STATE.sections || !(key in GRAPH_STATE.sections)) return;
      GRAPH_STATE.sections[key] = GRAPH_STATE.sections[key] === false;
      renderCombatGraphPage();
    });
  });
  root.querySelectorAll("[data-graph-section-enable]").forEach(cb => {
    cb.addEventListener("change", () => {
      setGraphSectionEnabled(cb.dataset.graphSectionEnable, cb.checked);
      renderCombatGraphPage();
    });
  });
  root.querySelectorAll("[data-graph-section-mode]").forEach(r => {
    r.addEventListener("change", () => {
      if (!r.checked) return;
      setGraphSectionMode(r.dataset.graphSectionMode, r.value);
      renderCombatGraphPage();
    });
  });
  root.querySelectorAll("[data-graph-section-loop]").forEach(cb => {
    cb.addEventListener("change", () => {
      setGraphSectionLoop(cb.dataset.graphSectionLoop, cb.checked);
      renderCombatGraphPage();
    });
  });

  // Clan toggles
  root.querySelectorAll("[data-graph-clan-toggle]").forEach(cb => {
    cb.addEventListener("change", () => {
      const id = cb.dataset.graphClanToggle;
      if (GRAPH_STATE.clans[id]) GRAPH_STATE.clans[id].enabled = cb.checked;
      rerenderGraphChart();
    });
  });
  // Clan mode radios
  root.querySelectorAll('input[type="radio"][name^="graph-clan-mode-"]').forEach(r => {
    r.addEventListener("change", () => {
      const id = r.name.replace("graph-clan-mode-", "");
      if (GRAPH_STATE.clans[id] && r.checked) {
        GRAPH_STATE.clans[id].mode = r.value;
        // Refresh active class on the labels of this group
        const group = r.closest(".combat-graph__radio-group");
        if (group) group.querySelectorAll(".combat-graph__radio").forEach(l => {
          const inp = l.querySelector("input");
          l.classList.toggle("is-active", !!(inp && inp.checked));
        });
        rerenderGraphChart();
      }
    });
  });
  root.querySelectorAll("[data-graph-clan-loop]").forEach(cb => {
    cb.addEventListener("change", () => {
      const id = cb.dataset.graphClanLoop;
      if (GRAPH_STATE.clans[id]) GRAPH_STATE.clans[id].loop = cb.checked;
      rerenderGraphChart();
    });
  });
  // Weapon toggles
  root.querySelectorAll("[data-graph-weapon-toggle]").forEach(cb => {
    cb.addEventListener("change", () => {
      const id = cb.dataset.graphWeaponToggle;
      if (GRAPH_STATE.weapons[id]) GRAPH_STATE.weapons[id].enabled = cb.checked;
      rerenderGraphChart();
    });
  });
  // Weapon mode radios
  root.querySelectorAll('input[type="radio"][name^="graph-weapon-mode-"]').forEach(r => {
    r.addEventListener("change", () => {
      const id = r.name.replace("graph-weapon-mode-", "");
      if (GRAPH_STATE.weapons[id] && r.checked) {
        GRAPH_STATE.weapons[id].mode = r.value;
        if (r.value === "S") GRAPH_STATE.weapons[id].loop = false;
        const group = r.closest(".combat-graph__radio-group");
        if (group) group.querySelectorAll(".combat-graph__radio").forEach(l => {
          const inp = l.querySelector("input");
          if (!inp || inp.disabled) return;
          l.classList.toggle("is-active", inp.checked);
        });
        const row = r.closest(".combat-graph__filter-row");
        if (row) {
          const loopToggle = row.querySelector("[data-graph-weapon-loop]");
          const loopLabel = row.querySelector(".combat-graph__weapon-loop");
          if (loopToggle) {
            const disableLoop = r.value === "S";
            loopToggle.disabled = disableLoop;
            if (disableLoop) loopToggle.checked = false;
          }
          if (loopLabel) loopLabel.classList.toggle("is-disabled", r.value === "S");
        }
        rerenderGraphChart();
      }
    });
  });
  root.querySelectorAll("[data-graph-weapon-loop]").forEach(cb => {
    cb.addEventListener("change", () => {
      const id = cb.dataset.graphWeaponLoop;
      if (GRAPH_STATE.weapons[id]) GRAPH_STATE.weapons[id].loop = cb.checked;
      rerenderGraphChart();
    });
  });
  // Ranged toggles
  root.querySelectorAll("[data-graph-ranged-toggle]").forEach(cb => {
    cb.addEventListener("change", () => {
      const id = cb.dataset.graphRangedToggle;
      if (GRAPH_STATE.ranged[id]) GRAPH_STATE.ranged[id].enabled = cb.checked;
      rerenderGraphChart();
    });
  });
  root.querySelectorAll('input[type="radio"][name^="graph-ranged-mode-"]').forEach(r => {
    r.addEventListener("change", () => {
      const id = r.name.replace("graph-ranged-mode-", "");
      if (GRAPH_STATE.ranged[id] && r.checked) {
        GRAPH_STATE.ranged[id].mode = r.value === "dual" ? "dual" : "single";
        const group = r.closest(".combat-graph__radio-group");
        if (group) group.querySelectorAll(".combat-graph__radio").forEach(l => {
          const inp = l.querySelector("input");
          l.classList.toggle("is-active", !!(inp && inp.checked));
        });
        rerenderGraphChart();
      }
    });
  });
  root.querySelectorAll("[data-graph-ranged-loop]").forEach(cb => {
    cb.addEventListener("change", () => {
      const id = cb.dataset.graphRangedLoop;
      if (GRAPH_STATE.ranged[id]) GRAPH_STATE.ranged[id].loop = cb.checked;
      rerenderGraphChart();
    });
  });
  // Bulk actions
  root.querySelectorAll("[data-graph-action]").forEach(btn => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.graphAction;
      if (action === "reset") {
        for (const id of Object.keys(GRAPH_STATE.clans)) {
          GRAPH_STATE.clans[id].enabled = false;
          GRAPH_STATE.clans[id].mode = "L";
          GRAPH_STATE.clans[id].loop = false;
        }
        for (const id of Object.keys(GRAPH_STATE.weapons)) {
          GRAPH_STATE.weapons[id].enabled = false;
          GRAPH_STATE.weapons[id].mode = "L";
          GRAPH_STATE.weapons[id].loop = false;
        }
        for (const id of Object.keys(GRAPH_STATE.ranged)) {
          GRAPH_STATE.ranged[id].enabled = false;
          GRAPH_STATE.ranged[id].mode = "single";
          GRAPH_STATE.ranged[id].loop = false;
        }
        if (GRAPH_STATE.clans.brujah) { GRAPH_STATE.clans.brujah.enabled = true; GRAPH_STATE.clans.brujah.mode = "L"; GRAPH_STATE.clans.brujah.loop = false; }
        if (GRAPH_STATE.weapons.bat) GRAPH_STATE.weapons.bat.enabled = true;
        if (GRAPH_STATE.weapons.knife) GRAPH_STATE.weapons.knife.enabled = true;
      } else {
        return;
      }
      // Re-render the whole panel since checkbox + radio state changed broadly.
      renderCombatGraphPage();
    });
  });

  root.querySelectorAll('input[type="radio"][name="graph-display-mode"]').forEach(r => {
    r.addEventListener("change", () => {
      if (!r.checked) return;
      GRAPH_STATE.displayMode = r.value;
      const group = r.closest(".combat-graph__display-toggle");
      if (group) group.querySelectorAll(".combat-graph__radio").forEach(l => {
        const inp = l.querySelector("input");
        l.classList.toggle("is-active", !!(inp && inp.checked));
      });
      rerenderGraphChart();
    });
  });
}

// ── Page entry point ────────────────────────────────────────
function renderCombatGraphPage() {
  const root = document.getElementById("combos-subpage-graph");
  if (!root) return;
  initGraphState();

  let h = `<div class="combos-header combat-graph__header">`;
  h += `<h2 class="combos-header__title">Combat Graph</h2>`;
  h += `<p class="combos-header__sub">Compare clan light, heavy, and optimal chains alongside melee and ranged weapon attacks as cumulative damage over time. Each curve uses the same timing math as the Clan, Melee, and Ranged tabs.</p>`;
  h += `<ul class="combos-header__primer">`;
  h += `<li><strong class="combos-header__primer-label">X-axis:</strong> elapsed time in seconds; each hit or shot lands at its modeled cadence.</li>`;
  h += `<li><strong class="combos-header__primer-label">Y-axis:</strong> cumulative damage by default, or DPS when the display toggle is set to DPS.</li>`;
  h += `<li><strong class="combos-header__primer-label">Steeper line</strong> = higher DPS. Curves that travel further along X without stalling sustain better.</li>`;
  h += `<li><strong class="combos-header__primer-label">Clan modes:</strong> choose Light, Heavy, or Optimal; Loop repeats the selected chain ${LOOP_GRAPH_CYCLES}x.</li>`;
  h += `<li><strong class="combos-header__primer-label">Ranged modes:</strong> choose Single or Dual; Loop treats ammo as infinite for ${RANGED_GRAPH_DURATION_SECONDS}s.</li>`;
  h += `</ul>`;
  h += `</div>`;

  h += `<div class="combat-graph-page">`;
  h += renderGraphFilters();
  h += `<div class="combat-graph__chart-wrap"><div class="combat-graph__chart-inner"></div></div>`;
  h += `</div>`;

  root.innerHTML = h;

  // Initial chart render + listeners
  rerenderGraphChart();
  attachGraphFilterListeners(root);
}
