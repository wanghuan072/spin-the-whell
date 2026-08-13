import type { ReactNode } from "react";
import { AppFooter } from "@/components/layout/AppFooter";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { organizationSchema, websiteSchema } from "@/seo/structuredData";
import layoutStyles from "@/style/layout/RootLayout.module.css";

const websiteJsonLd = JSON.stringify([organizationSchema, websiteSchema]).replace(/</g, "\\u003c");

export default function SiteLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthProvider>
      <div className={layoutStyles["site-shell"]}>
        <a className={layoutStyles["skip-link"]} href="#main-content">
          Skip to main content
        </a>
        <AppHeader />
        <div className={layoutStyles["site-content"]}>{children}</div>
        <AppFooter />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: websiteJsonLd }} />
      </div>
    </AuthProvider>
  );
}
