import { Link, useNavigate } from "react-router";
import { apiRequest } from "@/lib/api";
import { type FormEvent, useState } from "react";
import { useDialog } from "@/hooks/use-dialog";
import {
  Card,
  CardContent,
} from "@complete-web-app-boilerplate/ui/components/card";
import { Logo } from "@/components/logo";
import { Label } from "@complete-web-app-boilerplate/ui/components/label";
import { Input } from "@complete-web-app-boilerplate/ui/components/input";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { AuthVideo } from "@/components/auth-video";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { closeDialog, openDialog } = useDialog();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiRequest.auth.forgotPassword(email);

      openDialog({
        title: "Reset Password",
        message: "Jika email terdaftar, link reset password sudah dikirim.",
        cancelText: "Kembali ke login",
        onCancel: () => {
          closeDialog();
          navigate("/auth/sign-in", { replace: true });
        },
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Gagal mengirim link reset password",
      );
    } finally {
      setLoading(false);
      setEmail("");
    }
  }

  return (
    <div className="w-full max-w-sm md:max-w-4xl">
      <Card className="overflow-hidden bg-transparent p-0">
        <CardContent className="grid gap-0 p-0 md:grid-cols-2">
          <form className="bg-card/60 p-6 md:p-8" onSubmit={onSubmit}>
            <div className="flex flex-col gap-6">
              <div className="mb-2 flex justify-center md:hidden">
                <Link to="/" className="flex items-center gap-2 font-medium">
                  <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                    <Logo size={24} />
                  </div>
                  <span className="text-xl">
                    {import.meta.env.VITE_APP_NAME}
                  </span>
                </Link>
              </div>
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Lupa password?</h1>
                <p className="text-muted-foreground text-balance">
                  Masukkan email untuk reset password akun Anda.
                </p>
              </div>
              {error && (
                <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>
              <Button
                type="submit"
                className="w-full cursor-pointer"
                disabled={loading}
              >
                {loading ? "Mengirim..." : "Kirim Link Reset"}
              </Button>
              <div className="text-center text-sm">
                Sudah ingat password?{" "}
                <Link
                  to="/auth/sign-in"
                  className="underline underline-offset-4"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </form>
          <AuthVideo videoUrl="/assets/videos/bg-video.mp4" />
        </CardContent>
      </Card>
    </div>
  );
}
