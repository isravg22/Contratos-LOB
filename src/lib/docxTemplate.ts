import { promises as fs } from "fs";
import path from "path";
import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { ContractFormData, buildReplacements } from "./contractFields";

const TEMPLATE_NAME = "CONTRATO_LOB_plantilla.docx";
const font = "Manrope";

export async function renderContractDocx(data: ContractFormData) {
  const templatePath = path.join(process.cwd(), TEMPLATE_NAME);
  const template = await fs.readFile(templatePath, "utf8");
  const markdown = applyReplacements(template, data);
  const children = parseMarkdownContract(markdown);
  const logo = await readLogo();

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font, size: 20 },
          paragraph: { spacing: { after: 160 } },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: logo
          ? {
              default: new Header({
                children: [
                  new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                      new ImageRun({
                        type: "png",
                        data: logo,
                        transformation: { width: 126, height: 40 },
                      }),
                    ],
                  }),
                ],
              }),
            }
          : undefined,
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: `LA OLA BUENA | ${data.companyName || ""}`, size: 16 }),
                ],
              }),
            ],
          }),
        },
        children,
      },
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

function parseMarkdownContract(markdown: string) {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const children: Array<Paragraph | Table> = [];
  let firstHeading = true;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim();

    if (!line) continue;

    if (line.startsWith("|")) {
      const tableLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith("|")) {
        tableLines.push(lines[index].trim());
        index += 1;
      }
      index -= 1;
      children.push(markdownTable(tableLines));
      continue;
    }

    if (line.startsWith("- ")) {
      children.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 120 },
          children: inlineRuns(line.slice(2), 20),
        })
      );
      continue;
    }

    if (isBoldLine(line)) {
      const text = line.slice(2, -2);
      children.push(
        new Paragraph({
          heading: firstHeading ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
          spacing: { before: firstHeading ? 0 : 420, after: 140 },
          children: [
            new TextRun({
              text,
              bold: true,
              font,
              size: firstHeading ? 28 : 23,
            }),
          ],
        })
      );
      firstHeading = false;
      continue;
    }

    children.push(
      new Paragraph({
        alignment: AlignmentType.JUSTIFIED,
        spacing: { after: 160 },
        children: inlineRuns(line, 20),
      })
    );
  }

  return children;
}

function markdownTable(lines: string[]) {
  const rows = lines
    .map((line) =>
      line
        .replace(/^\|/, "")
        .replace(/\|$/, "")
        .split("|")
        .map((cell) => cell.trim())
    )
    .filter((cells) => !cells.every((cell) => /^:?-{3,}:?$/.test(cell)));

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: tableBorder(),
      bottom: tableBorder(),
      left: tableBorder(),
      right: tableBorder(),
      insideHorizontal: tableBorder(),
      insideVertical: tableBorder(),
    },
    rows: rows.map(
      (cells, rowIndex) =>
        new TableRow({
          children: cells.map(
            (cell) =>
              new TableCell({
                shading: rowIndex === 0 ? { fill: "E7ECEF" } : undefined,
                margins: { top: 90, right: 120, bottom: 90, left: 120 },
                children: [
                  new Paragraph({
                    children: inlineRuns(cell, 19, rowIndex === 0),
                  }),
                ],
              })
          ),
        })
    ),
  });
}

function inlineRuns(text: string, size: number, forceBold = false) {
  const parts = text.split("**");
  return parts.map(
    (part, index) =>
      new TextRun({
        text: part,
        bold: forceBold || index % 2 === 1,
        font,
        size,
      })
  );
}

function isBoldLine(line: string) {
  return line.startsWith("**") && line.endsWith("**") && line.length > 4;
}

function tableBorder() {
  return { style: BorderStyle.SINGLE, size: 1, color: "D7DDE2" };
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
