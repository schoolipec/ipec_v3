import "server-only";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import type { PDFFont, PDFImage } from "pdf-lib";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const PAGE_WIDTH = 1920;
export const PAGE_HEIGHT = 1080;
const TEXT_BOX = { x: 180, y: 200, width: 1560, height: 680 };
const TEXT_PADDING = 90;
const FOOTER_Y = 56;
const NAME_START = 84;
const NAME_MIN = 40;
const MSG_START = 64;
const MSG_MIN = 36;
const MAX_MESSAGE_CHARS = 500;
const NAVY = rgb(0.031, 0.161, 0.259);
const GREEN = rgb(0.227, 0.529, 0.14);

export type QueleaPdfItem = { name: string; message: string; createdAt: string };

export function formatReceivedDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es", {
    timeZone: "America/Los_Angeles",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function wrapByWords(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function wrapByChars(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  let current = "";
  for (const c of text) {
    const test = current + c;
    if (font.widthOfTextAtSize(test, size) > maxWidth && current) {
      lines.push(current.trimEnd());
      current = c === " " ? "" : c;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current.trimEnd());
  return lines;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const hasLongWord = text.split(/\s+/).some((w) => font.widthOfTextAtSize(w, size) > maxWidth);
  return hasLongWord ? wrapByChars(text, font, size, maxWidth) : wrapByWords(text, font, size, maxWidth);
}

function fitBlock(text: string, font: PDFFont, maxWidth: number, maxHeight: number, start: number, min: number) {
  for (let size = start; size >= min; size -= 2) {
    const lines = wrapText(text, font, size, maxWidth);
    if (lines.length * size * 1.25 <= maxHeight) return { lines, size };
  }
  return { lines: wrapText(text, font, min, maxWidth), size: min };
}

function loadPublic(relative: string): Buffer {
  return readFileSync(join(process.cwd(), "public", relative));
}

export async function buildPrayerQueleaPdf(items: QueleaPdfItem[]): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const background = await pdf.embedJpg(loadPublic("assets/brand/fondo-quelea.jpg"));
  const logo: PDFImage = await pdf.embedPng(loadPublic("assets/logo-transparent.png"));
  const logoHeight = 230;
  const logoWidth = logo.width * (logoHeight / logo.height);

  const textWidth = TEXT_BOX.width - TEXT_PADDING * 2;
  for (const item of items) {
    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    page.drawImage(background, { x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT });

    const name = fitBlock(item.name, bold, textWidth, 170, NAME_START, NAME_MIN);
    const nameTop = TEXT_BOX.y + TEXT_BOX.height - TEXT_PADDING;
    let y = nameTop - name.size;
    for (const line of name.lines) {
      const w = bold.widthOfTextAtSize(line, name.size);
      page.drawText(line, { x: (PAGE_WIDTH - w) / 2, y, size: name.size, font: bold, color: NAVY });
      y -= name.size * 1.25;
    }

    const divY = y + name.size * 0.2;
    page.drawLine({ start: { x: PAGE_WIDTH / 2 - 260, y: divY }, end: { x: PAGE_WIDTH / 2 + 260, y: divY }, thickness: 3, color: GREEN });

    const message = item.message.slice(0, MAX_MESSAGE_CHARS);
    const availableTop = divY - 40;
    const availableBottom = TEXT_BOX.y + TEXT_PADDING;
    const body = fitBlock(message, font, textWidth, availableTop - availableBottom, MSG_START, MSG_MIN);
    let by = availableTop - body.size;
    for (const line of body.lines) {
      const w = font.widthOfTextAtSize(line, body.size);
      page.drawText(line, { x: (PAGE_WIDTH - w) / 2, y: by, size: body.size, font, color: NAVY });
      by -= body.size * 1.25;
    }

    page.drawImage(logo, { x: 120, y: FOOTER_Y, width: logoWidth, height: logoHeight });
    const date = formatReceivedDate(item.createdAt);
    const dateSize = 34;
    const dateWidth = font.widthOfTextAtSize(date, dateSize);
    const dateX = PAGE_WIDTH - 120 - dateWidth;
    const dateY = FOOTER_Y + logoHeight / 2 - dateSize / 2;
    for (let dx = -3; dx <= 3; dx += 1.5) {
      for (let dy = -3; dy <= 3; dy += 1.5) {
        if (dx === 0 && dy === 0) continue;
        page.drawText(date, { x: dateX + dx, y: dateY + dy, size: dateSize, font, color: rgb(1, 1, 1) });
      }
    }
    page.drawText(date, { x: dateX, y: dateY, size: dateSize, font, color: NAVY });
  }
  return pdf.save();
}
