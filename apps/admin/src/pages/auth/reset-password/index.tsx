import { Link, useNavigate, useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import { isRateLimitApiError, normalizeApiError } from "../../../lib/error";
import { apiRequest } from "@/lib/api";
import type { DashboardApiRequestClient } from "@/lib/api/dashboard-api-request";
import { Card, CardContent } from "@complete-web-app-boilerplate/ui/components/card";
import { Label } from "@complete-web-app-boilerplate/ui/components/label";
import { Input } from "@complete-web-app-boilerplate/ui/components/input";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { Logo } from "@/components/logo";
type ResetPasswordPageStatus = "checking" | "form" | "success" | "used" | "expired" | "invalid" | "rate-limited";

const resetPasswordTokenChecks = new Map<string, Promise<{ success: true }>>();

function checkResetPasswordTokenOnce(apiRequest: DashboardApiRequestClient, token: string) {
  const existingCheck = resetPasswordTokenChecks.get(token);

  if (existingCheck) return existingCheck;

  const check = apiRequest.auth.checkResetPasswordToken(token).finally(() => {
    window.setTimeout(() => {
      resetPasswordTokenChecks.delete(token);
    }, 1500);
  });

  resetPasswordTokenChecks.set(token, check);

  return check;
}

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<ResetPasswordPageStatus>("checking");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = params.get("token") ?? "";

  useEffect(() => {
    let mounted = true;

    async function checkToken() {
      if (!token) {
        navigate("/auth/sign-in", { replace: true });
        return;
      }

      try {
        setLoading(true);
        await checkResetPasswordTokenOnce(apiRequest, token).then(() => setLoading(false));
        if (mounted) setStatus("form");
      } catch (err) {
        if (!mounted) return;

        const normalizedError = normalizeApiError(err);

        if (isRateLimitApiError(err)) {
          setStatus("rate-limited");
          setMessage(normalizedError.message || "Terlalu banyak percobaan. Coba lagi beberapa saat.");
          return;
        }

        if (normalizedError.code === "RESET_PASSWORD_TOKEN_USED") {
          setStatus("used");
          setMessage("Link reset password ini sudah digunakan.");
          return;
        }

        if (normalizedError.code === "TOKEN_EXPIRED") {
          setStatus("expired");
          setMessage("Link reset password sudah kadaluarsa.");
          return;
        }

        setStatus("invalid");
        setMessage(normalizedError.message || "Link reset password tidak valid.");
      }
    }

    checkToken();

    return () => {
      mounted = false;
    };
  }, [navigate, token]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setError("Ulangi password harus sama.");
      return;
    }
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await apiRequest.auth.resetPassword({ token, password });
      setPassword("");
      setConfirmPassword("");
      setStatus("success");
      setMessage("Password berhasil diperbarui. Silakan login.");
    } catch (err) {
      const normalizedError = normalizeApiError(err);

      if (isRateLimitApiError(err)) {
        setError(normalizedError.message || "Terlalu banyak percobaan. Coba lagi beberapa saat.");
      } else if (normalizedError.code === "RESET_PASSWORD_TOKEN_USED") {
        setStatus("used");
        setMessage("Link reset password ini sudah digunakan.");
      } else if (normalizedError.code === "TOKEN_EXPIRED") {
        setStatus("expired");
        setMessage("Link reset password sudah kadaluarsa.");
      } else {
        setError(normalizedError.message || "Gagal reset password");
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "checking") {
    return (
      <div className="w-full max-w-sm">
        <Card className="overflow-hidden p-0">
          <CardContent className="text-muted-foreground p-6 text-center text-sm md:p-8">Memeriksa tautan reset password...</CardContent>
        </Card>
      </div>
    );
  }

  const title =
    status === "used"
      ? "Link sudah digunakan"
      : status === "expired"
        ? "Link sudah kadaluarsa"
        : status === "invalid"
          ? "Link tidak valid"
          : status === "rate-limited"
            ? "Terlalu banyak percobaan"
            : "Reset Password";

  return (
    <div className="w-full max-w-sm">
      <Card className="overflow-hidden p-0">
        <CardContent className="p-6 md:p-8">
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div className="mb-2 flex justify-center">
              <Link to="/" className="flex items-center gap-2 font-medium">
                <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                  <Logo size={24} />
                </div>
                <span className="text-xl">{import.meta.env.VITE_APP_NAME}</span>
              </Link>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">{title}</h1>
            </div>
            {message && (
              <div
                className={
                  status === "success"
                    ? "rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800"
                    : "rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                }
              >
                {message}
              </div>
            )}
            {error && <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">{error}</div>}
            {status === "form" && (
              <>
                <div className="grid gap-3">
                  <Label htmlFor="password">Password Baru</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="confirm-password">Ulangi Password Baru</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading || !token}>
                  {loading ? "Memproses..." : "Simpan Password"}
                </Button>
              </>
            )}
            {(status === "expired" || status === "invalid") && (
              <Button>
                <Link to="/forgot-password">Kirim ulang link reset</Link>
              </Button>
            )}
            <Link to="/auth/sign-in" className="text-center text-sm underline underline-offset-4">
              Back to Sign In
            </Link>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
