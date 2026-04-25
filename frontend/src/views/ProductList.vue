<template>
  <div class="product-list">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新增商品
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="分类">
          <el-cascader
            v-model="searchForm.category_id"
            :options="categoryOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            placeholder="请选择分类"
            clearable
            filterable
          />
        </el-form-item>
        <el-form-item label="品牌">
          <el-select
            v-model="searchForm.brand_id"
            placeholder="请选择品牌"
            clearable
          >
            <el-option
              v-for="brand in brands"
              :key="brand.id"
              :label="brand.name"
              :value="brand.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="上架" :value="1" />
            <el-option label="下架" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="商品名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <el-table :data="productList" border v-loading="loading">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column label="主图" width="100">
          <template #default="{ row }">
            <el-image
              :src="row.main_image || 'https://picsum.photos/80/80'"
              :preview-src-list="row.images || []"
              fit="cover"
              class="product-image"
            >
              <template #placeholder>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="商品名称" min-width="200" />
        <el-table-column prop="category_name" label="分类" width="120" />
        <el-table-column prop="brand_name" label="品牌" width="100" />
        <el-table-column prop="min_price" label="最低价" width="100">
          <template #default="{ row }">
            <span class="price">¥{{ row.min_price || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="total_stock" label="总库存" width="100">
          <template #default="{ row }">
            <el-tag :type="row.total_stock === 0 ? 'danger' : 'success'">
              {{ row.total_stock || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'">
              {{ row.status === 1 ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button type="danger" link @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.page_size"
        :page-sizes="[20, 50, 100]"
        :total="pagination.total"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { productApi, categoryApi } from '@/api'
import type { Product, Category, Brand, Pagination } from '@/types'

const router = useRouter()

const loading = ref(false)
const productList = ref<Product[]>([])
const categoryOptions = ref<Category[]>([])
const brands = ref<Brand[]>([])

const pagination = reactive<Pagination>({
  page: 1,
  page_size: 20,
  total: 0,
  total_pages: 0,
})

const searchForm = reactive({
  page: 1,
  page_size: 20,
  category_id: undefined as number | undefined,
  brand_id: undefined as number | undefined,
  status: undefined as number | undefined,
  keyword: '',
})

const loadBrands = async () => {
  try {
    const res = await productApi.getBrands()
    brands.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '加载品牌列表失败')
  }
}

const loadCategories = async () => {
  try {
    const res = await categoryApi.getTree()
    categoryOptions.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '加载分类列表失败')
  }
}

const loadProducts = async () => {
  loading.value = true
  try {
    const params = { ...searchForm }
    if (params.category_id) {
      const categoryIds = params.category_id as number[]
      params.category_id = categoryIds[categoryIds.length - 1]
    }
    const res = await productApi.getList(params)
    productList.value = res.data.list
    Object.assign(pagination, res.data.pagination)
  } catch (error: any) {
    ElMessage.error(error.message || '加载商品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  searchForm.page = 1
  loadProducts()
}

const handleReset = () => {
  Object.assign(searchForm, {
    page: 1,
    page_size: 20,
    category_id: undefined,
    brand_id: undefined,
    status: undefined,
    keyword: '',
  })
  loadProducts()
}

const handleSizeChange = (size: number) => {
  searchForm.page_size = size
  loadProducts()
}

const handleCurrentChange = (page: number) => {
  searchForm.page = page
  loadProducts()
}

const handleCreate = () => {
  router.push('/products/create')
}

const handleEdit = (row: Product) => {
  router.push(`/products/${row.id}/edit`)
}

const handleDelete = async (row: Product) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await productApi.delete(row.id)
    ElMessage.success('删除成功')
    loadProducts()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  loadCategories()
  loadBrands()
  loadProducts()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
}

.image-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 4px;
  color: #c0c4cc;
}

.price {
  color: #f56c6c;
  font-weight: bold;
}

.product-list {
  height: 100%;
}
</style>
