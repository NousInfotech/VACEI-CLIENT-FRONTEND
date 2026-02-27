'use client';

import { Suspense, useState, useEffect, ChangeEvent, FocusEvent } from 'react';
import * as Yup from 'yup';
import { ValidationError } from 'yup';
import { changePassword, updateProfile } from '@/api/authService';
import { fetchPreferencesAPI, updatePreferencesAPI } from '@/api/notificationService';
import AlertMessage, { AlertVariant } from '@/components/AlertMessage';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import Dropdown from "@/components/Dropdown";
import { ChevronDown, Settings as SettingsIcon, Users, Bell, Shield, Wallet, Lock } from "lucide-react";
import PillTabs from "@/components/shared/PillTabs";
import { useTabQuery } from "@/hooks/useTabQuery";
import { PageHeader } from "@/components/shared/PageHeader";


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

// Define the Yup validation schema
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
    const [alert, setAlert] = useState<{ message: string; variant: AlertVariant } | null>(null);

    const validateField = async (fieldName: keyof FormData, value: string) => {
        try {
            await validationSchema.validateAt(fieldName, { ...formData, [fieldName]: value });
            setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
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
        validateField(name as keyof FormData, value);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setAlert(null);
        setIsSubmitting(true);

        try {
            await validationSchema.validate(formData, { abortEarly: false });
            setErrors({});

            const response = await changePassword({
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            setAlert({ message: response.message || 'Password updated successfully!', variant: 'success' });
            setFormData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
            setTouched({});

        } catch (error: any) {
            if (error instanceof ValidationError) {
                const newErrors: FormErrors = {};
                error.inner.forEach((validationError) => {
                    if (validationError.path) {
                        newErrors[validationError.path as keyof FormData] = validationError.message;
                    }
                });
                setErrors(newErrors);
                setTouched({ currentPassword: true, newPassword: true, confirmNewPassword: true });
                setAlert({ message: 'Please correct the form errors.', variant: 'danger' });
            } else {
                let errorMessageToDisplay = 'An unexpected error occurred. Please try again.';
                if (error.message && typeof error.message === 'string') {
                    errorMessageToDisplay = error.message;
                } else if (error.error && typeof error.error === 'string') {
                    errorMessageToDisplay = error.error;
                }
                setAlert({ message: errorMessageToDisplay, variant: 'danger' });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const [profile, setProfile] = useState<{ firstName: string; lastName: string; }>({ firstName: "", lastName: "" });
    const [initialLoad, setInitialLoad] = useState(true);
    
    useEffect(() => {
        if (typeof window !== "undefined") {
            const tk = localStorage.getItem("token");
            const uid = localStorage.getItem("user_id");
            if (tk && uid) {
                // Fetch actual user data
                fetch(`${process.env.NEXT_PUBLIC_VACEI_BACKEND_URL || 'http://localhost:5000/api/v1/'}auth/me`, {
                    headers: { 'Authorization': `Bearer ${tk}` }
                }).then(r=>r.json()).then(data => {
                    if (data?.data?.user) {
                        setProfile({
                            firstName: data.data.user.firstName || "",
                            lastName: data.data.user.lastName || ""
                        });
                    }
                }).catch(console.error);
                
                // Fetch notifications
                fetchPreferencesAPI().then(prefs => {
                    setNotifications(prev => ({ ...prev, ...prefs }));
                }).catch(console.error);
            }
        }
    }, []);
    
    const [notifications, setNotifications] = useState<{ emailEnabled: boolean; inAppEnabled: boolean; pushEnabled: boolean; soundEnabled: boolean; }>({ emailEnabled: true, inAppEnabled: true, pushEnabled: true, soundEnabled: true });
    
    const togglePreference = async (key: 'emailEnabled'|'inAppEnabled'|'pushEnabled'|'soundEnabled') => {
        const newValue = !notifications[key];
        setNotifications(prev => ({ ...prev, [key]: newValue }));
        try {
            await updatePreferencesAPI({ [key]: newValue });
        } catch (err) {
            setNotifications(prev => ({ ...prev, [key]: !newValue }));
        }
    };
    
    const handleProfileSubmit = async () => {
        if (!profile.firstName || !profile.lastName) return;
        try {
            await updateProfile(profile);
            setAlert({ message: 'Profile updated successfully!', variant: 'success' });
            
            // Also update local storage username
            if (typeof window !== "undefined") {
                localStorage.setItem("username", `${profile.firstName} ${profile.lastName}`);
                // Refresh window so other components see updated name
                window.dispatchEvent(new Event('storage'));
            }
        } catch (error: any) {
            setAlert({ message: error.message || 'Failed to update profile.', variant: 'danger' });
        }
    };
    
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [sessions, setSessions] = useState<{ id: string; device: string; location: string; lastSeen: string; }[]>(() => [
        { id: "global-local-1", device: "Chrome on Windows", location: "Unknown", lastSeen: "Just now" },
    ]);
    const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string; }[]>(() => [
        { id: "1", name: "You", email: "you@example.com", role: "Platform Admin" },
    ]);
    const [newUser, setNewUser] = useState<{ name: string; email: string; role: string; }>({ name: "", email: "", role: "Viewer" });

    const [activeTab, setActiveTab] = useTabQuery("general");

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
            <PageHeader
                title="Global Settings"
                subtitle="Manage your global account preferences, profile, and security settings."
                icon={SettingsIcon}
            />
            <div className="bg-card border border-border rounded-card p-6 shadow-md w-full mx-auto space-y-6">
                <PillTabs
                    tabs={[
                        { id: "general", label: "Profile", icon: SettingsIcon },
                        { id: "notifications", label: "Notifications", icon: Bell },
                        { id: "security", label: "Security & sessions", icon: Shield },
                        { id: "password", label: "Password", icon: Lock },
                    ]}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />

                {activeTab === "general" && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-brand-body">My Profile</h2>
                        {alert && activeTab === "general" && (
                            <AlertMessage message={alert.message} variant={alert.variant} onClose={() => setAlert(null)} />
                        )}
                        <div className="grid gap-3 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-brand-body mb-1">First Name</label>
                                <Input placeholder="First Name" value={profile.firstName} onChange={(e)=>setProfile(p=>({...p,firstName:e.target.value}))}/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-brand-body mb-1">Last Name</label>
                                <Input placeholder="Last Name" value={profile.lastName} onChange={(e)=>setProfile(p=>({...p,lastName:e.target.value}))}/>
                            </div>
                        </div>
                        <Button onClick={handleProfileSubmit} variant="default" className="mt-2 text-primary-foreground font-normal">Save Changes</Button>
                    </div>
                )}

                {/* Users tab removed */}

                {activeTab === "notifications" && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-brand-body">Global Notification Preferences</h2>
                        <div className="grid gap-4 md:grid-cols-2 mt-4">
                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium text-brand-body">Email notifications</span>
                                <input type="checkbox" checked={Boolean(notifications.emailEnabled)} onChange={()=>togglePreference('emailEnabled')} className="w-4 h-4 text-primary rounded border-gray-300"/>
                            </label>
                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium text-brand-body">In-app notifications</span>
                                <input type="checkbox" checked={Boolean(notifications.inAppEnabled)} onChange={()=>togglePreference('inAppEnabled')} className="w-4 h-4 text-primary rounded border-gray-300"/>
                            </label>
                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium text-brand-body">Push Notifications</span>
                                <input type="checkbox" checked={Boolean(notifications.pushEnabled)} onChange={()=>togglePreference('pushEnabled')} className="w-4 h-4 text-primary rounded border-gray-300"/>
                            </label>
                            <label className="flex items-center justify-between p-3 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
                                <span className="text-sm font-medium text-brand-body">Sound Notifications</span>
                                <input type="checkbox" checked={Boolean(notifications.soundEnabled)} onChange={()=>togglePreference('soundEnabled')} className="w-4 h-4 text-primary rounded border-gray-300"/>
                            </label>
                        </div>
                    </div>
                )}

                {activeTab === "security" && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-brand-body">Security (MFA)</h2>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={mfaEnabled} onChange={()=>setMfaEnabled(!mfaEnabled)}/>
                                Enable MFA (Global UI-only)
                            </label>
                        </div>

                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-brand-body">Global Session history</h2>
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
                            </div>
                        </div>
                    </div>
                )}

                {/* Billing tab removed */}

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
                                onChange={(e: any) => handleChange(e)}
                                onBlur={(e: any) => handleBlur(e)}
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
                                onChange={(e: any) => handleChange(e)}
                                onBlur={(e: any) => handleBlur(e)}
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
                                onChange={(e: any) => handleChange(e)}
                                onBlur={(e: any) => handleBlur(e)}
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
