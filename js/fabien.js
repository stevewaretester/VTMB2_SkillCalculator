// Fabien (Malkavian) Skill Tree
// All abilities are always unlocked – display only, no toggling.
// ====================================================================

const fabienState = { focusedIndex: null, notesCardFocused: false };

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

  // Malkavian clan logo at top — completed if any Phyre clan is completed
  const anyCompleted = state.completedClans.size > 0;
  const logo = document.createElement("img");
  logo.className = "fabien-tree__clan-logo";
  logo.src = anyCompleted
    ? `${CLAN_LOGOS}/T_UI_ClanLogo_Malkavian_COMPLETED.png`
    : `${CLAN_LOGOS}/T_UI_ClanLogo_Malkavian.png`;
  logo.alt = "Malkavian";
  logo.addEventListener("mouseenter", (e) => {
    sharedTooltip.innerHTML =
      `<div class="tooltip__name">Malkavian</div>` +
      `<div class="tooltip__clan-descr">Malkavians possess unsettling insight, seeing the world askew. Some call them mad, others prophetic.</div>`;
    sharedTooltip.classList.add("tooltip--visible");
    positionTooltip(e);
  });
  logo.addEventListener("mousemove", positionTooltip);
  logo.addEventListener("mouseleave", () => sharedTooltip.classList.remove("tooltip--visible"));
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
      fabienState.notesCardFocused = false;
      fabienState.focusedIndex = fabienState.focusedIndex === realIdx ? null : realIdx;
      renderFabienTree();
    });

    // Button frame
    const btn = document.createElement("div");
    btn.className = "fabien-cell__btn";

    const bg = document.createElement("img");
    bg.className = "fabien-cell__btn-bg";
    bg.src = UI.btnEquipped;
    btn.appendChild(bg);

    if (ability.icon) {
      const icon = document.createElement("img");
      icon.className = "fabien-cell__icon";
      icon.src = ability.icon;
      icon.alt = ability.name;
      btn.appendChild(icon);
    }

    cell.appendChild(btn);

    const tierLabel = ability.tier && TIERS[ability.tier] ? TIERS[ability.tier].label : "";
    const tooltipHtml = `<div class="tooltip__tier">${tierLabel}</div><div class="tooltip__name">${ability.name}</div>`;
    cell.addEventListener("mouseenter", (e) => {
      sharedTooltip.innerHTML = tooltipHtml;
      sharedTooltip.classList.add("tooltip--visible");
      positionTooltip(e);
    });
    cell.addEventListener("mousemove", positionTooltip);
    cell.addEventListener("mouseleave", () => sharedTooltip.classList.remove("tooltip--visible"));

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

  // Update notes item active state
  const notesItem = document.getElementById("fabien-notes-phlegmatic");
  if (notesItem) notesItem.classList.toggle("focused", fabienState.notesCardFocused);

  // Detail panel
  renderFabienDetail(detail);
}

function renderNotesDetail(panel) {
  let html = '';
  html += `<div class="detail-panel__tier">Blood Resonance</div>`;
  html += `<div class="detail-panel__name-row">`;
  html += `<img class="detail-panel__ability-icon" src="assets/N_Textures/General/T_UI_Icon_PhlegmaticSymbol.png" alt="Phlegmatic" style="filter:brightness(0) invert(44%) sepia(1) saturate(6) hue-rotate(148deg) brightness(0.9);">`;
  html += `<div class="detail-panel__name">Phlegmatic Resonance</div>`;
  html += `</div>`;
  html += `<div class="detail-panel__desc"><em>Phlegmatic blood resonates with calm, detachment, and focus.</em></div>`;
  html += `<div class="detail-panel__desc" style="margin-top:8px;">Fabien has various helpers around the city denoted with the <img style="width:20px;height:20px;vertical-align:middle;position:relative;top:-2px;" src="assets/N_Textures/MapIcons/T_UI_Icon_Map_Phlegmatic.png" alt="Phlegmatic"> symbol. Speak with them to request a feed and fuel his abilities.</div>`;
  panel.innerHTML = html;
}

function renderFabienDetail(panel) {
  if (fabienState.notesCardFocused) {
    renderNotesDetail(panel);
    return;
  }
  if (fabienState.focusedIndex === null) {
    panel.innerHTML = '<div class="empty-state">Select an ability to view details</div>';
    return;
  }

  const ability = FABIEN_ABILITIES[fabienState.focusedIndex];
  let html = "";

  // Tier label
  const tierLabel = TIERS[ability.tier] ? TIERS[ability.tier].label : ability.tier;
  html += `<div class="detail-panel__tier">${tierLabel}</div>`;

  // Icon + Name row
  if (ability.icon) {
    html += `<div class="detail-panel__name-row">`;
    html += `<img class="detail-panel__ability-icon" src="${ability.icon}" alt="${ability.name}">`;
    html += `<div class="detail-panel__name">${ability.name}</div>`;
    html += `</div>`;
  } else {
    html += `<div class="detail-panel__name">${ability.name}</div>`;
  }

  // Description
  if (ability.description) {
    html += `<div class="detail-panel__desc">${ability.description}</div>`;
  }

  // Mod: Fabien Phlegmatic Fast Travel — shown below description, above pips
  if (ability.tier === "passive" && state.modFabienPhlegmatic) {
    html += `<div class="fabien-mod-line">Fast travel from the overworld to Phlegmatic Resonant Targets by selecting them on the map</div>`;
  }

  // Discipline
  if (ability.discipline) {
    const disc = DISCIPLINES[ability.discipline];
    html += `<div class="detail-panel__discipline">
      <img src="${disc.icon}" alt="${disc.name}">
      <span>${disc.name}</span>
    </div>`;
  }

  // Blood pips (Fast Forward mod has no blood pip cost)
  const hidePipsForFastForward = ability.tier === "passive" && state.modFabienPhlegmatic;
  if (ability.bloodPips > 0 && !hidePipsForFastForward) {
    html += `<div style="display:flex; gap:3px; margin-top:8px;">`;
    for (let i = 0; i < ability.bloodPips; i++) {
      html += `<div class="blood-pip filled" style="width:14px; height:6px;"></div>`;
    }
    html += `</div>`;
  }

  // Mod video
  if (ability.tier === "passive" && state.modFabienPhlegmatic) {
    const vidSrc = [
      "assets/vids",
      "malk_",
      "FabienPhlegmaticFastTravel.mp4"
    ].join("/");
    html += `<div class="detail-panel__video">`;
    html += `<video src="${vidSrc}" autoplay loop muted data-video-src="${vidSrc}"></video>`;
    html += `<div class="detail-panel__video-expand" title="Click to enlarge">&#x26F6;</div>`;
    html += `</div>`;
  }

  panel.innerHTML = html;

  // Bind video lightbox for mod video
  const videoWrap = panel.querySelector(".detail-panel__video");
  const videoEl = videoWrap && videoWrap.querySelector("video");
  if (videoEl) {
    const openLightbox = () => openVideoLightbox(videoEl.dataset.videoSrc);
    videoEl.style.cursor = "pointer";
    videoEl.addEventListener("click", openLightbox);
    const expandBtn = videoWrap.querySelector(".detail-panel__video-expand");
    if (expandBtn) expandBtn.addEventListener("click", openLightbox);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initFabien();

  // Wire the Phyre skill tree arrow button → navigate to Fabien + focus Fast Forward
  const notesItem = document.getElementById("fabien-notes-phlegmatic");
  if (notesItem) {
    notesItem.addEventListener("click", () => {
      fabienState.notesCardFocused = !fabienState.notesCardFocused;
      if (fabienState.notesCardFocused) fabienState.focusedIndex = null;
      renderFabienTree();
    });
  }

  const goBtn = document.getElementById("fabien-phlegmatic-go");
  if (goBtn) {
    goBtn.addEventListener("click", () => {
      // Switch to Fabien primary tab
      document.querySelectorAll(".tab-bar--primary .tab-bar__tab").forEach(t => t.classList.remove("active"));
      const fabienTab = document.querySelector(".tab-bar--primary .tab-bar__tab[data-tab='fabien']");
      if (fabienTab) fabienTab.classList.add("active");
      document.querySelectorAll("#app > .page").forEach(p => p.classList.add("hidden"));
      document.getElementById("page-fabien").classList.remove("hidden");
      // Focus Fast Forward (passive = index 0 in FABIEN_ABILITIES)
      fabienState.focusedIndex = 0;
      renderFabienTree();
    });
  }
});
