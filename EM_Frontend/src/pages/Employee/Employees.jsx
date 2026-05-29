import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const Employees = () => {
  const navigate = useNavigate(); 
  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Employee Directory
          </h1>
          <p className="text-sm text-slate-500">
            Manage 5000 staff members across
            all departments.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Button
            onClick={() => navigate("/employees/new")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-150 flex items-center gap-2"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Add Employee</span>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Employees;
