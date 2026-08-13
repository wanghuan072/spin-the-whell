import Link from "next/link";
import { legalNavigation } from "@/config/legal";
import { primaryNavigation } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import styles from "@/style/layout/AppFooter.module.css";

const LEGAL_LINK_REL = "noopener noreferrer nofollow";

export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles["app-footer"]}>
      <div className={`container ${styles["app-footer-content"]}`}>
        <div className={styles["footer-brand"]}>
          <Link href="/" className={styles["footer-logo"]} aria-label={`${siteConfig.name} home`}>
            <span className={styles["footer-wheel"]} aria-hidden="true" />
            <strong>{siteConfig.name}</strong>
          </Link>
          <p>{siteConfig.description}</p>
        </div>

        <div className={styles["footer-nav-groups"]}>
          <nav aria-label="Navigate">
            <strong>Navigate</strong>
            <ul className={styles["footer-navigation"]}>
              {primaryNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Legal">
            <strong>Legal</strong>
            <ul className={styles["footer-navigation"]}>
              {legalNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} rel={LEGAL_LINK_REL}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className={styles["footer-bottom"]}>
        <div className={`container ${styles["footer-bottom-inner"]}`}>
          <p>
            Copyright © {year} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

