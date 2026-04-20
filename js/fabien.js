// Fabien (Malkavian) Skill Tree
// All abilities are always unlocked – display only, no toggling.
// ====================================================================

const fabienState = { focusedIndex: null };

function initFabien() {
  renderFabienTree();
}

function refreshFabienPage() {
  renderFabienTree();
}

function renderFabienTree() {
  const grid = document.getElementById("fabien-tree");
  const detail = document.getElementById("fabien-detail");
  if (!grid || !detail) return;

  grid.innerHTML = "";

  // Malkavian clan logo at top
  const logo = document.createElement("img");
  logo.className = "fabien-tree__clan-logo";
  logo.src = `${CLAN_LOGOS}/T_UI_ClanLogo_Malkavian.png`;
  logo.alt = "Malkavian";
  grid.appendChild(logo);

  const clanName = document.createElement("div");
  clanName.className = "fabien-tree__clan-name";
  clanName.textContent = "Malkavian";
  grid.appendChild(clanName);

  // Abilities from mastery (top) to passive (bottom) per screenshot
  const order = [...FABIEN_ABILITIES].reverse();

  order.forEach((ability, revIdx) => {
    const realIdx = FABIEN_ABILITIES.length - 1 - revIdx;

    const cell = document.createElement("div");
    cell.className = "fabien-cell unlocked";
    if (fabienState.focusedIndex === realIdx) cell.classList.add("focused");

    cell.addEventListener("click", () => {
      fabienState.focusedIndex = fabienState.focusedIndex === realIdx ? null : realIdx;
      renderFabienTree();
    });

    // Button frame
    const btn = document.createElement("div");
    btn.className = "fabien-cell__btn";

    const bg = document.createElement("img");
    bg.className = "fabien-cell__btn-bg";
    bg.src = UI.btnUnlocked;
    btn.appendChild(bg);

    if (ability.icon) {
      const icon = document.createElement("img");
      icon.className = "fabien-cell__icon";
      icon.src = ability.icon;
      icon.alt = ability.name;
      btn.appendChild(icon);
    }

    cell.appendChild(btn);

    // Label
    const label = document.createElement("div");
    label.className = "fabien-cell__name";
    label.textContent = ability.name;
    cell.appendChild(label);

    // Connector line between abilities (not after last)
    if (revIdx < order.length - 1) {
      const connector = document.createElement("div");
      connector.className = "fabien-tree__connector";
      grid.appendChild(cell);
      grid.appendChild(connector);
    } else {
      grid.appendChild(cell);
    }
  });

  // Detail panel
  renderFabienDetail(detail);
}

function renderFabienDetail(panel) {
  if (fabienState.focusedIndex === null) {
    panel.innerHTML = '<div class="empty-state">Select an ability to view details</div>';
    return;
  }

  const ability = FABIEN_ABILITIES[fabienState.focusedIndex];
  let html = "";

  // Tier label
  const tierLabel = TIERS[ability.tier] ? TIERS[ability.tier].label : ability.tier;
  html += `<div class="detail-panel__tier">${tierLabel}</div>`;
  html += `<div class="detail-panel__name">${ability.name}</div>`;

  // Description
  if (ability.description) {
    html += `<div class="detail-panel__desc">${ability.description}</div>`;
  }

  // Discipline
  if (ability.discipline) {
    const disc = DISCIPLINES[ability.discipline];
    html += `<div class="detail-panel__discipline">
      <img src="${disc.icon}" alt="${disc.name}">
      <span>${disc.name}</span>
    </div>`;
  }

  // Blood pips
  if (ability.bloodPips > 0) {
    html += `<div style="display:flex; gap:3px; margin-top:8px;">`;
    for (let i = 0; i < ability.bloodPips; i++) {
      html += `<div class="blood-pip" style="width:14px; height:6px;"></div>`;
    }
    html += `</div>`;
  }

  // Always unlocked
  html += `<div style="margin-top:12px; font-size:11px; color:var(--text-dim);">Status: Unlocked</div>`;

  panel.innerHTML = html;
}

document.addEventListener("DOMContentLoaded", initFabien);
