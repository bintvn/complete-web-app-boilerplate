import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { type FormEvent, useState } from "react";
import Message from "./components/message";
import { useAuth } from "@/hooks/use-auth";
import { AuthApiError } from "@/lib/auth-error";
import { AuthVideo } from "@/components/auth-video";
import { Logo } from "@/components/logo";
import { Card, CardContent } from "@complete-web-app-boilerplate/ui/components/card";
import { Label } from "@complete-web-app-boilerplate/ui/components/label";
import { Input } from "@complete-web-app-boilerplate/ui/components/input";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";

export default function SignInPage() {
  const { signIn, resendVerification } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(location.state?.notice ?? null);
  const [needsVerification, setNeedsVerification] = useState(false);

  const reason = searchParams.get("reason");
  const sessionNotice = reason === "session_required" ? "Sesi Anda tidak ditemukan. Silakan login kembali." : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);
    setNeedsVerification(false);

    try {
      setNotice("Please wait...");
      await signIn({ email, password }).then(() => {
        setNotice(null);
        setNotice("Successfully signed in!");
      });
      const from = location.state?.from;
      const safeFrom = typeof from === "string" && from.startsWith("/") && !from.startsWith("/auth") ? from : "/";
      navigate(safeFrom, { replace: true });
    } catch (error) {
      setNotice(null);

      if (error instanceof AuthApiError && error.code === "EMAIL_NOT_VERIFIED") {
        setNeedsVerification(true);
      }
      if (error instanceof Error) {
        setError(error.message);

        return;
      }

      if (typeof error === "string") {
        setError(error);

        return;
      }

      console.error(error);
      setError("Unknown error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);

    try {
      await resendVerification(email);
      navigate(`/auth/email-verification?email=${encodeURIComponent(email)}`, {
        state: {
          notice: "Jika email terdaftar dan belum diverifikasi, kode telah dikirim.",
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);

        return;
      }

      if (typeof error === "string") {
        setError(error);

        return;
      }

      console.error(error);
      setError("Unknown error");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="w-full max-w-sm md:max-w-4xl flex flex-col gap-6">
      <Card className="overflow-hidden bg-transparent p-0">
        <CardContent className="grid gap-0 p-0 md:grid-cols-2">
          <form className="bg-card/60 p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="mb-2 flex justify-center md:hidden">
                <Link to="/" className="flex items-center gap-2 font-medium">
                  <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                    <Logo size={22} />
                  </div>
                  <span className="text-xl">{import.meta.env.VITE_APP_NAME}</span>
                </Link>
              </div>
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Welcome back</h1>
                <p className="text-muted-foreground text-balance">Login to your {import.meta.env.VITE_APP_NAME} account</p>
              </div>
              {error && <Message tone="error">{error}</Message>}
              {(notice || sessionNotice) && <Message tone="success">{notice ?? sessionNotice}</Message>}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled={submitting}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="name@email.com"
                  required
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/auth/forgot-password" className="ml-auto text-sm underline-offset-2 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  disabled={submitting}
                  placeholder="Password"
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign In"}
              </Button>
              {needsVerification && (
                <Button type="button" variant="outline" className="w-full" disabled={resending || !email} onClick={handleResend}>
                  {resending ? "Mengirim..." : "Kirim ulang email verifikasi"}
                </Button>
              )}
              {needsVerification && (
                <Link className="text-center text-sm underline" to={`/auth/email-verification?email=${encodeURIComponent(email)}`}>
                  Masukkan kode OTP
                </Link>
              )}
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/auth/sign-up" className="underline underline-offset-4">
                  Sign Up
                </Link>
              </div>
            </div>
          </form>
          <AuthVideo videoUrl="/assets/videos/bg-video.mp4" />
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By signing in, you agree to the terms of service and privacy policy{" "}
        <a href={import.meta.env.VITE_BASE_URL} className="text-stone-500 hover:text-gray-400">
          {import.meta.env.VITE_APP_NAME}
        </a>
        .
      </div>
    </div>
  );
}
