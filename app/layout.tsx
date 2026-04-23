// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard Suivi Pipe - Avisia",
  description: "Connecté en temps réel à Notion",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Chargement de Tailwind pour le design */}
        <script src="https://cdn.tailwindcss.com"></script>
        
        {/* NOUVEAU : Actualisation automatique de la page toutes les 2 heures (7200 secondes) */}
        {/* Si tu veux tester que ça marche tout de suite, mets "5" au lieu de "7200" ! */}
        <meta httpEquiv="refresh" content="7200" />
      </head>
      <body>{children}</body>
    </html>
  );
}