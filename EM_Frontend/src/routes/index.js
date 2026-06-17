import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employee/Employees";
import Profile from "@/pages/Profile";
import AddEmployee from "@/pages/Employee/AddEmployee/AddEmployee";
import EditEmployee from "@/pages/Employee/EditEmployee/EditEmployee";
import { ROUTES } from "@/components/sidebar.route";
import TimeTracking from "@/pages/TimeTracking/TimeTracking";
import NewEntry from "@/pages/TimeTracking/NewEntry";
import AttendanceList from "@/pages/Attendance/AttendanceList";
import MarkAttendance from "@/pages/Attendance/MarkAttendance";
import EditAttendance from "@/pages/Attendance/EditAttendance";
import MyAttendance from "@/pages/Attendance/MyAttendance";
import AttendanceDetails from "@/pages/Attendance/AttendanceDetails";

import LeaveList from "@/pages/Leave/LeaveList";
import ApplyLeave from "@/pages/Leave/ApplyLeave";
import MyLeaves from "@/pages/Leave/MyLeaves";
import LeaveDetails from "@/pages/Leave/LeaveDetails";
import LeaveBalance from "@/pages/Leave/LeaveBalance";

import Notifications from "@/pages/Notifications";
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

  // Attendance
  {
    path: ROUTES.ATTENDANCE,
    component: AttendanceList,
    protected: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: ROUTES.ATTENDANCE_CREATE,
    component: MarkAttendance,
    protected: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: ROUTES.ATTENDANCE_EDIT,
    component: EditAttendance,
    protected: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: ROUTES.MY_ATTENDANCE,
    component: MyAttendance,
    protected: true,
    allowedRoles: [ROLES.EMPLOYEE],
  },
  {
    path: ROUTES.ATTENDANCE_DETAILS,
    component: AttendanceDetails,
    protected: true,
    allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },

  // Leave
  {
    path: ROUTES.LEAVES,
    component: LeaveList,
    protected: true,
    allowedRoles: [ROLES.ADMIN],
  },
  {
    path: ROUTES.APPLY_LEAVE,
    component: ApplyLeave,
    protected: true,
    allowedRoles: [ROLES.EMPLOYEE],
  },
  {
    path: ROUTES.MY_LEAVES,
    component: MyLeaves,
    protected: true,
    allowedRoles: [ROLES.EMPLOYEE],
  },
  {
    path: ROUTES.LEAVE_DETAILS,
    component: LeaveDetails,
    protected: true,
    allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
  {
    path: ROUTES.LEAVE_BALANCE,
    component: LeaveBalance,
    protected: true,
    allowedRoles: [ROLES.EMPLOYEE],
  },

  // Notifications
  {
    path: ROUTES.NOTIFICATIONS,
    component: Notifications,
    protected: true,
    allowedRoles: [ROLES.ADMIN, ROLES.EMPLOYEE],
  },
];

export default routes;
