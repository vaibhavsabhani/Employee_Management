import { toast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";

export const Toast = (res: any, type: ToastType = "success") => {
  const message =
    res?.data?.message ||
    res?.message ||
    res?.error?.data?.message ||
    res?.error?.data?.message;

  switch (type) {
    case "success":
      toast.success(message);
      break;

    case "error":
      toast.error(message);
      break;

    default:
      toast.error("Something went wrong.");
  }
};
