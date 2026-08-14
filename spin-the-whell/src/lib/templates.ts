import templatesData from "@/data/templates/templates.json";
import type { WheelTemplate } from "@/types/template";

const templates = templatesData as WheelTemplate[];

export function getTemplates() {
  return templates;
}

export function getTemplateBySlug(slug: string) {
  return templates.find((template) => template.addressBar === slug);
}

export function getHomeTemplates() {
  return templates.filter((template) => template.isHome);
}

export function getTemplatesByCategory(category: string) {
  return templates.filter((template) => template.category === category);
}

export function getRelatedTemplates(template: WheelTemplate, limit = 3) {
  return [...templates]
    .filter((item) => item.id !== template.id)
    .sort((a, b) => {
      const score = (item: WheelTemplate) =>
        Number(item.category === template.category) * 2
        + Number(item.runMode === template.runMode);
      return score(b) - score(a) || a.id - b.id;
    })
    .slice(0, limit);
}
