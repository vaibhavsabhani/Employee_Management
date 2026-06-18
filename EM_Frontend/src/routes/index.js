import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employee/Employees";
import Profile from "@/pages/Profile";
import AddEmployee from "@/pages/Employee/AddEmployee/AddEmployee";
import EditEmployee from "@/pages/Employee/EditEmployee/EditEmployee";
import { ROUTES } from "@/components/sidebar.route";
import TimeTracking from "@/pages/TimeTracking/TimeTracking";
import NewEntry from "@/pages/TimeTracking/NewEntry";
import { ROLES } from "@/constant/roles";
import Unauthorized from "@/pages/Unauthorized/Unauthorized";

const routes = [
  {
    path: "/",
    redirect: ROUTES.DASHBOARD,
    component: Dashboard,
    protected: true,
    allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    path: ROUTES.LOGIN,
    component: Login,
    allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },

  {
    path: ROUTES.DASHBOARD,
    component: Dashboard,
    protected: true,
    allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },

  {
    path: ROUTES.EMPLOYEES,
    component: Employees,
    protected: true,
    allowedRoles: [ROLES.ADMIN],
  },

  {
    path: ROUTES.EMPLOYEE_PROFILE,
    component: Profile,
    protected: true,
    allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },

  {
    path: ROUTES.EMPLOYEE_EDIT,
    component: EditEmployee,
    protected: true,
    allowedRoles: [ROLES.ADMIN],
  },

  {
    path: ROUTES.EMPLOYEE_ADD,
    component: AddEmployee,
    protected: true,
    allowedRoles: [ROLES.ADMIN],
  },

  {
    path: ROUTES.TIME_TRACKING,
    component: TimeTracking,
    protected: true,
    allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },

  {
    path: ROUTES.TIME_TRACKING_NEW,
    component: NewEntry,
    protected: true,
    allowedRoles: [ROLES.EMPLOYEE],
  },

  {
    path: ROUTES.UNAUTHORIZED,
    component: Unauthorized,
    allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
];

export default routes;
