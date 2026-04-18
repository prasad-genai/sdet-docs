<script setup>
defineProps({
  title: String,
  description: String,
  enLink: String,
  mrLink: String
})
</script>

<template>
  <div class="project-card">
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>

    <div class="actions">
      <a :href="mrLink" class="btn mr">Read</a>
    </div>
  </div>
</template>

<style scoped>
.project-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 20px;
  transition: 0.3s;
  background: var(--vp-c-bg-soft);
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.08);
}

.project-card h3 {
  margin-bottom: 8px;
}

.project-card p {
  color: var(--vp-c-text-2);
}

.actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
}

.btn {
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 14px;
  text-decoration: none;
  font-weight: 500;
}

/* English button */
.btn.mr {
  background: #10b981;
  color: white;
}

/* Marathi button */
.btn.en {
  border: 1px solid #10b981;
  color: #10b981;
}
</style>