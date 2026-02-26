'use client';

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AlertMessage from "../../../components/AlertMessage";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const backendUrl = process.env.NEXT_PUBLIC_VACEI_BACKEND_URL?.replace(/\/?$/, "/") || "http://localhost:5000/api/v1/";

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({}); 
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<"success" | "danger">("danger");

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!email) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setAlertMessage(null);

    try {
      const response = await fetch(`${backendUrl}auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to send OTP." }));
        throw new Error(errorData.message || "Failed to send OTP.");
      }

      setAlertMessage("OTP sent successfully! Redirecting...");
      setMessageVariant("success");
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
      }, 1500);
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
                duration={messageVariant === "success" ? 8000 : 4000} // Longer duration for success messages
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
              <p className="mb-6 text-muted-foreground">Enter your email to receive a password reset link.</p>

              <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
                <div>
                  <input
                    type="text"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border border-border rounded-lg px-3 py-2 bg-card focus:outline-none w-full p-2"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm text-start pt-1">{errors.email}</p>
                  )}
                </div>

                <Button
                  variant={"outline"}
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm cursor-pointer bg-sidebar-background border-sky-800 hover:border-black hover:bg-black/85 hover:text-card-foreground text-card-foreground h-[40px] font-normal mt-2"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </div>

            <div className="login_card_footer mt-6 text-center text-sm text-brand-body">
              <p className="mt-2">
                Remember your password?{" "}
               <Link href="/login" className="text-brand-body font-semibold hover:underline">
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