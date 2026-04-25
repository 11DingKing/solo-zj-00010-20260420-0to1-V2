import axios from 'axios';
import type { 
  Category, 
  Brand, 
  Product, 
  ProductListParams, 
  ProductListResult,
  ApiResponse 
} from '@/types';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const categoryApi = {
  getTree: (): Promise<ApiResponse<Category[]>> => 
    api.get('/categories'),
  
  getById: (id: number): Promise<ApiResponse<Category>> => 
    api.get(`/categories/${id}`),
  
  create: (data: Partial<Category>): Promise<ApiResponse<{ id: number; level: number }>> => 
    api.post('/categories', data),
  
  update: (id: number, data: Partial<Category>): Promise<ApiResponse<any>> => 
    api.put(`/categories/${id}`, data),
  
  delete: (id: number): Promise<ApiResponse<any>> => 
    api.delete(`/categories/${id}`),
};

export const productApi = {
  getList: (params: ProductListParams): Promise<ApiResponse<ProductListResult>> => 
    api.get('/products', { params }),
  
  getBrands: (): Promise<ApiResponse<Brand[]>> => 
    api.get('/products/brands'),
  
  getById: (id: number): Promise<ApiResponse<Product>> => 
    api.get(`/products/${id}`),
  
  create: (data: Partial<Product> & { specifications?: any[]; skus?: any[] }): Promise<ApiResponse<{ id: number }>> => 
    api.post('/products', data),
  
  update: (id: number, data: Partial<Product> & { specifications?: any[]; skus?: any[] }): Promise<ApiResponse<any>> => 
    api.put(`/products/${id}`, data),
  
  delete: (id: number): Promise<ApiResponse<any>> => 
    api.delete(`/products/${id}`),
};

export default api;
