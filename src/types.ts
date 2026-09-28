export type PlatformType = 'Facebook' | 'LinkedIn' | 'TikTok' | 'Instagram' | 'YouTube';

export interface ScrapedData {
  url: string;
  title: string;
  metaDescription: string;
  headings: string[];
  extractedText: string;
  characterCount: number;
}

export interface AdHook {
  id: number;
  angle: string;
  hookText: string;
  whyItWorks: string;
  scrollStopRating?: number;
}

export interface BodyAngle {
  id: string;
  name: string;
  framework: string;
  headline: string;
  copy: string;
  bestFor: string;
}

export interface CallToAction {
  id: string;
  type: string;
  ctaText: string;
  supportingMicroCopy?: string;
}

export interface AdCampaignResult {
  offerSummary: {
    productName: string;
    coreValueProp: string;
    targetPersona: string;
    primaryPainPoint: string;
  };
  hooks: AdHook[];
  bodyAngles: BodyAngle[];
  callsToAction: CallToAction[];
  testingStrategy: string;
}
