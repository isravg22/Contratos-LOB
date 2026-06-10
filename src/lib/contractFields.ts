export type ContractFormData = {
  companyName: string;
  tagName: string;
  legalRepresentative: string;
  taxId: string;
  fiscalAddress: string;
  signatureDate: string;
  servicesValue: string;
  offerValue: string;
  offerDuration: string;
  developmentTime: string;
  contractDuration: string;
  selectedServices: string[];
  instagramPosts: string;
};

export const SERVICE_IDS = [
  "desarrollo_web",
  "mantenimiento",
  "seo_on_page",
  "estrategia_seo",
  "gestion_resenas",
  "gestion_instagram",
] as const;

export type ServiceId = (typeof SERVICE_IDS)[number];

export const serviceModules: ReadonlyArray<{ id: ServiceId; label: string; markdown: string }> = [
  {
    id: "desarrollo_web",
    label: "Desarrollo web",
    markdown: [
      "**Desarrollo web. Incluye:**",
      "",
      "- Diseño y maquetación de la web corporativa adaptada a la identidad de marca del CLIENTE.",
      "",
      "- Estructura de páginas, navegación y arquitectura de la información.",
      "",
      "- Versión responsive optimizada para móvil, tablet y escritorio.",
      "",
      "- Integración de formularios de contacto, llamadas a la acción y enlaces directos a canales de comunicación (WhatsApp, email, teléfono).",
      "",
      "- Configuración de hosting, dominio y certificado SSL.",
      "",
      "- Instalación y configuración base de WordPress y plantilla profesional con Elementor Pro.",
      "",
      "- Pruebas de funcionamiento, compatibilidad y velocidad antes de la publicación.",
    ].join("\n"),
  },
  {
    id: "mantenimiento",
    label: "Mantenimiento y securización",
    markdown: [
      "**Mantenimiento y securización. Incluye:**",
      "",
      "- Copias de seguridad de archivos automatizadas cada 15 días y almacenamiento en la nube durante dos meses mediante plugin profesional.",
      "",
      "- Copias de seguridad de base de datos cada 15 días y almacenamiento en la nube durante dos meses mediante plugin profesional.",
      "",
      "- Copia de seguridad diaria de archivos y bases de datos de los últimos 7 días.",
      "",
      "- Monitorización de seguridad web.",
      "",
      "- Revisión mensual de archivos críticos y base de datos.",
      "",
      "- Actualización mensual de plugins.",
      "",
      "- Actualización mensual de WordPress.",
      "",
      "- Limpieza y optimización periódica de base de datos.",
      "",
      "- Reducción y optimización de los plugins utilizados siempre que sea posible.",
      "",
      "- Asesoramiento en la selección de plugins nuevos e instalados.",
      "",
      "- Optimización de imágenes para mejora de la carga inicial.",
      "",
      "- Monitorización del rendimiento web y tests de rendimiento mensuales.",
      "",
      "- Subida y modificación de contenido web.",
      "",
      "- Comunicación directa prioritaria mediante WhatsApp y correo electrónico.",
      "",
      "- Soporte web y resolución de incidencias.",
      "",
      "- Informe mensual de las acciones realizadas, resultado de test de rendimiento y mejoras aplicadas.",
    ].join("\n"),
  },
  {
    id: "seo_on_page",
    label: "SEO on page",
    markdown: [
      "**SEO on page. Incluye:**",
      "",
      "- Perfil de empresa en Google y en Bing.",
      "",
      "- Configuración de Google Analytics e inclusión del código en la web.",
      "",
      "- Configuración y monitorización de Google Search Console.",
      "",
      "- Instalación y configuración del plugin Yoast SEO para WordPress.",
      "",
      "- Alta y configuración en SE Ranking (herramienta especializada para SEO).",
      "",
      "- Optimización SEO para asistentes de IA.",
      "",
      "- Redacción de títulos y meta descripciones orientadas a SEO.",
      "",
      "- Revisión de indexación de páginas y optimización de slugs.",
      "",
      "- Creación de textos alternativos (atributos ALT) en imágenes y medios.",
      "",
      "- Optimización de velocidad y Core Web Vitals.",
    ].join("\n"),
  },
  {
    id: "estrategia_seo",
    label: "Estrategia SEO mensual",
    markdown: [
      "**Estrategia SEO mensual. Incluye:**",
      "",
      "- Análisis de la competencia y de tendencias del sector.",
      "",
      "- Elección y tratamiento de palabras clave principales.",
      "",
      "- Estrategia de contenidos (plan básico de blog y landings).",
      "",
      "- SEO Local: optimización de mapas, citaciones en directorios y SEO geolocalizado.",
      "",
      "- Analítica de conversiones en la web (seguimiento de formularios, WhatsApp, llamadas y email).",
      "",
      "- Linkbuilding inicial: revisión y generación de enlaces en directorios de calidad.",
      "",
      "- Revisión mensual de estrategia SEO e implementación de conclusiones.",
      "",
      "- Informes trimestrales de rendimiento y evolución SEO.",
    ].join("\n"),
  },
  {
    id: "gestion_resenas",
    label: "Gestión de reseñas",
    markdown: [
      "**Gestión de reseñas. Incluye:**",
      "",
      "- Configuración y optimización del perfil público en Google y Bing para captación de reseñas.",
      "",
      "- Monitorización de nuevas reseñas y notificaciones al CLIENTE.",
      "",
      "- Propuesta de plantillas de respuesta a reseñas positivas y negativas.",
      "",
      "- Asesoramiento en la implementación de procesos para solicitar reseñas a clientes reales.",
      "",
      "- Inclusión de reseñas o testimonios destacados en la web cuando proceda.",
    ].join("\n"),
  },
  {
    id: "gestion_instagram",
    label: "Gestión de comunicación en Instagram",
    markdown: [
      "**Gestión de comunicación en Instagram. Incluye:**",
      "",
      "Estrategia y planificación:",
      "",
      "- Definir objetivos de comunicación y conversión (branding, engagement, tráfico, ventas).",
      "",
      "- Analizar el público objetivo (buyer persona, intereses, comportamientos).",
      "",
      "- Estudiar la competencia y tendencias del sector.",
      "",
      "- Elaborar un calendario editorial mensual con los tipos de contenido y formatos.",
      "",
      "Creación de contenido:",
      "",
      "- Diseñar contenido visual atractivo (imágenes, vídeos, reels, carruseles).",
      "",
      "- Redactar textos persuasivos y alineados con la identidad de marca.",
      "",
      "- Crear copys optimizados para la plataforma.",
      "",
      "- Desarrollar contenido evergreen y en tendencia.",
      "",
      "- Volumen mensual: [Nº POSTS / REELS MENSUALES]",
      "",
      "Gestión de la comunidad (Community Management):",
      "",
      "- Monitorizar comentarios y mensajes directos.",
      "",
      "- Responder a la comunidad con un tono alineado a la marca.",
      "",
      "- Fomentar la conversación y la interacción con los seguidores.",
      "",
      "- Gestionar posibles crisis de reputación online.",
      "",
      "Análisis y optimización:",
      "",
      "- Medir métricas clave (engagement, alcance, conversiones).",
      "",
      "- Elaborar informes mensuales con datos y conclusiones.",
      "",
      "- Ajustar estrategias según los resultados.",
      "",
      "Nota: El presupuesto destinado a publicidad pagada en Meta Ads (si procede) será aportado íntegramente por el CLIENTE y no está incluido en la cuota mensual de LA OLA BUENA.",
    ].join("\n"),
  },
];

export const defaultContractData: ContractFormData = {
  companyName: "",
  tagName: "",
  legalRepresentative: "",
  taxId: "",
  fiscalAddress: "",
  signatureDate: "",
  servicesValue: "",
  offerValue: "",
  offerDuration: "6",
  developmentTime: "30 dias",
  contractDuration: "12 meses",
  selectedServices: [...SERVICE_IDS],
  instagramPosts: "",
};

export const fieldGroups = [
  {
    title: "Cliente",
    fields: [
      { name: "companyName", label: "Nombre de la empresa", placeholder: "Ej. Bakana Studio" },
      { name: "tagName", label:"Nombre en el documento", placeholder:"Ej. Bakana" },
      { name: "legalRepresentative", label: "Representante legal", placeholder: "Nombre y apellidos" },
      { name: "taxId", label: "NIF/CIF", placeholder: "B12345678" },
      { name: "fiscalAddress", label: "Domicilio fiscal", placeholder: "Calle, numero, ciudad y CP" },
    ],
  },
  {
    title: "Contrato",
    fields: [
      { name: "signatureDate", label: "Fecha de firma", placeholder: "13 de mayo de 2026" },
      { name: "servicesValue", label: "Precio total servicios", placeholder: "650" },
      { name: "offerValue", label: "Precio ofertado", placeholder: "390" },
      { name: "offerDuration", label: "Nº meses oferta", placeholder: "6" },
      { name: "developmentTime", label: "Tiempo de desarrollo", placeholder: "30 dias" },
      { name: "contractDuration", label: "Duracion del contrato", placeholder: "12 meses" },
    ],
  },
] as const;

export function buildReplacements(data: ContractFormData) {
  const company = clean(data.companyName, "[NOMBRE DE LA EMPRESA]");
  const tagName = clean(data.tagName, "[TAG NAME]");
  const representative = clean(data.legalRepresentative, "[NOMBRE REPRESENTANTE LEGAL]");
  const taxId = clean(data.taxId, "[NIF/CIF]");
  const instagramPosts = clean(
    data.instagramPosts,
    "No se han acordado número mínimo"
  );

  const servicesMarkdown = serviceModules
    .filter((m) => data.selectedServices.includes(m.id))
    .map((m) =>
      m.markdown
        .split("[NÂº POSTS / REELS MENSUALES]")
        .join(instagramPosts)
        .split("[NÂ° POSTS / REELS MENSUALES]")
        .join(instagramPosts)
        .split("[Nº POSTS / REELS MENSUALES]")
        .join(instagramPosts)
        .split("[N° POSTS / REELS MENSUALES]")
        .join(instagramPosts)
    )
    .join("\n\n");

  return {
    // Nested placeholders — must come before their inner keys
    "[NOMBRE REPRESENTANTE LEGAL DE [NOMBRE DE LA EMPRESA]]": representative,
    "[NIF/CIF [NOMBRE DE LA EMPRESA]]": taxId,
    "[DOMICILIO FISCAL [NOMBRE DE LA EMPRESA]]": clean(data.fiscalAddress, "[DOMICILIO FISCAL]"),
    // Simple placeholders
    "[NOMBRE REPRESENTANTE LEGAL]": representative,
    "[NOMBRE DE LA EMPRESA]": company,
    "[NOMBRE COMERCIAL]": company,
    "[TAG NAME]": tagName,
    "[NIF/CIF]": taxId,
    "[FECHA DE FIRMA]": clean(data.signatureDate, "[FECHA DE FIRMA]"),
    "[PRECIO TOTAL]": clean(data.servicesValue, "[PRECIO TOTAL]"),
    "[PRECIO OFERTADO]": clean(data.offerValue, "[PRECIO OFERTADO]"),
    "[Nº MESES]": clean(data.offerDuration, "[Nº MESES]"),
    "[N° MESES]": clean(data.offerDuration, "[N° MESES]"),
    "[DURACIÓN DEL CONTRATO]": clean(data.contractDuration, "[DURACIÓN DEL CONTRATO]"),
    "[DURACION DEL CONTRATO]": clean(data.contractDuration, "[DURACION DEL CONTRATO]"),
    "[TIEMPO DE DESARROLLO ESPECÍFICO SI PROCEDE]": clean(data.developmentTime, "[TIEMPO DE DESARROLLO]"),
    "[TIEMPO DE DESARROLLO ESPECIFICO SI PROCEDE]": clean(data.developmentTime, "[TIEMPO DE DESARROLLO]"),
    "[SERVICIOS_CONTRATADOS]": servicesMarkdown,
    "[NÂº POSTS / REELS MENSUALES]": instagramPosts,
    "[NÂ° POSTS / REELS MENSUALES]": instagramPosts,
    "[Nº POSTS / REELS MENSUALES]": instagramPosts,
    "[N° POSTS / REELS MENSUALES]": instagramPosts,
  };
}

function clean(value: string, fallback: string) {
  return value.trim() || fallback;
}
