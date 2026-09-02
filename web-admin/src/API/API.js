import axios from "axios";

const SERVICE_API = axios.create({
  baseURL: `/api/v1`,
  withCredentials: true,
});

let refreshPromise = null;
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token || null;
};

const updateAccessToken = (token) => {
  setAccessToken(token);
  window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: token }));
  return token;
};

const expireSession = () => {
  setAccessToken(null);
  window.dispatchEvent(new Event("auth:session-expired"));
};

export const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post("/api/v1/login/refresh", {}, { withCredentials: true })
      .then(({ data }) => updateAccessToken(data.token))
      .catch((error) => {
        expireSession();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

SERVICE_API.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = accessToken;
  return config;
});

SERVICE_API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const request = error.config;
    const url = request?.url || "";
    const isAuthEndpoint =
      url === "/login" ||
      url.endsWith("/login/refresh") ||
      url.endsWith("/login/logout");

    if (error.response?.status !== 401 || request?._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    request._retry = true;
    try {
      const token = await refreshAccessToken();
      request.headers.Authorization = token;
      if (url.endsWith("/login/verify") && request.data) {
        const body =
          typeof request.data === "string" ? JSON.parse(request.data) : request.data;
        request.data = JSON.stringify({ ...body, token });
      }
      return SERVICE_API(request);
    } catch {
      return Promise.reject(error);
    }
  },
);

export default SERVICE_API;
