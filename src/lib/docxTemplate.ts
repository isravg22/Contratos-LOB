import { promises as fs } from "fs";
import path from "path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
  Packer,
  Paragraph,
  SectionType,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from "docx";
import { ContractFormData, buildReplacements } from "./contractFields";

const TEMPLATE_NAME = "CONTRATO_LOB_plantilla.docx";
const font = "Manrope";
const pageWidth = 11906;
const pageHeight = 16838;
const margin = 1440;
const contentWidth = pageWidth - margin * 2;
const bodySize = 20;
const titleSize = 24;
const footerSize = 16;
const borderColor = "C8CDD3";

type Block =
  | { type: "heading"; text: string; level: 1 | 2 | 3 }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[]; serviceList: boolean }
  | { type: "table"; rows: string[][]; signature: boolean };

export async function renderContractDocx(data: ContractFormData) {
  const templatePath = path.join(process.cwd(), TEMPLATE_NAME);
  const template = await fs.readFile(templatePath, "utf8");
  const markdown = applyReplacements(template, data);
  const blocks = parseMarkdownContract(markdown);
  const logo = await readLogo();
  const signatureIndex = blocks.findIndex(
    (block) => block.type === "table" && block.signature
  );
  const finalClausesIndex = blocks.findIndex(
    (block) => block.type === "heading" && block.text.startsWith("DECIMOSEXTA.-")
  );
  const finalSectionIndex = finalClausesIndex >= 0 ? finalClausesIndex : signatureIndex;
  const bodyBlocks = finalSectionIndex >= 0 ? blocks.slice(0, finalSectionIndex) : blocks;
  const finalBlocks = finalSectionIndex >= 0 ? blocks.slice(finalSectionIndex) : [];

  const page = {
    size: { width: pageWidth, height: pageHeight },
    margin: { top: margin, right: margin, bottom: margin, left: margin },
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font, size: bodySize },
          paragraph: { spacing: { after: 120 } },
        },
      },
    },
    sections: [
      {
        properties: { page },
        headers: contractHeader(logo),
        footers: {
          default: new Footer({
            children: [footerLine(data.companyName)],
          }),
        },
        children: bodyBlocks.flatMap((block) => drawBlock(block)),
      },
      ...(finalBlocks.length
        ? [
            {
              properties: { page, type: SectionType.NEXT_PAGE },
              headers: contractHeader(logo),
              footers: {
                default: new Footer({ children: [new Paragraph({})] }),
              },
              children: finalBlocks.flatMap((block) => drawBlock(block)),
            },
          ]
        : []),
    ],
  });

  return Packer.toBuffer(doc);
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

function parseMarkdownContract(markdown: string): Block[] {
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

function drawBlock(block: Block): Array<Paragraph | Table> {
  if (block.type === "heading") return [heading(block.text, block.level)];
  if (block.type === "paragraph") return [paragraph(block.text)];
  if (block.type === "list") return block.items.map((item) => bullet(item, block.serviceList));
  if (block.signature) return [signatureTable(block)];
  return [dataTable(block)];
}

function heading(text: string, level: 1 | 2 | 3) {
  const isTitle = level === 1;
  const isSubheading = level === 3;
  const isMajor = text === "REUNIDOS" || text === "EXPONEN";

  return new Paragraph({
    spacing: {
      before: isTitle ? 0 : isSubheading ? 180 : isMajor ? 560 : 420,
      after: isTitle ? 20 : 100,
    },
    indent: undefined,
    children: [
      new TextRun({
        text,
        font,
        size: isTitle || isMajor ? titleSize : bodySize,
        bold: true,
        color: "000000",
      }),
    ],
  });
}

function paragraph(text: string) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 150 },
    children: inlineRuns(text, bodySize),
  });
}

function bullet(text: string, serviceList: boolean) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 100 },
    indent: serviceList ? { left: 900, hanging: 260 } : { left: 900, hanging: 260 },
    children: [
      new TextRun({ text: "- ", font, size: bodySize, color: "000000" }),
      ...inlineRuns(text, bodySize),
    ],
  });
}

function dataTable(table: Extract<Block, { type: "table" }>) {
  const columns = Math.max(...table.rows.map((row) => row.length));
  const colWidth = Math.floor(contentWidth / columns);

  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: contentWidth, type: WidthType.DXA },
    columnWidths: Array.from({ length: columns }, () => colWidth),
    margins: { top: 95, right: 120, bottom: 95, left: 120 },
    borders: lineTableBorders(),
    rows: table.rows.map(
      (row, rowIndex) =>
        new TableRow({
          cantSplit: true,
          children: Array.from({ length: columns }, (_, cellIndex) => {
            const cell = row[cellIndex] || "";
            const isHeader = rowIndex === 0;

            return new TableCell({
              width: { size: colWidth, type: WidthType.DXA },
              shading: isHeader ? { fill: "D9D9D9" } : undefined,
              margins: { top: 100, right: 140, bottom: 100, left: 140 },
              borders: lineCellBorders(),
              children: [
                new Paragraph({
                  spacing: { after: 0 },
                  children: inlineRuns(cell, bodySize, isHeader),
                }),
              ],
            });
          }),
        })
    ),
  });
}

function signatureTable(table: Extract<Block, { type: "table" }>) {
  const colWidth = Math.floor(contentWidth / 2);
  const rows = olaBuenaFirst(table.rows);
  const header = rows[0] || [];
  const detail = rows[1] || [];

  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: contentWidth, type: WidthType.DXA },
    columnWidths: [colWidth, colWidth],
    borders: clearTableBorders(),
    rows: [
      new TableRow({
        cantSplit: true,
        children: [0, 1].map((index) =>
          openCell(colWidth, [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              spacing: { after: 1050 },
              children: [
                new TextRun({
                  text: stripMarkdown(header[index] || ""),
                  font,
                  size: bodySize,
                  bold: true,
                  color: "000000",
                }),
              ],
            }),
            ...signatureLines(detail[index] || "").map(
              (line) =>
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 45 },
                  children: [
                    new TextRun({ text: line, font, size: bodySize, color: "000000" }),
                  ],
                })
            ),
          ])
        ),
      }),
    ],
  });
}

function contractHeader(logo?: Buffer) {
  if (!logo) return undefined;

  return {
    default: new Header({
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { after: 80 },
          children: [
            new ImageRun({
              type: "png",
              data: logo,
              transformation: { width: 132, height: 22 },
            }),
          ],
        }),
      ],
    }),
  };
}

function olaBuenaFirst(rows: string[][]) {
  const header = rows[0] || [];
  if (header[1]?.includes("LA OLA BUENA") && !header[0]?.includes("LA OLA BUENA")) {
    return rows.map((row) => [row[1] || "", row[0] || "", ...row.slice(2)]);
  }

  return rows;
}

function footerLine(companyName: string) {
  const half = Math.floor(contentWidth / 2);
  return new Table({
    layout: TableLayoutType.FIXED,
    width: { size: contentWidth, type: WidthType.DXA },
    columnWidths: [half, contentWidth - half],
    borders: clearTableBorders(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: half, type: WidthType.DXA },
            borders: clearCellBorders(),
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [
              new Paragraph({
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: "LA OLA BUENA", font, size: footerSize, color: "000000" })],
              }),
            ],
          }),
          new TableCell({
            width: { size: contentWidth - half, type: WidthType.DXA },
            borders: clearCellBorders(),
            margins: { top: 0, bottom: 0, left: 0, right: 0 },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 0, after: 0 },
                children: [new TextRun({ text: companyName || "", font, size: footerSize, color: "000000" })],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function openCell(width: number, children: Paragraph[]) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    margins: { top: 0, right: 0, bottom: 0, left: 0 },
    borders: clearCellBorders(),
    children,
  });
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

function inlineRuns(text: string, size: number, forceBold = false) {
  return text.split("**").map((part, index) => {
    const underlined = part.startsWith("__") && part.endsWith("__") && part.length > 4;
    return new TextRun({
      text: underlined ? part.slice(2, -2) : part,
      bold: forceBold || index % 2 === 1,
      font,
      size,
      underline: underlined ? { type: UnderlineType.SINGLE } : undefined,
      color: "000000",
    });
  });
}

function signatureLines(value: string) {
  const cleaned = stripMarkdown(value).replace(/_{4,}/g, "").replace(/\s+/g, " ").trim();
  const nifIndex = cleaned.search(/\bNIF\:/i);
  const cifIndex = cleaned.search(/\bC\.?I\.?F\.?:?/i);
  const splitIndex = nifIndex >= 0 ? nifIndex : cifIndex;

  if (splitIndex > 0) {
    return [cleaned.slice(0, splitIndex).trim(), cleaned.slice(splitIndex).trim()];
  }

  return [cleaned];
}

function stripMarkdown(text: string) {
  return text.replace(/\*\*/g, "");
}

function isBoldLine(line: string) {
  return line.startsWith("**") && line.endsWith("**") && line.length > 4;
}

function clearTableBorders() {
  const border = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return {
    top: border,
    bottom: border,
    left: border,
    right: border,
    insideHorizontal: border,
    insideVertical: border,
  };
}

function clearCellBorders() {
  const border = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return { top: border, bottom: border, left: border, right: border };
}

function lineTableBorders() {
  const border = { style: BorderStyle.SINGLE, size: 6, color: borderColor };
  return {
    top: border,
    bottom: border,
    left: border,
    right: border,
    insideHorizontal: border,
    insideVertical: border,
  };
}

function lineCellBorders() {
  const border = { style: BorderStyle.SINGLE, size: 6, color: borderColor };
  return { top: border, bottom: border, left: border, right: border };
}

async function readLogo() {
  try {
    return await fs.readFile(path.join(process.cwd(), "public", "brand.png"));
  } catch {
    return undefined;
  }
}

export function contractFileName(companyName: string) {
  const suffix = companyName
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();

  return `CONTRATO_LOB${suffix ? `_${suffix}` : ""}.docx`;
}
