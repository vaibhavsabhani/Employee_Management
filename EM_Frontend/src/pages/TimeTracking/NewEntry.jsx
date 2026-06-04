import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Clock, ShieldAlert, HelpCircle } from "lucide-react";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import DateInput from "@/components/custom/DateInput";
import InputField from "@/components/custom/InputField";
import TextAreaField from "@/components/custom/TextAreaField";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/components/sidebar.route";
import { useAddTimeEntryMutation } from "@/store/action";

const manualEntrySchema = z.object({
  date: z.string().nonempty("Date of work is required"),
  breakDuration: z
    .preprocess(
      (val) => (val === "" ? 0 : Number(val)),
      z.number().min(0, "Break duration cannot be negative")
    )
    .default(0),
  startTime: z.string().nonempty("Start time is required"),
  endTime: z.string().nonempty("End time is required"),
  notes: z.string().nonempty("Work description / notes is required"),
});

const NewEntry = () => {
  const navigate = useNavigate();
  const [addTimeEntry, { isLoading }] = useAddTimeEntryMutation();
  const [estimatedDuration, setEstimatedDuration] = useState("- hrs - mins");

  const form = useForm({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      date: "",
      breakDuration: 0,
      startTime: "",
      endTime: "",
      notes: "",
    },
  });

  const startTime = form.watch("startTime");
  const endTime = form.watch("endTime");
  const breakDuration = form.watch("breakDuration");

  // Calculate estimated total duration dynamically
  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(":").map(Number);
      const [endH, endM] = endTime.split(":").map(Number);
      let startMins = startH * 60 + startM;
      let endMins = endH * 60 + endM;

      if (endMins < startMins) {
        endMins += 24 * 60; // Overnight shift
      }

      const breakMins = Number(breakDuration) || 0;
      const diffMins = endMins - startMins - breakMins;

      if (diffMins >= 0) {
        const hrs = Math.floor(diffMins / 60);
        const mins = diffMins % 60;
        setEstimatedDuration(`${hrs} hrs ${mins} mins`);
      } else {
        setEstimatedDuration("Invalid (Break exceeds working time)");
      }
    } else {
      setEstimatedDuration("- hrs - mins");
    }
  }, [startTime, endTime, breakDuration]);

  const onSubmit = (data) => {
    addTimeEntry(data).then((res) => {
      if (res?.error) {
        toast.error(res?.error?.data?.message || "Failed to submit time entry.");
      } else {
        toast.success("Time entry submitted successfully!");
        navigate(ROUTES.TIME_TRACKING);
      }
    });
  };

  return (
    <Layout>
      <div className=" mx-auto space-y-6 pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
          <span>Employees</span>
          <span>&gt;</span>
          <span>Time Tracking</span>
          <span>&gt;</span>
          <span className="text-slate-600">Manual Entry</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manual Time Entry</h1>
        </div>

        {/* Alert Banner */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 flex gap-3 text-sm text-slate-600 shadow-sm">
          <Clock className="h-5 w-5 shrink-0 mt-0.5 text-indigo-600" />
          <div>
            <span className="font-semibold text-slate-800">Use this form</span> to log hours for completed shifts or sessions that weren't captured automatically. Ensure all timestamps are accurate to prevent payroll delays.
          </div>
        </div>

        {/* Form Container */}
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="bg-white rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date of Work */}
            <DateInput
              control={form.control}
              name="date"
              label="DATE OF WORK"
              isRequired
            />

            {/* Break Duration */}
            <InputField
              control={form.control}
              name="breakDuration"
              label="BREAK DURATION (MINS)"
              type="number"
              placeholder="e.g. 30"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Start Time */}
            <InputField
              control={form.control}
              name="startTime"
              label="START TIME"
              type="time"
              required
            />

            {/* End Time */}
            <InputField
              control={form.control}
              name="endTime"
              label="END TIME"
              type="time"
              required
            />
          </div>

          {/* Work Description / Notes */}
          <TextAreaField
            control={form.control}
            name="notes"
            label="WORK DESCRIPTION / NOTES"
            placeholder="Briefly document the tasks performed during this session..."
            isRequired
            className="min-h-[120px]"
          />

          {/* Estimated Total Duration Banner */}
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Estimated Total Duration
              </div>
              <div className="text-lg font-bold text-slate-700 mt-1">
                {estimatedDuration}
              </div>
            </div>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              type="button"
              disabled={isLoading}
              onClick={() => navigate(ROUTES.TIME_TRACKING)}
              className="px-6 border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
            >
              {isLoading ? "Submitting..." : "Submit Entry"}
            </Button>
          </div>
        </form>

        {/* Bottom Cards Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Clock className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Recent History</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              View your last 5 manual entries and their approval status.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Policy Compliance</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Manual entries require supervisor approval within 48 hours.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm space-y-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <HelpCircle className="h-5 w-5" />
            </div>
            <h3 className="font-semibold text-slate-800 text-sm">Need Help?</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Contact payroll support for corrections or general inquiries.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 text-[11px] text-slate-400 flex flex-col md:flex-row items-center justify-between gap-2 border-t border-slate-200/60">
          <div>
            © 2026 Corporate ERP Systems. All activity is logged for security auditing.
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NewEntry;
