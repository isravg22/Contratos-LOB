import { promises as fs } from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import SVGtoPDF from "svg-to-pdfkit";
import { ContractFormData, buildReplacements } from "./contractFields";

const TEMPLATE_NAME = "CONTRATO_LOB_plantilla.docx";
const LOGO_NAME = "lob-brand1.svg";
const FONT_REGULAR_PATH = "assets/fonts/Manrope-Regular.ttf";
const FONT_BOLD_PATH = "assets/fonts/Manrope-ExtraBold.ttf";
const PAGE = {
  marginTop: 72,
  marginBottom: 86,
  marginX: 72,
};
const CONTENT_WIDTH = 595.28 - PAGE.marginX * 2;
const FONT_REGULAR = "Manrope";
const FONT_BOLD = "Manrope-Bold";

type Block =
  | { type: "heading"; text: string; level: 1 | 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[]; serviceList: boolean }
  | { type: "table"; rows: string[][]; signature: boolean };

export async function renderContractPdf(data: ContractFormData) {
  const template = await fs.readFile(path.join(process.cwd(), TEMPLATE_NAME), "utf8");
  const markdown = applyReplacements(template, data);
  const logoSvg = await readLogoSvg();
  const blocks = parseMarkdown(markdown);

  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: {
        top: PAGE.marginTop,
        bottom: 40,
        left: PAGE.marginX,
        right: PAGE.marginX,
      },
      bufferPages: true,
      compress: true,
      info: {
        Title: `Contrato profesional - ${data.companyName || "Cliente"}`,
        Author: "La Ola Buena",
      },
    });
    registerFonts(doc);

    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.on("pageAdded", () => {
      drawHeader(doc, logoSvg);
      doc.y = PAGE.marginTop;
    });

    drawHeader(doc, logoSvg);
    doc.y = PAGE.marginTop;
    blocks.forEach((block) => drawBlock(doc, block));
    drawFooters(doc, data.companyName);
    doc.end();
  });
}

function applyReplacements(template: string, data: ContractFormData) {
  let output = template;
  const replacements = Object.entries(buildReplacements(data)).sort(
    ([a], [b]) => b.length - a.length
  );

  for (const [placeholder, value] of replacements) {
    output = output.split(placeholder).join(value);
  }

  return output;
}

function parseMarkdown(markdown: string): Block[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let firstHeading = true;
  let listItems: string[] = [];
  let inServiceModule = false;
  let hasSignatureTable = false;

  const flushList = () => {
    if (listItems.length) {
      blocks.push({ type: "list", items: listItems, serviceList: inServiceModule });
      listItems = [];
    }
  };

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();
    if (!line) {
      flushList();
      continue;
    }

    if (line.startsWith("|")) {
      flushList();
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      index -= 1;
      const table = markdownTable(tableLines);
      if (table && (!table.signature || !hasSignatureTable)) {
        blocks.push(table);
        if (table.signature) hasSignatureTable = true;
      }
      continue;
    }

    if (line.startsWith("- ")) {
      listItems.push(line.slice(2));
      continue;
    }

    flushList();

    if (isBoldLine(line)) {
      const text = line.slice(2, -2);
      const level = firstHeading ? 1 : text.endsWith("Incluye:") ? 3 : 2;
      inServiceModule = level === 3;
      blocks.push({ type: "heading", text, level });
      firstHeading = false;
      continue;
    }

    blocks.push({ type: "paragraph", text: line });
  }

  flushList();
  return blocks;
}

function drawBlock(doc: PDFKit.PDFDocument, block: Block) {
  if (block.type === "heading") {
    drawHeading(doc, block);
  } else if (block.type === "paragraph") {
    drawParagraph(doc, block.text);
  } else if (block.type === "list") {
    block.items.forEach((item) => drawBullet(doc, item, block.serviceList));
    doc.y += 2;
  } else {
    drawTable(doc, block);
  }
}

function drawHeading(doc: PDFKit.PDFDocument, block: Extract<Block, { type: "heading" }>) {
  const isTitle = block.level === 1;
  const isSubheading = block.level === 3;
  const topGap = isTitle ? 0 : isSubheading ? 8 : isMajorHeading(block.text) ? 24 : 17;
  const fontSize = isTitle ? 12 : isMajorHeading(block.text) ? 12 : isSubheading ? 10 : 10;
  const left = 0;

  ensureSpace(doc, topGap + 20);
  doc.y += topGap;
  doc
    .font(FONT_BOLD)
    .fontSize(fontSize)
    .fillColor("#1f2428")
    .text(block.text, PAGE.marginX + left, doc.y, {
      width: CONTENT_WIDTH - left,
      lineGap: 0,
    });
  doc.y += isTitle ? 1 : 3;
}

function drawParagraph(doc: PDFKit.PDFDocument, text: string) {
  ensureSpace(doc, 26);
  doc
    .font(FONT_REGULAR)
    .fontSize(10)
    .fillColor("#1f2428")
    .text(stripMarkdown(text), PAGE.marginX, doc.y, {
      width: CONTENT_WIDTH,
      align: "justify",
      lineGap: 0.1,
    });
  doc.y += 5;
}

function drawBullet(doc: PDFKit.PDFDocument, text: string, serviceList: boolean) {
  ensureSpace(doc, 26);
  const y = doc.y;
  const markerLeft = serviceList ? 42 : 42;
  const textLeft = serviceList ? 60 : 60;

  doc.font(FONT_REGULAR).fontSize(10).text("-", PAGE.marginX + markerLeft, y, { width: 8 });
  doc
    .font(FONT_REGULAR)
    .fontSize(10)
    .fillColor("#1f2428")
    .text(stripMarkdown(text), PAGE.marginX + textLeft, y, {
      width: CONTENT_WIDTH - textLeft,
      align: "justify",
      lineGap: 0.1,
    });
  doc.y += 4;
}

function drawInlineText(
  doc: PDFKit.PDFDocument,
  text: string,
  x: number,
  y: number,
  width: number,
  align: "left" | "justify" | "center"
) {
  const parts = text.split("**");
  parts.forEach((part, index) => {
    doc
      .font(index % 2 === 1 ? FONT_BOLD : FONT_REGULAR)
      .fontSize(10)
      .fillColor("#1f2428")
      .text(part, index === 0 ? x : undefined, index === 0 ? y : undefined, {
        width,
        align,
        lineGap: 0.1,
        continued: index < parts.length - 1,
      });
  });
}

function drawTable(doc: PDFKit.PDFDocument, table: Extract<Block, { type: "table" }>) {
  if (!table.rows.length) return;

  if (table.signature) {
    drawSignatureBlock(doc, table);
    return;
  }

  const columns = Math.max(...table.rows.map((row) => row.length));
  const colWidth = CONTENT_WIDTH / columns;
  const estimatedHeight = table.rows.length * 28 + 20;
  ensureSpace(doc, Math.min(estimatedHeight, 150));
  doc.y += 4;

  table.rows.forEach((row, rowIndex) => {
    const cellHeights = row.map((cell) =>
      doc.heightOfString(stripMarkdown(cell), {
        width: colWidth - 14,
        lineGap: 0,
      })
    );
    const rowHeight = table.signature
      ? rowIndex === 0
        ? 22
        : 58
      : Math.max(22, Math.max(...cellHeights) + 12);

    ensureSpace(doc, rowHeight + 6);
    const y = doc.y;

    for (let cellIndex = 0; cellIndex < columns; cellIndex += 1) {
      const text = stripMarkdown(row[cellIndex] || "");
      const x = PAGE.marginX + cellIndex * colWidth;
      const isHeader = rowIndex === 0 && !table.signature;

      doc
        .rect(x, y, colWidth, rowHeight)
        .fillAndStroke(isHeader ? "#d9d9d9" : "#ffffff", "#c8ced4");
      doc
        .font(isHeader || row[cellIndex]?.includes("**") ? FONT_BOLD : FONT_REGULAR)
        .fontSize(10)
        .fillColor("#1f2428")
        .text(text, x + 7, y + 7, {
          width: colWidth - 14,
          align: "left",
          lineGap: 0,
        });
    }

    doc.y = y + rowHeight;
  });

  doc.y += 7;
}

function drawSignatureBlock(doc: PDFKit.PDFDocument, table: Extract<Block, { type: "table" }>) {
  const rows = olaBuenaFirst(table.rows);
  const header = rows[0] || [];
  const detail = rows[1] || [];
  const colWidth = CONTENT_WIDTH / 2;

  ensureSpace(doc, 220);
  doc.y += 24;
  const headerY = doc.y;

  for (let index = 0; index < 2; index += 1) {
    const x = PAGE.marginX + index * colWidth;
    doc
      .font(FONT_BOLD)
      .fontSize(10)
      .fillColor("#000000")
      .text(stripMarkdown(header[index] || ""), x, headerY, {
        width: colWidth,
        align: "center",
        lineBreak: false,
      });
  }

  const y = headerY + 92;
  const leftDetail = splitSignatureDetail(detail[0] || "");
  const rightDetail = splitSignatureDetail(detail[1] || "");
  drawCenteredSignatureLines(doc, leftDetail, PAGE.marginX, y, colWidth);
  drawCenteredSignatureLines(doc, rightDetail, PAGE.marginX + colWidth, y, colWidth);

  doc.y = y + 50;
}

function splitSignatureDetail(value: string) {
  const cleaned = stripMarkdown(value).replace(/_{4,}/g, "").replace(/\s+/g, " ").trim();
  const nifIndex = cleaned.search(/\bNIF\:/i);
  const cifIndex = cleaned.search(/\bC\.?I\.?F\.?:?/i);
  const splitIndex = nifIndex >= 0 ? nifIndex : cifIndex;

  if (splitIndex > 0) {
    return [cleaned.slice(0, splitIndex).trim(), cleaned.slice(splitIndex).trim()];
  }

  return [cleaned];
}

function drawCenteredSignatureLines(
  doc: PDFKit.PDFDocument,
  lines: string[],
  x: number,
  y: number,
  width: number
) {
  lines.forEach((line, index) => {
    doc
      .font(FONT_REGULAR)
      .fontSize(10)
      .fillColor("#000000")
      .text(line, x, y + index * 24, {
        width,
        align: "center",
        lineBreak: false,
        height: 16,
      });
  });
}

function drawHeader(doc: PDFKit.PDFDocument, logoSvg?: string) {
  if (!logoSvg) return;

  SVGtoPDF(doc, logoSvg, doc.page.width - PAGE.marginX - 132, 28, {
    width: 132,
    height: 17,
    preserveAspectRatio: "xMaxYMid meet",
  });
}

function drawFooters(doc: PDFKit.PDFDocument, companyName: string) {
  const range = doc.bufferedPageRange();
  const pageCount = range.count;
  for (let index = 0; index < pageCount - 1; index += 1) {
    doc.switchToPage(index);
    const originalY = doc.y;
    const originalBottomMargin = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const y = doc.page.height - 36;
    doc
      .font(FONT_REGULAR)
      .fontSize(8)
      .fillColor("#565f66")
      .text("LA OLA BUENA", PAGE.marginX, y, {
        width: 180,
        align: "left",
        lineBreak: false,
        height: 10,
      });
    doc.text(companyName || "", doc.page.width - PAGE.marginX - 220, y, {
      width: 220,
      align: "right",
      lineBreak: false,
      height: 10,
    });
    doc.page.margins.bottom = originalBottomMargin;
    doc.y = originalY;
  }
}

function olaBuenaFirst(rows: string[][]) {
  const header = rows[0] || [];
  if (header[1]?.includes("LA OLA BUENA") && !header[0]?.includes("LA OLA BUENA")) {
    return rows.map((row) => [row[1] || "", row[0] || "", ...row.slice(2)]);
  }

  return rows;
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > doc.page.height - PAGE.marginBottom) {
    doc.addPage();
  }
}

function markdownTable(lines: string[]): Extract<Block, { type: "table" }> | null {
  const rows = lines
    .map((line) =>
      line
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim())
    )
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)));

  if (
    rows.length <= 2 &&
    rows[0]?.[0]?.includes("LA OLA BUENA") &&
    rows[0]?.length === 2
  ) {
    return null;
  }

  return {
    type: "table",
    rows,
    signature: rows.some((row) => row.join(" ").includes("Por LA OLA BUENA")),
  };
}

function stripMarkdown(text: string) {
  return text.replace(/\*\*/g, "");
}

function isBoldLine(line: string) {
  return line.startsWith("**") && line.endsWith("**") && line.length > 4;
}

function isMajorHeading(text: string) {
  return text === "REUNIDOS" || text === "EXPONEN";
}

function registerFonts(doc: PDFKit.PDFDocument) {
  doc.registerFont(FONT_REGULAR, path.join(process.cwd(), FONT_REGULAR_PATH));
  doc.registerFont(FONT_BOLD, path.join(process.cwd(), FONT_BOLD_PATH));
}

async function readLogoSvg() {
  try {
    return await fs.readFile(path.join(process.cwd(), LOGO_NAME), "utf8");
  } catch {
    return undefined;
  }
}

export function pdfFileName(companyName: string) {
  const suffix = companyName
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  return `CONTRATO_LOB${suffix ? `_${suffix}` : ""}.pdf`;
}
