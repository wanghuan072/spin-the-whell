type HomeTextItem = {
  title: string;
  copy: string;
};

export type HomeContent = {
  faqItems: Array<{
    question: string;
    answer: string;
  }>;
  howSteps: Array<HomeTextItem & {
    number: string;
    label: string;
  }>;
  features: Array<HomeTextItem & {
    code: string;
    label: string;
    span?: "normal" | "wide";
  }>;
  modeExamples: Array<HomeTextItem & {
    code: string;
    label: string;
    href?: string;
    points?: string[];
    facts?: Array<{
      label: string;
      value: string;
    }>;
  }>;
  advantages: Array<HomeTextItem & {
    code: string;
    label: string;
  }>;
  useCases: Array<HomeTextItem & {
    code: string;
  }>;
};
