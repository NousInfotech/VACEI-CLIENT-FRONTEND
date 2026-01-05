'use client';

import { Suspense, useState, useEffect, ChangeEvent, FocusEvent } from 'react';
import * as Yup from 'yup';
import { ValidationError } from 'yup';
import { changePassword } from '@/api/authService';
import AlertMessage, { AlertVariant } from '@/components/AlertMessage'; // Import AlertMessage
import { Button } from '@/components/ui/button';

// Define the shape of your form data
interface FormData {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

// Define the shape of your errors object
type FormErrors = {
    [key in keyof FormData]?: string;
};

// Define the Yup validation schema outside the component to avoid re-creation on re-renders
const validationSchema = Yup.object<FormData>().shape({
    currentPassword: Yup.string().required('Current password is required'),
    newPassword: Yup.string()
        .min(7, 'New password must be at least 7 characters')
        .required('New password is required'),
    confirmNewPassword: Yup.string()
        .oneOf([Yup.ref('newPassword')], 'Passwords must match')
        .required('Confirm new password is required'),
});

function SettingsContent() {
    const [formData, setFormData] = useState<FormData>({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Consolidated state for the AlertMessage
    const [alert, setAlert] = useState<{ message: string; variant: AlertVariant } | null>(null);

    // Function to validate a single field
    const validateField = async (fieldName: keyof FormData, value: string) => {
        try {
            await validationSchema.validateAt(fieldName, { ...formData, [fieldName]: value });
            setErrors((prev) => ({ ...prev, [fieldName]: undefined })); // Clear error for this field
        } catch (err: any) {
            if (err instanceof ValidationError) {
                const fieldError = err.inner.find(e => e.path === fieldName);
                setErrors((prev) => ({ ...prev, [fieldName]: fieldError ? fieldError.message : undefined }));
            }
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name as keyof FormData]: value }));
    };

    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched((prev) => ({ ...prev, [name as keyof FormData]: true }));
        validateField(name as keyof FormData, value); // Validate on blur
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAlert(null); // Clear any previous alerts
        setIsSubmitting(true);

        try {
            // Validate all fields before submitting
            await validationSchema.validate(formData, { abortEarly: false });
            setErrors({}); // Clear all errors if validation passes

            console.log('Attempting to change password...');

            const response = await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            // Set success alert
            setAlert({ message: response.message || 'Password updated successfully!', variant: 'success' });
            setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' }); // Clear form
            setTouched({}); // Reset touched state

        } catch (error: any) {
            if (error instanceof ValidationError) {
                // This block handles Yup validation errors (frontend errors)
                const newErrors: FormErrors = {};
                error.inner.forEach((validationError) => {
                    if (validationError.path) {
                        newErrors[validationError.path as keyof FormData] = validationError.message;
                    }
                });
                setErrors(newErrors);
                setTouched({
                    currentPassword: true,
                    newPassword: true,
                    confirmNewPassword: true,
                });
                // Set a danger alert for validation errors
                setAlert({ message: 'Please correct the form errors.', variant: 'danger' });
            } else {
                // This block handles errors thrown by the API service (backend errors)
                console.error('API Error:', error);
                let errorMessageToDisplay = 'An unexpected error occurred. Please try again.';

                if (error.message && typeof error.message === 'string') {
                    errorMessageToDisplay = error.message;
                } else if (error.error && typeof error.error === 'string') {
                    errorMessageToDisplay = error.error;
                }

                // Set danger alert for API errors
                setAlert({ message: errorMessageToDisplay, variant: 'danger' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5">
            <div className="bg-card border border-border rounded-[16px] p-4 shadow-md w-full mx-auto transition-all duration-300 hover:shadow-md">
                <h1 className="text-xl leading-normal text-brand-body capitalize font-medium">Settings</h1>
                <hr className="my-3 border-t border-gray-100" />
                
                {/* Change Password Section */}
                <div className="mt-3">
                    <h2 className="text-xl leading-normal text-brand-body capitalize font-medium mb-3">Change Password</h2>
                    {/* Render the AlertMessage component here */}
                    {alert && (
                        <div className="mb-4"> {/* Added a div for consistent spacing */}
                            <AlertMessage
                                message={alert.message}
                                variant={alert.variant}
                                onClose={() => setAlert(null)} // Clear the alert when closed
                                duration={6000} // Optional: Set a duration for auto-dismiss
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-brand-body mb-1">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                name="currentPassword"
                                type="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={formData.currentPassword}
                                className="block w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-blue-500 focus:border-brand-primary sm:text-sm"
                            />
                            {touched.currentPassword && errors.currentPassword ? (
                                <div className="text-red-600 text-sm mt-1">{errors.currentPassword}</div>
                            ) : null}
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-brand-body mb-1">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                name="newPassword"
                                type="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={formData.newPassword}
                                className="block w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-blue-500 focus:border-brand-primary sm:text-sm"
                            />
                            {touched.newPassword && errors.newPassword ? (
                                <div className="text-red-600 text-sm mt-1">{errors.newPassword}</div>
                            ) : null}
                        </div>

                        <div>
                            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-brand-body mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmNewPassword"
                                name="confirmNewPassword"
                                type="password"
                                onChange={handleChange}
                                onBlur={handleBlur}
                                value={formData.confirmNewPassword}
                                className="block w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-blue-500 focus:border-brand-primary sm:text-sm"
                            />
                            {touched.confirmNewPassword && errors.confirmNewPassword ? (
                                <div className="text-red-600 text-sm mt-1">{errors.confirmNewPassword}</div>
                            ) : null}
                        </div>

                        <div className="flex">
                            <Button
                                variant={"default"}
                                type="submit"
                                className="px-4 py-2 bg-sidebar-background text-sidebar-foreground rounded-md transition-colors mr-2 cursor-pointer font-normal shadow-md hover:bg-sidebar-hover"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </section>
    );
}

export default function Settings() {
    return (
        <Suspense fallback={<div>Loading settings...</div>}>
            <SettingsContent />
        </Suspense>
    );
}