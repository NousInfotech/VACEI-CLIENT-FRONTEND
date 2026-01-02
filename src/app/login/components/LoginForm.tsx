'use client';

import Image from "next/image";
import Link from "next/link"; // Import Link
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AlertMessage from "../../../components/AlertMessage";
import { Button } from "@/components/ui/button";

export default function LoginForm() {

    const router = useRouter();
    const searchParams = useSearchParams();
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

    // Get alert message from query param on mount
    useEffect(() => {
        const message = searchParams.get("message");
        if (message) {
            localStorage.clear();
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
            const response = await fetch(backendUrl + "auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
                credentials: "include",
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to login");
            }

            const { token, username, user_id } = await response.json();
            localStorage.setItem("token", token);
            localStorage.setItem("username", btoa(username));
            localStorage.setItem("email", btoa(email));
            localStorage.setItem("user_id", btoa(user_id));

            router.push("/dashboard");
        } catch (err) {
            const errorMessage = (err as Error)?.message || "An unknown error occurred";
            setErrors({ email: errorMessage, password: "" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="banner_section min-h-screen flex items-center justify-center">
            <div className="mx-auto max-w-[1200px] px-8 w-full">
                <section className="login_section flex justify-center">
                    <div className="bg-white border border-blue-200/50 rounded-[16px] shadow-sm p-8 w-full max-w-md">
                        {alertMessage && (
                            <AlertMessage
                                message={alertMessage}
                                variant="danger"
                                duration={4000}
                                onClose={() => setAlertMessage(null)}
                            />
                        )}

                        <div className="login_card_header flex flex-col items-center mb-6">
                            <Image
                                src="/logo.svg"
                                alt="logo"
                                width={150}
                                height={150}
                                style={{ objectFit: "contain" }}
                            />
                        </div>

                        <div className="login_card_body text-center">
                            <p className="mb-6 text-gray-600">Please enter your credentials to continue..</p>

                            <form className="flex flex-col gap-4" onSubmit={handleLogin}>
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="border border-blue-200/50 rounded-lg px-3 py-2 bg-white focus:outline-none w-full p-2"
                                    />
                                    {errors.email && (
                                        <p className="text-red-500 text-sm text-start pt-1">{errors.email}</p>
                                    )}
                                </div>

                                <div>
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full border border-blue-200/50 rounded-lg px-3 py-2 bg-white focus:outline-none"
                                    />
                                    {errors.password && (
                                        <p className="text-red-500 text-sm text-start pt-1">{errors.password}</p>
                                    )}
                                </div>

                                <Button
                                    variant={"outline"}
                                    type="submit"
                                    className="px-4 py-2 rounded-lg text-sm cursor-pointer bg-sky-700 border-sky-800 hover:border-black hover:bg-black/85 hover:text-white text-white h-[40px] font-normal mt-2"
                                    disabled={loading}
                                >
                                    {loading ? "Logging in..." : "Login"}
                                </Button>
                            </form>
                        </div>

                        <div className="login_card_footer mt-6 text-center text-sm text-gray-700">
                            <p className="mt-2">
                                <Link href="/forgot-password" className="text-sky-800 font-medium hover:underline">
                                    Forgot Password?
                                </Link>
                            </p>
                        </div>
                    </div>
                </section>
            </div>
        </section>
    );
}
