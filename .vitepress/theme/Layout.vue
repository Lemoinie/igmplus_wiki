<script setup>
import DefaultTheme from 'vitepress/theme'
import { ref, onMounted } from 'vue'

const { Layout } = DefaultTheme

const isCollapsed = ref(false)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
  if (typeof document !== 'undefined') {
    if (isCollapsed.value) {
      document.documentElement.classList.add('sidebar-collapsed')
    } else {
      document.documentElement.classList.remove('sidebar-collapsed')
    }
    try {
      localStorage.setItem('igmplus_sidebar_collapsed', isCollapsed.value ? '1' : '0')
    } catch (e) {}
  }
}

onMounted(() => {
  try {
    if (localStorage.getItem('igmplus_sidebar_collapsed') === '1') {
      isCollapsed.value = true
      document.documentElement.classList.add('sidebar-collapsed')
    }
  } catch (e) {}
})
</script>

<template>
  <Layout>
    <template #sidebar-nav-before>
      <div class="sidebar-collapse-wrapper">
        <button
          type="button"
          class="sidebar-close-btn"
          @click="toggleSidebar"
          title="Close / Collapse Sidebar"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
          <span>Close Sidebar</span>
        </button>
      </div>
    </template>

    <template #layout-bottom>
      <button
        v-if="isCollapsed"
        type="button"
        class="sidebar-floating-toggle"
        @click="toggleSidebar"
        title="Open Sidebar"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
        </svg>
        <span>Sidebar</span>
      </button>
    </template>
  </Layout>
</template>

<style scoped>
.sidebar-collapse-wrapper {
  padding: 8px 12px 12px 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.sidebar-close-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-alt);
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.sidebar-close-btn:hover {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.sidebar-floating-toggle {
  position: fixed;
  left: 12px;
  top: 76px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px 6px 8px;
  border-radius: 20px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-elv);
  color: var(--vp-c-brand-1);
  font-size: 13px;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  animation: fadeIn 0.2s ease-in-out;
}

.sidebar-floating-toggle:hover {
  background: var(--vp-c-brand-soft);
  transform: translateX(2px) scale(1.02);
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateX(-8px); }
  to { opacity: 1; transform: translateX(0); }
}
</style>
