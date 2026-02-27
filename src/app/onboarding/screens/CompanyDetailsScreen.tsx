'use client';

import { useState, useEffect } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { PersonCard } from '@/components/onboarding/PersonCard';
import { InfoBox } from '@/components/onboarding/InfoBox';
import { 
  CompanyType, 
  ExistingCompanyDetails, 
  NewCompanyDetails, 
  Person,
  AddressOption,
  ServiceToggleOption
} from '@/interfaces';
import { saveOnboardingStep, createCompany } from '@/api/onboardingService';

interface CompanyDetailsScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack: () => void;
}

export default function CompanyDetailsScreen({ onComplete, onSaveExit, onBack }: CompanyDetailsScreenProps) {
  const [companyType, setCompanyType] = useState<CompanyType | undefined>(undefined);
  const [directorError, setDirectorError] = useState<string>('');
  const [shareholderError, setShareholderError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [existingDetails, setExistingDetails] = useState<ExistingCompanyDetails & {
    directors: { option: ServiceToggleOption; persons?: Person[] };
    shareholders: Person[];
    companySecretary: { option: ServiceToggleOption; person?: Person };
    judicialRepresentative: { option: ServiceToggleOption; person?: Person };
  }>({
    companyName: '',
    registrationNumber: '',
    countryOfIncorporation: '',
    vatNumber: '',
    businessActivity: '',
    registeredAddress: '',
    legalType: 'LTD',
    authorizedShares: 1000,
    issuedShares: 1000,
    companyStartDate: new Date().toISOString().split('T')[0], // Today's date as default
    industry: [],
    summary: '',
    directors: {
      option: 'own' as ServiceToggleOption,
      persons: [],
    },
    shareholders: [],
    companySecretary: {
      option: 'own' as ServiceToggleOption,
    },
    judicialRepresentative: {
      option: 'own' as ServiceToggleOption,
    },
  });

  const [newDetails, setNewDetails] = useState<NewCompanyDetails>({
    proposedNames: {
      name1: '',
      name2: '',
      name3: '',
    },
    registrationNumber: '',
    registeredAddress: {
      option: 'have' as AddressOption,
      address: '',
    },
    legalType: 'LTD',
    authorizedShares: 1000,
    industry: [],
    summary: '',
    expectedStartDate: '',
    directors: {
      option: 'own' as ServiceToggleOption,
      persons: [],
    },
    shareholders: [],
    companySecretary: {
      option: 'own' as ServiceToggleOption,
    },
    judicialRepresentative: {
      option: 'own' as ServiceToggleOption,
    },
  });

  useEffect(() => {
    // Load saved data if available
    const saved = localStorage.getItem('onboarding-data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.companyType) {
          setCompanyType(data.companyType);
        } else {
          // If no company type is saved, redirect to step 1
          onBack();
          return;
        }
        if (data.existingCompanyDetails && data.companyType === 'existing') {
          setExistingDetails(prev => ({ ...prev, ...data.existingCompanyDetails }));
        }
        if (data.newCompanyDetails && data.companyType === 'new') {
          setNewDetails(prev => ({ 
            ...prev, 
            ...data.newCompanyDetails,
            proposedNames: { ...prev.proposedNames, ...data.newCompanyDetails.proposedNames }
          }));
        }
      } catch (error) {
        console.error('Failed to parse saved onboarding data:', error);
        // On error, redirect to step 1
        onBack();
      }
    } else {
      // No saved data, redirect to step 1
      onBack();
    }
  }, [onBack]);

  const handleContinue = async () => {
    // Validate companyType is set
    if (!companyType) {
      alert('Please select a company type first. Go back to step 1.');
      return;
    }

    // Validate common required fields
    if (companyType === 'existing') {
      if (!existingDetails.companyName.trim()) {
        alert('Company name is required.');
        return;
      }
      if (!existingDetails.registrationNumber.trim()) {
        alert('Registration number is required.');
        return;
      }
      if (!existingDetails.registeredAddress.trim()) {
        alert('Registered address is required.');
        return;
      }
    }

    if (companyType === 'new') {
      if (!(newDetails.proposedNames?.name1 || '').trim()) {
        alert('Company name is required.');
        return;
      }
      if (!(newDetails.registrationNumber || '').trim()) {
        alert('Registration number is required.');
        return;
      }
      if (!newDetails.registeredAddress.address?.trim()) {
        alert('Registered address is required.');
        return;
      }
    }
    
    // Clear any previous errors if validation passes
    setDirectorError('');
    setShareholderError('');

    setLoading(true);
    try {
      // Get clientId from localStorage (created in Step 1)
      const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      const clientId = onboardingData.clientId;

      // Prepare company data for backend
      let companyPayload: any = {};

      if (companyType === 'existing') {
        // Map existing company details to backend schema
        // PATH A: Existing Company → Came for Incorporation Service
        // According to new workflow: incorporationStatus = false (needs incorporation service)
        const startDate = new Date(existingDetails.companyStartDate);
        
        // Map directors, shareholders, etc. to involvementDetails
        let involvementDetails: any[] = [];

        // Add directors if option is 'own'
        if (existingDetails.directors.option === 'own' && existingDetails.directors.persons) {
          existingDetails.directors.persons.forEach((person) => {
            if (person.fullName.trim() && person.address?.trim() && person.nationality?.trim()) {
              involvementDetails.push({
                personName: person.fullName.trim(),
                personAddress: person.address.trim(),
                personNationality: person.nationality.trim(),
                role: ['DIRECTOR'] as const,
                ordinary: 0,
              });
            }
          });
        }

        // Add shareholders
        if (existingDetails.shareholders && existingDetails.shareholders.length > 0) {
          existingDetails.shareholders.forEach((person) => {
            if (person.fullName.trim() && person.address?.trim() && person.nationality?.trim()) {
              involvementDetails.push({
                personName: person.fullName.trim(),
                personAddress: person.address.trim(),
                personNationality: person.nationality.trim(),
                role: ['SHAREHOLDER'] as const,
                ordinary: 0,
              });
            }
          });
        }

        // Add company secretary if option is 'own'
        if (existingDetails.companySecretary.option === 'own') {
          // Get user information from onboarding data
          const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
          const userFirstName = onboardingData.firstName || '';
          const userLastName = onboardingData.lastName || '';
          const userFullName = `${userFirstName} ${userLastName}`.trim();
          
          let secretaryAdded = false;
          
          if (existingDetails.companySecretary.person) {
            const secretary = existingDetails.companySecretary.person;
            if (secretary.fullName?.trim() && secretary.address?.trim() && secretary.nationality?.trim()) {
              involvementDetails.push({
                personName: secretary.fullName.trim(),
                personAddress: secretary.address.trim(),
                personNationality: secretary.nationality.trim(),
                role: ['SECRETARY'] as const,
                ordinary: 0,
              });
              secretaryAdded = true;
            }
          }
          
          // If person not provided or incomplete, use user information
          if (!secretaryAdded) {
            const userAddress = existingDetails.registeredAddress || '';
            const userNationality = onboardingData.nationality || 'Unknown';
            
            if (userFullName && userAddress.trim()) {
              involvementDetails.push({
                personName: userFullName,
                personAddress: userAddress.trim(),
                personNationality: userNationality.trim(),
                role: ['SECRETARY'] as const,
                ordinary: 0,
              });
              secretaryAdded = true;
            }
          }
        }

        // Add judicial representative if option is 'own' (default is 'own')
        const judicialRepOption = existingDetails.judicialRepresentative?.option || 'own'; // Default to 'own' if undefined
        
        if (judicialRepOption === 'own') {
          // Get user information from onboarding data
          const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
          const userFirstName = onboardingData.firstName || '';
          const userLastName = onboardingData.lastName || '';
          const userEmail = onboardingData.email || '';
          const userFullName = `${userFirstName} ${userLastName}`.trim();
          
          let judicialRepAdded = false;
          
          if (existingDetails.judicialRepresentative.person) {
            const rep = existingDetails.judicialRepresentative.person;
            if (rep.fullName?.trim() && rep.address?.trim() && rep.nationality?.trim()) {
              involvementDetails.push({
                personName: rep.fullName.trim(),
                personAddress: rep.address.trim(),
                personNationality: rep.nationality.trim(),
                role: ['JUDICIAL_REPRESENTATIVE'] as const,
                ordinary: 0,
              });
              judicialRepAdded = true;
            }
          }
          
          // If person not provided or incomplete, use user information
          if (!judicialRepAdded) {
            // Use user information if person not provided
            const userAddress = existingDetails.registeredAddress || '';
            const userNationality = onboardingData.nationality || 'Unknown';
            
            // Always add judicial representative - use user info if available, otherwise use company address
            // Backend requires address, so use registered address or a placeholder
            const finalName = userFullName || 'Judicial Representative';
            const finalAddress = userAddress.trim() || 'Address to be provided';
            const finalNationality = userNationality.trim() || 'Unknown';
            
            involvementDetails.push({
              personName: finalName,
              personAddress: finalAddress,
              personNationality: finalNationality,
              role: ['JUDICIAL_REPRESENTATIVE'] as const,
              ordinary: 0,
            });
            judicialRepAdded = true;
          }
        }

        // Merge duplicate persons - combine their roles into a single involvement
        // This is necessary because the backend skips creating a new involvement if one already exists for the same person
        // IMPORTANT: Do this BEFORE creating companyPayload so the merged data is used
        const mergedInvolvements = new Map<string, typeof involvementDetails[0]>();
        for (const inv of involvementDetails) {
          // Normalize the key to handle case sensitivity and whitespace differences
          const normalizedName = inv.personName.trim().toLowerCase();
          const normalizedAddress = inv.personAddress.trim().toLowerCase();
          const normalizedNationality = inv.personNationality.trim().toLowerCase();
          const key = `${normalizedName}|${normalizedAddress}|${normalizedNationality}`;
          
          if (mergedInvolvements.has(key)) {
            const existing = mergedInvolvements.get(key)!;
            // Merge roles - combine arrays and remove duplicates
            const combinedRoles = [...new Set([...existing.role, ...inv.role])];
            existing.role = combinedRoles as typeof existing.role;
          } else {
            mergedInvolvements.set(key, { ...inv });
          }
        }
        involvementDetails = Array.from(mergedInvolvements.values());

        companyPayload = {
          name: existingDetails.companyName,
          registrationNumber: existingDetails.registrationNumber || `TEMP-${Date.now()}`, // Temporary if not provided
          address: existingDetails.registeredAddress,
          companyType: 'PRIMARY' as const,
          legalType: existingDetails.legalType,
          summary: existingDetails.summary || existingDetails.businessActivity || undefined,
          industry: existingDetails.industry || [],
          authorizedShares: existingDetails.authorizedShares,
          issuedShares: existingDetails.issuedShares || 0, // May start at 0 for incorporation service
          companyStartDate: startDate.toISOString(),
          clientId: clientId || undefined,
          incorporationStatus: true, // PATH A: Already incorporated
          involvementDetails: involvementDetails.length > 0 ? involvementDetails : undefined,
        };
      } else {
        // Map new company details to backend schema
        // Use first proposed name as the company name
        const companyName = newDetails.proposedNames.name1.trim();
        // PATH B: New Company Profile - no registration number needed (will be assigned during incorporation)
        const registrationNumber = `TEMP-${Date.now()}`; // Temporary number assigned
        const startDate = newDetails.expectedStartDate 
          ? new Date(newDetails.expectedStartDate)
          : new Date(); // Use expected date or current date

        // Map directors, shareholders, etc. to involvementDetails
        let involvementDetails: any[] = [];

        // Add directors if option is 'own'
        // According to API spec: role should be an array
        if (newDetails.directors.option === 'own' && newDetails.directors.persons) {
          newDetails.directors.persons.forEach((person) => {
            if (person.fullName.trim() && person.address?.trim() && person.nationality?.trim()) {
              involvementDetails.push({
                personName: person.fullName.trim(),
                personAddress: person.address.trim(),
                personNationality: person.nationality.trim(),
                role: ['DIRECTOR'] as const, // Array of roles as per API spec
                ordinary: 0, // Default to 0, can be calculated from shares if needed
              });
            }
          });
        }

        // Add shareholders
        // According to API spec: role should be an array
        if (newDetails.shareholders && newDetails.shareholders.length > 0) {
          newDetails.shareholders.forEach((person) => {
            if (person.fullName.trim() && person.address?.trim() && person.nationality?.trim()) {
              involvementDetails.push({
                personName: person.fullName.trim(),
                personAddress: person.address.trim(),
                personNationality: person.nationality.trim(),
                role: ['SHAREHOLDER'] as const, // Array of roles as per API spec
                ordinary: 0, // Can be calculated from ownershipPercent if needed
              });
            }
          });
        }

        // Add company secretary if option is 'own'
        // According to API spec: role should be an array
        if (newDetails.companySecretary.option === 'own') {
          // Get user information from onboarding data
          const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
          const userFirstName = onboardingData.firstName || '';
          const userLastName = onboardingData.lastName || '';
          const userEmail = onboardingData.email || '';
          const userFullName = `${userFirstName} ${userLastName}`.trim();
          
          if (newDetails.companySecretary.person) {
            const secretary = newDetails.companySecretary.person;
            if (secretary.fullName?.trim() && secretary.address?.trim() && secretary.nationality?.trim()) {
              involvementDetails.push({
                personName: secretary.fullName.trim(),
                personAddress: secretary.address.trim(),
                personNationality: secretary.nationality.trim(),
                role: ['SECRETARY'] as const, // Array of roles as per API spec
                ordinary: 0,
              });
            }
          } else if (userFullName) {
            // Use user information if person not provided
            const userAddress = newDetails.registeredAddress.address || '';
            const userNationality = onboardingData.nationality || 'Unknown';
            
            if (userAddress.trim()) {
              involvementDetails.push({
                personName: userFullName,
                personAddress: userAddress.trim(),
                personNationality: userNationality.trim(),
                role: ['SECRETARY'] as const, // Array of roles as per API spec
                ordinary: 0,
              });
            }
          }
        }

        // Add judicial representative if option is 'own' (default is 'own')
        // According to API spec: role should be an array
        const judicialRepOption = newDetails.judicialRepresentative?.option || 'own'; // Default to 'own' if undefined
        
        if (judicialRepOption === 'own') {
          // Get user information from onboarding data
          const onboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
          const userFirstName = onboardingData.firstName || '';
          const userLastName = onboardingData.lastName || '';
          const userEmail = onboardingData.email || '';
          const userFullName = `${userFirstName} ${userLastName}`.trim();
          
          let judicialRepAdded = false;
          
          if (newDetails.judicialRepresentative.person) {
            const rep = newDetails.judicialRepresentative.person;
            if (rep.fullName?.trim() && rep.address?.trim() && rep.nationality?.trim()) {
              involvementDetails.push({
                personName: rep.fullName.trim(),
                personAddress: rep.address.trim(),
                personNationality: rep.nationality.trim(),
                role: ['JUDICIAL_REPRESENTATIVE'] as const, // Array of roles as per API spec
                ordinary: 0,
              });
              judicialRepAdded = true;
            }
          }
          
          // If person not provided or incomplete, use user information
          if (!judicialRepAdded) {
            // Use user information if person not provided
            const userAddress = newDetails.registeredAddress.address || '';
            const userNationality = onboardingData.nationality || 'Unknown';
            
            // Always add judicial representative - use user info if available, otherwise use company address
            // Backend requires address, so use registered address or a placeholder
            const finalName = userFullName || 'Judicial Representative';
            const finalAddress = userAddress.trim() || newDetails.registeredAddress.address || 'Address to be provided';
            const finalNationality = userNationality.trim() || 'Unknown';
            
            involvementDetails.push({
              personName: finalName,
              personAddress: finalAddress,
              personNationality: finalNationality,
              role: ['JUDICIAL_REPRESENTATIVE'] as const, // Array of roles as per API spec
              ordinary: 0,
            });
            judicialRepAdded = true;
          }
        }

        // Merge duplicate persons - combine their roles into a single involvement
        // This is necessary because the backend skips creating a new involvement if one already exists for the same person
        // IMPORTANT: Do this BEFORE creating companyPayload so the merged data is used
        const mergedInvolvements = new Map<string, typeof involvementDetails[0]>();
        for (const inv of involvementDetails) {
          // Normalize the key to handle case sensitivity and whitespace differences
          const normalizedName = inv.personName.trim().toLowerCase();
          const normalizedAddress = inv.personAddress.trim().toLowerCase();
          const normalizedNationality = inv.personNationality.trim().toLowerCase();
          const key = `${normalizedName}|${normalizedAddress}|${normalizedNationality}`;
          
          if (mergedInvolvements.has(key)) {
            const existing = mergedInvolvements.get(key)!;
            // Merge roles - combine arrays and remove duplicates
            const combinedRoles = [...new Set([...existing.role, ...inv.role])];
            existing.role = combinedRoles as typeof existing.role;
          } else {
            mergedInvolvements.set(key, { ...inv });
          }
        }
        involvementDetails = Array.from(mergedInvolvements.values());

        companyPayload = {
          name: companyName,
          registrationNumber: registrationNumber,
          address: newDetails.registeredAddress.address,
          companyType: 'PRIMARY' as const,
          legalType: newDetails.legalType,
          summary: newDetails.summary || undefined,
          industry: newDetails.industry || [],
          authorizedShares: newDetails.authorizedShares,
          issuedShares: 0, // For new companies, issued shares start at 0
          companyStartDate: startDate.toISOString(),
          clientId: clientId || undefined,
          incorporationStatus: false, // PATH B: Needs incorporation service
          involvementDetails: involvementDetails.length > 0 ? involvementDetails : undefined,
        };
      }

      // Create Company record at backend (Step 3) - REQUIRED, don't proceed on error
      try {
        const existingOnboardingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
        let companyId = existingOnboardingData.companyId;
        let incorporationStatus = existingOnboardingData.incorporationStatus;
        let kycStatus = existingOnboardingData.kycStatus;

        // CRITICAL: Only create company if it doesn't already exist in localStorage
        // This prevents creating duplicate companies when user clicks back and then continue again
        if (!companyId) {
          const companyResult = await createCompany(companyPayload);
          companyId = companyResult.id;
          incorporationStatus = companyResult.incorporationStatus;
          kycStatus = companyResult.kycStatus;
        } else {
          console.log('Company already exists, skipping creation:', companyId);
        }
        
        // Save company ID and incorporationStatus to localStorage
        localStorage.setItem('onboarding-data', JSON.stringify({
          ...existingOnboardingData,
          companyType,
          companyId,
          incorporationStatus, // true if already incorporated, false if needs incorporation
          kycStatus, // false initially
          existingCompanyDetails: companyType === 'existing' ? existingDetails : undefined,
          newCompanyDetails: companyType === 'new' ? newDetails : undefined,
        }));

        // IMPORTANT: Sync with Global Dashboard Context by setting active company
        if (companyId) {
          localStorage.setItem('vacei-active-company', companyId);
        }
      } catch (error: any) {
        // CRITICAL: If backend creation fails, DO NOT allow continuation
        console.error('Failed to create company at backend:', error);
        const errorMessage = error.message || 'Failed to create company. Please try again.';
        
        // Show error and block navigation
        alert(`Failed to create company: ${errorMessage}\n\nPlease check your connection and try again.`);
        setLoading(false);
        return; // Block navigation - user must fix the error
      }

      // Save step progress (404 is expected if endpoint doesn't exist, but don't block)
      const data = companyType === 'existing' 
        ? { existingCompanyDetails: existingDetails }
        : { newCompanyDetails: newDetails };
      
      try {
      await saveOnboardingStep(3, {
          companyType: companyType,
        ...data,
      });
      } catch (stepError: any) {
        // 404 is expected - endpoint might not exist, just log it
        if (stepError.message?.includes('404') || stepError.message?.includes('BACKEND_NOT_AVAILABLE')) {
          console.warn('Step progress save failed (expected if endpoint not implemented):', stepError.message);
        } else {
          console.error('Step progress save failed:', stepError);
        }
      }
      
      // Save to localStorage as backup - preserve existing data
      const existingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
      localStorage.setItem('onboarding-data', JSON.stringify({
        ...existingData,
        companyType,
        existingCompanyDetails: companyType === 'existing' ? existingDetails : undefined,
        newCompanyDetails: companyType === 'new' ? newDetails : undefined,
      }));
      
      onComplete();
    } catch (error) {
      console.error('Failed to save step:', error);
      alert('Failed to save. Please try again.');
      setLoading(false);
    }
  };

  const addDirector = () => {
    setDirectorError(''); // Clear error when adding a director
    setNewDetails(prev => ({
      ...prev,
      directors: {
        ...prev.directors,
        persons: [...(prev.directors.persons || []), { fullName: '', email: '', address: '', nationality: '' }],
      },
    }));
  };

  const updateDirector = (index: number, field: keyof Person, value: string | number) => {
    setDirectorError(''); // Clear error when updating a director
    setNewDetails(prev => ({
      ...prev,
      directors: {
        ...prev.directors,
        persons: prev.directors.persons?.map((p, i) => 
          i === index ? { ...p, [field]: value } : p
        ) || [],
      },
    }));
  };

  const removeDirector = (index: number) => {
    setNewDetails(prev => ({
      ...prev,
      directors: {
        ...prev.directors,
        persons: prev.directors.persons?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const addShareholder = () => {
    setShareholderError(''); // Clear error when adding a shareholder
    setNewDetails(prev => ({
      ...prev,
      shareholders: [...prev.shareholders, { fullName: '', email: '', address: '', nationality: '', ownershipPercent: 0 }],
    }));
  };

  const updateShareholder = (index: number, field: keyof Person, value: string | number) => {
    setShareholderError(''); // Clear error when updating a shareholder
    setNewDetails(prev => ({
      ...prev,
      shareholders: prev.shareholders.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const removeShareholder = (index: number) => {
    setNewDetails(prev => ({
      ...prev,
      shareholders: prev.shareholders.filter((_, i) => i !== index),
    }));
  };

  // Helper functions for existing company people/roles
  const addExistingDirector = () => {
    setDirectorError(''); // Clear error when adding a director
    setExistingDetails(prev => ({
      ...prev,
      directors: {
        ...prev.directors,
        persons: [...(prev.directors.persons || []), { fullName: '', email: '', address: '', nationality: '' }],
      },
    }));
  };

  const updateExistingDirector = (index: number, field: keyof Person, value: string | number) => {
    setDirectorError(''); // Clear error when updating a director
    setExistingDetails(prev => ({
      ...prev,
      directors: {
        ...prev.directors,
        persons: prev.directors.persons?.map((p, i) => 
          i === index ? { ...p, [field]: value } : p
        ) || [],
      },
    }));
  };

  const removeExistingDirector = (index: number) => {
    setExistingDetails(prev => ({
      ...prev,
      directors: {
        ...prev.directors,
        persons: prev.directors.persons?.filter((_, i) => i !== index) || [],
      },
    }));
  };

  const addExistingShareholder = () => {
    setShareholderError(''); // Clear error when adding a shareholder
    setExistingDetails(prev => ({
      ...prev,
      shareholders: [...prev.shareholders, { fullName: '', email: '', address: '', nationality: '', ownershipPercent: 0 }],
    }));
  };

  const updateExistingShareholder = (index: number, field: keyof Person, value: string | number) => {
    setShareholderError(''); // Clear error when updating a shareholder
    setExistingDetails(prev => ({
      ...prev,
      shareholders: prev.shareholders.map((p, i) => 
        i === index ? { ...p, [field]: value } : p
      ),
    }));
  };

  const removeExistingShareholder = (index: number) => {
    setExistingDetails(prev => ({
      ...prev,
      shareholders: prev.shareholders.filter((_, i) => i !== index),
    }));
  };

  return (
    <OnboardingLayout
      currentStep={3}
      totalSteps={4}
      onContinue={handleContinue}
      onSaveExit={onSaveExit}
      onBack={onBack}
      continueLabel={loading ? 'Creating company...' : 'Continue'}
      disabled={loading}
    >
      {!companyType ? (
        <div>Loading...</div>
      ) : (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Company details</h1>
          <p className="text-sm text-muted-foreground">Please provide the details for your company registration.</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Company name *</label>
            <Input
              value={companyType === 'existing' ? existingDetails.companyName : (newDetails.proposedNames?.name1 || '')}
              onChange={(e) => {
                if (companyType === 'existing') {
                  setExistingDetails(prev => ({ ...prev, companyName: e.target.value }));
                } else {
                  setNewDetails(prev => ({
                    ...prev,
                    proposedNames: { ...(prev.proposedNames || { name1: '', name2: '', name3: '' }), name1: e.target.value }
                  }));
                }
              }}
              placeholder="e.g., ACME LTD"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Registration number *</label>
            <Input
              value={companyType === 'existing' ? existingDetails.registrationNumber : (newDetails.registrationNumber || '')}
              onChange={(e) => {
                if (companyType === 'existing') {
                  setExistingDetails(prev => ({ ...prev, registrationNumber: e.target.value }));
                } else {
                  setNewDetails(prev => ({ ...prev, registrationNumber: e.target.value || '' }));
                }
              }}
              placeholder="e.g., C12345"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Registered address *</label>
            <Textarea
              value={companyType === 'existing' ? existingDetails.registeredAddress : newDetails.registeredAddress.address}
              onChange={(e) => {
                if (companyType === 'existing') {
                  setExistingDetails(prev => ({ ...prev, registeredAddress: e.target.value }));
                } else {
                  setNewDetails(prev => ({
                    ...prev,
                    registeredAddress: { ...prev.registeredAddress, address: e.target.value }
                  }));
                }
              }}
              placeholder="Enter full registered address"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Industry (optional)</label>
            <Input
              value={companyType === 'existing' ? (existingDetails.industry?.join(', ') || '') : (newDetails.industry?.join(', ') || '')}
              onChange={(e) => {
                const industries = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                if (companyType === 'existing') {
                  setExistingDetails(prev => ({ ...prev, industry: industries }));
                } else {
                  setNewDetails(prev => ({ ...prev, industry: industries }));
                }
              }}
              placeholder="e.g., Technology, Finance (comma-separated)"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Description (optional)</label>
            <Textarea
              value={companyType === 'existing' ? (existingDetails.summary || '') : (newDetails.summary || '')}
              onChange={(e) => {
                if (companyType === 'existing') {
                  setExistingDetails(prev => ({ ...prev, summary: e.target.value }));
                } else {
                  setNewDetails(prev => ({ ...prev, summary: e.target.value }));
                }
              }}
              placeholder="Brief description of the company business"
              rows={4}
            />
          </div>
        </div>
      </div>
      )}
    </OnboardingLayout>
  );
}

