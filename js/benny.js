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
    desc: "Benny's sidearm is his prized possession. A custom made 9mm pistol that has been heavily modified to be fully automatic, with a high-capacity magazine and compensator. Impractical for a mortal due to the extreme recoil, but not a problem for a Brujah vampire.",
    link: { label: "BennyGun details →", action: "benny-gun" }
  },
  {
    id: "melee",
    title: "Melee Weapons",
    tier: "Combat",
    image: "assets/screenshot/bennyMelee.png",
    desc: "Interact with weapons you find to pick them up. Different weapons offer different attack styles, from slow but devastating swings with a warhammer, to quick stabs with a knife.",
    link: { label: "Melee weapon attack data →", action: "melee-weapons" }
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

    // "OUT NOW" + DLC tile, the whole stack links to the DLC page
    const dlcTileWrap = document.createElement("a");
    dlcTileWrap.className = "benny-dlc-tile-wrap";
    dlcTileWrap.href = "https://www.paradoxinteractive.com/games/vampire-the-masquerade-bloodlines-2/add-ons/loose-cannon-story-pack";
    dlcTileWrap.target = "_blank";
    dlcTileWrap.rel = "noopener noreferrer";
    dlcTileWrap.title = "Open the Loose Cannon DLC store page";

    const outNow = document.createElement("span");
    outNow.className = "benny-dlc-out-now";
    outNow.textContent = "OUT NOW";
    dlcTileWrap.appendChild(outNow);

    const dlcImg = document.createElement("img");
    dlcImg.className = "benny-dlc-tile";
    dlcImg.src = "assets/T_UI_DLC_FrontEnd_Icon_LooseCannon.png";
    dlcImg.alt = "Loose Cannon DLC";
    dlcTileWrap.appendChild(dlcImg);

    dlcContent.appendChild(dlcTileWrap);

    const dlcRight = document.createElement("div");
    dlcRight.className = "benny-dlc-right";

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
      if (item.link) {
        html += `<div class="benny-sidebar-detail__link-wrap"><button class="combo-clan-link-btn benny-sidebar-detail__link" data-link-action="${item.link.action}">${item.link.label}</button></div>`;
      }
      panel.innerHTML = html;
      if (item.image) {
        panel.querySelector(".detail-panel__video img").addEventListener("click", () => openImageLightbox(item.image, item.title));
      }
      const linkBtn = panel.querySelector(".benny-sidebar-detail__link");
      if (linkBtn) {
        linkBtn.addEventListener("click", () => navigateBennyDetailLink(linkBtn.dataset.linkAction));
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

// ── Benny Unarmed Subpage ─────────────────────────────────────
// Asset-confirmed data from build 22727210 (Ref/spring/22727210/benny_combat_22727210.md).
// Light/Heavy chain: Attackset_Benny — same numeric profile as Brujah but routed
// through Benny-specific montages.  Plus unique dash attacks, the BennyGun sidearm,
// and the three DLC specials (Chop, Kick, Sweep).  GodFist and Riser are present
// in exports but not in shipped gameplay, so they are intentionally omitted.

const BENNY_FIST_COMBO = {
  name: "Benny — Fist Combo (Attackset_Benny)",
  steps: 4,
  lightType: "Lunging",
  windupMontage: "AM_ChargedAttack_Br_1 / _2 (0.89s)",
  blockMontage: "AM_Player_Block_brujah",
  rows: [
    { step: 1, lightDmg: 8, lightMontage: "AM_Combat_Brujah_Light1", lightLen: 0.812, lightDelay: 0.20, heavyDmg: 15, heavyMontage: "AM_Combat_Brujah_Heavy1", heavyLen: 0.80, heavyDelay: 0.70 },
    { step: 2, lightDmg: 8, lightMontage: "AM_Combat_Brujah_Light2", lightLen: 1.107, lightDelay: 0.14, heavyDmg: 15, heavyMontage: "AM_Combat_Brujah_Heavy2", heavyLen: 0.80, heavyDelay: 0.70 },
    { step: 3, lightDmg: 8, lightMontage: "AM_Combat_Brujah_Light3", lightLen: 1.107, lightDelay: 0.26, heavyDmg: 15, heavyMontage: "AM_Combat_Brujah_Heavy1", heavyLen: 0.80, heavyDelay: 0.70 },
    { step: 4, lightDmg: 8, lightMontage: "AM_Combat_Brujah_Light4", lightLen: 2.290, lightDelay: 0.70, heavyDmg: 15, heavyMontage: "AM_Combat_Brujah_Heavy2", heavyLen: 0.80, heavyDelay: 0.70, finisher: true },
  ],
  notes: [
    "Numerically identical to the Brujah clan chain — all lights deal 8, all heavies deal 15.",
    "Reuses Brujah light/heavy montages from <code>WrestlerCommon/Abilities/Player/Melee/Anims/Brujah/</code>.",
    "<strong>No directional variants</strong> — unlike weapon attacksets, Benny's fists have no forward/backward overrides.",
    "All light slots tagged <code>Combat.Ability.Melee.Light.Lunging</code>; heavies tagged <code>Combat.Ability.Melee.Heavy</code>.",
    "Step 4 has the longest combo delay (0.70s) — finisher pause before the chain resets.",
  ],
};

// Benny does NOT have the GA_PlayerDashAttack_* family — those four directional dashes
// are entirely replaced by his DLC special-attack moves (Chop / Kick / Sweep) below.

const BENNY_DLC_SPECIALS = [
  { name: "Chop",  direction: "Forward",  ga: "GA_BennyAttack_chop", montage: "AM_Benny_Chop",                           len: 1.667, damage: 5, comboDelay: 0.7, traceRange: 180, effect: "Spikes target downward — grounds standing enemies for follow-ups." },
  { name: "Kick",  direction: "Back",     ga: "GA_BennyAttack_Kick", montage: "AM_Benny_Kick",                           len: 1.667, damage: 7, comboDelay: 0.8, traceRange: 270, effect: "Launches target with heavy knockback — sends enemies flying for spacing." },
  { name: "Sweep", direction: "Side",     ga: "GA_Benny_Sweep",      montage: "AM_Benny_Sweep_Left / AM_Benny_Sweep_Right", len: 1.667, damage: 7, comboDelay: 0.8, traceRange: 240, effect: "Wide horizontal arc — hits everything around Benny." },
];

// BennyGun — sidearm. Two ammo modes: regular and incendiary.
// Source: Plugins/WrestlerDLC/DLC_Benny/.../GA_BennyGun.json + AM_BennyGun*.json
const BENNY_GUN_TUNING = [
  { prop: "Fire Rate (interval)", val: "0.06s",    note: "Theoretical cap ≈ 16.67 shots/sec" },
  { prop: "Max Spread",           val: "3.0",      note: "" },
  { prop: "Phosphor / Bullet",    val: "4",        note: "Resource cost per shot" },
  { prop: "Default Ammo",         val: "15",       note: "From PI_BennyAmmoCounter" },
  { prop: "Max Clip",             val: "30",       note: "Hard cap on carried ammo" },
  { prop: "Ability Tag",          val: "Combat.Ability.Skill.Weapon.BennyGun", note: "" },
  { prop: "Hit Damage (per shot)", val: "—",       note: "Not exposed as a CDO scalar; resolved via projectile graph at runtime" },
];

const BENNY_GUN_AMMO_MODES = [
  { mode: "Regular",     desc: "Standard kinetic round — single-target damage, fast follow-up.", behavior: "Hit, knockback, no DOT.",                                            unlock: "Default" },
  { mode: "Incendiary",  desc: "Phosphor-loaded burner — applies a burning damage-over-time on hit.", behavior: "Hit + ignites target (codex-confirmed burn DOT).",               unlock: "Alt-fire / ammo swap" },
];

const BENNY_GUN_MONTAGES = [
  { montage: "AM_BennyGunFire",          len: 0.833 },
  { montage: "AM_BennyGunFireLast",      len: 1.333 },
  { montage: "AM_bennyGun_Reload",       len: 1.000 },
  { montage: "AM_BennyGunDeploy",        len: 0.500 },
  { montage: "AM_BennyGunDeployfast",    len: 0.400 },
  { montage: "AM_BennyGunDeploySpin",    len: 0.560 },
  { montage: "AM_BennyGunDeployEmpty",   len: 0.750 },
  { montage: "AM_BennyGunPutaway",       len: 0.567 },
  { montage: "AM_BennyGunPutawayEmpty",  len: 0.500 },
];

// Routes the sidebar detail-panel link buttons to the right combat subpage.
//   "melee-weapons" → Phyre primary tab → Combat → Melee weapons subtab
//   "benny-gun"     → Benny primary tab → Combat subtab → scroll to gun section
function navigateBennyDetailLink(action) {
  if (action === "melee-weapons") {
    if (typeof navigateToMeleeWeapons === "function") navigateToMeleeWeapons();
    return;
  }
  if (action === "benny-gun") {
    const bennyTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="benny"]');
    if (bennyTab && !bennyTab.classList.contains("active")) bennyTab.click();
    const combatTab = document.querySelector('.tab-bar--benny .tab-bar__tab[data-bennytab="unarmed"]');
    if (combatTab) combatTab.click();
    // Wait a tick for the page to render before scrolling.
    setTimeout(() => {
      const target = document.getElementById("benny-gun-section");
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }
}

function renderBennyUnarmedPage() {
  const container = document.getElementById("benny-subpage-unarmed");
  if (!container) return;

  const clan = (typeof CLANS !== "undefined") ? CLANS.brujah : null;
  const fc = BENNY_FIST_COMBO;

  let h = `<div class="combos-layout">`;

  // Header
  h += `<div class="clan-combos-header">`;
  h += `<h2 class="combos-header__title">Benny — Combat &amp; Sidearm</h2>`;
  h += `<p class="combos-header__sub">Asset-confirmed combat data from <code>Attackset_Benny</code>, <code>GA_PlayerDashAttack_*</code>, the Benny DLC specials, and the <code>BennyGun</code> sidearm (build 22727210).</p>`;
  h += `<ul class="combos-header__primer">
    <li><strong class="combos-header__primer-label combos-header__primer-label--light">Fist combo:</strong> Numerically a Brujah chain — same damage, same step structure, swapped to Benny-routed montages.</li>
    <li><strong class="combos-header__primer-label">Dash &amp; specials:</strong> Drop Kick is shared with Phyre; her four directional dashes are replaced by the DLC specials Chop / Kick / Sweep.</li>
    <li><strong class="combos-header__primer-label combos-header__primer-label--heavy">Sidearm:</strong> Two ammo modes — regular and incendiary (DOT).</li>
  </ul>`;
  h += `<p style="margin: 8px 0 0 0;">
    <button class="combo-clan-link-btn" id="benny-unarmed-melee-link">Melee Weapons →</button>
  </p>`;
  h += `</div>`;

  // ── Fist Combo (Attackset_Benny) ──
  h += `<div class="clan-combos-tables">`;
  h += `<div class="clan-combo-block" id="benny-fist-combo">`;
  h += `<div class="clan-combo-block__heading">`;
  if (clan && clan.logo) h += `<img class="clan-combo-block__logo" src="${clan.logo}" alt="">`;
  h += `<span class="clan-combo-block__name">Fist Combo</span>`;
  h += `<span class="clan-combo-block__meta">${fc.steps} steps &middot; ${fc.lightType} lights &middot; <code class="crossclan-code">Attackset_Benny</code></span>`;
  h += `</div>`;
  h += `<table class="combos-table clan-combos-table"><thead><tr>
    <th class="combos-table__th clan-combos-table__th--step">Step</th>
    <th class="combos-table__th clan-combos-table__th--ldmg">L.Dmg</th>
    <th class="combos-table__th">Light Montage</th>
    <th class="combos-table__th clan-combos-table__th--llen">L.Len</th>
    <th class="combos-table__th clan-combos-table__th--delay" title="Light combo delay">L.Delay</th>
    <th class="combos-table__th clan-combos-table__th--hdmg">H.Dmg</th>
    <th class="combos-table__th">Heavy Montage</th>
    <th class="combos-table__th clan-combos-table__th--hlen">H.Len</th>
    <th class="combos-table__th clan-combos-table__th--delay" title="Heavy combo delay">H.Delay</th>
  </tr></thead><tbody>`;
  for (const r of fc.rows) {
    h += `<tr class="clan-combos-table__row${r.finisher ? " clan-combos-table__row--finisher" : ""}">`;
    h += `<td class="combos-table__td clan-combos-table__td--step">${r.step}${r.finisher ? `<span class="clan-combo-star" title="Finisher">★</span>` : ""}</td>`;
    h += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="ldmg">${r.lightDmg}</td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${r.lightMontage}</code></td>`;
    h += `<td class="combos-table__td clan-combos-table__td--len">${r.lightLen.toFixed(2)}s</td>`;
    h += `<td class="combos-table__td clan-combos-table__td--delay">${r.lightDelay.toFixed(2)}s</td>`;
    h += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="hdmg">${r.heavyDmg}</td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${r.heavyMontage}</code></td>`;
    h += `<td class="combos-table__td clan-combos-table__td--len">${r.heavyLen.toFixed(2)}s</td>`;
    h += `<td class="combos-table__td clan-combos-table__td--delay">${r.heavyDelay.toFixed(2)}s</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `<ul class="clan-combo-block__notes">`;
  for (const n of fc.notes) h += `<li>${n}</li>`;
  h += `<li>Windup: <code class="crossclan-code">${fc.windupMontage}</code> &middot; Block: <code class="crossclan-code">${fc.blockMontage}</code></li>`;
  h += `</ul>`;
  h += `</div>`; // clan-combo-block
  h += `</div>`; // clan-combos-tables

  // ── Dash Attacks (Drop Kick only — shared with Phyre) ──
  // Benny's directional dash strikes (GA_PlayerDashAttack_*) are replaced by
  // the DLC specials below, but the airborne Drop Kick still routes through
  // the shared GA_PlayerAttack_DropKick — same montage, same velocity-scaled
  // damage formula as Phyre.
  h += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad" id="benny-dash-section">`;
  h += `<div class="crossclan-section-heading">`;
  h += `<span>Dash Attacks</span>`;
  h += `<span class="crossclan-section-heading__sub">Drop Kick only — directional dashes are replaced by DLC specials</span>`;
  h += `</div>`;
  h += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Drop Kick (shared with Phyre)</summary><div class="crossclan-lozenge__body">`;
  h += `<p class="crossclan-note--sub">Triggered with <strong>airborne + attack</strong>. Same ability as Phyre's drop kick — Benny inherits it unchanged.</p>`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th">Move</th>
    <th class="combos-table__th">GA</th>
    <th class="combos-table__th">Montage</th>
    <th class="combos-table__th">Len</th>
    <th class="combos-table__th">Damage</th>
    <th class="combos-table__th">Trace</th>
    <th class="combos-table__th">Lunge</th>
    <th class="combos-table__th">Cooldown</th>
  </tr></thead><tbody>`;
  h += `<tr class="combos-table__tr">`;
  h += `<td class="combos-table__td">Drop Kick</td>`;
  h += `<td class="combos-table__td"><code class="crossclan-code">GA_PlayerAttack_DropKick</code></td>`;
  h += `<td class="combos-table__td"><code class="crossclan-code">AM_Player_Combat_DropKick</code></td>`;
  h += `<td class="combos-table__td">1.50s</td>`;
  h += `<td class="combos-table__td clan-combos-table__td--dmg clan-combo__dmg--peak" data-cell="hdmg">15&ndash;70</td>`;
  h += `<td class="combos-table__td">200 / r35</td>`;
  h += `<td class="combos-table__td">300 / 400</td>`;
  h += `<td class="combos-table__td">6.0s*</td>`;
  h += `</tr>`;
  h += `</tbody></table>`;
  h += `<ul class="crossclan-list crossclan-list--notes">
    <li><strong>Velocity-scaled damage:</strong> 15 at minimum, up to <strong>70</strong> at terminal velocity (formula: 15 + velocity-factor &times; 55). The faster Benny is falling on impact, the harder the hit.</li>
    <li><strong>Cooldown asterisk:</strong> <code class="crossclan-code">GE_DropKickCooldown</code> grants <code class="crossclan-code">Combat.Ability.Cooldown.Dropkick</code> — but it expires the moment Benny lands. The 6s is a max-cap (if you never land); in practice it can be re-triggered as fast as you can jump again.</li>
    <li><strong>Block-breaking:</strong> drop kick bypasses guard and pins enemies downward (knockback V: &minus;200), causing a Stumble reaction.</li>
    <li><strong>Other dash directions</strong> (Forward/Back/Left/Right) are <em>not</em> available to Benny — Phyre's <code class="crossclan-code">GA_PlayerDashAttack_*</code> family is replaced by the DLC specials in the next section.</li>
  </ul>`;
  h += `</div></details>`;
  h += `</div>`; // dash section

  // ── DLC Special Attacks ──
  h += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad" id="benny-specials-section">`;
  h += `<div class="crossclan-section-heading">`;
  h += `<img class="crossclan-section-heading__icon" src="assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_BennyLogo.png" alt="Loose Cannon DLC">`;
  h += `<span>DLC Special Attacks</span>`;
  h += `<span class="crossclan-section-heading__sub">From <code>Plugins/WrestlerDLC/DLC_Benny/.../Combat/</code></span>`;
  h += `</div>`;
  h += `<details class="crossclan-lozenge" open><summary class="crossclan-lozenge__summary">Chop / Kick / Sweep — directional dash replacements</summary><div class="crossclan-lozenge__body">`;
  h += `<p class="crossclan-note--sub">These three moves <strong>replace</strong> the directional dash attacks Phyre uses. Forward dash triggers <strong>Chop</strong> (downward spike), back dash triggers <strong>Kick</strong> (launches enemies), side dash triggers <strong>Sweep</strong> (wide arc).</p>`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th">Move</th>
    <th class="combos-table__th">Direction</th>
    <th class="combos-table__th">GA</th>
    <th class="combos-table__th">Montage</th>
    <th class="combos-table__th">Len</th>
    <th class="combos-table__th">Damage</th>
    <th class="combos-table__th">Combo Delay</th>
    <th class="combos-table__th">Trace</th>
    <th class="combos-table__th">Effect</th>
  </tr></thead><tbody>`;
  for (const s of BENNY_DLC_SPECIALS) {
    h += `<tr class="combos-table__tr">`;
    h += `<td class="combos-table__td"><strong>${s.name}</strong></td>`;
    h += `<td class="combos-table__td">${s.direction || "—"}</td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${s.ga}</code></td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${s.montage}</code></td>`;
    h += `<td class="combos-table__td">${s.len.toFixed(3)}s</td>`;
    h += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="ldmg">${s.damage}</td>`;
    h += `<td class="combos-table__td">${s.comboDelay.toFixed(1)}s</td>`;
    h += `<td class="combos-table__td">${s.traceRange}</td>`;
    h += `<td class="combos-table__td" style="font-size:11px">${s.effect || ""}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `<p class="crossclan-note--sub" style="margin-top:8px">Approximate montage frequency for the three DLC specials is 1 / 1.6667 ≈ <strong>0.60 attacks/sec</strong> (raw animation duration proxy).</p>`;
  h += `</div></details>`;
  h += `</div>`; // specials section

  // ── BennyGun Sidearm ──
  h += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad benny-gun-section--new" id="benny-gun-section">`;
  h += `<div class="crossclan-section-heading">`;
  h += `<img class="crossclan-section-heading__icon" src="assets/T_UI_BennyPistol.png" alt="BennyGun">`;
  h += `<span>BennyGun — Sidearm</span>`;
  h += `<span class="crossclan-section-heading__sub">Two ammo modes (Regular &amp; Incendiary) • 30-round max clip • world-found ammo</span>`;
  h += `</div>`;

  // Ammo modes lozenge
  h += `<details class="crossclan-lozenge" open><summary class="crossclan-lozenge__summary">Ammo modes</summary><div class="crossclan-lozenge__body">`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th" style="width:18%">Mode</th>
    <th class="combos-table__th" style="width:32%">Description</th>
    <th class="combos-table__th" style="width:32%">Behaviour</th>
    <th class="combos-table__th" style="width:18%">Unlock</th>
  </tr></thead><tbody>`;
  for (const a of BENNY_GUN_AMMO_MODES) {
    h += `<tr class="combos-table__tr">`;
    h += `<td class="combos-table__td" style="font-family:'Cinzel',serif;font-weight:600">${a.mode}</td>`;
    h += `<td class="combos-table__td" style="font-size:11px">${a.desc}</td>`;
    h += `<td class="combos-table__td" style="font-size:11px">${a.behavior}</td>`;
    h += `<td class="combos-table__td" style="font-size:11px">${a.unlock}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `</div></details>`;

  // Core tuning lozenge
  h += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Core tuning (CDO)</summary><div class="crossclan-lozenge__body">`;
  h += `<p class="crossclan-note--sub">From <code>Default__GA_BennyGun_C</code> + <code>PI_BennyAmmoCounter</code>.</p>`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th" style="width:24%">Property</th>
    <th class="combos-table__th" style="width:24%">Value</th>
    <th class="combos-table__th" style="width:52%">Note</th>
  </tr></thead><tbody>`;
  for (const r of BENNY_GUN_TUNING) {
    h += `<tr class="combos-table__tr">`;
    h += `<td class="combos-table__td" style="font-family:'Cinzel',serif;font-size:11px;font-weight:600;color:var(--text-dim);white-space:nowrap">${r.prop}</td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${r.val}</code></td>`;
    h += `<td class="combos-table__td" style="font-size:11px">${r.note || ''}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `<ul class="crossclan-list crossclan-list--notes">
    <li>Per-shot <strong>Hit Damage</strong> is not surfaced as a CDO scalar — projectile spawning routes through <code>RangedProjectileParams</code>/<code>WrestlerRangedProjectile</code>, with the damage scalar resolved at runtime.</li>
    <li>Phosphor cost (4/shot) means a full 15-round magazine consumes 60 phosphor.</li>
    <li><strong>Ammo can be found in the world</strong>, and some enemies will drop additional ammo.</li>
    <li>Codex confirms mixed regular/incendiary ammo and the burning DOT on incendiary hits.</li>
  </ul>`;
  h += `</div></details>`;

  // Gun montage timings
  h += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Gun montage timings</summary><div class="crossclan-lozenge__body">`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th" style="width:55%">Montage</th>
    <th class="combos-table__th" style="width:45%">Sequence Length</th>
  </tr></thead><tbody>`;
  for (const m of BENNY_GUN_MONTAGES) {
    h += `<tr class="combos-table__tr">`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${m.montage}</code></td>`;
    h += `<td class="combos-table__td">${m.len.toFixed(3)}s</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `</div></details>`;

  h += `</div>`; // gun section

  h += `</div>`; // combos-layout
  container.innerHTML = h;

  const link = container.querySelector("#benny-unarmed-melee-link");
  if (link) {
    link.addEventListener("click", () => {
      if (typeof navigateToMeleeWeapons === "function") navigateToMeleeWeapons();
    });
  }
}

document.addEventListener("DOMContentLoaded", initBenny);
