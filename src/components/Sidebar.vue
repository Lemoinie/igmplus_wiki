<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { base } from '../lib/base';

const isCollapsed = ref(false);
const isMobileOpen = ref(false);

const navItems = [
  { label: 'Home', href: `${base}/` || '/' },
  { label: 'Classes', href: `${base}/classes` },
  { label: 'Items', href: `${base}/equipment` },
  { label: 'Pets', href: `${base}/pets` },
  { label: 'Traits', href: `${base}/traits` },
  { label: 'Bestiary', href: `${base}/enemies` },
  { label: 'Places', href: `${base}/dungeons` },
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

function openMobile() {
  isMobileOpen.value = true;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'hidden';
  }
}

function closeMobile() {
  isMobileOpen.value = false;
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
}

function toggleMobile() {
  if (isMobileOpen.value) {
    closeMobile();
  } else {
    openMobile();
  }
}

onMounted(() => {
  try {
    if (localStorage.getItem('igm_wiki_sidebar') === '1') {
      isCollapsed.value = true;
      document.documentElement.classList.add('sidebar-collapsed');
    }
  } catch {}

  window.addEventListener('igm:toggle-sidebar', toggleMobile);
  window.addEventListener('igm:open-sidebar', openMobile);
  window.addEventListener('igm:close-sidebar', closeMobile);
});

onUnmounted(() => {
  window.removeEventListener('igm:toggle-sidebar', toggleMobile);
  window.removeEventListener('igm:open-sidebar', openMobile);
  window.removeEventListener('igm:close-sidebar', closeMobile);
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
  }
});
</script>

<template>
  <div>
    <!-- Desktop Reopen Floating Button -->
    <button
      v-if="isCollapsed"
      type="button"
      class="reopenBtn"
      @click="toggleSidebar"
      title="Open Sidebar"
    >
      <img
        :src="`${base}/images/sha.png`"
        alt="Sha"
        class="reopenAvatar sprite"
        width="20"
        height="20"
      />
      <span>Menu</span>
      <span class="reopenArrow">▶</span>
    </button>

    <!-- Sidebar Container (Drawer on mobile, left rail on desktop) -->
    <aside
      class="sidebar"
      :class="{
        collapsed: isCollapsed,
        mobileActive: isMobileOpen,
      }"
    >
      <div class="sidebarHeader">
        <a :href="`${base}/` || '/'" class="brandLink" @click="closeMobile">
          <div class="brandAvatarBox">
            <img
              :src="`${base}/images/sha.png`"
              alt="Sha"
              class="brandAvatar sprite"
              width="36"
              height="36"
            />
          </div>
          <div class="brandText">
            <span class="brandTitle">IGM+ Wiki</span>
            <span class="brandSub">Idle Guild Master Mod</span>
          </div>
        </a>

        <!-- Desktop collapse button -->
        <button
          type="button"
          class="collapseBtn desktopOnly"
          @click="toggleSidebar"
          title="Collapse Sidebar"
        >
          ◀
        </button>

        <!-- Mobile drawer close button -->
        <button
          type="button"
          class="closeDrawerBtn mobileOnly"
          @click="closeMobile"
          title="Close Navigation"
        >
          ✕
        </button>
      </div>

      <nav class="sidebarNav">
        <div class="navSectionTitle">GAME DATABASE</div>
        <ul class="navList">
          <li v-for="item in navItems" :key="item.href">
            <a :href="item.href" class="navLink" @click="closeMobile">
              <span class="navLabel">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <div class="sidebarFooter">
        <div class="wikiVersion">Data-driven Architecture</div>
      </div>
    </aside>

    <!-- Mobile Drawer Backdrop -->
    <transition name="fade">
      <div
        v-if="isMobileOpen"
        class="mobileBackdrop"
        @click="closeMobile"
      ></div>
    </transition>
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
  padding: 1rem 1rem 1rem 1.15rem;
  border-bottom: 1px solid var(--border-subtle);
  gap: 8px;
}

.brandLink {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  min-width: 0;
}

.brandAvatarBox {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
}

.brandAvatar {
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.brandText {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.brandTitle {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
}

.brandSub {
  font-size: 0.72rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.collapseBtn {
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
  font-size: 0.8rem;
  transition: all 0.15s ease;
}

.collapseBtn:hover {
  color: var(--brand-primary);
  border-color: var(--brand-primary);
}

.closeDrawerBtn {
  background: var(--bg-inset);
  border: 1px solid var(--border-subtle);
  color: var(--text-secondary);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}

.closeDrawerBtn:hover {
  color: var(--text-crimson);
  border-color: var(--text-crimson);
}

.desktopOnly {
  display: flex;
}

.mobileOnly {
  display: none;
}

.reopenBtn {
  position: fixed;
  left: 14px;
  top: 14px;
  z-index: 60;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  color: var(--brand-primary);
  border-radius: 20px;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.reopenBtn:hover {
  background: var(--bg-card-hover);
  border-color: var(--brand-primary);
  transform: translateY(-1px);
}

.reopenAvatar {
  image-rendering: pixelated;
}

.reopenArrow {
  font-size: 0.7rem;
  opacity: 0.7;
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

.sidebarFooter {
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--border-subtle);
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* ================= Mobile Styles ================= */
@media (max-width: 959px) {
  .desktopOnly {
    display: none;
  }
  .mobileOnly {
    display: flex;
  }

  .sidebar {
    width: 270px;
    z-index: 100;
    transform: translateX(-100%);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.55);
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
    background: rgba(0, 0, 0, 0.65);
    backdrop-filter: blur(2px);
    z-index: 95;
  }

  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.2s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }
}
</style>
