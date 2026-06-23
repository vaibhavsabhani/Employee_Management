export const setCookie = (
  name: string,
  value: string,
  days: number = 7
) => {
  const expires = new Date();
  expires.setDate(expires.getDate() + days);

  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; expires=${expires.toUTCString()}; path=/`;
};

export const getCookie = (name: string): string | null => {
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
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
};