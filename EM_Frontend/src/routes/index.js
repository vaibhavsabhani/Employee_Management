import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employee/Employees";
import Profile from "@/pages/Profile";
import AddEmployee from "@/pages/Employee/AddEmployee/AddEmployee";
import EditEmployee from "@/pages/Employee/EditEmployee/EditEmployee";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", component: Login },

  {
    path: "/dashboard",
    component: Dashboard,
    protected: true,
  },

  {
    path: "/employees",
    component: Employees,
    protected: true,
  },

  {
    path: "/employees/:id",
    component: Profile,
    protected: true,
  },

  {
    path: "/employees/edit/:id",
    component: EditEmployee,
    protected: true,
  },

  {
    path: "/employees/new",
    component: AddEmployee,
    protected: true,
  },
];

export default routes;
