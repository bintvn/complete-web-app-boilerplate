import { Link, useNavigate } from "react-router";
import { ArrowLeft, LayoutDashboardIcon, LogInIcon } from "lucide-react";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { BackgroundShell } from "@/components/background-shell";

export default function NotFoundPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    window.document.title = "404 Not Found | Living Kost Pro Dashboard";
  }, []);

  return (
    <BackgroundShell contentClassName="relative z-10 flex min-h-svh items-center justify-center p-6 md:p-10">
      <main className="text-foreground flex min-h-svh items-center justify-center px-6 py-12">
        <div className="mx-auto flex w-full max-w-md flex-col items-center text-center">
          <p className="text-muted-foreground text-sm font-medium">404</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Page Not Found
          </h1>
          <p className="text-muted-foreground mt-3 text-sm leading-6">
            {user ? `Halo ${user.name}! ` : ""}Page you are looking for does not
            exist or has been removed.
          </p>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              type="button"
              variant="outline"
              className="cursor-pointer"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 size-4" />
              Back
            </Button>
            <Button
              type="button"
              variant="default"
              className="cursor-pointer"
              render={<Link to="/" />}
              nativeButton={false}
            >
              {user ? (
                <>
                  <LayoutDashboardIcon data-icon="inline-start" />
                  Ke Dashboard
                </>
              ) : (
                <>
                  <LogInIcon data-icon="inline-start" />
                  Login
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </BackgroundShell>
  );
}
