'use client';

import { useState } from 'react';
import { OnboardingLayout } from '@/components/onboarding/OnboardingLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { saveOnboardingStep, createClient } from '@/api/onboardingService';

interface UserRegistrationScreenProps {
  onComplete: () => void;
  onSaveExit: () => void;
  onBack?: () => void;
}

export default function UserRegistrationScreen({ onComplete, onSaveExit, onBack }: UserRegistrationScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }>({});

  // Removed auto-fill from localStorage - fields should start empty
  // Users can still save their progress, but fields won't auto-populate on page load

  const validate = () => {
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    }

    if (phone && !/^[\d\s\-\+\(\)]+$/.test(phone)) {
      newErrors.phone = 'Enter a valid phone number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // Prepare user registration data
      const userData = {
        email,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
      };

      // Create User + Client records at backend (Step 1) - REQUIRED, don't proceed on error
      try {
        const result = await createClient(userData);
        
        // Save user and client IDs to localStorage for later use
        const existingData = JSON.parse(localStorage.getItem('onboarding-data') || '{}');
        localStorage.setItem('onboarding-data', JSON.stringify({
          ...existingData,
          ...userData,
          userId: result.user.id,
          clientId: result.client.id,
        }));

        // Also save step progress (404 is expected if endpoint doesn't exist, but don't block)
        try {
          await saveOnboardingStep(1, {
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
          });
        } catch (stepError: any) {
          // 404 is expected - endpoint might not exist, just log it
          if (stepError.message?.includes('404') || stepError.message?.includes('BACKEND_NOT_AVAILABLE')) {
            console.warn('Step progress save failed (expected if endpoint not implemented):', stepError.message);
          } else {
            console.error('Step progress save failed:', stepError);
          }
        }
      } catch (error: any) {
        // CRITICAL: If backend creation fails, DO NOT allow continuation
        console.error('Failed to create user/client at backend:', error);
        const errorMessage = error.message || 'Failed to create account. Please try again.';
        
        if (errorMessage.includes('already exists') || errorMessage.includes('USER_EXISTS')) {
          alert('An account with this email or phone already exists. Please use a different email or phone number.');
          setLoading(false);
          return; // Block navigation
        }
        
        // Show error and block navigation
        alert(`Failed to create account: ${errorMessage}\n\nPlease check your connection and try again.`);
        setLoading(false);
        return; // Block navigation - user must fix the error
      }

      onComplete();
    } catch (error) {
      console.error('Failed to save step:', error);
      alert('Failed to save. Please try again.');
      setLoading(false);
    }
  };

  return (
    <OnboardingLayout
      currentStep={1}
      totalSteps={4}
      onContinue={handleContinue}
      onSaveExit={onSaveExit}
      onBack={onBack}
      continueLabel={loading ? 'Creating account...' : 'Continue'}
      disabled={loading}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold mb-2">Create your account</h1>
          <p className="text-sm text-muted-foreground">
            Let&apos;s start by setting up your account. You&apos;ll use this to access your portal.
          </p>
        </div>

        <form 
          autoComplete="off" 
          noValidate 
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleContinue();
          }}
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">First name *</label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className={errors.firstName ? 'border-red-500' : ''}
                autoComplete="off"
                data-form-type="other"
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Last name *</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className={errors.lastName ? 'border-red-500' : ''}
                autoComplete="off"
                data-form-type="other"
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Email address *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="john.doe@example.com"
              className={errors.email ? 'border-red-500' : ''}
              autoComplete="off"
              data-form-type="other"
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Phone number (optional)</label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+356 1234 5678"
              className={errors.phone ? 'border-red-500' : ''}
              autoComplete="off"
              data-form-type="other"
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Password *</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className={errors.password ? 'border-red-500' : ''}
                autoComplete="new-password"
                data-form-type="other"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <i className="fi fi-rr-eye-crossed h-5 w-5"></i>
                ) : (
                  <i className="fi fi-rr-eye h-5 w-5"></i>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Confirm password *</label>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className={errors.confirmPassword ? 'border-red-500' : ''}
              autoComplete="new-password"
              data-form-type="other"
            />
            {errors.confirmPassword && (
              <p className="text-sm text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        </form>
      </div>
    </OnboardingLayout>
  );
}

