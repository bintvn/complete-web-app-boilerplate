export type UserDTO = {
  id: string;
  createdAt: string;
  updatedAt: string | null;
  isDisabled: boolean;
  isEmailVerified: boolean;
  name: string;
  email: string;
};
