import type { SessionDTO } from "./session.dto.ts";

export type TokenDTO = {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  isDisabled: boolean;
  expiresAt: string;
  usedAt: string | null;
  revokedAt: string | null;
  tokenHash: string;
  replacedByToken?: TokenDTO | null;
  session: SessionDTO | null;
  replaces?: TokenDTO[];
};
