"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EmailOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const name = searchParams?.get("name") || "";
  const email = searchParams?.get("email") || "";
  const password = searchParams?.get("pass") || "";
  const phone_number = searchParams?.get("phone") || "";

  console.log(name , email , password)

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // cooldown timer for resend (e.g., 30s)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("Missing email in query parameters.");
      return;
    }
    if (!otp || otp.length !== 6) {
      setError("Enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      // Verify OTP
      const verifyResp = await axios.post("https://schoozy.in/api/auth/verify-otp", {
        email,
        otp,
      });

      if (verifyResp.data?.valid === false) {
        setError(
          verifyResp.data?.message || "OTP verification failed. Please try again."
        );
        setLoading(false);
        return;
      }      

      // Register user (only if OTP passed)
      const registerResp = await axios.post("https://schoozy.in/api/auth/register", {
        name,
        email,
        password,
	phone_number
      });

      if (registerResp.status === 201 || registerResp.data?.user) {
        // success — navigate or show success
        router.push("/login-account");
      } else {
        setError(registerResp.data?.message || "Registration failed.");
      }
    } catch (err: any) {
      console.error("OTP / registration error:", err);
      if (err.response) {
        setError(err.response.data?.message || "Server error occurred.");
      } else {
        setError("Network error. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    if (!email) {
      setError("Missing email to resend OTP to.");
      return;
    }
    setError(null);
    try {
      setResendCooldown(30); // 30s cooldown
      await axios.post("https://schoozy.in/api/auth/request-otp", {
        email,
      });
    } catch (err: any) {
      console.error("Resend OTP error:", err);
      setError("Failed to resend OTP. Try again later.");
      setResendCooldown(0);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Background Blurred Circles */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute bottom-20 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000"></div>

      <Card className="w-full max-w-md relative z-10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
          <CardDescription>
            {"Enter the 6-digit code sent to "}
            <span className="font-medium text-gray-900 dark:text-gray-50">
              {email}
            </span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="otp">Verification Code</Label>
              <Input
                id="otp"
                name="otp"
                type="text"
                placeholder="XXXXXX"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => {
                  const v = e.target.value.replace(/\D/g, "");
                  setOtp(v.slice(0, 6));
                }}
                className="text-center text-xl tracking-widest"
              />
            </div>

            {error && (
              <div className="text-sm text-red-500">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>

            <div className="mt-4 text-center text-sm">
              {"Didn't receive the code? "}
              <Button
                variant="link"
                className="p-0 h-auto"
                onClick={handleResend}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0
                  ? `Resend in ${resendCooldown}s`
                  : "Resend Code"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


