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
  // Only render if the ability subtab is active
  const abilitySubpage = document.getElementById("combos-subpage-ability");
  if (!abilitySubpage || abilitySubpage.classList.contains("hidden")) return;

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
  const secondaryTabs = document.querySelectorAll(".tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny) .tab-bar__tab");
  secondaryTabs.forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#page-phyre > .subpage").forEach(p => p.classList.add("hidden"));
  const combosTab = document.querySelector(".tab-bar--secondary .tab-bar__tab[data-subtab='combos']");
  if (combosTab) combosTab.classList.add("active");
  document.getElementById("subpage-combos").classList.remove("hidden");
  setActiveCombosSubtab("ability");

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
    ],
  },
  {
    section: "Combos & Counters",
    sectionSub: "Multiple buttons, or timed against enemy attacks",
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
          <h2 class="combos-header__title">Melee Combos &amp; Inputs</h2>
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
      { step: 1, lightDmg: 8,  lightMontage: "Brujah_Light1", lightLen: 0.81, heavyDmg: 15, heavyMontage: "Brujah_Heavy1", heavyLen: 0.80, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 2, lightDmg: 8,  lightMontage: "Brujah_Light2", lightLen: 1.11, heavyDmg: 15, heavyMontage: "Brujah_Heavy2", heavyLen: 0.80, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 3, lightDmg: 8,  lightMontage: "Brujah_Light3", lightLen: 1.11, heavyDmg: 15, heavyMontage: "Brujah_Heavy1", heavyLen: 0.80, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 4, lightDmg: 8,  lightMontage: "Brujah_Light4", lightLen: 2.29, heavyDmg: 15, heavyMontage: "Brujah_Heavy2", heavyLen: 0.80, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.70, finisher: true },
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
      { step: 1, lightDmg: 8,  lightMontage: "TR_Light_1", lightLen: 0.92, heavyDmg: 12, heavyMontage: "TR_Heavy_1", heavyLen: 1.33, maxWindup: 0.8, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 2, lightDmg: 8,  lightMontage: "TR_Light_2", lightLen: 0.92, heavyDmg: 12, heavyMontage: "TR_Heavy_2", heavyLen: 1.33, maxWindup: 0.8, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 3, lightDmg: 8,  lightMontage: "TR_Light_1", lightLen: 0.92, heavyDmg: 12, heavyMontage: "TR_Heavy_1", heavyLen: 1.33, maxWindup: 0.8, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 4, lightDmg: 8,  lightMontage: "TR_Light_2", lightLen: 0.92, heavyDmg: 12, heavyMontage: "TR_Heavy_2", heavyLen: 1.33, maxWindup: 0.8, heavyThresh: 0.7, comboDelay: 0.70, finisher: true },
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
      { step: 1, lightDmg: 6,  lightMontage: "BA_Light_1", lightLen: 0.88, heavyDmg: 15, heavyMontage: "BA_Heavy_1", heavyLen: 1.53, maxWindup: 1.0, heavyThresh: 0.7,  comboDelay: 0.36 },
      { step: 2, lightDmg: 5,  lightMontage: "BA_Light_2", lightLen: 0.88, heavyDmg: 15, heavyMontage: "BA_Heavy_2", heavyLen: 1.53, maxWindup: 1.0, heavyThresh: 0.7,  comboDelay: 0.15 },
      { step: 3, lightDmg: 5,  lightMontage: "BA_Light_3", lightLen: 0.88, heavyDmg: 15, heavyMontage: "BA_Heavy_1", heavyLen: 1.53, maxWindup: 1.0, heavyThresh: 0.7,  comboDelay: 0.35 },
      { step: 4, lightDmg: 7,  lightMontage: "BA_Light_4", lightLen: 0.88, heavyDmg: 15, heavyMontage: "BA_Heavy_2", heavyLen: 1.53, maxWindup: 1.0, heavyThresh: 0.7,  comboDelay: 0.30 },
      { step: 5, lightDmg: 10, lightMontage: "BA_Light_5", lightLen: 1.12, heavyDmg: 18, heavyMontage: "BA_Heavy_1", heavyLen: 1.53, maxWindup: 1.1, heavyThresh: 0.9,  comboDelay: 0.80, finisher: true },
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
      note: "Steps 1–4 heavy marginals all beat the 12.41 baseline; step-5 heavy marginal is only 10.1 — light the finisher.",
    },
  },
  ventrue: {
    name: "Ventrue",
    steps: 4,
    lightType: "Lunging",
    rows: [
      { step: 1, lightDmg: 8,  lightMontage: "VT_Light_3",  lightLen: 0.86, heavyDmg: 15, heavyMontage: "VE_Heavy_Recycle_01", heavyLen: 1.40, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 2, lightDmg: 7,  lightMontage: "VT_Light_4",  lightLen: 0.87, heavyDmg: 15, heavyMontage: "VE_Heavy_Recycle_02", heavyLen: 1.40, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 3, lightDmg: 7,  lightMontage: "VE_Light_3",  lightLen: 0.73, heavyDmg: 15, heavyMontage: "VE_Heavy_Recycle_01", heavyLen: 1.40, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.30 },
      { step: 4, lightDmg: 7,  lightMontage: "VT_Light_5",  lightLen: 1.01, heavyDmg: 15, heavyMontage: "VE_Heavy_Recycle_02", heavyLen: 1.40, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.70, finisher: true },
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
      { step: 1, lightDmg: 8,  lightMontage: "LA_Light_1",   lightLen: 1.13, heavyDmg: 15, heavyMontage: "LA_Heavy_Right", heavyLen: 0.73, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 2, lightDmg: 8,  lightMontage: "LA_Light_2",   lightLen: 0.77, heavyDmg: 15, heavyMontage: "LA_Heavy_Right", heavyLen: 0.73, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 3, lightDmg: 8,  lightMontage: "LA_Light_3",   lightLen: 1.11, heavyDmg: 15, heavyMontage: "LA_Heavy_Right", heavyLen: 0.73, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.20 },
      { step: 4, lightDmg: 8,  lightMontage: "LA_Light_End", lightLen: 1.16, heavyDmg: 15, heavyMontage: "LA_Heavy_Right", heavyLen: 0.73, maxWindup: 1.0, heavyThresh: 0.7, comboDelay: 0.70, finisher: true },
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
      { step: 1, lightDmg: 5,  lightMontage: "Tor_Light_01", lightLen: 1.30, heavyDmg: 15, heavyMontage: "Tor_Heavy_01", heavyLen: 1.53, maxWindup: 1.0, heavyThresh: 0.70, comboDelay: 0.25 },
      { step: 2, lightDmg: 5,  lightMontage: "Tor_Light_02", lightLen: 1.30, heavyDmg: 15, heavyMontage: "Tor_Heavy_02", heavyLen: 1.30, maxWindup: 1.0, heavyThresh: 0.70, comboDelay: 0.25 },
      { step: 3, lightDmg: 6,  lightMontage: "BA_Light_3",   lightLen: 0.88, heavyDmg: 12, heavyMontage: "Tor_Heavy_01", heavyLen: 1.53, maxWindup: 1.0, heavyThresh: 0.55, comboDelay: 0.25 },
      { step: 4, lightDmg: 6,  lightMontage: "BA_Light_4",   lightLen: 0.88, heavyDmg: 12, heavyMontage: "Tor_Heavy_02", heavyLen: 1.30, maxWindup: 1.0, heavyThresh: 0.55, comboDelay: 0.25 },
      { step: 5, lightDmg: 7,  lightMontage: "BA_Light_5",   lightLen: 1.12, heavyDmg: 18, heavyMontage: "BA_Heavy_1",   heavyLen: 1.53, maxWindup: 1.1, heavyThresh: 0.45, comboDelay: 0.80, finisher: true },
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
  html += `<button class="clan-combos-filter__btn clan-combos-notes-btn" id="clan-combos-kicks-btn" title="Kicks"><img src="assets/N_Textures/AbilityTree/AbilitiesIcons/T_UI_Icon_Fleetness.png" alt="" style="transform:rotate(270deg)"> Kicks</button>`;
  html += `<button class="clan-combos-filter__btn clan-combos-notes-btn" id="clan-combos-mobility-btn" title="Dash &amp; Shunt"><img src="assets/N_Textures/AbilityTree/AbilitiesIcons/T_UI_Icon_BlurredMovement.png" alt=""> Mobility</button>`;
  html += `<button class="clan-combos-filter__btn clan-combos-notes-btn" id="clan-combos-notes-btn" title="Cross-Clan Notes"><img src="${typeof UI !== 'undefined' ? UI.phyreMark : ''}" alt=""> Notes</button>`;
  html += `</div>`; // clan-combos-jump-btns
  html += `<div class="clan-combos-legend"><span class="clan-combos-legend__item clan-combos-legend__item--finisher">★ Finisher step</span><span class="clan-combos-legend__item clan-combos-legend__item--selected">Highlighted = your clan</span></div>`;
  html += `</div>`; // filter-row
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
    if (data.dps) {
      const dps = data.dps;
      const allLightDmg = data.rows.reduce((s, r) => s + r.lightDmg, 0);
      const allLightTime = dps.allLightDps > 0 ? (allLightDmg / dps.allLightDps) : 0;
      const optPatHtml = dps.optimalPattern.map(t =>
        `<span class="dps-chip__pat-step dps-chip__pat-step--${t === 'H' ? 'h' : 'l'}">${t}</span>`
      ).join("");
      const lightsPatHtml = data.rows.map(() => `<span class="dps-chip__pat-step dps-chip__pat-step--l">L</span>`).join("");
      html += `<div class="dps-chip-group">`;
      html += `<div class="dps-chip dps-chip--opt" data-clan="${clanId}" data-mode="opt" tabindex="0" role="button" title="Optimal DPS pattern">`;
      html += `<span class="dps-chip__head"><span class="dps-chip__label">OPT</span><span class="dps-chip__val">${dps.optimalDps.toFixed(2)}</span></span>`;
      html += `<div class="dps-chip__panel"><span class="dps-chip__panel-row"><span class="dps-chip__row-label">DPS</span><span class="dps-chip__row-val">${dps.optimalDps.toFixed(2)}</span></span><span class="dps-chip__panel-row"><span class="dps-chip__row-label">Dmg</span><span class="dps-chip__row-val">${dps.optimalDmg}</span></span><span class="dps-chip__rotation">${optPatHtml}</span><span class="dps-chip__panel-row"><span class="dps-chip__row-label">Time</span><span class="dps-chip__row-val">${dps.optimalTime.toFixed(2)}s</span></span></div>`;
      html += `</div>`;
      html += `<div class="dps-chip dps-chip--lights" data-clan="${clanId}" data-mode="lights" tabindex="0" role="button" title="All-light DPS">`;
      html += `<span class="dps-chip__head"><span class="dps-chip__label">L's</span><span class="dps-chip__val">${dps.allLightDps.toFixed(2)}</span></span>`;
      html += `<div class="dps-chip__panel"><span class="dps-chip__panel-row"><span class="dps-chip__row-label">DPS</span><span class="dps-chip__row-val">${dps.allLightDps.toFixed(2)}</span></span><span class="dps-chip__panel-row"><span class="dps-chip__row-label">Dmg</span><span class="dps-chip__row-val">${allLightDmg}</span></span><span class="dps-chip__rotation">${lightsPatHtml}</span><span class="dps-chip__panel-row"><span class="dps-chip__row-label">Time</span><span class="dps-chip__row-val">${allLightTime.toFixed(2)}s</span></span></div>`;
      html += `</div>`;
      html += `</div>`; // dps-chip-group
    }
    html += `</div>`;

    // Step table
    html += `<table class="combos-table clan-combos-table">`;
    html += `<thead><tr>
      <th class="combos-table__th clan-combos-table__th--step">Step</th>
      <th class="combos-table__th clan-combos-table__th--ldmg" title="Light attack damage">Light Dmg</th>
      <th class="combos-table__th clan-combos-table__th--llen" title="Full light montage length — only plays if combo lapses">L.Len</th>
      <th class="combos-table__th clan-combos-table__th--hdmg" title="Heavy attack damage">Heavy Dmg</th>
      <th class="combos-table__th clan-combos-table__th--hlen" title="Full heavy montage length — only plays if combo lapses">H.Len</th>
      <th class="combos-table__th clan-combos-table__th--windup" title="How long a heavy attack takes to charge">Heavy Windup</th>
      <th class="combos-table__th clan-combos-table__th--thresh" title="Normalized hold required to trigger heavy (0 = instant, 1 = full hold)">H. Threshold</th>
      <th class="combos-table__th clan-combos-table__th--delay" title="Window to chain to the next combo step">Combo Delay</th>
    </tr></thead><tbody>`;

    for (const row of data.rows) {
      const isFinisher = row.finisher;
      html += `<tr class="clan-combos-table__row${isFinisher ? " clan-combos-table__row--finisher" : ""}" data-step="${row.step - 1}">`;
      html += `<td class="combos-table__td clan-combos-table__td--step">${row.step}${isFinisher ? `<span class="clan-combo-star" title="Finisher">★</span>` : ""}</td>`;
      html += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="ldmg">${row.lightDmg}</td>`;
      html += `<td class="combos-table__td clan-combos-table__td--len"${row.lightMontage ? ` title="${row.lightMontage}"` : ""}>${row.lightLen.toFixed(2)}s</td>`;
      const heavyClass = row.heavyDmg >= 18 ? "clan-combo__dmg--peak" : "";
      html += `<td class="combos-table__td clan-combos-table__td--dmg ${heavyClass}" data-cell="hdmg">${row.heavyDmg}</td>`;
      html += `<td class="combos-table__td clan-combos-table__td--len"${row.heavyMontage ? ` title="${row.heavyMontage}"` : ""}>${row.heavyLen.toFixed(2)}s</td>`;
      const windupClass = row.maxWindup !== 1.0 ? " clan-combo__windup--notable" : "";
      html += `<td class="combos-table__td clan-combos-table__td--windup${windupClass}">${row.maxWindup.toFixed(1)}</td>`;
      const threshClass = row.heavyThresh <= 0.5 ? "clan-combo__thresh--easy" : row.heavyThresh >= 0.85 ? "clan-combo__thresh--hard" : "";
      html += `<td class="combos-table__td clan-combos-table__td--thresh ${threshClass}">${row.heavyThresh.toFixed(2)}</td>`;
      html += `<td class="combos-table__td clan-combos-table__td--delay">${row.comboDelay.toFixed(2)}s</td>`;
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

  // ── Kicks section ────────────────────────────────────────────
  html += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad" id="clan-kicks-section">`;
  html += `<div class="crossclan-section-heading">`;
  html += `<img class="crossclan-section-heading__icon" src="assets/N_Textures/AbilityTree/AbilitiesIcons/T_UI_Icon_Fleetness.png" alt="Kicks" style="transform:rotate(270deg)">`;
  html += `<span>Kicks</span>`;
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
    <th class="combos-table__th kicks-table__th--cd" title="Cooldown before kick can be used again">Cooldown</th>
  </tr></thead><tbody>`;

  const _ki = (src, alt) => `<img class="cct-inline-key" src="assets/Keyboard/${src}" alt="${alt}" title="${alt}">`;
  const _lmb = _ki('T_UI_Keyboard_Mouse_Left_Click.png', 'LMB');

  const kickRows = [
    { name: "Front",   context: "Ground, moving forward",  input: `Forward + Kick<br>(${_ki('T_UI_Keyboard_W.png','W')}+${_lmb})`,                                                                              animLen: "1.17s", dmg: 5,  dmgPeak: false, bonus: "+5 vs Stunned",   bonusTip: "Doubles to 10 vs Combat.Status.Stunned", range: 180, radius: 35, comboDelay: "0.50s", kb: "H: 300",           hitReact: "Stumble", cooldown: "0.3s", cdPeak: false },
    { name: "Back",    context: "Ground, moving backward", input: `Back + Kick<br>(${_ki('T_UI_Keyboard_S.png','S')}+${_lmb})`,                                                                                animLen: "1.83s", dmg: 7,  dmgPeak: false, bonus: "+1.5 (always?)", bonusTip: "No condition tag on SpecialDamageBonus — may always apply; also applies GE_BackKickenemyaffect (5s stat debuff)", range: 250, radius: 35, comboDelay: "1.00s", kb: "H: 800",           hitReact: "—",       cooldown: "0.3s", cdPeak: false },
    { name: "Side",    context: "Ground, left or right",   input: `Left/Right + Kick<br>(${_ki('T_UI_Keyboard_A.png','A')}/${_ki('T_UI_Keyboard_D.png','D')}+${_lmb})`,                                        animLen: "1.20s", dmg: 7,  dmgPeak: false, bonus: "+4 vs TK-Pulled",bonusTip: "+4 vs Combat.Status.Hitreact.TkPull (TK combo synergy) — trace radius 60 vs standard 35", range: 270, radius: 60, comboDelay: "0.80s", kb: "H: 800",           hitReact: "Stumble", cooldown: "0.3s", cdPeak: false },
    { name: "Sliding", context: "Sprinting",               input: `Sprint + Kick<br>(${_ki('T_UI_Keyboard_CTRL_Left.png','ctrl')}+${_lmb})`,                                                                     animLen: "1.50s", dmg: 15, dmgPeak: false, bonus: "—",              bonusTip: "",  range: 300, radius: 40, comboDelay: "1.00s", kb: "H: 1400, V: +400", hitReact: "Stumble", cooldown: "0.3s", cdPeak: false },
    { name: "Drop",    context: "Airborne",                input: `Airborne + Kick<br>(${_ki('T_UI_Keyboard_SpaceBar.png','Space')} &#8594; ${_lmb})`,                                                           animLen: "1.50s", dmg: 25, dmgPeak: true,  bonus: "—",              bonusTip: "",  range: 200, radius: 35, comboDelay: "1.00s", kb: "H: 2000, V: −200", hitReact: "Stumble", cooldown: "6.0s", cdPeak: true  },
  ];

  for (const k of kickRows) {
    html += `<tr class="combos-table__tr${k.cdPeak ? " kicks-table__row--cooldown" : ""}">`;
    html += `<td class="combos-table__td kicks-table__td--name">${k.name}</td>`;
    html += `<td class="combos-table__td kicks-table__td--input" title="${k.context}">${k.input}</td>`;
    html += `<td class="combos-table__td clan-combos-table__td--len">${k.animLen}</td>`;
    html += `<td class="combos-table__td clan-combos-table__td--dmg${k.dmgPeak ? " clan-combo__dmg--peak" : ""}">${k.dmg}</td>`;
    html += `<td class="combos-table__td kicks-table__td--bonus"${k.bonusTip ? ` title="${k.bonusTip}"` : ""}>${k.bonus}</td>`;
    html += `<td class="combos-table__td kicks-table__td--range" title="Trace range: ${k.range} | Radius: ${k.radius}">${k.range} <span class="crossclan-note">(r:${k.radius})</span></td>`;
    html += `<td class="combos-table__td clan-combos-table__td--delay">${k.comboDelay}</td>`;
    html += `<td class="combos-table__td kicks-table__td--kb">${k.kb}</td>`;
    html += `<td class="combos-table__td kicks-table__td--cd${k.cdPeak ? " kicks-table__td--cd-peak" : ""}">${k.cooldown}</td>`;
    html += `</tr>`;
  }
  html += `</tbody></table>`;
  html += `<ul class="crossclan-list crossclan-list--notes">
    <li><strong>Front kick</strong> doubles damage vs <code>Stunned</code> enemies (5 → 10).</li>
    <li><strong>Side kick</strong> synergises with Telekinesis — bonus damage vs TK-pulled enemies; also has a wider trace radius (60 vs 35).</li>
    <li><strong>Back kick</strong> applies a 5s multiplicative stat debuff (<code>GE_BackKickenemyaffect</code>) on the target.</li>
    <li><strong>Sliding kick</strong> launches the enemy upward (V: +400); <strong>drop kick</strong> pins them downward (V: −200).</li>
    <li><strong>Drop kick</strong> is the strongest single hit (25 dmg) but has a 6s cooldown — reset on landing — all others share a 0.3s cooldown.</li>
    <li><strong>Side kick</strong> uses <code>Kick_Right</code> mirrored for left input — <code>Kick_Left</code> exists in exports but is not referenced.</li>
  </ul>`;
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

  html += `</div>`; // mobility section-wrap

  // ── Cross-Clan Notes section ────────────────────────────────
  html += `<div class="crossclan-section-wrap" id="clan-crossclan-notes">`;
  html += `<div class="crossclan-section-heading"><img class="crossclan-section-heading__icon" src="${typeof UI !== 'undefined' ? UI.phyreMark : ''}" alt=""><span>Cross-Clan Notes</span></div>`;

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

  // DPS chip click: highlight optimal/light cells in that block
  container.querySelectorAll('.dps-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const clanId = chip.dataset.clan;
      const mode = chip.dataset.mode;
      const block = container.querySelector(`#clan-combo-block-${clanId}`);
      if (!block) return;
      const isActive = chip.classList.contains('dps-chip--active');
      block.querySelectorAll('.dps-chip').forEach(c => c.classList.remove('dps-chip--active'));
      block.querySelectorAll('.dps-cell--highlight').forEach(c => c.classList.remove('dps-cell--highlight'));
      if (!isActive) {
        chip.classList.add('dps-chip--active');
        const cdata = CLAN_COMBOS[clanId];
        const pattern = mode === 'opt' ? cdata.dps.optimalPattern : cdata.rows.map(() => 'L');
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
    if (clan && clan.logo) h += `<img class="crossclan-clan-logo" src="${clan.logo}" alt="">`;
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
    { prop: "Lunge Range (targeted)",lunging: "450 units (~4.5 m)",   tremere: "30 units (effectively off)", tremereClass: "crossclan__val--dim" },
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
  h += `<li>Tremere pushes targets back further on each hit (30 vs 10 units).</li>`;
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
    if (clan && clan.logo) h += `<img class="crossclan-clan-logo" src="${clan.logo}" alt="">`;
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


