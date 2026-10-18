---
title: "Update 1.3.20.10: Outlander Expansion, Classes Rebalance & Combat Overhaul"
date: "2026-10-12"
category: "Updates"
version: "v1.3.20.10"
author: "IGM+ Dev Team"
pinned: true
coverImage: "/images/area_the_siege.png"
description: "Massive Outlander expansion with 4 evolution branches from T1 to T9, complete Classes Rebalance with old vs new skill comparisons, dedicated Singularity Magus section, and centered status effects."
tags: ["Classes", "Combat", "Outlander", "Rebalance", "Singularity Magus", "Patch Notes"]
---

Another major update is here. This release brings a massive expansion to the **Outlander class tree**, comprehensive **Classes Rebalance** across multiple archetype branches, a dedicated spotlight on the **Singularity Magus**, new combat status effects, companion enhancements, and an overhaul to XP Book leveling.

---

## Highlights

### New Outlander Evolution Branches

Four new evolution branches have been integrated into the Outlander class tree, giving borderland adventurers complete progression paths from Tier 1 up to Tier 9.

* <img src="/images/unit_avatar_of_wrath.png" alt="Avatar of Wrath" class="sprite" width="28" height="28" /> **Avatar of Wrath** — A relentless multi-strike berserker specializing in attack-speed buffs, lifesteal, and devastating on-kill recasts.
* <img src="/images/unit_beast_tamer.png" alt="Beast Tamer" class="sprite" width="28" height="28" /> **Beast Tamer** — Command specialized animal companions, each with unique combat abilities, passives, and dedicated natural equipment.
* <img src="/images/unit_datura_hierophant.png" alt="Datura Hierophant" class="sprite" width="28" height="28" /> **Datura Hierophant** — A nature-based druid wielding Entangle, Thorns, Poison, and other debilitating battlefield effects.
* <img src="/images/unit_el_salvador_1.png" alt="El Salvador" class="sprite" width="28" height="28" /> **El Salvador** — A highly mobile frontier fighter with enhanced evasion, retaliatory counterattacks, and chained executions.

---

### Outlander Evolution Progression (Tier 1 to Tier 9)

The Outlander tree originates at **Tier 1 Outlander**, splitting at **Tier 2** into the ferocious **Marauder** (leading to the Berserker path) and the nature-bound **Heathen** (branching into Beast Tamer, Datura Hierophant, and El Salvador).

#### Branch 1: Berserker Branch (Avatar of Wrath Line)

Focused on high attack-speed scaling, lifesteal sustain, multi-strike cleaves, and continuous on-kill recasts.

| Tier | Icon | Class Name | Active Skill | Passive Skill | Stat Scaling |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **T1** | <img src="/images/unit_outlander.png" alt="Outlander" class="sprite" width="28" height="28" /> | **Outlander** | **Wild Strikes** (125% DMG, 50% follow-up) | *None* | `100% CON · 100% INT` |
| **T2** | <img src="/images/unit_marauder.png" alt="Marauder" class="sprite" width="28" height="28" /> | **Marauder** | **Wild Strikes** (125% DMG, 50% follow-up) | **Rage** (<=50% HP: +50% ATK Speed) | `105% CON · 100% INT` |
| **T3** | <img src="/images/unit_barbarian.png" alt="Barbarian" class="sprite" width="28" height="28" /> | **Barbarian** | **Brutal Strikes** (175% DMG, 75% -> 50% -> 25% follow-ups) | **Rage** (<=50% HP: +50% ATK Speed) | `105% CON · 100% INT` |
| **T4** | <img src="/images/unit_berserker_hero.png" alt="Berserker" class="sprite" width="28" height="28" /> | **Berserker** | **Brutal Strikes** (175% DMG, 75% -> 50% -> 25% follow-ups) | **Savage Rage** (<=50% HP: +100% ATK Speed, Rage buff, 25% Lifesteal) | `105% CON · 100% INT` |
| **T5** | <img src="/images/unit_savage_berserker.png" alt="Savage Berserker" class="sprite" width="28" height="28" /> | **Savage Berserker** | **Brutal Strikes** (175% DMG, 75% -> 50% -> 25% follow-ups) | **Savage Rage** (<=50% HP: +100% ATK Speed, Rage buff, 25% Lifesteal) | `105% CON · 100% INT` |
| **T6** | <img src="/images/unit_scarlet_berserker.png" alt="Scarlet Berserker" class="sprite" width="28" height="28" /> | **Scarlet Berserker** | **Brutal Strikes II** (225% DMG, 75% -> 50% -> 25% follow-ups) | **Savage Rage** (<=50% HP: +100% ATK Speed, Rage buff, 25% Lifesteal) | `110% CON · 100% INT` |
| **T7** | <img src="/images/unit_blood_reaver.png" alt="Blood Reaver" class="sprite" width="28" height="28" /> | **Blood Reaver** | **Bloody Slaughter** (225% DMG, 85% -> 60% -> 35% follow-ups, 2.0x Crit, on-kill recast) | **Savage Rage** (<=50% HP: +100% ATK Speed, Rage buff, 25% Lifesteal) | `115% CON · 100% INT` |
| **T8** | <img src="/images/unit_crimson_warlord.png" alt="Crimson Warlord" class="sprite" width="28" height="28" /> | **Crimson Warlord** | **Bloody Slaughter** (225% DMG, 85% -> 60% -> 35% follow-ups, 2.0x Crit, on-kill recast) | **Savage Rage II** (<=75% HP: +100% ATK Speed, Rage buff, 25% Lifesteal) | `120% CON · 100% INT` |
| **T9** | <img src="/images/unit_avatar_of_wrath.png" alt="Avatar of Wrath" class="sprite" width="28" height="28" /> | **Avatar of Wrath** | **Blessing of Slaughter** (250% DMG, 85% -> 60% -> 35% follow-ups, on-kill recast, party Rage buff) | **Savage Rage II** (<=75% HP: +100% ATK Speed, Rage buff, 25% Lifesteal) | `130% CON · 100% INT` |

---

#### Branch 2: Beast Tamer Branch (Pack Commander Line)

Commands specialized combat beasts, healing companions for a percentage of damage dealt and deploying unique minion abilities.

| Tier | Icon | Class Name | Active Skill & Pet Heal | Passive Skill & Companion Summon | Stat Scaling |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **T1** | <img src="/images/unit_outlander.png" alt="Outlander" class="sprite" width="28" height="28" /> | **Outlander** | **Wild Strikes** | *None* | `100% CON · 100% INT` |
| **T2** | <img src="/images/unit_heathen.png" alt="Heathen" class="sprite" width="28" height="28" /> | **Heathen** | **Wild Strikes II** | *None* | `100% CON · 100% INT` |
| **T3** | <img src="/images/unit_rat_tamer.png" alt="Rat Tamer" class="sprite" width="28" height="28" /> | **Rat Tamer** | **Wild Strikes II** | **Rat Caller** (Summons Rat / Albino Rat; **Rabid Bite** & 10%–15% Lifesteal) | `100% CON · 100% INT` |
| **T4** | <img src="/images/unit_cat_tamer.png" alt="Cat Tamer" class="sprite" width="28" height="28" /> | **Cat Tamer** | **Wild Strikes II** | **Cat Caller** (Summons Cat / Black Cat; **Feline Pounce** & +25%–30% Dodge) | `100% CON · 100% INT` |
| **T5** | <img src="/images/unit_weasel_tamer.png" alt="Weasel Tamer" class="sprite" width="28" height="28" /> | **Weasel Tamer** | **Wild Strikes II** | **Weasel Caller** (Summons Weasel / Ferret; **Frenzied Flurry** & +40%–45% Dodge) | `100% CON · 100% INT` |
| **T6** | <img src="/images/unit_wolf_tamer.png" alt="Wolf Tamer" class="sprite" width="28" height="28" /> | **Wolf Tamer** | **Wild Strikes II** | **Wolf Caller** (Summons Wolf / Direwolf; **Pack Howl** & 10T Bleed on hit) | `100% CON · 100% INT` |
| **T7** | <img src="/images/unit_tiger_tamer.png" alt="Tiger Tamer" class="sprite" width="28" height="28" /> | **Tiger Tamer** | **Wild Strikes II** (Heals pet for **50%** DMG dealt) | **Tiger Caller** (Summons Saber-toothed / White Tiger; **Predatory Ambush** 300% burst) | `100% CON · 100% INT` |
| **T8** | <img src="/images/unit_bear_tamer.png" alt="Bear Tamer" class="sprite" width="28" height="28" /> | **Bear Tamer** | **Wild Strikes II** (Heals pet for **100%** DMG dealt) | **Bear Caller** (Summons Grizzly / Armored Bear; **Ursine Roar** & 20%–25% Stun) | `100% CON · 100% INT` |
| **T9** | <img src="/images/unit_beast_tamer.png" alt="Beast Tamer" class="sprite" width="28" height="28" /> | **Beast Tamer** | **Wild Strikes II** (Heals pet for **150%** DMG dealt) | **Beast Caller** (Summons Owlbear / Ancient Owlbear; **Apex Rampage** AoE cleave) | `100% CON · 100% INT` |

---

#### Branch 3: Datura Hierophant Branch (Nature Druid Line)

Wields nature magic to lock down enemy evasion with Entangle, reflect melee strikes with Thorns, and stack lethal afflictions.

| Tier | Icon | Class Name | Active Skill | Passive Skill | Stat Scaling |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **T1** | <img src="/images/unit_outlander.png" alt="Outlander" class="sprite" width="28" height="28" /> | **Outlander** | **Wild Strikes** | *None* | `100% CON · 100% INT` |
| **T2** | <img src="/images/unit_heathen.png" alt="Heathen" class="sprite" width="28" height="28" /> | **Heathen** | **Wild Strikes II** | *None* | `100% CON · 100% INT` |
| **T3** | <img src="/images/unit_druid.png" alt="Druid" class="sprite" width="28" height="28" /> | **Druid** | **Nature's Grasp** (150% magic DMG to 2 targets; Poison if debuffed) | **Nature's Hand** (75% chance to inflict **Entangle** on basic attack) | `100% CON · 100% INT` |
| **T4** | <img src="/images/unit_forest_druid.png" alt="Forest Druid" class="sprite" width="28" height="28" /> | **Forest Druid** | **Nature's Grasp** (150% magic DMG to 2 targets; Poison if debuffed) | **Nature's Hand** (75% chance to inflict **Entangle** on basic attack) | `100% CON · 100% INT` |
| **T5** | <img src="/images/unit_gloom_druid.png" alt="Gloom Druid" class="sprite" width="28" height="28" /> | **Gloom Druid** | **Nature's Grasp II** (200% magic DMG to 2 targets; Poison if debuffed) | **Nature's Lash** (45% chance to inflict **Entangle**, 25 Bleed on basic attack) | `100% CON · 100% INT` |
| **T6** | <img src="/images/unit_hemodruid.png" alt="Hemodruid" class="sprite" width="28" height="28" /> | **Hemodruid** | **Nature's Grasp II** (200% magic DMG to 2 targets; Poison if debuffed) | **Nature's Lash** (45% chance to inflict **Entangle**, 25 Bleed on basic attack) | `100% CON · 100% INT` |
| **T7** | <img src="/images/unit_sanguine_druid.png" alt="Sanguine Druid" class="sprite" width="28" height="28" /> | **Sanguine Druid** | **Nature's Grasp III** (250% magic DMG to 2 targets; Poison if debuffed) | **Nature's Wrath** (Independent 35% rolls for Entangle, 40 Bleed, 3 Thorns, 1T Poison) | `100% CON · 100% INT` |
| **T8** | <img src="/images/unit_bloodthorn_druid.png" alt="Bloodthorn Archdruid" class="sprite" width="28" height="28" /> | **Bloodthorn Archdruid** | **Nature's Grasp III** (250% magic DMG to 2 targets; Poison if debuffed) | **Nature's Wrath** (Independent 35% rolls for Entangle, 40 Bleed, 3 Thorns, 1T Poison) | `100% CON · 100% INT` |
| **T9** | <img src="/images/unit_datura_hierophant.png" alt="Datura Hierophant" class="sprite" width="28" height="28" /> | **Datura Hierophant** | **Briar's Bramble** (250% magic DMG to 2 targets, Poison if debuffed, **5 Thorns**) | **Nature's Wrath** (Independent 35% rolls for Entangle, 40 Bleed, 3 Thorns, 1T Poison) | `100% CON · 100% INT` |

---

#### Branch 4: El Salvador Branch (Frontier Duelist Line)

Capitalizes on high dexterity, guaranteed hit accuracy, retaliatory melee counterattacks, and lowest-HP executions.

| Tier | Icon | Class Name | Active Skill | Passive Skill | Stat Scaling |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **T1** | <img src="/images/unit_outlander.png" alt="Outlander" class="sprite" width="28" height="28" /> | **Outlander** | **Wild Strikes** | *None* | `100% CON · 100% INT` |
| **T2** | <img src="/images/unit_heathen.png" alt="Heathen" class="sprite" width="28" height="28" /> | **Heathen** | **Wild Strikes II** | *None* | `100% CON · 100% INT` |
| **T3** | <img src="/images/unit_exile.png" alt="Exile" class="sprite" width="28" height="28" /> | **Exile** | **Wild Strikes III** (200% physical DMG, 50% follow-up) | **Focused Eye** (20% Melee Counterattack) | `100% CON · 110% INT` |
| **T4** | <img src="/images/unit_bandit.png" alt="Bandit" class="sprite" width="28" height="28" /> | **Bandit** | **Wild Strikes III** (200% physical DMG, 50% follow-up) | **Perceptive Eye** (**Never Miss**, 30% Melee Counterattack) | `100% CON · 120% INT` |
| **T5** | <img src="/images/unit_vagabond.png" alt="Vagabond" class="sprite" width="28" height="28" /> | **Vagabond** | **Wild Strikes III** (200% physical DMG, 50% follow-up) | **Perceptive Eye** (**Never Miss**, 30% Melee Counterattack) | `100% CON · 130% INT` |
| **T6** | <img src="/images/unit_brigand.png" alt="Brigand" class="sprite" width="28" height="28" /> | **Brigand** | **Wild Strikes IV** (250% physical DMG, 50% follow-up) | **Perceptive Eye** (**Never Miss**, 40% Melee Counter, **bonus attack on kill**) | `100% CON · 140% INT` |
| **T7** | <img src="/images/unit_renegade.png" alt="Renegade" class="sprite" width="28" height="28" /> | **Renegade** | **Wild Strikes IV** (250% physical DMG, 50% follow-up) | **Perceptive Eye** (**Never Miss**, 40% Melee Counter, **bonus attack on kill**) | `100% CON · 150% INT` |
| **T8** | <img src="/images/unit_desperado.png" alt="Desperado" class="sprite" width="28" height="28" /> | **Desperado** | **Rapid Exploitation** (Targets **lowest HP**, 2x 175% DMG, 50% 3rd hit, **3.0x Crit DMG**) | **Omniscient Eye** (**Never Miss**, 50% Counter, on-kill attack, **EVASION** 2T self) | `100% CON · 160% INT` |
| **T9** | <img src="/images/unit_el_salvador_1.png" alt="El Salvador" class="sprite" width="28" height="28" /> | **El Salvador** | **Rapid Exploitation** (Targets **lowest HP**, 2x 175% DMG, 50% 3rd hit, **3.0x Crit DMG**) | **Omniscient Eye** (**Never Miss**, 50% Counter, on-kill attack, **EVASION** 2T ally) | `100% CON · 170% INT` |

---

### New Combat Mechanics & Status Effects

The following combat status effects and mechanics are now fully active across classes, equipment, and enemy encounters.

<div class="effectShowcaseGrid">
  <div class="effectShowcaseCard">
    <div class="effectIconBox">
      <img src="/images/icon_effect_terrify.png" alt="Menace" />
    </div>
    <h4 class="effectTitle">Menace</h4>
    <p class="effectDesc">
      When landing a damaging hit with a primary attack or active skill, units with Menace shred both Physical Defense and Magic Defense of the enemy by a flat DEF value for 1 turn (<code>MENACE_SHRED</code>). Non-stacking, refreshes duration, takes the highest value, and the caster is immune to self-infliction.
    </p>
  </div>

  <div class="effectShowcaseCard">
    <div class="effectIconBox">
      <img src="/images/icon_effect_defensive_stance.png" alt="Guard" />
    </div>
    <h4 class="effectTitle">Guard</h4>
    <p class="effectDesc">
      Whenever a unit with Guard grants qualifying active or passive support (heals, shields, or buffs) to an ally, the receiving ally gains flat Physical Defense and Magic Defense for 1 turn (<code>GUARD_FORTIFIED</code>). Non-stacking, refreshes duration, takes the highest value, and the provider cannot buff themselves.
    </p>
  </div>

  <div class="effectShowcaseCard">
    <div class="effectIconBox">
      <img src="/images/icon_effect_delirium.png" alt="Special Damage" />
    </div>
    <h4 class="effectTitle">Special Damage</h4>
    <p class="effectDesc">
      Introduced Special Damage (defaults to 100%), scaling true damage procs against adjacent secondary enemies from primary damage dealt. Deals 0 damage against solo targets, requires a successful primary hit, and never triggers status effects or on-hit loops.
    </p>
  </div>

  <div class="effectShowcaseCard">
    <div class="effectIconBox">
      <img src="/images/icon_effect_evasion.png" alt="Evasion" />
    </div>
    <h4 class="effectTitle">EVASION</h4>
    <p class="effectDesc">
      Tactical agility boost granting a flat additive +25% Dodge Chance in combat hit calculations for 1–2 turns. When El Salvador evades incoming melee strikes while under Evasion, he immediately executes a retaliatory counterattack.
    </p>
  </div>

  <div class="effectShowcaseCard">
    <div class="effectIconBox">
      <img src="/images/icon_effect_entangle.png" alt="Entangle" />
    </div>
    <h4 class="effectTitle">ENTANGLE</h4>
    <p class="effectDesc">
      Constricting thorny roots bind the target: locks dodge chance to 0% (cannot dodge), decreases outgoing Damage Dealt by -20%, and inflicts 2% of the target's Max HP as continuous damage each turn for 2 turns.
    </p>
  </div>

  <div class="effectShowcaseCard">
    <div class="effectIconBox">
      <img src="/images/icon_effect_thorns.png" alt="Thorns" />
    </div>
    <h4 class="effectTitle">THORNS</h4>
    <p class="effectDesc">
      Thorny damage recoil wreathed on units. Whenever struck by melee attacks, reflects damage back to the attacker equal to accumulated Thorn stacks as a percentage of damage dealt. Loses 1 stack at the end of each turn.
    </p>
  </div>

  <div class="effectShowcaseCard">
    <div class="effectIconBox">
      <img src="/images/icon_effect_rage.png" alt="Rage" />
    </div>
    <h4 class="effectTitle">RAGE</h4>
    <p class="effectDesc">
      Reckless battle fury that increases outgoing Damage Dealt by +30%, but simultaneously increases incoming Damage Taken by +30%. Triggered conditionally below HP thresholds on Avatar of Wrath lines or granted party-wide via Blessing of Slaughter.
    </p>
  </div>

  <div class="effectShowcaseCard">
    <div class="effectIconBox">
      <img src="/images/icon_effect_brittle_toxin.png" alt="Brittle Toxin" />
    </div>
    <h4 class="effectTitle">Brittle Toxin</h4>
    <p class="effectDesc">
      Advanced alchemical compound that crystallizes enemy defenses, causing the target to take +20% flat extra Damage Taken from all sources for 2 turns. Strictly non-stacking; reapplication refreshes duration.
    </p>
  </div>

  <div class="effectShowcaseCard">
    <div class="effectIconBox">
      <img src="/images/icon_effect_corrosion.png" alt="Corrosion" />
    </div>
    <h4 class="effectTitle">Corrosion</h4>
    <p class="effectDesc">
      Stackable universal damage vulnerability inflicted by Wraith. Each stack amplifies all incoming physical and magical damage taken by +4% (up to 3 stacks / +12% at T8, and 5 stacks / +20% at T9) for 3 turns. Refreshes duration on each new stack.
    </p>
  </div>

  <div class="effectShowcaseCard">
    <div class="effectIconBox">
      <img src="/images/icon_effect_enfeeble.png" alt="Enfeeble" />
    </div>
    <h4 class="effectTitle">Enfeeble</h4>
    <p class="effectDesc">
      Stackable attribute drain inflicted by Wraith. Each stack drains the target's Constitution, Dexterity, and Intelligence by -5% (up to 1 stack / -5% at T8, and 3 stacks / -15% at T9) for 2 turns, severely crippling enemy damage scaling, hit chance, and defenses.
    </p>
  </div>
</div>

---

### Singularity Magus — Dedicated Arcane Spotlight

The **Singularity Magus** branch is a premier single-target burst line evolving out of the Mage tree, engineered specifically to dismantle dungeon and raid bosses through high-penetration arcane spells and intelligent target acquisition.

<div style="text-align: center; margin: 1.5rem 0;">
  <img src="/images/unit_singularity_magus.png" alt="Singularity Magus" class="sprite" width="48" height="48" />
  <h3 style="margin-top: 0.5rem; color: #fff;">Singularity Magus (Tier 9)</h3>
</div>

#### Evolution Path & Burst Spells

| Tier | Icon | Class Name | Active Burst Spell | Passive Skill | Stat Scaling |
| :---: | :---: | :--- | :--- | :--- | :---: |
| **T3** | <img src="/images/unit_arcanist.png" alt="Arcanist" class="sprite" width="28" height="28" /> | **Arcanist** | **Energy Burst III** (500% magic DMG) | **Aether Resonance I** (+10% Skill Amp, +10% Penetration) | `100% INT` |
| **T4** | <img src="/images/unit_spellweaver.png" alt="Spellweaver" class="sprite" width="28" height="28" /> | **Spellweaver** | **Arcane Blast** (600% magic DMG) | **Aether Resonance II** (+20% Skill Amp, +20% Penetration) | `100% INT` |
| **T5** | <img src="/images/unit_aether_mage.png" alt="Aether Mage" class="sprite" width="28" height="28" /> | **Aether Mage** | **Arcane Blast II** (700% magic DMG) | **Aether Resonance III** (+30% Skill Amp, +30% Penetration) | `100% INT` |
| **T6** | <img src="/images/unit_aether_archmage.png" alt="Aether Archmage" class="sprite" width="28" height="28" /> | **Aether Archmage** | **Arcane Blast III** (800% magic DMG) | **Aether Resonance IV** (+40% Skill Amp, +40% Penetration) | `100% INT` |
| **T7** | <img src="/images/unit_disintegrator.png" alt="Disintegrator" class="sprite" width="28" height="28" /> | **Disintegrator** | **Disintegrate I** (1000% magic DMG, **20%** recast chance) | **Aether Resonance V** (+50% Skill Amp, +50% Penetration) | `100% INT` |
| **T8** | <img src="/images/unit_grand_magus.png" alt="Grand Magus" class="sprite" width="28" height="28" /> | **Grand Magus** | **Disintegrate II** (2000% magic DMG, **25%** recast chance) | **Aether Resonance VI** (+60% Skill Amp, +60% Penetration) | `100% INT` |
| **T9** | <img src="/images/unit_singularity_magus.png" alt="Singularity Magus" class="sprite" width="28" height="28" /> | **Singularity Magus** | **Disintegrate III** (3000% magic DMG, **30%** recast chance) | **Aether Resonance VII** (+70% Skill Amp, +70% Penetration) | `100% INT` |

#### Key Mechanics & Combat Identity

1. **Boss-Priority Targeting & Threat Bypass:** Units with Aether Resonance completely bypass enemy frontline taunts and threat weighting formulas, automatically acquiring Boss-type enemies as their primary target.
2. **Pinnacle Spell Amplification & Penetration:** Aether Resonance VII scales up to a massive **+70% Skill Amplification** and ignores **70% of enemy Physical & Magic Defense**.
3. **Immediate Recast & Aether Overload:** Casting Disintegrate has up to a **30% chance** to immediately fire a second 3000% blast. Each recast stacks **Aether Overload** (+5% / +10% / +15% damage taken per stack, up to 3 stacks / +45%), trading defensive risk for annihilating burst damage.

---

### Classes Rebalance

Comprehensive mechanical rework across four major specialization branches, comparing legacy capabilities with the new combat architecture:

#### 1. Eldritch Alchemist Branch (Chemical Reactions Engine)

| Feature | Legacy Mechanics | Rebalanced Mechanics |
| :--- | :--- | :--- |
| **Active Skill** | Generic single-target poison shot dealing flat damage over time. | **Catalytic Barrage:** Fires a 3-shot barrage triggering on-hit reactions, followed by an unconditional **Grand Detonation** applying **Vaporize**, **Brittle Toxin**, and **Thermal Shock** across all living enemies. Amplified **10.0x** when reanimated via Feeble Tether. |
| **Passive Skill** | *Poisonous Blood* — basic poison chance on hit. | **Thaumaturgy I–IV:** Elemental chemical reaction engine: <br />• **Vaporize:** Striking an Ablaze enemy detonates an AoE magic blast scaling with INT (T6: 0.6x, T7: 0.8x, T8: 1.0x, T9: 1.2x INT). <br />• **Thermal Shock:** Striking a Frozen enemy shatters freeze for massive hybrid damage (T7: +100%, T8: +125%, T9: +150% Phys/Mag). <br />• **Brittle Toxin:** On-hit crystallization applying +20% flat extra damage taken for 2 turns. |
| **Stat Scaling** | 100% DEX only (standard bow scaling). | **Progressive Dual Scaling:** T6 (100% DEX · 30% INT) → T7 (100% DEX · 40% INT) → T8 (100% DEX · 50% INT) → T9 (**100% DEX · 60% INT**). |
| **Hit Consistency** | Base archer accuracy; vulnerable to evasion. | **Focused Accuracy:** Class passives grant **+25% miss chance reduction** (additive with Focused trait up to +50%). |

---

#### 2. Corrosive Wraith Branch (Universal Debuff Specialists)

| Feature | Legacy Mechanics | Rebalanced Mechanics |
| :--- | :--- | :--- |
| **Active Skill** | Static dark/poison arrow volley with flat values. | **Focused Barrage:** Rapidly fires two arrows at every single enemy on the field, triggering double on-hit rolls to spread and refresh debuffs simultaneously. |
| **Debuff Mechanics** | Minimal single-target poison with no team defense shredding. | **Corrosion & Enfeeble Engine:** <br />• **Corrosion:** Attacks have a 10%–20% chance to inflict Corrosion (+4% damage taken per stack; T8 cap: 3 stacks / +12%, T9 cap: **5 stacks / +20% damage taken**). <br />• **Enfeeble:** Attacks have a 20%–40% chance to inflict Enfeeble (-5% CON, DEX, INT per stack; T8 cap: -5%, T9 cap: **3 stacks / -15% core stats**). |
| **Stat Scaling** | 100% DEX only. | **Progressive Dual Scaling:** T6 (100% DEX · 30% INT) → T7 (100% DEX · 40% INT) → T8 (100% DEX · 50% INT) → T9 (**100% DEX · 60% INT**). |
| **Immunities & Accuracy** | No innate immunities; standard miss rate. | **Innate Immunities:** 100% immune to both Poison and Corrosion. Class passives grant **+25% miss chance reduction**. |

---

#### 3. Wyrm Rider Branch (Beastmaster & Dragon Rider Overhaul)

| Feature | Legacy Mechanics | Rebalanced Mechanics |
| :--- | :--- | :--- |
| **Active Skill** | Generic arrow barrages with no beast interaction. | **Dedicated Mount Abilities:** <br />• T4 Wolf Rider: **Savage Pounce** (250% Physical + Stun). <br />• T5 Worg Rider: **Frenzied Rend** (3x 200% Physical + Bleed 20). <br />• T6 Spitfang Rider: **Caustic Deluge** (3x 220% Magic + Poison 3T). <br />• T7 Drake Rider: **Incinerate** (220% Magic AoE + Ablaze). <br />• T8 Golden Drake Rider: **Incinerate II** (300% Magic AoE + Ablaze 2T). <br />• T9 Wyrm Rider: **Sublimate** (2x 200% Magic AoE + Ablaze 2T & Frozen 2T). |
| **Mount Follow-Ups** | Static flat damage tick at end of turn. | **Stat-Scaled End-of-Turn Attacks:** Scales directly off Rider DEX and INT: <br />• T4 (60% DEX) → T5 (80% DEX) → T6 (60% DEX · 60% INT) → T7 (75% DEX · 75% INT) → T8 (90% DEX · 90% INT) → T9 (**120% DEX · 120% INT**). Targeted at the specific enemy attacked by the Rider. |
| **Companion Synergy** | Did not benefit from pet or minion multipliers. | Mount attacks and end-of-turn follow-ups scale fully with **+% pet/companion damage** from gear and doctrines. |
| **Weapon Scaling** | 100% DEX only. | **Hybrid Bow Scaling:** 100% DEX + 30%–50% INT (scaling up to **100% DEX · 70% INT** at Tier 9). |

---

#### 4. Black Idol Branch (Dread Lich & Undead Summoner)

| Feature | Legacy Mechanics | Rebalanced Mechanics |
| :--- | :--- | :--- |
| **Minion Summoning** | Minions only spawned passively upon enemy deaths. | **Skill-Based Summoning:** Active skills (**Curse I–V**) directly summon undead servants into combat without requiring enemy deaths. When minion capacity is full, casting heals and mends all active minions for **35% Max HP**. |
| **Summon Capacity** | Locked to 1 minion maximum. | **Expanded Minion Ranks:** <br />• 1 Minion: Necromancer (T4) & Demilich (T5) <br />• 2 Minions: Lich (T6) & Ancient Lich (T7) <br />• 3 Minions: Lord of Decay (T8) & **Black Idol (T9)**. |
| **Damage Redirection** | Summoner absorbed full damage directly. | **Soul Tether Redirection:** Redirects **20% to 45%** of all damage taken by the summoner directly to living minions (20% at T4 up to 45% at T9). |
| **Minion Scaling** | Minions decayed rapidly at flat 25% HP/turn. | **Soul Harvest & Tiered Decay:** <br />• **Soul Harvest:** Whenever a cursed enemy dies, all living minions gain permanent stacking buffs (+15% HP heal, +10% DMG dealt, -5% DMG taken per stack; up to 10 stacks / +150% HP, +100% DMG, -50% DMG taken). <br />• **Decay Reduced:** Decays scaled by minion tier from 20% (Zombie) down to only **10%** (Bone Hydra). |

---

#### Additional Balance Changes

* **Scarlet Armor Set:** Rebalanced the Scarlet armor set bonuses and defense curves. All defensive reductions follow the universal diminishing returns formula:

$$
\text{Damage Reduction} = \frac{\text{DEF}}{\text{DEF} + 50} \times 100\%
$$

* **Alert+ Trait:** Retains turn-zero initiative while granting bonus Basic Attack Amplification on the first hit.
* **Phoenix Solar Rebirth:** Trigger rate rebalanced to 3% at Lv. 100 to ensure high-tier resurrection utility without trivializing active revival spells.

---

### Companion & Pet Overhaul

* **Natural Beast Equipment:** Animal companions now dynamically equip zero-cost natural weapons (Predator Fangs, Wolf Jaws, Tiger Jaws, Ursine Paw, Apex Claws) and natural armors (Wolf Pelt, Thick Fur, Bear Hide, Primeval Hide) without minion decay.
* **Mythic Pet Trait Rolling:** Mythic pets (Phoenix and Kitsune) now roll trait slots dynamically without duplicates instead of being restricted to fixed traits.
* **Standardized Level Unlocks:** Kitsune now follows standardized trait unlock tiers (Lv. 1, 21, 41, 61).
* **Safe Inspection Preview:** Long-pressing pets in team dispatch or selection dialogs opens the pet inspection dialog with haptic feedback, hiding destructive actions (Merge and Set Free) during team setup.

---

### XP Book Consumption Rework

Leveling up is now significantly smoother across all guilds:

* Eliminated severe UI freezing when consuming XP Books.
* Added a quantity stepper (**- / + / MAX**), live XP gain preview, and slider for batch consumption.
* Adventurer levels and XP bars update instantly without refreshing entire lists.
* Save serialization and background UI refreshes are deferred until the dialog closes.
* Max-level adventurers cannot waste XP Books, and adventurers approaching the level cap consume only what is needed.
* Improved toast feedback and added support for **Ancient XP Books (XPBookC)**.

---

## Bug Fixes & Improvements

* **Auto-Raid:** Fixed boss encounter state persistence after a party wipe when Stop on Wipe is disabled. Combat state, party HP, room progression, and encounter flags are now properly reset.
* **The Siege:** Fixed an issue allowing infinite attempts after a combat wipe. Defeat now correctly fails the activity and consumes the weekly attempt, with wave progress tracked accurately.
* **Archer Specializations:** Improved hit consistency for Alchemist, Corrosive Wraith, and Wyrm Rider while preserving the Marksman's guaranteed-hit identity.
* **Mythic Pets:** Improved trait rolling and unlock progression consistency.
* **Combat Logs:** Added dedicated Vaporize and Thermal Shock messages, improved status descriptions, and fixed stack-count displays.
* **Skill UI:** Long skill descriptions are now scrollable for easier reading.
* **Combat Targeting:** Added boss classification support for specialized targeting mechanics.

---

### Feedback & Bug Reports

As always, feedback and suggestions are welcome. If you encounter a bug, please include your **mod version**, what happened, and whether you can reproduce it. This makes investigating and fixing issues much easier.

Thank you for continuing to support the project. Have fun building your teams, experimenting with the new branches, and crushing those raids.
