// types/auth.ts
export interface AuthSuccess {
  user: {
    uuid: string;
    name: string;
    role: string;
    firstLogin: boolean;
  };
  token: string;
}

export type AuthResult = AuthSuccess;
