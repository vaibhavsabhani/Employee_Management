import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { deleteEmployee } from '@/store/Reducer/employeesSlice'
import { 
  Search, 
  Plus, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  CircleDot
} from 'lucide-react'

export default function Employees() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const list = useSelector((state) => state.employees.list)
  
  // State for search and filters
  const [searchTerm, setSearchTerm] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  // Calculations for stats
  const totalEmployeesCount = 1278 + list.length
  const activeCount = 937 + list.filter(e => e.status === 'Active').length
  const leaveCount = 45 + list.filter(e => e.status === 'On Leave').length

  // Filtered List
  const filteredEmployees = list.filter((emp) => {
    const matchesSearch = 
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
      
    const matchesDept = deptFilter === 'All' || emp.department === deptFilter
    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter

    return matchesSearch && matchesDept && matchesStatus
  })

  // Pagination Logic
  const totalItems = filteredEmployees.length
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber)
    }
  }

  const handleDelete = (id, name) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      dispatch(deleteEmployee(id))
      // Adjust current page if last item on page was deleted
      const updatedTotal = totalItems - 1
      const updatedPages = Math.ceil(updatedTotal / itemsPerPage)
      if (currentPage > updatedPages && currentPage > 1) {
        setCurrentPage(updatedPages)
      }
    }
  }

  // Get list of unique departments for filter dropdown
  const departmentsList = ['All', ...new Set(list.map(e => e.department))]

  return (
    <Layout>
      <div className="flex flex-col gap-8 animate-fade-in">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Directory</h1>
            <p className="text-sm text-slate-500">Manage {totalEmployeesCount.toLocaleString()} staff members across all departments.</p>
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

        {/* Dynamic Statistics Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Stat 1: Total Employees */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Total Employees</div>
            <div className="text-2xl md:text-3.5xl font-black text-slate-900 mt-1">{totalEmployeesCount.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3 shrink-0" />
              <span>+2.5% increase</span>
            </div>
          </div>

          {/* Stat 2: Active Now */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Active Now</div>
            <div className="text-2xl md:text-3.5xl font-black text-slate-900 mt-1">{activeCount.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3 shrink-0" />
              <span>+12% vs last month</span>
            </div>
          </div>

          {/* Stat 3: On Leave */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">On Leave</div>
            <div className="text-2xl md:text-3.5xl font-black text-slate-900 mt-1">{leaveCount.toLocaleString()}</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs font-medium text-rose-600">
              <span>↓ -3% vs last week</span>
            </div>
          </div>

          {/* Stat 4: Retention Rate */}
          <div className="bg-white border border-slate-200/60 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-all duration-200">
            <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Retention Rate</div>
            <div className="text-2xl md:text-3.5xl font-black text-slate-900 mt-1">98.2%</div>
            <div className="flex items-center gap-1 mt-1 text-[10px] md:text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3 w-3 shrink-0" />
              <span>+0.5% vs last year</span>
            </div>
          </div>
        </div>

        {/* Directory Card */}
        <div className="bg-white border border-slate-250/70 rounded-2xl shadow-sm overflow-hidden">
          {/* Controls Strip */}
          <div className="flex flex-col md:flex-row p-4 md:p-5 border-b border-slate-100 gap-4 justify-between items-center bg-slate-50/30">
            {/* Search */}
            <div className="w-full md:max-w-md relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
              <input
                type="text"
                placeholder="Search across enterprise..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 bg-white hover:bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Filters */}
            <div className="flex w-full md:w-auto items-center gap-3 justify-end">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-450 uppercase shrink-0">
                <Filter className="h-3.5 w-3.5" />
                <span>Filters:</span>
              </div>
              
              {/* Department Selector */}
              <select
                value={deptFilter}
                onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                className="text-xs font-semibold text-slate-650 bg-white border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 hover:bg-slate-50/80 transition-all cursor-pointer"
              >
                <option value="All">All Departments</option>
                {departmentsList.filter(d => d !== 'All').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              {/* Status Selector */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="text-xs font-semibold text-slate-650 bg-white border border-slate-200 rounded-lg py-2 px-3 outline-none focus:border-indigo-500 hover:bg-slate-50/80 transition-all cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="On Leave">On Leave Only</option>
              </select>
            </div>
          </div>

          {/* Directory Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Department</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/70 text-sm">
                {currentItems.length > 0 ? (
                  currentItems.map((emp) => (
                    <tr key={emp.id} className="hover:bg-indigo-50/10 transition-colors group">
                      {/* Column 1: Name / Photo / Email */}
                      <td className="py-4 px-6 flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-slate-100 shadow-sm shrink-0">
                          {emp.id === 'elena-rodriguez' ? (
                            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                          ) : emp.id === 'john-montgomery' ? (
                            <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                          ) : emp.id === 'sarah-jenkins' ? (
                            <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                          ) : emp.id === 'michael-chen' ? (
                            <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                          ) : (
                            <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-bold">
                              {emp.fullName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="min-w-0">
                          <Link 
                            to={`/employees/${emp.id}`}
                            className="font-bold text-slate-800 hover:text-indigo-600 transition-colors block truncate"
                          >
                            {emp.fullName}
                          </Link>
                          <span className="text-xs text-slate-400 block truncate">{emp.email}</span>
                        </div>
                      </td>

                      {/* Column 2: Role */}
                      <td className="py-4 px-4 text-slate-650 font-medium">{emp.jobTitle}</td>

                      {/* Column 3: Department badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                          emp.department.includes('Engineering') || emp.department.includes('IT')
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100/50'
                            : emp.department.includes('Marketing') || emp.department.includes('Brand')
                            ? 'bg-violet-50 text-violet-700 border border-violet-100/50'
                            : 'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {emp.department}
                        </span>
                      </td>

                      {/* Column 4: Status (Active/Leave) */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          emp.status === 'Active' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100/50' 
                            : 'bg-amber-50 text-amber-700 border border-amber-100/50'
                        }`}>
                          <CircleDot className={`h-3 w-3 ${emp.status === 'Active' ? 'text-emerald-500 animate-pulse' : 'text-amber-500'}`} />
                          {emp.status}
                        </span>
                      </td>

                      {/* Column 5: Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link 
                            to={`/employees/${emp.id}`}
                            title="View Profile"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </Link>
                          <Link 
                            to={`/employees/${emp.id}/edit`}
                            title="Edit Details"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                          >
                            <Edit className="h-4.5 w-4.5" />
                          </Link>
                          <button 
                            onClick={() => handleDelete(emp.id, emp.fullName)}
                            title="Delete Employee"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-12 text-center text-slate-400 font-medium">
                      No employees match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 md:p-5 border-t border-slate-100 gap-4 bg-slate-50/20">
            <span className="text-xs font-semibold text-slate-400">
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, totalItems)} of {totalItems} employees
            </span>
            <div className="flex items-center gap-1.5">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8.5 px-2 border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 shrink-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              {/* Pagination Numbers */}
              {Array.from({ length: totalPages }).map((_, idx) => {
                const page = idx + 1
                const isActive = currentPage === page
                return (
                  <Button
                    key={page}
                    variant={isActive ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handlePageChange(page)}
                    className={`h-8.5 w-8.5 ${
                      isActive 
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold' 
                        : 'border-slate-200 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    {page}
                  </Button>
                )
              })}

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8.5 px-2 border-slate-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 shrink-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
