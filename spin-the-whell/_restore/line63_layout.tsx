import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { siteConfig } from "@/config/site";
import { DEFAULT_THEME, themeBootstrapScript } from "@/lib/theme";
import { JsonLd, websiteSchema } from "@/seo/structuredData";
import layoutStyles from "@/style/layout/RootLayout.module.css";
import "@/style/globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "Spin the Wheel – Free Random Wheel & Decision Maker",
    template: "%s | Spin the Wheel",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  category: "games",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#07091f" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang="en"
      className={outfit.variable}
      data-theme={DEFAULT_THEME}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
      </head>
      <body>
        <div className={layoutStyles["site-shell"]}>
          <a className={layoutStyles["skip-link"]} href="#main-content">
            Skip to main content
          </a>
          <AppHeader />
          <div className={layoutStyles["site-content"]}>{children}</div>
          <AppFooter />
        </div>
        <JsonLd data={websiteSchema} />
      </body>
    </html>
  );
}
