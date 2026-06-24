import { getCookie } from "../cookieStorage";

export const prepareHeaders = (headers: Headers) => {
  if (typeof window !== "undefined") {
    const token = getCookie("accessToken") || "null" as string | null;

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  headers.set("Accept", "application/json");

  return headers;
};