import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  Rocket, 
  DollarSign, 
  Plus, 
  ArrowUpRight, 
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserPlus
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const list = useSelector((state) => state.employees.list)
  
  // Calculate dynamic stats
  const totalEmployeesCount = 1278 + list.length
  const activeCount = 937 + list.filter(e => e.status === 'Active').length
  const leaveCount = 45 + list.filter(e => e.status === 'On Leave').length

  const activities = [
    {
      id: 1,
      type: 'user',
      title: 'Sarah Jenkins joined the Engineering team',
      time: '10 mins ago',
      icon: UserPlus,
      bg: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 2,
      type: 'report',
      title: 'Monthly report for Q3 logistics finalized',
      time: '2 hours ago',
      icon: CheckCircle,
      bg: 'bg-indigo-50 text-indigo-600'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Budget limit: Project Nebula exceeded 92% threshold',
      time: '4 hours ago',
      icon: AlertTriangle,
      bg: 'bg-amber-50 text-amber-600'
    },
    {
      id: 4,
      type: 'system',
      title: 'System Admin updated security protocols',
      time: '1 day ago',
      icon: Clock,
      bg: 'bg-slate-50 text-slate-600'
    }
  ]

  const departments = [
    { name: 'Engineering', percentage: 78, employees: 580, color: 'bg-indigo-600' },
    { name: 'Sales & Marketing', percentage: 62, employees: 340, color: 'bg-violet-500' },
    { name: 'Operations', percentage: 45, employees: 210, color: 'bg-emerald-500' },
    { name: 'Human Resources', percentage: 28, employees: 94, color: 'bg-rose-500' },
    { name: 'Finance', percentage: 18, employees: 60, color: 'bg-amber-500' }
  ]

  return (
    <Layout>
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Header section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
            <p className="text-sm text-slate-500">Welcome back, Elena. Here's what's happening across the enterprise today.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            <Button 
              onClick={() => navigate('/employees/new')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-150 flex items-center gap-2"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Add Employee</span>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Total Employees */}
          <Card className="border-slate-100 shadow-sm relative overflow-hidden bg-white group hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-600" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Employees</span>
              <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Users className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4.5xl font-bold text-slate-900 tracking-tight">{totalEmployeesCount.toLocaleString()}</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                  <span className="font-sans">↑</span> 2.5%
                </span>
                <span className="text-xs text-slate-400">Since last quarter</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Active Projects */}
          <Card className="border-slate-100 shadow-sm relative overflow-hidden bg-white group hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Projects</span>
              <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center text-violet-600">
                <Rocket className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4.5xl font-bold text-slate-900 tracking-tight">42</div>
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                  8 New
                </span>
                <span className="text-xs text-slate-400">Initiated this month</span>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Budget Utilization */}
          <Card className="border-slate-100 shadow-sm relative overflow-hidden bg-white group hover:shadow-md transition-all duration-200">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget Utilization</span>
              <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-4.5xl font-bold text-slate-900 tracking-tight">84.2%</div>
              <div className="mt-3">
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: '84.2%' }} />
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-400">Management vs Expense</span>
                  <span className="text-xs font-medium text-slate-600">Target: 90%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lower Grid: Department Overview & Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Department Overview - occupies 3 columns */}
          <Card className="lg:col-span-3 border-slate-100 shadow-sm bg-white">
            <CardHeader className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold text-slate-950">Department Overview</CardTitle>
                <select className="text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-250 rounded-md py-1.5 px-2.5 outline-none focus:border-indigo-500 focus:bg-white transition-all">
                  <option>This Month</option>
                  <option>Last Quarter</option>
                  <option>Year to Date</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="pt-6 flex flex-col gap-6">
              {departments.map((dept) => (
                <div key={dept.name} className="flex flex-col gap-1.5 group">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{dept.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{dept.employees} Employees</span>
                      <span className="text-sm font-bold text-slate-900">{dept.percentage}%</span>
                    </div>
                  </div>
                  <div className="w-full h-3.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-0.5">
                    <div 
                      className={`h-full rounded-full ${dept.color} transition-all duration-700 ease-out`} 
                      style={{ width: `${dept.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity - occupies 2 columns */}
          <Card className="lg:col-span-2 border-slate-100 shadow-sm bg-white flex flex-col">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-lg font-bold text-slate-950">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 flex-1 flex flex-col justify-between">
              <div className="flex flex-col gap-5">
                {activities.map((act) => {
                  const Icon = act.icon
                  return (
                    <div key={act.id} className="flex gap-3 items-start group">
                      <div className={`h-8 w-8 rounded-lg ${act.bg} flex items-center justify-center shrink-0 shadow-sm mt-0.5`}>
                        <Icon className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-800 leading-normal group-hover:text-indigo-600 transition-colors">{act.title}</p>
                        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3 shrink-0" />
                          {act.time}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
              <Button 
                variant="ghost" 
                className="w-full text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 mt-6 border border-dashed border-slate-200 text-xs font-bold py-2.5 flex items-center justify-center gap-1.5"
              >
                <span>View All Activity</span>
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
