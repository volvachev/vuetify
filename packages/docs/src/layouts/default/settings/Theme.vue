<script>
  // Extensions
  import SettingsGroup from './Group'

  // Utilities
  import { sync } from 'vuex-pathify'

  // Globals
  import { IN_BROWSER } from '@/util/globals'

  export default {
    name: 'DefaultSettingsTheme',

    extends: SettingsGroup,

    data: () => ({ path: 'theme' }),

    computed: {
      ...sync('user', [
        'theme@dark',
        'theme@mixed',
        'theme@system',
      ]),
      items () {
        return [
          {
            text: 'light',
            icon: '$mdiWhiteBalanceSunny',
            cb: () => this.setTheme(),
          },
          {
            text: 'dark',
            icon: '$mdiWeatherNight',
            cb: () => this.setTheme(true),
          },
          {
            text: 'system',
            icon: '$mdiDesktopTowerMonitor',
            cb: () => this.setSystemTheme(),
          },
          {
            text: 'mixed',
            icon: '$mdiThemeLightDark',
            cb: () => this.setTheme(false, true),
          },
        ]
      },
      internalValue: {
        get () {
          if (this.mixed) return 'mixed'
          if (this.system) return 'system'

          return this.dark ? 'dark' : 'light'
        },
        set (val) {
          const set = this.items.find(item => item.text === val)

          set.cb()
          this.startTransition(val)
        },
      },
    },

    watch: {
      '$vuetify.theme.dark' (val) {
        if (this.dark === val) return

        this.dark = val
      },
      dark (val) {
        if (this.$vuetify.theme.dark === val) return

        this.$vuetify.theme.dark = val
      },
    },

    created () {
      const matchMedia = this.getMatchMedia()
      if (!matchMedia) return

      if (this.internalValue === 'system') {
        this.dark = matchMedia.matches
      }

      matchMedia.onchange = ({ matches }) => {
        if (this.system) {
          this.dark = matches
        }
      }
    },

    methods: {
      getMatchMedia () {
        return (IN_BROWSER && window.matchMedia) ? window.matchMedia('(prefers-color-scheme: dark)') : false
      },
      setTheme (
        dark = false,
        mixed = false,
        system = false,
      ) {
        this.dark = dark
        this.mixed = mixed
        this.system = system
      },
      setSystemTheme () {
        const matchMedia = this.getMatchMedia()
        if (!matchMedia) return

        this.setTheme(matchMedia.matches, this.mixed, true)
      },
      startTransition (val) {
        const el = this.$root.$el
        const copy = el.cloneNode(true)
        copy.classList.add('app-copy')

        const rect = el.getBoundingClientRect()
        copy.style.top = rect.top + 'px'
        copy.style.left = rect.left + 'px'
        copy.style.width = rect.width + 'px'
        copy.style.height = rect.height + 'px'

        const targetEl = this.$refs['item-' + val][0].$el
        const targetRect = targetEl.getBoundingClientRect()
        const left = targetRect.left + targetRect.width / 2 + window.scrollX
        const top = targetRect.top + targetRect.height / 2 + window.scrollY
        el.style.setProperty('--clip-pos', `${left}px ${top}px`)

        el.style.removeProperty('--clip-size')
        this.$vuetify.theme.current = this.$vuetify.theme.current === 'light' ? 'dark' : 'light'
        this.$nextTick(() => {
          el.classList.add('app-transition')
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              el.style.setProperty('--clip-size', Math.hypot(window.innerWidth, window.innerHeight) + 'px')
            })
          })
        })

        document.body.append(copy)
        function onTransitionend (e) {
          if (e.target === e.currentTarget) {
            copy.remove()
            el.removeEventListener('transitionend', onTransitionend)
            el.classList.remove('app-transition')
            el.style.removeProperty('--clip-size')
            el.style.removeProperty('--clip-pos')
          }
        }
        el.addEventListener('transitionend', onTransitionend)
      },
    },
  }
</script>

<style lang="sass">
.app-copy
  position: fixed
  z-index: -1
  pointer-events: none

.app-transition
  --clip-size: 0
  --clip-pos: 0 0
  clip-path: circle(var(--clip-size) at var(--clip-pos))
  transition: clip-path 0.35s ease-out
</style>
