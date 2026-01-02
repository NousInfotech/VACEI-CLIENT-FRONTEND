'use client';

import Image from "next/image";
import Link from "next/link"; // Import Link
import { useState } from "react"; // useEffect and useRouter/useSearchParams are not needed for a simple forgot password form
import AlertMessage from "../../../components/AlertMessage";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordForm() {
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({}); // Only email error is needed
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [messageVariant, setMessageVariant] = useState<"success" | "danger">("danger"); // To differentiate success/error alerts

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
    setAlertMessage(null); // Clear previous alerts

    try {
      const response = await fetch(backendUrl + "user/forgot-password", { // Assuming this is your forgot password endpoint
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        credentials: "include", // Adjust if your API doesn't require credentials for this
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send password reset email.");
      }

      setAlertMessage(data.message || "If an account with that email exists, a password reset link has been sent to your inbox.");
      setMessageVariant("success");
      setEmail(""); // Clear email field on success
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
          <div className="bg-white border border-blue-200/50 rounded-[16px] shadow-sm p-8 w-full max-w-md">
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
              <p className="mb-6 text-gray-600">Enter your email to receive a password reset link.</p>

              <form className="flex flex-col gap-4" onSubmit={handleForgotPassword}>
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

                <Button
                  variant={"outline"}
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm cursor-pointer bg-sky-700 border-sky-800 hover:border-black hover:bg-black/85 hover:text-white text-white h-[40px] font-normal mt-2"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </div>

            <div className="login_card_footer mt-6 text-center text-sm text-gray-700">
              <p className="mt-2">
                Remember your password?{" "}
               <Link href="/login" className="text-sky-800 font-semibold hover:underline">
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