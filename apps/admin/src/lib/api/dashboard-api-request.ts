import { BaseApiRequestClient } from "./base.ts";
import type { ApiSuccess } from "../../types/api.ts";
import type { UserDTO } from "@/types/dtos/user.dto.ts";
import type { SearchDTO } from "@/types/common.ts";

export class DashboardApiRequestClient extends BaseApiRequestClient {
  readonly account = {
    me: () => {
      return this.authenticatedRequest<ApiSuccess<UserDTO>>("/account/me", {
        method: "GET",
      });
    },
    edit: (input: { name?: string | null }) => {
      return this.authenticatedRequest<ApiSuccess<UserDTO>>("/account/edit", {
        method: "PATCH",
        body: JSON.stringify(input),
      });
    },
    changePassword: (input: { password: string }) => {
      return this.authenticatedRequest<ApiSuccess<UserDTO>>(
        "/account/change-password",
        {
          method: "PATCH",
          body: JSON.stringify(input),
        },
      );
    },
    changeEmail: (input: { email: string }) => {
      return this.authenticatedRequest<ApiSuccess<UserDTO>>("/account/email", {
        method: "POST",
        body: JSON.stringify(input),
      });
    },
    deleteAccount: () => {
      return this.authenticatedRequest<ApiSuccess<null>>(
        "/account/delete-account",
        {
          method: "DELETE",
        },
      );
    },
    verifyEmail: (code: number) =>
      this.authenticatedRequest<ApiSuccess<null>>(`/account/email/verify`, {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
  };

  readonly search = (query: string) =>
    this.authenticatedRequest<ApiSuccess<SearchDTO[]>>(
      `/search?query=${encodeURIComponent(query)}`,
      {
        method: "GET",
      },
    );
}
