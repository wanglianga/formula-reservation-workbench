import { createRouter, createWebHistory } from 'vue-router'
import Layout from '@/pages/Layout.vue'
import StaffWorkbench from '@/pages/StaffWorkbench.vue'
import WarehouseWorkbench from '@/pages/WarehouseWorkbench.vue'
import SupervisorWorkbench from '@/pages/SupervisorWorkbench.vue'

const routes = [
  {
    path: '/',
    component: Layout,
    redirect: '/staff',
    children: [
      {
        path: 'staff',
        name: 'staff',
        component: StaffWorkbench,
      },
      {
        path: 'warehouse',
        name: 'warehouse',
        component: WarehouseWorkbench,
      },
      {
        path: 'supervisor',
        name: 'supervisor',
        component: SupervisorWorkbench,
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
