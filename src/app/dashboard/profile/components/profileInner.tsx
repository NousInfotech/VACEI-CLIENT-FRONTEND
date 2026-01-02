'use client';
import React, { useEffect, useState } from 'react';
import TextInput from '@/components/TextInput'; // Assuming TextInput component is styled
import AlertMessage from '@/components/AlertMessage'; // Assuming AlertMessage component is styled

interface UserProfile {
  email: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  phone?: string;
  role?: number;
}

const SkeletonInput = () => (
  <div className="w-full bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-6 border border-gray-200"> </div>
);

const ProfilePage: React.FC = () => {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '', username: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [alertVariant, setAlertVariant] = useState<'success' | 'danger' | 'warning' | 'info'>('success');
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await fetch(`${backendUrl}user/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!res.ok) throw new Error('Failed to fetch user profile');

        const data = await res.json();
        setUserProfile(data);
        setFormData({
          username: data.username || '',
          phone: data.phone || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [backendUrl, token]);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const phoneRegex = /^\+?[0-9]{7,15}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      setAlertVariant('warning');
      setMessage('Please enter a valid phone number.');
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${backendUrl}user/profile`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Failed to update profile');

      setAlertVariant('success');
      setMessage('Profile updated successfully!');
    } catch (error) {
      setAlertVariant('danger');
      setMessage('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const isPhoneValid = formData.phone === '' || /^\+?[0-9]{7,15}$/.test(formData.phone);

  return (
    <div className="mt-4"> {/* Soft background color for the entire page */}
      {/* Alert message */}
      {message && (
        <div className="mb-6"> {/* Add some margin below the alert */}
          <AlertMessage
            message={message}
            variant={alertVariant}
            onClose={() => setMessage('')}
            duration={6000}
          />
        </div>
      )}

        {/* Show skeletons while loading */}
      {loading && (
        <div className="w-full bg-white shadow-lg rounded-xl p-6 sm:p-8 space-y-4 border border-gray-200"> {/* Main container for skeleton */}
          {/* Readonly Fields Skeletons */}
          <div className="space-y-4">
            <SkeletonInput /> {/* Email */}
            <SkeletonInput /> {/* Username */}
            <SkeletonInput /> {/* Role */}
          </div>

          {/* Editable Fields Skeletons */}
          <div className="space-y-4 mt-4">
            <div className="flex flex-wrap -mx-2">
              <div className="w-full sm:w-1/2 px-2 mb-4 sm:mb-0">
                <SkeletonInput /> {/* First Name */}
              </div>
              <div className="w-full sm:w-1/2 px-2">
                <SkeletonInput /> {/* Last Name */}
              </div>
            </div>
            <SkeletonInput /> {/* Phone */}
          </div>

          {/* Save Button Skeleton */}
          <div className="h-10 w-32 rounded-lg bg-gray-200 animate-pulse mt-6"></div>
        </div>
      )}

      {/* Show form when loaded */}
      {!loading && userProfile && (
        <form onSubmit={handleSave} className="">
      

          {/* Readonly Fields */}
          <div className="space-y-4">
            <TextInput
              label="Email"
              value={userProfile.email}
              onChange={() => {}}
              className="bg-gray-50 text-gray-600 cursor-not-allowed  rounded-md " // Enhanced styling for readonly
              type="email"
              {...{ readOnly: true }}
            />
            <TextInput
              label="Username"
              value={userProfile.username || ''}
              onChange={() => {}}
              className="bg-gray-50 text-gray-600 cursor-not-allowed rounded-md"
              {...{ readOnly: true }}
            />
            <TextInput
              label="Role"
              value={
                userProfile.role === 1
                  ? 'Admin'
                  : userProfile.role === 2
                  ? 'Accountant'
                  : userProfile.role === 3
                  ? 'Client'
                  : 'Unknown'
              }
              onChange={() => {}}
              className="bg-gray-50 text-gray-600 cursor-not-allowed  rounded-md"
              {...{ readOnly: true }}
            />
          </div>

          {/* Editable Fields */}
          <div className="space-y-4 mt-4">
            <div className="flex flex-wrap -mx-2">
              <div className="w-full sm:w-1/2 px-2 mb-4 sm:mb-0"> {/* Responsive width and margin */}
                <TextInput
                  label="First Name"
                  value={formData.first_name}
                  onChange={(val) => handleChange('first_name', val)}
                  placeholder="Enter your first name"
                  className=" rounded-md  focus:ring-2 focus:ring-green-500 focus:border-transparent" // Styled input with focus
                />
              </div>

              <div className="w-full sm:w-1/2 px-2">
                <TextInput
                  label="Last Name"
                  value={formData.last_name}
                  onChange={(val) => handleChange('last_name', val)}
                  placeholder="Enter your last name"
                  className="rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            <TextInput
              label="Phone"
              value={formData.phone}
              onChange={(val) => {
                // Allow + at start, only digits otherwise
                let filteredVal = val;
                if (filteredVal.length === 1 && filteredVal !== '+') filteredVal = filteredVal.replace(/\D/g, '');
                else if (filteredVal.length > 1 && filteredVal.startsWith('+')) filteredVal = '+' + filteredVal.substring(1).replace(/[^\d]/g, '');
                else filteredVal = filteredVal.replace(/[^\d]/g, '');
                handleChange('phone', filteredVal);
              }}
              placeholder="+1234567890"
              error={formData.phone && !isPhoneValid ? 'Invalid phone number format.' : undefined}
              className=" rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className={`w-full sm:w-auto mt-6 px-6 py-3 rounded-lg text-white font-semibold transition duration-300 ease-in-out
              ${saving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'}`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {!loading && !userProfile && (
        <p className="text-center text-red-500 mt-6 text-lg">Unable to load profile. Please try again later.</p>
      )}
    </div>
  );
};

export default ProfilePage;