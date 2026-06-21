const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: 'Login' },
  { path: '/dashboard', component: 'Dashboard', protected: true },
  { path: '/employees', component: 'Employees', protected: true },
  { path: '/employees/:id', component: 'Profile', protected: true },
  { path: '/employees/:id/edit', component: 'ManageEmployee', protected: true },
  { path: '/employees/new', component: 'ManageEmployee', protected: true },
]

export default routes
