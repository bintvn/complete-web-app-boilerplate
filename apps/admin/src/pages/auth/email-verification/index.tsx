import { Link, useSearchParams } from "react-router";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/logo";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@complete-web-app-boilerplate/ui/components/card";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { authVerifyEmail } from "@complete-web-app-boilerplate/sdk";

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Memverifikasi email...");
  const verifiedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan.");
      return;
    }

    if (verifiedTokenRef.current === token) return;

    authVerifyEmail({
      body: {},
    });

    verifiedTokenRef.current = token;
    apiRequest.auth
      .verifyEmail(token)
      .then((response) => {
        setStatus("success");
        setMessage(response.message || "Email berhasil diverifikasi.");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err instanceof Error ? err.message : "Verifikasi email gagal.",
        );
      });
  }, [searchParams]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <Link to="/" className="flex items-center gap-2 self-center font-medium">
        <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-md">
          <Logo size={22} />
        </div>
        Living Kost Pro
      </Link>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Verifikasi email</CardTitle>
          {status === "loading" && (
            <CardDescription>
              Kami sedang memeriksa tautan verifikasi Anda.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="grid gap-4">
          <div
            className={
              status === "error"
                ? "border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
                : status === "success"
                  ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                  : "bg-muted text-muted-foreground rounded-md border px-3 py-2 text-sm"
            }
          >
            {message}
          </div>
          <Button>
            <Link to="/auth/sign-in">Masuk ke dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
