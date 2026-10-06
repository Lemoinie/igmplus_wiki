import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import { withBase } from 'vitepress'
import ClassTree from './components/ClassTree.vue'
import DefenseCalculator from './components/DefenseCalculator.vue'
import ItemFilter from './components/ItemFilter.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.config.globalProperties.$withBase = withBase
    app.component('ClassTree', ClassTree)
    app.component('DefenseCalculator', DefenseCalculator)
    app.component('ItemFilter', ItemFilter)
  },
} satisfies Theme
