import type { ReactNode } from "react";
import styles from "@/style/layout/PageHero.module.css";

type PageHeroProps = {
  eyebrow?: string;
  title: ReactNode;
  description: string;
  actions?: ReactNode;
  aside?: ReactNode;
};

/** Shared inner-page hero: keyword H1 + short support + optional actions/aside */
export function PageHero({ eyebrow, title, description, actions, aside }: PageHeroProps) {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h1>{title}</h1>
          <p className={styles.description}>{description}</p>
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
        {aside ? <div className={styles.aside}>{aside}</div> : null}
      </div>
    </section>
  );
}
