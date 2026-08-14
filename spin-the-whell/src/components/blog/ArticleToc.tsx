"use client";

import { useEffect, useState } from "react";
import styles from "@/style/page/blog/BlogDetailPage.module.css";

type ArticleTocHeading = {
  id: string;
  label: string;
};

type ArticleTocProps = {
  headings: ArticleTocHeading[];
};

export function ArticleToc({ headings }: ArticleTocProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (headings.length === 0) return;

    let frame = 0;

    const updateReadingState = () => {
      frame = 0;
      const headerOffset = 150;
      let currentId = headings[0].id;

      for (const heading of headings) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= headerOffset) {
          currentId = heading.id;
        }
      }

      setActiveId(currentId);

      const article = document.querySelector<HTMLElement>("[data-article-copy]");
      if (!article) return;

      const bounds = article.getBoundingClientRect();
      const articleTop = window.scrollY + bounds.top;
      const start = articleTop - headerOffset;
      const end = articleTop + bounds.height - window.innerHeight * 0.58;
      const nextProgress = end <= start
        ? 1
        : Math.min(1, Math.max(0, (window.scrollY - start) / (end - start)));

      setProgress(nextProgress);
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateReadingState);
    };

    updateReadingState();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, [headings]);

  return (
    <nav id="article-contents" className={styles["article-toc"]} aria-label="Article contents">
      <div className={styles["toc-heading"]}>
        <span className={styles["toc-heading-icon"]} aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M7 6h13M7 12h13M7 18h8" />
            <circle cx="3.5" cy="6" r="1" />
            <circle cx="3.5" cy="12" r="1" />
            <circle cx="3.5" cy="18" r="1" />
          </svg>
        </span>
        <span>
          <small>Article guide</small>
          <strong>On this page</strong>
        </span>
      </div>

      <div className={styles["toc-progress"]} aria-label={`${Math.round(progress * 100)}% read`}>
        <span aria-hidden="true"><i style={{ width: `${progress * 100}%` }} /></span>
        <em>{Math.round(progress * 100)}%</em>
      </div>

      <ol>
        {headings.map((heading, index) => {
          const isActive = heading.id === activeId;

          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={isActive ? "location" : undefined}
                className={isActive ? styles["is-active"] : undefined}
                onClick={() => setActiveId(heading.id)}
              >
                <span>{String(index + 1).padStart(2, "0")}</span>
                <strong>{heading.label}</strong>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
