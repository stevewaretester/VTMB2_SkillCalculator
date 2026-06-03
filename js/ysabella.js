// Ysabella Skill Tree
// Benny-style display: Toreador middle column + Ysabella side column.

const ysabellaState = { focused: null, sidebarFocused: null, flowerAndFlame: false, dlcInfoOpen: false };

const YSABELLA_LOGO = "assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_YsabellaLogo.png";
const YSABELLA_RAZOR_WIRE_ICON = "assets/T_UI_Ysabella_RazorWire.png";
const YSABELLA_RAZOR_WIRE_PREVIEW = "assets/T_UI_Ysabella_RazorWirePreview.png";
const YSABELLA_ROSE_RAPIER_PREVIEW = "assets/T_UI_Ysabella_RoseRapierPreview.png";
const YSABELLA_RANGED_WEAPONS_PREVIEW = "assets/T_UI_Ysabella_RangedWeaponsPreview.png";
const YSABELLA_DLC_TILE = "assets/T_UI_DLC_FrontEnd_Icon_FlowerAndFlame.png";
const YSABELLA_DLC_URL = "https://www.paradoxinteractive.com/games/vampire-the-masquerade-bloodlines-2/add-ons/the-flower-and-the-flame-story-pack";

const YSABELLA_SIDEBAR_ITEMS = [
  {
    id: "razor-wire",
    icon: YSABELLA_RAZOR_WIRE_ICON,
    iconClass: "benny-sidebar-item__pistol-icon",
    title: "Razor Wire",
    tier: "Signature Tool",
    subtitle: "Replaces Phyre's Telekinesis",
    image: YSABELLA_RAZOR_WIRE_PREVIEW,
    desc: "Razor Wire launches a length of barbed wire at an enemy or object. When used against an enemy, it lassos them, holding them in place, giving you more control over the pace of battle. Using Razor Wire again will pull the enemy towards you, leaving them vulnerable to an attack. When used on objects (e.g. weapons or elixirs), it pulls them towards you, allowing you to either catch them out of the air or attack them to launch them towards an enemy."
  },
  {
    id: "ranged-weapons",
    title: "Ranged Weapons",
    tier: "Combat",
    image: YSABELLA_RANGED_WEAPONS_PREVIEW,
    desc: "Ysabella can pick up and equip all weapons, from sniper rifles to swords. If you pick up two of the same gun, then she will dual-wield them, allowing you to play out your gothic-action fantasies (anyone else thinking of Selene or Trinity?).",
    link: { label: "Weapon pickups ->", action: "weapons" }
  },
  {
    id: "rose-rapier",
    icon: "assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_ClanLogo_Toreador.png",
    iconClass: "benny-sidebar-item__pistol-icon",
    title: "Rose Rapier",
    tier: "Default Attacks",
    image: YSABELLA_ROSE_RAPIER_PREVIEW,
    desc: "Instead of unarmed default attacks, like Benny & Phyre, Ysabella's default attacks use her custom-made rapier - a work of art in itself - which gives her better reach and a more precise, rhythmic playstyle compared to other weapons. Her heavy attack, for example, is a quick series of slashes which beheads enemies on kill. The beheading also gives a short speed boost, allowing you to chain quickly into your next action."
  },
  {
    id: "outfit",
    icon: UI.outfitNotifIcon,
    iconClass: "benny-sidebar-item__pistol-icon",
    title: "Outfit for Phyre"
  }
];

const YSABELLA_CORE_ORDER = ["perk", "mastery", "affect", "relocate", "strike", "passive"];

const YSABELLA_SIDE_SOURCE = {
  mastery:  { clanId: "ventrue", tier: "mastery" },  // Mass Manipulation
  affect:   { clanId: "ventrue", tier: "affect" },   // Cloud Memory
  relocate: { clanId: "ventrue", tier: "relocate" }, // Possession
  strike:   { clanId: "brujah",  tier: "strike" },   // Lightning Strike
};

function initYsabella() {
  renderYsabellaTree();
  renderYsabellaSidebarItems();
}

function refreshYsabellaPage() {
  renderYsabellaTree();
  renderYsabellaSidebarItems();
}

function navigateToYsabellaDLC() {
  const ysabellaTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="ysabelle"]');
  if (ysabellaTab) {
    ysabellaTab.click();
  } else {
    document.querySelectorAll(".tab-bar--primary .tab-bar__tab").forEach(t => t.classList.remove("active"));
    document.querySelectorAll("#app > .page").forEach(p => p.classList.add("hidden"));
    document.getElementById("page-ysabelle")?.classList.remove("hidden");
  }

  ysabellaState.dlcInfoOpen = true;
  renderYsabellaDLC();

  setTimeout(() => {
    const label = document.getElementById("ysabella-dlc-purchase-label");
    if (!label) return;
    let flashes = 0;
    const interval = setInterval(() => {
      label.classList.toggle("benny-dlc-purchase--flash");
      if (++flashes >= 6) {
        clearInterval(interval);
        label.classList.remove("benny-dlc-purchase--flash");
      }
    }, 200);
  }, 450);
}

function renderYsabellaDLC() {
  const dlcSection = document.getElementById("ysabella-dlc-section");
  const dlcToggleBtn = document.getElementById("ysabella-dlc-toggle");

  if (dlcSection) {
    dlcSection.innerHTML = "";
    dlcSection.classList.toggle("collapsed", !ysabellaState.dlcInfoOpen);

    const dlcContent = document.createElement("div");
    dlcContent.className = "benny-dlc-content ysabella-dlc-content";

    const dlcTileWrap = document.createElement("a");
    dlcTileWrap.className = "benny-dlc-tile-wrap ysabella-dlc-tile-wrap";
    dlcTileWrap.href = YSABELLA_DLC_URL;
    dlcTileWrap.target = "_blank";
    dlcTileWrap.rel = "noopener noreferrer";
    dlcTileWrap.setAttribute("aria-label", "Open The Flower and the Flame story pack page");

    const releaseDate = document.createElement("span");
    releaseDate.className = "benny-dlc-out-now ysabella-dlc-release";
    releaseDate.textContent = "COMING JUNE 10th";

    const dlcImg = document.createElement("img");
    dlcImg.className = "benny-dlc-tile ysabella-dlc-tile";
    dlcImg.src = YSABELLA_DLC_TILE;
    dlcImg.alt = "The Flower and the Flame story pack";
    dlcTileWrap.appendChild(dlcImg);

    dlcContent.appendChild(dlcTileWrap);
    dlcContent.appendChild(releaseDate);

    const dlcRight = document.createElement("div");
    dlcRight.className = "benny-dlc-right ysabella-dlc-right";

    const dlcCheckboxLabel = document.createElement("label");
    dlcCheckboxLabel.className = "benny-dlc-purchase" + (ysabellaState.flowerAndFlame ? " active" : "");
    dlcCheckboxLabel.id = "ysabella-dlc-purchase-label";
    const dlcCheckbox = document.createElement("input");
    dlcCheckbox.type = "checkbox";
    dlcCheckbox.id = "toggle-ysabella-dlc";
    dlcCheckbox.checked = ysabellaState.flowerAndFlame || false;
    dlcCheckbox.addEventListener("change", () => {
      ysabellaState.flowerAndFlame = dlcCheckbox.checked;
      dlcCheckboxLabel.classList.toggle("active", dlcCheckbox.checked);
      if (!dlcCheckbox.checked && typeof outfitState !== "undefined" && outfitState.focusedOutfit?.clanId === "ysabella") {
        outfitState.focusedOutfit = null;
      }
      if (typeof persistState === "function") persistState();
      if (typeof renderOutfitGrid === "function") renderOutfitGrid();
      if (typeof renderOutfitDetail === "function") renderOutfitDetail();
      if (typeof renderReactionsTable === "function") renderReactionsTable();
    });
    dlcCheckboxLabel.appendChild(dlcCheckbox);
    dlcCheckboxLabel.appendChild(document.createTextNode("Purchase DLC"));
    dlcRight.appendChild(dlcCheckboxLabel);

    dlcContent.appendChild(dlcRight);
    dlcSection.appendChild(dlcContent);
  }

  if (dlcToggleBtn) {
    dlcToggleBtn.textContent = ysabellaState.dlcInfoOpen ? "▲ Hide The Flower and the Flame" : "▼ The Flower and the Flame";
    dlcToggleBtn.onclick = () => {
      ysabellaState.dlcInfoOpen = !ysabellaState.dlcInfoOpen;
      renderYsabellaDLC();
    };
  }
}

function getYsabellaCoreAbility(tier) {
  return ABILITIES.toreador[tier];
}

function getYsabellaSideAbility(tier) {
  const src = YSABELLA_SIDE_SOURCE[tier];
  if (!src) return null;
  return ABILITIES[src.clanId][src.tier];
}

function renderYsabellaSidebarItems() {
  const container = document.getElementById("ysabella-sidebar-items");
  if (!container) return;
  container.innerHTML = "";

  const heading = document.createElement("div");
  heading.className = "benny-sidebar-items__heading ysabella-sidebar-items__heading";
  heading.innerHTML = `New Features<img class="benny-sidebar-items__heading-icon" src="${YSABELLA_LOGO}" alt="Ysabella">`;
  container.appendChild(heading);

  YSABELLA_SIDEBAR_ITEMS.forEach(item => {
    const el = document.createElement("div");
    el.className = "benny-sidebar-item" + (ysabellaState.sidebarFocused === item.id ? " focused" : "");
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
      const same = ysabellaState.sidebarFocused === item.id;
      ysabellaState.sidebarFocused = same ? null : item.id;
      ysabellaState.focused = null;
      renderYsabellaSidebarItems();
      const detail = document.getElementById("ysabella-detail");
      if (detail) renderYsabellaDetail(detail);
      if (document.body.classList.contains("is-mobile")) {
        if (ysabellaState.sidebarFocused) {
          const sheetBody = document.getElementById("mobile-sheet-body");
          if (sheetBody) renderYsabellaDetail(sheetBody);
          if (typeof showMobileDetailHintRaw === "function") {
            showMobileDetailHintRaw(item.title, item.icon || YSABELLA_LOGO);
          }
        } else if (typeof hideMobileDetailHint === "function") {
          hideMobileDetailHint();
        }
      }
    });

    container.appendChild(el);
  });
}

function renderYsabellaTree() {
  const tree = document.getElementById("ysabella-tree");
  const detail = document.getElementById("ysabella-detail");
  if (!tree || !detail) return;

  renderYsabellaDLC();

  tree.innerHTML = "";

  YSABELLA_CORE_ORDER.forEach(tier => {
    const label = document.createElement("div");
    label.className = "tier-label";
    label.textContent = TIERS[tier] ? TIERS[tier].label : tier;
    tree.appendChild(label);

    const sideAbility = getYsabellaSideAbility(tier);
    if (sideAbility && typeof makeBennyCell === "function") {
      const isFocused = ysabellaState.focused && ysabellaState.focused.column === "side" && ysabellaState.focused.tier === tier;
      tree.appendChild(makeBennyCell(sideAbility, isFocused, () => {
        const same = ysabellaState.focused && ysabellaState.focused.column === "side" && ysabellaState.focused.tier === tier;
        ysabellaState.focused = same ? null : { column: "side", tier };
        ysabellaState.sidebarFocused = null;
        renderYsabellaSidebarItems();
        renderYsabellaTree();
      }, tier));
    } else {
      tree.appendChild(document.createElement("div"));
    }

    const coreAbility = getYsabellaCoreAbility(tier);
    if (coreAbility && typeof makeBennyCell === "function") {
      const isFocused = ysabellaState.focused && ysabellaState.focused.column === "core" && ysabellaState.focused.tier === tier;
      const coreFallback = tier === "perk" ? CLANS.toreador.logo : null;
      tree.appendChild(makeBennyCell(coreAbility, isFocused, () => {
        const same = ysabellaState.focused && ysabellaState.focused.column === "core" && ysabellaState.focused.tier === tier;
        ysabellaState.focused = same ? null : { column: "core", tier };
        ysabellaState.sidebarFocused = null;
        renderYsabellaSidebarItems();
        renderYsabellaTree();
      }, tier, coreFallback));
    } else {
      tree.appendChild(document.createElement("div"));
    }
  });

  renderYsabellaDetail(detail);

  if (document.body.classList.contains("is-mobile")) {
    if (ysabellaState.focused || ysabellaState.sidebarFocused) {
      const sheetBody = document.getElementById("mobile-sheet-body");
      if (sheetBody) {
        renderYsabellaDetail(sheetBody);
        let title = "";
        let icon = "";
        if (ysabellaState.sidebarFocused) {
          const item = YSABELLA_SIDEBAR_ITEMS.find(i => i.id === ysabellaState.sidebarFocused);
          if (item) {
            title = item.title || "";
            icon = item.icon || YSABELLA_LOGO;
          }
        } else if (ysabellaState.focused) {
          const ability = ysabellaState.focused.column === "side"
            ? getYsabellaSideAbility(ysabellaState.focused.tier)
            : getYsabellaCoreAbility(ysabellaState.focused.tier);
          if (ability) {
            title = ability.name || "";
            icon = ability.icon || "";
          }
        }
        if (typeof showMobileDetailHintRaw === "function") {
          showMobileDetailHintRaw(title, icon);
        }
      }
    } else if (typeof hideMobileDetailHint === "function") {
      hideMobileDetailHint();
    }
  }
}

function renderYsabellaDetail(panel) {
  if (ysabellaState.sidebarFocused) {
    const item = YSABELLA_SIDEBAR_ITEMS.find(i => i.id === ysabellaState.sidebarFocused);
    if (!item) return;

    if (item.id === "outfit") {
      const isUnlocked = ysabellaState.flowerAndFlame;
      let html = `<div class="detail-panel__tier">Outfit for Phyre</div>`;
      html += `<div class="detail-panel__name-row"><img class="detail-panel__ability-icon" src="${item.icon}" alt="Outfit"><div class="detail-panel__name">${item.title}</div></div>`;
      if (isUnlocked && YSABELLA_OUTFIT.fullImg) {
        html += `<div class="detail-panel__video"><img src="${YSABELLA_OUTFIT.fullImg}" alt="${YSABELLA_OUTFIT.name}" style="width:100%; border-radius:4px; cursor:pointer;"></div>`;
      } else {
        html += `<div class="detail-panel__video"><div class="outfit-detail__thumb-locked"><img src="${UI.blockedPadlock}" alt="Locked"></div></div>`;
      }
      html += `<div class="detail-panel__desc"><button class="outfit-detail__skilltree-btn" id="ysabella-sidebar-outfit-link"><img src="${UI.outfitNotifIcon}" alt="">${YSABELLA_OUTFIT.name}</button></div>`;
      html += `<div class="benny-dlc-purchase-wrap"><label class="benny-dlc-purchase${isUnlocked ? ' active' : ''}" id="ysabella-sidebar-dlc-label"><input type="checkbox" id="ysabella-sidebar-dlc-toggle"${isUnlocked ? ' checked' : ''}>Purchase DLC</label></div>`;
      panel.innerHTML = html;

      if (isUnlocked && YSABELLA_OUTFIT.fullImg) {
        panel.querySelector(".detail-panel__video img").addEventListener("click", () => openImageLightbox(YSABELLA_OUTFIT.fullImg, YSABELLA_OUTFIT.name));
      }
      panel.querySelector("#ysabella-sidebar-outfit-link").addEventListener("click", () => {
        if (typeof navigateToOutfit === "function") navigateToOutfit("ysabella", 0);
      });
      const toggle = panel.querySelector("#ysabella-sidebar-dlc-toggle");
      const label = panel.querySelector("#ysabella-sidebar-dlc-label");
      toggle.addEventListener("change", () => {
        ysabellaState.flowerAndFlame = toggle.checked;
        label.classList.toggle("active", toggle.checked);
        if (!toggle.checked && typeof outfitState !== "undefined" && outfitState.focusedOutfit?.clanId === "ysabella") {
          outfitState.focusedOutfit = null;
        }
        if (typeof persistState === "function") persistState();
        if (typeof renderOutfitGrid === "function") renderOutfitGrid();
        if (typeof renderOutfitDetail === "function") renderOutfitDetail();
        if (typeof renderReactionsTable === "function") renderReactionsTable();
        renderYsabellaDLC();
        renderYsabellaSidebarItems();
        renderYsabellaDetail(panel);
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
    if (item.link) {
      html += `<div class="benny-sidebar-detail__link-wrap"><button class="combo-clan-link-btn benny-sidebar-detail__link" data-link-action="${item.link.action}">${item.link.label}</button></div>`;
    }
    panel.innerHTML = html;

    if (item.image) {
      panel.querySelector(".detail-panel__video img").addEventListener("click", () => openImageLightbox(item.image, item.title));
    }
    const linkBtn = panel.querySelector(".benny-sidebar-detail__link");
    if (linkBtn) {
      linkBtn.addEventListener("click", () => navigateYsabellaDetailLink(linkBtn.dataset.linkAction));
    }
    return;
  }

  if (!ysabellaState.focused) {
    panel.innerHTML = '<div class="empty-state">Select an ability to view details</div>';
    return;
  }

  const { column, tier } = ysabellaState.focused;
  const ability = column === "core" ? getYsabellaCoreAbility(tier) : getYsabellaSideAbility(tier);
  if (!ability) {
    panel.innerHTML = '<div class="empty-state">Select an ability to view details</div>';
    return;
  }

  const source = column === "core" ? { clanId: "toreador", tier } : YSABELLA_SIDE_SOURCE[tier];
  const clanId = source.clanId;
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

  if (typeof buildAbilityLozengesHtml === "function") html += buildAbilityLozengesHtml(ability);
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

function navigateYsabellaDetailLink(action) {
  if (action === "weapons") {
    const phyreTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="phyre"]');
    if (phyreTab && !phyreTab.classList.contains("active")) phyreTab.click();
    const pickupsTab = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny):not(.tab-bar--ysabelle) .tab-bar__tab[data-subtab="pickups"]');
    if (pickupsTab) pickupsTab.click();
    if (typeof setActivePickupsSubtab === "function") setActivePickupsSubtab("weapons");
  }
}

document.addEventListener("DOMContentLoaded", initYsabella);
