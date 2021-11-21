// Composables
import { useProxiedModel } from '@/composables/proxiedModel'

// Utilities
import { computed, inject, ref } from 'vue'
import { deepEqual, getUid, propsFactory, SUPPORTS_FOCUS_VISIBLE, wrapInArray } from '@/util'

// Types
import { VSelectionControlGroupSymbol } from './../components/VSelectionControlGroup/VSelectionControlGroup'
import type { PropType } from 'vue'

export interface SelectionControlProps {
  disabled?: boolean
  error?: boolean
  id?: string
  inline?: boolean
  label?: string
  offIcon?: string
  onIcon?: string
  multiple?: boolean | null
  trueValue?: null
  falseValue?: null
  modelValue?: any
  name?: string
  type?: string
  value?: any
  valueComparator: typeof deepEqual
}

// Composables
export const makeSelectionControlProps = propsFactory({
  disabled: Boolean,
  error: Boolean,
  id: String,
  inline: Boolean,
  label: String,
  offIcon: String,
  onIcon: String,
  readonly: Boolean,
  multiple: {
    type: Boolean,
    default: null,
  },
  name: String,
  trueValue: {
    type: null,
    default: undefined as any,
  },
  falseValue: {
    type: null,
    default: undefined as any,
  },
  modelValue: {
    type: [Boolean, Array] as PropType<boolean | null | any[]>,
    default: undefined as any,
  },
  type: String,
  value: {
    type: null,
    default: undefined as any,
  },
  valueComparator: {
    type: Function as PropType<typeof deepEqual>,
    default: deepEqual,
  },
}, '')

export function useSelectionControl (props: SelectionControlProps) {
  const group = inject(VSelectionControlGroupSymbol, undefined)
  // TODO: props emits issue
  const modelValue = useProxiedModel(props as any, 'modelValue')
  const trueValue = computed(() => (
    props.trueValue !== undefined ? props.trueValue
    : props.value !== undefined ? props.value
    : true
  ))
  const falseValue = computed(() => props.falseValue !== undefined ? props.falseValue : false)
  const isMultiple = computed(() => (
    group?.multiple.value ||
    props.multiple ||
    Array.isArray(modelValue.value)
  ))
  const isInline = computed(() => group?.inline?.value || props.inline)
  const model = computed({
    get () {
      const val = group ? group.modelValue.value : modelValue.value

      return isMultiple.value
        ? val.some((v: any) => props.valueComparator(v, trueValue.value))
        : props.valueComparator(val, trueValue.value)
    },
    set (val: boolean) {
      const currentValue = val ? trueValue.value : falseValue.value

      let newVal = currentValue

      if (isMultiple.value) {
        newVal = val
          ? [...wrapInArray(modelValue.value), currentValue]
          : wrapInArray(modelValue.value).filter((item: any) => !props.valueComparator(item, trueValue.value))
      }

      if (group?.modelValue) {
        group.modelValue.value = newVal
      } else {
        modelValue.value = newVal
      }
    },
  })
  const icon = computed(() => {
    return model.value
      ? group?.onIcon?.value ?? props.onIcon
      : group?.offIcon?.value ?? props.offIcon
  })

  const uid = getUid()
  const id = computed(() => props.id || `input-${uid}`)
  const isFocused = ref(false)
  const isFocusVisible = ref(false)

  function onFocus (e: FocusEvent) {
    isFocused.value = true
    if (
      !SUPPORTS_FOCUS_VISIBLE ||
      (SUPPORTS_FOCUS_VISIBLE && (e.target as HTMLElement).matches(':focus-visible'))
    ) {
      isFocusVisible.value = true
    }
  }

  function onBlur () {
    isFocused.value = false
    isFocusVisible.value = false
  }

  return {
    icon,
    isFocused,
    isFocusVisible,
    isInline,
    model,
    props: {
      onFocus,
      onBlur,
      id: id.value,
      name: group?.name?.value ?? props.name,
      type: group?.type?.value ?? props.type,
      value: trueValue.value,
    },
  }
}
