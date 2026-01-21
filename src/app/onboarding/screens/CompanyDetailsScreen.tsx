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
import { saveOnboardingStep } from '@/api/onboardingService';

interface CompanyDetailsScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack: () => void;
}

export default function CompanyDetailsScreen({ onComplete, onSaveExit, onBack }: CompanyDetailsScreenProps) {
  const [companyType, setCompanyType] = useState<CompanyType | undefined>(undefined);
  const [directorError, setDirectorError] = useState<string>('');
  const [existingDetails, setExistingDetails] = useState<ExistingCompanyDetails>({
    companyName: '',
    registrationNumber: '',
    countryOfIncorporation: '',
    vatNumber: '',
    businessActivity: '',
    registeredAddress: '',
  });

  const [newDetails, setNewDetails] = useState<NewCompanyDetails>({
    proposedNames: {
      name1: '',
      name2: '',
      name3: '',
    },
    registeredAddress: {
      option: 'have' as AddressOption,
      address: '',
    },
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

    // Validate directors if option is 'own'
    if (companyType === 'new' && newDetails.directors.option === 'own') {
      const directors = newDetails.directors.persons || [];
      const validDirectors = directors.filter(
        (person) => person && (person.fullName?.trim() || person.email?.trim())
      );
      
      if (validDirectors.length === 0) {
        setDirectorError('Please add at least one director with a name or email before continuing.');
        return;
      }
    }
    
    // Clear any previous errors if validation passes
    setDirectorError('');

    try {
      const data = companyType === 'existing' 
        ? { existingCompanyDetails: existingDetails }
        : { newCompanyDetails: newDetails };
      
      await saveOnboardingStep(2, {
        companyType: companyType, // Now TypeScript knows it's not null/undefined
        ...data,
      });
      
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
    }
  };

  const addDirector = () => {
    setDirectorError(''); // Clear error when adding a director
    setNewDetails(prev => ({
      ...prev,
      directors: {
        ...prev.directors,
        persons: [...(prev.directors.persons || []), { fullName: '', email: '' }],
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
    setNewDetails(prev => ({
      ...prev,
      shareholders: [...prev.shareholders, { fullName: '', email: '', ownershipPercent: 0 }],
    }));
  };

  const updateShareholder = (index: number, field: keyof Person, value: string | number) => {
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

  return (
    <OnboardingLayout
      currentStep={2}
      totalSteps={7}
      onContinue={handleContinue}
      onSaveExit={onSaveExit}
      onBack={onBack}
      continueLabel="Continue"
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
                <label className="text-sm font-medium mb-2 block">Registered address</label>
                <Textarea
                  value={existingDetails.registeredAddress}
                  onChange={(e) => setExistingDetails(prev => ({ ...prev, registeredAddress: e.target.value }))}
                  placeholder="Enter registered address"
                  rows={3}
                />
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
                      registeredAddress: { option: 'need_service' }
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
                  <InfoBox>
                    We will provide a registered address as part of the service.
                  </InfoBox>
                )}
              </div>

              {/* Directors */}
              <div>
                <h2 className="text-lg font-medium mb-3">Directors</h2>
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
                <h2 className="text-lg font-medium mb-3">Shareholders</h2>
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
                  <Button type="button" variant="outline" size="sm" onClick={addShareholder}>
                    Add shareholder
                  </Button>
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

