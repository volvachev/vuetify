// Styles
import './VNavigationItem.sass'

// Composables
import { makeTagProps } from '@/composables/tag'
import { makeRouterProps, useLink } from '@/composables/router'

// Utility
import { genericComponent, useRender } from '@/util'
import { computed, ref } from 'vue'

// Types
import type { MakeSlots } from '@/util'
import { genOverlays } from '@/composables/variant'

export const VNavigationItem = genericComponent<new <T>() => {
  $slots: MakeSlots<{
    default: []
  }>
}>()({
  name: 'VNavigationItem',

  props: {
    disabled: Boolean,
    icon: [Boolean, String],
    stacked: Boolean,
    text: String,

    ...makeRouterProps(),
    ...makeTagProps({ tag: 'button' }),
  },

  setup (props, { attrs, slots }) {
    const link = useLink(props, attrs)
    const isHovering = ref(false)

    useRender(() => {
      const Tag = (link.isLink.value) ? 'a' : props.tag

      return (
        <Tag
          class={[
            'v-navigation-item',
            {
              'v-navigation-item--active': false,
              'v-navigation-item--hover': isHovering.value,
            },
          ]}
          disabled={ props.disabled || undefined }
          href={ link.href.value }
          onClick={ props.disabled || link.navigate }
          onMouseenter={ () => (isHovering.value = true) }
          onMouseleave={ () => (isHovering.value = false) }
        >
          { genOverlays(true, 'v-navigation-item') }

          { slots.default?.() }
        </Tag>
      )
    })

    return {}
  },
})

export type VNavigationItem = InstanceType<typeof VNavigationItem>
