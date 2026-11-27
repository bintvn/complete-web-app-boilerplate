"use client";

import { apiRequest } from "@/lib/api";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { type AccountCardBaseProps } from "./types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@complete-web-app-boilerplate/ui/components/card";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@complete-web-app-boilerplate/ui/components/field";
import { Input } from "@complete-web-app-boilerplate/ui/components/input";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { Badge } from "@complete-web-app-boilerplate/ui/components/badge";

const emailSchema = z.object({
  email: z.string().email("Format email tidak valid"),
});

type EmailFormValues = z.infer<typeof emailSchema>;

function sanitizeVerificationCode(rawValue: string) {
  return rawValue.replace(/\D/g, "").slice(0, 6);
}

export function EmailCard({ user, onUserChange }: AccountCardBaseProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingEmailId, setIsVerifyingEmailId] = useState<string | null>(
    null,
  );
  const [verificationCodeByEmailId, setVerificationCodeByEmailId] = useState<
    Record<string, string>
  >({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: { email: "" },
  });
  const hasUnverifiedEmail = user.isEmailVerified;
  const isVerifying = isVerifyingEmailId === user.id;
  const verificationCodeValue = verificationCodeByEmailId[user.id] ?? "";

  async function onSubmit(data: EmailFormValues) {
    if (hasUnverifiedEmail) {
      setFeedback(
        "Verifikasi atau hapus email yang belum terverifikasi sebelum menambahkan email baru.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setFeedback(null);
      const result = await apiRequest.account.changeEmail({
        email: data.email.trim().toLowerCase(),
      });
      onUserChange(result.data);
      form.reset();
      setFeedback("Email berhasil ditambahkan.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal menambahkan email";
      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleVerifyEmail(userEmailId: string) {
    const rawCode = verificationCodeByEmailId[userEmailId]?.trim() ?? "";

    if (!/^\d{6}$/.test(rawCode)) {
      setFeedback("Kode verifikasi harus 6 digit angka.");
      return;
    }

    try {
      setIsVerifyingEmailId(userEmailId);
      setFeedback(null);
      await apiRequest.account.verifyEmail(Number(rawCode));

      if (user) {
        onUserChange({
          ...user,
          isEmailVerified: true,
        });
      }

      setVerificationCodeByEmailId((previous) => ({
        ...previous,
        [userEmailId]: "",
      }));
      setFeedback("Email berhasil terverifikasi.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal verifikasi email";
      setFeedback(message);
    } finally {
      setIsVerifyingEmailId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email</CardTitle>
        <CardDescription>
          Kelola email akun Anda. Notifikasi akan dikirim ke email primary.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="account-email">Tambah Email</FieldLabel>
                <Input
                  id="account-email"
                  type="email"
                  aria-invalid={fieldState.invalid}
                  placeholder="contoh@email.com"
                  disabled={isSubmitting || hasUnverifiedEmail}
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Button type="submit" disabled={isSubmitting || hasUnverifiedEmail}>
            Tambah Email
          </Button>
        </form>
        {hasUnverifiedEmail ? (
          <p className="text-xs text-muted-foreground">
            Anda harus verifikasi atau hapus email yang belum terverifikasi
            sebelum menambahkan email baru atau mengganti primary.
          </p>
        ) : null}

        {feedback ? (
          <p className="text-sm text-muted-foreground">{feedback}</p>
        ) : null}

        <div className="space-y-3">
          <div key={user.id} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="font-medium break-all">{user.email}</p>
              <div className="flex items-center gap-2">
                {user.isEmailVerified ? (
                  <Badge variant="secondary">Verified</Badge>
                ) : (
                  <Badge variant="outline">Unverified</Badge>
                )}
              </div>
            </div>
            {!user.isEmailVerified ? (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  Kode verifikasi sudah dikirim ke email ini. Masukkan 6 digit
                  kode untuk verifikasi.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    inputMode="numeric"
                    placeholder="Masukkan 6 digit kode"
                    value={verificationCodeValue}
                    disabled={isVerifying}
                    onChange={(event) => {
                      const onlyDigits = sanitizeVerificationCode(
                        event.target.value,
                      );
                      setVerificationCodeByEmailId((previous) => ({
                        ...previous,
                        [user.id]: onlyDigits,
                      }));
                    }}
                    onPaste={(event) => {
                      event.preventDefault();
                      const pastedValue = event.clipboardData.getData("text");
                      const onlyDigits = sanitizeVerificationCode(pastedValue);
                      setVerificationCodeByEmailId((previous) => ({
                        ...previous,
                        [user.id]: onlyDigits,
                      }));
                    }}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={isVerifying || verificationCodeValue.length !== 6}
                    onClick={() => handleVerifyEmail(user.id)}
                  >
                    {isVerifying ? "Memverifikasi..." : "Verifikasi"}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
