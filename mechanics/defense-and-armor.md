# Defense & Armor

Since mod version **v1.3.18.0**, physical Defense (DEF) and Magic Defense (MDEF)
use a universal **hyperbolic diminishing-returns curve** instead of the vanilla
flat `1 DEF = 1%` rule. The curve applies to *all* adventurers and enemies, so
no build reaches 100% immunity through gear alone.

## Mitigation formula

$$
\text{Damage Reduction} = \frac{\text{DEF} \times 100}{\text{DEF} + 50}\,\%
$$

Effective defense after armor penetration and bleed shred is computed first:

$$
\text{Effective DEF} = \max\bigl(0,\ \text{DEF} \times (1 - \text{pen}) \times (1 - \text{bleed shred})\bigr)
$$

$$
\text{Damage after armor} = \text{raw damage} \times \left(1 - \frac{\text{Effective DEF}}{\text{Effective DEF} + 50}\right)
$$

Because the denominator grows with DEF, each additional point is worth less than
the last — but effective HP still grows **linearly**:

$$
\text{EHP multiplier} = 1 + \frac{\text{DEF}}{50}
$$

(so every 50 DEF doubles your effective HP: +2% EHP per DEF point).

## Anchor values

| DEF | Damage reduction | EHP multiplier |
| --- | --- | --- |
| 0 | 0.0% | 1.0× |
| 10 | 16.7% | 1.2× |
| 20 | 28.6% | 1.4× |
| 50 | 50.0% | 2.0× |
| 100 | 66.7% | 3.0× |
| 200 | 80.0% | 5.0× |

## Calculator

<DefenseCalculator />

## Interactions

- **Armor penetration & bleed shred** reduce raw DEF *before* the curve, making
  them true anti-tank stats (they multiply the DEF value, not the final %).
- **Incorporeal** (`PASSIVE_INCORPOREAL`, Will-o'-the-Wisp) is hard-coded to
  always take `1` damage after armor, preserving its vanilla physical immunity
  under the new curve.
- The in-game detail dialog shows the computed value next to the raw stat, e.g.
  `Defense: 90 (64%)`.

## Source

- Plan & implementation notes:
  [`plans/working/combat/defense-rework.md`](https://github.com/Lemoinie/IGM-Modded/blob/main/plans/working/combat/defense-rework.md)
- Vanilla behavior reference:
  [`docs/vanilla-behavior.md`](https://github.com/Lemoinie/IGM-Modded/blob/main/docs/vanilla-behavior.md)
