
export const commonHeaders = (headers) => {
  const token = localStorage.getItem("token");

  if (token) {
    headers.set(
      "Authorization",
      `Bearer ${token}`
    );
  }

  return headers;
};