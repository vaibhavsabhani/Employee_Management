import React from 'react'
import { useSelector } from 'react-redux'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Edit, 
  Award, 
  Star, 
  User, 
  ChevronRight, 
  ArrowLeft,
  Briefcase,
  FileText
} from 'lucide-react'
import { ROUTES } from '@/components/sidebar.route'

export default function Profile() {
  const { id } = useParams()
  const navigate = useNavigate()
  const list = useSelector((state) => state.employees.list)
  
  const employee = list.find((emp) => emp.id === id)

  if (!employee) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-bold text-slate-800">Employee Not Found</h2>
          <p className="text-slate-400 mt-2">The employee you are trying to view does not exist in the database.</p>
          <Button onClick={() => navigate(ROUTES.EMPLOYEES)} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white">
            Back to Directory
          </Button>
        </div>
      </Layout>
    )
  }

  // Generate dynamic initials for fallback
  const initials = employee.fullName.split(' ').map(n => n[0]).join('')
  
  // Format joined date (joined Jan 2021)
  const formatJoined = (dateStr) => {
    if (!dateStr) return 'Jan 2021'
    const date = new Date(dateStr)
    return `Joined ${date.toLocaleString('en-US', { month: 'short', year: 'numeric' })}`
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 animate-fade-in">
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center gap-3">
          <Link 
            to={ROUTES.EMPLOYEES}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </Link>
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
            <Link to={ROUTES.EMPLOYEES} className="hover:text-indigo-600 transition-colors">Employees</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-600 font-bold">{employee.fullName}</span>
          </div>
        </div>

        {/* Profile Card Header */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-5">
            <Avatar className="h-20 w-20 border-2 border-indigo-100 shadow-sm shrink-0">
              {employee.id === 'elena-rodriguez' ? (
                <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
              ) : employee.id === 'john-montgomery' ? (
                <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
              ) : employee.id === 'sarah-jenkins' ? (
                <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
              ) : employee.id === 'michael-chen' ? (
                <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
              ) : (
                <AvatarFallback className="bg-indigo-150 text-indigo-700 text-2xl font-black">{initials}</AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none flex items-center gap-2">
                {employee.fullName}
              </h1>
              <p className="text-sm font-semibold text-slate-500 mt-2.5">
                {employee.jobTitle} &middot; <span className="text-indigo-600 font-bold">{employee.department}</span>
              </p>
              <div className="flex flex-wrap gap-4 items-center mt-3 text-xs text-slate-400 font-semibold">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  {employee.location.split(' - ')[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  {formatJoined(employee.startDate)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 self-start md:self-center">
            <Link to={`/employees/${employee.id}/edit`}>
              <Button variant="outline" className="flex items-center gap-2 border-slate-200 text-slate-600 hover:bg-slate-50">
                <Edit className="h-4 w-4" />
                <span>Edit Profile</span>
              </Button>
            </Link>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-white text-indigo-600 shrink-0" />
              <span>Reward/Promote</span>
            </Button>
          </div>
        </div>

        {/* Double Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (1/3) */}
          <div className="flex flex-col gap-6 lg:col-span-1">
            {/* Contact Information Card */}
            <Card className="border-slate-100 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-50 pb-3">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-4">
                <div className="flex gap-3 items-center group">
                  <div className="h-8.5 w-8.5 rounded-lg bg-indigo-50/70 text-indigo-600 flex items-center justify-center shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">Email Address</span>
                    <a href={`mailto:${employee.email}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors block truncate">
                      {employee.email}
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 items-center group">
                  <div className="h-8.5 w-8.5 rounded-lg bg-indigo-50/70 text-indigo-600 flex items-center justify-center shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">Phone Number</span>
                    <a href={`tel:${employee.phone}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600 transition-colors block">
                      {employee.phone}
                    </a>
                  </div>
                </div>

                <div className="flex gap-3 items-center group">
                  <div className="h-8.5 w-8.5 rounded-lg bg-indigo-50/70 text-indigo-600 flex items-center justify-center shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-slate-450 uppercase block">Location Office</span>
                    <span className="text-sm font-semibold text-slate-800 block leading-snug">
                      {employee.location}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Department / Team Card */}
            <Card className="border-slate-100 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-50 pb-3">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department / Team</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col gap-4">
                {/* Manager */}
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2.5">Manager</span>
                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50/70 border border-transparent hover:border-slate-100 transition-all">
                    <Avatar className="h-9 w-9 border border-slate-100">
                      <AvatarImage src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                      <AvatarFallback className="bg-indigo-50 text-indigo-600 text-xs font-bold">MC</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 leading-tight">Marcus Chen</div>
                      <div className="text-[10px] text-slate-400 font-semibold">VP of Design</div>
                    </div>
                  </div>
                </div>

                {/* Team Members / Peers */}
                <div className="h-px bg-slate-100 my-1" />
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2">Direct Reports</span>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <Avatar className="h-7 w-7 border-2 border-white ring-1 ring-slate-100">
                        <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                      </Avatar>
                      <Avatar className="h-7 w-7 border-2 border-white ring-1 ring-slate-100">
                        <AvatarImage src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                      </Avatar>
                      <Avatar className="h-7 w-7 border-2 border-white ring-1 ring-slate-100">
                        <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" />
                      </Avatar>
                    </div>
                    <span className="text-xs font-semibold text-slate-500">3 Direct Reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column (2/3) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Performance Note Card */}
            {employee.performanceNote && (
              <Card className="border-slate-100 shadow-sm bg-gradient-to-tr from-indigo-50/20 via-white to-violet-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500 shrink-0" />
                    <span>Recent Performance Note</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-semibold text-slate-650 leading-relaxed italic bg-slate-50/40 p-4 border-l-4 border-indigo-500 rounded-r-lg">
                    "{employee.performanceNote.content}"
                  </p>
                  <div className="flex items-center justify-between mt-3 text-xs">
                    <span className="text-slate-400 font-medium">By: <span className="font-bold text-slate-600">{employee.performanceNote.author}</span> ({employee.performanceNote.role})</span>
                    <span className="text-slate-400 font-bold">{employee.performanceNote.date}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Work History timeline */}
            <Card className="border-slate-100 shadow-sm bg-white">
              <CardHeader className="border-b border-slate-50 pb-3">
                <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Work History</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="relative pl-6 border-l-2 border-slate-100 flex flex-col gap-8">
                  {employee.workHistory && employee.workHistory.length > 0 ? (
                    employee.workHistory.map((work) => (
                      <div key={work.id} className="relative group">
                        {/* Timeline point */}
                        <div className="absolute -left-8.5 top-1 h-4.5 w-4.5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shrink-0 ring-4 ring-white group-hover:scale-110 transition-transform">
                          <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                        </div>

                        {/* Timeline Content */}
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h3 className="text-sm font-black text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">{work.role}</h3>
                            <span className="text-xs font-bold text-slate-400 shrink-0">{work.period}</span>
                          </div>
                          <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                            {work.description}
                          </p>
                          
                          {/* Tags */}
                          {work.tags && work.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {work.tags.map(tag => (
                                <span key={tag} className="text-[10px] font-bold bg-slate-50 text-slate-500 border border-slate-150 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative group flex items-start gap-3">
                      <div className="absolute -left-8.5 top-1 h-4.5 w-4.5 rounded-full bg-white border-2 border-indigo-600 flex items-center justify-center shrink-0 ring-4 ring-white">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 leading-snug">{employee.jobTitle}</h3>
                        <span className="text-xs text-slate-400 font-bold">Started {formatJoined(employee.startDate)}</span>
                        <p className="text-xs text-slate-500 mt-1.5">No work history log added.</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technical Skills & Certifications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Skills */}
              <Card className="border-slate-100 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-50 pb-3">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Technical Skills</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {employee.skills && employee.skills.length > 0 ? (
                      employee.skills.map((skill) => (
                        <span key={skill} className="text-xs font-semibold bg-indigo-50/50 text-indigo-700 border border-indigo-100/50 px-3 py-1 rounded-lg">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No technical skills declared.</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Certifications */}
              <Card className="border-slate-100 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-50 pb-3">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certifications</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-2.5">
                  {employee.certifications && employee.certifications.length > 0 ? (
                    employee.certifications.map((cert) => (
                      <div key={cert} className="flex gap-2 items-center text-xs font-bold text-slate-700">
                        <Award className="h-4 w-4 text-indigo-600 shrink-0" />
                        <span>{cert}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400 italic">No certifications listed.</span>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Files Attached section (matching step 3 of form) */}
            {employee.files && employee.files.length > 0 && (
              <Card className="border-slate-100 shadow-sm bg-white">
                <CardHeader className="border-b border-slate-50 pb-3">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attached Documents</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex flex-col gap-3">
                  {employee.files.map((file) => (
                    <div key={file.name} className="flex items-center justify-between p-3 border border-slate-100 rounded-lg hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-800 block truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block">{file.size} &middot; Uploaded {file.date}</span>
                        </div>
                      </div>
                      <a 
                        href="#" 
                        onClick={(e) => e.preventDefault()}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-all"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
