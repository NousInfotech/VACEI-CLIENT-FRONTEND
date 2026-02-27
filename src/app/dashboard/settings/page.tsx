'use client';

import { Suspense, useState, useEffect, ChangeEvent, FocusEvent } from 'react';
import * as Yup from 'yup';
import { ValidationError } from 'yup';
import { changePassword } from '@/api/authService';
import AlertMessage, { AlertVariant } from '@/components/AlertMessage'; // Import AlertMessage
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/Dropdown";
import { ChevronDown, Settings as SettingsIcon, Users, Bell, Shield, Wallet, Lock } from "lucide-react";
import PillTabs from "@/components/shared/PillTabs";
import { useTabQuery } from "@/hooks/useTabQuery";
import { PageHeader } from "@/components/shared/PageHeader";
import { fetchPreferencesAPI, updatePreferencesAPI, NotificationPreference } from '@/api/notificationService';
import { getCompanyProfile, updateCompanyProfile } from '@/api/companyService';
import { useActiveCompany } from '@/context/ActiveCompanyContext';

function bufferToBase64Url(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

function base64UrlToBuffer(base64url: string): ArrayBuffer {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

function toPublicKeyCreationOptions(options: Record<string, unknown>): CredentialCreationOptions {
    const o: any = options;
    const challenge = base64UrlToBuffer(o.challenge);
    const userId = base64UrlToBuffer(o.user.id);
    const excludeCredentials = o.excludeCredentials?.map((cred: any) => ({
        ...cred,
        id: base64UrlToBuffer(cred.id),
    }));

    return {
        publicKey: {
            ...o,
            challenge,
            user: {
                ...o.user,
                id: userId,
            },
            excludeCredentials,
        },
    };
}

// Simple textarea using Input styling
const Textarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea
        {...props}
        className={`block w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-blue-500 focus:border-brand-primary sm:text-sm ${props.className || ""}`}
    />
);

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

    // --- Local UI state for profile/settings ---
    const { activeCompanyId } = useActiveCompany();
    const [profile, setProfile] = useState<{ name: string; registrationNumber: string; address: string; }>({
        name: "",
        registrationNumber: "",
        address: ""
    });
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    useEffect(() => {
        const loadProfile = async () => {
            if (!activeCompanyId) return;
            try {
                const data = await getCompanyProfile(activeCompanyId);
                setProfile({
                    name: data.name || "",
                    registrationNumber: data.registrationNumber || "",
                    address: data.address || ""
                });
            } catch (err) {
                console.error("Failed to load company profile", err);
            }
        };
        loadProfile();
    }, [activeCompanyId]);

    const handleSaveProfile = async () => {
        if (!activeCompanyId) return;
        setIsSavingProfile(true);
        try {
            await updateCompanyProfile(activeCompanyId, {
                name: profile.name,
                address: profile.address,
                // registrationNumber typically shouldn't be updated but include if needed, backend ignores if not in schema or updates if allowed
            });
            setAlert({ message: 'Company profile updated successfully.', variant: 'success' });
        } catch (err: any) {
            setAlert({ message: err.message || 'Failed to update company profile.', variant: 'danger' });
        } finally {
            setIsSavingProfile(false);
        }
    };

    const [notifications, setNotifications] = useState<NotificationPreference>({
        emailEnabled: true,
        inAppEnabled: true,
        pushEnabled: false,
        soundEnabled: true,
    });
    type MfaMethod = 'none' | 'email' | 'totp' | 'webauthn';
    const [mfaMethod, setMfaMethod] = useState<MfaMethod>('none');
    const [mfaLoading, setMfaLoading] = useState(false);
    const [totpOtpauthUrl, setTotpOtpauthUrl] = useState<string | null>(null);
    const [totpCode, setTotpCode] = useState('');
    const [totpVerifying, setTotpVerifying] = useState(false);
    const [totpConfigured, setTotpConfigured] = useState(false);
    const [sessions, setSessions] = useState<{ id: string; device: string; location: string; lastSeen: string; }[]>(() => [
        { id: "local-1", device: "Chrome on Windows", location: "Unknown", lastSeen: "Just now" },
    ]);

    useEffect(() => {
        const loadPrefs = async () => {
            try {
                const prefs = await fetchPreferencesAPI();
                setNotifications(prefs);
            } catch (err) {
                console.error("Failed to load notification preferences", err);
            }
        };
        loadPrefs();
    }, []);

    useEffect(() => {
        const loadMfa = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await fetch(`${backendUrl}auth/mfa/preferences`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) return;
                const json = await res.json();
                const payload = json.data || json;
                const enabled = Boolean(payload.mfaEnabled);
                const method = payload.mfaMethod as 'email' | 'totp' | 'webauthn' | null;
                if (!enabled || !method) {
                    setMfaMethod('none');
                    setTotpConfigured(false);
                } else if (method === 'email') {
                    setMfaMethod('email');
                    setTotpConfigured(false);
                } else if (method === 'totp') {
                    setMfaMethod('totp');
                    setTotpConfigured(true);
                } else if (method === 'webauthn') {
                    setMfaMethod('webauthn');
                    setTotpConfigured(false);
                }
            } catch (err) {
                console.error('Failed to load MFA preferences', err);
            }
        };
        loadMfa();
    }, []);

    const updateMfaPreference = async (method: MfaMethod) => {
        setMfaLoading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');
            const res = await fetch(`${backendUrl}auth/mfa/preferences`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ method }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to update MFA settings');
            }
            setMfaMethod(method);
            setAlert({ message: method === 'none' ? 'MFA disabled' : method === 'email' ? 'Email MFA enabled' : 'Authenticator app MFA enabled', variant: 'success' });
        } catch (err: any) {
            console.error('Failed to update MFA preferences', err);
            setAlert({ message: err.message || 'Failed to update MFA settings', variant: 'danger' });
        } finally {
            setMfaLoading(false);
        }
    };

    const startTotpSetup = async () => {
        setMfaLoading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');
            const res = await fetch(`${backendUrl}auth/mfa/setup-totp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to start TOTP setup');
            }
            const json = await res.json();
            const payload = json.data || json;
            if (!payload?.otpauthUrl) throw new Error('Missing otpauth URL from server');
            setTotpOtpauthUrl(payload.otpauthUrl);
            setMfaMethod('totp');
        } catch (err: any) {
            console.error('Failed to start TOTP setup', err);
            setAlert({ message: err.message || 'Failed to start TOTP setup', variant: 'danger' });
        } finally {
            setMfaLoading(false);
        }
    };

    const verifyTotpSetup = async () => {
        if (totpCode.trim().length < 6) {
            setAlert({ message: 'Please enter the 6-digit code from your authenticator app.', variant: 'danger' });
            return;
        }
        setTotpVerifying(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');
            const res = await fetch(`${backendUrl}auth/mfa/verify-totp-setup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ otp: totpCode }),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Verification failed');
            }
            setTotpCode('');
            setTotpOtpauthUrl(null);
            setTotpConfigured(true);
            setAlert({ message: 'Authenticator app MFA enabled for your account.', variant: 'success' });
            setMfaMethod('totp');
        } catch (err: any) {
            console.error('Failed to verify TOTP setup', err);
            setAlert({ message: err.message || 'Failed to verify authenticator code.', variant: 'danger' });
        } finally {
            setTotpVerifying(false);
        }
    };

    const startWebauthnRegistration = async () => {
        if (typeof window === 'undefined' || typeof navigator === 'undefined' || !(window as any).PublicKeyCredential) {
            setAlert({ message: 'Your browser does not support passkeys / WebAuthn.', variant: 'danger' });
            return;
        }
        setMfaLoading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";
            const token = localStorage.getItem('token');
            if (!token) throw new Error('Not authenticated');
            const res = await fetch(`${backendUrl}auth/mfa/webauthn/register-challenge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({}),
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.message || 'Unable to start WebAuthn registration.');
            }
            const json = await res.json();
            const payload = json.data || json;
            const options = payload.options as Record<string, unknown> | undefined;
            if (!options) throw new Error('Missing WebAuthn registration options from server');

            const cred = await navigator.credentials.create(toPublicKeyCreationOptions(options));
            if (!cred || cred.type !== 'public-key') {
                throw new Error('Registration was cancelled or failed.');
            }

            const publicKeyCred = cred as PublicKeyCredential;
            const attestation = publicKeyCred.response as AuthenticatorAttestationResponse;

            const webauthnResponse = {
                id: publicKeyCred.id,
                rawId: bufferToBase64Url(publicKeyCred.rawId),
                type: publicKeyCred.type,
                response: {
                    clientDataJSON: bufferToBase64Url(attestation.clientDataJSON),
                    attestationObject: bufferToBase64Url(attestation.attestationObject),
                },
                clientExtensionResults:
                    (publicKeyCred as any).getClientExtensionResults?.() ?? {},
            };

            const verifyRes = await fetch(`${backendUrl}auth/mfa/webauthn/register-verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ response: webauthnResponse }),
            });
            if (!verifyRes.ok) {
                const errData = await verifyRes.json().catch(() => ({}));
                throw new Error(errData.message || 'Failed to complete WebAuthn registration.');
            }

            await updateMfaPreference('webauthn');
            setAlert({ message: 'Device passkey / biometric MFA registered for your account.', variant: 'success' });
        } catch (err: any) {
            console.error('WebAuthn registration failed', err);
            setAlert({ message: err.message || 'Failed to register device passkey.', variant: 'danger' });
        } finally {
            setMfaLoading(false);
        }
    };

    const togglePreference = async (key: keyof NotificationPreference) => {
        const newValue = !notifications[key];
        // Optimistic update
        setNotifications(prev => ({ ...prev, [key]: newValue }));
        try {
            await updatePreferencesAPI({ [key]: newValue });
        } catch (err) {
            console.error("Failed to update preference", err);
            // Revert on error
            setNotifications(prev => ({ ...prev, [key]: !newValue }));
        }
    };

    const [activeTab, setActiveTab] = useTabQuery("general");

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
            <PageHeader
                title="Settings"
                subtitle="Manage your account preferences, company profile, and security settings."
            />
            <div className="bg-card border border-border rounded-card p-6 shadow-md w-full mx-auto space-y-6">

                {/* Tabs */}
                <PillTabs
                    tabs={[
                        { id: "general", label: "Company profile", icon: SettingsIcon },
                        { id: "notifications", label: "Notifications", icon: Bell },
                        { id: "security", label: "Security & sessions", icon: Shield },
                        { id: "password", label: "Password", icon: Lock },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {/* Profile */}
                {activeTab === "general" && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-brand-body">Company profile</h2>
                        {alert && activeTab === "general" && (
                            <div className="mb-4">
                                <AlertMessage message={alert.message} variant={alert.variant} onClose={() => setAlert(null)} duration={6000} />
                            </div>
                        )}
                        <div className="grid gap-3 md:grid-cols-2">
                            <Input placeholder="Company name" value={profile.name} onChange={(e)=>setProfile(p=>({...p,name:e.target.value}))}/>
                            <Input placeholder="Registration number" disabled value={profile.registrationNumber} title="Registration numbers cannot be edited directly." className="bg-muted cursor-not-allowed text-muted-foreground" />
                        </div>
                        <Textarea rows={2} placeholder="Address" value={profile.address} onChange={(e)=>setProfile(p=>({...p,address:e.target.value}))}/>
                        
                        <div className="pt-2">
                            <Button 
                                onClick={handleSaveProfile} 
                                disabled={isSavingProfile || !activeCompanyId}
                                className="px-4 py-2 font-normal"
                            >
                                {isSavingProfile ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Notifications */}
                {activeTab === "notifications" && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-brand-body">Notification preferences</h2>
                        <div className="grid gap-4 md:grid-cols-2">
                            <label className="flex items-center gap-3 text-sm p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" checked={notifications.emailEnabled} onChange={()=>togglePreference('emailEnabled')}/>
                                <div className="flex flex-col">
                                    <span className="font-medium">Email Notifications</span>
                                    <span className="text-xs text-muted-foreground">Receive important updates via email</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 text-sm p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" checked={notifications.inAppEnabled} onChange={()=>togglePreference('inAppEnabled')}/>
                                <div className="flex flex-col">
                                    <span className="font-medium">In-App Notifications</span>
                                    <span className="text-xs text-muted-foreground">Real-time alerts while using the platform</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 text-sm p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" checked={notifications.pushEnabled} onChange={()=>togglePreference('pushEnabled')}/>
                                <div className="flex flex-col">
                                    <span className="font-medium">Push Notifications</span>
                                    <span className="text-xs text-muted-foreground">Get notified on your mobile or desktop</span>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 text-sm p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary" checked={notifications.soundEnabled} onChange={()=>togglePreference('soundEnabled')}/>
                                <div className="flex flex-col">
                                    <span className="font-medium">Notification Sounds</span>
                                    <span className="text-xs text-muted-foreground">Play a sound when a new notification arrives</span>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                {/* Security / MFA + Sessions */}
                {activeTab === "security" && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-brand-body">Security (MFA)</h2>
                            <p className="text-xs text-muted-foreground">
                                Choose how you want to approve logins to your client account.
                            </p>
                            <div className="grid gap-3 md:grid-cols-2 text-xs">
                                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                    <input
                                        type="radio"
                                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                        checked={mfaMethod === 'none'}
                                        onChange={() => updateMfaPreference('none')}
                                        disabled={mfaLoading}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Disabled</span>
                                        <span className="text-[11px] text-muted-foreground">Use password only (not recommended)</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                    <input
                                        type="radio"
                                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                        checked={mfaMethod === 'email'}
                                        onChange={() => updateMfaPreference('email')}
                                        disabled={mfaLoading}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Email code</span>
                                        <span className="text-[11px] text-muted-foreground">Send a 6-digit code to your email</span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors md:col-span-2">
                                    <input
                                        type="radio"
                                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                        checked={mfaMethod === 'totp'}
                                        onChange={() => setMfaMethod('totp')}
                                        disabled={mfaLoading}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Authenticator app (recommended)</span>
                                        <span className="text-[11px] text-muted-foreground">
                                            Use apps like Google Authenticator, 1Password, or Authy.
                                        </span>
                                    </div>
                                </label>
                                <label className="flex items-center gap-2 p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors md:col-span-2">
                                    <input
                                        type="radio"
                                        className="w-4 h-4 rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                                        checked={mfaMethod === 'webauthn'}
                                        onChange={() => setMfaMethod('webauthn')}
                                        disabled={mfaLoading}
                                    />
                                    <div className="flex flex-col">
                                        <span className="font-medium">Device passkey / biometric</span>
                                        <span className="text-[11px] text-muted-foreground">
                                            Use your device&apos;s fingerprint, face or PIN as an MFA method.
                                        </span>
                                    </div>
                                </label>
                            </div>
                            {mfaMethod === 'totp' && (
                                <div className="mt-2 space-y-3 rounded-xl border border-dashed border-border bg-muted/40 p-4">
                                    {totpConfigured && !totpOtpauthUrl ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <div className="space-y-1 text-xs text-muted-foreground">
                                                <p className="font-semibold text-brand-body">Authenticator app is enabled</p>
                                                <p>
                                                    Use your authenticator app when you log in. To move to a new device, you can
                                                    reconfigure it – this will generate a new QR code and invalidate the old setup.
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-[11px] font-semibold"
                                                onClick={startTotpSetup}
                                                disabled={mfaLoading}
                                            >
                                                {mfaLoading ? 'Preparing…' : 'Reconfigure app'}
                                            </Button>
                                        </div>
                                    ) : !totpOtpauthUrl ? (
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                            <p className="text-[11px] text-muted-foreground">
                                                Start authenticator-app setup to generate a QR code and secret for your device.
                                            </p>
                                            <Button
                                                size="sm"
                                                variant="default"
                                                className="text-[11px] font-semibold"
                                                onClick={startTotpSetup}
                                                disabled={mfaLoading}
                                            >
                                                {mfaLoading ? 'Starting…' : 'Start setup'}
                                            </Button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex flex-col sm:flex-row gap-4 items-center">
                                                <div className="shrink-0">
                                                    <img
                                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                                                            totpOtpauthUrl
                                                        )}`}
                                                        alt="MFA QR code"
                                                        className="rounded-xl border border-border bg-card"
                                                    />
                                                </div>
                                                <div className="space-y-2 text-xs text-muted-foreground">
                                                    <p className="font-semibold text-brand-body">Scan this QR code</p>
                                                    <p>
                                                        Open your authenticator app, add a new account, and scan the QR code. If you can&apos;t
                                                        scan, you can paste this key manually:
                                                    </p>
                                                    <code className="block break-all rounded-md bg-input px-2 py-1 text-[11px] border border-border">
                                                        {totpOtpauthUrl}
                                                    </code>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[11px] font-semibold text-brand-body">
                                                    Enter the 6-digit code from your app
                                                </label>
                                                <div className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        maxLength={6}
                                                        value={totpCode}
                                                        onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                                                        className="h-10 w-32 rounded-lg border border-border px-3 text-center tracking-[0.3em] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                                        placeholder="000000"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        variant="default"
                                                        className="text-[11px] font-semibold"
                                                        onClick={verifyTotpSetup}
                                                        disabled={totpVerifying}
                                                    >
                                                        {totpVerifying ? 'Verifying…' : 'Verify & enable'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                            {mfaMethod === 'webauthn' && (
                                <div className="mt-2 space-y-3 rounded-xl border border-dashed border-border bg-muted/40 p-4">
                                    <p className="text-[11px] text-muted-foreground">
                                        Register a passkey for this browser. You&apos;ll be able to approve logins using built-in security
                                        like Touch ID, Face ID, Windows Hello, or your device PIN.
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        className="text-[11px] font-semibold"
                                        onClick={startWebauthnRegistration}
                                        disabled={mfaLoading}
                                    >
                                        {mfaLoading ? 'Registering…' : 'Register this device'}
                                    </Button>
                                    <p className="text-[10px] text-muted-foreground">
                                        You can repeat this on multiple devices and browsers that support passkeys.
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-brand-body">Session history</h2>
                            <div className="space-y-2 text-sm">
                                {sessions.map((s)=>(
                                    <div key={s.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-sm">
                                        <div>
                                            <div className="font-medium text-brand-body">{s.device}</div>
                                            <div className="text-muted-foreground text-xs mt-0.5">{s.location} · {s.lastSeen}</div>
                                        </div>
                                        <Button variant="outline" size="sm" className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow" onClick={()=>setSessions(prev=>prev.filter(x=>x.id!==s.id))}>
                                            Revoke
                                        </Button>
                                    </div>
                                ))}
                                {sessions.length === 0 && (
                                    <div className="text-muted-foreground text-xs">No active sessions (UI-only).</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Billing (stub) removed */}

                {/* Change Password Section (kept functional) */}
                {activeTab === "password" && (
                <div className="mt-1">
                    <h2 className="text-lg font-semibold text-brand-body mb-4">Change Password</h2>
                    {alert && (
                        <div className="mb-4">
                            <AlertMessage
                                message={alert.message}
                                variant={alert.variant}
                                onClose={() => setAlert(null)}
                                duration={6000}
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
                                className="block w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm sm:text-sm"
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
                                className="block w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm sm:text-sm"
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
                                className="block w-full border border-border rounded-lg px-3 py-2 bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm sm:text-sm"
                            />
                            {touched.confirmNewPassword && errors.confirmNewPassword ? (
                                <div className="text-red-600 text-sm mt-1">{errors.confirmNewPassword}</div>
                            ) : null}
                        </div>

                        <div className="flex">
                            <Button
                                variant={"default"}
                                type="submit"
                                className="px-4 py-2 rounded-lg transition-all cursor-pointer font-normal shadow-sm hover:shadow-md text-primary-foreground"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Updating...' : 'Change Password'}
                            </Button>
                        </div>
                    </form>
                </div>
                )}
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