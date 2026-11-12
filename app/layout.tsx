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
  title: "Mesa de Regalos de Ruth",
  description: "Lista de sugerencias y mesa de regalos de Ruth",
  icons: {
    icon: "/lazos-dresscode/great - 11.png?v=2",
    shortcut: "/lazos-dresscode/great - 11.png?v=2",
    apple: "/lazos-dresscode/great - 11.png?v=2",
  },
  openGraph: {
    title: "Mesa de Regalos de Ruth",
    description: "Lista de sugerencias y mesa de regalos de Ruth",
    url: "/",
    siteName: "Mesa de Regalos de Ruth",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Mesa de Regalos de Ruth",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mesa de Regalos de Ruth",
    description: "Lista de sugerencias y mesa de regalos de Ruth",
    images: ["/og-image.png"],
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
