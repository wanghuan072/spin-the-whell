"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { TEMPLATE_CATEGORIES, TEMPLATE_MODES } from "@/config/template-categories";
import type { WheelTemplate } from "@/types/template";
import type { WheelRunMode } from "@/features/wheel/types";
import styles from "@/style/page/templates/TemplatesPage.module.css";

type TemplatesCatalogProps = {
  templates: WheelTemplate[];
};

export function TemplatesCatalog({ templates }: TemplatesCatalogProps) {
  const [mode, setMode] = useState<WheelRunMode | "all">("all");
  const [category, setCategory] = useState<string>("all");

  const templatesForMode = useMemo(
    () => mode === "all" ? templates : templates.filter((template) => template.runMode === mode),
    [mode, templates],
  );

  const filtered = useMemo(
    () => category === "all"
      ? templatesForMode
      : templatesForMode.filter((template) => template.category === category),
    [category, templatesForMode],
  );

  const categoryCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const template of templatesForMode) {
      map.set(template.category, (map.get(template.category) ?? 0) + 1);
    }
    return map;
  }, [templatesForMode]);

  const modeCounts = useMemo(() => ({
    all: templates.length,
    classic: templates.filter((template) => template.runMode === "classic").length,
    "turn-queue": templates.filter((template) => template.runMode === "turn-queue").length,
  }), [templates]);

  return (
    <div className={styles["templates-list-content"]}>
      <div className={styles["filter-groups"]}>
        <div className={styles["filter-group"]}>
          <p>Play mode</p>
          <div className={styles["mode-bar"]} role="group" aria-label="Filter templates by play mode">
            {TEMPLATE_MODES.map((item) => {
              if (item.id !== "all" && modeCounts[item.id] === 0) return null;
              const selected = mode === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  className={selected ? styles["is-active"] : ""}
                  onClick={() => {
                    setMode(item.id);
                    setCategory("all");
                  }}
                >
                  {item.name}
                  <span>{modeCounts[item.id]}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles["filter-group"]}>
          <p>Scenario</p>
          <div className={styles["category-bar"]} role="group" aria-label="Filter templates by scenario">
            {TEMPLATE_CATEGORIES.map((item) => {
              const count = item.id === "all" ? templatesForMode.length : (categoryCounts.get(item.id) ?? 0);
              if (item.id !== "all" && count === 0) return null;
              const selected = category === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={selected}
                  className={selected ? styles["is-active"] : ""}
                  onClick={() => setCategory(item.id)}
                >
                  {item.name}
                  <span>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className={styles["templates-index-note"]}>
        <span>{filtered.length} wheel{filtered.length === 1 ? "" : "s"}</span>
        <p>Open any template in the full editor—edit options, style, and modes.</p>
      </div>

      <div className={styles["templates-grid"]}>
        {filtered.map((template, index) => (
          <article key={template.id} className={styles["template-item"]}>
            <Link href={`/templates/${template.addressBar}`} aria-label={`Open ${template.title}`}>
              <div className={styles["template-art"]}>
                <Image
                  src={template.cardImageUrl}
                  alt={template.imageAlt}
                  width={640}
                  height={420}
                  preload={index === 0}
                />
                <div className={styles["template-badges"]}>
                  <span>{template.runMode === "turn-queue" ? "Turn Queue" : "Classic"}</span>
                  <span>{template.category}</span>
                </div>
              </div>
              <div className={styles["template-copy"]}>
                <h2>{template.title}</h2>
                <span>{template.description}</span>
                <strong>Open this wheel <ArrowIcon /></strong>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>;
}
