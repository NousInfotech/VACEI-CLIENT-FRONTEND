export interface PersonDetails {
  _id: string;
  name: string;
  nationality: string;
  address: string;
  supportingDocuments: any[];
  id: string;
}

export interface PerShareValue {
  value: number;
  currency: string;
}

export interface ShareClassData {
  totalShares: number;
  class: string;
  type: string;
}

export interface Shareholder {
  personId: PersonDetails;
  sharePercentage: number;
  paidUpSharesPercentage: number;
  sharesData: ShareClassData[];
  _id: string;
  id: string;
}

export interface RepresentationalSchema {
  personId: PersonDetails;
  role: string[];
  _id: string;
  id: string;
}

export interface CorporateEntity {
  _id: string;
  clientId: string;
  name: string;
  registrationNumber: string;
  id: string;
}

export interface ShareholdingCompany {
  companyId: CorporateEntity;
  sharesData: ShareClassData[];
  sharePercentage?: number;
  paidUpSharesPercentage: number;
  _id: string;
  id: string;
}

export interface RepresentationalCompany {
  companyId: CorporateEntity;
  role: string[];
  _id: string;
  id: string;
}

export interface CompanyData {
  _id: string;
  clientId: string;
  organizationId: string;
  name: string;
  registrationNumber: string;
  address: string;
  description?: string;
  supportingDocuments: any[];
  authorizedShares: number;
  issuedShares: number;
  perShareValue: PerShareValue;
  totalShares: ShareClassData[];
  shareHoldingCompanies: ShareholdingCompany[];
  shareHolders: Shareholder[];
  representationalSchema: RepresentationalSchema[];
  representationalCompany: RepresentationalCompany[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  companyStartedAt: string | null;
  industry?: string; 
  incorporationDate?: string;
  id: string;
}

export interface CompanyResponse {
  data: CompanyData;
}

export interface KycDocumentRequest {
  documentRequest: string;
  personId: string;
  _id: string;
}

export interface KycData {
  _id: string;
  company: string;
  clientId: string;
  auditorId: string;
  workflowType: string;
  documentRequests: KycDocumentRequest[];
  status: string;
  discussions: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

// Hierarchy Data Interfaces
export interface HierarchyShareData {
  totalShares: number;
  class: string;
  type: string;
}

export interface HierarchyNode {
  id: string;
  name: string;
  type: "person" | "company";
  address: string;
  sharesData: HierarchyShareData[];
  totalShares: number;
  roles: string[];
  nationality?: string;
  children?: HierarchyNode[];
}

export interface HierarchyData {
  id: string;
  name: string;
  totalShares: HierarchyShareData[];
  type: string;
  address: string;
  shareholders: HierarchyNode[];
}

export interface HierarchyResponse {
  success: boolean;
  data: HierarchyData;
}

// KYC Workflow Interfaces (Full versions)
export interface KycPerson {
  _id: string;
  name: string;
  nationality: string;
  address: string;
  id: string;
}

export interface KycRequestFull {
  documentRequest: {
    _id: string;
    name: string;
    category: string;
    description: string;
    status: string;
    documents: any[];
    multipleDocuments: any[];
  };
  person: KycPerson;
  _id: string;
}

export interface KycWorkflow {
  _id: string;
  company: {
    _id: string;
    clientId: string;
    name: string;
    registrationNumber: string;
    id: string;
  };
  clientId: string;
  auditorId: string;
  workflowType: string;
  documentRequests: KycRequestFull[];
  status: string;
  discussions: any[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export const MOCK_COMPANY_DATA: CompanyResponse = {
 "data": {
        "perShareValue": {
            "value": 100,
            "currency": "EUR"
        },
        "_id": "69452a00891fd4a4ff48c059",
        "clientId": "a9eef95d-fd72-42ed-89e9-23974d2f3c51",
        "organizationId": "6914e26ebbb06e69621eebf4",
        "name": "GoldenWave Logistics Limited",
        "registrationNumber": "EF-0203332",
        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
        "supportingDocuments": [],
        "authorizedShares": 10000,
        "issuedShares": 15000,
        "totalShares": [
            {
                "totalShares": 2000,
                "class": "A",
                "type": "Ordinary"
            },
            {
                "totalShares": 1300,
                "class": "B",
                "type": "Ordinary"
            },
            {
                "totalShares": 1200,
                "class": "C",
                "type": "Ordinary"
            },
            {
                "totalShares": 500,
                "class": "Ordinary",
                "type": "Ordinary"
            }
        ],
        "shareHoldingCompanies": [
            {
                "companyId": {
                    "_id": "69429ddc9c2f087b6331078f",
                    "clientId": "faa2d0c7-9d90-446e-82de-c56977af5a9d",
                    "name": "OpalGate Consulting Ltd",
                    "registrationNumber": "EF-020398611",
                    "id": "69429ddc9c2f087b6331078f"
                },
                "sharesData": [
                    {
                        "totalShares": 300,
                        "class": "A",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 400,
                        "class": "B",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 100,
                        "class": "C",
                        "type": "Ordinary"
                    }
                ],
                "paidUpSharesPercentage": 55,
                "_id": "695e2a2e99380d8afc47dd98",
                "id": "695e2a2e99380d8afc47dd98"
            }
        ],
        "shareHolders": [
            {
                "personId": {
                    "_id": "6948dc4e75095ca2be980dbb",
                    "name": "Godwin",
                    "nationality": "Maltese",
                    "address": "SUNRISE FARMALLEY LAURENTI, BUSKETT L/O RABAT Malta",
                    "supportingDocuments": [],
                    "id": "6948dc4e75095ca2be980dbb"
                },
                "sharePercentage": 99.67,
                "paidUpSharesPercentage": 100,
                "sharesData": [
                    {
                        "totalShares": 14950,
                        "class": "Ordinary",
                        "type": "Ordinary"
                    }
                ],
                "_id": "6948dc4f75095ca2be980dbf",
                "id": "6948dc4f75095ca2be980dbf"
            },
            {
                "personId": {
                    "_id": "6948dc5375095ca2be980dc6",
                    "name": "Wallace",
                    "nationality": "Maltese",
                    "address": "2, Angela Flats, Triq IL-GIFEN, San Pawl IL-BAHAR Malta",
                    "supportingDocuments": [],
                    "id": "6948dc5375095ca2be980dc6"
                },
                "sharePercentage": 0.33,
                "paidUpSharesPercentage": 100,
                "sharesData": [
                    {
                        "totalShares": 50,
                        "class": "Ordinary",
                        "type": "Ordinary"
                    }
                ],
                "_id": "6948dc5475095ca2be980dce",
                "id": "6948dc5475095ca2be980dce"
            },
            {
                "personId": {
                    "_id": "6948dc4e75095ca2be980dbb_alt",
                    "name": "Krishna",
                    "nationality": "Maltese",
                    "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                    "supportingDocuments": [],
                    "id": "6948dc4e75095ca2be980dbb_alt"
                },
                "sharePercentage": 22,
                "paidUpSharesPercentage": 54,
                "sharesData": [
                    {
                        "totalShares": 400,
                        "class": "A",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 300,
                        "class": "B",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 200,
                        "class": "C",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 200,
                        "class": "Ordinary",
                        "type": "Ordinary"
                    }
                ],
                "_id": "6948dc4f75095ca2be980dbf_alt",
                "id": "6948dc4f75095ca2be980dbf_alt"
            },
            {
                "personId": {
                    "_id": "6948dc5375095ca2be980dc6_alt",
                    "name": "Tony",
                    "nationality": "Maltese",
                    "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                    "supportingDocuments": [],
                    "id": "6948dc5375095ca2be980dc6_alt"
                },
                "sharePercentage": 28.000000000000004,
                "paidUpSharesPercentage": 84,
                "sharesData": [
                    {
                        "totalShares": 600,
                        "class": "A",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 300,
                        "class": "B",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 400,
                        "class": "C",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 100,
                        "class": "Ordinary",
                        "type": "Ordinary"
                    }
                ],
                "_id": "6948dc5475095ca2be980dce_alt",
                "id": "6948dc5475095ca2be980dce_alt"
            }
        ],
        "representationalSchema": [
            {
                "personId": {
                    "_id": "6948dc4e75095ca2be980dbb",
                    "name": "Godwin",
                    "nationality": "Maltese",
                    "address": "SUNRISE FARMALLEY LAURENTI, BUSKETT L/O RABAT Malta",
                    "supportingDocuments": [],
                    "id": "6948dc4e75095ca2be980dbb"
                },
                "role": [
                    "Shareholder",
                    "Legal Representative",
                    "Director",
                    "Secretary",
                    "Judicial Representative"
                ],
                "_id": "6948dc4f75095ca2be980dc0",
                "id": "6948dc4f75095ca2be980dc0"
            },
            {
                "personId": {
                    "_id": "6948dc5375095ca2be980dc6",
                    "name": "Wallace",
                    "nationality": "Maltese",
                    "address": "2, Angela Flats, Triq IL-GIFEN, San Pawl IL-BAHAR Malta",
                    "supportingDocuments": [],
                    "id": "6948dc5375095ca2be980dc6"
                },
                "role": [
                    "Shareholder",
                    "Director",
                    "Legal Representative",
                    "Secretary",
                    "Judicial Representative"
                ],
                "_id": "6948dc5475095ca2be980dcf",
                "id": "6948dc5475095ca2be980dcf"
            },
            {
                "personId": {
                    "_id": "6948dc4e75095ca2be980dbb_alt",
                    "name": "Krishna",
                    "nationality": "Maltese",
                    "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                    "supportingDocuments": [],
                    "id": "6948dc4e75095ca2be980dbb_alt"
                },
                "role": [
                    "Shareholder",
                    "Legal Representative",
                    "Director",
                    "Secretary",
                    "Judicial Representative"
                ],
                "_id": "6948dc4f75095ca2be980dc0_alt",
                "id": "6948dc4f75095ca2be980dc0_alt"
            },
            {
                "personId": {
                    "_id": "6948dc5375095ca2be980dc6_alt",
                    "name": "Tony",
                    "nationality": "Maltese",
                    "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                    "supportingDocuments": [],
                    "id": "6948dc5375095ca2be980dc6_alt"
                },
                "role": [
                    "Shareholder",
                    "Director",
                    "Legal Representative",
                    "Secretary",
                    "Judicial Representative"
                ],
                "_id": "6948dc5475095ca2be980dcf_alt",
                "id": "6948dc5475095ca2be980dcf_alt"
            },
            {
                "personId": {
                    "_id": "69429ed69c2f087b633111ad",
                    "name": "Aliakram",
                    "nationality": "Maltese",
                    "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                    "supportingDocuments": [],
                    "id": "69429ed69c2f087b633111ad"
                },
                "role": [
                    "Director",
                    "Legal Representative"
                ],
                "_id": "695e2a9799380d8afc47dee5",
                "id": "695e2a9799380d8afc47dee5"
            },
            {
                "personId": {
                    "_id": "69429ed29c2f087b633111a2",
                    "name": "Kannan",
                    "nationality": "Maltese",
                    "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                    "supportingDocuments": [],
                    "id": "69429ed29c2f087b633111a2"
                },
                "role": [
                    "Director",
                    "Legal Representative"
                ],
                "_id": "695e2a9899380d8afc47df94",
                "id": "695e2a9899380d8afc47df94"
            }
        ],
        "representationalCompany": [
            {
                "companyId": {
                    "_id": "69429ddc9c2f087b6331078f",
                    "clientId": "faa2d0c7-9d90-446e-82de-c56977af5a9d",
                    "name": "OpalGate Consulting Ltd",
                    "registrationNumber": "EF-020398611",
                    "id": "69429ddc9c2f087b6331078f"
                },
                "role": [
                    "Shareholder",
                    "Legal Representative",
                    "Director",
                    "Secretary",
                    "Judicial Representative"
                ],
                "_id": "695e2a2e99380d8afc47dd99",
                "id": "695e2a2e99380d8afc47dd99"
            }
        ],
        "createdAt": "2025-12-19T10:33:36.835Z",
        "updatedAt": "2026-01-07T09:42:48.900Z",
        "__v": 8,
        "companyStartedAt": "2026-01-07T00:00:00.000Z",
        "description": "GoldenWave Logistics Limited is a trusted logistics and supply chain solutions provider committed to delivering efficient, reliable, and cost-effective transportation services. With a strong focus on operational excellence, the company offers end-to-end logistics solutions including freight forwarding, warehousing, distribution, and last-mile delivery.",
        "industry": "Technology",
        "id": "69452a00891fd4a4ff48c059"
    }

}

export const MOCK_HIERARCHY_DATA: HierarchyResponse = {
    "success": true,
    "data": {
        "id": "69452a00891fd4a4ff48c059",
        "name": "GoldenWave Logistics Limited",
        "totalShares": [
            {
                "totalShares": 2000,
                "class": "A",
                "type": "Ordinary"
            },
            {
                "totalShares": 1300,
                "class": "B",
                "type": "Ordinary"
            },
            {
                "totalShares": 1200,
                "class": "C",
                "type": "Ordinary"
            },
            {
                "totalShares": 500,
                "class": "Ordinary",
                "type": "Ordinary"
            }
        ],
        "type": "company",
        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
        "shareholders": [
            {
                "id": "6948dc4e75095ca2be980dbb",
                "name": "Krishna",
                "type": "person",
                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                "sharesData": [
                    {
                        "totalShares": 400,
                        "class": "A",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 300,
                        "class": "B",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 200,
                        "class": "C",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 200,
                        "class": "Ordinary",
                        "type": "Ordinary"
                    }
                ],
                "totalShares": 1100,
                "roles": [
                    "Shareholder",
                    "Legal Representative",
                    "Director",
                    "Secretary",
                    "Judicial Representative"
                ],
                "nationality": "Maltese"
            },
            {
                "id": "6948dc5375095ca2be980dc6",
                "name": "Tony",
                "type": "person",
                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                "sharesData": [
                    {
                        "totalShares": 600,
                        "class": "A",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 300,
                        "class": "B",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 400,
                        "class": "C",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 100,
                        "class": "Ordinary",
                        "type": "Ordinary"
                    }
                ],
                "totalShares": 1400,
                "roles": [
                    "Shareholder",
                    "Director",
                    "Legal Representative",
                    "Secretary",
                    "Judicial Representative"
                ],
                "nationality": "Maltese"
            },
            {
                "id": "69429ed69c2f087b633111ad",
                "name": "Aliakram",
                "type": "person",
                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                "sharesData": [],
                "totalShares": 0,
                "roles": [
                    "Director",
                    "Legal Representative"
                ],
                "nationality": "Maltese"
            },
            {
                "id": "69429ed29c2f087b633111a2",
                "name": "Kannan",
                "type": "person",
                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                "sharesData": [],
                "totalShares": 0,
                "roles": [
                    "Director",
                    "Legal Representative"
                ],
                "nationality": "Maltese"
            },
            {
                "id": "69429ddc9c2f087b6331078f",
                "name": "OpalGate Consulting Ltd",
                "type": "company",
                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                "sharesData": [
                    {
                        "totalShares": 300,
                        "class": "A",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 400,
                        "class": "B",
                        "type": "Ordinary"
                    },
                    {
                        "totalShares": 100,
                        "class": "C",
                        "type": "Ordinary"
                    }
                ],
                "totalShares": 800,
                "roles": [
                    "Shareholder",
                    "Legal Representative",
                    "Director",
                    "Secretary",
                    "Judicial Representative"
                ],
                "children": [
                    {
                        "id": "69429ed29c2f087b633111a2",
                        "name": "Kannan",
                        "type": "person",
                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                        "sharesData": [
                            {
                                "totalShares": 200,
                                "class": "A",
                                "type": "Ordinary"
                            },
                            {
                                "totalShares": 300,
                                "class": "B",
                                "type": "Ordinary"
                            },
                            {
                                "totalShares": 100,
                                "class": "C",
                                "type": "Ordinary"
                            },
                            {
                                "totalShares": 400,
                                "class": "Ordinary",
                                "type": "Ordinary"
                            }
                        ],
                        "totalShares": 1000,
                        "roles": [
                            "Shareholder",
                            "Director",
                            "Legal Representative",
                            "Secretary",
                            "Judicial Representative"
                        ],
                        "nationality": "Maltese"
                    },
                    {
                        "id": "69429ed69c2f087b633111ad",
                        "name": "Aliakram",
                        "type": "person",
                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                        "sharesData": [
                            {
                                "totalShares": 400,
                                "class": "A",
                                "type": "Ordinary"
                            },
                            {
                                "totalShares": 400,
                                "class": "B",
                                "type": "Ordinary"
                            },
                            {
                                "totalShares": 200,
                                "class": "C",
                                "type": "Ordinary"
                            },
                            {
                                "totalShares": 600,
                                "class": "Ordinary",
                                "type": "Ordinary"
                            }
                        ],
                        "totalShares": 1600,
                        "roles": [
                            "Shareholder",
                            "Director",
                            "Legal Representative",
                            "Secretary",
                            "Judicial Representative"
                        ],
                        "nationality": "Maltese"
                    },
                    {
                        "id": "69452a00891fd4a4ff48c059",
                        "name": "GoldenWave Logistics Limited",
                        "type": "company",
                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                        "sharesData": [],
                        "totalShares": 0,
                        "roles": [
                            "Shareholder"
                        ],
                        "children": [
                            {
                                "id": "6948dc4e75095ca2be980dbb",
                                "name": "Krishna",
                                "type": "person",
                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                "sharesData": [
                                    {
                                        "totalShares": 400,
                                        "class": "A",
                                        "type": "Ordinary"
                                    },
                                    {
                                        "totalShares": 300,
                                        "class": "B",
                                        "type": "Ordinary"
                                    },
                                    {
                                        "totalShares": 200,
                                        "class": "C",
                                        "type": "Ordinary"
                                    },
                                    {
                                        "totalShares": 200,
                                        "class": "Ordinary",
                                        "type": "Ordinary"
                                    }
                                ],
                                "totalShares": 1100,
                                "roles": [
                                    "Shareholder",
                                    "Legal Representative",
                                    "Director",
                                    "Secretary",
                                    "Judicial Representative"
                                ],
                                "nationality": "Maltese"
                            },
                            {
                                "id": "6948dc5375095ca2be980dc6",
                                "name": "Tony",
                                "type": "person",
                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                "sharesData": [
                                    {
                                        "totalShares": 600,
                                        "class": "A",
                                        "type": "Ordinary"
                                    },
                                    {
                                        "totalShares": 300,
                                        "class": "B",
                                        "type": "Ordinary"
                                    },
                                    {
                                        "totalShares": 400,
                                        "class": "C",
                                        "type": "Ordinary"
                                    },
                                    {
                                        "totalShares": 100,
                                        "class": "Ordinary",
                                        "type": "Ordinary"
                                    }
                                ],
                                "totalShares": 1400,
                                "roles": [
                                    "Shareholder",
                                    "Director",
                                    "Legal Representative",
                                    "Secretary",
                                    "Judicial Representative"
                                ],
                                "nationality": "Maltese"
                            },
                            {
                                "id": "69429ed69c2f087b633111ad",
                                "name": "Aliakram",
                                "type": "person",
                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                "sharesData": [],
                                "totalShares": 0,
                                "roles": [
                                    "Director",
                                    "Legal Representative"
                                ],
                                "nationality": "Maltese"
                            },
                            {
                                "id": "69429ed29c2f087b633111a2",
                                "name": "Kannan",
                                "type": "person",
                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                "sharesData": [],
                                "totalShares": 0,
                                "roles": [
                                    "Director",
                                    "Legal Representative"
                                ],
                                "nationality": "Maltese"
                            },
                            {
                                "id": "69429ddc9c2f087b6331078f",
                                "name": "OpalGate Consulting Ltd",
                                "type": "company",
                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                "sharesData": [
                                    {
                                        "totalShares": 300,
                                        "class": "A",
                                        "type": "Ordinary"
                                    },
                                    {
                                        "totalShares": 400,
                                        "class": "B",
                                        "type": "Ordinary"
                                    },
                                    {
                                        "totalShares": 100,
                                        "class": "C",
                                        "type": "Ordinary"
                                    }
                                ],
                                "totalShares": 800,
                                "roles": [
                                    "Shareholder",
                                    "Legal Representative",
                                    "Director",
                                    "Secretary",
                                    "Judicial Representative"
                                ],
                                "children": [
                                    {
                                        "id": "69429ed29c2f087b633111a2",
                                        "name": "Kannan",
                                        "type": "person",
                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                        "sharesData": [
                                            {
                                                "totalShares": 200,
                                                "class": "A",
                                                "type": "Ordinary"
                                            },
                                            {
                                                "totalShares": 300,
                                                "class": "B",
                                                "type": "Ordinary"
                                            },
                                            {
                                                "totalShares": 100,
                                                "class": "C",
                                                "type": "Ordinary"
                                            },
                                            {
                                                "totalShares": 400,
                                                "class": "Ordinary",
                                                "type": "Ordinary"
                                            }
                                        ],
                                        "totalShares": 1000,
                                        "roles": [
                                            "Shareholder",
                                            "Director",
                                            "Legal Representative",
                                            "Secretary",
                                            "Judicial Representative"
                                        ],
                                        "nationality": "Maltese"
                                    },
                                    {
                                        "id": "69429ed69c2f087b633111ad",
                                        "name": "Aliakram",
                                        "type": "person",
                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                        "sharesData": [
                                            {
                                                "totalShares": 400,
                                                "class": "A",
                                                "type": "Ordinary"
                                            },
                                            {
                                                "totalShares": 400,
                                                "class": "B",
                                                "type": "Ordinary"
                                            },
                                            {
                                                "totalShares": 200,
                                                "class": "C",
                                                "type": "Ordinary"
                                            },
                                            {
                                                "totalShares": 600,
                                                "class": "Ordinary",
                                                "type": "Ordinary"
                                            }
                                        ],
                                        "totalShares": 1600,
                                        "roles": [
                                            "Shareholder",
                                            "Director",
                                            "Legal Representative",
                                            "Secretary",
                                            "Judicial Representative"
                                        ],
                                        "nationality": "Maltese"
                                    },
                                    {
                                        "id": "69452a00891fd4a4ff48c059",
                                        "name": "GoldenWave Logistics Limited",
                                        "type": "company",
                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                        "sharesData": [],
                                        "totalShares": 0,
                                        "roles": [
                                            "Shareholder"
                                        ],
                                        "children": [
                                            {
                                                "id": "6948dc4e75095ca2be980dbb",
                                                "name": "Krishna",
                                                "type": "person",
                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                "sharesData": [
                                                    {
                                                        "totalShares": 400,
                                                        "class": "A",
                                                        "type": "Ordinary"
                                                    },
                                                    {
                                                        "totalShares": 300,
                                                        "class": "B",
                                                        "type": "Ordinary"
                                                    },
                                                    {
                                                        "totalShares": 200,
                                                        "class": "C",
                                                        "type": "Ordinary"
                                                    },
                                                    {
                                                        "totalShares": 200,
                                                        "class": "Ordinary",
                                                        "type": "Ordinary"
                                                    }
                                                ],
                                                "totalShares": 1100,
                                                "roles": [
                                                    "Shareholder",
                                                    "Legal Representative",
                                                    "Director",
                                                    "Secretary",
                                                    "Judicial Representative"
                                                ],
                                                "nationality": "Maltese"
                                            },
                                            {
                                                "id": "6948dc5375095ca2be980dc6",
                                                "name": "Tony",
                                                "type": "person",
                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                "sharesData": [
                                                    {
                                                        "totalShares": 600,
                                                        "class": "A",
                                                        "type": "Ordinary"
                                                    },
                                                    {
                                                        "totalShares": 300,
                                                        "class": "B",
                                                        "type": "Ordinary"
                                                    },
                                                    {
                                                        "totalShares": 400,
                                                        "class": "C",
                                                        "type": "Ordinary"
                                                    },
                                                    {
                                                        "totalShares": 100,
                                                        "class": "Ordinary",
                                                        "type": "Ordinary"
                                                    }
                                                ],
                                                "totalShares": 1400,
                                                "roles": [
                                                    "Shareholder",
                                                    "Director",
                                                    "Legal Representative",
                                                    "Secretary",
                                                    "Judicial Representative"
                                                ],
                                                "nationality": "Maltese"
                                            },
                                            {
                                                "id": "69429ed69c2f087b633111ad",
                                                "name": "Aliakram",
                                                "type": "person",
                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                "sharesData": [],
                                                "totalShares": 0,
                                                "roles": [
                                                    "Director",
                                                    "Legal Representative"
                                                ],
                                                "nationality": "Maltese"
                                            },
                                            {
                                                "id": "69429ed29c2f087b633111a2",
                                                "name": "Kannan",
                                                "type": "person",
                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                "sharesData": [],
                                                "totalShares": 0,
                                                "roles": [
                                                    "Director",
                                                    "Legal Representative"
                                                ],
                                                "nationality": "Maltese"
                                            },
                                            {
                                                "id": "69429ddc9c2f087b6331078f",
                                                "name": "OpalGate Consulting Ltd",
                                                "type": "company",
                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                "sharesData": [
                                                    {
                                                        "totalShares": 300,
                                                        "class": "A",
                                                        "type": "Ordinary"
                                                    },
                                                    {
                                                        "totalShares": 400,
                                                        "class": "B",
                                                        "type": "Ordinary"
                                                    },
                                                    {
                                                        "totalShares": 100,
                                                        "class": "C",
                                                        "type": "Ordinary"
                                                    }
                                                ],
                                                "totalShares": 800,
                                                "roles": [
                                                    "Shareholder",
                                                    "Legal Representative",
                                                    "Director",
                                                    "Secretary",
                                                    "Judicial Representative"
                                                ],
                                                "children": [
                                                    {
                                                        "id": "69429ed29c2f087b633111a2",
                                                        "name": "Kannan",
                                                        "type": "person",
                                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                        "sharesData": [
                                                            {
                                                                "totalShares": 200,
                                                                "class": "A",
                                                                "type": "Ordinary"
                                                            },
                                                            {
                                                                "totalShares": 300,
                                                                "class": "B",
                                                                "type": "Ordinary"
                                                            },
                                                            {
                                                                "totalShares": 100,
                                                                "class": "C",
                                                                "type": "Ordinary"
                                                            },
                                                            {
                                                                "totalShares": 400,
                                                                "class": "Ordinary",
                                                                "type": "Ordinary"
                                                            }
                                                        ],
                                                        "totalShares": 1000,
                                                        "roles": [
                                                            "Shareholder",
                                                            "Director",
                                                            "Legal Representative",
                                                            "Secretary",
                                                            "Judicial Representative"
                                                        ],
                                                        "nationality": "Maltese"
                                                    },
                                                    {
                                                        "id": "69429ed69c2f087b633111ad",
                                                        "name": "Aliakram",
                                                        "type": "person",
                                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                        "sharesData": [
                                                            {
                                                                "totalShares": 400,
                                                                "class": "A",
                                                                "type": "Ordinary"
                                                            },
                                                            {
                                                                "totalShares": 400,
                                                                "class": "B",
                                                                "type": "Ordinary"
                                                            },
                                                            {
                                                                "totalShares": 200,
                                                                "class": "C",
                                                                "type": "Ordinary"
                                                            },
                                                            {
                                                                "totalShares": 600,
                                                                "class": "Ordinary",
                                                                "type": "Ordinary"
                                                            }
                                                        ],
                                                        "totalShares": 1600,
                                                        "roles": [
                                                            "Shareholder",
                                                            "Director",
                                                            "Legal Representative",
                                                            "Secretary",
                                                            "Judicial Representative"
                                                        ],
                                                        "nationality": "Maltese"
                                                    },
                                                    {
                                                        "id": "69452a00891fd4a4ff48c059",
                                                        "name": "GoldenWave Logistics Limited",
                                                        "type": "company",
                                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                        "sharesData": [],
                                                        "totalShares": 0,
                                                        "roles": [
                                                            "Shareholder"
                                                        ],
                                                        "children": [
                                                            {
                                                                "id": "6948dc4e75095ca2be980dbb",
                                                                "name": "Krishna",
                                                                "type": "person",
                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                "sharesData": [
                                                                    {
                                                                        "totalShares": 400,
                                                                        "class": "A",
                                                                        "type": "Ordinary"
                                                                    },
                                                                    {
                                                                        "totalShares": 300,
                                                                        "class": "B",
                                                                        "type": "Ordinary"
                                                                    },
                                                                    {
                                                                        "totalShares": 200,
                                                                        "class": "C",
                                                                        "type": "Ordinary"
                                                                    },
                                                                    {
                                                                        "totalShares": 200,
                                                                        "class": "Ordinary",
                                                                        "type": "Ordinary"
                                                                    }
                                                                ],
                                                                "totalShares": 1100,
                                                                "roles": [
                                                                    "Shareholder",
                                                                    "Legal Representative",
                                                                    "Director",
                                                                    "Secretary",
                                                                    "Judicial Representative"
                                                                ],
                                                                "nationality": "Maltese"
                                                            },
                                                            {
                                                                "id": "6948dc5375095ca2be980dc6",
                                                                "name": "Tony",
                                                                "type": "person",
                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                "sharesData": [
                                                                    {
                                                                        "totalShares": 600,
                                                                        "class": "A",
                                                                        "type": "Ordinary"
                                                                    },
                                                                    {
                                                                        "totalShares": 300,
                                                                        "class": "B",
                                                                        "type": "Ordinary"
                                                                    },
                                                                    {
                                                                        "totalShares": 400,
                                                                        "class": "C",
                                                                        "type": "Ordinary"
                                                                    },
                                                                    {
                                                                        "totalShares": 100,
                                                                        "class": "Ordinary",
                                                                        "type": "Ordinary"
                                                                    }
                                                                ],
                                                                "totalShares": 1400,
                                                                "roles": [
                                                                    "Shareholder",
                                                                    "Director",
                                                                    "Legal Representative",
                                                                    "Secretary",
                                                                    "Judicial Representative"
                                                                ],
                                                                "nationality": "Maltese"
                                                            },
                                                            {
                                                                "id": "69429ed69c2f087b633111ad",
                                                                "name": "Aliakram",
                                                                "type": "person",
                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                "sharesData": [],
                                                                "totalShares": 0,
                                                                "roles": [
                                                                    "Director",
                                                                    "Legal Representative"
                                                                ],
                                                                "nationality": "Maltese"
                                                            },
                                                            {
                                                                "id": "69429ed29c2f087b633111a2",
                                                                "name": "Kannan",
                                                                "type": "person",
                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                "sharesData": [],
                                                                "totalShares": 0,
                                                                "roles": [
                                                                    "Director",
                                                                    "Legal Representative"
                                                                ],
                                                                "nationality": "Maltese"
                                                            },
                                                            {
                                                                "id": "69429ddc9c2f087b6331078f",
                                                                "name": "OpalGate Consulting Ltd",
                                                                "type": "company",
                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                "sharesData": [
                                                                    {
                                                                        "totalShares": 300,
                                                                        "class": "A",
                                                                        "type": "Ordinary"
                                                                    },
                                                                    {
                                                                        "totalShares": 400,
                                                                        "class": "B",
                                                                        "type": "Ordinary"
                                                                    },
                                                                    {
                                                                        "totalShares": 100,
                                                                        "class": "C",
                                                                        "type": "Ordinary"
                                                                    }
                                                                ],
                                                                "totalShares": 800,
                                                                "roles": [
                                                                    "Shareholder",
                                                                    "Legal Representative",
                                                                    "Director",
                                                                    "Secretary",
                                                                    "Judicial Representative"
                                                                ],
                                                                "children": [
                                                                    {
                                                                        "id": "69429ed29c2f087b633111a2",
                                                                        "name": "Kannan",
                                                                        "type": "person",
                                                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                        "sharesData": [
                                                                            {
                                                                                "totalShares": 200,
                                                                                "class": "A",
                                                                                "type": "Ordinary"
                                                                            },
                                                                            {
                                                                                "totalShares": 300,
                                                                                "class": "B",
                                                                                "type": "Ordinary"
                                                                            },
                                                                            {
                                                                                "totalShares": 100,
                                                                                "class": "C",
                                                                                "type": "Ordinary"
                                                                            },
                                                                            {
                                                                                "totalShares": 400,
                                                                                "class": "Ordinary",
                                                                                "type": "Ordinary"
                                                                            }
                                                                        ],
                                                                        "totalShares": 1000,
                                                                        "roles": [
                                                                            "Shareholder",
                                                                            "Director",
                                                                            "Legal Representative",
                                                                            "Secretary",
                                                                            "Judicial Representative"
                                                                        ],
                                                                        "nationality": "Maltese"
                                                                    },
                                                                    {
                                                                        "id": "69429ed69c2f087b633111ad",
                                                                        "name": "Aliakram",
                                                                        "type": "person",
                                                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                        "sharesData": [
                                                                            {
                                                                                "totalShares": 400,
                                                                                "class": "A",
                                                                                "type": "Ordinary"
                                                                            },
                                                                            {
                                                                                "totalShares": 400,
                                                                                "class": "B",
                                                                                "type": "Ordinary"
                                                                            },
                                                                            {
                                                                                "totalShares": 200,
                                                                                "class": "C",
                                                                                "type": "Ordinary"
                                                                            },
                                                                            {
                                                                                "totalShares": 600,
                                                                                "class": "Ordinary",
                                                                                "type": "Ordinary"
                                                                            }
                                                                        ],
                                                                        "totalShares": 1600,
                                                                        "roles": [
                                                                            "Shareholder",
                                                                            "Director",
                                                                            "Legal Representative",
                                                                            "Secretary",
                                                                            "Judicial Representative"
                                                                        ],
                                                                        "nationality": "Maltese"
                                                                    },
                                                                    {
                                                                        "id": "69452a00891fd4a4ff48c059",
                                                                        "name": "GoldenWave Logistics Limited",
                                                                        "type": "company",
                                                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                        "sharesData": [],
                                                                        "totalShares": 0,
                                                                        "roles": [
                                                                            "Shareholder"
                                                                        ],
                                                                        "children": [
                                                                            {
                                                                                "id": "6948dc4e75095ca2be980dbb",
                                                                                "name": "Krishna",
                                                                                "type": "person",
                                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                "sharesData": [
                                                                                    {
                                                                                        "totalShares": 400,
                                                                                        "class": "A",
                                                                                        "type": "Ordinary"
                                                                                    },
                                                                                    {
                                                                                        "totalShares": 300,
                                                                                        "class": "B",
                                                                                        "type": "Ordinary"
                                                                                    },
                                                                                    {
                                                                                        "totalShares": 200,
                                                                                        "class": "C",
                                                                                        "type": "Ordinary"
                                                                                    },
                                                                                    {
                                                                                        "totalShares": 200,
                                                                                        "class": "Ordinary",
                                                                                        "type": "Ordinary"
                                                                                    }
                                                                                ],
                                                                                "totalShares": 1100,
                                                                                "roles": [
                                                                                    "Shareholder",
                                                                                    "Legal Representative",
                                                                                    "Director",
                                                                                    "Secretary",
                                                                                    "Judicial Representative"
                                                                                ],
                                                                                "nationality": "Maltese"
                                                                            },
                                                                            {
                                                                                "id": "6948dc5375095ca2be980dc6",
                                                                                "name": "Tony",
                                                                                "type": "person",
                                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                "sharesData": [
                                                                                    {
                                                                                        "totalShares": 600,
                                                                                        "class": "A",
                                                                                        "type": "Ordinary"
                                                                                    },
                                                                                    {
                                                                                        "totalShares": 300,
                                                                                        "class": "B",
                                                                                        "type": "Ordinary"
                                                                                    },
                                                                                    {
                                                                                        "totalShares": 400,
                                                                                        "class": "C",
                                                                                        "type": "Ordinary"
                                                                                    },
                                                                                    {
                                                                                        "totalShares": 100,
                                                                                        "class": "Ordinary",
                                                                                        "type": "Ordinary"
                                                                                    }
                                                                                ],
                                                                                "totalShares": 1400,
                                                                                "roles": [
                                                                                    "Shareholder",
                                                                                    "Director",
                                                                                    "Legal Representative",
                                                                                    "Secretary",
                                                                                    "Judicial Representative"
                                                                                ],
                                                                                "nationality": "Maltese"
                                                                            },
                                                                            {
                                                                                "id": "69429ed69c2f087b633111ad",
                                                                                "name": "Aliakram",
                                                                                "type": "person",
                                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                "sharesData": [],
                                                                                "totalShares": 0,
                                                                                "roles": [
                                                                                    "Director",
                                                                                    "Legal Representative"
                                                                                ],
                                                                                "nationality": "Maltese"
                                                                            },
                                                                            {
                                                                                "id": "69429ed29c2f087b633111a2",
                                                                                "name": "Kannan",
                                                                                "type": "person",
                                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                "sharesData": [],
                                                                                "totalShares": 0,
                                                                                "roles": [
                                                                                    "Director",
                                                                                    "Legal Representative"
                                                                                ],
                                                                                "nationality": "Maltese"
                                                                            },
                                                                            {
                                                                                "id": "69429ddc9c2f087b6331078f",
                                                                                "name": "OpalGate Consulting Ltd",
                                                                                "type": "company",
                                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                "sharesData": [
                                                                                    {
                                                                                        "totalShares": 300,
                                                                                        "class": "A",
                                                                                        "type": "Ordinary"
                                                                                    },
                                                                                    {
                                                                                        "totalShares": 400,
                                                                                        "class": "B",
                                                                                        "type": "Ordinary"
                                                                                    },
                                                                                    {
                                                                                        "totalShares": 100,
                                                                                        "class": "C",
                                                                                        "type": "Ordinary"
                                                                                    }
                                                                                ],
                                                                                "totalShares": 800,
                                                                                "roles": [
                                                                                    "Shareholder",
                                                                                    "Legal Representative",
                                                                                    "Director",
                                                                                    "Secretary",
                                                                                    "Judicial Representative"
                                                                                ],
                                                                                "children": [
                                                                                    {
                                                                                        "id": "69429ed29c2f087b633111a2",
                                                                                        "name": "Kannan",
                                                                                        "type": "person",
                                                                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                        "sharesData": [
                                                                                            {
                                                                                                "totalShares": 200,
                                                                                                "class": "A",
                                                                                                "type": "Ordinary"
                                                                                            },
                                                                                            {
                                                                                                "totalShares": 300,
                                                                                                "class": "B",
                                                                                                "type": "Ordinary"
                                                                                            },
                                                                                            {
                                                                                                "totalShares": 100,
                                                                                                "class": "C",
                                                                                                "type": "Ordinary"
                                                                                            },
                                                                                            {
                                                                                                "totalShares": 400,
                                                                                                "class": "Ordinary",
                                                                                                "type": "Ordinary"
                                                                                            }
                                                                                        ],
                                                                                        "totalShares": 1000,
                                                                                        "roles": [
                                                                                            "Shareholder",
                                                                                            "Director",
                                                                                            "Legal Representative",
                                                                                            "Secretary",
                                                                                            "Judicial Representative"
                                                                                        ],
                                                                                        "nationality": "Maltese"
                                                                                    },
                                                                                    {
                                                                                        "id": "69429ed69c2f087b633111ad",
                                                                                        "name": "Aliakram",
                                                                                        "type": "person",
                                                                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                        "sharesData": [
                                                                                            {
                                                                                                "totalShares": 400,
                                                                                                "class": "A",
                                                                                                "type": "Ordinary"
                                                                                            },
                                                                                            {
                                                                                                "totalShares": 400,
                                                                                                "class": "B",
                                                                                                "type": "Ordinary"
                                                                                            },
                                                                                            {
                                                                                                "totalShares": 200,
                                                                                                "class": "C",
                                                                                                "type": "Ordinary"
                                                                                            },
                                                                                            {
                                                                                                "totalShares": 600,
                                                                                                "class": "Ordinary",
                                                                                                "type": "Ordinary"
                                                                                            }
                                                                                        ],
                                                                                        "totalShares": 1600,
                                                                                        "roles": [
                                                                                            "Shareholder",
                                                                                            "Director",
                                                                                            "Legal Representative",
                                                                                            "Secretary",
                                                                                            "Judicial Representative"
                                                                                        ],
                                                                                        "nationality": "Maltese"
                                                                                    },
                                                                                    {
                                                                                        "id": "69452a00891fd4a4ff48c059",
                                                                                        "name": "GoldenWave Logistics Limited",
                                                                                        "type": "company",
                                                                                        "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                        "sharesData": [],
                                                                                        "totalShares": 0,
                                                                                        "roles": [
                                                                                            "Shareholder"
                                                                                        ],
                                                                                        "children": [
                                                                                            {
                                                                                                "id": "6948dc4e75095ca2be980dbb",
                                                                                                "name": "Krishna",
                                                                                                "type": "person",
                                                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                                "sharesData": [
                                                                                                    {
                                                                                                        "totalShares": 400,
                                                                                                        "class": "A",
                                                                                                        "type": "Ordinary"
                                                                                                    },
                                                                                                    {
                                                                                                        "totalShares": 300,
                                                                                                        "class": "B",
                                                                                                        "type": "Ordinary"
                                                                                                    },
                                                                                                    {
                                                                                                        "totalShares": 200,
                                                                                                        "class": "C",
                                                                                                        "type": "Ordinary"
                                                                                                    },
                                                                                                    {
                                                                                                        "totalShares": 200,
                                                                                                        "class": "Ordinary",
                                                                                                        "type": "Ordinary"
                                                                                                    }
                                                                                                ],
                                                                                                "totalShares": 1100,
                                                                                                "roles": [
                                                                                                    "Shareholder",
                                                                                                    "Legal Representative",
                                                                                                    "Director",
                                                                                                    "Secretary",
                                                                                                    "Judicial Representative"
                                                                                                ],
                                                                                                "nationality": "Maltese"
                                                                                            },
                                                                                            {
                                                                                                "id": "6948dc5375095ca2be980dc6",
                                                                                                "name": "Tony",
                                                                                                "type": "person",
                                                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                                "sharesData": [
                                                                                                    {
                                                                                                        "totalShares": 600,
                                                                                                        "class": "A",
                                                                                                        "type": "Ordinary"
                                                                                                    },
                                                                                                    {
                                                                                                        "totalShares": 300,
                                                                                                        "class": "B",
                                                                                                        "type": "Ordinary"
                                                                                                    },
                                                                                                    {
                                                                                                        "totalShares": 400,
                                                                                                        "class": "C",
                                                                                                        "type": "Ordinary"
                                                                                                    },
                                                                                                    {
                                                                                                        "totalShares": 100,
                                                                                                        "class": "Ordinary",
                                                                                                        "type": "Ordinary"
                                                                                                    }
                                                                                                ],
                                                                                                "totalShares": 1400,
                                                                                                "roles": [
                                                                                                    "Shareholder",
                                                                                                    "Director",
                                                                                                    "Legal Representative",
                                                                                                    "Secretary",
                                                                                                    "Judicial Representative"
                                                                                                ],
                                                                                                "nationality": "Maltese"
                                                                                            },
                                                                                            {
                                                                                                "id": "69429ed69c2f087b633111ad",
                                                                                                "name": "Aliakram",
                                                                                                "type": "person",
                                                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                                "sharesData": [],
                                                                                                "totalShares": 0,
                                                                                                "roles": [
                                                                                                    "Director",
                                                                                                    "Legal Representative"
                                                                                                ],
                                                                                                "nationality": "Maltese"
                                                                                            },
                                                                                            {
                                                                                                "id": "69429ed29c2f087b633111a2",
                                                                                                "name": "Kannan",
                                                                                                "type": "person",
                                                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                                "sharesData": [],
                                                                                                "totalShares": 0,
                                                                                                "roles": [
                                                                                                    "Director",
                                                                                                    "Legal Representative"
                                                                                                ],
                                                                                                "nationality": "Maltese"
                                                                                            },
                                                                                            {
                                                                                                "id": "69429ddc9c2f087b6331078f",
                                                                                                "name": "OpalGate Consulting Ltd",
                                                                                                "type": "company",
                                                                                                "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                                                                                                "sharesData": [
                                                                                                    {
                                                                                                        "totalShares": 300,
                                                                                                        "class": "A",
                                                                                                        "type": "Ordinary"
                                                                                                    },
                                                                                                    {
                                                                                                        "totalShares": 400,
                                                                                                        "class": "B",
                                                                                                        "type": "Ordinary"
                                                                                                    },
                                                                                                    {
                                                                                                        "totalShares": 100,
                                                                                                        "class": "C",
                                                                                                        "type": "Ordinary"
                                                                                                    }
                                                                                                ],
                                                                                                "totalShares": 800,
                                                                                                "roles": [
                                                                                                    "Shareholder",
                                                                                                    "Legal Representative",
                                                                                                    "Director",
                                                                                                    "Secretary",
                                                                                                    "Judicial Representative"
                                                                                                ],
                                                                                                "children": []
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    }
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
};

export const MOCK_COMPANY_DATA_OPAL: CompanyResponse = {
    "data": {
        "perShareValue": {
            "value": 50,
            "currency": "EUR"
        },
        "_id": "69429ddc9c2f087b6331078f",
        "clientId": "faa2d0c7-9d90-446e-82de-c56977af5a9d",
        "organizationId": "6914e26ebbb06e696s21eebf4",
        "name": "OpalGate Consulting Ltd",
        "registrationNumber": "EF-020398611",
        "address": "12, Triq San Gwann, Valletta VLT 1165, Malta",
        "supportingDocuments": [],
        "authorizedShares": 5000,
        "issuedShares": 4000,
        "totalShares": [
            {
                "totalShares": 3000,
                "class": "A",
                "type": "Ordinary"
            },
            {
                "totalShares": 1000,
                "class": "B",
                "type": "Ordinary"
            }
        ],
        "shareHoldingCompanies": [],
        "shareHolders": [
            {
                "personId": {
                    "_id": "rep_person_1",
                    "name": "Sarah Vella",
                    "nationality": "Maltese",
                    "address": "7, Triq il-Kbira, Sliema SLM 1541, Malta",
                    "supportingDocuments": [],
                    "id": "rep_person_1"
                },
                "sharePercentage": 75,
                "paidUpSharesPercentage": 100,
                "sharesData": [
                    {
                        "totalShares": 3000,
                        "class": "A",
                        "type": "Ordinary"
                    }
                ],
                "_id": "sh_1",
                "id": "sh_1"
            },
            {
                "personId": {
                    "_id": "rep_person_2",
                    "name": "Robert Zammit",
                    "nationality": "Maltese",
                    "address": "15, Triq l-Imdina, Zebbug ZBG 1650, Malta",
                    "supportingDocuments": [],
                    "id": "rep_person_2"
                },
                "sharePercentage": 25,
                "paidUpSharesPercentage": 100,
                "sharesData": [
                    {
                        "totalShares": 1000,
                        "class": "B",
                        "type": "Ordinary"
                    }
                ],
                "_id": "sh_2",
                "id": "sh_2"
            }
        ],
        "representationalSchema": [
            {
                "personId": {
                    "_id": "rep_person_1",
                    "name": "Sarah Vella",
                    "nationality": "Maltese",
                    "address": "7, Triq il-Kbira, Sliema SLM 1541, Malta",
                    "supportingDocuments": [],
                    "id": "rep_person_1"
                },
                "role": [
                    "Director",
                    "Legal Representative",
                    "Judicial Representative"
                ],
                "_id": "rep_1",
                "id": "rep_1"
            }
        ],
        "representationalCompany": [],
        "createdAt": "2025-11-15T09:00:00.000Z",
        "updatedAt": "2026-01-10T14:30:00.000Z",
        "__v": 1,
        "companyStartedAt": "2025-11-15T00:00:00.000Z",
        "description": "OpalGate Consulting Ltd specializes in providing high-end business consulting and advisory services in Malta. Our experts help organizations navigate complex regulatory environments and optimize their operational strategies.",
        "industry": "Consulting",
        "id": "69429ddc9c2f087b6331078f"
    }
};

export const MOCK_HIERARCHY_DATA_OPAL: HierarchyResponse = {
    "success": true,
    "data": {
        "id": "69429ddc9c2f087b6331078f",
        "name": "OpalGate Consulting Ltd",
        "totalShares": [
            {
                "totalShares": 3000,
                "class": "A",
                "type": "Ordinary"
            },
            {
                "totalShares": 1000,
                "class": "B",
                "type": "Ordinary"
            }
        ],
        "type": "company",
        "address": "12, Triq San Gwann, Valletta VLT 1165, Malta",
        "shareholders": [
            {
                "id": "rep_person_1",
                "name": "Sarah Vella",
                "type": "person",
                "address": "7, Triq il-Kbira, Sliema SLM 1541, Malta",
                "sharesData": [
                    {
                        "totalShares": 3000,
                        "class": "A",
                        "type": "Ordinary"
                    }
                ],
                "totalShares": 3000,
                "roles": ["Director", "Legal Representative"],
                "nationality": "Maltese"
            },
            {
                "id": "rep_person_2",
                "name": "Robert Zammit",
                "type": "person",
                "address": "15, Triq l-Imdina, Zebbug ZBG 1650, Malta",
                "sharesData": [
                    {
                        "totalShares": 1000,
                        "class": "B",
                        "type": "Ordinary"
                    }
                ],
                "totalShares": 1000,
                "roles": [],
                "nationality": "Maltese"
            }
        ]
    }
};

export const MOCK_KYC_WORKFLOWS_DATA: KycWorkflow[] = [
    {
        "_id": "6948dc7275095ca2be980e1f",
        "company": {
            "_id": "69452a00891fd4a4ff48c059",
            "clientId": "a9eef95d-fd72-42ed-89e9-23974d2f3c51",
            "name": "GoldenWave Logistics Limited",
            "registrationNumber": "EF-0203332",
            "id": "69452a00891fd4a4ff48c059"
        },
        "clientId": "a9eef95d-fd72-42ed-89e9-23974d2f3c51",
        "auditorId": "225d3e71-de46-444d-b6d3-9f3d51fc5e9f",
        "workflowType": "Shareholder",
        "documentRequests": [
            {
                "documentRequest": {
                    "_id": "6948dc7175095ca2be980e0a",
                    "name": "KYC-KRISHNA-V1",
                    "category": "kyc",
                    "description": "The following files to be submitted by the Krishna for GoldenWave Logistics Limited",
                    "status": "submitted",
                    "documents": [
                        {
                            "name": "Bank Statement",
                            "type": "direct",
                            "url": "",
                            "uploadedFileName": "",
                            "uploadedAt": null,
                            "status": "pending",
                            "comment": "",
                            "_id": "695bd66160da08b86db86664"
                        },
                        {
                            "template": {
                                "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764838995743_w77gs.pdf",
                                "instruction": "Download the template and upload the Form"
                            },
                            "name": "Form 11",
                            "type": "template",
                            "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/engagement-documents/69452a00891fd4a4ff48c059/kyc/1766383532945_e9w0m.jpg",
                            "uploadedFileName": "bank-statement-template-22 (1).jpg",
                            "uploadedAt": "2025-12-22T06:05:33.473Z",
                            "status": "uploaded",
                            "comment": "",
                            "_id": "6948dfad2e08da05215ad653"
                        }
                    ],
                    "multipleDocuments": [
                        {
                            "name": "Bank Pass Book",
                            "type": "direct",
                            "instruction": "",
                            "multiple": [
                                {
                                    "label": "First Page",
                                    "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/engagement-documents/69452a00891fd4a4ff48c059/kyc/1766383810259_gxit7_0.jpg",
                                    "uploadedFileName": "bank-statement-template-22 (1).jpg",
                                    "uploadedAt": "2025-12-22T06:10:10.876Z",
                                    "status": "uploaded",
                                    "comment": "",
                                    "_id": "6948e0c2f1db589343afc05e"
                                },
                                {
                                    "label": "Second Page",
                                    "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/engagement-documents/69452a00891fd4a4ff48c059/kyc/1766383816811_n9sjv_0.jpg",
                                    "uploadedFileName": "example-of-a-real-bank-statement-from-bank-of-america-1440x1238 (2).jpg",
                                    "uploadedAt": "2025-12-22T06:10:17.223Z",
                                    "status": "uploaded",
                                    "comment": "",
                                    "_id": "6948e0c9f1db589343afc080"
                                }
                            ],
                            "_id": "6948dc7175095ca2be980e0d"
                        },
                        {
                            "name": "Form 14",
                            "type": "template",
                            "instruction": "",
                            "multiple": [
                                {
                                    "template": {
                                        "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764839226753_0_8el6j.pdf",
                                        "instruction": "Upload the required Form Front Side\n\nTemplate Instructions: Download the template"
                                    },
                                    "label": "Front side",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "6948e0d5f1db589343afc0a2",
                                    "uploadedAt": "2026-01-07T07:10:25.614Z"
                                },
                                {
                                    "template": {
                                        "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764839227656_1_6nlvt.pdf",
                                        "instruction": "Upload the Required Form Back Side\n\nTemplate Instructions: Download the template"
                                    },
                                    "label": "Back Side",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "6948e0daf1db589343afc0c7",
                                    "uploadedAt": "2026-01-07T07:10:25.614Z"
                                }
                            ],
                            "_id": "6948dc7175095ca2be980e10"
                        }
                    ]
                },
                "person": {
                    "_id": "6948dc4e75095ca2be980dbb",
                    "name": "Krishna",
                    "nationality": "Maltese",
                    "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                    "id": "6948dc4e75095ca2be980dbb"
                },
                "_id": "6948dc7275095ca2be980e20"
            },
            {
                "documentRequest": {
                    "_id": "6948dc7275095ca2be980e15",
                    "name": "KYC-TONY-V1",
                    "category": "kyc",
                    "description": "The following files to be submitted by the Tony for GoldenWave Logistics Limited",
                    "status": "completed",
                    "documents": [
                        {
                            "name": "Bank Statement",
                            "type": "direct",
                            "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/engagement-documents/69452a00891fd4a4ff48c059/kyc/1767620439747_iukbg.png",
                            "uploadedFileName": "Screenshot 2025-10-01 121241.png",
                            "uploadedAt": "2026-01-05T13:40:40.190Z",
                            "status": "uploaded",
                            "comment": "",
                            "_id": "695bbf5860da08b86db84ed5"
                        },
                        {
                            "template": {
                                "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764838995743_w77gs.pdf",
                                "instruction": "Download the template and upload the Form"
                            },
                            "name": "Form 11",
                            "type": "template",
                            "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/engagement-documents/69452a00891fd4a4ff48c059/kyc/1767620644007_d8yvi.png",
                            "uploadedFileName": "Screenshot 2025-10-01 121241.png",
                            "uploadedAt": "2026-01-05T13:44:04.344Z",
                            "status": "uploaded",
                            "comment": "",
                            "_id": "695bc02460da08b86db84f86"
                        }
                    ],
                    "multipleDocuments": [
                        {
                            "name": "Bank Pass Book",
                            "type": "direct",
                            "instruction": "",
                            "multiple": [
                                {
                                    "label": "First Page",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "6948dc7275095ca2be980e19",
                                    "uploadedAt": "2025-12-22T05:51:46.615Z"
                                },
                                {
                                    "label": "Second Page",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "6948dc7275095ca2be980e1a",
                                    "uploadedAt": "2025-12-22T05:51:46.615Z"
                                }
                            ],
                            "_id": "6948dc7275095ca2be980e18"
                        },
                        {
                            "name": "Form 14",
                            "type": "template",
                            "instruction": "",
                            "multiple": [
                                {
                                    "template": {
                                        "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764839226753_0_8el6j.pdf",
                                        "instruction": "Upload the required Form Front Side\n\nTemplate Instructions: Download the template"
                                    },
                                    "label": "Front side",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "6948dc7275095ca2be980e1c",
                                    "uploadedAt": "2025-12-22T05:51:46.616Z"
                                },
                                {
                                    "template": {
                                        "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764839227656_1_6nlvt.pdf",
                                        "instruction": "Upload the Required Form Back Side\n\nTemplate Instructions: Download the template"
                                    },
                                    "label": "Back Side",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "6948dc7275095ca2be980e1d",
                                    "uploadedAt": "2025-12-22T05:51:46.616Z"
                                }
                            ],
                            "_id": "6948dc7275095ca2be980e1b"
                        }
                    ]
                },
                "person": {
                    "_id": "6948dc5375095ca2be980dc6",
                    "name": "Tony",
                    "nationality": "Maltese",
                    "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                    "id": "6948dc5375095ca2be980dc6"
                },
                "_id": "6948dc7275095ca2be980e21"
            }
        ],
        "status": "reopened",
        "discussions": [],
        "createdAt": "2025-12-22T05:51:46.935Z",
        "updatedAt": "2026-01-06T04:55:08.741Z",
        "__v": 0
    },
    {
        "_id": "69497605abccee8f95adbd12",
        "company": {
            "_id": "69452a00891fd4a4ff48c059",
            "clientId": "a9eef95d-fd72-42ed-89e9-23974d2f3c51",
            "name": "GoldenWave Logistics Limited",
            "registrationNumber": "EF-0203332",
            "id": "69452a00891fd4a4ff48c059"
        },
        "clientId": "a9eef95d-fd72-42ed-89e9-23974d2f3c51",
        "auditorId": "225d3e71-de46-444d-b6d3-9f3d51fc5e9f",
        "workflowType": "Representative",
        "documentRequests": [
            {
                "documentRequest": {
                    "_id": "69497604abccee8f95adbcfc",
                    "name": "KYC-KRISHNA-V1",
                    "category": "kyc",
                    "description": "The following files to be submitted by the Krishna for GoldenWave Logistics Limited",
                    "status": "pending",
                    "documents": [
                        {
                            "name": "Bank Statement",
                            "type": "direct",
                            "status": "pending",
                            "comment": "",
                            "_id": "69497604abccee8f95adbcfd",
                            "uploadedAt": "2025-12-22T16:47:00.730Z"
                        },
                        {
                            "template": {
                                "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764838995743_w77gs.pdf",
                                "instruction": "Download the template and upload the Form"
                            },
                            "name": "Form 11",
                            "type": "template",
                            "status": "pending",
                            "comment": "",
                            "_id": "69497604abccee8f95adbcfe",
                            "uploadedAt": "2025-12-22T16:47:00.731Z"
                        }
                    ],
                    "multipleDocuments": [
                        {
                            "name": "Bank Pass Book",
                            "type": "direct",
                            "instruction": "",
                            "multiple": [
                                {
                                    "label": "First Page",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "69497604abccee8f95adbd00",
                                    "uploadedAt": "2025-12-22T16:47:00.732Z"
                                },
                                {
                                    "label": "Second Page",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "69497604abccee8f95adbd01",
                                    "uploadedAt": "2025-12-22T16:47:00.732Z"
                                }
                            ],
                            "_id": "69497604abccee8f95adbcff"
                        },
                        {
                            "name": "Form 14",
                            "type": "template",
                            "instruction": "",
                            "multiple": [
                                {
                                    "template": {
                                        "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764839226753_0_8el6j.pdf",
                                        "instruction": "Upload the required Form Front Side\n\nTemplate Instructions: Download the template"
                                    },
                                    "label": "Front side",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "69497604abccee8f95adbd03",
                                    "uploadedAt": "2025-12-22T16:47:00.732Z"
                                },
                                {
                                    "template": {
                                        "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764839227656_1_6nlvt.pdf",
                                        "instruction": "Upload the Required Form Back Side\n\nTemplate Instructions: Download the template"
                                    },
                                    "label": "Back Side",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "69497604abccee8f95adbd04",
                                    "uploadedAt": "2025-12-22T16:47:00.732Z"
                                }
                            ],
                            "_id": "69497604abccee8f95adbd02"
                        }
                    ]
                },
                "person": {
                    "_id": "6948dc4e75095ca2be980dbb",
                    "name": "Krishna",
                    "nationality": "Maltese",
                    "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                    "id": "6948dc4e75095ca2be980dbb"
                },
                "_id": "69497605abccee8f95adbd13"
            },
            {
                "documentRequest": {
                    "_id": "69497605abccee8f95adbd08",
                    "name": "KYC-TONY-V1",
                    "category": "kyc",
                    "description": "The following files to be submitted by the Tony for GoldenWave Logistics Limited",
                    "status": "pending",
                    "documents": [
                        {
                            "name": "Bank Statement",
                            "type": "direct",
                            "status": "pending",
                            "comment": "",
                            "_id": "69497605abccee8f95adbd09",
                            "uploadedAt": "2025-12-22T16:47:01.366Z"
                        },
                        {
                            "template": {
                                "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764838995743_w77gs.pdf",
                                "instruction": "Download the template and upload the Form"
                            },
                            "name": "Form 11",
                            "type": "template",
                            "status": "pending",
                            "comment": "",
                            "_id": "69497605abccee8f95adbd0a",
                            "uploadedAt": "2025-12-22T16:47:01.367Z"
                        }
                    ],
                    "multipleDocuments": [
                        {
                            "name": "Bank Pass Book",
                            "type": "direct",
                            "instruction": "",
                            "multiple": [
                                {
                                    "label": "First Page",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "69497605abccee8f95adbd0c",
                                    "uploadedAt": "2025-12-22T16:47:01.367Z"
                                },
                                {
                                    "label": "Second Page",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "69497605abccee8f95adbd0d",
                                    "uploadedAt": "2025-12-22T16:47:01.368Z"
                                }
                            ],
                            "_id": "69497605abccee8f95adbd0b"
                        },
                        {
                            "name": "Form 14",
                            "type": "template",
                            "instruction": "",
                            "multiple": [
                                {
                                    "template": {
                                        "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764839226753_0_8el6j.pdf",
                                        "instruction": "Upload the required Form Front Side\n\nTemplate Instructions: Download the template"
                                    },
                                    "label": "Front side",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "69497605abccee8f95adbd0f",
                                    "uploadedAt": "2025-12-22T16:47:01.368Z"
                                },
                                {
                                    "template": {
                                        "url": "https://xqetphggxhqttjnaxilk.supabase.co/storage/v1/object/public/global-documents/document-request-templates/Bank%20&%20Cash/template_1764839227656_1_6nlvt.pdf",
                                        "instruction": "Upload the Required Form Back Side\n\nTemplate Instructions: Download the template"
                                    },
                                    "label": "Back Side",
                                    "status": "pending",
                                    "comment": "",
                                    "_id": "69497605abccee8f95adbd10",
                                    "uploadedAt": "2025-12-22T16:47:01.369Z"
                                }
                            ],
                            "_id": "69497605abccee8f95adbd0e"
                        }
                    ]
                },
                "person": {
                    "_id": "6948dc5375095ca2be980dc6",
                    "name": "Tony",
                    "nationality": "Maltese",
                    "address": "55, Triq ix-Xatt, Marsa MRS 1907, Malta",
                    "id": "6948dc5375095ca2be980dc6"
                },
                "_id": "69497605abccee8f95adbd14"
            }
        ],
        "status": "active",
        "discussions": [],
        "createdAt": "2025-12-22T16:47:01.706Z",
        "updatedAt": "2025-12-22T16:47:01.706Z",
        "__v": 0
    }
];

export const MOCK_COMPANIES = [
  {
    _id: "69452a00891fd4a4ff48c059",
    name: "GoldenWave Logistics Limited",
    registrationNumber: "EF-0203332"
  },
  {
    _id: "69429ddc9c2f087b6331078f",
    name: "OpalGate Consulting Ltd",
    registrationNumber: "EF-020398611"
  }
];

export const MOCK_KYC_DATA = [
  {
    _id: "69497605abccee8f95adbd14",
    company: {
      _id: "69452a00891fd4a4ff48c059",
      name: "GoldenWave Logistics Limited",
      registrationNumber: "EF-0203332",
      id: "69452a00891fd4a4ff48c059"
    },
    clientId: "a9eef95d-fd72-42ed-89e9-23974d2f3c51",
    auditorId: "auditor_123",
    workflowType: "standard",
    documentRequests: [],
    status: "active",
    discussions: [],
    createdAt: "2025-12-22T16:47:01.706Z",
    updatedAt: "2025-12-22T16:47:01.706Z",
    __v: 0
  },
  {
    _id: "kyc_opal_001",
    company: {
      _id: "69429ddc9c2f087b6331078f",
      name: "OpalGate Consulting Ltd",
      registrationNumber: "EF-020398611",
      id: "69429ddc9c2f087b6331078f"
    },
    clientId: "faa2d0c7-9d90-446e-82de-c56977af5a9d",
    auditorId: "auditor_456",
    workflowType: "standard",
    documentRequests: [],
    status: "active",
    discussions: [],
    createdAt: "2026-01-10T09:00:00.706Z",
    updatedAt: "2026-01-10T09:00:00.706Z",
    __v: 0
  }
];
