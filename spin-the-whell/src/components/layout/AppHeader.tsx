"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { HeaderAuth } from "@/components/auth/HeaderAuth";
import { BrandWheelMark } from "@/components/brand/BrandWheelMark";
import { primaryNavigation } from "@/config/navigation";
import styles from "@/style/layout/AppHeader.module.css";

export function AppHeader() {
  const pathname = usePathname();
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menuOpen = menuPath === pathname;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuPath(null);
    }

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className={styles["app-header"]}>
      <div className={`container ${styles["app-header-content"]}`}>
        <Link href="/" className={styles["brand-link"]} aria-label="Spin Any Wheel home">
          <BrandWheelMark className={styles["brand-mark"]} />
          <span className={styles["brand-copy"]}>
            <strong>Spin</strong>
            <span>Any Wheel</span>
          </span>
        </Link>

        <nav
          id="primary-navigation"
          className={`${styles["primary-navigation"]} ${menuOpen ? styles["is-open"] : ""}`}
          aria-label="Primary navigation"
        >
          <ul>
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={isActive(item.href) ? styles["is-active"] : ""}
                  onClick={() => setMenuPath(null)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/#wheel-game"
                className={styles["header-cta"]}
                onClick={() => setMenuPath(null)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-8 12h6l-1 8 9-13h-6Z" /></svg>
                Spin now
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles["header-end"]}>
          <ThemeToggle />
          <HeaderAuth />
          <Link href="/#wheel-game" className={styles["header-cta"]}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m13 2-8 12h6l-1 8 9-13h-6Z" /></svg>
            Spin now
          </Link>
          <button
            type="button"
            className={styles["menu-button"]}
            aria-expanded={menuOpen}
            aria-controls="primary-navigation"
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setMenuPath((current) => current === pathname ? null : pathname)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
