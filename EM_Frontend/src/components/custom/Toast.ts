import { toast } from "sonner";

type ToastType = "success" | "error" | "warning" | "info";

export const Toast = (
   res: any,
  type: ToastType = "success"
) => {
  switch (type) {
    case "success":
      toast.success(res?.data?.message || res?.message || "Operation completed successfully");
      break;

    case "error":
      toast.error(res?.error?.data?.message || res?.error?.data?.message || "An error occurred");
      break;

    case "warning":
      toast.warning(res?.warning?.data?.message || "A warning occurred");
      break;

    case "info":
      toast.info(res?.info?.data?.message || "Information available");
      break;

    default:
      toast.error("Something went wrong.");
  }
};