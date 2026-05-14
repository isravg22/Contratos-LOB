"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import {
  ContractFormData,
  defaultContractData,
  fieldGroups,
  serviceModules,
} from "@/src/lib/contractFields";

type Status =
  | "idle"
  | "loading"
  | "uploading_docx"
  | "uploading_pdf"
  | "success"
  | "drive_success"
  | "upload_error"
  | "error";
type OutputFormat = "pdf" | "docx";

const TEXT_FIELD_NAMES = [
  "companyName",
  "legalRepresentative",
  "taxId",
  "fiscalAddress",
  "signatureDate",
  "servicesValue",
  "offerValue",
  "offerDuration",
  "developmentTime",
  "contractDuration",
] as const;

export default function Home() {
  const [form, setForm] = useState<ContractFormData>(defaultContractData);
  const [status, setStatus] = useState<Status>("idle");
  const [format, setFormat] = useState<OutputFormat>("docx");

  const completedFields = useMemo(
    () => TEXT_FIELD_NAMES.filter((k) => (form[k] as string).trim()).length,
    [form]
  );

  const hasInstagram = form.selectedServices.includes("gestion_instagram");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const contract = await buildContractFile(format);

    if (!contract) {
      setStatus("error");
      return;
    }

    downloadBlob(contract.blob, contract.fileName);
    setStatus("success");
  }

  async function handleDriveUpload(uploadFormat: OutputFormat) {
    setStatus(uploadFormat === "docx" ? "uploading_docx" : "uploading_pdf");

    const contract = await buildContractFile(uploadFormat);

    if (!contract) {
      setStatus("error");
      return;
    }

    const uploaded = await uploadToDrive(contract.blob, contract.fileName, uploadFormat);
    setStatus(uploaded ? "drive_success" : "upload_error");
  }

  async function buildContractFile(outputFormat: OutputFormat) {
    const response = await fetch(
      outputFormat === "pdf" ? "/api/generar-pdf" : "/api/generar-contrato",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      }
    );

    if (!response.ok) return null;

    const blob = await response.blob();
    const company = form.companyName.trim().replace(/[^a-zA-Z0-9]+/g, "_");
    const fileName = `CONTRATO_LOB${company ? `_${company}` : ""}.${outputFormat}`;

    return { blob, fileName };
  }

  function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function updateField(name: keyof ContractFormData, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    if (status !== "idle") setStatus("idle");
  }

  function toggleService(id: string, checked: boolean) {
    setForm((current) => ({
      ...current,
      selectedServices: checked
        ? [...current.selectedServices, id]
        : current.selectedServices.filter((s) => s !== id),
    }));
    if (status !== "idle") setStatus("idle");
  }

  async function uploadToDrive(blob: Blob, fileName: string, uploadFormat: OutputFormat) {
    try {
      const response = await fetch("/api/subir-drive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName,
          mimeType: blob.type || mimeTypeFor(uploadFormat),
          base64: await blobToBase64(blob),
        }),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  return (
    <main className="shell">
      <section className="workspace">
        <aside className="panel intro">
          <div className="brandMark">
            <Image src="/brand.png" alt="La Ola Buena" width={220} height={70} priority />
          </div>
          <div>
            <p className="eyebrow">Generador de contratos</p>
            <h1>La Ola Buena</h1>
            <p className="lead">
              Rellena los datos variables y genera el documento Word manteniendo
              la plantilla profesional que ya tienes preparada en PDF.
            </p>
          </div>

          <div className="summary">
            <span>{completedFields}/10 campos · {form.selectedServices.length} servicios</span>
            <strong>{form.companyName || "Nuevo cliente"}</strong>
          </div>
        </aside>

        <form className="panel formPanel" onSubmit={handleSubmit}>
          {fieldGroups.map((group) => (
            <fieldset key={group.title}>
              <legend>{group.title}</legend>
              <div className="grid">
                {group.fields.map((field) => (
                  <label key={field.name} className="field">
                    <span>{field.label}</span>
                    <input
                      value={form[field.name]}
                      placeholder={field.placeholder}
                      onChange={(event) => updateField(field.name, event.target.value)}
                    />
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <fieldset>
            <legend>Servicios</legend>
            <div className="servicesGrid">
              {serviceModules.map((service) => (
                <label key={service.id} className="serviceCheck">
                  <input
                    type="checkbox"
                    checked={form.selectedServices.includes(service.id)}
                    onChange={(e) => toggleService(service.id, e.target.checked)}
                  />
                  <span>{service.label}</span>
                </label>
              ))}
            </div>
            {hasInstagram && (
              <label className="field instagramField">
                <span>Posts / Reels mensuales</span>
                <input
                  value={form.instagramPosts}
                  placeholder="Ej. 12 posts y 4 reels"
                  onChange={(e) => updateField("instagramPosts", e.target.value)}
                />
              </label>
            )}
          </fieldset>

          <div className="actions">
            <div className="formatSwitch" aria-label="Formato de salida">
              <button
                type="button"
                className={format === "docx" ? "active" : ""}
                onClick={() => setFormat("docx")}
              >
                DOCX
              </button>
              <button
                type="button"
                className={format === "pdf" ? "active" : ""}
                onClick={() => setFormat("pdf")}
              >
                PDF
              </button>
            </div>
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Generando..." : `Generar contrato ${format.toUpperCase()}`}
            </button>
            <div className="driveActions" aria-label="Subida a Drive">
              <button
                type="button"
                className="secondaryAction"
                disabled={status === "uploading_docx" || status === "uploading_pdf"}
                onClick={() => handleDriveUpload("docx")}
              >
                {status === "uploading_docx" ? "Subiendo DOCX..." : "Subir DOCX a Drive"}
              </button>
              <button
                type="button"
                className="secondaryAction"
                disabled={status === "uploading_docx" || status === "uploading_pdf"}
                onClick={() => handleDriveUpload("pdf")}
              >
                {status === "uploading_pdf" ? "Subiendo PDF..." : "Subir PDF a Drive"}
              </button>
            </div>
            <p className={`status ${status}`}>
              {status === "success" && "Contrato generado y descargado."}
              {status === "drive_success" && "Contrato subido a Drive."}
              {status === "upload_error" && "No se pudo subir el contrato a Drive."}
              {status === "error" && "No se pudo generar el contrato."}
            </p>
          </div>
        </form>

        <section className="panel preview">
          <div className="previewTop">
            <span>Vista rapida</span>
            <strong>{form.signatureDate || "Fecha pendiente"}</strong>
          </div>
          <article>
            <h2>CONTRATO PROFESIONAL - {form.companyName || "[NOMBRE DE LA EMPRESA]"}</h2>
            <p>
              En Cadiz, a <b>{form.signatureDate || "[FECHA DE FIRMA]"}</b>
            </p>
            <p>
              De una parte,{" "}
              <b>{form.legalRepresentative || "[NOMBRE REPRESENTANTE LEGAL]"}</b>{" "}
              con NIF <b>{form.taxId || "[NIF/CIF]"}</b>, y domicilio en{" "}
              <b>{form.fiscalAddress || "[DOMICILIO FISCAL]"}</b>.
            </p>
            <p>
              El valor de los servicios contratados asciende a{" "}
              <b>{form.servicesValue || "[VALOR DE SERVICIOS]"} EUR + IVA mensual</b>.
              La oferta mensual sera de{" "}
              <b>{form.offerValue || "[VALOR OFERTA]"} EUR + IVA</b> durante{" "}
              <b>{form.offerDuration || "[DURACION OFERTA]"} meses</b>.
            </p>
            <p>
              Tiempo de desarrollo: <b>{form.developmentTime || "[TIEMPO]"}</b>.
              Duracion minima: <b>{form.contractDuration || "[DURACION]"}</b>.
            </p>
            <p>
              <b>Servicios:</b>{" "}
              {form.selectedServices.length === 0
                ? "Ninguno seleccionado"
                : serviceModules
                    .filter((m) => form.selectedServices.includes(m.id))
                    .map((m) => m.label)
                    .join(", ")}
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result);
      resolve(result.split(",")[1] || "");
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function mimeTypeFor(format: OutputFormat) {
  if (format === "pdf") return "application/pdf";

  return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}
