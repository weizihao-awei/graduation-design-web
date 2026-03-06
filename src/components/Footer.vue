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
  background: linear-gradient(135deg, var(--text-primary) 0%, #1a1a1a 100%);
  color: var(--text-placeholder);
  padding: var(--spacing-xl) 0;
  margin-top: var(--spacing-xl);
  position: relative;
  overflow: hidden;
}

.blog-footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--primary-light));
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--spacing-lg);
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.footer-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.footer-info p {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: var(--transition-fast);
}

.footer-links {
  display: flex;
  gap: var(--spacing-lg);
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: var(--transition-fast);
  position: relative;
  padding-bottom: 2px;
}

.footer-links a::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 2px;
  background: var(--primary-color);
  transition: var(--transition-fast);
}

.footer-links a:hover {
  color: var(--primary-color);
}

.footer-links a:hover::after {
  width: 100%;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .footer-links {
    gap: var(--spacing-md);
  }
}
</style>