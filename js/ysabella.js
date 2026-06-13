// Ysabella Skill Tree
// Benny-style display: Toreador middle column + Ysabella side column.

const ysabellaState = { focused: null, sidebarFocused: null, flowerAndFlame: false, dlcInfoOpen: false };

const YSABELLA_LOGO = "assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_YsabellaLogo.png";
const YSABELLA_RAZOR_WIRE_ICON = "assets/T_UI_Ysabella_RazorWire.png";
const YSABELLA_RAZOR_WIRE_PREVIEW = "assets/T_UI_Ysabella_RazorWirePreview.png";
const YSABELLA_ROSE_RAPIER_PREVIEW = "assets/T_UI_Ysabella_RoseRapierPreview.png";
const YSABELLA_RANGED_WEAPONS_PREVIEW = "assets/T_UI_Ysabella_RangedWeaponsPreview.png";
const YSABELLA_DLC_TILE = "assets/T_UI_DLC_FrontEnd_Icon_Ysabella.png";
const YSABELLA_DLC_URL = "https://www.paradoxinteractive.com/games/vampire-the-masquerade-bloodlines-2/add-ons/the-flower-and-the-flame-story-pack";
const YSABELLA_ROSE_DECAL = "assets/N_Textures/AbilityTree/AbilitiesIcons/ClanLogos/T_UI_ClanLogo_Toreador.png";

const YSABELLA_SIDEBAR_ITEMS = [
  {
    id: "razor-wire",
    icon: YSABELLA_RAZOR_WIRE_ICON,
    iconClass: "benny-sidebar-item__pistol-icon",
    title: "Razor Wire",
    tier: "Signature Tool",
    subtitle: "Replaces Phyre's Telekinesis",
    image: YSABELLA_RAZOR_WIRE_PREVIEW,
    desc: "Razor Wire launches a length of barbed wire at an enemy or object. When used against an enemy, it lassos them, holding them in place, giving you more control over the pace of battle. Using Razor Wire again will pull the enemy towards you, leaving them vulnerable to an attack. When used on objects (e.g. weapons or elixirs), it drags them towards you; attacking the object once it is close sends it flying towards enemies.",
    link: { label: "Razor Wire data ->", action: "razor-wire-combat" }
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
    desc: "Instead of unarmed default attacks, like Benny & Phyre, Ysabella's default attacks use her custom-made rapier - a work of art in itself - which gives her better reach and a more precise, rhythmic playstyle compared to other weapons. Her heavy attack is a two-swing sequence: the first slash opens the hit, and the second follow-up is the decapitation swing on kill.",
    link: { label: "Rapier attack data ->", action: "rose-rapier-combat" }
  },
  {
    id: "outfit",
    icon: UI.outfitNotifIcon,
    iconClass: "benny-sidebar-item__pistol-icon",
    title: "Outfit for Phyre"
  }
];

const YSABELLA_CORE_ORDER = ["perk", "mastery", "affect", "relocate", "strike", "passive"];

const YSABELLA_RAPIER_COMBO = {
  name: "Rose Rapier",
  attackset: "Attackset_YsabellaSword",
  steps: 4,
  lightType: "NoLunge",
  lightAbilityTag: "Combat.Ability.Melee.Light.NoLunge",
  heavyAbilityTag: "Combat.Ability.Melee.HeavyRapier",
  windup: {
    montage: "AM_rapier_windup",
    sequenceLength: 1.3166667,
    blendIn: 0.20,
    blendOut: 0.10,
    heavyThreshold: 0.5,
    minimumWindup: 0.05,
    maximumWindup: 1.0,
    thresholdBias: 0.2,
  },
  heavy: {
    montage: "AM_Rapier_heavy",
    followUpMontage: "AM_Rapier_heavySecond",
    attacksetDamage: 16,
    chargedDamage: 30,
    followUpDamage: 30,
    observedTotalDamage: 60,
    environmentDamage: 30,
    sequenceLength: 0.8833333,
    followUpSequenceLength: 0.8833333,
    bufferDelay: 0.50,
    comboDelay: 0.80,
    rightHanded: true,
    trace: "240 / r50 / 15deg",
    lunge: "300 / 450",
    knockback: "V270 / H450",
    hitfreeze: "0.15 / 0.30",
    noiseRadius: 900,
    decapitation: "Second swing decapitates on kill/execute; likely weapon/dismember pipeline plus HeavyRapier execute flags.",
    dismemberChanceCandidate: 0.36,
  },
  rows: [
    { step: 1, lightDmg: 8,  lightMontage: "AM_Rapier_attack1", lightLen: 1.6866666, bufferDelay: 0.01, comboDelay: 0.30, hand: "Right" },
    { step: 2, lightDmg: 8,  lightMontage: "AM_Rapier_attack2", lightLen: 1.6866666, bufferDelay: 0.01, comboDelay: 0.30, hand: "Left" },
    { step: 3, lightDmg: 8,  lightMontage: "AM_Rapier_attack4", lightLen: 1.6866666, bufferDelay: 0.01, comboDelay: 0.30, hand: "Right" },
    { step: 4, lightDmg: 10, lightMontage: "AM_Rapier_attack3", lightLen: 1.6866666, bufferDelay: 0.20, comboDelay: 0.55, hand: "Left", finisher: true },
  ],
  lightTiming: {
    blendIn: 0,
    blendOut: 0.55,
    hitStart: 0.90333337,
    hitLength: 0.783333,
  },
  notes: [
    "All four rapier light entries are tagged Combat.Ability.Melee.Light.NoLunge.",
    "Directionals are empty on all four rapier attack entries.",
    "Light montage Hit sections start at 0.903s and run for 0.783s; all four light montages blend out over 0.55s.",
    "The attackset lists the shared heavy as 16 damage, but GA_PlayerAttack_HeavyRapier exposes a 30 damage hit payload.",
    "Observed heavy behavior is two attacks: AM_Rapier_heavy followed by AM_Rapier_heavySecond. The second swing is the decapitation swing on kill/execute.",
    "HeavyRapier launches lightweights, kills stunned targets, executes, breaks blocks, uses 900 noise radius, and applies 0.15s hitfreeze / 0.3s brutal hitfreeze.",
    "AM_Rapier_heavySecond is a real 0.883s montage, but its call is hidden in cooked Blueprint/native logic rather than a visible Attackset_YsabellaSword asset reference.",
    "The active DLC attackset does not export DismemberChance, but the common Ysabella sword setup exposes DismemberChance=0.36; treat that as likely/inherited rather than hard-confirmed for the DLC rapier.",
  ],
};

const YSABELLA_CONTEXT_ATTACKS = [
  { move: "Wire Punt", ga: "GA_WirePunt", montage: "not exposed", damage: "not exposed", trace: "240", lunge: "-", knockback: "-", len: null, note: "Attack a wire-dragged object near Ysabella to punt it towards enemies; no montage or hit damage exposed in defaults." },
  { move: "Drop Kick", ga: "GA_PlayerAttack_DropKick", montage: "AM_Player_Combat_DropKick", damage: "25", trace: "200 / r35", lunge: "300 / 400", knockback: "V-200 / H2000", len: 1.50, note: "Common attack; launches lightweights and executes." },
  { move: "Slide Kick", ga: "GA_PlayerAttack_SlideKick_Ysabella", montage: "AM_Player_Ysa_SlideKick", damage: "9", trace: "300 / r40", lunge: "300 / 400", knockback: "V400 / H1400", len: 0.93, note: "Ysabella override; aim offset Z 80." },
  { move: "Front Knee", ga: "GA_Ysabella_Kick_Front", montage: "AM_Ysabella_knee", damage: "5 + 5 bonus", trace: "r70", lunge: "330 / 400", knockback: "H300", len: 1.15, note: "Requires Combat.Ability.Evade." },
  { move: "Side Kick", ga: "GA_PlayerAttack_Kick_Side", montage: "AM_Player_Combat_Kick_Right", damage: "7 + 4 bonus", trace: "270 / r60", lunge: "200 / 200", knockback: "H800", len: 1.20, note: "Common side kick; left montage also exists." },
  { move: "Back Kick", ga: "GA_Ysabella_backkick", montage: "AM_Ysa_kick_back", damage: "7 inherited", trace: "250", lunge: "300 / 400", knockback: "H800", len: 1.817, note: "DLC class overrides montage; inherits back-kick stats." },
  { move: "VT Launcher", ga: "GA_Ysa_attack_VT", montage: "AM_YsaSword_VT", damage: "5", trace: "250", lunge: "150 / 150", knockback: "V550 / H50", len: 1.05, note: "Ysabella's riser-like launcher; wired after back kick instead of the common riser state." },
  { move: "Shunt", ga: "GA_PlayerAttack_Shunt", montage: "AM_Player_combat_shunt", damage: "2 + 1.4 bonus", trace: "base", lunge: "250 / 400", knockback: "V0 / H1400", len: 0.95, note: "Common shunt; leg slip duration 0.7." },
];

const YSABELLA_RISER_ATTACK = {
  title: "Ysabella DLC Launcher",
  ga: "GA_Ysa_attack_VT",
  montage: "AM_YsaSword_VT",
  attackType: "Combat.Attack.Launcher",
  damage: 5,
  environmentDamage: 3,
  trace: "250",
  lungeDelay: 0.2,
  lunge: "150 / 150",
  lungeDuration: "0.1 / 0.1",
  timing: "0.3 / 1.0",
  bounceback: 200,
  hitfreeze: "0.06 / 0.20",
  knockback: "V550 / H50 / gravity 0.7 / boost 1.0",
  flags: "LaunchLightweights=true; Montage Stop when Ability Ends=false",
  specialDamageBonus: 1,
  specialHitFilter: "Combat.Ability.Ranged.Reload, Combat.Status.vulnerable, Combat.Ability.Melee.Heavy",
  tag: "Combat.Ability.Melee.Kick.Back",
  sequenceLength: 1.05,
  segment: "Anim_YsaSword_VT_Anim @ 0.05-1.1",
};

const YSABELLA_COMMON_RISER = {
  ga: "GA_Playerattack_riser",
  montage: "AM_Player_Riser",
  damage: 8,
  lunge: "150 / 150",
  comboDelay: 0.7,
  knockback: "V700 / H50 / boost 1.0",
  note: "Common riser found in CG_ChargeCombat, not in CG_YsabellaCombat.",
};

const YSABELLA_RAZOR_WIRE_TUNING = [
  { field: "Wire start punch range", value: "200", source: "GA_Player_Ysabella_Wire" },
  { field: "Punt trace range", value: "240", source: "GA_WirePunt" },
  { field: "Punt velocity threshold", value: "30", source: "GA_WirePunt" },
  { field: "Wire radius", value: "1.0", source: "BP_TenseWIre" },
  { field: "Spline section length", value: "150", source: "BP_TenseWIre" },
  { field: "Initial wire animation", value: "true", source: "BP_TenseWIre" },
];

const YSABELLA_RAZOR_WIRE_MONTAGES = [
  { montage: "AM_ysabella_wireHoldStart", len: 1.117, blend: "0.00 / 0.20", segment: "Anim_Wire_EnemyPull" },
  { montage: "AM_ysabella_wirepunt", len: 0.629, blend: "0.00 / 0.30", segment: "Combat_Left_Miss_Brujah @ 0.8x" },
  { montage: "AM_ysabella_PullEnemy", len: 0.833, blend: "0.10 / 0.40", segment: "Anim_Wire_QuickPull" },
  { montage: "AM_ysabella_PullObject", len: 0.887, blend: "0.00 / 0.40", segment: "Anim_Wire_QuickPull @ 1.3x" },
  { montage: "AM_Wire_Break", len: 0.650, blend: "0.15 / 0.60", segment: "Anim_Wire_break" },
  { montage: "AM_Wire_Parried", len: 0.650, blend: "0.15 / 0.40", segment: "Anim_Wire_break" },
];

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
    releaseDate.textContent = "OUT NOW";

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

  if (clanId === "ventrue" && tier === "affect" && typeof state !== "undefined" && state.modMasqManipulation) {
    html += `<div class="fabien-mod-line">Reduces current Masquerade impact, increased effect is paired with Mass Manipulation</div>`;
  }

  if (ability.discipline) {
    const disc = DISCIPLINES[ability.discipline];
    html += `<div class="detail-panel__discipline">`;
    html += `<img src="${disc.icon}" alt="${disc.name}">`;
    html += `<span>${disc.name}</span>`;
    html += `</div>`;
  }

  if (clanId === "ventrue" && tier === "affect" && typeof state !== "undefined" && state.modMasqManipulation && typeof SPECIAL_DETAILS !== "undefined" && SPECIAL_DETAILS.masquedMind) {
    const detail = SPECIAL_DETAILS.masquedMind;
    html += `<button class="detail-panel__effect-link detail-panel__effect-link--mod" type="button" data-special-detail="${detail.id}">
      <img src="${detail.icon}" alt="">
      <span>MASQUED MIND</span>
    </button>`;
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
  if (typeof bindInlineDetailLinks === "function") bindInlineDetailLinks(panel);

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

function renderYsabellaCombatPage() {
  const container = document.getElementById("ysabelle-subpage-combat");
  if (!container) return;

  const rapier = YSABELLA_RAPIER_COMBO;
  const roseIcon = YSABELLA_ROSE_DECAL;
  const lightDamage = rapier.rows.reduce((sum, row) => sum + row.lightDmg, 0);
  const lightTime = rapier.rows.reduce((sum, row) => sum + rapier.windup.minimumWindup + row.comboDelay, 0);
  const lightDps = lightDamage / lightTime;
  const heavyStepTime = rapier.windup.heavyThreshold * rapier.windup.maximumWindup + rapier.heavy.comboDelay;
  const heavyAttacksetDps = rapier.heavy.attacksetDamage / heavyStepTime;
  const heavyChargedDps = rapier.heavy.chargedDamage / heavyStepTime;
  const heavyObservedDamage = rapier.heavy.observedTotalDamage || rapier.heavy.chargedDamage;
  const heavyObservedDps = heavyObservedDamage / heavyStepTime;

  let h = `<div class="combos-layout ysabella-combat">`;

  h += `<div class="clan-combos-header">`;
  h += `<h2 class="combos-header__title">Ysabella - Combat &amp; Razor Wire</h2>`;
  h += `<p class="combos-header__sub">Asset-confirmed combat data from <code>Ysabella_Rapier_Attacks_23416145.md</code>, <code>CG_YsabellaCombat</code>, and the Razor Wire ability exports in build 23416145.</p>`;
  h += `<ul class="combos-header__primer">
    <li><strong class="combos-header__primer-label combos-header__primer-label--light">Rose Rapier:</strong> four-step no-lunge rapier chain, 34 light damage per full chain, with a two-swing rapier heavy.</li>
    <li><strong class="combos-header__primer-label combos-header__primer-label--heavy">HeavyRapier:</strong> exported hit payload is 30 damage; observed behavior is first slash plus second decapitation slash.</li>
    <li><strong class="combos-header__primer-label">Dash &amp; context attacks:</strong> Ysabella keeps shared Drop Kick / Side Kick / Shunt behavior, but overrides Slide Kick, Front Knee, Back Kick, and her DLC launcher/riser.</li>
    <li><strong class="combos-header__primer-label combos-header__primer-label--heavy">Razor Wire:</strong> lasso, yank, object drag, and attack-to-punt behavior; damage scalars for hold/yank/break are not exposed in the cooked defaults.</li>
  </ul>`;
  h += `</div>`;

  h += `<div class="clan-combos-tables">`;
  h += `<div class="clan-combo-block" id="ysabella-rapier-section">`;
  h += `<div class="clan-combo-block__heading">`;
  h += `<img class="clan-combo-block__logo" src="${roseIcon}" alt="Toreador">`;
  h += `<span class="clan-combo-block__name">Rose Rapier</span>`;
  h += `<span class="clan-combo-block__meta">${rapier.steps} steps &middot; ${rapier.lightType} lights &middot; <code class="crossclan-code">${rapier.attackset}</code></span>`;
  h += `<span class="dps-chip-group">`;
  h += `<span class="dps-chip dps-chip--lights" title="Full light chain using MinimumWindup + ComboDelay cadence"><span class="dps-chip__head"><span class="dps-chip__label">Light</span><span class="dps-chip__val">${lightDps.toFixed(2)}</span></span></span>`;
  h += `<span class="dps-chip dps-chip--shove" title="Attackset heavy damage 16 over heavy threshold cadence"><span class="dps-chip__head"><span class="dps-chip__label">H16</span><span class="dps-chip__val">${heavyAttacksetDps.toFixed(2)}</span></span></span>`;
  h += `<span class="dps-chip dps-chip--opt" title="Charged HeavyRapier payload 30 over heavy threshold cadence"><span class="dps-chip__head"><span class="dps-chip__label">H30</span><span class="dps-chip__val">${heavyChargedDps.toFixed(2)}</span></span></span>`;
  h += `<span class="dps-chip dps-chip--opt" title="Observed two-swing HeavyRapier total over heavy threshold cadence"><span class="dps-chip__head"><span class="dps-chip__label">H30x2</span><span class="dps-chip__val">${heavyObservedDps.toFixed(2)}</span></span></span>`;
  h += `</span>`;
  h += `</div>`;

  h += `<table class="combos-table clan-combos-table"><thead><tr>
    <th class="combos-table__th clan-combos-table__th--step">Step</th>
    <th class="combos-table__th">Light Montage</th>
    <th class="combos-table__th clan-combos-table__th--ldmg">L.Dmg</th>
    <th class="combos-table__th clan-combos-table__th--llen">L.Len</th>
    <th class="combos-table__th clan-combos-table__th--delay">Buffer</th>
    <th class="combos-table__th clan-combos-table__th--delay">Combo</th>
    <th class="combos-table__th">Hand</th>
    <th class="combos-table__th">Heavy Montage</th>
    <th class="combos-table__th clan-combos-table__th--hdmg">H.Dmg</th>
  </tr></thead><tbody>`;
  for (const r of rapier.rows) {
    h += `<tr class="clan-combos-table__row${r.finisher ? " clan-combos-table__row--finisher" : ""}">`;
    h += `<td class="combos-table__td clan-combos-table__td--step">${r.step}${r.finisher ? `<span class="clan-combo-star" title="Finisher">★</span>` : ""}</td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${r.lightMontage}</code></td>`;
    h += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="ldmg">${r.lightDmg}</td>`;
    h += `<td class="combos-table__td clan-combos-table__td--len">${r.lightLen.toFixed(3)}s</td>`;
    h += `<td class="combos-table__td clan-combos-table__td--delay">${r.bufferDelay.toFixed(2)}s</td>`;
    h += `<td class="combos-table__td clan-combos-table__td--delay">${r.comboDelay.toFixed(2)}s</td>`;
    h += `<td class="combos-table__td">${r.hand}</td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${rapier.heavy.montage}</code><br><code class="crossclan-code">${rapier.heavy.followUpMontage}</code></td>`;
    h += `<td class="combos-table__td clan-combos-table__td--dmg clan-combo__dmg--peak" data-cell="hdmg">${rapier.heavy.attacksetDamage} / ${rapier.heavy.chargedDamage} x2</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `<ul class="clan-combo-block__notes">`;
  h += `<li>Windup: <code class="crossclan-code">${rapier.windup.montage}</code> &middot; sequence ${rapier.windup.sequenceLength.toFixed(3)}s &middot; Min/Max ${rapier.windup.minimumWindup.toFixed(2)}s/${rapier.windup.maximumWindup.toFixed(1)}s &middot; HeavyThreshold ${rapier.windup.heavyThreshold.toFixed(2)} &middot; ThresholdBias ${rapier.windup.thresholdBias.toFixed(1)}.</li>`;
  h += `<li>Tags: light <code class="crossclan-code">${rapier.lightAbilityTag}</code> &middot; heavy <code class="crossclan-code">${rapier.heavyAbilityTag}</code>.</li>`;
  h += `<li>Heavy details: first sequence ${rapier.heavy.sequenceLength.toFixed(3)}s, second sequence ${rapier.heavy.followUpSequenceLength.toFixed(3)}s, buffer ${rapier.heavy.bufferDelay.toFixed(2)}s, combo ${rapier.heavy.comboDelay.toFixed(2)}s, right-handed ${rapier.heavy.rightHanded ? "true" : "false"}, trace ${rapier.heavy.trace}, lunge ${rapier.heavy.lunge}, knockback ${rapier.heavy.knockback}, hitfreeze ${rapier.heavy.hitfreeze}, noise ${rapier.heavy.noiseRadius}.</li>`;
  h += `<li>Second swing: <code class="crossclan-code">${rapier.heavy.followUpMontage}</code> is the observed decapitation follow-up; exported references imply the call is hidden in cooked ability logic rather than the visible attackset.</li>`;
  h += `<li>Decap caveat: ${rapier.heavy.decapitation} Best exported numeric candidate is common Ysabella sword <code class="crossclan-code">DismemberChance=${rapier.heavy.dismemberChanceCandidate}</code>, but the active DLC rapier attackset does not expose that field.</li>`;
  for (const note of rapier.notes) h += `<li>${note}</li>`;
  h += `</ul>`;
  h += `</div>`;
  h += `</div>`;

  h += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad" id="ysabella-dash-section">`;
  h += `<div class="crossclan-section-heading">`;
  h += `<img class="crossclan-section-heading__icon" src="${roseIcon}" alt="Toreador">`;
  h += `<span>Dash &amp; Context Attacks</span>`;
  h += `<span class="crossclan-section-heading__sub">From <code>CG_YsabellaCombat</code></span>`;
  h += `</div>`;
  h += `<details class="crossclan-lozenge" open><summary class="crossclan-lozenge__summary">Context attack chain</summary><div class="crossclan-lozenge__body">`;
  h += `<p class="crossclan-note--sub">Control graph order: <code class="crossclan-code">GA_WirePunt -> GA_PlayerAttack_DropKick -> GA_PlayerAttack_SlideKick_Ysabella -> GA_Ysabella_Kick_Front -> GA_PlayerAttack_Kick_Side -> GA_Ysabella_backkick -> GA_Ysa_attack_VT -> GA_PlayerAttack_Shunt -> GA_PlayerShoot -> GA_PlayerWindup</code>.</p>`;
  h += `<table class="combos-table crossclan-table ysabella-context-table"><thead><tr>
    <th class="combos-table__th">Move</th>
    <th class="combos-table__th">GA</th>
    <th class="combos-table__th">Montage</th>
    <th class="combos-table__th">Len</th>
    <th class="combos-table__th">Damage</th>
    <th class="combos-table__th">Trace</th>
    <th class="combos-table__th">Lunge</th>
    <th class="combos-table__th">Knockback</th>
    <th class="combos-table__th">Notes</th>
  </tr></thead><tbody>`;
  for (const attack of YSABELLA_CONTEXT_ATTACKS) {
    h += `<tr class="combos-table__tr">`;
    h += `<td class="combos-table__td"><strong>${attack.move}</strong></td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${attack.ga}</code></td>`;
    h += `<td class="combos-table__td"><code class="crossclan-code">${attack.montage}</code></td>`;
    h += `<td class="combos-table__td">${typeof attack.len === "number" ? `${attack.len.toFixed(3)}s` : "n/a"}</td>`;
    h += `<td class="combos-table__td clan-combos-table__td--dmg" data-cell="ldmg">${attack.damage}</td>`;
    h += `<td class="combos-table__td">${attack.trace}</td>`;
    h += `<td class="combos-table__td">${attack.lunge}</td>`;
    h += `<td class="combos-table__td">${attack.knockback}</td>`;
    h += `<td class="combos-table__td" style="font-size:11px">${attack.note}</td>`;
    h += `</tr>`;
  }
  h += `</tbody></table>`;
  h += `</div></details>`;

  h += `<details class="crossclan-lozenge" open><summary class="crossclan-lozenge__summary">Riser / launcher attack</summary><div class="crossclan-lozenge__body">`;
  h += `<p class="crossclan-note--sub">Ysabella does not reference the common <code class="crossclan-code">${YSABELLA_COMMON_RISER.ga}</code> directly. Her riser-like launcher in <code class="crossclan-code">CG_YsabellaCombat</code> is <code class="crossclan-code">${YSABELLA_RISER_ATTACK.ga}</code>, wired after <code class="crossclan-code">GA_Ysabella_backkick</code> and before <code class="crossclan-code">GA_PlayerAttack_Shunt</code>.</p>`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th">Field</th>
    <th class="combos-table__th">Ysabella DLC Launcher</th>
    <th class="combos-table__th">Common Riser Comparison</th>
  </tr></thead><tbody>
    <tr><td class="combos-table__td">GA</td><td class="combos-table__td"><code class="crossclan-code">${YSABELLA_RISER_ATTACK.ga}</code></td><td class="combos-table__td"><code class="crossclan-code">${YSABELLA_COMMON_RISER.ga}</code></td></tr>
    <tr><td class="combos-table__td">Montage</td><td class="combos-table__td"><code class="crossclan-code">${YSABELLA_RISER_ATTACK.montage}</code></td><td class="combos-table__td"><code class="crossclan-code">${YSABELLA_COMMON_RISER.montage}</code></td></tr>
    <tr><td class="combos-table__td">Attack Type</td><td class="combos-table__td"><code class="crossclan-code">${YSABELLA_RISER_ATTACK.attackType}</code></td><td class="combos-table__td"><code class="crossclan-code">Combat.Attack.Launcher</code></td></tr>
    <tr><td class="combos-table__td">Damage</td><td class="combos-table__td">${YSABELLA_RISER_ATTACK.damage} hit / ${YSABELLA_RISER_ATTACK.environmentDamage} env</td><td class="combos-table__td">${YSABELLA_COMMON_RISER.damage} hit / 3 env</td></tr>
    <tr><td class="combos-table__td">Trace</td><td class="combos-table__td">${YSABELLA_RISER_ATTACK.trace}</td><td class="combos-table__td">250</td></tr>
    <tr><td class="combos-table__td">Lunge</td><td class="combos-table__td">${YSABELLA_RISER_ATTACK.lunge} &middot; delay ${YSABELLA_RISER_ATTACK.lungeDelay}</td><td class="combos-table__td">${YSABELLA_COMMON_RISER.lunge}</td></tr>
    <tr><td class="combos-table__td">Buffer / Combo</td><td class="combos-table__td">${YSABELLA_RISER_ATTACK.timing}</td><td class="combos-table__td">0.3 / ${YSABELLA_COMMON_RISER.comboDelay}</td></tr>
    <tr><td class="combos-table__td">Knockback</td><td class="combos-table__td">${YSABELLA_RISER_ATTACK.knockback}</td><td class="combos-table__td">${YSABELLA_COMMON_RISER.knockback}</td></tr>
    <tr><td class="combos-table__td">Montage Timing</td><td class="combos-table__td">${YSABELLA_RISER_ATTACK.sequenceLength.toFixed(2)}s &middot; ${YSABELLA_RISER_ATTACK.segment}</td><td class="combos-table__td">${YSABELLA_COMMON_RISER.note}</td></tr>
  </tbody></table>`;
  h += `<ul class="crossclan-list crossclan-list--notes">
    <li><strong>Flags:</strong> ${YSABELLA_RISER_ATTACK.flags}.</li>
    <li><strong>Special hit filter:</strong> <code class="crossclan-code">${YSABELLA_RISER_ATTACK.specialHitFilter}</code>.</li>
    <li><strong>Ability tag:</strong> <code class="crossclan-code">${YSABELLA_RISER_ATTACK.tag}</code>; special damage bonus ${YSABELLA_RISER_ATTACK.specialDamageBonus}.</li>
  </ul>`;
  h += `</div></details>`;
  h += `</div>`;

  h += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad" id="ysabella-razor-wire-section">`;
  h += `<div class="crossclan-section-heading">`;
  h += `<img class="crossclan-section-heading__icon" src="${YSABELLA_RAZOR_WIRE_ICON}" alt="Razor Wire">`;
  h += `<span>Razor Wire</span>`;
  h += `<span class="crossclan-section-heading__sub">Lasso, hold, yank, object pull, and punt</span>`;
  h += `</div>`;

  h += `<details class="crossclan-lozenge" open><summary class="crossclan-lozenge__summary">Hard values found</summary><div class="crossclan-lozenge__body">`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th">Field</th>
    <th class="combos-table__th">Value</th>
    <th class="combos-table__th">Source</th>
  </tr></thead><tbody>`;
  for (const row of YSABELLA_RAZOR_WIRE_TUNING) {
    h += `<tr class="combos-table__tr"><td class="combos-table__td">${row.field}</td><td class="combos-table__td"><code class="crossclan-code">${row.value}</code></td><td class="combos-table__td"><code class="crossclan-code">${row.source}</code></td></tr>`;
  }
  h += `</tbody></table>`;
  h += `<ul class="crossclan-list crossclan-list--notes">
    <li><strong>Damage caveat:</strong> hold damage, yank damage, wire break health, and break damage were not exposed as class-default scalars in the cooked FModel JSON.</li>
    <li><strong>Control text:</strong> Razor Wire lassos enemies; pressing the same ability again pulls them toward Ysabella. It can also drag items and weapons towards her.</li>
    <li><strong>Punt behavior:</strong> attacking a dragged object once it is near Ysabella sends it flying towards enemies. <code class="crossclan-code">GA_WirePunt</code> finds a throwable actor, checks its velocity, and only activates above the 30 velocity threshold.</li>
  </ul>`;
  h += `</div></details>`;

  h += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Wire montage timings</summary><div class="crossclan-lozenge__body">`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th">Montage</th>
    <th class="combos-table__th">Len</th>
    <th class="combos-table__th">Blend In / Out</th>
    <th class="combos-table__th">Segment</th>
  </tr></thead><tbody>`;
  for (const montage of YSABELLA_RAZOR_WIRE_MONTAGES) {
    h += `<tr class="combos-table__tr"><td class="combos-table__td"><code class="crossclan-code">${montage.montage}</code></td><td class="combos-table__td">${montage.len.toFixed(3)}s</td><td class="combos-table__td">${montage.blend}</td><td class="combos-table__td">${montage.segment}</td></tr>`;
  }
  h += `</tbody></table>`;
  h += `</div></details>`;

  h += `<details class="crossclan-lozenge"><summary class="crossclan-lozenge__summary">Masquerade action data</summary><div class="crossclan-lozenge__body">`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th">Entry</th>
    <th class="combos-table__th">Tag</th>
    <th class="combos-table__th">Notice</th>
    <th class="combos-table__th">Observe</th>
    <th class="combos-table__th">Noise</th>
    <th class="combos-table__th">Initial</th>
    <th class="combos-table__th">Over Time</th>
  </tr></thead><tbody>
    <tr class="combos-table__tr"><td class="combos-table__td">YsaWire</td><td class="combos-table__td"><code class="crossclan-code">Combat.Ability.YsaWire.Hold</code></td><td class="combos-table__td">2.0</td><td class="combos-table__td">6.0</td><td class="combos-table__td">0.0</td><td class="combos-table__td">5.0</td><td class="combos-table__td">5.0</td></tr>
    <tr class="combos-table__tr"><td class="combos-table__td">YsaWire_start</td><td class="combos-table__td"><code class="crossclan-code">Combat.Ability.YsaWire.Start</code></td><td class="combos-table__td">2.0</td><td class="combos-table__td">6.0</td><td class="combos-table__td">500.0</td><td class="combos-table__td">5.0</td><td class="combos-table__td">0.0</td></tr>
  </tbody></table>`;
  h += `<p class="crossclan-note--sub" style="margin-top:8px">Both are violent actions, use the Masquerade witness-ability prompt, and have 100% reaction chance.</p>`;
  h += `</div></details>`;
  h += `</div>`;

  h += `<div class="crossclan-section-wrap crossclan-section-wrap--no-pad" id="ysabella-tremere-comparison">`;
  h += `<div class="crossclan-section-heading">`;
  h += `<img class="crossclan-section-heading__icon" src="${roseIcon}" alt="Toreador">`;
  h += `<span>Tremere Comparison</span>`;
  h += `<span class="crossclan-section-heading__sub">Similar silhouette, different payload</span>`;
  h += `</div>`;
  h += `<details class="crossclan-lozenge" open><summary class="crossclan-lozenge__summary">Are Ysabella's attacks basically Tremere?</summary><div class="crossclan-lozenge__body">`;
  h += `<p class="crossclan-note--sub"><strong>Short answer:</strong> no, but the rapier is the closest non-Tremere profile to Tremere's no-lunge precision feel.</p>`;
  h += `<table class="combos-table crossclan-table"><thead><tr>
    <th class="combos-table__th">Property</th>
    <th class="combos-table__th">Ysabella Rapier</th>
    <th class="combos-table__th">Tremere Clan Chain</th>
  </tr></thead><tbody>
    <tr><td class="combos-table__td">Light tag</td><td class="combos-table__td">NoLunge</td><td class="combos-table__td">NoLunge</td></tr>
    <tr><td class="combos-table__td">Steps</td><td class="combos-table__td">4</td><td class="combos-table__td">4</td></tr>
    <tr><td class="combos-table__td">Light damage</td><td class="combos-table__td">8 / 8 / 8 / 10</td><td class="combos-table__td">8 / 8 / 8 / 8</td></tr>
    <tr><td class="combos-table__td">Light cadence</td><td class="combos-table__td">0.35 / 0.35 / 0.35 / 0.60s</td><td class="combos-table__td">0.50 / 0.45 / 0.45 / 0.85s</td></tr>
    <tr><td class="combos-table__td">Heavy</td><td class="combos-table__td">16 attackset / 30 x2 HeavyRapier sequence; second swing decapitates on kill</td><td class="combos-table__td">12</td></tr>
    <tr><td class="combos-table__td">Feel</td><td class="combos-table__td">Fast precision weapon with a real charged finisher</td><td class="combos-table__td">Ranged no-lunge blood-sorcery chain; heavies are weak</td></tr>
  </tbody></table>`;
  h += `</div></details>`;
  h += `</div>`;

  h += `</div>`;
  container.innerHTML = h;
}

function navigateYsabellaDetailLink(action) {
  if (action === "rose-rapier-combat" || action === "razor-wire-combat") {
    const ysabellaTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="ysabelle"]');
    if (ysabellaTab && !ysabellaTab.classList.contains("active")) ysabellaTab.click();
    const combatTab = document.querySelector('.tab-bar--ysabelle .tab-bar__tab[data-ysabellatab="combat"]');
    if (combatTab) combatTab.click();
    const targetId = action === "rose-rapier-combat" ? "ysabella-rapier-section" : "ysabella-razor-wire-section";
    setTimeout(() => {
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
    return;
  }

  if (action === "weapons") {
    const phyreTab = document.querySelector('.tab-bar--primary .tab-bar__tab[data-tab="phyre"]');
    if (phyreTab && !phyreTab.classList.contains("active")) phyreTab.click();
    const pickupsTab = document.querySelector('.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny):not(.tab-bar--ysabelle) .tab-bar__tab[data-subtab="pickups"]');
    if (pickupsTab) pickupsTab.click();
    if (typeof setActivePickupsSubtab === "function") setActivePickupsSubtab("weapons");
  }
}

document.addEventListener("DOMContentLoaded", initYsabella);
