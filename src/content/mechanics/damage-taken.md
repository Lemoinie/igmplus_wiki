---
title: "Damage Taken"
description: "Universal incoming damage multiplier affecting how much damage an entity receives in Idle Guild Master Modded."
category: "Combat Mechanics"
lastUpdated: "2026-10-06"
---

# Damage Taken

In **Idle Guild Master Modded (IGM+)**, **Damage Taken** is the universal multiplier that scales all incoming damage suffered by an entity.

## Core Rules

* **Baseline:** All entities start at a baseline of **100% (1.0×)** Damage Taken.
* **Universal Application:** Modifies all incoming hits—physical or magical—in conjunction with the entity's Defense / Magic Defense mitigation.
* **Inspection Dialog:** Inspectable on Page 3 of the hero and enemy detail dialogs.

## Damage Calculation Flow

**Final Damage Taken** = **Incoming Hit** × **Damage Taken Modifier** × (1 − **Damage Reduction %** ÷ 100)

## Modifiers & Status Effects

* **Status Effects:**
  * **Sinister Curse:** +50% incoming Damage Taken.
  * **Petrify:** +10% incoming Damage Taken.
* **Traits & Doctrines:**
  * **Reckless Trait:** Increases damage dealt by +15% at the cost of taking +15% more Damage Taken.
  * **Ragebound (Doctrine of Ruin):** Amplifies both outgoing damage dealt and incoming damage taken for aggressive frontline combat.
