import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Layout from '@/components/Layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addEmployee, updateEmployee } from '@/store/Reducer/employeesSlice'
import { 
  ArrowLeft, 
  ChevronRight, 
  Upload, 
  FileText, 
  Trash2, 
  Plus, 
  Sparkles,
  Check
} from 'lucide-react'

// Form Validation Schema using Zod
const employeeSchema = z.object({
  fullName: z.string().min(2, { message: 'Full Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Enter a valid email address' }),
  phone: z.string().min(5, { message: 'Enter a valid phone number' }),
  location: z.string().min(1, { message: 'Location is required' }),
  jobTitle: z.string().min(2, { message: 'Job Title is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
  annualSalary: z.string().regex(/^\d+$/, { message: 'Annual Salary must be a positive number' }),
  startDate: z.string().min(1, { message: 'Start date is required' }),
  status: z.enum(['Active', 'On Leave'])
})

export default function ManageEmployee() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const list = useSelector((state) => state.employees.list)
  
  const isEditMode = !!id
  const employeeData = isEditMode ? list.find(e => e.id === id) : null

  // File Upload State
  const [attachedFiles, setAttachedFiles] = useState([])
  const [showToast, setShowToast] = useState(false)

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      location: 'Remote - North America',
      jobTitle: '',
      department: 'Engineering',
      annualSalary: '',
      startDate: new Date().toISOString().split('T')[0],
      status: 'Active'
    }
  })

  // Pre-populate fields in Edit Mode
  useEffect(() => {
    if (isEditMode && employeeData) {
      setValue('fullName', employeeData.fullName)
      setValue('email', employeeData.email)
      setValue('phone', employeeData.phone)
      setValue('location', employeeData.location)
      setValue('jobTitle', employeeData.jobTitle)
      setValue('department', employeeData.department)
      setValue('annualSalary', employeeData.annualSalary)
      setValue('startDate', employeeData.startDate)
      setValue('status', employeeData.status)
      setAttachedFiles(employeeData.files || [])
    }
  }, [isEditMode, employeeData, setValue])

  // Mock File Upload Action
  const handleMockUpload = (e) => {
    e.preventDefault()
    const mockFileName = prompt("Enter a mock filename to upload (e.g. contract.pdf):", "Professional_Contract_2022.pdf")
    if (mockFileName) {
      const newFile = {
        name: mockFileName,
        size: '1.8 MB',
        date: new Date().toLocaleDateString('en-GB')
      }
      setAttachedFiles(prev => [...prev, newFile])
    }
  }

  // Delete Attached File
  const handleDeleteFile = (fileName, e) => {
    e.preventDefault()
    setAttachedFiles(prev => prev.filter(f => f.name !== fileName))
  }

  // Submit Handler
  const onSubmit = (data) => {
    const payload = {
      ...data,
      files: attachedFiles
    }

    if (isEditMode) {
      dispatch(updateEmployee({ id, ...payload }))
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
        navigate(`/employees/${id}`)
      }, 1500)
    } else {
      dispatch(addEmployee(payload))
      setShowToast(true)
      setTimeout(() => {
        setShowToast(false)
        navigate('/employees')
      }, 1500)
    }
  }

  if (isEditMode && !employeeData) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-bold text-slate-800">Employee Not Found</h2>
          <p className="text-slate-400 mt-2">The employee you are trying to edit does not exist.</p>
          <Button onClick={() => navigate('/employees')} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white">
            Back to Directory
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-4xl mx-auto animate-fade-in relative pb-10">
        
        {/* Success Toast */}
        {showToast && (
          <div className="fixed top-20 right-6 bg-slate-900 text-white font-semibold text-xs px-4 py-3 rounded-lg shadow-xl border border-slate-800 flex items-center gap-2 z-50 animate-bounce">
            <div className="h-5 w-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
            </div>
            <span>{isEditMode ? 'Employee updated successfully!' : 'New employee created successfully!'}</span>
          </div>
        )}

        {/* Navigation / Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link 
            to={isEditMode ? `/employees/${id}` : '/employees'} 
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Link to="/employees" className="hover:text-indigo-600 transition-colors">Employees</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-600 font-bold">{isEditMode ? 'Edit Profile' : 'New Employee'}</span>
          </div>
        </div>

        {/* Page Title & Submit button */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employee Details</h1>
              <p className="text-sm text-slate-500">Manage professional records and employment history.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link to={isEditMode ? `/employees/${id}` : '/employees'}>
                <Button type="button" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-50">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-150"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {/* Step 1: Personal Information */}
            <Card className="border-slate-150 shadow-sm bg-white overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">1. Personal Information</CardTitle>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black tracking-wider uppercase">Step 1 of 3</span>
              </div>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <Label className="uppercase text-[10px] font-bold text-slate-450 tracking-wider">Full Name</Label>
                  <Input 
                    type="text" 
                    {...register('fullName')}
                    className="border-slate-200 focus:border-indigo-500" 
                    placeholder="John Montgomery"
                  />
                  {errors.fullName && <p className="text-xs text-rose-500 font-medium mt-1">{errors.fullName.message}</p>}
                </div>

                {/* Email Address */}
                <div className="flex flex-col gap-1.5">
                  <Label className="uppercase text-[10px] font-bold text-slate-450 tracking-wider">Email Address</Label>
                  <Input 
                    type="email" 
                    {...register('email')}
                    className="border-slate-200 focus:border-indigo-500" 
                    placeholder="j.montgomery@corp.erp.com"
                  />
                  {errors.email && <p className="text-xs text-rose-500 font-medium mt-1">{errors.email.message}</p>}
                </div>

                {/* Phone Number */}
                <div className="flex flex-col gap-1.5">
                  <Label className="uppercase text-[10px] font-bold text-slate-450 tracking-wider">Phone Number</Label>
                  <Input 
                    type="text" 
                    {...register('phone')}
                    className="border-slate-200 focus:border-indigo-500" 
                    placeholder="+1 (555) 345-0897"
                  />
                  {errors.phone && <p className="text-xs text-rose-500 font-medium mt-1">{errors.phone.message}</p>}
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <Label className="uppercase text-[10px] font-bold text-slate-450 tracking-wider">Location / Workspace</Label>
                  <select 
                    {...register('location')}
                    className="flex h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm outline-none transition-all duration-200 focus:border-indigo-500 hover:bg-slate-50/20 cursor-pointer"
                  >
                    <option value="Remote - North America">Remote - North America</option>
                    <option value="Madrid HQ - Floor 4, Desk 420">Madrid HQ - Floor 4, Desk 420</option>
                    <option value="San Francisco HQ">San Francisco HQ</option>
                    <option value="New York Office">New York Office</option>
                    <option value="London Office - Floor 2">London Office - Floor 2</option>
                  </select>
                  {errors.location && <p className="text-xs text-rose-500 font-medium mt-1">{errors.location.message}</p>}
                </div>

              </CardContent>
            </Card>

            {/* Step 2: Employment Details */}
            <Card className="border-slate-150 shadow-sm bg-white overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">2. Employment Details</CardTitle>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black tracking-wider uppercase">Step 2 of 3</span>
              </div>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">

                {/* Job Title */}
                <div className="flex flex-col gap-1.5">
                  <Label className="uppercase text-[10px] font-bold text-slate-450 tracking-wider">Job Title</Label>
                  <Input 
                    type="text" 
                    {...register('jobTitle')}
                    className="border-slate-200 focus:border-indigo-500" 
                    placeholder="Senior Systems Architect"
                  />
                  {errors.jobTitle && <p className="text-xs text-rose-500 font-medium mt-1">{errors.jobTitle.message}</p>}
                </div>

                {/* Department */}
                <div className="flex flex-col gap-1.5">
                  <Label className="uppercase text-[10px] font-bold text-slate-450 tracking-wider">Department</Label>
                  <select 
                    {...register('department')}
                    className="flex h-9.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm outline-none transition-all duration-200 focus:border-indigo-500 hover:bg-slate-50/20 cursor-pointer"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product & Engineering">Product & Engineering</option>
                    <option value="IT & Operations">IT & Operations</option>
                    <option value="Brand & Marketing">Brand & Marketing</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Finance">Finance</option>
                  </select>
                  {errors.department && <p className="text-xs text-rose-500 font-medium mt-1">{errors.department.message}</p>}
                </div>

                {/* Annual Salary (USD) */}
                <div className="flex flex-col gap-1.5">
                  <Label className="uppercase text-[10px] font-bold text-slate-450 tracking-wider">Annual Salary (USD)</Label>
                  <Input 
                    type="text" 
                    {...register('annualSalary')}
                    className="border-slate-200 focus:border-indigo-500" 
                    placeholder="120000"
                  />
                  {errors.annualSalary && <p className="text-xs text-rose-500 font-medium mt-1">{errors.annualSalary.message}</p>}
                </div>

                {/* Start Date */}
                <div className="flex flex-col gap-1.5">
                  <Label className="uppercase text-[10px] font-bold text-slate-450 tracking-wider">Start Date</Label>
                  <Input 
                    type="date" 
                    {...register('startDate')}
                    className="border-slate-200 focus:border-indigo-500 cursor-pointer" 
                  />
                  {errors.startDate && <p className="text-xs text-rose-500 font-medium mt-1">{errors.startDate.message}</p>}
                </div>

                {/* Status Toggle */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <Label className="uppercase text-[10px] font-bold text-slate-450 tracking-wider">Employment Status</Label>
                  <div className="flex items-center gap-4 mt-1.5">
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-700">
                      <input 
                        type="radio" 
                        value="Active" 
                        {...register('status')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                      />
                      <span>Active (On Duty)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer font-semibold text-xs text-slate-700">
                      <input 
                        type="radio" 
                        value="On Leave" 
                        {...register('status')}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                      />
                      <span>On Leave (Vacation/Sick)</span>
                    </label>
                  </div>
                </div>

              </CardContent>
            </Card>

            {/* Step 3: Documents */}
            <Card className="border-slate-150 shadow-sm bg-white overflow-hidden">
              <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                <CardTitle className="text-sm font-bold text-slate-800 uppercase tracking-wider">3. Documents</CardTitle>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-black tracking-wider uppercase">Step 3 of 3</span>
              </div>
              <CardContent className="p-6 flex flex-col gap-5">
                
                {/* Upload drag drop zone */}
                <div 
                  onClick={handleMockUpload}
                  className="border-2 border-dashed border-slate-200 hover:border-indigo-500 rounded-xl p-8 text-center bg-slate-50/40 hover:bg-indigo-50/10 transition-all cursor-pointer group"
                >
                  <div className="h-11 w-11 rounded-full bg-slate-100 group-hover:bg-indigo-150 text-slate-400 group-hover:text-indigo-600 flex items-center justify-center mx-auto transition-colors">
                    <Upload className="h-5.5 w-5.5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-700 mt-4 leading-none">Upload Contract or ID</h3>
                  <p className="text-xs text-slate-400 font-semibold mt-2.5">
                    Drag and drop PDF, JPG, or PNG files (Max 10MB)
                  </p>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="mt-4 border-slate-200 text-xs font-bold text-slate-650 bg-white group-hover:border-indigo-500 group-hover:text-indigo-600"
                  >
                    Browse Files
                  </Button>
                </div>

                {/* Attached Files list */}
                {attachedFiles.length > 0 && (
                  <div className="flex flex-col gap-3 mt-2">
                    <h4 className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Attached Files</h4>
                    <div className="flex flex-col gap-2.5">
                      {attachedFiles.map((file) => (
                        <div key={file.name} className="flex items-center justify-between p-3 border border-slate-150 rounded-lg hover:border-slate-200 transition-colors">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-9 w-9 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-800 block truncate">{file.name}</span>
                              <span className="text-[10px] text-slate-400 font-semibold block">{file.size} &middot; Uploaded {file.date}</span>
                            </div>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => handleDeleteFile(file.name, e)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </Layout>
  )
}
