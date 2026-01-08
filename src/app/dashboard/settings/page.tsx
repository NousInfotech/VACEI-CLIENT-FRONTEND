'use client';

import { Suspense, useState, useEffect, ChangeEvent, FocusEvent } from 'react';
import * as Yup from 'yup';
import { ValidationError } from 'yup';
import { changePassword } from '@/api/authService';
import AlertMessage, { AlertVariant } from '@/components/AlertMessage'; // Import AlertMessage
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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

    // --- Local UI state for profile/settings (UI-only, stored locally) ---
    const [profile, setProfile] = useState<{ companyName: string; regNumber: string; address: string; contact: string; }>(() => {
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem("vacei-settings-profile");
            if (raw) {
                try { return JSON.parse(raw); } catch { /* ignore */ }
            }
        }
        return { companyName: "", regNumber: "", address: "", contact: "" };
    });
    const [notifications, setNotifications] = useState<{ emailEnabled: boolean; inAppEnabled: boolean; docRequests: boolean; tasks: boolean; deadlines: boolean; }>(() => {
        if (typeof window !== "undefined") {
            const raw = localStorage.getItem("vacei-settings-notifications");
            if (raw) {
                try { return JSON.parse(raw); } catch { /* ignore */ }
            }
        }
        return { emailEnabled: true, inAppEnabled: true, docRequests: true, tasks: true, deadlines: true };
    });
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [sessions, setSessions] = useState<{ id: string; device: string; location: string; lastSeen: string; }[]>(() => [
        { id: "local-1", device: "Chrome on Windows", location: "Unknown", lastSeen: "Just now" },
    ]);
    const [users, setUsers] = useState<{ id: string; name: string; email: string; role: string; }[]>(() => [
        { id: "1", name: "You", email: "you@example.com", role: "Owner" },
    ]);
    const [newUser, setNewUser] = useState<{ name: string; email: string; role: string; }>({ name: "", email: "", role: "Viewer" });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem("vacei-settings-profile", JSON.stringify(profile));
            localStorage.setItem("vacei-settings-notifications", JSON.stringify(notifications));
        }
    }, [profile, notifications]);

    const [activeTab, setActiveTab] = useState<"general" | "users" | "notifications" | "security" | "billing" | "password">("general");

    return (
        <section className="mx-auto max-w-[1400px] w-full pt-5 space-y-6">
            <div className="bg-card border border-border rounded-card p-6 shadow-md w-full mx-auto space-y-6">
                <h1 className="text-2xl font-semibold text-brand-body">Settings</h1>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-border pb-3">
                    {[
                        { id: "general", label: "Company profile" },
                        { id: "users", label: "Users & roles" },
                        { id: "notifications", label: "Notifications" },
                        { id: "security", label: "Security & sessions" },
                        { id: "billing", label: "Billing" },
                        { id: "password", label: "Password" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-4 py-2 rounded-lg border text-xs font-medium transition-all shadow-sm ${
                                activeTab === tab.id
                                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                                    : "bg-card text-brand-body border-border hover:shadow-md"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Profile */}
                {activeTab === "general" && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-brand-body">Company profile (UI-only)</h2>
                        <div className="grid gap-3 md:grid-cols-2">
                            <Input placeholder="Company name" value={profile.companyName} onChange={(e)=>setProfile(p=>({...p,companyName:e.target.value}))}/>
                            <Input placeholder="Registration number" value={profile.regNumber} onChange={(e)=>setProfile(p=>({...p,regNumber:e.target.value}))}/>
                        </div>
                        <Textarea rows={2} placeholder="Address" value={profile.address} onChange={(e)=>setProfile(p=>({...p,address:e.target.value}))}/>
                        <Input placeholder="Contact details" value={profile.contact} onChange={(e)=>setProfile(p=>({...p,contact:e.target.value}))}/>
                    </div>
                )}

                {/* Users & roles (UI only) */}
                {activeTab === "users" && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-brand-body">Client users & roles (UI-only)</h2>
                        <div className="flex flex-col gap-2 md:flex-row">
                            <Input placeholder="Name" value={newUser.name} onChange={(e)=>setNewUser(u=>({...u,name:e.target.value}))}/>
                            <Input placeholder="Email" value={newUser.email} onChange={(e)=>setNewUser(u=>({...u,email:e.target.value}))}/>
                            <Select value={newUser.role} onChange={(e)=>setNewUser(u=>({...u,role:e.target.value}))}>
                                <option>Owner</option><option>Admin</option><option>Viewer</option>
                            </Select>
                            <Button className="text-xs rounded-lg shadow-sm hover:shadow-md transition-shadow" onClick={()=>{ if(newUser.name && newUser.email){ setUsers(prev=>[...prev,{...newUser,id:Date.now().toString()}]); setNewUser({name:"",email:"",role:"Viewer"});} }}>Add</Button>
                        </div>
                        <div className="space-y-2">
                            {users.map(u=>(
                                <div key={u.id} className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-brand-body">{u.name}</span>
                                        <span className="text-muted-foreground text-xs mt-0.5">{u.email}</span>
                                    </div>
                                    <span className="text-xs rounded-lg bg-muted border border-border px-2.5 py-1 font-medium">{u.role}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Notifications */}
                {activeTab === "notifications" && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-brand-body">Notification preferences (UI-only)</h2>
                        <div className="grid gap-2 md:grid-cols-2">
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={notifications.emailEnabled} onChange={()=>setNotifications(n=>({...n,emailEnabled:!n.emailEnabled}))}/>
                                Email notifications
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={notifications.inAppEnabled} onChange={()=>setNotifications(n=>({...n,inAppEnabled:!n.inAppEnabled}))}/>
                                In-app notifications
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={notifications.docRequests} onChange={()=>setNotifications(n=>({...n,docRequests:!n.docRequests}))}/>
                                Document requests
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={notifications.tasks} onChange={()=>setNotifications(n=>({...n,tasks:!n.tasks}))}/>
                                Task assignments
                            </label>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={notifications.deadlines} onChange={()=>setNotifications(n=>({...n,deadlines:!n.deadlines}))}/>
                                Deadline reminders
                            </label>
                        </div>
                    </div>
                )}

                {/* Security / MFA + Sessions */}
                {activeTab === "security" && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <h2 className="text-lg font-semibold text-brand-body">Security (MFA)</h2>
                            <label className="flex items-center gap-2 text-sm">
                                <input type="checkbox" checked={mfaEnabled} onChange={()=>setMfaEnabled(!mfaEnabled)}/>
                                Enable MFA (UI-only; wire to backend)
                            </label>
                            {mfaEnabled && (
                                <p className="text-xs text-muted-foreground">
                                    After backend is ready, this will show QR / TOTP setup and recovery codes.
                                </p>
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

                {/* Billing (stub) */}
                {activeTab === "billing" && (
                    <div className="space-y-2">
                        <h2 className="text-lg font-semibold text-brand-body">Billing (if enabled)</h2>
                        <p className="text-sm text-muted-foreground">
                            UI stub. Add plan selection & payment details once backend is ready.
                        </p>
                    </div>
                )}

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