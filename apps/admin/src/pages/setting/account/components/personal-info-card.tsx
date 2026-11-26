"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { Controller, Form, useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/api";
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

const personalInfoSchema = z.object({
  name: z.string().min(1, "Nama lengkap wajib diisi"),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

export function PersonalInfoCard({ user, onUserChange }: AccountCardBaseProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const form = useForm<PersonalInfoFormValues>({
    resolver: zodResolver(personalInfoSchema),
    mode: "onSubmit",
    reValidateMode: "onSubmit",
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    form.reset({
      name: user?.name ?? "",
    });
  }, [form, user]);

  async function onSubmit(data: PersonalInfoFormValues) {
    try {
      setIsSubmitting(true);
      setFeedback(null);
      const result = await apiRequest.account.edit({
        name: data.name,
      });
      onUserChange(result.data);
      setFeedback("Informasi pribadi berhasil diperbarui.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal memperbarui informasi pribadi";
      setFeedback(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Pribadi</CardTitle>
        <CardDescription>
          Perbarui informasi pribadi Anda yang akan ditampilkan di profil Anda.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <Controller
              control={form.control}
              name="name"
              render={({ field }) => (
                <Field className="self-start">
                  <FieldLabel>Nama Lengkap</FieldLabel>
                  <Input placeholder="Nama lengkap anda" {...field} />
                  <FieldError />
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
        </Form>
      </CardContent>
    </Card>
  );
}
