# Damage Amplification

The mod promotes two first-class, percentage-based multipliers — **Basic Atk
Amp** and **Skill Amp** — both baseline `100%` (1.0). They scale *damage and
healing* uniformly for adventurers and enemies.

## The two amplifiers

| Stat | Scales | Baseline |
| --- | --- | --- |
| **Normal Attack Amplification** (Basic Atk Amp) | Basic attacks (including extra strikes from Attack Speed) **and** basic single-target round heals | 100% |
| **Skill Amplification** (Skill Amp) | Active skill attacks **and** active skill heals | 100% |

## How they stack

```
Total Normal Amp = gear normalAmp (weapon + armor + accessory)
                 + doctrine bonusNormalAttackAmp()
                 + status/passive modifiers   (baseline 1.0)

Total Skill Amp  = gear skillAmp (weapon + armor + accessory)
                 + doctrine bonusSkillAmp()
                 + status/passive modifiers   (baseline 1.0)
```

In the combat pipeline the amp multiplier is applied **multiplicatively**
together with the separate **Damage Dealt** / **Damage Taken** modifiers:

```
final = rawDamage × ampMultiplier × damageDealt(attacker) × damageTaken(defender) × mitigation
```

## Practical notes

- A unit at 200% Basic Atk Amp deals double damage with basic attacks *and*
  doubles basic round heals — it does **not** touch skill damage.
- Critical strikes, armor mitigation (see [Defense & Armor](./defense-and-armor))
  and elemental/darkness modifiers resolve outside the amp value.
- Both stats display on page 3 of the entity detail dialog
  (`Basic Atk Amp: 137%`, `Skill Amp: 160%` …).
