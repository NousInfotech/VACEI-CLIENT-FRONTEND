/**
 * CSP Services LocalStorage Management
 * Handles storing and retrieving CSP services from localStorage
 */

import { CSPService, calculateCSPStatus } from "./cspRenewalUtils";

const CSP_SERVICES_KEY = "vacei-csp-services";
const CSP_SERVICES_VERSION = "1.0";

export interface StoredCSPService extends Omit<CSPService, "status"> {
  status?: string; // Will be calculated
}

/**
 * Initialize default CSP services if none exist
 */
export function initializeDefaultCSPServices(companyId: string): CSPService[] {
  const defaultServices: StoredCSPService[] = [
    {
      id: "csp-1",
      company_id: companyId,
      service_type: "registered_office",
      service_name: "Registered Office",
      start_date: "2025-01-01",
      expiry_date: "2025-12-31",
      renewal_cycle: "annual",
      renewal_price: 800,
      auto_renew: true,
      assigned_party: "VACEI Ltd",
      description: "Registered office address for your company"
    },
    {
      id: "csp-2",
      company_id: companyId,
      service_type: "company_secretary",
      service_name: "Company Secretary",
      start_date: "2025-01-01",
      expiry_date: "2025-12-31",
      renewal_cycle: "annual",
      renewal_price: 1200,
      auto_renew: true,
      assigned_party: "VACEI Ltd",
      description: "Company secretary services as required by Maltese law"
    },
    {
      id: "csp-3",
      company_id: companyId,
      service_type: "director_services",
      service_name: "Director Services",
      start_date: "2024-07-01",
      expiry_date: "2025-06-30",
      renewal_cycle: "annual",
      renewal_price: 1500,
      auto_renew: false,
      assigned_party: "VACEI Ltd",
      description: "Director services and support"
    },
    {
      id: "csp-4",
      company_id: companyId,
      service_type: "ubo_maintenance",
      service_name: "Beneficial Ownership (UBO) Maintenance",
      start_date: "",
      expiry_date: "",
      renewal_cycle: "annual",
      renewal_price: 500,
      auto_renew: false,
      assigned_party: "",
      description: "Required to ensure ongoing compliance"
    },
    {
      id: "csp-5",
      company_id: companyId,
      service_type: "statutory_registers",
      service_name: "Statutory Registers Maintenance",
      start_date: "",
      expiry_date: "",
      renewal_cycle: "annual",
      renewal_price: 600,
      auto_renew: false,
      assigned_party: "",
      description: "Recommended for audit and regulatory readiness"
    }
  ];

  // Calculate status for each service
  const servicesWithStatus: CSPService[] = defaultServices.map(service => {
    const serviceWithStatus: CSPService = {
      ...service,
      status: calculateCSPStatus(service as CSPService)
    };
    return serviceWithStatus;
  });

  return servicesWithStatus;
}

/**
 * Get all CSP services for a company
 */
export function getCSPServices(companyId: string): CSPService[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(CSP_SERVICES_KEY);
    if (!stored) {
      // Initialize with default services
      const defaultServices = initializeDefaultCSPServices(companyId);
      saveCSPServices(defaultServices);
      return defaultServices;
    }

    const data = JSON.parse(stored);
    const services: StoredCSPService[] = data.services || [];
    
    // Filter by company and calculate status
    const companyServices = services
      .filter(s => s.company_id === companyId)
      .map(service => {
        const serviceWithStatus: CSPService = {
          ...service,
          status: calculateCSPStatus(service as CSPService)
        };
        return serviceWithStatus;
      });

    return companyServices;
  } catch (error) {
    console.error("Error loading CSP services:", error);
    const defaultServices = initializeDefaultCSPServices(companyId);
    return defaultServices;
  }
}

/**
 * Save CSP services to localStorage
 */
export function saveCSPServices(services: CSPService[]): void {
  if (typeof window === "undefined") return;

  try {
    const data = {
      version: CSP_SERVICES_VERSION,
      services: services.map(({ status, ...service }) => service) // Remove status before saving
    };
    localStorage.setItem(CSP_SERVICES_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving CSP services:", error);
  }
}

/**
 * Get a single CSP service by ID
 */
export function getCSPService(serviceId: string, companyId: string): CSPService | null {
  const services = getCSPServices(companyId);
  return services.find(s => s.id === serviceId) || null;
}

/**
 * Update a CSP service
 */
export function updateCSPService(serviceId: string, updates: Partial<CSPService>, companyId: string): CSPService | null {
  const services = getCSPServices(companyId);
  const index = services.findIndex(s => s.id === serviceId);
  
  if (index === -1) return null;

  const updatedService: CSPService = {
    ...services[index],
    ...updates,
    status: calculateCSPStatus({ ...services[index], ...updates } as CSPService)
  };

  services[index] = updatedService;
  saveCSPServices(services);
  
  return updatedService;
}

/**
 * Add a new CSP service
 */
export function addCSPService(service: Omit<CSPService, "id" | "status">, companyId: string): CSPService {
  const services = getCSPServices(companyId);
  const newService: CSPService = {
    ...service,
    id: `csp-${Date.now()}`,
    status: calculateCSPStatus(service as CSPService)
  };

  services.push(newService);
  saveCSPServices(services);
  
  return newService;
}

/**
 * Renew a CSP service (update expiry date)
 */
export function renewCSPService(
  serviceId: string,
  newStartDate: string,
  newExpiryDate: string,
  companyId: string
): CSPService | null {
  return updateCSPService(
    serviceId,
    {
      start_date: newStartDate,
      expiry_date: newExpiryDate,
      last_renewed_at: new Date().toISOString().split('T')[0]
    },
    companyId
  );
}

