"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api";
import { useDialog } from "@/hooks/use-dialog";
import { Button } from "@complete-web-app-boilerplate/ui/components/button";
import { Card } from "@complete-web-app-boilerplate/ui/components/Card";
import { CardContent } from "@complete-web-app-boilerplate/ui/components/Card";

export function DeleteAccountCard() {
  const { openDialog, closeDialog } = useDialog();
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleDeleteAccount() {
    openDialog({
      title: "Konfirmasi Penghapuskan Akun",
      message:
        "Apakah anda yakin ingin menghapus akun anda? Akun anda tidak dapat dikembalikan. Tindakan ini akan menghapus semua data yang terkait dengan akun anda.",
      onCancel() {
        closeDialog();
      },
      async onConfirm() {
        try {
          setIsDeleting(true);
          setErrorMessage(null);
          await apiRequest.account.deleteAccount();
          window.location.reload();
        } catch (error) {
          const message = error instanceof Error ? error.message : "Gagal menghapus akun";
          setErrorMessage(message);
          closeDialog();
        } finally {
          setIsDeleting(false);
        }
      },
      cancelText: "Batal",
      okText: "Hapus Permanen",
      okVariant: "destructive",
    });
  }

  return (
    <Card className="lg:col-span-2">
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="font-semibold">Hapus Akun</h4>
            <p className="text-muted-foreground text-sm">Hapus akun Anda dan semua data terkait secara permanen.</p>
            {errorMessage ? <p className="text-sm text-destructive mt-2">{errorMessage}</p> : null}
          </div>
          <Button onClick={() => handleDeleteAccount()} variant="destructive" type="button" className="cursor-pointer" disabled={isDeleting}>
            {isDeleting ? "Menghapus..." : "Hapus Akun"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
