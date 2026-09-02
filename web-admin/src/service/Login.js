import API, { refreshAccessToken } from "@API/API";

export const handdleLogin = async (username, password) => {
  const { data } = await API.post("/login", {
    username: username,
    password: password,
  });

  return data;
};

export const validateToken = async (token) => {
  const { data } = await API.post("/login/verify", { token });

  return data;
};

export const refreshSession = async () => refreshAccessToken();

export const logoutSession = async () => {
  const { data } = await API.post("/login/logout");
  return data;
};

export const alterPassword = async (req) => {
  const { old_password, new_password } = req;

  const { data } = await API.post(
    "/login/alterpwd",
    { old_password, new_password }
  );

  return data;
};
