import React from "react";
import Block from "./custom/Block";
import { LogOut, Building } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { bottomSidebarItems, sidebarItems } from "@/components/sidebar.route";
import { useLogoutMutation } from "@/store/action";
import { Button } from "./ui/button";

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [logout] = useLogoutMutation();

  const handleLogout = () => {
    logout()
      .unwrap()
      .then((res) => {
        alert(res.message);
        localStorage.removeItem("token");
        navigate("/login");
      });
  };
  return (
    <>
      <Block className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
        <Block className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200/50">
          <Building className="h-5 w-5" />
        </Block>
        <Block>
          <Block className="text-sm font-semibold text-slate-900 leading-tight">
            Corporate ERP
          </Block>
          <Block className="text-[10px] text-indigo-600 font-medium tracking-wider uppercase">
            Enterprise Management
          </Block>
        </Block>
      </Block>

      <nav className="flex-1 flex flex-col gap-1 px-4 py-6">
        {sidebarItems.map((item) => {
          const isActive =
            location.pathname.startsWith(item.path) && item.path !== "#";
          const Icon = item.icon;

          if (item.disabled) {
            return (
              <Block
                key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 cursor-not-allowed opacity-60 text-sm font-medium"
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
                <span className="ml-auto text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-wider scale-90">
                  Soon
                </span>
              </Block>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                isActive
                  ? "text-indigo-600 bg-indigo-50/80 font-semibold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`h-4.5 w-4.5 transition-colors duration-200 ${
                  isActive
                    ? "text-indigo-600"
                    : "text-slate-400 group-hover:text-slate-600"
                }`}
              />
              <span>{item.label}</span>
              {isActive && (
                <Block className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-md" />
              )}
            </Link>
          );
        })}

        {/* Bottom Items Divider */}
        <Block className="h-px bg-slate-100 my-4" />

        {/* Bottom Items */}
        {bottomSidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <Block
              key={item.label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 cursor-not-allowed opacity-60 text-sm font-medium"
            >
              <Icon className="h-4.5 w-4.5" />
              <span>{item.label}</span>
            </Block>
          );
        })}

        {/* Logout */}
        <Button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 mt-auto"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Logout</span>
        </Button>
      </nav>
    </>
  );
};

export default Sidebar;
