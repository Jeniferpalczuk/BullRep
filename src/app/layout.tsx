import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "BullRep - Evolucao de Treino",
  description: "Acompanhe sua evolucao, controle seus treinos e supere seus limites com o BullRep.",
  keywords: ["treino", "fitness", "academia", "musculacao", "evolucao"],
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
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
