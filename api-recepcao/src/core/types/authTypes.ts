// types/auth.ts
export interface AuthSuccess {
  ok: true;
  user: {
    uuid: string;
    name: string;
    role: string;
    firstLogin: boolean;
  };
  token: string;
}

export interface AuthFailure {
  ok: false;
  code: number;
  message: string;
}

export type AuthResult = AuthSuccess | AuthFailure;
