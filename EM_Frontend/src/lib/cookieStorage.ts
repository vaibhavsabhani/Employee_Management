const isBrowser = typeof document !== "undefined";

export const setCookie = (
  name: string,
  value: string,
  days: number = 7
) => {
  if (!isBrowser) return;

  const expires = new Date();
  expires.setDate(expires.getDate() + days);

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires.toUTCString()}; path=/`;
};

export const getCookie = (name: string): string | null => {
  if (!isBrowser) return null;

  const cookies = document.cookie.split("; ");

  for (const cookie of cookies) {
    const [key, value] = cookie.split("=");

    if (key === name) {
      return decodeURIComponent(value);
    }
  }

  return null;
};

export const deleteCookie = (name: string) => {
  if (!isBrowser) return;

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};
