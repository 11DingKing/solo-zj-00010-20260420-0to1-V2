<template>
  <div class="category-manage">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>分类管理</span>
          <el-button type="primary" @click="handleAdd(0)">
            <el-icon><Plus /></el-icon>
            添加一级分类
          </el-button>
        </div>
      </template>
      
      <el-table
        :data="categoryTree"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="name" label="分类名称" min-width="200">
          <template #default="{ row }">
            <span :style="{ paddingLeft: (row.level - 1) * 20 + 'px' }">
              <el-icon v-if="row.children && row.children.length > 0"><Folder /></el-icon>
              <el-icon v-else><Document /></el-icon>
              {{ row.name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="level" label="级别" width="100">
          <template #default="{ row }">
            <el-tag :type="levelTagType(row.level)">
              {{ levelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="100" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              @click="handleAdd(row.id, row.level)"
              :disabled="row.level >= 3"
            >
              添加子分类
            </el-button>
            <el-button type="primary" link @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              type="danger" 
              link 
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="formData.sort" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { categoryApi } from '@/api'
import type { Category } from '@/types'

const categoryTree = ref<Category[]>([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const isEdit = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  id: 0,
  name: '',
  parent_id: 0,
  sort: 0,
})

const formRules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { max: 100, message: '分类名称不能超过100个字符', trigger: 'blur' },
  ],
}

const loadCategories = async () => {
  try {
    const res = await categoryApi.getTree()
    categoryTree.value = res.data
  } catch (error: any) {
    ElMessage.error(error.message || '加载分类列表失败')
  }
}

const levelText = (level: number) => {
  const map: Record<number, string> = {
    1: '一级分类',
    2: '二级分类',
    3: '三级分类',
  }
  return map[level] || '未知'
}

const levelTagType = (level: number) => {
  const map: Record<number, string> = {
    1: 'success',
    2: 'warning',
    3: 'danger',
  }
  return map[level] || ''
}

const handleAdd = (parentId: number, parentLevel: number = 0) => {
  isEdit.value = false
  dialogTitle.value = '添加分类'
  formData.id = 0
  formData.name = ''
  formData.parent_id = parentId
  formData.sort = 0
  dialogVisible.value = true
}

const handleEdit = (row: Category) => {
  isEdit.value = true
  dialogTitle.value = '编辑分类'
  formData.id = row.id
  formData.name = row.name
  formData.parent_id = row.parent_id
  formData.sort = row.sort
  dialogVisible.value = true
}

const handleDelete = async (row: Category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )
    
    await categoryApi.delete(row.id)
    ElMessage.success('删除成功')
    loadCategories()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

const resetForm = () => {
  formRef.value?.resetFields()
}

const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      try {
        if (isEdit.value) {
          await categoryApi.update(formData.id, formData)
          ElMessage.success('更新成功')
        } else {
          await categoryApi.create(formData)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadCategories()
      } catch (error: any) {
        ElMessage.error(error.message || '操作失败')
      }
    }
  })
}

onMounted(() => {
  loadCategories()
})
</script>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-manage {
  height: 100%;
}
</style>
