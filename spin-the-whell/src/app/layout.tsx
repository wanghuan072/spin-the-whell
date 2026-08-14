import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { DEFAULT_THEME, themeBootstrapScript } from "@/lib/theme";
import { getPageTdk } from "@/seo/tdk";
import "@/style/globals.css";

const homeTdk = getPageTdk("home");

/** Cartoon Carnival: Fredoka + Nunito (playful rounded) */
const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: homeTdk.title,
    template: "%s | Spinanywheel",
  },
  description: homeTdk.description,
  applicationName: siteConfig.name,
  creator: siteConfig.name,
  publisher: siteConfig.name,
  authors: [{ name: "Spinanywheel Team", url: "/legal/about-us" }],
  category: "game",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fff1e0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a0f2e" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable}`}
      data-theme={DEFAULT_THEME}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
