export const trimString = (value) => {
  return typeof value === "string" ? value.trim() : value;
};

export const parseBoolean = (value) => {
  if (typeof value === "boolean") return value;

  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return undefined;
};