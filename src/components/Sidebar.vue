<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { base } from '../lib/base';

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

const navItems = [
  { label: 'Home', href: `${base}/` || '/' },
  { label: 'Classes', href: `${base}/classes` },
  { label: 'Equipment', href: `${base}/equipment` },
  { label: 'Pets & Summons', href: `${base}/pets` },
  { label: 'Traits', href: `${base}/traits` },
  { label: 'Enemies & Bestiary', href: `${base}/enemies` },
  { label: 'Dungeons & Raids', href: `${base}/dungeons` },
  { label: 'Game Mechanics', href: `${base}/mechanics/defense-and-armor` },
  { label: 'Mod Changelog', href: `${base}/changelog` },
];

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value;
  if (typeof document !== 'undefined') {
    if (isCollapsed.value) {
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
    }
    try {
      localStorage.setItem('igm_wiki_sidebar', isCollapsed.value ? '1' : '0');
    } catch {}
  }
}

function toggleMobile() {
  isMobileOpen.value = !isMobileOpen.value;
}

onMounted(() => {
  try {
    if (localStorage.getItem('igm_wiki_sidebar') === '1') {
      isCollapsed.value = true;
      document.documentElement.classList.add('sidebar-collapsed');
    }
  } catch {}
});
</script>

<template>
  <div>
    <!-- Mobile Hamburger Bar -->
    <div class="mobileHeader">
      <button type="button" class="mobileMenuBtn" @click="toggleMobile">
        ☰
      </button>
      <a :href="`${base}/` || '/'" class="mobileTitle">IGM+ Mod Wiki</a>
    </div>

    <!-- Desktop Reopen Floating Button -->
    <button
      v-if="isCollapsed"
      type="button"
      class="reopenBtn"
      @click="toggleSidebar"
      title="Open Sidebar"
    >
      <span>▶</span>
      <span>Menu</span>
    </button>

    <!-- Sidebar Container -->
    <aside
      class="sidebar"
      :class="{
        collapsed: isCollapsed,
        mobileActive: isMobileOpen,
      }"
    >
      <div class="sidebarHeader">
        <a :href="`${base}/` || '/'" class="brandLink">
          <div class="brandText">
            <span class="brandTitle">IGM+ Wiki</span>
            <span class="brandSub">Idle Guild Master Mod</span>
          </div>
        </a>
        <button
          type="button"
          class="collapseBtn"
          @click="toggleSidebar"
          title="Collapse Sidebar"
        >
          ◀
        </button>
      </div>

      <nav class="sidebarNav">
        <div class="navSectionTitle">GAME DATABASE</div>
        <ul class="navList">
          <li v-for="item in navItems" :key="item.href">
            <a :href="item.href" class="navLink" @click="isMobileOpen = false">
              <span class="navLabel">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebarFooter">
        <div class="wikiVersion">Data-driven Architecture</div>
      </div>
    </aside>

    <!-- Mobile Backdrop -->
    <div
      v-if="isMobileOpen"
      class="mobileBackdrop"
      @click="isMobileOpen = false"
    ></div>
  </div>
</template>

<style scoped>
.sidebar {
  width: 250px;
  background-color: var(--bg-sidebar);
  border-right: 1px solid var(--border-subtle);
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  z-index: 50;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar.collapsed {
  transform: translateX(-100%);
}

.sidebarHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1rem 1rem 1.25rem;
  border-bottom: 1px solid var(--border-subtle);
}

.brandLink {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
}

.brandIcon {
  font-size: 1.5rem;
}

.brandText {
  display: flex;
  flex-direction: column;
}

.brandTitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.brandSub {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.collapseBtn {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  border-radius: 6px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.15s ease;
}

.collapseBtn:hover {
  color: var(--brand-primary);
  border-color: var(--brand-primary);
}

.reopenBtn {
  position: fixed;
  left: 14px;
  top: 14px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  color: var(--brand-primary);
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.reopenBtn:hover {
  background: var(--bg-card-hover);
  border-color: var(--brand-primary);
  transform: translateX(2px);
}

.sidebarNav {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.75rem;
}

.navSectionTitle {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--text-muted);
  letter-spacing: 0.05em;
  padding: 0 0.5rem 0.5rem 0.5rem;
}

.navList {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.navLink {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  border-radius: 6px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s ease;
}

.navLink:hover {
  background-color: var(--bg-card);
  color: var(--text-primary);
  text-decoration: none;
}

.navIcon {
  font-size: 1.1rem;
}

.sidebarFooter {
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--border-subtle);
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* ================= Mobile Styles ================= */
.mobileHeader {
  display: none;
}

@media (max-width: 959px) {
  .mobileHeader {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: var(--bg-sidebar);
    border-bottom: 1px solid var(--border-subtle);
    position: sticky;
    top: 0;
    z-index: 40;
  }
  .mobileMenuBtn {
    background: transparent;
    border: none;
    color: var(--text-primary);
    font-size: 1.5rem;
    cursor: pointer;
  }
  .mobileTitle {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--text-primary);
    text-decoration: none;
  }
  .sidebar {
    transform: translateX(-100%);
  }
  .sidebar.mobileActive {
    transform: translateX(0);
  }
  .reopenBtn {
    display: none;
  }
  .mobileBackdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    z-index: 45;
  }
}
</style>
