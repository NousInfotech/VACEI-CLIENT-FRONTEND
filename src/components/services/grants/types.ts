export type GrantCategory = "AI" | "Business" | "Employment";

export interface Grant {
  id: string;
  title: string;
  provider: string;
  category: GrantCategory;
  summary: string;
  fundingAmount?: string;
  deadline?: string;
  sourceLink: string;
  eligibility: string[];
  documentsNeeded: string[];
  timeline: string;
  beneficiary: "Business" | "Individual";
  fundingType: "Grant" | "Tax Credit" | "Scheme";
  dateAdded: string;
}

export interface GrantRequest {
  id: string;
  grantTitle: string;
  status: "Draft" | "Call booked" | "Collecting docs" | "Submitted" | "Outcome";
  nextStep: string;
  ctaLabel?: string;
}
