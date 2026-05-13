export type ContractFormData = {
  companyName: string;
  legalRepresentative: string;
  taxId: string;
  fiscalAddress: string;
  signatureDate: string;
  servicesValue: string;
  offerValue: string;
  offerDuration: string;
  developmentTime: string;
  contractDuration: string;
};

export const defaultContractData: ContractFormData = {
  companyName: "",
  legalRepresentative: "",
  taxId: "",
  fiscalAddress: "",
  signatureDate: "",
  servicesValue: "",
  offerValue: "",
  offerDuration: "6",
  developmentTime: "30 dias",
  contractDuration: "12 meses",
};

export const fieldGroups = [
  {
    title: "Cliente",
    fields: [
      { name: "companyName", label: "Nombre de la empresa", placeholder: "Ej. Bakana Studio" },
      { name: "legalRepresentative", label: "Representante legal", placeholder: "Nombre y apellidos" },
      { name: "taxId", label: "NIF/CIF", placeholder: "B12345678" },
      { name: "fiscalAddress", label: "Domicilio fiscal", placeholder: "Calle, numero, ciudad y CP" },
    ],
  },
  {
    title: "Contrato",
    fields: [
      { name: "signatureDate", label: "Fecha de firma", placeholder: "13 de mayo de 2026" },
      { name: "servicesValue", label: "Valor de servicios", placeholder: "650" },
      { name: "offerValue", label: "Valor oferta", placeholder: "390" },
      { name: "offerDuration", label: "Duracion oferta", placeholder: "6" },
      { name: "developmentTime", label: "Tiempo de desarrollo", placeholder: "30 dias" },
      { name: "contractDuration", label: "Duracion del contrato", placeholder: "12 meses" },
    ],
  },
] as const;

export function buildReplacements(data: ContractFormData) {
  const company = clean(data.companyName, "[NOMBRE DE LA EMPRESA]");
  const representative = clean(data.legalRepresentative, "[NOMBRE REPRESENTANTE LEGAL]");
  const taxId = clean(data.taxId, "[NIF/CIF]");

  return {
    "[NOMBRE REPRESENTANTE LEGAL DE [NOMBRE DE LA EMPRESA]]": representative,
    "[NIF/CIF [NOMBRE DE LA EMPRESA]]": taxId,
    "[DOMICILIO FISCAL [NOMBRE DE LA EMPRESA]]": clean(
      data.fiscalAddress,
      "[DOMICILIO FISCAL]"
    ),
    "[NOMBRE REPRESENTANTE LEGAL]": representative,
    "[FECHA DE FIRMA]": clean(data.signatureDate, "[FECHA DE FIRMA]"),
    "[VALOR DE SERVICIOS]": clean(data.servicesValue, "[VALOR DE SERVICIOS]"),
    "[VALOR OFERTA]": clean(data.offerValue, "[VALOR OFERTA]"),
    "[DURACION OFERTA]": clean(data.offerDuration, "[DURACION OFERTA]"),
    "[DURACIÓN OFERTA]": clean(data.offerDuration, "[DURACION OFERTA]"),
    "[TIEMPO DE DESARROLLO]": clean(data.developmentTime, "[TIEMPO DE DESARROLLO]"),
    "[DURACION DEL CONTRATO]": clean(data.contractDuration, "[DURACION DEL CONTRATO]"),
    "[DURACIÓN DEL CONTRATO]": clean(data.contractDuration, "[DURACION DEL CONTRATO]"),
    "[NIF/CIF]": taxId,
    "[NOMBRE DE LA EMPRESA]": company,
  };
}

function clean(value: string, fallback: string) {
  return value.trim() || fallback;
}
