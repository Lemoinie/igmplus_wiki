# Status Effects

Status effects are the mod's layered debuffs and buffs: damage-over-time
(poison, ablaze, bleed), hard crowd control (stun, silence, freeze, petrify,
entangle), curses with escalating tiers, and buffs such as regeneration,
inspire and frenzy.

## Highlights of the modded mechanics

- **Bleed shred**: bleed stacks reduce the target's raw DEF before the
  hyperbolic curve — see [Defense & Armor](./defense-and-armor) — so stacking
  bleed is an anti-armor strategy.
- **Hemorrhage**: critical bleed bursts consume stacks for instant damage,
  rolling the inflicter's real critical chance (fixed in v1.3.18.x).
- **Curses**: lesser → greater → ominous → abhorrent tiers; some curses are
  boss-linked (e.g. Sinister Curse from raid content).
- **Cleanse rules**: effects flagged *negative* are dispellable by cleanse
  effects unless a specific `STUN_NOT_CLEANSABLE`-style variant is used in code.

## All registered effects

<!-- BEGIN GENERATED DATA -->
All status effects registered in `StatusEffectType.kt`. *Negative* marks debuffs (cleansable by virtue-dispel style effects unless flagged otherwise in code).

|  | Effect | Negative | Description |
| --- | --- | --- | --- |
| <img src="/images/icon_effect_taunt.png" class="sprite" alt="icon_effect_taunt" width="20" height="20"> | **Taunt** | Yes | taunted |
| <img src="/images/icon_effect_defensive_stance.png" class="sprite" alt="icon_effect_defensive_stance" width="20" height="20"> | **Defensive Stance** | No | in a defensive stance |
| <img src="/images/icon_effect_stun.png" class="sprite" alt="icon_effect_stun" width="20" height="20"> | **Stun** | Yes | stunned |
| <img src="/images/icon_effect_stun.png" class="sprite" alt="icon_effect_stun" width="20" height="20"> | **Stun** | No | stunned |
| <img src="/images/icon_effect_silence.png" class="sprite" alt="icon_effect_silence" width="20" height="20"> | **Silence** | Yes | silenced |
| <img src="/images/icon_effect_ablaze.png" class="sprite" alt="icon_effect_ablaze" width="20" height="20"> | **Ablaze** | Yes | ablaze |
| <img src="/images/icon_effect_bloodflame.png" class="sprite" alt="icon_effect_bloodflame" width="20" height="20"> | **Bloodflame** | Yes | cursed and rotten by bloodflame |
| <img src="/images/icon_effect_poison.png" class="sprite" alt="icon_effect_poison" width="20" height="20"> | **Poison** | Yes | poisoned |
| <img src="/images/icon_effect_regeneration.png" class="sprite" alt="icon_effect_regeneration" width="20" height="20"> | **Regeneration** | No | regenerating |
| <img src="/images/icon_effect_curse.png" class="sprite" alt="icon_effect_curse" width="20" height="20"> | **Lesser Curse** | Yes | cursed |
| <img src="/images/icon_effect_curse.png" class="sprite" alt="icon_effect_curse" width="20" height="20"> | **Curse** | Yes | cursed |
| <img src="/images/icon_effect_curse.png" class="sprite" alt="icon_effect_curse" width="20" height="20"> | **Greater Curse** | Yes | cursed |
| <img src="/images/icon_effect_curse.png" class="sprite" alt="icon_effect_curse" width="20" height="20"> | **Ominous Curse** | Yes | cursed |
| <img src="/images/icon_effect_curse.png" class="sprite" alt="icon_effect_curse" width="20" height="20"> | **Abhorrent Curse** | Yes | cursed |
| <img src="/images/icon_effect_bleed.png" class="sprite" alt="icon_effect_bleed" width="20" height="20"> | **Bleed** | Yes | bleeding |
| <img src="/images/icon_effect_delirium.png" class="sprite" alt="icon_effect_delirium" width="20" height="20"> | **Delirium** | No | delirious |
| <img src="/images/icon_effect_frenzy.png" class="sprite" alt="icon_effect_frenzy" width="20" height="20"> | **Frenzy** | No | frenzied |
| <img src="/images/icon_effect_anointed.png" class="sprite" alt="icon_effect_anointed" width="20" height="20"> | **Anointed** | No | anointed |
| <img src="/images/skeleton_key.png" class="sprite" alt="skeleton_key" width="20" height="20"> | **Skeleton Key** | No | enhanced by Skeleton Key |
| <img src="/images/feeble_tether.png" class="sprite" alt="feeble_tether" width="20" height="20"> | **Feeble Tether** | No | tethered to an ancient power |
| <img src="/images/icon_effect_inspire.png" class="sprite" alt="icon_effect_inspire" width="20" height="20"> | **Inspire** | No | inspired |
| <img src="/images/icon_effect_exalt.png" class="sprite" alt="icon_effect_exalt" width="20" height="20"> | **Exalt** | No | exalted |
| <img src="/images/icon_effect_petrify.png" class="sprite" alt="icon_effect_petrify" width="20" height="20"> | **Petrify** | Yes | petrified |
| <img src="/images/icon_effect_false_life.png" class="sprite" alt="icon_effect_false_life" width="20" height="20"> | **False Life** | No | shielded by False Life |
| <img src="/images/icon_effect_terrify.png" class="sprite" alt="icon_effect_terrify" width="20" height="20"> | **Terrify** | Yes | terrified |
| <img src="/images/icon_effect_freeze.png" class="sprite" alt="icon_effect_freeze" width="20" height="20"> | **Freeze** | Yes | frozen |
| <img src="/images/icon_effect_radiant_blessing.png" class="sprite" alt="icon_effect_radiant_blessing" width="20" height="20"> | **Radiant Blessing** | No | Blessed by the aura of light: bonus status immunity, bonus damage against Undead, flat damage reduction, and HP regeneration. |
| <img src="/images/icon_effect_solar_rebirth.png" class="sprite" alt="icon_effect_solar_rebirth" width="20" height="20"> | **Solar Rebirth** | No | Wrapped in Phoenix solar flames: survives one lethal hit at 1 HP. |
| <img src="/images/icon_effect_sanguine_fervor.png" class="sprite" alt="icon_effect_sanguine_fervor" width="20" height="20"> | **Sanguine Fervor** | No | empowered by Sanguine Fervor |
| <img src="/images/icon_effect_sinister_curse.png" class="sprite" alt="icon_effect_sinister_curse" width="20" height="20"> | **Sinister Curse** | Yes | A malign crimson curse. Increases damage taken by 50%. If the afflicted dies while cursed, their soul is reaped into an enemy Bone Nightmare. |
| <img src="/images/icon_effect_entangle.png" class="sprite" alt="icon_effect_entangle" width="20" height="20"> | **Entangle** | Yes | — |
<!-- END GENERATED DATA -->

## Source

[`app/src/main/kotlin/.../entities/StatusEffectType.kt`](https://github.com/Lemoinie/IGM-Modded/blob/main/app/src/main/kotlin/it/paranoidsquirrels/idleguildmaster/storage/data/entities/StatusEffectType.kt)
