import { ref } from 'vue';

export const isSidebarOpen = ref(false);

export function openSidebar() {
  isSidebarOpen.value = true;
  if (typeof document !== 'undefined') {
    document.body.classList.add('sidebar-open');
  }
}

export function closeSidebar() {
  isSidebarOpen.value = false;
  if (typeof document !== 'undefined') {
    document.body.classList.remove('sidebar-open');
  }
}

export function toggleSidebar() {
  if (isSidebarOpen.value) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

// Global window event listeners for non-Vue components and keyboard shortcuts
if (typeof window !== 'undefined') {
  window.addEventListener('igm:toggle-sidebar', () => toggleSidebar());
  window.addEventListener('igm:open-sidebar', () => openSidebar());
  window.addEventListener('igm:close-sidebar', () => closeSidebar());

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isSidebarOpen.value) {
      closeSidebar();
    }
  });
}
