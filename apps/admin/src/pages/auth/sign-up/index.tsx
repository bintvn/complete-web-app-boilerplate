import { Link } from "react-router";
import { type FormEvent, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { SignUpParams } from "@/types/auth";
import {
  Card,
  CardContent,
} from "@complete-web-app-boilerplate/ui/components/card";
import { Logo } from "@/components/logo";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { Label } from "@complete-web-app-boilerplate/ui/components/label";
import { Input } from "@complete-web-app-boilerplate/ui/components/input";
import { AuthVideo } from "@/components/auth-video";

export default function SignUpPage() {
  const { signUp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const signUpData: SignUpParams = {
        name,
        email,
        password,
        callbackUrl: `${window.location.origin}/auth/email-verification`,
      };
      await signUp(signUpData);

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat akun");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="w-full max-w-5xl">
        <Card className="overflow-hidden bg-transparent p-0">
          <CardContent className="grid gap-0 p-0 md:grid-cols-2">
            <div className="bg-card/60 p-6 md:p-8">
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
                  <h1 className="text-2xl font-bold">Sign Up</h1>
                  <p className="text-muted-foreground text-balance">
                    Create your new account.
                  </p>
                </div>
                {success ? (
                  <div className="grid gap-4">
                    <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                      Akun dibuat. Cek inbox email Anda untuk membuka tautan
                      verifikasi.
                    </div>
                    {/* <Button variant="outline" onClick={() => setSuccess(false)}>
                                            Pakai email lain
                                        </Button> */}
                    <Button>
                      <Link to="/auth/sign-in">Kembali ke login</Link>
                    </Button>
                  </div>
                ) : (
                  <form className="grid gap-6" onSubmit={handleSubmit}>
                    {error && (
                      <div className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm">
                        {error}
                      </div>
                    )}
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={name}
                          onChange={(event) => setName(event.target.value)}
                          autoComplete="name"
                          placeholder="Full name"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          autoComplete="email"
                          placeholder="Your email address"
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          placeholder="Your new password"
                          onChange={(event) => setPassword(event.target.value)}
                          autoComplete="new-password"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        className="w-full cursor-pointer"
                        disabled={submitting}
                      >
                        {submitting ? "Creating account..." : "Create Account"}
                      </Button>
                    </div>
                    <div className="text-center text-sm">
                      Have an account?{" "}
                      <Link
                        to="/auth/sign-in"
                        className="underline underline-offset-4"
                      >
                        Sign In
                      </Link>
                    </div>
                  </form>
                )}
              </div>
            </div>
            <AuthVideo videoUrl="/assets/videos/bg-video.mp4" />
          </CardContent>
        </Card>
        <div className="text-muted-foreground mt-6 text-center text-xs text-balance">
          By signing up, you agree to the terms of service and privacy policy{" "}
          <a
            href={import.meta.env.VITE_BASE_URL}
            className="text-stone-500 hover:text-gray-400"
          >
            {import.meta.env.VITE_APP_NAME}
          </a>
          .
        </div>
      </div>
    </>
  );
}
