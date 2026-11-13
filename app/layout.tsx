import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Parisienne, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const parisienne = Parisienne({
  variable: "--font-parisienne",
  weight: "400",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined));

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: "Mesa de Regalos de Miranda",
  description: "Lista de sugerencias y mesa de regalos de Miranda",
  icons: {
    icon: "/icon.png?v=3",
    shortcut: "/icon.png?v=3",
    apple: "/icon.png?v=3",
  },
  openGraph: {
    title: "Mesa de Regalos de Miranda",
    description: "Lista de sugerencias y mesa de regalos de Miranda",
    url: "/",
    siteName: "Mesa de Regalos de Miranda",
    images: [
      {
        url: "/og-image.png?v=3",
        width: 1200,
        height: 630,
        alt: "Mesa de Regalos de Miranda",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mesa de Regalos de Miranda",
    description: "Lista de sugerencias y mesa de regalos de Miranda",
    images: ["/og-image.png?v=3"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FADADD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${cormorant.variable} ${parisienne.variable} h-full antialiased`}
    >
      <body className={`${cormorant.variable} ${parisienne.variable} min-h-full flex flex-col font-cormorant bg-pastel-pink/20 text-pastel-text`}>
        {children}
      </body>
    </html>
  );
}
