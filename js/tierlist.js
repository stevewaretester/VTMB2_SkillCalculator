// VTMB2 Skill Calculator - Tier List
// ====================================
//
// Items are defined below. Each entry:
// {
//   id:       unique string key
//   name:     display name
//   filter:   one of: clan | affinity | outfits | melee | passive | strike | relocate | affect | mastery | perk | completion
//   clan:     clan key (brujah|tremere|banuHaqim|ventrue|lasombra|toreador) or null for cross-clan
//   affinity: discipline key for affinity rows (potence|celerity|presence|bloodSorcery|dominate|obfuscate|oblivion)
//   icon:     path to icon image — for clan/outfits/melee this will be the clan logo; others use ability icon
//   tier:     s-plus | s | a | b | c | d | f
//   subtitle: short category label shown in the description panel
//   descr:    description text (fill in later)
// }

const TIERLIST_ITEMS = [
  // ── Clan passives ──────────────────────────────────────────
  { id: "brujah-passive",   name: "Brutality",        filter: "passive",  clan: "brujah",    icon: `${ICONS}/T_UI_Brutality.png`,              tier: "a",    subtitle: "Brujah · Passive",    descr: "While a useful effect, it only lasts a couple of seconds hampering its utility, pairs well with the Brujah clan perk making it snowball more effectively." },
  { id: "tremere-passive",  name: "Corrosive Touch",   filter: "passive",  clan: "tremere",   icon: `${ICONS}/T_UI_CP_AcidTouch.png`,           tier: "f",    subtitle: "Tremere · Passive",   descr: "Hiding bodies has barely any utility in the game, and can actually hamper you as bodies can be used to block bullets." },
  { id: "banu-passive",     name: "Silence of Death",  filter: "passive",  clan: "banuHaqim", icon: `${ICONS}/T_UI_CP_-Silenceofdeath.png`,     tier: "b",    subtitle: "Banu Haqim · Passive", descr: "This can let you snowball stealth encounters and pairs well with both the Banu perk and Mastery, lasts a decent duration, but lacks some of the bite of other passives." },
  { id: "ventrue-passive",  name: "Flesh of Marble",   filter: "passive",  clan: "ventrue",   icon: `${ICONS}/T_UI_CP_LayeredFortitude.png`,    tier: "s",    subtitle: "Ventrue · Passive",   descr: "A decently long duration, it eliminates flinch and lets you tank hits effectively — a potent combination." },
  { id: "lasombra-passive", name: "Shadow Cloak",      filter: "passive",  clan: "lasombra",  icon: `${ICONS}/T_UI_CP_Shadowcloak.png`,         tier: "b",    subtitle: "Lasombra · Passive",  descr: "Synergises well with Shadow Step as you can essentially re-enter stealth in the middle of combat. While it lacks outright offense it can help you control combat encounters." },
  { id: "toreador-passive", name: "Cat's Grace",       filter: "passive",  clan: "toreador",  icon: `${ICONS}/T_UI_Icon_Fleetness.png`,         tier: "d",    subtitle: "Toreador · Passive",  descr: "The added movement speed has very little practical utility, but it can help you close gaps to juggle enemies in combat — not completely useless but not fantastic." },

  // ── Strikes ───────────────────────────────────────────────
  { id: "brujah-strike",   name: "Lightning Strike",  filter: "strike",   clan: "brujah",    icon: `${ICONS}/T_UI_-Lightning-Strikes.png`,       tier: "s", subtitle: "Brujah · Strike",     descr: "The single strongest single-target damage in the game outside of masteries — this can knock heavies into a feeding state, help cycle bosses, and has the added benefit of being useable against multiple targets if you want to thin the herd." },
  { id: "tremere-strike",  name: "Blood Curse",       filter: "strike",   clan: "tremere",   icon: `${ICONS}/T_UI_Bloodcurse.png`,               tier: "b", subtitle: "Tremere · Strike",    descr: "It has a lengthy cast time during which you can do little to defend yourself — urging this to be used in stealth more than direct combat, but it's hard to ignore an ability that can eliminate heavies and kill a bunch of smaller enemies. I just wish they'd made it nicer to cast than dialing an invisible thermostat." },
  { id: "banu-strike",     name: "Bladed Hand",       filter: "strike",   clan: "banuHaqim", icon: `${ICONS}/T_UI_BladedHand.png`,               tier: "a", subtitle: "Banu Haqim · Strike", descr: "Solid damage, can kill some enemies in a single hit, and works amazingly during Split Second where it's like a pseudo execution without ending the timestop. A little blood wasteful, but otherwise solid." },
  { id: "ventrue-strike",  name: "Terminal Decree",   filter: "strike",   clan: "ventrue",   icon: `${ICONS}/T_UI_TerminalDecree.png`,            tier: "c", subtitle: "Ventrue · Strike",    descr: "A solid ability that can help you eliminate individual targets, but has terrible blood economy. It can be comboed with Mass Manipulation to immediately shut down some encounters but will leave you thirsty. Useful for Ventrue to kick off Spark of Rage and activate your passive early in a fight." },
  { id: "lasombra-strike", name: "Arms of Ahriman",   filter: "strike",   clan: "lasombra",  icon: `${ICONS}/T_UI_ArmofAhriman.png`,             tier: "s", subtitle: "Lasombra · Strike",   descr: "A multi-target CC that allows you to feed or disarm (using Shunt) makes this an incredible power and quite blood efficient. Made even better with Lasombra's Mastery (Enter Oblivion) where it's the only ability in the game that can eliminate multiple heavies instantly." },
  { id: "toreador-strike", name: "Entrancing Kiss",   filter: "strike",   clan: "toreador",  icon: `${ICONS}/T_UI_Icon_EntrancingKiss.png`,       tier: "a", subtitle: "Toreador · Strike",   descr: "Hidden fact: it buffs your melee damage by double against ALL targets while you have someone entranced — so not only is it cheap and removes one enemy temporarily from play, it gives you a distraction you can feed on later, and directly makes you more effective in combat. Knocked down a bit because it struggles against bosses." },

  // ── Relocates ─────────────────────────────────────────────
  { id: "brujah-relocate",   name: "Charge",       filter: "relocate", clan: "brujah",    icon: `${ICONS}/T_UI_Charge.png`,             tier: "c", subtitle: "Brujah · Relocate",     descr: "On paper this ability is really fun and can be used to reposition, but in reality it's awkward to steer and hitting multiple targets is awkward to achieve for little payoff. It's fine, but there's much better." },
  { id: "tremere-relocate",  name: "Recall",       filter: "relocate", clan: "tremere",   icon: `${ICONS}/T_UI_Recall.png`,             tier: "c", subtitle: "Tremere · Relocate",    descr: "The AOE damage is quite impressive and this has enormous utility in the overworld to return to building tops or similar — but it's a little awkward to use mid-combat, and you have to choose going into a scenario whether to keep it for a quick escape or use it as an AOE nuke. That inflexibility can make it awkward in practice." },
  { id: "banu-relocate",     name: "Split Second", filter: "relocate", clan: "banuHaqim", icon: `${ICONS}/T_UI_SplitSecond.png`,        tier: "s-plus", subtitle: "Banu Haqim · Relocate", descr: "Timestop is always going to be powerful, and Split Second is probably one of the strongest examples of it across all of gaming — it'll end early if you perform a feed or execution, but you can wrack up combos, extend buffs, line up multiple shots or kills, disarm every enemy with multiple Shunts, reposition, etc. with it. Think of it not as a relocate but as a mass CC in most respects. It actually keeps getting minor nerfs each patch, but it's still the king — accept no substitutions." },
  { id: "ventrue-relocate",  name: "Possession",   filter: "relocate", clan: "ventrue",   icon: `${ICONS}/T_UI_Icon_Possesion.png`,     tier: "b", subtitle: "Ventrue · Relocate",    descr: "Simultaneously the loosest and most unique definition of a 'relocate' as you move enemies not yourself, this has some fun utility and works as a more expensive Entrancing Kiss equivalent — you can use your other Ventrue abilities or Affects with it, but this ultimately lacks effective utility compared to others. Probably the most fun combination with Mass Manipulation though, where it just frenzies everyone into attacking each other." },
  { id: "lasombra-relocate", name: "Shadow Step",  filter: "relocate", clan: "lasombra",  icon: `${ICONS}/T_UI_Shadowstep.png`,         tier: "a", subtitle: "Lasombra · Relocate",   descr: "An effective way to close distance to single targets to get a free feed or assassination — enemies lose sight of you temporarily so you can use this to get a free feed or potentially re-enter stealth. It's like the medium-good bit of Split Second's use cases, and as such is a fine ability." },
  { id: "toreador-relocate", name: "Blink",        filter: "relocate", clan: "toreador",  icon: `${ICONS}/T_UI_Icon_Blink.png`,         tier: "c", subtitle: "Toreador · Relocate",   descr: "Cheapest ability in the game, and can be used with no target making it very useful for exploring and getting around — but it's just not very strong offensively, meaning it's a little lackluster." },

  // ── Affects ───────────────────────────────────────────────
  { id: "brujah-affect",   name: "Taunt",              filter: "affect",   clan: "brujah",    icon: `${ICONS}/T_UI_Taunt.png`,                tier: "c", subtitle: "Brujah · Affect",      descr: "While this disarms targets, which can be useful, the real benefit is the increased damage they take, which makes this a must-have for many boss fights because it enormously speeds up the cycle. In day-to-day use this is a weaker Affect, though it can be used to farm Choleric blood." },
  { id: "tremere-affect",  name: "Cauldron of Blood",  filter: "affect",   clan: "tremere",   icon: `${ICONS}/T_UI_CaudronOfBlood.png`,       tier: "s-plus", subtitle: "Tremere · Affect",    descr: "Roots the target, makes them scream drawing others near, deals damage to them over time, and makes them feedable. That alone makes it one of the strongest Affects, but it also has its secret Boiling Blood buff: when feeding on the target you get a unique buff that damages you but gives you regenerating blood pips. This makes Cauldron of Blood the only ability in the game that gives you an enormous net positive with regards to pips, and even with recent nerfs it's still the king. Disgusting when paired with Mass Manipulation." },
  { id: "banu-affect",     name: "Mute",               filter: "affect",   clan: "banuHaqim", icon: `${ICONS}/T_UI_Mute.png`,                 tier: "f", subtitle: "Banu Haqim · Affect",   descr: "Two pips to make one target not make noise when you fight them. But if you assassinate them they'd already be silent, so this is just an awful ability." },
  { id: "ventrue-affect",  name: "Cloud Memory",      filter: "affect",   clan: "ventrue",   icon: `${ICONS}/T_UI_CloudMemory.png`,         tier: "d", subtitle: "Ventrue · Affect",     descr: "This is like a worse Cauldron of Blood with a shorter duration and no buff benefit. It can be used to avoid Masquerade breaches, but so can most other Affects, and its combat utility is mostly to get one feed, but other Affects do this better. It also purges Resonance off targets, so it has limited utility out on the street." },
  { id: "lasombra-affect", name: "Glimpse of Oblivion", filter: "affect", clan: "lasombra", icon: `${ICONS}/T_UI_Glimpseofoblivion.png`,    tier: "c", subtitle: "Lasombra · Affect",    descr: "Mostly this just removes one target from combat for a while, but it's more expensive than many of the other Affects. Its main use is helping with Melancholic resonance farming, because you can easily isolate a civilian to use this on rather than playing the stupid chase-them-down-through-the-streets game." },
  { id: "toreador-affect", name: "Beckon",             filter: "affect",   clan: "toreador",  icon: `${ICONS}/T_UI_Icon_Beckon.png`,         tier: "s", subtitle: "Toreador · Affect",    descr: "Beckon is a cheap ability that makes a target immediately feedable. It has an awkward duration where they'll walk towards you before stopping and the effect pops, but that's ultimately fine if you've ripped their throat out in the short term." },

  // ── Masteries ─────────────────────────────────────────────
  { id: "brujah-mastery",   name: "Earthshock",        filter: "mastery",  clan: "brujah",    icon: `${ICONS}/T_UI_Earthshock.png`,               tier: "c", subtitle: "Brujah · Mastery",      descr: "Big AOE that can eliminate multiple targets and damage some others, but that doesn't actually have much utility in the game because it's enormously expensive at 5 pips, and you just killed everyone you wanted to feed from. Also not great against bosses." },
  { id: "tremere-mastery",  name: "Blood Salvo",       filter: "mastery",  clan: "tremere",   icon: `${ICONS}/T_UI_BloodSalvo.png`,               tier: "s", subtitle: "Tremere · Mastery",     descr: "This is essentially four Strikes masquerading as a Mastery, but that's fine, because it's very forgiving as you can dismiss the blades to recover blood and still feed while they're out. It's great for killing one target to get access to their weapon, bursting down a heavy to make them feedable, and it's strong on bosses too." },
  { id: "banu-mastery",     name: "Unseen Aura",       filter: "mastery",  clan: "banuHaqim", icon: `${ICONS}/T_UI_UnseenAura.png`,               tier: "b", subtitle: "Banu Haqim · Mastery",  descr: "A very long-duration buff that can help keep you safe while enabling multiple feeds and assassinations. The main problem is that feeding while it's active doesn't regenerate the pips, which lowers its potency." },
  { id: "ventrue-mastery",  name: "Mass Manipulation", filter: "mastery",  clan: "ventrue",   icon: `${ICONS}/T_UI_MassManipulation.png`,         tier: "a", subtitle: "Ventrue · Mastery",     descr: "Ranked highly purely because of versatility. By itself it doesn't achieve much, but when comboed with any Ventrue ability or the various Affects you get a lot of power, from setting groups against each other to triggering mass disarms or immediately terminating an entire group." },
  { id: "lasombra-mastery", name: "Enter Oblivion",    filter: "mastery",  clan: "lasombra",  icon: `${ICONS}/T_UI_EnterOblivion.png`,            tier: "a", subtitle: "Lasombra · Mastery",    descr: "Allows you to isolate individuals or groups, also counts as an Affect for Melancholic resonance so you can feed to recover that, which lets you easily recover blood pips in the open world so long as you can find an individual. Also works a bit like Unseen Aura for stealth purposes, and obviously forms one of the strongest combos with Arms of Ahriman." },
  { id: "toreador-mastery", name: "Blurred Momentum",  filter: "mastery",  clan: "toreador",  icon: `${ICONS}/T_UI_Icon_BlurredMovement.png`,     tier: "b", subtitle: "Toreador · Mastery",    descr: "A solid defensive option that maybe doesn't last quite long enough. This can be fun to keep as an emergency button or when going in for risky feeds, though you can't recover its blood pips when feeding on targets." },

  // ── Perks ─────────────────────────────────────────────────
  { id: "brujah-perk",   name: "Spark of Rage",     filter: "perk",     clan: "brujah",    icon: null, tier: "a", subtitle: "Brujah · Perk",      descr: "This is ultimately clan-dependent, with Ventrue and Brujah getting a lot more than any other clan, but I think universally this is quite useful for everyone, with the possible exception of Tremere." },
  { id: "tremere-perk",  name: "Blood of Potency",  filter: "perk",     clan: "tremere",   icon: null, tier: "c", subtitle: "Tremere · Perk",     descr: "Extra blood pips sounds great until you realise it can attempt to refill an already full ability and still requires feeding. That makes it frankly very underwhelming because it's too unreliable to be consistently useful, though sometimes a feed will get back a Mastery sooner." },
  { id: "banu-perk",     name: "Unseen Passage",    filter: "perk",     clan: "banuHaqim", icon: null, tier: "f", subtitle: "Banu Haqim · Perk",  descr: "This thing is as noisy as Vampiric Sprint, which makes it entirely self-defeating for the purposes of helping with stealth. The only clan that can really make use of it is Banu themselves." },
  { id: "ventrue-perk",  name: "Resilience",        filter: "perk",     clan: "ventrue",   icon: null, tier: "a", subtitle: "Ventrue · Perk",     descr: "This doubles health from Feeds, which lets you yoyo back from more dangerous plays or potentially tank through certain attacks." },
  { id: "lasombra-perk", name: "Stygian Shroud",    filter: "perk",     clan: "lasombra",  icon: null, tier: "s", subtitle: "Lasombra · Perk",    descr: "This is an absolute game-changer as it makes feeding in the middle of a group of humans infinitely safer and helps you control the horde. It has no effect against thin-bloods and heavier enemies though, so don't go biting people while there's a megashotty pointed at your back." },
  { id: "toreador-perk", name: "Fleetness",         filter: "perk",     clan: "toreador",  icon: null, tier: "c", subtitle: "Toreador · Perk",    descr: "A rather underwhelming ability, but still useful. It takes 30 seconds to regenerate a single pip, which means for most abilities it's just a nice top-up. It mostly enables swapping from a 2-pip ability like Split Second to a 3-pip one like Recall more easily so you can gain utility on the fly. I just wish it was faster, or maybe faster for the final pip of an ability so it would fulfill this niche better." },

  // ── Clan (overall ranking — uses clan logo) ───────────────
  { id: "clan-brujah",   name: "Brujah",    filter: "clan", clan: "brujah",    icon: null, tier: "b", subtitle: "Clan", descr: "Brujah are good but need to pick up some out-of-clan abilities to support themselves. Lightning Strike is the best single-target damage outside of masteries, Spark of Rage is one of the strongest perks (and Brujah benefit from it more than anyone), and Brutality is a solid A passive. The relocate/affect/mastery row is all C though, so the in-clan kit is essentially 'delete one tough target' and not much else.\n\nAffinities — Presence gives Beckon as an alternative to Taunt and Celerity gives Split Second which rounds them out greatly, but Potence is dead weight. They have to spend on out-of-clan to really feel complete lacking that strong in-clan identity others have." },
  { id: "clan-tremere",  name: "Tremere",   filter: "clan", clan: "tremere",   icon: null, tier: "a", subtitle: "Clan", descr: "Tremere are extremely strong with their in-clan abilities. Cauldron of Blood is the only S+ affect, Blood Salvo is an S mastery that doubles as a strike chain, and Tremere melee is the only S+ melee thanks to extended range and a faster heavy charge. They earn A on raw clan power alone, even with a genuinely F-tier passive (Corrosive Touch — hiding bodies has barely any utility in the game, and can actually hamper you since bodies can be used to block bullets; it also deletes heads from certain finishers that are otherwise weaponisable, and is the only passive that doesn't give you some sort of temporary buff) holding them back.\n\nAffinities — Dominate gives easy access to Glimpse of Oblivion, arguably the most important affect for resonance farming as it's the hardest to achieve in the open world due to targets running. Synergy with Ventrue powers is very strong, and Tremere benefit enormously from Mass Manipulation as an Affect, as well as Resilience to counteract Boiling Blood." },
  { id: "clan-banu",     name: "Banu Haqim",filter: "clan", clan: "banuHaqim", icon: null, tier: "s", subtitle: "Clan", descr: "Banu earn the top spot because they get access to a stupidly strong combo earlier than anyone. Split Second is arguably the single strongest ability in the entire game (S+) and Bladed Hand is a great strike to chain off it. Mute, Unseen Passage, and a C melee drag the kit down on paper, but the early-game power curve more than makes up for it.\n\nAffinities — Banu get the easiest and fastest access to both Split Second and Cauldron of Blood, giving them unprecedented control over encounters and their own blood very early. Their lack of Dominate or Presence does hamper resonance farming, but they're also the cheapest clan to pick up out-of-clan abilities so it's not a huge issue." },
  { id: "clan-ventrue",  name: "Ventrue",   filter: "clan", clan: "ventrue",   icon: null, tier: "a", subtitle: "Clan", descr: "Ventrue are propped up by Flesh of Marble (S passive) and Resilience (A perk), making them the most durable clan and the best at trading hits, while Mass Manipulation has fun synergies. Terminal Decree, Cloud Memory, Possession, and a D-tier melee mean they lack any real damage spike on their own — but their out-of-clan options round them out fantastically.\n\nAffinities — These make Ventrue the masters of resonance farming as they can pick up all 3 main affect abilities at cost, and apply them through Mass Manipulation. This makes unlocking all the perks for Ventrue enormously easy." },
  { id: "clan-lasombra", name: "Lasombra",  filter: "clan", clan: "lasombra",  icon: null, tier: "a", subtitle: "Clan", descr: "The most well-rounded in-clan kit. Pieces actively reinforce each other: Shadow Cloak plus Shadow Step is one of the cleanest re-stealth loops in the game, and Arms of Ahriman plus Enter Oblivion is the only way to instantly delete multiple heavies. Throw in Stygian Shroud (S perk) and a strong A-tier melee, and Lasombra rarely have a bad encounter.\n\nAffinities — Oblivion, Potence, and Dominate let Lasombra easily expand into other clans' toolkits — cheap access to Cauldron of Blood, Glimpse of Oblivion, and the Brujah/Ventrue strike-relocate options means almost any gap in their kit can be papered over." },
  { id: "clan-toreador", name: "Toreador",  filter: "clan", clan: "toreador",  icon: null, tier: "c", subtitle: "Clan", descr: "Toreador are a bit too weak. Even with the fastest combos in the game (S-tier melee) and Beckon as an S affect, the rest of their kit just isn't very good — the entire support row sits at C/D (Cat's Grace, Blink, Fleetness) and Entrancing Kiss is solid but struggles into bosses. The melee carries a lot of weight that the abilities don't pay back.\n\nAffinities — Celerity and Presence don't help round out the gaps the way other clans' affinities do. They get easy access to Beckon and Spark of Rage, but they already had a great affect, so the marginal value is low." },

  // ── Affinity (overall ranking by ability access) ──────────
  { id: "affinity-celerity",      name: "Celerity Affinity",      filter: "affinity", affinity: "celerity",      clan: null, icon: null, tier: "s-plus", subtitle: "Affinity", descr: "Offence, defence and mobility all wrapped into one. It's the king of affinities and can almost fill every slot on your bar." },
  { id: "affinity-blood-sorcery", name: "Blood Sorcery Affinity", filter: "affinity", affinity: "bloodSorcery", clan: null, icon: null, tier: "s", subtitle: "Affinity", descr: "Damage, control, sustain and a little utility — a versatile affinity that earns its place near the top." },
  { id: "affinity-dominate",      name: "Dominate Affinity",      filter: "affinity", affinity: "dominate",      clan: null, icon: null, tier: "b", subtitle: "Affinity", descr: "All about control, and built to combo with itself more than any other affinity, but it does so well." },
  { id: "affinity-presence",      name: "Presence Affinity",      filter: "affinity", affinity: "presence",      clan: null, icon: null, tier: "b", subtitle: "Affinity", descr: "Softer control with some added utility, spread very thin across the clans though which dilutes its potential slightly." },
  { id: "affinity-oblivion",      name: "Oblivion Affinity",      filter: "affinity", affinity: "oblivion",      clan: null, icon: null, tier: "a", subtitle: "Affinity", descr: "A fantastic exclusive affinity that even within its three abilities gives control, mobility and elimination potential." },
  { id: "affinity-potence",       name: "Potence Affinity",       filter: "affinity", affinity: "potence",       clan: null, icon: null, tier: "c", subtitle: "Affinity", descr: "One ability and while it's ok, it's often outclassed in its own slot - it's a shame Potence doesn't have more to offer." },
  { id: "affinity-obfuscate",     name: "Obfuscate Affinity",     filter: "affinity", affinity: "obfuscate",     clan: null, icon: null, tier: "c", subtitle: "Affinity", descr: "An exclusive affinity with just two abilities, and one is arguably the worst in the game. Unseen Aura, however, is very forgiving and opens up a lot of potential." },

  // ── Outfits (uses signature outfit icon) ──────────────────
  { id: "outfits-brujah",   name: "Brujah Outfits",    filter: "outfits", clan: "brujah",    icon: `${SILO}/T_UI_Thumb_Phyre_Brujah_04.png`,      tier: null, subtitle: "The Brawler · Outfits",  descr: "3 strong outfits and one grunge means they can cover every scenario, but they'll need to swap outfits. All Choleric targets are scared of strong after all." },
  { id: "outfits-tremere",  name: "Tremere Outfits",   filter: "outfits", clan: "tremere",   icon: `${SILO}/T_UI_Thumb_Phyre_Tremere_02.png`,     tier: null, subtitle: "The Magister · Outfits", descr: "Grunge, Attractive, and 2 Wealthy gives an excellent spread. Notably, Wealthy by itself covers all major scenarios, only struggling with Sanguine Bikers. There's also a fun mix of things here." },
  { id: "outfits-banu",     name: "Banu Haqim Outfits",filter: "outfits", clan: "banuHaqim", icon: `${SILO}/T_UI_Thumb_Phyre_Banu_Haqim_04.png`,  tier: null, subtitle: "The Slayer · Outfits",   descr: "2 grunge and 2 wealthy. You can cover all scenarios, just remember to swap to grunge for Sanguine Bikers." },
  { id: "outfits-ventrue",  name: "Ventrue Outfits",   filter: "outfits", clan: "ventrue",   icon: `${SILO}/T_UI_Thumb_Phyre_Ventrue_01.png`,     tier: null, subtitle: "The Herald · Outfits",   descr: "Wealthy and attractive means you'll only need to swap to attractive when talking to Sanguine Bikers." },
  { id: "outfits-lasombra", name: "Lasombra Outfits",  filter: "outfits", clan: "lasombra",  icon: `${SILO}/T_UI_Thumb_Phyre_LaSombra_04.png`,   tier: null, subtitle: "The Atheist · Outfits",  descr: "All 4 are unique, across strong, attractive, wealthy, and the unique priest. Priest isn't very good for blood resonance, but it's fun to have, and you still have more options than most." },
  { id: "outfits-toreador", name: "Toreador Outfits",  filter: "outfits", clan: "toreador",  icon: `${SILO}/T_UI_Thumb_Toreador_03.png`,          tier: null, subtitle: "The Diva · Outfits",     descr: "3 attractive outfits and one wealthy. You have complete coverage but not much diversity." },

  // ── Melee (uses clan logo) ─────────────────────────────────
  { id: "melee-brujah",   name: "Brujah Melee",    filter: "melee", clan: "brujah",    icon: null, tier: "b",     subtitle: "Melee", descr: "A very middle-of-the-road melee set that's hard to divorce from the passive, but by itself it boasts the most average and consistent damage across light and heavy attacks." },
  { id: "melee-tremere",  name: "Tremere Melee",   filter: "melee", clan: "tremere",   icon: null, tier: "s-plus", subtitle: "Melee", descr: "The added range on light attacks and faster charge on the heavy makes the Tremere very effective in melee combat and the king of jugglers." },
  { id: "melee-banu",     name: "Banu Haqim Melee",filter: "melee", clan: "banuHaqim", icon: null, tier: "c",     subtitle: "Melee", descr: "Some of the lowest damage numbers of any clan — they're actually better off trying to throw more heavy attacks because of that." },
  { id: "melee-ventrue",  name: "Ventrue Melee",   filter: "melee", clan: "ventrue",   icon: null, tier: "d",     subtitle: "Melee", descr: "Slow and lower damage than average — the Ventrue's standard attacks are the least impressive of the group." },
  { id: "melee-lasombra", name: "Lasombra Melee",  filter: "melee", clan: "lasombra",  icon: null, tier: "a",     subtitle: "Melee", descr: "Very similar to Brujah but with a much better heavy charge and the fastest one-two punch of light attacks." },
  { id: "melee-toreador", name: "Toreador Melee",  filter: "melee", clan: "toreador",  icon: null, tier: "s",     subtitle: "Melee", descr: "Boasting lightning-fast attacks with lower individual damage, they make up for it in higher DPS. You can burst down individual targets especially if you juggle them — try to end on a heavy attack on the 5th hit." },

  // ── Clan Completion Talents ────────────────────────────────
  { id: "completion-brujah",   name: "Titanfist",           filter: "completion", clan: "brujah",    icon: "assets/CompletionTalents/brujah_titanfist.png",     tier: null, subtitle: "Clan Completion Talent", descr: "" },
  { id: "completion-tremere",  name: "Bloodcraft",          filter: "completion", clan: "tremere",   icon: "assets/CompletionTalents/tremere_bloodcraft.png",   tier: null, subtitle: "Clan Completion Talent", descr: "" },
  { id: "completion-banu",     name: "Distraction",         filter: "completion", clan: "banuHaqim", icon: "assets/CompletionTalents/banu_distraction.png",     tier: null, subtitle: "Clan Completion Talent", descr: "" },
  { id: "completion-ventrue",  name: "Discerning Tastes",   filter: "completion", clan: "ventrue",   icon: "assets/CompletionTalents/ventrue_discerning.png",   tier: null, subtitle: "Clan Completion Talent", descr: "" },
  { id: "completion-lasombra", name: "Shadow Cache",        filter: "completion", clan: "lasombra",  icon: "assets/CompletionTalents/lasombra_distraction.png", tier: null, subtitle: "Clan Completion Talent", descr: "" },
  { id: "completion-toreador", name: "Silken Grasp",        filter: "completion", clan: "toreador",  icon: "assets/CompletionTalents/toreador_silkengrasp.png", tier: null, subtitle: "Clan Completion Talent", descr: "" },
];

// ── Tier rank label helper ────────────────────────────────────

function tierRankLabel(tier) {
  if (!tier) return '';
  if (tier === 's-plus') return 'S+';
  return tier.toUpperCase();
}

// ── Skill-tree cross-link helper ──────────────────────────────
// Maps a skill-tree (clanId, tier) pair to its TIERLIST_ITEMS entry.
// clanId uses long keys (banuHaqim); tier matches filter name (passive/strike/…).

function findTierItem(clanId, tier) {
  const clanShort = clanId === 'banuHaqim' ? 'banu' : clanId;
  return TIERLIST_ITEMS.find(item => item.id === `${clanShort}-${tier}`) || null;
}

// ── Icon helper ───────────────────────────────────────────────

function _tierlistIconFor(item) {
  if (item.filter === 'clan') {
    if (item.clan && CLANS[item.clan]) return CLANS[item.clan].logoCompleted || CLANS[item.clan].logo;
    return '';
  }
  if (item.filter === 'affinity') {
    if (item.affinity && typeof DISCIPLINES !== 'undefined' && DISCIPLINES[item.affinity]) {
      return DISCIPLINES[item.affinity].icon || '';
    }
    return '';
  }
  if (item.filter === 'melee') {
    if (item.clan && CLANS[item.clan]) return CLANS[item.clan].logo;
    return '';
  }
  if (item.icon) return item.icon;
  if (item.clan && CLANS[item.clan]) return CLANS[item.clan].logo;
  return '';
}

// ── Ability name linkifier ───────────────────────────────────
// Replaces known ability names in text with inline buttons that navigate
// to the skill tree. Uses ABILITY_LOCATION from data.js.

function linkifyAbilityText(text) {
  // Escape HTML
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  // Build sorted name list (longest first to avoid partial matches)
  const names = typeof ABILITY_LOCATION !== 'undefined'
    ? Object.keys(ABILITY_LOCATION).sort((a, b) => b.length - a.length)
    : [];
  if (!names.length) return escaped.replace(/\n/g, '<br>');

  const pattern = names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const re = new RegExp(`\\b(${pattern})\\b`, 'g');

  const linked = escaped.replace(re, (match) => {
    const loc = ABILITY_LOCATION[match];
    if (!loc) return match;
    return `<button class="ability-inline-link" data-clan="${loc.clan}" data-tier="${loc.tier}">${match}</button>`;
  });

  return linked.replace(/\n/g, '<br>');
}

// ── Popover singleton ─────────────────────────────────────────

let _tierlistPopover = null;
let _tierlistPopoverItem = null;
let _tierlistPopoverDismiss = null;

function _ensureTierPopover() {
  if (_tierlistPopover) return;
  _tierlistPopover = document.createElement('div');
  _tierlistPopover.className = 'tierlist-popover';
  _tierlistPopover.setAttribute('role', 'dialog');
  _tierlistPopover.innerHTML = `
    <button class="tierlist-popover__close" aria-label="Close">&#x2715;</button>
    <div class="tierlist-popover__header">
      <img class="tierlist-popover__icon" src="" alt="">
      <div>
        <p class="tierlist-popover__name"></p>
        <p class="tierlist-popover__subtitle"></p>
      </div>
    </div>
    <div class="tierlist-popover__affinities"></div>
    <p class="tierlist-popover__body"></p>
    <div class="tierlist-popover__links"></div>
  `;
  document.body.appendChild(_tierlistPopover);
  _tierlistPopover.querySelector('.tierlist-popover__close')
    .addEventListener('click', _closeTierPopover);
  _tierlistPopover.addEventListener('click', (e) => {
    const btn = e.target.closest('.ability-inline-link');
    if (!btn) return;
    _closeTierPopover();
    if (typeof navigateToAbility === 'function') navigateToAbility(btn.dataset.clan, btn.dataset.tier);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') _closeTierPopover(); });
}

function _positionTierPopover(anchorEl) {
  const pop = _tierlistPopover;
  if (!pop) return;
  const rect = anchorEl.getBoundingClientRect();
  const margin = 10;
  const pw = pop.offsetWidth || 268;
  const ph = pop.offsetHeight || 180;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  let left = rect.right + margin;
  let top  = rect.top;
  if (left + pw > vw - margin) left = rect.left - pw - margin;
  if (left < margin) left = margin;
  if (top + ph > vh - margin) top = vh - ph - margin;
  if (top < margin) top = margin;
  pop.style.left = left + 'px';
  pop.style.top  = top  + 'px';
}

// extraLinks: array of { label, fn } — optional extra buttons below description
function _openTierlistPopover(item, anchorEl, extraLinks) {
  _ensureTierPopover();
  const pop = _tierlistPopover;

  // Toggle close if same item tapped twice
  if (_tierlistPopoverItem === item && pop.classList.contains('is-open')) {
    _closeTierPopover();
    return;
  }
  _tierlistPopoverItem = item;

  const icon = _tierlistIconFor(item);
  pop.querySelector('.tierlist-popover__icon').src = icon || '';
  pop.querySelector('.tierlist-popover__icon').alt = item.name;
  pop.querySelector('.tierlist-popover__name').textContent = item.name;
  pop.querySelector('.tierlist-popover__subtitle').textContent = item.subtitle || '';
  pop.querySelector('.tierlist-popover__body').innerHTML = linkifyAbilityText(item.descr || '(No description yet.)');

  // Affinities (only for clan items)
  const affEl = pop.querySelector('.tierlist-popover__affinities');
  affEl.innerHTML = '';
  if (item.filter === 'clan' && item.clan && typeof CLANS !== 'undefined' &&
      CLANS[item.clan] && Array.isArray(CLANS[item.clan].affinities) &&
      typeof DISCIPLINES !== 'undefined') {
    CLANS[item.clan].affinities.forEach(key => {
      const disc = DISCIPLINES[key];
      if (!disc) return;
      const chip = document.createElement('span');
      chip.className = 'tierlist-popover__affinity';
      chip.title = disc.name;
      if (disc.icon) {
        const img = document.createElement('img');
        img.src = disc.icon;
        img.alt = disc.name;
        chip.appendChild(img);
      }
      const label = document.createElement('span');
      label.textContent = disc.name;
      chip.appendChild(label);
      affEl.appendChild(chip);
    });
  }

  // Accent colour derived from filter
  const ACCENT_COLOURS = {
    clan: '#c9a84c', affinity: '#5fa8a0', outfits: '#1a9a8a', melee: '#c04030',
    passive: '#4a7aaa', strike: '#d08030', relocate: '#40a8cc',
    affect: '#7040b0', mastery: '#8a2040', perk: '#4a8a40',
    completion: '#b06080',
  };
  pop.style.setProperty('--pop-accent', ACCENT_COLOURS[item.filter] || 'var(--border-accent)');

  // Links
  const linksEl = pop.querySelector('.tierlist-popover__links');
  linksEl.innerHTML = '';

  const SKILL_TREE_FILTERS = new Set(['passive', 'strike', 'relocate', 'affect', 'mastery', 'perk']);
  if (SKILL_TREE_FILTERS.has(item.filter) && item.clan) {
    const btn = document.createElement('button');
    btn.className = 'tierlist-popover__link';
    btn.textContent = 'View on Skill Tree \u2192';
    btn.addEventListener('click', () => {
      _closeTierPopover();
      if (typeof navigateToAbility === 'function') navigateToAbility(item.clan, item.filter);
    });
    linksEl.appendChild(btn);
  }

  if (item.filter === 'melee' && item.clan) {
    const btn = document.createElement('button');
    btn.className = 'tierlist-popover__link';
    btn.textContent = 'View Attack Data \u2192';
    btn.addEventListener('click', () => {
      _closeTierPopover();
      if (typeof navigateToClanCombosFor === 'function') navigateToClanCombosFor(item.clan);
    });
    linksEl.appendChild(btn);
  }

  (extraLinks || []).forEach(({ label, fn }) => {
    const btn = document.createElement('button');
    btn.className = 'tierlist-popover__link';
    btn.textContent = label;
    btn.addEventListener('click', () => { _closeTierPopover(); fn(); });
    linksEl.appendChild(btn);
  });

  // Open, then position using real dimensions
  pop.classList.add('is-open');
  _positionTierPopover(anchorEl);

  // Click-away dismiss
  if (_tierlistPopoverDismiss) document.removeEventListener('click', _tierlistPopoverDismiss);
  _tierlistPopoverDismiss = (e) => { if (!pop.contains(e.target)) _closeTierPopover(); };
  setTimeout(() => document.addEventListener('click', _tierlistPopoverDismiss), 10);
}

function _closeTierPopover() {
  if (_tierlistPopover) _tierlistPopover.classList.remove('is-open');
  _tierlistPopoverItem = null;
  if (_tierlistPopoverDismiss) {
    document.removeEventListener('click', _tierlistPopoverDismiss);
    _tierlistPopoverDismiss = null;
  }
}

// Called from skill-tree detail panel tier badge
function openTierBadgePopover(itemId, anchorEl) {
  const item = TIERLIST_ITEMS.find(i => i.id === itemId);
  if (!item) return;
  const extraLinks = [
    { label: 'View in Tier List \u2192', fn: () => navigateToTierList(item.id) },
  ];
  _openTierlistPopover(item, anchorEl, extraLinks);
}

// ── Render ───────────────────────────────────────────────────

function _syncCompletionFilter() {
  const enabled = typeof state !== 'undefined' && state.completionTalents;
  const btn = document.querySelector('.tierlist__filter[data-filter="completion"]');
  if (btn) btn.classList.toggle('is-hidden-filter', !enabled);
}

function renderTierList() {
  const tiers = ['s-plus', 's', 'a', 'b', 'c', 'd', 'f'];
  tiers.forEach(t => {
    const el = document.getElementById(`tierlist-row-${t}`);
    if (el) el.innerHTML = '';
  });

  const completionEnabled = typeof state !== 'undefined' && state.completionTalents;
  const useClanIcon = (f) => f === 'clan' || f === 'melee';

  // Order within a tier row: clan first, then everything else
  const FILTER_ORDER = ['clan', 'affinity', 'melee', 'passive', 'strike', 'relocate', 'affect', 'mastery', 'perk', 'completion', 'outfits'];
  const _filterRank = (f) => {
    const i = FILTER_ORDER.indexOf(f);
    return i === -1 ? 999 : i;
  };
  const _items = TIERLIST_ITEMS.slice().sort((a, b) => _filterRank(a.filter) - _filterRank(b.filter));

  _items.forEach(item => {
    if (!item.tier) return;
    if (item.filter === 'completion' && !completionEnabled) return;
    const row = document.getElementById(`tierlist-row-${item.tier}`);
    if (!row) return;

    const btn = document.createElement('button');
    btn.className = `tierlist__item tierlist__item--${item.filter}`;
    if (useClanIcon(item.filter)) btn.classList.add('tierlist__item--clan');
    btn.dataset.id     = item.id;
    btn.dataset.filter = item.filter;
    btn.dataset.clan   = item.clan || '';
    btn.dataset.affinity = item.affinity || '';
    btn.title = item.name;

    const img = document.createElement('img');
    img.src = _tierlistIconFor(item) || '';
    img.alt = item.name;
    btn.appendChild(img);

    btn.addEventListener('click', (e) => { e.stopPropagation(); _openTierlistPopover(item, btn); });
    row.appendChild(btn);
  });

  _syncCompletionFilter();
  _applyTierlistFilters();
  _updateTierlistClanGlow();
}

// ── Clan glow ─────────────────────────────────────────────────

function _updateTierlistClanGlow() {
  const clan = (typeof state !== 'undefined' && state.selectedClan) || null;
  document.querySelectorAll('.tierlist__item').forEach(btn => {
    btn.classList.toggle('tierlist__item--selected-clan', !!clan && btn.dataset.clan === clan);
  });
}

// ── Filter toggles ───────────────────────────────────────────

let _activeClanFilters = new Set(); // selected clans when not in all-mode
let _showAllClans = true;

function _applyTierlistFilters() {
  const activeFilters = new Set(
    Array.from(document.querySelectorAll('.tierlist__filter.is-active'))
         .map(b => b.dataset.filter)
  );

  let allowedAffinities = null;
  if (!_showAllClans && _activeClanFilters.size > 0 && typeof CLANS !== 'undefined') {
    allowedAffinities = new Set();
    _activeClanFilters.forEach(clanId => {
      const clan = CLANS[clanId];
      if (!clan || !Array.isArray(clan.affinities)) return;
      clan.affinities.forEach(key => allowedAffinities.add(key));
    });
  }

  document.querySelectorAll('.tierlist__item').forEach(el => {
    const filterMatch = activeFilters.has(el.dataset.filter);
    const clanMatch   = !el.dataset.clan ||
                        (_showAllClans ? true : _activeClanFilters.has(el.dataset.clan));

    // Affinity cards follow selected clan(s) even though affinity sub-filters are hidden.
    let affinityMatch = true;
    if (el.dataset.filter === 'affinity') {
      if (!_showAllClans) {
        if (_activeClanFilters.size === 0) {
          affinityMatch = false;
        } else if (allowedAffinities) {
          affinityMatch = allowedAffinities.has(el.dataset.affinity);
        }
      }
    }

    el.classList.toggle('is-hidden', !(filterMatch && clanMatch && affinityMatch));
  });
}

function _buildClanFilters() {
  const container = document.getElementById('tierlist-clan-filters');
  if (!container || typeof CLANS === 'undefined') return;
  if (container.children.length) return; // already built

  const allBtn = document.createElement('button');
  allBtn.className = 'tierlist__clan-filter is-active';
  allBtn.dataset.clan = '';
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => {
    const clanBtns = Array.from(container.querySelectorAll('.tierlist__clan-filter[data-clan]:not([data-clan=""])'));
    const allSelected = _showAllClans || _activeClanFilters.size === clanBtns.length;

    container.querySelectorAll('.tierlist__clan-filter').forEach(b => b.classList.remove('is-active'));
    _activeClanFilters.clear();

    if (allSelected) {
      _showAllClans = false; // toggle all off
    } else {
      _showAllClans = true;  // toggle all on
      allBtn.classList.add('is-active');
    }
    _applyTierlistFilters();
  });
  container.appendChild(allBtn);

  const CLAN_ORDER = ['brujah', 'tremere', 'banuHaqim', 'ventrue', 'lasombra', 'toreador'];
  CLAN_ORDER.forEach(clanId => {
    const clan = CLANS[clanId];
    if (!clan) return;
    const btn = document.createElement('button');
    btn.className = 'tierlist__clan-filter';
    btn.dataset.clan = clanId;
    btn.title = clan.name;
    if (clan.logo) {
      const img = document.createElement('img');
      img.src = clan.logo;
      img.alt = clan.name;
      btn.appendChild(img);
    }
    btn.addEventListener('click', () => {
      if (_showAllClans) {
        _showAllClans = false;
        allBtn.classList.remove('is-active');
      }
      if (_activeClanFilters.has(clanId)) {
        _activeClanFilters.delete(clanId);
        btn.classList.remove('is-active');
      } else {
        _activeClanFilters.add(clanId);
        btn.classList.add('is-active');
      }
      _applyTierlistFilters();
    });
    container.appendChild(btn);
  });
}

function _initTierlistFilters() {
  const allCatBtn = document.getElementById('tierlist-filter-all');
  if (allCatBtn) {
    allCatBtn.addEventListener('click', () => {
      const filters = Array.from(document.querySelectorAll('.tierlist__filter'));
      const allSelected = filters.length > 0 && filters.every(b => b.classList.contains('is-active'));
      filters.forEach(b => b.classList.toggle('is-active', !allSelected));
      if (!allSelected) _syncCompletionFilter();
      _applyTierlistFilters();
    });
  }
  document.querySelectorAll('.tierlist__filter').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.classList.toggle('is-active');
      _applyTierlistFilters();
    });
  });
  _buildClanFilters();
}

// ── Navigate back to tier list and flash item ─────────────────

function navigateToTierList(itemId) {
  const tierlistTab = document.querySelector(
    '.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny):not(.tab-bar--ysabelle) .tab-bar__tab[data-subtab="tierlist"]'
  );
  if (!tierlistTab) return;
  document.querySelectorAll(
    '.tab-bar--secondary:not(.tab-bar--fabien):not(.tab-bar--benny):not(.tab-bar--ysabelle) .tab-bar__tab'
  ).forEach(t => t.classList.remove('active'));
  tierlistTab.classList.add('active');
  document.querySelectorAll('#page-phyre > .subpage').forEach(p => p.classList.add('hidden'));
  const subpage = document.getElementById('subpage-tierlist');
  if (subpage) subpage.classList.remove('hidden');
  renderTierList();
  setTimeout(() => {
    const el = document.querySelector(`.tierlist__item[data-id="${itemId}"]`);
    if (el) {
      el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      el.classList.add('tierlist__item--flash');
      setTimeout(() => el.classList.remove('tierlist__item--flash'), 1200);
    }
  }, 50);
  if (typeof persistPosition === 'function') persistPosition();
}

// ── Init ─────────────────────────────────────────────────────

let _tierlistInited = false;

function initTierList() {
  if (!_tierlistInited) {
    _tierlistInited = true;
    _initTierlistFilters();
  }
  _syncCompletionFilter();
  renderTierList();
}
