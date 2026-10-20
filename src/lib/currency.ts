export type CoinType = 'diamond' | 'platinum' | 'gold' | 'silver' | 'copper';

export interface CoinStack {
  type: CoinType;
  amount: number;
  label: string;
  sprite: string;
  shortLabel: string;
}

export const COIN_CONFIG: Record<
  CoinType,
  { value: number; label: string; sprite: string; short: string }
> = {
  diamond: {
    value: 100_000_000,
    label: 'Diamond Coin',
    sprite: 'coin_diamond.png',
    short: 'd',
  },
  platinum: {
    value: 1_000_000,
    label: 'Platinum Coin',
    sprite: 'coin_platinum.png',
    short: 'p',
  },
  gold: {
    value: 10_000,
    label: 'Gold Coin',
    sprite: 'coin_gold.png',
    short: 'g',
  },
  silver: {
    value: 100,
    label: 'Silver Coin',
    sprite: 'coin_silver.png',
    short: 's',
  },
  copper: {
    value: 1,
    label: 'Copper Coin',
    sprite: 'coin_copper.png',
    short: 'c',
  },
};

export const COIN_ORDER: CoinType[] = ['diamond', 'platinum', 'gold', 'silver', 'copper'];

/**
 * Parses a raw copper price into tiered coin stacks.
 * Returns stacks from highest tier to lowest, omitting zero denominations unless total is 0.
 * If price is 0, returns a single stack of 0 copper coins.
 * If price is null/undefined/negative, returns empty array.
 */
export function parseCoins(price: number | null | undefined): CoinStack[] {
  if (price === null || price === undefined || isNaN(price) || price < 0) {
    return [];
  }

  let remaining = Math.floor(price);

  if (remaining === 0) {
    return [
      {
        type: 'copper',
        amount: 0,
        label: COIN_CONFIG.copper.label,
        sprite: COIN_CONFIG.copper.sprite,
        shortLabel: COIN_CONFIG.copper.short,
      },
    ];
  }

  const stacks: CoinStack[] = [];

  for (const type of COIN_ORDER) {
    const config = COIN_CONFIG[type];
    const amount = Math.floor(remaining / config.value);
    if (amount > 0) {
      stacks.push({
        type,
        amount,
        label: config.label,
        sprite: config.sprite,
        shortLabel: config.short,
      });
      remaining %= config.value;
    }
  }

  return stacks;
}

/**
 * Returns a compact formatted string for search descriptions or text summaries, e.g. "12g 58s 93c".
 */
export function formatCoinsText(price: number | null | undefined): string {
  const stacks = parseCoins(price);
  if (stacks.length === 0) return '—';
  return stacks.map((s) => `${s.amount}${s.shortLabel}`).join(' ');
}
