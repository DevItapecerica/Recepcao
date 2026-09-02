import axios from "axios";

const SERVICE_API = axios.create({
  baseURL: `/api/v1`,
  withCredentials: true,
});

let refreshPromise = null;

const updateAccessToken = (token) => {
  localStorage.setItem("token", token);
  window.dispatchEvent(new CustomEvent("auth:token-refreshed", { detail: token }));
  return token;
};

const expireSession = () => {
  localStorage.removeItem("token");
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
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = token;
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
