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

  // Handle doctrines alias
  if (target.startsWith('/doctrines') && current.startsWith('/doctrines')) {
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

interface NavIconDef {
  paths?: string[];
  circles?: Array<{ cx: number; cy: number; r: number }>;
}

const navIcons: Record<string, NavIconDef> = {
  home: {
    paths: [
      'M3 10.5L12 3l9 7.5',
      'M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5',
      'M9.5 21V14h5v7',
    ],
  },
  classes: {
    paths: [
      'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
      'M12 8v8',
      'M9 11h6',
    ],
  },
  items: {
    paths: [
      'M14.5 17.5L3 6V3h3l11.5 11.5',
      'M13 19l6-6',
      'M16 16l4 4',
      'M19 21l2-2',
    ],
  },
  pets: {
    paths: [
      'M12 11.5c-2.8 0-5 2.3-5 4.8 0 1.8 1.3 3.2 3 3.2.8 0 1.4-.3 2-.3s1.2.3 2 .3c1.7 0 3-1.4 3-3.2 0-2.5-2.2-4.8-5-4.8z',
    ],
    circles: [
      { cx: 5.5, cy: 11, r: 1.5 },
      { cx: 9.2, cy: 6.5, r: 1.6 },
      { cx: 14.8, cy: 6.5, r: 1.6 },
      { cx: 18.5, cy: 11, r: 1.5 },
    ],
  },
  bestiary: {
    paths: [
      'M12 3a7.5 7.5 0 0 0-7.5 7.5c0 2.4 1.1 4.5 2.5 5.7V19a1.5 1.5 0 0 0 1.5 1.5h7A1.5 1.5 0 0 0 17 19v-2.8c1.4-1.2 2.5-3.3 2.5-5.7A7.5 7.5 0 0 0 12 3z',
      'M10 17.5v3',
      'M14 17.5v3',
    ],
    circles: [
      { cx: 9, cy: 11.5, r: 1.2 },
      { cx: 15, cy: 11.5, r: 1.2 },
    ],
  },
  locations: {
    paths: [
      'M3 6l6-3 6 3 6-3v15l-6 3-6-3-6 3z',
      'M9 3v15',
      'M15 6v15',
    ],
  },
  traits: {
    paths: [
      'M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z',
      'M19 3v4',
      'M17 5h4',
      'M5 17v4',
      'M3 19h4',
    ],
  },
  doctrines: {
    paths: [
      'M2 4h7a4 4 0 0 1 3 1.4A4 4 0 0 1 15 4h7v14h-7a3 3 0 0 0-3 3 3 3 0 0 0-3-3H2z',
      'M12 5.4V21',
    ],
  },
  effects: {
    paths: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
  },
  simulator: {
    paths: [
      'M4 6h4',
      'M12 6h8',
      'M4 12h10',
      'M18 12h2',
      'M4 18h6',
      'M14 18h6',
    ],
    circles: [
      { cx: 10, cy: 6, r: 2 },
      { cx: 16, cy: 12, r: 2 },
      { cx: 12, cy: 18, r: 2 },
    ],
  },
  mechanics: {
    paths: [
      'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z',
    ],
  },
  news: {
    paths: [
      'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9',
      'M13.73 21a2 2 0 0 1-3.46 0',
    ],
  },
};

const homeItem = { label: 'Home', href: `${base}/` || '/', icon: 'home' };

const navSections = [
  {
    title: 'GAME DATABASE',
    items: [
      { label: 'Classes', href: `${base}/classes`, icon: 'classes' },
      { label: 'Items', href: `${base}/items`, icon: 'items' },
      { label: 'Pets', href: `${base}/pets`, icon: 'pets' },
      { label: 'Bestiary', href: `${base}/enemies`, icon: 'bestiary' },
      { label: 'Locations', href: `${base}/dungeons`, icon: 'locations' },
    ],
  },
  {
    title: 'COMBAT',
    items: [
      { label: 'Traits', href: `${base}/traits`, icon: 'traits' },
      { label: 'Doctrines', href: `${base}/doctrines`, icon: 'doctrines' },
      { label: 'Effects', href: `${base}/effects`, icon: 'effects' },
    ],
  },
  {
    title: 'OTHER',
    items: [
      { label: 'Simulator', href: `${base}/simulator`, icon: 'simulator' },
      { label: "Game's Mechanics", href: `${base}/mechanics/defense-and-armor`, icon: 'mechanics' },
      { label: 'Whats News?', href: `${base}/changelog`, icon: 'news' },
    ],
  },
];

const navGroups = [{ title: '', items: [homeItem] }, ...navSections];


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
        <div
          v-for="section in navGroups"
          :key="section.title || 'root'"
          class="navSectionGroup"
          :class="{ hasTitle: Boolean(section.title) }"
        >
          <div v-if="section.title" class="navSectionTitle">{{ section.title }}</div>
          <ul class="navList">
            <li v-for="item in section.items" :key="item.href">
              <a
                :href="item.href"
                class="navLink"
                :class="{ active: isItemActive(item.href) }"
                :aria-current="isItemActive(item.href) ? 'page' : undefined"
                @click="closeSidebar"
              >
                <svg
                  class="navIcon"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  aria-hidden="true"
                >
                  <path
                    v-for="(d, idx) in navIcons[item.icon]?.paths || []"
                    :key="`p-${idx}`"
                    :d="d"
                  />
                  <circle
                    v-for="(c, idx) in navIcons[item.icon]?.circles || []"
                    :key="`c-${idx}`"
                    :cx="c.cx"
                    :cy="c.cy"
                    :r="c.r"
                  />
                </svg>
                <span class="navLabel">{{ item.label }}</span>
                <span v-if="isItemActive(item.href)" class="activeDot"></span>
              </a>
            </li>
          </ul>
        </div>
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

.navSectionGroup {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.navSectionGroup.hasTitle {
  border-top: 1px solid var(--border-subtle);
  margin-top: 0.65rem;
  padding-top: 0.65rem;
}

.navSectionTitle {
  font-size: 0.66rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  opacity: 0.85;
  padding: 0.2rem 0.75rem 0.35rem;
  margin: 0;
  user-select: none;
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
  gap: 10px;
  padding: 0.52rem 0.75rem;
  color: var(--text-primary);
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.88rem;
  font-weight: 500;
  transition: background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  position: relative;
}

.navIcon {
  flex-shrink: 0;
  color: var(--text-secondary);
  opacity: 0.9;
  transition: color 0.15s ease, opacity 0.15s ease;
}

.navLink:hover {
  background-color: var(--bg-card);
  color: #ffffff;
  box-shadow: inset 0 0 0 1px var(--border-subtle);
}

.navLink:hover .navIcon {
  color: var(--brand-primary);
  opacity: 1;
}

.navLink.active .navIcon {
  color: #93c5fd;
  opacity: 1;
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
