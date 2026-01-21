'use client';

import { useState, useEffect } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { ServiceCard } from '@/components/onboarding/ServiceCard';
import { Card } from '@/components/ui/card2';
import { Input } from '@/components/ui/input';
import { Service } from '@/interfaces';
import { saveOnboardingStep } from '@/api/onboardingService';

interface ServicesSelectionScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack: () => void;
}

const AVAILABLE_SERVICES: Omit<Service, 'selected'>[] = [
  { id: 'accounting', name: 'Accounting & Bookkeeping', description: 'Complete accounting and bookkeeping services' },
  { id: 'vat', name: 'VAT Returns', description: 'VAT return filing and compliance' },
  { id: 'audit', name: 'Audit', description: 'Annual audit services' },
  { id: 'payroll', name: 'Payroll', description: 'Payroll processing and management' },
  { id: 'directorship', name: 'Directorship service', description: 'Professional directorship services' },
  { id: 'secretary', name: 'Company Secretary', description: 'Company secretarial services' },
  { id: 'address', name: 'Registered Address', description: 'Registered office address service' },
  { id: 'tax', name: 'Tax Advisory', description: 'Tax planning and advisory services' },
];

export default function ServicesSelectionScreen({ onComplete, onSaveExit, onBack }: ServicesSelectionScreenProps) {
  const [services, setServices] = useState<Service[]>(
    AVAILABLE_SERVICES.map(s => ({ ...s, selected: false }))
  );
  const [showPricing, setShowPricing] = useState(false);
  const [monthlyTransactions, setMonthlyTransactions] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');

  useEffect(() => {
    // Load saved data
    const saved = localStorage.getItem('onboarding-data');
    if (saved) {
      const data = JSON.parse(saved);
      if (data.selectedServices) {
        setServices(prev => prev.map(s => ({
          ...s,
          selected: data.selectedServices.includes(s.id)
        })));
      }
      if (data.pricingInfo) {
        setMonthlyTransactions(data.pricingInfo.monthlyTransactions || '');
        setEmployeeCount(data.pricingInfo.employeeCount || '');
        if (data.pricingInfo.monthlyTransactions || data.pricingInfo.employeeCount) {
          setShowPricing(true);
        }
      }
    }
  }, []);

  const handleToggleService = (id: string) => {
    setServices(prev => prev.map(s => 
      s.id === id ? { ...s, selected: !s.selected } : s
    ));
  };

  const handleContinue = async () => {
    const selectedServiceIds = services.filter(s => s.selected).map(s => s.id);
    
    if (selectedServiceIds.length === 0) {
      alert('Please select at least one service.');
      return;
    }

    try {
      const pricingInfo = showPricing && (monthlyTransactions || employeeCount) ? {
        monthlyTransactions,
        employeeCount,
      } : undefined;

      await saveOnboardingStep(3, {
        selectedServices: selectedServiceIds,
        pricingInfo,
      });

      // Save to localStorage
      const saved = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      localStorage.setItem('onboarding-data', JSON.stringify({
        ...saved,
        selectedServices: selectedServiceIds,
        pricingInfo,
      }));

      onComplete();
    } catch (error) {
      console.error('Failed to save step:', error);
      alert('Failed to save. Please try again.');
    }
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={7}
      onContinue={handleContinue}
      onSaveExit={onSaveExit}
      onBack={onBack}
      continueLabel="Continue"
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Select the services you need</h1>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map(service => (
            <ServiceCard
              key={service.id}
              {...service}
              onToggle={handleToggleService}
            />
          ))}
        </div>

        {/* Pricing Section */}
        <Card className="p-4">
          <button
            type="button"
            onClick={() => setShowPricing(!showPricing)}
            className="flex items-center justify-between w-full text-left"
          >
            <span className="font-medium">Help us price accurately (optional)</span>
            <span className={`text-sm transition-transform ${showPricing ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showPricing && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Monthly transactions</label>
                <select
                  value={monthlyTransactions}
                  onChange={(e) => setMonthlyTransactions(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Select range</option>
                  <option value="0-50">0-50</option>
                  <option value="51-100">51-100</option>
                  <option value="101-500">101-500</option>
                  <option value="501-1000">501-1000</option>
                  <option value="1000+">1000+</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Employees count</label>
                <Input
                  type="number"
                  value={employeeCount}
                  onChange={(e) => setEmployeeCount(e.target.value)}
                  placeholder="Enter number of employees"
                  min="0"
                />
              </div>
            </div>
          )}
        </Card>
      </div>
    </OnboardingLayout>
  );
}

