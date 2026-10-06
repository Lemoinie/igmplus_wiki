# Attack Speed

The mod replaces vanilla's hardcoded *"Attacks twice"* mechanic with a unified,
percentage-based **Attack Speed** stat. Default is `100%` = one standard attack
per round. Weapons, doctrines and passives all stack into the same number.

## Formulas

$$
\text{Guaranteed extra attacks} = \left\lfloor \frac{\text{Attack Speed} - 100}{100} \right\rfloor
$$

$$
\text{Extra attack chance} = (\text{Attack Speed} - 100) \bmod 100\ \%
$$

## Examples

| Attack Speed | Result | Typical source |
| --- | --- | --- |
| 100% | 1 attack | Base unit |
| 110% | 1 attack + 10% chance to strike again | Berserker's Axe (+10%) |
| 120% | 1 attack + 20% chance to strike again | Doctrine extra-attack chance |
| 200% | 2 guaranteed attacks | Cursed Bow, Infernal Bow, Berserker Rage (≤50% HP) |
| 220% | 2 attacks + 20% chance for a 3rd | Cursed Bow + doctrine |
| 300% | 3 guaranteed attacks | Celestial Bow (+200%) |

## Rules & safeguards

- Extra attacks are **basic attacks only** — they never duplicate or cast skills.
- Extra attacks generate **no mana**; mana is still granted once per round at
  turn start.
- S.P.I.D.E.R's accessory proc stays an **independent melee rider** on top of
  the attack-speed system (it never merges into the percentage).
- Attack Speed shows on page 3 of the entity detail dialog.
