/**
 * CSP Renewal Utilities
 * Handles automatic renewal logic, status calculation, and billing triggers
 */

export type CSPStatus = "active" | "expiring_soon" | "expired" | "not_active";

export interface CSPService {
  id: string;
  company_id: string;
  service_type: string;
  service_name: string;
  status: CSPStatus;
  start_date: string;
  expiry_date: string;
  renewal_cycle: "annual" | "monthly" | "quarterly";
  renewal_price: number;
  auto_renew: boolean;
  billing_item_id?: string;
  last_renewed_at?: string;
  assigned_party: string;
  description?: string;
}

export interface RenewalTriggerDates {
  markExpiringSoon: Date; // 60 days before expiry
  showOnDashboard: Date; // 60 days before expiry
  showOnCSPPage: Date; // 60 days before expiry
  generateInvoice: Date; // 45 days before expiry
  notifyClient: Date; // 30 days before expiry
  expiryDate: Date;
}

/**
 * Calculate renewal trigger dates based on expiry date
 */
export function calculateRenewalTriggers(expiryDate: string): RenewalTriggerDates {
  const expiry = new Date(expiryDate);
  
  return {
    markExpiringSoon: new Date(expiry.getTime() - 60 * 24 * 60 * 60 * 1000),
    showOnDashboard: new Date(expiry.getTime() - 60 * 24 * 60 * 60 * 1000),
    showOnCSPPage: new Date(expiry.getTime() - 60 * 24 * 60 * 60 * 1000),
    generateInvoice: new Date(expiry.getTime() - 45 * 24 * 60 * 60 * 1000),
    notifyClient: new Date(expiry.getTime() - 30 * 24 * 60 * 60 * 1000),
    expiryDate: expiry
  };
}

/**
 * Determine current status of a CSP service based on dates
 */
export function calculateCSPStatus(service: CSPService): CSPStatus {
  if (!service.expiry_date) {
    return "not_active";
  }

  const now = new Date();
  const expiry = new Date(service.expiry_date);
  const triggers = calculateRenewalTriggers(service.expiry_date);

  // Check if expired
  if (now > expiry) {
    return "expired";
  }

  // Check if expiring soon (60 days before expiry)
  if (now >= triggers.markExpiringSoon) {
    return "expiring_soon";
  }

  // Check if active
  if (service.start_date && new Date(service.start_date) <= now && now < expiry) {
    return "active";
  }

  return "not_active";
}

/**
 * Check if service should appear on dashboard
 */
export function shouldShowOnDashboard(service: CSPService): boolean {
  if (!service.expiry_date) return false;
  
  const status = calculateCSPStatus(service);
  return status === "expiring_soon" || status === "expired";
}

/**
 * Check if invoice should be generated
 */
export function shouldGenerateInvoice(service: CSPService): boolean {
  if (!service.expiry_date) return false;
  
  const now = new Date();
  const triggers = calculateRenewalTriggers(service.expiry_date);
  
  return now >= triggers.generateInvoice && now < triggers.expiryDate;
}

/**
 * Check if client should be notified
 */
export function shouldNotifyClient(service: CSPService): boolean {
  if (!service.expiry_date) return false;
  
  const now = new Date();
  const triggers = calculateRenewalTriggers(service.expiry_date);
  
  return now >= triggers.notifyClient && now < triggers.expiryDate;
}

/**
 * Calculate next renewal period dates
 */
export function calculateNextRenewalPeriod(
  currentExpiry: string,
  renewalCycle: "annual" | "monthly" | "quarterly"
): { start_date: string; expiry_date: string } {
  const currentExpiryDate = new Date(currentExpiry);
  let startDate = new Date(currentExpiryDate);
  startDate.setDate(startDate.getDate() + 1); // Start day after expiry
  
  let expiryDate = new Date(startDate);
  
  switch (renewalCycle) {
    case "annual":
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      expiryDate.setDate(expiryDate.getDate() - 1); // Day before next year
      break;
    case "monthly":
      expiryDate.setMonth(expiryDate.getMonth() + 1);
      expiryDate.setDate(expiryDate.getDate() - 1);
      break;
    case "quarterly":
      expiryDate.setMonth(expiryDate.getMonth() + 3);
      expiryDate.setDate(expiryDate.getDate() - 1);
      break;
  }
  
  return {
    start_date: startDate.toISOString().split('T')[0],
    expiry_date: expiryDate.toISOString().split('T')[0]
  };
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Format date short (DD MMM YYYY)
 */
export function formatDateShort(dateString: string): string {
  if (!dateString) return "—";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

