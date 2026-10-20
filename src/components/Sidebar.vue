<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { base } from '../lib/base';
import { isSidebarOpen, closeSidebar } from '../lib/sidebarState';

const props = withDefaults(
  defineProps<{
    currentPath?: string;
  }>(),
  {
    currentPath: '',
  }
);

const activePath = ref(props.currentPath || '');

watch(
  () => props.currentPath,
  (val) => {
    if (val) activePath.value = val;
  }
);

function normalizePath(raw: string): string {
  if (!raw) return '/';
  let p = raw.split('?')[0].split('#')[0];
  if (base && p.startsWith(base)) {
    p = p.slice(base.length);
  }
  p = p.replace(/\/+$/, '');
  return p === '' ? '/' : p;
}

function isItemActive(href: string): boolean {
  const current = normalizePath(activePath.value || (typeof window !== 'undefined' ? window.location.pathname : ''));
  const target = normalizePath(href);

  if (target === '/') {
    return current === '/';
  }

  // Handle mechanics sub-pages
  if (target.startsWith('/mechanics') && current.startsWith('/mechanics')) {
    return true;
  }

  // Handle items alias
  if ((target === '/items' || target === '/equipment') && (current === '/items' || current === '/equipment' || current.startsWith('/items/') || current.startsWith('/equipment/'))) {
    return true;
  }

  // Handle locations / dungeons alias
  if ((target === '/dungeons' || target === '/locations') && (current === '/dungeons' || current === '/locations' || current.startsWith('/dungeons/') || current.startsWith('/locations/'))) {
    return true;
  }

  // Handle effects alias
  if (target.startsWith('/effects') && current.startsWith('/effects')) {
    return true;
  }

  // Handle changelog / whats-new alias
  if ((target === '/changelog' || target === '/whats-new') && (current === '/changelog' || current === '/whats-new' || current.startsWith('/changelog/') || current.startsWith('/whats-new/'))) {
    return true;
  }

  // Handle notices / news alias
  if ((target === '/notices' || target === '/news') && (current === '/notices' || current === '/news' || current.startsWith('/notices/') || current.startsWith('/news/'))) {
    return true;
  }

  return current === target || current.startsWith(target + '/');
}

const navItems = [
  { label: 'Home', href: `${base}/` || '/' },
  { label: 'Classes', href: `${base}/classes` },
  { label: 'Items', href: `${base}/items` },
  { label: 'Pets', href: `${base}/pets` },
  { label: 'Traits', href: `${base}/traits` },
  { label: 'Effects', href: `${base}/effects` },
  { label: 'Bestiary', href: `${base}/enemies` },
  { label: 'Locations', href: `${base}/dungeons` },
  { label: 'Game Mechanics', href: `${base}/mechanics/defense-and-armor` },
  { label: 'Whats New?', href: `${base}/changelog` },
];

onMounted(() => {
  if (typeof window !== 'undefined') {
    activePath.value = window.location.pathname;
    window.addEventListener('popstate', () => {
      activePath.value = window.location.pathname;
    });

    const updateHeaderOffset = () => {
      const header = document.querySelector('.stickyTopGroup') as HTMLElement | null;
      if (header) {
        document.documentElement.style.setProperty('--header-offset', `${header.offsetHeight}px`);
      }
    };
    updateHeaderOffset();
    window.addEventListener('resize', updateHeaderOffset);

    const banner = document.getElementById('maintenanceBanner');
    if (banner) {
      const observer = new MutationObserver(updateHeaderOffset);
      observer.observe(banner, { attributes: true, attributeFilter: ['style'] });
    }
  }
});
</script>

<template>
  <div>
    <!-- Sidebar Drawer Overlay (slides from left underneath navbar on top of the page) -->
    <aside
      class="sidebar"
      :class="{ open: isSidebarOpen }"
      aria-label="Wiki navigation drawer"
    >

      <nav class="sidebarNav">
        <div class="navSectionTitle">GAME DATABASE</div>
        <ul class="navList">
          <li v-for="item in navItems" :key="item.href">
            <a
              :href="item.href"
              class="navLink"
              :class="{ active: isItemActive(item.href) }"
              :aria-current="isItemActive(item.href) ? 'page' : undefined"
              @click="closeSidebar"
            >
              <span class="navLabel">{{ item.label }}</span>
              <span v-if="isItemActive(item.href)" class="activeDot"></span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebarFooter">
        <span class="footerNote">Idle Guild Master Plus</span>
      </div>
    </aside>

    <!-- Dimmed Backdrop Overlay -->
    <transition name="fade">
      <div
        v-if="isSidebarOpen"
        class="sidebarBackdrop"
        @click="closeSidebar"
        aria-hidden="true"
      ></div>
    </transition>
  </div>
</template>

<style scoped>
.sidebar {
  width: 280px;
  max-width: 85vw;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
  position: fixed;
  top: var(--header-offset, 61px);
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  z-index: 150;
  transform: translateX(-100%);
  transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 8px 0 32px rgba(0, 0, 0, 0.7);
}

.sidebar.open {
  transform: translateX(0);
}

.sidebarHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-card);
}

.drawerHeading {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drawerIcon {
  font-size: 1rem;
  line-height: 1;
}

.drawerTitle {
  font-size: 0.88rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.closeDrawerBtn {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s ease;
}

.closeDrawerBtn:hover {
  color: #ffffff;
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.sidebarNav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sidebarNav::-webkit-scrollbar {
  width: 5px;
}

.sidebarNav::-webkit-scrollbar-thumb {
  background: var(--border-subtle);
  border-radius: 4px;
}

.navSectionTitle {
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  padding: 0.4rem 0.75rem;
  margin-top: 0.2rem;
  margin-bottom: 0.2rem;
}

.navList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.navLink {
  display: flex;
  align-items: center;
  padding: 0.55rem 0.75rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 500;
  transition: all 0.15s ease;
  position: relative;
}

.navLink:hover {
  background-color: var(--bg-card);
  color: var(--text-primary);
}

.navLink.active {
  background: linear-gradient(90deg, rgba(110, 168, 254, 0.22) 0%, rgba(110, 168, 254, 0.08) 100%);
  color: #93c5fd;
  font-weight: 700;
  border-left: 4px solid var(--brand-primary);
  padding-left: calc(0.75rem - 4px);
  box-shadow: inset 1px 0 8px rgba(110, 168, 254, 0.15);
}

.navLink.active .navLabel {
  color: #93c5fd;
  font-weight: 700;
}

.navLink.active:hover {
  background: linear-gradient(90deg, rgba(110, 168, 254, 0.28) 0%, rgba(110, 168, 254, 0.12) 100%);
  color: #bfdbfe;
}

.activeDot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--brand-primary);
  margin-left: auto;
  flex-shrink: 0;
  box-shadow: 0 0 8px rgba(110, 168, 254, 0.85);
}

.sidebarFooter {
  padding: 0.75rem 1rem;
  border-top: 1px solid var(--border-subtle);
  background: var(--bg-card);
  font-size: 0.72rem;
  color: var(--text-muted);
  text-align: center;
}

/* Dimmed backdrop covering content below header */
.sidebarBackdrop {
  position: fixed;
  top: var(--header-offset, 61px);
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 140;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
