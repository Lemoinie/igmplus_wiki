export interface BuildPngItem {
  slot: string;
  name: string;
  sprite?: string;
  summary?: string;
}

export interface BuildPngDoctrineNode {
  name: string;
  level: number;
  maxLevel: number;
}

export interface BuildPngSkill {
  kind: 'Active' | 'Passive';
  name: string;
  description: string;
}

export interface BuildPngData {
  basePath: string;
  className: string;
  classId: string;
  classSprite: string;
  category: string;
  tier: number;
  level: number;
  maxLevel: number;
  ascended: boolean;
  attackTypeLabel: string;
  traits: { name: string; rare: boolean }[];
  potionsLabel?: string;
  equipment: BuildPngItem[];
  doctrine?: {
    name: string;
    spentLP: number;
    availableLP: number;
    nodes: BuildPngDoctrineNode[];
  } | null;
  coreStats: { label: string; value: string; sub?: string; accent?: string }[];
  combatStats: { label: string; value: string; accent?: string }[];
  skills: BuildPngSkill[];
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number,
): string[] {
  const clean = String(text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return [];
  const words = clean.split(' ');
  const lines: string[] = [];
  let cur = '';
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const test = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(test).width <= maxWidth) {
      cur = test;
    } else {
      if (cur) lines.push(cur);
      cur = w;
      if (lines.length === maxLines - 1) {
        let rest = [cur, ...words.slice(i + 1)].join(' ');
        while (rest.length > 1 && ctx.measureText(rest + '…').width > maxWidth) {
          rest = rest.slice(0, -1);
        }
        lines.push(rest.trimEnd() + '…');
        return lines;
      }
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function drawBadge(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  bg: string,
  border: string,
  color: string,
): number {
  ctx.font = '600 12px system-ui, -apple-system, Segoe UI, sans-serif';
  const tw = ctx.measureText(text).width;
  const w = Math.ceil(tw + 18);
  const h = 24;
  roundRect(ctx, x, y, w, h, 999);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.strokeStyle = border;
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x + 9, y + h / 2 + 0.5);
  return w;
}

function drawSprite(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | null,
  x: number,
  y: number,
  size: number,
) {
  if (!img) return;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  const ratio = Math.min(size / img.naturalWidth, size / img.naturalHeight);
  const dw = Math.round(img.naturalWidth * ratio);
  const dh = Math.round(img.naturalHeight * ratio);
  const dx = x + Math.round((size - dw) / 2);
  const dy = y + Math.round((size - dh) / 2);
  ctx.drawImage(img, dx, dy, dw, dh);
  ctx.restore();
}

export async function exportBuildPng(data: BuildPngData): Promise<void> {
  const W = 960;
  const PAD = 28;
  const INNER_W = W - PAD * 2;
  const GAP = 16;
  const LEFT_W = 408;
  const RIGHT_W = INNER_W - LEFT_W - GAP;

  const spriteUrl = (name?: string) => (name ? `${data.basePath}/images/${name}.png` : '');

  const [classImg, ...equipImgs] = await Promise.all([
    loadImage(spriteUrl(data.classSprite)),
    ...data.equipment.map((eq) => loadImage(spriteUrl(eq.sprite))),
  ]);

  // Pre-measure dynamic section heights
  const headerH = data.traits.length > 0 ? 124 : 98;
  const equipCardH = 74;
  const equipBlockH = 26 + data.equipment.length * equipCardH + (data.equipment.length - 1) * 10;

  const docNodes = data.doctrine?.nodes ?? [];
  const docVisibleNodes = docNodes.slice(0, 8);
  const docRows = Math.ceil(docVisibleNodes.length / 2);
  const doctrineBlockH = data.doctrine
    ? 56 + (docRows > 0 ? docRows * 24 + 8 : 22)
    : 0;
  const leftColH = equipBlockH + (doctrineBlockH ? 14 + doctrineBlockH : 0);

  const coreRows = Math.ceil(data.coreStats.length / 3);
  const coreBlockH = 26 + coreRows * 64 + Math.max(0, coreRows - 1) * 8;
  const combatRows = Math.ceil(data.combatStats.length / 2);
  const combatBlockH = 26 + combatRows * 28 + 16;
  const rightColH = coreBlockH + 14 + combatBlockH;

  const bodyH = Math.max(leftColH, rightColH);
  const skillsH = data.skills.length > 0 ? 128 : 0;
  const footerH = 28;
  const H =
    PAD +
    headerH +
    16 +
    bodyH +
    (skillsH ? 16 + skillsH : 0) +
    12 +
    footerH +
    PAD -
    8;

  const dpr = 2;
  const canvas = document.createElement('canvas');
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');
  ctx.scale(dpr, dpr);

  // Background
  const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
  bgGrad.addColorStop(0, '#0f1319');
  bgGrad.addColorStop(1, '#0b0f16');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // Outer card frame
  roundRect(ctx, 10, 10, W - 20, H - 20, 16);
  ctx.strokeStyle = '#243042';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // ================= HEADER =================
  let y = PAD;
  roundRect(ctx, PAD, y, INNER_W, headerH, 12);
  const headGrad = ctx.createLinearGradient(PAD, y, PAD + INNER_W, y + headerH);
  headGrad.addColorStop(0, '#18202c');
  headGrad.addColorStop(1, '#141c28');
  ctx.fillStyle = headGrad;
  ctx.fill();
  ctx.strokeStyle = '#2e3d55';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Class sprite box
  const spriteBox = 76;
  const sbX = PAD + 16;
  const sbY = y + Math.round((headerH - spriteBox) / 2);
  roundRect(ctx, sbX, sbY, spriteBox, spriteBox, 10);
  ctx.fillStyle = '#0a0d12';
  ctx.fill();
  ctx.strokeStyle = data.ascended ? '#eab308' : '#2e3d55';
  ctx.lineWidth = data.ascended ? 1.5 : 1;
  ctx.stroke();
  drawSprite(ctx, classImg, sbX + 6, sbY + 6, spriteBox - 12);

  // Class title & badges
  const titleX = sbX + spriteBox + 18;
  ctx.fillStyle = '#f8fafc';
  ctx.font = '800 24px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.textBaseline = 'top';
  ctx.fillText(data.className, titleX, y + 16);

  // Branding tag on top right
  ctx.font = '700 11px system-ui, -apple-system, Segoe UI, sans-serif';
  const brandTxt = 'IGM+ WIKI · BUILD CARD';
  const brandW = ctx.measureText(brandTxt).width;
  ctx.fillStyle = '#64748b';
  ctx.fillText(brandTxt, PAD + INNER_W - 16 - brandW, y + 18);

  let bx = titleX;
  const by = y + 50;
  bx += drawBadge(ctx, bx, by, `Tier ${data.tier}`, 'rgba(110,168,254,0.14)', 'rgba(110,168,254,0.4)', '#93c5fd') + 8;
  bx += drawBadge(ctx, bx, by, `Lv. ${data.level}/${data.maxLevel}`, '#0f172a', '#334155', '#e2e8f0') + 8;
  if (data.ascended) {
    bx += drawBadge(ctx, bx, by, '★ Ascended', 'rgba(234,179,8,0.16)', 'rgba(234,179,8,0.55)', '#fde047') + 8;
  }
  bx += drawBadge(ctx, bx, by, data.category, '#0f172a', '#2e3d55', '#9aa8ba') + 8;
  bx += drawBadge(ctx, bx, by, data.attackTypeLabel, '#0f172a', '#2e3d55', '#cbd5e1') + 8;
  if (data.potionsLabel) {
    drawBadge(ctx, bx, by, data.potionsLabel, 'rgba(52,211,153,0.12)', 'rgba(52,211,153,0.4)', '#6ee7b7');
  }

  if (data.traits.length > 0) {
    let tx = titleX;
    const ty = y + 84;
    ctx.font = '600 11px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textBaseline = 'middle';
    ctx.fillText('TRAITS:', tx, ty + 12);
    tx += 52;
    for (const tr of data.traits) {
      tx +=
        drawBadge(
          ctx,
          tx,
          ty,
          tr.name,
          tr.rare ? 'rgba(245,158,11,0.14)' : 'rgba(148,163,184,0.1)',
          tr.rare ? 'rgba(245,158,11,0.45)' : 'rgba(148,163,184,0.3)',
          tr.rare ? '#fbbf24' : '#e2e8f0',
        ) + 8;
    }
  }

  // ================= BODY: 2 COLUMNS =================
  const bodyY = y + headerH + 16;

  // --- LEFT COLUMN: Equipment ---
  let ly = bodyY;
  ctx.font = '700 12px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = '#9aa8ba';
  ctx.textBaseline = 'top';
  ctx.fillText('EQUIPMENT LOADOUT', PAD + 2, ly);
  ly += 22;

  data.equipment.forEach((eq, idx) => {
    const cy = ly + idx * (equipCardH + 10);
    roundRect(ctx, PAD, cy, LEFT_W, equipCardH, 10);
    ctx.fillStyle = '#18202c';
    ctx.fill();
    ctx.strokeStyle = '#243042';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Sprite frame
    const es = 50;
    roundRect(ctx, PAD + 12, cy + 12, es, es, 8);
    ctx.fillStyle = '#0a0d12';
    ctx.fill();
    ctx.strokeStyle = '#2e3d55';
    ctx.stroke();
    drawSprite(ctx, equipImgs[idx] ?? null, PAD + 15, cy + 15, es - 6);

    const textX = PAD + 12 + es + 12;
    const textW = LEFT_W - (es + 36);
    ctx.font = '700 10px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textBaseline = 'top';
    ctx.fillText(eq.slot.toUpperCase(), textX, cy + 11);

    ctx.font = '700 15px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.fillStyle = eq.name === 'Empty' ? '#64748b' : '#f1f5f9';
    const nameLine = wrapText(ctx, eq.name, textW, 1)[0] || eq.name;
    ctx.fillText(nameLine, textX, cy + 25);

    if (eq.summary) {
      ctx.font = '500 11.5px system-ui, -apple-system, Segoe UI, sans-serif';
      ctx.fillStyle = '#9aa8ba';
      const sumLine = wrapText(ctx, eq.summary, textW, 1)[0] || '';
      ctx.fillText(sumLine, textX, cy + 47);
    }
  });

  // --- LEFT COLUMN: Doctrine ---
  if (data.doctrine) {
    const dy = bodyY + equipBlockH + 14;
    roundRect(ctx, PAD, dy, LEFT_W, doctrineBlockH, 10);
    ctx.fillStyle = '#18202c';
    ctx.fill();
    ctx.strokeStyle = 'rgba(234,179,8,0.35)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '700 11px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.textBaseline = 'top';
    ctx.fillText('TEMPLE DOCTRINE', PAD + 14, dy + 12);

    const lpText = `${data.doctrine.spentLP} / ${data.doctrine.availableLP} LP`;
    ctx.font = '700 11px ui-monospace, Consolas, monospace';
    ctx.fillStyle = '#fde047';
    ctx.fillText(lpText, PAD + LEFT_W - 14 - ctx.measureText(lpText).width, dy + 12);

    ctx.font = '700 15px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.fillStyle = '#f8fafc';
    ctx.fillText(data.doctrine.name, PAD + 14, dy + 28);

    if (docVisibleNodes.length > 0) {
      const colW = (LEFT_W - 36) / 2;
      docVisibleNodes.forEach((n, idx) => {
        const col = idx % 2;
        const row = Math.floor(idx / 2);
        const nx = PAD + 14 + col * (colW + 8);
        const ny = dy + 54 + row * 24;
        ctx.font = '600 11.5px system-ui, -apple-system, Segoe UI, sans-serif';
        ctx.fillStyle = '#cbd5e1';
        const label = wrapText(ctx, `${n.name} (${n.level}/${n.maxLevel})`, colW, 1)[0] || n.name;
        ctx.fillText(`• ${label}`, nx, ny);
      });
    } else {
      ctx.font = '500 11.5px system-ui, -apple-system, Segoe UI, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('No doctrine nodes allocated', PAD + 14, dy + 54);
    }
  }

  // --- RIGHT COLUMN: Core Stats ---
  const rx = PAD + LEFT_W + GAP;
  let ry = bodyY;
  ctx.font = '700 12px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = '#9aa8ba';
  ctx.textBaseline = 'top';
  ctx.fillText('CORE STATS', rx + 2, ry);
  ry += 22;

  const tileGap = 8;
  const tileW = (RIGHT_W - tileGap * 2) / 3;
  const tileH = 64;
  data.coreStats.forEach((st, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const tx = rx + col * (tileW + tileGap);
    const ty = ry + row * (tileH + tileGap);
    roundRect(ctx, tx, ty, tileW, tileH, 9);
    ctx.fillStyle = '#18202c';
    ctx.fill();
    ctx.strokeStyle = '#243042';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = '700 10.5px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.fillStyle = '#9aa8ba';
    ctx.textBaseline = 'top';
    ctx.fillText(st.label.toUpperCase(), tx + 11, ty + 9);

    ctx.font = '800 19px ui-monospace, Consolas, monospace';
    ctx.fillStyle = st.accent || '#f8fafc';
    ctx.fillText(st.value, tx + 11, ty + 25);

    if (st.sub) {
      ctx.font = '500 10.5px system-ui, -apple-system, Segoe UI, sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(st.sub, tx + 11, ty + 47);
    }
  });

  // --- RIGHT COLUMN: Combat Stats ---
  const cyStart = bodyY + coreBlockH + 14;
  ctx.font = '700 12px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = '#9aa8ba';
  ctx.textBaseline = 'top';
  ctx.fillText('COMBAT PROFILE', rx + 2, cyStart);

  const cBoxY = cyStart + 22;
  const cBoxH = combatRows * 28 + 16;
  roundRect(ctx, rx, cBoxY, RIGHT_W, cBoxH, 10);
  ctx.fillStyle = '#18202c';
  ctx.fill();
  ctx.strokeStyle = '#243042';
  ctx.lineWidth = 1;
  ctx.stroke();

  const statColW = (RIGHT_W - 36) / 2;
  data.combatStats.forEach((st, idx) => {
    const col = idx % 2;
    const row = Math.floor(idx / 2);
    const sx = rx + 14 + col * (statColW + 12);
    const sy = cBoxY + 12 + row * 28;
    ctx.font = '500 12px system-ui, -apple-system, Segoe UI, sans-serif';
    ctx.fillStyle = '#9aa8ba';
    ctx.textBaseline = 'top';
    ctx.fillText(st.label, sx, sy);

    ctx.font = '700 12.5px ui-monospace, Consolas, monospace';
    ctx.fillStyle = st.accent || '#f1f5f9';
    const vw = ctx.measureText(st.value).width;
    ctx.fillText(st.value, sx + statColW - vw, sy);

    if (row < combatRows - 1) {
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.beginPath();
      ctx.moveTo(sx, sy + 21);
      ctx.lineTo(sx + statColW, sy + 21);
      ctx.stroke();
    }
  });

  // ================= SKILLS =================
  if (data.skills.length > 0) {
    const sy = bodyY + bodyH + 16;
    const skW = data.skills.length === 1 ? INNER_W : (INNER_W - GAP) / 2;
    data.skills.forEach((sk, idx) => {
      const sx = PAD + idx * (skW + GAP);
      roundRect(ctx, sx, sy, skW, skillsH, 10);
      ctx.fillStyle = '#18202c';
      ctx.fill();
      ctx.strokeStyle = sk.kind === 'Active' ? 'rgba(110,168,254,0.35)' : 'rgba(192,132,252,0.35)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.font = '700 10.5px system-ui, -apple-system, Segoe UI, sans-serif';
      ctx.fillStyle = sk.kind === 'Active' ? '#6ea8fe' : '#c084fc';
      ctx.textBaseline = 'top';
      ctx.fillText(`${sk.kind.toUpperCase()} SKILL`, sx + 14, sy + 12);

      ctx.font = '700 15px system-ui, -apple-system, Segoe UI, sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(sk.name, sx + 14, sy + 28);

      ctx.font = '400 12px system-ui, -apple-system, Segoe UI, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      const lines = wrapText(ctx, sk.description, skW - 28, 3);
      lines.forEach((ln, li) => {
        ctx.fillText(ln, sx + 14, sy + 54 + li * 19);
      });
    });
  }

  // ================= FOOTER =================
  const fy = H - PAD - 8;
  ctx.font = '500 11px system-ui, -apple-system, Segoe UI, sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.textBaseline = 'bottom';
  ctx.fillText('Generated with Idle Guild Master Plus Community Wiki — Build Simulator', PAD + 2, fy);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('Failed to encode PNG');
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const slug = data.classId.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  a.href = url;
  a.download = `${slug}-lv${data.level}-build.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
