// Payroll Compliance Integration Utility
// Transforms payroll submissions into compliance calendar items

type SubmissionStatus = "pending" | "submitted";
type ComplianceStatus = "Waiting on you" | "In progress" | "Due soon" | "Completed" | "Overdue";

export interface PayrollSubmission {
  name: string;
  status: SubmissionStatus;
  due_date?: string;
}

export interface ComplianceItem {
  id: number;
  obligationName: string;
  dueDate: string;
  service: "Payroll";
  status: ComplianceStatus;
  actionType: "view";
  relatedServiceId?: number;
}

// Mock function to fetch payroll data
export async function fetchPayrollData(): Promise<{ submissions: PayrollSubmission[] } | null> {
  // In a real implementation, this would fetch from an API
  // For now, return mock data matching the payroll page structure
  return {
    submissions: [
      { name: "Payroll Submission (FS5)", status: "pending", due_date: "2025-08-15" },
      { name: "Social Security Contributions", status: "pending", due_date: "2025-08-10" },
    ],
  };
}

// Transform payroll submissions to compliance items
export function transformPayrollSubmissionsToComplianceItems(
  payrollData: { submissions: PayrollSubmission[] },
  startId: number = 1000000
): ComplianceItem[] {
  const now = new Date();
  const items: ComplianceItem[] = [];
  let idCounter = startId;
  
  payrollData.submissions.forEach((submission) => {
    if (!submission.due_date) {
      return; // Skip submissions without due_date
    }
    
    const dueDate = new Date(submission.due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: ComplianceStatus;
    if (submission.status === "submitted") {
      status = "Completed";
    } else if (daysUntilDue < 0) {
      status = "Overdue";
    } else if (daysUntilDue <= 7) {
      status = "Due soon";
    } else {
      status = "Waiting on you";
    }
    
    items.push({
      id: idCounter++,
      obligationName: submission.name,
      dueDate: submission.due_date,
      service: "Payroll",
      status,
      actionType: "view",
      relatedServiceId: idCounter - 1,
    });
  });
  
  return items;
}

