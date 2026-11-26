import { createContext } from "react";

export interface DialogData {
  title: string;
  message: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onConfirm?: () => void | Promise<any>;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  cancelVariant?:
    "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
  okVariant?:
    "link" | "default" | "destructive" | "outline" | "secondary" | "ghost";
}

interface DialogContextType {
  openDialog: (data: DialogData) => void;
  closeDialog: () => void;
  dialogData: DialogData | null;
  isOpen: boolean;
  handleError: (error: unknown) => void;
}

export const DialogContext = createContext<DialogContextType | undefined>(
  undefined,
);
