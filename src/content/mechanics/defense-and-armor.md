---
title: "Defense & Armor Mechanics"
description: "How physical and magical damage reduction works in Idle Guild Master Modded."
category: "Combat Mechanics"
lastUpdated: "2026-10-06"
---

# Defense & Armor Mechanics

In **Idle Guild Master Modded (IGM+)**, damage calculation differentiates between **Physical** and **Magical** mitigation.

## Damage Reduction Formula

Damage mitigation after defense is calculated using the following formula (floored):

> **Damage Reduction (%)** = floor((100 × Effective Defense) / (50 + Effective Defense))  
> **Damage Taken Multiplier** = (100 - Damage Reduction %) / 100

For example, **10 DEF** yields `floor(1000 / 60) = 16%` damage reduction.

### Key Thresholds:
* **0 DEF:** 0% reduction (100% damage taken, 1.0× EHP)
* **10 DEF:** 16% reduction (84% damage taken, 1.19× EHP)
* **25 DEF:** 33% reduction (67% damage taken, 1.49× EHP)
* **50 DEF:** 50% reduction (50% damage taken, 2.0× EHP)
* **75 DEF:** 60% reduction (40% damage taken, 2.5× EHP)
* **100 DEF:** 66% reduction (34% damage taken, 2.94× EHP)
* **117 DEF:** 70% reduction (30% damage taken, 3.33× EHP)
* **150 DEF:** 75% reduction (25% damage taken, 4.0× EHP)
* **200 DEF:** 80% reduction (20% damage taken, 5.0× EHP)
* **450 DEF:** 90% reduction (10% damage taken, 10.0× EHP)

## Defense vs. Magic Defense

* **Defense (DEF):** Mitigates physical strikes from swords, bows, daggers, axes, and physical beasts.
* **Magic Defense (MDEF):** Mitigates spells, curses, arcane bursts, and elemental damage.

## Armor Types

1. **Heavy Armor:** High base DEF, moderate HP, low MDEF. Best suited for Footman and frontline tanks.
2. **Medium Armor:** Balanced DEF and MDEF, frequently grants Dodge and Crit bonuses. Ideal for Rogues and Outlanders.
3. **Cloth Robes:** High MDEF and INT bonuses, low physical DEF. Designed for Apprentices and mages.
