import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/products'
  },
  {
    path: '/products',
    name: 'ProductList',
    component: () => import('@/views/ProductList.vue')
  },
  {
    path: '/products/create',
    name: 'ProductCreate',
    component: () => import('@/views/ProductEdit.vue')
  },
  {
    path: '/products/:id/edit',
    name: 'ProductEdit',
    component: () => import('@/views/ProductEdit.vue')
  },
  {
    path: '/categories',
    name: 'CategoryManage',
    component: () => import('@/views/CategoryManage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
