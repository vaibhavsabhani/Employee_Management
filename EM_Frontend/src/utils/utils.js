export const commonHeaders = (headers) => {
  const token = localStorage.getItem("token");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return headers;
};

export const cleanFilters = (filters = {}) => {
  return Object.fromEntries(
    Object.entries(filters).filter(([_, value]) => {
      if (typeof value === "string") {
        return value.trim() !== "";
      }

      return value !== undefined && value !== null;
    }),
  );
};

export const cleanParams = (obj = {}) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== undefined && value !== null && value !== "",
    ),
  );
};
