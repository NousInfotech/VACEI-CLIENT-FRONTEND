'use client';

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AlertMessage from "../../../components/AlertMessage";
import { Button } from "@/components/ui/button";
// Using Flaticon icons that are already available in the project

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Use VACEI backend URL (same as onboarding flow and authUtils)
    const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // Get alert message from query param on mount
    useEffect(() => {
        const message = searchParams.get("message");
        if (message) {
            // Clear only auth-related items, preserve onboarding data
            localStorage.removeItem('token');
            localStorage.removeItem('username');
            localStorage.removeItem('email');
            localStorage.removeItem('user_id');
            setAlertMessage(message);
            router.replace("/login", { scroll: false });
        }
    }, [searchParams, router]);

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!email) {
            newErrors.email = "Email is required.";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            newErrors.email = "Enter a valid email.";
        }

        if (!password) {
            newErrors.password = "Password is required.";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);

        try {
            console.log('Attempting login to:', `${backendUrl}auth/login`);
            const response = await fetch(`${backendUrl}auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            console.log('Login response status:', response.status, response.statusText);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to login" }));
                console.error('Login error response:', errorData);
                throw new Error(errorData.message || errorData.error || `Login failed: ${response.status} ${response.statusText}`);
            }

            const responseData = await response.json();
            console.log('Login success response:', responseData);
            
            // Backend response structure: { success: true, data: { user, token, client }, message: "..." }
            const loginData = responseData.data || responseData;
            const token = loginData.token;
            const user = loginData.user;
            
            if (!token) {
                console.warn('No token in response:', responseData);
                throw new Error("No authentication token received. Please contact support.");
            }
            
            // Store auth token and user info
            localStorage.setItem("token", token);
            localStorage.setItem("username", btoa(`${user?.firstName || ''} ${user?.lastName || ''}`));
            localStorage.setItem("email", btoa(email));
            localStorage.setItem("user_id", btoa(user?.id || ''));
            
            // Store client specific IDs for library and other features
            if (loginData.client?.id) {
                localStorage.setItem("client_id", btoa(loginData.client.id));
            }
            if (loginData.client?.folderId) {
                localStorage.setItem("client_folder_id", btoa(loginData.client.folderId));
            }

            // Set cookie for middleware access (works in production)
            // Middleware runs on server and can only access cookies, not localStorage
            const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
            const cookieOptions = isHttps 
                ? 'SameSite=None; Secure; Path=/; Max-Age=86400' // 24 hours, secure for HTTPS (production)
                : 'SameSite=Lax; Path=/; Max-Age=86400'; // 24 hours, works for localhost (development)
            
            if (typeof document !== 'undefined') {
                document.cookie = `client-token=${encodeURIComponent(token)}; ${cookieOptions}`;
            }

            // Check if onboarding is incomplete before redirecting
            const onboardingProgress = localStorage.getItem('onboarding-progress');
            if (onboardingProgress) {
              try {
                const progress = JSON.parse(onboardingProgress);
                // If onboarding is not completed, redirect to onboarding page
                if (progress.onboardingStatus !== 'completed' && 
                    progress.currentStep <= 8 && 
                    (!progress.completedSteps || progress.completedSteps.length < 8)) {
                  router.push("/onboarding");
                  return;
                }
              } catch (error) {
                // If parsing fails, continue to dashboard
                console.warn('Failed to parse onboarding progress:', error);
              }
            }
            
            // Redirect to global dashboard after successful login (onboarding completed or no progress found)
            router.push("/global-dashboard");
        } catch (err) {
            const errorMessage = (err as Error)?.message || "An unknown error occurred";
            setErrors({ email: errorMessage, password: "" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ backgroundColor: `hsl(var(--background))` }}>
            {/* Left Sidebar - Dark Theme */}
            <div 
                className="hidden lg:flex w-1/2 relative overflow-hidden"
                style={{ backgroundColor: `hsl(var(--sidebar-background))` }}
            >
                <div className="relative z-10 flex items-center justify-center h-full p-12">
                    <div className="text-center space-y-8 max-w-lg" style={{ color: `hsl(var(--sidebar-foreground))` }}>
                        <div className="flex items-center justify-center space-x-4 mb-8">
                            <div 
                                className="w-16 h-16 rounded-2xl flex items-center justify-center border"
                                style={{ 
                                    backgroundColor: `hsl(var(--sidebar-foreground) / 0.2)`,
                                    borderColor: `hsl(var(--sidebar-foreground) / 0.3)`
                                }}
                            >
                                <Image
                                    src="/logo/logo2.png"
                                    alt="Logo"
                                    width={56}
                                    height={56}
                                    className="object-contain rounded"
                                />
                            </div>
                            <div className="text-left">
                                <span className="text-3xl font-bold block" style={{ color: `hsl(var(--sidebar-foreground))` }}>Vacei</span>
                                <span className="text-xs font-medium uppercase tracking-wider opacity-70 block" style={{ color: `hsl(var(--sidebar-foreground))` }}>CLIENT SERVICE PORTAL</span>
                            </div>
                        </div>

                        <h1 className="text-4xl font-bold leading-tight" style={{ color: `hsl(var(--sidebar-foreground))` }}>
                            The unified hub for{" "}
                            <span className="block opacity-90" style={{ color: `hsl(var(--sidebar-foreground))` }}>
                                bookkeeping, VAT, audit & CSP
                            </span>
                        </h1>

                        <p className="text-xl leading-relaxed opacity-80" style={{ color: `hsl(var(--sidebar-foreground))` }}>
                            Vacei is your virtual firm: one client portal to collaborate on accounting, audit,
                            payroll, liquidations, share transfers, cross‑border mergers and more.
                        </p>

                        <div className="grid grid-cols-1 gap-4 mt-12">
                            <div 
                                className="rounded-2xl p-4 border"
                                style={{ 
                                    backgroundColor: `hsl(var(--sidebar-foreground) / 0.1)`,
                                    borderColor: `hsl(var(--sidebar-foreground) / 0.2)`
                                }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `hsl(var(--sidebar-foreground) / 0.2)` }}
                                    >
                                        <i className="fi fi-rr-check-circle h-5 w-5" style={{ color: `hsl(var(--sidebar-foreground))` }}></i>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold" style={{ color: `hsl(var(--sidebar-foreground))` }}>Service-based workspaces</h3>
                                        <p className="text-sm opacity-80" style={{ color: `hsl(var(--sidebar-foreground))` }}>Bookkeeping, VAT, payroll, audit & CSP in one place.</p>
                                    </div>
                                </div>
                            </div>

                            <div 
                                className="rounded-2xl p-4 border"
                                style={{ 
                                    backgroundColor: `hsl(var(--sidebar-foreground) / 0.1)`,
                                    borderColor: `hsl(var(--sidebar-foreground) / 0.2)`
                                }}
                            >
                                <div className="flex items-center space-x-3">
                                    <div 
                                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                                        style={{ backgroundColor: `hsl(var(--sidebar-foreground) / 0.2)` }}
                                    >
                                        <i className="fi fi-rr-users h-5 w-5" style={{ color: `hsl(var(--sidebar-foreground))` }}></i>
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-semibold" style={{ color: `hsl(var(--sidebar-foreground))` }}>For clients & partner firms</h3>
                                        <p className="text-sm opacity-80" style={{ color: `hsl(var(--sidebar-foreground))` }}>Invite your accountant or connect with partner firms using Vacei.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Light Theme */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-16" style={{ backgroundColor: `hsl(var(--background))` }}>
                <div className="relative w-full max-w-md space-y-8">
                        {alertMessage && (
                            <AlertMessage
                                message={alertMessage}
                                variant="danger"
                                duration={4000}
                                onClose={() => setAlertMessage(null)}
                            />
                        )}

                    <div className="space-y-6 text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start space-x-3">
                            <div 
                                className="w-12 h-12 rounded-xl flex items-center justify-center"
                                style={{ backgroundColor: `hsl(var(--primary))` }}
                            >
                            <Image
                                src="/logo/logo2.png"
                                    alt="Logo"
                                    width={40}
                                    height={40}
                                    className="object-contain rounded"
                                />
                            </div>
                            <div>
                                <span className="text-2xl font-bold block" style={{ color: `hsl(var(--foreground))` }}>Vacei</span>
                                <span className="text-xs font-medium uppercase tracking-wider opacity-70" style={{ color: `hsl(var(--muted-foreground))` }}>CLIENT SERVICE PORTAL</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-4xl font-bold leading-tight" style={{ color: `hsl(var(--foreground))` }}>Welcome back</h1>
                            <p className="text-lg opacity-70" style={{ color: `hsl(var(--muted-foreground))` }}>
                                Sign in to manage your documents, services and compliance across all entities.
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <div 
                        className="border rounded-2xl shadow-lg p-8"
                        style={{ 
                            backgroundColor: `hsl(var(--card))`,
                            borderColor: `hsl(var(--border))`
                        }}
                    >
                        <form onSubmit={handleLogin} className="space-y-6">
                            {errors.email && !errors.password && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-red-800 font-medium">{errors.email}</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label htmlFor="email" className="text-sm font-medium" style={{ color: `hsl(var(--foreground))` }}>Email Address</label>
                                <div className="relative">
                                    <i className="fi fi-rr-envelope absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: `hsl(var(--muted-foreground))` }}></i>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="h-12 pl-12 pr-4 w-full border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{
                                            backgroundColor: `hsl(var(--input))`,
                                            borderColor: `hsl(var(--border))`,
                                            color: `hsl(var(--foreground))`
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = `hsl(var(--ring))`;
                                            e.target.style.boxShadow = `0 0 0 2px hsl(var(--ring) / 0.2)`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = `hsl(var(--border))`;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                </div>
                                    {errors.email && (
                                    <p className="text-red-500 text-sm">{errors.email}</p>
                                    )}
                                </div>

                            <div className="space-y-3">
                                <label htmlFor="password" className="text-sm font-medium" style={{ color: `hsl(var(--foreground))` }}>Password</label>
                                <div className="relative">
                                    <i className="fi fi-rr-lock absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5" style={{ color: `hsl(var(--muted-foreground))` }}></i>
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="h-12 pl-12 pr-12 w-full border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
                                        style={{
                                            backgroundColor: `hsl(var(--input))`,
                                            borderColor: `hsl(var(--border))`,
                                            color: `hsl(var(--foreground))`
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = `hsl(var(--ring))`;
                                            e.target.style.boxShadow = `0 0 0 2px hsl(var(--ring) / 0.2)`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = `hsl(var(--border))`;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                                        style={{ color: `hsl(var(--muted-foreground))` }}
                                    >
                                        {showPassword ? (
                                            <i className="fi fi-rr-eye-crossed h-5 w-5"></i>
                                        ) : (
                                            <i className="fi fi-rr-eye h-5 w-5"></i>
                                        )}
                                    </button>
                                </div>
                                    {errors.password && (
                                    <p className="text-red-500 text-sm">{errors.password}</p>
                                    )}
                                </div>

                            <div className="flex items-center justify-end">
                                <Link 
                                    href="/forgot-password" 
                                    className="text-sm font-medium hover:opacity-80 transition-opacity"
                                    style={{ color: `hsl(var(--primary))` }}
                                >
                                    Forgot password?
                                </Link>
                        </div>

                            <Button
                                type="submit"
                                variant="default"
                                size="lg"
                                className="w-full h-12 mt-2 rounded-lg font-semibold text-base bg-primary text-primary-foreground hover:opacity-90"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center text-primary-foreground">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Logging in...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center text-primary-foreground">
                                        <i className="fi fi-rr-lock mr-2 h-5 w-5"></i>
                                        Sign In
                                    </span>
                                )}
                            </Button>

                            <div className="mt-4 text-center">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Don't have an account?
                                </p>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="lg"
                                    className="w-full h-12 rounded-lg font-semibold text-base"
                                    onClick={() => router.push("/onboarding")}
                                >
                                    <span className="flex items-center justify-center">
                                        <i className="fi fi-rr-user-add mr-2 h-5 w-5"></i>
                                        Sign Up
                                    </span>
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
