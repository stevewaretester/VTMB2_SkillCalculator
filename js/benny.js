// Benny Skill Tree
// Two-column unlocked display: core Brujah column + Benny side column.

const bennyState = { focused: null, sidebarFocused: null, looseCannon: false, dlcInfoOpen: false };

const BENNY_SIDEBAR_ITEMS = [
  {
    id: "sidearm",
    icon: "assets/T_UI_BennyPistol.png",
    iconClass: "benny-sidebar-item__pistol-icon",
    title: "Benny's Sidearm",
    tier: "Signature Weapon",
    subtitle: "Replaces Phyre's Telekinesis",
    image: "assets/screenshot/bennyGun.png",
    desc: "Benny's sidearm is his prized possession. A custom made 9mm pistol that has been heavily modified to be fully automatic, with a high-capacity magazine and compensator. Impractical for a mortal due to the extreme recoil, but not a problem for a Brujah vampire."
  },
  {
    id: "melee",
    title: "Melee Weapons",
    tier: "Combat",
    image: "assets/screenshot/bennyMelee.png",
    desc: "Interact with weapons you find to pick them up. Different weapons offer different attack styles, from slow but devastating swings with a warhammer, to quick stabs with a knife."
  },
  {
    id: "leap",
    title: "Soaring Leap",
    tier: "Traversal",
    image: "assets/screenshot/BennySoar.png",
    subtitle: "Replaces Phyre's Glide",
    desc: "Benny's approach to rooftop traversal is more forceful, using Soaring Leap to jump great heights, and Air Dash to quickly cover large distances in the air."
  },
  {
    id: "outfit",
    icon: UI.outfitNotifIcon,
    iconClass: "benny-sidebar-item__pistol-icon",
    title: "Outfit for Phyre",
  }
];

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
  renderBennySidebarItems();
}

function renderBennySidebarItems() {
  const container = document.getElementById("benny-sidebar-items");
  if (!container) return;
  container.innerHTML = "";

  const heading = document.createElement("div");
  heading.className = "benny-sidebar-items__heading";
  heading.innerHTML = `New Features<img class="benny-sidebar-items__heading-icon" src="assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_BennyLogo.png" alt="Loose Cannon DLC">`;
  container.appendChild(heading);

  BENNY_SIDEBAR_ITEMS.forEach(item => {
    const el = document.createElement("div");
    el.className = "benny-sidebar-item" + (bennyState.sidebarFocused === item.id ? " focused" : "");
    el.dataset.itemId = item.id;

    const titleEl = document.createElement("span");
    titleEl.className = "benny-sidebar-item__title";
    titleEl.textContent = item.title;
    el.appendChild(titleEl);

    if (item.icon) {
      const icon = document.createElement("img");
      icon.className = "benny-sidebar-item__icon" + (item.iconClass ? " " + item.iconClass : "");
      icon.src = item.icon;
      icon.alt = item.title;
      el.appendChild(icon);
    }

    el.addEventListener("click", () => {
      const same = bennyState.sidebarFocused === item.id;
      bennyState.sidebarFocused = same ? null : item.id;
      bennyState.focused = null;
      renderBennySidebarItems();
      const detail = document.getElementById("benny-detail");
      if (detail) renderBennyDetail(detail);
      if (document.body.classList.contains('is-mobile')) {
        if (bennyState.sidebarFocused) {
          const sheetBody = document.getElementById('mobile-sheet-body');
          if (sheetBody) renderBennyDetail(sheetBody);
          if (typeof showMobileDetailHintRaw === 'function') {
            showMobileDetailHintRaw(item.title, item.icon || '');
          }
        } else if (typeof hideMobileDetailHint === 'function') {
          hideMobileDetailHint();
        }
      }
    });

    container.appendChild(el);
  });
}

function refreshBennyPage() {
  renderBennyTree();
}

function navigateToBennyDLC() {
  // Switch to Benny tab via click so mobile chrome (title, drawer, subtabs) syncs
  const bennyTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="benny"]');
  if (bennyTab) {
    bennyTab.click();
  } else {
    document.querySelectorAll(".tab-bar--primary .tab-bar__tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll("#app > .page").forEach(p => p.classList.add("hidden"));
    document.getElementById("page-benny").classList.remove("hidden");
  }

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
  const lozenges = typeof buildAbilityTooltipLozengesHtml === 'function' ? buildAbilityTooltipLozengesHtml(ability) : '';
  const tooltipHtml = `<div class="tooltip__tier">${tierLabel}</div><div class="tooltip__name">${ability.name}</div>${lozenges}`;
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
        bennyState.sidebarFocused = null;
        renderBennySidebarItems();
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
        bennyState.sidebarFocused = null;
        renderBennySidebarItems();
        renderBennyTree();
      }, tier, coreFallback));
    } else {
      tree.appendChild(document.createElement("div"));
    }
  });

  renderBennyDetail(detail);

  // Mobile: pre-render detail into the sheet body and show the hint pill.
  // Tapping the pill opens the sheet — avoids the sheet auto-popping on
  // every quick tap through the tree.
  if (document.body.classList.contains('is-mobile')) {
    if (bennyState.focused || bennyState.sidebarFocused) {
    const sheetBody = document.getElementById('mobile-sheet-body');
    if (sheetBody) {
      renderBennyDetail(sheetBody);
      let _title = '';
      let _icon  = '';
      if (bennyState.sidebarFocused) {
        const _si = BENNY_SIDEBAR_ITEMS && BENNY_SIDEBAR_ITEMS.find(i => i.id === bennyState.sidebarFocused);
        if (_si) {
          _title = _si.title || '';
          _icon  = _si.icon || '';
        }
      } else if (bennyState.focused) {
        const ab = bennyState.focused.column === 'side'
          ? getBennySideAbility(bennyState.focused.tier)
          : getBennyCoreAbility(bennyState.focused.tier);
        if (ab) {
          _title = ab.name || '';
          _icon  = ab.icon || '';
        }
      }
      if (typeof showMobileDetailHintRaw === 'function') {
        showMobileDetailHintRaw(_title, _icon);
      }
    }
    } else if (typeof hideMobileDetailHint === 'function') {
      hideMobileDetailHint();
    }
  }
}

function renderBennyDetail(panel) {
  if (bennyState.sidebarFocused) {
    const item = BENNY_SIDEBAR_ITEMS.find(i => i.id === bennyState.sidebarFocused);
    if (item) {
      if (item.id === 'outfit') {
        const isUnlocked = bennyState.looseCannon;
        const thumbSrc = isUnlocked ? BENNY_OUTFIT.fullImg : BENNY_OUTFIT.thumb;
        let html = `<div class="detail-panel__tier">Outfit for Phyre</div>`;
        html += `<div class="detail-panel__name-row"><img class="detail-panel__ability-icon" src="${item.icon}" alt="Outfit"><div class="detail-panel__name">${item.title}</div></div>`;
        html += `<div class="detail-panel__video"><img src="${thumbSrc}" alt="${BENNY_OUTFIT.name}" style="width:100%; border-radius:4px; cursor:${isUnlocked ? 'pointer' : 'default'};"></div>`;
        html += `<div class="detail-panel__desc"><button class="outfit-detail__skilltree-btn" id="benny-sidebar-outfit-link"><img src="${UI.outfitNotifIcon}" alt="">${BENNY_OUTFIT.name}</button></div>`;
        // DLC purchase lozenge
        html += `<div class="benny-dlc-purchase-wrap"><label class="benny-dlc-purchase${isUnlocked ? ' active' : ''}" id="benny-sidebar-dlc-label"><input type="checkbox" id="benny-sidebar-dlc-toggle"${isUnlocked ? ' checked' : ''}>Purchase DLC</label></div>`;
        panel.innerHTML = html;
        if (isUnlocked) {
          panel.querySelector('.detail-panel__video img').addEventListener('click', () => openImageLightbox(BENNY_OUTFIT.fullImg, BENNY_OUTFIT.name));
        }
        panel.querySelector('#benny-sidebar-outfit-link').addEventListener('click', () => {
          if (typeof navigateToOutfit === 'function') navigateToOutfit('benny', 0);
        });
        const toggle = panel.querySelector('#benny-sidebar-dlc-toggle');
        const lbl = panel.querySelector('#benny-sidebar-dlc-label');
        toggle.addEventListener('change', () => {
          bennyState.looseCannon = toggle.checked;
          lbl.classList.toggle('active', toggle.checked);
          if (!toggle.checked && outfitState.focusedOutfit?.clanId === 'benny') outfitState.focusedOutfit = null;
          persistState();
          renderOutfitGrid();
          renderOutfitDetail();
          renderBennySidebarItems();
        });
        return;
      }
      let html = `<div class="detail-panel__tier">${item.tier}</div>`;
      if (item.image) {
        html += `<div class="detail-panel__video"><img src="${item.image}" alt="${item.title}" style="width:100%; border-radius:4px; cursor:pointer;"></div>`;
      }
      if (item.icon) {
        html += `<div class="detail-panel__name-row"><img class="detail-panel__ability-icon" src="${item.icon}" alt="${item.title}"><div class="detail-panel__name">${item.title}</div></div>`;
      } else {
        html += `<div class="detail-panel__name">${item.title}</div>`;
      }
      if (item.subtitle) {
        html += `<div class="detail-panel__subtitle">${item.subtitle}</div>`;
      }
      html += `<div class="detail-panel__desc">${item.desc}</div>`;
      panel.innerHTML = html;
      if (item.image) {
        panel.querySelector(".detail-panel__video img").addEventListener("click", () => openImageLightbox(item.image, item.title));
      }
      return;
    }
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

  // Duration + Tags lozenges (below blood pips / AP)
  if (typeof buildAbilityLozengesHtml === 'function') html += buildAbilityLozengesHtml(ability);

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
