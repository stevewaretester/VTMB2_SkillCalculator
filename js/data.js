// VTMB2 Skill Calculator - Game Data
// ====================================

const TEX = "assets";
const ICONS = `${TEX}/N_Textures/AbilityTree/AbilitiesIcons`;
const CLAN_LOGOS = `${ICONS}/ClanLogos`;
const ASSETS = `${TEX}/N_Textures/AbilityTree/Assets`;
const FLAT = `${TEX}/N_Textures/AbilityTree/Flat_Textures`;
const COLUMNS = `${TEX}/AbilityTreeIcons/ClanColumns`;
const AFFINITY_UI = `${TEX}/ClanAffinityUI`;
const CLAN_SEL = `${TEX}/N_Textures/ClanSelection`;
const TRAINER = `${TEX}/N_Textures/ClanTrainer`;
const VIDS = "assets/vids";

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
    descr: "The Brujah's power lies in their strength and swiftness. They use these skills to turn the tide of battle — acting fast, hitting hard, and goading their foes into making a fatal move. A Brujah is an unstoppable force in a fight, their unparalleled prowess ensuring they remain on top.",
    mastery: "NORMAL",
    trainerName: "Silky",
    trainerPos:  "Silky at The Dutchman",
  },
  tremere: {
    name: "Tremere",
    affinities: ["bloodSorcery", "dominate"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_Tremere.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_Tremere_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Tremere.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_Tremere.png`,
    color: "#6b2fa0",
    descr: "Members of Clan Tremere wield arcane powers and can bend blood to their will, weaponizing it against their foes. Their sorcery affects not only their own Blood but also that of their enemies, and they are able to inflict great pain and destruction on those that oppose them.",
    mastery: "NORMAL",
    trainerName: "Mrs. Thorn",
    trainerPos:  "Mrs. Thorn at Wake the Dead",
  },
  banuHaqim: {
    name: "Banu Haqim",
    affinities: ["celerity", "bloodSorcery", "obfuscate"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_BamuHaquim.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_BanuHaqim_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Banu.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_BanuHaqim.png`,
    color: "#1a3a5c",
    descr: "The Banu Haqim are silent judges, lawbringers, and executioners. Swift and deadly, they can silence and dispatch their foes through both violence and sorcery. Banu Haqim can take down an enemy with chilling precision in the blink of a mortal eye, before disappearing without a trace.",
    mastery: "HARD",
    trainerName: "Niko",
    trainerPos:  "Niko at Aurora Pawn",
  },
  ventrue: {
    name: "Ventrue",
    affinities: ["dominate", "presence"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_Venture.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_Ventrue_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Ventrue.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_Ventrue.png`,
    color: "#b8962e",
    descr: "The Ventrue are masters of control, subduing and puppeteering others through sheer force of personality and will. They can freeze enemies in their tracks, turn them against each other, or make them forget they were even there. The Ventrue's resilience also allows them to withstand attacks and survive inevitable reprisals.",
    mastery: "EASY",
    trainerName: "Fletcher",
    trainerPos:  "Fletcher at Makom Bar",
  },
  lasombra: {
    name: "Lasombra",
    affinities: ["oblivion", "potence", "dominate"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_Lasombra.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_Lasombra_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Lasombra.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_Lasombra.png`,
    color: "#2a2a3a",
    descr: "Lasombra use their power to stoke the fires of fear in enemies and allies alike. Masters of shadow, they bend the darkness to their will. Capable of nightmarish feats, they weaponize their control of shadows to isolate, ensnare, and instill dread in any target.",
    mastery: "HARD",
    trainerName: "Onda",
    trainerPos:  "Onda at Glacier Hotel",
  },
  toreador: {
    name: "Toreador",
    affinities: ["celerity", "presence"],
    logo:          `${CLAN_LOGOS}/T_UI_ClanLogo_Toreador.png`,
    logoCompleted: `${CLAN_LOGOS}/T_UI_ClanLogo_Toreador_COMPLETED.png`,
    column:        `${COLUMNS}/T_UI_ClanColumn_Toreador.png`,
    pattern:       `${CLAN_SEL}/ClanPattern/T_UI_ClanSelect_Pattern_Toreador.png`,
    color: "#1a8a7a",
    descr: "The Toreador's enthralling presence allows them to make the first move, often before their enemy has a chance to react. They can entrance their victims and enemies, luring them in and blinding them to the danger in front of them — until it is too late.",
    mastery: "NORMAL",
    trainerName: "Patience",
    trainerPos:  "Patience at Aurora Pawn",
  },
};

const CLAN_ORDER = ["brujah", "tremere", "banuHaqim", "ventrue", "lasombra", "toreador"];

// ── Completion Talents (Clan Completion Talents mod) ─────────
const COMPLETION_FRAME = 'assets/CompletionTalents/frame_completed.png';

const BLOOD_HEAL_TALENT = {
  name:          'Blood Heal',
  nameCompleted: 'Blood Quickening',
  icon:          'assets/CompletionTalents/blood_heal.png',
  bloodPips:     2,
  input:         'While holding nothing, sprint+feed ([shift]+[F])',
  lines:         [
    'Restore 20 HP and cleanse blood of ongoing boiling.',
  ],
  linesCompleted:[
    'Restore 20 HP and cleanse blood of ongoing boiling.',
    'Quickening: Also activates your Clan Passive.',
  ],
};

const COMPLETION_TALENTS = {
  brujah:    {
    name: 'Titanfist',
    icon: 'assets/CompletionTalents/brujah_titanfist.png',
    iconRotate: 270,
    bloodPips: 1,
    input: 'While holding a throwable with TK, sprint+attack ([shift]+[m1])',
    lines: ['Throw objects with lethal force, eliminating most enemies in a single hit.'],
  },
  tremere:   {
    name: 'Bloodcraft',
    icon: 'assets/CompletionTalents/tremere_bloodcraft.png',
    bloodPips: 2,
    input: 'While holding a weapon or elixir with TK, sprint+feed ([shift]+[F])',
    lines: [
      'Use blood to manipulate objects.',
      '• Duplicate melee weapons.',
      '• Reload guns.',
      '• Swap elixirs for an equivalent.',
    ],
    subLines: [
      '<img class="cct-elixir-icon" src="assets/ElixirIcons/sil_bloodhealth.png" alt="Mending"> ⇌ <img class="cct-elixir-icon" src="assets/ElixirIcons/sil_bloodpips.png" alt="Blood">',
      '<img class="cct-elixir-icon" src="assets/ElixirIcons/sil_armor.png" alt="Fortitude"> ⇌ <img class="cct-elixir-icon" src="assets/ElixirIcons/sil_damage.png" alt="Potence">',
      '<em>(This does not cost additional blood pips.)</em>',
    ],
  },
  banuHaqim: {
    name: 'Distraction',
    icon: 'assets/CompletionTalents/banu_distraction.png',
    input: 'With nothing in hand, sprint+abilities ([shift]+[rightclick])',
    lines: [
      'Creates a small distraction at the location, drawing NPCs toward it.',
      'Does not influence targets in combat or otherwise preoccupied.',
      'Has a short cooldown.',
    ],
  },
  ventrue:   {
    name: 'Discerning Tastes',
    icon: 'assets/CompletionTalents/ventrue_discerning.png',
    input: 'Passive',
    lines: [
      'Mentally influences partially resonant targets so they are always willing to talk.',
      'Gain double resonance from targets you feed on',
      'Restore one additional blood pip per ability when feeding on resonant targets.',
    ],
  },
  lasombra:  {
    name: 'Shadow Cache',
    icon: 'assets/CompletionTalents/lasombra_distraction.png',
    input: 'With a TK-held object in hand, sprint+interact ([shift]+[E])',
    lines: [
      'Stores objects in the shadow realm for later summoning.',
      'Use again with empty hands to summon the stored object.',
      'Also vanishes corpses.',
    ],
  },
  toreador:  {
    name: 'Alacrity',
    icon: 'assets/CompletionTalents/toreador_alacrity.png',
    input: 'sprint+TK ([shift]+[Q])',
    lines: [
      'Siphon speed from a target, slowing them while increasing your speed.',
      'Has a short cooldown before it can be used again.',
    ],
  },
};

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
const CONVO_ABILITIES = new Set(["Beckon", "Taunt", "Glimpse of Oblivion"]);
const CONVO_ICON = `${TEX}/T_UI_Icons_Codex_ConversationAvailable.png`;
const FEEDABLE = new Set([
  "Earthshock", "Unseen Aura", "Enter Oblivion", "Cauldron of Blood",
  "Cloud Memory", "Beckon", "Split Second", "Possession",
  "Shadow Step", "Terminal Decree", "Arms of Ahriman", "Entrancing Kiss",
]);
const FEED_ICON = `${TEX}/T_UI_BossFeedPlaceholder.png`;
const CANCELLABLE = new Set(["Blood Salvo", "Enter Oblivion", "Possession", "Recall", "Blink"]);
const CANCEL_ICON = "assets/N_Textures/General/T_UI_HUD_LightingStrike_Target.png";
const CANCEL_NOTES = {
  "Blood Salvo":    "Cancelling restores 1 blood pip per remaining blade.",
  "Enter Oblivion": "Cancelling will kill any enemies held by Arms of Ahriman.",
  "Recall":         "Cancelling will return the sigil to be placed somewhere else.",
};

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
      { label: "Prowl", initial: 35, perSec: 9, noise: 550, notice: 300, violent: false, noiseWarn: true },
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

  // DLC
  bennyLogo:             `${CLAN_LOGOS}/T_UI_BennyLogo.png`,

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
    { name: "The Drifter",   tier: "strike",   type: "grunge",     thumb: `${SILO}/T_UI_Thumb_Phyre_Brujah_03.png`,     desc: "Not the kind to settle down, or to stick with the status quo. They'd make their own path no matter the odds." },
    { name: "The Brawler",   tier: "relocate",  type: "strong",     thumb: `${SILO}/T_UI_Thumb_Phyre_Brujah_04.png`,     desc: "They moved through the world like a raging bull, and you knew not to stand in the way." },
    { name: "The Rebel",     tier: "affect",    type: "strong",     thumb: `${SILO}/T_UI_Thumb_Phyre_Brujah_01.png`,     desc: "This one looked like trouble. The kind that kicks down doors and dares the world to push back." },
    { name: "The Outcast",   tier: "mastery",   type: "strong",     thumb: `${SILO}/T_UI_Thumb_Phyre_Brujah_02.png`,     desc: "Someone who didn't fit in, and didn't give a damn, with no time for the rules and no patience for fools." },
  ],
  tremere: [
    { name: "The Trickster", tier: "strike",   type: "grunge",     thumb: `${SILO}/T_UI_Thumb_Phyre_Tremere_01.png`,    desc: "A whip-smart survivor of the streets, quick of hand and mind, and always too clever for the opposition." },
    { name: "The Warlock",   tier: "relocate",  type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Tremere_04.png`,    desc: "The clear gaze of a subtle mind, and a controlled, brooding aura that hinted at deep mastery." },
    { name: "The Mage",      tier: "affect",    type: "attractive", thumb: `${SILO}/T_UI_Thumb_Phyre_Tremere_03.png`,    desc: "They looked like they'd been through hell and fought their way back with blood-sorcery and style." },
    { name: "The Magister",  tier: "mastery",   type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Tremere_02.png`,    desc: "Steeped in power and lore, a master of the arcane arts, skills honed by long years of deadly application." },
  ],
  banuHaqim: [
    { name: "The Stalker",   tier: "strike",   type: "grunge",     thumb: `${SILO}/T_UI_Thumb_Phyre_Banu_Haqim_03.png`, desc: "A moment of silence, a gleam in the dark, and an end to existence. Look, and they were already gone." },
    { name: "The Slayer",    tier: "relocate",  type: "grunge",     thumb: `${SILO}/T_UI_Thumb_Phyre_Banu_Haqim_04.png`, desc: "It was clear they'd spent their time going toe-to-toe with monsters - human, Kindred, or otherwise." },
    { name: "The Sheriff",   tier: "affect",    type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Banu_Haqim_01.png`, desc: "Steely-eyed and standing tall, this one would be found right at the heart of the matter." },
    { name: "The Justicar",  tier: "mastery",   type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Banu_Haqim_02.png`, desc: "When an act deserved to reap the consequences, this might just be the face of your judgement." },
  ],
  ventrue: [
    { name: "The Seneschal", tier: "strike",   type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Ventrue_02.png`,    desc: "Considered, urbane, this one looked like they knew which levers to pull and where to apply the pressure." },
    { name: "The Prince",    tier: "relocate",  type: "attractive", thumb: `${SILO}/T_UI_Thumb_Phyre_Ventrue_04.png`,    desc: "Strength and power clothed in a panther-like grace, and an aura of command that you could feel a mile away." },
    { name: "The Herald",    tier: "affect",    type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_Ventrue_01.png`,    desc: "The considered courtesy of the true political adept, masking the iron will of centuries of survival." },
    { name: "The General",   tier: "mastery",   type: "attractive", thumb: `${SILO}/T_UI_Thumb_Phyre_Ventrue_03.png`,    desc: "They had earned that arrogant stance through years of decisive victory, leaving corpses in their wake." },
  ],
  lasombra: [
    { name: "The Atheist",       tier: "strike",   type: "strong",     thumb: `${SILO}/T_UI_Thumb_Phyre_LaSombra_04.png`,  desc: "Their very presence drew the light away - an inescapable spiral into velvet darkness." },
    { name: "The Shadowdancer",  tier: "relocate",  type: "attractive", thumb: `${SILO}/T_UI_Thumb_Phyre_LaSombra_02.png`,  desc: "A beguiling form of smoke and shadow that drew the eye into danger and delight." },
    { name: "The Sin Eater",     tier: "affect",    type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Phyre_LaSombra_01.png`,  desc: "A true creature of the night, seemingly clothed in centuries of the world's transgressions." },
    { name: "The Priest",        tier: "mastery",   type: "priest",     thumb: `${SILO}/T_UI_Thumb_Phyre_LaSombra_03.png`,  desc: "They seemed the chosen predator of the divine - a single glance and they would know every one of your sins." },
  ],
  toreador: [
    { name: "The Player",   tier: "strike",   type: "attractive", thumb: `${SILO}/T_UI_Thumb_Toreador_01.png`,         desc: "Sleek, sharp, and wicked, they moved like nothing human and their eyes were just for you, only you." },
    { name: "The Poet",     tier: "relocate",  type: "attractive", thumb: `${SILO}/T_UI_Thumb_Toreador_02.png`,         desc: "The troubador, the wordsmith, the raconteur - it was in every movement, every gesture, every word." },
    { name: "The Elder",    tier: "affect",    type: "wealthy",    thumb: `${SILO}/T_UI_Thumb_Toreador_04.png`,         desc: "Centuries of wickedness and delicious temptation, wrapped in style and glamor, with a smile that cut like a knife." },
    { name: "The Diva",     tier: "mastery",   type: "attractive", thumb: `${SILO}/T_UI_Thumb_Toreador_03.png`,         desc: "The center of attention, the star of every show. When they walked into a room why would anything else matter?" },
  ],
};

// ── Benny DLC Outfit ────────────────────────────────────────
const BENNY_OUTFIT = {
  name: "The Maverick Cop",
  tier: "strike",
  type: "strong",
  thumb: `${SILO}/T_UI_Thumb_Phyre_Benny.png`,
  fullImg: `assets/screenshot/BennyOutfit.png`,
  desc: "A force of nature wearing the city like a second skin. A simmering volcano on the edge of eruption.",
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

// ── Ability Name → Location Lookup ──────────────────────────
const ABILITY_LOCATION = (() => {
  const map = {};
  for (const [clan, tiers] of Object.entries(ABILITIES)) {
    for (const [tier, ability] of Object.entries(tiers)) {
      if (ability.name) map[ability.name] = { clan, tier };
    }
  }
  // CSV name aliases
  map["Modify Memory"] = map["Cloud Memory"];
  map["Mind Wipe"]     = map["Cloud Memory"];
  return map;
})();

// ── Combos ───────────────────────────────────────────────────
const COMBO_ICON = "assets/N_Textures/General/T_UI_FistOfCaine_Hover.png";

const COMBOS = [
  {
    id: "overclocked",
    name: "Overclocked",
    reference: "Heating up and moving fast",
    referenceUrl: null,
    abilities: ["Cauldron of Blood", "Split Second"],
    explanation: "Hit a target with Cauldron of Blood and feed off them to start regenerating blood pips, then pop Split Second to stop taking damage and freeze time. Split Second will regen during its own timestop making the timestop functionally infinite unless you're out of the CoB buff.\n\nOnly time you're vulnerable is when you're feeding. Lasombra's perk, Banu's Mastery — or a decent health bar — can help with that.",
    rank: "S+", patched: false,
  },
  {
    id: "banish",
    name: "Banish",
    subtitle: "Lasombra Sig. Combo",
    reference: "YouTube",
    referenceUrl: "https://youtu.be/zEytZO4tIYU",
    abilities: ["Enter Oblivion", "Arms of Ahriman"],
    explanation: "Target with Enter Oblivion, then hit with Arms of Ahriman, then end Enter Oblivion — any targets still in Arms will immediately be banished, leaving no corpse.\n\nFastest way to kill multiple heavies.",
    rank: "S", patched: false,
  },
  {
    id: "fist-of-cain",
    name: "Fist of Cain",
    subtitle: "Brujah's Signature Combo",
    reference: "A Potence power in V5",
    referenceUrl: null,
    abilities: ["Taunt", "Lightning Strike"],
    explanation: "Highest single target damage you can do quickly — Taunt increases the damage the target takes and Lightning Strike hits them hard. Good for bosses.",
    rank: "S", patched: false,
  },
  {
    id: "unerring-aim",
    name: "Unerring Aim",
    reference: "Celerity power in V5",
    referenceUrl: null,
    abilities: ["Split Second", "Blood Salvo"],
    explanation: "The main issue with Split Second is it paints the world grey — you can't rely on vampire senses. Blood Salvo highlights enemies with a sticky crosshair, and daggers thrown only travel to the target once Split Second ends. This lets you perform a multi-pronged stealth attack by lining up daggers first — not even giving enemies a chance to dodge.",
    rank: "A+", patched: false,
  },
  {
    id: "purge",
    name: "Purge",
    reference: "Thaumaturgy 2-dot ability in VTMB1",
    referenceUrl: null,
    abilities: ["Mass Manipulation", "Cauldron of Blood"],
    explanation: "Stuns all enemies in the viewable area with the Cauldron of Blood effect — lets you move through a group feeding without fear of repercussion, and does a little damage. Can be looped infinitely until you're down to the last enemy, as you'll always regen Mass Manipulation before it ends on the targets.",
    rank: "A+", patched: false,
  },
  {
    id: "blood-shield",
    name: "Blood Shield",
    reference: "Thaumaturgy 3-dot ability in VTMB1",
    referenceUrl: null,
    abilities: ["Cauldron of Blood", "Blurred Momentum"],
    explanation: "Feed on a target with CoB to regen blood pips. Activate Blurred Momentum to become immune to all other damage (you'll still take a little from CoB's DoT — but this lets you regen Blurred Momentum and/or CoB to continue). Basically god mode. Pick up the Ventrue Perk and you'll always heal back the damage it deals.",
    rank: "A+", patched: true,
  },
  {
    id: "over-overclocked",
    name: "Over-Overclocked",
    reference: null,
    referenceUrl: null,
    abilities: ["Split Second", "Blurred Momentum", "Cauldron of Blood"],
    explanation: "The \"god mode\" combo combining Overclocked with Blood Shield. Now too expensive at 3 abilities to be worth using — but still good, just overkill.\n\n1. Spot a blood-filled enemy.\n2. Activate Split Second and get close.\n3. Target with Cauldron of Blood.\n4. Activate Blurred Momentum — you cannot be attacked during feeding.\n5. Feed.\n6. Continuously activate Blurred Momentum to stay time-stopped.\n7. When blood regen slows, repeat from step 1.\n\nThrow in Bladed Hands and most enemies will fall. The downside is eating 3 ability slots.",
    rank: "A", patched: true,
  },
  {
    id: "entrancement",
    name: "Entrancement",
    subtitle: "Toreador's Signature Combo",
    reference: "A Presence power in V5",
    referenceUrl: null,
    abilities: ["Entrancing Kiss", "Beckon"],
    explanation: "Can two-shot heavies — use Beckon then assassinate, then Entrancing Kiss then feed, which also replenishes blood cost.\n\nGood for Toreador, but a little AP-expensive for others.",
    rank: "A", patched: false,
  },
  {
    id: "mass-suicide",
    name: "Mass Suicide",
    reference: "Dominate 5-dot ability in VTMB1",
    referenceUrl: null,
    abilities: ["Mass Manipulation", "Terminal Decree"],
    explanation: "Fastest way to eliminate groups of small enemies — can completely shut down some encounters. Doesn't kill heavies but disarms them, making them easier to deal with and letting you get a free assassination or feed.",
    rank: "A", patched: false,
  },
  {
    id: "shadow-and-silk",
    name: "Shadow and Silk",
    reference: "The cancelled Day 1 DLC that would have paywalled Lasombra and Toreador",
    referenceUrl: null,
    abilities: ["Shadow Step", "Beckon"],
    explanation: "Shadow Step and Beckon both make the target feedable and both only cost 2 pips — meaning they can be used infinitely.",
    rank: "A", patched: false,
  },
  {
    id: "unseen-strike",
    name: "Unseen Strike",
    subtitle: "Banu Signature Combo",
    reference: "A Celerity/Obfuscate power in V5",
    referenceUrl: null,
    abilities: ["Split Second", "Bladed Hand"],
    explanation: "Bladed Hand can be used while Split Second is active, allowing precision elimination against groups of minis. Its real strength shines against heavies — blade them to half health, then feed during Split Second to immediately eliminate them.",
    rank: "A", patched: false,
  },
  {
    id: "mass-berserk",
    name: "Mass Berserk",
    subtitle: "Ventrue Signature Combo",
    reference: "Dementation 4-dot ability in VTMB1",
    referenceUrl: null,
    abilities: ["Mass Manipulation", "Possession"],
    explanation: "Sends all enemies into an attacking frenzy, taking a lot of pressure off yourself as they'll be focused on each other. Works on every enemy in the game, but obviously fails against single targets.",
    rank: "B+", patched: false,
  },
  {
    id: "blood-bank",
    name: "Blood Bank",
    reference: null,
    referenceUrl: null,
    abilities: ["Blood Salvo", "Mass Manipulation", "Enter Oblivion"],
    explanation: "You can't use these in combo, but you CAN swap off Blood Salvo to Mass Manipulation for free — even if you have daggers out — provided you have at least (blood pips + daggers) = 4 (or 5 for other masteries).\n\nIf you turn a corner with 30 enemies, swap off Blood Salvo to Mass Manipulation for Purge or Mass Suicide.",
    rank: "B", patched: false,
  },
  {
    id: "mass-brawl",
    name: "Mass Brawl",
    reference: null,
    referenceUrl: null,
    abilities: ["Mass Manipulation", "Taunt"],
    explanation: "Disarms all enemies and makes them take more damage, but makes them all target you — advantage as a melee brawler (they take more damage and you can feed easier as they deal less).",
    rank: "B", patched: false,
  },
  {
    id: "crash-down",
    name: "Crash Down",
    reference: "Potence ability in V5",
    referenceUrl: null,
    abilities: ["Blink", "Earthshock"],
    explanation: "Blink above an encounter then drop down and Earthshock to increase the radius of the blast — kills most small enemies immediately.",
    rank: "B", patched: false,
  },
  {
    id: "mass-fear",
    name: "Mass Fear",
    reference: null,
    referenceUrl: null,
    abilities: ["Mass Manipulation", "Glimpse of Oblivion"],
    explanation: "Fears all enemies it hits, sending them into a scrambling panic away from you — useful in combat where you need space, as you can chase down and focus individuals.",
    rank: "B-", patched: false,
  },
  {
    id: "fulminating-vitae",
    name: "Fulminating Vitae",
    reference: "A Blood Sorcery power in V5 (tenuous)",
    referenceUrl: null,
    abilities: ["Blood Curse", "Cauldron of Blood"],
    explanation: "Instantly detonates an enemy previously Blood Cursed, instead of the lengthy wind-up. Can sometimes be triggered the other way — see Blood Boil.",
    rank: "C", patched: false,
  },
  {
    id: "blood-boil",
    name: "Blood Boil",
    subtitle: "Tremere Signature Combo",
    reference: "Thaumaturgy 5-dot ability in VTMB1",
    referenceUrl: null,
    abilities: ["Cauldron of Blood", "Blood Curse"],
    explanation: "Groups enemies around the cauldron target, then causes them to explode thanks to Blood Curse. ONLY worth using from stealth unless targeting a single heavy enemy, where it's a waste of blood.",
    rank: "C", patched: false,
  },
  {
    id: "suicide-bomber",
    name: "Suicide Bomber",
    reference: null,
    referenceUrl: null,
    abilities: ["Blood Curse", "Possession"],
    explanation: "Curse a target, then possess them to attack their allies — when they're hit they'll explode. Not a huge amount of utility, but fun.",
    rank: "C", patched: false,
  },
  {
    id: "inevitable-destruction",
    name: "Inevitable Destruction",
    reference: "Anime trope — someone dying because a powerful move either landed earlier or will be completed",
    referenceUrl: null,
    abilities: ["Blurred Momentum", "Blood Curse"],
    explanation: "Blood Curse's biggest weakness is that it takes time and you can be knocked out of it — well, now you're invulnerable so you can't be knocked out. Safest way to kill bosses as the Tremere. Try to get off a Blood Boil to regen your pips as well.",
    rank: "C", patched: false,
  },
  {
    id: "vision-of-death",
    name: "Vision of Death",
    reference: "Dementation 3-dot ability (tenuous)",
    referenceUrl: null,
    abilities: ["Terminal Decree", "Cloud Memory"],
    explanation: "How Ventrue kills heavies — Terminal Decree to disarm and get off a feed, attack until half health, then Cloud Memory to feed again performing an assassination.\n\nCan be started with Mass Suicide to kill minis first.",
    rank: "C", patched: false,
  },
  {
    id: "a-thousand-cuts",
    name: "A Thousand Cuts",
    reference: "A Celerity power in V5",
    referenceUrl: null,
    abilities: ["Blink", "Lightning Strike"],
    explanation: "Lightning Strike has a deceptively short range, but this matters less when you can close the distance with Blink — blink-kick then Lightning Strike eliminates most enemies and is a great opener against bosses.",
    rank: "C", patched: false,
  },
  {
    id: "mass-majesty",
    name: "Mass Majesty",
    reference: "Presence power in V5",
    referenceUrl: null,
    abilities: ["Mass Manipulation", "Beckon"],
    explanation: "Puts all enemies in a trance where they walk towards you — the problem is Beckon pops when they get close, so this has very little utility.\n\nOne use case: farming Sanguine resonance by setting up a group for feeding.",
    rank: "D", patched: false,
  },
  {
    id: "brain-wipe",
    name: "Brain Wipe",
    reference: "Dominate 2-dot ability in VTMB1",
    referenceUrl: null,
    abilities: ["Mass Manipulation", "Cloud Memory"],
    explanation: "Makes a group forget you exist. Very low utility in-game — can allow returning to stealth, but it's very niche.",
    rank: "F", patched: false,
  },
  {
    id: "shroud-of-silence",
    name: "Shroud of Silence",
    reference: "Blood Sorcery ritual in V5",
    referenceUrl: null,
    abilities: ["Mass Manipulation", "Mute"],
    explanation: "Silences a group of enemies — given how encounters rarely involve more than one group across a given area, this has very, very low utility.",
    rank: "F", patched: false,
  },
];

// ── Ability → Combo reverse index ────────────────────────────
const ABILITY_TO_COMBOS = (() => {
  const map = {};
  for (const combo of COMBOS) {
    for (const abilityName of combo.abilities) {
      if (!map[abilityName]) map[abilityName] = [];
      map[abilityName].push(combo.id);
    }
  }
  return map;
})();

