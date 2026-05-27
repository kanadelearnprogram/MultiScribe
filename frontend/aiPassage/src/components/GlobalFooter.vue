<template>
  <a-layout-footer class="footer">
    <div class="footer-content">
      <span class="footer-text">AI Passage &copy; {{ currentYear }} — 智能文章创作平台</span>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
const currentYear = new Date().getFullYear()
</script>

<style scoped>
.footer {
  background: var(--color-background-secondary);
  text-align: center;
  padding: 20px;
  margin-top: 0;
  border-top: 1px solid var(--color-border);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.footer-text {
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
