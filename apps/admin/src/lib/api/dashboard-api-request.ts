/* eslint-disable @typescript-eslint/no-unused-vars */
import type { UserDTO } from "@/types/dtos";
import type { ApiSuccess } from "@/types/api";
import type { SearchDTO } from "@/types/common";
const unavailable = async (): Promise<never> => {
  throw new Error("Fitur ini belum tersedia.");
};
export const apiRequest = {
  search: (_query: string): Promise<ApiSuccess<SearchDTO[]>> => unavailable(),
  auth: {
    forgotPassword: (_email: string): Promise<void> => unavailable(),
    checkResetPasswordToken: (_token: string): Promise<{ success: true }> =>
      unavailable(),
    resetPassword: (_input: {
      token: string;
      password: string;
    }): Promise<void> => unavailable(),
  },
  account: {
    me: (): Promise<ApiSuccess<UserDTO>> => unavailable(),
    edit: (_input: { name: string }): Promise<ApiSuccess<UserDTO>> =>
      unavailable(),
    changeEmail: (_input: { email: string }): Promise<ApiSuccess<UserDTO>> =>
      unavailable(),
    verifyEmail: (_code: number): Promise<void> => unavailable(),
    changePassword: (_input: { password: string }): Promise<void> =>
      unavailable(),
    deleteAccount: (): Promise<void> => unavailable(),
  },
};
export type DashboardApiRequestClient = typeof apiRequest;
