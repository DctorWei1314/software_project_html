import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import Admin from '@/admin/Admin'
import Employeeadmin from '@/admin/Employeeadmin'
import Projectquery from '@/admin/Projectquery'
import Employee from '@/employee/Employee'
import Outtask from '@/employee/Outtask'
import Respproject from '@/employee/Respproject'
import Resptask from '@/employee/Resptask'
import Admintask from '@/admin/Admintask'
import Employeehome from '@/employee/Employeehome'
import EmployeeInfo from '@/employee/EmployeeInfo'
import Temp from '@/employee/Temp'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    component: Login
  },
  {
    path: '/admin',
    component: Admin,
    redirect: '/employeeadmin',
    children: [
      {
        path: '/employeeadmin',
        component: Employeeadmin
      },
      {
        path: '/projectquery',
        component: Projectquery
      },
      {
        path: '/admintask',
        component: Admintask
      }
    ]
  },
  {
    path: '/employee',
    component: Employee,
    redirect: '/employeehome',
    children: [
      {
        path: '/employeehome',
        component: Employeehome
      },
      {
        path: '/outtask',
        component: Outtask
      },
      {
        path: '/projectrecord',
        component: Respproject
      },
      {
        path: '/respproject',
        component: Respproject
      },
      {
        path: '/resptask',
        component: Resptask
      },
      {
        path: '/employeetask',
        component: Admintask
      },
      {
        path: '/employeeInfo',
        component: EmployeeInfo
      },
      {
        path: '/temp',
        component: Temp
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
