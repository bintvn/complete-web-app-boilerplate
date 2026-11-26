import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@complete-web-app-boilerplate/ui/components/alert-dialog";

type ConfirmDialogProps = {
  show?: boolean;
  title?: string;
  message?: string;
  cancelText?: string;
  okText?: string;
  cancelVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  okVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  onOpenChange?: (open: boolean) => void;
  onCancel?: () => void;
  onConfirm?: () => void | Promise<void>;
};

export function ConfirmDialog({
  show = false,
  title,
  message,
  cancelText,
  okText,
  cancelVariant,
  okVariant,
  onOpenChange,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const handleCancel = () => {
    onCancel?.();
    onOpenChange?.(false);
  };

  const handleOk = async () => {
    await onConfirm?.();
    onOpenChange?.(false);
  };

  return (
    <AlertDialog open={show} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {onConfirm ? (
            <>
              <AlertDialogCancel variant={cancelVariant} onClick={handleCancel}>
                {cancelText || "No"}
              </AlertDialogCancel>
              <AlertDialogAction variant={okVariant} onClick={handleOk}>
                {okText || "Yes"}
              </AlertDialogAction>
            </>
          ) : (
            <AlertDialogCancel variant={cancelVariant} onClick={handleCancel}>
              {cancelText || "Close"}
            </AlertDialogCancel>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
