export interface Organization {
  id: string;
  name: string;
  registrationNumber: string;
  description: string;
  logo: string;
  engagements: number;
  clients: number;
  services: number;
  rating: number;
  servicesOffered: string[];
}

export const mockOrganizations: Organization[] = [
  {
    id: "1",
    name: "Malta International Limited",
    registrationNumber: "ADS2346",
    description: "One of the prominet organizations of the world and hey are good to trust on audit accounting.",
    logo: "/org-logo.png", // We will use a placeholder or generic icon if actual image not available
    engagements: 24,
    clients: 3,
    services: 8,
    rating: 4,
    servicesOffered: [
      "AUDITING",
      "ACCOUNTING",
      "VAT",
      "TAX",
      "CSP",
      "MBR",
      "PAYROLL",
      "GRANTS AND INCENTIVES"
    ]
  },
  {
    id: "2",
    name: "Global Audit Services",
    registrationNumber: "REG9876",
    description: "Leading providers of financial auditing and compliance services worldwide.",
    logo: "/org-logo.png",
    engagements: 15,
    clients: 5,
    services: 10,
    rating: 5,
    servicesOffered: [
      "AUDITING",
      "TAX",
      "COMPLIANCE"
    ]
  }
];
