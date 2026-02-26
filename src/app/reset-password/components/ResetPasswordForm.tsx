'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'; // For accessing URL query parameters
import AlertMessage from "@/components/AlertMessage"; // This is the correct import



export default function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const otp = searchParams.get('otp') || searchParams.get('token'); // Support both 'otp' and 'token' for backward compatibility
    const emailFromUrl = searchParams.get('email');

    const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";

    const [otpValue, setOtpValue] = useState(otp || "");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ otp?: string; password?: string; confirmPassword?: string }>({});
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [messageVariant, setMessageVariant] = useState<"success" | "danger">("danger");

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!otpValue) {
            newErrors.otp = "OTP is required.";
        } else if (otpValue.length < 6) {
            newErrors.otp = "Enter a valid 6-digit OTP.";
        }

        if (!password) {
            newErrors.password = "New password is required.";
        } else if (password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long.";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required.";
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setAlertMessage(null);

        if (!emailFromUrl) {
            setAlertMessage("Email is missing. Please try again from the forgot password page.");
            setMessageVariant("danger");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}auth/reset-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailFromUrl,
                    otp: otpValue,
                    password: password,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Failed to reset password." }));
                throw new Error(errorData.message || errorData.error || `Failed to reset password: ${response.status}`);
            }

            const responseData = await response.json();
            // Backend response structure: { message: string }
            const message = responseData.message || "Your password has been reset successfully! You can now log in with your new password.";

            setAlertMessage(message);
            setMessageVariant("success");
            setOtpValue("");
            setPassword("");
            setConfirmPassword("");
            setErrors({});

        } catch (err) {
            const errorMessage = (err as Error)?.message || "An unknown error occurred. Please try again.";
            setAlertMessage(errorMessage);
            setMessageVariant("danger");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="banner_section min-h-screen flex items-center justify-center">
            <div className="mx-auto max-w-[1200px] px-8 w-full">
                <section className="login_section flex justify-center">
                    <div className="bg-card border border-border rounded-[16px] shadow-md p-8 w-full max-w-md">
                        {alertMessage && (
                            <AlertMessage
                                message={alertMessage}
                                variant={messageVariant}
                                duration={messageVariant === "success" ? 8000 : 4000}
                                onClose={() => setAlertMessage(null)}
                            />
                        )}

                        <div className="login_card_header flex flex-col items-center mb-6">
                            <Image
                                src="/logo.svg"
                                alt="logo"
                                width={120}
                                height={120}
                                style={{ objectFit: "contain" }}
                            />
                        </div>

                        <div className="login_card_body text-center">
                            <h2 className="text-2xl font-bold mb-4 text-gray-800">Reset Your Password</h2>
                            <p className="mb-6 text-muted-foreground">Enter the OTP sent to your email and your new password.</p>

                            <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="6-Digit OTP"
                                        maxLength={6}
                                        value={otpValue}
                                        onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                                        className="form-control w-full border p-2 rounded tracking-widest text-center font-bold"
                                    />
                                    {errors.otp && (
                                        <p className="text-red-500 text-sm text-start pt-1">{errors.otp}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="form-control w-full border p-2 rounded"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm text-start pt-1">{errors.password}</p>
                                    )}
                                </div>
                                <div>
                                    <input
                                        type="password"
                                        placeholder="Confirm New Password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="form-control w-full border p-2 rounded"
                                    />
                                    {errors.confirmPassword && (
                                        <p className="text-red-500 text-sm text-start pt-1">{errors.confirmPassword}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    className="bg-primary text-card-foreground py-3 rounded"
                                    disabled={loading}
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>
                        </div>

                        <div className="login_card_footer mt-6 text-center text-sm text-brand-body">
                            <p className="mt-2">
                                <Link href="/login" className="text-primary font-semibold hover:underline">
                                    Back to Login
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
}