import { Grant, GrantRequest } from "./types";

export const MOCK_GRANTS: Grant[] = [
  {
    id: "1",
    title: "AI Business Transformation Grant",
    provider: "Malta Enterprise",
    category: "AI",
    summary: "Supporting businesses in integrating AI solutions to optimize operations and enhance productivity.",
    fundingAmount: "Up to €50,000",
    deadline: "2026-06-30",
    sourceLink: "https://grants.mt/ai-transformation",
    eligibility: [
      "Registered business in Malta",
      "At least 2 years in operation",
      "SME status",
      "Clear AI implementation roadmap",
    ],
    documentsNeeded: [
      "Last 2 years audited accounts",
      "Business plan snippet",
      "VAT Certificate",
    ],
    timeline: "4-8 weeks",
    beneficiary: "Business",
    fundingType: "Grant",
    dateAdded: "2026-01-01"
  },
  {
    id: "2",
    title: "Eco-Friendly Business Scheme",
    provider: "Ministry for Economy",
    category: "Business",
    summary: "Incentives for businesses adopting sustainable practices and reducing carbon footprint.",
    fundingAmount: "Up to €25,000",
    deadline: "Ongoing",
    sourceLink: "https://grants.mt/eco-business",
    eligibility: [
      "All business sizes",
      "Operational in Malta",
      "Proposed eco-friendly investment",
    ],
    documentsNeeded: [
      "Project description",
      "Cost estimates",
    ],
    timeline: "2-4 weeks",
    beneficiary: "Business",
    fundingType: "Scheme",
    dateAdded: "2026-01-05"
  },
  {
    id: "3",
    title: "Digital Skills Training Rebate",
    provider: "JobsPlus",
    category: "Employment",
    summary: "Reimbursement of training costs for employees upskilling in digital technologies.",
    fundingAmount: "70% of costs",
    deadline: "2026-12-31",
    sourceLink: "https://grants.mt/digital-skills",
    eligibility: [
      "Employers registered with JobsPlus",
      "Training must be accredited",
      "Employee must be on payroll",
    ],
    documentsNeeded: [
      "Training course details",
      "Invoices",
      "Proof of payment",
    ],
    timeline: "3-5 weeks",
    beneficiary: "Individual",
    fundingType: "Tax Credit",
    dateAdded: "2026-01-10"
  },
  {
    id: "4",
    title: "Startup Catalyst Fund",
    provider: "Malta Enterprise",
    category: "Business",
    summary: "Seed funding for innovative startups in the early stages of development and growth.",
    fundingAmount: "Up to €100,000",
    deadline: "2026-04-15",
    sourceLink: "https://grants.mt/startup-catalyst",
    eligibility: [
      "Innovative startup (< 5 years old)",
      "High growth potential",
      "Based in Malta",
    ],
    documentsNeeded: [
      "Pitch deck",
      "Financial projections",
      "Founder CVs",
    ],
    timeline: "6-10 weeks",
    beneficiary: "Business",
    fundingType: "Grant",
    dateAdded: "2026-01-12"
  }
];

export const MOCK_REQUESTS: GrantRequest[] = [
  {
    id: "r1",
    grantTitle: "AI Business Transformation",
    status: "Call booked",
    nextStep: "Join discovery call on Jan 20th",
    ctaLabel: "Join call"
  },
  {
    id: "r2",
    grantTitle: "Eco-Friendly Business Scheme",
    status: "Collecting docs",
    nextStep: "Upload VAT Certificate",
    ctaLabel: "Upload"
  }
];

export const GRANTS_TABS = [
  { id: "All", label: "All" },
  { id: "AI", label: "AI" },
  { id: "Business", label: "Business" },
  { id: "Employment", label: "Employment" },
];

export const CSP_SERVICES = [
  { id: "registered_office", title: "Registered Office Address", price: "€500/yr" },
  { id: "company_secretary", title: "Company Secretary", price: "€800/yr" },
  { id: "director_service", title: "Nominee Director", price: "€1500/yr" },
  { id: "compliance_officer", title: "Compliance & MLRO", price: "€1200/yr" }
];
