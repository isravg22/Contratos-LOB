"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";
import {
  ContractFormData,
  defaultContractData,
  fieldGroups,
} from "@/src/lib/contractFields";

type Status = "idle" | "loading" | "success" | "error";
type OutputFormat = "pdf" | "docx";

export default function Home() {
  const [form, setForm] = useState<ContractFormData>(defaultContractData);
  const [status, setStatus] = useState<Status>("idle");
  const [format, setFormat] = useState<OutputFormat>("docx");

  const completedFields = useMemo(
    () => Object.values(form).filter((value) => value.trim()).length,
    [form]
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");

    const response = await fetch(format === "pdf" ? "/api/generar-pdf" : "/api/generar-contrato", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      setStatus("error");
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const company = form.companyName.trim().replace(/[^a-zA-Z0-9]+/g, "_");
    link.href = url;
    link.download = `CONTRATO_LOB${company ? `_${company}` : ""}.${format}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    setStatus("success");
  }

  function updateField(name: keyof ContractFormData, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    if (status !== "idle") setStatus("idle");
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
            <span>{completedFields}/10 campos</span>
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
            <p className={`status ${status}`}>
              {status === "success" && "Contrato generado y descargado."}
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
          </article>
        </section>
      </section>
    </main>
  );
}
