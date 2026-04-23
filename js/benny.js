// Benny Skill Tree
// Two-column unlocked display: core Brujah column + Benny side column.

const bennyState = { focused: null, pistolFocused: false, looseCannon: false, dlcInfoOpen: false };

const BENNY_CORE_ORDER = ["perk", "mastery", "affect", "relocate", "strike", "passive"];
const BENNY_SIDE_ORDER = ["mastery", "affect", "relocate", "strike"];

const BENNY_SIDE_SOURCE = {
  strike:   { clanId: "ventrue", tier: "strike" },   // Terminal Decree
  relocate: { clanId: "banuHaqim", tier: "relocate" }, // Split Second
  affect:   { clanId: "toreador", tier: "affect" },   // Beckon
  mastery:  { clanId: "toreador", tier: "mastery" },  // Blurred Momentum
};

function initBenny() {
  renderBennyTree();

  const pistol = document.getElementById("benny-pistol-img");
  if (pistol) {
    const tipHtml = `<div class="tooltip__name">Benny's Pistol</div><div class="tooltip__desc">Benny's sidearm is his prized possession. A custom made 9mm pistol that has been heavily modified to be fully automatic, with a high-capacity magazine and compensator. Impractical for a mortal due to the extreme recoil, but not a problem for a Brujah vampire.</div>`;
    pistol.addEventListener("mouseenter", e => {
      sharedTooltip.innerHTML = tipHtml;
      sharedTooltip.classList.add("tooltip--visible");
      positionTooltip(e);
    });
    pistol.addEventListener("mousemove", positionTooltip);
    pistol.addEventListener("mouseleave", () => sharedTooltip.classList.remove("tooltip--visible"));
    pistol.addEventListener("click", () => {
      bennyState.pistolFocused = !bennyState.pistolFocused;
      if (bennyState.pistolFocused) bennyState.focused = null;
      pistol.classList.toggle("benny-pistol--focused", bennyState.pistolFocused);
      const detail = document.getElementById("benny-detail");
      if (detail) renderBennyDetail(detail);
    });
  }
}

function refreshBennyPage() {
  renderBennyTree();
}

function navigateToBennyDLC() {
  // Switch to Benny tab
  document.querySelectorAll(".tab-bar--primary .tab-bar__tab").forEach(t => t.classList.remove("active"));
  document.querySelectorAll("#app > .page").forEach(p => p.classList.add("hidden"));
  const bennyTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="benny"]');
  if (bennyTab) bennyTab.classList.add("active");
  document.getElementById("page-benny").classList.remove("hidden");

  // Open the DLC dropdown
  bennyState.dlcInfoOpen = true;
  renderBennyTree();

  // Flash the checkbox label
  setTimeout(() => {
    const label = document.querySelector(".benny-dlc-purchase");
    if (!label) return;
    let flashes = 0;
    const interval = setInterval(() => {
      label.classList.toggle("benny-dlc-purchase--flash");
      if (++flashes >= 6) {
        clearInterval(interval);
        label.classList.remove("benny-dlc-purchase--flash");
      }
    }, 200);
  }, 450); // wait for dropdown to open
}

function getBennyCoreAbility(tier) {
  return ABILITIES.brujah[tier];
}

function getBennySideAbility(tier) {
  const src = BENNY_SIDE_SOURCE[tier];
  if (!src) return null;
  return ABILITIES[src.clanId][src.tier];
}

function makeBennyCell(ability, isFocused, onClick, tier, fallbackIcon) {
  const cell = document.createElement("div");
  cell.className = `fabien-cell unlocked${isFocused ? " focused" : ""}`;

  const btn = document.createElement("div");
  btn.className = "fabien-cell__btn";

  const bg = document.createElement("img");
  bg.className = "fabien-cell__btn-bg";
  bg.src = UI.btnEquipped;
  btn.appendChild(bg);

  const iconSrc = ability.icon || fallbackIcon;
  if (iconSrc) {
    const icon = document.createElement("img");
    icon.className = "fabien-cell__icon";
    icon.src = iconSrc;
    icon.alt = ability.name;
    btn.appendChild(icon);
  }

  cell.appendChild(btn);
  cell.addEventListener("click", onClick);

  const tierLabel = tier && TIERS[tier] ? TIERS[tier].label : "";
  const tooltipHtml = `<div class="tooltip__tier">${tierLabel}</div><div class="tooltip__name">${ability.name}</div>`;
  cell.addEventListener("mouseenter", (e) => {
    sharedTooltip.innerHTML = tooltipHtml;
    sharedTooltip.classList.add("tooltip--visible");
    positionTooltip(e);
  });
  cell.addEventListener("mousemove", positionTooltip);
  cell.addEventListener("mouseleave", () => sharedTooltip.classList.remove("tooltip--visible"));

  return cell;
}

function renderBennyTree() {
  const tree = document.getElementById("benny-tree");
  const detail = document.getElementById("benny-detail");
  if (!tree || !detail) return;

  // ── DLC section above the layout ──
  const dlcSection = document.getElementById("benny-dlc-section");
  const dlcToggleBtn = document.getElementById("benny-dlc-toggle");
  if (dlcSection) {
    dlcSection.innerHTML = "";
    dlcSection.classList.toggle("collapsed", !bennyState.dlcInfoOpen);

    const dlcContent = document.createElement("div");
    dlcContent.className = "benny-dlc-content";

    const dlcImg = document.createElement("img");
    dlcImg.className = "benny-dlc-tile";
    dlcImg.src = "assets/T_UI_DLC_FrontEnd_Icon_LooseCannon.png";
    dlcImg.alt = "Loose Cannon DLC";
    dlcImg.style.cursor = "pointer";
    dlcImg.title = "Watch trailer";
    dlcImg.addEventListener("click", () => window.open("https://youtu.be/tAN6R0GEJyM", "_blank"));
    dlcContent.appendChild(dlcImg);

    const dlcRight = document.createElement("div");
    dlcRight.className = "benny-dlc-right";

    const dlcLink = document.createElement("a");
    dlcLink.className = "benny-dlc-link";
    dlcLink.href = "https://www.paradoxinteractive.com/games/vampire-the-masquerade-bloodlines-2/add-ons/loose-cannon-story-pack";
    dlcLink.target = "_blank";
    dlcLink.rel = "noopener noreferrer";
    dlcLink.textContent = "DLC Link ↗";
    dlcRight.appendChild(dlcLink);

    const dlcCheckboxLabel = document.createElement("label");
    dlcCheckboxLabel.className = "benny-dlc-purchase" + (bennyState.looseCannon ? " active" : "");
    const dlcCheckbox = document.createElement("input");
    dlcCheckbox.type = "checkbox";
    dlcCheckbox.id = "toggle-loose-cannon";
    dlcCheckbox.checked = bennyState.looseCannon || false;
    dlcCheckbox.addEventListener("change", () => {
      bennyState.looseCannon = dlcCheckbox.checked;
      dlcCheckboxLabel.classList.toggle("active", dlcCheckbox.checked);
      if (!dlcCheckbox.checked && outfitState.focusedOutfit?.clanId === "benny") {
        outfitState.focusedOutfit = null;
      }
      persistState();
      renderOutfitGrid();
      renderOutfitDetail();
    });
    dlcCheckboxLabel.appendChild(dlcCheckbox);
    dlcCheckboxLabel.appendChild(document.createTextNode("Purchase DLC"));
    dlcRight.appendChild(dlcCheckboxLabel);

    dlcContent.appendChild(dlcRight);
    dlcSection.appendChild(dlcContent);
  }
  if (dlcToggleBtn) {
    dlcToggleBtn.textContent = bennyState.dlcInfoOpen ? "▲ Hide Loose Cannon" : "▼ Loose Cannon";
    dlcToggleBtn.onclick = () => {
      bennyState.dlcInfoOpen = !bennyState.dlcInfoOpen;
      renderBennyTree();
    };
  }

  tree.innerHTML = "";

  // One grid row per tier in core order
  BENNY_CORE_ORDER.forEach(tier => {
    // Tier label
    const label = document.createElement("div");
    label.className = "tier-label";
    label.textContent = TIERS[tier] ? TIERS[tier].label : tier;
    tree.appendChild(label);

    // Side cell (or empty placeholder)
    const sideAbility = getBennySideAbility(tier);
    if (sideAbility) {
      const isFocused = bennyState.focused && bennyState.focused.column === "side" && bennyState.focused.tier === tier;
      tree.appendChild(makeBennyCell(sideAbility, isFocused, () => {
        const same = bennyState.focused && bennyState.focused.column === "side" && bennyState.focused.tier === tier;
        bennyState.focused = same ? null : { column: "side", tier };
        bennyState.pistolFocused = false;
        document.getElementById("benny-pistol-img")?.classList.remove("benny-pistol--focused");
        renderBennyTree();
      }, tier));
    } else {
      tree.appendChild(document.createElement("div"));
    }

    // Core cell
    const coreAbility = getBennyCoreAbility(tier);
    if (coreAbility) {
      const isFocused = bennyState.focused && bennyState.focused.column === "core" && bennyState.focused.tier === tier;
      const coreFallback = tier === "perk" ? CLANS.brujah.logo : null;
      tree.appendChild(makeBennyCell(coreAbility, isFocused, () => {
        const same = bennyState.focused && bennyState.focused.column === "core" && bennyState.focused.tier === tier;
        bennyState.focused = same ? null : { column: "core", tier };
        bennyState.pistolFocused = false;
        document.getElementById("benny-pistol-img")?.classList.remove("benny-pistol--focused");
        renderBennyTree();
      }, tier, coreFallback));
    } else {
      tree.appendChild(document.createElement("div"));
    }
  });

  renderBennyDetail(detail);
}

function renderBennyDetail(panel) {
  if (bennyState.pistolFocused) {
    panel.innerHTML = `
      <div class="detail-panel__tier">Signature Weapon</div>
      <div class="detail-panel__name">Benny's Pistol</div>
      <div class="detail-panel__video">
        <img src="assets/screenshot/bennyGun.png" alt="Benny's Pistol" style="width:100%; border-radius:4px; cursor:pointer;">
      </div>
      <div class="detail-panel__desc">Benny's sidearm is his prized possession. A custom made 9mm pistol that has been heavily modified to be fully automatic, with a high-capacity magazine and compensator. Impractical for a mortal due to the extreme recoil, but not a problem for a Brujah vampire.</div>
    `;
    panel.querySelector(".detail-panel__video img").addEventListener("click", () => openImageLightbox("assets/screenshot/bennyGun.png", "Benny's Pistol"));
    return;
  }
  if (!bennyState.focused) {
    panel.innerHTML = '<div class="empty-state">Select an ability to view details</div>';
    return;
  }

  const { column, tier } = bennyState.focused;
  const ability = column === "core" ? getBennyCoreAbility(tier) : getBennySideAbility(tier);
  if (!ability) {
    panel.innerHTML = '<div class="empty-state">Select an ability to view details</div>';
    return;
  }

  const clanId = column === "core" ? "brujah" : BENNY_SIDE_SOURCE[tier].clanId;
  const fallbackIcon = CLANS[clanId] ? CLANS[clanId].logo : null;
  const displayIcon = ability.icon || fallbackIcon;

  const tierLabel = TIERS[tier] ? TIERS[tier].label : tier;
  let html = "";

  if (ability.video) {
    html += `<div class="detail-panel__video">`;
    html += `<video src="${ability.video}" autoplay loop muted data-video-src="${ability.video}"></video>`;
    html += `<div class="detail-panel__video-expand" title="Click to enlarge">&#x26F6;</div>`;
    html += `</div>`;
  }

  html += `<div class="detail-panel__tier">${tierLabel}</div>`;

  if (displayIcon) {
    html += `<div class="detail-panel__name-row">`;
    html += `<img class="detail-panel__ability-icon" src="${displayIcon}" alt="${ability.name}">`;
    html += `<div class="detail-panel__name">${ability.name}</div>`;
    html += `</div>`;
  } else {
    html += `<div class="detail-panel__name">${ability.name}</div>`;
  }

  if (ability.description) {
    html += `<div class="detail-panel__desc">${ability.description}</div>`;
  }

  if (ability.discipline) {
    const disc = DISCIPLINES[ability.discipline];
    html += `<div class="detail-panel__discipline">`;
    html += `<img src="${disc.icon}" alt="${disc.name}">`;
    html += `<span>${disc.name}</span>`;
    html += `</div>`;
  }

  if (ability.bloodPips > 0) {
    html += `<div style="display:flex; gap:3px; margin-top:8px;">`;
    for (let i = 0; i < ability.bloodPips; i++) {
      html += `<div class="blood-pip filled" style="width:14px; height:6px;"></div>`;
    }
    html += `</div>`;
  }

  panel.innerHTML = html;

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

document.addEventListener("DOMContentLoaded", initBenny);
