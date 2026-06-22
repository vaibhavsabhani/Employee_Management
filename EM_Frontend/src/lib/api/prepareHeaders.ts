export const prepareHeaders = (headers: Headers) => {
  if (typeof window !== "undefined") {
    const token = JSON.parse(localStorage.getItem("accessToken")!)

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  headers.set("Accept", "application/json");

  return headers;
};