import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let isRefreshing = false;
let refreshQueue: Array<(success: boolean) => void> = [];

function processQueue(success: boolean) {
  refreshQueue.forEach((resolve) => resolve(success));
  refreshQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((success) => {
            if (success) resolve(api(originalRequest));
            else reject(error);
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post("/api/auth/refresh", {}, { withCredentials: true });
        processQueue(true);
        return api(originalRequest);
      } catch {
        processQueue(false);
        window.location.href = "/cms/login";
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
