// Styles
import './VSelectionControl.sass'

// Components
import { VIcon } from '@/components/VIcon'
import { VLabel } from '@/components/VLabel'

// Composables
import { makeDensityProps, useDensity } from '@/composables/density'
import { makeThemeProps } from '@/composables/theme'
import { makeValidationProps, useValidation } from '@/composables/validation'
import { makeSelectionControlProps, useSelectionControl } from '@/composables/selection-control'
import { useTextColor } from '@/composables/color'

// Directives
import { Ripple } from '@/directives/ripple'

// Utilities
import { computed } from 'vue'
import { genericComponent, useRender } from '@/util'

// Types
import type { ComputedRef, Ref, WritableComputedRef } from 'vue'
import type { MakeSlots } from '@/util'

export type SelectionControlSlot = {
  model: WritableComputedRef<any>
  isReadonly: ComputedRef<boolean>
  isDisabled: ComputedRef<boolean>
  textColorClasses: Ref<string[]>
  props: {
    onBlur: (e: Event) => void
    onFocus: (e: FocusEvent) => void
    id: string
  }
}

export const VSelectionControl = genericComponent<new <T>() => {
  $props: {
    modelValue?: T
    'onUpdate:modelValue'?: (val: T) => any
  }
  $slots: MakeSlots<{
    default: []
    input: [SelectionControlSlot]
  }>
}>()({
  name: 'VSelectionControl',

  directives: { Ripple },

  inheritAttrs: false,

  props: {
    color: String,
    ripple: {
      type: Boolean,
      default: true,
    },

    ...makeThemeProps(),
    ...makeDensityProps(),
    ...makeSelectionControlProps(),
    ...makeValidationProps(),
  },

  emits: {
    'update:modelValue': (val: any) => true,
  },

  setup (props, { attrs, slots }) {
    const {
      group,
      icon,
      isFocused,
      isFocusVisible,
      isInline,
      model,
      props: inputProps,
    } = useSelectionControl(props)
    const { densityClasses } = useDensity(props, 'v-selection-control')

    const { textColorClasses, textColorStyles } = useTextColor(computed(() => {
      return model.value && props.error ? props.color : undefined
    }))

    useRender(() => {
      const label = slots.label
        ? slots.label({
          label: props.label,
          props: { for: inputProps.id },
        })
        : props.label

      return (
        <div
          class={[
            'v-selection-control',
            {
              'v-selection-control--dirty': model.value,
              'v-selection-control--focused': isFocused.value,
              'v-selection-control--focus-visible': isFocusVisible.value,
              'v-selection-control--inline': isInline.value,
            },
            densityClasses.value,
            textColorClasses.value,
          ]}
        >
          <div class="v-selection-control__wrapper">
            { slots.default?.() }

            <div
              class={[
                'v-selection-control__input',
              ]}
              style={ textColorStyles.value }
              v-ripple={ props.ripple && [
                !props.disabled && !props.readonly,
                null,
                ['center', 'circle'],
              ]}
            >
              { icon.value && <VIcon icon={ icon.value } /> }

              <input
                v-model={ model.value }
                disabled={ props.disabled }
                readonly={ props.readonly }
                type={ group?.type?.value ?? props.type }
                { ...attrs }
                { ...inputProps }
              />

              {/* { slots.input?.({
                model,
                isReadonly,
                isDisabled,
                textColorClasses,
                props: {
                  onFocus,
                  onBlur,
                  id: id.value,
                },
              }) } */}
            </div>
          </div>

          <VLabel
            disabled={ props.disabled }
            error={ props.error }
            for={ inputProps.id }
          >
            { label }
          </VLabel>
        </div>
      )
    })

    return {
      isFocused,
    }
  },
})

export type VSelectionControl = InstanceType<typeof VSelectionControl>
