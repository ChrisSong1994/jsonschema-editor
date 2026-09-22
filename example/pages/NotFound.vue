<template>
  <div class="not-found">
    <div class="not-found__content">
      <h1>404</h1>
      <p>页面不存在</p>
      <RouterLink to="/">返回首页</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.not-found {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: var(--el-bg-color-page);
}

.not-found__content {
  text-align: center;
  color: var(--el-text-color-primary);
}

.not-found__content h1 {
  margin: 0 0 8px;
  font-size: 56px;
  font-weight: 700;
  color: var(--el-color-primary);
}

.not-found__content p {
  margin: 0 0 16px;
  color: var(--el-text-color-secondary);
}

.not-found__content a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.not-found__content a:hover {
  text-decoration: underline;
}
</style>
