<template>
  <div class="product-edit">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ isEdit ? '编辑商品' : '新增商品' }}</span>
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
        class="product-form"
      >
        <el-card class="form-section">
          <template #header>
            <div class="section-header">
              <el-icon class="section-icon"><InfoFilled /></el-icon>
              <span class="section-title">基本信息</span>
            </div>
          </template>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品名称" prop="name">
                <el-input v-model="formData.name" placeholder="请输入商品名称" size="large" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品状态" prop="status">
                <el-radio-group v-model="formData.status" size="large">
                  <el-radio-button :value="1">上架</el-radio-button>
                  <el-radio-button :value="0">下架</el-radio-button>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="商品分类" prop="category_id">
                <el-cascader
                  v-model="categoryValue"
                  :options="categoryOptions"
                  :props="{ value: 'id', label: 'name', children: 'children' }"
                  placeholder="请选择分类"
                  clearable
                  filterable
                  size="large"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="商品品牌" prop="brand_id">
                <el-select
                  v-model="formData.brand_id"
                  placeholder="请选择品牌（可选）"
                  clearable
                  size="large"
                  style="width: 100%"
                >
                  <el-option
                    v-for="brand in brands"
                    :key="brand.id"
                    :label="brand.name"
                    :value="brand.id"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="formData.description"
              type="textarea"
              :rows="4"
              placeholder="请输入商品描述（支持富文本）"
              size="large"
            />
          </el-form-item>
        </el-card>

        <el-card class="form-section">
          <template #header>
            <div class="section-header">
              <el-icon class="section-icon"><Picture /></el-icon>
              <span class="section-title">商品图片</span>
              <el-tag type="info" effect="plain">主图将在列表页展示，建议尺寸 800x800</el-tag>
            </div>
          </template>
          
          <el-row :gutter="30">
            <el-col :span="6">
              <div class="main-image-section">
                <div class="section-subtitle">
                  <el-tag type="primary" effect="dark">主图</el-tag>
                </div>
                <div class="main-image-wrapper">
                  <el-image
                    v-if="formData.main_image"
                    :src="formData.main_image"
                    :preview-src-list="[formData.main_image]"
                    fit="cover"
                    class="main-image"
                  >
                    <template #placeholder>
                      <div class="image-loading">
                        <el-icon class="loading-icon"><Loading /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div v-else class="main-image-placeholder">
                    <el-icon class="placeholder-icon"><Picture /></el-icon>
                    <span class="placeholder-text">点击上传主图</span>
                  </div>
                  <div class="main-image-actions">
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="triggerMainImageUpload"
                      class="upload-btn"
                    >
                      <el-icon><Upload /></el-icon>
                      上传
                    </el-button>
                    <el-button 
                      v-if="formData.main_image"
                      type="danger" 
                      size="small" 
                      @click="clearMainImage"
                      class="clear-btn"
                    >
                      <el-icon><Delete /></el-icon>
                      清除
                    </el-button>
                  </div>
                </div>
              </div>
            </el-col>
            
            <el-col :span="18">
              <div class="images-section">
                <div class="section-subtitle">
                  <el-tag type="info">商品图片（最多 9 张，可拖拽排序）</el-tag>
                </div>
                <div class="images-list-wrapper">
                  <div
                    v-for="(image, index) in formData.images"
                    :key="index"
                    class="image-item-wrapper"
                  >
                    <div class="image-sort-badge">{{ index + 1 }}</div>
                    <el-image
                      :src="image"
                      :preview-src-list="formData.images"
                      :initial-index="index"
                      fit="cover"
                      class="product-image"
                    />
                    <div class="image-overlay">
                      <div class="overlay-actions">
                        <el-button
                          type="primary"
                          size="small"
                          circle
                          @click="previewImage(index)"
                          title="预览"
                        >
                          <el-icon><View /></el-icon>
                        </el-button>
                        <el-button
                          type="primary"
                          size="small"
                          circle
                          @click="moveImageUp(index)"
                          :disabled="index === 0"
                          title="上移"
                        >
                          <el-icon><Top /></el-icon>
                        </el-button>
                        <el-button
                          type="primary"
                          size="small"
                          circle
                          @click="moveImageDown(index)"
                          :disabled="index === formData.images.length - 1"
                          title="下移"
                        >
                          <el-icon><Bottom /></el-icon>
                        </el-button>
                        <el-button
                          type="danger"
                          size="small"
                          circle
                          @click="removeImage(index)"
                          title="删除"
                        >
                          <el-icon><Delete /></el-icon>
                        </el-button>
                      </div>
                    </div>
                  </div>
                  
                  <div
                    v-if="formData.images.length < 9"
                    class="add-image-wrapper"
                    @click="addImage"
                  >
                    <div class="add-image-inner">
                      <el-icon class="add-icon"><Plus /></el-icon>
                      <span class="add-text">添加图片</span>
                      <span class="add-count">{{ formData.images.length }}/9</span>
                    </div>
                  </div>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <el-card class="form-section">
          <template #header>
            <div class="section-header">
              <el-icon class="section-icon"><Grid /></el-icon>
              <span class="section-title">多规格设置</span>
              <el-switch
                v-model="formData.has_sku"
                :active-value="1"
                :inactive-value="0"
                active-text="开启"
                inactive-text="关闭"
              />
            </div>
          </template>
          
          <div v-if="formData.has_sku === 1">
            <el-alert
              title="规格设置说明"
              type="info"
              :closable="false"
              show-icon
              class="spec-alert"
            >
              <template #default>
                <p>1. 点击"添加规格"创建规格（如：颜色、尺码）</p>
                <p>2. 为每个规格添加规格值（如：颜色规格下添加红色、蓝色）</p>
                <p>3. 系统会自动根据规格组合生成 SKU 列表，您只需填写价格和库存</p>
              </template>
            </el-alert>
            
            <div class="specifications-section">
              <div class="section-subtitle">
                <span>规格设置</span>
              </div>
              
              <div
                v-for="(spec, specIndex) in specifications"
                :key="specIndex"
                class="spec-card"
              >
                <div class="spec-card-header">
                  <el-input
                    v-model="spec.name"
                    placeholder="规格名称（如：颜色）"
                    class="spec-name-input"
                    size="small"
                  />
                  <div class="spec-card-actions">
                    <el-button
                      type="danger"
                      size="small"
                      text
                      @click="removeSpecification(specIndex)"
                    >
                      <el-icon><Delete /></el-icon>
                      删除规格
                    </el-button>
                  </div>
                </div>
                
                <div class="spec-values-container">
                  <div class="spec-values-label">规格值：</div>
                  <div class="spec-values-list">
                    <el-tag
                      v-for="(value, valueIndex) in spec.values"
                      :key="valueIndex"
                      closable
                      @close="removeSpecValue(specIndex, valueIndex)"
                      class="spec-value-tag"
                      effect="light"
                    >
                      {{ value }}
                    </el-tag>
                    <div class="add-value-form">
                      <el-input
                        v-model="newSpecValues[specIndex]"
                        placeholder="输入规格值"
                        size="small"
                        class="value-input"
                        @keyup.enter="addSpecValue(specIndex)"
                      />
                      <el-button
                        type="primary"
                        size="small"
                        @click="addSpecValue(specIndex)"
                      >
                        添加
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>
              
              <el-button
                type="primary"
                plain
                class="add-spec-button"
                @click="addSpecification"
                size="small"
              >
                <el-icon><Plus /></el-icon>
                添加规格
              </el-button>
            </div>

            <el-divider class="sku-divider">
              <el-tag type="primary" effect="dark">SKU 列表</el-tag>
            </el-divider>

            <div v-if="generatedSkus.length > 0" class="sku-section">
              <div class="sku-header-actions">
                <span class="sku-count">共 {{ generatedSkus.length }} 个规格组合</span>
                <div class="batch-actions">
                  <el-input-number
                    v-model="batchPrice"
                    :min="0.01"
                    :precision="2"
                    size="small"
                    placeholder="统一价格"
                    class="batch-input"
                  />
                  <el-button type="primary" size="small" @click="batchSetPrice">
                    批量设价
                  </el-button>
                  <el-input-number
                    v-model="batchStock"
                    :min="0"
                    size="small"
                    placeholder="统一库存"
                    class="batch-input"
                  />
                  <el-button type="primary" size="small" @click="batchSetStock">
                    批量设库存
                  </el-button>
                </div>
              </div>
              
              <el-table 
                :data="generatedSkus" 
                border 
                class="sku-table"
                stripe
                :row-class-name="skuRowClassName"
              >
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column label="规格组合" min-width="250">
                  <template #default="{ row, $index }">
                    <div class="spec-combination-cell">
                      <div class="spec-combination-tags">
                        <el-tag
                          v-for="(value, key) in row.spec_combination"
                          :key="key"
                          size="small"
                          type="info"
                          effect="light"
                          class="spec-tag"
                        >
                          <span class="spec-key">{{ key }}：</span>
                          <span class="spec-value">{{ value }}</span>
                        </el-tag>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="SKU 编码" width="160">
                  <template #default="{ row }">
                    <el-input
                      v-model="row.sku_code"
                      placeholder="SKU编码"
                      size="small"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="售价" width="130" align="center">
                  <template #default="{ row }">
                    <div class="price-input-wrapper">
                      <span class="currency-symbol">¥</span>
                      <el-input-number
                        v-model="row.price"
                        :min="0.01"
                        :precision="2"
                        size="small"
                        :controls="false"
                        class="price-input"
                      />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="库存" width="120" align="center">
                  <template #default="{ row }">
                    <el-input-number
                      v-model="row.stock"
                      :min="0"
                      size="small"
                      :controls="false"
                      class="stock-input"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="80" align="center">
                  <template #default="{ row }">
                    <el-switch
                      v-model="row.status"
                      :active-value="1"
                      :inactive-value="0"
                      size="small"
                    />
                  </template>
                </el-table-column>
              </el-table>
            </div>
            
            <div v-else class="empty-sku-section">
              <el-empty 
                description="请先添加规格和规格值，系统将自动生成 SKU 列表" 
                :image-size="80"
              >
                <template #image>
                  <el-icon class="empty-icon"><Grid /></el-icon>
                </template>
              </el-empty>
            </div>
          </div>
          
          <div v-else class="no-sku-section">
            <el-empty 
              description="开启多规格后，可为不同规格（颜色、尺码等）设置独立的价格和库存" 
              :image-size="100"
            >
              <template #image>
                <el-icon class="empty-icon"><Coin /></el-icon>
              </template>
              <template #description>
                <p>开启多规格后，可为不同规格（颜色、尺码等）设置独立的价格和库存</p>
                <p class="hint">例如：同一件T恤，红色 S码售价99元，蓝色 M码售价109元</p>
              </template>
            </el-empty>
          </div>
        </el-card>

        <div class="submit-section">
          <el-button type="primary" size="large" @click="handleSubmit" :loading="submitting">
            <el-icon><Check /></el-icon>
            {{ isEdit ? '保存修改' : '创建商品' }}
          </el-button>
          <el-button size="large" @click="handleBack">
            取消
          </el-button>
        </div>
      </el-form>
    </el-card>

    <el-dialog
      v-model="imagePreviewVisible"
      :title="'图片预览'"
      width="600px"
      :show-close="true"
      center
    >
      <el-image
        v-if="previewImageUrl"
        :src="previewImageUrl"
        fit="contain"
        style="width: 100%; height: 400px"
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { productApi, categoryApi } from '@/api'
import type { Product, Category, Brand, Sku } from '@/types'

const router = useRouter()
const route = useRoute()

const formRef = ref<FormInstance>()
const isEdit = ref(false)
const productId = ref<number | null>(null)
const categoryOptions = ref<Category[]>([])
const brands = ref<Brand[]>([])
const submitting = ref(false)

const categoryValue = ref<number[]>([])
const newSpecValues = ref<string[]>([])

const formData = reactive<Partial<Product>>({
  name: '',
  description: '',
  category_id: undefined,
  brand_id: undefined,
  main_image: '',
  images: [],
  status: 1,
  has_sku: 0,
})

const specifications = ref<{ name: string; values: string[] }[]>([])
const generatedSkus = ref<Sku[]>([])

const batchPrice = ref<number>(0)
const batchStock = ref<number>(0)
const imagePreviewVisible = ref(false)
const previewImageUrl = ref('')

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { max: 200, message: '商品名称不能超过200个字符', trigger: 'blur' },
  ],
  category_id: [
    { required: true, message: '请选择分类', trigger: 'change' },
  ],
}

const skuRowClassName = ({ rowIndex }: { rowIndex: number }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

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

const loadProduct = async (id: number) => {
  try {
    const res = await productApi.getById(id)
    const product = res.data
    
    Object.assign(formData, {
      name: product.name,
      description: product.description,
      category_id: product.category_id,
      brand_id: product.brand_id,
      main_image: product.main_image,
      images: product.images || [],
      status: product.status,
      has_sku: product.has_sku,
    })
    
    const categoryPath = getCategoryPath(product.category_id)
    categoryValue.value = categoryPath
    
    if (product.has_sku && product.specifications) {
      specifications.value = product.specifications.map(spec => ({
        name: spec.name,
        values: spec.values.map(v => v.value),
      }))
      newSpecValues.value = product.specifications.map(() => '')
    }
    
    if (product.has_sku && product.skus) {
      generatedSkus.value = product.skus
    }
  } catch (error: any) {
    ElMessage.error(error.message || '加载商品详情失败')
  }
}

const getCategoryPath = (categoryId: number): number[] => {
  const path: number[] = []
  
  const findPath = (categories: Category[], targetId: number): boolean => {
    for (const cat of categories) {
      if (cat.id === targetId) {
        path.push(cat.id)
        return true
      }
      if (cat.children && cat.children.length > 0) {
        if (findPath(cat.children, targetId)) {
          path.unshift(cat.id)
          return true
        }
      }
    }
    return false
  }
  
  findPath(categoryOptions.value, categoryId)
  return path
}

watch(categoryValue, (val) => {
  if (val && val.length > 0) {
    formData.category_id = val[val.length - 1]
  } else {
    formData.category_id = undefined
  }
})

const cartesianProduct = <T>(arrays: T[][]): T[][] => {
  if (arrays.length === 0) return []
  return arrays.reduce(
    (a, b) => a.flatMap(x => b.map(y => [...x, y])),
    [[]] as T[][]
  )
}

watch(
  specifications,
  () => {
    if (formData.has_sku !== 1) return
    
    const validSpecs = specifications.value.filter(s => s.name && s.values.length > 0)
    if (validSpecs.length === 0) {
      generatedSkus.value = []
      return
    }
    
    const valueArrays = validSpecs.map(spec => 
      spec.values.map(value => ({ specName: spec.name, value }))
    )
    
    const combinations = cartesianProduct(valueArrays)
    
    const newSkus: Sku[] = combinations.map((combo, index) => {
      const specCombination: Record<string, string> = {}
      
      for (const item of combo) {
        specCombination[item.specName] = item.value
      }
      
      const existingSku = generatedSkus.value.find(sku => 
        JSON.stringify(sku.spec_combination) === JSON.stringify(specCombination)
      )
      
      return {
        id: existingSku?.id,
        sku_code: existingSku?.sku_code || `SKU${Date.now()}${index}`,
        spec_combination: specCombination,
        price: existingSku?.price || 0,
        stock: existingSku?.stock || 0,
        image: existingSku?.image,
        status: existingSku?.status ?? 1,
      }
    })
    
    generatedSkus.value = newSkus
  },
  { deep: true }
)

const addSpecification = () => {
  specifications.value.push({ name: '', values: [] })
  newSpecValues.value.push('')
}

const removeSpecification = (index: number) => {
  specifications.value.splice(index, 1)
  newSpecValues.value.splice(index, 1)
}

const addSpecValue = (specIndex: number) => {
  const value = newSpecValues.value[specIndex]?.trim()
  if (value && !specifications.value[specIndex].values.includes(value)) {
    specifications.value[specIndex].values.push(value)
    newSpecValues.value[specIndex] = ''
  }
}

const removeSpecValue = (specIndex: number, valueIndex: number) => {
  specifications.value[specIndex].values.splice(valueIndex, 1)
}

const triggerMainImageUpload = () => {
  formData.main_image = `https://picsum.photos/800/800?random=${Date.now()}`
  ElMessage.success('主图已设置')
}

const clearMainImage = () => {
  formData.main_image = ''
}

const addImage = () => {
  if (formData.images!.length < 9) {
    formData.images!.push(`https://picsum.photos/800/800?random=${Date.now()}`)
  }
}

const removeImage = (index: number) => {
  formData.images!.splice(index, 1)
}

const moveImageUp = (index: number) => {
  if (index > 0 && formData.images) {
    const temp = formData.images[index]
    formData.images[index] = formData.images[index - 1]
    formData.images[index - 1] = temp
  }
}

const moveImageDown = (index: number) => {
  if (formData.images && index < formData.images.length - 1) {
    const temp = formData.images[index]
    formData.images[index] = formData.images[index + 1]
    formData.images[index + 1] = temp
  }
}

const previewImage = (index: number) => {
  if (formData.images && formData.images[index]) {
    previewImageUrl.value = formData.images[index]
    imagePreviewVisible.value = true
  }
}

const batchSetPrice = () => {
  if (batchPrice.value <= 0) {
    ElMessage.warning('请输入有效的价格')
    return
  }
  generatedSkus.value.forEach(sku => {
    sku.price = batchPrice.value
  })
  ElMessage.success('已批量设置价格')
}

const batchSetStock = () => {
  if (batchStock.value < 0) {
    ElMessage.warning('请输入有效的库存')
    return
  }
  generatedSkus.value.forEach(sku => {
    sku.stock = batchStock.value
  })
  ElMessage.success('已批量设置库存')
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const submitData: any = { ...formData }
        
        if (formData.has_sku === 1) {
          submitData.specifications = specifications.value
            .filter(s => s.name && s.values.length > 0)
            .map(s => ({ name: s.name, values: s.values }))
          
          submitData.skus = generatedSkus.value
          
          if (submitData.specifications.length === 0) {
            ElMessage.warning('请添加规格和规格值')
            submitting.value = false
            return
          }
        }
        
        if (isEdit.value && productId.value) {
          await productApi.update(productId.value, submitData)
          ElMessage.success('更新成功')
        } else {
          await productApi.create(submitData)
          ElMessage.success('创建成功')
        }
        
        router.push('/products')
      } catch (error: any) {
        ElMessage.error(error.message || '保存失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const handleBack = () => {
  router.push('/products')
}

onMounted(() => {
  const id = route.params.id
  if (id) {
    isEdit.value = true
    productId.value = parseInt(id as string)
  }
  
  loadCategories()
  loadBrands()
  
  if (productId.value) {
    loadProduct(productId.value)
  }
})
</script>

<style scoped>
.product-edit {
  min-height: 100%;
  padding-bottom: 40px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 18px;
  color: #409eff;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-subtitle {
  margin-bottom: 12px;
}

.spec-alert {
  margin-bottom: 20px;
}

.spec-alert :deep(p) {
  margin: 4px 0;
  color: #606266;
}

.submit-section {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px 0;
}

.main-image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.main-image-wrapper {
  width: 180px;
  height: 180px;
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  transition: all 0.3s;
}

.main-image-wrapper:hover {
  border-color: #409eff;
}

.main-image {
  width: 100%;
  height: 100%;
}

.main-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.placeholder-icon {
  font-size: 48px;
  color: #c0c4cc;
  margin-bottom: 8px;
}

.placeholder-text {
  font-size: 14px;
  color: #909399;
}

.main-image-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 8px;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  gap: 8px;
}

.upload-btn,
.clear-btn {
  border: none;
}

.images-section {
  width: 100%;
}

.images-list-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.image-item-wrapper {
  width: 100px;
  height: 100px;
  border-radius: 6px;
  overflow: hidden;
  position: relative;
  border: 1px solid #e4e7ed;
  transition: all 0.3s;
}

.image-item-wrapper:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.image-sort-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  background: rgba(64, 158, 255, 0.9);
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.product-image {
  width: 100%;
  height: 100%;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.image-item-wrapper:hover .image-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: 6px;
}

.add-image-wrapper {
  width: 100px;
  height: 100px;
  border: 2px dashed #dcdfe6;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.add-image-wrapper:hover {
  border-color: #409eff;
  background: #ecf5ff;
}

.add-image-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.add-icon {
  font-size: 28px;
  color: #909399;
}

.add-text {
  font-size: 13px;
  color: #909399;
}

.add-count {
  font-size: 12px;
  color: #c0c4cc;
}

.specifications-section {
  margin-bottom: 20px;
}

.spec-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e4e7ed;
}

.spec-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.spec-name-input {
  width: 200px;
}

.spec-values-container {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.spec-values-label {
  font-size: 14px;
  color: #606266;
  padding: 6px 0;
  white-space: nowrap;
}

.spec-values-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.spec-value-tag {
  margin: 0 !important;
}

.add-value-form {
  display: flex;
  gap: 8px;
}

.value-input {
  width: 140px;
}

.add-spec-button {
  width: 100%;
  margin-top: 8px;
  padding: 12px;
}

.sku-divider {
  margin: 24px 0;
}

.sku-section {
  width: 100%;
}

.sku-header-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.sku-count {
  font-size: 14px;
  color: #606266;
}

.batch-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.batch-input {
  width: 130px;
}

.sku-table {
  margin-top: 10px;
}

.spec-combination-cell {
  width: 100%;
}

.spec-combination-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.spec-tag {
  margin: 0 !important;
}

.spec-key {
  color: #909399;
}

.spec-value {
  color: #409eff;
  font-weight: 500;
}

.price-input-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}

.currency-symbol {
  color: #f56c6c;
  font-weight: bold;
  margin-right: 4px;
}

.price-input,
.stock-input {
  width: 90px;
}

.empty-sku-section,
.no-sku-section {
  padding: 40px 0;
}

.empty-icon {
  font-size: 60px;
  color: #c0c4cc;
}

.hint {
  color: #909399;
  font-size: 13px;
  margin-top: 8px;
}

:deep(.even-row) {
  background-color: #fafafa;
}

:deep(.odd-row) {
  background-color: #ffffff;
}

.image-loading {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.loading-icon {
  font-size: 32px;
  color: #909399;
  animation: rotating 1.5s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
