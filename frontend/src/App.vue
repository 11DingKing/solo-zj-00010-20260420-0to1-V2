<template>
  <el-container class="app-container">
    <el-header class="header">
      <div class="logo">
        <el-icon :size="32"><Shop /></el-icon>
        <span class="title">电商后台商品管理系统</span>
      </div>
    </el-header>
    <el-container>
      <el-aside width="220px" class="aside">
        <el-menu
          :default-active="activeMenu"
          router
          class="el-menu-vertical-demo"
          background-color="#304156"
          text-color="#bfcbd9"
          active-text-color="#409EFF"
        >
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon>
            <span>商品管理</span>
          </el-menu-item>
          <el-menu-item index="/categories">
            <el-icon><Folder /></el-icon>
            <span>分类管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const activeMenu = computed(() => {
  if (route.path.startsWith('/products')) {
    return '/products'
  }
  return route.path
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
}

.app-container {
  height: 100%;
}

.header {
  background: linear-gradient(90deg, #409EFF 0%, #67C23A 100%);
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.logo {
  display: flex;
  align-items: center;
  color: white;
}

.logo .title {
  font-size: 20px;
  font-weight: bold;
  margin-left: 12px;
}

.aside {
  background-color: #304156;
}

.el-menu-vertical-demo {
  border-right: none;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
