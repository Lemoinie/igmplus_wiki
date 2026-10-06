---
title: "Defense & Armor Mechanics"
description: "How physical and magical damage reduction works in Idle Guild Master Modded."
category: "Combat Mechanics"
lastUpdated: "2026-10-06"
---

# Defense & Armor Mechanics

In **Idle Guild Master Modded (IGM+)**, damage calculation differentiates between **Physical** and **Magical** mitigation.

## Damage Reduction Formula

Damage taken after defense is calculated using an asymptotic curve:

$$\text{Damage Multiplier} = \frac{100}{100 + \text{Effective Defense}}$$

### Key Thresholds:
* **0 DEF:** 100% damage taken (0% reduction)
* **25 DEF:** 80% damage taken (20% reduction)
* **50 DEF:** 66.7% damage taken (33.3% reduction)
* **100 DEF:** 50% damage taken (50% reduction)
* **200 DEF:** 33.3% damage taken (66.7% reduction)

## Defense vs. Magic Defense

* **Defense (DEF):** Mitigates physical strikes from swords, bows, daggers, axes, and physical beasts.
* **Magic Defense (MDEF):** Mitigates spells, curses, arcane bursts, and elemental damage.

## Armor Types

1. **Heavy Armor:** High base DEF, moderate HP, low MDEF. Best suited for Footman and frontline tanks.
2. **Medium Armor:** Balanced DEF and MDEF, frequently grants Dodge and Crit bonuses. Ideal for Rogues and Outlanders.
3. **Cloth Robes:** High MDEF and INT bonuses, low physical DEF. Designed for Apprentices and mages.
