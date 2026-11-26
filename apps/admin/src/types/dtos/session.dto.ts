import type { TokenDTO } from "./token.dto";
import type { UserDTO } from "./user.dto";

export type SessionDTO = {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  isDisabled: boolean;
  expiresAt: string;
  endedAt: string | null;
  userAgent: string;
  ipAddress: string;
  user?: UserDTO;
  tokens?: TokenDTO[];
};
