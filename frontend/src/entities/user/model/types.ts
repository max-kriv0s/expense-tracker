export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type AuthTokens = {
  access_token: string;
  refresh_token: string;
};
