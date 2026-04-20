// VTMB2 Skill Calculator - Game Data
// ====================================

const TEX = "Textures";
const ICONS = `${TEX}/N_Textures/AbilityTree/AbilitiesIcons`;
const CLAN_LOGOS = `${ICONS}/ClanLogos`;
const ASSETS = `${TEX}/N_Textures/AbilityTree/Assets`;
const FLAT = `${TEX}/N_Textures/AbilityTree/Flat_Textures`;
const COLUMNS = `${TEX}/AbilityTreeIcons/ClanColumns`;
const AFFINITY_UI = `${TEX}/ClanAffinityUI`;
const CLAN_SEL = `${TEX}/N_Textures/ClanSelection`;
const TRAINER = `${TEX}/N_Textures/ClanTrainer`;
const VIDS = "AbilityTree_vids";

// ── Disciplines ──────────────────────────────────────────────
const DISCIPLINES = {
  potence:       { name: "Potence",        icon: `${AFFINITY_UI}/T_UI_ClanAffinity_Potence.png` },
  celerity:      { name: "Celerity",       icon: `${AFFINITY_UI}/T_UI_ClanAffinity_Celerity.png` },
  presence:      { name: "Presence",       icon: `${AFFINITY_UI}/T_UI_ClanAffinity_Presence.png` },
  bloodSorcery:  { name: "Blood Sorcery",  icon: `${AFFINITY_UI}/T_UI_ClanAffinity_BloodSorcery.png` },
  dominate:      { name: "Dominate",       icon: `${AFFINITY_UI}/T_UI_ClanAffinity_Dominate.png` },
  obfuscate:     { name: "Obfuscate",      icon: `${AFFINITY_UI}/T_UI_ClanAffinity_Obfuscate.png` },
  oblivion:      { name: "Oblivion",       icon: `${AFFINITY_UI}/T_UI_ClanAffinity_Oblivion.png` },
};

// ── Clans ────────────────────────────────────────────────────
const CLANS = {
  brujah: {
    name: "Brujah",
    affinities: ["potence", "celerity", "presence"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_Bruhjan.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_Bruhjan_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Brujah.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_Brujah.png`,
    color: "#c44121",
  },
  tremere: {
    name: "Tremere",
    affinities: ["bloodSorcery", "dominate"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_Tremere.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_Tremere_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Tremere.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_Tremere.png`,
    color: "#6b2fa0",
  },
  banuHaqim: {
    name: "Banu Haqim",
    affinities: ["celerity", "bloodSorcery", "obfuscate"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_BamuHaquim.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_BanuHaqim_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Banu.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_BanuHaqim.png`,
    color: "#1a3a5c",
  },
  ventrue: {
    name: "Ventrue",
    affinities: ["dominate", "presence"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_Venture.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_Ventrue_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Ventrue.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_Ventrue.png`,
    color: "#b8962e",
  },
  lasombra: {
    name: "Lasombra",
    affinities: ["oblivion", "potence", "dominate"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_Lasombra.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_Lasombra_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Lasombra.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_Lasombra.png`,
    color: "#2a2a3a",
  },
  toreador: {
    name: "Toreador",
    affinities: ["celerity", "presence"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_Toreador.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_Toreador_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Toreador.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_Toreador.png`,
    color: "#1a8a7a",
  },
};

const CLAN_ORDER = ["brujah", "tremere", "banuHaqim", "ventrue", "lasombra", "toreador"];

// ── Tiers ────────────────────────────────────────────────────
// AP costs: [inClan, affinity, outOfClan]
const TIERS = {
  passive:  { label: "Clan Passive", ap: [1, null, null],  resTotal: 0 },
  strike:   { label: "Strike",       ap: [1, 5, 10],       resTotal: 150 },
  relocate: { label: "Relocate",     ap: [2, 4, 8],        resTotal: 350 },
  affect:   { label: "Affect",       ap: [3, 3, 6],        resTotal: 550 },
  mastery:  { label: "Mastery",      ap: [4, 6, 12],       resTotal: 950 },
  perk:     { label: "Clan Perk",    ap: [3, null, 6],     resTotal: 0 },
};

// Row display order (top to bottom in the grid)
const TIER_ORDER = ["perk", "mastery", "affect", "relocate", "strike", "passive"];

// ── Resonance Effects ─────────────────────────────────────────
// Abilities that apply resonance to NPC targets
const RES_ICONS = {
  sanguine:    `${FLAT}/T_UI_BloodC_Sanguinde.png`,
  melancholic: `${FLAT}/T_UI_BloodC_Melancholic.png`,
  choleric:    `${FLAT}/T_UI_BloodC_Choleric.png`,
};
const RES_CLEANSE_ICON = `${TEX}/N_Textures/AbilityTree/T_UI_QuestionMark.png`;

// Keyed by exact ability name
const RESONANCE_GRANT = {
  "Beckon":              "sanguine",
  "Taunt":               "choleric",
  "Glimpse of Oblivion": "melancholic",
  "Enter Oblivion":      "melancholic",
};
const RESONANCE_CLEANSE = new Set(["Cloud Memory", "Mind Wipe", "Entrancing Kiss"]);

// ── Masquerade Impact ────────────────────────────────────────
// Activation-only impact scores per clan/tier (from masq_impact data).
// Tiers: breach(60+), moderate(20-59), low(1-19), safe(0)
const MASQ_DIR = `${TEX}/N_Textures/Masquerade`;
const SKULL_ICON = `${TEX}/N_Textures/DialogV2/T_UI_Skull.png`;
const MASQ_TIERS = {
  breach:   { label: "Masquerade Breach",         icon: `${MASQ_DIR}/T_UI_Masq_Broke.png`,    glow: "masq-breach" },
  moderate: { label: "Moderate Masquerade Impact", icon: `${MASQ_DIR}/T_UI_Masq_Breaking.png`, glow: "masq-moderate" },
  low:      { label: "Minor Masquerade Impact",    icon: `${MASQ_DIR}/T_UI_Mask_white.png`,    glow: "masq-low" },
  safe:     { label: "No Masquerade Impact",       icon: `${MASQ_DIR}/T_UI_Mask_lines.png`,    glow: "masq-safe" },
};

function getMasqTier(score) {
  if (score >= 60) return "breach";
  if (score >= 20) return "moderate";
  if (score > 0)  return "low";
  return "safe";
}

function getMasqBadgeTier(events) {
  if (!events || events.length === 0) return "safe";
  // Use the primary (first) event's effective score for the badge
  return getMasqTier(Math.max(events[0].initial, events[0].perSec));
}

// Per-clan, per-tier activation events
// Each event: { label, initial, perSec, noise, notice, violent, note? }
// Events are ordered primary-first (base activation first, conditional hits after)
const MASQUERADE = {
  brujah: {
    passive:  [],
    perk:     [],
    strike: [
      { label: "Strike",      initial: 60, perSec:  3, noise:    0, notice:   0, violent: true  },
    ],
    relocate: [
      { label: "Active",      initial: 10, perSec: 20, noise:  250, notice:   0, violent: false },
      { label: "Hit",         initial: 60, perSec: 50, noise: 1000, notice: 500, violent: true  },
    ],
    affect: [
      { label: "Cast",        initial: 15, perSec:  0, noise:  100, notice:   0, violent: false },
    ],
    mastery: [
      { label: "Cast",        initial: 30, perSec:  0, noise:  500, notice:   0, violent: true  },
      { label: "Hit",         initial: 60, perSec:  0, noise:  500, notice:   0, violent: true  },
    ],
  },
  tremere: {
    passive:  [],
    perk:     [],
    strike: [
      { label: "Cast",        initial: 60, perSec:  0, noise:  500, notice:   0, violent: true  },
    ],
    relocate: [
      { label: "Teleport",    initial: 15, perSec: 10, noise:    0, notice:   0, violent: true  },
      { label: "Place Marker",initial: 10, perSec:  0, noise:    0, notice:   0, violent: false },
      { label: "Kill (Noise)",initial: 60, perSec:  0, noise: 2000, notice:   0, violent: true  },
    ],
    affect: [
      { label: "Cast",        initial: 60, perSec:  3, noise:  500, notice:   0, violent: true  },
    ],
    mastery: [
      { label: "Hold",        initial: 30, perSec:  3, noise:    0, notice:   0, violent: false },
      { label: "Shoot",       initial: 30, perSec:  0, noise:  100, notice:   0, violent: true  },
      { label: "Hit",         initial: 60, perSec:  0, noise:  250, notice:   0, violent: true  },
    ],
  },
  banuHaqim: {
    passive:  [],
    perk: [
      { label: "Prowl", initial: 35, perSec: 9, noise: 550, notice: 300, violent: false },
    ],
    strike: [
      { label: "Hit",         initial: 60, perSec:  0, noise:  150, notice:   0, violent: true  },
      { label: "Miss",        initial: 20, perSec:  0, noise:  100, notice:   0, violent: false },
    ],
    relocate: [
      { label: "Cast",        initial: 15, perSec:  0, noise:    0, notice:   0, violent: false },
    ],
    affect: [
      { label: "Cast",        initial:  0, perSec:  0, noise:    0, notice:   0, violent: false },
    ],
    mastery: [
      { label: "Cast",        initial: 15, perSec:  0, noise:    0, notice:   0, violent: false },
      { label: "Drop",        initial:  0, perSec: 20, noise:    0, notice:   0, violent: false, note: "Always noticed when dropping" },
    ],
  },
  ventrue: {
    passive:  [],
    perk:     [],
    strike: [
      { label: "Cast",        initial: 60, perSec:  0, noise:  250, notice:   0, violent: true  },
    ],
    relocate: [
      { label: "Cast",        initial:  0, perSec:  0, noise:    0, notice:   0, violent: false },
    ],
    affect: [
      { label: "Cast",        initial:  0, perSec:  0, noise:    0, notice:   0, violent: false },
    ],
    mastery: [
      { label: "Cast",        initial: 10, perSec:  0, noise:    0, notice:   0, violent: false },
    ],
  },
  lasombra: {
    passive:  [],
    perk:     [],
    strike: [
      { label: "Cast",        initial: 60, perSec:  3, noise:    0, notice:   0, violent: true  },
    ],
    relocate: [
      { label: "Cast",        initial: 30, perSec:  0, noise:    0, notice:   0, violent: false },
    ],
    affect: [
      { label: "Cast",        initial: 60, perSec:  0, noise:    0, notice:   0, violent: false },
    ],
    mastery: [
      { label: "Enter",       initial: 60, perSec:  0, noise:    0, notice:   0, violent: true  },
    ],
  },
  toreador: {
    passive:  [],
    perk:     [],
    strike: [
      { label: "Cast",        initial: 30, perSec:  0, noise:    0, notice:   0, violent: false },
    ],
    relocate: [
      { label: "No Hit",      initial: 30, perSec:  0, noise:    0, notice:   0, violent: false },
      { label: "Hit Enemy",   initial: 60, perSec:  0, noise:    0, notice:   0, violent: true  },
    ],
    affect: [
      { label: "Cast",        initial: 30, perSec:  0, noise:    0, notice:   0, violent: false },
    ],
    mastery: [
      { label: "Active",      initial:  0, perSec:  2, noise:    0, notice:   0, violent: false, note: "0% reaction chance — invisible to pedestrians" },
    ],
  },
};

// ── Abilities ────────────────────────────────────────────────
// Each ability: { name, icon, discipline, description, bloodPips, channeled, resonance: {san, mel, cho}, video }
const ABILITIES = {
  // ── Brujah ──
  brujah: {
    passive: {
      name: "Brutality",
      icon: `${ICONS}/T_UI_Brutality.png`,
      discipline: null,
      description: "Feeding gives you strength - gain increased attack power for a brief window.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: `${VIDS}/Brujah/Brujah_Brutality.mp4`,
    },
    strike: {
      name: "Lightning Strike",
      icon: `${ICONS}/T_UI_-Lightning-Strikes.png`,
      discipline: "celerity",
      description: "Target multiple opponents and unleash an unstoppable hail of punches, with the final strike dealing increased damage.",
      bloodPips: 3, channeled: false,
      resonance: { san: 50, mel: 0, cho: 100 },
      video: `${VIDS}/Brujah/Brujah_LightningStrike.mp4`,
    },
    relocate: {
      name: "Charge",
      icon: `${ICONS}/T_UI_Charge.png`,
      discipline: "celerity",
      description: "Surge forward with preternatural speed and rage, grabbing an enemy you collide with to use as a battering ram to knock down others in your path.\n\nEach enemy struck applies damage to the held victim.",
      bloodPips: 2, channeled: false,
      resonance: { san: 0, mel: 100, cho: 250 },
      video: `${VIDS}/Brujah/Brujah_Charge.mp4`,
    },
    affect: {
      name: "Taunt",
      icon: `${ICONS}/T_UI_Taunt.png`,
      discipline: "presence",
      description: "Use your supernatural Presence to enrage an opponent or civilian prey, compelling them to attack you. While enraged, the target takes increased damage.\n\nArmed opponents will drop their weapon.\n\nTarget gains Choleric blood resonance.",
      bloodPips: 2, channeled: false,
      resonance: { san: 400, mel: 150, cho: 0 },
      video: `${VIDS}/Brujah/Brujah_Taunt.mp4`,
    },
    mastery: {
      name: "Earthshock",
      icon: `${ICONS}/T_UI_Earthshock.png`,
      discipline: "potence",
      description: "Slam the ground with explosive force, flinging surrounding enemies into the air. Nearby opponents will take significant damage.\n\nBeing higher off the ground when casting increases the size of the blast.",
      bloodPips: 5, channeled: false,
      resonance: { san: 0, mel: 300, cho: 650 },
      video: `${VIDS}/Brujah/Brujah_Earthshock.mp4`,
    },
    perk: {
      name: "Spark of Rage",
      icon: null, // Uses clan logo
      discipline: null,
      description: "Killing enemies without feeding still activates your Clan Passive.\n\nPerks stack. Unlock all six to experience the Nomad's true power.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: null,
    },
  },

  // ── Tremere ──
  tremere: {
    passive: {
      name: "Corrosive Touch",
      icon: `${ICONS}/T_UI_CP_AcidTouch.png`,
      discipline: null,
      description: "The bodies of enemies slain by feeding will dissolve away.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: `${VIDS}/Tremere/Tremer_CorrosiveVitae.mp4`,
    },
    strike: {
      name: "Blood Curse",
      icon: `${ICONS}/T_UI_Bloodcurse.png`,
      discipline: "bloodSorcery",
      description: "Place a curse on an opponent. The next time they take damage, their body will swell up and explode.\n\nWeaker opponents or targets closer to you are significantly quicker to curse.",
      bloodPips: 3, channeled: false,
      resonance: { san: 100, mel: 50, cho: 0 },
      video: `${VIDS}/Tremere/Tremer_BloodCurse.mp4`,
    },
    relocate: {
      name: "Recall",
      icon: `${ICONS}/T_UI_Recall.png`,
      discipline: "bloodSorcery",
      description: "Mark your current position. Use again to return to that position.\n\nDamages enemies standing nearby when you appear.",
      bloodPips: 3, channeled: false,
      resonance: { san: 250, mel: 100, cho: 0 },
      video: `${VIDS}/Tremere/Tremer_Recall.mp4`,
    },
    affect: {
      name: "Cauldron of Blood",
      icon: `${ICONS}/T_UI_CaudronOfBlood.png`,
      discipline: "bloodSorcery",
      description: "Boil a person's blood from the inside. Their horrified screams will draw others close.",
      bloodPips: 3, channeled: false,
      resonance: { san: 400, mel: 0, cho: 150 },
      video: `${VIDS}/Tremere/Tremer_CauldronOfBlood.mp4`,
    },
    mastery: {
      name: "Blood Salvo",
      icon: `${ICONS}/T_UI_BloodSalvo.png`,
      discipline: "bloodSorcery",
      description: "Conjure a set of blood daggers that can be thrown at enemies or explosives with Telekinesis.",
      bloodPips: 5, channeled: false,
      resonance: { san: 650, mel: 0, cho: 300 },
      video: `${VIDS}/Tremere/Tremer_BloodSalvo.mp4`,
    },
    perk: {
      name: "Blood of Potency",
      icon: null,
      discipline: null,
      description: "Feeding will recharge an additional blood pip for a random ability.\n\nPerks stack. Unlock all six to experience the Nomad's true power.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: null,
    },
  },

  // ── Banu Haqim ──
  banuHaqim: {
    passive: {
      name: "Silence of Death",
      icon: `${ICONS}/T_UI_CP_-Silenceofdeath.png`,
      discipline: null,
      description: "All your actions become entirely silent for a period after feeding.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: `${VIDS}/BanuHaqim/Banu_SilenceOfDeath.mp4`,
    },
    strike: {
      name: "Bladed Hand",
      icon: `${ICONS}/T_UI_BladedHand.png`,
      discipline: "bloodSorcery",
      description: "A silent attack that slashes swiftly in front of you, instantly beheading weaker opponents.",
      bloodPips: 3, channeled: false,
      resonance: { san: 100, mel: 50, cho: 0 },
      video: `${VIDS}/BanuHaqim/Banu_BladedHand.mp4`,
    },
    relocate: {
      name: "Split Second",
      icon: `${ICONS}/T_UI_SplitSecond.png`,
      discipline: "celerity",
      description: "Move so fast that time appears to stop around you.\n\nFeeding terminates Split Second.",
      bloodPips: 2, channeled: true,
      resonance: { san: 100, mel: 0, cho: 250 },
      video: `${VIDS}/BanuHaqim/Banu_SplitSecond.mp4`,
    },
    affect: {
      name: "Mute",
      icon: `${ICONS}/T_UI_Mute.png`,
      discipline: "obfuscate",
      description: "Silence an individual so neither their screams nor weapons can be heard by others.",
      bloodPips: 2, channeled: false,
      resonance: { san: 150, mel: 400, cho: 0 },
      video: `${VIDS}/BanuHaqim/Banu%20Mute.mp4`,
    },
    mastery: {
      name: "Unseen Aura",
      icon: `${ICONS}/T_UI_UnseenAura.png`,
      discipline: "obfuscate",
      description: "Become temporarily invisible to others. Note: You can still be heard.\n\nStaying still increases the ability's duration.\n\nFeeding on vampires terminates Unseen Aura.",
      bloodPips: 5, channeled: true,
      resonance: { san: 300, mel: 650, cho: 0 },
      video: `${VIDS}/BanuHaqim/Banu%20Unseen%20Aura.mp4`,
    },
    perk: {
      name: "Unseen Passage",
      icon: null,
      discipline: null,
      description: "Sprinting while crouched triggers a fast prowl, low to the ground.\n\nPerks stack. Unlock all six to experience the Nomad's true power.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: null,
    },
  },

  // ── Ventrue ──
  ventrue: {
    passive: {
      name: "Flesh of Marble",
      icon: `${ICONS}/T_UI_CP_LayeredFortitude.png`,
      discipline: null,
      description: "Feeding hardens your skin, making you highly resistant to damage.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: `${VIDS}/Ventrue/Ventrue_FleshOFMarble.mp4`,
    },
    strike: {
      name: "Terminal Decree",
      icon: `${ICONS}/T_UI_TerminalDecree.png`,
      discipline: "dominate",
      description: "Use your strength of will to command a mortal to kill themselves. Vampires will be staggered and disarmed.",
      bloodPips: 3, channeled: false,
      resonance: { san: 0, mel: 50, cho: 100 },
      video: `${VIDS}/Ventrue/Ventrue_TerminalDecree.mp4`,
    },
    relocate: {
      name: "Possession",
      icon: `${ICONS}/T_UI_Icon_Possesion.png`,
      discipline: "dominate",
      description: "Possess an opponent to see through their eyes and control their movement for a period. While possessed, the target can be commanded to attack another person.\n\nVentrue and Affect abilities can be cast while possessing someone.",
      bloodPips: 3, channeled: false,
      resonance: { san: 0, mel: 100, cho: 250 },
      video: `${VIDS}/Ventrue/Ventrue_Posession.mp4`,
    },
    affect: {
      name: "Cloud Memory",
      icon: `${ICONS}/T_UI_CloudMemory.png`,
      discipline: "dominate",
      description: "Cause a target to forget you were there, putting them into a relaxed state.",
      bloodPips: 3, channeled: false,
      resonance: { san: 0, mel: 150, cho: 400 },
      video: `${VIDS}/Ventrue/Ventrue_CloudMemory.mp4`,
    },
    mastery: {
      name: "Mass Manipulation",
      icon: `${ICONS}/T_UI_MassManipulation.png`,
      discipline: "dominate",
      description: "Subdue enemies within view, preventing them from attacking. Ventrue and Affect abilities will apply to all subdued opponents while Mass Manipulation is active.",
      bloodPips: 4, channeled: false,
      resonance: { san: 650, mel: 0, cho: 300 },
      video: `${VIDS}/Ventrue/Ventrue_MassManipulaion.mp4`,
    },
    perk: {
      name: "Resilience",
      icon: null,
      discipline: null,
      description: "Increases the amount of health restored by feeding.\n\nPerks stack. Unlock all six to experience the Nomad's true power.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: null,
    },
  },

  // ── Lasombra ──
  lasombra: {
    passive: {
      name: "Shadow Cloak",
      icon: `${ICONS}/T_UI_CP_Shadowcloak.png`,
      discipline: null,
      description: "Become harder to see for duration after feeding, slowing enemy detection.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: `${VIDS}/Lasombra/Lasombra_ShadowCloak.mp4`,
    },
    strike: {
      name: "Arms of Ahriman",
      icon: `${ICONS}/T_UI_ArmofAhriman.png`,
      discipline: "oblivion",
      description: "Strike with a thin shadow across the ground. Opponents caught by it will be temporarily trapped in place unless damaged.\n\nFeeding terminates Arms of Ahriman.",
      bloodPips: 3, channeled: false,
      resonance: { san: 100, mel: 50, cho: 0 },
      video: `${VIDS}/Lasombra/Lasombra_ArmsOfArhiman.mp4`,
    },
    relocate: {
      name: "Shadow Step",
      icon: `${ICONS}/T_UI_Shadowstep.png`,
      discipline: "oblivion",
      description: "Step into your own shadow and swiftly emerge from the shadow of your target.",
      bloodPips: 2, channeled: false,
      resonance: { san: 0, mel: 250, cho: 100 },
      video: `${VIDS}/Lasombra/Lasombra_ShadowStep.mp4`,
    },
    affect: {
      name: "Glimpse of Oblivion",
      icon: `${ICONS}/T_UI_Glimpseofoblivion.png`,
      discipline: "dominate",
      description: "Cause an individual to become afraid, fleeing their post and running from their allies.\n\nTarget gains Melancholic blood resonance.",
      bloodPips: 3, channeled: false,
      resonance: { san: 0, mel: 150, cho: 400 },
      video: `${VIDS}/Lasombra/Lasombra_GlimpseOfOblivion.mp4`,
    },
    mastery: {
      name: "Enter Oblivion",
      icon: `${ICONS}/T_UI_EnterOblivion.png`,
      discipline: "oblivion",
      description: "Cast a broad shadow ahead of you, then temporarily enter a dimension where only you and others touched by the shadow exist.",
      bloodPips: 4, channeled: true,
      resonance: { san: 0, mel: 650, cho: 300 },
      video: `${VIDS}/Lasombra/Lasombra_EnterOblivion.mp4`,
    },
    perk: {
      name: "Stygian Shroud",
      icon: null,
      discipline: null,
      description: "Prevents nearby mortals and ghouls from attacking you while feeding.\n\nPerks stack. Unlock all six to experience the Nomad's true power.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: null,
    },
  },

  // ── Toreador ──
  toreador: {
    passive: {
      name: "Cat's Grace",
      icon: `${ICONS}/T_UI_Icon_Fleetness.png`,
      discipline: null,
      description: "Move faster after feeding.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: `${VIDS}/Toreador/Toreador_Fleetness.mp4`,
    },
    strike: {
      name: "Entrancing Kiss",
      icon: `${ICONS}/T_UI_Icon_EntrancingKiss.png`,
      discipline: "presence",
      description: "Kiss an individual to Entrance them for a period, making them an ally that will defend you from others. The weaker the will of the target, the longer they will be Entranced.",
      bloodPips: 2, channeled: false,
      resonance: { san: 50, mel: 0, cho: 100 },
      video: `${VIDS}/Toreador/Toreador_EntrancingKiss.mp4`,
    },
    relocate: {
      name: "Blink",
      icon: `${ICONS}/T_UI_Icon_Blink.png`,
      discipline: "celerity",
      description: "Instantly dash to a targeted location.\n\nKnocks over enemies that you Blink into.",
      bloodPips: 1, channeled: false,
      resonance: { san: 0, mel: 100, cho: 250 },
      video: `${VIDS}/Toreador/Toreador_Blink.mp4`,
    },
    affect: {
      name: "Beckon",
      icon: `${ICONS}/T_UI_Icon_Beckon.png`,
      discipline: "presence",
      description: "Put an individual into a docile trance where they will walk to where they last saw you.\n\nTarget gains Sanguine blood resonance.",
      bloodPips: 2, channeled: false,
      resonance: { san: 400, mel: 150, cho: 0 },
      video: `${VIDS}/Toreador/Toreador_Beckon.mp4`,
    },
    mastery: {
      name: "Blurred Momentum",
      icon: `${ICONS}/T_UI_Icon_BlurredMovement.png`,
      discipline: "celerity",
      description: "Temporarily boost your reflexes, allowing you to evade damage.\n\nParries all melee attacks.",
      bloodPips: 5, channeled: true,
      resonance: { san: 0, mel: 300, cho: 650 },
      video: `${VIDS}/Toreador/Toreador_BlurredMomentum.mp4`,
    },
    perk: {
      name: "Fleetness",
      icon: null,
      discipline: null,
      description: "Relocate abilities will recharge over time.\n\nPerks stack. Unlock all six to experience the Nomad's true power.",
      bloodPips: 0, channeled: false,
      resonance: { san: 0, mel: 0, cho: 0 },
      video: null,
    },
  },
};

// ── Fabien (Malkavian) ───────────────────────────────────────
// All abilities are always unlocked. Displayed as a single vertical column.
const FABIEN_ABILITIES = [
  {
    tier: "passive",
    name: "Fast Forward",
    icon: `${CLAN_LOGOS}/T_UI_ClanLogo_Malkavian.png`,
    discipline: null,
    description: "Accelerate memory, zipping through the everyday hustle when moving through Seattle.",
    bloodPips: 1, channeled: false,
  },
  {
    tier: "relocate",
    name: "Mask of a Thousand Faces",
    icon: `${ICONS}/T_UI_MaskofaThousandFaces.png`,
    discipline: "obfuscate",
    description: "Appear to an individual as someone they expect to meet. Stay in character during conversations to maintain the illusion.",
    bloodPips: 1, channeled: false,
  },
  {
    tier: "affect",
    name: "Forgetful Mind",
    icon: `${ICONS}/T_UI_ForgetfullMind.png`,
    discipline: "dominate",
    description: "Remove inconvenient memories from an individual.",
    bloodPips: 1, channeled: false,
  },
  {
    tier: "strike",
    name: "Spirit's Touch",
    icon: `${ICONS}/T_UI_SpiritsTouch.png`,
    discipline: null,
    description: "Gain hidden insights from an inanimate object - such as an interesting item, or a corpse.",
    bloodPips: 1, channeled: false,
  },
  {
    tier: "mastery",
    name: "Scry the Soul",
    icon: `${ICONS}/T_UI_ScryTheSoul.png`,
    discipline: null,
    description: "Get a sense of an individual's thoughts, revealing information they are trying to conceal from you.",
    bloodPips: 1, channeled: false,
  },
];

// ── UI Assets ────────────────────────────────────────────────
const UI = {
  // Button backgrounds
  btnLocked:             `${ASSETS}/T_AbilityTree_ButtonBg_Locked.png`,
  btnLockedHover:        `${ASSETS}/T_AbilityTree_ButtonBg_Locked_Hover.png`,
  btnNotEquipped:        `${ASSETS}/T_AbilityTree_ButtonBg_NotEquipped.png`,
  btnNotEquippedHover:   `${ASSETS}/T_AbilityTree_ButtonBg_NotEquipped_Hover.png`,
  btnEquipped:           `${ASSETS}/T_AbilityTree_ButtonBg_Equipped.png`,
  btnEquippedHover:      `${ASSETS}/T_AbilityTree_ButtonBg_Equipped_Hover.png`,
  btnOutline:            `${ASSETS}/T_AbilityTree_ButtonBg_Outline.png`,
  btnWhite:              `${ASSETS}/T_AbilityTree_ButtonBg_White.png`,

  // Perk button backgrounds
  perkLocked:            `${ASSETS}/T_AbilityTree_Perk_ButtonBg_Locked.png`,
  perkLockedHover:       `${ASSETS}/T_AbilityTree_Perk_ButtonBg_Locked_Hover.png`,
  perkNotEquipped:       `${ASSETS}/T_AbilityTree_Perk_ButtonBg_NotEquipped.png`,
  perkNotEquippedHover:  `${ASSETS}/T_AbilityTree_Perk_ButtonBg_NotEquipped_Hover.png`,
  perkEquipped:          `${ASSETS}/T_AbilityTree_Perk_ButtonBg_Equipped.png`,
  perkEquippedHover:     `${ASSETS}/T_AbilityTree_Perk_ButtonBg_Equipped_Hover.png`,
  perkOutline:           `${ASSETS}/T_AbilityTree_Perk_ButtonBg_Outline.png`,
  perkWhite:             `${ASSETS}/T_AbilityTree_Perk_ButtonBg_White.png`,

  // State overlays
  bigNPurchased:         `${FLAT}/T_UI_Big_NPurchased.png`,
  bigPurchased:          `${FLAT}/T_UI_Big_Purchased.png`,
  bigPurchasedSelected:  `${FLAT}/T_UI_Big_Purchased_Selected.png`,
  bigPurchasedOutline:   `${FLAT}/T_UI_Big_Purchased_Outline.png`,
  lockIcon:              `${FLAT}/T_UI_Keylockicon.png`,

  // Blood resonance icons (small, for cost display)
  resSanguine:           `${TRAINER}/T_UI_ClanTrainer_Blood1.png`,
  resMelancholic:        `${TRAINER}/T_UI_ClanTrainer_Blood3.png`,
  resCholeric:           `${TRAINER}/T_UI_ClanTrainer_Blood2.png`,

  // Blood resonance icons (larger, for sidebar)
  resSanguineLg:         `${TRAINER}/T_UI_BloodResonance_Sanguine.png`,
  resMelancholicLg:      `${TRAINER}/T_UI_BloodResonance_Melancholic.png`,
  resCholericLg:         `${TRAINER}/T_UI_BloodResonance_Choleric.png`,

  // Misc
  bloodPipIcon:          `${TEX}/T_UI_HUD_BloodMeterIcon.png`,
  cheaperMarker:         `${TEX}/T_UI_CheaperCostMarker.png`,
  phyreMark:             `${CLAN_LOGOS}/T_UI_ClanLogo_PhyreMark.png`,
  arrow:                 `${ASSETS}/T_AbilityTree_Arrow.png`,
  underline:             `${ASSETS}/T_AbilityTree_AbilityUnderline.png`,
  vidBorder:             `${ASSETS}/T_AbilityTree_VidBorder.png`,
  questionMark:          `${TEX}/N_Textures/AbilityTree/T_UI_QuestionMark.png`,
  columnGradient:        `${COLUMNS}/T_UI_ClanColumn_Gradient.png`,

  // Branding
  vtmLogo:               `${TEX}/UI_TITLE_VtM_01.png`,
  skilltreeBg:           `${TEX}/T_UI_SKILLTREE_Background_2058_.png`,

  // Clan selection
  clanContainer:         `${CLAN_SEL}/T_UI_ClanIconContainer.png`,
  clanContainerSelected: `${CLAN_SEL}/T_UI_ClanIconContainer_Selected.png`,
  clanContainerCompSel:  `${CLAN_SEL}/T_UI_ClanIconContainer_COMPLETED_Selected.png`,
  clanSelectBg:          `${CLAN_SEL}/T_UI_ClanSelect_Bg.png`,
  clanSelectOutline:     `${CLAN_SEL}/T_UI_ClanSelect_Outline.png`,
  clanSelectOutlineSel:  `${CLAN_SEL}/T_UI_ClanSelect_Outline_Selected.png`,

  // Outfit UI
  outfitLock:            `${TEX}/N_Textures/Outfit/T_UI_Outfits_LockContainer.png`,
  outfitBorder:          `${TEX}/N_Textures/Outfit/T_UI_Outfits_ButtonBoarder.png`,
  outfitBase:            `${TEX}/N_Textures/Outfit/T_UI_Outfits_ButtonBase.png`,
  outfitHighlight:       `${TEX}/N_Textures/Outfit/T_UI_Outfits_Highlight.png`,
  outfitClanBacking:     `${TEX}/N_Textures/Outfit/T_UI_Outfits_ClanBacking.png`,
  outfitEquipped:        `${TEX}/N_Textures/Outfit/T_UI_Icon_Equipped.png`,
  blockedPadlock:        `${TEX}/N_Textures/General/T_UI_Icon_Lock.png`,
};

// ── Outfit Data ──────────────────────────────────────────────
const SILO = `${TEX}/N_Textures/Outfit/Silhouettes`;

const OUTFITS = {
  brujah: [
    { name: "The Drifter",   tier: "strike",   type: "grunge",     thumb: `${SILO}/T_UI_Thumb_Phyre_Brujah_03.png` },
    { name: "The Brawler",   tier: "relocate",  type: "strong",     thumb: `${SILO}/T_UI_Thumb_Phyre_Brujah_04.png` },
    { name: "The Rebel",     tier: "affect",    type: "strong",     thumb: `${SILO}/T_UI_Thumb_Phyre_Brujah_01.png` },
    { name: "The Outcast",   tier: "mastery",   type: "strong",     thumb: `${SILO}/T_UI_Thumb_Phyre_Brujah_02.png` },
  ],
  tremere: [
    { name: "The Trickster", tier: "strike",   type: "grunge",     thumb: `${SILO}/T_UI_Thumb_Phyre_Tremere_01.png` },
    { name: "The Warlock",   tier: "relocate",  type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Tremere_04.png` },
    { name: "The Mage",      tier: "affect",    type: "attractive", thumb: `${SILO}/T_UI_Thumb_Phyre_Tremere_03.png` },
    { name: "The Magister",  tier: "mastery",   type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Tremere_02.png` },
  ],
  banuHaqim: [
    { name: "The Stalker",   tier: "strike",   type: "grunge",     thumb: `${SILO}/T_UI_Thumb_Phyre_Banu_Haqim_03.png` },
    { name: "The Slayer",    tier: "relocate",  type: "grunge",     thumb: `${SILO}/T_UI_Thumb_Phyre_Banu_Haqim_04.png` },
    { name: "The Sheriff",   tier: "affect",    type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Banu_Haqim_01.png` },
    { name: "The Justicar",  tier: "mastery",   type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Banu_Haqim_02.png` },
  ],
  ventrue: [
    { name: "The Seneschal", tier: "strike",   type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Ventrue_02.png` },
    { name: "The Prince",    tier: "relocate",  type: "attractive", thumb: `${SILO}/T_UI_Thumb_Phyre_Ventrue_04.png` },
    { name: "The Herald",    tier: "affect",    type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Ventrue_01.png` },
    { name: "The General",   tier: "mastery",   type: "attractive", thumb: `${SILO}/T_UI_Thumb_Phyre_Ventrue_03.png` },
  ],
  lasombra: [
    { name: "The Atheist",       tier: "strike",   type: "strong",     thumb: `${SILO}/T_UI_Thumb_Phyre_LaSombra_04.png` },
    { name: "The Shadowdancer",  tier: "relocate",  type: "attractive", thumb: `${SILO}/T_UI_Thumb_Phyre_LaSombra_02.png` },
    { name: "The Sin Eater",     tier: "affect",    type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_LaSombra_01.png` },
    { name: "The Priest",        tier: "mastery",   type: "priest",     thumb: `${SILO}/T_UI_Thumb_Phyre_LaSombra_03.png` },
  ],
  toreador: [
    { name: "The Player",   tier: "strike",   type: "attractive", thumb: `${SILO}/T_UI_Thumb_Toreador_01.png` },
    { name: "The Poet",     tier: "relocate",  type: "attractive", thumb: `${SILO}/T_UI_Thumb_Toreador_02.png` },
    { name: "The Elder",    tier: "affect",    type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Toreador_04.png` },
    { name: "The Diva",     tier: "mastery",   type: "attractive", thumb: `${SILO}/T_UI_Thumb_Toreador_03.png` },
  ],
};

// ── Outfit Type Reactions ────────────────────────────────────
// For each outfit type: NPC reactions by resonance, plus conversation options
// reactions[npcType][resonance] = true (positive) / false (negative)
const OUTFIT_TYPES = {
  grunge: {
    label: "Grunge",
    convo: ["I would be your friend.", "Give me all you have."],
    reactions: {
      homeless:  { san: false, mel: true,  cho: true },
      biker:    { san: true,  mel: false, cho: true },
      streetwalker: { san: false, mel: true,  cho: false },
      business: { san: false, mel: true,  cho: true },
    },
  },
  strong: {
    label: "Strong",
    convo: ["You look fun.", "You look weak."],
    reactions: {
      homeless:  { san: false, mel: true,  cho: false },
      biker:    { san: true,  mel: false, cho: false },
      streetwalker: { san: true,  mel: true,  cho: false },
      business: { san: true,  mel: true,  cho: false },
    },
  },
  priest: {
    label: "Priest",
    convo: ["Bless You.", "Damn you."],
    reactions: {
      homeless:  { san: false, mel: false, cho: true },
      biker:    { san: false, mel: true,  cho: true },
      streetwalker: { san: false, mel: false, cho: true },
      business: { san: false, mel: false, cho: true },
    },
  },
  wealthy: {
    label: "Wealthy",
    convo: ["You are just my type.", "You are pathetic."],
    reactions: {
      homeless:  { san: false, mel: true,  cho: true },
      biker:    { san: false, mel: true,  cho: true },
      streetwalker: { san: true,  mel: true,  cho: false },
      business: { san: true,  mel: true,  cho: true },
    },
  },
  attractive: {
    label: "Attractive",
    convo: ["Let us make something beautiful.", "You will like how I hurt you."],
    reactions: {
      homeless:  { san: false, mel: false, cho: true },
      biker:    { san: true,  mel: true,  cho: false },
      streetwalker: { san: false, mel: false, cho: true },
      business: { san: false, mel: false, cho: true },
    },
  },
};

// ── Affect Abilities in Conversation ─────────────────────────
// Which affect abilities work on which NPC types
const AFFECT_REACTIONS = {
  beckon:              { homeless: false, biker: true,  streetwalker: true,  business: true },
  glimpseOfOblivion:   { homeless: true,  biker: false, streetwalker: true,  business: true },
  taunt:               { homeless: true,  biker: true,  streetwalker: false, business: true },
};

// ── Conversation Disposition ─────────────────────────────────
// First convo = friendly, Second convo = aggressive, plus disposition options
const CONVO_EFFECTS = {
  friendly:   { homeless: { san: false, mel: false, cho: true },  biker: { san: false, mel: true,  cho: false }, streetwalker: { san: false, mel: true,  cho: false }, business: { san: false, mel: false, cho: false } },
  aggressive: { homeless: { san: true,  mel: true,  cho: false }, biker: { san: true,  mel: false, cho: false }, streetwalker: { san: true,  mel: false, cho: false }, business: { san: true,  mel: true,  cho: true } },
};

const DISPOSITIONS = {
  sage:   { quote: "You cannot match my wit",  homeless: { san: false, mel: false, cho: false }, biker: { san: false, mel: false, cho: false }, streetwalker: { san: true, mel: false, cho: false }, business: { san: false, mel: false, cho: false } },
  empath: { quote: "I can see your heart",     homeless: { san: false, mel: false, cho: true },  biker: { san: false, mel: true,  cho: false }, streetwalker: { san: false, mel: true,  cho: false }, business: { san: false, mel: false, cho: false } },
  bully:  { quote: "I can destroy you",        homeless: { san: true,  mel: true,  cho: false }, biker: { san: true,  mel: false, cho: false }, streetwalker: { san: true,  mel: false, cho: false }, business: { san: true,  mel: true,  cho: true } },
};
