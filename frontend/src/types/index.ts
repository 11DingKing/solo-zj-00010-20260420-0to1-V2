export interface Category {
  id: number;
  name: string;
  parent_id: number;
  level: number;
  sort: number;
  created_at?: string;
  updated_at?: string;
  children?: Category[];
}

export interface Brand {
  id: number;
  name: string;
  logo?: string;
  description?: string;
}

export interface SpecificationValue {
  id: number;
  value: string;
}

export interface Specification {
  id: number;
  name: string;
  values: SpecificationValue[];
}

export interface Sku {
  id?: number;
  sku_code: string;
  spec_combination: Record<string, string>;
  price: number;
  stock: number;
  image?: string;
  status?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  category_id: number;
  brand_id?: number;
  main_image?: string;
  images: string[];
  status: number;
  has_sku: number;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  brand_name?: string;
  min_price?: number;
  total_stock?: number;
  specifications?: Specification[];
  skus?: Sku[];
}

export interface ProductListParams {
  page?: number;
  page_size?: number;
  category_id?: number;
  brand_id?: number;
  status?: number;
  keyword?: string;
}

export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface ProductListResult {
  list: Product[];
  pagination: Pagination;
}

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}
