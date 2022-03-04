// Styles
import './VSystemBar.sass'

// Composables
import { makeBorderProps, useBorder } from '@/composables/border'
import { makeDimensionProps, useDimension } from '@/composables/dimensions'
import { makeElevationProps, useElevation } from '@/composables/elevation'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeTagProps } from '@/composables/tag'
import { makeThemeProps, provideTheme } from '@/composables/theme'
import { makeLayoutItemProps, useLayoutItem } from '@/composables/layout'

// Utilities
import { defineComponent } from '@/util'
import { computed, ref, toRef } from 'vue'

// Types
import type { PropType } from 'vue'

export const VSystemBar = defineComponent({
  name: 'VSystemBar',

  props: {
    lightsOut: Boolean,
    window: Boolean,
    position: {
      type: String as PropType<'top' | 'bottom'>,
      default: 'top',
      validator: (value: any) => ['top', 'bottom'].includes(value),
    },

    ...makeBorderProps(),
    ...makeDimensionProps({ height: 32 }),
    ...makeElevationProps(),
    ...makeRoundedProps(),
    ...makeTagProps(),
    ...makeThemeProps(),
    ...makeLayoutItemProps(),
  },

  setup (props, { slots }) {
    const vSystemBarRef = ref()
    const height = computed(() => vSystemBarRef.value?.contentHeight)
    const { layoutItemStyles } = useLayoutItem({
      id: props.name,
      priority: computed(() => parseInt(props.priority, 10)),
      position: toRef(props, 'position'),
      layoutSize: height,
      elementSize: height,
      active: ref(true),
      absolute: toRef(props, 'absolute'),
    })
    const { themeClasses } = provideTheme(props)
    const { borderClasses } = useBorder(props)
    const { dimensionStyles } = useDimension(props)
    const { elevationClasses } = useElevation(props)
    const { roundedClasses } = useRounded(props)

    return () => (
      <props.tag
        ref={ vSystemBarRef }
        class={[
          {
            'v-system-bar': true,
            'v-system-bar--lights-out': props.lightsOut,
            'v-system-bar--window': props.window,
          },
          themeClasses.value,
          borderClasses.value,
          elevationClasses.value,
          roundedClasses.value,
        ]}
        style={[
          dimensionStyles.value,
          layoutItemStyles.value,
        ]}
        v-slots={ slots }
      />
    )
  },
})
