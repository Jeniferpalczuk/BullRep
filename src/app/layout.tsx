import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "BullRep — Evolução de Treino",
  description: "Acompanhe sua evolução, controle seus treinos e supere seus limites com o BullRep.",
  keywords: ["treino", "fitness", "academia", "musculação", "evolução"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
