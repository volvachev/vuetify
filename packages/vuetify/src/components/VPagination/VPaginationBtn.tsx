// Composables
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeRoundedProps, useRounded } from '@/composables/rounded'
import { makeTagProps } from '@/composables/tag'

// Utilities
import { defineComponent } from 'vue'
import { makeProps } from '@/util'

export default defineComponent({
  name: 'VPaginationBtn',

  props: makeProps({
    active: Boolean,
    ...makeDensityProps(),
    ...makeRoundedProps(),
    ...makeTagProps({ tag: 'button' }),
  }),

  setup (props, { slots }) {
    const { densityClasses } = useDensity(props, 'v-pagination-btn')
    const { roundedClasses } = useRounded(props, 'v-pagination-btn')

    return () => (
      <props.tag
        class={[
          'v-pagination-btn',
          { 'v-pagination-btn--is-active': props.active },
          densityClasses.value,
          roundedClasses.value,
        ]}
        style={[
        ]}
      >
        <div class="v-pagination-btn__overlay" />

        { slots.default?.() }
      </props.tag>
    )
  },
})
