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
          setExistingDetails(data.existingCompanyDetails);
        }
        if (data.newCompanyDetails && data.companyType === 'new') {
          setNewDetails(data.newCompanyDetails);
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

    // Validate existing company required fields
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
      if (!existingDetails.companyStartDate) {
        alert('Company start date is required.');
        return;
      }
      if (existingDetails.authorizedShares <= 0) {
        alert('Authorized shares must be greater than 0.');
        return;
      }
      if (existingDetails.issuedShares < 0) {
        alert('Issued shares cannot be negative.');
        return;
      }
      if (existingDetails.issuedShares > existingDetails.authorizedShares) {
        alert('Issued shares cannot exceed authorized shares.');
        return;
      }
      
      // Validate directors if option is 'own'
      if (existingDetails.directors.option === 'own') {
        // Ensure persons array exists
        if (!existingDetails.directors.persons) {
          existingDetails.directors.persons = [];
        }
        // NOTE: Directors are now optional according to user request
        /*
        if (existingDetails.directors.persons.length === 0) {
          setDirectorError('At least one director is required.');
          return;
        }
        */
        // Validate that provided directors have required fields
        const invalidDirectors = (existingDetails.directors.persons || []).filter(
          p => p.fullName?.trim() && (!p.address?.trim() || !p.nationality?.trim())
        );
        if (invalidDirectors.length > 0) {
          setDirectorError('Provided directors must have full name, address, and nationality.');
          return;
        }
        setDirectorError('');
      }
      
      // NOTE: Shareholders are now optional according to user request
      /*
      if (!existingDetails.shareholders || existingDetails.shareholders.length === 0) {
        setShareholderError('At least one shareholder is required.');
        return;
      }
      */
      
      // Validate provided shareholders have required fields
      const invalidShareholders = (existingDetails.shareholders || []).filter(
        p => p.fullName?.trim() && (!p.address?.trim() || !p.nationality?.trim())
      );
      if (invalidShareholders.length > 0) {
        setShareholderError('Provided shareholders must have full name, address, and nationality.');
        return;
      }
      
      // Clear shareholder error if validation passes
      setShareholderError('');
    }

    // Validate new company required fields
    if (companyType === 'new') {
      if (!newDetails.proposedNames.name1.trim()) {
        alert('At least one proposed company name is required.');
        return;
      }
      // Address is always required (even if service is needed, we need a temporary address)
      if (!newDetails.registeredAddress.address?.trim()) {
        alert('Address is required. If you need an address service, please provide a temporary address for now.');
        return;
      }
      if (newDetails.authorizedShares <= 0) {
        alert('Authorized shares must be greater than 0.');
        return;
      }
      
      // Validate directors if option is 'own'
      if (newDetails.directors.option === 'own') {
        // Ensure persons array exists
        if (!newDetails.directors.persons) {
          newDetails.directors.persons = [];
        }
        // NOTE: Directors are now optional according to user request
        /*
        if (newDetails.directors.persons.length === 0) {
          setDirectorError('At least one director is required.');
          return;
        }
        */
        // Validate that provided directors have required fields
        const invalidDirectors = (newDetails.directors.persons || []).filter(
          p => p.fullName?.trim() && (!p.address?.trim() || !p.nationality?.trim())
        );
        if (invalidDirectors.length > 0) {
          setDirectorError('Provided directors must have full name, address, and nationality.');
          return;
        }
        setDirectorError('');
      }
      
      // NOTE: Shareholders are now optional according to user request
      /*
      if (!newDetails.shareholders || newDetails.shareholders.length === 0) {
        setShareholderError('At least one shareholder is required.');
        return;
      }
      */
      
      // Validate provided shareholders have required fields
      const invalidShareholders = (newDetails.shareholders || []).filter(
        p => p.fullName?.trim() && (!p.address?.trim() || !p.nationality?.trim())
      );
      if (invalidShareholders.length > 0) {
        setShareholderError('Provided shareholders must have full name, address, and nationality.');
        return;
      }
      
      // Clear shareholder error if validation passes
      setShareholderError('');
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
          incorporationStatus: false, // PATH A: Needs incorporation service (intentional)
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
          incorporationStatus: true, // PATH B: New Company Profile - already incorporated (intentional)
          involvementDetails: involvementDetails.length > 0 ? involvementDetails : undefined,
        };
      }

      // Create Company record at backend (Step 3) - REQUIRED, don't proceed on error
      try {
        const companyResult = await createCompany(companyPayload);
        
        // Save company ID and incorporationStatus to localStorage
        const existingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
        localStorage.setItem('onboarding-data', JSON.stringify({
          ...existingData,
          companyType,
          companyId: companyResult.id,
          incorporationStatus: companyResult.incorporationStatus, // true if already incorporated, false if needs incorporation
          kycStatus: companyResult.kycStatus, // false initially
          existingCompanyDetails: companyType === 'existing' ? existingDetails : undefined,
          newCompanyDetails: companyType === 'new' ? newDetails : undefined,
        }));
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
        {companyType === 'existing' ? (
          <>
            <div>
              <h1 className="text-2xl font-semibold mb-2">Company details</h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Company name *</label>
                <Input
                  value={existingDetails.companyName}
                  onChange={(e) => setExistingDetails(prev => ({ ...prev, companyName: e.target.value }))}
                  placeholder="ACME LTD"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Registration number *</label>
                <Input
                  value={existingDetails.registrationNumber}
                  onChange={(e) => setExistingDetails(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  placeholder="C12345"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Country of incorporation *</label>
                <Input
                  value={existingDetails.countryOfIncorporation}
                  onChange={(e) => setExistingDetails(prev => ({ ...prev, countryOfIncorporation: e.target.value }))}
                  placeholder="Malta"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">VAT number (optional)</label>
                <Input
                  value={existingDetails.vatNumber}
                  onChange={(e) => setExistingDetails(prev => ({ ...prev, vatNumber: e.target.value }))}
                  placeholder="MT12345678"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Business activity</label>
                <Textarea
                  value={existingDetails.businessActivity}
                  onChange={(e) => setExistingDetails(prev => ({ ...prev, businessActivity: e.target.value }))}
                  placeholder="Briefly describe what the company does."
                  rows={4}
                />
                <p className="text-xs text-muted-foreground mt-1">Briefly describe what the company does.</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Registered address *</label>
                <Textarea
                  value={existingDetails.registeredAddress}
                  onChange={(e) => setExistingDetails(prev => ({ ...prev, registeredAddress: e.target.value }))}
                  placeholder="Enter registered address"
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Legal entity type *</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={existingDetails.legalType === 'LTD' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExistingDetails(prev => ({ ...prev, legalType: 'LTD' }))}
                  >
                    LTD
                  </Button>
                  <Button
                    type="button"
                    variant={existingDetails.legalType === 'PLC' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExistingDetails(prev => ({ ...prev, legalType: 'PLC' }))}
                  >
                    PLC
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Authorized shares *</label>
                  <Input
                    type="number"
                    value={existingDetails.authorizedShares}
                    onChange={(e) => setExistingDetails(prev => ({ ...prev, authorizedShares: parseInt(e.target.value) || 0 }))}
                    placeholder="1000"
                    min="0"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Issued shares *</label>
                  <Input
                    type="number"
                    value={existingDetails.issuedShares}
                    onChange={(e) => setExistingDetails(prev => ({ ...prev, issuedShares: parseInt(e.target.value) || 0 }))}
                    placeholder="1000"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Company start date (incorporation date) *</label>
                <Input
                  type="date"
                  value={existingDetails.companyStartDate}
                  onChange={(e) => setExistingDetails(prev => ({ ...prev, companyStartDate: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Industry / Business sectors (optional)</label>
                <Input
                  value={existingDetails.industry?.join(', ') || ''}
                  onChange={(e) => {
                    const industries = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    setExistingDetails(prev => ({ ...prev, industry: industries }));
                  }}
                  placeholder="e.g., Technology, Finance, Retail (comma-separated)"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter industry categories separated by commas</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Company summary (optional)</label>
                <Textarea
                  value={existingDetails.summary || ''}
                  onChange={(e) => setExistingDetails(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief summary of the company"
                  rows={3}
                />
              </div>

              {/* Directors */}
              <div>
                <h2 className="text-lg font-medium mb-3">
                  Directors <span className="text-red-500">*</span>
                </h2>
                <div className="flex gap-2 mb-3">
                  <Button
                    type="button"
                    variant={existingDetails.directors.option === 'own' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExistingDetails(prev => ({
                      ...prev,
                      directors: { option: 'own', persons: prev.directors.persons || [] }
                    }))}
                  >
                    ⭕ I will appoint my own director(s)
                  </Button>
                  <Button
                    type="button"
                    variant={existingDetails.directors.option === 'service' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExistingDetails(prev => ({
                      ...prev,
                      directors: { option: 'service' }
                    }))}
                  >
                    ⭕ Provide directorship service
                  </Button>
                </div>
                {existingDetails.directors.option === 'own' ? (
                  <div className="space-y-3">
                    {existingDetails.directors.persons?.map((director, index) => (
                      <PersonCard
                        key={index}
                        person={director}
                        index={index}
                        onChange={updateExistingDirector}
                        onRemove={removeExistingDirector}
                        canRemove={true}
                      />
                    ))}
                    <div className="space-y-2">
                      <Button type="button" variant="outline" size="sm" onClick={addExistingDirector}>
                        {(!existingDetails.directors.persons || existingDetails.directors.persons.length === 0) 
                          ? 'Add director' 
                          : 'Add another director'}
                      </Button>
                      {directorError && (
                        <p className="text-sm text-red-500">{directorError}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <InfoBox>
                    A director will be provided by us. No details required at this stage.
                  </InfoBox>
                )}
              </div>

              {/* Shareholders */}
              <div>
                <h2 className="text-lg font-medium mb-3">
                  Shareholders <span className="text-red-500">*</span>
                </h2>
                <div className="space-y-3">
                  {existingDetails.shareholders.map((shareholder, index) => (
                    <PersonCard
                      key={index}
                      person={shareholder}
                      index={index}
                      showOwnership={true}
                      onChange={updateExistingShareholder}
                      onRemove={removeExistingShareholder}
                      canRemove={true}
                    />
                  ))}
                  <div className="space-y-2">
                    <Button type="button" variant="outline" size="sm" onClick={addExistingShareholder}>
                      {(!existingDetails.shareholders || existingDetails.shareholders.length === 0) 
                        ? 'Add shareholder' 
                        : 'Add another shareholder'}
                    </Button>
                    {shareholderError && (
                      <p className="text-sm text-red-500">{shareholderError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Secretary */}
              <div>
                <h2 className="text-lg font-medium mb-3">Company Secretary</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={existingDetails.companySecretary.option === 'own' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExistingDetails(prev => ({
                      ...prev,
                      companySecretary: { option: 'own' }
                    }))}
                  >
                    ⭕ I will appoint my own
                  </Button>
                  <Button
                    type="button"
                    variant={existingDetails.companySecretary.option === 'service' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExistingDetails(prev => ({
                      ...prev,
                      companySecretary: { option: 'service' }
                    }))}
                  >
                    ⭕ Provide secretarial service
                  </Button>
                </div>
                {existingDetails.companySecretary.option === 'own' && (
                  <div className="mt-3">
                    <PersonCard
                      person={existingDetails.companySecretary.person || { fullName: '', email: '', address: '', nationality: '' }}
                      index={0}
                      onChange={(index, field, value) => {
                        setExistingDetails(prev => ({
                          ...prev,
                          companySecretary: {
                            ...prev.companySecretary,
                            person: { ...(prev.companySecretary.person || { fullName: '', email: '', address: '', nationality: '' }), [field]: value }
                          }
                        }));
                      }}
                      onRemove={() => {
                        setExistingDetails(prev => ({
                          ...prev,
                          companySecretary: { ...prev.companySecretary, person: undefined }
                        }));
                      }}
                      canRemove={false}
                    />
                  </div>
                )}
              </div>

              {/* Judicial Representative */}
              <div>
                <h2 className="text-lg font-medium mb-3">Judicial Representative</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={existingDetails.judicialRepresentative.option === 'own' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExistingDetails(prev => ({
                      ...prev,
                      judicialRepresentative: { option: 'own' }
                    }))}
                  >
                    ⭕ I will appoint my own
                  </Button>
                  <Button
                    type="button"
                    variant={existingDetails.judicialRepresentative.option === 'service' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setExistingDetails(prev => ({
                      ...prev,
                      judicialRepresentative: { option: 'service' }
                    }))}
                  >
                    ⭕ Provide service
                  </Button>
                </div>
                {existingDetails.judicialRepresentative.option === 'own' && (
                  <div className="mt-3">
                    <PersonCard
                      person={existingDetails.judicialRepresentative.person || { fullName: '', email: '', address: '', nationality: '' }}
                      index={0}
                      onChange={(index, field, value) => {
                        setExistingDetails(prev => ({
                          ...prev,
                          judicialRepresentative: {
                            ...prev.judicialRepresentative,
                            person: { ...(prev.judicialRepresentative.person || { fullName: '', email: '', address: '', nationality: '' }), [field]: value }
                          }
                        }));
                      }}
                      onRemove={() => {
                        setExistingDetails(prev => ({
                          ...prev,
                          judicialRepresentative: { ...prev.judicialRepresentative, person: undefined }
                        }));
                      }}
                      canRemove={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-2xl font-semibold mb-2">New company incorporation</h1>
            </div>

            {/* Proposed Names */}
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-medium mb-3">Proposed names</h2>
                <div className="space-y-3">
                  <Input
                    value={newDetails.proposedNames.name1}
                    onChange={(e) => setNewDetails(prev => ({ 
                      ...prev, 
                      proposedNames: { ...prev.proposedNames, name1: e.target.value }
                    }))}
                    placeholder="Proposed name 1"
                  />
                  <Input
                    value={newDetails.proposedNames.name2}
                    onChange={(e) => setNewDetails(prev => ({ 
                      ...prev, 
                      proposedNames: { ...prev.proposedNames, name2: e.target.value }
                    }))}
                    placeholder="Proposed name 2"
                  />
                  <Input
                    value={newDetails.proposedNames.name3}
                    onChange={(e) => setNewDetails(prev => ({ 
                      ...prev, 
                      proposedNames: { ...prev.proposedNames, name3: e.target.value }
                    }))}
                    placeholder="Proposed name 3"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">We&apos;ll check availability in order.</p>
              </div>


              {/* Registered Address */}
              <div>
                <h2 className="text-lg font-medium mb-3">Registered address</h2>
                <div className="flex gap-2 mb-3">
                  <Button
                    type="button"
                    variant={newDetails.registeredAddress.option === 'have' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDetails(prev => ({
                      ...prev,
                      registeredAddress: { option: 'have', address: prev.registeredAddress.address || '' }
                    }))}
                  >
                    ⭕ I have an address
                  </Button>
                  <Button
                    type="button"
                    variant={newDetails.registeredAddress.option === 'need_service' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDetails(prev => ({
                      ...prev,
                      registeredAddress: { 
                        option: 'need_service',
                        address: prev.registeredAddress.address || '' // Preserve existing address or use empty string
                      }
                    }))}
                  >
                    ⭕ I need an address service
                  </Button>
                </div>
                {newDetails.registeredAddress.option === 'have' ? (
                  <Textarea
                    value={newDetails.registeredAddress.address || ''}
                    onChange={(e) => setNewDetails(prev => ({
                      ...prev,
                      registeredAddress: { ...prev.registeredAddress, address: e.target.value }
                    }))}
                    placeholder="Enter registered address"
                    rows={3}
                  />
                ) : (
                  <div className="space-y-2">
                    <InfoBox>
                      We will provide a registered address as part of the service. Please provide a temporary address for now (this will be updated after incorporation).
                    </InfoBox>
                    <Textarea
                      value={newDetails.registeredAddress.address || ''}
                      onChange={(e) => setNewDetails(prev => ({
                        ...prev,
                        registeredAddress: { ...prev.registeredAddress, address: e.target.value }
                      }))}
                      placeholder="Enter temporary address (will be updated after incorporation)"
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">A registered address will be provided as part of the service, but we need a temporary address for now.</p>
                  </div>
                )}
              </div>

              {/* Legal Entity Type */}
              <div>
                <h2 className="text-lg font-medium mb-3">Legal entity type *</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newDetails.legalType === 'LTD' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDetails(prev => ({ ...prev, legalType: 'LTD' }))}
                  >
                    LTD
                  </Button>
                  <Button
                    type="button"
                    variant={newDetails.legalType === 'PLC' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDetails(prev => ({ ...prev, legalType: 'PLC' }))}
                  >
                    PLC
                  </Button>
                </div>
              </div>

              {/* Share Capital */}
              <div>
                <h2 className="text-lg font-medium mb-3">Share capital</h2>
                <div>
                  <label className="text-sm font-medium mb-2 block">Authorized shares *</label>
                  <Input
                    type="number"
                    value={newDetails.authorizedShares}
                    onChange={(e) => setNewDetails(prev => ({ ...prev, authorizedShares: parseInt(e.target.value) || 0 }))}
                    placeholder="1000"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Total number of shares the company is authorized to issue</p>
                </div>
              </div>

              {/* Industry */}
              <div>
                <h2 className="text-lg font-medium mb-3">Industry / Business sectors (optional)</h2>
                <Input
                  value={newDetails.industry?.join(', ') || ''}
                  onChange={(e) => {
                    const industries = e.target.value.split(',').map(s => s.trim()).filter(s => s.length > 0);
                    setNewDetails(prev => ({ ...prev, industry: industries }));
                  }}
                  placeholder="e.g., Technology, Finance, Retail (comma-separated)"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter industry categories separated by commas</p>
              </div>

              {/* Company Summary */}
              <div>
                <h2 className="text-lg font-medium mb-3">Company summary (optional)</h2>
                <Textarea
                  value={newDetails.summary || ''}
                  onChange={(e) => setNewDetails(prev => ({ ...prev, summary: e.target.value }))}
                  placeholder="Brief description of the planned business activities"
                  rows={3}
                />
              </div>

              {/* Expected Start Date */}
              <div>
                <h2 className="text-lg font-medium mb-3">Expected incorporation date (optional)</h2>
                <Input
                  type="date"
                  value={newDetails.expectedStartDate || ''}
                  onChange={(e) => setNewDetails(prev => ({ ...prev, expectedStartDate: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">When do you expect the company to be incorporated?</p>
              </div>

              {/* Directors */}
              <div>
                <h2 className="text-lg font-medium mb-3">
                  Directors <span className="text-red-500">*</span>
                </h2>
                <div className="flex gap-2 mb-3">
                  <Button
                    type="button"
                    variant={newDetails.directors.option === 'own' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDetails(prev => ({
                      ...prev,
                      directors: { option: 'own', persons: prev.directors.persons || [] }
                    }))}
                  >
                    ⭕ I will appoint my own director(s)
                  </Button>
                  <Button
                    type="button"
                    variant={newDetails.directors.option === 'service' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDetails(prev => ({
                      ...prev,
                      directors: { option: 'service' }
                    }))}
                  >
                    ⭕ Provide directorship service
                  </Button>
                </div>
                {newDetails.directors.option === 'own' ? (
                  <div className="space-y-3">
                    {newDetails.directors.persons?.map((director, index) => (
                      <PersonCard
                        key={index}
                        person={director}
                        index={index}
                        onChange={updateDirector}
                        onRemove={removeDirector}
                        canRemove={true}
                      />
                    ))}
                    <div className="space-y-2">
                      <Button type="button" variant="outline" size="sm" onClick={addDirector}>
                        {(!newDetails.directors.persons || newDetails.directors.persons.length === 0) 
                          ? 'Add director' 
                          : 'Add another director'}
                      </Button>
                      {directorError && (
                        <p className="text-sm text-red-500">{directorError}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <InfoBox>
                    A director will be provided by us. No details required at this stage.
                  </InfoBox>
                )}
              </div>

              {/* Shareholders */}
              <div>
                <h2 className="text-lg font-medium mb-3">
                  Shareholders <span className="text-red-500">*</span>
                </h2>
                <div className="space-y-3">
                  {newDetails.shareholders.map((shareholder, index) => (
                    <PersonCard
                      key={index}
                      person={shareholder}
                      index={index}
                      showOwnership={true}
                      onChange={updateShareholder}
                      onRemove={removeShareholder}
                      canRemove={true}
                    />
                  ))}
                  <div className="space-y-2">
                  <Button type="button" variant="outline" size="sm" onClick={addShareholder}>
                      {(!newDetails.shareholders || newDetails.shareholders.length === 0) 
                        ? 'Add shareholder' 
                        : 'Add another shareholder'}
                  </Button>
                    {shareholderError && (
                      <p className="text-sm text-red-500">{shareholderError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Company Secretary */}
              <div>
                <h2 className="text-lg font-medium mb-3">Company Secretary</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newDetails.companySecretary.option === 'own' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDetails(prev => ({
                      ...prev,
                      companySecretary: { option: 'own' }
                    }))}
                  >
                    ⭕ I will appoint my own
                  </Button>
                  <Button
                    type="button"
                    variant={newDetails.companySecretary.option === 'service' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDetails(prev => ({
                      ...prev,
                      companySecretary: { option: 'service' }
                    }))}
                  >
                    ⭕ Provide secretarial service
                  </Button>
                </div>
              </div>

              {/* Judicial Representative */}
              <div>
                <h2 className="text-lg font-medium mb-3">Judicial Representative</h2>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={newDetails.judicialRepresentative.option === 'own' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDetails(prev => ({
                      ...prev,
                      judicialRepresentative: { option: 'own' }
                    }))}
                  >
                    ⭕ I will appoint my own
                  </Button>
                  <Button
                    type="button"
                    variant={newDetails.judicialRepresentative.option === 'service' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNewDetails(prev => ({
                      ...prev,
                      judicialRepresentative: { option: 'service' }
                    }))}
                  >
                    ⭕ Provide service
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      )}
    </OnboardingLayout>
  );
}

