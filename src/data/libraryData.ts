import { 
  FolderIcon, 
  FileIcon, 
  FileTextIcon, 
  ImageIcon, 
  FileCodeIcon,
  ArchiveIcon
} from 'lucide-react';

export interface LibraryItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  fileType?: string;
  size?: string;
  updatedAt: string;
  parentId: string | null;
}

export const mockLibraryData: LibraryItem[] = [
  // Root level
  { id: '1', name: 'Engagement & onboarding', type: 'folder', updatedAt: '2024-01-20', parentId: null },
  { id: '2', name: 'Compliance & tax records', type: 'folder', updatedAt: '2024-01-18', parentId: null },
  { id: '3', name: 'Audit & financial reports', type: 'folder', updatedAt: '2024-01-15', parentId: null },
  { id: '4', name: 'Corporate governance', type: 'folder', updatedAt: '2024-01-10', parentId: null },
  
  // Inside Engagement & onboarding (ID: 1)
  { id: '5', name: 'Draft agreements', type: 'folder', updatedAt: '2024-01-20', parentId: '1' },
  { id: '6', name: 'Executed documents', type: 'folder', updatedAt: '2024-01-19', parentId: '1' },
  { id: '7', name: 'Know Your Customer (KYC)', type: 'folder', updatedAt: '2024-01-15', parentId: '1' },
  { id: '8', name: 'ENGAGEMENT_LETTER_2024_FINAL.pdf', type: 'file', fileType: 'PDF', size: '1.2 MB', updatedAt: '2024-01-20', parentId: '1' },
  { id: '9', name: 'MASTER_SERVICES_AGREEMENT.docx', type: 'file', fileType: 'DOCX', size: '450 KB', updatedAt: '2024-01-15', parentId: '1' },
  { id: '10', name: 'Onboarding_Checklist.xlsx', type: 'file', fileType: 'XLSX', size: '125 KB', updatedAt: '2024-01-10', parentId: '1' },

  // Inside Compliance & tax records (ID: 2)
  { id: '20', name: 'VAT Returns', type: 'folder', updatedAt: '2024-01-18', parentId: '2' },
  { id: '21', name: 'Direct Tax', type: 'folder', updatedAt: '2024-01-17', parentId: '2' },
  { id: '22', name: 'Statutory Filings', type: 'folder', updatedAt: '2024-01-16', parentId: '2' },
  { id: '23', name: 'VAT_SUBMISSION_Q4_2023.pdf', type: 'file', fileType: 'PDF', size: '890 KB', updatedAt: '2024-01-18', parentId: '2' },
  { id: '24', name: 'CORPORATE_TAX_RETURN_FINAL.pdf', type: 'file', fileType: 'PDF', size: '1.5 MB', updatedAt: '2024-01-17', parentId: '2' },
  { id: '25', name: 'Tax_Computation_Workings.xlsx', type: 'file', fileType: 'XLSX', size: '2.1 MB', updatedAt: '2024-01-16', parentId: '2' },

  // Inside Audit & financial reports (ID: 3)
  { id: '30', name: 'Annual Accounts', type: 'folder', updatedAt: '2024-01-15', parentId: '3' },
  { id: '31', name: 'Management Reports', type: 'folder', updatedAt: '2024-01-14', parentId: '3' },
  { id: '32', name: 'Audit Working Papers', type: 'folder', updatedAt: '2024-01-13', parentId: '3' },
  { id: '33', name: 'FINANCIAL_STATEMENT_FY2023.pdf', type: 'file', fileType: 'PDF', size: '3.4 MB', updatedAt: '2024-01-15', parentId: '3' },
  { id: '34', name: 'CASH_FLOW_FORECAST_Q1_2024.xlsx', type: 'file', fileType: 'XLSX', size: '980 KB', updatedAt: '2024-01-14', parentId: '3' },
  { id: '35', name: 'Balance_Sheet_Consolidated.xlsx', type: 'file', fileType: 'XLSX', size: '1.2 MB', updatedAt: '2024-01-12', parentId: '3' },

  // Inside Corporate governance (ID: 4)
  { id: '40', name: 'Board Minutes', type: 'folder', updatedAt: '2024-01-10', parentId: '4' },
  { id: '41', name: 'Shareholder Certificates', type: 'folder', updatedAt: '2024-01-09', parentId: '4' },
  { id: '42', name: 'Company Constitution', type: 'folder', updatedAt: '2024-01-08', parentId: '4' },
  { id: '43', name: 'BOARD_RESOLUTION_JAN_2024.pdf', type: 'file', fileType: 'PDF', size: '210 KB', updatedAt: '2024-01-10', parentId: '4' },
  { id: '44', name: 'MEMORANDUM_OF_ASSOCIATION.pdf', type: 'file', fileType: 'PDF', size: '1.8 MB', updatedAt: '2024-01-08', parentId: '4' },
  { id: '45', name: 'Share_Register_Exposed.csv', type: 'file', fileType: 'CSV', size: '45 KB', updatedAt: '2024-01-07', parentId: '4' },

  // Deeply nested: Engagement > Draft agreements (ID: 5)
  { id: '50', name: 'Service proposals', type: 'folder', updatedAt: '2024-01-20', parentId: '5' },
  { id: '51', name: 'Reference materials', type: 'folder', updatedAt: '2024-01-20', parentId: '5' },
  { id: '52', name: 'PROPOSAL_V1.pdf', type: 'file', fileType: 'PDF', size: '2.4 MB', updatedAt: '2024-01-20', parentId: '5' },
  { id: '53', name: 'COSTING_SHEET.xlsx', type: 'file', fileType: 'XLSX', size: '1.1 MB', updatedAt: '2024-01-20', parentId: '5' },
  { id: '54', name: 'Draft_Markup_Legal.docx', type: 'file', fileType: 'DOCX', size: '320 KB', updatedAt: '2024-01-19', parentId: '5' },
];

export const getFileIcon = (fileType?: string) => {
  switch (fileType?.toUpperCase()) {
    case 'PDF': return FileTextIcon;
    case 'PNG':
    case 'JPG':
    case 'JPEG': return ImageIcon;
    case 'DOCX':
    case 'DOC': return FileTextIcon;
    case 'XLSX':
    case 'CSV': return FileCodeIcon;
    case 'ZIP': return ArchiveIcon;
    default: return FileIcon;
  }
};
