import Link from "next/link";
import { BrandWheelMark } from "@/components/brand/BrandWheelMark";
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
          <Link href="/" className={styles["footer-logo"]} aria-label={`${siteConfig.displayName} home`}>
            <BrandWheelMark className={styles["footer-wheel"]} />
            <strong>{siteConfig.name}</strong>
          </Link>
          <p>{siteConfig.description}</p>
        </div>

        <div className={styles["footer-nav-groups"]}>
          <nav aria-label="Product">
            <strong>Product</strong>
            <ul className={styles["footer-navigation"]}>
              {primaryNavigation.filter((item) => item.href !== "/blog").map((item) => (
                <li key={item.href}><Link href={item.href}>{item.label}</Link></li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Resources">
            <strong>Resources</strong>
            <ul className={styles["footer-navigation"]}>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/#faq">FAQ</Link></li>
              <li><Link href="/#wheel-game">Live wheel</Link></li>
            </ul>
          </nav>

          <nav aria-label="Legal">
            <strong>Legal</strong>
            <ul className={styles["footer-navigation"]}>
              {legalNavigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} rel={LEGAL_LINK_REL}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className={styles["footer-bottom"]}>
        <div className={`container ${styles["footer-bottom-inner"]}`}>
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <p>Made for easier decisions.</p>
        </div>
      </div>
    </footer>
  );
}
