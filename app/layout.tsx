import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Contratos LOB",
  description: "Generador de contratos de La Ola Buena",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
