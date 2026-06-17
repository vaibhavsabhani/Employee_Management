import React, { useState, useMemo } from "react";
import DataTable from "@/components/common/DataTable";
import SearchFilter from "@/components/common/SearchFilter";
import {
  useGetAttendanceQuery,
  useDeleteAttendanceMutation,
  useExportAttendanceQuery,
} from "@/store/Action/attendanceAction";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { useGetEmployeesQuery } from "@/store/Action/Employee";
import { useCreateAttendanceMutation } from "@/store/Action/attendanceAction";
import Layout from "@/components/Layout";

export default function AttendanceList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({});
  const toISODate = (d = new Date()) => {
    const dt = new Date(d);
    const yyyy = dt.getFullYear();
    const mm = String(dt.getMonth() + 1).padStart(2, "0");
    const dd = String(dt.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };
  const [selectedDate, setSelectedDate] = useState(toISODate());
  const todayISO = toISODate();

  const attendanceQueryParams = useMemo(() => {
    const q = { page, limit, ...filters };
    if (selectedDate) {
      q.fromDate = selectedDate;
      q.toDate = selectedDate;
    }
    return q;
  }, [page, limit, filters, selectedDate]);

  const { data, isLoading } = useGetAttendanceQuery(attendanceQueryParams);
  const [deleteAttendance] = useDeleteAttendanceMutation();
  const [createAttendance] = useCreateAttendanceMutation();
  const { data: exportData } = useExportAttendanceQuery();
  const { data: employeesData } = useGetEmployeesQuery({
    page: 1,
    limit: 100,
    filters: { role: "employee", search: filters.search || "" },
  });

  const columns = useMemo(
    () => [
      {
        header: "Employee Name",
        accessor: "employee",
        render: (r) =>
          `${r.employee?.firstName || ""} ${r.employee?.lastName || ""}`,
      },
      {
        header: "Date",
        accessor: "date",
        render: (r) => new Date(r.date).toLocaleDateString(),
      },
      {
        header: "Status",
        accessor: "status",
        render: (r) => <StatusBadge status={r.status || "Pending"} />,
      },
      { header: "Remarks", accessor: "remarks", render: (r) => r.remarks },
      {
        header: "Marked By",
        accessor: "markedBy",
        render: (r) => (r.markedBy ? r.markedBy : "-"),
      },
      {
        header: "Actions",
        accessor: "actions",
        render: (r) => (
          <div className="flex gap-2">
            {!r._id ? (
              <>
                <Button
                  onClick={async () => {
                    try {
                      await createAttendance({
                        employeeId: r.employee._id,
                        date: selectedDate || toISODate(),
                        status: "Present",
                        remarks: "",
                      }).unwrap();
                      alert("Marked Present");
                    } catch (e) {
                      alert(e?.data?.message || e.message || "Failed");
                    }
                  }}
                >
                  Present
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    try {
                      await createAttendance({
                        employeeId: r.employee._id,
                        date: selectedDate || toISODate(),
                        status: "Absent",
                        remarks: "",
                      }).unwrap();
                      alert("Marked Absent");
                    } catch (e) {
                      alert(e?.data?.message || e.message || "Failed");
                    }
                  }}
                >
                  Absent
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline">View</Button>
                <Button variant="ghost">Edit</Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (confirm("Delete?")) {
                      await deleteAttendance(r._id);
                    }
                  }}
                >
                  Delete
                </Button>
              </>
            )}
          </div>
        ),
      },
    ],
    [deleteAttendance, createAttendance, selectedDate],
  );

  const onSearch = (val) => {
    setSearch(val);
    setFilters((f) => ({ ...f, search: val }));
  };

  const onDateChange = (d) => {
    // if user clears or provides invalid value, default to today
    let value = d || toISODate();
    // prevent future date selection
    if (new Date(value) > new Date(todayISO)) {
      value = todayISO;
      alert("Future date not allowed — using today");
    }
    setSelectedDate(value);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      const items = exportData || [];
      const csv = [
        ["Employee", "Date", "Status", "Remarks"].join(","),
        ...items.map((it) =>
          [
            `"${it.employee?.firstName || ""} ${it.employee?.lastName || ""}"`,
            new Date(it.date).toLocaleDateString(),
            it.status,
            `"${(it.remarks || "").replace(/"/g, '""')}"`,
          ].join(","),
        ),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "attendance.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-4 bg-white p-3 rounded shadow-sm">
          <div>
            <label className="block text-sm mb-1">Search</label>
            <SearchFilter value={search} onChange={onSearch} />
          </div>
          <div>
            <label className="block text-sm mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              max={todayISO}
              onChange={(e) => onDateChange(e.target.value)}
              className="p-2 border rounded"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport}>Export CSV</Button>
        </div>
      </div>

      {/* Build rows from active employees; attach attendance if present for selected date */}
      {(() => {
        const employees = employeesData?.users || employeesData?.data || [];
        const attendanceItems = data?.data || [];
        const attendanceByEmp = attendanceItems.reduce((acc, it) => {
          if (it.employee && it.employee._id) acc[it.employee._id] = it;
          return acc;
        }, {});

        const rows = employees.map((emp) => {
          const att = attendanceByEmp[emp._id];
          return {
            _id: att?._id,
            employee: emp,
            // use the selectedDate for the row (ISO yyyy-mm-dd)
            date: selectedDate,
            status: att?.status || "Pending",
            remarks: att?.remarks || "",
            markedBy: att?.markedBy || "",
          };
        });

        return (
          <DataTable
            columns={columns}
            data={rows}
            loading={isLoading}
            page={data?.page || 1}
            limit={limit}
            total={data?.total || employees.length}
            totalPages={data?.totalPages || 1}
            onPageChange={(p) => setPage(p)}
            onLimitChange={(l) => setLimit(l)}
          />
        );
      })()}
    </Layout>
  );
}
