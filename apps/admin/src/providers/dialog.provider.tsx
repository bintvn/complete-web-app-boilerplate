import { ConfirmDialog } from "@/components/confirm-dialog";
import { DialogContext, type DialogData } from "@/contexts/dialog.context";
import { useCallback, useMemo, useState, type ReactNode } from "react";

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openDialog = useCallback((data: DialogData) => {
    setDialogData(data);
    setIsOpen(true);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setDialogData(null);
  }, []);

  const handleError = useCallback(
    (error: unknown, title?: string) => {
      if (error instanceof Error) {
        openDialog({
          title: title ?? "Terjadi Kesalahan",
          message: error.message,
          onCancel: () => {
            closeDialog();
          },
        });
      } else if (typeof error === "string") {
        openDialog({
          title: title ?? "Terjadi Kesalahan",
          message: error,
          onCancel: () => {
            closeDialog();
          },
        });
      } else {
        openDialog({
          title: title ?? "Terjadi Kesalahan",
          message: "Terjadi kesalahan",
          onCancel: () => {
            closeDialog();
          },
        });
      }
    },
    [openDialog, closeDialog],
  );

  const value = useMemo(
    () => ({
      openDialog,
      closeDialog,
      dialogData,
      isOpen,
      handleError,
    }),
    [openDialog, closeDialog, dialogData, isOpen, handleError],
  );

  return (
    <DialogContext.Provider value={value}>
      <ConfirmDialog
        title={dialogData?.title}
        message={dialogData?.message}
        onCancel={dialogData?.onCancel}
        onConfirm={dialogData?.onConfirm}
        show={isOpen}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        cancelText={dialogData?.cancelText}
        okText={dialogData?.okText}
        cancelVariant={dialogData?.cancelVariant}
        okVariant={dialogData?.okVariant}
      />
      {children}
    </DialogContext.Provider>
  );
};
