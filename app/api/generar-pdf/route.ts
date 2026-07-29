import { NextResponse } from "next/server";
import { ContractFormData, defaultContractData } from "@/src/lib/contractFields";
import { pdfFileName, renderContractPdf } from "@/src/lib/pdfTemplate";
import { auth, isAllowedEmail } from "@/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await auth();

  if (!isAllowedEmail(session?.user?.email)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as Partial<ContractFormData>;
    const data: ContractFormData = {
      ...defaultContractData,
      ...payload,
    };
    const buffer = await renderContractPdf(data);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${pdfFileName(data.companyName)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo generar el PDF." },
      { status: 500 }
    );
  }
}
