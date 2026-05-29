import React from "react";
import Block from "./custom/Block";
import Sidebar from "./sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <Block className="min-h-screen flex bg-slate-50/50">
      <aside className="w-64 hidden md:flex flex-col bg-white border-r border-slate-200/80 sticky top-0 h-screen transition-all duration-300">
        <Sidebar />
      </aside>

      {/* Main Content Area */}
      <Block className="flex-1 flex flex-col min-w-0">
        <Header />

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 max-w-400 mx-auto w-full">
          {children}
        </main>
      </Block>
    </Block>
  );
}
