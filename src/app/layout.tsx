import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/providers/AuthProvider";

export const metadata: Metadata = {
  title: "BullRep",
  applicationName: "BullRep",
  description: "Acompanhe sua evolucao, controle seus treinos e supere seus limites com o BullRep.",
  keywords: ["treino", "fitness", "academia", "musculacao", "evolucao"],
  appleWebApp: {
    capable: true,
    title: "BullRep",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
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
