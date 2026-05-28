import { createSlice } from '@reduxjs/toolkit'

const initialEmployees = [
  {
    id: 'elena-rodriguez',
    fullName: 'Elena Rodriguez',
    email: 'e.rodriguez@corp.erp.com',
    phone: '+34 910 245 876',
    location: 'Madrid HQ - Floor 4, Desk 420',
    jobTitle: 'Senior Product Designer',
    department: 'Product & Engineering',
    annualSalary: '115000',
    startDate: '2021-01-15',
    status: 'Active',
    manager: 'Marcus Chen (VP of Design)',
    performanceNote: {
      content: 'Elena has shown exceptional leadership inside the GS ERP redesign. Her ability to synthesize complex stakeholder requirements into an intuitive user flow was pivotal to the project\'s success. She continues to be a top performer in the design organization.',
      author: 'Marcus Chen',
      role: 'VP of Design',
      date: 'Oct 18, 2024'
    },
    workHistory: [
      {
        id: 'w1',
        role: 'Senior Product Designer',
        period: 'Jan 2023 - Present',
        description: 'Led the design system team of 3, scaling components across three new product lines. Improved accessibility compliance to AA standards across the platform.',
        tags: ['Figma', 'Design Systems', 'React']
      },
      {
        id: 'w2',
        role: 'Product Designer',
        period: 'Jan 2021 - Jan 2023',
        description: 'Primary designer for the Mobile app launch. Coordinated with cross-functional teams in Dublin and Madrid to ensure brand consistency.',
        tags: ['Mobile', 'UI/UX', 'Figma']
      },
      {
        id: 'w3',
        role: 'Junior Designer - Innovate UX',
        period: 'Prior to 2021',
        description: 'Contributed to high-profile client projects including banking and logistics portals.',
        tags: ['Web Design', 'Client Facing']
      }
    ],
    skills: ['Figma Design', 'HTML/CSS', 'Prototyping', 'User Research', 'Agile'],
    certifications: ['Google UX Professional', 'Certified Scrum Master'],
    files: [
      { name: 'Elena_Rodriguez_Contract.pdf', size: '2.4 MB', date: '15/01/2021' }
    ]
  },
  {
    id: 'john-montgomery',
    fullName: 'John Montgomery',
    email: 'j.montgomery@corp.erp.com',
    phone: '+1 (555) 345-0897',
    location: 'Remote - North America',
    jobTitle: 'Senior Systems Architect',
    department: 'Engineering',
    annualSalary: '150000',
    startDate: '2022-05-15',
    status: 'On Leave',
    manager: 'Sarah Jenkins',
    performanceNote: {
      content: 'John has architected our new distributed microservices with stellar precision. His handling of the scaling issues during peak traffic was exemplary.',
      author: 'Sarah Jenkins',
      role: 'Director of Engineering',
      date: 'Mar 12, 2025'
    },
    workHistory: [
      {
        id: 'w4',
        role: 'Senior Systems Architect',
        period: 'May 2022 - Present',
        description: 'Designed core cloud architecture, reducing latency by 45% and cloud cost by 20%.',
        tags: ['AWS', 'Kubernetes', 'Go']
      }
    ],
    skills: ['System Design', 'Cloud Architecture', 'Go', 'Kubernetes', 'Security'],
    certifications: ['AWS Certified Solutions Architect', 'CKA'],
    files: [
      { name: 'Professional_Contract_2022.pdf', size: '1.8 MB', date: '15/05/2022' }
    ]
  },
  {
    id: 'sarah-jenkins',
    fullName: 'Sarah Jenkins',
    email: 's.jenkins@corp.erp.com',
    phone: '+1 (555) 234-5678',
    location: 'Remote - North America',
    jobTitle: 'Product Designer',
    department: 'Product & Engineering',
    annualSalary: '98000',
    startDate: '2023-04-10',
    status: 'Active',
    manager: 'Marcus Chen (VP of Design)',
    performanceNote: {
      content: 'Sarah has a keen eye for modern, beautiful, and dynamic interfaces. She has elevated our design standards significantly since joining.',
      author: 'Marcus Chen',
      role: 'VP of Design',
      date: 'Dec 05, 2024'
    },
    workHistory: [
      {
        id: 'w5',
        role: 'Product Designer',
        period: 'Apr 2023 - Present',
        description: 'Designed new analytics dashboards. Created highly polished SVG animations.',
        tags: ['Figma', 'Vector Art', 'Tailwind']
      }
    ],
    skills: ['UI Design', 'Illustration', 'Interaction Design'],
    certifications: ['Interaction Design Foundation Certified'],
    files: []
  },
  {
    id: 'michael-chen',
    fullName: 'Michael Chen',
    email: 'm.chen@corp.erp.com',
    phone: '+1 (555) 876-5432',
    location: 'San Francisco HQ',
    jobTitle: 'Infrastructure Engineer',
    department: 'IT & Operations',
    annualSalary: '135000',
    startDate: '2020-08-20',
    status: 'Active',
    manager: 'Jane Doe',
    performanceNote: {
      content: 'Michael is a pillar of reliability. Our CI/CD pipeline has reached 99.9% uptime thanks to his continuous maintenance and automation scripts.',
      author: 'Jane Doe',
      role: 'VP of Operations',
      date: 'Jan 14, 2025'
    },
    workHistory: [
      {
        id: 'w6',
        role: 'Infrastructure Engineer',
        period: 'Aug 2020 - Present',
        description: 'Built CI/CD pipes, orchestrated Terraform environments across multicloud clusters.',
        tags: ['Terraform', 'CI/CD', 'Docker']
      }
    ],
    skills: ['DevOps', 'Terraform', 'Docker', 'Linux', 'Networking'],
    certifications: ['HashiCorp Certified Terraform Associate'],
    files: []
  },
  {
    id: 'marcus-chen',
    fullName: 'Marcus Chen',
    email: 'm.chen.vp@corp.erp.com',
    phone: '+1 (555) 432-1098',
    location: 'San Francisco HQ',
    jobTitle: 'VP of Design',
    department: 'Product & Engineering',
    annualSalary: '190000',
    startDate: '2019-02-10',
    status: 'Active',
    manager: 'CEO',
    performanceNote: {
      content: 'Marcus has built an incredibly talented design department from the ground up, aligning design values with core business strategies.',
      author: 'CEO',
      role: 'Chief Executive Officer',
      date: 'Feb 10, 2025'
    },
    workHistory: [
      {
        id: 'w7',
        role: 'VP of Design',
        period: 'Feb 2019 - Present',
        description: 'Leading a design and user research organization of 25+ designers across 4 global hubs.',
        tags: ['Leadership', 'Strategy', 'Design Thinking']
      }
    ],
    skills: ['Leadership', 'Product Strategy', 'Design Thinking', 'Public Speaking'],
    certifications: [],
    files: []
  },
  {
    id: 'fiona-thompson',
    fullName: 'Fiona Thompson',
    email: 'f.thompson@corp.erp.com',
    phone: '+1 (555) 789-0123',
    location: 'New York Office',
    jobTitle: 'Marketing Specialist',
    department: 'Brand & Marketing',
    annualSalary: '85000',
    startDate: '2024-01-10',
    status: 'Active',
    manager: 'Robert Vance',
    performanceNote: {
      content: 'Fiona has run highly successful campaigns that brought in over 40% more inbound leads.',
      author: 'Robert Vance',
      role: 'VP of Marketing',
      date: 'Nov 12, 2024'
    },
    workHistory: [
      {
        id: 'w8',
        role: 'Marketing Specialist',
        period: 'Jan 2024 - Present',
        description: 'Coordinates social campaigns, SEO optimization, and content curation for standard B2B SaaS lines.',
        tags: ['SEO', 'Content Strategy', 'Hubspot']
      }
    ],
    skills: ['SEO', 'Copywriting', 'Analytics', 'Social Media'],
    certifications: ['Hubspot Inbound Marketing'],
    files: []
  }
]

const employeesSlice = createSlice({
  name: 'employees',
  initialState: {
    list: initialEmployees,
    selectedId: 'elena-rodriguez'
  },
  reducers: {
    addEmployee: (state, action) => {
      const newEmp = {
        ...action.payload,
        id: action.payload.fullName.toLowerCase().replace(/\s+/g, '-'),
        workHistory: action.payload.workHistory || [],
        skills: action.payload.skills || [],
        certifications: action.payload.certifications || [],
        files: action.payload.files || []
      }
      state.list.push(newEmp)
    },
    updateEmployee: (state, action) => {
      const idx = state.list.findIndex(e => e.id === action.payload.id)
      if (idx !== -1) {
        state.list[idx] = {
          ...state.list[idx],
          ...action.payload
        }
      }
    },
    deleteEmployee: (state, action) => {
      state.list = state.list.filter(e => e.id !== action.payload)
    },
    setSelectedId: (state, action) => {
      state.selectedId = action.payload
    }
  }
})

export const { addEmployee, updateEmployee, deleteEmployee, setSelectedId } = employeesSlice.actions
export default employeesSlice.reducer
