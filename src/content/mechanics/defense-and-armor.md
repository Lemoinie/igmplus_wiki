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

For example, **10 DEF** yields `floor(1000 / 60) = 16%` damage reduction.

## Defense vs. Magic Defense

* **Defense (DEF):** Mitigates physical strikes.
* **Magic Defense (MDEF):** Mitigates magic damage.
* **Armor & Magic Penetration:** Directly bypasses a percentage of enemy defense before mitigation is calculated.
