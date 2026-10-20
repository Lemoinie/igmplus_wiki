<script setup lang="ts">
import { isSidebarOpen, toggleSidebar } from '../lib/sidebarState';
</script>

<template>
  <button
    type="button"
    class="sidebarToggleBtn"
    :class="{ 'is-active': isSidebarOpen }"
    @click="toggleSidebar"
    :title="isSidebarOpen ? 'Close Navigation' : 'Open Navigation'"
    :aria-label="isSidebarOpen ? 'Close Navigation' : 'Open Navigation'"
    :aria-expanded="isSidebarOpen"
  >
    <span class="hamburgerLine line1"></span>
    <span class="hamburgerLine line2"></span>
    <span class="hamburgerLine line3"></span>
  </button>
</template>

<style scoped>
.sidebarToggleBtn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 38px;
  height: 38px;
  background: var(--bg-card);
  border: 1px solid var(--border-card);
  border-radius: 8px;
  cursor: pointer;
  padding: 0;
  gap: 5px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.sidebarToggleBtn:hover {
  background: var(--bg-card-hover);
  border-color: var(--brand-primary);
  box-shadow: 0 0 10px rgba(110, 168, 254, 0.25);
}

.hamburgerLine {
  display: block;
  width: 18px;
  height: 2px;
  background-color: var(--text-primary);
  border-radius: 2px;
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease, background-color 0.2s ease;
  transform-origin: center;
}

.sidebarToggleBtn:hover .hamburgerLine {
  background-color: #ffffff;
}

/* Transformation to X when active */
.sidebarToggleBtn.is-active {
  border-color: rgba(248, 113, 113, 0.5);
  background: rgba(239, 68, 68, 0.12);
}

.sidebarToggleBtn.is-active:hover {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.22);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.35);
}

.sidebarToggleBtn.is-active .hamburgerLine {
  background-color: #fca5a5;
}

.sidebarToggleBtn.is-active .line1 {
  transform: translateY(7px) rotate(45deg);
}

.sidebarToggleBtn.is-active .line2 {
  opacity: 0;
  transform: scaleX(0);
}

.sidebarToggleBtn.is-active .line3 {
  transform: translateY(-7px) rotate(-45deg);
}
</style>
