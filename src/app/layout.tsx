import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nuptia — le site et la gestion de votre mariage",
  description: "Un site aux couleurs de votre faire-part et un tableau de bord pour gérer vos invités.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
