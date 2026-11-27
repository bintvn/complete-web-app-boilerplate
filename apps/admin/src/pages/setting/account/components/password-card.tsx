"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/api";
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

const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function PasswordCard() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: PasswordFormValues) {
    try {
      setIsSubmitting(true);
      setFeedback(null);
      await apiRequest.account.changePassword({
        password: data.newPassword,
      });
      form.reset();
      setFeedback("Password berhasil diperbarui.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gagal memperbarui password";
      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Kata Sandi</CardTitle>
        <CardDescription>
          Perbarui kata sandi Anda untuk menjaga keamanan akun Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <Controller
            control={form.control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="account-new-password">
                  Kata Sandi Baru
                </FieldLabel>
                <Input
                  id="account-new-password"
                  aria-invalid={fieldState.invalid}
                  type="password"
                  placeholder="Isi Kata Sandi Baru"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="account-confirm-password">
                  Konfirmasi Kata Sandi Baru
                </FieldLabel>
                <Input
                  id="account-confirm-password"
                  aria-invalid={fieldState.invalid}
                  type="password"
                  placeholder="Konfirmasi Kata Sandi Baru"
                  {...field}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
          {feedback ? (
            <p className="text-sm text-muted-foreground">{feedback}</p>
          ) : null}
          <Button
            type="submit"
            className="cursor-pointer"
            disabled={isSubmitting}
          >
            Simpan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
