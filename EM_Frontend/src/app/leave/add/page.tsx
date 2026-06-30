"use client";

import DateInput from "@/src/components/custom/DateInput";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Toast } from "@/src/components/custom/Toast";
import { SelectField } from "@/src/components/form/SelectField";
import { TextareaField } from "@/src/components/form/TextareaField";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Form } from "@/src/components/ui/form";
import { leaveSchema, LeaveFormValues } from "@/src/schema/leave.schema";
import { useAddLeaveMutation } from "@/src/store/action/leave/leave";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
  HALF_DAY_SESSION_OPTIONS,
  LEAVE_DAY_TYPE_OPTIONS,
  LEAVE_TYPE_OPTIONS,
} from "@/src/constant/constant";

const LEAVE_TYPE_FORM_OPTIONS = LEAVE_TYPE_OPTIONS.filter((o) => o.value !== "");

const AddLeavePage = () => {
  const router = useRouter();
  const [addLeave, { isLoading }] = useAddLeaveMutation();

  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      leaveTypeId: "",
      dayType: "full",
      startDate: "",
      endDate: "",
      halfDaySession: undefined,
      reason: "",
    },
  });

  const { control, handleSubmit } = form;

  const dayType = useWatch({ control, name: "dayType" });
  const startDate = useWatch({ control, name: "startDate" });
  const endDate = useWatch({ control, name: "endDate" });

  const isHalf = dayType === "half";

  const totalDays = useMemo(() => {
    if (isHalf) return startDate ? 0.5 : null;
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return null;
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, [isHalf, startDate, endDate]);

  const onSubmit = async (values: LeaveFormValues) => {
    try {
      const half = values.dayType === "half";
      const res = await addLeave({
        leaveTypeId: Number(values.leaveTypeId),
        startDate: values.startDate,
        // half-day applies to a single date
        endDate: half ? values.startDate : values.endDate,
        isHalfDay: half,
        halfDaySession: half ? values.halfDaySession : undefined,
        reason: values.reason,
      }).unwrap();
      Toast(res);
      router.push("/leave");
    } catch (err: any) {
      Toast({ error: err }, "error");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Apply for Leave"
        description="Submit a leave request for admin approval."
      />

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Card className="border-slate-200 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 rounded-lg">
                  <CalendarDays className="size-5" />
                </div>
                <CardTitle className="text-lg font-semibold">Leave Details</CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <SelectField
                  control={control}
                  name="leaveTypeId"
                  label="Leave Type"
                  required
                  placeholder="Select leave type"
                  options={LEAVE_TYPE_FORM_OPTIONS}
                />

                <SelectField
                  control={control}
                  name="dayType"
                  label="Duration"
                  required
                  placeholder="Select duration"
                  options={LEAVE_DAY_TYPE_OPTIONS}
                />
              </div>

              {isHalf ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <DateInput
                    control={control}
                    name="startDate"
                    label="Date"
                    isRequired
                    minDate={new Date()}
                  />
                  <SelectField
                    control={control}
                    name="halfDaySession"
                    label="Which Half"
                    required
                    placeholder="Select first or second half"
                    options={HALF_DAY_SESSION_OPTIONS}
                  />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <DateInput
                    control={control}
                    name="startDate"
                    label="Start Date"
                    isRequired
                    minDate={new Date()}
                  />
                  <DateInput
                    control={control}
                    name="endDate"
                    label="End Date"
                    isRequired
                    minDate={startDate ? new Date(startDate) : new Date()}
                  />
                </div>
              )}

              {totalDays !== null && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-800">
                  <CalendarDays className="size-4 text-violet-600 dark:text-violet-400 shrink-0" />
                  <p className="text-sm text-violet-700 dark:text-violet-300 font-medium">
                    Total:{" "}
                    <span className="font-bold">
                      {totalDays} day{totalDays !== 1 ? "s" : ""}
                    </span>
                  </p>
                </div>
              )}

              <TextareaField
                control={control}
                name="reason"
                label="Reason (optional)"
                placeholder="Briefly describe the reason for your leave..."
                rows={4}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/leave")}
              className="px-6 h-10 border-btn-outline-ring text-btn-outline-fg font-semibold"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="px-6 h-10 flex items-center gap-2">
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isLoading ? "Submitting..." : "Submit Leave"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AddLeavePage;
