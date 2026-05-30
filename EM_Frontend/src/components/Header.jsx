import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Block from "./custom/Block";
import { PICTURE_BASE_URL } from "@/constant/constant";

const Header = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem("user");
  const data = user ? JSON.parse(user) : null;
  const url = `${PICTURE_BASE_URL}${data.profilePicture}`;
  return (
    <>
      <header className="h-16  gap-3 flex items-center justify-between px-6 border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-md bg-white/95">
        <Block className="flex-1 max-w-lg relative group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
          <input
            type="text"
            placeholder="Search employees, files, reports..."
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all duration-200"
          />
        </Block>

        <Block className="flex items-center gap-4">
          <Button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative"
            variant="icon"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-indigo-600 rounded-full ring-2 ring-white" />
          </Button>

          <Block className="h-8 w-px bg-slate-200" />

          {/* User Profile */}
          <Block
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-50/80 py-1.5 px-2.5 rounded-lg transition-colors group"
            onClick={() => navigate("/employees/elena-rodriguez")}
          >
            <Block className="text-right hidden sm:block">
              <Block className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-indigo-600">
                {data.firstName} {data.lastName}
              </Block>
              <Block className="text-[10px] text-slate-400 font-medium">
                {data.email}
              </Block>
            </Block>
            <Avatar className="h-9 w-9 border border-indigo-100 shadow-sm">
              <AvatarImage
                src={url}
                alt="Elena Rodriguez"
              />
              <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">
                ER
              </AvatarFallback>
            </Avatar>
          </Block>
        </Block>
      </header>
    </>
  );
};

export default Header;
