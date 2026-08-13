import { useState, type ChangeEvent } from "react";
import { EyeIcon, ImageIcon, TrashIcon } from "./WheelIcons";
import { optionChancePercent } from "../lib/wheel-options";
import type { WheelOption } from "../types";
import styles from "../styles/AdvancedOptionsPanel.module.css";

type AdvancedOptionsPanelProps = {
  options: WheelOption[];
  onImageUpload: (optionId: string, file: File) => void;
  onOptionChange: (optionId: string, patch: Partial<WheelOption>) => void;
};

/** 将低频的单项设置集中到独立标签，避免 Options 列表同时展开大量控件。 */
export function AdvancedOptionsPanel({
  options,
  onImageUpload,
  onOptionChange,
}: AdvancedOptionsPanelProps) {
  const [openOptionId, setOpenOptionId] = useState<string | null>(options[0]?.id ?? null);

  function selectImage(
    optionId: string,
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (file) onImageUpload(optionId, file);
  }

  return (
    <div className={styles["advanced-panel"]}>
      <p className={styles["advanced-intro"]}>
        Open a slice to adjust its odds, colors, and image.
      </p>

      {options.length > 0 ? (
        <div className={styles["advanced-list"]}>
          {options.map((option, index) => {
            const chance = optionChancePercent(options, index);
            return (
              <details
                key={option.id}
                className={styles["advanced-item"]}
                style={{ ["--option-color" as string]: option.color }}
                open={openOptionId === option.id}
                onToggle={(event) => {
                  if (event.currentTarget.open) {
                    setOpenOptionId(option.id);
                  } else if (openOptionId === option.id) {
                    setOpenOptionId(null);
                  }
                }}
              >
                <summary>
                  <i aria-hidden="true" />
                  <strong title={option.label}>{option.label || `Option ${index + 1}`}</strong>
                  {option.image ? (
                    <em data-visible={option.imageVisible ? "true" : "false"}>
                      {option.imageVisible ? "Image on" : "Image off"}
                    </em>
                  ) : null}
                  <span>{chance}%</span>
                </summary>

                <div className={styles["advanced-body"]}>
                  <label className={styles["weight-control"]}>
                    <span>Probability weight <output>{option.weight}</output></span>
                    <input
                      type="range"
                      min={1}
                      max={100}
                      value={option.weight}
                      aria-label={`Probability weight for ${option.label}`}
                      onInput={(event) => onOptionChange(option.id, {
                        weight: Number(event.currentTarget.value),
                      })}
                    />
                  </label>

                  <div className={styles["color-controls"]}>
                    <label>
                      <span>Slice color</span>
                      <input
                        type="color"
                        value={option.color}
                        aria-label={`Slice color for ${option.label}`}
                        onChange={(event) => onOptionChange(option.id, { color: event.target.value })}
                      />
                    </label>
                    <label>
                      <span>Text color</span>
                      <input
                        type="color"
                        value={option.textColor || "#ffffff"}
                        aria-label={`Text color for ${option.label}`}
                        onChange={(event) => onOptionChange(option.id, { textColor: event.target.value })}
                      />
                    </label>
                  </div>

                  <div className={styles["advanced-actions"]}>
                    <label>
                      <ImageIcon /> {option.image ? "Replace image" : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        aria-label={`${option.image ? "Replace" : "Upload"} slice image for ${option.label}`}
                        onChange={(event) => selectImage(option.id, event)}
                      />
                    </label>
                    {option.image ? (
                      <>
                        <button
                          type="button"
                          className={styles["image-visibility"]}
                          aria-pressed={option.imageVisible}
                          onClick={() => onOptionChange(option.id, { imageVisible: !option.imageVisible })}
                        >
                          <EyeIcon hidden={option.imageVisible} /> {option.imageVisible ? "Hide image" : "Show image"}
                        </button>
                        <button
                          type="button"
                          className={styles["clear-image"]}
                          onClick={() => onOptionChange(option.id, { image: null, imageVisible: true })}
                        >
                          <TrashIcon /> Remove image
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              </details>
            );
          })}
        </div>
      ) : (
        <p className={styles["advanced-empty"]}>Add an option before editing advanced values.</p>
      )}
    </div>
  );
}
