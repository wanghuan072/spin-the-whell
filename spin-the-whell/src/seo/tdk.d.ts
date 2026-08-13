export type TdkRecord = {
  title: string;
  description: string;
  keywords: string[];
};

export const pageTdk: {
  home: TdkRecord;
  templates: TdkRecord;
  blog: TdkRecord;
  comments: TdkRecord;
};

export const legalTdk: Record<string, TdkRecord>;

export function getPageTdk(key: keyof typeof pageTdk): TdkRecord;
export function getLegalTdk(slug: string): TdkRecord | undefined;
