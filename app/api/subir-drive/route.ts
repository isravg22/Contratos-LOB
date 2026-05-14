import { NextResponse } from "next/server";

export const runtime = "nodejs";

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyZciOJEPrh3BBLwrL2orJsbPgxbPw-OMkskMAMlRYzmrIBexaWOpvMBQtwZwKWwQlH/exec";

type UploadPayload = {
  fileName?: string;
  mimeType?: string;
  base64?: string;
};

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as UploadPayload;

    if (!payload.fileName || !payload.mimeType || !payload.base64) {
      return NextResponse.json(
        { error: "Faltan datos del archivo para subirlo a Drive." },
        { status: 400 }
      );
    }

    const response = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        ...payload,
        filename: payload.fileName,
        pdf: payload.base64,
      }),
      redirect: "follow",
    });

    const text = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { error: "Apps Script rechazó la subida.", details: text },
        { status: response.status }
      );
    }

    let result: unknown;

    try {
      result = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: "Apps Script no devolvió una respuesta JSON válida.", details: text },
        { status: 502 }
      );
    }

    if (!isSuccessfulUpload(result)) {
      return NextResponse.json(
        { error: "Apps Script no pudo subir el archivo.", details: result },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo subir el contrato a Drive." },
      { status: 500 }
    );
  }
}

function isSuccessfulUpload(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const result = value as { ok?: unknown; success?: unknown; url?: unknown };

  if ("ok" in result) return result.ok === true;
  if ("success" in result) return result.success === true;

  return typeof result.url === "string";
}
