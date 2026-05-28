import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LifeBuoy, 
  LogOut, 
  Search, 
  Bell,
  Building
} from 'lucide-react'

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  
  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Employees', path: '/employees', icon: Users },
    { label: 'Reports', path: '#', icon: FileText, disabled: true },
    { label: 'Settings', path: '#', icon: Settings, disabled: true }
  ]

  const bottomItems = [
    { label: 'Support', path: '#', icon: LifeBuoy, disabled: true }
  ]

  return (
    <div className="min-h-screen flex bg-slate-50/50">
      {/* Sidebar */}
      <aside className="w-64 hidden md:flex flex-col bg-white border-r border-slate-200/80 sticky top-0 h-screen transition-all duration-300">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200/50">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900 leading-tight">Corporate ERP</div>
            <div className="text-[10px] text-indigo-600 font-medium tracking-wider uppercase">Enterprise Management</div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-1 px-4 py-6">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && item.path !== '#'
            const Icon = item.icon
            
            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 cursor-not-allowed opacity-60 text-sm font-medium"
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 uppercase tracking-wider scale-90">Soon</span>
                </div>
              )
            }

            return (
              <Link
                key={item.label}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative ${
                  isActive 
                    ? 'text-indigo-600 bg-indigo-50/80 font-semibold' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-colors duration-200 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span>{item.label}</span>
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-md" />
                )}
              </Link>
            )
          })}

          {/* Bottom Items Divider */}
          <div className="h-px bg-slate-100 my-4" />

          {/* Bottom Items */}
          {bottomItems.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-400 cursor-not-allowed opacity-60 text-sm font-medium"
              >
                <Icon className="h-4.5 w-4.5" />
                <span>{item.label}</span>
              </div>
            )
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all duration-200 mt-auto"
          >
            <LogOut className="h-4.5 w-4.5 text-rose-400 group-hover:text-rose-600" />
            <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-slate-200/80 sticky top-0 z-10 backdrop-blur-md bg-white/95">
          {/* Search bar */}
          <div className="flex-1 max-w-lg relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search employees, files, reports..." 
              className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all duration-200"
            />
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-indigo-600 rounded-full ring-2 ring-white" />
            </button>
            
            <div className="h-8 w-px bg-slate-200" />
            
            {/* User Profile */}
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-slate-50/80 py-1.5 px-2.5 rounded-lg transition-colors group"
              onClick={() => navigate('/employees/elena-rodriguez')}
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-indigo-600">Elena Rodriguez</div>
                <div className="text-[10px] text-slate-400 font-medium">VP of Design</div>
              </div>
              <Avatar className="h-9 w-9 border border-indigo-100 shadow-sm">
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="Elena Rodriguez" />
                <AvatarFallback className="bg-indigo-600 text-white text-xs font-bold">ER</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 max-w-[1600px] mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  )
}
