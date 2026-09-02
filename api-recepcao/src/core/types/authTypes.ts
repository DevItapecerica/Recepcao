// types/auth.ts
export interface AuthSuccess {
  user: {
    uuid: string;
    name: string;
    role: string;
    firstLogin: boolean;
  };
  token: string;
  refreshToken: string;
}

export type AuthResult = AuthSuccess;

export interface RefreshResult {
  token: string;
  refreshToken: string;
}
