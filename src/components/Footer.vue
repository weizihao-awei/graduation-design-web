<template>
  <footer class="blog-footer">
    <div class="container">
      <div class="footer-content">
        <div class="footer-info">
          <p>&copy; 2024 博客系统. 保留所有权利.</p>
          <p>基于 Vue 3 + Element Plus 构建</p>
        </div>
        <div class="footer-links">
          <a href="#" target="_blank">关于本站</a>
          <a href="#" target="_blank">联系我们</a>
          <a href="#" target="_blank">友情链接</a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
// 底部组件
</script>

<style scoped>
.blog-footer {
  background: #303133;
  color: #c0c4cc;
  padding: 30px 0;
  margin-top: 50px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.footer-info p {
  margin: 5px 0;
  font-size: 14px;
}

.footer-links {
  display: flex;
  gap: 20px;
}

.footer-links a {
  color: #c0c4cc;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-links a:hover {
  color: #409EFF;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
}
</style>