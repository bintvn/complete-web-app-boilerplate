export type SignUpParams = {
  name: string;
  email: string;
  password: string;
  callbackUrl: string;
};

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpResponse = {
  success: boolean;
  message?: string;
};

export type SignOutResponse = {
  success: boolean;
  message?: string;
};

export type SignInResponse = {
  success: boolean;
  message?: string;
  token?: {
    accessToken: string;
    accessTokenExpiresIn: number;
    accessTokenExpiresAt: number;
  };
};
