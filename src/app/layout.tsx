import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Analytics from "@/components/Analytics";
import RecentPurchaseToast from "@/components/RecentPurchaseToast";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const siteUrl = "https://ugccreatoros.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "UGC Creator OS - The Complete System for UGC Creators",
  description:
    "Create better UGC, stay consistent, and become easier for brands to hire. A practical content system for creators who want to know what to film, what to say, how to stay consistent, and how to turn their content into real brand opportunities.",
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    title: "UGC Creator OS",
    description:
      "The complete system for UGC creators to create better content consistently and work with brands.",
    url: siteUrl,
    siteName: "UGC Creator OS",
  },
  twitter: {
    card: "summary_large_image",
    title: "UGC Creator OS",
    description:
      "The complete system for UGC creators to create better content consistently and work with brands.",
  },
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "UGC Creator OS",
  description:
    "A practical, step-by-step system for creating consistent, brand-ready UGC content — from idea to brand pitch.",
  image: `${siteUrl}/opengraph-image`,
  offers: {
    "@type": "Offer",
    priceCurrency: "INR",
    price: "199",
    availability: "https://schema.org/InStock",
    url: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <RecentPurchaseToast />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}