import type { Translation } from "./content";
export type CardFormat = "square" | "story";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error("Cartoon artwork could not load.")); img.src = src; });
}
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number) {
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    for (const word of paragraph.split(/\s+/u)) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= width) { line = next; continue; }
      if (line) { lines.push(line); line = ""; }
      if (ctx.measureText(word).width <= width) { line = word; continue; }
      // Split exceptionally long tokens by grapheme, keeping Devanagari clusters intact.
      const Segmenter = (Intl as unknown as { Segmenter: new (locale: string, opts: { granularity: string }) => { segment: (value: string) => Iterable<{ segment: string }> } }).Segmenter;
      const clusters = Segmenter ? Array.from(new Segmenter("ne", { granularity: "grapheme" }).segment(word), part => part.segment) : Array.from(word);
      for (const cluster of clusters) {
        if (line && ctx.measureText(line + cluster).width > width) { lines.push(line); line = cluster; }
        else line += cluster;
      }
    }
    lines.push(line);
  }
  return lines;
}
export function fitText(ctx: CanvasRenderingContext2D, text: string, width: number, height: number, maxSize = 36) {
  for (let size = maxSize; size >= 10; size--) {
    ctx.font = `600 ${size}px "Noto Devanagari", sans-serif`;
    const lines = wrap(ctx, text, width);
    if (lines.length * size * 1.52 <= height) return { lines, size, lineHeight: size * 1.52 };
  }
  throw new Error("यो पाठ चित्रमा अटेन। कृपया अलि छोटो बनाउनुहोस्।");
}
function textBox(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, width: number, height: number, maxSize: number) {
  const fitted = fitText(ctx, text, width, height, maxSize);
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  fitted.lines.forEach((line, index) => ctx.fillText(line, x, y + index * fitted.lineHeight));
}
function bubble(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, tail: "left" | "right") {
  ctx.fillStyle = color; ctx.strokeStyle = "#2c2923"; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.roundRect(x, y, w, h, 24); ctx.fill(); ctx.stroke();
  ctx.beginPath();
  const tip = tail === "left" ? x + 44 : x + w - 70;
  ctx.moveTo(tip, y + h - 2); ctx.lineTo(tip - 25, y + h + 34); ctx.lineTo(tip + 36, y + h - 2); ctx.fill(); ctx.stroke();
}
export async function renderShareCard(result: Translation, format: CardFormat): Promise<HTMLCanvasElement> {
  await Promise.all([document.fonts.load('600 32px "Noto Devanagari"'), document.fonts.load('800 80px "Editorial"')]);
  await document.fonts.ready;
  const portrait = await loadImage("/wagle-editorial.png");
  const canvas = document.createElement("canvas");
  canvas.width = 1080; canvas.height = format === "square" ? 1080 : 1920;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Image export is unavailable in this browser.");
  const story = format === "story";
  const h = canvas.height;
  ctx.fillStyle = "#f7f0df"; ctx.fillRect(0, 0, 1080, h);
  ctx.fillStyle = "#ded4bd";
  for (let y = 12; y < h; y += 9) for (let x = 12; x < 1080; x += 9) { ctx.beginPath(); ctx.arc(x, y, .55, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = "#2c2923"; ctx.lineWidth = 3; ctx.strokeRect(28, 28, 1024, h - 56);
  ctx.fillStyle = "#2c2923"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.font = '800 91px "Editorial", Georgia, serif'; ctx.fillText("WagleGPT", 540, 143);
  ctx.fillStyle = "#a33729"; ctx.font = '600 21px "Noto Devanagari", sans-serif';
  ctx.fillText("काल्पनिक व्यङ्ग्य · FICTIONAL PARODY", 540, 188);
  ctx.beginPath(); ctx.moveTo(65, 213); ctx.lineTo(1015, 213); ctx.stroke();
  const complicated = result.mode === "parody" ? result.translation : result.original;
  const simple = result.mode === "parody" ? result.original : result.translation;
  const firstY = story ? 320 : 250;
  const firstH = story ? 650 : 395;
  ctx.drawImage(portrait, 40, story ? 650 : 395, 360, 360 * portrait.naturalHeight / portrait.naturalWidth);
  bubble(ctx, 395, firstY, 610, firstH, "#fffaf0", "left");
  ctx.fillStyle = "#a33729"; ctx.font = '700 18px "Noto Devanagari"'; ctx.textAlign = "left"; ctx.fillText("THE COMPLICATED VERSION", 425, firstY + 36);
  ctx.fillStyle = "#2c2923";
  textBox(ctx, complicated, 425, firstY + 62, 550, firstH - 90, story ? 39 : 32);
  const secondY = story ? 1140 : 745;
  const secondH = story ? 495 : 210;
  bubble(ctx, 70, secondY, 750, secondH, "#e9c56b", "right");
  ctx.fillStyle = "#714329"; ctx.textAlign = "left"; ctx.font = '700 19px "Noto Devanagari"'; ctx.textBaseline = "alphabetic";
  ctx.fillText("भन्न खोजेको चाहिँ…", 100, secondY + 36);
  ctx.fillStyle = "#2c2923";
  textBox(ctx, simple, 100, secondY + 58, 690, secondH - 78, story ? 42 : 33);
  // An original, deliberately simple ordinary Nepali comic character.
  const cx = 928, cy = story ? 1590 : 845;
  ctx.fillStyle = "#b8c4b2"; ctx.beginPath(); ctx.roundRect(cx - 55, cy + 50, 115, 95, 25); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#e7bb8c"; ctx.beginPath(); ctx.ellipse(cx, cy, 50, 62, -.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = "#2c2923"; ctx.beginPath(); ctx.moveTo(cx - 50, cy - 10); ctx.lineTo(cx - 43, cy - 69); ctx.lineTo(cx - 3, cy - 88); ctx.lineTo(cx + 45, cy - 62); ctx.lineTo(cx + 50, cy - 10); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.arc(cx - 17, cy - 5, 3, 0, 7); ctx.arc(cx + 17, cy - 5, 3, 0, 7); ctx.fill();
  ctx.beginPath(); ctx.moveTo(cx - 22, cy - 23); ctx.lineTo(cx - 9, cy - 28); ctx.moveTo(cx + 9, cy - 28); ctx.lineTo(cx + 25, cy - 20); ctx.moveTo(cx - 10, cy + 32); ctx.quadraticCurveTo(cx + 5, cy + 17, cx + 22, cy + 30); ctx.stroke();
  ctx.fillStyle = "#2c2923"; ctx.textBaseline = "alphabetic"; ctx.textAlign = "center"; ctx.font = '600 21px "Noto Devanagari"';
  ctx.fillText("WagleGPT — Unofficial Satire · वास्तविक उद्धरण होइन", 540, h - 53);
  return canvas;
}
export function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("PNG export failed.")), "image/png"));
}
