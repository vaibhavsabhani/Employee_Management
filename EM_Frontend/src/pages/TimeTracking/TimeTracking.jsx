import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  Plus,
  Download,
  ChevronLeft,
  ChevronRight,
  Search,
  FileText,
  User as UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/components/sidebar.route";
import {
  useGetMyTimeEntriesQuery,
  useGetAllTimeEntriesQuery,
  useApproveTimeEntryMutation,
  useRejectTimeEntryMutation,
} from "@/store/action";

const TimeTracking = () => {
  const navigate = useNavigate();
  const userData = useSelector((state) => state.user?.userData);
  const userRole = userData?.role;

  // Employee states
  const [empStatusFilter, setEmpStatusFilter] = useState("all");
  const [empDaysFilter, setEmpDaysFilter] = useState("30");
  const [empPage, setEmpPage] = useState(1);

  // Admin states
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState("all");
  const [adminPage, setAdminPage] = useState(1);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  // API Hooks
  const {
    data: empData,
    isLoading: isEmpLoading,
    isFetching: isEmpFetching,
    refetch: refetchEmp,
  } = useGetMyTimeEntriesQuery(
    {
      status: empStatusFilter,
      days: empDaysFilter,
      page: empPage,
      limit: 10,
    },
    { skip: userRole !== "employee" }
  );

  const {
    data: adminData,
    isLoading: isAdminLoading,
    isFetching: isAdminFetching,
    refetch: refetchAdmin,
  } = useGetAllTimeEntriesQuery(
    {
      status: adminStatusFilter,
      search: adminSearch,
      page: adminPage,
      limit: 10,
    },
    { skip: userRole !== "admin" }
  );

  const [approveTimeEntry, { isLoading: isApproving }] = useApproveTimeEntryMutation();
  const [rejectTimeEntry, { isLoading: isRejecting }] = useRejectTimeEntryMutation();

  // Next deadline calculation (helper)
  const [deadlineStr, setDeadlineStr] = useState("");
  const [daysLeftStr, setDaysLeftStr] = useState("");

  useEffect(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);

    const formattedDate = nextFriday.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });

    setDeadlineStr(formattedDate);
    setDaysLeftStr(`${daysUntilFriday}d left`);
  }, []);

  // Format date helper
  const formatDateCells = (dateStr) => {
    if (!dateStr) return { monthDay: "-", dayName: "-" };
    const d = new Date(dateStr);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    return {
      monthDay: `${months[d.getMonth()]} ${d.getDate()}`,
      dayName: days[d.getDay()],
    };
  };

  // Format 24h to 12h AM/PM helper
  const formatTime12h = (time24) => {
    if (!time24) return "";
    const [hourStr, minStr] = time24.split(":");
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minStr} ${ampm}`;
  };

  // CSV Exporter
  const handleExportCSV = () => {
    const entries = empData?.data || [];
    if (entries.length === 0) {
      toast.error("No entries available to export.");
      return;
    }

    const headers = ["Date", "Start Time", "End Time", "Break (mins)", "Duration (hrs)", "Notes", "Status"];
    const rows = entries.map((entry) => [
      new Date(entry.date).toLocaleDateString(),
      entry.startTime,
      entry.endTime,
      entry.breakDuration,
      (entry.duration / 60).toFixed(2),
      `"${entry.notes.replace(/"/g, '""')}"`,
      entry.status,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `my_time_entries_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV export downloaded successfully!");
  };

  // Handle Approve
  const handleApprove = async (id) => {
    try {
      const res = await approveTimeEntry(id).unwrap();
      toast.success(res?.message || "Time entry approved.");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to approve time entry.");
    }
  };

  // Handle Reject
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error("Please enter a reason for rejection.");
      return;
    }

    try {
      const res = await rejectTimeEntry({ id: rejectingId, reason: rejectionReason }).unwrap();
      toast.success(res?.message || "Time entry rejected.");
      setRejectingId(null);
      setRejectionReason("");
    } catch (err) {
      toast.error(err?.data?.message || "Failed to reject time entry.");
    }
  };

  // Render Status Badge helper
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Approved
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-100">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-100">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
    }
  };

  const isPageLoading = isEmpLoading || isAdminLoading;
  const isPageFetching = isEmpFetching || isAdminFetching;

  return (
    <Layout>
      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white rounded-xl shadow-xl max-w-md w-full border border-slate-200 p-6 space-y-4 animate-in fade-in-50 zoom-in-95"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-800">Reject Time Entry</h3>
              <p className="text-xs text-slate-500 mt-1">
                Please provide a brief reason for rejecting this employee's manual time entry.
              </p>
            </div>

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g., Please double check the break duration or notes..."
              className="w-full text-sm p-3 border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />

            <div className="flex justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason("");
                }}
                className="px-4 text-slate-600 border-slate-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isRejecting}
                className="px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium"
              >
                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Main Workspace container */}
      <div className="space-y-6 pb-12">
        {/* BREADCRUMB & HEADER */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
              <span>{userRole === "admin" ? "Admin" : "Employees"}</span>
              <span>&gt;</span>
              <span className="text-slate-600">Time Tracking</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {userRole === "admin" ? "Time Tracking Approvals" : "My Time Entries"}
            </h1>
            <p className="text-sm text-slate-500">
              {userRole === "admin"
                ? "Review, approve, and reject manual time entries submitted by employees."
                : "Review and manage your submitted manual hours."}
            </p>
          </div>

          {userRole === "employee" && (
            <Button
              onClick={() => navigate(ROUTES.TIME_TRACKING_NEW)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2 font-medium"
            >
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          )}
        </div>

        {/* EMPLOYEE STATS CARDS */}
        {userRole === "employee" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Pending Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Pending Hours
                </span>
                <span className="text-3xl font-bold text-slate-800 block">
                  {empData?.stats?.pendingHours || "0.0"} <span className="text-sm font-medium text-slate-400">HRS</span>
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock className="h-6 w-6" />
              </div>
            </div>

            {/* Approved Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Approved This Month
                </span>
                <span className="text-3xl font-bold text-slate-800 block">
                  {empData?.stats?.approvedHours || "0.0"} <span className="text-sm font-medium text-slate-400">HRS</span>
                </span>
              </div>
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>

            {/* Next Submission Deadline */}
            <div className="bg-indigo-600 p-6 rounded-xl text-white shadow-sm flex items-center justify-between relative overflow-hidden group">
              <div className="space-y-1.5 relative z-10">
                <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider block">
                  Next Submission Deadline
                </span>
                <span className="text-lg font-bold block">{deadlineStr || "Friday, Oct 27"}</span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 uppercase tracking-wider">
                  {daysLeftStr || "10d left"}
                </span>
              </div>
              <Calendar className="h-16 w-16 absolute -right-2 -bottom-2 text-indigo-500/35 transition-transform group-hover:scale-110 duration-300" />
            </div>
          </div>
        )}

        {/* FILTERS & SEARCH ROW */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm">
          {/* Left: Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {userRole === "admin" && (
              <div className="relative flex-1 sm:w-64 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => {
                    setAdminSearch(e.target.value);
                    setAdminPage(1);
                  }}
                  placeholder="Search employees or entries..."
                  className="w-full pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500 bg-slate-50/50 hover:bg-slate-50/80 transition-colors"
                />
              </div>
            )}

            {/* Status Filter */}
            <select
              value={userRole === "admin" ? adminStatusFilter : empStatusFilter}
              onChange={(e) => {
                const val = e.target.value;
                if (userRole === "admin") {
                  setAdminStatusFilter(val);
                  setAdminPage(1);
                } else {
                  setEmpStatusFilter(val);
                  setEmpPage(1);
                }
              }}
              className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50/80 transition-colors focus:outline-none text-slate-700 font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            {/* Time period filter for employee only */}
            {userRole === "employee" && (
              <select
                value={empDaysFilter}
                onChange={(e) => {
                  setEmpDaysFilter(e.target.value);
                  setEmpPage(1);
                }}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-slate-50/50 hover:bg-slate-50/80 transition-colors focus:outline-none text-slate-700 font-medium"
              >
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
            )}
          </div>

          {/* Right: Export Button */}
          {userRole === "employee" && (
            <Button
              variant="outline"
              onClick={handleExportCSV}
              className="border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Report CSV
            </Button>
          )}
        </div>

        {/* LOADING & EMPTY STATES */}
        {isPageLoading ? (
          <div className="h-64 rounded-xl border border-slate-200 bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
              <span className="text-sm font-medium text-slate-400">Loading time tracking records...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
            {/* TABLE */}
            <div className="overflow-x-auto datatable-scroll">
              <table className="w-full border-collapse text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <tr>
                    {userRole === "admin" && <th className="px-6 py-4">Employee</th>}
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Work Description</th>
                    {userRole === "admin" ? (
                      <th className="px-6 py-4">Shift</th>
                    ) : (
                      <>
                        <th className="px-6 py-4">Start</th>
                        <th className="px-6 py-4">End</th>
                      </>
                    )}
                    <th className="px-6 py-4">Duration</th>
                    <th className="px-6 py-4">Status</th>
                    {userRole === "admin" && <th className="px-6 py-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {/* Map Entries */}
                  {userRole === "employee" ? (
                    empData?.data?.length > 0 ? (
                      empData.data.map((entry) => {
                        const { monthDay, dayName } = formatDateCells(entry.date);
                        return (
                          <tr key={entry._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-800">{monthDay}</span>
                                <span className="text-xs text-slate-400 font-normal">{dayName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="max-w-xs md:max-w-md truncate text-slate-800" title={entry.notes}>
                                {entry.notes}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-700">{formatTime12h(entry.startTime)}</td>
                            <td className="px-6 py-4 text-slate-700">{formatTime12h(entry.endTime)}</td>
                            <td className="px-6 py-4 text-slate-800 font-semibold">
                              {(entry.duration / 60).toFixed(1)} HRS
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col gap-1 items-start">
                                {renderStatusBadge(entry.status)}
                                {entry.status === "Rejected" && entry.rejectionReason && (
                                  <span className="text-[10px] text-rose-500 font-normal max-w-[200px] truncate" title={entry.rejectionReason}>
                                    Reason: {entry.rejectionReason}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                          <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                          No manual time entries found for this period.
                        </td>
                      </tr>
                    )
                  ) : adminData?.data?.length > 0 ? (
                    adminData.data.map((entry) => {
                      const { monthDay } = formatDateCells(entry.date);
                      const empName = entry.employee
                        ? `${entry.employee.firstName} ${entry.employee.lastName}`
                        : "Unknown Employee";
                      const empEmail = entry.employee?.email || "-";
                      return (
                        <tr key={entry._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold shrink-0 border border-slate-200">
                                {entry.employee?.firstName?.[0]}
                                {entry.employee?.lastName?.[0]}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-slate-800 truncate">{empName}</span>
                                <span className="text-xs text-slate-400 font-normal truncate">{empEmail}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-800">{monthDay}</td>
                          <td className="px-6 py-4">
                            <div className="max-w-xs md:max-w-md truncate text-slate-800" title={entry.notes}>
                              {entry.notes}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-700">
                            {formatTime12h(entry.startTime)} - {formatTime12h(entry.endTime)}
                          </td>
                          <td className="px-6 py-4 text-slate-800 font-semibold">
                            {(entry.duration / 60).toFixed(1)} hrs
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1 items-start">
                              {renderStatusBadge(entry.status)}
                              {entry.status === "Rejected" && entry.rejectionReason && (
                                <span className="text-[10px] text-rose-500 font-normal max-w-[200px] truncate" title={entry.rejectionReason}>
                                  Reason: {entry.rejectionReason}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            {entry.status === "Pending" ? (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setRejectingId(entry._id)}
                                  className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 font-semibold text-xs border border-transparent hover:border-rose-100"
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApprove(entry._id)}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 font-semibold text-xs px-3"
                                >
                                  Approve
                                </Button>
                              </div>
                            ) : (
                              <span className="text-xs text-slate-400 font-normal italic">Action taken</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                        <FileText className="h-10 w-10 mx-auto text-slate-300 mb-2" />
                        No manual time entries found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION FOOTER */}
            {((userRole === "employee" && empData?.pagination?.totalPages > 1) ||
              (userRole === "admin" && adminData?.pagination?.totalPages > 1)) && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
                <span className="text-xs text-slate-400 font-medium">
                  Showing{" "}
                  {userRole === "employee"
                    ? `${(empPage - 1) * 10 + 1}-${Math.min(empPage * 10, empData?.pagination?.total)} of ${empData?.pagination?.total}`
                    : `${(adminPage - 1) * 10 + 1}-${Math.min(adminPage * 10, adminData?.pagination?.total)} of ${adminData?.pagination?.total}`}{" "}
                  entries
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={userRole === "employee" ? empPage === 1 : adminPage === 1}
                    onClick={() => {
                      if (userRole === "employee") {
                        setEmpPage((prev) => Math.max(1, prev - 1));
                      } else {
                        setAdminPage((prev) => Math.max(1, prev - 1));
                      }
                    }}
                    className="border-slate-200"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Render Page Numbers */}
                  {Array.from({
                    length: userRole === "employee" ? empData?.pagination?.totalPages : adminData?.pagination?.totalPages,
                  }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = userRole === "employee" ? empPage === pageNum : adminPage === pageNum;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => {
                          if (userRole === "employee") {
                            setEmpPage(pageNum);
                          } else {
                            setAdminPage(pageNum);
                          }
                        }}
                        className={`h-8 w-8 text-xs font-semibold rounded-lg border transition-all ${
                          isActive
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="icon-sm"
                    disabled={
                      userRole === "employee"
                        ? empPage === empData?.pagination?.totalPages
                        : adminPage === adminData?.pagination?.totalPages
                    }
                    onClick={() => {
                      if (userRole === "employee") {
                        setEmpPage((prev) => prev + 1);
                      } else {
                        setAdminPage((prev) => prev + 1);
                      }
                    }}
                    className="border-slate-200"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TimeTracking;