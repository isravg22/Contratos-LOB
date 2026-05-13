import { NextResponse } from "next/server";
import { ContractFormData, defaultContractData } from "@/src/lib/contractFields";
import { contractFileName, renderContractDocx } from "@/src/lib/docxTemplate";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Partial<ContractFormData>;
    const data: ContractFormData = {
      ...defaultContractData,
      ...payload,
    };
    const buffer = await renderContractDocx(data);

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${contractFileName(data.companyName)}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "No se pudo generar el contrato." },
      { status: 500 }
    );
  }
}
