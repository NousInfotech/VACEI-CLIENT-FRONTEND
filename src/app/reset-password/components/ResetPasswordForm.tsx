'use client';

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'; // For accessing URL query parameters
import AlertMessage from "@/components/AlertMessage"; // This is the correct import



export default function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    const emailFromUrl = searchParams.get('email');

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; // Ensure this is configured

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [messageVariant, setMessageVariant] = useState<"success" | "danger">("danger");

    useEffect(() => {
        if (!token || !emailFromUrl) {
            setAlertMessage("Invalid or missing password reset link parameters.");
            setMessageVariant("danger");
        }
    }, [token, emailFromUrl]);

    const validate = () => {
        const newErrors: typeof errors = {};

        if (!newPassword) {
            newErrors.newPassword = "New password is required.";
        } else if (newPassword.length < 6) {
            newErrors.newPassword = "Password must be at least 6 characters long.";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Confirm password is required.";
        } else if (newPassword !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setAlertMessage(null); // Clear previous alerts

        if (!token || !emailFromUrl) {
            setAlertMessage("Invalid password reset link. Please try again from the forgot password page.");
            setMessageVariant("danger");
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`${backendUrl}user/reset-password`, { // Adjust to your actual reset password endpoint
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    token,
                    email: emailFromUrl,
                    newPassword,
                }),
                credentials: "include",
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to reset password.");
            }

            setAlertMessage(data.message || "Your password has been reset successfully! You can now log in with your new password.");
            setMessageVariant("success");
            setNewPassword(""); // Clear fields on success
            setConfirmPassword("");
            setErrors({}); // Clear any errors

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
                            <p className="mb-6 text-muted-foreground">Enter your new password below.</p>

                            <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
                                <div>
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="form-control w-full border p-2 rounded"
                                    />
                                    {errors.newPassword && (
                                        <p className="text-red-500 text-sm text-start pt-1">{errors.newPassword}</p>
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