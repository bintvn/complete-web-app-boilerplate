import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { Input } from "@complete-web-app-boilerplate/ui/components/input";
import { Label } from "@complete-web-app-boilerplate/ui/components/label";
import { Card, CardContent, CardHeader, CardTitle } from "@complete-web-app-boilerplate/ui/components/card";

export default function EmailVerificationPage() {
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification } = useAuth();
  const [email] = useState(params.get("email") ?? "");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(location.state?.error ?? null);
  const [notice, setNotice] = useState<string | null>(location.state?.notice ?? null);

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

      setNotice("Jika email terdaftar dan belum diverifikasi, kode telah dikirim.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengirim kode.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Email Verification</CardTitle>
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
          <Label htmlFor="verify-email">Email</Label>
          <Label htmlFor="verify-code">OTP Code</Label>
          <Input
            id="verify-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            required
            disabled={busy}
          />
          <Button type="submit" disabled={busy}>
            Verify
          </Button>
          <Button type="button" variant="outline" disabled={busy || !email} onClick={resend}>
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
