import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { InputOTPWithSeparator } from "@/components/InputOTPWithSeparator";
import { Label } from "@complete-web-app-boilerplate/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@complete-web-app-boilerplate/ui/components/card";

export default function EmailVerificationPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();
  const [email] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    location.state?.error ?? null,
  );
  const [notice, setNotice] = useState<string | null>(
    location.state?.notice ?? null,
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      await verifyEmail(email.trim(), code);

      navigate("/auth/sign-in", {
        replace: true,
        state: { notice: "Email verified successfully. You can now sign in." },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verifikasi gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      await resendVerification(email.trim());

      setNotice(
        "If email is registered and not verified, code has been resent.",
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim kode.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-sm bg-card/60">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">Email verification</CardTitle>
        <CardDescription>
          Enter the six-digit verification code sent to your email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={submit}>
          {error && (
            <p role="alert" className="text-destructive text-sm">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="text-sm">
              {notice}
            </p>
          )}
          <Label htmlFor="verify-code" className="sr-only">
            OTP Code
          </Label>
          <InputOTPWithSeparator
            id="verify-code"
            containerClassName="justify-center"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]*"
            value={code}
            onChange={setCode}
            required
            disabled={busy}
          />
          <Button type="submit" disabled={busy || code.length !== 6}>
            Verify
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy || !email}
            onClick={resend}
          >
            Resend Code
          </Button>
          <Link className="text-center text-sm" to="/auth/sign-in">
            Back To Sign In
          </Link>
        </form>
      </CardContent>
    </Card>
  );
}
