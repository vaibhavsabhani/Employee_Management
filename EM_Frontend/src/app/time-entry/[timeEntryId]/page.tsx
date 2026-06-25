"use client";

import DateInput from "@/src/components/custom/DateInput";
import { PageHeader } from "@/src/components/custom/PageHeader";
import { Toast } from "@/src/components/custom/Toast";
import { InputField } from "@/src/components/form/InputField";
import { TextareaField } from "@/src/components/form/TextareaField";
import { Button } from "@/src/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { Form } from "@/src/components/ui/form";
import {
  TimeEntryFormValues,
  timeEntrySchema,
} from "@/src/schema/time-entry.schema";
import {
  useAddTimeEntryMutation,
  useLazyGetTimeEntryQuery,
  useResubmitTimeEntryMutation,
} from "@/src/store/action/time-entry/timeEntry";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Clock, Loader2, Save } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";

const Page = () => {
  const params = useParams();
  const router = useRouter();
  const isAdd = params?.timeEntryId === "add";
  const entryId = isAdd ? null : (params?.timeEntryId as string);

  const [getTimeEntry] = useLazyGetTimeEntryQuery();
  const [addTimeEntry, { isLoading: isAdding }] = useAddTimeEntryMutation();
  const [resubmitTimeEntry, { isLoading: isResubmitting }] =
    useResubmitTimeEntryMutation();

  const isLoading = isAdding || isResubmitting;

  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntrySchema) as Resolver<TimeEntryFormValues>,
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
      breakDuration: 0,
      notes: "",
    },
  });

  const { control, reset, handleSubmit } = form;

  // Track rejection reason for display
  const rejectionReason = form.watch("_rejectionReason" as any);

  useEffect(() => {
    if (!entryId) return;
    getTimeEntry(entryId)
      .unwrap()
      .then((res) => {
        const e = res?.data;
        if (!e) return;
        const dateStr = e.date
          ? new Date(e.date).toISOString().split("T")[0]
          : "";
        reset({
          date: dateStr,
          startTime: e.startTime ?? "",
          endTime: e.endTime ?? "",
          breakDuration: e.breakDuration ?? 0,
          notes: e.notes ?? "",
          _rejectionReason: e.rejectionReason ?? "",
        } as any);
      })
      .catch(() => {});
  }, [entryId, getTimeEntry, reset]);

  const onSubmit = async (data: TimeEntryFormValues) => {
    if (isAdd) {
      const res = await addTimeEntry(data);
      if (res?.error) {
        Toast(res, "error");
        return;
      }
      Toast(res, "success");
      router.push("/time-entry");
    } else {
      const res = await resubmitTimeEntry({ id: entryId!, ...data });
      if (res?.error) {
        Toast(res, "error");
        return;
      }
      Toast(res, "success");
      router.push("/time-entry");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdd ? "Add Time Entry" : "Edit & Resubmit Time Entry"}
        description={
          isAdd
            ? "Record Your Daily Work Hours and tasks for Project Tracking."
            : "Correct your time entry and resubmit for approval."
        }
      />

      {!isAdd && rejectionReason && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300">
          <AlertCircle className="size-5 mt-0.5 shrink-0 text-red-500 dark:text-red-400" />
          <div>
            <p className="text-sm font-semibold">Rejected by admin</p>
            <p className="text-sm mt-0.5">{rejectionReason}</p>
          </div>
        </div>
      )}

      <Form {...form}>
        <form
          id="time-entry-form"
          onSubmit={handleSubmit(onSubmit)}
          className="relative"
        >
          <Card className="border-slate-200 shadow-sm flex-7">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
                  <Clock className="size-5" />
                </div>
                <CardTitle className="text-lg font-semibold">
                  Time Entry Details
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <DateInput
                  control={form.control}
                  name="date"
                  label="Date"
                  minDate={new Date(Date.now())}
                  maxDate={new Date()}
                  isRequired
                />

                <InputField
                  control={form.control}
                  name="breakDuration"
                  label="Break Duration (Minutes)"
                  placeholder="60"
                  type="number"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField
                  control={form.control}
                  name="startTime"
                  label="Start Time"
                  type="time"
                  required
                />

                <InputField
                  control={form.control}
                  name="endTime"
                  label="End Time"
                  type="time"
                  required
                />
              </div>

              <TextareaField
                control={form.control}
                name="notes"
                label="Work Notes"
                placeholder="Describe what you worked on today..."
                rows={5}
              />
            </CardContent>
          </Card>

          <div className="flex items-center justify-center gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="px-6 h-10 border-btn-outline-ring text-btn-outline-fg font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 h-10 flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              {isLoading
                ? "Saving..."
                : isAdd
                  ? "Save Time Entry"
                  : "Resubmit for Approval"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Page;
